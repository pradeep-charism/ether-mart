pragma solidity ^0.5.8;
import "./SafeMath.sol";
import "./CoinInterface.sol";
import "./Owned.sol";
import "./EternalCoinStorage.sol";

contract EMartCoinContract is CoinInterface, Owned {
    using SafeMath for uint;

    string public symbol;
    string public  name;
    uint8 public decimals;
    uint _unitsToIssue;
    EternalCoinStorage _storage;

    address[16] public products;
    address payable private _buyerWallet;


    constructor(address payable wallet) public payable {
        require(wallet != address(0), "wallet is the zero address");
        _buyerWallet = wallet;

        symbol = "EMT";
        name = "Ether Mart Coins";
        decimals = 3;
        _unitsToIssue = 10 * 10**uint(decimals);
        _storage = new EternalCoinStorage();
    }

    event BuyEvent(
        address indexed _from,
        uint indexed _id
    );

    event SellEvent(
        address indexed _from,
        uint indexed _id
    );

    function buyProduct(uint productId) public payable returns (uint) {
        require(productId >= 0 && productId <= 15);
        products[productId] = msg.sender;
        emit BuyEvent(msg.sender, productId);
        return productId;
    }

    function sellProduct(uint productId) public payable returns (uint) {
        require(productId >= 0 && productId <= 15);
        delete products[productId];
        emit BuyEvent(msg.sender, productId);
        return productId;
    }

    function getProducts() public view returns (address[16]memory) {
        return products;
    }

    function buy(uint tokens) public payable returns (bool success) {
        _storage.buy(msg.sender, tokens);
        return true;
    }

    function sell(uint tokens) public payable returns (bool success) {
        _storage.sell(msg.sender, tokens);
        return true;
    }

    function issueTokens(uint etherValue) public payable returns (bool success) {
        etherValue = etherValue/(10**18);
        _storage.depositCoin(msg.sender, _unitsToIssue*etherValue);
//        address(this).transfer(msg.value);
//        _adminWallet.transfer(msg.value);
    }

    function redeemTokens(uint tokens) public payable returns (bool success) {
        uint etherValue = tokens/(_unitsToIssue);
        _storage.withdrawCoin(msg.sender, tokens);
        msg.sender.transfer(etherValue*(10**18));
        return true;
    }

    function balanceOf(address tokenOwner) public view returns (uint balance) {
        return _storage.balanceOf(tokenOwner);
    }

    function transfer(address to, uint tokens) public returns (bool success) {
        _storage.transfer(msg.sender, to, tokens);
        emit Transfer(msg.sender, to, tokens);
        return true;
    }

    function getAllTokenHolders() public view returns (address[] memory, uint[] memory){
         return _storage.getAllTokenHolders();
    }

    function () external payable {
        revert();
    }
}