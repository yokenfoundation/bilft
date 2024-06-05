import { defineConfig, loadEnv } from "vite";

import { nodePolyfills } from "vite-plugin-node-polyfills";
import tsconfigPaths from "vite-tsconfig-paths";

import solid from "vite-plugin-solid";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".");
  const backendUrl = env.VITE_BACKEND_URL;

  console.assert(backendUrl.length > 0, "backend url must be in env");
  console.log("app looking to domain", backendUrl);

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
