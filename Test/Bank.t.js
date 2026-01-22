const { expect } = require("chai");

describe("Bank Contract", function(){
    let Bank;
    let bank;
    let owner;
    let user;
    let attacker;

    beforeEach(async function(){
        Bank = await ethers.getContractFactory("Bank");
        [owner, user, addr2] = await ethers.getSigners();
        bank = await Bank.deploy();
    });

    describe("Deployment", function(){
        it("Should set the right owner", async function(){
            expect(await bank.owner()).to.equal(owner.address);
        });
    })

    describe("Deposits", function(){
        it("Should revert when zero deposit", async function(){
            await expect(bank.connect(user).deposit({value: 0})).to.be.revertedWith("Zero deposit");
        });

        it("Should increase sender balance on deposit", async function(){
            const amount = ethers.utils.parseEther("1");
            await bank.connect(user).deposit({value: amount});
            expect(await bank.balanceOf(user.address)).to.equal(amount);
        });

        it("Should accumulate balance on multiple deposits", async function(){
            const amount1 = ethers.utils.parseEther("1");
            const amount2 = ethers.utils.parseEther("2");
            const amount = amount1.add(amount2);

            await bank.connect(user).deposit({value: amount1});
            await bank.connect(user).deposit({value: amount2});

            expect(await bank.balanceOf(user.address)).to.equal(amount);
        });
    });

    describe("Withdrawals", function(){
        it("Should revert with custom error when insufficient balance", async function(){
            const amount1 = ethers.utils.parseEther("2");
            const amount2 = ethers.utils.parseEther("1");

            await bank.connect(user).deposit({value: amount2});

            await expect(bank.connect(user).withdraw(amount1)).to.be.revertedWithCustomError(bank, "InsufficientBalance").withArgs(amount2, amount1);
        });

        it("Should withdraw correct amount and update balance correctly", async function(){
            const amount1 = ethers.utils.parseEther("2");
            const amount2 = ethers.utils.parseEther("1");
            
            await bank.connect(user).deposit({value: amount1});

            expect(await bank.connect(user).withdraw(amount2)).to.changeEtherBalances([Bank, user], [-amount2, amount2]);
            expect(await bank.balanceOf(user.address)).to.equal(amount1.sub(amount2));
        });

        it("Should withdraw all leaving balance 0", async function(){
            const amount1 = ethers.utils.parseEther("2");

            await bank.connect(user).deposit({value: amount1});
            await bank.connect(user).withdraw(amount1);

            expect(await bank.balanceOf(user.address)).to.equal(0);
        });
    });
})