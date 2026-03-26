# Manual Test Checklist

## テストケース

| テストケース | 実施 | 観点                                               | 備考                                                            |
| ------------ | ---- | -------------------------------------------------- | --------------------------------------------------------------- |
| TC-11-01     | [x]  | Task02 owner 契約が明記されている                  | `currentPhase` / `awaitingUserInput` / `verifyResult` を確認    |
| TC-11-02     | [x]  | question kind 4 種が定義されている                 | input kind と表示責務を確認                                     |
| TC-11-03     | [x]  | 4 block の分離が説明されている                     | phase badge / question host / provenance summary / handoff card |
| TC-11-04     | [x]  | execute handoff visible 化が受入基準に含まれている | console-only 禁止を確認                                         |
| TC-11-05     | [x]  | Task05 / 06 / 07 / 08 への委譲境界が明記されている | downstream boundary を確認                                      |

## 画面カバレッジマトリクス

| テストケース | surface            | capture | evidence                | 備考                    |
| ------------ | ------------------ | ------- | ----------------------- | ----------------------- |
| TC-11-01     | phase badge        | N/A     | `manual-test-result.md` | docs-heavy walkthrough  |
| TC-11-02     | question host      | N/A     | `manual-test-result.md` | `captureRequired=false` |
| TC-11-03     | provenance summary | N/A     | `manual-test-result.md` | markdown evidence       |
| TC-11-04     | handoff card       | N/A     | `manual-test-result.md` | visible handoff 観点    |
| TC-11-05     | boundary note      | N/A     | `manual-test-result.md` | downstream handoff 観点 |

## Evidence Policy

- [x] docs-heavy task として `captureRequired=false` を採用
- [x] screenshot inventory は JSON で保持
- [x] 主根拠は checklist / result / report に置く
