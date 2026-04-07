# Phase 2: 設計

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| 前提Phase  | Phase 1                                |
| 後続Phase  | Phase 3                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-06                             |
| 機能名     | ut-sdk-07-approval-request-surface-001 |

## 目的

`SkillCreatorAPI.onApprovalRequest` のインターフェース設計と実装設計、および `SkillLifecyclePanel.tsx` の approval request 購読 + UI 設計を確定する。

---

## 実行タスク

> Task 1 と Task 2 は独立しているため、別 SubAgent で並列実行してよい。Task 3 は両方の結果が揃ってから実行する。

### タスク1: `SkillCreatorAPI` インターフェース設計

**目的**: `onApprovalRequest` メソッドのシグネチャを確定する

**実行手順**:

1. `apps/desktop/src/preload/types.ts` 行1038 の `ExecutionAPI.onApprovalRequest` の型定義を確認する
2. `SkillCreatorAPI` インターフェースの現在の末尾（`getDisclosureInfo` の直後）を確認する
3. 追加するメソッドのシグネチャを設計する

**設計仕様**:

```typescript
// SkillCreatorAPI インターフェースへの追加（skill-creator-api.ts）
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

**実装仕様**:

```typescript
// skill-creator-api.ts 実装オブジェクトへの追加
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

**配置先**: `apps/desktop/src/preload/skill-creator-api.ts` の `getDisclosureInfo` の直後

---

### タスク2: `SkillLifecyclePanel.tsx` approval request UI 設計

**目的**: approval request 受信時の state 管理と UI 表示方法を設計する

**実行手順**:

1. `SkillLifecyclePanel.tsx` の `disclosureInfo` state の実装パターン（行489〜）を確認する
2. approval request state の型と表示方法を設計する
3. useEffect での購読解除パターンを設計する

**State 設計**:

```typescript
// 既存の disclosureInfo state の直後に追加
// TASK-SDK-07: approval request state
const [pendingApprovalRequest, setPendingApprovalRequest] = useState<{
  operationType: string;
  description: string;
  destination?: string;
  sessionId: string;
  operationId: string;
} | null>(null);
```

**購読設計**:

```typescript
// useEffect 内での購読（既存 disclosure fetch の近傍に追加）
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

**UI 設計方針**:

- `disclosureInfo` の `data-testid="skill-lifecycle-disclosure-summary"` と対称な構造
- `data-testid="skill-lifecycle-approval-request"` を付与
- approval request が存在する場合のみ表示（disclosure サマリーと同水準）
- `sessionId` / `operationId` / `operationType` / `description` を表示

---

### タスク3: 型整合性確認

**目的**: 既存型定義との整合性を検証する

**実行手順**:

1. `SkillCreatorAPI` インターフェースと実装オブジェクトの型が一致することを確認する
2. `ExecutionAPI.onApprovalRequest` の型（`preload/types.ts` 行1038）と互換性があることを確認する
3. `IPC_CHANNELS.APPROVAL_REQUEST` が `ALLOWED_ON_CHANNELS` に含まれることを確認する

**確認コマンド**:

```bash
# 型チェック（設計段階での確認）
pnpm --filter @repo/desktop typecheck

# ALLOWED_ON_CHANNELS に APPROVAL_REQUEST が含まれることを確認
grep -n "APPROVAL_REQUEST" apps/desktop/src/preload/channels.ts
```

---

## 参照資料

| 参照資料                       | パス                                                                       | 内容                                                 |
| ------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------- |
| ExecutionAPI 型定義            | `apps/desktop/src/preload/types.ts` 行1038                                 | `onApprovalRequest` 型の参照元                       |
| skill-creator-api.ts 末尾      | `apps/desktop/src/preload/skill-creator-api.ts` 行661〜676                 | `respondToApproval`/`getDisclosureInfo` 追加済み箇所 |
| safeOn 実装                    | `apps/desktop/src/preload/skill-creator-api.ts` 行405〜                    | 購読ヘルパーパターン                                 |
| SkillLifecyclePanel disclosure | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` 行489 | disclosureInfo state パターン                        |

---

## 成果物

| 成果物 | パス                | 内容       |
| ------ | ------------------- | ---------- |
| 設計書 | `phase-2-design.md` | 本ファイル |

---

## 完了条件

- [ ] `SkillCreatorAPI` インターフェースへの `onApprovalRequest` 追加設計が完了している
- [ ] 実装オブジェクトへの `safeOn` 経由実装設計が完了している
- [ ] `SkillLifecyclePanel.tsx` の state / 購読 / UI 設計が完了している
- [ ] 型整合性が確認されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 3: 設計レビューゲート → [phase-3-design-review.md](phase-3-design-review.md)
