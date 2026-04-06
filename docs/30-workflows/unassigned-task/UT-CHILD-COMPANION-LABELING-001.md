# child companion 全件への `> 区分:` ラベル追記 - タスク指示書

## メタ情報

```yaml
issue_number: 1951
```

| 項目         | 内容                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| タスクID     | UT-CHILD-COMPANION-LABELING-001                                           |
| タスク名     | task-workflow-completed-\*.md 全件への `> 区分: 履歴` ラベル追記          |
| 分類         | 改善                                                                      |
| 対象機能     | aiworkflow-requirements / task-workflow child companion ドキュメント      |
| 優先度       | 低                                                                        |
| 見積もり規模 | 小規模                                                                    |
| ステータス   | 未実施                                                                    |
| 発見元       | UT-VERIFY-DOC-CONSOLIDATION-001 Phase 12 skill-feedback-report 改善提案#1 |
| 発見日       | 2026-04-06                                                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-VERIFY-DOC-CONSOLIDATION-001 にて `task-workflow.md` のインデックステーブルに「区分」列（正本 / 履歴 / 契約仕様）を追加し、`task-workflow-active.md` / `task-workflow-completed.md` / `interfaces-skill-verify-contract.md` の冒頭に `> 区分:` ラベルを付与した。しかし `task-workflow-completed-*.md` の各 child companion ファイル（14件）には `> 区分:` が未追記の状態となっている。

### 1.2 問題点

1. **インデックス経由でのみ区分が判別可能**: `task-workflow.md` のインデックステーブルを参照すれば区分がわかるが、child companion を直接開いた場合は即座に「履歴記録」であるとわからない
2. **一貫性の欠如**: `task-workflow-completed.md`（親 baseline）には `> 区分: 履歴記録` が追記済みだが、派生 child companion にはない。同一ファミリーで表記が不統一

### 1.3 放置時の影響

- 後続タスクで child companion を直接参照する際、正本か履歴かの確認にインデックスへの往復が必要となり参照コストが上がる
- 新規 child companion を追加する際に `> 区分:` を付与しないパターンが定着するリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

`task-workflow-completed-*.md` の全 child companion（14件）の冒頭に `> 区分: 履歴記録（history record）` を追記し、インデックスなしで各ファイルを開いた際も正本/履歴を即判別できるようにする。

### 2.2 最終ゴール

`task-workflow-completed-*.md` を直接開いた読者が、ファイルの冒頭 5 行以内で「このファイルは履歴記録である」と判断できる状態にする。

### 2.3 スコープ

**対象:**

- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-workspace-chat-lifecycle-tests.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-graceful-degradation-lifecycle.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-notification-history-auth-key-state.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-import-skill-center-nav.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-advanced-views-analytics-audit.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-debug-scheduler-doc-generation-theme.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-contract-preload-alignment.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-quality-gates-module-resolution-logging.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-abort-contract-auth-session-chat.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-agent-view-line-budget.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-create-ui-integration.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ui-ux-visual-baseline-drift.md`

**対象外:**

- `task-workflow-completed.md`（baseline — 既に追記済み）
- `task-workflow-active.md`（既に追記済み）
- インデックステーブルの変更（既に実施済み）

### 2.4 成果物

| #   | 成果物                                                        | 形式     |
| --- | ------------------------------------------------------------- | -------- |
| 1   | `> 区分: 履歴記録（history record）` が追記された 13 ファイル | Markdown |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-workflow-completed.md`（baseline）の冒頭に `> 区分: 履歴記録（history record）` が追記済みであること
- UT-VERIFY-DOC-CONSOLIDATION-001 が完了済みであること

### 3.2 依存タスク

| タスクID                        | 関係                                  | 状態 |
| ------------------------------- | ------------------------------------- | ---- |
| UT-VERIFY-DOC-CONSOLIDATION-001 | `> 区分:` 形式の定義元・baseline 追記 | 完了 |

### 3.3 推奨アプローチ

- **並列実行**: 各ファイルは独立しているため SubAgent で並列処理可能
- **追記位置**: H1 タイトルの直後（`task-workflow-completed.md` baseline と同一位置）
- **追記内容**: `> 区分: 履歴記録（history record）` の 1 行

---

## 4. 実行手順

### Phase 1: 現状確認（目安: 10分）

**目的:** 対象ファイルの冒頭構造を把握し、追記位置を確定する

**手順:**

1. `task-workflow-completed.md`（baseline）の冒頭を確認し、`> 区分:` ラベルの記載形式を把握する
2. 対象 13 ファイルの冒頭 5 行を確認し、既に `> 区分:` が追記されていないことを確認する
3. 追記位置（H1 タイトルの直後）を確定する

**完了条件:**

- [ ] baseline の `> 区分:` 記載形式を把握済み
- [ ] 全対象ファイルに `> 区分:` が未追記であることを確認済み

### Phase 2: ラベル追記実施（目安: 20分）

**目的:** 全 13 ファイルに `> 区分: 履歴記録（history record）` を追記する

**手順:**

1. 各ファイルを Read して現在の冒頭構造を確認する
2. H1 タイトルの直後に `> 区分: 履歴記録（history record）` を追記する
3. 独立したファイルは SubAgent で並列処理する

**完了条件:**

- [ ] 全 13 ファイルに `> 区分: 履歴記録（history record）` が追記されている

### Phase 3: 整合性確認（目安: 10分）

**目的:** 追記内容の整合性を確認する

**手順:**

1. 全対象ファイルの冒頭を確認し、`> 区分: 履歴記録（history record）` が統一形式で記載されていることを確認する
2. baseline（`task-workflow-completed.md`）との表記統一を確認する
3. `task-workflow.md` インデックステーブルの「区分」列と整合していることを確認する

**完了条件:**

- [ ] 全ファイルの `> 区分:` 表記が baseline と統一されている

### Phase 12: ドキュメント更新（目安: 5分）

**手順:**

1. このタスク仕様書のステータスを「完了」に更新する
2. 完了日を記録する
3. skill-feedback-report を作成する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 対象 13 ファイル全てに `> 区分: 履歴記録（history record）` が追記されている
- [ ] 追記位置が H1 タイトルの直後で統一されている
- [ ] `task-workflow-completed.md`（baseline）との表記が統一されている

### 品質要件

- [ ] 追記以外のファイル内容が変更されていない
- [ ] Prettier フォーマットに準拠している

---

## 6. 検証方法

### テストケース

| #   | テストケース                                        | 期待結果                                            |
| --- | --------------------------------------------------- | --------------------------------------------------- |
| 1   | 各 child companion の冒頭 5 行を確認                | `> 区分: 履歴記録（history record）` が含まれている |
| 2   | baseline との表記比較                               | 完全一致                                            |
| 3   | `task-workflow.md` インデックスの「区分」列との整合 | 全 child companion が「履歴」と記載されている       |

---

## 7. リスクと対策

| #   | リスク                         | 影響度 | 発生確率 | 対策                                                      |
| --- | ------------------------------ | ------ | -------- | --------------------------------------------------------- |
| 1   | 既存コンテンツの意図しない変更 | 中     | 低       | Read → Edit の手順を厳守し、冒頭のみ変更する              |
| 2   | 追記形式の不統一               | 低     | 低       | baseline をテンプレートとして参照し、コピーペーストで統一 |

---

## 8. 参照情報

### 関連ドキュメント

| ファイル                                                                       | 役割                                   |
| ------------------------------------------------------------------------------ | -------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 親仕様書・インデックス（区分列定義元） |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | baseline（追記済みテンプレート）       |
| `docs/30-workflows/unassigned-task/UT-VERIFY-DOC-CONSOLIDATION-001.md`         | 本タスクの発見元                       |

---

## 9. 備考

### 苦戦箇所（予測される困難点）

- 対象ファイルが 13 件と多いため、SubAgent による並列処理を推奨する
- 各ファイルの H1 タイトル直後の構造が統一されていない可能性がある（`> 役割:` の有無など）。事前に baseline の形式を把握してから追記することで整合性を確保する
