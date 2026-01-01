---
name: github-actions-security
description: |
  GitHub Actionsワークフローのセキュリティ強化スキル。Repository/Environment Secretsの安全管理、ログマスキング、品質ゲート統合、CI/CDパイプラインの脅威対策を行う。

  Anchors:
  • Web Application Security / 適用: 脅威モデリングと設計原則 / 目的: セキュア設計の基盤
  • GitHub Actions Security Pattern / 適用: ワークフロー実装 / 目的: 実装時の判断軸
  • OWASP Top 10 / 適用: CI/CDセキュリティリスク評価 / 目的: リスク優先度の決定

  Trigger:
  GitHub Actionsワークフローのセキュリティ問題を診断・修正する、Environment SecretsとRepository Secretsを安全に設定する、ログマスキングとシークレット露出防止を実装する、CI/CDパイプラインに品質ゲートを統合する場合に使用。

allowed-tools:
  - bash
  - node
  - github-actions
  - yaml
---

# GitHub Actions Security

## 概要

GitHub Actionsワークフローのセキュリティを包括的に強化するスキル。Environment SecretsとRepository Secretsの安全な管理、機密情報のログマスキング、CI/CDパイプラインへの品質ゲート統合、脅威モデリングに基づくセキュリティ設計を行う。詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的とセキュリティ要件を明確化

**アクション**:

1. セキュリティ監査対象のワークフローを把握
2. `references/Level1_basics.md` でGitHub Actionsセキュリティの基礎を確認
3. 脅威モデリングと適用するセキュリティパターンを特定

### Phase 2: セキュリティ実装

**目的**: 関連リソースに基づいて具体的なセキュリティ対策を実装

**アクション**:

1. `references/Level2_intermediate.md` を参照し実装パターンを確認
2. `references/workflow-security-patterns.md` で利用可能なパターンを検討
3. `assets/github-actions-deploy-template.yml` をベースにセキュアなワークフローを構築
4. Environment Secrets、ログマスキング、権限管理を実装

### Phase 3: 検証と記録

**目的**: セキュリティ実装の検証と改善記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でワークフロー構造を確認
2. 実装したセキュリティ対策が要件に合致するか確認
3. `scripts/log_usage.mjs --result success --phase "security-hardening"` で改善を記録

## Task仕様ナビ

以下の表は本スキルで対応するセキュリティタスクのナビゲーション。各タスクの詳細な仕様は対応するリソースファイルを参照。

| Task名                   | 入力                                   | 出力                                                 | 参照リソース              | 制約                                 |
| ------------------------ | -------------------------------------- | ---------------------------------------------------- | ------------------------- | ------------------------------------ |
| **環境シークレット設定** | ワークフローファイル、シークレット一覧 | Environment/Repository Secretsの設定済みワークフロー | Level2, workflow-patterns | 機密情報はログに出力しない           |
| **ログマスキング実装**   | ワークフローステップ、出力内容         | マスキング設定済みのYAML                             | Level2, workflow-patterns | すべてのシークレット値を保護         |
| **品質ゲート統合**       | 既存ワークフロー、品質基準             | 品質ゲート付きのワークフロー                         | Level3, workflow-patterns | 脆弱性スキャン結果を失敗条件に含める |
| **権限管理と監査**       | IAM設定、ワークフロー                  | 最小権限の原則を適用したセットアップ                 | Level3, Level4            | 過度な権限付与を防止                 |
| **脅威モデリング**       | 現在のワークフロー、ビジネス要件       | リスク評価レポート、対策優先度リスト                 | Level3, OWASP参考         | OWASPフレームワークに準拠            |

## ベストプラクティス

### すべきこと

- GitHub Actionsワークフローに含まれるすべてのシークレット（API キー、トークン、認証情報）を Environment Secrets または Repository Secrets で管理する
- `add-mask` を使用してログ出力時に機密情報をマスキングする
- ワークフローの実行権限を最小権限の原則に基づいて設定する
- 外部アクション（third-party actions）は信頼できるメンテナンス状況にあるもののみを使用する
- `workflow_dispatch` による手動トリガーは明示的な承認プロセスと組み合わせる
- `allow` リストを使用してどの環境にデプロイできるかを制限する
- CI/CDパイプラインに脆弱性スキャン、SAST/DAST、依存関係チェックを統合する
- 定期的にワークフローのセキュリティ監査を実施し、`references/Level3_advanced.md` で新しい脅威パターンを確認する

### 避けるべきこと

- ワークフロー内に平文でシークレット（パスワード、トークン、API キー）を記述しない
- 信頼できないリポジトリから提供されたアクションを使用しない
- `secrets.GITHUB_TOKEN` を不必要な権限で使用しない
- 本番環境へのデプロイを手動トリガーのみで行い、自動実行にしない
- ログマスキングなしでシークレット値を出力する
- リリース・本番デプロイのワークフローに適切な品質ゲートなしで進める
- セキュリティ設定をドキュメント化しないまま運用する
- 「古い」または「非推奨」のアクションを使用し続ける

## リソース参照

### 基礎から応用まで段階的に学ぶ

- **基礎レベル**: [references/Level1_basics.md](references/Level1_basics.md) - GitHub Actionsセキュリティの基本概念
- **実務レベル**: [references/Level2_intermediate.md](references/Level2_intermediate.md) - Environment Secrets、ログマスキング、権限管理の実装
- **応用レベル**: [references/Level3_advanced.md](references/Level3_advanced.md) - 脅威モデリング、高度なワークフロー設計
- **専門レベル**: [references/Level4_expert.md](references/Level4_expert.md) - エンタープライズセキュリティ、コンプライアンス対応

### ドメイン別参考資料

- **ワークフロー設計パターン**: [references/workflow-security-patterns.md](references/workflow-security-patterns.md) - 実装可能なセキュリティパターンの全カタログ
- **要求仕様索引**: [references/requirements-index.md](references/requirements-index.md) - セキュリティ要件の公式仕様
- **レガシーリソース**: [references/legacy-skill.md](references/legacy-skill.md) - 過去のアプローチと判断基準

### スクリプトとテンプレート

- **ワークフロー検証**: `scripts/validate-skill.mjs` - ワークフロー構造と設定の妥当性をチェック
- **使用記録**: `scripts/log_usage.mjs` - セキュリティ実装の履歴と改善点を記録
- **デプロイテンプレート**: [assets/github-actions-deploy-template.yml](assets/github-actions-deploy-template.yml) - セキュアなCI/CDパイプラインの基本テンプレート

## 変更履歴

| Version | Date       | Changes                                                                     |
| ------- | ---------- | --------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様へ準拠: Anchors/Trigger統合、Task仕様ナビ追加、日本語化完成 |
| 1.0.0   | 2025-12-24 | 初版: GitHub Actionsセキュリティの基本仕様                                  |
