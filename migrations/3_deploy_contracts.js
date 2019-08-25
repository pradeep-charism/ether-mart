const ABCoinContract = artifacts.require('./ABCoinContract.sol');

module.exports = async function (deployer, network, accounts) {
    const wallet = accounts[0];
    let _token;
    await deployer.deploy(ABCoinContract)
        .then(instance => {
            _token = instance.address;
            console.log ("ABCoin is created at address", _token);
        });
 };