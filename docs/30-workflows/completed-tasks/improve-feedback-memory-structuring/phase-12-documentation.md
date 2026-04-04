# Phase 12: ドキュメント更新

| 項目      | 値                                                 |
| --------- | -------------------------------------------------- |
| Phase     | 12                                                 |
| 前 Phase  | 11                                                 |
| 次 Phase  | 13                                                 |
| タスク ID | task-ut-p0-02-001-repeat-feedback-memory           |
| タスク名  | verify→improve ループの feedback memory 構造化改善 |

---

## 目的

実装ガイド・システム仕様更新・未タスク検出・スキルフィードバック・台帳/インデックス同期を完了する。

---

## 実行タスク

### Task 12-1: 実装ガイド作成

2パート構成で実装ガイドを作成する。

#### Part 1: 概念説明（中学生レベル）

たとえば、料理のレシピを3回試すとき、前回何を失敗したかメモしておく、という例えで概念を説明する。

- 1回目: レシピ通りに作ったけど塩が多すぎた → 「塩が多すぎた」とメモ
- 2回目: メモを見て塩を減らしたけど、今度は火が強すぎた → 「塩多すぎ」「火が強すぎ」と2つメモ
- 3回目: 2つのメモを全部見て、塩を減らし火も弱くした → 成功!

これが feedback memory の構造化。過去の全ての失敗をメモとして保持し、次の試行に活かす仕組み。

#### Part 2: 技術者レベル

以下を記述する:

- `ImproveFeedbackHistory` 型定義の詳細説明
- `buildImproveFeedback` API シグネチャと引数・戻り値の説明
- current contract と target delta を分けた Before / After の説明
- 使用例（コードスニペット）
- エラーハンドリングの方針
- エッジケースと設定可能パラメータ / 定数一覧

**出力**: `outputs/phase-12/implementation-guide.md`

作成後に `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` と `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/improve-feedback-memory-structuring` で内容要件を確認する。

---

### Task 12-2: システム仕様書更新

2ステップで仕様書を更新する。

#### Step 1: タスク完了記録

| サブステップ | 内容                                                                                                                                                                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step 1-A     | 完了タスクセクション追加 + LOGS.md x2 + SKILL.md x2 + topic-map.md 更新                                                                                                                                                                                  |
| Step 1-B     | `task-workflow.md` / `task-workflow-backlog.md` / `task-workflow-completed.md` の該当 row を同波同期し、必要なら no-op を明示                                                                                                                            |
| Step 1-C     | `index.md` / `artifacts.json` / `outputs/artifacts.json` / `phase-*.md` の parity 確認 + `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/improve-feedback-memory-structuring --regenerate` 再実行 |
| Step 1-D     | 実装状況テーブル更新（「未実装」→「完了」に変更）                                                                                                                                                                                                        |
| Step 1-E     | 関連タスクテーブル更新                                                                                                                                                                                                                                   |

#### Step 2: システム仕様更新

`ImproveFeedbackHistory` は新規インターフェースのため、以下の仕様書の更新が必要:

| 更新先ファイル                                                                                    | 更新内容                                                       |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`       | RuntimeSkillCreatorFacade 仕様に ImproveFeedbackHistory を追記 |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | verify→improve ループに関する教訓を追記                        |

Phase 11 が NON_VISUAL の場合でも `manual-test-checklist.md` / `manual-test-result.md` / `manual-test-report.md` / `discovered-issues.md` の存在と current / baseline を `system-spec-update-summary.md` に記録する。`topic-map.md` は `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` で再生成する。

**出力**: `outputs/phase-12/system-spec-update-summary.md`

---

### Task 12-3: ドキュメント更新履歴作成

Step 1-A / Step 1-B / Step 1-C / Step 1-D / Step 1-E / Step 2 の結果を個別に明記する。

- 各ステップで更新したファイルパス
- 更新内容の要約
- 更新前後の差分概要
- current / baseline の区別
- `index.md` / `artifacts.json` / `outputs/artifacts.json` / `task-workflow.md` / `topic-map.md` の同期結果
- `更新予定` / `計画済み` / `PR マージ後` のような future wording を残さないこと

**出力**: `outputs/phase-12/documentation-changelog.md`

---

### Task 12-4: 未タスク検出レポート作成

**0件でも出力必須**。

検出ソース:

- 元タスク仕様書のスコープ外項目
- Phase 3 MINOR 指摘
- Phase 10 レビュー結果
- Phase 11 `manual-test-result.md` / `manual-test-report.md`
- コードコメント TODO/FIXME

**出力**: `outputs/phase-12/unassigned-task-detection.md`

---

### Task 12-5: スキルフィードバックレポート作成

**改善点なしでも出力必須**。

3つの観点から評価する:

1. **テンプレート改善**: Phase テンプレートの改善提案
2. **ワークフロー改善**: Phase 実行フローの改善提案
3. **ドキュメント改善**: ドキュメント構造・内容の改善提案

**出力**: `outputs/phase-12/skill-feedback-report.md`

---

### 追加: Phase 12 タスク仕様準拠チェック

Phase 12 の全タスクが仕様通りに実行されたことを確認する root evidence を作成する。

**出力**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## Phase 12 苦戦防止 Tips

Phase 12 は成果物が多く複雑になりがちなため、以下の参照資料を事前に確認すること:

- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

---

## LOGS.md 更新

以下の 2 ファイルを更新する:

| ファイル                                            | 更新内容             |
| --------------------------------------------------- | -------------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`    | タスク完了ログを追記 |
| `.claude/skills/task-specification-creator/LOGS.md` | タスク完了ログを追記 |

## SKILL.md 更新

以下の 2 ファイルを更新する:

| ファイル                                             | 更新内容               |
| ---------------------------------------------------- | ---------------------- |
| `.claude/skills/aiworkflow-requirements/SKILL.md`    | 学習事項・改善点を追記 |
| `.claude/skills/task-specification-creator/SKILL.md` | 学習事項・改善点を追記 |

---

## 参照資料

- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`
- `.claude/skills/task-specification-creator/references/spec-update-step1-detailed-checklist.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

---

## 成果物

| #   | 成果物                       | パス                                                     |
| --- | ---------------------------- | -------------------------------------------------------- |
| 1   | 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               |
| 2   | システム仕様更新サマリ       | `outputs/phase-12/system-spec-update-summary.md`         |
| 3   | ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            |
| 4   | 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          |
| 5   | スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              |
| 6   | タスク仕様準拠チェック       | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

---

## 完了条件

- [ ] Task 12-1: 実装ガイド（2パート構成）が作成されている
- [ ] Task 12-2: システム仕様書が更新されている（Step 1-A〜1-E/Step 2）
- [ ] Task 12-3: ドキュメント更新履歴が作成されている
- [ ] Task 12-4: 未タスク検出レポートが作成されている（0件でも出力済み）
- [ ] Task 12-5: スキルフィードバックレポートが作成されている（改善点なしでも出力済み）
- [ ] Phase 12 タスク仕様準拠チェックが作成されている
- [ ] LOGS.md x2 が更新されている
- [ ] SKILL.md x2 が更新されている
- [ ] `index.md` / `artifacts.json` / `outputs/artifacts.json` が同期されている
- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` で topic-map.md が再生成されている
- [ ] `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/improve-feedback-memory-structuring --regenerate` を実行している
- [ ] 全 6 成果物が outputs/phase-12/ に存在する

---

## タスク 100% 実行確認

> このフェーズの全タスク（Task 12-1〜12-5 + 追加タスク）を 100% 実行すること。
> 部分実行や省略は許可されない。
> 成果物が 0 件の場合でも、レポートファイル自体は必ず作成すること。
