import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  base: "/squircle-path-kit/",
  plugins: [react()],
  build: {
    outDir: "../dist-site",
    emptyOutDir: true,
  },
});
