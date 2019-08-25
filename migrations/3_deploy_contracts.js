const EMartCoinContract = artifacts.require('./EMartCoinContract.sol');

module.exports = async function (deployer, network, accounts) {
    const wallet = accounts[0];
    let _token;
    await deployer.deploy(EMartCoinContract)
        .then(instance => {
            _token = instance.address;
            console.log ("Ether Mart coin is created at address", _token);
        });
 };