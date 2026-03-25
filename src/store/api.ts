import Axios from "axios"


export const axios = Axios.create({
    baseURL : import.meta.env.VITE_BASE_URL,
    headers : {
      "db" : "klt_db",
      "appkey" : "649d98ed",
      "appsecret" : "0b8301b0",
      "token" : "7cec2ac0-0e06-4c1d-94b6-37b03f5e0971"
    }
})


axios.interceptors.request.use(
  (config) => { 
    const authToken = localStorage.getItem("token");
    if (authToken && !config.headers.token) {
      config.headers.token = "7cec2ac0-0e06-4c1d-94b6-37b03f5e0971";
    }
    return config;
  },
  (error) => Promise.reject(error),
);