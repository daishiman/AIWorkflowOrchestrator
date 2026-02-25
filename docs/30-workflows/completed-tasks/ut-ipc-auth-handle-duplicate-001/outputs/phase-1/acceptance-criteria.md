# Phase 1 受入基準

## 受入基準一覧

| ID   | 受入基準                                     | 検証方法                             | 合格条件                             |
| ---- | -------------------------------------------- | ------------------------------------ | ------------------------------------ | ----------- | ------- | --------------------------------------------------------- | ------------------------- |
| AC-1 | 対象重複式が5件で固定されている              | `rg -n "AUTH\_(LOGIN                 | LOGOUT                               | GET_SESSION | REFRESH | CHECK_ONLINE)" apps/desktop/src/main/ipc/authHandlers.ts` | 対象5チャネルが確認できる |
| AC-2 | 非範囲が明文化されている                     | `requirements-definition.md` 2.3確認 | 非範囲4項目が記載されている          |
| AC-3 | 契約不変方針が定義されている                 | `requirements-definition.md` 3/5確認 | Main/Preload契約不変が明記されている |
| AC-4 | 回帰観点（戻り値/エラー/型）が定義されている | `requirements-definition.md` 3/4確認 | FR-4/FR-5/NFR-2が満たされる          |
| AC-5 | SubAgent分担が明確                           | `subagent-responsibilities.md` 確認  | A/B/C/D/Lead の責務が分離されている  |

## 判定

- AC-1: PASS
- AC-2: PASS
- AC-3: PASS
- AC-4: PASS
- AC-5: PASS

結論: Phase 1 受入基準を満たす。
