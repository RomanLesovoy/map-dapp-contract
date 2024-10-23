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
    blockTrading = await BlockTrading.deploy(owner.address);
    await blockTrading.waitForDeployment();
  });

  describe("Minting", function () {
    it("Must let to mint", async function () {
      await blockTrading.connect(addr1).mint(1, { value: ethers.parseEther("0.1") });
      expect(await blockTrading.ownerOf(1)).to.equal(addr1.address);
    });

    it("Must not let to mint with wrong payment", async function () {
      await expect(blockTrading.connect(addr1).mint(1, { value: ethers.parseEther("0.05") }))
        .to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Setting color", function () {
    it("Must let owner to set color", async function () {
      await blockTrading.connect(addr1).mint(1, { value: ethers.parseEther("0.1") });
      await blockTrading.connect(addr1).setBlockColor(1, "black");
      expect(await blockTrading.getBlockColor(1)).to.equal("black");
    });

    it("Must not let not owner to set color", async function () {
      await blockTrading.connect(addr1).mint(1, { value: ethers.parseEther("0.1") });
      await expect(blockTrading.connect(addr2).setBlockColor(1, "white"))
        .to.be.revertedWith("Not the owner of the block");
    });
  });

  describe("Trading", function () {
    beforeEach(async function () {
      await blockTrading.connect(addr1).mint(1, { value: ethers.parseEther("0.1") });
    });

    it("Must let owner to set price", async function () {
      await blockTrading.connect(addr1).setBlockPrice(1, ethers.parseEther("1"));
      expect(await blockTrading.getBlockPrice(1)).to.equal(ethers.parseEther("1"));
    });

    it("Must let buy block", async function () {
      await blockTrading.connect(addr1).setBlockPrice(1, ethers.parseEther("1"));
      await blockTrading.connect(addr2).buyBlock(1, { value: ethers.parseEther("1") });
      expect(await blockTrading.ownerOf(1)).to.equal(addr2.address);
    });

    it("Must not let buy block with wrong payment", async function () {
      await blockTrading.connect(addr1).setBlockPrice(1, ethers.parseEther("1"));
      await expect(blockTrading.connect(addr2).buyBlock(1, { value: ethers.parseEther("0.5") }))
        .to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Administrative functions", function () {
    it("Must let owner to change mint price", async function () {
      await blockTrading.connect(owner).setMintPrice(ethers.parseEther("0.2"));
      expect(await blockTrading.mintPrice()).to.equal(ethers.parseEther("0.2"));
    });

    it("Must not let not owner to change mint price", async function () {
      await expect(blockTrading.connect(addr1).setMintPrice(ethers.parseEther("0.2")))
        .to.be.revertedWithCustomError(blockTrading, "OwnableUnauthorizedAccount")
        .withArgs(addr1.address);
    });

    it("Must let owner to withdraw", async function () {
      await blockTrading.connect(addr1).mint(1, { value: ethers.parseEther("0.1") });
      const initialBalance = await ethers.provider.getBalance(owner.address);
      await blockTrading.connect(owner).withdraw();
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
});
