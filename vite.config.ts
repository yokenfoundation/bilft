import { defineConfig } from "vite";

import { nodePolyfills } from "vite-plugin-node-polyfills";
import tsconfigPaths from "vite-tsconfig-paths";

import solid from "vite-plugin-solid";

export default defineConfig({
  server: {
    port: 1234,
  },
  plugins: [
    solid(),
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
