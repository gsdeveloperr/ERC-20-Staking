// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

//IMPORTING CONTRACTS
import "./Ownable.sol";
import "./ReentrancyGuard.sol";
import "./Initializable.sol";
import "./IERC20.sol";

// Token Staking Contract
contract TokenStaking is Ownable, ReentrancyGuard, Initializable {

    // Struct to store the User's Details
    struct User {
        uint256 stakeAmount; // Stake Amount
        uint256 rewardAmount; // Reward amount
        uint256 lastStakeTime; // Last Stake Timestamp
        uint256 lastRewardCalculationTime; // Last Reward Calculation Timestamp
        uint256 rewardsClaimedSoFar; // Sum of rewards claimed at current momemnt for a user
    }

    // Contract state variables
    uint256 _minimumStakingAmount; // Minimum staking amount
    uint256 _maxStakeTokenLimit; // Maximum staking token limit for the program
    uint256 _stakeEndDate; // End date for the program
    uint256 _stakeStartDate; // Start date for the program
    uint256 _totalStakedTokens; // Total number of tokens that are staked
    uint256 _totalUsers; // Total number of users
    uint256 _stakeDays; // Staking days
    uint256 _earlyUnstakeFeePercentage; // Early unstake fee percentage

    bool _isStakingPaused; // Staking status

    // Token Contract address
    address private _tokenAddress;

    // APY (Annual Percentage Yield)
    uint256 _apyRate;          //100*(10/100),       intitial investment * (APY/100) 

    // Constants
    uint256 public constant PERCENTAGE_DENOMINATOR = 10000; // Used for percentage calculations
    uint256 public constant APY_RATE_CHANGE_THRESHOLD = 10; // Threshold to trigger changes in APY

    // Mapping to store User details by their address
    mapping(address => User) private _users;

    // Events to notify external parties about significant activities
    event Stake(address indexed user, uint256 amount);
    event UnStake(address indexed user, uint256 amount);
    event EarlyUnStakeFee(address indexed user, uint256 amount);
    event ClaimReward(address indexed user, uint256 amount);

    // Modifier to check if the contract has sufficient tokens in the treasury
    modifier whenTreasuryHasBalance(uint256 amount) {
        require(
            IERC20(_tokenAddress).balanceOf(address(this)) >= amount,
            "TokenStaking: insufficient funds in the treasury"
        );
        _;
    }

    // Initialization function for the contract
    function initialize(
        address owner_,
        address tokenAddress_,
        uint256 apyRate_,
        uint256 minimumStakingAmount_,
        uint256 maxStakeTokenLimit_,
        uint256 stakeStartDate_,
        uint256 stakeEndDate_,
        uint256 stakeDays_,
        uint256 earlyUnstakeFeePercentage_
    ) public virtual initializer {
        // Call the parent contract's initializer to set the contract owner
        __TokenStaking_init_unchained(
            owner_,
            tokenAddress_,
            apyRate_,
            minimumStakingAmount_,
            maxStakeTokenLimit_,
            stakeStartDate_,
            stakeEndDate_,
            stakeDays_, 
            earlyUnstakeFeePercentage_
        );
    }

function __TokenStaking_init_unchained(
    address owner_,
    address tokenAddress_,
    uint256 apyRate_,
    uint256 minimumStakingAmount_,
    uint256 maxStakeTokenLimit_,
    uint256 stakeStartDate_,
    uint256 stakeEndDate_,
    uint256 stakeDays_,
    uint256 earlyUnstakeFeePercentage_
) internal onlyInitializing {
    // Check if the APY rate is less than or equal to 10000 (100%)
    require(apyRate_ <= 10000, "TokenStaking: apy rate should be less than or equal to 10000");

    // Check if the stake days must be non-zero
    require(stakeDays_ > 0, "TokenStaking: stake days must be greater than zero");

    // Check if the token address is not the zero address
    require(tokenAddress_ != address(0), "TokenStaking: token address cannot be the zero address");

    // Check if the stake start date is less than the stake end date
    require(stakeStartDate_ < stakeEndDate_, "TokenStaking: start date must be less than end date");

    // Transfer ownership to the provided owner address
    _transferOwnership(owner_);

    // Set contract state variables with the provided values
    _tokenAddress = tokenAddress_;
    _apyRate = apyRate_;
    _minimumStakingAmount = minimumStakingAmount_;
    _maxStakeTokenLimit = maxStakeTokenLimit_;
    _stakeStartDate = stakeStartDate_;
    _stakeEndDate = stakeEndDate_;
    _stakeDays = stakeDays_ * 1 days; // Convert stakeDays_ to seconds
    _earlyUnstakeFeePercentage = earlyUnstakeFeePercentage_;
}

// Notice: This function is used to get the minimum staking amount
function getMinimumStakingAmount() external view returns (uint256) {
    return _minimumStakingAmount;
}

// Notice: This function is used to get the maximum staking token limit for the program
function getMaxStakingTokenLimit() external view returns (uint256) {
    return _maxStakeTokenLimit;
}

// Notice: This function is used to get the staking start date for the program
function getStakeStartDate() external view returns (uint256) {
    return _stakeStartDate;
}

// Notice: This function is used to get the staking end date for the program
function getStakeEndDate() external view returns (uint256) {
    return _stakeEndDate;
}

// Notice: This function is used to get the total staked tokens
function getTotalStakedTokens() external view returns (uint256) {
    return _totalStakedTokens;
}

function getTotalUsers() external view returns(uint256) {
    return _totalUsers;
}

// Notice: This function is used to get the staking days
function getStakeDays() external view returns (uint256) {
    return _stakeDays;
}

// Notice: This function is used to get the early unstake fee percentage
function getEarlyUnstakeFeePercentage() external view returns (uint256) {
    return _earlyUnstakeFeePercentage;
}

// Notice: This function is used to get the staking status
function getStakingStatus() external view returns (bool) {
    return _isStakingPaused;
}

// Notice: This function is used to get the Annual Percentage Yield (APY)
function getAPY() external view returns (uint256) {
    return _apyRate;
}

// Notice: This function is used to get the estimated rewards for the user
function getUserEstimateRewards() external view returns (uint256) {
    (uint256 amount, ) = _getUserEstimatedRewards(msg.sender);
    return _users[msg.sender].rewardAmount + amount;
}



// Notice: This function is used to get the withdrawable amount from the contract
function getWithdrawableAmount() external view returns (uint256) {
    return IERC20(_tokenAddress).balanceOf(address(this)) - _totalStakedTokens;
}

// Notice: This function is used to get User's details
// param userAddress: User's address to get details of
// return: User Struct
function getUser(address userAddress) external view returns (User memory) {
    return _users[userAddress];
}

// Notice: This function is used to check if a user is a stakeholder
// param _user: Address of the user to check
// return: True if the user is a stakeholder, false otherwise
function isStakeHolder(address _user) external view returns (bool) {
    return _users[_user].stakeAmount != 0;
}

/* View Methods End */

/* Owner Methods Start */

// Notice: This function is used to update the minimum staking amount
function updateMinimumStakingAmount(uint256 newAmount) external onlyOwner {
    _minimumStakingAmount = newAmount;
}

// Notice: This function is used to update the maximum staking amount
function updateMaximumStakingAmount(uint256 newAmount) external onlyOwner {
    _maxStakeTokenLimit = newAmount;
}

// Notice: This function is used to update the staking end date
function updateStakingEndDate(uint256 newDate) external onlyOwner {
    _stakeEndDate = newDate;
}

// Notice: This function is used to update the early unstake fee percentage
function updateEarlyUnstakeFeePercentage(uint256 newPercentage) external onlyOwner {
    _earlyUnstakeFeePercentage = newPercentage;
}

// Notice: Stake tokens for a specific user
// Dev: This function can be used to stake tokens for a specific user
function stakeForUser(uint256 amount, address user) external onlyOwner nonReentrant {
    _stakeTokens(amount, user);
}


// * @notice enable/disable staking
// * @dev This function can be used to toggle staking status
function toggleStakingStatus() external onlyOwner {
    _isStakingPaused = !_isStakingPaused;
}

// Notice: Withdraw the specified amount if possible
// Dev: This function can be used to withdraw the available tokens
// with this contract to the caller
// @param amount: The amount to withdraw
function withdraw(uint256 amount) external onlyOwner nonReentrant {
    require(this.getWithdrawableAmount() >= amount, "TokenStaking: not enough withdrawable tokens");
    IERC20(_tokenAddress).transfer(msg.sender, amount);
}
/* owner methods End */

/* user methods */




// * @notice This function is used to stake tokens
// * @param _amount: Amount of tokens to be staked
function stake(uint256 _amount) external nonReentrant {
    _stakeTokens(_amount, msg.sender);
}

// * @dev Internal function to stake tokens for a user
// * @param _amount: Amount of tokens to be staked
// * @param user_: Address of the user staking the tokens
function _stakeTokens(uint256 _amount, address user_) private {
    require(!_isStakingPaused, "TokenStaking: staking is paused");

    uint256 currentTime = getCurrentTime();
    require(currentTime > _stakeStartDate, "TokenStaking: staking not started yet");
    require(currentTime < _stakeEndDate, "TokenStaking: staking ended");
    require(_totalStakedTokens + _amount <= _maxStakeTokenLimit, "TokenStaking: max staking token limit reached");

    require(_amount > 0, "TokenStaking: stake amount must be non-zero");
    require(_amount >= _minimumStakingAmount, "TokenStaking: stake amount must be greater than minimum amount allowed");

    // Calculate rewards if the user is already a stakeholder, otherwise add them as a new user
    if (_users[user_].stakeAmount != 0) {
        _calculateRewards(user_);
    } else {
        _users[user_].lastRewardCalculationTime = currentTime;
        _totalUsers += 1;
    }

    // Update user's stake amount and last stake time
    _users[user_].stakeAmount += _amount;
    _users[user_].lastStakeTime = currentTime;

    // Update total staked tokens
    _totalStakedTokens += _amount;

    // Transfer tokens from the user to the contract
    require(
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount),
        "TokenStaking: failed to transfer tokens"
    );
    emit Stake(user_, _amount);


}


 



// * @notice This function is used to unstake tokens

// * @param _amount Amount of tokens to be unstaked

// Notice: This function is used to unstake tokens
// @param _amount: Amount of tokens to be unstaked
function unstake(uint256 _amount) external nonReentrant whenTreasuryHasBalance(_amount) {
    address user = msg.sender;

    require(_amount != 0, "TokenStaking: amount should be non-zero");
    require(this.isStakeHolder(user), "TokenStaking: not a stakeholder");
    require(_users[user].stakeAmount >= _amount, "TokenStaking: not enough stake to unstake");

    // Calculate User's rewards until now
    _calculateRewards(user);

    uint256 feeEarlyUnstake;

    if (getCurrentTime() <= _users[user].lastStakeTime + _stakeDays) {
        feeEarlyUnstake = ((_amount * _earlyUnstakeFeePercentage) / PERCENTAGE_DENOMINATOR);
        emit EarlyUnStakeFee(user, feeEarlyUnstake);
    }

    uint256 amountToUnstake = _amount - feeEarlyUnstake;
    _users[user].stakeAmount -= _amount;
    _totalStakedTokens -= _amount;

    if (_users[user].stakeAmount == 0) {
        // delete _users[user];
        _totalUsers -= 1;
    }

    require(IERC20(_tokenAddress).transfer(user, amountToUnstake), "TokenStaking: failed to transfer");
    emit UnStake(user, _amount);
}





// Notice: This function is used to claim the rewards
function claimReward() external nonReentrant whenTreasuryHasBalance(_users[msg.sender].rewardAmount) {
    // Calculate and update the user's rewards until now
    _calculateRewards(msg.sender);

    // Get the amount of rewards the user is eligible to claim
    uint256 rewardAmount = _users[msg.sender].rewardAmount;

    // Ensure that there are rewards to claim
    require(rewardAmount > 0, "TokenStaking: no reward to claim");

    // Transfer the rewards to the user
    require(IERC20(_tokenAddress).transfer(msg.sender, rewardAmount), "TokenStaking: failed to transfer");

    // Reset the user's reward amount since they have claimed their rewards
    _users[msg.sender].rewardAmount = 0;

    // Increment the total rewards claimed by the user
    _users[msg.sender].rewardsClaimedSoFar += rewardAmount;

    // Emit an event to notify external listeners about the successful claim and the amount of rewards claimed
    emit ClaimReward(msg.sender, rewardAmount);
}

/* User Methods End */


// Notice: This function is used to calculate rewards for a user
// @param _user: Address of the user
function _calculateRewards(address _user) private {
    (uint256 userReward, uint256 currentTime) = _getUserEstimatedRewards(_user);

    _users[_user].rewardAmount += userReward;
    _users[_user].lastRewardCalculationTime = currentTime;
}

// Notice: This function is used to get estimated rewards for a user
// @param _user: Address of the user
// @return Estimated rewards for the user
function _getUserEstimatedRewards(address _user) private view returns (uint256, uint256) {
    uint256 userReward;
    uint256 userTimestamp = _users[_user].lastRewardCalculationTime;

    uint256 currentTime = getCurrentTime();

    if (currentTime > _users[_user].lastStakeTime + _stakeDays) {
        currentTime = _users[_user].lastStakeTime + _stakeDays;
    }

    uint256 totalStakedTime = currentTime - userTimestamp;

    userReward += ((totalStakedTime * _users[_user].stakeAmount * _apyRate) / 365 days) / PERCENTAGE_DENOMINATOR;

    return (userReward, currentTime);
}

function getCurrentTime() internal view virtual returns (uint256) {
    return block.timestamp;
}

}