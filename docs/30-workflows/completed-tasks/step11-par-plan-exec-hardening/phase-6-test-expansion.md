# Phase 6: テスト拡張

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 6                                         |
| 機能名 | step-11-par-task-plan-execution-hardening |
| 作成日 | 2026-03-31                                |

## 目的

Phase 5 の実装が壊れないよう、エッジケースと境界値を追加する。

## 実行タスク

- P0-07 の source of truth 境界を追加検証する
- U2 の snapshot semantics 境界を追加検証する

## 参照資料

| 資料名            | パス                                                                                               | 参照理由       |
| ----------------- | -------------------------------------------------------------------------------------------------- | -------------- |
| runtime plan test | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`          | P0-07 の拡張先 |
| renderer llm test | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | U2 の拡張先    |

## テスト拡張観点

### TASK-P0-07

- `PLAN_RESOURCE_REQUESTS` に non-agent エントリが混ざる場合でも agent 名導出が壊れない
- agent エントリの順番が変わると prompt も同じ順番で変わる
- fallback path で同じ source of truth を使っていることを確認する

### TASK-SDK-04-U2

- generate 直後に execute しようとした場合の early return を確認する
- execute 失敗後も approved snapshot が壊れないことを確認する
- generate → cancel → generate のサイクルで snapshot が正しく更新されることを確認する

## 追加テストケース

### TASK-P0-07

| ID      | シナリオ                                                 | 詳細                                           |
| ------- | -------------------------------------------------------- | ---------------------------------------------- |
| T-P7-06 | `PLAN_RESOURCE_REQUESTS` に non-agent エントリが含まれる | agent 名導出に含めない                         |
| T-P7-07 | agent エントリの順序が変わる                             | prompt の読み込み順が同じ順である              |
| T-P7-08 | fallback path でも agent 導出が一致する                  | `PLAN_RESOURCE_REQUESTS` と同じ agent 群になる |
| T-P7-09 | `AGENT_NAMES` の残留参照が 0 件                          | grep で検出できる                              |

### TASK-SDK-04-U2

| ID      | シナリオ                  | 詳細                                    |
| ------- | ------------------------- | --------------------------------------- |
| T-S4-05 | generate → edit → execute | live draft が execute に流れない        |
| T-S4-06 | execute 失敗後            | approved snapshot が残る                |
| T-S4-07 | cancel 後の再生成         | snapshot が null → 新しい値に更新される |
| T-S4-08 | plan 失敗時               | approved snapshot が更新されない        |

## 成果物

| 成果物         | パス                                        | 説明             |
| -------------- | ------------------------------------------- | ---------------- |
| テスト拡張記録 | `phase-6-test-expansion.md`                 | edge case の固定 |
| 拡張メモ       | `outputs/phase-6/test-expansion-summary.md` | 追加ケースの要約 |

## 完了条件

- [ ] P0-07 の edge case が source of truth ベースで追加されている
- [ ] U2 の edge case が snapshot semantics ベースで追加されている
- [ ] 既存テストの意図が崩れていない

## サブタスク管理

1. P0-07 の edge case 追加
2. U2 の edge case 追加
3. 既存テストとの衝突確認

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] 追加ケースが current code anchor に対応している
- [ ] Phase 7 で coverage 計測に進める
