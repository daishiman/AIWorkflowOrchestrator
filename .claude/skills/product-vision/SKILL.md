---
name: product-vision
description: |
  プロダクトビジョン策定の専門スキル。
  ビジョンボード作成、OKR設定、ロードマップ策定を体系的に支援し、長期的な製品戦略を明確化します。

  Anchors:
  • 『Inspired』（Marty Cagan） / 適用: プロダクト戦略 / 目的: 方向性明確化

  Trigger:
  プロダクトビジョン策定時、ロードマップ作成時、OKR設定時、戦略立案時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# プロダクトビジョンスキル

## 概要

ビジョンボード作成、OKR設定、プロダクトロードマップ策定の体系的手法により、長期的な製品戦略を明確化し、チームとステークホルダーの方向性を一致させます。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 対象タスク（ビジョンボード/OKR/ロードマップ）を特定
3. 必要なリソース、スクリプト、テンプレートを決定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソース（references/）やテンプレート（assets/）を参照しながら作業を実施
2. OKRテンプレートやビジョンボード等の成果物を作成
3. 重要な判断点をメモとして記録

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が品質基準（内容の正確性、ステークホルダー合意）に合致するか検証
3. `scripts/log_usage.mjs` を実行して実行記録を保存

## Task仕様ナビ

| Task                     | 適用場面                         | 主要テンプレート                   | 関連フェーズ |
| ------------------------ | -------------------------------- | ---------------------------------- | ------------ |
| ビジョンボード作成       | 製品の長期方向性を定義・可視化   | `assets/okr-template.md`        | Phase 1-2    |
| OKR設定                  | 四半期ごとの目標と成果指標を設定 | `assets/okr-template.md`        | Phase 1-2    |
| ロードマップ設計         | 実装優先順位と時系列を決定       | `references/Level2_intermediate.md` | Phase 1-2    |
| ステークホルダー合意形成 | チームと経営陣の方向性を統一     | `references/Level3_advanced.md`     | Phase 2-3    |

## ベストプラクティス

### すべきこと

- **前提の確認**: タスク開始前に対象タスク（ビジョン/OKR/ロードマップ）を明確化する
- **リソース参照**: `references/Level1_basics.md` で基礎知識を確認してから実施する
- **実務手順**: `references/Level2_intermediate.md` で実務的なステップを確認
- **テンプレート利用**: `assets/okr-template.md` を活用して標準化された成果物を作成
- **ステークホルダー参加**: 主要な利害関係者の意見を反映させる
- **反復的改善**: フィードバックループを組み込んで継続改善

### 避けるべきこと

- **無計画な開始**: リソースを確認せずに作業に入ることを避ける
- **曖昧な定義**: ビジョンやOKRの表現が曖昧なまま進めることを避ける
- **一方的な決定**: ステークホルダーの意見を聞かずに決定することを避ける
- **高すぎる目標設定**: 実現不可能な目標を設定することを避ける
- **ドキュメント化忘却**: 決定理由や前提条件を記録しないことを避ける

## リソース参照

### 基礎知識

- `references/Level1_basics.md`: プロダクトビジョンの基礎と適用タイミング
- `references/Level2_intermediate.md`: OKRやロードマップの実務ガイド
- `references/Level3_advanced.md`: ステークホルダー管理と複数チーム間の調整
- `references/Level4_expert.md`: エンタープライズ規模のビジョン策定

### テンプレートと出力

- `assets/okr-template.md`: OKR (Objectives and Key Results) の標準テンプレート

### スクリプトとツール

- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### その他の参照

- `references/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
- `references/legacy-skill.md`: 旧仕様のSKILL.md

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/product-vision/references/Level1_basics.md
cat .claude/skills/product-vision/references/Level2_intermediate.md
cat .claude/skills/product-vision/references/Level3_advanced.md
cat .claude/skills/product-vision/references/Level4_expert.md
cat .claude/skills/product-vision/references/legacy-skill.md
```

### スクリプト実行

```bash
node .claude/skills/product-vision/scripts/log_usage.mjs --result success --phase "Phase 2" --notes "OKR策定完了"
node .claude/skills/product-vision/scripts/validate-skill.mjs
```

### テンプレート参照

```bash
cat .claude/skills/product-vision/assets/okr-template.md
```

## 変更履歴

| Version | Date       | Changes                                                                  |
| ------- | ---------- | ------------------------------------------------------------------------ |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様への完全対応、Task仕様ナビ追加、ベストプラクティス充実化 |
