# task-workflow.md 同期手順 — Phase 12 完了台帳・残課題テーブル更新

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 |
| Phase      | 5                                          |
| 作成日     | 2026-03-03                                 |
| ステータス | completed                                  |
| 担当タスク | Task 5-5（task-workflow.md 同期手順）      |

---

## 1. 対象ファイル

```
.claude/skills/aiworkflow-requirements/references/task-workflow.md
```

---

## 2. 完了タスク記録の追加手順

### 手順 2-1: 完了タスクセクションの追加

task-workflow.md の「完了タスク」テーブルに以下の形式でエントリを追加する。

```markdown
### タスク: <TASK-NAME>（<COMPLETION_DATE>完了）

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | <TASK-ID>                                                          |
| 完了日       | <COMPLETION_DATE>                                                  |
| ステータス   | **完了** / **spec_created**                                        |
| テスト数     | <AUTO_TEST_COUNT>（自動テスト）+ <MANUAL_TEST_COUNT>（手動テスト） |
| 発見課題     | <ISSUE_COUNT>件                                                    |
| ドキュメント | `docs/30-workflows/<TASK-DIR>/`                                    |

#### 成果物

| 成果物               | パス                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| テスト結果レポート   | `docs/30-workflows/<TASK-DIR>/outputs/phase-11/manual-test-result.md`        |
| 実装ガイド           | `docs/30-workflows/<TASK-DIR>/outputs/phase-12/implementation-guide.md`      |
| 仕様更新サマリー     | `docs/30-workflows/<TASK-DIR>/outputs/phase-12/spec-update-summary.md`       |
| 未タスク検出レポート | `docs/30-workflows/<TASK-DIR>/outputs/phase-12/unassigned-task-detection.md` |
```

### 手順 2-2: 検証証跡の記録

完了タスクセクション内に、以下の検証証跡を記録する。

```markdown
#### 検証証跡

| スクリプト                                   | 結果 | 備考                      |
| -------------------------------------------- | ---- | ------------------------- |
| `verify-all-specs.js --workflow`             | PASS | -                         |
| `validate-phase-output.js`                   | PASS | -                         |
| `verify-unassigned-links.js`                 | PASS | missing: 0                |
| `audit-unassigned-tasks.js --diff-from HEAD` | PASS | current: 0, baseline: N件 |
```

### 手順 2-3: 苦戦箇所と簡潔解決手順の記録

```markdown
#### 苦戦箇所

| 苦戦箇所 | 再発条件           | 解決策       |
| -------- | ------------------ | ------------ |
| <課題1>  | <再発しやすい条件> | <今回の対処> |

#### 簡潔解決手順

1. <変更範囲を標準5責務またはUI6責務へ分離する>
2. <phase-12-documentation.md の更新対象表を正本に Step 2 要否を確定する>
3. <実装 + 契約 + セキュリティを同一ターンで同期する>
4. <未タスクがある場合は unassigned-task/ に10見出しで作成する>
5. <verify/validate/audit/links を連続実行し、current=合否・baseline=監視で記録する>
```

---

## 3. 残課題テーブルへの登録手順

### 手順 3-1: 未タスクがある場合

task-workflow.md の残課題テーブルに以下の形式で新規行を追加する。

```markdown
| <UT-TASK-ID> | <タスク名> | <依存タスク> | <優先度> | <指示書パス> |
```

**例:**

```markdown
| UT-IMP-PHASE12-STEP2-TARGET-TRACE-GUARD-001 | Step 2更新対象追跡ガード | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 | 中 | `docs/30-workflows/unassigned-task/task-imp-phase12-step2-target-trace-guard-001.md` |
```

### 手順 3-2: 3ステップ完了確認（P3対策）

未タスクが1件以上検出された場合、以下の3ステップ全てが完了していることを確認する。

- [ ] `unassigned-task/` に指示書を作成
- [ ] `task-workflow.md` 残課題テーブルに登録
- [ ] 関連仕様書に参照リンクを追加

---

## 4. ステータス更新手順

### 手順 4-1: 完了タスクのステータス更新

残課題テーブルに該当タスクがある場合、取り消し線で完了をマークする。

```markdown
# 変更前

| <TASK-ID> | <タスク名> | <依存タスク> | <優先度> | <指示書パス> |

# 変更後

| ~~<TASK-ID>~~ | ~~<タスク名>~~ | ~~<依存タスク>~~ | ~~<優先度>~~ | ~~<指示書パス>~~ |
```

### 手順 4-2: 完了済みタスク仕様書のステータス更新

`docs/30-workflows/completed-tasks/` 配下の該当タスク仕様書のステータスを更新する。

- 実装完了: `completed`
- 仕様書作成のみ: `spec_created`

---

## 5. 変更履歴

| バージョン | 日付       | 内容                              |
| ---------- | ---------- | --------------------------------- |
| 1.0.0      | 2026-03-03 | task-workflow.md 同期手順初版作成 |
