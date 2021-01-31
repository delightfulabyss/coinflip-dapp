const Coinflip = artifacts.require("Coinflip");
const truffleAssert = require("truffle-assertions");

contract("Coinflip", async accounts => {
    let instance;
    before(async function () {
        instance = await Coinflip.deployed();
    });

    it("should cause the contract balance and the internal contract balance variable to be the same after funding the contract", async () => {
        let contractBalance = await web3.eth.getBalance(Coinflip.address);
        let internalBalance = await instance.contractBalance();
        assert(parseInt(contractBalance) == parseInt(internalBalance), "Initial balances are not equal");
    });
    
    it("Should create a new session when address is not an account", async () => {
        await instance.flipCoin({from: accounts[0], value: web3.utils.toWei("1", "ether") });
        assert.isOk(instance.getPlayerSession(accounts[0]), "Did not create a new session object");
    });

    it("Should add player address to playerAccunts array when address is not an account", async () => {
        let accountAddress = await instance.playerAccounts(0);
        assert.equal(accountAddress, accounts[0], "Did not add player address to playerAccounts array");
    });

    it("Should update the bet when a registered address places another bet", async () => {
        await instance.flipCoin({ from: accounts[0], value: web3.utils.toWei("5", "ether") });
        let session = await instance.getPlayerSession(accounts[0])
        assert.equal(session.playerBet, web3.utils.toWei("5", "ether"), "Player bet was not updated");
    });
            
    
    // it("Should cause a player's balance to be zero when they cash out", () => Coinflip.deployed().then(instance => instance.cashOut()).then(assert.equals(gameSessions[accounts[0]].playerBalance, 0), "Player balance not zero when cashout occurs"));

});