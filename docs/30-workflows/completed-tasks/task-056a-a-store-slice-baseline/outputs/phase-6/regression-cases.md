# Phase 6 回帰ケース一覧

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-UI-01-A-STORE-SLICE-BASELINE |
| Phase      | 6                                 |
| 実施日     | 2026-03-05                        |
| ステータス | completed                         |

## 回帰ケース

| RC-ID | 観点                    | 手順                                                             | 期待結果                                                  | 判定 |
| ----- | ----------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- | ---- |
| RC-01 | P31: 合成Hook再導入防止 | `STORE_SELECTOR_POLICY_BASELINE.deprecatedCompositeHooks` を検証 | `useLLMStore/useSkillStore/useAuthModeStore` が維持される | PASS |
| RC-02 | 命名規約後退防止        | `bannedGenericSelectorNames` を検証                              | `useError/useLoading` が禁止名として維持される            | PASS |
| RC-03 | SkillCenter境界後退防止 | `STORE_BOUNDARY_MATRIX_BASELINE` で SkillCenter を検索           | decision が `local-useState`                              | PASS |
| RC-04 | ViewType境界後退防止    | `STORE_BOUNDARY_MATRIX_BASELINE` で ViewType を検索              | decision が `extend`                                      | PASS |
| RC-05 | persisted key 逸脱防止  | 台帳集計キーと baselineキーを比較                                | 差分0件                                                   | PASS |
| RC-06 | 許容判定値逸脱防止      | 全 decision の enum チェック                                     | 許容値4種以外が0件                                        | PASS |

## 実行ファイル

- `apps/desktop/src/renderer/store/__tests__/sliceBaseline.test.ts`
