# Phase 1: 要件定義 - タスク仕様書

## 目的

スキル作成・実行・再利用の全導線に対して、どこで権限を求め、何を危険操作とみなし、どう説明責任を果たすかを定義する。

## 実行タスク

1. 危険操作、機密操作、公開前確認の対象を定義する
2. `許可` `拒否` `今回のみ許可` `恒久許可` の扱いを定義する
3. 承認履歴と取り消し導線を定義する
4. Task03/05 の導線にどのタイミングで権限確認を差し込むか定義する
5. Task08 の公開/共有ガードに渡す安全性契約を整理する

## 参照資料

| 参照資料                      | パス                                                                                 | 説明                    |
| ----------------------------- | ------------------------------------------------------------------------------------ | ----------------------- |
| security-skill-execution      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`      | 実行安全性              |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | PermissionResolver 契約 |
| ui-ux-settings                | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                | 権限履歴パネル          |
| task-03設計                   | `../step-02-par-task-03-skill-creator-execute-improve-integration/phase-2-design.md` | lifecycle 統合前提      |
| task-05設計                   | `../step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md`               | 利用導線前提            |

## 完了条件

- [ ] 権限状態と危険操作分類が定義されている
- [ ] 承認履歴と取り消し導線が定義されている
- [ ] Task03/05/08 への引継ぎ契約が整理されている
