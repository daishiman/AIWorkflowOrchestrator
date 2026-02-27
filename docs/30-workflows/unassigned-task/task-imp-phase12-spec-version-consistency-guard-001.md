# UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001: Phase 12 仕様更新の版数・手順整合ガード

## メタ情報

```yaml
issue_number: 920
task_id: UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001
task_name: Phase 12 仕様更新の版数・手順整合ガード
category: 改善
target_feature: Phase 12 の仕様更新成果物（spec-update-summary / documentation-changelog / aiworkflow-requirements）
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 Phase 12再監査（実装苦戦箇所）
created_date: 2026-02-27
```

| 項目         | 値                                                                       |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001                        |
| タスク名     | Phase 12 仕様更新の版数・手順整合ガード                                  |
| 分類         | 改善                                                                     |
| 対象機能     | Phase 12 仕様更新成果物の整合維持                                        |
| 優先度       | 中                                                                       |
| 見積もり規模 | 中規模                                                                   |
| ステータス   | 未実施                                                                   |
| 発見元       | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 Phase 12再監査（2026-02-27） |
| 発見日       | 2026-02-27                                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 再監査で、`spec-update-summary.md` と `aiworkflow-requirements` 側の版数・手順記述に差分が残り、同一タスクの証跡なのに文書間で値が一致しない状態が発生した。

### 1.2 問題点・課題

- `task-workflow.md` / `lessons-learned.md` の更新後に、`spec-update-summary.md` が旧版数のまま残る
- 「同種課題の簡潔解決手順」のステップ数（4/5）が文書間で不一致になりやすい
- SubAgent分担で並列更新すると、最終同期対象（LOGS/SKILL/成果物）に転記漏れが起きる

### 1.3 放置した場合の影響

- Phase 12 完了証跡の信頼性が低下し、再監査で差し戻しが増える
- 後続タスクで誤った版数や手順を参照し、再発する
- 仕様更新コストが毎回手作業補正に依存する

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 の仕様更新で、版数・手順数・参照先を機械的に突合し、文書間の整合を自動検証できる状態を作る。

### 2.2 最終ゴール

1. `spec-update-summary.md` / `documentation-changelog.md` / `task-workflow.md` / `lessons-learned.md` / `SKILL.md` / `LOGS.md` の整合チェック手順が定義されている
2. 版数ドリフトと手順数ドリフトを検知する検証コマンドが運用化されている
3. Phase 12 完了条件に「文書間整合チェックPASS」が追加されている

### 2.3 スコープ

#### 含むもの

- Phase 12 仕様更新成果物の版数・手順数の整合チェック設計
- `task-specification-creator` での運用手順（検証順序）の明文化
- `aiworkflow-requirements` への未タスク台帳登録と運用ルール反映

#### 含まないもの

- 実装コード（`apps/`, `packages/`）の機能改修
- 既存全履歴の遡及修正

### 2.4 成果物

- 本未タスク指示書
- 版数/手順整合チェックの運用ルール追記
- 検証証跡（リンク・監査・整合チェック）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の Phase 12 手順を参照可能であること
- `aiworkflow-requirements` の更新フロー（`SKILL.md` / `LOGS.md` / `generate-index.js`）を理解していること
- 対象ワークフローの Phase 12 成果物が生成済みであること

### 3.2 依存タスク

- `UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001`（完了）
- `UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001`（未実施、関連）
- `UT-IMP-PHASE12-COMPLETED-TASK-REFERENCE-SYNC-GUARD-001`（未実施、関連）

### 3.3 必要な知識

- Phase 12 Task 1-5 の成果物要件
- `verify-unassigned-links.js` / `audit-unassigned-tasks.js` の判定軸
- `aiworkflow-requirements/references/task-workflow.md` の残課題運用

### 3.4 推奨アプローチ

1. 仕様更新対象ファイルを先に固定し、転記順序を決める（台帳 → 教訓 → 成果物 → 履歴）
2. 版数と手順数を `rg` で抽出し、更新後に差分ゼロを確認する
3. 合否判定は `currentViolations` とリンク整合を必須条件にする

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                          | 発見経緯                                                                                           | 解決策                                                                                     | 教訓                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| 版数ドリフト（`v1.61.5` と `v1.61.6` の混在） | `UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001` 再監査で `spec-update-summary.md` が旧版数のまま残存 | 台帳側（`task-workflow` / `lessons`）更新直後に `spec-update-summary` と `LOGS` を同期更新 | 仕様書更新は「正本更新→成果物転記→履歴同期」の順序固定が必要 |
| 手順数ドリフト（4ステップ/5ステップ）         | 同一タスクの再利用手順が文書ごとに異なる件数で記載                                                 | 正本を `task-workflow.md` に固定し、他文書は正本から転記する運用に統一                     | 再利用手順は正本1つに寄せないと再発する                      |
| 並列更新時の最終転記漏れ                      | SubAgent分担で更新後、`SKILL.md` / `LOGS.md` の片方更新漏れが発生                                  | SubAgent-D（検証）に最終整合責務を集約し、チェックリストで閉じる                           | 並列実行でも「最終統合責任者」を明確化する必要がある         |

---

## 4. 実行手順

### Phase構成

- Phase A: 整合項目定義
- Phase B: チェック手順実装
- Phase C: 仕様反映と検証

### Phase A: 整合項目定義

#### 目的

版数・手順数・参照先の突合対象を固定する。

#### 手順

1. 対象ファイル一覧を定義する
2. 各ファイルの一致させる項目（版数、手順数、参照パス）を定義する
3. 不一致時の修正優先順位を定義する

#### 成果物

- 整合項目マトリクス

#### 完了条件

- 対象ファイルと一致項目が曖昧さなく定義されている

### Phase B: チェック手順実装

#### 目的

整合確認を再現可能なコマンド手順にする。

#### 手順

1. 版数抽出コマンドを定義する
2. 手順数抽出コマンドを定義する
3. 不一致検出時の是正フローを文書化する

#### 成果物

- 整合チェック手順書

#### 完了条件

- 手順書に従って不一致を検出・是正できる

### Phase C: 仕様反映と検証

#### 目的

システム仕様書スキルへ運用を反映し、検証で閉じる。

#### 手順

1. `task-workflow.md` に未タスクを登録する
2. `SKILL.md` / `LOGS.md` の変更履歴へ反映する
3. `generate-index.js` と監査コマンドを実行する

#### 成果物

- 仕様更新差分
- 検証ログ

#### 完了条件

- `verify-unassigned-links` で missing=0
- `audit --target-file` で currentViolations=0

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 版数・手順数・参照先の整合項目が定義されている
- [ ] 不一致検出と是正の運用手順が定義されている
- [ ] Phase 12 完了判定に整合チェックが組み込まれている

### 品質要件

- [ ] 正本文書（`task-workflow.md`）が定義されている
- [ ] `current`/`baseline` の判定軸が分離されている
- [ ] 並列更新時の最終統合責務が定義されている

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルに登録されている
- [ ] `aiworkflow-requirements` の変更履歴に反映されている

---

## 6. 検証方法

### テストケース

- Case 1: 版数が全対象ファイルで一致している
- Case 2: 手順数が全対象ファイルで一致している
- Case 3: 未タスク参照とフォーマット監査がPASSする

### 検証手順

```bash
rg -n "v[0-9]+\\.[0-9]+\\.[0-9]+" \
  docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/outputs/phase-12/spec-update-summary.md \
  .claude/skills/aiworkflow-requirements/references/task-workflow.md \
  .claude/skills/aiworkflow-requirements/references/lessons-learned.md \
  .claude/skills/aiworkflow-requirements/SKILL.md \
  .claude/skills/aiworkflow-requirements/LOGS.md

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/task-imp-phase12-spec-version-consistency-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                                                       |
| -------------------------------------- | ------ | -------- | -------------------------------------------------------------------------- |
| 正本文書の定義が曖昧で運用が分岐する   | 中     | 中       | 正本を `task-workflow.md` に固定し、他文書は転記ルール化する               |
| チェック手順が複雑で形骸化する         | 中     | 中       | 最小コマンド4本に絞って完了条件へ組み込む                                  |
| baseline違反を今回差分違反と誤判定する | 中     | 低       | `--target-file` / `--diff-from` を合否、全体監査を監視値として分離記録する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/outputs/phase-12/documentation-changelog.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Phase 12 再監査時に、版数記述と簡潔解決手順の件数が文書間で一致せず、
最終確認で手動補正が必要になった。
```

### 補足事項

- 本タスクは「実装コード変更」ではなく「仕様更新運用の品質ガード」タスクである。
- 先に運用を固定し、必要であれば後続で検証スクリプト実装タスクへ分割する。
