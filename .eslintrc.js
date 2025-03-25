module.exports = {
  root: true,
  extends: ['react-app', 'react-app/jest', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['prettier'],
  rules: {
    // General code quality rules
    'no-console': 'warn',
    'no-debugger': 'warn',
    'prefer-const': 'warn',
    'no-duplicate-imports': ['error'],

    // Prettier integration with specific settings
    'prettier/prettier': [
      'error',
      {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        printWidth: 100,
        trailingComma: 'all',
        bracketSpacing: true,
        bracketSameLine: false,
        arrowParens: 'always',
        endOfLine: 'lf',
      },
    ],

    // Disable strict rule for external files
    strict: 'off',

    // Disable trailing comma rules
    'comma-dangle': ['off'],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  ignorePatterns: [
    'build/',
    'node_modules/',
    'dist/',
    'src/utils/clientLogger.d.ts',
    'react-refresh-runtime.js',
  ],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
};
