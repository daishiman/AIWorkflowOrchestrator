# UT-TASK-10A-B-009 完了済みUT配置ポリシー統一ガード - タスク指示書

## メタ情報

```yaml
issue_number: 982
task_id: UT-TASK-10A-B-009
task_name: 完了済みUT配置ポリシー統一ガード
category: 改善
target_feature: TASK-10A-B Phase 12 未タスク運用・監査境界
priority: 中
scale: 小規模
status: 未実施
source_phase: UT-TASK-10A-B-001 最終再監査（Phase 12）
created_date: 2026-03-05
dependencies:
  [UT-TASK-10A-B-001, UT-TASK-10A-B-006, UT-TASK-10A-B-007, UT-TASK-10A-B-008]
spec_path: docs/30-workflows/unassigned-task/task-10a-b-completed-ut-placement-policy-guard.md
```

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | UT-TASK-10A-B-009                          |
| タスク名     | 完了済みUT配置ポリシー統一ガード           |
| 分類         | 改善                                       |
| 対象機能     | TASK-10A-B Phase 12 未タスク運用・監査境界 |
| 優先度       | 中                                         |
| 見積もり規模 | 小規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | UT-TASK-10A-B-001 最終再監査（Phase 12）   |
| 発見日       | 2026-03-05                                 |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-TASK-10A-B-001 の最終再監査で、完了済みUT指示書（001）と未実施UT指示書（002〜008）の配置方針が文書・テンプレート間で揺れ、`audit --target-file` の適用境界が誤解されやすい状態が確認された。

### 1.2 問題点・課題

- 配置先の説明が「`completed-tasks` 直下」と「`completed-tasks/unassigned-task`」で混在し、運用判断が人依存になる。
- `audit --target-file` を完了済み指示書に誤適用し、監査失敗を「今回差分の失敗」と誤判定しやすい。
- ルールが散在し、再監査時に同じ確認を毎回手作業で繰り返している。

### 1.3 放置した場合の影響

- 未タスク台帳の整合性と監査結果の信頼性が低下する。
- Phase 12 の完了判定が遅延し、手戻りコストが増加する。
- 同種タスクで同じ誤り（配置混在・target監査誤用）が再発する。

## 2. 何を達成するか（What）

### 2.1 目的

完了済みUT/未実施UT/legacy の配置判定を3分類で固定し、`audit --target-file` の適用境界を明文化・機械検証可能にする。

### 2.2 最終ゴール

1. 配置判定ルールが `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` で同一表現になっている。
2. `target-file` 監査の適用境界が未実施UTディレクトリに限定され、完了済みUTへの誤適用手順が除去されている。
3. `verify-unassigned-links` と `audit --diff-from HEAD` の記録ルール（`current` 合否 / `baseline` 監視）が統一されている。

### 2.3 スコープ

#### 含むもの

- 配置先3分類ルールの仕様同期（aiworkflow-requirements）
- `target-file` 適用境界の明文化
- 同期後の機械検証手順（links/audit/見出し検証）

#### 含まないもの

- 既存legacy資産の一括移管
- UT-TASK-10A-B-002〜008 の機能実装
- 新しい監査スクリプトの実装

### 2.4 成果物

- 本未タスク指示書
- 配置判定と監査境界を追記した仕様書差分
- 検証コマンド実行ログ（links/audit）

## 3. どのように実行するか（How）

### 3.1 前提条件

- `docs/30-workflows/unassigned-task/` に UT-TASK-10A-B-002〜008 が存在する。
- `docs/30-workflows/completed-tasks/task-10a-b-autofixable-filter-button.md` が存在する。
- `task-specification-creator` の監査スクリプトが実行可能。

### 3.2 依存タスク

- ~~UT-TASK-10A-B-001~~（完了）
- UT-TASK-10A-B-006〜008（運用ガード系）

### 3.3 必要な知識

- Phase 12 未タスク運用（`unassigned-task-guidelines.md`）
- `audit-unassigned-tasks.js` の `current/baseline` 判定
- `verify-unassigned-links.js` の参照整合判定

### 3.4 推奨アプローチ

1. 先に「配置先3分類」と「target-file適用境界」を定義する。
2. 仕様書を同一ターンで更新して、説明のドリフトを除去する。
3. links/audit を連続実行し、`current=0` を完了判定として固定する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                 | 発見経緯                                                                    | 解決策                                                                     | 教訓                                                    |
| ---------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------- |
| 完了済みUTと未実施UTが混在し、配置方針が曖昧になった | UT-TASK-10A-B-001 最終再監査で `completed-tasks/unassigned-task` 残置を検出 | 完了済みUTは `completed-tasks` 直下、未実施UTは `unassigned-task` を原則化 | 配置境界は文言でなく物理パスで固定する                  |
| `audit --target-file` を完了済みUTへ誤適用した       | 監査結果の解釈で `current/baseline` が混在し、誤判定が発生                  | `target-file` は未実施UTのみ適用。完了済みUTは `diff-from HEAD` で間接監査 | 合否は `current`、`baseline` は監視値として分離記録する |

## 4. 実行手順

### Phase構成

- Phase A: ルール定義確定
- Phase B: 仕様書同時同期
- Phase C: 機械検証固定

### Phase A: ルール定義確定

#### 目的

配置先3分類と監査境界を一意化する。

#### 手順

1. 配置先を `未実施/完了済みUT/legacy` の3分類で定義する。
2. `target-file` が適用可能なディレクトリ境界を確定する。
3. 判定ルール（`current` 合否 / `baseline` 監視）を明記する。

#### 成果物

- 3分類ルール定義
- 監査境界定義

#### 完了条件

- 3分類と監査境界が1つのルールセットとして確定している。

### Phase B: 仕様書同時同期

#### 目的

ルールを aiworkflow-requirements に反映して再利用可能化する。

#### 手順

1. `task-workflow.md` の TASK-10A-B 節と残課題テーブルへ本UTを追加する。
2. `ui-ux-feature-components.md` の関連未タスクへ本UTを追加する。
3. `lessons-learned.md` に苦戦箇所と簡潔解決手順を追記する。

#### 成果物

- 更新済み仕様書3点

#### 完了条件

- 3仕様書で本UTの目的・課題・参照先が一致している。

### Phase C: 機械検証固定

#### 目的

更新結果の妥当性を機械的に保証する。

#### 手順

1. `verify-unassigned-links.js` を実行する。
2. `audit --target-file` で本指示書の `currentViolations=0` を確認する。
3. `audit --diff-from HEAD` で `currentViolations=0` を確認する。

#### 成果物

- 検証ログ

#### 完了条件

- links missing が0、監査 `currentViolations` が0。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 配置先3分類（未実施/完了済みUT/legacy）が仕様書へ反映されている
- [ ] `target-file` 適用境界が明文化されている
- [ ] 本UTが残課題テーブルに登録されている

### 品質要件

- [ ] `verify-unassigned-links` が PASS
- [ ] `audit --target-file` で `currentViolations.total=0`
- [ ] `audit --diff-from HEAD` で `currentViolations.total=0`

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow.md` に参照が追加されている
- [ ] `ui-ux-feature-components.md` / `lessons-learned.md` に同期されている

## 6. 検証方法

### テストケース

- Case 1: 配置先3分類の説明が3仕様書で一致する
- Case 2: 未タスクリンク切れが0件
- Case 3: `currentViolations` が対象・差分監査とも0件

### 検証手順

```bash
rg -n "UT-TASK-10A-B-009|配置先3分類|target-file" \
  .claude/skills/aiworkflow-requirements/references/task-workflow.md \
  .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md \
  .claude/skills/aiworkflow-requirements/references/lessons-learned.md

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-10a-b-completed-ut-placement-policy-guard.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                                    |
| ------------------------------------ | ------ | -------- | ------------------------------------------------------- |
| legacy運用と新ルールが再混在する     | 中     | 中       | 3分類を固定し、対象外ケースは legacy と明示する         |
| `target-file` 境界を誤適用する       | 高     | 中       | 境界チェック手順をチェックリストへ固定する              |
| baseline違反を今回差分違反と誤認する | 中     | 中       | `current` を合否、`baseline` を監視値として分離記録する |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
- `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
完了済みUT配置ルールが文書間で揺れ、target-file監査の適用境界が誤解されやすい。
配置先3分類と監査境界を固定し、同種課題を短手順で解決できるようにする。
```

### 補足事項

本タスクは運用ガードの標準化が目的であり、UT-TASK-10A-B-002〜008 の機能実装は対象外。
