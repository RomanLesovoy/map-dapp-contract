import { expect } from "chai";
import { ethers } from "hardhat";
import { BlockTrading } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BlockTrading", function () {
  let blockTrading: BlockTrading;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const BlockTrading = await ethers.getContractFactory("BlockTrading");
    blockTrading = await BlockTrading.deploy();
    await blockTrading.waitForDeployment();
  });

  describe("Buying blocks", function () {
    it("Should allow buying a block", async function () {
      await blockTrading.connect(addr1).buyBlock(0, { value: ethers.parseEther("0.1") });
      const [owned, blockOwner, , ] = await blockTrading.getBlockInfo(0);
      expect(owned).to.be.true;
      expect(blockOwner).to.equal(addr1.address);
    });

    it("Should not allow buying a block with insufficient payment", async function () {
      await expect(blockTrading.connect(addr1).buyBlock(0, { value: ethers.parseEther("0.05") }))
        .to.be.revertedWith("Insufficient payment");
    });

    it("Should allow buying multiple blocks", async function () {
      await blockTrading.connect(addr1).buyMultipleBlocks([0, 1, 2], { value: ethers.parseEther("0.3") });
      for (let i = 0; i < 3; i++) {
        const [owned, blockOwner, , ] = await blockTrading.getBlockInfo(i);
        expect(owned).to.be.true;
        expect(blockOwner).to.equal(addr1.address);
      }
    });
  });

  describe("Setting color", function () {
    beforeEach(async function () {
      await blockTrading.connect(addr1).buyBlock(0, { value: ethers.parseEther("0.1") });
    });

    it("Should allow the owner to set the color of a block", async function () {
      await blockTrading.connect(addr1).setColor(0, 5);
      const [, , color, ] = await blockTrading.getBlockInfo(0);
      expect(color).to.equal(5);
    });

    it("Should not allow non-owner to set the color of a block", async function () {
      await expect(blockTrading.connect(addr2).setColor(0, 5))
        .to.be.revertedWith("Not the owner of the block");
    });
  });

  describe("Selling blocks", function () {
    beforeEach(async function () {
      await blockTrading.connect(addr1).buyBlock(0, { value: ethers.parseEther("0.1") });
    });

    it("Should allow the owner to sell a block", async function () {
      await blockTrading.connect(addr1).sellBlock(0, ethers.parseEther("0.2"));
      const [, , , price] = await blockTrading.getBlockInfo(0);
      expect(price).to.equal(ethers.parseEther("0.2"));
    });

    it("Should allow buying a block from another user", async function () {
      await blockTrading.connect(addr1).sellBlock(0, ethers.parseEther("0.2"));
      await blockTrading.connect(addr2).buyFromUser(0, { value: ethers.parseEther("0.2") });
      const [owned, blockOwner, , ] = await blockTrading.getBlockInfo(0);
      expect(owned).to.be.true;
      expect(blockOwner).to.equal(addr2.address);
    });

    it("Should not allow buying a block with insufficient payment", async function () {
      await blockTrading.connect(addr1).sellBlock(0, ethers.parseEther("0.2"));
      await expect(blockTrading.connect(addr2).buyFromUser(0, { value: ethers.parseEther("0.1") }))
        .to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Getting block information", function () {
    beforeEach(async function () {
      await blockTrading.connect(addr1).buyBlock(0, { value: ethers.parseEther("0.1") });
      await blockTrading.connect(addr1).setColor(0, 5);
      await blockTrading.connect(addr1).sellBlock(0, ethers.parseEther("0.2"));
      await blockTrading.connect(addr2).buyBlock(1, { value: ethers.parseEther("0.1") });
    });

    it("Should return correct block information for a range", async function () {
      const blocksInfo = await blockTrading.getAllBlocksInfo(0, 2);
      
      expect(blocksInfo.length).to.equal(3);
      
      // Проверка первого блока
      expect(blocksInfo[0].owned).to.be.true;
      expect(blocksInfo[0].owner).to.equal(addr1.address);
      expect(blocksInfo[0].color).to.equal(5);
      expect(blocksInfo[0].price).to.equal(ethers.parseEther("0.2"));
      
      // Проверка второго блока
      expect(blocksInfo[1].owned).to.be.true;
      expect(blocksInfo[1].owner).to.equal(addr2.address);
      expect(blocksInfo[1].color).to.equal(1); // Значение по умолчанию
      expect(blocksInfo[1].price).to.equal(0);
      
      // Проверка третьего блока (не купленного)
      expect(blocksInfo[2].owned).to.be.false;
      expect(blocksInfo[2].owner).to.equal(ethers.ZeroAddress);
      expect(blocksInfo[2].color).to.equal(0);
      expect(blocksInfo[2].price).to.equal(0);
    });

    it("Should return an error for an invalid range", async function () {
      await expect(blockTrading.getAllBlocksInfo(10000, 10001)).to.be.revertedWith("Invalid range");
    });
  });

  describe("Administrative functions", function () {
    it("Should allow the owner to change the minting price", async function () {
      await blockTrading.connect(owner).setMintPrice(ethers.parseEther("0.2"));
      expect(await blockTrading.mintPrice()).to.equal(ethers.parseEther("0.2"));
    });

    it("Should not allow non-owner to change the minting price", async function () {
      await expect(blockTrading.connect(addr1).setMintPrice(ethers.parseEther("0.2")))
        .to.be.revertedWithCustomError(blockTrading, "OwnableUnauthorizedAccount");
    });

    it("Should allow the owner to withdraw funds", async function () {
      await blockTrading.connect(addr1).buyBlock(0, { value: ethers.parseEther("0.1") });
      const initialBalance = await ethers.provider.getBalance(owner.address);
      await blockTrading.connect(owner).withdraw();
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
});