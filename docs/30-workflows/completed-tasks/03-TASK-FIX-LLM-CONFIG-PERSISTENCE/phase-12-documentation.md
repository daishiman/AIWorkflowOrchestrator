# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 12                              |
| Phase 名   | ドキュメント                    |
| タスクID   | TASK-FIX-LLM-CONFIG-PERSISTENCE |
| 前提 Phase | Phase 11                        |
| 後続 Phase | Phase 13                        |
| ステータス | completed                       |
| 作成日     | 2026-03-20                      |
| 更新日     | 2026-03-21                      |
| 機能名     | LLM設定永続化修正               |

## 目的

persist v2・起動時バリデーション・P62 対策・Phase 11 専用ハーネスを、workflow 成果物と `.claude/skills/` 正本仕様の両方へ同期し、Task 03 を「実装完了 + Phase 11/12 再監査済み」の状態で閉じる。
この Phase では Task 03 単体の出力だけでなく、parent workflow、artifact inventory、completed ledger、lessons learned、LOGS、SKILL、mirror parity まで同じターンでそろえる。

## 実行タスク

### Task 1: implementation-guide の完成

- `outputs/phase-12/implementation-guide.md` を validator 10/10 前提の構成に更新する
- Part 1 で「なぜ必要か」を先に説明し、日常の例えを入れる
- Part 2 で型定義、API/CLI シグネチャ、使用例、エラーハンドリング、エッジケース、設定と定数を明記する

### Task 2: システム仕様と台帳の same-wave 同期

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-persist-hardening-test-quality.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-ai-chat-llm-integration-fix.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-ai-chat-llm-integration-fix-artifact-inventory.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-chat-lifecycle-tests.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`
- `docs/30-workflows/ai-chat-llm-integration-fix/index.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/task-specification-creator/SKILL.md`

### Task 3: Phase 12 必須 6 成果物の整備

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

### Task 4: 未タスク 2 件の formalize 導線確認

- `UT-FIX-LLM-FETCHPROVIDERS-RETRY-001`
- `UT-FIX-LLM-PERSIST-ENCRYPT-001`

上記 2 件について、未タスク指示書・backlog・関連仕様書リンク・本レポート内リンクの 4 点が揃っていることを確認する。

### Task 5: 検証と mirror sync

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE --json`
- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/unassigned-task-detection.md`
- `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE`
- `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE`
- `rsync --checksum .claude/skills/ .agents/skills/`
- `diff -qr .claude/skills/ .agents/skills/`

## 参照資料

| 資料                     | パス                                                                                                                  | 用途                             |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 2 設計             | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-2-design.md`                                              | persist v2 / P62 の設計判断確認  |
| Phase 5 実装             | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-5-implementation.md`                                      | 実装済み変更点の正本             |
| Phase 6 テスト拡充       | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-6-test-expansion.md`                                      | 回帰テスト群の確認               |
| Phase 7 カバレッジ       | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-7-coverage-check.md`                                      | coverage gate の確認             |
| Phase 8 リファクタリング | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-8-refactoring.md`                                         | 最終コード状態の確認             |
| Phase 9 品質検証         | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-9-quality-assurance.md`                                   | lint/typecheck/test PASS の確認  |
| Phase 10 最終レビュー    | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-10-final-review.md`                                       | MINOR / follow-up 判定の確認     |
| Phase 11 仕様書          | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-11-manual-test.md`                                        | capture 契約の正本               |
| parent workflow          | `docs/30-workflows/ai-chat-llm-integration-fix/index.md`                                                              | family 全体の同期                |
| 状態管理仕様             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                          | persist v2 と P62 対策           |
| persist hardening        | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-persist-hardening-test-quality.md` | restore 境界と Phase 11 ハーネス |
| selector UI              | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`                                             | null クリア時の UI 契約          |
| workflow inventory       | `.claude/skills/aiworkflow-requirements/references/workflow-ai-chat-llm-integration-fix-artifact-inventory.md`        | current canonical set            |

## 実行手順

1. Task 03 の Phase 11/12 成果物を completed 状態へ更新する。
2. system spec / parent workflow / completed ledger / lessons / logs / skill history を same-wave で同期する。
3. validator と mirror parity を再実行し、結果を Phase 12 成果物へ書き戻す。
4. `artifacts.json` / `outputs/artifacts.json` / phase 本文 / parent workflow の状態を整合させる。

## 成果物

| 成果物                   | パス                                                                                                          | 説明                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 12 仕様書          | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-12-documentation.md`                              | Phase 12 の正本      |
| 実装ガイド               | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/implementation-guide.md`               | validator 対応版     |
| システム仕様更新サマリー | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/system-spec-update-summary.md`         | same-wave 更新記録   |
| changelog                | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/documentation-changelog.md`            | 事後記録             |
| 未タスク検出             | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/unassigned-task-detection.md`          | follow-up 2件の導線  |
| スキルフィードバック     | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/skill-feedback-report.md`              | guard 提案           |
| 準拠チェック             | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/phase12-task-spec-compliance-check.md` | 完了条件と validator |

## 完了条件

- [x] Phase 12 必須 6 成果物のファイル名を確定した
- [x] same-wave sync の対象ファイル群を明示した
- [x] follow-up 2 件の formalize 導線を確認対象へ含めた
- [x] validator と mirror sync の再実行コマンドを固定した
- [x] parent workflow と `.claude/skills/` 正本を同一ターンで更新する方針を明記した
- [x] Task 2 Step 1-A: `.claude/skills/aiworkflow-requirements/LOGS.md` を更新した
- [x] Task 2 Step 1-A: `.claude/skills/task-specification-creator/LOGS.md` を更新した（**P1対策: 2ファイル両方**）
- [x] Task 2 Step 1-A: `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴を更新した
- [x] Task 2 Step 1-A: `.claude/skills/task-specification-creator/SKILL.md` の変更履歴を更新した
- [x] Task 2 Step 1-B: arch-state-management.md の persist 設定テーブルを更新した
- [x] Task 2 Step 1-C: 関連仕様書を検索し、必要な更新を行った
- [x] Task 2 Step 1-D: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、topic-map.md を再生成した（**P2対策**）
- [x] Task 2 Step 2: arch-state-management.md のシステム仕様（persist対象フィールド・version）を更新した
- [x] Task 3: `outputs/phase-12/documentation-changelog.md` に全 Step の実行結果を事後記録した（**P4対策: 完了は最後**）
- [x] Task 4: `outputs/phase-12/unassigned-task-detection.md` を作成した（**0件でも必須**）
- [x] Task 4: 未タスクを3ステップで登録した（指示書作成 → task-workflow登録 → 仕様書リンク追加）
- [x] `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認した（**P51対策**）

## 次Phase

Phase 13: 完了（`phase-13-pr-creation.md`）
