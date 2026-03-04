# 監査基準ルール — current/baseline分離判定 + メタ情報1セクション原則

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 |
| Phase      | 5                                          |
| 作成日     | 2026-03-03                                 |
| ステータス | completed                                  |
| 担当タスク | Task 5-4（監査基準ルール実装）             |

---

## 1. current/baseline分離判定ルール

### 1.1 区分定義

| 区分                 | 定義                                             | 合否判定への使用       | 記録方法           |
| -------------------- | ------------------------------------------------ | ---------------------- | ------------------ |
| `currentViolations`  | 今回タスクの変更（新規作成・編集）で発生した違反 | **合否判定に使用**     | 0でPASS、>0でFAIL  |
| `baselineViolations` | 着手前から存在する既存の違反                     | **監視値として別記録** | 件数を記録するのみ |

### 1.2 合否基準

| 条件                           | 判定       | 対応                                         |
| ------------------------------ | ---------- | -------------------------------------------- |
| `currentViolations.total = 0`  | **PASS**   | Phase 12完了可。baselineViolationsは別記録   |
| `currentViolations.total > 0`  | **FAIL**   | 今回タスク内で修正必須。FAIL解消まで完了不可 |
| `baselineViolations.total > 0` | 判定対象外 | 監視値として記録。本タスクの合否に影響しない |

**重要**: baselineViolationsが多数存在しても、currentViolations=0であればPASS。baselineViolations解消は本タスクのスコープ外。

### 1.3 記録フォーマット（標準形式）

```
audit-unassigned-tasks: 全体 PASS/FAIL（baseline: N件, current: M件）→ current PASS/FAIL
```

**記録例（PASS）:**

```
audit-unassigned-tasks: 全体 FAIL（baseline: 12件, current: 0件）→ current PASS
```

**記録例（FAIL）:**

```
audit-unassigned-tasks: 全体 FAIL（baseline: 12件, current: 3件）→ current FAIL（今回修正必須）
```

---

## 2. `## メタ情報` 1セクション原則

### 2.1 ルール定義

未タスク指示書・Phase 12成果物において、`## メタ情報` 見出しの出現回数は**正確に1回**でなければならない。

| 条件                        | 判定     | 対応                                |
| --------------------------- | -------- | ----------------------------------- |
| `## メタ情報` 出現回数 = 1  | **PASS** | 正常                                |
| `## メタ情報` 出現回数 = 0  | **FAIL** | メタ情報セクションの追加が必要      |
| `## メタ情報` 出現回数 >= 2 | **FAIL** | 重複を削除し、1セクションに統合する |

### 2.2 検証コマンド

```bash
# メタ情報セクションの出現回数をカウント
rg -c '^## メタ情報$' <target-file>
# 期待値: 1（0または2以上はFAIL）
```

### 2.3 教訓③対策との関連

親タスク教訓③「未タスク `## メタ情報` 重複問題」に対する直接的な防止策。テンプレートをコピーして作成した未タスク指示書で、テンプレートの `## メタ情報` と実体の `## メタ情報` が二重に残るケースを検出する。

---

## 3. 判定スクリプト実行順序（Step 1-G準拠）

以下の順序で実行し、全て合格することを確認する。前スクリプトの失敗は後続スクリプトに影響しないが、全件の合否を独立して記録する。

### ステップ1: 参照リンク整合確認（前提条件）

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

| 項目     | 内容                         |
| -------- | ---------------------------- |
| 目的     | 未タスク参照リンクの実在確認 |
| 期待結果 | `missing: 0`                 |
| FAIL時   | 欠損パスを修正し再実行       |

### ステップ2: 対象ファイル形式監査（currentViolations確認）

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json --target-file <unassigned-file-path>
```

| 項目     | 内容                          |
| -------- | ----------------------------- |
| 目的     | 対象ファイルの形式監査        |
| 判定対象 | `currentViolations`           |
| 期待結果 | `currentViolations.total = 0` |
| FAIL時   | 違反箇所を修正し再実行        |

### ステップ3: 今回差分監査（currentViolations確認）

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json --diff-from HEAD
```

| 項目     | 内容                                                            |
| -------- | --------------------------------------------------------------- |
| 目的     | 今回の変更分のみの違反検出                                      |
| 判定対象 | `currentViolations`（合否判定）+ `baselineViolations`（監視値） |
| 期待結果 | `currentViolations.total = 0`                                   |
| FAIL時   | 今回変更ファイルの違反を修正し再実行                            |

### ステップ4: 仕様書準拠確認

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/<FEATURE_NAME> --json
```

| 項目     | 内容                     |
| -------- | ------------------------ |
| 目的     | ワークフロー仕様準拠確認 |
| 期待結果 | `errors: 0`              |
| FAIL時   | 仕様書構造を修正し再実行 |

---

## 4. 監査基準と受入基準（AC-FR-04）の対応

| 受入基準                                          | 監査スクリプト           | 合格条件                      |
| ------------------------------------------------- | ------------------------ | ----------------------------- |
| AC-FR-04 (1): target-fileのcurrentViolations=0    | `audit --target-file`    | `currentViolations.total = 0` |
| AC-FR-04 (2): diff-from HEADのcurrentViolations=0 | `audit --diff-from HEAD` | `currentViolations.total = 0` |
| AC-FR-04 (3): baselineViolationsは別記録          | `audit --json`（全体）   | 件数を監視値として記録        |

---

## 5. 判定に使用するスクリプトと引数対応表

| スクリプト                                              | 引数               | 用途                 | 判定対象             | 合格条件                           |
| ------------------------------------------------------- | ------------------ | -------------------- | -------------------- | ---------------------------------- |
| `audit-unassigned-tasks.js --json`                      | なし               | 全体監査（全件）     | `baselineViolations` | 合否判定に使用しない（監視値のみ） |
| `audit-unassigned-tasks.js --json --target-file <path>` | 対象ファイルのパス | 対象ファイル形式監査 | `currentViolations`  | `currentViolations.total = 0`      |
| `audit-unassigned-tasks.js --json --diff-from HEAD`     | `HEAD`             | 今回差分監査         | `currentViolations`  | `currentViolations.total = 0`      |

---

## 6. 変更履歴

| バージョン | 日付       | 内容                   |
| ---------- | ---------- | ---------------------- |
| 1.0.0      | 2026-03-03 | 監査基準ルール初版作成 |
