# Phase 12: ドキュメント更新 - 新関数テスト拡充

## メタ情報

| 項目     | 値                                                                         |
| -------- | -------------------------------------------------------------------------- |
| Phase    | 12                                                                         |
| 機能名   | UT-TASK06-007-EXT-006-new-function-test-expansion                          |
| 作成日   | 2026-03-21                                                                 |
| タスクID | UT-TASK06-007-EXT-006                                                      |
| 前Phase  | Phase 11: 手動テスト（[phase-11-manual-test.md](phase-11-manual-test.md)） |

## 目的

テスト拡充の実装事実を Phase 5〜11 の成果物と `.claude/skills/` 正本へ同期し、Phase 12 必須成果物を漏れなく揃える。`task-specification-creator` の Phase 12 契約と `aiworkflow-requirements` の canonical root ルールに従い、Task 12-1〜12-6 を順に閉じる。

## 実行タスク

- Task 12-1: 実装ガイド作成（Part 1 概念説明 + Part 2 開発者向け詳細）
- Task 12-2: システム仕様書更新（Step 1-A〜1-G + 条件付き Step 2）
- Task 12-3: `documentation-changelog.md` 作成
- Task 12-4: `outputs/phase-12/unassigned-task-detection.md` 作成（0件でも必須）
- Task 12-5: `skill-feedback-report.md` 作成（改善点なしでも必須）
- Task 12-6: `outputs/phase-12/phase12-task-spec-compliance-check.md` 作成

## 参照資料

| 参照資料                       | パス                                                                                                                      | 説明                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 要件定義書                     | `outputs/phase-1/requirements.md`                                                                                         | Phase 1 成果物                             |
| 設計書                         | `outputs/phase-2/design.md`                                                                                               | Phase 2 成果物                             |
| テスト設計記録                 | `outputs/phase-4/test-design.md`                                                                                          | Phase 4 成果物                             |
| Green確認レポート              | `outputs/phase-5/green-confirmation.md`                                                                                   | Phase 5 成果物                             |
| テスト拡充判断                 | `phase-6-test-expansion.md`                                                                                               | Phase 6 本文                               |
| カバレッジレポート             | `outputs/phase-7/coverage-report.md`                                                                                      | Phase 7 成果物                             |
| リファクタリング報告書         | `outputs/phase-8/refactoring-report.md`                                                                                   | Phase 8 成果物                             |
| 品質レポート                   | `outputs/phase-9/quality-report.md`                                                                                       | Phase 9 成果物                             |
| 最終レビュー結果               | `outputs/phase-10/final-review-result.md`                                                                                 | Phase 10 成果物                            |
| 手動テスト結果レポート         | `outputs/phase-11/manual-test-result.md`                                                                                  | Phase 11 成果物                            |
| 手動テストチェックリスト       | `outputs/phase-11/manual-test-checklist.md`                                                                               | Phase 11 補助成果物                        |
| resource-map                   | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                          | canonical spec の初動選定                  |
| quick-reference                | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                                       | UT-TASK06-007 既存仕様の早見表             |
| task-workflow completed ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-contract-preload-alignment.md`             | 完了記録と follow-up 導線                  |
| implementation pattern detail  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-drift-detection.md` | テスト戦略を残す主要同期先                 |
| lessons learned                | `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md`                                | 一時ディレクトリ戦略や再利用知見の記録候補 |
| aiworkflow LOGS                | `.claude/skills/aiworkflow-requirements/LOGS.md`                                                                          | 更新対象1                                  |
| task-specification LOGS        | `.claude/skills/task-specification-creator/LOGS.md`                                                                       | 更新対象2                                  |
| aiworkflow SKILL.md            | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                                         | 変更履歴更新対象                           |
| task-specification SKILL.md    | `.claude/skills/task-specification-creator/SKILL.md`                                                                      | 変更履歴更新対象                           |

## 実行手順

### Task 12-1: 実装ガイド作成

`outputs/phase-12/implementation-guide.md` は 2 パート構成とする。

- Part 1:
  `たとえば` を含む日常例えで、「境界値」「1つ少ない/ちょうど/1つ多い」を先に説明する。
- Part 1:
  対象は `normalizeTypeAnnotation`、`isPrimitiveTypeAnnotation`、`mergeChannelMaps`、2つの正規表現であることを専門用語なしで説明する。
- Part 2:
  export追加の理由、追加対象5つ、テストID群、`mkdtempSync` ベースの一時ディレクトリ戦略、`--report-only` 実行、エラーパス、設定値なしであることを記録する。
- Part 2:
  `validate-phase12-implementation-guide.js` で内容要件を確認する。

### Task 12-2: システム仕様書更新

#### Step 1-A: 完了記録

- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/task-specification-creator/SKILL.md`

上記4ファイルへ、`UT-TASK06-007-EXT-006` が `normalizeTypeAnnotation` / `isPrimitiveTypeAnnotation` / `mergeChannelMaps` / `CHANNEL_OBJECT_PATTERN` / `PRELOAD_CALL_START_PATTERN` のテストを拡充した事実を記録する。

#### Step 1-B: 実装状況テーブル

本タスクは実装と検証が完了する前提の workflow なので、完了記録は `completed` 扱いで記録する。`spec_created` は使わない。

#### Step 1-C: 関連タスクと関連仕様書の横断確認

以下を grep し、`関連タスク` / `未タスク候補` / `残課題` table を更新する。

```bash
grep -rn "UT-TASK06-007-EXT-006" .claude/skills/aiworkflow-requirements/references/
grep -rn "UT-TASK06-007-EXT-006" .claude/skills/task-specification-creator/references/
```

主要確認先:

- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-contract-preload-alignment.md`
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
- `architecture-implementation-patterns-reference-ipc-drift-detection.md`
- `lessons-learned-ipc-preload-runtime.md`

#### Step 1-D: index 再生成

```bash
cd .claude/skills/aiworkflow-requirements && node scripts/generate-index.js
```

`indexes/topic-map.md` と `indexes/keywords.json` の更新を確認する。

#### Step 1-E: 未タスク登録

未タスクが 1 件以上なら、`docs/30-workflows/unassigned-task/` に formalize し、`.claude/skills/aiworkflow-requirements/references/task-workflow.md` と関連仕様へリンクを追加する。0 件でも `outputs/phase-12/unassigned-task-detection.md` は必ず残す。

#### Step 1-F: 補助更新

`mkdtempSync` ベースの一時ディレクトリ戦略や `--report-only` の再利用価値が確認できた場合は、`.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md` に同期する。`artifacts.json` と `outputs/artifacts.json` の同期結果もここで確認対象に含める。

#### Step 1-G: 検証

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-TASK06-007-EXT-006-new-function-test-expansion
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/UT-TASK06-007-EXT-006-new-function-test-expansion --json
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/UT-TASK06-007-EXT-006-new-function-test-expansion
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```

#### Step 2: domain spec sync

既存 IPC 契約や公開 interface を変更しない限り Step 2 はスキップ可とする。ただし、`mergeChannelMaps` の一時ディレクトリ戦略や multi-line preload 検証パターンを再利用知見として system spec に残す場合は、対象ファイルと理由を `system-spec-update-summary.md` に明記する。

### Task 12-3: documentation-changelog.md 作成

`outputs/phase-12/documentation-changelog.md` に以下を記録する。

- Step 1-A〜1-G の実行結果
- Step 2 の要否判断
- 更新した canonical path 一覧
- validator summary
- `current` / `baseline` の区別
- `artifacts.json` と `outputs/artifacts.json` の同期結果

将来実施を示す文言は残さない。

### Task 12-4: `outputs/phase-12/unassigned-task-detection.md` 作成

`outputs/phase-12/unassigned-task-detection.md` に 0 件でも結果を残す。1 件以上なら formalize path、関連 spec 追加先、`verify-unassigned-links.js` の結果を記録する。

### Task 12-5: skill-feedback-report.md 作成

`outputs/phase-12/skill-feedback-report.md` に以下を記録する。

- 一時ディレクトリ戦略の再利用価値
- 非export関数を export して直接テストする判断の妥当性
- 小規模テスト拡張 task に 13 Phase を適用した際の冗長さ
- 改善点がない場合は「改善点なし」と理由

### Task 12-6: `outputs/phase-12/phase12-task-spec-compliance-check.md` 作成

`outputs/phase-12/phase12-task-spec-compliance-check.md` で以下を最終確認する。

- Task 12-1〜12-6 が全て完了している
- Step 1-A〜1-G と Step 2 の結果が他成果物と一致している
- `outputs/phase-12/implementation-guide.md` / `outputs/phase-12/system-spec-update-summary.md` / `outputs/phase-12/documentation-changelog.md` / `outputs/phase-12/unassigned-task-detection.md` / `outputs/phase-12/skill-feedback-report.md` / `outputs/phase-12/phase12-task-spec-compliance-check.md` の6ファイルが揃っている
- `artifacts.json` と `outputs/artifacts.json` の内容が一致している
- `outputs/phase-12/*.md` に将来実施を示す文言が残っていない

## 統合テスト連携

本Phaseは新規テストを増やさない。Phase 9 の品質レポートと Phase 11 の手動確認結果を入力として扱い、validator と spec sync を統合確認として実施する。

## 成果物

| 成果物                    | パス                                                     | 説明                                             |
| ------------------------- | -------------------------------------------------------- | ------------------------------------------------ |
| artifacts同期台帳         | `outputs/artifacts.json`                                 | ルート `artifacts.json` との同期先               |
| 実装ガイド                | `outputs/phase-12/implementation-guide.md`               | Part 1 + Part 2                                  |
| 仕様更新サマリー          | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 / mirror parity / artifacts sync |
| documentation-changelog   | `outputs/phase-12/documentation-changelog.md`            | 変更ファイル・validator・current/baseline        |
| unassigned-task-detection | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出レポート（0件でも必須）              |
| skill-feedback-report     | `outputs/phase-12/skill-feedback-report.md`              | 改善点または改善点なし                           |
| 準拠チェック              | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 の最終確認                       |

## 完了条件

- [x] Task 12-1: `outputs/phase-12/implementation-guide.md` が Part 1 / Part 2 要件を満たしている
- [x] Task 12-2: Step 1-A〜1-G の結果が `system-spec-update-summary.md` と `documentation-changelog.md` に転記されている
- [x] Task 12-2: Step 2 の要否判断が根拠付きで記録されている
- [x] Task 12-3: `outputs/phase-12/documentation-changelog.md` が canonical path と validator 結果を含んでいる
- [x] Task 12-4: `outputs/phase-12/unassigned-task-detection.md` が 0件でも作成されている
- [x] Task 12-5: `outputs/phase-12/skill-feedback-report.md` が改善点または改善点なしを記録している
- [x] Task 12-6: `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成されている
- [x] `outputs/artifacts.json` と `artifacts.json` の同期結果が記録されている
- [x] `diff -qr` による `.claude` / `.agents` mirror parity が確認されている
- [x] `outputs/phase-12/*.md` に将来実施を示す文言が残っていない

## 次Phase

Phase 13: PR作成（ユーザーの明示承認後）
→ [`phase-13-pr-creation.md`](phase-13-pr-creation.md)
