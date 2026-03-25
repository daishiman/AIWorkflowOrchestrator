# Artifact Bridge Design

## 1. Artifact-First Result Surface

### 1.1 表示順序

実行完了後（`done` / `aborted` state）の Session Dock 内表示順序:

```
┌─────────────────────────────────────────┐
│ [1] Artifact Summary                     │  ← primary surface
│   ├─ 生成ファイル一覧                    │
│   ├─ 変更差分プレビュー                  │
│   └─ 次アクション提案                    │
│                                          │
│ [2] Execution Summary                    │  ← secondary
│   ├─ 実行時間                            │
│   ├─ exit code                           │
│   └─ warning/error 数                    │
│                                          │
│ [3] Transcript Detail (折りたたみ)       │  ← tertiary
│   └─ ▶ 詳細ログを表示                   │
│                                          │
│ [4] Share Rail                           │  ← footer
│   ├─ [選択範囲を送る]                    │
│   ├─ [直近出力を添付]                    │
│   └─ [セッションを貼る]                  │
└─────────────────────────────────────────┘
```

### 1.2 ArtifactSummary コンポーネント設計

```typescript
interface ArtifactSummaryProps {
  artifacts: ArtifactItem[];
  executionDuration: number;
  exitCode: number;
  nextActions: NextAction[];
}

interface ArtifactItem {
  type: "file_created" | "file_modified" | "file_deleted";
  path: string;
  diffPreview?: string;
  sizeChange?: number;
}

interface NextAction {
  label: string;
  action: "open_file" | "run_tests" | "view_diff" | "share";
  target?: string;
}
```

表示ルール:

- `done` state: Artifact Summary + Warning 一覧
- `aborted` state: Error Summary を primary に表示、Artifact Summary は partial results として secondary
- artifacts が空の場合: 「成果物はありません」メッセージ + transcript へのリンク

### 1.3 Error Summary 表示

```typescript
interface ErrorSummaryData {
  abortReason: "user_abort" | "process_error" | "timeout" | "cli_disconnect";
  exitCode: number | null;
  stderrExcerpt: string;
  executionDuration: number;
  partialArtifacts: ArtifactItem[];
}
```

## 2. Manual Share Design

### 2.1 手動 3 操作

| 操作             | UI 表現                                    | payload                                                                                | Manual Boundary 準拠                   |
| ---------------- | ------------------------------------------ | -------------------------------------------------------------------------------------- | -------------------------------------- |
| 選択範囲を送る   | transcript 内テキスト選択 → 「送る」ボタン | `{ type: "selection", text: string, sessionId: string, entryRange: [number, number] }` | MB-1: ユーザー選択が必須               |
| 直近出力を添付   | Share Rail の「直近出力を添付」ボタン      | `{ type: "latest", sessionId: string, entryIndex: number }`                            | MB-1: ユーザーがボタンを押す必要がある |
| セッションを貼る | Share Rail の「セッションを貼る」ボタン    | `{ type: "session", sessionId: string, summary: string }`                              | MB-1: ユーザーがボタンを押す必要がある |

### 2.2 Share Payload 型定義

```typescript
type SharePayload =
  | {
      type: "selection";
      text: string;
      sessionId: string;
      entryRange: [number, number];
    }
  | { type: "latest"; sessionId: string; entryIndex: number }
  | { type: "session"; sessionId: string; summary: string };

interface ShareRecord {
  id: string;
  payload: SharePayload;
  sharedAt: string; // ISO 8601
  targetMessageId: string;
}
```

### 2.3 Provenance Chip 設計

```typescript
interface ProvenanceData {
  source: {
    sessionId: string;
    entryIndex?: number;
    entryRange?: [number, number];
  };
  sharedAt: string; // ISO 8601
  inspect: {
    action: "open_session";
    sessionId: string;
    scrollTo?: number;
  };
}
```

Chat message に付与される Provenance Chip の表示:

```
┌──────────────────────────────────────┐
│ 🔗 実行コンソール session-xxx から   │
│    2026-03-24 15:30 に共有           │
│    [元のログを見る →]                │
└──────────────────────────────────────┘
```

### 2.4 TranscriptShareRail コンポーネント設計

```typescript
interface TranscriptShareRailProps {
  sessionId: string;
  transcriptEntries: TranscriptEntry[];
  selectedRange?: [number, number];
  onShare: (payload: SharePayload) => void;
  disabled?: boolean;
}
```

表示条件:

- `done` / `aborted` state でのみ表示
- `running` 中は非表示（実行中の share は禁止）
- `collapsed` / `unavailable` / `guidance-only` では非表示

### 2.5 Manual Boundary 準拠マトリクス

| MB ルール | 説明                        | 設計での担保方法                                                       |
| --------- | --------------------------- | ---------------------------------------------------------------------- |
| MB-1      | auto-send 禁止              | share は全て user click がトリガー。timer/event による自動送信パスなし |
| MB-2      | hidden injection 禁止       | share payload は可視テキストのみ。hidden metadata の注入パスなし       |
| MB-3      | headless execution 禁止     | CLI 実行は dock UI 経由のみ。background silent execution のパスなし    |
| MB-4      | credential passthrough 禁止 | share payload に credential / API key が含まれないようサニタイズ       |

## 3. Transcript Entry 型定義

```typescript
interface TranscriptEntry {
  index: number;
  timestamp: string; // ISO 8601
  type: "stdout" | "stderr" | "system" | "user_input";
  content: string;
  isError: boolean;
}
```

## 4. IPC 契約設計

### 4.1 新規 IPC チャンネル（将来の実装タスク用）

| チャンネル             | 方向                       | payload                 | 説明                                  |
| ---------------------- | -------------------------- | ----------------------- | ------------------------------------- |
| `session-dock:share`   | Renderer → Main → Renderer | `SharePayload`          | transcript 共有を chat message に変換 |
| `session-dock:restore` | Renderer → Main → Renderer | `{ sessionId: string }` | 保存済み session の復元               |

### 4.2 既存 IPC の活用

| 既存チャンネル                 | 活用方法                                 |
| ------------------------------ | ---------------------------------------- |
| `claude-cli:session-output`    | transcript entry の受信                  |
| `claude-cli:session-status`    | dock state 遷移のトリガー                |
| `claude-cli:get-session`       | session restore 時の transcript 取得     |
| `claude-cli:terminate-session` | ユーザー abort 時の session 終了         |
| `conversation:addMessage`      | share payload を chat message として送信 |
