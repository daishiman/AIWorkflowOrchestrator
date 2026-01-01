---
name: file-watcher-security
description: |
  ファイル監視システムのセキュリティ対策とプロダクション環境での安全な運用パターン。
  最小権限の原則、Defense in Depth、Fail-Safe Defaultsに基づく多層防御設計を提供。

  Anchors:
  • パストトラバーサル対策 / 適用: ファイルパス検証とシンボリックリンク処理 / 目的: 監視対象外ディレクトリへのアクセスを防止
  • 権限管理 / 適用: 最小権限の原則に基づくプロセス権限設定 / 目的: 監視プロセスの権限を制限し、侵害時の影響範囲を最小化
  • 脅威モデリング / 適用: 多層防御アーキテクチャ設計 / 目的: 予測可能な脅威シナリオに対応した多段階防御を構築

  Trigger:
  ファイル監視システムのセキュリティ対策、パストトラバーサル攻撃・シンボリックリンク攻撃の防止、マルチテナント環境でのセキュアな監視実装が必要な場面で活用。
allowed-tools:
  - node
  - typescript
  - shell-script
  - security-tools
tags:
  - file-watcher
  - security
  - defense-in-depth
  - path-traversal
  - symlink-attack
  - multi-tenant
  - access-control
dependencies:
  - event-driven-file-watching
  - file-exclusion-patterns
version: 1.1.0
level: 1
last_updated: 2025-12-31
references:
  - book: "Web Application Security"
    author: "Andrew Hoffman"
    concepts:
      - "脅威モデリング"
      - "セキュア設計"
---

# File Watcher Security

## 概要

ファイル監視システムのセキュリティ対策とプロダクション環境での安全な運用パターン。
最小権限の原則、Defense in Depth、Fail-Safe Defaultsに基づく多層防御設計を提供する。パストトラバーサル攻撃・シンボリックリンク攻撃を防止し、マルチテナント環境での安全な実装を実現する。詳細は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

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

| タスク                 | 説明                                                           | 入力                             | 出力                             | 参照                           |
| ---------------------- | -------------------------------------------------------------- | -------------------------------- | -------------------------------- | ------------------------------ |
| パス検証設計           | ファイルパスの正規化・検証・サニタイゼーションロジックを設計   | 監視対象パターン・除外条件       | 検証関数・テストケース           | `references/path-validation.md` |
| シンボリックリンク対策 | シンボリックリンク攻撃を防止する検証・フィルタロジックを実装   | ファイルメタデータ・親子関係情報 | リンク検証ロジック・監視ポリシー | `references/symlink-defense.md` |
| 権限管理設計           | 最小権限の原則に基づくプロセス権限・ファイル権限を設計         | 環境・脅威モデル                 | RBAC設定・権限ドキュメント       | `references/access-control.md`  |
| 脅威モデリング         | 多層防御アーキテクチャ・想定脅威シナリオ・防御メカニズムを設計 | システム要件・セキュリティ基準   | 脅威モデル・防御設計図           | `references/threat-model.md`    |
| セキュリティ監査       | 実装のセキュリティレビュー・脆弱性テスト・コンプライアンス確認 | 実装コード・設定ファイル         | 監査レポート・改善提案           | `scripts/security-audit.sh`    |

## ベストプラクティス

### すべきこと

- マルチテナント環境でファイル監視を実装する際、入力値を厳密に検証する
- パストトラバーサル対策として、ファイルパスを正規化し、許可リスト方式で検証
- シンボリックリンクをリゾルブせず、リンク自体を除外または監視対象外とする
- 最小権限の原則を適用し、監視プロセスの実行権限を制限
- Defense in Depth 設計により複数の防御層を配置
- 本番環境デプロイ前にセキュリティ監査を実施

### 避けるべきこと

- ユーザー入力や環境変数をパス指定に直接使用（検証なし）
- シンボリックリンクを透過的にフォロー（リンク攻撃の対象に）
- 広い権限でプロセスを実行（侵害時の被害拡大につながる）
- 単層防御に依存（防御層が突破された場合の脆弱性）
- アンチパターンや注意点を確認せずに進めることを避ける

## リソース参照

### 詳細ガイド

詳細な手順・ベストプラクティス・実装パターンは以下を参照してください：

- **基礎知識**: `references/Level1_basics.md` - ファイル監視セキュリティの基本概念・攻撃パターン
- **実務パターン**: `references/Level2_intermediate.md` - 実装パターン・防御設計
- **応用テクニック**: `references/Level3_advanced.md` - 高度なセキュリティ対策・パフォーマンス最適化
- **エキスパート知識**: `references/Level4_expert.md` - コンプライアンス・エンタープライズ導入

### ドメイン別リソース

- **パス検証**: `references/path-validation.md` - パスの正規化・検証ロジック・サニタイゼーション
- **シンボリックリンク対策**: `references/symlink-defense.md` - リンク検出・フィルタリング・監視ポリシー
- **アクセス制御**: `references/access-control.md` - 最小権限設定・RBAC・ファイル権限管理
- **脅威モデリング**: `references/threat-model.md` - 想定脅威・防御メカニズム・多層防御設計
- **要求仕様**: `references/requirements-index.md` - 要求仕様の索引（docs/00-requirements と同期）

### テンプレート・スクリプト

- **セキュアウォッチャー**: `assets/secure-watcher.ts` - パス検証・権限管理を組み込んだ監視実装テンプレート
- `scripts/validate-skill.mjs` - スキル構造検証
- `scripts/log_usage.mjs` - スキル使用記録・フィードバック記録
- `scripts/security-audit.sh` - セキュリティ監査スクリプト

## 変更履歴

| Version | Date       | Changes                                                                                                                                                       |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に基づき更新。YAML frontmatter改訂（Anchors・Trigger・allowed-tools追加）。Task仕様ナビテーブル追加。コマンドリファレンスをリソース参照に統合 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                                                                                   |
