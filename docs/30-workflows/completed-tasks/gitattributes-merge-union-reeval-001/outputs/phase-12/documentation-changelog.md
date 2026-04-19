# Phase 12: ドキュメント / 設定変更 changelog

本タスクの **in-scope** 変更と、ローカル環境由来の **out-of-scope** 変更を分離して記録する。

## 1. 変更サマリ

task-related diff summary:

```
 .agents/skills/aiworkflow-requirements/LOGS.md                         | 17 ++++++
 .../references/task-workflow-completed.md                              |  3 +-
 .claude/scripts/setup-merge-drivers.sh                                 | 30 ++++++++--
 .claude/skills/aiworkflow-requirements/LOGS.md                         | 17 ++++++
 .../references/task-workflow-completed.md                              |  3 +-
 .claude/skills/aiworkflow-requirements/indexes/topic-map.md            | same-wave regenerate
 .gitattributes                                                         | 70 ++++++++++++++--------
```

加えて `docs/30-workflows/gitattributes-merge-union-reeval-001/` 配下に Phase 1〜12 の outputs（untracked、13 ディレクトリ）を新規作成。

## 2. 変更ファイル一覧（本タスク範囲）

### 2.1 設定本体

| ファイル                                 | 種別 | 変更内容                                                                                                                                                               |
| ---------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.gitattributes`                         | 改修 | `references/*.md merge=union` 一括適用削除 → append-only のみ個別 glob で明示 / グループ D/A/C/B 見出し追加 / `[意図]/[注意]/[関連]` コメント拡充 / アルファベット順化 |
| `.claude/scripts/setup-merge-drivers.sh` | 改修 | 冒頭コメントに「`.gitattributes` の `merge=ours` 対象」「本スクリプトは idempotent」「driver 未登録時の復旧手順」旨を追記（ロジック変更なし）                          |

### 2.2 skill mirror（双方向同期）

| ファイル                                                                       | 種別 | 変更内容                                                                                 |
| ------------------------------------------------------------------------------ | ---- | ---------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                               | 追記 | 本タスクエントリ（2026-04-19）を 17 行追加                                               |
| `.agents/skills/aiworkflow-requirements/LOGS.md`                               | 追記 | 同上（mirror 同期）                                                                      |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 改修 | 「最近の完了タスク」先頭に本タスク追記・TASK-CONFLICT-PREVENT-001 行に「後続再評価」追記 |
| `.agents/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 改修 | 同上（mirror 同期）                                                                      |

### 2.3 自動生成物 / same-wave sync

| ファイル                                                       | 種別   | 変更内容                                      |
| -------------------------------------------------------------- | ------ | --------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`  | 再生成 | `generate-index.js` 実行により same-wave sync |
| `.agents/skills/aiworkflow-requirements/indexes/topic-map.md`  | 同期   | `.claude` 正本の再生成結果を mirror へ反映    |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json` | 再生成 | 再生成実施、内容差分なし                      |

### 2.4 task scope 外のローカル変更（記録のみ）

| ファイル                      | 扱い          | 理由                                                       |
| ----------------------------- | ------------- | ---------------------------------------------------------- |
| `.claude/settings.local.json` | task scope 外 | ローカル permission キャッシュ。ブランチ成果物には含めない |

### 2.5 新規ドキュメント（untracked）

| パス                                                      | 種別     | 内容               |
| --------------------------------------------------------- | -------- | ------------------ |
| `docs/30-workflows/gitattributes-merge-union-reeval-001/` | 新規作成 | Phase 1〜12 成果物 |

Phase ディレクトリ内訳:

- `phase-1/` 要件分析 / パターン分類
- `phase-2/` 実装方針 / リスク整理
- `phase-3/` テスト設計（静的 check-attr + MT 5 ケース）
- `phase-4/` baseline `git check-attr` 出力
- `phase-5/` `.gitattributes` 書き換え本体
- `phase-6/` Red phase 検証（MT conflict 再現）
- `phase-7/` coverage-report.md（20/20 パターン網羅）
- `phase-8/` cosmetic refactor（グループ D/A/C/B 化、アルファベット順化）
- `phase-9/` quality-report.md（48 行 / comment ratio 54.5% / 9/9 mirror parity）
- `phase-10/` final-review-result.md（AC-1..4 PASS, AC-5 Phase 12 依存、Gate = MINOR）
- `phase-11/` manual-test-result.md + discovered-issues.md（MT-01..05 全 PASS / MEDIUM 1 件 DISC-MED-01）
- `phase-12/` 本 Phase の 6 成果物

## 3. Mirror parity 検証

### 3.1 本タスク追記分の parity

`git diff HEAD -- <.claude 側パス> <.agents 側パス>` による検証:

| ペア                                                                                                                      | 追記行数 | 追記内容一致 |
| ------------------------------------------------------------------------------------------------------------------------- | -------- | ------------ |
| `.claude/skills/aiworkflow-requirements/LOGS.md` ↔ `.agents/skills/aiworkflow-requirements/LOGS.md`                       | 17 / 17  | ✅           |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` ↔ `.agents/.../task-workflow-completed.md` | 3 / 3    | ✅           |

※ `task-workflow-completed.md` は既存コンテンツ（2026-04-16 以前に書き込まれた行）に disparity があるが、これは前駆タスク由来で本タスクの対象外。本タスクが追記した 3 行は両 mirror で完全一致。

### 3.2 本タスクで保証した parity の範囲

本タスクで厳密に保証したのは、**今回追記 / 再生成した対象** の parity である。

- `LOGS.md` 2 系統: parity 済み
- `task-workflow-completed.md` 2 系統: 本タスク追記分 parity 済み
- `topic-map.md`: same-wave 再生成後に mirror 同期済み

## 4. 影響を受けない / 意図的に変更しなかったファイル

| ファイル                                                       | 理由                                             |
| -------------------------------------------------------------- | ------------------------------------------------ |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json` | same-wave 再生成済みだが内容差分なし             |
| `.agents/skills/aiworkflow-requirements/indexes/keywords.json` | `.claude` 正本と同値、今回の再生成で内容差分なし |
| `references/EVALS.json`                                        | `merge=ours`（変更対象外）                       |

## 5. commit 候補メッセージ（Phase 13 で利用予定）

```
config: TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 .gitattributes merge=union スコープ精緻化

- references/*.md への一括 merge=union 適用を削除
- append-only ファイル（LOGS/SKILL-changelog/task-workflow-completed*/lessons-learned-*）のみ個別 glob で merge=union 明示
- 構造化ファイル（api-*.md / arch-*.md / task-workflow.md / lessons-learned.md 等）は default 3-way へ
- setup-merge-drivers.sh 冒頭コメント拡充（idempotent / driver 登録手順）
- mirror parity 9/9 PASS / Phase 11 MT-01..05 PASS

Issue: #2281
前駆タスク: TASK-CONFLICT-PREVENT-001
```

## 6. 関連 Issue / リンク

- Issue: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2281
- 前駆タスク: TASK-CONFLICT-PREVENT-001（2026-04-18）
- Phase 11 MT 証跡: `outputs/phase-11/manual-test-result.md`
- Phase 10 Gate 判定: `outputs/phase-10/final-review-result.md`
