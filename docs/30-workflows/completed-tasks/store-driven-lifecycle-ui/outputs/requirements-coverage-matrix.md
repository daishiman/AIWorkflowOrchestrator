# requirements-coverage-matrix

## 目的

`/.claude/skills/aiworkflow-requirements/` から、TASK-10A-F（Store駆動ライフサイクルUI統合）に必要な仕様を漏れなく抽出できているかを確認する。

## 抽出戦略（Progressive Disclosure準拠）

1. `indexes/quick-reference.md` で技術キーワードを初期特定する
2. `indexes/resource-map.md` でカテゴリ別の正本仕様を特定する
3. 必要最小限の `references/*.md` を Phase ごとに紐付ける
4. 完了台帳と教訓の再利用が必要なものは `task-workflow.md` / `lessons-learned.md` まで追う

## 移管判定

| Workflow                   | パス                                                           | 必要な判断                                        |
| -------------------------- | -------------------------------------------------------------- | ------------------------------------------------- |
| unified completed workflow | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/` | 移管前 2workflow 監査結果を統合した正本として扱う |

## 必要仕様の網羅マトリクス

| 関心ごと             | 必須仕様（aiworkflow-requirements）                                                                                                          | 参照先Phase   | 充足判定 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------- |
| 抽出入口             | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                                                          | index,1,12    | OK       |
| リソース探索         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                                             | index,1,12    | OK       |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                 | 1,2,5,9,10,12 | OK       |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                                  | 1,2,8,10,12   | OK       |
| UI機能仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                              | 1,2,5,11,12   | OK       |
| UIアーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                                                    | 2,11,12       | OK       |
| UI原則               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                                                               | 3,6,10,11     | OK       |
| インターフェース契約 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                            | 1,2,3,10,12   | OK       |
| IPC API契約          | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                         | 1,2,3,10,12   | OK       |
| IPCセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                 | 1,3,9,10      | OK       |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                        | 1,2,5,6,9     | OK       |
| 品質基準             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                                  | 1,6,7,9,10    | OK       |
| タスク運用台帳       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                         | 10,12,13      | OK       |
| タスク運用ルール     | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                                                                   | 10,12,13      | OK       |
| 教訓同期             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                                       | 11,12         | OK       |
| 2workflow責務分離    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | index,12,13   | OK       |

## 抽出ギャップ判定

- 未参照の必須カテゴリ: 0
- 非実在参照パス: 0
- Phase と仕様参照の不整合: 0
- task-specification-creator 側の命名規約と衝突する参照: 0
- 移管前 2workflow / 移管後 completed 正本の役割衝突: 0

## 実参照検証

| 仕様カテゴリ                       | 実参照先                                                                                                                                                                                                                                                                                       | 検証結果 |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 抽出入口                           | `index.md`, `phase-12-documentation.md`, `outputs/requirements-coverage-matrix.md` に `quick-reference.md` / `resource-map.md` を記載                                                                                                                                                          | PASS     |
| interface / IPC / security / error | `phase-1-requirements.md`, `phase-2-design.md`, `phase-3-design-review.md`, `phase-4-test-creation.md`, `phase-5-implementation.md`, `phase-12-documentation.md` に `interfaces-agent-sdk-skill.md` / `api-ipc-agent.md` / `security-electron-ipc.md` / `error-handling.md` を記載             | PASS     |
| UI / architecture / quality        | `phase-2-design.md`, `phase-6-test-expansion.md`, `phase-7-coverage-check.md`, `phase-9-quality-assurance.md`, `phase-10-final-review.md`, `phase-11-manual-test.md`, `phase-12-documentation.md` に `arch-ui-components.md` / `ui-ux-design-principles.md` / `quality-requirements.md` を記載 | PASS     |
| task / lessons                     | `index.md`, `phase-10-final-review.md`, `phase-12-documentation.md`, `outputs/phase-12/*` に `task-workflow.md` / `task-workflow-rules.md` / `lessons-learned.md` を記載                                                                                                                       | PASS     |

## ブランチ差分への反映判定

- 移管前 workflow で実際に触れた UI検証・Phase 12再監査・未タスク正規化・SKILL整合化に対し、必要仕様の抽出漏れは確認されなかった
- Step 2 判定で確認した `interfaces-agent-sdk-skill.md` / `api-ipc-agent.md` / `security-electron-ipc.md` / `error-handling.md` は、今回の変更が内部再監査・台帳同期に留まるため更新不要と判断した

## 結論

本ワークフロー仕様書は、今回の実装で必要な `aiworkflow-requirements` の情報を、抽出入口から Phase 配置、実参照検証、移管前 2workflow 監査、そして移管後の completed 正本まで追跡可能な形で参照している。
