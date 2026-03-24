# Implementation Guide - Session Dock Artifact Bridge

## Part 1: 概念説明（中学生レベル）

### Session Dock って何？

学校の先生が宿題を出すとき、こんなことがありますよね:

1. **先生が指示を出す**（「教科書 p.30 の問題を解いて」）
2. **あなたが作業する**（ノートに答えを書く）
3. **結果を確認する**（答え合わせ）
4. **先生に見せる**（提出）

Session Dock は、このプロセスをパソコンの画面で管理する「作業パネル」です。

- **AI が指示を出す** = 「実行コンソール」に handoff guidance が表示される
- **あなたが作業する** = CLI（コマンドライン）でプログラムが実行される
- **結果を確認する** = Artifact Summary に成果物が表示される
- **先生に見せる** = Share Rail で結果をチャットに送れる

### 8 つの状態

Session Dock には「今何をしているか」を示す 8 つの状態があります。信号機のように色が変わるイメージです:

| 状態          | 日常の例え                             |
| ------------- | -------------------------------------- |
| collapsed     | パネルが閉じている（本を閉じた状態）   |
| ready         | 準備完了（先生の指示を読んだ状態）     |
| handoff       | 引き渡し中（宿題を始めようとしている） |
| running       | 実行中（宿題を解いている最中）         |
| done          | 完了（宿題が終わった）                 |
| aborted       | 中止（途中でやめた / エラーが起きた）  |
| unavailable   | 使えない（鉛筆が見つからない）         |
| guidance-only | 読むだけ（先生のアドバイスを読む）     |

### Artifact-First って何？

昔のやり方: 実行ログ（日記帳のような全記録）をそのまま見せていた。
新しいやり方: **成果物（作品）を最初に見せる**。詳しいログは「もっと見る」で読める。

例えるなら、料理の写真を最初に見せて、レシピは「詳しく見る」ボタンで読めるようにする感じです。

### 手動共有（Manual Share）って何？

勝手に宿題を提出されたら困りますよね？ Session Dock の共有機能は **自分で操作しないと送られない** ルールです:

1. **選んで送る**: テキストを選んで「送る」ボタンを押す
2. **最新を添付**: 一番新しい結果を「添付する」ボタンで添付
3. **全体を貼る**: セッション全体のまとめを「貼る」ボタンで送る

さらに、送った内容には「出典シール（Provenance Chip）」が付いて、「どこから来たか」がわかるようになっています。

---

## Part 2: 開発者向け技術詳細

### 2.1 State Machine 実装

#### DockState 型（packages/shared/src/types/dock-state.ts に配置）

```typescript
export type DockState =
  | "collapsed"
  | "ready"
  | "handoff"
  | "running"
  | "done"
  | "aborted"
  | "unavailable"
  | "guidance-only";
```

#### 遷移ロジック

10 の遷移（T1〜T10）が定義されている。各遷移にはガード条件がある:

- T1: `GUIDANCE_RECEIVED` — `handoffGuidance != null && cliAvailable`
- T4: `CLI_SESSION_START` — `sessionId != null`
- T5: `CLI_SESSION_COMPLETE` — `exitCode === 0`
- T6: `CLI_SESSION_ABORT` — `exitCode !== 0 || userAbort`

重要な設計判断（MN-01）: `running` → `collapsed` の直接遷移は禁止。実行中のプロセスを見失うリスクを防ぐため。

### 2.2 Store 拡張

#### SessionDockState（agentSlice に追加）

```typescript
interface SessionDockState {
  dockState: DockState;
  sessionId: string | null;
  isDockOpen: boolean;
  transcriptEntries: TranscriptEntry[];
  artifactSummary: ArtifactSummaryData | null;
  errorSummary: ErrorSummaryData | null;
  shareHistory: ShareRecord[];
}
```

#### セレクタ設計（P31 / P48 準拠）

```typescript
// 個別セレクタ（P31 対策）
export const useDockState = () =>
  useAppStore((s) => s.agent.sessionDock.dockState);
export const useSessionId = () =>
  useAppStore((s) => s.agent.sessionDock.sessionId);

// 配列セレクタ（P48 対策: useShallow 必須）
export const useTranscriptEntries = () =>
  useAppStore(useShallow((s) => s.agent.sessionDock.transcriptEntries));
```

### 2.3 Artifact-First 表示順序

```
[1] ArtifactSummary   — primary surface
[2] ExecutionSummary  — secondary
[3] TranscriptDetail  — tertiary (折りたたみ)
[4] ShareRail         — footer (done/aborted のみ)
```

4 グループ分類で表示ロジックを簡素化:

| グループ | State                                 | 表示コンテンツ                                |
| -------- | ------------------------------------- | --------------------------------------------- |
| Inactive | collapsed, unavailable, guidance-only | 最小限の status bar                           |
| Pending  | ready, handoff                        | guidance + CTA                                |
| Active   | running                               | transcript streaming + abort CTA              |
| Complete | done, aborted                         | Artifact Summary + Share Rail + Error Summary |

### 2.4 Manual Share 実装

#### SharePayload Union Type

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
```

#### Credential サニタイズ（MB-4 対策）

```typescript
const CREDENTIAL_PATTERNS = [
  /(?:api[_-]?key|apikey|secret|token|password|credential|auth)\s*[:=]\s*['"]?[\w\-\.]+/gi,
  /(?:sk-|pk-|rk-)[\w\-]{20,}/g,
  /Bearer\s+[\w\-\.]+/gi,
];
```

### 2.5 Session Persistence

- Session ID: `session-{crypto.randomUUID()}`
- 保持ポリシー: 最大 10 件 / 24 時間 / FIFO cleanup
- Running session は cleanup から除外（MN-05）
- Reopen restore: `claudeCliAPI.getSession(sessionId)` で transcript 取得 → 失敗時は `ready` にフォールバック

### 2.6 変更対象ファイル一覧

| ファイル                   | 変更種別 | 概要                               |
| -------------------------- | -------- | ---------------------------------- |
| dock-state.ts (shared)     | 新規     | DockState / TranscriptEntry 等の型 |
| agentSlice.ts              | 修正     | SessionDockState + dock アクション |
| ExecutionConsoleView       | 修正     | dock state machine 接続            |
| HandoffBlock.tsx           | 修正     | dock ready → handoff 遷移          |
| PersistentTerminalLauncher | 修正     | collapsed → ready 遷移             |
| ArtifactSummary.tsx        | 新規     | artifact-first 結果表示            |
| TranscriptShareRail.tsx    | 新規     | 手動 3 操作                        |
| ProvenanceChip.tsx         | 新規     | 共有元表示                         |

### 2.7 既知のリスクと落とし穴

| リスク  | 対策                                                  |
| ------- | ----------------------------------------------------- |
| RISK-01 | transcript persistence は Task06 完了後に実装         |
| RISK-03 | event queue 順序保証を EDGE-PER-03 で検証             |
| RISK-04 | CREDENTIAL_PATTERNS で主要パターンをカバー            |
| P31     | 個別セレクタパターンで無限ループ防止                  |
| P48     | 配列セレクタに useShallow 適用                        |
| P5      | claudeCliAPI event リスナーは一度だけ登録             |
| P35     | SessionDockState のデフォルト値で既存テスト影響最小化 |
