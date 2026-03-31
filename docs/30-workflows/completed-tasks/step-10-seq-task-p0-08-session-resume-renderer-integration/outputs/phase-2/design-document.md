# Phase 2: 設計ドキュメント

## コンポーネント構成

### 新規コンポーネント

1. **SessionResumePrompt** — 未完了セッション検出時の復元プロンプト（インラインバナー）
2. **SessionIndicator** — アクティブセッションの ID・経過時間表示

### 変更コンポーネント

1. **SkillLifecyclePanel** — セッション復元フローの統合

## インターフェース定義

### IPC チャネル（新規4本）

| チャネル                           | 方向   | 用途               |
| ---------------------------------- | ------ | ------------------ |
| `skill-creator:list-sessions`      | invoke | セッション一覧取得 |
| `skill-creator:get-session-detail` | invoke | セッション詳細取得 |
| `skill-creator:resume-session`     | invoke | セッション復元     |
| `skill-creator:delete-session`     | invoke | セッション削除     |

### 型定義（packages/shared）

```typescript
// セッション一覧レスポンス
interface SkillCreatorSessionListItem {
  checkpointId: string;
  planId: string;
  checkpointType: SkillCreatorCheckpointType;
  currentPhase: SkillCreatorWorkflowPhase;
  createdAt: number;
  updatedAt: number;
  compatibility: ResumeCompatibilityResult;
}

// セッション復元リクエスト
interface SkillCreatorResumeSessionRequest {
  checkpointId: string;
}

// セッション復元レスポンス
type SkillCreatorResumeSessionResponse = SkillCreatorWorkflowUiSnapshot;
```

## データフロー

1. アプリ起動 / SkillLifecyclePanel マウント
2. `listSessions()` via IPC → Facade → WorkflowEngine → 永続化 store
3. 未完了セッションあり → SessionResumePrompt 表示
4. ユーザー「復元」選択 → `resumeSession(checkpointId)` via IPC
5. Facade が互換性判定 → compatible なら snapshot 復元 → UI 状態更新
6. incompatible → 新規セッション開始（フォールバック）
7. ユーザー「スキップ」選択 → 新規セッション開始

## IPC 4層整合表

| 層             | ファイル                                      | 追加内容      |
| -------------- | --------------------------------------------- | ------------- |
| 定数定義       | `preload/channels.ts`                         | 4チャネル追加 |
| ホワイトリスト | `preload/channels.ts` ALLOWED_INVOKE_CHANNELS | 4チャネル追加 |
| ハンドラ登録   | `main/ipc/creatorHandlers.ts`                 | 4ハンドラ追加 |
| Preload API    | `preload/skill-creator-api.ts`                | 4メソッド追加 |

## DI 境界の型配置

| 型                   | 配置先          | 理由                 |
| -------------------- | --------------- | -------------------- |
| SessionListItem      | packages/shared | main + renderer 共有 |
| ResumeSessionRequest | packages/shared | IPC 契約             |
| UI 状態型            | renderer        | renderer 内のみ      |

## resume / compatibility 設計

- session_id を primary key として保持
- manifestHash / sourceRoot / resolvedSkillPath で resume 互換性を再判定
- 非互換なら新規開始または forkSession を選択
- TTL: 24時間（86400000 ms）

## エラーハンドリング方針

| エラー           | 対処                                     |
| ---------------- | ---------------------------------------- |
| IPC 失敗         | エラーメッセージ表示、新規セッション開始 |
| 非互換セッション | フォールバック（新規開始）               |
| 永続化データ破損 | セッション削除、新規開始                 |
| TTL 超過         | 自動クリーンアップ                       |
