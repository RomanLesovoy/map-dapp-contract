// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BlockTrading is Ownable, ERC721 {
    uint256 constant public GRID_SIZE = 100;
    uint256 constant public TOTAL_BLOCKS = GRID_SIZE * GRID_SIZE;
    uint256 constant public INITIAL_PRICE = 0.0001 ether;
    
    struct Block {
        uint8 color;
        uint256 price;
        bool exists;
    }
    
    mapping(uint256 => Block) private blocks;

    event BlockBought(uint256 indexed blockId, address indexed buyer, uint256 price);
    event ColorChanged(uint256 indexed blockId, uint8 newColor);
    event BlockPriceSet(uint256 indexed blockId, uint256 newPrice);

    constructor() ERC721("BlockTrading", "BLK") Ownable(msg.sender) {
        // Блоки не минтятся при создании контракта
    }

    function buyBlock(uint256 blockId) public payable {
        require(blockId < TOTAL_BLOCKS, "Invalid block ID");
        
        uint256 price;
        if (!blocks[blockId].exists) {
            // Если блок еще не создан, создаем его
            require(msg.value >= INITIAL_PRICE, "Insufficient payment for new block");
            _safeMint(msg.sender, blockId);
            blocks[blockId] = Block(0, 0, true);  // Устанавливаем цену в 0 после покупки
            price = INITIAL_PRICE;
        } else {
            price = blocks[blockId].price;
            require(price > 0, "Block not for sale");
            require(msg.value >= price, "Insufficient payment");
            address currentOwner = ownerOf(blockId);
            require(currentOwner != msg.sender, "You already own this block");
            _safeTransfer(currentOwner, msg.sender, blockId, "");
            
            if (currentOwner != address(this)) {
                payable(currentOwner).transfer(price);
            }
            blocks[blockId].price = 0; // Reset price after purchase
        }

        blocks[blockId].exists = true;
        emit BlockBought(blockId, msg.sender, price);

        // Возвращаем излишек оплаты, если есть
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }

    function setColor(uint256 blockId, uint8 color) public {
        require(blocks[blockId].exists, "Block does not exist");
        require(ownerOf(blockId) == msg.sender, "Not the owner of the block");
        blocks[blockId].color = color;
        emit ColorChanged(blockId, color);
    }

    function setBlockPrice(uint256 blockId, uint256 newPrice) public {
        require(blocks[blockId].exists, "Block does not exist");
        require(ownerOf(blockId) == msg.sender, "Not the owner of the block");
        blocks[blockId].price = newPrice;
        emit BlockPriceSet(blockId, newPrice);
    }

    function getBlockInfo(uint256 blockId) public view returns (address owner, uint8 color, uint256 price) {
        require(blockId < TOTAL_BLOCKS, "Invalid block ID");
        if (blocks[blockId].exists) {
            owner = ownerOf(blockId);
            color = blocks[blockId].color;
            price = blocks[blockId].price;
        } else {
            owner = address(this);
            color = 0;
            price = INITIAL_PRICE;
        }
    }

    function getAllBlocksInfo(uint256 startId, uint256 endId) public view returns (address[] memory owners, uint8[] memory colors, uint256[] memory prices) {
        require(startId < TOTAL_BLOCKS && endId < TOTAL_BLOCKS && startId <= endId, "Invalid range");
        
        uint256 length = endId - startId + 1;
        owners = new address[](length);
        colors = new uint8[](length);
        prices = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            uint256 blockId = startId + i;
            (owners[i], colors[i], prices[i]) = getBlockInfo(blockId);
        }
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
}