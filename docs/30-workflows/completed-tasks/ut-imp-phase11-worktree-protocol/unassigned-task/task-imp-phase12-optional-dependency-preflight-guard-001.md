# UT-IMP-PHASE12-OPTIONAL-DEPENDENCY-PREFLIGHT-GUARD-001: Phase 12 検証前 optional dependency 事前チェックガード

## メタ情報

```yaml
issue_number: 0
task_id: UT-IMP-PHASE12-OPTIONAL-DEPENDENCY-PREFLIGHT-GUARD-001
task_name: Phase 12 検証前 optional dependency 事前チェックガード
category: 改善
target_feature: Phase 12 検証実行フロー（verify/validate/test）の再現性向上
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-IMP-PHASE11-WORKTREE-PROTOCOL-001 Phase 12 再確認（実装苦戦箇所）
created_date: 2026-03-01
```

| 項目         | 内容                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-OPTIONAL-DEPENDENCY-PREFLIGHT-GUARD-001                       |
| タスク名     | Phase 12 検証前 optional dependency 事前チェックガード                       |
| 分類         | 改善                                                                         |
| 対象機能     | Phase 12 検証実行フロー（verify/validate/test）                              |
| 優先度       | 中                                                                           |
| 見積もり規模 | 中規模                                                                       |
| ステータス   | 未実施                                                                       |
| 発見元       | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001 Phase 12 再確認（苦戦箇所・2026-03-01） |
| 発見日       | 2026-03-01                                                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 の再確認で、仕様同期自体は完了していても、検証実行前の環境前提が揃っていないことで検証が停止し、再実行コストが発生した。

### 1.2 問題点・課題

- `verify-all-specs` などの実行パスを誤認し、監査スクリプト起動に失敗する。
- `audit-unassigned-tasks --target-file` の対象制約を誤読し、不要な切り戻しが発生する。
- optional dependency（例: `@rollup/rollup-darwin-x64`）欠落で Vitest が起動せず、検証が中断する。

### 1.3 放置した場合の影響

- Phase 12 の完了判定までのリードタイムが増加する。
- 同種タスクで毎回同じ原因調査を繰り返す。
- 監査結果の `current`/`baseline` 判定が不安定になる。

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 検証を開始する前に、実行パス・監査スコープ・依存解決状態を事前チェックする標準手順を定義し、検証失敗の初動を削減する。

### 2.2 最終ゴール

1. Phase 12 検証前チェック（preflight）を手順化する。
2. `--target-file` 利用可否を機械判定できるようにする。
3. optional dependency 欠落時のリカバリ手順を固定化する。

### 2.3 スコープ

#### 含むもの

- Phase 12 検証前チェックリスト（実行パス、監査対象、依存状態）の定義
- `task-specification-creator` 運用ガイドへの preflight 追記
- `aiworkflow-requirements` 台帳（残課題・教訓参照）への同期

#### 含まないもの

- 既存 baseline 違反の一括是正
- 全未タスク仕様書のフォーマット一括修正
- アプリ本体機能の実装変更

### 2.4 成果物

- preflight 手順定義（ドキュメント）
- 検証実行テンプレート（コマンド順序）
- 更新済み残課題テーブル（task-workflow）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の検証スクリプトが利用可能である。
- `aiworkflow-requirements` の `task-workflow.md` を更新できる。
- `docs/30-workflows/unassigned-task/` に未タスクを配置できる。

### 3.2 依存タスク

- ~~UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001~~（完了済み）
- ~~UT-IMP-PHASE12-VALIDATION-COMMAND-STANDARDIZATION-001~~（完了済み）

### 3.3 必要な知識

- `audit-unassigned-tasks.js` の `--target-file` / `--diff-from HEAD` 使い分け
- Phase 12 の必須成果物と完了チェック同期ルール
- optional dependency を含む Node.js 実行環境の依存解決手順

### 3.4 推奨アプローチ

1. 検証実行前にスクリプト実体パスを `rg --files` で解決する。
2. 未タスク監査は `--diff-from HEAD`（合否）と `--json`（監視）を分離して実行する。
3. optional dependency チェックを preflight に組み込み、欠落時は依存再解決を先行する。
4. 結果を `task-workflow.md` と `lessons-learned.md` に同時同期する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                           | 発見経緯                                             | 解決策                                                                                                       | 教訓                                                   |
| ------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| 検証スクリプト実行パス誤認     | `scripts/` 直下想定で `MODULE_NOT_FOUND` が発生      | `node .claude/skills/task-specification-creator/scripts/<script>.js` に統一                                  | 検証前に実体探索を必須化する                           |
| `--target-file` 対象制約の誤読 | `completed-tasks` 配下を対象にして監査失敗           | `--target-file` は `docs/30-workflows/unassigned-task/` 配下限定と明記し、対象外は `--diff-from HEAD` を使用 | 合否は `currentViolations.total` で判定する            |
| optional dependency 欠落       | `@rollup/rollup-darwin-x64` 未解決で Vitest 起動失敗 | preflight で依存状態を確認し、欠落時は依存再解決後に再実行                                                   | ネイティブ依存を含む検証は事前ヘルスチェックを先行する |

---

## 4. 実行手順

### Phase構成

- Phase A: preflight 定義
- Phase B: 監査手順固定
- Phase C: 依存チェック導入
- Phase D: 台帳同期

### Phase A: preflight 定義

#### 目的

検証前に確認すべき項目を固定化する。

#### 手順

1. 実体パス確認コマンドを定義する。
2. 監査モードの使い分けルールを定義する。
3. optional dependency チェック項目を定義する。

#### 成果物

- preflight チェックリスト

#### 完了条件

- 3観点（パス・スコープ・依存）が手順として一意に記述されている。

### Phase B: 監査手順固定

#### 目的

`current`/`baseline` 混同を防ぐ。

#### 手順

1. `audit --diff-from HEAD` を合否判定の正本に固定する。
2. `audit --json` を baseline 監視として別記録する。
3. `--target-file` は対象未タスク存在時のみ実行するルールを追加する。

#### 成果物

- 監査手順定義

#### 完了条件

- 合否判定基準が `currentViolations.total` に統一されている。

### Phase C: 依存チェック導入

#### 目的

optional dependency 欠落による検証停止を予防する。

#### 手順

1. `pnpm install --frozen-lockfile` の事前実行条件を定義する。
2. Vitest 起動前に依存解決状態を確認する。
3. 欠落時のリカバリ手順（再インストール/再実行）を文書化する。

#### 成果物

- 依存チェック運用手順

#### 完了条件

- optional dependency 欠落時の対処フローが明文化されている。

### Phase D: 台帳同期

#### 目的

未タスク管理とシステム仕様を追跡可能にする。

#### 手順

1. 本未タスク指示書を `docs/30-workflows/unassigned-task/` に配置する。
2. `task-workflow.md` 残課題テーブルへ登録する。
3. `verify-unassigned-links.js` と `audit --target-file` で整合を確認する。

#### 成果物

- 未タスク指示書
- 更新済み残課題テーブル

#### 完了条件

- 参照切れ0件、対象監査 `currentViolations.total = 0`。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] preflight 手順が 3観点（パス/スコープ/依存）で定義されている
- [ ] `audit` 判定基準が `currentViolations.total` に固定されている
- [ ] optional dependency 欠落時の復旧手順が定義されている

### 品質要件

- [ ] 同一条件で再実行して同じ判定になる
- [ ] `--target-file` 誤用を検出できる
- [ ] 検証停止時の原因切り分け手順が明示されている

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルに登録されている
- [ ] 参照リンクが有効である

---

## 6. 検証方法

### テストケース

- Case 1: preflight 完了後に `verify/validate/links/audit` が連続実行できる
- Case 2: `--target-file` 対象外パス指定時に、`--diff-from HEAD` へ切替できる
- Case 3: optional dependency 欠落時に復旧手順どおり再実行できる

### 検証手順

```bash
rg --files .claude/skills | rg "verify-all-specs|validate-phase-output|verify-unassigned-links|audit-unassigned-tasks"
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-dir>
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-dir>
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
```

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                                               |
| ------------------------------ | ------ | -------- | ------------------------------------------------------------------ |
| preflight 手順が形骸化する     | 中     | 中       | Phase 12 完了条件に preflight 実行ログを必須化する                 |
| 依存チェックが環境依存で不安定 | 中     | 低       | 失敗時の再解決コマンドを標準化し、結果を changelog に記録する      |
| 監査モードの誤用が再発する     | 中     | 中       | `--target-file` 利用条件をチェックリストへ固定しレビュー項目化する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参照タスク

- `docs/30-workflows/completed-tasks/task-imp-phase11-worktree-testing-protocol-001.md`
- `docs/30-workflows/completed-tasks/ut-imp-phase11-worktree-protocol/outputs/phase-12/spec-update-summary.md`

---

## 9. 備考

### 補足

- 本タスクは「検証前の運用ガード整備」が対象であり、アプリ機能実装は対象外とする。
- 今回の苦戦箇所3件を再利用可能な運用ルールへ固定することを主目的とする。
