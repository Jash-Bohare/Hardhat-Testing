const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Faucet Contract", function () {
    let Faucet;
    let faucet;
    let owner;
    let user;

    const ONE_ETH = ethers.utils.parseEther("1");
    const POINT_ONE = ethers.utils.parseEther("0.1");
    const POINT_TWO = ethers.utils.parseEther("0.2");

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        Faucet = await ethers.getContractFactory("Faucet");
        faucet = await Faucet.deploy({ value: ONE_ETH });
    });

    describe("Deployment", function () {
        it("Should set owner correctly", async function () {
            expect(await faucet.owner()).to.equal(owner.address);
        });

        it("Should receive ETH on deployment", async function () {
            const balance = await ethers.provider.getBalance(faucet.address);
            
            expect(balance).to.equal(ONE_ETH);
        });
    });

    describe("Withdraw", function () {
        it("Allows user to withdraw upto 0.1 ETH", async function () {
            await expect(faucet.connect(user).withdraw(POINT_ONE)).to.changeEtherBalances([user, faucet], [POINT_ONE, POINT_ONE.mul(-1)]);
        });

        it("Should revert if trying to withdraw more than 0.1 ETH", async function () {
            await expect(faucet.connect(user).withdraw(POINT_TWO)).to.be.reverted;
        });
    });

    describe("Withdraw All", function () {
        it("Owner should receive all ETH and contract balance becomes zero", async function () {
            expect(await faucet.connect(owner).withdrawAll()).to.changeEtherBalances([owner, faucet], [ONE_ETH, ONE_ETH.mul(-1)]);
        });

        it("Should revert when called by non-owner", async function () {
            await expect(faucet.connect(user).withdrawAll()).to.be.reverted;
        });
    });

    describe("Destroy Faucet", function () {
        it("Should revert when called by non-owner", async function () {
            await expect(faucet.connect(user).destroyFaucet()).to.be.reverted;
        });

        it("Allows owner to destroy the contract and receive funds", async function () {
            await expect(faucet.connect(owner).destroyFaucet()).to.changeEtherBalances([owner, faucet], [ONE_ETH, ONE_ETH.mul(-1)]);
            expect(await ethers.provider.getBalance(faucet.address)).to.equal(0);
        });
    });
})