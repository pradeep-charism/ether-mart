pragma solidity ^0.5.0;
import "./SafeMath.sol";

contract ShopThereum {
    using SafeMath for uint;

    address payable private _shopAdminWallet = 0xAdDf5CC6A9cBfdF00095D27600cB02b6605431D3;
    address payable private _safeWallet = 0xae8b4DE1c4575Eaac4a3182CB94401bDD022DeD8;
    address payable private _buyerWallet;
    address[16] public products;

    mapping (address => uint256) public _balances;

    constructor (address payable wallet) public {
        require(wallet != address(0), "wallet is the zero address");
        _buyerWallet = wallet;
    }
    
    event BuyEvent(
        address indexed _from,
        uint indexed _id
    );

    event SellEvent(
        address indexed _from,
        uint indexed _id
    );

    function buy(uint productId) public payable returns (uint) {
        require(productId >= 0 && productId <= 15);
        products[productId] = msg.sender;
//        _balances[msg.sender] = _balances[msg.sender].add(msg.value);
//        _balances[_shopAdminWallet] = _balances[_shopAdminWallet].add(msg.value);
//        _shopAdminWallet.transfer(msg.value);
//        _safeWallet.transfer(msg.value);
        emit BuyEvent(msg.sender, productId);
        return productId;
    }

    function sell(uint productId) public payable returns (uint) {
        require(productId >= 0 && productId <= 15);
        delete products[productId];
//        _balances[msg.sender] = _balances[msg.sender].add(msg.value);
//        _balances[_shopAdminWallet] = _balances[_shopAdminWallet].sub(msg.value);
//        _shopAdminWallet.transfer(msg.value);
//        _buyerWallet.transfer(msg.value);
//        _safeWallet.transfer(msg.value);
//        _balances[_buyerWallet]=msg.value;
        emit BuyEvent(msg.sender, productId);
        return productId;
    }

    function getProducts() public view returns (address[16]memory) {
        return products;
    }

    function() external payable{
        _safeWallet.transfer(msg.value);
    }
}

