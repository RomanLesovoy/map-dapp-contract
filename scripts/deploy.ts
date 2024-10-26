import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const BlockTrading = await ethers.getContractFactory("BlockTrading");
  const blockTrading = await BlockTrading.deploy();

  await blockTrading.waitForDeployment();

  const contractAddress = await blockTrading.getAddress();
  console.log("BlockTrading deployed to:", contractAddress);
  console.log("Contract owner:", await blockTrading.owner());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
