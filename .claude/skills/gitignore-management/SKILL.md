---
name: .claude/skills/gitignore-management/SKILL.md
description: |
  .gitignore設計と管理スキル。機密ファイルパターン、プロジェクト固有除外、
  プラットフォーム別パターン、.gitignore検証手法を提供します。

  📖 参照書籍:
  - 『Pro Git』（Scott Chacon）: ブランチ戦略と履歴管理
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善

  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `references/pattern-library.md`: パターンライブラリの詳細ガイド
  - `references/requirements-index.md`: 要求仕様の索引

  ## トリガー
  - 「.gitignoreを設計したい」「gitignoreを最適化したい」という場合
  - 機密ファイルの除外パターンを設定したい場合
  - プロジェクト固有の除外ルールが必要な場合
  - .gitignoreの完全性と正確性を検証したい場合
  - クロスプラットフォーム対応の除外パターンが必要な場合

  ## アンカー
  - #設計: .gitignoreの正しい設計方法
  - #パターン: 除外パターンの書き方と最適化
  - #検証: .gitignoreの検証とテスト
  - #セキュリティ: 機密ファイル・パターンの管理
  - #保守性: .gitignoreの長期メンテナンス

version: 1.0.0
level: 1
last_updated: 2025-12-31
allowed-tools:
  - Glob
  - Grep
  - Read
  - Edit
  - Write
  - Bash
references:
  - book: "Pro Git"
    author: "Scott Chacon"
    concepts:
      - "ブランチ戦略"
      - "履歴管理"
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# .gitignore 管理スキル

## 概要

.gitignore設計と管理スキル。機密ファイルパターン、プロジェクト固有除外、
プラットフォーム別パターン、.gitignore検証手法を提供します。

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

| タスク                       | 説明                                                     | 参照リソース                               | 活用ツール       |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------ | ---------------- |
| .gitignore新規作成           | プロジェクト用の.gitignoreファイルを一から設計           | Level1_basics.md, pattern-library.md       | Edit, Write      |
| 機密パターン追加             | API キー、パスワード、秘密情報の除外パターンを追加       | Level2_intermediate.md                     | Grep, Edit       |
| プロジェクト固有パターン設計 | フレームワーク・ツール固有の一時ファイル・キャッシュ除外 | Level2_intermediate.md, pattern-library.md | Read, Edit       |
| .gitignore検証・テスト       | パターンの正確性と完全性を検証                           | Level3_advanced.md                         | Bash, Grep       |
| クロスプラットフォーム対応   | Windows/Mac/Linux別の除外パターン統合                    | Level3_advanced.md                         | Read, Edit       |
| パターン最適化               | 既存パターンの重複排除と効率化                           | Level4_expert.md                           | Bash, Grep, Edit |
| .gitignore監査               | リポジトリ全体の除外漏れを検査                           | Level4_expert.md                           | Bash, Glob       |

## ベストプラクティス

### すべきこと

- **パターン設計時**:
  - 機密ファイル（.env、秘密鍵、API キー）を最初に除外パターンに含める
  - プロジェクト固有のビルド出力・キャッシュ・一時ファイルを明確に列挙する
  - クロスプラットフォーム対応（エディタ別、OS別の除外）を考慮する

- **検証・管理時**:
  - 新規パターン追加時は `scripts/validate-gitignore.mjs` で検証を実施する
  - 定期的に誤って追跡されたファイルがないか監査する
  - プロジェクト全体とグローバル .gitignore の統合を確認する

- **チーム運用時**:
  - .gitignore の変更は明確なコミットメッセージで記録する
  - テンプレートを使用してプロジェクト初期化時の標準化を実現する
  - ドキュメント（README、wiki）に重要な除外パターンの説明を記載する

### 避けるべきこと

- **パターン設計の誤り**:
  - ワイルドカード `*` だけで除外パターンを定義しない（予期しないファイルまで除外される可能性）
  - 深くネストされたパターンを過度に指定しない（パフォーマンスと保守性の低下）
  - 特定のディレクトリを除外しながらその中の一部ファイルを追跡する矛盾した設定

- **セキュリティの誤り**:
  - 既に追跡済みの機密ファイルを後から .gitignore に追加しただけ（履歴から削除が必要）
  - グローバル .gitignore の確認・活用なしに .gitignore を作成する
  - ビルド成果物に含まれる認証情報をチェックなしで除外する

- **管理・保守の誤り**:
  - 不要になったパターンの削除忘れ（技術的負債の蓄積）
  - パターンの意図や背景をドキュメント化しない
  - アンチパターンや注意点の確認なしに進める

## リソース参照

### 学習リソース

- **基礎**: `references/Level1_basics.md` - .gitignore の基本構文とパターン設計
- **実務**: `references/Level2_intermediate.md` - プロジェクト別の実装パターン
- **応用**: `references/Level3_advanced.md` - 複雑な除外パターンと最適化
- **専門**: `references/Level4_expert.md` - パフォーマンス・セキュリティ考慮事項
- **レガシー**: `references/legacy-skill.md` - 旧SKILL.mdの全文
- **パターン集**: `references/pattern-library.md` - 実績のあるパターンライブラリ
- **要求仕様**: `references/requirements-index.md` - プロジェクト要求と仕様

### スクリプトと検証ツール

```bash
# .gitignore パターン検証
node .claude/skills/gitignore-management/scripts/validate-gitignore.mjs --help

# 使用記録と自動評価
node .claude/skills/gitignore-management/scripts/log_usage.mjs --help

# スキル構造検証
node .claude/skills/gitignore-management/scripts/validate-skill.mjs --help
```

### テンプレートと例

- `.gitignore テンプレート`: `assets/gitignore-template.txt`
  - Node.js/npm プロジェクト
  - Python プロジェクト
  - IDE・エディタ固有ファイル
  - OS 固有ファイル

## 変更履歴

| Version | Date       | Changes                                                                   |
| ------- | ---------- | ------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md 仕様に準拠した完全更新（Trigger、Anchors、Task仕様ナビ追加） |
