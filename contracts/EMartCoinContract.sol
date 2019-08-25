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

    constructor(address payable owner) public payable {
        symbol = "EMT";
        name = "Ether Mart Coins";
        decimals = 3;
        _unitsToIssue = 10 * 10**uint(decimals);
        _storage = new EternalCoinStorage();
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