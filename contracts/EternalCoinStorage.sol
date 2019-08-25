pragma solidity ^0.5.8;

import "./SafeMath.sol";

contract EternalCoinStorage{
    using SafeMath for uint;

    struct Token {
        address holder;
        uint units;
    }
    mapping(address => Token) tokensLedger;
    address[] tokenHolders;
    address payable private _adminWallet;

    constructor() public payable{
        _adminWallet = msg.sender;
        depositCoin(msg.sender, 0);
    }

    function depositCoin(address sender, uint tokens) public returns (bool success) {
        Token memory newToken = tokensLedger[sender];
        newToken.units = newToken.units.add(tokens);
        newToken.holder = sender;
        tokensLedger[sender] = newToken;

        if(tokensLedger[sender].holder == 0x0000000000000000000000000000000000000000){
            tokenHolders.push(sender);
        }
        return success;
    }

    function withdrawCoin(address sender, uint tokens) public payable returns (bool success) {
        Token memory newToken = tokensLedger[sender];
        delete tokensLedger[sender];
        newToken.holder = sender;
        newToken.units = newToken.units.sub(tokens);
        tokensLedger[sender] = newToken;

        if(tokensLedger[_adminWallet].holder == 0x0000000000000000000000000000000000000000){
            tokenHolders.push(_adminWallet);
        }
        Token memory  token = tokensLedger[_adminWallet];
        token.holder = _adminWallet;
        token.units = token.units.add(tokens);
        tokensLedger[_adminWallet] = token;
        return true;
    }

    function buy(address from, uint tokens) public returns (bool success) {
        transfer(from, _adminWallet, tokens);
    }

    function sell(address to, uint tokens) public returns (bool success) {
        transfer(_adminWallet, to, tokens);
    }

    function transfer(address from, address to, uint tokens) public returns (bool success) {
        Token memory newToken = tokensLedger[from];
        newToken.units = newToken.units.sub(tokens);
        tokensLedger[from] = newToken;

        if(tokensLedger[to].holder == 0x0000000000000000000000000000000000000000){
            tokenHolders.push(to);
        }
        Token memory  token = tokensLedger[to];
        token.holder = to;
        token.units = token.units.add(tokens);
        tokensLedger[to] = token;
        return true;
    }

    function getAllTokenHolders() public view returns (address[] memory, uint[] memory){
        address[] memory holders = new address[](tokenHolders.length);
        uint[]    memory units = new uint[](tokenHolders.length);
        for (uint i = 0; i < tokenHolders.length; i++) {
            Token storage token = tokensLedger[tokenHolders[i]];
            holders[i] = token.holder;
            units[i] = token.units;
        }
        return (holders, units);
    }

    function balanceOf(address tokenOwner) public view returns (uint balance) {
        return tokensLedger[tokenOwner].units;
    }

}