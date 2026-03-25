import Axios from "axios"


export const axios = Axios.create({
    baseURL : import.meta.env.VITE_BASE_URL,
    headers : {
      "db" : "klt_db",
      "appkey" : "649d98ed",
      "appsecret" : "0b8301b0"
    }
})


axios.interceptors.request.use(
  (config) => { 
    const authToken = localStorage.getItem("token");
    if (authToken && !config.headers.token) {
      config.headers.token = "8c56817d-ae26-4fdf-8209-1a8eeaa9aa2b";
    }
    return config;
  },
  (error) => Promise.reject(error),
);