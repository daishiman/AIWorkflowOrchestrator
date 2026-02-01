---
name: skill-fixture-runner
description: |
  skill-creator出力フィクスチャの自動検証スキル。
  ディレクトリ構造・SKILL.mdフォーマット・エージェント仕様書・JSONスキーマを5スクリプトで決定論的に検証する。

  Anchors:
  • skill-creator / 適用: 出力仕様・品質基準 / 目的: 検証ルールの源泉
  • Contract First / 適用: JSON出力スキーマ / 目的: 予測可能な検証結果

  Trigger:
  fixture validation, skill validation, スキルテスト, フィクスチャ検証, skill-creator検証
allowed-tools:
  - Bash
  - Read
  - Glob
---

# skill-fixture-runner

skill-creator出力フィクスチャの自動検証スキル。

## 概要

skill-creatorが生成するスキルの構造整合性を5つの検証スクリプトで自動検証する。全スクリプトはJSON形式で結果を出力し、終了コードでPASS/FAILを判定する。

## ワークフロー

```
target指定 → run-all-validations.js（統合実行・推奨）
               ├→ validate-skill-structure.js
               ├→ validate-skill-md.js
               ├→ validate-agents.js（agents/存在時）
               └→ validate-schemas.js（schemas/存在時）
               → { overall: true/false, results: [...] }
```

## Task仕様ナビ

| Task               | 責務             | パターン | 入力                 | 出力                                   |
| ------------------ | ---------------- | -------- | -------------------- | -------------------------------------- |
| validate-structure | ディレクトリ検証 | det      | スキルディレクトリ   | `{ valid, errors, structure }`         |
| validate-skill-md  | SKILL.md検証     | det      | SKILL.mdパス         | `{ valid, errors, frontmatter, body }` |
| validate-agents    | エージェント検証 | det      | agents/ディレクトリ  | `{ valid, errors, agents }`            |
| validate-schemas   | スキーマ検証     | det      | schemas/ディレクトリ | `{ valid, errors, schemas }`           |
| run-all            | 統合実行         | seq      | スキルディレクトリ   | `{ overall, results }`                 |

凡例: `det`=決定論的（Script First）, `seq`=順次実行

## 使い方

```bash
# 統合検証（推奨）
node scripts/run-all-validations.js --target <skill-directory> [--verbose]

# 個別検証
node scripts/validate-skill-structure.js --target <skill-directory>
node scripts/validate-skill-md.js --target <skill.md-path>
node scripts/validate-agents.js --target <agents-directory>
node scripts/validate-schemas.js --target <schemas-directory>
```

## 終了コード

| コード | 意味           |
| ------ | -------------- |
| 0      | 検証成功       |
| 1      | 一般エラー     |
| 2      | 引数エラー     |
| 3      | ファイル未検出 |
| 4      | 検証失敗       |

## ベストプラクティス

### すべきこと

| 推奨事項                                     | 理由                               |
| -------------------------------------------- | ---------------------------------- |
| `run-all-validations.js` で統合検証を実行    | 個別実行の漏れを防止               |
| `--verbose` フラグで詳細結果を確認           | エラー箇所の特定が容易             |
| フィクスチャ追加時は検証テストも追加          | リグレッション防止                 |
| JSON出力を `JSON.parse()` で機械的に処理     | 人手パースによるミスを排除         |

### 避けるべきこと

| 禁止事項                               | 問題点                         |
| -------------------------------------- | ------------------------------ |
| 個別スクリプトのみで検証完結           | 他スクリプトの検証漏れリスク   |
| 終了コードを無視して出力のみ確認       | CI/CD連携時にFAILを見逃す     |
| SKILL.md未読でフィクスチャを新規追加   | 検証基準との不整合             |

## リソース

| カテゴリ    | 数 | 内容                 |
| ----------- | -- | -------------------- |
| scripts/    | 5  | 検証スクリプト       |
| references/ | 1  | テストカバレッジ情報 |

テストカバレッジ詳細: [references/test-coverage.md](references/test-coverage.md)

## 変更履歴

| Version | Date       | Changes                                                          |
| ------- | ---------- | ---------------------------------------------------------------- |
| 1.0.0   | 2026-02-01 | 初版: 5検証スクリプト、TASK-8C-F 62テスト対応                    |
| 1.1.0   | 2026-02-01 | TASK-8C-G: 境界値フィクスチャ6種追加、96テスト・100%カバレッジ   |
| 2.0.0   | 2026-02-01 | skill-creator準拠リファクタリング: 5セクション構造化、references/分離、LOGS.md追加 |
