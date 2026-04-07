# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| Phase      | 6                                                                        |
| Phase名    | テスト拡充                                                               |
| 前提Phase  | Phase 5                                                                  |
| 後続Phase  | Phase 7                                                                  |
| ステータス | pending                                                                  |
| 作成日     | 2026-04-06                                                               |
| 機能名     | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001                                |
| タスクID   | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001                                |
| Issue      | [#1682](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1682) |

---

## 目的

Phase 5 の実装に対して fail path・回帰 guard・補助 command を追加する。

Phase 4 の TDD Red テストが Green になった状態を起点として、edge case・型安全性・ALLOWED_ON_CHANNELS 回帰・既存チャンネルへの影響がないことを多角的に検証するテストを追加する。

## 背景

Phase 5 で TDD Green フェーズが完了し、基本テストは PASS している。しかし、将来の変更でリグレッションが発生しないよう、以下の追加テスト観点が必要となる。

- `SKILL_CREATOR_RUNTIME_CHANNELS` が `IPC_CHANNELS` にスプレッドされていること
- `as const` 型が正しく推論されていること
- 既存チャンネル（`APPROVAL_CHANNELS` 等）への影響がないこと
- `ALLOWED_ON_CHANNELS` 回帰確認（3 チャンネルが引き続き含まれていること）

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: edge case テストの追加

**目的**: `SKILL_CREATOR_RUNTIME_CHANNELS` の定義と `IPC_CHANNELS` スプレッドの正確性を多角的に検証する

**対象ファイル**: `packages/shared/src/ipc/__tests__/channels.test.ts`

**追加するテスト観点**:

1. **スプレッド統合確認**: 3 チャンネルが `IPC_CHANNELS` にスプレッドされていること

```typescript
it("SKILL_CREATOR_RUNTIME_CHANNELS が IPC_CHANNELS にスプレッドされている", () => {
  expect(IPC_CHANNELS.SKILL_CREATOR_PROGRESS).toBe(
    SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_PROGRESS,
  );
  expect(IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED).toBe(
    SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
  );
  expect(IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED).toBe(
    SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
  );
});
```

2. **as const 型確認**: `SKILL_CREATOR_RUNTIME_CHANNELS` のプロパティ数が期待値と一致すること

```typescript
it("SKILL_CREATOR_RUNTIME_CHANNELS のキー数が 3 である", () => {
  expect(Object.keys(SKILL_CREATOR_RUNTIME_CHANNELS)).toHaveLength(3);
});
```

3. **既存チャンネルへの影響なし**: `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` 等の既存定義値が変更されていないこと

```typescript
it("既存チャンネルへの影響がない", () => {
  // APPROVAL_CHANNELS が変わっていないことを確認
  expect(IPC_CHANNELS.APPROVAL_RESPOND).toBe("approval:respond");
  expect(IPC_CHANNELS.APPROVAL_REQUEST).toBe("approval:request");
  // EXECUTION_CHANNELS が変わっていないことを確認
  expect(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO).toBe(
    "execution:get-disclosure-info",
  );
});
```

4. **チャンネル文字列形式確認**: 3 チャンネルが `namespace:action` 形式であること

```typescript
it("SKILL_CREATOR_RUNTIME_CHANNELS の値が namespace:action 形式である", () => {
  const channels = Object.values(SKILL_CREATOR_RUNTIME_CHANNELS);
  channels.forEach((ch) => {
    expect(ch).toMatch(/^skill-creator:/);
  });
});
```

---

### タスク2: ALLOWED_ON_CHANNELS 回帰テスト

**目的**: 3 チャンネルが `ALLOWED_ON_CHANNELS` に含まれていることを確認する（preload 側の変更で影響がないことの回帰 guard）

**対象ファイル**: `apps/desktop/src/preload/channels.test.ts`

**追加するテスト観点**:

```typescript
import { IPC_CHANNELS, ALLOWED_ON_CHANNELS } from "../channels";

it("SKILL_CREATOR_RUNTIME_CHANNELS の 3 チャンネルが ALLOWED_ON_CHANNELS に含まれる", () => {
  expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.SKILL_CREATOR_PROGRESS);
  expect(ALLOWED_ON_CHANNELS).toContain(
    IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
  );
  expect(ALLOWED_ON_CHANNELS).toContain(
    IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
  );
});
```

**注意事項**:

- Phase 5 の変更前後で `ALLOWED_ON_CHANNELS` の内容が変わっていないことを確認する
- テストが既存で存在する場合は重複追加しない

---

### タスク3: import パス解決の確認

**目的**: `@repo/shared/src/ipc/channels` からの import が正しく解決されることを確認する

**確認内容**:

- `apps/desktop/src/preload/channels.ts` の import が `@repo/shared/src/ipc/channels` から解決されていること
- TypeScript コンパイルが成功すること（型レベルでの解決確認）

**実行コマンド**:

```bash
pnpm --filter @repo/desktop typecheck
```

---

### タスク4: テスト実行確認

**目的**: タスク1〜3 で追加したテストを含む全テストが PASS することを確認する

**実行コマンド**:

```bash
# shared パッケージのテスト全実行
pnpm --filter @repo/shared test:run

# desktop パッケージのテスト全実行
pnpm --filter @repo/desktop test:run
```

**期待結果**: 拡充テストを含む全テストが PASS する。

---

## 参照資料

| 参照資料         | パス                                                                                   | 内容                           |
| ---------------- | -------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 4 テスト   | `phase-4-test-creation.md`                                                             | 基本テスト仕様（Red フェーズ） |
| Phase 5 実装     | `phase-5-implementation.md`                                                            | 実装内容（Green フェーズ）     |
| shared channels  | `packages/shared/src/ipc/channels.ts`                                                  | 定義元ファイル                 |
| preload channels | `apps/desktop/src/preload/channels.ts`                                                 | import 切り替え済みファイル    |
| shared テスト    | `packages/shared/src/ipc/__tests__/channels.test.ts`                                   | 拡充対象テストファイル         |
| 前タスク Phase 6 | `completed-tasks/step-ut-sdk-07-shared-ipc-channel-contract/phase-6-test-expansion.md` | テスト拡充パターン参照         |

---

## 統合テスト連携（Phase 1〜11は必須）

- shared ↔ preload ↔ ALLOWED_ON_CHANNELS の 3 層にまたがるチャンネル名一貫性を確認する
- allowlist 回帰テストにより、IPC セキュリティ境界でのチャンネル許可が維持されることを保証する
- edge case テストにより、`as const` 型推論と `IPC_CHANNELS` スプレッド統合の正確性を検証する

---

## 成果物

| 成果物                | パス                                                 | 内容                            |
| --------------------- | ---------------------------------------------------- | ------------------------------- |
| 拡充テスト（shared）  | `packages/shared/src/ipc/__tests__/channels.test.ts` | edge case・スプレッド統合テスト |
| 回帰テスト（preload） | `apps/desktop/src/preload/channels.test.ts`          | ALLOWED_ON_CHANNELS 回帰確認    |
| テスト拡充実行結果    | `outputs/phase-6/test-expansion-result.md`           | 全テスト PASS 結果              |

---

## 完了条件

- [ ] `SKILL_CREATOR_RUNTIME_CHANNELS` が `IPC_CHANNELS` にスプレッドされていることをテストしている
- [ ] `SKILL_CREATOR_RUNTIME_CHANNELS` の `as const` 型・プロパティ数をテストしている
- [ ] 既存チャンネル（`APPROVAL_CHANNELS` 等）への影響がないことをテストしている
- [ ] 3 チャンネルが `ALLOWED_ON_CHANNELS` に含まれることを回帰テストしている
- [ ] `pnpm --filter @repo/shared test:run` で全テスト PASS している
- [ ] `pnpm --filter @repo/desktop test:run` で全テスト PASS している
- [ ] `outputs/phase-6/test-expansion-result.md` にテスト結果が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `outputs/phase-6/test-expansion-result.md` に実際のテスト結果を記録済み

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001 --phase 6

node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001 \
  --phase 6 --artifacts "test-expansion-result.md"
```

---

## 依存関係

- **前提**: Phase 5（実装・TDD Green）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001/phase-7-coverage-check.md`
