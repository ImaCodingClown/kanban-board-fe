import axios from "axios";
import { useAuth } from "@/store/authStore";

export const api = axios.create({
  baseURL: "https://kanban-board-be.onrender.com", // your Rust backend

  //baseURL: "http://localhost:8080", // for local development
});

api.interceptors.request.use(
  (config) => {
    const token = useAuth.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "Adding auth token to request:",
        token.substring(0, 20) + "...",
      );
    } else {
      console.log("No auth token found for request");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
