# UT-10: disclosureHandlers.ts 独立テストファイル作成

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| ID         | UT-10                                           |
| 由来タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 由来       | 品質向上                                        |
| 優先度     | LOW                                             |
| ステータス | 未着手                                          |
| 検出日     | 2026-03-24                                      |

---

## 概要

`disclosureHandlers.ts` の単体テストファイルを `__tests__/` 配下に作成し、dismiss・reopen・state取得の各シナリオを検証する。既存の結合テストでカバーされているが、独立テストによる保守性向上が望ましい。

## 対象ファイル

| ファイル                                                         | 変更種別 |
| ---------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` | 新規     |
| `apps/desktop/src/main/ipc/disclosureHandlers.ts`                | 参照     |

## 受入基準

- [ ] `disclosureHandlers.test.ts` が `__tests__/` 配下に作成されている
- [ ] dismiss シナリオのテストが存在する
- [ ] reopen シナリオのテストが存在する
- [ ] state 取得シナリオのテストが存在する
- [ ] 全テストが PASS する
