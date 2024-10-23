// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BlockTrading is ERC721, Ownable {
    uint256 public constant GRID_SIZE = 1000;
    uint256 public constant TOTAL_BLOCKS = GRID_SIZE * GRID_SIZE;
    
    mapping(uint256 => bool) private _blockExists;
    mapping(uint256 => string) private _blockColors;
    mapping(uint256 => uint256) private _blockPrices;
    
    uint256 public mintPrice = 0.1 ether;

    constructor(address initialOwner) ERC721("BlockTrading", "BLK") Ownable(initialOwner) {}

    function mint(uint256 blockId) public payable {
        require(blockId < TOTAL_BLOCKS, "Invalid block ID");
        require(!_blockExists[blockId], "Block already minted");
        require(msg.value >= mintPrice, "Insufficient payment");

        _safeMint(msg.sender, blockId);
        _blockExists[blockId] = true;
        _blockColors[blockId] = "white";
    }

    function setBlockColor(uint256 blockId, string memory color) public {
        require(_blockExists[blockId], "Block does not exist");
        require(ownerOf(blockId) == msg.sender, "Not the owner of the block");
        require(
            keccak256(abi.encodePacked(color)) == keccak256(abi.encodePacked("black")) ||
            keccak256(abi.encodePacked(color)) == keccak256(abi.encodePacked("white")),
            "Invalid color"
        );

        _blockColors[blockId] = color;
    }

    function getBlockColor(uint256 blockId) public view returns (string memory) {
        require(_blockExists[blockId], "Block does not exist");
        return _blockColors[blockId];
    }

    function setBlockPrice(uint256 blockId, uint256 price) public {
        require(_blockExists[blockId], "Block does not exist");
        require(ownerOf(blockId) == msg.sender, "Not the owner of the block");
        _blockPrices[blockId] = price;
    }

    function getBlockPrice(uint256 blockId) public view returns (uint256) {
        require(_blockExists[blockId], "Block does not exist");
        return _blockPrices[blockId];
    }

    function buyBlock(uint256 blockId) public payable {
        require(_blockExists[blockId], "Block does not exist");
        require(_blockPrices[blockId] > 0, "Block is not for sale");
        require(msg.value >= _blockPrices[blockId], "Insufficient payment");

        address seller = ownerOf(blockId);
        _transfer(seller, msg.sender, blockId);
        payable(seller).transfer(msg.value);
        _blockPrices[blockId] = 0; // Reset the price after sale
    }

    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
}