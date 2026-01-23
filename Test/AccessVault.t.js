const {expect} = require("chai");

describe("AccessVault Contract", function(){
    let AccessVault;
    let accessVault;
    let owner;
    let user1;
    let user2;
    let SECRET = 1;

    beforeEach(async function(){
        AccessVault = await ethers.getContractFactory("AccessVault");
        [owner, user1, user2] = await ethers.getSigners();
        accessVault = await AccessVault.deploy(SECRET);
    });

    describe("Ownership", function(){
        it("Should set owner as deployer", async function(){
            expect(await accessVault.owner()).to.equal(owner.address);
        });

        it("Should revert when non-owner try to addAuthorized, removeAuthorized and updateSecret", async function(){
            await expect(accessVault.connect(user1).addAuthorized(user1.address)).to.revertedWithCustomError(accessVault, "NotOwner");
            await expect(accessVault.connect(user1).removeAuthorized(user1.address)).to.revertedWithCustomError(accessVault, "NotOwner");
            await expect(accessVault.connect(user1).updateSecret(2)).to.revertedWithCustomError(accessVault, "NotOwner");
        });
    });
})