const EMartCoinContract = artifacts.require('./EMartCoinContract.sol');

module.exports = async function (deployer, network, accounts) {
    const adminWallet = accounts[2];
    let _token;
    await deployer.deploy(EMartCoinContract, adminWallet, { from: adminWallet })
        .then(instance => {
            _token = instance.address;
            console.log ("Ether Mart coin is created at address", _token);
        });
 };