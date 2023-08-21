module.exports = {
    extends: ['eslint:recommended', 'plugin:react/recommended'],
    plugins: ['react'],
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    rules: {
      // Ваши правила ESLint
    },
  };