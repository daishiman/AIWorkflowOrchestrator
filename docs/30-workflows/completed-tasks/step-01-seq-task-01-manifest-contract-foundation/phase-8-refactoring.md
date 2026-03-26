# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-SDK-01                                 |
| Phase      | 8                                           |
| Phase名    | リファクタリング                            |
| ステータス | spec_created                                |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7 |
| 後続Phase  | Phase 9                                     |
| 作成日     | 2026-03-26                                  |

## 目的

manifest schema と loader の語彙を痩せさせ、Task02 以降に解釈負債を持ち込まない命名へ寄せる。

## 実行タスク

- schema slimming: 初回スコープ外 field を削る
- naming audit: `phase / resource / entry / exit` 周辺語彙を統一する
- duplication check: sample manifest、schema、docs の重複説明を整理する
- downstream wording check: Task02、Task03、Task04 へ渡す語彙を一貫させる

## 参照資料

| 資料名                    | パス                                           | 説明                 |
| ------------------------- | ---------------------------------------------- | -------------------- |
| Phase 1                   | `phase-1-requirements.md`                      | 初回スコープ         |
| Phase 2                   | `phase-2-design.md`                            | schema / loader 用語 |
| Phase 5                   | `phase-5-implementation.md`                    | 実装対象             |
| Phase 6                   | `phase-6-test-expansion.md`                    | edge case            |
| Phase 7                   | `phase-7-coverage-check.md`                    | uncovered item       |
| requirements-traceability | `outputs/phase-7/requirements-traceability.md` | AC 維持確認          |

### システム仕様（aiworkflow-requirements）

| 参照資料                                                 | パス                                                                                                            | 内容       |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------- |
| architecture-overview-core                               | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`                               | SRP 基準   |
| task-workflow                                            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                            | 用語同期先 |
| lessons-learned-auth-ipc-skill-creator-sync-auth-timeout | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | drift 防止 |

## 実行手順

1. uncovered item を読み、Phase 8 で閉じる項目だけを抽出する。
2. manifest schema と sample manifest の field 名を照合し、同義語が複数ある箇所を一つに寄せる。
3. documentation と sample manifest の重複説明を削り、source of truth を一つに決める。
4. Task02、Task03、Task04 へ渡す語彙が handoff 文書と一致しているかを確認する。

## 統合テスト連携

- Phase 9 は naming audit と duplication check の結果を品質観点に取り込む。
- Phase 10 は refactor 後も AC-1 から AC-4 が変わらないことを確認する。
- Phase 12 は最終語彙を system spec へ同期する。

## 成果物

| 成果物               | パス                                      | 説明           |
| -------------------- | ----------------------------------------- | -------------- |
| schema-slimming-plan | `outputs/phase-8/schema-slimming-plan.md` | 削除対象 field |
| naming-audit         | `outputs/phase-8/naming-audit.md`         | 用語監査       |
| duplication-check    | `outputs/phase-8/duplication-check.md`    | 重複記述監査   |

## 完了条件

- [ ] schema slimming の対象と残す field が記録されている
- [ ] naming audit で同義語の統一結果が記録されている
- [ ] duplication check に source of truth が記録されている
- [ ] Task02、Task03、Task04 へ渡す語彙が handoff 文書と一致している
- [ ] **本Phase内の全タスクを100%実行完了**
