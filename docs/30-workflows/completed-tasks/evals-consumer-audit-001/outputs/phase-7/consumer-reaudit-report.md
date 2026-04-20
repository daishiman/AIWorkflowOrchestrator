# Phase 7: Consumer Re-Audit Report (Phase 5 × Phase 6 統合再監査)

## メタ情報

| 項目           | 内容                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| task_id        | TASK-EVALS-CONSUMER-AUDIT-001                                                                                |
| phase          | 7 (Step 5 統合確認)                                                                                          |
| 作成日時       | 2026-04-19                                                                                                   |
| 入力 Phase     | Phase 5-A (`consumer-audit-report.md`), Phase 6 (`dual-root-parity.md`, `only-in-*.txt`, `per-skill/*.diff`) |
| 対応 AC        | AC-1 / AC-4 / AC-6（暫定）                                                                                   |
| 対応品質ゲート | QG-6（部分）／ Phase 10 QG-9 の前提                                                                          |
| 対応リスク     | RISK-2（dual root 対称性）／ P7-R-4（片方欠損 consumer 誤検出）                                              |

> 本レポートは Phase 5-A の `consumer-audit-report.md` を**書き換えず**、Phase 7 視点での「再監査」結果をまとめるサイドレポートである（spec §3 Step 5）。

---

## 1. 統合確認の観点

| #   | 観点                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------- |
| 1   | 片方欠損スキルに対応する consumer（スクリプト／テスト）が consumer-audit-report に孤立して存在しないか         |
| 2   | 要対応差分のあるスキルについて、evals-field-map の `readers` / `writers` / `validators` がどちら root を前提か |
| 3   | 追加 consumer（Phase 7 Step 3）が存在する場合の Phase 5 反映状況                                               |

---

## 2. Phase 6 サマリ（再掲）

Phase 6 `dual-root-parity.md` の §2〜§5 より:

| 指標                             |                                                                                                                                  値 |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------: |
| dual root 共通スキル（6 スキル） | aiworkflow-requirements / github-issue-manager / int-test-skill / skill-creator / skill-fixture-runner / task-specification-creator |
| `.claude` のみ存在               |                                                                                                                                   0 |
| `.agents` のみ存在               |                                                                                                                                   0 |
| EVALS.json 完全一致スキル        |                                                                                                                           6（全件） |
| 許容差分スキル                   |                                                                                                                                   0 |
| **要対応差分スキル**             |                                                                                                                               **0** |
| **片方欠損スキル**               |                                                                                                                               **0** |

補足:

- `github-issue-manager` / `int-test-skill` / `skill-fixture-runner` は **両 root に EVALS.json が存在しない**（`skills-union` と `skills-both` が同一かつ EVALS.json 全件列挙 `raw-find-evals.txt` に含まれない）。dual root 的には「両 root で対称に存在しない」ため差分 0 扱い（Phase 6 §2 参照）。

---

## 3. 観点 #1: 片方欠損スキルと consumer の突合

### 3.1 片方欠損スキル: **0 件**

`only-in-claude.txt` / `only-in-agents.txt` がいずれも 0 行のため、「片方 root でのみ EVALS.json が存在するスキル」は存在しない。

### 3.2 片方欠損 consumer の候補検証

Phase 5-A §4.1〜§4.10 の 10 consumer はすべて .claude / .agents の **対称ペア** で列挙されている:

| #   | `.claude` consumer                                               | `.agents` consumer                                               | 対称 |
| --- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | :--: |
| 1   | `.claude/skills/task-specification-creator/scripts/log-usage.js` | `.agents/skills/task-specification-creator/scripts/log-usage.js` |  ✓   |
| 2   | `.claude/skills/skill-creator/scripts/log_usage.js`              | `.agents/skills/skill-creator/scripts/log_usage.js`              |  ✓   |
| 3   | `.claude/skills/skill-creator/scripts/collect_feedback.js`       | `.agents/skills/skill-creator/scripts/collect_feedback.js`       |  ✓   |
| 4   | `.claude/skills/skill-creator/scripts/init_skill.js`             | `.agents/skills/skill-creator/scripts/init_skill.js`             |  ✓   |
| 5   | `.claude/skills/aiworkflow-requirements/scripts/log_usage.js`    | `.agents/skills/aiworkflow-requirements/scripts/log_usage.js`    |  ✓   |

→ **片方 root で孤立している consumer は 0 件**。

### 3.3 片方向 cross-root 依存の注記（Phase 5-A §10 発見 #4 再掲）

片方欠損ではないが、**`.agents/skills/skill-creator/references/resource-map.md:229`** が `.claude/skills/skill-creator/assets/evals-template.json` を絶対パス相当で参照している（Phase 5-A §10）。この片方向リンクは:

- Phase 6 `dual-root-parity.md` の「要対応差分」判定には入らない（EVALS.json 本体の diff ではなく、references/\*.md のリンク文字列の差）
- ただし `.claude` 側が今後削除された場合 `.agents` から `.claude` へのリンクが dead link となるため、Phase 12 の未タスク候補として既に記録済（`unassigned-task/task-mirror-resource-map-cross-root-link-001.md` 提案）

**Phase 7 での追加アクション: なし**（Phase 5-A §8 に既に列挙されている）。

---

## 4. 観点 #2: 要対応差分と readers/writers/validators の root 依存

### 4.1 要対応差分スキル: **0 件**

Phase 6 §4〜§5 で要対応差分スキルが 0 件のため、「スキーマ構造差によって特定 root の consumer が壊れる」懸念は現時点で該当なし。

### 4.2 スキーマ方言分裂（Phase 5-A §10 発見 #2）の再確認

dual root 対称性とは別軸で、**同じ root 内で** snake_case / camelCase 方言が分かれる consumer が存在する:

| スキル                     | root    | init(write-only) スキーマ                        | log_usage(read+write) スキーマ |     整合?      |
| -------------------------- | ------- | ------------------------------------------------ | ------------------------------ | :------------: |
| task-specification-creator | .claude | -（init は手動管理）                             | **camelCase** (log-usage.js)   |       —        |
| task-specification-creator | .agents | -                                                | **camelCase**                  |       —        |
| skill-creator              | .claude | **camelCase** (init_skill → createEvalsTemplate) | **snake_case** (log_usage.js)  | **方言不整合** |
| skill-creator              | .agents | **camelCase** (init_skill → createEvalsTemplate) | **snake_case** (log_usage.js)  | **方言不整合** |
| aiworkflow-requirements    | .claude | -                                                | **snake_case**                 |       —        |
| aiworkflow-requirements    | .agents | -                                                | **snake_case**                 |       —        |

- skill-creator の init と log_usage は **dual root 対称に方言不整合**（両 root で同じ問題が再現）
- この問題は Phase 6 の EVALS.json 本体 diff には現れない（EVALS.json 自体は init_skill.js を手動編集後の状態で両 root 同一になっている）ため、**本 Phase 7 では dual-root-parity.md の分類更新は不要**
- Phase 8 `schema-change-guide.md` にて Rename 手順の警告として明記する（Phase 5-A §8 未タスク #1 / #2）

### 4.3 field-map の root 前提確認（Phase 5-B との相互整合）

Phase 5-B `evals-field-map.md` の `readers` / `writers` / `validators` 列は Phase 5-A consumer のパスをそのまま参照する。§3.2 より全 consumer が dual root 対称であるため、field-map の逆引きも **両 root に対称** に記載されている前提で 5-C の整合チェックが走る（Phase 5-A §12 チェックリスト）。

---

## 5. 観点 #3: 追加 consumer の反映

`additional-consumers.md` より:

- コードリーディングで発見した新規 consumer: **0 件**
- 既知 consumer の内部ラッパ関数（`ensureEvalsFile`, `createEvalsTemplate`, `updateEvals`）: Phase 5-A §4 notes に既に言及
- `validate-skill-structure.js:70` の `'EVALS'` リテラル: スキーマ consumer ではない（Phase 5-A §8 発見 #5 に「CI 検証ガード不在」課題として記録済）

→ **Phase 5-A `consumer-audit-report.md` への追記提案: なし**。

---

## 6. fixture root の再確認

Phase 5-A §5.3 の `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`（fixture root）は:

- Phase 2 §3.1 により dual root 対称性判定から除外（第 3 の root）
- Phase 6 `dual-root-parity.md` の対象にも含めない
- ただし **snake_case スキーマ**を採用しており、skill-creator の log_usage.js が期待するスキーマと整合
- `skill-creator.fixture.test.ts` の TC-004 が `evals.skill_name` を期待するため、代表スキーマを camelCase に統一する変更がかかると **このテストが失敗**する（Phase 5-A §10 発見 #3）

Phase 7 の追加アクション: なし（Phase 8 schema-change-guide の Rename 手順で必須ケースとして明記される）。

---

## 7. 統合確認の結論

| 統合確認項目                                          | 結果                                           |
| ----------------------------------------------------- | ---------------------------------------------- |
| 片方欠損スキル × consumer 突合                        | 該当 0 件                                      |
| 要対応差分 × readers/writers/validators root 依存分析 | 要対応差分 0 件のため該当なし                  |
| 追加 consumer の Phase 5 反映必要性                   | 追加 0 件のため不要                            |
| cross-root link (resource-map.md)                     | 既存未タスク #3 として記録済                   |
| スキーマ方言分裂 (skill-creator init vs log_usage)    | 既存未タスク #1 として記録済                   |
| fixture 依存の snake_case 強制                        | 既存未タスク #1／Phase 8 Rename 手順で明示予定 |

---

## 8. Phase 5-A 集合 vs Phase 7 再検索集合（包含検証）

| 集合                                              |                                    件数（ユニークパス） |
| ------------------------------------------------- | ------------------------------------------------------: |
| `A` = Phase 5-A consumer-audit-report.md 記載パス | 32 consumer／うち実行コード 13 ファイル（§3 / §4 / §5） |
| `B` = Phase 7 再検索ヒットパス                    |                                                      13 |
| `B ⊆ A`?                                          |                                                 **YES** |
| `unlisted-paths.txt` 行数                         |                                                   **0** |

→ **QG-6 PASS**（coverage-recheck.md §5 で重複証跡）。

---

## 9. Phase 8 以降への引き渡し事項

- Phase 8 `schema-change-guide.md`:
  - Rename 手順で fixture (§6) と log_usage スキーマ方言（§4.2）の修正手順を必須記載
  - cross-root link (§3.3) の mirror sync ガイドラインを明記
- Phase 9 references 突合: Phase 5-A §8 発見 #6 (.gitattributes merge policy vs LOGS.md 記述)
- Phase 10 AC-6 解除判定: 本レポートの §7 結論と `coverage-recheck.md` §8 QG-6 PASS を根拠として提示
- Phase 12 unassigned-task-detection.md: Phase 5-A §8 の 6 件を引き継ぎ（本 Phase で新規追加なし）
