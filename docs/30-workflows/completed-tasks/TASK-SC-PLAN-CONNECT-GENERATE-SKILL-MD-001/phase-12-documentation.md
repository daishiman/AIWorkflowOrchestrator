# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 12                                           |
| タスクID   | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001   |
| 機能名     | runCreateWorkflow-to-generateSkillMd-connect |
| 前提Phase  | Phase 11                                     |
| 後続Phase  | Phase 13（blocked / 承認待ち）               |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

実装に伴うドキュメントを更新する。
`runCreateWorkflow` 戻り値の `generateSkillMd` への接続実装を、実装ガイド、仕様同期、更新履歴、未タスク検出、skill フィードバック、最終準拠チェックへ同一 wave で同期する。

**Phase 12 自体は文書更新工程だが、この task 全体はコード変更を含む実装 task である。**
そのため `docs-only workflow` と断定せず、Step 1-B の状態は実装の current facts に従って記録する。
`spec_created` は「Phase 1-3 完了で実装未着手」の場合にのみ使い、この task では安易に使用しない。

## 事前チェック【必須】

- `outputs/phase-12/*.md` と本ファイルに future wording（`計画` / `予定` / `PR マージ後` / `仕様策定のみ` など）を残さない
- root `artifacts.json` と `outputs/artifacts.json` の title / type / status / phase artifact 名 parity を初手で確認する
- Phase 12 の canonical 成果物 6 件に加え、Wave C 引き継ぎサマリー 1 件を `outputs/phase-12/` 配下へ揃える
- Step 1-A〜1-G / Step 2 の結果を `system-spec-update-summary.md` と `phase12-task-spec-compliance-check.md` に残す

## 実行タスク

### タスク12-1: implementation-guide.md 作成【必須・2パート構成】

`outputs/phase-12/implementation-guide.md` を作成し、以下の 2 パート構成を必須とする。

| パート | 対象読者             | 必須内容                                                                        |
| ------ | -------------------- | ------------------------------------------------------------------------------- |
| Part 1 | 初学者・中学生レベル | 日常の例え話、専門用語なし、`なぜ必要か` を先に説明してから `何をするか` を書く |
| Part 2 | 開発者・技術者       | TypeScript 型定義、API シグネチャ、使用例、エラー、エッジケース、設定項目       |

Part 1 要件:

- `たとえば` を含む日常生活の例え話を必ず書く
- 専門用語を使う場合は直後に説明する
- 理由先行で説明する
- 作成後に `references/phase12-checklist-definition.md` と `validate-phase12-implementation-guide.js` で内容要件を確認する

Part 2 要件:

- `current contract` と今回 wave の `target delta` を分けて書く
- API シグネチャだけで終わらせず、型定義、使用例、エラーハンドリング、エッジケース、設定可能パラメータ/定数一覧を揃える
- VISUAL task では Phase 11 の screenshot references と capture metadata を明記する

### タスク12-2: system spec update summary【必須・Step 1-A〜1-G / Step 2】

`outputs/phase-12/system-spec-update-summary.md` を作成し、Phase 12 の仕様同期 root summary として Step 1-A〜1-G / Step 2 の実施結果と判断根拠を記録する。

| Step     | 必須 | 内容                                                                                                      |
| -------- | ---- | --------------------------------------------------------------------------------------------------------- |
| Step 1-A | ✅   | 完了タスク記録、関連ドキュメントリンク、変更履歴、`LOGS.md` x2、`SKILL.md` history x2、必要なら topic-map |
| Step 1-B | ✅   | 実装状況テーブル更新。実装完了 task は `completed`、実装未着手 task のみ `spec_created`                   |
| Step 1-C | ✅   | 関連タスク / 未タスク候補 / 残課題テーブル更新                                                            |
| Step 1-D | ✅   | `generate-index.js` 実行による topic-map / index 再生成                                                   |
| Step 1-E | ✅   | 未タスク登録。0 件でも detection report を残す                                                            |
| Step 1-F | 条件 | lessons learned、cross-skill spec、workflow summary など補助更新                                          |
| Step 1-G | ✅   | `quick_validate.js`、`validate_all.js`、`verify-all-specs.js`、`validate-phase-output.js`、`diff -qr`     |
| Step 2   | 条件 | interface / API / architecture / security / UI spec の実体更新。不要時も no-op 理由を記録する             |

- `task-workflow.md` / `task-workflow-completed.md` / `lane/index.md` / `artifacts.json` / `outputs/artifacts.json` の same-wave parity を確認して残す

本 task での Step 2 判定:

- `runCreateWorkflow` から `generateSkillMd` への接続で current contract が変わる場合は system spec を更新する
- 変更なし判定にする場合も、その根拠を `system-spec-update-summary.md` と `documentation-changelog.md` の両方へ残す

### タスク12-3: documentation-changelog.md 作成【必須】

`outputs/phase-12/documentation-changelog.md` を作成し、以下を記録する。

- 更新した file 一覧
- validator 実行結果
- current / baseline の区別
- `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の同期結果
- `system-spec-update-summary.md` に記録した Step 1-A〜1-G / Step 2 の要約
- system spec 更新なしの場合の no-op 理由

### タスク12-4: unassigned-task-detection.md 作成【0件でも必須】

`outputs/phase-12/unassigned-task-detection.md` を作成し、未タスク検出結果を残す。

- 0 件でも summary を必ず記録する
- 1 件以上ある場合は formalize path を残す
- current と baseline を混同せずに記録する

### タスク12-5: skill-feedback-report.md 作成【改善なしでも必須】

`outputs/phase-12/skill-feedback-report.md` を作成し、Phase 12 実行で得た skill 改善知見を残す。

- 改善点があれば next action を書く
- 改善点がなければ `なし` と判断理由を書く

### タスク12-6: phase12-task-spec-compliance-check.md 作成【必須・最終 root evidence】

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 の判定を 1 ファイルへ集約する。

必須確認項目:

- 6 つの task outputs と Wave C 引き継ぎサマリーの存在確認
- Task 12-1〜12-5 の実質監査
- Step 1-A〜1-G の実更新確認
- Step 2 の current fact / no-op / domain sync 判定
- root `artifacts.json` と `outputs/artifacts.json` の parity
- 計画系文言 0 件

判定ルール:

- 未充足が 1 つでもある場合は `PASS` を書かず、`FAIL` または `BLOCKED` とする
- `system-spec-update-summary.md` を参照し、Step 1-A〜1-G / Step 2 の根拠と矛盾しないことを確認する

## Task / Step 対応表

| 項目       | 主成果物                                                 | 役割                                                           |
| ---------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| Task 12-1  | `outputs/phase-12/implementation-guide.md`               | 2 パート構成の実装ガイド正本                                   |
| Task 12-2  | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-G / Step 2 の実施結果と system spec 更新判断の正本 |
| Task 12-3  | `outputs/phase-12/documentation-changelog.md`            | 文書更新履歴と validator / parity / no-op 判断の記録           |
| Task 12-4  | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出結果の記録                                         |
| Task 12-5  | `outputs/phase-12/skill-feedback-report.md`              | skill 改善知見の記録                                           |
| Task 12-6  | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 の最終 root evidence |
| 補助成果物 | `outputs/phase-12/handover-summary-wave-c.md`            | Wave C 引き継ぎサマリー（Phase 12 の受け渡しメモ）             |

## Phase 12 記録分離方針

- `phase-12-documentation.md` は Phase 12 の実行方針と完了条件を持つ summary とする
- `outputs/phase-12/*.md` は current facts を持つ canonical 成果物とする
- Phase 12 は文書更新工程だが、この task 全体を `docs-only workflow` と再分類しない
- `spec_created` は実装未着手 task に限定し、本 task の current facts と矛盾する状態遷移を書かない

## 参照資料

| 資料名                                                 | パス                                                                                   | 用途                                                            |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Phase 11 成果物                                        | `outputs/phase-11/manual-test-result.md`                                               | 手動テスト / NON_VISUAL 根拠確認                                |
| 対象実装ファイル                                       | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                          | current contract 確認                                           |
| Phase 12 詳細ガイド                                    | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | 6 成果物・Task 12-6・Wave C 引き継ぎサマリー・NON_VISUAL 再判定 |
| Phase 12 タスクガイド                                  | `.claude/skills/task-specification-creator/references/phase-12-tasks-guide.md`         | Task 12-1〜12-6 の正本                                          |
| Step 1 完了ガイド                                      | `.claude/skills/task-specification-creator/references/spec-update-step1-completion.md` | Step 1-A〜1-G の定義                                            |
| Phase 12 sync パターン                                 | `.claude/skills/task-specification-creator/references/patterns-phase12-sync.md`        | 計画系文言・parity 方針                                         |
| 要件抽出マップ（現状調査・AC・スコープ）               | `outputs/phase-1/spec-extraction-map.md`                                               | Phase 1 成果物                                                  |
| 接続設計・メソッド設計・エラー処理設計・テスト設計概要 | `outputs/phase-2/design-doc.md`                                                        | Phase 2 成果物                                                  |
| 変更内容・判断理由の記録                               | `outputs/phase-5/implementation-notes.md`                                              | Phase 5 成果物                                                  |
| Phase8リファクタリングノート                           | `outputs/phase-8/refactoring-notes.md`                                                 | Phase 8 成果物                                                  |
| 品質保証レポート（静的解析・テスト・セキュリティ確認） | `outputs/phase-9/quality-check-result.md`                                              | Phase 9 成果物                                                  |
| 最終レビュー結果（PASS/MINOR/MAJOR 判定・AC 充足確認） | `outputs/phase-10/final-review-result.md`                                              | Phase 10 成果物                                                 |
| 手動テストチェックリスト                               | `outputs/phase-11/manual-test-checklist.md`                                            | Phase 11 成果物                                                 |
| 発見事項                                               | `outputs/phase-11/discovered-issues.md`                                                | Phase 11 成果物                                                 |

- 依存 Phase 参照: Phase 2 / Phase 5 / Phase 6 / Phase 7 / Phase 8 / Phase 9 / Phase 11 の成果物を前提にする

## 統合テスト連携【必須】

| 判定項目                                | 基準     | 結果 |
| --------------------------------------- | -------- | ---- |
| implementation-guide 2 パート構成完了   | 確認済み | -    |
| Step 1-A〜1-G / Step 2 記録完了         | 確認済み | -    |
| documentation-changelog 更新完了        | 確認済み | -    |
| unassigned / feedback 0件含め出力完了   | 確認済み | -    |
| artifacts parity 確認                   | 確認済み | -    |
| 計画系文言 残存なし                     | 確認済み | -    |
| compliance-check root evidence 作成完了 | 確認済み | -    |

## 多角的チェック観点

| 観点     | 確認内容                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 矛盾     | `implementation-guide.md` / `documentation-changelog.md` / `system-spec-update-summary.md` が同じ current facts を示すか                    |
| 漏れ     | 6 つの task outputs と Wave C 引き継ぎサマリーがすべて生成され、`phase12-task-spec-compliance-check.md` が Task 12-1〜12-5 を監査しているか |
| 整合性   | Step 1-A〜1-G / Step 2 の記録が本文、成果物、完了条件で一致しているか                                                                       |
| 依存関係 | root `artifacts.json` / `outputs/artifacts.json` / Phase 11 evidence / task status の参照が整合するか                                       |

## 成果物

| 成果物                       | パス                                                     | 説明                                                                   |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 の 2 パート構成                                        |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-G / Step 2 の結果と system spec 更新判断の正本             |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 更新履歴、validator、parity、no-op 理由                                |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 0 件を含む検出結果                                                     |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善知見または改善なし理由                                             |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 を集約する最終 root evidence |

## 完了条件

- [ ] `implementation-guide.md` が Part 1 / Part 2 の必須要件を満たしている
- [ ] `system-spec-update-summary.md` に Step 1-A〜1-G / Step 2 の結果と判断根拠が記録されている
- [ ] `documentation-changelog.md` が current / baseline と parity 結果を記録している
- [ ] `unassigned-task-detection.md` が 0 件含めて作成済みである
- [ ] `skill-feedback-report.md` が改善なしの場合も含めて作成済みである
- [ ] `phase12-task-spec-compliance-check.md` が 6 つの task outputs と Wave C 引き継ぎサマリー、Task 12-1〜12-5、Step 1-A〜1-G / Step 2 を監査している
- [ ] root `artifacts.json` と `outputs/artifacts.json` の parity を確認済みである
- [ ] future wording（`計画` / `予定` / `PR マージ後` / `仕様策定のみ` など）が成果物と本ファイルに残っていない
- [ ] 本 Phase 内の全タスクを 100% 実行完了している

## サブタスク管理

1. 事前チェック: artifacts parity と Phase 12 canonical 6 成果物 + Wave C 引き継ぎサマリーの確認
2. タスク12-1: `implementation-guide.md` 作成
3. タスク12-2: `system-spec-update-summary.md` 作成と Step 1-A〜1-G / Step 2 実施
4. タスク12-3: `documentation-changelog.md` 作成
5. タスク12-4: `unassigned-task-detection.md` 作成
6. タスク12-5: `skill-feedback-report.md` 作成
7. タスク12-6: `phase12-task-spec-compliance-check.md` 作成

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載の 7 ファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] `system-spec-update-summary.md` と `phase12-task-spec-compliance-check.md` に最終根拠を残した

## 次のPhase

Phase 13: PR 作成（blocked / 承認待ち）
