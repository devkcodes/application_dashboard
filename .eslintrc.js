module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'perfectionist',
    'eslint-plugin-tsdoc',
    '@stylistic/ts',
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    // 'plugin:perfectionist/recommended-natural',
    'plugin:promise/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', '*.js', '.prettierrc', 'dist/*'],
  rules: {
    '@typescript-eslint/naming-convention': [
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE'],
        filter: {
          regex: '^_id$',
          match: true,
        },
      },
    ],
    'tsdoc/syntax': 'warn',
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': [
      'warn',
      // { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'prettier/prettier': ['error', { endOfLine: 'auto' }],

    indent: [
      'warn',
      2,
      {
        SwitchCase: 1,
        ignoredNodes: [
          'ConditionalExpression > *',
          'ConditionalExpression > * > *',
          'ConditionalExpression > * > * > *',
          `FunctionExpression > .params[decorators.length > 0]`,
          `FunctionExpression > .params > :matches(Decorator, :not(:first-child))`,
          `ClassBody.body > PropertyDefinition[decorators.length > 0] > .key`,
        ],
      },
    ],
    '@typescript-eslint/quotes': ['warn', 'single'],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'default',
        format: ['camelCase'],
        filter: {
          regex: '^_',
          match: false,
        },
      },
      {
        selector: 'objectLiteralProperty',
        format: ['camelCase', 'snake_case', 'PascalCase'],
      },
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE'],
        filter: {
          regex: '^_',
          match: false,
        },
      },
      {
        selector: 'class',
        format: ['PascalCase'],
      },
      {
        selector: 'variable',
        types: ['boolean'],
        format: ['PascalCase'],
        prefix: ['is', 'should', 'has', 'can', 'did', 'will', 'does'],
        filter: {
          regex: '^_',
          match: false,
        },
      },
      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'memberLike',
        modifiers: ['private'],
        format: ['camelCase', 'snake_case'],
        leadingUnderscore: 'require',
      },
      {
        selector: 'interface',
        prefix: ['I'],
        format: ['StrictPascalCase'],
      },
      {
        selector: 'typeLike',
        prefix: ['T'],
        format: ['StrictPascalCase'],
      },
    ],
  },
  overrides: [
    {
      files: ['*.controller.ts'],
      rules: {
        'perfectionist/sort-classes': 'off',
      },
    },
    {
      files: ['*.entity.ts'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'warn',
          {
            selector: 'variable',
            format: ['snake_case', 'camelCase'],
          },
          {
            selector: 'variable',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'should', 'has', 'can', 'did', 'will'],
          },
        ],
      },
    },
    {
      files: ['*.constants.ts'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'warn',
          {
            selector: 'variable',
            format: ['UPPER_CASE'],
          },
          {
            selector: 'objectLiteralProperty',
            format: ['UPPER_CASE'],
          },
        ],
      },
    },
    {
      files: ['*.decorator.ts'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'warn',
          {
            selector: 'function',
            format: ['PascalCase', 'camelCase'],
          },
        ],
      },
    },
  ],
};
