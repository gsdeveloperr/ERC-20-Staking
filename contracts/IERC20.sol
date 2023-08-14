// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

// Interface for the ERC-20 token standard
interface IERC20 {
    
    // Event emitted when tokens are transferred from one address to another
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Event emitted when the allowance of a spender on behalf of an owner is set
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // Function to get the balance of tokens held by a specific address
    function balanceOf(address account) external view returns (uint256);

    // Function to transfer tokens from the caller's address to the specified recipient
    function transfer(address to, uint256 amount) external returns (bool);

    // Function to get the remaining allowance of a spender for a specific owner's tokens
    function allowance(address owner, address spender) external view returns (uint256);

    // Function to approve a spender to spend a specific amount of tokens on behalf of the caller
    function approve(address spender, uint256 amount) external returns (bool);

    // Function to transfer tokens from one address (the owner) to another address (the recipient) on behalf of the caller
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
