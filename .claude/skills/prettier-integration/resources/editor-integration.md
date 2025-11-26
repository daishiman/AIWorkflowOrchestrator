# Prettier Editor Integration

## VSCode統合

### 拡張機能インストール

1. **Prettier - Code formatter** (`esbenp.prettier-vscode`)

### プロジェクト設定

**`.vscode/settings.json`**:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 動作フロー

```
保存時
  ↓
1. Prettier自動フォーマット
  ↓
2. ESLint自動修正（source.fixAll.eslint）
  ↓
3. 残るエラー表示
```

## WebStorm/IntelliJ IDEA統合

### 設定手順

1. **Settings** → **Languages & Frameworks** → **JavaScript** → **Prettier**
2. **Prettier package**: `node_modules/prettier`を指定
3. **On save**: チェック
4. **Run on 'Reformat Code'**: チェック

### ESLint統合

1. **Settings** → **Languages & Frameworks** → **JavaScript** → **Code Quality Tools** → **ESLint**
2. **Automatic ESLint configuration**: チェック
3. **Run eslint --fix on save**: チェック

## Vim/Neovim統合

### プラグイン（vim-prettier）

**.vimrc**:
```vim
Plug 'prettier/vim-prettier', {
  \ 'do': 'yarn install',
  \ 'for': ['javascript', 'typescript', 'css', 'json', 'markdown'] }

" 保存時自動フォーマット
let g:prettier#autoformat = 1
let g:prettier#autoformat_require_pragma = 0
```

### ALE（Asynchronous Lint Engine）

```vim
let g:ale_fixers = {
\   'javascript': ['prettier', 'eslint'],
\   'typescript': ['prettier', 'eslint'],
\}
let g:ale_fix_on_save = 1
```

## Sublime Text統合

### JsPrettier

1. **Package Control** → **Install Package** → **JsPrettier**
2. **Preferences** → **Package Settings** → **JsPrettier** → **Settings**

```json
{
  "auto_format_on_save": true,
  "prettier_cli_path": "node_modules/.bin/prettier"
}
```

## エディタ非依存設定

### .editorconfig

**目的**: エディタ横断の基本設定

```ini
root = true

[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

**Prettierとの関係**:
- Prettierは`.editorconfig`を尊重
- `indent_style`、`indent_size`、`end_of_line`を読み取り

## チーム設定共有

### コミット対象

**.vscode/settings.json**:
- **コミット**: ✅（チーム全体で統一）
- **パス**: `.vscode/settings.json`

**.editorconfig**:
- **コミット**: ✅（エディタ横断設定）
- **パス**: `.editorconfig`

### 個人設定

**個人の.vscode/settings.json**:
- **コミット**: ❌（個人設定）
- **パス**: `.vscode/settings.local.json`（gitignore追加）

## トラブルシューティング

### 保存時フォーマットが動作しない

**チェック項目**:
1. Prettier拡張がインストールされているか？
2. `editor.defaultFormatter`が設定されているか？
3. `.prettierrc`がプロジェクトルートにあるか？

**デバッグ**:
```json
{
  "prettier.requireConfig": true,  // .prettierrc必須に
  "prettier.configPath": ".prettierrc"  // 明示的パス指定
}
```

### ESLintとの実行順序問題

**症状**: フォーマット後にESLintエラー

**解決**:
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

**実行順**: Prettier → ESLint --fix

### ファイルタイプ別フォーマッター

**問題**: JSONはPrettierだが、JavaScriptは別のフォーマッター

**解決**:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  }
}
```

## まとめ

**推奨構成**:
- プロジェクト設定（`.vscode/settings.json`）をコミット
- 保存時自動フォーマット有効化
- ESLint --fixも自動実行
- `.editorconfig`でエディタ横断設定
