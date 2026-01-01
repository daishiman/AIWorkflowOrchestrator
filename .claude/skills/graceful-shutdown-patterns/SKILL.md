---
name: graceful-shutdown-patterns
description: |
  Node.jsアプリケーションのGraceful Shutdown実装を専門とするスキル。
  Twelve-Factor Appの「廃棄容易性」原則に基づき、優雅なプロセス終了、
  リソースクリーンアップ、接続ドレイン、タイムアウト処理を設計します。

  **Anchors (参照ポイント)**:
  - L1: 基礎的なシグナルハンドリング
  - L2: リソースクリーンアップとドレイン処理
  - L3: 複合システムでのシャットダウン設計
  - L4: エンタープライズレベルのフェイルセーフ

  **Triggers (発動条件)**:
  - Node.jsアプリケーションの終了処理を設計する時
  - リソースリークを防ぐクリーンアップを実装する時
  - ゼロダウンタイムデプロイを実現する時
  - PM2やDocker環境でのgraceful reload設定時
  - SIGTERMやSIGINTシグナル処理が必要な時

allowed-tools:
  - read-file
  - grep
  - bash
  - code-editor

version: 2.0.0
level: 2
last_updated: 2025-12-31
anchors:
  - L1
  - L2
  - L3
  - L4
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# Graceful Shutdown Patterns

## 概要

Node.jsアプリケーションのGraceful Shutdown実装を専門とするスキル。Twelve-Factor Appの「廃棄容易性」原則に基づき、優雅なプロセス終了、リソースクリーンアップ、接続ドレイン、タイムアウト処理を設計します。詳細な手順や背景は各リソースレベルを参照してください。

## Task仕様ナビ

| タスク                       | Anchor | フェーズ | リソース               | 目的                               |
| ---------------------------- | ------ | -------- | ---------------------- | ---------------------------------- |
| 基本的なシグナルハンドリング | L1     | 1-2      | Level1_basics.md       | SIGTERMとSIGINTの処理方法を学習    |
| リソースクリーンアップ設計   | L2     | 2-3      | resource-cleanup.md    | DB接続やストリームのクローズ方法   |
| 接続ドレイン実装             | L2     | 2-3      | connection-draining.md | 既存リクエストの完了待機           |
| シャットダウンシーケンス     | L3     | 2-3      | shutdown-sequence.md   | 段階的な終了処理の順序設計         |
| シャットダウン戦略選択       | L3     | 1-2      | shutdown-strategies.md | タイムアウト、フォースキル、再起動 |
| エンタープライズパターン     | L4     | 3        | Level4_expert.md       | 複雑なシステムでの実装             |

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

## ベストプラクティス

### すべきこと

- アプリケーションの終了処理を設計する時に各Levelのリソースを段階的に参照する
- リソースリークを防ぐクリーンアップを実装する時にresource-cleanup.mdを参照する
- ゼロダウンタイムデプロイを実現する時にconnection-draining.mdを確認する
- PM2やDocker環境でのgraceful reload設定時にshutdown-strategies.mdを参照する
- SIGTERMやSIGINTシグナル処理時にLevel1_basics.mdから学習を開始する
- 複雑なシステムの場合はLevel3_advanced.mdとLevel4_expert.mdで実装パターンを確認する

### 避けるべきこと

- シグナルハンドリングなしで即座にプロセスを終了させる
- リソースの明示的なクローズなしにアプリケーションを終了させる
- 既存リクエストの完了を待たずに接続を切断する
- タイムアウトなしに無限待機させる
- エラーハンドリングなしにシャットダウンシーケンスを実装する
- アンチパターンや注意点を確認せずに進めることを避ける

## リソース参照

### 学習リソース（段階的学習）

- **Level1_basics.md**: シグナルハンドリングの基礎とプロセス終了の基本
- **Level2_intermediate.md**: リソースクリーンアップと接続ドレインの実装
- **Level3_advanced.md**: 複合システムでのシャットダウン設計
- **Level4_expert.md**: エンタープライズレベルのフェイルセーフと監視

### 実装リソース（テーマ別）

- **connection-draining.md**: HTTP接続の段階的クローズとリクエスト完了待機
- **resource-cleanup.md**: DB接続、ファイルハンドル、ストリームのクローズ
- **shutdown-sequence.md**: シャットダウン処理の段階的実行順序
- **shutdown-strategies.md**: タイムアウト、フォースキル、再起動の戦略選択

### 実装テンプレート

- **graceful-shutdown.template.ts**: 基本的なGraceful Shutdown実装テンプレート
- **shutdown-manager.ts**: 複数リソースの管理スキームテンプレート

### 検証スクリプト

- **validate-skill.mjs**: スキル構造とリソースの整合性確認
- **test-graceful-shutdown.mjs**: Graceful Shutdown実装のテスト
- **log_usage.mjs**: スキル使用記録と自動評価

## 変更履歴

| Version | Date       | Changes                                                                                                                                                    |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様に準拠。YAML frontmatterに allowed-tools と anchors を追加、Task仕様ナビテーブルを追加、リソース参照を再構成、日本語による Triggers を追加 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                                                                                |
