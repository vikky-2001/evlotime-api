module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    "eslint:recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: [
    "@typescript-eslint",
    "jest"
  ],
  rules: {
    "semi": ["error", "always"],
    "quotes": ["error", "double"]
  },
};

