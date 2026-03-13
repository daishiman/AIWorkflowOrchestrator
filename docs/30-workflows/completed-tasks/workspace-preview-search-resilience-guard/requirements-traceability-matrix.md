# Requirements Traceability Matrix

## メタ情報

| 項目     | 値                                                          |
| -------- | ----------------------------------------------------------- |
| タスクID | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001        |
| 作成日   | 2026-03-13                                                  |
| 目的     | 元未タスク / Issue 要求と current workflow 反映先を追跡する |

## トレーサビリティ表

| 要件ID | 元要求                                                                  | 反映先                                                                                                                                      | 補足                                         |
| ------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| RQ-01  | fuzzy no-match を共通ガード化する                                       | `phase-1-requirements.md`, `outputs/phase-1/requirements-definition.md`, `outputs/phase-1/spec-reference-map.md`                            | search resilience concern                    |
| RQ-02  | stable sort と top 10 制御を再利用可能にする                            | `outputs/phase-1/requirements-definition.md`, `outputs/phase-1/acceptance-criteria.md`, `phase-4-test-creation.md`                          | QuickFileSearch の pure rule 化              |
| RQ-03  | `Cmd/Ctrl+P`、Arrow/Enter/Escape、focus trap を drift させない          | `phase-1-requirements.md`, `phase-2-design.md`, `phase-11-manual-test.md`, `outputs/phase-1/spec-reference-map.md`                          | `ui-ux-navigation.md` を補強反映             |
| RQ-04  | preview 読み込みの timeout / retry / loading release を標準化する       | `outputs/phase-1/requirements-definition.md`, `phase-2-design.md`, `outputs/phase-2/resilience-guard-design.md`                             | preview resilience concern                   |
| RQ-05  | parse / transport / crash / no-match を別 taxonomy にする               | `outputs/phase-1/requirements-definition.md`, `outputs/phase-2/resilience-guard-design.md`, `phase-9-quality-assurance.md`                  | recoverable / fatal 分離                     |
| RQ-06  | 新規 IPC を増やさず `file:read` を再利用する                            | `outputs/phase-1/requirements-definition.md`, `phase-1-requirements.md`, `phase-2-design.md`                                                | NFR-1                                        |
| RQ-07  | local state ownership を崩さない                                        | `outputs/phase-1/requirements-definition.md`, `phase-1-requirements.md`, `phase-2-design.md`                                                | NFR-2                                        |
| RQ-08  | Phase 12 exact count / ID / path sync を future validation に含める     | `outputs/phase-1/requirements-definition.md`, `phase-12-documentation.md`, `aiworkflow-requirements-extraction-matrix.md`                   | docs sync concern                            |
| RQ-09  | Phase 1-3 の設計ができるまで次へ進まない                                | `index.md`, `artifacts.json`, `phase-1-requirements.md`, `phase-2-design.md`, `phase-3-design-review.md`                                    | design-first gate                            |
| RQ-10  | concern ごとに SubAgent を分離し、並列可能箇所だけ並列化する            | `index.md`, `outputs/phase-2/subagent-lane-plan.md`, `task-specification-creator-compliance-matrix.md`                                      | 実 SubAgent 実行は行わない                   |
| RQ-11  | `.claude` 正本仕様を使い、抽出証跡を残す                                | `phase-1-requirements.md`, `outputs/phase-1/spec-reference-map.md`, `aiworkflow-requirements-extraction-matrix.md`                          | progressive disclosure と split query を明記 |
| RQ-12  | commit、PR は行わない                                                   | `index.md`, `outputs/phase-1/requirements-definition.md`, `phase-13-pr-creation.md`, `task-specification-creator-compliance-matrix.md`      | 実装完了後も維持                             |
| RQ-13  | preview 共通ガードで既存 sanitize / dangerous URL / CSP 契約を壊さない  | `outputs/phase-1/requirements-definition.md`, `phase-1-requirements.md`, `phase-2-design.md`, `phase-11-manual-test.md`                     | `security-input-validation.md` を追加反映    |
| RQ-14  | UI語彙と QuickFileSearch dialog の視覚方向性を 04C catalog と一致させる | `outputs/phase-1/requirements-definition.md`, `phase-1-requirements.md`, `phase-11-manual-test.md`, `outputs/phase-1/spec-reference-map.md` | `ui-ux-components.md` を追加反映             |

## 判定

- 元要求の主要 12 項目は current workflow と root 監査台帳へ追跡可能。
- 今回の補強で、system spec 抽出過程そのものも要件トレーサビリティへ含めた。
