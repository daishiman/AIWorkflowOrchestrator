# Phase 12: ドキュメント更新 — 自動修正可能フィルタボタン実装

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 12                 |
| タスクID   | UT-TASK-10A-B-001  |
| 前提Phase  | Phase 11           |
| 後続Phase  | Phase 13 PR作成    |
| 作成日     | 2026-03-05         |
| ステータス | 完了（2026-03-05） |

## 目的

実装成果を仕様正本へ同期し、未タスク検出・履歴化・フィードバックまでを完了させる。

## Atent Team（SubAgent）分担

| SubAgent | 担当                                                      |
| -------- | --------------------------------------------------------- |
| A        | 実装ガイド（Part 1/Part 2）作成                           |
| B        | aiworkflow-requirements 同期（Step 1-A〜1-G, Step 2判定） |
| C        | 未タスク検出、履歴、フィードバック報告                    |

## 実行タスク

### Task 12-1: 実装ガイド作成（必須）

- Part 1: 中学生レベルの概念説明（例え話必須）
- Part 2: 開発者向け詳細（型・API・エッジケース）

### Task 12-2: システム仕様更新（必須）

- Step 1-A: タスク完了記録（`task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md`）
- Step 1-B: 実装状況テーブル更新（`completed` または `spec_created`）
- Step 1-C: 関連タスクテーブル更新（grepで検出した全箇所）
- Step 1-D: `topic-map.md` 再生成（`generate-index.js` 実行）
- Step 1-E: 未タスク3ステップ確認（指示書作成、残課題テーブル反映、関連仕様リンク）
- Step 1-F: DevOps更新要否判定（本タスクはUI改善のため非該当判定を記録）
- Step 1-G: 検証コマンド順次実行（`verify-unassigned-links` -> `generate-index` -> `quick_validate`）
- Step 2: IF/API変更がある場合のみ仕様本文を更新（本タスクは契約非変更想定）

### Task 12-3: 更新履歴/成果物台帳更新（必須）

- `documentation-changelog.md` 作成
- `artifacts.json` と `outputs/artifacts.json` を同時同期

### Task 12-4: 未タスク検出（必須・0件でも出力）

- Phase 3/10/11 と TODO/FIXME から検出
- 1件以上検出時は `docs/30-workflows/unassigned-task/` に指示書作成
- `verify-unassigned-links.js` で参照整合を検証
- `audit-unassigned-tasks.js` の `current` と `baseline` を分離記録

### Task 12-5: スキルフィードバック報告（必須）

- task-specification-creator / aiworkflow-requirements への改善提案を記録

## 並列実行計画

| タスク                       | 実行パターン | 理由                           |
| ---------------------------- | ------------ | ------------------------------ |
| Task 12-1(A) と Task 12-4(C) | 並列         | ドキュメント種別が独立         |
| Task 12-2(B)                 | 直列         | Step 1-A〜1-G は順序依存がある |
| Task 12-3, 12-5(C)           | 直列         | 前工程完了後に確定可能         |

## 参照資料

依存Phase成果物: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11

| 資料名                | パス                                                                                   | 用途                              |
| --------------------- | -------------------------------------------------------------------------------------- | --------------------------------- |
| 仕様更新手順          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1/2運用                      |
| Phase 12 実体チェック | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` | Task 1/3/4/5 の実体確認           |
| 台帳同期ルール        | `.claude/skills/task-specification-creator/references/evidence-sync-rules.md`          | LOGS/SKILL/台帳同期               |
| 未タスクガイド        | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`   | 未タスク品質基準                  |
| API契約仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                   | Step 2 判定（契約変更有無）の根拠 |
| インターフェース仕様  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`      | 型変更有無の判定根拠              |
| タスク台帳正本        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                   | 完了/残課題同期                   |
| UI仕様正本            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`        | 機能同期先                        |
| 学習記録正本          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                 | 苦戦箇所同期                      |

## 実行手順

1. 参照資料を確認して判断根拠を固定する。
2. Task 12-1 と Task 12-4 を並列で実施し、成果物へ記録する。
3. Task 12-2 は Step 1-A から Step 1-G、Step 2 の順で直列実施する。
4. Task 12-3 と Task 12-5 を実行し、台帳とフィードバックを確定する。
5. 完了条件を検証し、次Phaseへ引き継ぐ。

## 多角的チェック観点（AIが判断）

| 観点                 | 確認内容                         | 参照仕様                      |
| -------------------- | -------------------------------- | ----------------------------- |
| セキュリティ         | 入力検証・境界防御が必要かを確認 | `security-*.md`               |
| UI/UX                | 操作導線・a11y要件の充足を確認   | `ui-ux-*.md`                  |
| アーキテクチャ       | 責務分離と依存方向を確認         | `architecture-*.md`           |
| API/インターフェース | 既存契約とのドリフト有無を確認   | `api-*.md`, `interfaces-*.md` |
| エラーハンドリング   | 失敗時の通知と分類を確認         | `error-handling.md`           |

## 成果物

| 成果物               | パス                                            |
| -------------------- | ----------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       |
| ドキュメント変更履歴 | `outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     |
| 成果物台帳（同期）   | `outputs/artifacts.json`                        |

## 完了条件

- [x] Task 1〜5 が漏れなく実施されている
- [x] 必要な仕様同期先が更新されている
- [x] 未タスク0件の場合も検出レポートが出力されている
- [x] Step 1-A〜1-G と Step 2 の実施結果が `documentation-changelog.md` に記録されている
- [x] `verify-unassigned-links.js` / `quick_validate.js` の結果が記録されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物6点を出力済み
- [x] 引き継ぎ事項を記録済み

## 次のPhase

Phase 13: PR作成
