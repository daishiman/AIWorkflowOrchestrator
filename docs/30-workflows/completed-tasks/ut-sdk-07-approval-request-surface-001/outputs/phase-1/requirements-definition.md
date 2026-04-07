# 要件定義書 - UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 作成日: 2026-04-06

## Phase: 1

## ステータス: completed

---

## 背景・課題

TASK-SDK-07 Phase 12 再監査により、`skill-creator-api.ts` の `SkillCreatorAPI` インターフェースに以下の非対称が発見された：

| メソッド            | 存在 | 説明                     |
| ------------------- | ---- | ------------------------ |
| `respondToApproval` | ✅   | 承認応答送信（送信方向） |
| `getDisclosureInfo` | ✅   | AI利用情報取得           |
| `onApprovalRequest` | ❌   | 承認要求受信購読（欠落） |

`APPROVAL_REQUEST` チャンネル（`approval:request`）は `ALLOWED_ON_CHANNELS` に登録済み（`channels.ts` line 777）のため、`safeOn` パターンで実装可能。

---

## 機能要件

| 要件ID | 要件                                                                                     |
| ------ | ---------------------------------------------------------------------------------------- |
| FR-01  | `SkillCreatorAPI` インターフェースに `onApprovalRequest` メソッドを追加する              |
| FR-02  | `onApprovalRequest` は `APPROVAL_REQUEST` チャンネルを `safeOn` で購読する               |
| FR-03  | `onApprovalRequest` はアンサブスクライブ関数 `() => void` を返す                         |
| FR-04  | `SkillLifecyclePanel.tsx` で `onApprovalRequest` を消費し既存 `ApprovalSheet` を表示する |
| FR-05  | `respondToApproval` との対称性（approve/reject action）を `ApprovalSheet` 経由で維持する |
| FR-06  | `getSkillCreatorApi()` の fallback 経路と `preload/index.ts` の公開 surface を対称に保つ |

## 非機能要件

| 要件ID | 要件                                                                |
| ------ | ------------------------------------------------------------------- |
| NFR-01 | TypeScript strict mode で型エラーなし                               |
| NFR-02 | 既存の `respondToApproval` / `getDisclosureInfo` の動作に影響しない |
| NFR-03 | `ALLOWED_ON_CHANNELS` の既存リストを変更しない                      |
| NFR-04 | Vitest 全テストが PASS する                                         |

---

## 命名規則分析（Phase 1 実施）

| 対象               | 命名パターン           | 例                                                                                        |
| ------------------ | ---------------------- | ----------------------------------------------------------------------------------------- |
| Preload メソッド   | camelCase              | `onApprovalRequest`, `safeOn`                                                             |
| IPC チャンネル定数 | UPPER_SNAKE_CASE       | `APPROVAL_REQUEST`                                                                        |
| IPC チャンネル値   | kebab-case with colon  | `approval:request`                                                                        |
| コールバック型     | `(payload: T) => void` | `(payload: { operationType, description, destination?, sessionId, operationId }) => void` |

---

## スコープ

### 含む

- `apps/desktop/src/preload/skill-creator-api.ts` の `SkillCreatorAPI` interface + 実装への追加
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` への approval UI 接続
- テストコードの作成（Unit / Integration）

### 含まない

- `apps/desktop/src/preload/channels.ts` の変更（`ALLOWED_ON_CHANNELS` は登録済み）
- `packages/shared/src/ipc/channels.ts` の変更（APPROVAL_CHANNELS 定義済み）
- `apps/desktop/src/main/ipc/approvalHandlers.ts` の変更（Main側は変更不要）
- commit、PR 作成、push

---

## 変更ファイル一覧（確定）

| ファイルパス                                                                                 | 変更種別 | 変更概要                                                      |
| -------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts`                                              | 修正     | `SkillCreatorAPI` interface + 実装に `onApprovalRequest` 追加 |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                         | 修正     | `onApprovalRequest` 購読・`ApprovalSheet` 再利用・cleanup     |
| `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`                      | 新規     | Unit テスト（TC-APPR-01〜10）                                 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | 新規     | Unit テスト（TC-APPR-06〜10）                                 |
