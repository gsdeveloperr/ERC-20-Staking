// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

// IMPORTING CONTRACT
import "./Address.sol";

// Define an abstract contract named Initializable
abstract contract Initializable {
    
    // Variables to track initialization state
    uint8 private _initialized;        
    bool private _initializing;
    
    // Event to be emitted when the contract is initialized with a specific version number
    event Initialized(uint8 version);

    modifier initializer() {
        // Check if the current function call is a top-level call (not inside another function)
        bool isTopLevelCall = !_initializing;
        
        // Check if the contract is not initialized yet (initialized value is less than 1),
        // or the contract is not deployed as a child contract and is already initialized
        require(
            (isTopLevelCall && _initialized < 1) || (!Address.isContract(address(this)) && _initialized == 1),
            "Initializable: contract is already initialized"
        );
        
     
      
        _initialized = 1;
        if (isTopLevelCall) {
            _initializing = true;
        }
          _;
        
        // If this is a top-level call, set _initializing to false and emit the Initialized event
        if (isTopLevelCall) {
            _initializing = false;
            emit Initialized(1);
        }
    }
   
    // Modifier to allow re-initialization of the contract with a specific version number
    modifier reinitializer(uint8 version) {
        // Check if the contract is not currently initializing and the provided version is higher than the current version
        require(!_initializing && _initialized < version, "Initializable: contract is already initialized");
        
        // Set the contract's initialization state to the provided version
        _initialized = version;
        
        // Set _initializing to true to indicate the contract is currently being re-initialized
        _initializing = true;
        
        // Mark the function as completed
        _;
        
        // Set _initializing to false after the re-initialization process is complete and emit the Initialized event with the new version
        _initializing = false;
        emit Initialized(version);
    }

    // Modifier to restrict certain functions to be callable only during the initialization process
    modifier onlyInitializing() {
        require(_initializing, "Initializable: contract is not initializing");
        _;
    }

    // Internal virtual function to disable any future initialization attempts
    function _disableInitializers() internal virtual {
        // Check if the contract is not currently initializing
        require(!_initializing, "Initializable: contract is initializing");
        
        // If the contract has not reached the maximum version value, set the initialization state to the maximum value
        if (_initialized < type(uint8).max) {
            _initialized = type(uint8).max;
            
            // Emit the Initialized event with the maximum version number to indicate that the contract is no longer open for initialization
            emit Initialized(type(uint8).max);
        }
    }
} 
