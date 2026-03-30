# Scope Definition — TASK-P0-06

## Source Scope

### 含む

- 会話型インタビュー UI コンポーネント（チャットバブル形式）
- ステップバイステップの質問フロー制御
- 全 UserInputKind 対応入力ウィジェット（single_select, multi_select, free_text, confirm, secret）
- インタビュー進捗インジケーター
- 回答の undo/back 機能
- ユーザー熟練度に応じた適応ロジック（初心者/エンジニア）
- 同一アプリセッション内の一時状態保持
- SkillCreatorWorkflowEngine との IPC 連携
- キーボード操作とクリック操作の両対応

### 含まない

- SkillCreatorWorkflowEngine の内部ロジック変更（質問生成ロジックは既存）
- multi_select の型定義追加（TASK-RT-05 の責務 — ただし前提として型は追加する）
- アプリ再起動をまたぐセッション復元 UI / 永続化（TASK-P0-08 の責務）
- スキルファイル書き出し（TASK-P0-05 の責務）
- LLM アダプターのエラーハンドリング（TASK-RT-01 の責務）

## 依存境界

| 依存先     | 状態   | 影響                                    |
| ---------- | ------ | --------------------------------------- |
| TASK-RT-04 | 完了   | API キー設定導線が利用可能              |
| TASK-RT-05 | 未完了 | multi_select 型を本タスクで前提追加する |

## 責務分離

- **Renderer**: 表示・入力・一時状態保持
- **Main**: 質問生成・フロー進行（WorkflowEngine）
- **Shared**: 型契約
- **Preload**: IPC surface
