module.exports = {
    testEnvironment: "node",
    bail: false,
    verbose: true,
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testMatch: ["**/*.test.ts"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    modulePathIgnorePatterns: ["<rootDir>/.coverage"],
    moduleNameMapper: {
        "@packages/(.*)$": "<rootDir>/packages/$1",
        "@tests/(.*)$": "<rootDir>/__tests__/$1",
    },
    coverageDirectory: "<rootDir>/.coverage",
    collectCoverageFrom: ["<rootDir>/src/**/{!(index),}.ts", "<rootDir>/__tests__/unit/*.test.ts"],
    coverageReporters: ["json", "lcov", "text", "clover", "html"],
    watchman: false,
    setupFilesAfterEnv: ["jest-extended"],
    globals: {
        "ts-jest": {
            tsConfig: "tsconfig.test.json",
        },
    },
};
