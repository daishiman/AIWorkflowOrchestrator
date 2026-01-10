// lint-staged Configuration Template
// プロジェクトルートにコピーして使用

export default {
  // JavaScript/TypeScript files
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],

  // JSON, Markdown, YAML files
  '*.{json,md,yml,yaml}': ['prettier --write'],

  // CSS files
  '*.{css,scss,less}': ['prettier --write'],

  // HTML files
  '*.html': ['prettier --write'],
};
