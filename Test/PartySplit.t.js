const { expect } = require('chai');

describe("PartySplit Contract", function () {
    let PartySplit;
    let partySplit;
    let owner;
    let user1, user2;
    let venue;

    const ONE_ETH = ethers.utils.parseEther("1");
    const ONE_POINT_FIVE_ETH = ethers.utils.parseEther("1.5");
    const TWO_ETH = ethers.utils.parseEther("2");

    beforeEach(async function () {
        [owner, user1, user2, venue] = await ethers.getSigners();
        PartySplit = await ethers.getContractFactory("PartySplit");
        partySplit = await PartySplit.deploy(TWO_ETH);
    })

    describe("Deployment", function () {
        it("Should set the correct deposit amount", async function () {
            expect(await partySplit.deposit()).to.equal(TWO_ETH);
        });
    });

    describe("RSVP", function () {
        it("Should allow user to RSP with correct amount", async function () {
            await expect(partySplit.connect(user1).rsvp({ value: TWO_ETH })).to.not.be.reverted;
            expect(await partySplit.hasRSVPed(user1.address)).to.equal(true);
            expect(await partySplit.members(0)).to.equal(user1.address);
        })
        it("Should revert when a user tries to RSVP with insufficient funds", async function () {
            expect(partySplit.connect(user1).rsvp({ value: ONE_ETH })).to.be.revertedWith("Incorrect deposit amount");
        });

        it("Should revert when a user tries to RSVP more than once", async function () {
            await partySplit.connect(user1).rsvp({ value: TWO_ETH });
            expect(partySplit.connect(user1).rsvp({ value: TWO_ETH })).to.be.revertedWith("Already RSVP'd");
        });

        it("Should set status to true when a user successfully RSVPs", async function () {
            await partySplit.connect(user1).rsvp({ value: TWO_ETH });
            expect(await partySplit.hasRSVPed(user1.address)).to.be.true;
        });

        it("Should allow multiple user to RSVP", async function () {
            await partySplit.connect(user1).rsvp({ value: TWO_ETH });
            await partySplit.connect(user2).rsvp({ value: TWO_ETH });

            expect(await partySplit.hasRSVPed(user1.address)).to.equal(true);
            expect(await partySplit.hasRSVPed(user2.address)).to.equal(true);
            expect(await partySplit.members(0)).to.equal(user1.address);
            expect(await partySplit.members(1)).to.equal(user2.address);
        });
    });

    describe("PayBill", function () {
        beforeEach(async function () {
            await partySplit.connect(user1).rsvp({ value: TWO_ETH });
            await partySplit.connect(user2).rsvp({ value: TWO_ETH });
        });

        it("Should pay the bill amount to the venue and splits balance equally", async function () {
            const billAmount = ethers.utils.parseEther("3");

            const user1InitialBalance = await ethers.provider.getBalance(user1.address);
            const user2InitialBalance = await ethers.provider.getBalance(user2.address);
            const venueInitialBalance = await ethers.provider.getBalance(venue.address);

            await partySplit.payBill(venue.address, billAmount);

            const user1FinalBalance = await ethers.provider.getBalance(user1.address);
            const user2FinalBalance = await ethers.provider.getBalance(user2.address);
            const venueFinalBalance = await ethers.provider.getBalance(venue.address);

            expect(venueFinalBalance.sub(venueInitialBalance)).to.changeEtherBalance(venue, billAmount);
            expect(user1InitialBalance.sub(user1FinalBalance)).to.changeEtherBalance(user1, ONE_POINT_FIVE_ETH);
            expect(user2InitialBalance.sub(user2FinalBalance)).to.changeEtherBalance(user2, ONE_POINT_FIVE_ETH);
        });
    });
})