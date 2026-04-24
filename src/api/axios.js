import axios from 'axios';


const API_BASE_URL = 'http://localhost:5006';


//A3 (Public API Instance: Client-side logic-in vendi baseURL and common headers set cheytha Axios instance)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json', // [Manglish] Server-ku parayunnu "Njan JSON formatil data ayahckam" ennu.
  },
});

export default api;
