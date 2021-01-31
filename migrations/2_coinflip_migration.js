const Ownable = artifacts.require("Ownable");
const Coinflip = artifacts.require("Coinflip");


module.exports = function (deployer, accounts) {
  deployer.deploy(Ownable).catch(() => console.log("Deploy failed"));
  deployer.deploy(Coinflip).then(instance => instance.fundContract({ value: web3.utils.toWei("1.5", "ether") })).catch(() => console.log("Deploy failed"));
};
