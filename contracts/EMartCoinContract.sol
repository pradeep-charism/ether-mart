pragma solidity ^0.5.8;
import "./SafeMath.sol";
import "./CoinInterface.sol";
import "./Owned.sol";

contract EMartCoinContract is CoinInterface, Owned {
    using SafeMath for uint;

    string public symbol;
    string public  name;
    uint8 public decimals;
    uint _totalSupply;
    uint _unitsToIssue;
    address payable private _adminWallet;


    struct Token {
        address holder;
        uint units;
    }
    mapping(address => Token) tokensLedger;
    address[] tokenHolders;

    mapping(address => mapping(address => uint)) allowed;

    constructor(address payable owner) public payable {
        symbol = "EMT";
        name = "Ether Mart Coins";
        decimals = 3;
        _unitsToIssue = 10 * 10**uint(decimals);
        _totalSupply = 0;
        _adminWallet = owner;

        Token memory newToken;
        newToken.units = _totalSupply;
        newToken.holder = _adminWallet;
        tokensLedger[_adminWallet] = newToken;
        tokenHolders.push(owner);
        emit Transfer(address(0), _adminWallet, _totalSupply);
    }

    function issueTokens(uint etherValue) public payable returns (bool success) {
        etherValue = etherValue/(10**18);
        _totalSupply = _totalSupply.add(_unitsToIssue*etherValue);

        Token memory newToken = tokensLedger[msg.sender];
        newToken.units = newToken.units.add(_unitsToIssue*etherValue);
        newToken.holder = msg.sender;
        tokensLedger[msg.sender] = newToken;
        if(tokensLedger[msg.sender].holder == 0x0000000000000000000000000000000000000000){
            tokenHolders.push(msg.sender);
        }
//        address(this).transfer(msg.value);
//        _adminWallet.transfer(msg.value);
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    function getTokenHoldersLength() public view returns (uint){
        return tokenHolders.length;
    }

    function getNumberOfTokenHolders(address who) public view returns (address){
        return tokensLedger[who].holder;
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

    function totalSupply() public view returns (uint) {
        return _totalSupply.sub(tokensLedger[address(0)].units);
    }

    function balanceOf(address tokenOwner) public view returns (uint balance) {
        return tokensLedger[tokenOwner].units;
    }


    // ------------------------------------------------------------------------
    // Transfer the balance from token owner's account to `to` account
    // - Owner's account must have sufficient balance to transfer
    // - 0 value transfers are allowed
    // ------------------------------------------------------------------------
    function transfer(address to, uint tokens) public returns (bool success) {
        Token memory newToken = tokensLedger[msg.sender];
        newToken.units = newToken.units.sub(tokens);
        tokensLedger[msg.sender] = newToken;

        if(tokensLedger[to].holder == 0x0000000000000000000000000000000000000000){
            tokenHolders.push(to);
        }
        Token memory  token = tokensLedger[to];
        token.holder = to;
        token.units = token.units.add(tokens);
        tokensLedger[to] = token;

        emit Transfer(msg.sender, to, tokens);
        return true;
    }

    function redeemTokens(uint tokens) public payable returns (bool success) {
        uint etherValue = tokens/(_unitsToIssue);
        Token memory newToken = tokensLedger[msg.sender];
        delete tokensLedger[msg.sender];
        newToken.holder = msg.sender;
        newToken.units = newToken.units.sub(tokens);
        tokensLedger[msg.sender] = newToken;

        if(tokensLedger[_adminWallet].holder == 0x0000000000000000000000000000000000000000){
            tokenHolders.push(_adminWallet);
        }
        Token memory  token = tokensLedger[_adminWallet];
        token.holder = _adminWallet;
        token.units = token.units.add(tokens);
        tokensLedger[_adminWallet] = token;
        msg.sender.transfer(etherValue*(10**18));
        emit Transfer(msg.sender, _adminWallet, tokens);
        return true;
    }


    // ------------------------------------------------------------------------
    // Token owner can approve for `spender` to transferFrom(...) `tokens`
    // from the token owner's account
    //
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
    // recommends that there are no checks for the approval double-spend attack
    // as this should be implemented in user interfaces
    // ------------------------------------------------------------------------
    function approve(address spender, uint tokens) public returns (bool success) {
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }


    // ------------------------------------------------------------------------
    // Transfer `tokens` from the `from` account to the `to` account
    //
    // The calling account must already have sufficient tokens approve(...)-d
    // for spending from the `from` account and
    // - From account must have sufficient balance to transfer
    // - Spender must have sufficient allowance to transfer
    // - 0 value transfers are allowed
    // ------------------------------------------------------------------------
    function transferFrom(address from, address to, uint tokens) public returns (bool success) {
        //         balances[from] = balances[from].sub(tokens);
        //         allowed[from][msg.sender] = allowed[from][msg.sender].sub(tokens);
        //         balances[to] = balances[to].add(tokens);
        //         emit Transfer(from, to, tokens);
        return true;
    }


    // ------------------------------------------------------------------------
    // Returns the amount of tokens approved by the owner that can be
    // transferred to the spender's account
    // ------------------------------------------------------------------------
    function allowance(address tokenOwner, address spender) public view returns (uint remaining) {
        return allowed[tokenOwner][spender];
    }

    // Don't accept ETH
    // ------------------------------------------------------------------------
    function () external payable {
        revert();
    }


    // ------------------------------------------------------------------------
    // Owner can transfer out any accidentally sent ERC20 tokens
    // ------------------------------------------------------------------------
    function transferAnyERC20Token(address tokenAddress, uint tokens) public onlyOwner returns (bool success) {
        return CoinInterface(tokenAddress).transfer(owner, tokens);
    }
}