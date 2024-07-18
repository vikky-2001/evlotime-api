module.exports = {
	verbose: true,
	transform: {
		"^.+\\.tsx?$": "ts-jest",
	},
	testMatch: [
        "**/*.spec.ts"
    ],
	testPathIgnorePatterns: ["lib/", "node_modules/"],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
	testEnvironment: "node",
	rootDir: "src",
};