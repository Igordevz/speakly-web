import axios from "axios";
import Cookies from "js-cookie";

// Set config defaults when creating the instance
export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL_API,
});

// Add a request interceptor to include the JWT token from cookies
instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("@jwt");

    if (token) {
      config.headers["jwt"] = token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Alter defaults after instance has been created

