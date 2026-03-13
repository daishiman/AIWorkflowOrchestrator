# TASK-IMP-AIWORKFLOW-SAME-WAVE-SYNC-GUARD-001: aiworkflow same-wave sync guard

## メタ情報

```yaml
issue_number: 1204
task_id: TASK-IMP-AIWORKFLOW-SAME-WAVE-SYNC-GUARD-001
task_name: aiworkflow same-wave sync guard
category: 改善
target_feature: aiworkflow-requirements の current canonical set / artifact inventory / legacy register / parent docs / ledger / mirror sync の同一 wave 同期
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 same-wave sync review
created_date: 2026-03-13
related_tasks:
  - TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001
  - TASK-IMP-AIWORKFLOW-REQUIREMENTS-GENERATED-INDEX-SHARDING-001
  - TASK-IMP-AIWORKFLOW-GENERATED-INDEX-METRIC-SYNC-GUARD-001
  - UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001
spec_path: docs/30-workflows/unassigned-task/task-imp-aiworkflow-same-wave-sync-guard-001.md
```

| 項目         | 内容                                                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-IMP-AIWORKFLOW-SAME-WAVE-SYNC-GUARD-001                                                                                                    |
| タスク名     | aiworkflow same-wave sync guard                                                                                                                 |
| 分類         | 改善                                                                                                                                            |
| 対象機能     | `aiworkflow-requirements` の current canonical set / artifact inventory / legacy register / parent docs / ledger / mirror sync の同一 wave 同期 |
| 優先度       | 中                                                                                                                                              |
| 見積もり規模 | 中規模                                                                                                                                          |
| ステータス   | 未実施                                                                                                                                          |
| 発見元       | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 same-wave sync review                                                                   |
| 発見日       | 2026-03-13                                                                                                                                      |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001` では、family split、semantic rename、current canonical set、artifact inventory、legacy register、entrypoint、generated index、mirror parity まで整えた。しかし実際の作業では、「rename 自体は終わっているのに `quick-reference` や `spec-splitting-guidelines` の文言が stale のまま残る」「backlog は更新したが completed record 側の follow-up が古い」といった same-wave drift が複数回発生した。

### 1.2 問題点・課題

- `aiworkflow-requirements` は current canonical set、artifact inventory、legacy register、parent docs、`task-workflow`、`lessons-learned`、`LOGS`、generated index、mirror が分離されており、どれか 1 つだけ更新しても全体整合は閉じない。
- 既存の `TASK-IMP-AIWORKFLOW-GENERATED-INDEX-METRIC-SYNC-GUARD-001` は generated metric の stale sync を扱うが、manual canonical docs の same-wave closure までは責務に含まない。
- 既存の `UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001` は 3 点同期の基盤だったが、line budget reform 後の split architecture と `legacy-ordinal-family-register.md` / `workflow-aiworkflow-requirements-line-budget-reform-artifact-inventory.md` / `spec-elegance-consistency-audit.md` まではカバーしていない。
- 現在の skill は checklist とユーザー依頼テンプレートを持つが、「今回追加・更新したファイルから same-wave 対象を機械的に洗い出す guard」はまだない。

### 1.3 放置した場合の影響

- 今後 `aiworkflow-requirements` に新規 file、rename、follow-up が追加されたとき、引用用資料と parent docs の説明がずれ、ユーザーが current 正本を特定しにくくなる。
- `同じ粒度で量産できる skill` という説明が、運用者の記憶頼みになる。
- actual rename 済みなのに旧 filename 由来の説明が残る、または current canonical set へ新ファイルが出てこない、という drift が再発する。

## 2. 何を達成するか（What）

### 2.1 目的

`aiworkflow-requirements` に変更を入れたとき、manual canonical docs・generated artifact・mirror の更新境界を分離しつつ、same-wave で閉じるための guard と実行手順を固定する。

### 2.2 最終ゴール

1. `aiworkflow-requirements` の変更時に必ず同期すべき対象が、`current canonical set` / `inventory` / `register` / `parent docs` / `ledger` / `generated index` / `mirror` の観点で定義されている。
2. 新規追加・rename・follow-up formalize の 3 パターンで、same-wave 対象の抜け漏れを機械的に検出できる。
3. `task-specification-creator` と `aiworkflow-requirements` の両方から、同じ依頼文と検証順序で再利用できる。
4. current `references/` の semantic filename 運用、legacy register、current canonical set の責務差が明文化される。

### 2.3 スコープ

#### 含むもの

- `aiworkflow-requirements` 変更時の same-wave sync 対象一覧の定義
- `resource-map.md` current canonical set、`quick-reference.md`、artifact inventory、legacy register、parent docs、`task-workflow*`、`lessons-learned*`、`LOGS.md` の更新順序
- `generate-index.js` / `validate-structure.js` / `verify-unassigned-links.js` / `audit-unassigned-tasks.js` / `diff -qr` の検証順序
- 必要なら grep ベースまたは script ベースの same-wave guard
- 旧 filename を含む変更で `legacy-ordinal-family-register.md` を更新すべき条件の定義

#### 含まないもの

- `generate-index.js` の sharding 実装そのもの
- `topic-map.md` の oversized 問題そのものの解消
- historical workflow outputs の全面 rewrite
- `aiworkflow-requirements` 以外の skill すべてに対する横展開

### 2.4 成果物

- 本未タスク指示書
- `aiworkflow-requirements` same-wave sync guard の運用ルール
- 必要なら `aiworkflow-requirements/scripts/` または `task-specification-creator/references/` の guard 追加
- `task-workflow-backlog.md` / workflow 正本 / lessons / completed record / `LOGS.md` の同期差分

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001` の current state が読めること
- `.claude/skills/aiworkflow-requirements/` を canonical root、`.agents/skills/aiworkflow-requirements/` を mirror として扱えること
- `generate-index.js`、`validate-structure.js`、`verify-unassigned-links.js`、`audit-unassigned-tasks.js`、`diff -qr` が実行できること

### 3.2 依存タスク

- `TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001`
- `TASK-IMP-AIWORKFLOW-REQUIREMENTS-GENERATED-INDEX-SHARDING-001`
- `TASK-IMP-AIWORKFLOW-GENERATED-INDEX-METRIC-SYNC-GUARD-001`
- completed baseline として `UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001`

### 3.3 必要な知識

- `aiworkflow-requirements` の current canonical set / artifact inventory / legacy register の責務差
- `task-specification-creator` の unassigned-task ガイドライン
- `manual docs` / `generated artifact` / `mirror` の三層判定
- semantic filename と legacy filename 対応の扱い

### 3.4 推奨アプローチ

1. まず `same-wave` の対象面を固定し、manual canonical docs と generated artifact を分離する。
2. `resource-map` / `quick-reference` / `workflow-*` / `task-workflow*` / `lessons-learned*` / `LOGS.md` のうち、どれが current 変更に連動するかを inventory 化する。
3. rename がある場合は `legacy-ordinal-family-register.md` の old -> current 対応更新を先に決める。
4. 編集後は `generate-index.js` と `validate-structure.js` を実行し、最後に `.agents` mirror と `diff -qr` で閉じる。
5. docs-only で解けない場合は、generated / automation の follow-up として別未タスクへ切り出す。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                                   | 発見経緯                                                                                                                     | 解決策                                                                           | 教訓                                                                              |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| actual rename 済みでも entrypoint wording が stale のまま残った                        | `references/` の actual semantic rename 完了後も `quick-reference.md` と `spec-splitting-guidelines.md` に移行前表現が残った | rename 完了後に `rg` で旧表現を横断監査し、current state wording へ一括補正した  | rename 完了だけでは不十分で、entrypoint wording まで same-wave で閉じる必要がある |
| current canonical set を更新しても parent docs / completed record が古いまま残りやすい | `resource-map` は更新されているのに `task-workflow-completed-*` の follow-up 節が旧状態のまま残った                          | backlog、workflow 正本、completed record を同一 wave で同期した                  | `current canonical set` は入口、ledger は別責務なので両方を閉じる                 |
| `.claude` と `.agents` を並列に触ると drift しやすい                                   | rename と wording 修正の途中で mirror まで同時に見始めると、どちらが正本か曖昧になった                                       | `.claude` のみ編集し、最後に `rsync` + `diff -qr` を固定した                     | canonical と mirror は同時編集しない                                              |
| generated index と manual docs を同じ「同期漏れ」として扱うと責務が混線する            | `topic-map.md` metric stale と `resource-map` / `inventory` stale を同列に扱うと、どこを直すべきか曖昧になった               | generated metric は別未タスク、manual same-wave drift は別未タスクとして分離した | generated guard と manual same-wave guard は分けて扱う                            |

### 3.6 SubAgent 分担

| SubAgent   | 関心ごと                   | 主担当成果物                                                              |
| ---------- | -------------------------- | ------------------------------------------------------------------------- |
| SubAgent-A | same-wave target inventory | current canonical set / inventory / register / parent docs の同期対象一覧 |
| SubAgent-B | rule design                | 変更種別（新規追加 / rename / follow-up）ごとの更新境界と順序             |
| SubAgent-C | validation guard           | grep / script / validator / mirror parity の検証手順                      |
| SubAgent-D | ledger sync                | `task-workflow-backlog.md` / completed record / lessons / `LOGS.md`       |
| Lead       | canonical closure          | `.claude` 編集、`.agents` mirror、最終 diff と未タスク監査                |

## 4. 実行手順

### Phase構成

- Phase A: same-wave target inventory 定義
- Phase B: guard 設計
- Phase C: system spec / template 同期
- Phase D: 検証と mirror closure

### Phase A: same-wave target inventory 定義

#### 目的

変更種別ごとに、どのファイル群を same-wave で更新すべきかを固定する。

#### 手順

1. 新規追加、rename、follow-up formalize の 3 パターンを分ける。
2. `resource-map`、`quick-reference`、inventory、register、workflow 正本、`task-workflow*`、`lessons-learned*`、`LOGS.md` の更新要否を表にする。
3. generated artifact と mirror を別列で管理する。

#### 成果物

- same-wave target matrix

#### 完了条件

- 3 パターンそれぞれで更新対象が一意に定義されている

### Phase B: guard 設計

#### 目的

same-wave drift を機械的に見つける方法を決める。

#### 手順

1. `rg` ベースで確認できるキーワード、task id、旧 filename、current canonical set の整合チェックを定義する。
2. 必要なら `aiworkflow-requirements/scripts/` か `task-specification-creator/references/` に guard を追加する。
3. `manual docs` / `generated artifact` / `mirror` の検証順序を固定する。

#### 成果物

- same-wave guard checklist または script

#### 完了条件

- drift 検出の実行手順が 1 回の close-out で再利用できる

### Phase C: system spec / template 同期

#### 目的

決めたルールを skill 入口と未タスク運用へ反映する。

#### 手順

1. `spec-elegance-consistency-audit.md`、`quick-reference.md`、必要なら `SKILL.md` に rule を反映する。
2. `task-workflow-backlog.md`、workflow 正本、completed record、`lessons-learned*`、`LOGS.md` を同期する。
3. `task-specification-creator` 側で必要な checklist / guideline / template 更新がある場合は同一 wave で反映する。

#### 成果物

- 同期済み system spec
- 必要なら更新済み template / guideline

#### 完了条件

- entrypoint、ledger、lessons、log の説明が同じルールを示している

### Phase D: 検証と mirror closure

#### 目的

same-wave 更新が実際に閉じていることを機械的に確認する。

#### 手順

1. `generate-index.js` と `validate-structure.js` を実行する。
2. `verify-unassigned-links.js` と `audit-unassigned-tasks.js --json --diff-from HEAD --target-file ...` を実行する。
3. `.agents` へ mirror sync し、`diff -qr` 差分 0 を確認する。

#### 成果物

- validator 結果
- mirror parity 記録

#### 完了条件

- validator と parity が通り、same-wave drift を残していない

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 新規追加 / rename / follow-up formalize の 3 パターンで same-wave target matrix が定義されている
- [ ] current canonical set、artifact inventory、legacy register、parent docs、ledger の更新条件が明文化されている
- [ ] same-wave drift を検出する checklist または script がある
- [ ] rename 時に `legacy-ordinal-family-register.md` を更新すべき条件が定義されている

### 品質要件

- [ ] `generate-index.js` 実行後に current docs の stale wording / stale route が残っていない
- [ ] `manual docs` / `generated artifact` / `mirror` の判定が分離されている
- [ ] `.claude` / `.agents` の parity が維持される
- [ ] active ordinal files が current `references/` で再増殖しない

### ドキュメント要件

- [ ] 本未タスクが `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow-backlog.md` に本未タスクが登録されている
- [ ] workflow 正本 / completed record / lessons / `LOGS.md` に follow-up が反映されている
- [ ] `task-specification-creator` または `aiworkflow-requirements` の入口から再利用手順を辿れる

## 6. 検証方法

### テストケース

1. 新規追加時に current canonical set と inventory へ同じファイルが出る
2. rename 時に old filename が register 以外へ残らない
3. follow-up formalize 時に backlog / workflow 正本 / completed record / lessons / log の 5 点が同期される
4. `generate-index.js` 再生成後に topic map / keywords と manual docs の説明が矛盾しない

### 検証手順

```bash
rg -n "TASK-IMP-AIWORKFLOW-SAME-WAVE-SYNC-GUARD-001|current canonical set|artifact inventory|legacy-ordinal-family-register|same-wave|同一 wave" \
  .claude/skills/aiworkflow-requirements \
  .claude/skills/task-specification-creator \
  docs/30-workflows/unassigned-task

node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js .claude/skills/aiworkflow-requirements

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source .claude/skills/aiworkflow-requirements/references/task-workflow.md

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/task-imp-aiworkflow-same-wave-sync-guard-001.md

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD

python3 - <<'PY'
from pathlib import Path
import re
root = Path('.claude/skills/aiworkflow-requirements/references')
ordinal = sorted(p.name for p in root.glob('*.md') if re.search(r'-(?:[a-z]|[1-9][0-9]*)\\.md$', p.name))
print({'active_ordinal_files': len(ordinal)})
PY

diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
```

## 7. リスクと対策

| リスク                                                                | 影響度 | 発生確率 | 対策                                                                                       |
| --------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------ |
| guard が broad すぎて historical snapshot まで current 化しようとする | 中     | 中       | current docs と historical outputs を inventory 段階で分離する                             |
| generated metric task と same-wave sync task の責務が再び混線する     | 高     | 中       | generated metric は別タスク、本タスクは manual canonical docs と ledger closure に限定する |
| 変更種別ごとの matrix が粗く、実運用で例外が増える                    | 中     | 中       | 新規追加 / rename / follow-up formalize の 3 類型から始め、例外は backlog で段階拡張する   |
| mirror sync を途中で回して canonical state が不明瞭になる             | 高     | 低       | `.claude` 編集完了後にのみ `rsync` と `diff -qr` を実行する                                |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/workflow-aiworkflow-requirements-line-budget-reform.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-aiworkflow-requirements-line-budget-reform-artifact-inventory.md`
- `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`
- `.claude/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md`
- `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-workflow-quality-line-budget-reform.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`

### 参考資料

- `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/unassigned-task/task-imp-aiworkflow-generated-index-metric-sync-guard-001.md`
- `docs/30-workflows/unassigned-task/task-imp-aiworkflow-requirements-generated-index-sharding-001.md`
- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
- `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
これらを量産できるようにスキルに反映されているか確認し、今後ユーザーがどう指示すれば同じ動きを再現できるかまで整備したい。
ただし current canonical set / inventory / register / parent docs / ledger / mirror の same-wave sync が人手依存のままだと再発する。
```

### 補足事項

本タスクは `aiworkflow-requirements` の same-wave closure を guard 化するためのものであり、generated index sharding や metric stale sync の代替ではない。既存の follow-up と責務を分離したうえで、manual canonical docs 側の drift を防ぐことに限定する。
