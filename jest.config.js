/** @type {import("@jest/types").Config.InitialOptions} */
module.exports = {
  roots: ["<rootDir>/src/"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1",
  },
};
