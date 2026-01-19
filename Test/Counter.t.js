const { expect } = require("chai");

describe("Counter Contract", function () {
    let Counter;
    let counter;
    const INITIAL_VALUE = 10;

    beforeEach(async function () {
        Counter = await ethers.getContractFactory("Counter");
        counter = await Counter.deploy(INITIAL_VALUE);
    });

    describe("Deployment", function () {
        it("Should initialize the value", async function () {
            expect(await counter.get()).to.equal(INITIAL_VALUE);
        });
    });

    describe("Increment", function () {
        it("Should increment the value by 1", async function () {
            await counter.increment();
            expect(await counter.get()).to.equal(INITIAL_VALUE + 1);
        });

        it("Should allow multiple increments", async function () {
            await counter.increment();
            await counter.increment();
            await counter.increment();
            expect(await counter.get()).to.equal(INITIAL_VALUE + 3);
        });
    });

    describe("Decrement", function () {
        it("Should decrement the value by 1", async function () {
            await counter.decrement();
            expect(await counter.get()).to.equal(INITIAL_VALUE - 1);
        })

        it("Should revert when value is zero", async function () {
            const zeroCounter = await Counter.deploy(0);
            await expect(zeroCounter.decrement()).to.be.revertedWith("Counter: below zero");
        });
    });
});