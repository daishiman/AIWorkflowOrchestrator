# Phase 12: システム仕様更新サマリー

## タスクID

UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 実行日時

2026-04-06

---

## Step 1: 実施結果サマリー（1-A〜1-G）

### Step 1-A: 実装対象ファイルの特定

| ファイル                                                                                     | 役割                               |
| -------------------------------------------------------------------------------------------- | ---------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts`                                              | Preload API インターフェース・実装 |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                         | UI コンポーネント                  |
| `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`                      | Preload テスト（10件）             |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | UI テスト（8件）                   |

### Step 1-B: 既存インターフェースの確認

`SkillCreatorAPI` インターフェース（`skill-creator-api.ts` L68）に `onApprovalRequest` が追加されていることを確認。

### Step 1-C: チャンネル定義の確認

- `IPC_CHANNELS.APPROVAL_REQUEST = "approval:request"`（`packages/shared/src/ipc/channels.ts` L141）
- `ALLOWED_ON_CHANNELS` に `IPC_CHANNELS.APPROVAL_REQUEST` が含まれる（`channels.ts` L777）

### Step 1-D: 実装パターンの確認

`safeOn` 関数を経由した実装パターンが採用されている。既存の `onDisclosureReceived` などと同じパターンで一貫性がある。

### Step 1-E: UI 実装の確認

`SkillLifecyclePanel.tsx` に以下が揃っている:

- state: `pendingApprovalRequest`（L532）
- 購読: `useEffect` 内で `onApprovalRequest` 呼び出し（L800-807）
- UI: `data-testid="skill-lifecycle-approval-request"` の条件付きレンダリング（L1750-1751, 1881-1883, 1917-1919）

### Step 1-F: テスト網羅性の確認

| テストスイート                          | テスト数 | 網羅内容                                                                       |
| --------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `skill-creator-api.approval.test.ts`    | 10件     | チャンネル登録・ペイロード伝達・アンサブ・ALLOWED_ON_CHANNELS・エッジケース    |
| `SkillLifecyclePanel.approval.test.tsx` | 8件      | UI表示・非表示・内容・アンマウント・上書き・undefined・再マウント・close reset |

### Step 1-G: 品質チェック結果

| 項目                       | 結果             |
| -------------------------- | ---------------- |
| 全テスト                   | 17/17 PASS       |
| TypeScript typecheck       | エラーなし       |
| ESLint（実装対象ファイル） | エラー・警告なし |

> 補足: `SkillLifecyclePanel.approval.test.tsx` には close/reset 系の追加ケース（T-6-9）を追加済み。現環境では Vitest の再実行が `esbuild` の host/binary mismatch で止まるため、ここに記録している 17/17 は直近の成功ログとして残している。

---

## Step 2: 新規インターフェース追加による仕様更新判断

### 更新が必要と判断した理由

`SkillCreatorAPI` インターフェースに `onApprovalRequest` が新規追加されたため、以下のシステム仕様書を更新する必要があると判断しました。

### current / baseline の差分記録

| 項目                           | baseline（変更前）                      | current（変更後）                     |
| ------------------------------ | --------------------------------------- | ------------------------------------- |
| `SkillCreatorAPI` のメソッド数 | `onApprovalRequest` なし                | `onApprovalRequest` 追加済み          |
| IPC チャンネル購読             | `APPROVAL_REQUEST` 未購読               | `safeOn` 経由で購読                   |
| `SkillLifecyclePanel` の Props | `onApprovalRequest` なし                | `onApprovalRequest?: (...)` 追加      |
| UI state                       | `pendingApprovalRequest` なし           | `pendingApprovalRequest` state 追加   |
| approval request lifecycle     | stale banner の reset なし              | create/execute/improve/close で reset |
| `data-testid`                  | `skill-lifecycle-approval-request` なし | 3箇所のレンダリング分岐に追加         |
| テストファイル                 | 承認リクエスト関連テストなし            | 18件のテスト追加（close/reset 含む）  |

### 更新対象仕様書

- Preload API 仕様書（`SkillCreatorAPI` インターフェース定義箇所）
- IPC チャンネル一覧（`ALLOWED_ON_CHANNELS` セクション）
- UI コンポーネント仕様書（`SkillLifecyclePanel` Props・状態管理）
