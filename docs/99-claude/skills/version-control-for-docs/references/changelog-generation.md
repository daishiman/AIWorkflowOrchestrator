# Changelog生成

## 概要

文書の変更履歴を自動的に生成・管理する方法を説明します。

## Changelog形式

### Keep a Changelog形式

```markdown
# Changelog

All notable changes to this documentation will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- OAuth 2.0 authentication guide (#123)

### Changed

- Updated installation instructions for v2.0 (#456)

### Fixed

- Corrected broken links in API reference (#789)

## [1.2.0] - 2025-01-15

### Added

- New troubleshooting section
- API rate limiting documentation

### Changed

- Reorganized navigation structure
- Updated code examples to use async/await

### Removed

- Deprecated v1 API documentation
```

## カテゴリ定義

| カテゴリ     | 用途         | 例                       |
| :----------- | :----------- | :----------------------- |
| `Added`      | 新規追加     | 新しいガイド、セクション |
| `Changed`    | 変更・改善   | 内容の更新、構造変更     |
| `Deprecated` | 非推奨化     | 古いAPI文書の警告        |
| `Removed`    | 削除         | 古い文書の削除           |
| `Fixed`      | 修正         | 誤り、タイポ、リンク修正 |
| `Security`   | セキュリティ | セキュリティ関連の更新   |

## 自動生成

### conventional-changelog

```bash
# インストール
pnpm install -g conventional-changelog-cli

# Changelog生成
conventional-changelog -p angular -i CHANGELOG.md -s

# 全履歴を再生成
conventional-changelog -p angular -i CHANGELOG.md -s -r 0
```

### 設定ファイル

`.changelogrc.js`:

```javascript
module.exports = {
  types: [
    { type: "docs", section: "Added", hidden: false },
    { type: "update", section: "Changed", hidden: false },
    { type: "fix", section: "Fixed", hidden: false },
    { type: "remove", section: "Removed", hidden: false },
    { type: "refactor", section: "Changed", hidden: false },
    { type: "style", section: "Changed", hidden: true },
    { type: "translate", section: "Added", hidden: false },
  ],
};
```

### GitHub Actions自動化

```yaml
# .github/workflows/changelog.yml
name: Update Changelog

on:
  push:
    branches: [main]

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate changelog
        uses: TriPSs/conventional-changelog-action@v5
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          output-file: "CHANGELOG.md"
          skip-version-file: true
          skip-commit: false
```

## 手動管理

### エントリ追加ガイドライン

```markdown
## [Unreleased]

### Added

- [ガイド名] 新しいガイドを追加 (#Issue番号)
  - 含まれる内容の詳細
  - 関連するファイル

### Changed

- [セクション名] 内容を更新 (#Issue番号)
  - 変更の具体的な内容
```

### リリース時の手順

1. `[Unreleased]` セクションの内容を確認
2. バージョン番号と日付を追加
3. 新しい `[Unreleased]` セクションを作成

```markdown
## [Unreleased]

## [1.3.0] - 2025-02-01

### Added

- (移動した内容)
```

## バージョニング

### セマンティックバージョニング

```
MAJOR.MINOR.PATCH

MAJOR: 大規模な構造変更、破壊的変更
MINOR: 新規文書追加、機能的な変更
PATCH: 誤り修正、タイポ修正
```

### 文書向けの解釈

| バージョン | 変更内容                         |
| :--------- | :------------------------------- |
| 2.0.0      | 全面リニューアル、構造の大幅変更 |
| 1.1.0      | 新しいガイドの追加               |
| 1.0.1      | タイポ修正、リンク修正           |

## カスタムスクリプト

### シンプルな生成スクリプト

```bash
#!/bin/bash
# generate-changelog.sh

echo "# Changelog" > CHANGELOG.md
echo "" >> CHANGELOG.md
echo "## [Unreleased]" >> CHANGELOG.md
echo "" >> CHANGELOG.md

# コミットからエントリを生成
git log --pretty=format:"- %s (%h)" --since="last month" \
    --grep="^docs\|^update\|^fix" >> CHANGELOG.md
```

### Node.jsスクリプト

```javascript
// scripts/generate-changelog.mjs
import { execSync } from "child_process";
import { writeFileSync } from "fs";

const categories = {
  docs: "Added",
  update: "Changed",
  fix: "Fixed",
  remove: "Removed",
};

function generateChangelog() {
  const commits = execSync(
    'git log --pretty=format:"%s|%h" --since="last tag"',
    { encoding: "utf-8" },
  ).split("\n");

  const entries = {};

  for (const commit of commits) {
    const [message, hash] = commit.split("|");
    const match = message.match(/^(docs|update|fix|remove)\(([^)]+)\):\s*(.+)/);

    if (match) {
      const [, type, scope, description] = match;
      const category = categories[type];

      if (!entries[category]) entries[category] = [];
      entries[category].push(`- ${description} (${hash})`);
    }
  }

  let changelog = "## [Unreleased]\n\n";

  for (const [category, items] of Object.entries(entries)) {
    changelog += `### ${category}\n`;
    changelog += items.join("\n") + "\n\n";
  }

  return changelog;
}

console.log(generateChangelog());
```

## ベストプラクティス

### すべきこと

- 各リリースに日付を含める
- Issue/PR番号をリンクする
- ユーザー視点で変更を記述
- 破壊的変更は明確にマーク

### 避けるべきこと

- 技術的すぎる内容
- 内部的な変更の記載
- 曖昧な説明（「様々な修正」など）
- コミットメッセージの単純コピー

## テンプレート

### CHANGELOG.md テンプレート

```markdown
# Changelog

All notable changes to this documentation will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

## [1.0.0] - YYYY-MM-DD

### Added

- Initial documentation release
```
