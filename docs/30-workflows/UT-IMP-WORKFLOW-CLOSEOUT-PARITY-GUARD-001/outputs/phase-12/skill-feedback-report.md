# Phase 12 スキルフィードバックレポート: UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001

## lessons-learned ID

**採番ID**: `L-CLOSEOUT-PARITY-001`

登録先: `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`

---

## task-specification-creator への改善提案

### FB-PARITY-001: Phase 12 完了処理における parity gate の明示化

| 項目     | 内容                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 種別     | ワークフロー品質 / 必須ゲート                                                                                                  |
| 優先度   | P0（Phase 12 close-out の信頼性に直結）                                                                                        |
| 発見元   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001 Phase 12 再監査                                                            |
| 事象     | outputs/artifacts.json が "completed" を主張していても root 側が "pending" のまま残り SSOT 崩壊が発生した                      |
| 改善内容 | Phase 12 の完了条件に `validate-closeout-parity.js --json` を実行して `code: "PARITY_OK"` を得ることを必須ゲートとして追記する |
| 反映先   | `references/phase-12-completion-checklist.md` / `references/spec-update-workflow.md`                                           |
| 反映状況 | 本タスクで実装済み（patterns-phase12-sync.md パターン10 更新済み）                                                             |

### FB-PARITY-002: complete-phase.js の書き込み責務の一元化

| 項目     | 内容                                                                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 種別     | スクリプト設計 / 責務境界                                                                                                                             |
| 優先度   | P1                                                                                                                                                    |
| 事象     | Phase 完了処理時に S1（index.md）・S2（root artifacts.json）・S3（outputs/artifacts.json）・S4（phase-N-\*.md frontmatter）の更新が手動で分散していた |
| 改善内容 | `complete-phase.js` が唯一の書き手として S1〜S4 を同時更新し、partial failure 時は rollback する設計を確立した                                        |
| 反映先   | `implementation-guide.md` の責務境界マトリクス / `SKILL.md` v10.09.57                                                                                 |
| 反映状況 | 本タスクで実装済み                                                                                                                                    |

---

## aiworkflow-requirements への改善提案

### FB-PARITY-003: error-handling-core.md への parity guard エラーコード追加

| 項目     | 内容                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------- |
| 種別     | 仕様書整備 / エラー分類                                                                                                 |
| 優先度   | P1                                                                                                                      |
| 事象     | PARITY_DRIFT / MISSING_SOURCE / INVALID_STATUS_VALUE というワークフロー固有のエラーコードが仕様書に記載されていなかった |
| 改善内容 | `error-handling-core.md` に parity guard 専用のエラー分類テーブル（4 code × exit code × 対処方法）を追加した            |
| 反映状況 | 本タスクで更新済み                                                                                                      |

### FB-PARITY-004: quality-requirements.md への Phase 12 必須品質ゲート追加

| 項目     | 内容                                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 種別     | 品質要件 / プロセス標準化                                                                                                                |
| 優先度   | P1                                                                                                                                       |
| 事象     | Phase 12 close-out の品質基準が `quality-requirements.md` に明文化されていなかった                                                       |
| 改善内容 | `quality-requirements.md` に「Phase 12 close-out 必須品質ゲート」セクションを追加し、parity gate / verify-all-specs の合格条件を記載した |
| 反映状況 | 本タスクで更新済み                                                                                                                       |

---

## 改善提案なし（「なし」と理由を記載）

### Phase 12 成果物の命名規約

改善提案: なし

理由: 現行の 6 成果物命名規約（implementation-guide / system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback-report / phase12-task-spec-compliance-check）は patterns-phase12-sync.md パターン11 に記載されており、今回の NON_VISUAL タスクでも問題なく適用できた。変更の必要はない。

### bypass フラグの導入

改善提案: なし（意図的に導入しない）

理由: `--skip-parity` や `--bypass` フラグを導入すると「後で直す」が常態化し、SSOT 崩壊の再発リスクが高まる。bypass フラグなしで運用することが本タスクの設計意図であり、将来的にも維持する。

---

## フィードバック反映状況サマリー

| FB ID                 | 反映先                                                          | 状況     |
| --------------------- | --------------------------------------------------------------- | -------- |
| FB-PARITY-001         | patterns-phase12-sync.md パターン10 / SKILL.md                  | 反映済み |
| FB-PARITY-002         | implementation-guide.md 責務境界マトリクス / SKILL.md v10.09.57 | 反映済み |
| FB-PARITY-003         | error-handling-core.md                                          | 反映済み |
| FB-PARITY-004         | quality-requirements.md                                         | 反映済み |
| L-CLOSEOUT-PARITY-001 | lessons-learned-current-2026-04.md                              | 反映済み |
