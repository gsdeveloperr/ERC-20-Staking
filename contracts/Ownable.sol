// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

//IMPORTING CONTRACT
import "./Context.sol";

// Abstract contract named Ownable inheriting from Context
abstract contract Ownable is Context {
    address private _owner;

    // Event to be emitted when ownership is transferred
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Constructor to initialize ownership with the contract deployer's address
    constructor() {
        _transferOwnership(_msgSender());
    }

    // Modifier to restrict certain functions to be callable only by the owner
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    // Function to get the current owner's address
    function owner() public view virtual returns (address) {
        return _owner;
    }

    // Internal function to check if the caller is the owner
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    // Function to renounce ownership, making the contract ownerless
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    // Function to transfer ownership to a new address
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    // Internal function to transfer ownership to a new address
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}