# TASK-IMP-AIWORKFLOW-GENERATED-INDEX-METRIC-SYNC-GUARD-001: generated index 実測値同期ガード

## メタ情報

| 項目         | 内容                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| タスクID     | TASK-IMP-AIWORKFLOW-GENERATED-INDEX-METRIC-SYNC-GUARD-001                                                                |
| タスク名     | generated index 実測値同期ガード                                                                                         |
| 分類         | 改善                                                                                                                     |
| 対象機能     | `aiworkflow-requirements` の generated index (`topic-map.md` / `keywords.json`) と system spec / workflow outputs の同期 |
| 優先度       | 中                                                                                                                       |
| 見積もり規模 | 小規模                                                                                                                   |
| ステータス   | 未実施                                                                                                                   |
| 発見元       | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 final sync（2026-03-13）                                         |
| 発見日       | 2026-03-13                                                                                                               |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001` の close-out では、`generate-index.js` 再実行後の `topic-map.md` 実測値を system spec 側へ反映した。
その過程で、workflow 正本追加後の再生成により `topic-map.md` 行数が `3504 -> 3520` のように変動し、先に記録した literal 値が stale になる問題が露出した。

### 1.2 問題点

- generated artifact の実測値を system spec や未タスク仕様書へ literal で転記すると、後続の `generate-index.js` 実行で簡単にズレる。
- `generated-index-sharding` の未タスクは generator 側の恒久対応が責務であり、「実測値の同期漏れ」は別責務のため吸収できない。
- `manual docs PASS` と `generated blocker 継続` を分けて監査していても、記録値同期の guard がないと `SKILL.md` / `task-workflow` / workflow spec に stale state が残る。

### 1.3 放置した場合の影響

- blocked dependency の現況が仕様書ごとに食い違い、次回の line budget reform や re-audit で誤判定が起きる。
- `topic-map.md` の oversized 問題が「未解決」なのか「記録だけ stale」なのか判別しづらくなる。
- 同種課題で `generate-index.js` 実行後に何を再同期すべきかが明文化されず、手戻りが増える。

## 2. 何を達成するか（What）

### 2.1 目的

generated index 再生成後に変動する実測値を、workflow outputs・system spec・未タスク仕様書へ一貫して同期する guard を定義し、stale metric を残さない運用にする。

### 2.2 最終ゴール

- `topic-map.md` の実測値を参照している current system spec / current unassigned task を棚卸しできる。
- 「literal 値で保持する箇所」と「範囲・条件で保持する箇所」を区別した標準ルールが定義される。
- 必要なら同期確認スクリプトまたは grep ベース検証コマンドを追加し、Phase 12 close-out で再利用できる。

### 2.3 スコープ

#### 含むもの

- `aiworkflow-requirements` current system spec にある generated metric 参照箇所の棚卸し
- `docs/30-workflows/unassigned-task/` 配下の current unassigned task にある generated metric 参照箇所の棚卸し
- `task-workflow-backlog.md` / `workflow-aiworkflow-requirements-line-budget-reform.md` / `lessons-learned-workflow-quality-line-budget-reform.md` への標準ルール反映
- 必要に応じた検証コマンド、簡易 guard script、または template/checklist 更新

#### 含まないもの

- `generate-index.js` の shard 化そのもの
- `topic-map.md` の 500行超問題自体の恒久解消
- historical workflow outputs 全件の retroactive rewrite

### 2.4 成果物

- `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/unassigned-task/task-imp-aiworkflow-generated-index-metric-sync-guard-001.md`
- current system spec への同期結果
- 必要なら `aiworkflow-requirements/scripts/` または `task-specification-creator/references/` の guard 追加
- 完了時の検証記録

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001` の workflow と system spec が読める
- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を再実行できる
- `.claude` を canonical、`.agents` を mirror として扱う

### 3.2 依存タスク

- `TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001`
- `TASK-IMP-AIWORKFLOW-REQUIREMENTS-GENERATED-INDEX-SHARDING-001`

### 3.3 必要な知識

- `aiworkflow-requirements` の line budget reform / generated index 運用
- `task-specification-creator` の Phase 12 close-out と未タスク formalize ルール
- `current` / `baseline`、`manual docs` / `generated artifact` の監査分離

### 3.4 推奨アプローチ

SubAgent 分担で進める。

| SubAgent   | 関心ごと           | 主担当                                                                           |
| ---------- | ------------------ | -------------------------------------------------------------------------------- |
| SubAgent-A | metric inventory   | `topic-map.md` の実測値を参照している current docs を棚卸しする                  |
| SubAgent-B | rule design        | literal / range / dated snapshot のどれで保持するかを仕様化する                  |
| SubAgent-C | validation guard   | `generate-index.js` 後に回す検証コマンドや script を定義する                     |
| SubAgent-D | system spec sync   | `task-workflow-backlog` / workflow spec / lessons / 必要なら template を同期する |
| Lead       | canonical + mirror | `.claude` 正本更新、`.agents` mirror sync、最終検証を行う                        |

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                        | 発見経緯                                                                                           | 解決策                                                                                    | 教訓                                                        |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| generated metric を literal で転記すると再生成後に stale になる             | workflow 正本追加後の `generate-index.js` 再実行で `topic-map.md` 行数が `3504 -> 3520` へ変動した | literal を current state として固定する箇所を減らし、必要箇所は再計測手順と一緒に記録する | generated metric は「値」より「再計測ルール」を正本化する   |
| manual docs と generated artifact を同じ close-out 表現で扱うと判定がぶれる | line budget reform 完了後も generated blocker だけ継続していた                                     | `manual docs PASS` と `generated blocker 継続` を分離して書く                             | 同じ `line budget` でも監査レイヤーを混ぜない               |
| documentation shell 補完後の final sync で stale state が残りやすい         | outputs を直した後に `task-workflow` / `SKILL` / `LOGS` の値が旧実測のまま残った                   | close-out 前に metric 参照箇所を `rg` で洗い、再生成後に一括確認する                      | Phase 12 final sync では metric grep を標準チェックへ入れる |

## 4. 実行手順

### Phase構成

3 Phase で進める。

### Phase 1: metric 参照箇所を棚卸しする

#### 目的

generated index の実測値を current docs のどこに保持しているかを特定する。

#### 手順

1. `rg` で `topic-map.md` と行数 literal を current system spec / current unassigned tasks から検索する。
2. historical workflow outputs と current system spec を分離する。
3. 修正対象を `current docs` のみに限定した inventory を作る。

#### 成果物

- metric 参照 inventory

#### 完了条件

- current docs の修正対象一覧が完成している

### Phase 2: 同期ルールと guard を決める

#### 目的

どの箇所を literal、どの箇所を range / dated snapshot / recompute rule にするかを決める。

#### 手順

1. workflow spec、task-workflow、lessons での記録粒度を決める。
2. `generate-index.js` 後に回す検証コマンドまたは script を決める。
3. 必要なら `task-specification-creator` の Phase 12 checklist / validation matrix へ guard を反映する。

#### 成果物

- 同期ルール
- 検証コマンドまたは guard script

#### 完了条件

- 同期ルールと検証手順が 1 回の close-out で実行できる形になっている

### Phase 3: system spec と未タスクを同期する

#### 目的

current docs へ guard を反映し、再利用可能な状態にする。

#### 手順

1. `aiworkflow-requirements` current system spec を更新する。
2. 必要なら未タスク仕様書や template を更新する。
3. `generate-index.js`、mirror sync、関連 validator を実行する。

#### 成果物

- 更新済み system spec
- 検証結果

#### 完了条件

- stale metric を残さず、同種課題向けの再利用手順が docs に固定されている

## 5. 完了条件チェックリスト

### 機能要件

- [ ] generated metric を参照する current docs の inventory がある
- [ ] literal / range / recompute rule の使い分けが定義されている
- [ ] 必要なら同期 guard の script またはコマンドが追加されている

### 品質要件

- [ ] `generate-index.js` 後の current docs に stale metric が残っていない
- [ ] `manual docs` と `generated artifact` の判定が分離されている
- [ ] `.claude` / `.agents` mirror parity が維持されている

### ドキュメント要件

- [ ] `task-workflow-backlog.md` に本未タスクが登録されている
- [ ] 関連 workflow spec に本未タスクが登録されている
- [ ] 苦戦箇所と短手順が system spec 側へ反映されている

## 6. 検証方法

```bash
rg -n "topic-map\\.md|3504|3520|3,500行超|500行超" \
  .claude/skills/aiworkflow-requirements \
  docs/30-workflows/unassigned-task

node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
wc -l .claude/skills/aiworkflow-requirements/indexes/topic-map.md
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source .claude/skills/aiworkflow-requirements/references/task-workflow.md

test -f docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/unassigned-task/task-imp-aiworkflow-generated-index-metric-sync-guard-001.md
rg -n "TASK-IMP-AIWORKFLOW-GENERATED-INDEX-METRIC-SYNC-GUARD-001" \
  .claude/skills/aiworkflow-requirements \
  docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform \
  docs/30-workflows/unassigned-task
```

## 7. リスクと対策

| リスク                                                        | 影響度 | 発生確率 | 対策                                                                          |
| ------------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------- |
| historical workflow outputs まで current 値へ書き換えてしまう | 中     | 中       | `current docs` と `historical outputs` を inventory 段階で分離する            |
| guard が broad すぎて通常の履歴記述まで誤検知する             | 中     | 中       | `topic-map.md` の current state 記録箇所だけに対象を絞る                      |
| sharding task と metric sync task の責務が再び混線する        | 高     | 低       | `generator-aware sharding` は別タスク、本タスクは `記録値同期` だけに限定する |

## 8. 参照情報

- [workflow-aiworkflow-requirements-line-budget-reform.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260312-162304-201123451/.claude/skills/aiworkflow-requirements/references/workflow-aiworkflow-requirements-line-budget-reform.md)
- [spec-splitting-guidelines.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260312-162304-201123451/.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md)
- [phase-12-documentation-retrospective.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260312-162304-201123451/.claude/skills/aiworkflow-requirements/references/phase-12-documentation-retrospective.md)
- [task-workflow-backlog.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260312-162304-201123451/.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md)
- [unassigned-task-guidelines.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260312-162304-201123451/.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md)
- [unassigned-task-template.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260312-162304-201123451/.claude/skills/task-specification-creator/assets/unassigned-task-template.md)

## 9. 備考

- 既存の `TASK-IMP-AIWORKFLOW-REQUIREMENTS-GENERATED-INDEX-SHARDING-001` は generator 側の恒久対応であり、本タスクは system spec / workflow outputs 側の metric 同期 guard である。
- 再発時は literal 値を増やすより、`generate-index.js` 後に何を再計測するかを先に固定する。
