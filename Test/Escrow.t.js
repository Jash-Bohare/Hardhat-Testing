const { expect } = require("chai");

describe("Escrow Contract", function () {
    let Escrow;
    let escrow;
    let depositor;
    let beneficiary;

    const ONE_ETH = ethers.utils.parseEther("1");
    const TWO_ETH = ethers.utils.parseEther("2");
    const TOTAL_ETH = ONE_ETH.add(TWO_ETH);

    beforeEach(async function () {
        [depositor, beneficiary] = await ethers.getSigners();
        Escrow = await ethers.getContractFactory("Escrow");
        escrow = await Escrow.deploy(beneficiary.address);
    });

    describe("Deployment", function () {
        it("Should set depositor as deployer", async function () {
            expect(await escrow.depositor()).to.equal(depositor.address);
        });

        it("Should set beneficiary correctly", async function () {
            expect(await escrow.beneficiary()).to.equal(beneficiary.address);
        });
    });

    describe("Deposit", function () {
        it("Should allow only depositor to deposit", async function () {
            await expect(escrow.connect(beneficiary).deposit({ value: ONE_ETH })).to.be.revertedWithCustomError(escrow, "NotDepositor");
        });

        it("Should update deposited amount", async function () {
            await escrow.connect(depositor).deposit({ value: ONE_ETH });
            expect(await escrow.deposited()).to.equal(ONE_ETH);
        });

        it("Should handle multiple deposits", async function () {
            await escrow.connect(depositor).deposit({ value: ONE_ETH });
            await escrow.connect(depositor).deposit({ value: TWO_ETH });
            expect(await escrow.deposited()).to.equal(TOTAL_ETH);
        });
    });

    describe("Release", function () {
        it("Should revert if nothing to release", async function () {
            await expect(escrow.release()).to.be.revertedWithCustomError(escrow, "NothingToRelease");
        });

        it("Should transfer ETH to beneficiary", async function () {
            await escrow.connect(depositor).deposit({ value: TWO_ETH });
            await expect(escrow.release()).to.changeEtherBalance(beneficiary, TWO_ETH);
            expect(await escrow.deposited()).to.equal(0);
        });
    });
})