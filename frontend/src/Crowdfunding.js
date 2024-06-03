import web3 from './web3';
import Crowdfunding from './contracts/Crowdfunding.json';

const address = '0x96D579149Fa6376880F6EC0f41dC2E3Cb64c9524'; // замените на ваш адрес контракта
const instance = new web3.eth.Contract(Crowdfunding.abi, address);

export default instance;
