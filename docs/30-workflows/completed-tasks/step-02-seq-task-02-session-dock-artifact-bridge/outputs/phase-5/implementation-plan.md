# Implementation Plan - Session Dock Artifact Bridge

## 実装順序

### Step 1: State / Store 更新（最優先）

agentSlice に SessionDockState を追加する。

```
1-a. DockState 型定義を packages/shared/ に追加
1-b. SessionDockState interface を agentSlice に追加
1-c. dock アクション (openDock/closeDock/transitionDock/...) を実装
1-d. useDockState computed selector を実装（P31 対策: 個別セレクタ）
1-e. session ID 採番ロジック実装（MN-03: crypto.randomUUID() を使用）
```

#### MN-01 対応: running → collapsed 直接遷移不可の設計意図

running state では dock の折りたたみを禁止する。理由: 実行中のプロセスを見失うリスクを防ぐ。中止したい場合は「中止する」→ aborted → collapsed のパスを使用する。

#### MN-02 対応: P31 個別セレクタパターン

```typescript
// 個別セレクタとして実装
export const useDockState = () =>
  useAppStore((s) => s.agent.sessionDock.dockState);
export const useSessionId = () =>
  useAppStore((s) => s.agent.sessionDock.sessionId);
export const useIsDockOpen = () =>
  useAppStore((s) => s.agent.sessionDock.isDockOpen);
// 配列を返すセレクタは useShallow 必須（P48 対策）
export const useTranscriptEntries = () =>
  useAppStore(useShallow((s) => s.agent.sessionDock.transcriptEntries));
```

#### MN-03 対応: Session ID 形式

`crypto.randomUUID()` を使用して UUID v4 形式に統一する。

```typescript
const generateSessionId = (): string => `session-${crypto.randomUUID()}`;
```

#### MN-05 対応: Running session の cleanup 除外

cleanup ロジックに `dockState !== "running"` のガード条件を追加する。

### Step 2: Preload Consumer 実装方針

既存 `claudeCliAPI` の event を dock state machine に接続する。

```
2-a. onSessionOutput → addTranscriptEntry への接続
2-b. onSessionStatus → transitionDock への接続
2-c. executeScript → startSession + handoff → running 遷移
2-d. terminateSession → CLI_SESSION_ABORT event の発火
2-e. getSession → restoreSession でのデータ取得
```

### Step 3: UI 実装方針（dock → artifact → share の順）

```
3-a. ExecutionConsoleView: dock state machine の接続、state ベースの表示切替
3-b. HandoffBlock: dock ready → handoff 遷移の接続
3-c. PersistentTerminalLauncher: collapsed → ready 遷移の接続
3-d. ArtifactSummary (新規): artifact-first 結果表示
3-e. TranscriptShareRail (新規): 手動 3 操作 rail
3-f. ProvenanceChip (新規): provenance 表示
```

#### MN-04 対応: MB-4 credential サニタイズ

```typescript
const CREDENTIAL_PATTERNS = [
  /(?:api[_-]?key|apikey|secret|token|password|credential|auth)\s*[:=]\s*['"]?[\w\-\.]+/gi,
  /(?:sk-|pk-|rk-)[\w\-]{20,}/g,
  /Bearer\s+[\w\-\.]+/gi,
];

const sanitizeForShare = (text: string): string => {
  let sanitized = text;
  for (const pattern of CREDENTIAL_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }
  return sanitized;
};
```

## 依存関係グラフ

```
Step 1-a (shared types)
  └→ Step 1-b (agentSlice state)
       ├→ Step 1-c (actions)
       │    └→ Step 1-d (selectors)
       └→ Step 1-e (session ID)
            └→ Step 2-a〜2-e (preload consumer)
                 └→ Step 3-a〜3-f (UI)
```
