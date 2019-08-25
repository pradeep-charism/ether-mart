pragma solidity ^0.5.8;
contract CoinInterface {
    function issueTokens(uint etherValue) public payable returns (bool success);
    function balanceOf(address tokenOwner) public view returns (uint balance);
    function transfer(address to, uint tokens) public returns (bool success);
    function redeemTokens(uint tokens) public payable returns (bool success);
    function buy(uint tokens) public payable returns (bool success);
    function sell(uint tokens) public payable returns (bool success);
    event Transfer(address indexed from, address indexed to, uint tokens);
}