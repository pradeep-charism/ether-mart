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
    var web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function () {

    $.getJSON('EtherMart.json', function (data) {
      var EtherMartArtifact = data;
      App.contracts.EtherMart = TruffleContract(EtherMartArtifact);
      App.contracts.EtherMart.setProvider(App.web3Provider);
      return App.markSold();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-adopt', App.handleBuy);
    $(document).on('click', '.btn-release', App.handleSell);
  },

  markSold: function (products, account) {

    var buyInstance;
    App.contracts.EtherMart.deployed().then(function (instance) {
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
      App.contracts.EtherMart.deployed().then(function (instance) {
        buyInstance = instance;
        return buyInstance.buy(shopId, { from: account });
      }).then(function (result) {
        return App.markSold();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  markAvailable: function (products, account) {

    var buyInstance;
    App.contracts.EtherMart.deployed().then(function (instance) {
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
      App.contracts.EtherMart.deployed().then(function (instance) {
        buyInstance = instance;
        return buyInstance.sell(shopId, { from: account, value: 1000000000000000000 });
      }).then(function (result) {
        return App.markAvailable();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
