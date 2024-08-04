import Axios from 'axios';

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
    'content-type': 'application/x-www-form-urlencoded\n',
  },
  withCredentials: true,
  withXSRFToken: true,
});

export default axios;
