# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 6                         |
| 機能名     | task-rt-05-test-rerun-ac4 |
| 前提Phase  | Phase 5                   |
| 後続Phase  | Phase 7                   |
| ステータス | 未実施                    |
| 作成日     | 2026-03-31                |

## 目的

AC-3（既存 4 kind が非破壊で動作する）を確認するために、既存 4 kind（single_select / free_text / secret / confirm）のテストケースが Engine・Renderer の両テストファイルに存在することを確認する。既存カバレッジで十分なら no-op、欠損があれば拡充対象として明示する。

## 実行タスク

### タスク1: Engine テストでの 4 kind 確認

**目的**: `SkillCreatorWorkflowEngine.test.ts` に既存 4 kind の回帰テストが存在することを確認する

**実行手順**:

```bash
grep -n "single_select\|free_text\|secret\|confirm" \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

**確認観点**:

- `single_select` のテストが存在するか
- `free_text` のテストが存在するか
- `secret` のテストが存在するか
- `confirm` のテストが存在するか

### タスク2: Renderer テストでの 4 kind 確認

**目的**: `SkillLifecyclePanel.llm-generation.test.tsx` に既存 4 kind の回帰テストが存在することを確認する

**実行手順**:

```bash
grep -n "single_select\|free_text\|secret\|confirm" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

### タスク3: テスト欠損時の対応判断

**目的**: 4 kind のいずれかのテストが欠損している場合の対応を判断する

**判断フロー**:

| 状況                     | 対応                                                                  |
| ------------------------ | --------------------------------------------------------------------- |
| 全 4 kind のテストが存在 | Phase 7 へ進む                                                        |
| 一部のテストが欠損       | 新規テスト追加をスコープ拡大として記録し、追加してから Phase 7 へ進む |
| Engine 側のみ欠損        | Engine テストに追加（Renderer は確認済みなので問題なし）              |
| Renderer 側のみ欠損      | Renderer テストに追加                                                 |

## 参照資料

| 資料名             | パス                                                                                               | 内容                         |
| ------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------- |
| 元の未タスク指示書 | `docs/30-workflows/unassigned-task/task-rt-05-test-rerun-ac4.md`                                   | 苦戦箇所2（AC-4 テスト範囲） |
| Phase 4 テスト作成 | `phase-4-test-creation.md`                                                                         | 事前確認結果                 |
| Engine テスト      | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`              | grep 対象                    |
| Renderer テスト    | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | grep 対象                    |

## 成果物

| 成果物            | パス                                  | 内容                              |
| ----------------- | ------------------------------------- | --------------------------------- |
| テスト拡充仕様    | `phase-6-test-expansion.md`           | grep 手順と追加要否の判断フロー   |
| AC-3 カバーマップ | `outputs/phase-6/ac3-coverage-map.md` | grep 結果と 4 kind の存在確認記録 |

## 統合テスト連携

- Phase 7 でこの確認を基に AC-coverage matrix を完成させる
- Phase 9 の品質保証でこのカバーマップの AC-3 確認が完了する

## 完了条件

- [ ] Engine テストでの 4 kind grep 結果が記録されている
- [ ] Renderer テストでの 4 kind grep 結果が記録されている
- [ ] 欠損 kind がある場合は対応方針（スコープ拡大または既存確認で十分）が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## Phase末端アクション【必須】

- `outputs/phase-6/ac3-coverage-map.md` を作成し、grep 結果を記録する
- `artifacts.json` の Phase 6 ステータスを `completed` に更新する
