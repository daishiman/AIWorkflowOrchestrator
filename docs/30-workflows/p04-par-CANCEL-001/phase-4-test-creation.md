# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 4                           |
| Phase名    | テスト作成                  |
| 対象機能   | TASK-SW-CANCEL-001          |
| 前提Phase  | Phase 3: 設計レビューゲート |
| 次Phase    | Phase 5: 実装               |
| ステータス | 未実施                      |
| 作成日     | 2026-04-16                  |

## 目的

TDD の Red フェーズとして、`SKILL_CREATOR_CANCEL` チャンネル定数追加の実装前に
失敗するテストケースを設計する。AC-1〜AC-4 を網羅するテストケース一覧と、
既存チャンネルの回帰確認計画を策定する。

## 実行タスク

### Task 1: 新規テストケース設計（AC-1〜AC-3）

テスト対象: `packages/shared/src/ipc/channels.ts` のエクスポート内容を検証するテスト

- AC-1: `SKILL_CREATOR_RUNTIME_CHANNELS` に `SKILL_CREATOR_CANCEL` プロパティが存在し、
  値が `"skill-creator:cancel"` であることをアサートする
- AC-2: `IPC_CHANNELS` に `SKILL_CREATOR_CANCEL` が含まれていること（スプレッドによる自動包含）をアサートする
- AC-3: TypeScript のビルドが 0 エラーで通過することを確認する（typecheck コマンドで検証）

### Task 2: 回帰テスト計画（AC-4）

- 既存のチャンネル定数（`SKILL_CREATOR_PROGRESS` / `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` /
  `SKILL_CREATOR_ADAPTER_STATUS_CHANGED`）の値が変更されていないことを確認
- 既存テストが全てパスすることを確認

### Task 3: テストコードスケルトン作成

```typescript
// TC-01: SKILL_CREATOR_CANCEL の存在と値の確認
it("SKILL_CREATOR_RUNTIME_CHANNELS に SKILL_CREATOR_CANCEL が存在し値が正しい", () => {
  expect(SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_CANCEL).toBe(
    "skill-creator:cancel",
  );
});

// TC-02: IPC_CHANNELS への自動包含確認（Preload スプレッド相当）
it("IPC_CHANNELS に SKILL_CREATOR_CANCEL が含まれている", () => {
  expect(IPC_CHANNELS.SKILL_CREATOR_CANCEL).toBe("skill-creator:cancel");
});

// TC-03: 既存チャンネルへの影響なし（回帰）
it("SKILL_CREATOR_PROGRESS の値が変更されていない", () => {
  expect(SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_PROGRESS).toBe(
    "skill-creator:progress",
  );
});
```

## テストケース一覧

### 新規テストケース（TC-01〜TC-02）

| TC ID | 対応AC | テストタイトル                                                            | 期待結果                                                       |
| ----- | ------ | ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| TC-01 | AC-1   | SKILL_CREATOR_RUNTIME_CHANNELS に SKILL_CREATOR_CANCEL が存在し値が正しい | `SKILL_CREATOR_CANCEL === "skill-creator:cancel"`              |
| TC-02 | AC-2   | IPC_CHANNELS に SKILL_CREATOR_CANCEL が含まれている                       | `IPC_CHANNELS.SKILL_CREATOR_CANCEL === "skill-creator:cancel"` |

### 回帰テストケース（TC-R01〜TC-R02）

| TC ID  | 対応AC | テストタイトル                                              | 期待結果       |
| ------ | ------ | ----------------------------------------------------------- | -------------- |
| TC-R01 | AC-4   | SKILL_CREATOR_PROGRESS の値が変更されていない               | 既存動作と同一 |
| TC-R02 | AC-4   | SKILL_CREATOR_WORKFLOW_STATE_CHANGED の値が変更されていない | 既存動作と同一 |

## TDD 確認コマンド

```bash
# Red フェーズ（実装前に TC-01〜TC-02 が失敗することを確認）
pnpm --filter @repo/shared test -- --testPathPattern="channels"

# 型チェック（AC-3 確認）
pnpm --filter @repo/shared typecheck
```

## 参照資料

- `outputs/phase-2/TASK-SW-CANCEL-001-design.md` — 設計書（テスト観測点）
- `outputs/phase-1/TASK-SW-CANCEL-001-requirements.md` — 受入条件（AC-1〜AC-4）

## 統合テスト連携

- 本タスクはユニットテスト（チャンネル定数の値検証）のみを対象とする
- `IPC_CHANNELS` への包含確認は型レベルの検証で対応する

## 成果物

| 成果物                            | パス                                                |
| --------------------------------- | --------------------------------------------------- |
| TASK-SW-CANCEL-001-test-design.md | `outputs/phase-4/TASK-SW-CANCEL-001-test-design.md` |

## 完了条件

- [ ] TC-01〜TC-02 のテストケース設計が完了している
- [ ] TC-R01〜TC-R02 の回帰テスト計画が完了している
- [ ] テストコードスケルトンが作成されている
- [ ] TDD Red フェーズの確認手順が明記されている

## タスク100%実行確認【必須】

- [ ] Task 1（新規テストケース設計）を100%実行した
- [ ] Task 2（回帰テスト計画）を100%実行した
- [ ] Task 3（テストコードスケルトン作成）を100%実行した
- [ ] 成果物（TASK-SW-CANCEL-001-test-design.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
