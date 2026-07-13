const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly'
      }
    },
    rules: {
      // Functional Programming Enforcement
      'prefer-const': 'error',
      'no-var': 'error',
      'no-param-reassign': 'error',
      
      // Code Style
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      
      // Best Practices
      'eqeqeq': 'error',
      'no-unused-vars': 'warn'
    }
  }
];
