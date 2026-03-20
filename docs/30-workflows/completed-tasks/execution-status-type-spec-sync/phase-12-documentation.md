# Phase 12: ドキュメント更新 - SkillExecutionStatus 型同期の再監査

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| Phase      | 12                              |
| 機能名     | execution-status-type-spec-sync |
| 作成日     | 2026-03-20                      |
| タスク種別 | docs-only                       |

## 目的

Phase 12 現行契約に合わせ、implementation guide、system spec update summary、documentation changelog、unassigned-task detection、skill feedback、phase12 compliance check を定義する。

## Phase 10 MINOR 追跡テーブル

| MINOR ID | 指摘内容                                | 解決予定Phase | 解決確認Phase | 解決方法                               | ステータス |
| -------- | --------------------------------------- | ------------- | ------------- | -------------------------------------- | ---------- |
| M10-01   | docs-only walkthrough 5観点の補強       | Phase 11      | Phase 12      | manual test result と changelog に反映 | 解決予定   |
| M10-02   | Step 1-G / Step 2A / Step 2B 記録の補強 | Phase 12      | Phase 12      | summary / compliance check に反映      | 解決予定   |
| M10-03   | blocked record の補強                   | Phase 13      | Phase 13      | blocked record table に反映            | 引き継ぎ   |

## 実行タスク

- Task 1: implementation guide
- Task 2: system spec update summary
- Task 3: documentation changelog
- Task 4: unassigned-task detection
- Task 5: skill feedback report
- Task 6: phase12-task-spec-compliance-check

## 参照資料

| 資料名               | パス                                                                                   | 説明                    |
| -------------------- | -------------------------------------------------------------------------------------- | ----------------------- |
| Phase 2 設計         | `outputs/phase-2/design.md`                                                            | 分岐設計                |
| Phase 5 実装サマリー | `outputs/phase-5/implementation-summary.md`                                            | ready/blocked 結果      |
| Phase 6 拡充結果     | `outputs/phase-6/expanded-test-results.md`                                             | parity / docs-only 検査 |
| Phase 7 カバレッジ   | `outputs/phase-7/coverage-report.md`                                                   | coverage 結果           |
| Phase 8 結果         | `outputs/phase-8/refactoring-report.md`                                                | 命名統一                |
| Phase 9 品質結果     | `outputs/phase-9/quality-report.md`                                                    | validator / parity      |
| Phase 11 結果        | `outputs/phase-11/manual-test-result.md`                                               | walkthrough 結果        |
| Phase 10 結果        | `outputs/phase-10/final-review-result.md`                                              | MINOR / Blocker         |
| current task ledger  | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                   | backlog / status 同期   |
| spec update workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1/2                |
| spec update step1    | `.claude/skills/task-specification-creator/references/spec-update-step1-completion.md` | Step 1-A〜1-G           |
| phase12 template     | `.claude/skills/task-specification-creator/references/phase-template-phase12.md`       | docs-only 契約          |

## 実行手順

### ステップ1: Task 1 implementation guide を定義する

- Part 1: 中学生向けに「状態確認の掲示板」の比喩で説明する
- Part 2: `skill.ts` 実値、Task12 一次情報、ready/blocked 分岐、更新対象、validator をまとめる

### ステップ2: Task 2 system spec update summary を定義する

Step 1-A〜1-G を全て持つ。

| Step | 内容                                                                                                                 |
| ---- | -------------------------------------------------------------------------------------------------------------------- |
| 1-A  | workflow / `task-workflow.md` / LOGS / SKILL 履歴の完了記録                                                          |
| 1-B  | `completed` / `spec_created` 判定                                                                                    |
| 1-C  | 関連タスク / 未タスク候補 / 残課題の横断確認                                                                         |
| 1-D  | index 再生成                                                                                                         |
| 1-E  | 未タスク登録                                                                                                         |
| 1-F  | lessons learned / cross-skill / workflow summary の補助更新                                                          |
| 1-G  | `quick_validate.js` / `validate_all.js` / `verify-all-specs.js` / `validate-phase-output.js` / `diff -qr` の結果転記 |

Step 2 は `ready` 時のみ domain spec 実更新、`blocked` 時は更新不要判断と根拠記録にする。

| Step | 内容                                                                    | 必須 |
| ---- | ----------------------------------------------------------------------- | ---- |
| 2A   | 更新予定ファイル、変更意図、blocked なら未更新理由を先に記録する        | ✅   |
| 2B   | `.claude/skills/` 配下の実更新、または blocked 根拠の確定結果へ置換する | ✅   |

planned wording は Phase 12 完了前に除去する。

```bash
rg -n "仕様策定のみ|実行予定|保留として記録" \
  docs/30-workflows/execution-status-type-spec-sync/outputs/phase-12/ \
  | rg -v 'phase12-task-spec-compliance-check.md' || echo "planned wording なし"
```

### ステップ3: Task 3-6 の成果物契約を定義する

| Task   | 正式成果物                                               |
| ------ | -------------------------------------------------------- |
| Task 3 | `outputs/phase-12/documentation-changelog.md`            |
| Task 4 | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 5 | `outputs/phase-12/skill-feedback-report.md`              |
| Task 6 | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

### ステップ4: 未タスク配置先とリンク整合を定義する

| 条件                              | 配置先                                                          | 検証                                    |
| --------------------------------- | --------------------------------------------------------------- | --------------------------------------- |
| current workflow 由来の未完了事項 | `docs/30-workflows/unassigned-task/`                            | `ls docs/30-workflows/unassigned-task/` |
| completed workflow 由来の backlog | `docs/30-workflows/completed-tasks/<workflow>/unassigned-task/` | 物理配置確認                            |
| 0件判定                           | `unassigned-task-detection.md` に 0件理由を残す                 | summary 記録                            |

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source docs/30-workflows/execution-status-type-spec-sync/outputs/phase-12/unassigned-task-detection.md
```

### ステップ5: validator 転記先を固定する

| コマンド                   | 転記先                                                                   |
| -------------------------- | ------------------------------------------------------------------------ |
| `quick_validate.js`        | `system-spec-update-summary.md`, `documentation-changelog.md`            |
| `validate_all.js`          | `system-spec-update-summary.md`, `phase12-task-spec-compliance-check.md` |
| `verify-all-specs.js`      | `system-spec-update-summary.md`, `documentation-changelog.md`            |
| `validate-phase-output.js` | `phase12-task-spec-compliance-check.md`                                  |
| `diff -qr`                 | `system-spec-update-summary.md`, `skill-feedback-report.md`              |

## 統合テスト連携（Phase 12）

| 検証項目        | 方法                          | 期待結果                       |
| --------------- | ----------------------------- | ------------------------------ |
| Task 1          | implementation guide 契約確認 | Part 1 / Part 2 がある         |
| Task 2          | Step 1-A〜1-G / Step 2        | 全 Step が定義されている       |
| Task 4          | 成果物名                      | `unassigned-task-detection.md` |
| Task 6          | compliance check              | Task 1-5 を全確認              |
| planned wording | `rg -n`                       | 残存なし                       |
| unassigned link | `verify-unassigned-links.js`  | link 整合あり                  |

## 成果物

| 成果物           | パス                                                     | 説明                     |
| ---------------- | -------------------------------------------------------- | ------------------------ |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2          |
| 仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 結果     |
| 更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 変更ファイルと validator |
| 未タスク検出     | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも必須              |
| フィードバック   | `outputs/phase-12/skill-feedback-report.md`              | 改善点またはなし         |
| 準拠チェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 1-5 全確認          |

## 完了条件

- [ ] Task 1-6 が定義されている
- [ ] Step 1-A〜1-G と Step 2 が定義されている
- [ ] Step 2A / Step 2B と planned wording 除去手順が定義されている
- [ ] `unassigned-task-detection.md` が正式名称になっている
- [ ] `phase12-task-spec-compliance-check.md` が含まれている
- [ ] 未タスク配置先と validator 転記先が定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. implementation guide 契約整理
3. Step 1-A〜1-G / Step 2 / Step 2A / Step 2B 整理
4. unassigned 配置先 / link 整理
5. validator 転記先整理
6. changelog / unassigned / feedback / compliance 契約整理
7. 成果物作成
8. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/execution-status-type-spec-sync --phase 12
```

## 次のPhase

Phase 13: PR作成
