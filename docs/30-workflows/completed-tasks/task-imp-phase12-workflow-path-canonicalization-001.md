# UT-IMP-PHASE12-WORKFLOW-PATH-CANONICALIZATION-001 - Phase 12 workflowパス正規化ガード タスク指示書

## メタ情報

```yaml
issue_number: 1073
```

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-WORKFLOW-PATH-CANONICALIZATION-001   |
| タスク名     | Phase 12 workflowパス正規化ガード                   |
| 分類         | 改善                                                |
| 対象機能     | Phase 12 再監査時の workflow 指定と検証コマンド運用 |
| 優先度       | 中                                                  |
| 見積もり規模 | 小規模                                              |
| ステータス   | 未実施                                              |
| 発見元       | TASK-UI-01-A-STORE-SLICE-BASELINE Phase 12 再監査   |
| 発見日       | 2026-03-05                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 再監査で、workflow の実体パス（`docs/30-workflows/task-056a-a-store-slice-baseline/`）と参照想定パスの取り違えが発生し、検証前の準備コストが増加した。

### 1.2 問題点・課題

- workflow 指定の揺れにより、`No such file or directory` の手戻りが起きる。
- `--target-file` の適用対象外ファイル（`outputs/phase-12/*.md`）を誤指定しやすい。
- 合否判定（`currentViolations`）と健全性指標（`baselineViolations`）の記録が混在しやすい。

### 1.3 放置した場合の影響

- 再監査時間が増加し、Phase 12 完了判定が遅延する。
- 検証の再現性が下がり、同種タスクで同じミスが繰り返される。
- 証跡整合の説明コストが増え、レビューでの差し戻しリスクが上がる。

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 再監査前に workflow パスを正規化し、検証コマンドの適用境界を機械確認できる運用を確立する。

### 2.2 最終ゴール

1. workflow の実体確認手順（`test -d` + `rg --files`）が固定化される。
2. `--target-file` の対象を `docs/30-workflows/unassigned-task/` に限定できる。
3. `current` と `baseline` を分離して記録するテンプレート運用が定着する。

### 2.3 スコープ

#### 含むもの

- workflow パス確認の preflight 手順追加
- `--target-file` 適用境界の機械確認
- `current/baseline` 分離転記の定型化

#### 含まないもの

- 全workflowの一括移設
- 既存 baseline 違反90件の一括是正

### 2.4 成果物

- workflowパス正規化手順を記載した運用文書
- Phase 12 テンプレート更新（コマンド/チェックリスト）
- 仕様書（task-workflow / lessons-learned）への苦戦箇所反映

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の検証スクリプトが実行可能である。
- 対象workflowが `docs/30-workflows/` 配下に存在する。

### 3.2 依存タスク

- TASK-UI-01-A-STORE-SLICE-BASELINE（完了）
- UT-IMP-PHASE12-UNASSIGNED-BASELINE-REDUCTION-001（並行運用）

### 3.3 必要な知識

- `verify-all-specs` / `validate-phase-output` の入力仕様
- `audit-unassigned-tasks` の `--target-file` / `--diff-from HEAD` の違い
- Phase 12 成果物（spec-update-summary / unassigned-task-detection）の記録ルール

### 3.4 推奨アプローチ

1. 検証前に workflow 実体を機械確認してからコマンド実行する。
2. `--target-file` は未タスク正本のみで使い、成果物監査は `--diff-from HEAD` で行う。
3. 結果を `current=合否` / `baseline=監視` の2軸で転記する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                           | 発見経緯                                                                | 解決策                                                                 | 教訓                                       |
| ------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| workflow 実体パスの取り違え    | Phase 12 再監査時に対象外パスへアクセスし、存在しないファイル参照が発生 | `test -d <workflow-path>` と `rg --files docs/30-workflows             | rg '<task-id>'` を preflight に追加        | 「検証コマンドの前に対象実体確認」を固定しないと手戻りする |
| `--target-file` の誤用         | `outputs/phase-12/*.md` を指定して監査失敗                              | `--target-file` は `docs/30-workflows/unassigned-task/*.md` 限定へ統一 | コマンドの対象境界を明文化しないと再発する |
| `current` と `baseline` の混在 | 監査値の解釈が実装差分判定と資産健全性で混線                            | `spec-update-summary` に2軸記録欄を追加し同値転記                      | 合否指標と監視指標は分離して扱う           |

---

## 4. 実行手順

### Phase構成

- Phase A: workflow実体確認ルール定義
- Phase B: テンプレートと仕様書の同期
- Phase C: 検証運用への固定化

### Phase A: workflow実体確認ルール定義

#### 目的

workflow の正規パスを検証前に確定できるようにする。

#### 手順

1. `test -d <workflow-path>` でディレクトリ実体を確認する。
2. `rg --files docs/30-workflows | rg '<task-id>'` で候補を列挙する。
3. 監査対象を `spec-update-summary.md` に固定記録する。

#### 成果物

- workflow 実体確認ログ

#### 完了条件

- 監査対象workflowが1つに確定され、コマンドが全て同一パスを参照する。

### Phase B: テンプレートと仕様書の同期

#### 目的

再発防止ルールをテンプレートと仕様書へ反映する。

#### 手順

1. `skill-creator` の Phase 12 テンプレートへ境界ルールを反映する。
2. `task-workflow.md` と `lessons-learned.md` に苦戦箇所を同期する。
3. `SKILL.md` / `LOGS.md` の履歴を更新する。

#### 成果物

- 更新済みテンプレート/仕様書/ログ

#### 完了条件

- テンプレートと仕様書の記述が同一ルールで一致する。

### Phase C: 検証運用への固定化

#### 目的

新ルールで実監査が通ることを確認する。

#### 手順

1. `verify-all-specs` / `validate-phase-output` を実行する。
2. `audit --target-file`（未タスク）と `audit --diff-from HEAD`（差分）を実行する。
3. `verify-unassigned-links` でリンク整合を確認する。

#### 成果物

- 検証結果（PASS証跡）

#### 完了条件

- `currentViolations=0` で運用固定が確認できる。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] workflow 実体確認 preflight が定義されている
- [ ] `--target-file` 適用境界が明文化されている
- [ ] `current/baseline` 分離記録ルールがある

### 品質要件

- [ ] 監査コマンドが対象外エラーなく完走する
- [ ] `currentViolations=0` を維持できる
- [ ] `verify-unassigned-links` が PASS である

### ドキュメント要件

- [ ] 未タスク指示書を正本ディレクトリへ配置した
- [ ] `task-workflow.md` に関連未タスクを登録した
- [ ] `lessons-learned.md` に苦戦箇所を再利用形式で記録した

---

## 6. 検証方法

### テストケース

- TC-UTP-01: workflow パス確認コマンドで対象が一意に確定できる
- TC-UTP-02: `--target-file` 監査が対象ファイルで PASS する
- TC-UTP-03: 差分監査で `currentViolations=0` を維持できる

### 検証手順

1. `test -d docs/30-workflows/task-056a-a-store-slice-baseline`
2. `rg --files docs/30-workflows | rg 'task-056a-a-store-slice-baseline'`
3. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-phase12-workflow-path-canonicalization-001.md`
4. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`
5. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

---

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                                                          |
| -------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------- |
| workflow パスが複数候補で曖昧になる          | 中     | 中       | preflight の候補列挙結果を成果物へ記録し、採用パスを明示する                  |
| 監査境界ルールがテンプレートと仕様書でズレる | 中     | 中       | `skill-creator` テンプレートと `aiworkflow-requirements` を同一ターン更新する |
| baseline改善を差分合否と誤認する             | 中     | 高       | `current` と `baseline` の転記欄を分け、判定基準を固定する                    |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
- `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`

### 参考資料

- `docs/30-workflows/task-056a-a-store-slice-baseline/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/task-056a-a-store-slice-baseline/outputs/phase-12/unassigned-task-detection.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

> 「未タスクを未タスクディレクトリに作成して。今回実装に苦戦した箇所も記述してください」

### 補足事項

- 本タスクは「実装追加」ではなく「Phase 12 再監査運用の再発防止」を目的とする。
