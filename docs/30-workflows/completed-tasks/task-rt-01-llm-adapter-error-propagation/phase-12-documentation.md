# Phase 12: ドキュメント更新 - LLMAdapter 初期化エラー UI 通知・状態公開

## メタ情報

| 項目    | 値                                                  |
| ------- | --------------------------------------------------- |
| Phase   | 12 - ドキュメント更新                               |
| 機能名  | task-rt-01-llm-adapter-error-propagation            |
| 作成日  | 2026-04-04                                          |
| 前Phase | [Phase 11: 手動テスト検証](phase-11-manual-test.md) |

## 目的

本タスクで追加・変更した IPC 契約、Preload API、UI 表示、型定義の情報を
`.claude/skills/aiworkflow-requirements/`（正本仕様）と Phase 12 成果物へ同期し、
仕様書と実装の乖離をゼロにする。

Phase 12 は `task-specification-creator` のテンプレートに従い、以下を必須で実施する。

- Task 12-1〜12-6 の成果物を `outputs/phase-12/` に作成する
- system spec 更新を Step 1（完了記録）と Step 2（domain spec sync）に分離して記録する
- `.claude/skills/` の更新を先送りしない（計画系文言を残さない）

## 実行タスク

### 実行タスク一覧（Task 12-1〜12-6）

| Task | 内容                              | 成果物（必須）                                           |
| ---- | --------------------------------- | -------------------------------------------------------- |
| 12-1 | 実装ガイド                        | `outputs/phase-12/implementation-guide.md`               |
| 12-2 | system spec 更新（Step 1/Step 2） | `outputs/phase-12/system-spec-update-summary.md`         |
| 12-3 | ドキュメント更新履歴              | `outputs/phase-12/documentation-changelog.md`            |
| 12-4 | 未タスク検出                      | `outputs/phase-12/unassigned-task-detection.md`          |
| 12-5 | skill フィードバック              | `outputs/phase-12/skill-feedback-report.md`              |
| 12-6 | Phase 12 準拠チェック             | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: `implementation-guide.md` を作成する（Part 1 / Part 2 必須）
- Task 12-2: Step 1-A〜1-G と Step 2A/2B を `system-spec-update-summary.md` に記録し、`.claude/skills/aiworkflow-requirements/` を実更新する
- Task 12-3: `documentation-changelog.md` に差分と検証結果を集約する
- Task 12-4: 未タスクを検出し、0 件でも検出結果を残す
- Task 12-5: workflow/skill の改善点を報告する（改善点が無い場合も明記する）
- Task 12-6: Task 12-1〜12-5 が完了していることを機械的に確認する

## 参照資料

| 資料名                       | パス                                                                                            | 用途                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 12 テンプレート        | `.claude/skills/task-specification-creator/references/phase-template-phase12.md`                | 必須タスク/成果物名の照合          |
| system spec 更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                  | Step 1/Step 2 の混同防止           |
| Step 1 チェックリスト        | `.claude/skills/task-specification-creator/references/spec-update-step1-detailed-checklist.md`  | Step 1-A〜1-G の実行               |
| Step 2 ガイド                | `.claude/skills/task-specification-creator/references/spec-update-step2-domain-sync.md`         | domain spec sync の更新対象特定    |
| Phase 12 準拠テンプレ        | `.claude/skills/task-specification-creator/references/phase12-task-spec-compliance-template.md` | compliance check の最低要件        |
| IPC 正本仕様                 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                       | IPC 契約の更新対象                 |
| UI/UX 正本仕様               | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-core.md`            | UI ブロックの更新対象              |
| topic-map                    | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                   | indexes 再生成対象                 |
| completed ledger             | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                  | 既存レコードがある場合のパッチ対象 |

---

## 実行手順

### Task 12-1: `implementation-guide.md` 作成

**作成先**: `outputs/phase-12/implementation-guide.md`

必須要件:

1. `## Part 1` と `## Part 2` を持つ
2. Part 1 は「なぜ必要か」を先に書き、次に「何をするか」を書く
3. Part 1 に日常の例えを入れる
4. Part 2 に以下の見出し（または同等の表現）を含める

- なぜ必要か
- 何をするか
- 日常の例え
- 今回作ったもの
- 型定義
- 使用例
- エラーハンドリング
- エッジケース
- 設定項目と定数一覧
- テスト構成

検証コマンド（必須）:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/task-rt-01-llm-adapter-error-propagation
```

### Task 12-2: system spec 更新（Step 1 / Step 2）

**作成先**: `outputs/phase-12/system-spec-update-summary.md`

#### Step 1: 完了記録（必須）

`system-spec-update-summary.md` に Step 1-A〜1-G をセクションとして作成し、事実を記録する。

- Step 1-A: タスク概要、差分の要点、current/baseline の区別
- Step 1-B: 実装状況テーブル（完了/未完了、docs-only フラグの有無）
- Step 1-C: 関連タスク・未タスク候補の棚卸し（既存の表と照合した結果）
- Step 1-D: 変更ファイル一覧（system spec / workflow docs / code）
- Step 1-E: 未タスク指示書の配置先判定とリンク整合（0 件でも記録）
- Step 1-F: validator 実行結果の要約（PASS/FAIL と根拠）
- Step 1-G: 計画系文言 残存チェック結果（0 件であること）

計画系文言 残存確認（必須）:

```bash
rg -n "仕様策定のみ|実行予定|保留として記録" \
  docs/30-workflows/task-rt-01-llm-adapter-error-propagation/outputs/phase-12/ \
  | rg -v 'phase12-task-spec-compliance-check.md' || echo "計画系文言 なし"
```

#### Step 2: domain spec sync（本タスクでは必須）

本タスクは public IPC と UI surface を追加しているため Step 2 を実施する。
`system-spec-update-summary.md` には Step 2A/2B を作成し、計画から実更新へ昇格させる。

- Step 2A: 更新対象ファイルと変更内容を列挙する
- Step 2B: `.claude/skills/aiworkflow-requirements/` を実更新し、更新結果へ置換する

更新対象（必須）:

- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`
  - `skill-creator:get-adapter-status`（invoke）
  - `skill-creator:adapter-status-changed`（on/push）
  - payload は `LLMAdapterStatusPayload`（`status` と `failureReason`）
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-core.md`
  - `LLMAdapterErrorBanner` の表示条件、`role="alert"`、テストID
  - `useLLMAdapterStatus` の pull/push とクリーンアップ
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
  - `generate-index.js` で再生成し、topic-map を current fact に同期する

条件付き（既存レコードをパッチする。重複行を作らない）:

- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
  - `TASK-RT-01` の既存レコードがある場合のみ、差分を反映する

今回の必須対象ではない（Step 2 の対象外として明記）:

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-result-panel-pattern.md`

indexes 再生成（必須）:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

### Task 12-3: `documentation-changelog.md` 作成

**作成先**: `outputs/phase-12/documentation-changelog.md`

最低限含める内容:

- current/baseline の区別
- 更新した system spec のファイル一覧（上記 Step 2 対象）
- workflow 成果物（Task 12-1〜12-6）のファイル一覧
- 実行した validator と結果（PASS/FAIL、ログ要点）

### Task 12-4: `unassigned-task-detection.md` 作成

**作成先**: `outputs/phase-12/unassigned-task-detection.md`

必須要件:

- 未タスクが 0 件でも検出結果を残す
- 未タスクがある場合、配置先は `docs/30-workflows/unassigned-task/` を正本とする
- `outputs/phase-12/unassigned-task-detection.md` から未タスク指示書へリンクする

リンク整合検証（必須）:

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source docs/30-workflows/task-rt-01-llm-adapter-error-propagation/outputs/phase-12/unassigned-task-detection.md
```

### Task 12-5: `skill-feedback-report.md` 作成

**作成先**: `outputs/phase-12/skill-feedback-report.md`

最低限含める内容:

- 今回の workflow 実行で詰まった点
- `task-specification-creator` のテンプレート観点で改善できる点
- `aiworkflow-requirements` の参照導線で改善できる点

### Task 12-6: `phase12-task-spec-compliance-check.md` 作成

**作成先**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

必須要件:

- Task 12-1〜12-5 の完了確認（成果物パスの実在、セクション要件）
- system spec Step 1/Step 2 の完了確認
- 計画系文言 の残存が 0 件であること

Phase 出力の機械検証（必須）:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-rt-01-llm-adapter-error-propagation
```

## 成果物

| 成果物                                    | パス                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| 実装ガイド                                | `outputs/phase-12/implementation-guide.md`                                           |
| system spec 更新サマリー（Step 1/Step 2） | `outputs/phase-12/system-spec-update-summary.md`                                     |
| ドキュメント更新履歴                      | `outputs/phase-12/documentation-changelog.md`                                        |
| 未タスク検出結果                          | `outputs/phase-12/unassigned-task-detection.md`                                      |
| skill フィードバック                      | `outputs/phase-12/skill-feedback-report.md`                                          |
| Phase 12 準拠チェック                     | `outputs/phase-12/phase12-task-spec-compliance-check.md`                             |
| 更新済み IPC 正本仕様                     | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`            |
| 更新済み UI/UX 正本仕様                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-core.md` |
| 再生成済み indexes                        | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                        |

## 完了条件

- [ ] `outputs/phase-12/implementation-guide.md` が存在し、validator が PASS している
- [ ] `outputs/phase-12/system-spec-update-summary.md` に Step 1-A〜1-G と Step 2A/2B が記録されている
- [ ] `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md` が current fact に更新されている
- [ ] `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-core.md` が current fact に更新されている
- [ ] `.claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、`indexes/topic-map.md` が再生成されている
- [ ] `outputs/phase-12/documentation-changelog.md` が存在し、更新対象と検証結果が記録されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` が存在し、リンク検証が PASS している
- [ ] `outputs/phase-12/skill-feedback-report.md` が存在する
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が存在し、Task 12-1〜12-6 が PASS している
- [ ] 計画系文言 残存チェックが 0 件である

## タスク100%実行確認【必須】

- [ ] 上記「完了条件」を全て達成した
- [ ] 成果物を `outputs/phase-12/` に配置した
- [ ] `artifacts.json` の Phase 12 を `completed` に更新した

## 次Phase

Phase 12 完了後 → [Phase 13: PR 作成](phase-13-pr-creation.md) へ進む（ユーザー指示待ち）
