# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 2                                                                     |
| Phase名    | 設計                                                                  |
| 対象機能   | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: approval:request surface 追加 |
| 前提Phase  | Phase 1: 要件定義                                                     |
| 次Phase    | Phase 3: 設計レビュー                                                 |
| ステータス | pending                                                               |
| 作成日     | 2026-04-06                                                            |
| 更新日     | 2026-04-06                                                            |

## 目的

Phase 1 で確認した未実装箇所に対して、`onApprovalRequest` preload listener の型設計・approval UI コンポーネントの構造設計・TTL expired 表示設計・`respondToApproval()` との接続設計を確定する。

## 実行手順

### Step 1: Phase 1 の調査結果を確認

`outputs/phase-1/requirements-definition.md` を読み込み、設計の前提とする。特に以下を確認:

- `APPROVAL_REQUEST` channel のチャネル名文字列
- `ApprovalRequest` 型の構造
- TTL 値と expired 判定ロジック

### Step 2: 以下の Task を順次実行

## 実行タスク

### Task 1: preload listener 設計（`onApprovalRequest`）

`apps/desktop/src/preload/skill-creator-api.ts` の既存 `onEvent` 系 listener のパターンを参照し、`onApprovalRequest` の設計を確定する。

**設計ポイント**:

```typescript
// 設計例（既存パターンに合わせて調整すること）
interface SkillCreatorAPI {
  // ... 既存 API ...
  onApprovalRequest: (
    callback: (request: ApprovalRequest) => void,
  ) => () => void; // cleanup function を返す
}
```

- `ApprovalRequest` 型の定義箇所（`packages/shared/src/types/` または preload 内）
- cleanup（removeListener）の実装パターン
- `ipcRenderer.on` / `ipcRenderer.once` のどちらを使うか（TTL single-use の性質を考慮）
- チャネル名（`channels.ts` の `APPROVAL_REQUEST` 定数を使用）

**型定義設計**:

```typescript
// ApprovalRequest 型（ApprovalGate.ts の実装から逆引きして確認）
interface ApprovalRequest {
  requestId: string;
  toolName: string;
  args: unknown;
  expiresAt: number; // Unix timestamp (ms)
  // ... その他フィールド
}
```

### Task 2: approval UI コンポーネント設計

approval 確認 UI の配置と構造を設計する。

**配置方針の選択**:

| 方針                   | 説明                                              | メリット                   | デメリット         |
| ---------------------- | ------------------------------------------------- | -------------------------- | ------------------ |
| SkillLifecyclePanel 内 | 既存パネルに approval 表示ロジックを追加          | 変更ファイルが少ない       | パネルが複雑化する |
| 専用コンポーネント     | `ApprovalRequestPanel.tsx` を新規作成して埋め込む | 責務が明確、テストしやすい | ファイル追加が必要 |

**推奨**: 専用コンポーネント（`ApprovalRequestPanel.tsx`）を新規作成し、`SkillLifecyclePanel` から条件レンダリングする。

**コンポーネント設計**:

```typescript
// ApprovalRequestPanel.tsx
interface ApprovalRequestPanelProps {
  request: ApprovalRequest | null;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

// 表示状態
type ApprovalUIState =
  | { status: "idle" } // 表示なし
  | { status: "pending"; request: ApprovalRequest } // 承認待ち
  | { status: "expired"; request: ApprovalRequest } // TTL 超過
  | { status: "resolved" }; // 完了（approve/reject 後）
```

**UI 要素**:

- ツール名・引数の表示
- 承認 / 拒否 ボタン
- TTL カウントダウン表示（残り時間）
- expired 時の警告メッセージ

### Task 3: TTL expired 表示設計

TTL（300s）超過時の UI 動作を設計する:

- `expiresAt` フィールドを元に残り時間を計算（`setInterval` で 1 秒ごと更新）
- 残り時間が 0 以下になったら `status: 'expired'` に遷移
- expired 状態では approve/reject ボタンを disabled にして警告メッセージを表示
- expired イベントを Main から受信する場合のハンドリング設計

```typescript
// TTL 計算フック（設計例）
function useApprovalTTL(request: ApprovalRequest | null) {
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const isExpired = remainingMs <= 0;
  // ... setInterval で計算
  return { remainingMs, isExpired };
}
```

### Task 4: `respondToApproval()` との接続設計

既実装の `respondToApproval()` と approve/reject ボタンを接続する設計:

```typescript
// SkillLifecyclePanel 内での接続設計（設計例）
const handleApprove = async (requestId: string) => {
  await window.skillCreatorAPI.respondToApproval({
    requestId,
    approved: true,
  });
  setApprovalState({ status: "resolved" });
};

const handleReject = async (requestId: string) => {
  await window.skillCreatorAPI.respondToApproval({
    requestId,
    approved: false,
  });
  setApprovalState({ status: "resolved" });
};
```

- `respondToApproval()` の引数型（Phase 1 で確認済み）
- 非同期処理中のローディング状態
- エラーハンドリング（IPC 通信失敗時）

### Task 5: IPC 4層整合性確認

IPC 変更時の 4 層チェック:

| 層             | ファイル                                        | 確認事項                             |
| -------------- | ----------------------------------------------- | ------------------------------------ |
| チャネル定数   | `apps/desktop/src/preload/channels.ts`          | `APPROVAL_REQUEST` の存在            |
| ホワイトリスト | `apps/desktop/src/main/ipc/approvalHandlers.ts` | push チャネルの登録（参照のみ）      |
| Preload API    | `apps/desktop/src/preload/skill-creator-api.ts` | `onApprovalRequest` 追加（変更対象） |
| 型定義         | `packages/shared/src/types/` または preload 内  | `ApprovalRequest` 型の整合性         |

## 参照資料

| 資料名               | パス                                                                 | 説明                       |
| -------------------- | -------------------------------------------------------------------- | -------------------------- |
| Phase 1 成果物       | `outputs/phase-1/requirements-definition.md`                         | 調査結果・AC 確定内容      |
| channels.ts          | `apps/desktop/src/preload/channels.ts`                               | APPROVAL_REQUEST 定数      |
| skill-creator-api.ts | `apps/desktop/src/preload/skill-creator-api.ts`                      | 既存 listener パターン参照 |
| SkillLifecyclePanel  | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | UI 追加対象                |
| ApprovalGate.ts      | `apps/desktop/src/main/services/runtime/ApprovalGate.ts`             | TTL / ApprovalRequest 型   |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                                        | 内容                              |
| ------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| IPC契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC 変更時の 4 層同時更新チェック |
| API IPC エージェント仕様  | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | approval:request チャネル定義     |
| Skill Creator Service仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | approval IPC パターン             |
| スキル実行IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`              | IPC セキュリティパターン          |

## 多角的チェック観点

| 観点           | 適用判断                         | 確認内容                                        |
| -------------- | -------------------------------- | ----------------------------------------------- |
| IPC通信        | onApprovalRequest 追加のため適用 | 4 層整合性（定数・ホワイトリスト・Preload・型） |
| コンポーネント | approval UI 新規設計のため適用   | Props 型統一・TTL 状態管理・テスト容易性        |
| セキュリティ   | 危険操作 approval 制御のため適用 | expired request への操作防止・IPC 検証          |
| テスト容易性   | Phase 4 TDD に備えるため適用     | UI コンポーネントが mock props でテスト可能か   |

## 統合テスト連携

- `onApprovalRequest` の型定義が Phase 4 のテストで使用可能であること
- `ApprovalRequestPanelProps` の Props 型が Phase 4 のコンポーネントテストに対応すること
- TTL expired フローが Phase 6 の統合テストで検証可能であること
- approval UI が Phase 11 の手動テストでスクリーンショット撮影可能なルートに配置されること

## 成果物

| 成果物 | パス                                     | 説明                                                         |
| ------ | ---------------------------------------- | ------------------------------------------------------------ |
| 設計書 | `outputs/phase-2/architecture-design.md` | preload listener 設計・UI 設計・TTL 設計・IPC 4 層整合性設計 |

## 完了条件

- [ ] `onApprovalRequest` の型シグネチャが確定している
- [ ] `ApprovalRequest` 型の定義箇所と構造が確定している
- [ ] approval UI コンポーネントの配置方針（SkillLifecyclePanel 内 or 専用コンポーネント）が確定している
- [ ] TTL expired 時の UI 動作設計が確定している
- [ ] `respondToApproval()` との接続方式が設計されている
- [ ] IPC 4 層整合性チェックが完了している
- [ ] aiworkflow-requirements の関連仕様を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
