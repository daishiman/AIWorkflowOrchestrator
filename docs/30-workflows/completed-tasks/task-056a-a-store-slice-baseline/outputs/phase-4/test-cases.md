# Phase 4 テストケース一覧

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-UI-01-A-STORE-SLICE-BASELINE |
| Phase      | 4                                 |
| 作成日     | 2026-03-05                        |
| ステータス | completed                         |

## Unit テスト

| TC-ID | 入力                                                       | 期待結果                                                                         |
| ----- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| U-01  | `STORE_BOUNDARY_MATRIX_BASELINE` の decision 一覧          | すべて許容値4種に含まれる                                                        |
| U-02  | `STORE_BOUNDARY_MATRIX_BASELINE` の domain 一覧            | Notification/HistorySearch/SkillCenter/ViewType を含む                           |
| U-03  | `STORE_SLICE_INVENTORY_BASELINE`                           | 各行が `sliceName/state/actions/selectors/persistence/ownerView/filePath` を保持 |
| U-04  | `STORE_SLICE_INVENTORY_BASELINE` の `persistence.strategy` | `persisted/partial-persisted/non-persisted` のみ                                 |

## Integration テスト

| TC-ID | 入力                                            | 期待結果                      |
| ----- | ----------------------------------------------- | ----------------------------- |
| I-01  | baseline行数                                    | 16行以上                      |
| I-02  | `STORE_PERSISTED_KEYS_BASELINE` と `partialize` | 完全一致                      |
| I-03  | `index.ts` export                               | baseline定数が公開される      |
| I-04  | `types.ts` 型定義                               | baseline型がimport/export可能 |

## Regression テスト

| TC-ID | 入力                                                                 | 期待結果                                                          |
| ----- | -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| R-01  | 合成Hook名一覧（`useLLMStore`, `useSkillStore`, `useAuthModeStore`） | 非推奨リストに保持される                                          |
| R-02  | セレクタ規約ルール                                                   | 禁止パターン（`useError`, `useLoading` 等）が規約上禁止として保持 |
| R-03  | SkillCenter境界                                                      | `local-useState` が維持される                                     |
| R-04  | ViewType境界                                                         | `extend` が維持される                                             |

## テストファイル計画

- `apps/desktop/src/renderer/store/__tests__/sliceBaseline.test.ts`
