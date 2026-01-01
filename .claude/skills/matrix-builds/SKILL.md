---
name: matrix-builds
description: |
  GitHub Actionsマトリックスビルドの専門スキル。
  複数環境テスト、動的マトリックス生成を提供します。

  Anchors:
  • 『GitHub Actions Documentation』（GitHub） / 適用: CI/CD / 目的: 並列テスト

  Trigger:
  マトリックスビルド設定時、複数環境テスト時、CI並列化時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# マトリックスビルド

## 概要

GitHub Actionsのマトリックスビルド戦略（strategy.matrix）の設計と最適化。
複数のOS、バージョン、環境での並列テスト実行、動的マトリックス生成、include/exclude条件、
fail-fast制御、max-parallel設定による効率的なCI/CDパイプライン構築を支援。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す

## Task仕様ナビ

| Task                       | 説明                                         | 対応Level | リソース                 | スクリプト            |
| -------------------------- | -------------------------------------------- | --------- | ------------------------ | --------------------- |
| 基本的なマトリックス構文   | OS、バージョン、環境の組み合わせ定義         | L1        | `Level1_basics.md`       | -                     |
| 動的マトリックス生成       | fromJSON()を活用した条件付きマトリックス生成 | L2        | `dynamic-matrix.md`      | `generate-matrix.mjs` |
| include/exclude条件        | マトリックスの包含・除外ルール設定           | L2        | `matrix-strategy.md`     | -                     |
| fail-fast制御              | ビルド失敗時の並列実行制御                   | L2        | `Level2_intermediate.md` | -                     |
| max-parallel設定           | 最大並列実行数の最適化                       | L2        | `Level2_intermediate.md` | -                     |
| マトリックス変数アクセス   | ${{ matrix.* }}による動的値参照              | L2        | `matrix-strategy.md`     | -                     |
| 複雑なマトリックス戦略     | 複数条件の組み合わせと最適化                 | L3        | `Level3_advanced.md`     | -                     |
| パフォーマンスチューニング | CI/CDコスト削減と実行時間短縮                | L4        | `Level4_expert.md`       | -                     |

## ベストプラクティス

### すべきこと

- `references/Level1_basics.md` を参照し、基本的なマトリックス構文を理解する
- `references/Level2_intermediate.md` で実務的なinclude/exclude条件やfail-fast制御を習得する
- `references/dynamic-matrix.md` を活用して、変更ファイルベースの動的テスト選択を実装する
- `assets/matrix-template.yaml` をベースに、プロジェクト固有のマトリックスを設計する
- `scripts/generate-matrix.mjs` を使用して、OS/バージョン組み合わせを自動生成する

### 避けるべきこと

- 必要な変動軸を明確にせずにマトリックスを定義することを避ける
- max-parallel設定を無視して過度な並列実行数を設定することを避ける
- include/exclude条件を複雑に組み合わせすぎて保守性を損なうことを避ける
- fail-fastをデフォルトのまま使用し、全テスト結果の確認機会を失うことを避ける
- マトリックス生成ロジックをハードコードして、拡張性を失うことを避ける

## リソース参照

### 基本ガイド（references/）

- **Level1_basics.md**: マトリックスの基本構文、単純なOS・バージョン指定、strategy.matrixの核となる概念
- **Level2_intermediate.md**: include/excludeの詳細、fail-fast制御、max-parallel最適化、実務的なパターン
- **Level3_advanced.md**: 複雑なマトリックス戦略、条件付きジョブ実行、カスタムマトリックス変数
- **Level4_expert.md**: パフォーマンス極適化、CI/CDコスト削減、マトリックス生成の完全自動化
- **dynamic-matrix.md**: fromJSON()活用、変更ファイルベースのテスト選択、条件付きマトリックス生成
- **matrix-strategy.md**: include/exclude構文、fail-fast制御、max-parallel設定、マトリックス変数アクセス

### 自動化スクリプト（scripts/）

- **generate-matrix.mjs**: OS/バージョン組み合わせの自動生成、YAML形式での出力、カスタマイズ可能なテンプレート
- **log_usage.mjs**: 使用記録の保存、スキル評価データの収集、分析用ログの自動記録
- **validate-skill.mjs**: スキル構造の妥当性検証、必須ファイルの確認、YAML形式の検証

### テンプレート・サンプル（assets/）

- **matrix-template.yaml**: マルチOS・マルチバージョンテスト用マトリックスビルドテンプレート、即座に利用可能な実装例

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/matrix-builds/references/Level1_basics.md
cat .claude/skills/matrix-builds/references/Level2_intermediate.md
cat .claude/skills/matrix-builds/references/Level3_advanced.md
cat .claude/skills/matrix-builds/references/Level4_expert.md
cat .claude/skills/matrix-builds/references/dynamic-matrix.md
cat .claude/skills/matrix-builds/references/legacy-skill.md
cat .claude/skills/matrix-builds/references/matrix-strategy.md
```

### スクリプト実行

```bash
node .claude/skills/matrix-builds/scripts/generate-matrix.mjs --help
node .claude/skills/matrix-builds/scripts/log_usage.mjs --help
node .claude/skills/matrix-builds/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/matrix-builds/assets/matrix-template.yaml
```

## 変更履歴

| Version | Date       | Changes                                                                                                                                                                        |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様に完全対応：Frontmatter改善（name、description、allowed-tools）、Trigger日本語化、Task仕様ナビテーブル追加、ベストプラクティス拡充、リソース参照セクション整理 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                                                                                                    |
