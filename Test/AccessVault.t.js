const { expect } = require("chai");

describe("AccessVault Contract", function () {
    let AccessVault;
    let accessVault;
    let owner;
    let user1;
    let user2;

    const SECRET = 1;
    const NEW_SECRET = 2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        AccessVault = await ethers.getContractFactory("AccessVault");
        accessVault = await AccessVault.deploy(SECRET);
    });

    describe("Ownership", function () {
        it("Should set owner as deployer", async function () {
            expect(await accessVault.owner()).to.equal(owner.address);
        });

        it("Should revert when non-owner try to addAuthorized, removeAuthorized and updateSecret", async function () {
            await expect(accessVault.connect(user1).addAuthorized(user1.address)).to.be.revertedWithCustomError(accessVault, "NotOwner");
            await expect(accessVault.connect(user1).removeAuthorized(user1.address)).to.be.revertedWithCustomError(accessVault, "NotOwner");
            await expect(accessVault.connect(user1).updateSecret(2)).to.be.revertedWithCustomError(accessVault, "NotOwner");
        });

        it("Owner can update SECRET", async function () {
            await accessVault.connect(owner).updateSecret(NEW_SECRET)
            await accessVault.connect(owner).addAuthorized(owner.address);
            
            expect(await accessVault.connect(owner).readSecret()).to.equal(NEW_SECRET);
        });
    });

    describe("Authorization", function () {
        it("Authorized user should read the secret", async function () {
            await accessVault.connect(owner).addAuthorized(user1.address);

            expect(await accessVault.isAuthorized(user1.address)).to.equal(true);
            expect(await accessVault.connect(user1).readSecret()).to.equal(SECRET);
        });

        it("Unuthorized user should not read the secret", async function () {
            await expect(accessVault.connect(user1).readSecret()).to.be.revertedWithCustomError(accessVault, "NotAuthorized");
        });

        it("Authorized user cannot update SECRET", async function () {
            await accessVault.connect(owner).addAuthorized(user1.address);

            await expect(accessVault.connect(user1).updateSecret(NEW_SECRET)).to.be.revertedWithCustomError(accessVault, "NotOwner");
        });

        it("Removed user should lose access", async function () {
            await accessVault.connect(owner).addAuthorized(user1.address);
            await accessVault.connect(owner).removeAuthorized(user1.address);

            expect(await accessVault.isAuthorized(user1.address)).to.equal(false);
            await expect(accessVault.connect(user1).readSecret()).to.be.revertedWithCustomError(accessVault, "NotAuthorized");
        });

        it("Should handle multiple users to behave independently", async function () {
            await accessVault.connect(owner).addAuthorized(user1.address);
            await accessVault.connect(owner).addAuthorized(user2.address);

            expect(await accessVault.connect(user1).readSecret()).to.equal(SECRET);
            expect(await accessVault.connect(user2).readSecret()).to.equal(SECRET);
        });
    });
})