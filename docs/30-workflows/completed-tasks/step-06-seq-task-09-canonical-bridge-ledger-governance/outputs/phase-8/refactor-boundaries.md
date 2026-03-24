# Phase 8 成果物: リファクタリング境界定義

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 8 - リファクタリング

## 1. 概要

本ファイルは、Phase 8（リファクタリング）における「安全に整理できる構造」と「変更を禁止すべき境界」を定義する。
設計タスクのため、対象はドキュメント構造・命名・章立てであり、プロダクションコードは対象外。

---

## 2. 整理可能な構造（Safe-to-Refactor）

### 2.1 文書内の命名統一

| 対象箇所                        | 現状                                                   | 統一後                                        | 理由                              |
| ------------------------------- | ------------------------------------------------------ | --------------------------------------------- | --------------------------------- |
| Sync Protocol Step 名の表記ゆれ | 文中に「Step A」「ステップA」「step-a」が混在          | 全て「Step A」（英字大文字）に統一            | grep 検索で一意にヒットさせるため |
| State 名の表記ゆれ              | `spec_created` / `spec-created` / `SpecCreated` が混在 | 全て `spec_created`（snake_case）に統一       | FR-3.1 の成果物ベース条件と揃える |
| エージェント制約の数値表現      | 「3ファイル」「max 3」「3件以下」が混在                | 「最大3ファイル/エージェント」に統一          | P43 対策の記述を一意にするため    |
| Canonical Root のパス表記       | `.claude/skills/` / `$(repo)/.claude/skills/` が混在   | `.claude/skills/`（リポジトリ相対パス）に統一 | 検証コマンドとの整合を取るため    |

### 2.2 章立て順序の整理

現在の contract-matrix.md の章順序（State → Action → Ownership）は Phase 12 実行者が参照する順序と一致していない。
以下の順序に整理することで参照コストを削減できる。

| 現在の章順序      | 推奨する章順序    | 変更理由                                           |
| ----------------- | ----------------- | -------------------------------------------------- |
| 1. State 契約     | 1. Ownership 契約 | Phase 12 実行前に所有権を確認するため              |
| 2. Action 契約    | 2. Action 契約    | 変更なし（Ownership を確認してから Action を実行） |
| 3. Ownership 契約 | 3. State 契約     | State は Action 完了後に遷移するため後ろに置く     |

**判断**: 章順序の変更はセマンティクスに影響しない（内容は同一）ため安全なリファクタリングに分類する。

### 2.3 禁止アクション表の表現強化

contract-matrix.md「禁止アクション」の「代替手段」列が空の行（`no-op` エントリ）がある。
以下の補完を行う。

| 禁止アクション        | 補完前の代替手段      | 補完後の代替手段                                                |
| --------------------- | --------------------- | --------------------------------------------------------------- |
| no-op（同期スキップ） | 「0件更新として記録」 | 「documentation-changelog に `Step X: 対象ファイル0件` と記録」 |

### 2.4 validation-matrix.md の Drift 検出コマンドのコメント追加

各コマンドに「PASS 条件」がインラインコメントとして欠けている。追記することで実行者の判断負荷を下げる。

| コマンド番号 | 現状                                           | 追加するコメント                       |
| ------------ | ---------------------------------------------- | -------------------------------------- |
| 1            | `ls -la .claude/skills/.../task-workflow*.md`  | `# 7件以上ファイルが存在すること`      |
| 3            | `diff -qr ./.claude/skills/ ./.agents/skills/` | `# 出力が0行であること（差分なし）`    |
| 5            | `diff .claude/skills/.../LOGS.md ...`          | `# exit code 0 かつ出力なしであること` |

---

## 3. 変更禁止境界（Refactoring Forbidden）

### 3.1 絶対変更禁止（AC に直結する構造）

以下の要素を変更すると AC 検証が壊れるため、Phase 8 では一切変更しない。

| 要素                        | 変更禁止の理由                                                |
| --------------------------- | ------------------------------------------------------------- |
| FR 番号（FR-1.1〜FR-5.4）   | validation-matrix.md の AC マッピングが FR 番号で参照している |
| AC 番号（AC-1〜AC-4）       | Phase 10 final-review-report.md が AC 番号で照合する          |
| State 名（spec_created 等） | Phase 2 design-summary.md の state machine 図と完全一致が必要 |
| Step 名（Step A〜E）        | contract-matrix.md の Action 契約と 1:1 対応が必要            |
| Pitfall 番号（P1, P43 等）  | .claude/rules/06-known-pitfalls.md の参照番号と一致が必要     |
| canonical path 値           | `ls` 検証コマンドが実際のファイルパスに依存している           |

### 3.2 構造変更禁止（他ファイルとの cross-reference が存在）

| ファイル                      | 変更禁止の要素             | 参照元                                         |
| ----------------------------- | -------------------------- | ---------------------------------------------- |
| contract-matrix.md            | 禁止アクション5件のリスト  | phase-12-documentation.md のチェックリスト参照 |
| validation-matrix.md          | AC 検証マトリクスの全行    | final-review-report.md（Phase 10）が照合する   |
| design-summary.md             | 3 Lane 構造（L-1/L-2/L-3） | gate-decision.md が Lane 別に判定している      |
| canonical-source-table（L-2） | 5カテゴリの表定義          | phase-8 simplification-candidates.md が参照    |

### 3.3 運用禁止（Phase 8 のスコープ外）

| 禁止操作                              | 理由                                                   |
| ------------------------------------- | ------------------------------------------------------ |
| .claude/skills/ 配下の実ファイル編集  | Phase 12 Task 2 のスコープ（Phase 8 では設計文書のみ） |
| .agents/skills/ 配下の直接編集        | P65 対策：canonical root (.claude/) 経由が必須         |
| Pitfall 番号の変更・削除              | .claude/rules/ は本タスクの変更スコープ外              |
| task-workflow.md 等の ledger 直接更新 | Phase 12 Task 2 Step A のみ更新可                      |

---

## 4. リファクタリング実行チェックリスト

Phase 8 実行者は以下の順序で作業する。

| 順序 | 作業                                          | 対象ファイル                            | 完了条件                                      |
| ---- | --------------------------------------------- | --------------------------------------- | --------------------------------------------- |
| 1    | Sync Protocol Step 名の表記統一               | design-summary.md, contract-matrix.md   | grep で「ステップA」が0件                     |
| 2    | State 名の表記統一                            | design-summary.md, validation-matrix.md | grep で「spec-created」が0件                  |
| 3    | エージェント制約の数値表現統一                | design-summary.md, contract-matrix.md   | grep で「max 3」「3件以下」が0件              |
| 4    | contract-matrix.md の章順序変更               | contract-matrix.md                      | Ownership → Action → State の順序             |
| 5    | 禁止アクション表の代替手段補完                | contract-matrix.md                      | no-op 行の代替手段が空でないこと              |
| 6    | validation-matrix.md の PASS 条件コメント追加 | validation-matrix.md                    | 全7コマンドにコメントあり                     |
| 7    | 変更禁止要素の保護確認                        | 全 outputs/phase-1〜3/ ファイル         | FR番号・AC番号・State名が変更されていないこと |

---

## 5. 設計タスク固有の注意事項

本タスクは type: design のため、Phase 8 リファクタリングの対象は設計文書（outputs/ 配下の md ファイル）に限定される。
プロダクションコード、テストコード、Zustand store、IPC ハンドラ等は一切変更しない。

| 対象            | 変更可否                     |
| --------------- | ---------------------------- |
| outputs/ 配下   | 可（2〜6節の範囲内）         |
| .claude/rules/  | 不可                         |
| .claude/skills/ | 不可（Phase 12 Task 2 のみ） |
| apps/           | 不可                         |
| packages/       | 不可                         |
