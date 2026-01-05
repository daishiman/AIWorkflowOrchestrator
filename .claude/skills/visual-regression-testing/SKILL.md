---
name: visual-regression-testing
description: |
  ビジュアルリグレッションテストの専門スキル。
  スクリーンショット比較、差分検出、UIテスト自動化を提供します。

  Anchors:
  • 『Test-Driven Development: By Example』（Kent Beck） / 適用: UIテスト / 目的: 視覚的品質保証

  Trigger:
  Use when implementing visual tests, configuring screenshot comparison, setting up UI regression testing, or integrating visual testing into CI/CD pipelines.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# ビジュアルリグレッションテスティング

## 概要

ビジュアルリグレッションテスティングは、ユーザーインターフェースの予期しない視覚的変更を自動的に検出・防止するための包括的なテスト戦略です。このスキルは、Playwrightなどのブラウザ自動化ツールを使用してUIのスナップショットを取得し、コード変更時の視覚的な差分を検出することで、デザインの意図を保証し、リグレッションを早期に発見します。

詳細な実装手順、ベストプラクティス、高度な戦略については、`references/` ディレクトリ内のレベル別ガイドを参照してください。

## エージェント構成

| エージェント          | 役割                 | 主な機能                       |
| --------------------- | -------------------- | ------------------------------ |
| snapshot-configurator | スナップショット設定 | 撮影設定、ベースライン管理戦略 |
| test-implementer      | テスト実装           | テストコード作成、ヘルパー設計 |
| diff-analyzer         | 差分分析             | False Positive識別、閾値調整   |
| ci-cd-integrator      | CI/CD統合            | パイプライン設定、環境構築     |

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: テスト対象、期待されるスナップショット戦略、検証基準を明確にする

**アクション**:

1. `references/Level1_basics.md` でビジュアルテストの基本概念を確認
2. `references/screenshot-strategies.md` でスナップショット戦略を選択
3. テスト対象のコンポーネント・ページスコープを定義
4. ベースラインスナップショット作成の計画

### Phase 2: スキル適用

**目的**: スナップショットテストの実装と検証

**アクション**:

1. `assets/visual-test-template.ts` を参照して実装スケルトンを準備
2. `references/Level2_intermediate.md` の実務手順に従い、テストコードを作成
3. Playwrightを使用してスナップショットを撮影・管理
4. CI/CDパイプラインへの統合を検討
5. 重要な判断点（例：許容差分度、テスト対象選定）をドキュメント化

### Phase 3: 検証と記録

**目的**: テストの正確性確保と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でテスト構造を検証
2. ローカルで実行し、false positive/negative がないか確認
3. ベースラインスナップショットのレビュー
4. `scripts/log_usage.mjs` を実行して使用記録を保存
5. `scripts/update-baseline-screenshots.mjs` で意図的な変更を承認

## Task仕様ナビゲーション

| Task                             | 説明                                             | 参照リソース                                | 所要時間 |
| -------------------------------- | ------------------------------------------------ | ------------------------------------------- | -------- |
| スナップショット戦略選定         | テスト対象の画面解像度、デバイス、ブラウザを決定 | references/screenshot-strategies.md         | 30分     |
| テストコード初期実装             | Playwrightを使用したビジュアルテストの骨組み作成 | assets/visual-test-template.ts              | 1-2時間  |
| ベースラインスナップショット作成 | 初回実行でベースライン画像を自動生成             | references/Level2_intermediate.md           | 30分     |
| CI/CD統合設定                    | GitHub ActionsやCI/CDパイプラインへの組み込み    | references/Level3_advanced.md               | 1-2時間  |
| 差分検証ワークフロー             | 変更検出時の承認・却下プロセスの実装             | scripts/update-baseline-screenshots.mjs     | 1時間    |
| テスト結果レポート生成           | ビジュアル差分のHTMLレポート出力                 | references/visual-testing-best-practices.md | 1-2時間  |
| false positive削減               | アニメーション、日時情報の除外設定               | references/Level3_advanced.md               | 2-3時間  |

## ベストプラクティス

### すべきこと

- Phase 1で必ずスナップショット戦略（解像度、デバイス、ブラウザ）を明確化する
- `references/Level1_basics.md` で基本概念を理解してから実装を開始
- `references/Level2_intermediate.md` で実務的な注意点を把握
- 可視的変更（UI更新、レイアウト変更）と非可視的変更（内部ロジック）を区別
- テストが失敗した場合、diff画像を詳細にレビューしてから承認
- CI/CDパイプラインでの自動実行を早期に設定
- false positive削減のための除外設定（タイムスタンプ、動的要素）を検討
- `references/visual-testing-best-practices.md` で最適実装パターンを確認

### 避けるべきこと

- スクリーンサイズの一種類のみでテストすること（複数デバイス対応が重要）
- 全ページ・全コンポーネントを無差別にテストすること（テスト保守性の低下）
- アニメーション・遷移要素を差分検出の対象に含めること（false positiveの原因）
- ベースラインスナップショットを十分なレビューなく承認すること
- テスト成功=品質保証ではなく、視覚的リグレッション防止のみという限界を認識する
- アンチパターンや注意点を確認せずに進めることを避ける

## リソース参照

### references/ - 学習・実装ガイド

| ファイル                                            | 対象レベル | 概要                                                             |
| --------------------------------------------------- | ---------- | ---------------------------------------------------------------- |
| `Level1_basics.md`                                  | 基礎       | ビジュアルテストの概念、基本的なセットアップ、簡単な実装例       |
| `Level2_intermediate.md`                            | 実務       | Playwrightの詳細な使用法、ベストプラクティス、実装チェックリスト |
| `Level3_advanced.md`                                | 応用       | CI/CD統合、パフォーマンス最適化、複雑なシナリオ処理              |
| See [Level4_expert.md](references/Level4_expert.md) | 専門       | カスタム差分アルゴリズム、エンタープライズ導入戦略               |
| `screenshot-strategies.md`                          | 実装       | スナップショット撮影の戦略、解像度・デバイス・ブラウザ選定       |
| `visual-testing-best-practices.md`                  | 実装       | アンチパターン、テスト保守性、false positive削減                 |
| `legacy-skill.md`                                   | 参考       | 旧スキル定義の全文（互換性確認用）                               |

### scripts/ - 自動化スクリプト

| スクリプト                        | 目的               | 用途                                 |
| --------------------------------- | ------------------ | ------------------------------------ |
| `validate-skill.mjs`              | スキル構造検証     | Phase 3での品質確認、CI/CD統合前     |
| `log_usage.mjs`                   | 使用記録・自動評価 | スキル実行の記録保存、メトリクス収集 |
| `update-baseline-screenshots.mjs` | ベースライン更新   | 承認された変更の自動反映             |

### assets/ - テンプレート・サンプル

| ファイル                  | 説明                                                      |
| ------------------------- | --------------------------------------------------------- |
| `visual-test-template.ts` | Playwright/Vite用ビジュアルテストテンプレート、実装の雛形 |

### コマンドリファレンス

**リソース確認**:

```bash
cat .claude/skills/visual-regression-testing/references/Level1_basics.md
cat .claude/skills/visual-regression-testing/references/Level2_intermediate.md
cat .claude/skills/visual-regression-testing/references/screenshot-strategies.md
cat .claude/skills/visual-regression-testing/references/visual-testing-best-practices.md
```

**スクリプト実行**:

```bash
node .claude/skills/visual-regression-testing/scripts/validate-skill.mjs
node .claude/skills/visual-regression-testing/scripts/log_usage.mjs
node .claude/skills/visual-regression-testing/scripts/update-baseline-screenshots.mjs
```

**テンプレート参照**:

```bash
cat .claude/skills/visual-regression-testing/assets/visual-test-template.ts
```

## 変更履歴

| Version | Date       | Changes                                                                                                                                                                              |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様への準拠: frontmatter更新（name, description, allowed-tools）、Trigger日本語化、Task仕様ナビテーブル追加、リソース参照セクション統合・詳細化、ベストプラクティス拡充 |
