import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Servit din https://ideoideis.github.io/feedback-intern-21/ în producție
  // (GitHub Pages project site); din rădăcină în dezvoltare locală.
  base: mode === "production" ? "/feedback-intern-21/" : "/",
  server: {
    host: "::",
    port: 8083,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
