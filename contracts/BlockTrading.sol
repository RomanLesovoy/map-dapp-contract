// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract BlockTrading is Ownable {
    uint256 constant public GRID_SIZE = 100;
    uint256 constant public TOTAL_BLOCKS = GRID_SIZE * GRID_SIZE;
    
    // Bit map of block ownership (1 bit per block)
    uint256[] private ownershipMap;
    
    // Block colors (4 bits per block)
    uint256[] private colorMap;
    
    // Block prices (for sale)
    mapping(uint256 => uint256) private blockPrices;
    
    // Block owners (only for sold blocks)
    mapping(uint256 => address) private blockOwners;

    uint256 public mintPrice = 0.1 ether;

    constructor() Ownable(msg.sender) {
        ownershipMap = new uint256[]((TOTAL_BLOCKS + 255) / 256);
        colorMap = new uint256[]((TOTAL_BLOCKS + 63) / 64);
    }

    // Buying a block from the contract
    function buyBlock(uint256 blockId) public payable {
        require(blockId < TOTAL_BLOCKS, "Invalid block ID");
        require(!isOwnedByUser(blockId), "Block already owned");
        require(msg.value >= mintPrice, "Insufficient payment");

        setOwnership(blockId, true);
        blockOwners[blockId] = msg.sender;
        setColor(blockId, 1); // Default color (e.g., white)
    }

    // Putting a block up for sale
    function sellBlock(uint256 blockId, uint256 price) public {
        require(isOwnedByUser(blockId), "Not the owner of the block");
        require(blockOwners[blockId] == msg.sender, "Not the owner of the block");
        blockPrices[blockId] = price;
    }

    // Buying a block from another user
    function buyFromUser(uint256 blockId) public payable {
        require(isOwnedByUser(blockId), "Block not for sale");
        require(blockPrices[blockId] > 0, "Block not for sale");
        require(msg.value >= blockPrices[blockId], "Insufficient payment");

        address seller = blockOwners[blockId];
        blockOwners[blockId] = msg.sender;
        blockPrices[blockId] = 0;
        payable(seller).transfer(msg.value);
    }

    // Setting the color of a block
    function setColor(uint256 blockId, uint8 color) public {
        require(isOwnedByUser(blockId), "Not the owner of the block");
        require(blockOwners[blockId] == msg.sender, "Not the owner of the block");
        uint256 index = blockId / 64;
        uint256 bitIndex = (blockId % 64) * 4;
        colorMap[index] = (colorMap[index] & ~(uint256(15) << bitIndex)) | (uint256(color) << bitIndex);
    }

    // Getting the color of a block
    function getColor(uint256 blockId) public view returns (uint8) {
        uint256 index = blockId / 64;
        uint256 bitIndex = (blockId % 64) * 4;
        return uint8((colorMap[index] >> bitIndex) & 15);
    }

    // Checking if a block is owned by a user
    function isOwnedByUser(uint256 blockId) public view returns (bool) {
        uint256 index = blockId / 256;
        uint256 bitIndex = blockId % 256;
        return (ownershipMap[index] & (1 << bitIndex)) != 0;
    }

    // Setting the ownership of a block
    function setOwnership(uint256 blockId, bool owned) private {
        uint256 index = blockId / 256;
        uint256 bitIndex = blockId % 256;
        if (owned) {
            ownershipMap[index] |= (1 << bitIndex);
        } else {
            ownershipMap[index] &= ~(1 << bitIndex);
        }
    }

    // Getting information about a block
    function getBlockInfo(uint256 blockId) public view returns (bool owned, address owner, uint8 color, uint256 price) {
        owned = isOwnedByUser(blockId);
        owner = blockOwners[blockId];
        color = getColor(blockId);
        price = blockPrices[blockId];
    }

    // Buying multiple blocks in one transaction
    function buyMultipleBlocks(uint256[] memory blockIds) public payable {
        uint256 totalCost = 0;
        for (uint256 i = 0; i < blockIds.length; i++) {
            require(blockIds[i] < TOTAL_BLOCKS, "Invalid block ID");
            require(!isOwnedByUser(blockIds[i]), "Block already owned");
            totalCost += mintPrice;
        }
        require(msg.value >= totalCost, "Insufficient payment");

        for (uint256 i = 0; i < blockIds.length; i++) {
            setOwnership(blockIds[i], true);
            blockOwners[blockIds[i]] = msg.sender;
            setColor(blockIds[i], 1); // Default color
        }
    }

    // Setting the price of creating a new block
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
    }

    // Withdrawing funds from the contract
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }

    // Getting information about a block
    struct BlockInfo {
        bool owned;
        address owner;
        uint8 color;
        uint256 price;
    }

    // Using pagination to avoid memory limit
    function getAllBlocksInfo(uint256 startId, uint256 endId) public view returns (BlockInfo[] memory) {
        require(startId < TOTAL_BLOCKS && endId < TOTAL_BLOCKS && startId <= endId, "Invalid range");
        
        uint256 length = endId - startId + 1;
        BlockInfo[] memory blocksInfo = new BlockInfo[](length);
        
        for (uint256 i = 0; i < length; i++) {
            uint256 blockId = startId + i;
            bool owned = isOwnedByUser(blockId);
            address owner = blockOwners[blockId];
            uint8 color = getColor(blockId);
            uint256 price = blockPrices[blockId];
            
            blocksInfo[i] = BlockInfo(owned, owner, color, price);
        }
        
        return blocksInfo;
    }
}
