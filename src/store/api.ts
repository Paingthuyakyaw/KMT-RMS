import Axios from "axios";

const appKey =
  import.meta.env.VITE_APP_KEY ??
  import.meta.env.VITE_APP_KEY7 ??
  "649d98ed";

export const axios = Axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    db: import.meta.env.VITE_DB,
    appkey: appKey,
    appsecret: import.meta.env.VITE_APP_SECRET ?? "0b8301b0",
  },
});

axios.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem("token");
    if (authToken && !config.headers.token) {
      config.headers.token = authToken;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error.response?.status;
//     const skipAuthRedirect = (error.config as { skipAuthRedirect?: boolean })
//       ?.skipAuthRedirect;
//     if (
//       (status === 401 || status === 403) &&
//       !skipAuthRedirect
//     ) {
//       localStorage.removeItem("token")
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   },
// );
