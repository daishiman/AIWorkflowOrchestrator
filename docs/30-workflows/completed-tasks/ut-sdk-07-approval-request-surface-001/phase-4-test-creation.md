# Phase 4: テスト作成

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 4                                      |
| 前提Phase  | Phase 3（PASS 判定後のみ）             |
| 後続Phase  | Phase 5                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-06                             |
| 機能名     | ut-sdk-07-approval-request-surface-001 |

## 目的

`onApprovalRequest` の preload 単体テストと `SkillLifecyclePanel.tsx` の approval 経路テストの骨格を TDD（Red）状態で作成する。

**前提**: Phase 3 設計レビューゲート PASS 後のみ本 Phase に着手する。

> Task 1 と Task 2 は依存が薄いため、別 SubAgent で並列作成してよい。Task 3 は両方の骨格が揃ってから実行する。

---

## 実行タスク

### タスク1: `skill-creator-api.approval.test.ts` 骨格作成

**目的**: `onApprovalRequest` の preload 単体テストを Red 状態で作成する

**実行手順**:

1. `apps/desktop/src/preload/__tests__/index.execution.test.ts` の `onApprovalRequest` テストパターン（行169, 250, 498）を参照する
2. 新規ファイル `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts` を作成する
3. 以下のテストシナリオを記述する

**テストシナリオ**:

| ID    | テスト名                                                                           | 種別           |
| ----- | ---------------------------------------------------------------------------------- | -------------- |
| T-4-1 | `onApprovalRequest` が関数として存在すること                                       | 存在確認       |
| T-4-2 | `onApprovalRequest` が `APPROVAL_REQUEST` チャンネルで `on` リスナーを登録すること | 登録確認       |
| T-4-3 | approval request ペイロードがコールバックに渡されること                            | ペイロード確認 |
| T-4-4 | 戻り値のアンサブスクライブ関数を呼ぶとリスナーが解除されること                     | 解除確認       |
| T-4-5 | `APPROVAL_REQUEST` チャンネルが `ALLOWED_ON_CHANNELS` に含まれること               | チャンネル確認 |

**テストファイル骨格**:

```typescript
// apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
// NOTE: 実装後にインポートパスを確定すること

describe("SkillCreatorAPI - onApprovalRequest", () => {
  describe("インターフェース存在確認", () => {
    it("onApprovalRequest が関数として存在すること", () => {
      // TODO: 実装後に実装
    });
  });

  describe("チャンネル購読", () => {
    it("APPROVAL_REQUEST チャンネルで on リスナーを登録すること", () => {
      // TODO: 実装後に実装
    });

    it("approval request ペイロードがコールバックに渡されること", () => {
      // TODO: 実装後に実装
    });
  });

  describe("リスナー解除", () => {
    it("戻り値のアンサブスクライブ関数を呼ぶとリスナーが解除されること", () => {
      // TODO: 実装後に実装
    });
  });

  describe("チャンネル安全性", () => {
    it("APPROVAL_REQUEST が ALLOWED_ON_CHANNELS に含まれること", () => {
      // TODO: 実装後に実装
    });
  });
});
```

---

### タスク2: `SkillLifecyclePanel.approval.test.tsx` 骨格作成

**目的**: `SkillLifecyclePanel.tsx` の approval request 経路テストを Red 状態で作成する

**実行手順**:

1. 既存の `SkillLifecyclePanel` テストパターンを参照する
2. 新規ファイル `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` を作成する
3. 以下のテストシナリオを記述する

**テストシナリオ**:

| ID    | テスト名                                                                                    | 種別       |
| ----- | ------------------------------------------------------------------------------------------- | ---------- |
| T-4-6 | approval request 受信前は approval UI が表示されないこと                                    | 非表示確認 |
| T-4-7 | approval request 受信時に `data-testid="skill-lifecycle-approval-request"` が表示されること | 表示確認   |
| T-4-8 | 表示内容に `operationType` / `description` / `sessionId` が含まれること                     | 内容確認   |
| T-4-9 | コンポーネントアンマウント時にリスナーが解除されること                                      | 解除確認   |

---

### タスク3: TDD Red 状態の確認

**目的**: テストが失敗状態（Red）であることを確認する

**実行手順**:

1. テストを実行して失敗することを確認する
2. 失敗理由が「実装が存在しない」であることを確認する（型エラー・import エラーは想定内）

**実行コマンド**:

```bash
# preload テスト実行
pnpm --filter @repo/desktop test -- skill-creator-api.approval

# renderer テスト実行
pnpm --filter @repo/desktop test -- SkillLifecyclePanel.approval
```

---

## 参照資料

| 参照資料                         | パス                                                                         | 内容                         |
| -------------------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| onApprovalRequest テストパターン | `apps/desktop/src/preload/__tests__/index.execution.test.ts` 行169, 250, 498 | 参照テストパターン           |
| 設計書                           | `phase-2-design.md`                                                          | 実装仕様（テスト設計の根拠） |

---

## 統合テスト連携

IPC 購読テストシナリオを `skill-creator-api.approval.test.ts` に記述する:

| 判定項目                     | 基準 | 結果           |
| ---------------------------- | ---- | -------------- |
| `onApprovalRequest` 存在確認 | PASS | Phase 5 実装後 |
| チャンネル登録確認           | PASS | Phase 5 実装後 |
| ペイロード伝達確認           | PASS | Phase 5 実装後 |
| リスナー解除確認             | PASS | Phase 5 実装後 |

---

## 成果物

| 成果物              | パス                                                                                         | 内容                         |
| ------------------- | -------------------------------------------------------------------------------------------- | ---------------------------- |
| preload テスト骨格  | `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`                      | TDD Red 状態のテストファイル |
| renderer テスト骨格 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | TDD Red 状態のテストファイル |

---

## 完了条件

- [ ] `skill-creator-api.approval.test.ts` が作成され、テストシナリオ T-4-1〜T-4-5 が記述されている
- [ ] `SkillLifecyclePanel.approval.test.tsx` が作成され、テストシナリオ T-4-6〜T-4-9 が記述されている
- [ ] テストが Red（失敗）状態であることが確認されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 5: 実装 → [phase-5-implementation.md](phase-5-implementation.md)
