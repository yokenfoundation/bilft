import { defineConfig, loadEnv } from "vite";

import { nodePolyfills } from "vite-plugin-node-polyfills";
import tsconfigPaths from "vite-tsconfig-paths";
import { rm } from "node:fs/promises";

import solid from "vite-plugin-solid";

export default defineConfig(async ({ mode, command }) => {
  const env = loadEnv(mode, ".");
  const backendUrl = env.VITE_BACKEND_URL;

  console.assert(backendUrl.length > 0, "backend url must be in env");
  console.log("app looking to domain", backendUrl);

  if (command === "build") {
    await rm("./docs", {
      force: true,
      recursive: true,
    });
  }

  return {
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
  };
});
