// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextJest = require("next/jest");
const createConfig = nextJest({ dir: "./" });

/** @type {import("jest").Config} */
const customJestConfig = {
  roots: ["<rootDir>/src/"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: { "^~/(.*)$": "<rootDir>/src/$1" },
  testEnvironment: "jsdom",
};

module.exports = createConfig(customJestConfig);
