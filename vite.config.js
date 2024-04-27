import { defineConfig } from "vite";

import { nodePolyfills } from "vite-plugin-node-polyfills";
import tsconfigPaths from "vite-tsconfig-paths";

import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    port: 1234,
  },
  plugins: [
    react(),
    tsconfigPaths(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      exclude: ["http"],
    }),
  ],
  define: {
    "process.env": {},
  },
  build: {
    outDir: "docs",
  },
});
