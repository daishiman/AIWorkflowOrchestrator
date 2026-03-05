# Phase 5 指摘ログ

## 1. 指摘一覧（SubAgent-IMP-INTEGRATOR）

| finding_id  | category | severity | status | description                                                                    | evidence                                       | proposal                                                     | owner                   |
| ----------- | -------- | -------- | ------ | ------------------------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------ | ----------------------- |
| FND-055-001 | 参照導線 | high     | open   | `00-1-design-tokens.md` の正本リンクが自己参照で、実体仕様の特定性が弱い       | `00-1-design-tokens.md:8`                      | 正本パスを実体ファイルへ修正し、互換ファイルである旨を明示   | SubAgent-IMP-TOKENS     |
| FND-055-002 | 語彙整合 | medium   | open   | UX語彙変換は多く反映済みだが、一部仕様は「ガイドライン参照」のみで具体例が薄い | `task-059a-ui-04b-workspace-chat-panel.md:905` | 5D語彙の具体変換例を該当仕様へ追記                           | SubAgent-IMP-SCREENS    |
| FND-055-003 | 監査運用 | low      | open   | `SRC-T5B` の適用境界が仕様間で揺れやすい                                       | `task-061-ui-09-onboarding-wizard.md:34`       | `error/offline` の適用対象外基準をPhase6チェックリストへ固定 | SubAgent-IMP-INTEGRATOR |

## 2. 反映漏れの結論

- 重大な反映漏れ: なし
- 軽微な追記課題: 3件（high 1 / medium 1 / low 1）
- Phase 6 で差分追跡対象として継続

## 3. 修正提案タスク案

| task_id          | priority | description              |
| ---------------- | -------- | ------------------------ |
| TASK-055-FIX-001 | high     | 00-1 正本参照導線の修正  |
| TASK-055-FIX-002 | medium   | 5D語彙変換例の追記       |
| TASK-055-FIX-003 | low      | 対象外判定ルールの明文化 |

## 4. Task 100% 実行確認

- [x] 反映漏れ/表記ずれ/参照不整合を記録
- [x] 重大度と担当を付与
- [x] 修正提案を記録
