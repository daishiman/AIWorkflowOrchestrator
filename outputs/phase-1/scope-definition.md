# Phase 1: スコープ定義

## 概要

Environment Backend（AGENT-007）の実装スコープを定義。

## 含まれるもの（In Scope）

### コンポーネント

| コンポーネント     | 責務                           | ファイル              |
| ------------------ | ------------------------------ | --------------------- |
| ContentExtractor   | Markdownからコードブロック抽出 | ContentExtractor.ts   |
| ContentSanitizer   | HTMLのXSS対策サニタイズ        | ContentSanitizer.ts   |
| TempFileManager    | 一時ファイルの作成・管理・削除 | TempFileManager.ts    |
| EnvironmentService | Facade（統合サービス）         | EnvironmentService.ts |

### サポートするコンテンツタイプ

- HTML (html, htm)
- Markdown (markdown, md)
- CSS (css)
- JavaScript (javascript, js)
- Text (その他)

### セキュリティ機能

- scriptタグ除去
- iframeタグ除去
- イベントハンドラ除去
- javascript:プロトコル除去
- ファイルパーミッション制御（0o600）

### IPC チャネル

- `agent:extract-content` - コンテンツ抽出
- `agent:get-preview` - プレビュー取得
- `agent:cleanup-temp` - クリーンアップ

## 含まれないもの（Out of Scope）

| 項目                       | 理由                     | 対応タスク |
| -------------------------- | ------------------------ | ---------- |
| フロントエンドUI           | 別タスクで実装           | AGENT-006  |
| コード実行環境             | サンドボックス実装が複雑 | 将来タスク |
| ターミナルエミュレータ     | 複雑な実装が必要         | 将来タスク |
| リアルタイムストリーミング | 将来の拡張               | 将来タスク |

## 依存関係

### 前提タスク

- なし（独立して実装可能）

### 並行可能タスク

- AGENT-006: カスタム実行環境UI（バックエンドはモックで開発可能）

### 後続タスク

- フロントエンド統合時のE2Eテスト

## 成果物

| 成果物       | パス                                                  |
| ------------ | ----------------------------------------------------- |
| 実装コード   | apps/desktop/src/main/services/environment/           |
| テストコード | apps/desktop/src/main/services/environment/**tests**/ |
| 型定義       | packages/shared/src/types/agent.ts                    |
| IPCハンドラ  | apps/desktop/src/main/ipc/agentHandlers.ts            |
