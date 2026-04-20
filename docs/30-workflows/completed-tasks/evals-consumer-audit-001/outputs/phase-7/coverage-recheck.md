# Phase 7: Coverage Recheck Report (QG-6 証跡)

## メタ情報

| 項目                     | 内容                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| task_id                  | TASK-EVALS-CONSUMER-AUDIT-001                                                                    |
| phase                    | 7                                                                                                |
| 作成日時                 | 2026-04-19                                                                                       |
| 入力 Phase               | Phase 4 (raw-grep-\*.txt) / Phase 5-A (consumer-audit-report.md) / Phase 6 (dual-root-parity.md) |
| 対応 AC                  | AC-1 / AC-2 / AC-8                                                                               |
| 対応品質ゲート           | **QG-6（未記載ヒット 0 件）**                                                                    |
| ripgrep version          | `ripgrep 13.0.0`                                                                                 |
| 再検索 working_directory | `/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260419-160952-wt-9`         |

---

## 1. 実行したコマンド（Phase 2 §7.2 / Phase 4 Step 2 と同一）

| #   | kind    | command                                                                                                                                                                                        | output                     |
| --- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 1   | claude  | `rg -n 'EVALS\.json\|EVALS_PATH\|evalsPath\|EVALS_FILE' .claude/skills/ -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}'`                                              | `recheck-grep-claude.txt`  |
| 2   | agents  | `rg -n 'EVALS\.json\|EVALS_PATH\|evalsPath\|EVALS_FILE' .agents/skills/ -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}'`                                              | `recheck-grep-agents.txt`  |
| 3   | apps    | `rg -n 'EVALS\.json\|EVALS_PATH\|evalsPath\|EVALS_FILE' apps/ -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}'`                                                        | `recheck-grep-apps.txt`    |
| 4   | dynamic | `rg -n "join\([^)]*EVALS\|\`[^\`]_EVALS\.json\|'EVALS\.json'\|\"EVALS\.json\"" .claude/skills/ .agents/skills/ apps/ -g '!**/node_modules/**' -g '!**/.backups/**' -g '_.{js,ts,tsx,mjs,cjs}'` | `recheck-grep-dynamic.txt` |

---

## 2. ヒット件数（Phase 4 vs Phase 7 比較）

| kind    | Phase 4 raw 行数 | Phase 7 recheck 行数 | 差分説明                                                                      |
| ------- | ---------------: | -------------------: | ----------------------------------------------------------------------------- |
| claude  |               46 |                   45 | Phase 4 raw には末尾に `# exit_status: 0` フッタ行が 1 行余分。実ヒットは同数 |
| agents  |               46 |                   45 | 同上                                                                          |
| apps    |               18 |                   17 | 同上                                                                          |
| dynamic |               37 |                   36 | 同上                                                                          |

※ 行数差 1 はメタフッタのみ。コメント行 `# ...` を除外したコンテンツ行集合は **全 kind で完全一致**（§3 参照）。

### 2.1 Phase 4 raw との実コンテンツ集合比較

4 種 kind すべてについて `grep -v '^#' | sort -u` した結果を比較:

```
=== claude : P4 \ P7 == 0 行 / P7 \ P4 == 0 行 ===
=== agents : P4 \ P7 == 0 行 / P7 \ P4 == 0 行 ===
=== apps   : P4 \ P7 == 0 行 / P7 \ P4 == 0 行 ===
=== dynamic: P4 \ P7 == 0 行 / P7 \ P4 == 0 行 ===
```

→ **Phase 4 と Phase 7 の再検索結果は完全一致**。AC-8（再現性）の客観証跡。

---

## 3. Phase 4 との diff 結果（`diff -u`）

ファイル: `phase-7/diff-<kind>.txt`（4 本、すべて生成済）

diff に現れる差分は以下の 3 種のみで、検索結果の**集合**に影響しない:

1. **タイムスタンプ行**: `# executed_at:` が Phase 4 と Phase 7 で異なる（再実行した Phase 7 側は `2026-04-19T09:04:35Z` 付近）
2. **ripgrep 13.0.0 のファイル走査順序の非決定性**: `claude` kind で `.claude/skills/task-specification-creator/scripts/log-usage.js` のブロックが Phase 4 では `skill-creator/scripts/collect_feedback.js` より前、Phase 7 では後に出現（行順のみ。行内容は同一）
3. **`# exit_status: 0` フッタ行**: Phase 4 raw のみに付与されたメタコメント。Phase 7 recheck 側にはフッタを付けていない（spec §3 Step 1 指示は先頭 3 行のメタのみ）

これら 3 点はいずれも **実コンテンツの差異ではない**ため、Phase 4 / Phase 7 間の consumer 集合は同一と判定する。

### 3.1 原因分析（P7-R-1 対応）

- 並行作業の影響: **なし**（ワークツリー `task-20260419-160952-wt-9` は clean 状態、直近コミットは Phase 4 実行後も EVALS.json 非関連）
- 新規コミットの影響: **なし**（再検索対象ファイル群 .claude/skills / .agents/skills / apps のいずれも Phase 4 以降に EVALS 関連変更なし）
- ripgrep バージョン差: **なし**（Phase 4 と同じ `ripgrep 13.0.0`）

→ 検索集合は Phase 4 と**完全同一**。Phase 2 §2.3 の「本タスク実行中は EVALS.json / consumer コード変更禁止」ルール遵守を確認。

---

## 4. Step 3 コードリーディング補完（RISK-1 対応）

詳細は `additional-consumers.md` を参照。サマリ:

| 観点                                                                       | 追加発見                                                    |
| -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| ラッパ関数検索 (`ensureEvalsFile` / `createEvalsTemplate` / `updateEvals`) | 既知 consumer の内部関数のみ、新規 0 件                     |
| 定数経由の隠蔽 (`FILE_NAME = 'EVALS.json'` など)                           | ヒット 0 件                                                 |
| 拡張子違い                                                                 | カバレッジ HTML 生成物のみ（consumer 非該当）               |
| skill-fixture-runner の EVALS 例外行                                       | Phase 5-A §8 発見 #5 で言及済（スキーマ consumer ではない） |

→ **Phase 5-A `consumer-audit-report.md` への追加 consumer 記載は不要**。

---

## 5. 集合比較結果（QG-6 証跡）

### 5.1 再検索ヒットのユニークファイルパス集合 `B`

`phase-7/recheck-paths.txt` (13 パス):

```
.agents/skills/aiworkflow-requirements/scripts/log_usage.js
.agents/skills/skill-creator/scripts/collect_feedback.js
.agents/skills/skill-creator/scripts/init_skill.js
.agents/skills/skill-creator/scripts/log_usage.js
.agents/skills/task-specification-creator/scripts/log-usage.js
.claude/skills/aiworkflow-requirements/scripts/log_usage.js
.claude/skills/skill-creator/scripts/collect_feedback.js
.claude/skills/skill-creator/scripts/init_skill.js
.claude/skills/skill-creator/scripts/log_usage.js
.claude/skills/task-specification-creator/scripts/log-usage.js
apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts
apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts
apps/desktop/src/main/services/skill/SkillScanner.ts
```

### 5.2 consumer-audit-report.md 記載集合 `A` との包含検査

`phase-7/unlisted-paths.txt`: **0 行**

```bash
$ wc -l docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/unlisted-paths.txt
       0 ...
```

→ `B ⊆ A` が成立。**QG-6 PASS（未記載ヒット 0 件）**。

### 5.3 Phase 5-A 13 consumer との対応

| #   | Phase 7 hit path                                                      | Phase 5-A セクション |
| --- | --------------------------------------------------------------------- | -------------------- |
| 1   | `.claude/skills/task-specification-creator/scripts/log-usage.js`      | §4.1                 |
| 2   | `.claude/skills/skill-creator/scripts/log_usage.js`                   | §4.2                 |
| 3   | `.claude/skills/skill-creator/scripts/collect_feedback.js`            | §4.3                 |
| 4   | `.claude/skills/skill-creator/scripts/init_skill.js`                  | §4.4                 |
| 5   | `.claude/skills/aiworkflow-requirements/scripts/log_usage.js`         | §4.5                 |
| 6   | `.agents/skills/task-specification-creator/scripts/log-usage.js`      | §4.6                 |
| 7   | `.agents/skills/skill-creator/scripts/log_usage.js`                   | §4.7                 |
| 8   | `.agents/skills/skill-creator/scripts/collect_feedback.js`            | §4.8                 |
| 9   | `.agents/skills/skill-creator/scripts/init_skill.js`                  | §4.9                 |
| 10  | `.agents/skills/aiworkflow-requirements/scripts/log_usage.js`         | §4.10                |
| 11  | `apps/desktop/src/main/services/skill/SkillScanner.ts`                | §3.1                 |
| 12  | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | §5.1                 |
| 13  | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`   | §5.2                 |

→ 全 13 件が Phase 5-A `consumer-audit-report.md` に漏れなく記載されている。

---

## 6. Phase 5 × Phase 6 統合確認（要点）

詳細は `consumer-reaudit-report.md` を参照。要点:

- **片方欠損スキル: 0 件**（Phase 6 `only-in-claude.txt` / `only-in-agents.txt` ともに空）
- **要対応差分スキル: 0 件**（Phase 6 `dual-root-parity.md` §4〜§5 で全スキル「完全一致」判定）
- したがって「片方 root で孤立する consumer」「要対応スキーマ差により readers/writers/validators 影響を受ける consumer」は本スナップショット時点で **該当なし**
- Phase 5-A §10 発見 #4（`.agents/skills/skill-creator/references/resource-map.md:229` が `.claude/` 配下 `evals-template.json` を cross-root 参照）は dual-root-parity では無関心だが Phase 12 の未タスク候補として既に記録済

---

## 7. AC-8 自己宣言（再現性）

**AC-8（再現コマンド再実行で同じ consumer リストが得られること）は達成**と判定する。

根拠:

- Phase 2 §7.2 に記載の 4 本の再現コマンドを Phase 7 で再実行した結果、Phase 4 raw と**実コンテンツ集合が完全一致**（§2.1 / §3）
- ファイルパス集合 `B`（13 パス）は Phase 5-A `consumer-audit-report.md` 集合 `A` に包含（§5.2）
- 環境差（rg バージョン・作業ディレクトリ・除外パス）は Phase 4 と同条件（§1 / §2）

`phase-11` の手動検証でも同じ 4 コマンドを再実行することで AC-8 の二重確認が行える。

---

## 8. QG-6 判定

| 判定項目                                        | 基準                    | 実測                   | 判定 |
| ----------------------------------------------- | ----------------------- | ---------------------- | ---- |
| 漏れ再検索コマンドを Phase 4 と同一内容で再実行 | 4 コマンドすべて        | 4 コマンドすべて実行済 | PASS |
| `recheck-grep-*.txt` 4 本生成                   | 4 本                    | 4 本                   | PASS |
| `diff-<kind>.txt` 4 本生成                      | 4 本                    | 4 本                   | PASS |
| 実コンテンツ集合差分                            | 0                       | 0                      | PASS |
| `unlisted-paths.txt` 行数                       | 0                       | 0                      | PASS |
| 追加 consumer 発見                              | 0 または Phase 5-A 反映 | 0                      | PASS |

**QG-6 判定: PASS**

---

## 9. 残存リスク・未タスク候補（Phase 12 引き渡し）

本 Phase で新たに発見した未タスクはない。Phase 5-A §8 で列挙済の 6 件がそのまま引き継ぎ対象:

1. EVALS スキーマの二重標準（snake_case / camelCase）
2. fixture EVALS.json と実プロダクトのスキーマ整合性未決
3. mirror sync の cross-root link 破綻リスク（resource-map.md）
4. SkillScanner の EVALS 内容バリデーション不在
5. `validate-schemas.js` / `validate-skill-structure.js` の EVALS スキーマ検証不在
6. `.gitattributes` merge policy と LOGS.md 記述整合の未確認

Phase 12 の `unassigned-task-detection.md` にて本レポートの §9 を参照し、該当 6 件が記録されていることを再確認する。

---

## 10. 成果物インベントリ

| ファイル                                                                             | 生成状況 | 行数/備考              |
| ------------------------------------------------------------------------------------ | -------- | ---------------------- |
| `phase-7/recheck-grep-claude.txt`                                                    | 生成済   | 45                     |
| `phase-7/recheck-grep-agents.txt`                                                    | 生成済   | 45                     |
| `phase-7/recheck-grep-apps.txt`                                                      | 生成済   | 17                     |
| `phase-7/recheck-grep-dynamic.txt`                                                   | 生成済   | 36                     |
| `phase-7/diff-claude.txt` / `diff-agents.txt` / `diff-apps.txt` / `diff-dynamic.txt` | 生成済   | 4 本                   |
| `phase-7/recheck-paths.txt`                                                          | 生成済   | 13                     |
| `phase-7/unlisted-paths.txt`                                                         | 生成済   | 0（QG-6 PASS 根拠）    |
| `phase-7/additional-consumers.md`                                                    | 生成済   | 追加 0 件結論          |
| `phase-7/coverage-recheck.md` (本ファイル)                                           | 生成済   | —                      |
| `phase-7/consumer-reaudit-report.md`                                                 | 生成済   | Phase 5 × Phase 6 統合 |
