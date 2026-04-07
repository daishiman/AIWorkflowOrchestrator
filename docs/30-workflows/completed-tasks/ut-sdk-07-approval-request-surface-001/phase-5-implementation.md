# Phase 5: 実装

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 5                                      |
| 前提Phase  | Phase 4                                |
| 後続Phase  | Phase 6                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-06                             |
| 機能名     | ut-sdk-07-approval-request-surface-001 |

## 目的

Phase 2 の設計に従い、`SkillCreatorAPI.onApprovalRequest` を実装し、`SkillLifecyclePanel.tsx` に approval request 購読と UI を追加する。Phase 4 で作成したテストを Green 状態にする。

---

## 実行タスク

> Task 1 と Task 2 は独立ファイルを触るため、別 SubAgent で並列実行してよい。Task 3 は両方の実装とテスト骨格が揃ってから Green 化する。

### タスク1: `skill-creator-api.ts` インターフェース + 実装追加

**目的**: `SkillCreatorAPI` に `onApprovalRequest` を追加し、テスト T-4-1〜T-4-5 を Green にする

**実行手順**:

1. `apps/desktop/src/preload/skill-creator-api.ts` を開く
2. `SkillCreatorAPI` インターフェースの `getDisclosureInfo` の直後に `onApprovalRequest` を追加する
3. 実装オブジェクトの `getDisclosureInfo` 実装の直後に `onApprovalRequest` 実装を追加する

**追加するコード（インターフェース）**:

```typescript
// --- TASK-SDK-07: approval:request surface 追加 ---
/**
 * approval:request channel 経由で承認リクエストを受信する (AC-1: push 購読)
 */
onApprovalRequest: (
  callback: (payload: {
    operationType: string;
    description: string;
    destination?: string;
    sessionId: string;
    operationId: string;
  }) => void,
) => () => void;
```

**追加するコード（実装オブジェクト）**:

```typescript
// --- TASK-SDK-07: approval:request surface 追加 ---
onApprovalRequest: (
  callback: (payload: {
    operationType: string;
    description: string;
    destination?: string;
    sessionId: string;
    operationId: string;
  }) => void,
): (() => void) =>
  safeOn<{
    operationType: string;
    description: string;
    destination?: string;
    sessionId: string;
    operationId: string;
  }>(IPC_CHANNELS.APPROVAL_REQUEST, callback),
```

**配置先**: `apps/desktop/src/preload/skill-creator-api.ts` の `getDisclosureInfo` 実装の直後（ファイル末尾）

---

### タスク2: `SkillLifecyclePanel.tsx` に approval request 購読 + UI 追加

**目的**: `SkillLifecyclePanel.tsx` が approval request を購読してテスト T-4-6〜T-4-9 を Green にする

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` を開く
2. `disclosureInfo` state（行489〜）の直後に `pendingApprovalRequest` state を追加する
3. disclosure fetch の useEffect 近傍に approval request 購読の useEffect を追加する
4. disclosure summary UI（`data-testid="skill-lifecycle-disclosure-summary"` 近傍）の直後に approval request UI を追加する

**State 追加**:

```typescript
// TASK-SDK-07: approval request state
const [pendingApprovalRequest, setPendingApprovalRequest] = useState<{
  operationType: string;
  description: string;
  destination?: string;
  sessionId: string;
  operationId: string;
} | null>(null);
```

**購読 useEffect 追加**:

```typescript
// TASK-SDK-07: approval:request surface 接続
useEffect(() => {
  const unsubscribe = window.electronAPI.skillCreator.onApprovalRequest(
    (payload) => {
      setPendingApprovalRequest(payload);
    },
  );
  return unsubscribe;
}, []);
```

**UI 追加（disclosure summary の直後）**:

```tsx
{
  pendingApprovalRequest ? (
    <div
      data-testid="skill-lifecycle-approval-request"
      className="mt-2 rounded border border-yellow-400 bg-yellow-50 p-2 text-sm"
    >
      <div className="font-semibold text-yellow-800">
        承認リクエスト: {pendingApprovalRequest.operationType}
      </div>
      <div className="text-yellow-700">
        {pendingApprovalRequest.description}
      </div>
      {pendingApprovalRequest.destination && (
        <div className="text-yellow-600">
          宛先: {pendingApprovalRequest.destination}
        </div>
      )}
      <div className="mt-1 text-xs text-yellow-500">
        Session: {pendingApprovalRequest.sessionId}
      </div>
    </div>
  ) : null;
}
```

---

### タスク3: テスト詳細実装

**目的**: Phase 4 で作成したテスト骨格に実際のアサーションを追加して Green にする

**実行手順**:

1. `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts` を更新する
2. `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` を更新する
3. テストを実行して Green になることを確認する

**実行コマンド**:

```bash
# preload テスト実行
pnpm --filter @repo/desktop test -- skill-creator-api.approval

# renderer テスト実行
pnpm --filter @repo/desktop test -- SkillLifecyclePanel.approval

# 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 参照資料

| 参照資料                 | パス                                                                              | 内容                     |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------ |
| 設計書                   | `phase-2-design.md`                                                               | 実装仕様の詳細           |
| テスト骨格               | `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`           | Phase 4 で作成したテスト |
| getDisclosureInfo 実装例 | `apps/desktop/src/preload/skill-creator-api.ts` 行674                             | 直前の実装パターン       |
| safeOn 実装              | `apps/desktop/src/preload/skill-creator-api.ts` 行405                             | 購読ヘルパー             |
| disclosure UI パターン   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` 行1803〜1848 | 対称実装のベースライン   |

---

## 統合テスト連携

| 判定項目                 | 基準 | 結果            |
| ------------------------ | ---- | --------------- |
| `onApprovalRequest` 存在 | PASS | 本 Phase で確認 |
| チャンネル登録           | PASS | 本 Phase で確認 |
| ペイロード伝達           | PASS | 本 Phase で確認 |
| リスナー解除             | PASS | 本 Phase で確認 |
| UI 表示確認              | PASS | 本 Phase で確認 |

---

## 成果物

| 成果物                    | パス                                                                                         | 内容                                |
| ------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------- |
| skill-creator-api.ts 修正 | `apps/desktop/src/preload/skill-creator-api.ts`                                              | `onApprovalRequest` 追加済み        |
| SkillLifecyclePanel 修正  | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                         | approval request 購読 + UI 追加済み |
| preload テスト            | `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`                      | Green 状態                          |
| renderer テスト           | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | Green 状態                          |

---

## 完了条件

- [ ] `SkillCreatorAPI` インターフェースに `onApprovalRequest` が追加されている
- [ ] 実装オブジェクトに `safeOn` 経由の `onApprovalRequest` が追加されている
- [ ] `SkillLifecyclePanel.tsx` に `pendingApprovalRequest` state・購読・UI が追加されている
- [ ] `skill-creator-api.approval.test.ts` の全テストが Green になっている
- [ ] `SkillLifecyclePanel.approval.test.tsx` の全テストが Green になっている
- [ ] TypeScript 型チェックが通っている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 6: テスト拡充 → [phase-6-test-expansion.md](phase-6-test-expansion.md)
