# UT-IMP-TASK10A-D-SUBAGENT-EXECUTION-LOG-GUARD-001: Phase 12 仕様書別SubAgent実行ログの必須化

## メタ情報

```yaml
issue_number: TBD
task_id: UT-IMP-TASK10A-D-SUBAGENT-EXECUTION-LOG-GUARD-001
task_name: Phase 12 仕様書別SubAgent実行ログの必須化
category: 改善
target_feature: Phase 12 仕様同期（task-workflow / ui-ux-feature-components / lessons-learned）
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-10A-D Phase 12 再確認（2026-03-04）
created_date: 2026-03-04
dependencies:
  [
    UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001,
    UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001,
  ]
```

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK10A-D-SUBAGENT-EXECUTION-LOG-GUARD-001                       |
| タスク名     | Phase 12 仕様書別SubAgent実行ログの必須化                               |
| 分類         | 改善                                                                    |
| 対象機能     | Phase 12 仕様同期（task-workflow / ui-ux-feature-components / lessons） |
| 優先度       | 中                                                                      |
| 見積もり規模 | 中規模                                                                  |
| ステータス   | 未実施                                                                  |
| 発見元       | TASK-10A-D Phase 12 再確認（苦戦箇所）                                  |
| 発見日       | 2026-03-04                                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-D の再確認では、仕様書を SubAgent 単位で分担したことで更新漏れは減ったが、どの仕様書で「実装内容」と「苦戦箇所」をどう反映したかを機械的に追跡する欄が不足していた。

### 1.2 問題点・課題

- 仕様書更新時に「実装内容だけ記録」「苦戦箇所だけ記録」が混在しやすい
- SubAgent 分担表はあるが、実行結果ログ（どの証跡で検証したか）が不足しやすい
- 再確認時に「反映済み」の根拠が口頭/断片ログ依存になりやすい

### 1.3 放置した場合の影響

- Phase 12 の再監査で説明コストが増加する
- 同種タスクで仕様書反映漏れが再発する
- 改善知見が `lessons-learned.md` に一貫形式で蓄積されない

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 の仕様同期において、仕様書ごとの SubAgent 実行ログ（実装内容/苦戦箇所/検証証跡）を必須化し、再監査可能な状態を標準化する。

### 2.2 最終ゴール

1. `spec-update-summary.md` に仕様書別SubAgent実行ログの必須テーブルが存在する
2. 各 SubAgent 行で「実装内容」「苦戦箇所」「検証証跡」の3要素が非空で記録される
3. `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` の3仕様書に同一ターンで反映される

### 2.3 スコープ

#### 含むもの

- SubAgent 実行ログの記録フォーマット定義
- Phase 12 テンプレートと完了条件への反映
- 3仕様書の同期手順（実装内容+苦戦箇所）

#### 含まないもの

- 新機能の実装変更（Renderer/Main/Preload）
- baseline 違反全件の一括解消

### 2.4 成果物

- SubAgent 実行ログ必須化ルール
- テンプレート更新差分（skill-creator）
- 仕様書反映差分（aiworkflow-requirements）
- 検証ログ（verify/validate/links/audit）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` と `skill-creator` の Phase 12 テンプレートを参照できる
- `aiworkflow-requirements` の正本更新手順（SKILL/LOGS/変更履歴）を実行できる
- 検証スクリプト（verify/validate/links/audit）を実行できる

### 3.2 依存タスク

- UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001
- UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
- `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 3.4 推奨アプローチ

1. 仕様書を1仕様書=1SubAgentで分担し、担当範囲を先に固定する
2. 各仕様書で「実装内容」と「苦戦箇所」を同時記録する
3. 検証値を確定してから実行ログテーブルに証跡列を埋める
4. 最後に `task-workflow` と `lessons` を同一ターンで同期する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                             | 発見経緯                                                | 解決策                                          | 教訓                                 |
| -------------------------------- | ------------------------------------------------------- | ----------------------------------------------- | ------------------------------------ |
| 仕様書分担後も反映根拠が散在     | TASK-10A-D 再確認で「更新済み」根拠が複数ファイルに分散 | SubAgentごとに実装内容/苦戦箇所/証跡を1表で固定 | 分担表だけでなく実行ログ表が必要     |
| 実装内容と苦戦箇所の片側記録漏れ | 仕様書によって記述粒度が不揃い                          | 両列必須（空欄は未完了）を完了条件化            | 再利用性は記録粒度の統一で担保される |
| 検証結果の紐付け不足             | verify/validate PASSでも、どの仕様書に反映したか曖昧    | SubAgent行に検証証跡列を追加して追跡可能化      | 「PASS」だけでなく「反映先」まで残す |

---

## 4. 実行手順

### Phase構成

- Phase A: 実行ログ要件定義
- Phase B: テンプレート更新
- Phase C: 仕様書反映
- Phase D: 監査・台帳同期

### Phase A: 実行ログ要件定義

#### 目的

SubAgent 実行ログの必須項目を確定する。

#### 手順

1. 実行ログの必須列（担当仕様書/実装内容/苦戦箇所/検証証跡）を定義
2. 空欄を未完了扱いにする判定ルールを定義
3. 記録対象仕様書を3仕様書へ固定

#### 成果物

- 実行ログ要件定義

#### 完了条件

- 必須列と判定ルールが明文化されている

### Phase B: テンプレート更新

#### 目的

次回以降の Phase 12 で実行ログを必須化する。

#### 手順

1. `phase12-system-spec-retrospective-template.md` に実行ログ欄を追加
2. `phase12-spec-sync-subagent-template.md` に実行ログ欄を追加
3. `phase-completion-checklist.md` と `resource-map.md` を同期

#### 成果物

- 更新済みテンプレート群

#### 完了条件

- テンプレートとチェックリストで同じ必須条件が参照できる

### Phase C: 仕様書反映

#### 目的

実装内容と苦戦箇所を正本仕様に同期する。

#### 手順

1. `task-workflow.md` に実行ログテーブルを追記
2. `ui-ux-feature-components.md` に反映ログを追記
3. `lessons-learned.md` に分担表と再利用手順を追記

#### 成果物

- 3仕様書更新差分

#### 完了条件

- 3仕様書すべてで実装内容+苦戦箇所が同時記録される

### Phase D: 監査・台帳同期

#### 目的

運用として再現可能な状態を確定する。

#### 手順

1. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` を実行
2. `audit-unassigned-tasks --json --diff-from HEAD` を実行
3. 結果を `task-workflow.md` と `lessons-learned.md` に同期

#### 成果物

- 検証ログ
- 台帳更新

#### 完了条件

- `currentViolations=0`、参照切れ0件を満たす

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SubAgent 実行ログの必須フォーマットが定義されている
- [ ] 3仕様書で実装内容+苦戦箇所が同時記録されている
- [ ] 検証証跡が仕様書単位で紐づいている

### 品質要件

- [ ] 実行ログの空欄がない（空欄は未完了扱い）
- [ ] `current`/`baseline` 分離判定が維持されている
- [ ] 再実行時に同じ監査結果が得られる

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題に登録されている
- [ ] `lessons-learned.md` に関連未タスクとして追記されている

---

## 6. 検証方法

### テストケース

- Case 1: 実行ログで「実装内容」列が空欄の場合に未完了判定になる
- Case 2: 実行ログで「苦戦箇所」列が空欄の場合に未完了判定になる
- Case 3: 3仕様書のうち1仕様書未更新時に差分監査で検出できる

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION --strict
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-d-subagent-execution-log-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                                  |
| ------------------------------ | ------ | -------- | ----------------------------------------------------- |
| 実行ログの記入負荷増加         | 中     | 中       | 必須列を最小4列に限定し、テンプレート化で記入を標準化 |
| 仕様書更新だけ進んでログ未記入 | 中     | 中       | 完了チェックでログ未記入を未完了扱いにする            |
| 検証結果の再現性不足           | 高     | 低       | 検証コマンドセットを固定し、証跡欄に必ず貼付する      |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
- `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/outputs/phase-12/documentation-changelog.md`
- `.claude/rules/06-known-pitfalls.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
仕様書ごとに分担して更新できているが、どの仕様書で実装内容と苦戦箇所をどう反映したかの実行ログが不足すると、再監査時の確認コストが高い。
```

### 補足事項

- 本タスクは「記録運用の標準化」を対象とし、既存機能の挙動変更は対象外とする。
