---
phase: 1
task_id: TASK-SC-CANCEL-LOGS-SYNC-001
artifact: scope-boundary
created_date: 2026-04-20
status: completed
---

# Phase 1 成果物: scope 境界定義

## scope マトリクス

| #   | 項目                                                                                       | IN/OUT | 理由                                           |
| --- | ------------------------------------------------------------------------------------------ | ------ | ---------------------------------------------- |
| 1   | `.claude/skills/task-specification-creator/LOGS.md` 追記                                   | IN     | AC-1 対応、repo-wide sync の主要対象           |
| 2   | `.claude/skills/aiworkflow-requirements/LOGS.md` 追記                                      | IN     | AC-2 対応、repo-wide sync の主要対象           |
| 3   | `aiworkflow-requirements/references/task-workflow*.md` 追記                                | IN     | AC-3 対応、canonical spec 整合                 |
| 4   | `aiworkflow-requirements/references/lessons-learned-current-2026-04.md` 3 知見追記         | IN     | AC-4 対応、NON_VISUAL/scope/repo-wide の学習化 |
| 5   | 親タスク `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` Phase 12 宣言 | IN     | AC-5 対応、close-out 整合                      |
| 6   | 本タスク自身の close-out（両 LOGS への自己記録）                                           | IN     | Phase 12 self-close-out 原則                   |
| 7   | コードベース変更（apps/desktop, apps/web, packages/\*）                                    | OUT    | NON_VISUAL タスクのため                        |
| 8   | Issue #2229 再実装                                                                         | OUT    | 親タスクと別系統、Phase 12 の scope を超える   |
| 9   | 親タスク Phase 13 PR 作成                                                                  | OUT    | 親タスクの責務、user 承認待ち blocked          |
| 10  | `topic-map.md` / `keywords.json` 再生成                                                    | OUT    | 最小変更原則、既存エントリに影響なし           |
| 11  | 既存 LOGS エントリの遡及修正                                                               | OUT    | 最小変更原則、追記のみ                         |
| 12  | `canonical spec` の再生成・構造変更                                                        | OUT    | 最小変更原則                                   |

## scope 境界判断フロー

```
変更要求
  ├─ 5 ファイル追記？ → IN
  ├─ 親 index.md 完了宣言？ → IN
  ├─ 本タスク自身の close-out？ → IN
  ├─ コード変更を伴う？ → OUT（scope 違反）
  ├─ 既存エントリ修正？ → OUT（最小変更原則違反）
  ├─ PR 作成？ → OUT（Phase 13 責務）
  └─ 上記以外の新規対象？ → Phase 1 へ戻り要件確認
```

## scope 違反検知基準

| 違反種別             | 検知方法                                                 | 対応                        |
| -------------------- | -------------------------------------------------------- | --------------------------- |
| コード変更混入       | `git diff --name-only` で `apps/` `packages/` が含まれる | Phase 1 戻し、CRITICAL FAIL |
| 既存エントリ遡及修正 | 各ファイルの追記前後 diff で上部行の変更検出             | Phase 8 戻し、MAJOR FAIL    |
| Phase 13 PR 作成     | `gh pr create` の実行履歴                                | 即停止、ユーザーへ確認      |

## 本タスクと親タスクの責務分離

| 項目     | 親タスク               | 本タスク                          |
| -------- | ---------------------- | --------------------------------- |
| 対象     | branch 内ドキュメント  | repo-wide ドキュメント            |
| 完了宣言 | 親 index.md Phase 1-12 | 本 index.md Phase 1-12            |
| PR 作成  | Phase 13（blocked）    | なし                              |
| scope    | 親タスク単独の完了記録 | 親 close-out の他ファイルへの波及 |

## 参照資料

- [../../phase-1-requirements.md](../../phase-1-requirements.md)
- [requirements-definition.md](requirements-definition.md)
