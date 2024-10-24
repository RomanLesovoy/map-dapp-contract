# BlockTrading

BlockTrading - this is a smart contract on Ethereum, implementing the trading of virtual blocks on a 100x100 grid.

## Description

BlockTrading - this is an ERC721 token representing virtual blocks on a 100x100 grid. Each block can be created (mint), painted in black or white, put up for sale and bought by other users.

## Main functions

- `buyBlock(uint256 blockId)`: Buying a block from the contract
- `buyMultipleBlocks(uint256[] memory blockIds)`: Buying multiple blocks in one transaction
- `setColor(uint256 blockId, uint8 color)`: Setting the color for a block
- `sellBlock(uint256 blockId, uint256 price)`: Putting a block up for sale
- `buyFromUser(uint256 blockId)`: Buying a block from another user
- `getAllBlocksInfo(uint256 startId, uint256 endId)`: Getting information about a range of blocks
- `setMintPrice(uint256 newPrice)`: Setting the price of creating a new block (only for the contract owner)
- `withdraw()`: Withdrawing funds from the contract (only for the contract owner)

## Installation and deployment

1. Install dependencies:
   ```
   npm install
   ```

2. Create a file `.env` and add the following variables:
   ```
   LOCAL_URL=http://127.0.0.1:8545
   INFURA_PROJECT_ID=your_infura_project_id
   INFURA_PRIVATE_KEY=your_infura_private_key
   ```

3. Compile the contract:
   ```
   npx hardhat compile
   ```

result:
   Deploying contracts with the account: {address}
   BlockTrading deploying to: {address}
   BlockTrading deployed to: {address}

4. Deploy the contract to the test network (for example, Sepolia):
   ```
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

## Backend
Link to the backend repository: https://github.com/RomanLesovoy/map-dapp

## Testing

To run tests, use the command:

## License

This project is licensed under the MIT License.