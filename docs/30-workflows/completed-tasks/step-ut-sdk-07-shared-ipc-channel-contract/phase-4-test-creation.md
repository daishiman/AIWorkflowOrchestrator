# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 4                                          |
| Phase名    | テスト作成                                 |
| 前提Phase  | Phase 3                                    |
| 後続Phase  | Phase 5                                    |
| ステータス | 未実施                                     |
| 作成日     | 2026-03-29                                 |
| 機能名     | step-ut-sdk-07-shared-ipc-channel-contract |

---

## 目的

TDD Red フェーズとして、shared IPC channel 定義のテストを先に作成する。shared 側の定義がまだ存在しないため、テストは初回実行で FAIL することを確認する。

## 背景

Phase 2 設計で策定された 3 つのテスト観点（shared 定義値テスト、cross-layer parity テスト、channel separation assertion）を実装する。TDD の原則に従い、実装前にテストを書くことで仕様を明文化し、実装漏れを防止する。

---

## 実行タスク

### タスク1: shared channel 定義値テスト作成

**目的**: `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` の定義値が正しいことを検証するテストを作成する

**対象ファイル**: `packages/shared/src/ipc/__tests__/channels.test.ts`

**テスト内容**:

```typescript
import { describe, it, expect } from "vitest";
import { APPROVAL_CHANNELS, EXECUTION_CHANNELS } from "../channels";

describe("APPROVAL_CHANNELS", () => {
  it('APPROVAL_RESPOND は "approval:respond"', () => {
    expect(APPROVAL_CHANNELS.APPROVAL_RESPOND).toBe("approval:respond");
  });

  it('APPROVAL_REQUEST は "approval:request"', () => {
    expect(APPROVAL_CHANNELS.APPROVAL_REQUEST).toBe("approval:request");
  });
});

describe("EXECUTION_CHANNELS", () => {
  it('EXECUTION_GET_DISCLOSURE_INFO は "execution:get-disclosure-info"', () => {
    expect(EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO).toBe(
      "execution:get-disclosure-info",
    );
  });
});
```

**TDD 確認**: `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` は未定義のため、import エラーでテストが FAIL すること。

---

### タスク2: cross-layer parity テスト作成

**目的**: shared の定義値と desktop の `IPC_CHANNELS` が一致することを検証するテストを作成する

**対象ファイル**: `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` 観点5拡張

**テスト内容**:

```typescript
import {
  APPROVAL_CHANNELS,
  EXECUTION_CHANNELS,
} from "@repo/shared/src/ipc/channels";
import { IPC_CHANNELS } from "../../../../preload/channels";

// 観点5 に追加
it("shared APPROVAL_CHANNELS と desktop IPC_CHANNELS で同一チャネル名が使用されている", () => {
  expect(IPC_CHANNELS.APPROVAL_RESPOND).toBe(
    APPROVAL_CHANNELS.APPROVAL_RESPOND,
  );
  expect(IPC_CHANNELS.APPROVAL_REQUEST).toBe(
    APPROVAL_CHANNELS.APPROVAL_REQUEST,
  );
  expect(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO).toBe(
    EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO,
  );
});
```

**TDD 確認**: shared 側の `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` が未 export のため、テストが FAIL すること。

---

### タスク3: channel separation assertion 確認

**目的**: 既存の channel separation テストが存在し、チャネル名の衝突がないことを確認する

**確認内容**:

- `APPROVAL_RESPOND !== EXECUTION_GET_DISCLOSURE_INFO` の assertion が既存テストに含まれていることを確認
- 不足している場合は追加する

---

### タスク4: Red フェーズ確認

**目的**: 全テストが FAIL することを確認し、TDD Red フェーズを完了する

**実行コマンド**:

```bash
pnpm --filter @repo/shared test -- --run src/ipc/__tests__/channels.test.ts
```

**期待結果**: `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` が未定義のため、テストが FAIL する。

---

## 参照資料

| 参照資料         | パス                                                                         | 内容                     |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------ |
| Phase 2 設計     | `phase-2-design.md`                                                          | テスト設計・テスト観点   |
| Phase 3 レビュー | `phase-3-design-review.md`                                                   | 設計レビュー結果         |
| 既存テスト       | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | 観点5 channel separation |
| shared channels  | `packages/shared/src/ipc/channels.ts`                                        | 既存チャネル定義パターン |

---

## 統合テスト連携（Phase 4）

- IPC レスポンスフォーマットの事前合意: チャネル名文字列が `namespace:action` 形式であることをテストで保証
- cross-layer parity テストは統合テストの前提条件として機能する
- テスト FAIL 状態を記録し、Phase 5 実装後に Green 化を確認する

---

## 成果物

| 成果物               | パス                                                 | 内容                                 |
| -------------------- | ---------------------------------------------------- | ------------------------------------ |
| shared 定義値テスト  | `packages/shared/src/ipc/__tests__/channels.test.ts` | APPROVAL/EXECUTION テスト            |
| parity テスト        | `governance-bundle.test.ts` 観点5拡張                | shared ↔ desktop parity              |
| Red フェーズ確認ログ | `outputs/phase-4/red-phase-result.md`                | テスト FAIL 結果のスクリーンショット |

---

## 完了条件

- [ ] `packages/shared/src/ipc/__tests__/channels.test.ts` が作成されている
- [ ] `APPROVAL_CHANNELS` の 2 つの定義値テストが記述されている
- [ ] `EXECUTION_CHANNELS` の 1 つの定義値テストが記述されている
- [ ] `governance-bundle.test.ts` に cross-layer parity テストが追加されている
- [ ] channel separation assertion が確認されている
- [ ] 全テストが FAIL すること（Red フェーズ）が確認されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

Phase 5: 実装 → `phase-5-implementation.md`
