import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.test.ts"],
    hookTimeout: 30000,
    testTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts", "src/server.ts", "src/app.ts"],
    },
    setupFiles: ["reflect-metadata"],
  },
});
