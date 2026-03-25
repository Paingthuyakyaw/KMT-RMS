import Axios from "axios"


export const axios = Axios.create({
    baseURL : import.meta.env.VITE_BASE_URL,
    headers : {
      "db" : "klt_db",
      "appkey" : "649d98ed",
      "appsecret" : "0b8301b0",
      "token" : "4ff4a38c-dd58-4ef5-b7b5-984d14115511"
    }
})


axios.interceptors.request.use(
  (config) => { 
    const authToken = localStorage.getItem("token");
    if (authToken && !config.headers.token) {
      config.headers.token = "4ff4a38c-dd58-4ef5-b7b5-984d14115511";
    }
    return config;
  },
  (error) => Promise.reject(error),
);