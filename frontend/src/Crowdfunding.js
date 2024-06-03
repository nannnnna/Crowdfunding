import web3 from './web3';
import Crowdfunding from './contracts/Crowdfunding.json';

const address = '0x297C798dD608c1E51173896d9258C98177a03Ef7'; // замените на ваш адрес контракта
const instance = new web3.eth.Contract(Crowdfunding.abi, address);

export default instance;
