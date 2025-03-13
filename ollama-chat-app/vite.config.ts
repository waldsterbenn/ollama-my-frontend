import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// Configure Vite to serve files from the "public" folder and enable history fallback.
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    historyApiFallback: true, // fallback to index.html
  },
});
