module.exports = {
  extends: ['react-app', 'react-app/jest', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
    // General code quality rules
    'no-console': 'warn',
    'no-debugger': 'warn',
    'prefer-const': 'warn',
    'no-duplicate-imports': 'error',

    // Prettier integration
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
