// Async function to detect and connect to the specified provider (e.g., Metamask).
async function providerDetector(_provider) {
  // Check if the requested provider is Metamask.

  if (_provider === "metamask_wallet") {
    // Check if the Ethereum provider is available in the window object.

    if (window.ethereum && window.ethereum.providers) {
      // Find the Metamask provider in the list of available providers.

      // Find the Metamask provider in the list of available providers.
      const metamaskProvider = window.ethereum.providers.find(
        (provider) => provider.isMetaMask
      );

      // If Metamask provider is found, set it as the only provider in the window object.

      if (metamaskProvider) {
        // Override the providers array with the Metamask provider.

        window.ethereum.providers = [metamaskProvider];

        // Connect to the Metamask provider using the commonInjectedConnect function and return the result.

        return await commonInjectedConnect(metamaskProvider, _provider);
      } else {
        // If Metamask provider is not found, log an error and open the Metamask download link.

        console.log("Metamask wallet not found");
        window.open("https://metamask.io/download/", "_blank").focus();

        // Return false to indicate the absence of the Metamask provider
        return false;
      }
    } else if (window.ethereum) {
      // If Ethereum provider is available without a providers list, connect using commonInjectedConnect.

      return await commonInjectedConnect(window.ethereum, _provider);
    } else {
      console.log("metamask wallet not found");

      try {
        window.open("https://metamask.io/download/", "_blank").focus();
      } catch (error) {}

      return false;
    }
  }
}

// Get connected chain id from the Ethereum node using the provided provider.
async function commonInjectedConnect(_provider, _provider_name) {
  // Request user's permission to connect to the provider.
  await _provider.enable();

  // Set up event listeners for the web3 instance with the provider.
  setWeb3Events(_provider);

  // Create a new web3 instance using the provider.
  web3 = new Web3(_provider);

  // Get the current network id from the Ethereum node.
  let currentNetworkId = await web3.eth.getChainId();
  currentNetworkId = currentNetworkId.toString();
  console.log("network", currentNetworkId);

  // Get the connected accounts from the Ethereum node.
  const accounts = await web3.eth.getAccounts();
  console.log("-> accounts");
  console.log(accounts);

  // Get the current address from the connected accounts.
  currentAddress = accounts[0].toLowerCase();

  // Check if the current network id matches the required network id (_NETWORK_ID).
  if (currentNetworkId != _NETWORK_ID) {
    // If the network id does not match, show an error notification and return false.
    notyf.error(
      `Please connect Wallet on ${SELECT_CONTRACT[_NETWORK_ID].network_name}!`
    );
    return false;
  }

  // If the network id matches, create a contract instance for the token contract
  // using the provided ABI and contract address.
  oContractToken = new web3.eth.Contract(
    SELECT_CONTRACT[_NETWORK_ID].TOKEN.abi,
    SELECT_CONTRACT[_NETWORK_ID].TOKEN.address
  );

  // Return true to indicate successful connection to the provider and contract instantiation.
  return true;
}

// Set up event listeners for the web3 instance with the provided provider.
function setWeb3Events(_provider) {
  // Event handler for "accountsChanged" event, triggered when the connected accounts change.

  _provider.on("accountsChanged", (accounts) => {
    console.log(accounts);

    // If no accounts are available, logout the current user.

    if (!accounts.length) {
      logout();
    } else {
      // Update the currentAddress variable with the new connected account.

      currentAddress = accounts[0];

      // Get the selected tab and update the corresponding UI class.

      let sClass = getSelectedTab();
    }
  });

  // Event handler for "chainChanged" event, triggered when the connected chain id changes.
  _provider.on("chainChanged", (chainId) => {
    console.log(chainId);
    // If the chain id changes, logout the current user.
    logout();
  });

  // Event handler for "connect" event, triggered when the web3 provider connects to the session.
  _provider.on("connect", () => {
    console.log("connect");
    // When connected, logout the current user.
    logout();
  });

  // Event handler for "disconnect" event, triggered when the web3 provider disconnects from the session.
  _provider.on("disconnect", (code, reason) => {
    console.log(code, reason);
    // Clear the local storage and logout the current user.
    localStorage.clear();
    logout();
  });
}

// Function to logout the user by reloading the current window.
function logout() {
  window.location.reload();
}

// Function to add or adjust decimal places in a number.
//Logic// convert ether into Wei

function addDecimal(num, nDec) {
  // Convert the number to a string and split it at the decimal point
  const aNum = `${num}`.split(".");

  // Check if the number has decimal places.
  if (aNum[1]) {
    // If the number of decimal places is more than nDec, truncate the extra digits.

    if (aNum[1].length > nDec) aNum[1] = aNum[1].slice(0, nDec);

    // Pad the number with zeros to achieve nDec decimal places.
    return aNum[0] + aNum[1] + "0".repeat(nDec - aNum[1].length); // Concatenate the integer part, trimmed decimal part, and additional zeros.
  }
  // If the number has no decimal places, add nDec zeros as decimal places.

  return aNum[0] + "0".repeat(nDec); // Concatenate the integer part and nDec zeros.
}

// This function is used to format Ethereum error messages for better readability.
// It extracts the relevant error message from the error object and returns it.
function formatEthErrorMsg(error) {
  try {
    var eFrom = error.message.indexOf("{");

    var eTo = error.message.lastIndexOf("}");

    var eM1 = error.message.indexOf("TokenStaking: ");

    var eM2 = error.message.indexOf("ERC20 : ");

    var eM4 = error.message.indexOf("Internal JSON-RPC error");

    // Check if the opening brace, closing brace, and either "TokenStaking: " or "ERC20 : " substrings are present.
    if (eFrom != -1 && eTo != -1 && (eM1 != -1 || eM2 != -1)) {
      // Extract the JSON string from the error message.
      var eMsgTemp = JSON.parse(error.message.substr(eFrom, eTo));
      // Extract the actual error message from the JSON string or the original error message.
      var eMsg = eM4 != -1 ? eMsgTemp.message : eMsgTemp.originalError.message;

      // Check if the error message contains "TokenStaking: " substring.
      if (eM1 != -1) {
        // Return the error message after splitting it from "TokenStaking: ".
        return eMsg.split("TokenStaking: ")[1];
      } else {
        // Return the error message after splitting it from "ERC20 : ".
        return eMsg.split("ERC20 : ")[1];
      }
    } else {
      // If the required substrings are not found, return the original error message.
      return error.message;
    }
  } catch (e) {
    // If an error occurs during the formatting process, log the error and return a generic message.
    console.log(e);
    return "Something Went Wrong!";
  }
}

// This function is used to get the selected tab based on the provided class.
// If a class is provided, it returns the class. Otherwise, it returns the default value "contractCall".
function getSelectedTab(sClass) {
  console.log(sClass);
  return sClass || contractCall;
}

// Function to retrieve a web3 contract instance based on the specified contract class.
function getContractObj(sClass) {
  // Create a new web3 contract instance using the ABI and address of the specified contract class.
  return new web3.eth.Contract(
    SELECT_CONTRACT[_NETWORK_ID].STAKING.abi, // Use the ABI of the selected contract on the given network.
    SELECT_CONTRACT[_NETWORK_ID].STAKING[sClass].address // Use the address of the specified contract class.
  );
}
