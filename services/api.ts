import axios from "axios";

export const api = axios.create({
  //baseURL: "https://kanban-board-be.onrender.com", // your Rust backend

  baseURL: "http://localhost:8080", // for local development
});
