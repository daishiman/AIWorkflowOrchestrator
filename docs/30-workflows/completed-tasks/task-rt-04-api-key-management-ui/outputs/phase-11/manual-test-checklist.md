# Phase 11 手動テストチェックリスト

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-RT-04 |
| Phase    | 11         |
| 記録日   | 2026-04-04 |
| 判定     | PASS       |

## current facts

| TC-ID    | 観点                            | current fact                                                                | status    |
| -------- | ------------------------------- | --------------------------------------------------------------------------- | --------- |
| TC-11-01 | SettingsView の auth-key 主導線 | `AuthKeySection` と source 表示を current fact として固定                   | completed |
| TC-11-02 | SkillLifecyclePanel の補助導線  | `ApiKeySettingsPanel` 埋め込みを current fact として固定                    | completed |
| TC-11-03 | env-fallback / error            | `saved` / `env-fallback` / `not-set` とマスク要件を current fact として固定 | completed |
| TC-11-04 | 非干渉                          | `SkillLifecyclePanel` の baseline capture を current fact として固定        | completed |

## 記録メモ

- 実画面 capture は current build で取得した。
- TC-11-04 は TC-11-02 の baseline capture を再利用している。
- current facts は `phase-11-manual-test.md` と Phase 12 の出力へ同期する。
