---
name: skill-fixture-runner
description: |
  skill-creator出力フィクスチャの自動検証スキル。
  ディレクトリ構造・SKILL.mdフォーマット・エージェント仕様書・JSONスキーマ・EVALS.json を6スクリプトで決定論的に検証する。

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

skill-creatorが生成するスキルの構造整合性を6つの検証スクリプトで自動検証する。全スクリプトはJSON形式で結果を出力し、終了コードでPASS/FAILを判定する。

## ワークフロー

```
target指定 → run-all-validations.js（統合実行・推奨）
               ├→ validate-skill-structure.js
               ├→ validate-skill-md.js
               ├→ validate-agents.js（agents/存在時）
               ├→ validate-schemas.js（schemas/存在時）
               └→ validate-evals.js（EVALS.json 検証）
               → { overall: true/false, results: [...] }
```

## Task仕様ナビ

| Task               | 責務             | パターン | 入力                 | 出力                                   |
| ------------------ | ---------------- | -------- | -------------------- | -------------------------------------- |
| validate-structure | ディレクトリ検証 | det      | スキルディレクトリ   | `{ valid, errors, structure }`         |
| validate-skill-md  | SKILL.md検証     | det      | SKILL.mdパス         | `{ valid, errors, frontmatter, body }` |
| validate-agents    | エージェント検証 | det      | agents/ディレクトリ  | `{ valid, errors, agents }`            |
| validate-schemas   | スキーマ検証     | det      | schemas/ディレクトリ | `{ valid, errors, schemas }`           |
| validate-evals     | EVALS.json検証   | det      | スキルID / ファイル / ディレクトリ | `{ summary, results }`      |
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
node scripts/validate-evals.js --all-skills --check-dual-root
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
| scripts/    | 6  | 検証スクリプト       |
| references/ | 1  | テストカバレッジ情報 |

テストカバレッジ詳細: [references/test-coverage.md](references/test-coverage.md)

## EVALS.json 検証（validate-evals.js）

UNASSIGNED-EVALS-VALIDATOR-GUARD-001 で追加した 3 層バリデーター。

### ローカル実行手順

```bash
# 6スキル全件一括検証（dual root 比較含む）
node scripts/validate-evals.js --all-skills --check-dual-root

# 特定スキルのみ検証
node scripts/validate-evals.js --skill <skill-id>

# 単一ファイルまたはディレクトリ検証
node scripts/validate-evals.js --path <path/to/EVALS.json>
node scripts/validate-evals.js --path <skill-directory-or-fixture-directory>

# JSON形式で結果取得
node scripts/validate-evals.js --all-skills --json

# strict / verbose
node scripts/validate-evals.js --all-skills --strict
node scripts/validate-evals.js --all-skills --verbose

# fixture 除外リスト表示
node scripts/validate-evals.js --check-excluded
```

### validate-evals.js exit code 一覧

| exit code | 意味 | 発生層 |
|---|---|---|
| 0 | 全検証 PASS | - |
| 1 | L1 JSON パースエラー / L2 必須キー欠落 / L3 dual root ドリフト | L1/L2/L3 |

### fixture 除外 allowlist

以下のパスは検証対象から除外される（TC-004 契約固定）:

```
apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json
```

allowlist 外の `__fixtures__` / `fixtures` / `tests` 配下は自動除外しない。除外対象は実装コードの定数を正本とする。

## 変更履歴

| Date | Changes |
| --- | --- |
| 2026-04-21 | UNASSIGNED-EVALS-VALIDATOR-GUARD-001 close-out sync: `validate-evals.js` を正式導入。`--path <file-or-dir>` / `--strict` / `--verbose` / allowlist-only fixture 除外 / `run-all-validations.js` 統合 / test 実測契約を反映。 |
