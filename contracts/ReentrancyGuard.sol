// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

// Abstract contract named ReentrancyGuard
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    // Constructor to initialize the reentrancy status to not entered
    constructor() {
        _status = _NOT_ENTERED;
    }

    // Modifier to prevent reentrancy
    modifier nonReentrant() {
        // Ensure that the current status is not entered (_NOT_ENTERED)
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Set the status to entered (_ENTERED)
        _status = _ENTERED;

        // Execute the function
        _;

        // Set the status back to not entered (_NOT_ENTERED)
        _status = _NOT_ENTERED;
    }
}
