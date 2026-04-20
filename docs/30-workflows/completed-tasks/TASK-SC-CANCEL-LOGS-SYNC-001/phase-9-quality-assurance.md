---
phase: 9
task_id: TASK-SC-CANCEL-LOGS-SYNC-001
status: pending
created_date: 2026-04-20
---

# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| Phase      | 9                                    |
| タスクID   | TASK-SC-CANCEL-LOGS-SYNC-001         |
| タスク種別 | NON_VISUAL（ドキュメント追記タスク） |
| 前Phase    | phase-8-refactoring.md               |
| 次Phase    | phase-10-final-review.md             |
| 作成日     | 2026-04-20                           |

---

## 目的

本タスクは **コード変更を含まない docs-sync wave** であるため、
従来の品質ゲート（typecheck / vitest / IPC契約ドリフト検証 / セキュリティスキャン）は対象外。
代わりに **Markdown 品質**（構文 / lint）/ **日付検証** / **既存ルール準拠**（順序・命名）を
3 系統で品質保証する。

Phase 5〜8 で追記・整理されたドキュメントが、リポジトリの既存ルールに従い、
Markdown として壊れていないことを最終的に保証することが本 Phase のゴール。

---

## 実行タスク

| Task | 内容                                                       | 主成果物                                 |
| ---- | ---------------------------------------------------------- | ---------------------------------------- |
| 1    | grep、lint、日付、artifact parity を一括点検する           | `outputs/phase-9/quality-gate-report.md` |
| 2    | blocker / warning / info を分類し次 phase の判断材料にする | `outputs/phase-9/quality-gate-report.md` |
| 3    | Phase 10 へ渡す最終確認観点を確定する                      | `outputs/phase-9/quality-gate-report.md` |

- Task 1: grep、lint、日付、artifact parity を点検する
- Task 2: blocker / warning / info を分類する
- Task 3: Phase 10 へ渡す最終確認観点を確定する

---

## 品質ゲート観点

| 観点              | 基準                                                      |
| ----------------- | --------------------------------------------------------- |
| Markdown 構文     | lint エラー 0、テーブル列数整合、コードブロック閉じ確認   |
| 日付正確性        | 全追記の日付が `2026-04-20` で統一されている              |
| 順序ルール        | 各ファイルの追記順（昇順 / 降順 / 末尾追記）が既存と一致  |
| 既存ルール準拠    | spec-update-workflow / artifact-naming-conventions に整合 |
| grep 検証コマンド | TC-01〜TC-05 の grep が全件 PASS                          |

> **NOTE**: code 系品質ゲート（typecheck / vitest / IPC契約 / セキュリティ）は
> 本タスクでは **対象外**。code 変更が一切ないため、検査対象が存在しない。

---

## チェック項目【必須】

### 1. Markdown 構文検証

```bash
# Markdown lint（プロジェクトに導入されている lint ツールを使用）
# 例: markdownlint-cli2 等。プロジェクト標準に従う
npx markdownlint-cli2 \
  ".claude/skills/task-specification-creator/LOGS.md" \
  ".claude/skills/aiworkflow-requirements/LOGS.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow*.md" \
  ".claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04*.md" \
  "docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md"
```

| 確認項目                                           | 期待結果               |
| -------------------------------------------------- | ---------------------- |
| テーブル列数の整合（追記行が既存ヘッダ列数と一致） | エラー 0               |
| コードブロック開閉（` ``` ` の対応）               | エラー 0               |
| h2 / h3 の階層飛ばし（h2 → h4 等）がない           | エラー 0               |
| Markdown リンク `[text](path)` のリンク切れがない  | エラー 0               |
| 末尾改行・行末空白の統一                           | プロジェクト標準に従う |

> lint ツールが未導入なら、Read による目視確認 + 上記チェックリストを記録する。

### 2. 日付検証

```bash
# 追記分の日付フォーマットを一括検証
grep -rn "2026[-/]04[-/]20\|April.*20.*2026" \
  .claude/skills/task-specification-creator/LOGS.md \
  .claude/skills/aiworkflow-requirements/LOGS.md \
  .claude/skills/aiworkflow-requirements/references/task-workflow*.md \
  .claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04*.md \
  docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md
```

| 確認項目                                                         | 期待結果                                  |
| ---------------------------------------------------------------- | ----------------------------------------- |
| 追記分すべての日付が `2026-04-20` 形式                           | `2026/04/20` / `April 20, 2026` 等が 0 件 |
| 親タスク完了日として `2026-04-20`（本タスク Phase 5 完了予定日） | 全箇所で一致                              |
| 相対日付表記（「昨日」「先日」）の混入がない                     | 0 件                                      |

### 3. 順序ルール検証

各ファイルの追記順が既存ルール（昇順 / 降順 / 末尾追記）に従っているかを確認する。

| ファイル                                                  | 順序ルール                                                                     | 検証方法                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `task-specification-creator/LOGS.md`                      | Phase 4 で確定（既存最新エントリの位置から推定）。多くは末尾追記または冒頭追記 | 直前エントリと追記エントリの日付関係を確認            |
| `aiworkflow-requirements/LOGS.md`                         | 表の末尾行に追記（時系列昇順を想定）                                           | 最終行の日付と追記日付の前後関係を確認                |
| `task-workflow-active.md` / `task-workflow-completed*.md` | active から completed への移動 / completed への末尾追記                        | active 側にエントリが残っていないか確認               |
| `lessons-learned-current-2026-04.md`                      | 既存末尾エントリの直後に新規エントリ追加                                       | 直前エントリの位置と追記位置を確認                    |
| 親 `index.md`                                             | フロントマターは直接更新 / Phase 一覧テーブルは Phase 12 行のみ更新            | フロントマター diff と Phase 一覧 diff を Read で目視 |

### 4. 既存ルール準拠検証

| ルール                                                         | 確認内容                                                                           |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `spec-update-workflow.md`（aiworkflow-requirements）           | LOGS / canonical spec 更新の標準フローに従っているか                               |
| `artifact-naming-conventions.md`（task-specification-creator） | `outputs/phase-N/` 配下の命名が canonical 名と一致するか                           |
| 最小変更原則                                                   | `topic-map.md` / `keywords.json` を不要再生成していないか                          |
| scope 境界（Phase 1 で確定）                                   | scope 外項目（コード変更 / Issue #2229 再実装 / 親 Phase 13 PR）が混入していないか |

### 5. grep 検証コマンド最終実行

Phase 11 で取得予定の TC-01〜TC-05 grep を **Phase 9 時点で先行実行**し、
すべてヒットすることを確認する（Phase 11 はスナップショット記録に専念できる）。

| TC-ID | コマンド                                                                                                                   | 期待結果       | Phase 9 結果 |
| ----- | -------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------ |
| TC-01 | `grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/task-specification-creator/LOGS.md`                       | 1 件以上ヒット | PASS / FAIL  |
| TC-02 | `grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/LOGS.md`                          | 1 件以上ヒット | PASS / FAIL  |
| TC-03 | `grep -rn "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/references/`                     | 1 件以上ヒット | PASS / FAIL  |
| TC-04 | `grep -rn "NON_VISUAL\|scope.*境界\|repo-wide sync" .claude/skills/aiworkflow-requirements/references/lessons-learned*.md` | 3 件以上ヒット | PASS / FAIL  |
| TC-05 | `grep -n "Phase 12.*completed\|status.*completed" docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`       | 該当行が存在   | PASS / FAIL  |

---

## 品質ゲート判定

| 判定              | 条件                                                          | 次のアクション             |
| ----------------- | ------------------------------------------------------------- | -------------------------- |
| QUALITY GATE PASS | 5 系統すべて PASS                                             | Phase 10 へ進行            |
| MINOR FAIL        | Markdown lint の軽微な指摘 / 日付の typo 1〜2 箇所            | 修正後 Phase 10 へ         |
| MAJOR FAIL        | 順序ルール違反 / 既存ルール準拠失敗 / TC grep いずれかが FAIL | Phase 5 / Phase 6 へ戻し   |
| CRITICAL FAIL     | scope 境界違反（コード変更が混入）/ 既存エントリ遡及修正      | Phase 1 へ戻しユーザー確認 |

---

## 参照資料

| 資料                                                   | 用途                       |
| ------------------------------------------------------ | -------------------------- |
| [phase-6-test-expansion.md](phase-6-test-expansion.md) | 形式回帰と日付回帰の確認   |
| [phase-7-coverage.md](phase-7-coverage.md)             | 未実施項目 0 件の確認      |
| [phase-8-refactoring.md](phase-8-refactoring.md)       | wording 圧縮後の最終版確認 |
| `outputs/phase-5/sync-execution-log.md`                | 実更新の事実確認           |

---

## 成果物

| 成果物              | パス                                     | 説明                                                                         |
| ------------------- | ---------------------------------------- | ---------------------------------------------------------------------------- |
| quality gate report | `outputs/phase-9/quality-gate-report.md` | Markdown lint / 日付 / 順序 / 既存ルール / TC-01〜TC-05 の品質ゲート結果記録 |

---

## 統合テスト連携【必須】

本タスクは code 変更なしのため、ユニットテスト / 結合テスト / IPC 契約ドリフト検証は対象外。
代替として以下を品質ゲートとする。

| 品質項目                  | 確認内容                                         | 結果        |
| ------------------------- | ------------------------------------------------ | ----------- |
| Markdown 構文             | 5 ファイルの lint エラー 0                       | PASS / FAIL |
| 日付正確性                | `2026-04-20` で統一、相対日付混入 0              | PASS / FAIL |
| 順序ルール                | 各ファイルの追記順が既存ルールと一致             | PASS / FAIL |
| 既存ルール準拠            | spec-update-workflow / 最小変更原則 / scope 境界 | PASS / FAIL |
| grep 検証（TC-01〜TC-05） | 全件ヒット                                       | PASS / FAIL |

> **対象外**: typecheck / vitest / IPC契約ドリフト / セキュリティスキャン（code 変更なしのため）

---

## 完了条件

- [ ] Markdown 構文チェックが 5 ファイル PASS（lint エラー 0）
- [ ] 日付検証が PASS（`2026-04-20` 統一）
- [ ] 順序ルール検証が PASS（既存ルールに整合）
- [ ] 既存ルール準拠検証が PASS（spec-update-workflow / 最小変更原則 / scope 境界）
- [ ] TC-01〜TC-05 grep 全件 PASS
- [ ] 品質ゲート判定（PASS / MINOR / MAJOR / CRITICAL）が確定している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次Phase

phase-10-final-review.md — 5項目最終チェックと PASS / FAIL 判定
