App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: async function () {
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function () {

    $.getJSON('EMartCoinContract.json', function (data) {
      var ABCoinContractArtifact = data;
      App.contracts.EMartCoinContract = TruffleContract(ABCoinContractArtifact);
      App.contracts.EMartCoinContract.setProvider(App.web3Provider);
      return App.loadOnStartup();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-buy-coins', App.issueTokens);
    $(document).on('click', '.btn-sell-coins', App.transferTokens);
  },

  loadOnStartup: function (event) {
    var abcoinInstance;
    const emCoinDeployed = App.contracts.EMartCoinContract.deployed();

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      var balanceWei = web3.eth.getBalance(account);
      var balance = web3.fromWei(balanceWei, 'ether');
        $('#etherBalanceGroup').find('.ether-balance').text(`${balance}`);
      console.log("etherBalance", balance);

      emCoinDeployed.then(function (instance) {
        abcoinInstance = instance;
        return abcoinInstance.balanceOf(account, { from: account });
      }).then(function (result) {
        $('#coingroup').find('.balance-at').text(`${result}`);
        console.log("Balance at", `${result}`);
        return true;
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  issueTokens: function (event) {
  event.preventDefault();

      var abcoinInstance;
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.EMartCoinContract.deployed().then(function (instance) {
          abcoinInstance = instance;
          var etherValue= document.getElementById("buyCoins").value;
          return abcoinInstance.issueTokens(etherValue, { from: account });
        }).then(function (result) {
          console.log("issueTokens", `${result}`);
          return App.loadOnStartup();
        }).catch(function (err) {
          console.log(err.message);
        });
      });
    },

    transferTokens: function (event) {
    event.preventDefault();

      var abcoinInstance;
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
        var fromAccount = accounts[0];
        var toAccount = accounts[1];
        console.log("From account: ", fromAccount);
        console.log("To account: ", toAccount);
        App.contracts.EMartCoinContract.deployed().then(function (instance) {
          abcoinInstance = instance;
          return abcoinInstance.transfer(toAccount, 100000, { from: fromAccount, gas:3000000 });
        }).then(function (result) {
          console.log("issueTokens", `${result}`);
          return App.loadOnStartup();
        }).catch(function (err) {
          console.log(err.message);
        });
      });
    },




hookupMetamask: async function () {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.enable();
      } catch (error) {
        console.error("User denied account access")
      }
    }
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
