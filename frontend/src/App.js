import React, { useState, useEffect } from 'react';
import web3 from './web3';
import crowdfunding from './Crowdfunding';

function App() {
  const [account, setAccount] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const loadAccount = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    };

    const loadCampaigns = async () => {
      const campaignCount = await crowdfunding.methods.campaignCount().call();
      const loadedCampaigns = [];
      for (let i = 1; i <= campaignCount; i++) {
        const campaign = await crowdfunding.methods.campaigns(i).call();
        loadedCampaigns.push(campaign);
      }
      setCampaigns(loadedCampaigns);
    };

    loadAccount();
    loadCampaigns();
  }, []);

  const createCampaign = async () => {
    await crowdfunding.methods.createCampaign(goal, duration).send({ from: account });
    window.location.reload();
  };

  const pledge = async (id) => {
    await crowdfunding.methods.pledge(id).send({ from: account, value: web3.utils.toWei(amount, 'ether') });
    window.location.reload();
  };

  return (
      <div>
        <h1>Crowdfunding DApp</h1>
        <p>Account: {account}</p>

        <h2>Create Campaign</h2>
        <input
            type="text"
            placeholder="Goal in wei"
            value={goal}
            onChange={e => setGoal(e.target.value)}
        />
        <input
            type="text"
            placeholder="Duration in seconds"
            value={duration}
            onChange={e => setDuration(e.target.value)}
        />
        <button onClick={createCampaign}>Create</button>

        <h2>Available Campaigns</h2>
        {campaigns.map((campaign, index) => (
            <div key={index}>
              <p>Campaign ID: {index + 1}</p>
              <p>Creator: {campaign.creator}</p>
              <p>Goal: {campaign.goal}</p>
              <p>Pledged: {campaign.pledged}</p>
              <p>Deadline: {new Date(campaign.deadline * 1000).toLocaleString()}</p>
              <button onClick={() => pledge(index + 1)}>Pledge</button>
              <input
                  type="text"
                  placeholder="Amount in ether"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
              />
            </div>
        ))}
      </div>
  );
}

export default App;
