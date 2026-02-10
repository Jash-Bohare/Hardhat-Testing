const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DeadManDeadManSwitch Contract", function () {
    let DeadManSwitch;
    let deadManSwitch;
    let owner;
    let recipient;

    const ONE_ETH = ethers.utils.parseEther("1");

    beforeEach(async function () {
        [owner, recipient] = await ethers.getSigners();
        DeadManSwitch = await ethers.getContractFactory("Switch");
        deadManSwitch = await DeadManSwitch.deploy(recipient.address, { value: ONE_ETH });
    });

    describe("Deployment", function () {
        it("Should set the correct recipient, owner and initial lastAction timestamp", async function () {
            const lastAction = await deadManSwitch.lastAction();
            const now = await time.latest();

            expect(await deadManSwitch.recipient()).to.equal(recipient.address);
            expect(await deadManSwitch.owner()).to.equal(owner.address);
            expect(await ethers.provider.getBalance(deadManSwitch.address)).to.equal(ONE_ETH);

            expect(lastAction).to.be.at.most(now); //lastAction should be less than or equal to latest time
            expect(now - lastAction).to.be.lessThan(5);
        });
    });

    describe("Withdraw", function () {
        it("Should revert before 52 weeks", async function () {
            await expect(deadManSwitch.withdraw()).to.be.reverted;
            expect(await ethers.provider.getBalance(deadManSwitch.address)).to.equal(ONE_ETH);
        });

        it("Should allow recipient to withdraw after 52 weeks", async function () {
            await time.increase(52 * 7 * 24 * 60 * 60 + 1); // increase time by 52 weeks + 1 second
            
            await expect(deadManSwitch.withdraw()).to.changeEtherBalance(recipient, ONE_ETH);
            expect(await ethers.provider.getBalance(deadManSwitch.address)).to.equal(0);
        });
    });

    describe("Ping", function () {
        it("Should allow only owner to call ping", async function () {
            await expect(deadManSwitch.connect(recipient).ping()).to.be.revertedWithCustomError(deadManSwitch, "NotOwner");
        });

        it("Should update lastAction timestamp when owner pings", async function () {
            const beforePing = await deadManSwitch.lastAction();
            await time.increase(100);
            await deadManSwitch.connect(owner).ping();
            const afterPing = await deadManSwitch.lastAction();

            expect(afterPing).to.be.greaterThan(beforePing);
        });

        it("Should reset withdrawal timer after ping", async function () {
            await time.increase(50 * 7 * 24 * 60 * 60);
            await deadManSwitch.connect(owner).ping();
            await time.increase(10 * 7 * 24 * 60 * 60);

            await expect(deadManSwitch.withdraw()).to.be.reverted;
        });

        it("Should allow withdraw only if 52 weeks passed since last ping", async function () {
            const ONE_YEAR = 52 * 7 * 24 * 60 * 60;
            await deadManSwitch.connect(owner).ping();
            await time.increase(ONE_YEAR + 1);

            await expect(deadManSwitch.withdraw()).to.changeEtherBalance(recipient, ONE_ETH);
            expect(await ethers.provider.getBalance(deadManSwitch.address)).to.equal(0);
        });

        it("Withdraw does not update lastAction", async function () {
            const before = await deadManSwitch.lastAction();
            await time.increase(52 * 7 * 24 * 60 * 60 + 1);
            await deadManSwitch.withdraw();
            const after = await deadManSwitch.lastAction();

            expect(after).to.equal(before);
        });
    });
})