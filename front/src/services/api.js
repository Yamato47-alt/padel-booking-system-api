// src/services/api.js
import axios from "axios";
import { getToken } from "./authService";

const api = axios.create({
  baseURL: "https://localhost:63683",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
