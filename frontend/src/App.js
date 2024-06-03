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
            try {
                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);
                console.log("Loaded account:", accounts[0]);
            } catch (error) {
                console.error("Error loading account:", error);
            }
        };

        const loadCampaigns = async () => {
            try {
                const campaignCount = await crowdfunding.methods.campaignCount().call();
                console.log("Campaign count:", campaignCount);
                const loadedCampaigns = [];
                for (let i = 1; i <= campaignCount; i++) {
                    const campaign = await crowdfunding.methods.campaigns(i).call();
                    console.log(`Campaign ${i}:`, campaign);
                    loadedCampaigns.push(campaign);
                }
                setCampaigns(loadedCampaigns);
            } catch (error) {
                console.error("Error loading campaigns:", error);
            }
        };

        loadAccount();
        loadCampaigns();
    }, []);


    const createCampaign = async () => {
        try {
            await crowdfunding.methods.createCampaign(goal, duration).send({
                from: account,
                gas: 3000000, // Лимит газа
                gasPrice: web3.utils.toWei('20', 'gwei') // Укажите цену газа
            });
            window.location.reload();
        } catch (error) {
            console.error("Error creating campaign:", error);
        }
    };


    const pledge = async (id) => {
        try {
            await crowdfunding.methods.pledge(id).send({
                from: account,
                value: web3.utils.toWei(amount, 'ether'),
                gas: 3000000, // Лимит газа
                gasPrice: web3.utils.toWei('20', 'gwei') // Укажите цену газа
            });
            window.location.reload();
        } catch (error) {
            console.error("Error pledging to campaign:", error);
        }
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
