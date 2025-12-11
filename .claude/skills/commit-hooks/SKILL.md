---
name: commit-hooks
description: |
  Git commit hooksとプレコミット品質ゲートの専門知識。
  Husky、lint-staged統合による自動lint/format実行を設計します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/commit-hooks/resources/husky-configuration.md`: Huskyによるコミットフック設定
  - `.claude/skills/commit-hooks/resources/lint-staged-patterns.md`: lint-stagedパターンと設定例
  - `.claude/skills/commit-hooks/resources/performance-optimization.md`: コミットフックのパフォーマンス最適化
  - `.claude/skills/commit-hooks/templates/pre-commit-basic.sh`: 基本的なpre-commitフックシェルスクリプト
  - `.claude/skills/commit-hooks/templates/lint-staged-advanced.js`: 高度なlint-staged設定
  - `.claude/skills/commit-hooks/scripts/test-hooks.mjs`: コミットフックテストスクリプト

  使用タイミング:
  - コミット時の自動品質チェックを設定する時
  - Husky、lint-stagedを導入する時
  - ステージングファイルのみを処理する設定を行う時
  - pre-commit、commit-msg、pre-pushフックを設計する時
  - コミットフローの自動化を計画する時
version: 1.0.0
---

# Commit Hooks Skill

## 概要

このスキルは、Linus Torvalds（Git作者）のGit Hooksコンセプトを、
品質自動化に応用したコミットフック設定を支援します。

## Husky設定

### 1. インストールと初期化

```bash
pnpm add -D husky
pnpm exec husky init
```

### 2. フックファイル作成

**pre-commit** (.husky/pre-commit):

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

**commit-msg** (.husky/commit-msg):

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm commitlint --edit $1
```

**pre-push** (.husky/pre-push):

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm test
```

### 3. 実行権限

```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

## lint-staged設定

### 基本設定

**package.json**:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

### 高度な設定

**関数形式** (.lintstagedrc.js):

```javascript
module.exports = {
  "*.{ts,tsx}": (filenames) => [
    `eslint --fix ${filenames.join(" ")}`,
    `prettier --write ${filenames.join(" ")}`,
    `vitest related --run ${filenames.join(" ")}`, // 関連テスト実行
  ],
  "*.{json,md}": (filenames) => [`prettier --write ${filenames.join(" ")}`],
};
```

## フックタイプ別戦略

### pre-commit

**目的**: コード品質保証

**実行内容**:

- lint実行（eslint --fix）
- format実行（prettier --write）
- 型チェック（tsc --noEmit）オプション

**パフォーマンス考慮**:

- ステージングファイルのみ処理
- 並列実行活用
- キャッシュ活用

### commit-msg

**目的**: コミットメッセージ規約強制

**ツール**: commitlint

**設定例**:

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
        "perf",
        "ci"
      ]
    ]
  }
}
```

### pre-push

**目的**: テスト実行、ビルド検証

**実行内容**:

- 全テスト実行
- ビルド成功確認
- カバレッジ閾値チェック

## パフォーマンス最適化

### 1. 並列実行

**lint-stagedデフォルト**: 並列実行

**カスタマイズ**:

```javascript
{
  concurrent: true,  // 並列実行有効
  chunkSize: 10      // ファイルチャンクサイズ
}
```

### 2. 対象ファイル制限

**glob pattern活用**:

```json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": ["eslint --fix"], // src配下のみ
    "!**/*.test.ts": ["eslint --fix"] // テスト除外
  }
}
```

### 3. ESLintキャッシュ

```bash
eslint --cache --fix
```

## 統合フロー

```
git add
  ↓
pre-commit hook
  ↓
lint-staged
  ├─ ESLint --fix
  ├─ Prettier --write
  └─ 型チェック（オプション）
  ↓
成功? → commit続行
失敗? → commit中止、エラー表示
```

## トラブルシューティング

### フック実行されない

```bash
# Huskyインストール確認
ls -la .husky

# Git hooksパス確認
git config core.hooksPath
```

### パフォーマンス問題

- キャッシュ有効化
- 対象ファイル絞り込み
- 並列実行確認

## 詳細リソース

```bash
# Husky設定ガイド
cat .claude/skills/commit-hooks/resources/husky-configuration.md

# lint-stagedパターン
cat .claude/skills/commit-hooks/resources/lint-staged-patterns.md

# パフォーマンス最適化
cat .claude/skills/commit-hooks/resources/performance-optimization.md
```

## テンプレート

```bash
# 基本pre-commitフック
cat .claude/skills/commit-hooks/templates/pre-commit-basic.sh

# 高度なlint-staged設定
cat .claude/skills/commit-hooks/templates/lint-staged-advanced.js
```

## スクリプト

```bash
# コミットフック動作テスト
node .claude/skills/commit-hooks/scripts/test-hooks.mjs
```

## 関連スキル

- `.claude/skills/eslint-configuration/SKILL.md`: ESLint設定
- `.claude/skills/prettier-integration/SKILL.md`: Prettier統合

## 参考文献

- **Husky公式ドキュメント**: https://typicode.github.io/husky/
- **lint-staged**: https://github.com/okonet/lint-staged
- **『Pro Git』** Scott Chacon著
