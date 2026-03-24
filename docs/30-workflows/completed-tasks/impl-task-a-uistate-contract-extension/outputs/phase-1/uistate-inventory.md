# UiState インベントリ

## P50 チェック結果

| 判定   | 条件                                                 |
| ------ | ---------------------------------------------------- |
| 未実装 | `execution-capability.ts` の `UiState` が 3 値のまま |

## 利用箇所一覧

### packages/shared/src/types/

| ファイル                        | 利用形態                          | 影響度 |
| ------------------------------- | --------------------------------- | ------ |
| execution-capability.ts:46      | 型定義                            | high   |
| execution-capability.ts:51-55   | UI_STATE_VALUES                   | high   |
| execution-capability.ts:84-88   | UiStateResult                     | high   |
| execution-capability.ts:95      | CtaInput.uiState                  | high   |
| execution-capability.ts:131     | ExecutionCapabilityStatus.uiState | medium |
| execution-capability.ts:178-186 | resolveUiState overload           | high   |
| execution-capability.ts:247-260 | resolveCtaContract uiState参照    | high   |
| execution-capability.ts:337-342 | assertNoPrimaryCta ガード         | medium |
| auth-mode.ts:11                 | import UiState                    | low    |
| auth-mode.ts:99                 | uiState?: UiState フィールド      | low    |

### packages/shared/src/types/**tests**/

| ファイル                                | 利用形態         | 影響度 |
| --------------------------------------- | ---------------- | ------ |
| cta-contract.test.ts                    | CC-1~CC-5 テスト | medium |
| ui-state-vocabulary-contract.test.ts    | 状態語彙テスト   | medium |
| execution-capability-regression.test.ts | 回帰テスト       | medium |

### apps/desktop/src/

| ファイル                                                 | 利用形態 | 影響度 |
| -------------------------------------------------------- | -------- | ------ |
| renderer/features/mainline-access/mainlineAccess.ts      | 型参照   | low    |
| renderer/features/mainline-access/mainlineAccess.test.ts | テスト   | low    |
| renderer/**tests**/App.renderView.viewtype.test.tsx      | テスト   | low    |
| renderer/**tests**/App.debug-removal.test.tsx            | テスト   | low    |

## 影響度サマリ

- **high**: 6 箇所（型定義 + pure function ロジック）
- **medium**: 5 箇所（テスト + 統合型）
- **low**: 5 箇所（import / 間接参照）
