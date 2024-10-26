const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const BlockTrading = await hre.ethers.getContractFactory("BlockTrading");
  const blockTrading = await BlockTrading.deploy();
  await blockTrading.waitForDeployment();

  console.log("BlockTrading deployed to:", await blockTrading.getAddress());

  const [owner, buyer] = await hre.ethers.getSigners();

  const blockId = 1;
  const initialPrice = ethers.parseEther("0.0001"); // INITIAL_PRICE из контракта
  const newPrice = ethers.parseEther("0.001");

  try {
    // Проверяем информацию о блоке до покупки
    console.log("Checking block info before purchase...");
    let blockInfo = await blockTrading.getBlockInfo(blockId);
    console.log("Block info:", {
      owner: blockInfo[0],
      color: blockInfo[1],
      price: ethers.formatEther(blockInfo[2])
    });

    // Покупаем блок в первый раз
    console.log("Buying block for the first time...");
    await blockTrading.connect(buyer).buyBlock(blockId, { value: initialPrice });
    console.log(`Block ${blockId} bought`);

    // Проверяем информацию о блоке после первой покупки
    console.log("Checking block info after first purchase...");
    blockInfo = await blockTrading.getBlockInfo(blockId);
    console.log("Block info:", {
      owner: blockInfo[0],
      color: blockInfo[1],
      price: ethers.formatEther(blockInfo[2])
    });

    // Покупатель устанавливает новую цену блока для продажи
    console.log("Setting new block price for sale...");
    await blockTrading.connect(buyer).setBlockPrice(blockId, newPrice);
    console.log(`Block ${blockId} price set to 0.001 ETH`);

    // Проверяем информацию о блоке после установки новой цены
    console.log("Checking block info after setting new price...");
    blockInfo = await blockTrading.getBlockInfo(blockId);
    console.log("Block info:", {
      owner: blockInfo[0],
      color: blockInfo[1],
      price: ethers.formatEther(blockInfo[2])
    });

    // Владелец пытается купить блок (должно быть отклонено)
    console.log("Owner attempting to purchase their own block...");
    try {
      await blockTrading.connect(buyer).buyBlock(blockId, { value: newPrice });
    } catch (error) {
      console.log("Purchase rejected as expected:", error.message);
    }

    // Другой пользователь пытается купить блок
    console.log("Another user attempting to purchase the block...");
    await blockTrading.connect(owner).buyBlock(blockId, { value: newPrice });
    console.log("Block purchased successfully");

    // Проверяем информацию о блоке после второй покупки
    console.log("Checking block info after second purchase...");
    blockInfo = await blockTrading.getBlockInfo(blockId);
    console.log("Block info:", {
      owner: blockInfo[0],
      color: blockInfo[1],
      price: ethers.formatEther(blockInfo[2])
    });

    // Тестируем установку цвета
    console.log("Setting block color...");
    await blockTrading.connect(owner).setColor(blockId, 5);
    console.log("Block color set");

    // Проверяем информацию о блоке после установки цвета
    console.log("Checking block info after setting color...");
    blockInfo = await blockTrading.getBlockInfo(blockId);
    console.log("Block info:", {
      owner: blockInfo[0],
      color: blockInfo[1],
      price: ethers.formatEther(blockInfo[2])
    });

  } catch (error) {
    console.error("Error occurred:", error);
    if (error.reason) console.error("Error reason:", error.reason);
    if (error.code) console.error("Error code:", error.code);
    if (error.transaction) console.error("Error transaction:", error.transaction);
    if (error.data) console.error("Error data:", error.data);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});