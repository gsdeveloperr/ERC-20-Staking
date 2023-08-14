// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

// Library contract named Address
library Address {

    // Function to check if an address is a contract
    function isContract(address account) internal view returns (bool) {
        // Check if the account's code length is greater than 0, which indicates it is a contract
        return account.code.length > 0;
    }

    // Function to send Ether value to a payable recipient address
    function sendValue(address payable recipient, uint256 amount) internal {
        // Ensure the contract has sufficient balance to send the specified amount
        require(address(this).balance >= amount, "Address: insufficient balance");

        // Use low-level call to send the specified amount of Ether to the recipient address
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    // Function to call a contract's function with given data
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCall(target, data, "Address: low-level call failed");
    }

    // Function to call a contract's function with given data and custom error message
    function functionCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    // Function to call a contract's function with given data and value (Ether amount)
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    // Function to call a contract's function with given data, value (Ether amount), and custom error message
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        // Ensure the contract has sufficient balance to send the specified value
        require(address(this).balance >= value, "Address: insufficient balance for call");
        
        // Check if the target address is a contract
        require(isContract(target), "Address: call to non-contract");

        // Use low-level call with value to call the target contract's function with the given data and value
        (bool success, bytes memory returndata) = target.call{value: value}(data);

        // Verify the call result and revert with the custom error message if the call was not successful
        return verifyCallResult(success, returndata, errorMessage);
    }

    // Function to call a contract's function using staticcall with given data
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    // Function to call a contract's function using staticcall with given data and custom error message
    function functionStaticCall(address target, bytes memory data, string memory errorMessage) internal view returns (bytes memory) {
        // Check if the target address is a contract
        require(isContract(target), "Address: static call to non-contract");

        // Use staticcall to call the target contract's function with the given data
        (bool success, bytes memory returndata) = target.staticcall(data);

        // Verify the staticcall result and revert with the custom error message if the call was not successful
        return verifyCallResult(success, returndata, errorMessage);
    }

    // Function to call a contract's function using delegatecall with given data
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    // Function to call a contract's function using delegatecall with given data and custom error message
    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        // Check if the target address is a contract
        require(isContract(target), "Address: delegate call to non-contract");

        // Use delegatecall to call the target contract's function with the given data
        (bool success, bytes memory returndata) = target.delegatecall(data);

        // Verify the delegatecall result and revert with the custom error message if the call was not successful
        return verifyCallResult(success, returndata, errorMessage);
    }

    // Function to verify the result of a low-level call and handle any potential errors
    function verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal pure returns (bytes memory) {
        if (success) {
            // If the call was successful, return the returndata
            return returndata;
        } else {
            // If the call was not successful, check if the returndata contains error information
            if (returndata.length > 0) {
                // Use assembly to extract the error information and revert with the error message
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                // If there is no returndata, revert with the custom error message
                revert(errorMessage);
            }
        }
    }
}
