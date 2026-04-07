# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 5                                                                     |
| Phase名    | 実装                                                                  |
| 対象機能   | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: approval:request surface 追加 |
| 前提Phase  | Phase 4: テスト作成                                                   |
| 次Phase    | Phase 6: テスト拡充                                                   |
| ステータス | pending                                                               |
| 作成日     | 2026-04-06                                                            |
| 更新日     | 2026-04-06                                                            |

## 目的

Phase 4 で作成したテストを RED → GREEN にする実装を行う。preload listener 追加 → UI コンポーネント実装 → respondToApproval() 接続の順で実施する。

## 実行手順

### Step 1: Phase 4 のテストケースを確認

`outputs/phase-4/test-cases.md` を読み込み、実装対象を把握する。

### Step 2: 実装順序

以下の順序で実装する（依存関係を考慮）:

1. **型定義確認・追加**（必要に応じて）
2. **preload listener 追加**（`skill-creator-api.ts`）
3. **UI コンポーネント実装**（`ApprovalRequestPanel.tsx`）
4. **SkillLifecyclePanel 統合**（approval 受信・UI 表示・respondToApproval 接続）

## 実行タスク

### Task 1: `ApprovalRequest` 型定義の確認と追加

`apps/desktop/src/main/services/runtime/ApprovalGate.ts` と `packages/shared/src/types/` を確認し、`ApprovalRequest` 型が適切に定義・共有されているかを確認する。

不足がある場合は `packages/shared/src/types/skillCreator.ts` または適切な共有型ファイルに追加する。

### Task 2: preload listener 追加（`skill-creator-api.ts`）

**変更ファイル**: `apps/desktop/src/preload/skill-creator-api.ts`

1. `SkillCreatorAPI` interface に `onApprovalRequest` を追加:

```typescript
interface SkillCreatorAPI {
  // ... 既存 API ...
  onApprovalRequest: (
    callback: (request: ApprovalRequest) => void,
  ) => () => void;
}
```

2. 実装を追加:

```typescript
onApprovalRequest: (callback) => {
  const handler = (_event: IpcRendererEvent, request: ApprovalRequest) => {
    callback(request);
  };
  ipcRenderer.on(channels.APPROVAL_REQUEST, handler);
  return () => {
    ipcRenderer.removeListener(channels.APPROVAL_REQUEST, handler);
  };
},
```

**注意事項**:

- `channels.APPROVAL_REQUEST` の定数名は `channels.ts` の実際の定数名に合わせる
- `IpcRendererEvent` の import を確認する
- `contextBridge.exposeInMainWorld` への追加を忘れずに行う

### Task 3: `ApprovalRequestPanel.tsx` の実装（新規作成）

**新規ファイル**: `apps/desktop/src/renderer/components/skill/ApprovalRequestPanel.tsx`

Phase 2 の設計に基づき実装する:

- `pending` / `expired` / `resolved` / `idle` の 4 状態を管理
- TTL カウントダウン表示（`useEffect` + `setInterval`）
- 承認ボタン・拒否ボタン
- expired 時のボタン無効化と警告メッセージ

### Task 4: `SkillLifecyclePanel.tsx` への統合

**変更ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

1. `onApprovalRequest` listener の登録（`useEffect` でマウント時に登録・クリーンアップ）:

```typescript
useEffect(() => {
  const cleanup = window.skillCreatorAPI.onApprovalRequest((request) => {
    setApprovalRequest(request);
  });
  return cleanup;
}, []);
```

2. approve/reject ハンドラの実装:

```typescript
const handleApprove = async (requestId: string) => {
  await window.skillCreatorAPI.respondToApproval({ requestId, approved: true });
  setApprovalRequest(null);
};

const handleReject = async (requestId: string) => {
  await window.skillCreatorAPI.respondToApproval({
    requestId,
    approved: false,
  });
  setApprovalRequest(null);
};
```

3. `ApprovalRequestPanel` の条件レンダリング追加

### Task 5: 実装後の確認

```bash
# TypeScript 型エラーがないか確認
pnpm --filter @repo/desktop typecheck

# テストが GREEN になっているか確認
pnpm --filter @repo/desktop test -- --testPathPattern="approval"

# lint チェック
pnpm --filter @repo/desktop lint
```

## 変更ファイル一覧

| 種別             | ファイルパス                                                          | 変更内容                                       |
| ---------------- | --------------------------------------------------------------------- | ---------------------------------------------- |
| 修正             | `apps/desktop/src/preload/skill-creator-api.ts`                       | `onApprovalRequest` listener 追加              |
| 新規             | `apps/desktop/src/renderer/components/skill/ApprovalRequestPanel.tsx` | approval 確認 UI コンポーネント                |
| 修正             | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | approval 受信・UI 表示・respondToApproval 接続 |
| 修正（条件付き） | `packages/shared/src/types/skillCreator.ts`                           | `ApprovalRequest` 型追加（未定義の場合のみ）   |

## 参照資料

| 資料名               | パス                                                     | 説明                          |
| -------------------- | -------------------------------------------------------- | ----------------------------- |
| Phase 4 テストケース | `outputs/phase-4/test-cases.md`                          | 実装対象の全テストケース      |
| Phase 2 設計書       | `outputs/phase-2/architecture-design.md`                 | 型・コンポーネント設計        |
| channels.ts          | `apps/desktop/src/preload/channels.ts`                   | APPROVAL_REQUEST 定数名の確認 |
| ApprovalGate.ts      | `apps/desktop/src/main/services/runtime/ApprovalGate.ts` | ApprovalRequest 型の参照      |

## 多角的チェック観点

| 観点             | 適用判断                           | 確認内容                                      |
| ---------------- | ---------------------------------- | --------------------------------------------- |
| IPC通信          | preload 変更のため適用             | contextBridge への expose・チャネル名一致     |
| 型安全性         | TypeScript 厳格モードのため適用    | `any` 型の不使用・型推論の活用                |
| メモリリーク     | useEffect クリーンアップのため適用 | listener の removeListener が確実に呼ばれるか |
| アクセシビリティ | ボタン UI 追加のため適用           | aria-label・keyboard navigation の考慮        |

## 統合テスト連携

- Phase 4 のテストが GREEN になることを必須条件とする
- Phase 6 で TTL expired パスのテストを追加する

## 成果物

| 成果物       | パス                                        | 説明                                   |
| ------------ | ------------------------------------------- | -------------------------------------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 変更ファイル一覧・実装内容・テスト結果 |

## 完了条件

- [ ] `onApprovalRequest` が `skill-creator-api.ts` の interface と実装に追加されている
- [ ] `contextBridge.exposeInMainWorld` に `onApprovalRequest` が追加されている
- [ ] `ApprovalRequestPanel.tsx` が新規作成されている
- [ ] `SkillLifecyclePanel.tsx` に approval 受信・表示・respondToApproval 接続が実装されている
- [ ] Phase 4 のテストが全て GREEN になっている
- [ ] `pnpm typecheck` が通過している
- [ ] `outputs/phase-5/implementation-summary.md` が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
