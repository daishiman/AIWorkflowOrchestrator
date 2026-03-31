# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 4                                   |
| 機能名 | step-11-par-task-docs-sdk-spec-sync |
| 作成日 | 2026-03-31                          |

## 目的

docs-only タスクのため、コード向けユニットテストは追加しない。代わりに、更新後の仕様書を検証するための grep / validator コマンドをテストマトリックスとして定義し、Phase 5 実装後の受入証跡とする。

## 実行タスク

- SDK-02 / SDK-04 各更新ファイルの検証コマンドを定義する
- 旧 path パターンの grep 検証コマンドを定義する
- 未完了表現の grep 検証コマンドを定義する
- docs-only テストマトリックスを作成する

## テスト方針

docs-only タスクのため、以下の観点でテストマトリックスを定義する：

| テスト種別         | 実施方法                                                 | 目的                            |
| ------------------ | -------------------------------------------------------- | ------------------------------- | ------------ | ------------ | -------- | ---------------------------- | -------------------------- |
| 旧 path 検証       | `rg <stale-path-pattern>` で 0 件確認                    | path drift の残存を検知する     |
| 未完了表現検証     | `rg "更新予定                                            | 後でやる                        | 後続判断待ち | 仕様策定のみ | 実行予定 | 保留として記録"` で 0 件確認 | 未完了表現の残存を検知する |
| current owner 確認 | `rg "SkillCreatorWorkflowEngine"` で current 記述確認    | SDK-02 更新の目視確認           |
| リンク有効性確認   | 対象ファイルのリンク先が実在することを確認               | SDK-04 更新後のリンク健全性確認 |
| コード変更なし確認 | `git diff --name-only` で `.ts` 等が含まれないことを確認 | docs-only 制約の遵守確認        |

### skill validator matrix

| 検証対象                                   | コマンド                                                                                                                                                                                                                      | pass 条件                   | 実行タイミング    |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------- |
| `task-specification-creator` 構造          | `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator`                                                                                                                       | error 0                     | Phase 4 / Phase 9 |
| `task-specification-creator` 全体          | `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator`                                                                                                                         | error 0                     | Phase 4 / Phase 9 |
| `aiworkflow-requirements` 構造             | `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements`                                                                                                                          | error 0                     | Phase 4 / Phase 9 |
| `aiworkflow-requirements` 全体             | `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/aiworkflow-requirements`                                                                                                                            | error 0                     | Phase 4 / Phase 9 |
| workflow 構造                              | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-docs-sdk-spec-sync --json`                                             | error 0                     | Phase 4 / Phase 9 |
| workflow phase 出力                        | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-docs-sdk-spec-sync`                                                          | error 0                     | Phase 4 / Phase 9 |
| implementation guide                       | `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-docs-sdk-spec-sync`                               | Part 1 / Part 2 全項目 PASS | Phase 12 前提確認 |
| `task-specification-creator` mirror parity | `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                                                                                                | diff 0                      | Phase 4 / Phase 9 |
| `aiworkflow-requirements` mirror parity    | `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`                                                                                                                                      | diff 0                      | Phase 4 / Phase 9 |
| unassigned link integrity                  | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-docs-sdk-spec-sync/outputs/phase-12/unassigned-task-detection.md` | missing 0 / ALL_LINKS_EXIST | Phase 12 前提確認 |
| unassigned audit                           | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                                                                                                    | currentViolations=0         | Phase 12 前提確認 |

## 参照資料

| 資料名           | パス                                                                           | 説明               |
| ---------------- | ------------------------------------------------------------------------------ | ------------------ |
| Phase 2 設計     | `phase-2-design.md`                                                            | 更新対象と観点     |
| Phase 3 レビュー | `phase-3-design-review.md`                                                     | 確認済みの更新設計 |
| completed ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 検証の基準値       |

## 成果物

| 成果物       | パス                             | 説明                       |
| ------------ | -------------------------------- | -------------------------- |
| テスト計画書 | `phase-4-test-creation.md`       | テスト方針と観点の定義     |
| test matrix  | `outputs/phase-4/test-matrix.md` | 検証コマンドと期待値の一覧 |

## 完了条件

- [ ] SDK-02 / SDK-04 各更新ファイルの検証コマンドが定義されている
- [ ] 旧 path の grep 検証コマンドが定義されている
- [ ] 未完了表現の grep 検証コマンドが定義されている
- [ ] コード変更なし確認の手順が定義されている
- [ ] Phase 5 実装後にそのまま実行できるテストマトリックスが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. テスト観点ごとの検証コマンド定義
3. テストマトリックスの作成・配置
4. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 5 でそのまま再利用できるテストマトリックスが固定されている
