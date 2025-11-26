module.exports = {
  // TypeScript/JavaScript
  '*.{ts,tsx,js,jsx}': (filenames) => {
    const commands = [
      `eslint --fix ${filenames.join(' ')}`,
      `prettier --write ${filenames.join(' ')}`
    ];

    // テストファイルなら関連テスト実行
    const testFiles = filenames.filter(f => f.includes('.test.') || f.includes('.spec.'));
    if (testFiles.length > 0) {
      commands.push(`vitest related --run ${testFiles.join(' ')}`);
    }

    return commands;
  },

  // JSON/YAML
  '*.{json,yml,yaml}': ['prettier --write'],

  // Markdown
  '*.md': ['prettier --write'],

  // CSS/SCSS
  '*.{css,scss}': ['prettier --write']
};
