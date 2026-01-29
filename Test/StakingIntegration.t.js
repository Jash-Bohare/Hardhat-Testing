const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Vault Integration Tests', function () {
    let Vault;
    let vault;
    let token;
    let user1, user2;

    const TEN_ETH = ethers.utils.parseEther("10");
    const FIVE_ETH = ethers.utils.parseEther("5");

    beforeEach(async function () {
        [user1, user2] = await ethers.getSigners();

        Vault = await ethers.getContractFactory("StakingVault");
        vault = await Vault.deploy();

        const tokenAddress = await vault.token();
        const Token = await ethers.getContractFactory("RewardToken");
        token = Token.attach(tokenAddress);
    });

    describe("Staking", function () {
        it("Should stake and record correctly", async function () {
            await vault.connect(user1).stake({ value: TEN_ETH });
            expect(await vault.stakes(user1.address)).to.equal(TEN_ETH);
        });

        it("Should handle multiple stakes correctly", async function () {
            await vault.connect(user1).stake({ value: TEN_ETH });
            await vault.connect(user1).stake({ value: TEN_ETH });
            expect(await vault.stakes(user1.address)).to.equal(TEN_ETH.mul(2));
        });
    });

    describe("Withdrawal", function () {
        it("Should revert when staked nothing", async function () {
            await expect(vault.connect(user1).withdraw()).to.be.revertedWithCustomError(vault, "NothingStaked");
        });

        it("Should withdraw ETH, mint reward tokens and reset stake", async function () {
            await vault.connect(user1).stake({ value: TEN_ETH });
            const REWARD = TEN_ETH.div(10);

            await expect(vault.connect(user1).withdraw()).to.changeEtherBalances([user1, vault], [TEN_ETH, TEN_ETH.mul(-1)]);
            expect(await vault.stakes(user1.address)).to.equal(0);
            expect(await token.balanceOf(user1.address)).to.equal(REWARD);
        });

        it("Should prevent external minting of reward tokens", async function () {
            await expect(token.connect(user1).mint(user1.address, TEN_ETH)).to.be.revertedWithCustomError(token, "NotVault");
        });
    });

    describe("Multiple users", function(){
        it("Should allow multiple user to stake and withdraw", async function(){
            await vault.connect(user1).stake({ value: TEN_ETH });
            await vault.connect(user2).stake({ value: FIVE_ETH });

            const REWARD1 = TEN_ETH.div(10);
            const REWARD2 = FIVE_ETH.div(10);   

            await expect(vault.connect(user1).withdraw()).to.changeEtherBalances([user1, vault], [TEN_ETH, TEN_ETH.mul(-1)]);
            expect(await vault.stakes(user1.address)).to.equal(0);
            expect(await token.balanceOf(user1.address)).to.equal(REWARD1); 

            await expect(vault.connect(user2).withdraw()).to.changeEtherBalances([user2, vault], [FIVE_ETH, FIVE_ETH.mul(-1)]);
            expect(await vault.stakes(user2.address)).to.equal(0);
            expect(await token.balanceOf(user2.address)).to.equal(REWARD2);
        });
    });
});