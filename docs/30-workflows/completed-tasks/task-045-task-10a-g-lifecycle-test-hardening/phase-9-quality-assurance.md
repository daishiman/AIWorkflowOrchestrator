# Phase 9: 品質検証

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 9                                   |
| 機能名     | task-10a-g-lifecycle-test-hardening |
| タスクID   | TASK-10A-G                          |
| 作成日     | 2026-03-10                          |
| 前提Phase  | Phase 8                             |
| 依存タスク | TASK-10A-E, TASK-10A-F              |

## 目的

Phase 8 後の成果物に対して、型安全性、lint、targeted test、回帰、coverage を再確認し、Phase 10 へ進めるだけの品質を満たしているか判定する。QG-8 は handler-scope coverage と targeted coverage を中心に判定し、broad file coverage を補助情報として扱う。

## 実行タスク

- Task 1: typecheck を実行する
- Task 2: lint を実行する
- Task 3: G1/G2/G3 の対象テストを確認する
- Task 4: targeted regression を確認する
- Task 5: coverage を最終確認する

## 品質ゲート定義

### QG-1: TypeScript 型チェック

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| コマンド | `pnpm --filter @repo/desktop typecheck` |
| 合格基準 | エラーゼロ                              |
| 失敗時   | 型修正後に再実行                        |

### QG-2: ESLint

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| コマンド | `pnpm --filter @repo/desktop lint` |
| 合格基準 | エラーゼロ                         |
| 失敗時   | lint 修正後に再実行                |

### QG-3: G1 テスト

| 項目     | 内容                                                                                     |
| -------- | ---------------------------------------------------------------------------------------- |
| コマンド | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts` |
| 合格基準 | G1-VAL / G1-DEL / G1-ERR が全 PASS                                                       |
| 失敗時   | handler 契約または mock を修正                                                           |

### QG-4: G2 テスト

| 項目     | 内容                                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| コマンド | `cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` |
| 合格基準 | create / analyze / improve / selector テストが全 PASS                                                            |
| 失敗時   | Store / hook / preload mock を修正                                                                               |

### QG-5: G3 テスト

| 項目     | 内容                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| コマンド | `cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx` |
| 合格基準 | toggle / visibility / guard / wiring テストが全 PASS                                                            |
| 失敗時   | ChatPanel 結線や mock reset を修正                                                                              |

### QG-6: 回帰テスト（Main / handler）

| 項目     | 内容                                                                                                                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| コマンド | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts src/main/ipc/__tests__/skillHandlers.contract.test.ts src/main/ipc/__tests__/skillHandlers.validation.test.ts` |
| 合格基準 | 既存 handler suite 全 PASS                                                                                                                                                                      |
| 失敗時   | G1 追加による副作用を調査                                                                                                                                                                       |

### QG-7: 回帰テスト（Store / lifecycle）

| 項目     | 内容                                                                                                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| コマンド | `cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx` |
| 合格基準 | 既存 lifecycle suite 全 PASS                                                                                                                                                           |
| 失敗時   | G2/G3 追加による副作用を調査                                                                                                                                                           |

### QG-8: coverage 確認

| 項目         | 内容                                                                                                                                                                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| コマンド     | `cd apps/desktop && pnpm vitest run --coverage src/main/ipc/__tests__/skillHandlers.create.test.ts src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx` |
| 補助コマンド | `cd apps/desktop && pnpm exec tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --target skill:create --coverage coverage/coverage-final.json`                                                                                       |
| 合格基準     | G1 handler-scope coverage と G2/G3 targeted coverage が基準以上                                                                                                                                                                                            |
| 失敗時       | Phase 6 へ差し戻し候補を整理                                                                                                                                                                                                                               |

## 実行手順

### Step 1: 型・lint

1. QG-1 を実行する
2. QG-2 を実行する
3. FAIL があれば修正してから次へ進む

### Step 2: 対象テスト

1. QG-3 を実行する
2. QG-4 を実行する
3. QG-5 を実行する

### Step 3: 回帰テスト

1. QG-6 を実行する
2. QG-7 を実行する
3. 新規テスト追加による副作用の有無を記録する

### Step 4: coverage

1. QG-8 の suite coverage を実行する
2. `coverage-by-handler.ts` で G1 の handler-scope coverage を取得する
3. Phase 7 達成値と比較し、低下がないか確認する

### Step 5: 品質検証レポート作成

1. QG-1〜QG-8 をレポート化する
2. PASS なら Phase 10 進行
3. FAIL なら修正または差し戻し先を記録する

## 品質ゲートサマリテンプレート

```markdown
## 品質検証結果サマリ

| ゲートID | 検証項目              | 結果      | 詳細                              |
| -------- | --------------------- | --------- | --------------------------------- |
| QG-1     | TypeScript 型チェック | PASS/FAIL | エラー数                          |
| QG-2     | ESLint                | PASS/FAIL | エラー数                          |
| QG-3     | G1 テスト             | PASS/FAIL | 件数                              |
| QG-4     | G2 テスト             | PASS/FAIL | 件数                              |
| QG-5     | G3 テスト             | PASS/FAIL | 件数                              |
| QG-6     | Main 回帰             | PASS/FAIL | 既存 suite                        |
| QG-7     | Store/Chat 回帰       | PASS/FAIL | 既存 suite                        |
| QG-8     | coverage              | PASS/FAIL | handler-scope / targeted coverage |
```

## 既知の落とし穴への対策確認

| Pitfall | 品質検証での確認ポイント                           |
| ------- | -------------------------------------------------- |
| P9      | reset 後も順序依存がない                           |
| P13     | タイマーテストがある場合のみ適切な進め方をしている |
| P31     | selector / hook が不要再評価を起こさない           |
| P39     | `userEvent` ではなく `fireEvent` を使っている      |
| P40     | `cd apps/desktop &&` で実行している                |
| P42     | `description` の 3 段バリデーションが PASS         |
| P48     | selector stability が PASS                         |

## 参照資料

| 参照資料                     | パス                                                                        | 使用目的                                 |
| ---------------------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| 品質要件                     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質ゲート基準                           |
| タスク運用台帳               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | gate 判定基準                            |
| 教訓                         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | handler-scope coverage と Phase 4-5 教訓 |
| エラー仕様                   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | error 契約確認                           |
| Phase 7 結果                 | `phase-7-coverage-check.md`                                                 | coverage 比較観点                        |
| Phase 8 結果                 | `phase-8-refactoring.md`                                                    | refactor 差分確認                        |
| Phase 5 Green レポート       | `outputs/phase-5/g1-g2-g3-green-report.md`                                  | 品質ゲートの基準線                       |
| Phase 7 coverage レポート    | `outputs/phase-7/coverage-final-report.md`                                  | coverage 数値の実測根拠                  |
| Phase 8 refactoring レポート | `outputs/phase-8/refactoring-report.md`                                     | 変更内容の実績参照                       |

## 統合テスト連携

```text
QG-1/QG-2 -> QG-3/QG-4/QG-5 -> QG-6/QG-7 -> QG-8
```

- 型・lint が FAIL のまま後続ゲートを信頼しない
- targeted test が FAIL のまま coverage 数字だけで合格としない
- G1 は handler-scope、G2/G3 は targeted coverage を主判定とする

## 多角的チェック観点

| 観点          | 確認内容                                  |
| ------------- | ----------------------------------------- |
| 型安全        | strict mode で破綻していない              |
| コード品質    | lint エラーがない                         |
| 正常性        | G1/G2/G3 が全 PASS                        |
| 回帰防止      | 既存 handler / Store / Chat tests が PASS |
| coverage 粒度 | 主判定と補助判定が混線していない          |
| 実行時間      | 対象テストが実用的な時間内に終わる        |

## 成果物

| 成果物           | パス                                                                                                                            | 種別 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 品質検証レポート | `docs/30-workflows/completed-tasks/task-045-task-10a-g-lifecycle-test-hardening/outputs/phase-9/quality-verification-report.md` | 新規 |

## 完了条件

- [ ] QG-1 PASS
- [ ] QG-2 PASS
- [ ] QG-3 PASS
- [ ] QG-4 PASS
- [ ] QG-5 PASS
- [ ] QG-6 PASS
- [ ] QG-7 PASS
- [ ] QG-8 PASS
- [ ] 品質検証レポートが作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 10: 最終レビュー
