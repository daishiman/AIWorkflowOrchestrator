# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 11                           |
| Phase名    | 手動テスト                   |
| 対象機能   | TASK-SW-CANCEL-001           |
| 前提Phase  | Phase 10: 最終レビューゲート |
| 次Phase    | Phase 12: ドキュメント更新   |
| ステータス | 未実施                       |
| 作成日     | 2026-04-16                   |

## 目的

`SKILL_CREATOR_CANCEL` チャンネル定数が `IPC_CHANNELS` に正しく含まれていることを
実際のビルド・型推論で確認する。
自動テストでは検証できない Preload 側スプレッドによる自動有効化の実際の動作を確認する。

## 実行タスク

### Task 1: 手動テストシナリオ定義

| シナリオID | シナリオ名                                             | 確認内容                                                                          |
| ---------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| MT-01      | channels.ts ビルド後に SKILL_CREATOR_CANCEL が参照可能 | `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が `"skill-creator:cancel"` を返す            |
| MT-02      | Preload 側ビルドで SKILL_CREATOR_CANCEL が自動有効化   | `apps/desktop/src/preload/channels.ts` のビルドに SKILL_CREATOR_CANCEL が含まれる |
| MT-03      | 既存の IPC 通信に影響がない                            | Electron アプリ起動時に既存の IPC チャンネルが正常に動作する                      |

### Task 2: テスト実行手順

1. `packages/shared` をビルドする

```bash
pnpm --filter @repo/shared build
```

2. ビルド後に型定義ファイルを確認し、`SKILL_CREATOR_CANCEL` が含まれていることを確認する

3. `apps/desktop` の型チェックを実行して Preload 側の自動有効化を確認する

```bash
pnpm --filter @repo/desktop typecheck
```

4. Electron アプリを起動して既存 IPC 通信に影響がないことを確認する（任意）

```typescript
// 一時的なデバッグ確認（手動テスト時のみ追加、コミット前に削除）
console.log(
  "[DEBUG CANCEL-001] SKILL_CREATOR_CANCEL:",
  IPC_CHANNELS.SKILL_CREATOR_CANCEL,
);
```

### Task 3: 手動テスト結果記録

| シナリオID | 結果                  | 観察内容 |
| ---------- | --------------------- | -------- |
| MT-01      | PASS / FAIL / BLOCKED | TBD      |
| MT-02      | PASS / FAIL / BLOCKED | TBD      |
| MT-03      | PASS / FAIL / BLOCKED | TBD      |

## 参照資料

- `outputs/phase-10/TASK-SW-CANCEL-001-final-review-result.md` — 最終レビュー結果

## 統合テスト連携

- 手動テストで `IPC_CHANNELS.SKILL_CREATOR_CANCEL` の実際の値を確認する
- TASK-SW-CANCEL-002 の前提条件として `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が正しく定義されていることを確認する

## 成果物

| 成果物                                      | パス                                                           |
| ------------------------------------------- | -------------------------------------------------------------- |
| TASK-SW-CANCEL-001-manual-test-checklist.md | `outputs/phase-11/TASK-SW-CANCEL-001-manual-test-checklist.md` |
| TASK-SW-CANCEL-001-manual-test-result.md    | `outputs/phase-11/TASK-SW-CANCEL-001-manual-test-result.md`    |

## 完了条件

- [ ] 手動テストシナリオ（MT-01〜MT-03）が全て実行されている
- [ ] 手動テスト結果が記録されている
- [ ] PASS / FAIL / BLOCKED の判定が全件埋まっている

## タスク100%実行確認【必須】

- [ ] Task 1（手動テストシナリオ定義）を100%実行した
- [ ] Task 2（テスト実行手順）を100%実行した
- [ ] Task 3（手動テスト結果記録）を100%実行した
- [ ] 成果物（TASK-SW-CANCEL-001-manual-test-checklist.md / TASK-SW-CANCEL-001-manual-test-result.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
