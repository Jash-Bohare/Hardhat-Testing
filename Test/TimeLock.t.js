const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TimeLock Contract", function () {
    let TimeLock;
    let timeLock;
    let deployer;
    let beneficiary;

    let LOCK_AMOUNT = ethers.utils.parseEther("2");

    beforeEach(async function () {
        [deployer, beneficiary] = await ethers.getSigners();
        TimeLock = await ethers.getContractFactory("TimeLock");
    });

    describe("Deployment", function () {
        it("Should set the beneficiary, unlock time and initial balance correctly", async function () {
            const unlockTime = (await time.latest()) + 100;

            timeLock = await TimeLock.deploy(beneficiary.address, unlockTime, { value: LOCK_AMOUNT });
            expect(await timeLock.beneficiary()).to.equal(beneficiary.address);
            expect(await timeLock.unlockTime()).to.equal(unlockTime);
            expect(await timeLock.balance()).to.equal(LOCK_AMOUNT);
        });
    });

    describe("Before Unlock", function () {
        it("Should revert when called withdraw", async function () {
            const unlockTime = (await time.latest()) + 100;
            timeLock = await TimeLock.deploy(beneficiary.address, unlockTime, { value: LOCK_AMOUNT });
            const now = await time.latest();

            await expect(timeLock.withdraw()).to.be.revertedWithCustomError(timeLock, "TooEarly").withArgs(now + 1, unlockTime);
            expect(await timeLock.balance()).to.equal(LOCK_AMOUNT);
        });
    });

    describe("After Unlock", function () {
        it("should allow withdrawal after unlock time and reset balance", async function () {
            const unlockTime = (await time.latest()) + 100;
            await time.increaseTo(unlockTime);

            await expect(timeLock.withdraw()).to.changeEtherBalance(beneficiary, LOCK_AMOUNT);
            expect(await timeLock.balance()).to.equal(0);
        });
    })
})