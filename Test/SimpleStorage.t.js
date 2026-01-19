const { expect } = require("chai");

describe("Simple Storage Contract", function () {
    let SimpleStorage;
    let simpleStorage;
    const VALUE = 10;

    beforeEach(async function () {
        SimpleStorage = await ethers.getContractFactory("SimpleStorage");
        simpleStorage = await SimpleStorage.deploy();
    });

    describe("Initialization", function(){
        it("Should initialize the value", async function(){
            await simpleStorage.initialize(VALUE);
            expect(await simpleStorage.get()).to.equal(VALUE);
            expect(await simpleStorage.isInitialized()).to.equal(true);
        });

        it("Should revert if initialized twice", async function(){
            await simpleStorage.initialize(VALUE);
            await expect(simpleStorage.initialize(VALUE)).to.be.revertedWith("Already initialized");
        });
    });

    describe("Before Initialization", function(){
        it("Should return the default value", async function(){
            expect(await simpleStorage.get()).to.equal(0);
            expect(await simpleStorage.isInitialized()).to.equal(false);
        });

        it("Should revert if not initialized", async function(){
            await expect(simpleStorage.set(5)).to.be.revertedWith("Not initialized");
        });
    });

    describe("After initialization", function(){
        it("Should update the value", async function(){
            await simpleStorage.initialize(VALUE);
            await simpleStorage.set(5);
            expect (await simpleStorage.get()).to.equal(5);
            expect (await simpleStorage.isInitialized()).to.equal(true);
        });

        it("Should update set on multiple calls", async function(){
            await simpleStorage.initialize(VALUE);
            await simpleStorage.set(5);
            await simpleStorage.set(15);
            expect(await simpleStorage.get()).to.equal(15);
        });
    });
})