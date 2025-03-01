module.exports = {
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "tsconfig.json",
    }],
  },
  moduleFileExtensions: ["js", "ts"],
  testMatch: ["**/test/**/*.test.(ts|js)"],
  testEnvironment: "node",
  preset: "ts-jest",
  setupFiles: ["reflect-metadata"],
};
