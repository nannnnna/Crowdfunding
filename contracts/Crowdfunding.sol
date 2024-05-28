// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
    struct Campaign {
        address payable creator;
        uint256 goal;
        uint256 pledged;
        uint256 deadline;
        bool claimed;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public pledges;
    uint256 public campaignCount;

    event CampaignCreated(uint256 id, address creator, uint256 goal, uint256 deadline);
    event Pledged(uint256 indexed id, address indexed user, uint256 amount);
    event Unpledged(uint256 indexed id, address indexed user, uint256 amount);
    event Claimed(uint256 id, address creator, uint256 amount);
    event Refunded(uint256 indexed id, address indexed user, uint256 amount);

    function createCampaign(uint256 _goal, uint256 _duration) external {
        require(_goal > 0, "Goal must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");

        campaignCount++;
        campaigns[campaignCount] = Campaign({
            creator: payable(msg.sender),
            goal: _goal,
            pledged: 0,
            deadline: block.timestamp + _duration,
            claimed: false
        });

        emit CampaignCreated(campaignCount, msg.sender, _goal, block.timestamp + _duration);
    }

    function pledge(uint256 _id) external payable {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp < campaign.deadline, "Campaign is over");
        require(msg.value > 0, "Pledge amount must be greater than 0");

        campaign.pledged += msg.value;
        pledges[_id][msg.sender] += msg.value;

        emit Pledged(_id, msg.sender, msg.value);
    }

    function unpledge(uint256 _id, uint256 _amount) external {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp < campaign.deadline, "Campaign is over");
        require(pledges[_id][msg.sender] >= _amount, "Insufficient pledge amount");

        campaign.pledged -= _amount;
        pledges[_id][msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);

        emit Unpledged(_id, msg.sender, _amount);
    }

    function claimFunds(uint256 _id) external {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp >= campaign.deadline, "Campaign is not over yet");
        require(campaign.pledged >= campaign.goal, "Goal not reached");
        require(!campaign.claimed, "Funds already claimed");
        require(campaign.creator == msg.sender, "Only creator can claim funds");

        campaign.claimed = true;
        campaign.creator.transfer(campaign.pledged);

        emit Claimed(_id, msg.sender, campaign.pledged);
    }

    function refund(uint256 _id) external {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp >= campaign.deadline, "Campaign is not over yet");
        require(campaign.pledged < campaign.goal, "Goal reached, cannot refund");

        uint256 pledgedAmount = pledges[_id][msg.sender];
        require(pledgedAmount > 0, "No funds to refund");

        pledges[_id][msg.sender] = 0;
        payable(msg.sender).transfer(pledgedAmount);

        emit Refunded(_id, msg.sender, pledgedAmount);
    }
}
