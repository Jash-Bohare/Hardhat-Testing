const { expect } = require("chai");

describe("Game5", function(){
    let Game5;
    let game5;
    let addr1;

    beforeEach(async function(){
        [addr1] = await ethers.getSigners();
        Game5 = await ethers.getContractFactory("Game5");
        game5 = await Game5.deploy();
    });

    describe("CheckWin", function(){
        it("Should Win the game", async function(){
            const addr2 = "0x0000000000000000000000000000000000000001";
            await ethers.provider.send("hardhat_impersonateAccount", [addr2]);
            const signer = await ethers.getSigner(addr2);

            await addr1.sendTransaction({
                to: addr2, value: ethers.utils.parseEther("1"),
            });

            await game5.connect(signer).win();
            expect(await game5.isWon()).to.equal(true);
        });
    });
})