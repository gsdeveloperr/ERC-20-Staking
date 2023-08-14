// FUNCTION CALL
// Load initial data for "eightDays" class.
loadInitialData("eightDays");
// Connect to the Metamask wallet.
connectMe("metamask_wallet");

// Function to connect the wallet (not implemented).
function connectWallet() {}

// Function to handle tab switching.
function openTab(event, name) {
  console.log(name);
  // Set the contract call name to the selected tab name.
  contractCall = name;
  // Get the selected tab using the provided name.
  getSelectedTab(name);
  // Load initial data for the selected tab.
  loadInitialData(name);
}

// Function to load initial data for the given class (e.g., "sevenDays").
async function loadInitialData(sClass) {
  console.log(sClass);

  try {
    // Clear any existing global countdown interval.
    clearInterval(countDownGlobal);

    // Create a contract object using the provided class and network ID.
    let cObj = new web3Main.eth.Contract(
      SELECT_CONTRACT[_NETWORK_ID].STAKING.abi,
      SELECT_CONTRACT[_NETWORK_ID].STAKING[sClass].address
    );

    // Get total number of users.
    let totalUsers = await cObj.methods.getTotalUsers().call();

    // Get current APY (Annual Percentage Yield).
    let cApy = await cObj.methods.getAPY().call();

    // Get detailed information about the user from the contract.
    let userDetail = await cObj.methods.getUser(currentAddress).call();

    // Create a user object with relevant user details.
    const user = {
      lastRewardCalculationTime: userDetail.lastRewardCalculationsTime,
      lastStakeTime: userDetail.lastStakeTime,
      rewardAmount: userDetail.rewardAmount,
      rewardsClaimed: userDetail.rewardsClaimed,
      stakeAmount: userDetail.stakeAmount,
      address: currentAddress,
    };

    // Store the user object in local storage for future reference.
    localStorage.setItem("User", JSON.stringify(user));

    // Convert user's stake amount to a human-readable balance with decimals.
    let userDetailBal = userDetail.stakeAmount / 10 ** 18;

    // Update the total-locked-user-token element with the user's stake balance.
    document.getElementById(
      "total-locked-user-token"
    ).innerHTML = `${userDetailBal}`;

    // Update the num-of-stackers-value element with the total number of users.
    document.getElementById("num-of-stakers-value").innerHTML = `${totalUsers}`;
    // Update the apy-value-feature element with the current APY.
    document.getElementById("apy-value-feature").innerHTML = `${cApy} %`;

    // CLASS ELEMENT DATA

    // Get the total locked tokens in the class.
    let totalLockedTokens = await cObj.methods.getTotalStakedTokens().call();
    // Get the early unstake fee percentage.
    let earlyUnstakeFee = await cObj.methods
      .getEarlyUnstakeFeePercentage()
      .call();

    // ELEMENTS — CLASS

    // Update the total locked tokens element.
    document.getElementById("total-locked-tokens-value").innerHTML = `${
      totalLockedTokens / 10 ** 18
    } ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol}`;

    // Update the early unstake fee elements.
    document
      .querySelectorAll(".early-unstake-fee-value")
      .forEach(function (element) {
        element.innerHTML = `${earlyUnstakeFee / 100}%`;
      });

    // Get the minimum staking amount.
    let minStakeAmount = await cObj.methods.getMinimumStakingAmount().call();
    minStakeAmount = Number(minStakeAmount);
    let minA;

    // Convert the minimum staking amount to a human-readable format.
    if (minStakeAmount) {
      minA = `${(minStakeAmount / 10 ** 18).toLocaleString()} ${
        SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol
      }`;
    } else {
      minA = "N/A";
    }

    // Update the minimum staking amount elements.
    document
      .querySelectorAll(".Minimum-Staking-Amount")
      .forEach(function (element) {
        element.innerHTML = `${minA}`;
      });

    // Update the maximum staking amount elements.
    document
      .querySelectorAll(".Maximum-Staking-Amount")
      .forEach(function (element) {
        element.innerHTML = `${(5000000).toLocaleString()} ${
          SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol
        }`;
      });

    // Get the staking status (paused, locked, active, or ended).
    let isStakingPaused = await cObj.methods.getStakingStatus().call();
    let isStakingPausedText;

    // Get the start and end date of staking.
    let startDate = await cObj.methods.getStakeStartDate().call();
    startDate = Number(startDate) * 1000;

    let endDate = await cObj.methods.getStakeEndDate().call();
    endDate = Number(endDate) * 1000;

    // Calculate the number of stake days.
    let stakeDays = await cObj.methods.getStakeDays().call();
    let days = Math.floor(Number(stakeDays) / (3600 * 24));

    // Create a human-readable string for the stake duration.
    let dayDisplay = days > 0 ? days + (days == 1 ? " day, " : " days, ") : "";

    // Update the lock period value elements.
    document.querySelectorAll(".Lock-period-value").forEach(function (element) {
      element.innerHTML = `${dayDisplay}`;
    });

    // Get the estimated reward balance for the user.
    let rewardBal = await cObj.methods
      .getUserEstimateRewards()
      .call({ from: currentAddress });

    // Update the user reward balance element.
    document.getElementById("user-reward-balance-value").value = `Reward: ${
      rewardBal / 10 ** 18
    } ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol}`;

    // USER TOKEN BALANCE
    let balMainUser = currentAddress
      ? await oContractToken.methods.balanceOf(currentAddress).call()
      : "";
    balMainUser = Number(balMainUser) / 10 ** 18;

    // Update the user token balance element.
    document.getElementById(
      "user-token-balance"
    ).innerHTML = `Balance: ${balMainUser}`;

    // Get the current date and time.
    let currentDate = new Date().getTime();

    if (isStakingPaused) {
      isStakingPausedText = "Paused";
    } else if (currentDate < startDate) {
      isStakingPausedText = "Locked";
    } else if (currentDate > endDate) {
      isStakingPausedText = "Ended";
    } else {
      isStakingPausedText = "Active";
    }

    // Update the active status stacking elements.
    document
      .querySelectorAll(".active-status-stacking")
      .forEach(function (element) {
        element.innerHTML = `${isStakingPausedText}`;
      });

    // Check if the current date is within the staking period and display countdown if true.
    if (currentDate > startDate && currentDate < endDate) {
      const ele = document.getElementById("countdown-time-value");
      generateCountDown(ele, endDate);

      document.getElementById(
        "countdown-title-value"
      ).innerHTML = `Staking Ends In`;
    }

    if (currentDate < startDate) {
      const ele = document.getElementById("countdown-time-value");
      generateCountDown(ele, endDate);

      document.getElementById(
        "countdown-title-value"
      ).innerHTML = `Staking Starts In`;
    }

    // Update the APY value elements.
    document.querySelectorAll(".apy-value").forEach(function (element) {
      element.innerHTML = `${cApy} %`;
    });
  } catch (error) {
    console.log(error);
    notyf.error(
      `Unable to fetch data from ${SELECT_CONTRACT[_NETWORK_ID].network_name}!\n Please refresh this page.`
    );
  }
}

function generateCountDown(ele, claimDate) {
  clearInterval(countDownGlobal);

  // Set the date we're counting down to
  var countDownDate = new Date(claimDate).getTime();

  // Update the count down every 1 second
  countDownGlobal = setInterval(function () {
    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = countDownDate - now;

    // Time calculations for days, hours, minutes, and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="demo"
    ele.innerHTML =
      days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

    // If the count down is finished, write some text
    if (distance < 0) {
      clearInterval(countDownGlobal);
      ele.innerHTML = "Refresh Page";
    }
  }, 1000);
}

// Function to connect the wallet using the provided provider (_provider).
async function connectMe(_provider) {
  try {
    // Call the ProviderDetector function to check if the provider is available.
    let _comn_res = await providerDetector(_provider);
    console.log(_comn_res);
    if (!_comn_res) {
      // If the provider is not available, log a message asking the user to connect.
      console.log("Please Connect");
    } else {
      // If the provider is available, get the selected tab and log its name.
      let sClass = getSelectedTab();
      console.log(sClass);
    }
  } catch (error) {
    // If an error occurs during the connection process, display the error message using Notyf.
    notyf.error(error.message);
  }
}

// Function to stack tokens.
async function stackTokens() {
  try {
    // Get the number of tokens to stack from the input field.
    let nTokens = document.getElementById("amount-to-stack-value-new").value;

    // Check if the input field is empty, and if so, return from the function.
    if (!nTokens) {
      return;
    }

    // Check if the input is not a valid number or if it is zero or negative, and if so, return from the function.
    if (isNaN(nTokens) || nTokens == 0 || Number(nTokens) < 0) {
      console.log(`Invalid token amount!`);
      return;
    }

    // Convert the number of tokens to a numeric value.
    nTokens = Number(nTokens);

    // Convert the number of tokens to the token's decimal value (assuming 18 decimals).
    let tokenToTransfer = addDecimal(nTokens, 18);

    console.log("tokenToTransfer", tokenToTransfer);

    // Get the user's token balance and convert it to a human-readable value.
    let balMainUser = await oContractToken.methods
      .balanceOf(currentAddress)
      .call();
    balMainUser = Number(balMainUser) / 10 ** 18;

    console.log("balMainUser", balMainUser);

    // Check if the user has enough tokens to perform the stacking, and if not, display an error message.
    if (balMainUser < nTokens) {
      notyf.error(
        `Insufficient tokens on ${SELECT_CONTRACT[_NETWORK_ID].network_name}.\nPlease buy some tokens first!`
      );
      return;
    }

    // Get the selected tab (contract call) and log its name.
    let sClass = getSelectedTab(contractCall);
    console.log(sClass);

    // Get the user's token allowance for the stacking contract and convert it to a numeric value.
    let balMainAllowance = await oContractToken.methods
      .allowance(
        currentAddress,
        SELECT_CONTRACT[_NETWORK_ID].STAKING[sClass].address
      )
      .call();

    // Check if the user's token allowance is less than the amount to transfer.
    if (Number(balMainAllowance) < Number(tokenToTransfer)) {
      // If so, call the approveTokenSpend function to approve the token spend for staking.
      approveTokenSpend(tokenToTransfer, sClass);
    } else {
      // If the allowance is sufficient, call the stakeTokenMain function to perform the token staking.
      stackTokenMain(tokenToTransfer, sClass);
    }
  } catch (error) {
    // If an error occurs during the stacking process, log the error and display it using Notyf.
    console.log(error);
    notyf.dismiss(notification);
    notyf.error(formatEthErrorMsg(error));
  }
}

// Asynchronous function to approve token spend
async function approveTokenSpend(_mint_fee_wei, sClass) {
  let gasEstimation;

  try {
    // Estimate the gas required for the token approval
    gasEstimation = await oContractToken.methods
      .approve(
        SELECT_CONTRACT[_NETWORK_ID].STAKING[sClass].address,
        _mint_fee_wei
      )
      .estimateGas({
        from: currentAddress,
      });
  } catch (error) {
    // Handle errors during gas estimation
    console.log(error);
    notyf.error(formatEthErrorMsg(error));
    return;
  }

  try {
    // Perform the token approval and transfer
    await oContractToken.methods
      .approve(
        SELECT_CONTRACT[_NETWORK_ID].STAKING[sClass].address,
        _mint_fee_wei
      )
      .send({
        from: currentAddress,
        gas: gasEstimation,
      })
      .on("transactionHash", (hash) => {
        // Handle transaction hash event
        console.log("Transaction Hash: ", hash);
      })
      .on("receipt", (receipt) => {
        // Handle transaction receipt event
        console.log(receipt);
        // Perform the main token staking operation
        stackTokenMain(_mint_fee_wei);
      });
  } catch (error) {
    // Handle errors during token approval and transfer
    console.log(error);
    notyf.error(formatEthErrorMsg(error));
    return;
  }
}

async function stackTokenMain(_amount_wei, sClass) {
  let gasEstimation;

  // Get the contract object for the given sClass
  let oContractStacking = getContractObj(sClass);

  try {
    // Estimate the gas required for the token stacking
    gasEstimation = await oContractStacking.methods
      .stake(_amount_wei)
      .estimateGas({
        from: currentAddress,
      });
  } catch (error) {
    // Handle errors during gas estimation
    console.log(error);
    notyf.error(formatEthErrorMsg(error));
    return;
  }

  oContractStacking.methods
    .stake(_amount_wei)
    .send({
      from: currentAddress,
      gas: gasEstimation,
    })
    .on("receipt", (receipt) => {
      // Handle receipt event after the token stacking transaction is confirmed
      console.log(receipt);

      // Create an object to store relevant transaction details
      const receiptObj = {
        token: _amount_wei,
        from: receipt.from,
        to: receipt.to,
        blockHash: receipt.blockHash,
        blockNumber: receipt.blockNumber,
        cumulativeGasUsed: receipt.cumulativeGasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
        gasUsed: receipt.gasUsed,
        status: receipt.status,
        transactionHash: receipt.transactionHash,
        type: receipt.type,
      };

      let transactionHistory = [];

      // Get all previous user transactions from local storage
      const allUserTransaction = localStorage.getItem("transactions");
      if (allUserTransaction) {
        transactionHistory = JSON.parse(localStorage.getItem("transactions"));
        transactionHistory.push(receiptObj);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionHistory)
        );
      } else {
        // If no previous transactions, create a new history array
        transactionHistory.push(receiptObj);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionHistory)
        );
      }

      console.log(allUserTransaction);

      // // Redirect to the analytic.html page after the transaction is confirmed
      // window.location.href =
      //   "";
    })
    .on("transactionHash", (hash) => {
      // Handle transaction hash event
      console.log("Transaction Hash: ", hash);
    })
    .catch((error) => {
      // Handle errors during token stacking transaction
      console.log(error);
      notyf.error(formatEthErrorMsg(error));
      return;
    });
}
// Function to handle the user's request to unstack tokens
async function unstackTokens() {
  try {
    // Get the number of tokens to unstack from the input field
    let nTokens = document.getElementById("amount-to-unstack-value").value;

    if (!nTokens) {
      return; // Return early if the input field is empty
    }

    // Validate the input: Ensure it is a valid positive number
    if (isNaN(nTokens) || nTokens == 0 || Number(nTokens) < 0) {
      notyf.error(`Invalid token amount!`);
      return;
    }

    nTokens = Number(nTokens); // Convert the token amount to a number

    // Add decimal places to the token amount to match contract decimals (18 in this case)
    let tokenToTransfer = addDecimal(nTokens, 18);

    // Get the selected tab and the corresponding contract object
    let sClass = getSelectedTab(contractCall);
    let oContractStacking = getContractObj(sClass);

    // Get the user's balance of staked tokens
    let balMainUser = await oContractStacking.methods
      .getUser(currentAddress)
      .call();

    balMainUser = Number(balMainUser.stakeAmount) / 10 ** 18; // Convert balance to number

    // Check if the user has enough staked tokens to unstack
    if (balMainUser < nTokens) {
      notyf.error(
        `Insufficient staked tokens on ${SELECT_CONTRACT[_NETWORK_ID].network_name}!`
      );
      return;
    }

    // Call the main function to unstack the tokens
    unstackTokenMain(tokenToTransfer, oContractStacking, sClass);
  } catch (error) {
    console.log(error);
    notyf.dismiss(notification);
    notyf.error(formatEthErrorMsg(error));
  }
}

// Main function to unstack tokens
async function unstackTokenMain(_amount_wei, oContractStacking, sClass) {
  let gasEstimation;

  try {
    // Estimate the gas required for the token unstacking
    gasEstimation = await oContractStacking.methods
      .unstake(_amount_wei)
      .estimateGas({
        from: currentAddress,
      });
  } catch (error) {
    console.log(error);
    notyf.error(formatEthErrorMsg(error));
    return;
  }

  oContractStacking.methods
    .unstake(_amount_wei)
    .send({
      from: currentAddress,
      gas: gasEstimation,
    })
    .on("receipt", (receipt) => {
      // Handle receipt event after the token unstacking transaction is confirmed
      console.log(receipt);

      // Create an object to store relevant transaction details
      const receiptObj = {
        token: _amount_wei,
        from: receipt.from,
        to: receipt.to,
        blockHash: receipt.blockHash,
        blockNumber: receipt.blockNumber,
        cumulativeGasUsed: receipt.cumulativeGasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
        gasUsed: receipt.gasUsed,
        status: receipt.status,
        transactionHash: receipt.transactionHash,
        type: receipt.type,
      };

      let transactionHistory = [];

      // Get all previous user transactions from local storage
      const allUserTransaction = localStorage.getItem("transactions");
      if (allUserTransaction) {
        // Append the new receipt object to the transaction history
        transactionHistory = JSON.parse(localStorage.getItem("transactions"));
        transactionHistory.push(receiptObj);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionHistory)
        );
      } else {
        // If no previous transactions, create a new history array with the current receipt
        transactionHistory.push(receiptObj);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionHistory)
        );
      }

      //   // Redirect to the analytic.html page after the transaction is confirmed
      //   window.location.href = "http://127.0.0.1:5500/analytic.html";
      //
    })
    .on("transactionHash", (hash) => {
      // Handle transaction hash event
      console.log("Transaction Hash: ", hash);
    })
    .catch((error) => {
      // Handle errors during token unstacking transaction
      console.log(error);
      notyf.error(formatEthErrorMsg(error));
      return;
    });
}

// Function to handle the user's request to claim tokens
async function claimTokens() {
  try {
    // Get the selected class (tab) and the corresponding contract object
    let sClass = getSelectedTab(contractCall);
    let oContractStacking = getContractObj(sClass);

    // Get the user's estimated reward balance
    let rewardBal = await oContractStacking.methods
      .getUserEstimateRewards()
      .call({ from: currentAddress });

    rewardBal = Number(rewardBal); // Convert the reward balance to a number

    console.log("rewardBal", rewardBal);

    // Check if the user has any reward tokens to claim
    if (!rewardBal) {
      notyf.dismiss(notification);
      notyf.error(`Insufficient reward tokens to claim!`);
      return;
    }

    // Call the main function to claim the reward tokens
    claimTokenMain(oContractStacking, sClass);
  } catch (error) {
    console.log(error);
    notyf.dismiss(notification);
    notyf.error(formatEthErrorMsg(error));
  }
}

// Main function to claim reward tokens
async function claimTokenMain(oContractStacking, sClass) {
  try {
    // Call the contract function to claim the reward tokens
    await oContractStacking.methods
      .claimRewards()
      .send({
        from: currentAddress,
      })
      .on("receipt", (receipt) => {
        // Handle receipt event after the claim transaction is confirmed
        console.log(receipt);
        // Additional handling can be done here, if needed
      })
      .on("transactionHash", (hash) => {
        // Handle transaction hash event
        console.log("Transaction Hash: ", hash);
      })
      .catch((error) => {
        // Handle errors during the claim transaction
        console.log(error);
        notyf.error(formatEthErrorMsg(error));
        return;
      });
  } catch (error) {
    console.log(error);
    notyf.dismiss(notification);
    notyf.error(formatEthErrorMsg(error));
  }
}

// Main function to claim reward tokens
async function claimTokenMain(oContractStacking, sClass) {
  let gasEstimation;

  try {
    // Estimate the gas required for the token claimReward method
    gasEstimation = await oContractStacking.methods.claimReward().estimateGas({
      from: currentAddress,
    });
    console.log("gasEstimation", gasEstimation);
  } catch (error) {
    console.log(error);
    notyf.error(formatEthErrorMsg(error));
    return;
  }

  oContractStacking.methods
    .claimReward()
    .send({
      from: currentAddress,
      gas: gasEstimation,
    })
    .on("receipt", (receipt) => {
      // Handle receipt event after the claim transaction is confirmed
      console.log(receipt);

      // Create an object to store relevant transaction details
      const receiptObj = {
        from: receipt.from,
        to: receipt.to,
        blockHash: receipt.blockHash,
        blockNumber: receipt.blockNumber,
        cumulativeGasUsed: receipt.cumulativeGasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
        gasUsed: receipt.gasUsed,
        status: receipt.status,
        transactionHash: receipt.transactionHash,
        type: receipt.type,
      };

      let transactionHistory = [];

      // Get all previous user transactions from local storage
      const allUserTransaction = localStorage.getItem("transactions");
      if (allUserTransaction) {
        // Append the new receipt object to the transaction history
        transactionHistory = JSON.parse(localStorage.getItem("transactions"));
        transactionHistory.push(receiptObj);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionHistory)
        );
      } else {
        // If no previous transactions, create a new history array with the current receipt
        transactionHistory.push(receiptObj);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionHistory)
        );
      }

      // // Redirect to the analytic.html page after the transaction is confirmed
      // window.location.href = "";
    })
    .on("transactionHash", (hash) => {
      // Handle transaction hash event
      console.log("Transaction Hash: ", hash);
    })
    .catch((error) => {
      // Handle errors during the claim transaction
      console.log(error);
      notyf.error(formatEthErrorMsg(error));
      return;
    });
}
