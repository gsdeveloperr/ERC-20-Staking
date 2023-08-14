// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

// Abstract contract named Context
abstract contract Context {
    
    // Function to get the address of the message sender
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    // Function to get the message data as bytes
    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}
