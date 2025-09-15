import axios from "axios";

// Set config defaults when creating the instance
export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL_API
});

// Alter defaults after instance has been created
