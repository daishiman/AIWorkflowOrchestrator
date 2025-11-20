# AIWorkflowOrchestrator

AI開発ワークフロー管理システム

## ブランチ戦略

- `main`: 本番環境用ブランチ
- `develop`: 開発統合用ブランチ
- `feature/*`: 機能開発用ブランチ

## 開発フロー

1. `develop`ブランチから`feature/*`ブランチを作成
2. 機能開発を実施
3. `develop`ブランチにマージ
4. テスト完了後、`main`ブランチにマージ
