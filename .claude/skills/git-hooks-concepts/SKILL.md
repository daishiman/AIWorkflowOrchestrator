---
name: git-hooks-concepts
description: |
  Git Hooksの基本概念、ライフサイクル、実装パターンを提供し、コミット前のコード品質チェックとプッシュ前のテスト自動化を実現するスキル。

  Anchors:
  • Git Hooks基本フレームワーク / 適用: クライアント側フック設計 / 目的: コード品質の段階的チェック自動化
  • 実装パターン集（Prettier+ESLint、型チェック、テスト検証） / 適用: プロジェクト固有の検証ワークフロー構築 / 目的: 一貫性のある自動化スクリプト実装

  Trigger:
  Git Hooksを実装してコミット前のコード品質チェックを自動化したい時、またはプッシュ前のテスト実行を強制したい時に使用する。発動キーワード：pre-commit、pre-push、フック、Git自動化、コード品質チェック。
allowed-tools:
  - bash
  - git
  - node
---

# Git Hooks 概念

## 概要

Git Hooksの基本概念、ライフサイクル、実装パターンを提供するスキル。クライアント側フック（pre-commit、pre-push）の設計・実装・検証を支援し、コード品質チェックとテスト自動化を実現します。

## ワークフロー

### Phase 1: 目的と前提条件の確認

**目的**: タスクの目的と前提条件を明確にし、どのレベル・リソースが必要かを特定する

**アクション**:

1. タスクの目的を言語化（「コミット前のコード品質チェック」「プッシュ前のテスト実行」など）
2. 現在の実装レベルを確認（基礎/実務/応用/専門）
3. 必要なリソース（テンプレート、参照、スクリプト）を特定

### Phase 2: スキル指針に従った実装

**目的**: スキルの知識体系と実装パターンを活用して具体的な作業を実施

**アクション**:

1. 対応するレベルのリソースを読取（Level1_basics.md から Level4_expert.md）
2. hook-types-reference.md でフック種類を確認
3. implementation-patterns.md から目的に合うパターンを選択・適用
4. テンプレート（pre-commit-template.sh / pre-push-template.sh）をカスタマイズ
5. 重要な決定点や検証項目をメモに記録

### Phase 3: 検証と実行記録

**目的**: 成果物の正確性と動作確認、フィードバックループへの記録

**アクション**:

1. scripts/validate-git-hooks.mjs でGit Hooks設定を検証
2. テンプレートが目的の検証ルールを網羅しているか確認
3. scripts/log_usage.mjs で使用実績を記録（フィードバックループへの組み込み）

## Task仕様ナビ

本スキルは段階的学習（Progressive Disclosure）に対応。タスクの目的と現状に応じてリソースを読み込む：

| 使用場面                                                          | 対応リソース                                                                  | 読み込みタイミング                       | 成果物例                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------- |
| Git Hooksの基本を学び、簡単なpre-commitを実装したい               | `references/Level1_basics.md` + `assets/pre-commit-template.sh`            | Phase 1で確認、Phase 2で参照             | .git/hooks/pre-commit スクリプト   |
| Prettier/ESLint/型チェック等の複数検証を統合したい                | `references/Level2_intermediate.md` + `references/implementation-patterns.md` | 複雑な統合が必要と判断時                 | 統合pre-commitスクリプト           |
| カスタム検証ルール、エラーハンドリング、ロギングを実装したい      | `references/Level3_advanced.md` + `references/hook-types-reference.md`        | パフォーマンス最適化や複雑なルール適用時 | カスタム検証フック群               |
| 企業向けポリシーベースのフック設計、フェーズ分割、複数フック運用  | `references/Level4_expert.md`                                                 | 大規模チーム向けの統一化が必要な場合     | フック運用ガイド、ポリシー文書     |
| フック種類の詳細（仕様・トリガータイミング・制約）                | `references/hook-types-reference.md`                                          | フック種類の理解が不足している時         | フック選択根拠の説明文             |
| すぐに使える実装パターン（10種類：Prettier+ESLint、型チェック等） | `references/implementation-patterns.md`                                       | 実装パターン選択時・カスタマイズ時       | カスタマイズされたフックスクリプト |

## ベストプラクティス

### すべきこと

- **目的を明確にして使用**: 「コミット前のコード品質チェック」「プッシュ前のテスト実行」など、具体的なユースケースから始める
- **段階的に複雑化**: Level1_basics で基本を確認してから、必要に応じてより高度なパターンを適用する
- **テンプレートをカスタマイズ**: 提供テンプレートをプロジェクト固有のルールに合わせて調整する
- **バリデーション結果を記録**: スクリプト実行後、成果物の妥当性を確認し log_usage.mjs で記録する
- **複数フックの組み合わせ**: pre-commit と pre-push を役割で分け、重複チェックを避ける

### 避けるべきこと

- **パターンを選ばずに実装**: implementation-patterns.md で代表的なパターンを確認してから実装する（未検証のアプローチを避ける）
- **フックの重複実装**: pre-commit と pre-push で同じ検証を繰り返さない
- **エラーハンドリングを軽視**: フック実行失敗時の通知やロールバック戦略を検討なしに進める
- **パフォーマンス無視**: 検証が遅いとフックがスキップされるリスク。Level3_advanced.md でパフォーマンス最適化を参照する
- **ドキュメント化を省く**: 実装後、チームメンバーが理解できるようにコメントや手順書を作成する

## リソース参照

### 参照資料（references/）

以下の参照資料を、タスクの段階と目的に応じて読み込む（すべてを一度に読む必要なし）：

- **references/Level1_basics.md**: Git Hooks基本概念と簡単なpre-commit実装
- **references/Level2_intermediate.md**: 複数ツール（Prettier/ESLint/型チェック）の統合
- **references/Level3_advanced.md**: パフォーマンス最適化、カスタムルール、エラーハンドリング
- **references/Level4_expert.md**: 企業向けポリシーベース設計、運用ガイド
- **references/hook-types-reference.md**: Gitフック全種類の詳細仕様（pre-commit / pre-push / prepare-commit-msg等）
- **references/implementation-patterns.md**: 10種類の実装パターン集（Prettier+ESLint、Conventional Commits検証、テスト実行等）

### スクリプト（scripts/）

- **scripts/validate-git-hooks.mjs**: Git Hooks設定と実装の正確性を検証
- **scripts/log_usage.mjs**: 実行実績をLOGS.mdに記録し、フィードバックループに組み込む
- **scripts/validate-skill.mjs**: スキルの構造（frontmatter、ファイル整合性）を検証

### テンプレート（assets/）

- **assets/pre-commit-template.sh**: pre-commitフックのテンプレート（カスタマイズして使用）
- **assets/pre-push-template.sh**: pre-pushフックのテンプレート（カスタマイズして使用）

## 変更履歴

| バージョン | 日付       | 変更内容                                                                                                                                    |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.0.0      | 2025-12-31 | 18-skills.md仕様に準拠: frontmatter整理（name、description、Anchors/Trigger）、Task仕様ナビ追加、ベストプラクティス詳細化、リソース参照整理 |
| 1.0.0      | 2025-12-24 | 初期リリース: スキル構造検証と成果物定義の確立                                                                                              |
