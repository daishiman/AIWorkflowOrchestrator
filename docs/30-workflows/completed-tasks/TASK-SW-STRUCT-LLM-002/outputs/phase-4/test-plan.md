# Phase 4: テスト計画（TDD Red）

## 新規テストファイル

`apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.features.test.ts`

## TC一覧

| TC    | 内容                                               | Phase 4 結果                   |
| ----- | -------------------------------------------------- | ------------------------------ |
| TC-01 | `generate_features.js` が呼ばれること              | FAIL（メソッド未実装）         |
| TC-02 | features が非空配列であること                      | FAIL（`features: []`）         |
| TC-03 | スクリプト失敗時に `features: []` フォールバック   | PASS                           |
| TC-04 | generateSkillMd に features 非空配列が渡されること | FAIL                           |
| TC-05 | structurePlan.features が非空で返却されること      | FAIL                           |
| TC-06 | 他フィールドが影響を受けないこと                   | PASS                           |
| TC-07 | runCreateWorkflow が null 以外を返すこと           | PASS                           |
| TC-08 | parseFeaturesResponse が正しく解析できること       | FAIL（メソッド未実装）         |
| TC-09 | JSON配列のない文字列でエラーをスロー               | PASS（メソッド未実装でスロー） |
| TC-10 | 空のdescriptionでフォールバック                    | FAIL（メソッド未実装）         |
| TC-11 | 長いdescriptionでもエラーなく動作                  | PASS                           |
| TC-12 | 空配列でエラーをスロー                             | PASS（メソッド未実装でスロー） |
| TC-13 | 文字列以外の要素を除去                             | FAIL（メソッド未実装）         |
| TC-14 | タイムアウトエラー時にフォールバック               | FAIL（メソッド未実装）         |

合計: 8 FAIL / 6 PASS（Phase 4 TDD Red 確認済み）
