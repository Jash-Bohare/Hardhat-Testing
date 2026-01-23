const { expect } = require("chai");

describe("EventRegistry Contract", function () {
    let EventRegistry;
    let eventRegistry;
    let user1, user2;

    beforeEach(async function () {
        [user1, user2] = await ethers.getSigners();
        EventRegistry = await ethers.getContractFactory("EventRegistry");
        eventRegistry = await EventRegistry.deploy();
    });

    describe("Register", function () {
        it("Should emit Registered event and update state", async function () {
            await expect(eventRegistry.connect(user1).register()).to.emit(eventRegistry, "Registered").withArgs(user1.address);
            expect(await eventRegistry.isRegistered(user1.address)).to.equal(true);
        });

        it("Should revert on double registration and emit no event", async function () {
            await eventRegistry.connect(user1).register();

            await expect(eventRegistry.connect(user1).register()).to.be.revertedWithCustomError(eventRegistry, "AlreadyRegistered");
            expect(await eventRegistry.isRegistered(user1.address)).to.equal(true);
        });

        it("Should not effect other users", async function () {
            await eventRegistry.connect(user1).register();

            expect(await eventRegistry.isRegistered(user1.address)).to.equal(true);
            expect(await eventRegistry.isRegistered(user2.address)).to.equal(false);
        })
    });

    describe("Unregister", function () {
        it("Should emit unregistered event and update state", async function () {
            await eventRegistry.connect(user1).register();
            
            await expect(eventRegistry.connect(user1).unregister()).to.emit(eventRegistry, "Unregistered").withArgs(user1.address);
            expect(await eventRegistry.isRegistered(user1.address)).to.equal(false);
        });

        it("Should revert if not registered and emit no event", async function () {
            await expect(eventRegistry.connect(user1).unregister()).to.be.revertedWithCustomError(eventRegistry, "NotRegistered");
            expect(await eventRegistry.isRegistered(user1.address)).to.equal(false);
        });
    });
})