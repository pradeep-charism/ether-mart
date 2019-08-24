const ShopThereum = artifacts.require('./ShopThereum.sol');

module.exports = async function (deployer, network, accounts) {
    const wallet = accounts[0];
    await deployer.deploy(
        ShopThereum,
        wallet
        );
 };