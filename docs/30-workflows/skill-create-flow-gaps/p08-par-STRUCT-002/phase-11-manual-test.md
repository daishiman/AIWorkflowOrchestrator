# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 11                           |
| Phase名    | 手動テスト                   |
| 対象機能   | TASK-SW-STRUCT-002           |
| 前提Phase  | Phase 10: 最終レビューゲート |
| 次Phase    | Phase 12: ドキュメント更新   |
| ステータス | 未実施                       |
| 作成日     | 2026-04-16                   |

## 目的

`create` モードで実際にスキル生成を実行し、`generateSkillMd` が生成した SKILL.md の
内容が `structurePlan` の `purpose` / `skillName` を反映していることを確認する。
自動テストでは検証できない実際の動作フローと SKILL.md ファイルの内容を確認する。

## 実行タスク

### Task 1: 手動テストシナリオ定義

| シナリオID | シナリオ名                            | 確認内容                                                                 |
| ---------- | ------------------------------------- | ------------------------------------------------------------------------ |
| MT-01      | create モードでスキル生成を実行する   | 生成された SKILL.md に `structurePlan.skillName` が含まれる              |
| MT-02      | create モードでスキル生成を実行する   | 生成された SKILL.md の trigger.description に `purpose` が反映されている |
| MT-03      | create モードでスキル生成を実行する   | `createSkill()` が正常に完了してスキルパスを返す                         |
| MT-04      | generate_skill_md.js が利用不可の環境 | `ensureSkillMdExists` へフォールバックし SKILL.md が生成される           |

### Task 2: テスト実行手順

1. Electron アプリを起動する（または開発環境で `SkillCreatorService.createSkill` を直接呼び出す）
2. `create` モードでスキル名・説明を指定してスキル生成を実行する
3. 生成された SKILL.md の内容を確認する

```typescript
// 一時的なデバッグ確認（手動テスト時のみ追加、コミット前に削除）
console.log(
  "[DEBUG STRUCT-002] structurePlan:",
  JSON.stringify(structurePlan, null, 2),
);
```

**SKILL.md 確認観点**:

- `skillName` がスキルディレクトリ名と一致しているか
- `trigger.description` に `purpose`（= `options.description`）が含まれているか
- `trigger.keywords` にスキル名が含まれているか

### Task 3: 手動テスト結果記録

| シナリオID | 結果                  | 観察内容 |
| ---------- | --------------------- | -------- |
| MT-01      | PASS / FAIL / BLOCKED | TBD      |
| MT-02      | PASS / FAIL / BLOCKED | TBD      |
| MT-03      | PASS / FAIL / BLOCKED | TBD      |
| MT-04      | PASS / FAIL / BLOCKED | TBD      |

## 参照資料

- `outputs/phase-10/TASK-SW-STRUCT-002-final-review-result.md` — 最終レビュー結果

## 統合テスト連携

- 手動テストで `createSkill()` の実フロー（IPC 経由含む）を確認する
- 生成された SKILL.md の内容が `structurePlan` の内容と一致することを確認する

## 成果物

| 成果物                                      | パス                                                           |
| ------------------------------------------- | -------------------------------------------------------------- |
| TASK-SW-STRUCT-002-manual-test-checklist.md | `outputs/phase-11/TASK-SW-STRUCT-002-manual-test-checklist.md` |
| TASK-SW-STRUCT-002-manual-test-result.md    | `outputs/phase-11/TASK-SW-STRUCT-002-manual-test-result.md`    |

## 完了条件

- [ ] 手動テストシナリオ（MT-01〜MT-04）が全て実行されている
- [ ] 手動テスト結果が記録されている
- [ ] PASS / FAIL / BLOCKED の判定が全件埋まっている

## タスク100%実行確認【必須】

- [ ] Task 1（手動テストシナリオ定義）を100%実行した
- [ ] Task 2（テスト実行手順）を100%実行した
- [ ] Task 3（手動テスト結果記録）を100%実行した
- [ ] 成果物（TASK-SW-STRUCT-002-manual-test-checklist.md / TASK-SW-STRUCT-002-manual-test-result.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
