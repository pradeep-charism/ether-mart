const EtherMart = artifacts.require('./EtherMart.sol');

module.exports = async function (deployer, network, accounts) {
    const wallet = accounts[0];
    await deployer.deploy(EtherMart, wallet);
 };