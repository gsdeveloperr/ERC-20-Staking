// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

contract GsCoder {
    // Token metadata
    string public name = "@GsCoder";
    string public symbol = 'GS';
    string public standard = 'GsCoder v.0.1';

    // Total token supply and contract owner
    uint256 public totalSupply;
    address public ownerOfContract;

    // User ID counter
    uint256 public _userId;

    // Initial supply constant
    uint256 constant initialSupply = 1000000 * (10**18);

    // Array to store token holders
    address[] public holderToken;

    // Events for token transfers and approvals
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    // Constructor to initialize the contract
    constructor() {
        ownerOfContract = msg.sender;
        balanceOf[msg.sender] = initialSupply;
        totalSupply = initialSupply;
    }

    // Mapping to store token holder information
    mapping(address => TokenHolderInfo) public tokenHolderInfos;

    // Mapping to store token balances
    mapping(address => uint256) public balanceOf;

    // Mapping to store approved allowance for transfers
    mapping(address => mapping(address => uint256)) public allowance;

    // Struct to store token holder information
    struct TokenHolderInfo {
        uint256 _tokenId;
        address _from;
        address _to;
        uint256 _totalToken;
        bool _tokenHolder;
    }

    // Internal function to increment the user ID counter
    function inc() internal {
        _userId++;
    }

    // Transfer tokens from sender to another address
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);

        // Increment the user ID counter
        inc();

        // Update token balances
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // Update token holder information
        TokenHolderInfo storage tokenHolderInfo = tokenHolderInfos[_to];
        tokenHolderInfo._to = _to;
        tokenHolderInfo._from = msg.sender;
        tokenHolderInfo._totalToken = _value;
        tokenHolderInfo._tokenHolder = true;
        tokenHolderInfo._tokenId = _userId;

        // Add the new token holder to the array
        holderToken.push(_to);

        // Emit the Transfer event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    // Approve a spender to spend tokens on behalf of the sender
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;

        // Emit the Approval event
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // Transfer tokens from one address to another on behalf of the sender
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        // Update token balances and allowances
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;

        // Emit the Transfer event
        emit Transfer(_from, _to, _value);

        return true;
    }

    // Get token holder information for a given address
    function getTokenHolderData(address _address) public view returns (uint256, address, address, uint256, bool) {
        return (
            tokenHolderInfos[_address]._tokenId,
            tokenHolderInfos[_address]._to,
            tokenHolderInfos[_address]._from,
            tokenHolderInfos[_address]._totalToken,
            tokenHolderInfos[_address]._tokenHolder
        );
    }

    // Get the list of all token holders
    function getTokenHolder() public view returns (address[] memory) {
        return holderToken;
    }
}
