import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "./",              // works on any subpath, including GitHub Pages
  test: { environment: "node" },
});
