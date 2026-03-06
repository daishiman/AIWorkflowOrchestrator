# Phase 4 テスト仕様書

## テスト束

| 束   | 目的                                  |
| ---- | ------------------------------------- |
| TS-1 | canonical active/completed 集合の一致 |
| TS-2 | derived ledger 2台帳の同期            |
| TS-3 | 参照パス実在性                        |
| TS-4 | current/baseline 判定分離             |

## 実装対象

- `validate-task10ab-ledger-sync.js`
- `validate-task10ab-ledger-sync.test.mjs`

## 合格条件

- node test が PASS
- ledger validator が PASS
- current 監査が PASS
