# Phase 9 Risk Register

| ID   | リスク                                                                                     | 重要度 | 状態      | 対応                                                                       |
| ---- | ------------------------------------------------------------------------------------------ | ------ | --------- | -------------------------------------------------------------------------- |
| R-01 | repo baseline unassigned violations 377 件が残る                                           | 中     | open      | current FAIL とは分離して記録                                              |
| R-02 | docs-heavy follow-up に code hardening が混ざると workflow narrative が stale になりやすい | 中     | mitigated | source spec / outputs / system spec を same-wave で current facts へ戻した |
| R-03 | `esbuild` mismatch で Vitest 実行可否が環境依存                                            | 低     | open      | typecheck は PASS、Vitest は一時バイナリ回避または既存 tracker で扱う      |
