import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  base:
    mode === "pages-me"
      ? "/calibrate/me/"
      : mode === "pages-gds"
        ? "/calibrate/gds/"
        : "/",
  define: {
    __APP_THEME__: JSON.stringify(mode.indexOf("gds") >= 0 ? "gds" : "me"),
  },
  plugins: [react()],
}));
