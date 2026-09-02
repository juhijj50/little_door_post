import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* /api goes to the FastAPI backend in ../backend:
 *     cd backend && uvicorn app.main:app --reload --port 8000  */
const API = process.env.VITE_DEV_API || "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { target: API, changeOrigin: true },
    },
  },
});
