const EternalCoinStorage = artifacts.require('./EternalCoinStorage.sol');

module.exports = async function (deployer, network, accounts) {
    const adminWallet = accounts[3];
    let _token;
    await deployer.deploy(EternalCoinStorage)
        .then(instance => {
            _token = instance.address;
            console.log ("Ether Mart coin is created at address", _token);
        });
 };