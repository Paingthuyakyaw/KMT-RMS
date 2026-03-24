import Axios from "axios"


export const axios = Axios.create({
    baseURL : import.meta.env.VITE_BASE_URL
})


axios.interceptors.request.use(
  (config) => { 
    config.headers.token = `117cb7ed-ef5a-41c6-8eb1-6a9e8b897611`;
    config.headers.db ="klt_db" ;
    return config;
  },
  (error) => Promise.reject(error),
);