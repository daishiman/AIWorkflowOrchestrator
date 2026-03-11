# Phase 1: 要件定義 - タスク仕様書

## 目的

スキルをローカル利用から共有/公開可能な資産へ昇格させるために、公開レベル、互換性、配布境界、検証条件を定義する。

## 実行タスク

1. `ローカルのみ` `チーム共有` `公開可能` の3レベルを定義する
2. バージョン、schema、依存互換性の要件を定義する
3. Task06 の安全性ゲートと Task07 の観測指標を公開可否にどう使うか定義する
4. Skill Center への登録/配布/取り下げ要件を定義する
5. import/export/fork/share の整合方針を定義する

## 参照資料

| 参照資料            | パス                                                                                               | 説明               |
| ------------------- | -------------------------------------------------------------------------------------------------- | ------------------ |
| task-9f skill-share | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-022-task-9f-skill-share.md` | 共有仕様の先行事例 |
| task-05設計         | `../step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md`                             | 利用導線           |
| task-06設計         | `../step-05-par-task-06-trust-permission-governance/phase-2-design.md`                             | 安全性ゲート       |
| task-07設計         | `../step-05-par-task-07-lifecycle-history-feedback/phase-2-design.md`                              | 観測指標           |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                    |
| ------------------------ | ------------------------------------------------------------------------------- | ----------------------- |
| security-skill-execution | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | 公開前安全性            |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | Skill Center 導線       |
| lessons-learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | import/share drift 教訓 |

## 完了条件

- [ ] 公開レベルが定義されている
- [ ] 互換性要件が定義されている
- [ ] 安全性/観測指標の接続条件がある
