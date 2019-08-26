App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
  $.getJSON('../products/mobile-items.json', function (data) {
        var shopsRow = $('#shopsRow');
        var shopTemplate = $('#shopTemplate');

        for (let i = 0; i < data.length; i++) {
          shopTemplate.find('.panel-title').text(data[i].name);
          shopTemplate.find('img').attr('src', data[i].picture);
          shopTemplate.find('.shop-desc').text(data[i].desc);
          shopTemplate.find('.shop-cost').text(data[i].cost);
          shopTemplate.find('.shop-location').text(data[i].location);
          shopTemplate.find('.btn-adopt').attr('data-id', data[i].id);
          shopTemplate.find('.btn-release').attr('data-id', data[i].id).attr('disabled', true);


          shopsRow.append(shopTemplate.html());
        }
      });

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

  markSold: function (products, account) {

      var buyInstance;
      App.contracts.EMartCoinContract.deployed().then(function (instance) {
        buyInstance = instance;
        return buyInstance.getProducts.call();
      }).then(function (products) {
        for (i = 0; i < products.length; i++) {
          if (products[i] !== '0x0000000000000000000000000000000000000000') {
            $('.panel-shop').eq(i).find('.btn-adopt').text('Buy').attr('disabled', true);
            $('.panel-shop').eq(i).find('.btn-release').text('Sell').attr('disabled', false);
          }
        }
      }).catch(function (err) {
        console.log(err.message);
      });
    },

    handleBuy: function (event) {
      event.preventDefault();

      var shopId = parseInt($(event.target).data('id'));
      var buyInstance;
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
         var etherValue = web3.toWei(1, 'ether');
         console.log("Buy cost", etherValue);

        App.contracts.EMartCoinContract.deployed().then(function (instance) {
          buyInstance = instance;
          return buyInstance.buyProduct(shopId, { from: account, value: etherValue });
        }).then(function (result) {
          return App.markSold();
        }).catch(function (err) {
          console.log(err.message);
        });
      });
    },

    markAvailable: function (products, account) {

      var buyInstance;
      App.contracts.EMartCoinContract.deployed().then(function (instance) {
        buyInstance = instance;
        return buyInstance.getProducts.call();
      }).then(function (products) {
        for (i = 0; i < products.length; i++) {
          if (products[i] === '0x0000000000000000000000000000000000000000') {
            $('.panel-shop').eq(i).find('.btn-adopt').text('Buy').attr('disabled', false);
            $('.panel-shop').eq(i).find('.btn-release').text('Sell').attr('disabled', true);
          }
        }
      }).catch(function (err) {
        console.log(err.message);
      });
    },

    handleSell: function (event) {
      event.preventDefault();

      var shopId = parseInt($(event.target).data('id'));


      var buyInstance;
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.EMartCoinContract.deployed().then(function (instance) {
          buyInstance = instance;
          return buyInstance.sellProduct(shopId, { from: account, value: 1000000000000000000 });
        }).then(function (result) {
          return App.markAvailable();
        }).catch(function (err) {
          console.log(err.message);
        });
      });
    },

  bindEvents: function () {
    $(document).on('click', '.btn-buy-coins', App.issueTokens);
    $(document).on('click', '.btn-sell-coins', App.redeemTokens);
    $(document).on('click', '.btn-adopt', App.handleBuy);
    $(document).on('click', '.btn-release', App.handleSell);
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
        var value = document.getElementById("buyCoins").value;
        var etherValue = web3.toWei(value, 'ether');
        console.log("ether to buy tokens", etherValue);

        App.contracts.EMartCoinContract.deployed().then(function (instance) {
          abcoinInstance = instance;

          return abcoinInstance.issueTokens(etherValue, { from: account, value: etherValue });
        }).then(function (result) {
          console.log("issueTokens", `${result}`);
          return App.loadOnStartup();
        }).catch(function (err) {
          console.log(err.message);
        });
      });
    },

    redeemTokens: function (event) {
    event.preventDefault();

      var abcoinInstance;
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
        var fromAccount = accounts[0];
        console.log("From account: ", fromAccount);
        var coinValue = document.getElementById("sellCoins").value;
        App.contracts.EMartCoinContract.deployed().then(function (instance) {
          abcoinInstance = instance;
          return abcoinInstance.redeemTokens(coinValue, { from: fromAccount, value: coinValue, gas: 2100000});
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
          return abcoinInstance.transfer(toAccount, 100000, { from: fromAccount});
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
