---
name: prompt-injection-defense
description: |
  AIシステムへのプロンプトインジェクション攻撃を防ぎ、入力検証とコンテキスト分離の設計指針を提供。

  Anchors:
  • OWASP LLM Top 10 / 適用: LLMセキュリティ脅威モデリング / 目的: インジェクション攻撃の分類と防御パターン理解
  • Simon Willison's Prompt Injection Research / 適用: 実攻撃パターン分析 / 目的: 実世界の攻撃事例から防御戦略を導出

  Trigger:
  Use when designing prompt injection defenses, implementing AI security measures, sanitizing user inputs for LLM systems, separating trusted and untrusted contexts, conducting security reviews for LLM applications, mitigating indirect prompt injection risks.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
tags:
  - security
  - llm
  - prompt-injection
  - input-validation
---

# プロンプトインジェクション対策

## 概要

AIシステムへのプロンプトインジェクション攻撃を防ぎ、入力検証とコンテキスト分離の設計指針を提供するスキル。攻撃パターンの識別、防御メカニズムの選択、安全なプロンプト設計の実装をサポート。

詳細な手順と背景知識は `references/` ディレクトリのレベル別ガイドを参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にしてから対策設計を開始する

**アクション**:

1. `references/Level1_basics.md` で基本概念を確認
2. `references/Level2_intermediate.md` で実務パターンを理解
3. 対象システムの入力フロー、データフロー、コンテキスト分離方針を把握

### Phase 2: 対策設計・実装

**目的**: スキルの指針に従って具体的な防御メカニズムを設計・実装

**アクション**:

1. `references/Level3_advanced.md` で応用パターンを参照しながら設計を進める
2. 入力検証スキーム、プロンプト構造化、コンテキスト分離の実装方針を決定
3. 重要な判断ポイント（攻撃パターン分類、防御戦略の選択）をメモ

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 設計が安全原則に合致しているか（defense-in-depth, fail-secure）確認
3. `scripts/log_usage.mjs` を実行してフィードバック記録を保存

## Task仕様ナビ

各Taskは専門的な役割を持ち、段階的に実行されます。Task仕様書は `agents/` ディレクトリに配置され、必要時にのみ読み込まれます。

| Task                                                   | 役割                                 | 入力                             | 出力                                   | 参照リソース                                                       |
| ------------------------------------------------------ | ------------------------------------ | -------------------------------- | -------------------------------------- | ------------------------------------------------------------------ |
| [agents/threat-modeling.md](agents/threat-modeling.md) | 脅威モデリングと攻撃面の特定         | システムアーキテクチャ、入力仕様 | 脅威モデル、攻撃パターン分類           | `references/Level1_basics.md`, `references/Level2_intermediate.md` |
| [agents/defense-design.md](agents/defense-design.md)   | 多層防御戦略の設計と実装パターン選択 | 脅威モデル                       | 防御メカニズム設計書、実装ガイドライン | `references/Level3_advanced.md`, `references/Level4_expert.md`     |
| [agents/validation.md](agents/validation.md)           | セキュリティ設計の検証と評価         | 防御設計書                       | 検証レポート、改善推奨事項             | `scripts/validate-skill.mjs`, `assets/defense-checklist.md`        |

**実行順序**: threat-modeling → defense-design → validation の順に進める（各Taskは前Taskの出力を入力として受け取る）

## ベストプラクティス

### すべきこと

- システムアーキテクチャ全体を把握した上で対策設計を進める
- 入力検証、出力エスケープ、プロンプト構造化を多層防御（defense-in-depth）で組み合わせる
- 既知の攻撃パターン（プロンプト置換、指示上書き、チェーン攻撃）への対策を明示的に含める
- セキュリティ設計のレビューを他チームと共有し、見落としを減らす
- `references/Level4_expert.md` で最新の攻撃トレンドと対策を定期的に確認する

### 避けるべきこと

- 単一の対策方法に依存すること（例：入力検証だけで完全に防止できると信じる）
- ユーザー入力と信頼できるシステムプロンプトの境界が曖昧なまま実装を進める
- セキュリティレビュー時に攻撃パターンと対策の対応関係が不明確なまま
- `references/` の最新情報確認をスキップして古い前提で設計を続ける

## リソース参照

### 参照資料（References）

詳細な知識と実装パターンは以下の参照資料に外部化されています。必要に応じて読み込んでください：

- **[references/Level1_basics.md](references/Level1_basics.md)**: プロンプトインジェクション攻撃の基本分類、防御の全体像
- **[references/Level2_intermediate.md](references/Level2_intermediate.md)**: 実務的な防御パターン、入力検証・出力エスケープの実装指針
- **[references/Level3_advanced.md](references/Level3_advanced.md)**: 高度な攻撃パターン、複雑なシステムでの多層防御設計
- **[references/Level4_expert.md](references/Level4_expert.md)**: 最新のセキュリティトレンド、新種の攻撃パターン、研究論文の参照

### スクリプト（Scripts）

自動検証とフィードバック記録のためのスクリプト：

- `scripts/validate-skill.mjs`: スキル構造の検証

  ```bash
  node .claude/skills/prompt-injection-defense/scripts/validate-skill.mjs
  ```

- `scripts/log_usage.mjs`: 使用記録とフィードバックの記録
  ```bash
  node .claude/skills/prompt-injection-defense/scripts/log_usage.mjs \
    --result {{success|failure}} \
    --phase "Phase 1|Phase 2|Phase 3" \
    --notes "フィードバック内容"
  ```

## 変更履歴

| Version | Date       | Changes                                                                             |
| ------- | ---------- | ----------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に準拠：Task仕様ナビテーブル追加、frontmatter統一、トリガー日本語化 |
| 1.0.0   | 2025-12-24 | 初版：基本ワークフロー、ベストプラクティス定義                                      |
