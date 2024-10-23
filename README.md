# BlockTrading

BlockTrading - this is a smart contract on Ethereum, implementing the trading of virtual blocks on a 1000x1000 grid.

## Description

BlockTrading - this is an ERC721 token representing virtual blocks on a 1000x1000 grid. Each block can be created (mint), painted in black or white, put up for sale and bought by other users.

## Main functions

- `mint(uint256 blockId)`: Creating a new block
- `setBlockColor(uint256 blockId, string memory color)`: Setting the color of the block (black or white)
- `getBlockColor(uint256 blockId)`: Getting the current color of the block
- `setBlockPrice(uint256 blockId, uint256 price)`: Setting the price of the block for sale
- `getBlockPrice(uint256 blockId)`: Getting the current price of the block
- `buyBlock(uint256 blockId)`: Buying a block
- `setMintPrice(uint256 newPrice)`: Setting the price of creating a new block (only the contract owner)
- `withdraw()`: Withdrawing funds from the contract (only the contract owner)

## Установка и развертывание

1. Install dependencies:
   ```
   npm install
   ```

2. Create a file `.env` and add the following variables:
   ```
   INFURA_PROJECT_ID=your_infura_project_id
   PRIVATE_KEY=your_private_key
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

## Testing

To run tests, use the command:

## License

This project is licensed under the MIT License.