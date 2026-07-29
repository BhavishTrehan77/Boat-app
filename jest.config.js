const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "node",

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  testMatch: ["**/tests/**/*.test.js"],

  clearMocks: true,
};

module.exports = createJestConfig(customJestConfig);