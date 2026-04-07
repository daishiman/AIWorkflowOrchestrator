# Phase 1 成果物: 要件定義サマリー

## タスク識別子

UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## P50 チェック結果

| 確認項目                                    | 状態       | 詳細                                                                                        |
| ------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| `respondToApproval` 実装                    | 実装済み   | `skill-creator-api.ts` に `safeInvoke(IPC_CHANNELS.APPROVAL_RESPOND, ...)` 実装済み         |
| `getDisclosureInfo` 実装                    | 実装済み   | `skill-creator-api.ts` に `safeInvoke(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO)` 実装済み |
| `onApprovalRequest` 実装                    | **未実装** | `SkillCreatorAPI` インターフェース・実装オブジェクトともに欠如                              |
| `APPROVAL_REQUEST` チャンネル登録           | 登録済み   | `ALLOWED_ON_CHANNELS` に登録済み（`channels.ts` 行777）                                     |
| `safeOn` ヘルパー                           | 実装済み   | `skill-creator-api.ts` 行405〜 に実装済み                                                   |
| `ExecutionAPI.onApprovalRequest` 型パターン | 参照可能   | `preload/types.ts` 行1038 に payload 型定義あり                                             |
| `SkillLifecyclePanel.tsx` disclosure UI     | 実装済み   | `data-testid="skill-lifecycle-disclosure-summary"` が存在                                   |
| `SkillLifecyclePanel.tsx` approval UI       | **未実装** | approval request 購読・表示が欠如                                                           |

**P50 チェック結論**: インターフェース・実装オブジェクトへの `onApprovalRequest` 追加と、`SkillLifecyclePanel.tsx` への購読 + UI 実装のみが未完成。既存のチャンネル・safeOn 基盤は利用可能。

## 機能要件（FR-01〜FR-06）

| ID    | 要件                                                                                                           | 優先度 |
| ----- | -------------------------------------------------------------------------------------------------------------- | ------ |
| FR-01 | `SkillCreatorAPI` インターフェースに `onApprovalRequest` メソッドが追加されること                              | must   |
| FR-02 | 実装オブジェクトで `safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback)` を使って購読すること                      | must   |
| FR-03 | コールバックは `{ operationType, description, destination?, sessionId, operationId }` ペイロードを受け取ること | must   |
| FR-04 | 戻り値はリスナー解除関数 `() => void` であること                                                               | must   |
| FR-05 | `SkillLifecyclePanel.tsx` が `onApprovalRequest` を購読し、approval request 受信時に UI を表示すること         | must   |
| FR-06 | approval UI と disclosure UI が対称な責務（同水準のサーフェス）で実装されること                                | must   |

## 非機能要件（NFR-01〜NFR-04）

| ID     | 要件                                                                                                 | 優先度 |
| ------ | ---------------------------------------------------------------------------------------------------- | ------ |
| NFR-01 | `ExecutionAPI.onApprovalRequest` の型定義（`preload/types.ts` 行1038）と互換性のある型を使用すること | must   |
| NFR-02 | 既存の `respondToApproval` / `getDisclosureInfo` テストが引き続き PASS すること                      | must   |
| NFR-03 | `safeOn` 内の `ALLOWED_ON_CHANNELS` チェックを通過すること（既登録チャンネルを使用）                 | must   |
| NFR-04 | コンポーネントのアンマウント時にリスナーが確実に解除されること                                       | must   |

## 受入基準（AC-1〜AC-5）

| ID   | 基準                                                                                                       | 確認方法                                               |
| ---- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| AC-1 | `SkillCreatorAPI` インターフェースに `onApprovalRequest` メソッドが型定義されていること                    | TypeScript コンパイル通過                              |
| AC-2 | `skill-creator-api.ts` 実装オブジェクトで `safeOn(IPC_CHANNELS.APPROVAL_REQUEST, callback)` が呼ばれること | ユニットテスト `skill-creator-api.approval.test.ts`    |
| AC-3 | `SkillLifecyclePanel.tsx` が `onApprovalRequest` を useEffect 内で購読し、受信時に state を更新すること    | ユニットテスト `SkillLifecyclePanel.approval.test.tsx` |
| AC-4 | approval / disclosure の UI surface が対称な構造（同一水準のバナー/サマリー表示）で確認できること          | コードレビュー・手動テスト                             |
| AC-5 | renderer テストで approval request の経路（受信 → state 更新 → UI 表示）が固定されること                   | `SkillLifecyclePanel.approval.test.tsx`                |

## 影響ファイル一覧

### 変更・新規作成対象

| ファイル                                                                                     | 変更種別     | 理由                                                                   |
| -------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts`                                              | 修正（主要） | `SkillCreatorAPI` インターフェース + 実装への `onApprovalRequest` 追加 |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                         | 修正         | approval request 購読 + UI 表示の追加                                  |
| `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`                      | 新規         | `onApprovalRequest` のユニットテスト                                   |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | 新規         | `SkillLifecyclePanel` の approval 経路テスト                           |

### 変更しないファイル

| ファイル                                        | 理由                                  |
| ----------------------------------------------- | ------------------------------------- |
| `apps/desktop/src/preload/channels.ts`          | `APPROVAL_REQUEST` は既登録・変更不要 |
| `apps/desktop/src/preload/types.ts`             | `ExecutionAPI` の型は変更しない       |
| `apps/desktop/src/main/ipc/approvalHandlers.ts` | Main 側の実装は変更不要               |

## Phase 4 開始条件

Phase 4 への進行は Phase 3（設計レビューゲート）が PASS 判定を得た後のみ許可される。

Phase 3 で MAJOR 指摘が発生した場合:

- MAJOR: 設計変更 → Phase 2 へ戻る
- MAJOR: 要件変更 → Phase 1 へ戻る
