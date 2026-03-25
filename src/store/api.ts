import Axios from "axios"


export const axios = Axios.create({
    baseURL : import.meta.env.VITE_BASE_URL,
    headers : {
      "db" : "klt_db",
      "appkey" : "649d98ed",
      "appsecret" : "0b8301b0",
      "token" : "98d72a42-80d4-4343-99bf-c126d848f050"
    }
})


axios.interceptors.request.use(
  (config) => { 
    const authToken = localStorage.getItem("token");
    if (authToken && !config.headers.token) {
      config.headers.token = "98d72a42-80d4-4343-99bf-c126d848f050";
    }
    return config;
  },
  (error) => Promise.reject(error),
);