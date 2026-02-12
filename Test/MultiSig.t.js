const { expect } = require("chai");

describe("MultiSig contract", function(){
    let MultiSig;
    let multiSig;
    let owner1, owner2, owner3;
    let recipient;

    beforeEach(async function(){
        [owner1, owner2, owner3, recipient] = await ethers.getSigners();
        MultiSig = await ethers.getContractFactory("MultiSig");
        multiSig = await MultiSig.deploy([owner1.address, owner2.address, owner3.address], 2);
    });

    describe("Deployment", function(){
        it("Shuld set the correct owners and required confirmations", async function(){
            expect(await multiSig.owners(0)).to.equal(owner1.address);
            expect(await multiSig.owners(1)).to.equal(owner2.address);
            expect(await multiSig.owners(2)).to.equal(owner3.address);
            expect(await multiSig.required()).to.equal(2);
        });

        it("Should revert when no owners are provided and required confirmations is zero", async function(){
            await ethers.getContractFactory("MultiSig");
            await expect(MultiSig.deploy([], 0)).to.be.revertedWithCustomError(MultiSig, "InvalidOwner");
        });

        it("Should revert when reuired confirmations is greater than the number of owners", async function(){
            await ethers.getContractFactory("MultiSig");
            await expect(MultiSig.deploy([owner1.address, owner2.address, owner3.address], 4)).to.be.revertedWithCustomError(MultiSig, "InvalidRequirement");
        });

        it("Should revert when duplicate owners are provided", async function(){
            await ethers.getContractFactory("MultiSig");
            await expect(MultiSig.deploy([owner1.address, owner1.address, owner2.address], 2)).to.be.revertedWithCustomError(MultiSig, "InvalidOwner");
        });
    });
})