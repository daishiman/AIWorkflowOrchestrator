# Phase 1 受け入れ基準

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-UI-01-A-STORE-SLICE-BASELINE |
| Phase      | 1                                 |
| 作成日     | 2026-03-05                        |
| ステータス | completed                         |

## 受け入れ基準一覧

| AC    | 基準                                                            | 検証方法                                           | 判定 |
| ----- | --------------------------------------------------------------- | -------------------------------------------------- | ---- |
| AC-01 | FR/NFR がすべて定義されている                                   | 本ファイルと `requirements-definition.md` の照合   | PASS |
| AC-02 | スコープ外項目が明文化されている                                | `scope-matrix.md` の out-of-scope を確認           | PASS |
| AC-03 | Slice 台帳の必須列が固定されている                              | `phase-2/slice-inventory-design.md` の列定義を確認 | PASS |
| AC-04 | 境界判定が4種に限定される                                       | `phase-2/slice-boundary-design.md` の定義を確認    | PASS |
| AC-05 | SkillCenter が `local-useState` で固定される                    | 境界設計と判定理由を確認                           | PASS |
| AC-06 | P31対策規約（合成Hook非推奨）が要件化される                     | `phase-2/selector-policy-design.md` を確認         | PASS |
| AC-07 | `task-056c` / `task-056d` への引き渡し条件が定義される          | リンク実在確認（`test -f`）                        | PASS |
| AC-08 | IPC変更なし/認証境界不変/データフロー境界の統合要件が記載される | 統合テスト連携表を確認                             | PASS |

## Gate 判定

- 判定: **PASS**
- 根拠: AC-01〜AC-08 を満たしたため、Phase 2へ進行可能。
