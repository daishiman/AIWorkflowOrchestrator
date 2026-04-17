# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 11                           |
| Phase名    | 手動テスト                   |
| 対象機能   | TASK-SW-STREAM-001           |
| 前提Phase  | Phase 10: 最終レビューゲート |
| 次Phase    | Phase 12: ドキュメント更新   |
| ステータス | 未実施                       |
| 作成日     | 2026-04-16                   |

## 目的

`create` モードで実際にスキル生成を実行し、`onProgress` コールバックが
処理の各節目で正しく呼び出されることをログ・デバッグ出力で確認する。
自動テストでは検証できない実際の動作フロー（処理タイミング・呼び出し順序）を確認する。

## 実行タスク

### Task 1: 手動テストシナリオ定義

| シナリオID | シナリオ名                           | 確認内容                                                        |
| ---------- | ------------------------------------ | --------------------------------------------------------------- |
| MT-01      | create モードでスキル生成を実行する  | `planning` コールバックが最初に発火する                         |
| MT-02      | create モードでスキル生成を実行する  | 5つのフェーズが順番通り（10% → 40% → 70% → 90% → 100%）発火する |
| MT-03      | create モードでスキル生成を実行する  | `createSkill()` が正常に完了してスキルパスを返す                |
| MT-04      | onProgress なしで createSkill を実行 | エラーなし、通常通り完了する                                    |

### Task 2: テスト実行手順

1. Electron アプリを起動する（または開発環境で `SkillCreatorService.createSkill` を直接呼び出す）
2. `create` モードでスキル名・説明を指定してスキル生成を実行する
3. ログ出力または一時的なデバッグコードで `onProgress` の発火タイミングを確認する

```typescript
// 一時的なデバッグ確認（手動テスト時のみ追加、コミット前に削除）
const onProgress = (progress: {
  phase: string;
  percentage: number;
  message: string;
}) => {
  console.log(
    `[DEBUG STREAM-001] onProgress: phase=${progress.phase}, percentage=${progress.percentage}, message=${progress.message}`,
  );
};

await skillCreatorService.createSkill(
  { mode: "create", name: "test-skill", description: "テスト用スキル" },
  onProgress,
);
```

### Task 3: 手動テスト結果記録

| シナリオID | 結果                  | 観察内容 |
| ---------- | --------------------- | -------- |
| MT-01      | PASS / FAIL / BLOCKED | TBD      |
| MT-02      | PASS / FAIL / BLOCKED | TBD      |
| MT-03      | PASS / FAIL / BLOCKED | TBD      |
| MT-04      | PASS / FAIL / BLOCKED | TBD      |

## 参照資料

- `outputs/phase-10/TASK-SW-STREAM-001-final-review-result.md` — 最終レビュー結果

## 統合テスト連携

- 手動テストで `createSkill()` の実フロー（IPC 経由含む）を確認する
- TASK-SW-STREAM-002 の前提条件として `onProgress` コールバックが正しく発火することを確認する

## 成果物

| 成果物                                      | パス                                                           |
| ------------------------------------------- | -------------------------------------------------------------- |
| TASK-SW-STREAM-001-manual-test-checklist.md | `outputs/phase-11/TASK-SW-STREAM-001-manual-test-checklist.md` |
| TASK-SW-STREAM-001-manual-test-result.md    | `outputs/phase-11/TASK-SW-STREAM-001-manual-test-result.md`    |

## 完了条件

- [ ] 手動テストシナリオ（MT-01〜MT-04）が全て実行されている
- [ ] 手動テスト結果が記録されている
- [ ] PASS / FAIL / BLOCKED の判定が全件埋まっている

## タスク100%実行確認【必須】

- [ ] Task 1（手動テストシナリオ定義）を100%実行した
- [ ] Task 2（テスト実行手順）を100%実行した
- [ ] Task 3（手動テスト結果記録）を100%実行した
- [ ] 成果物（TASK-SW-STREAM-001-manual-test-checklist.md / TASK-SW-STREAM-001-manual-test-result.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
