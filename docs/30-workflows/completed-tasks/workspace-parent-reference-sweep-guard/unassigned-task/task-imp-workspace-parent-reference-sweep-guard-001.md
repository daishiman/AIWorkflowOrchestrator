# UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001: Workspace parent reference sweep ガード

## メタ情報

```yaml
issue_number: 1173
task_id: UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001
task_name: Workspace parent reference sweep ガード
category: 改善
target_feature: docs-only parent workflow / completed-task migration / pointer docs / interfaces / capture script / legacy index
priority: 中
scale: 中規模
status: 実行済み（workflow phase12_completed）
source_phase: TASK-UI-04-WORKSPACE-VIEW Phase 12 follow-up
created_date: 2026-03-12
dependencies:
  - TASK-UI-04-WORKSPACE-VIEW
  - UT-IMP-PHASE12-DUAL-SKILL-ROOT-MIRROR-SYNC-GUARD-001
spec_path: docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/unassigned-task/task-imp-workspace-parent-reference-sweep-guard-001.md
```

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| 優先度     | 中                                     |
| 規模       | 中規模                                 |
| ステータス | 実行済み（workflow phase12_completed） |

## 実行結果

- 実装 workflow: `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/`
- 完了範囲: Phase 1-12 completed / Phase 13 未実施
- 主要結果: `task-060` parent pointer、completed-task pointer docs、`task-090`、`interfaces-*`、capture root、mirror drift を同期済み

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-04-WORKSPACE-VIEW は parent pointer doc と child workflow 群を束ねる docs-only parent workflow である。現状の repo では parent root が [task-060-ui-04-workspace-view.md](../../../skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-060-ui-04-workspace-view.md) にあり、child 04A / 04B / 04C は `docs/30-workflows/completed-tasks/` 配下へ移管されている。今回の再監査では parent pointer だけ直しても、completed-task pointer docs、legacy index、interface spec、capture script、`.claude` / `.agents` mirror に旧 path と旧 status が散在していることが分かった。

### 1.2 問題点・課題

- parent root の補正対象が file-by-file で決まり、sweep 範囲が毎回ぶれる
- primary workflow だけ直すと `interfaces-llm.md` / `interfaces-chat-history.md` / `apps/desktop/scripts` の stale path を再発させる
- `.claude` 正本更新後に `.agents` mirror sync を忘れると、仕様検索結果と task 実体の参照先が二重化する
- `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` に苦戦箇所を残しても、sweep 手順を自動検知する guard がない

### 1.3 放置した場合の影響

- completed-task 移管のたびに pointer docs、legacy index、interface evidence path、capture script root の再監査を手作業でやり直すことになる
- system spec は正しくても補助導線だけ stale という状態が残り、Phase 11 / 12 validator では検出しきれない drift が増える
- docs-only parent workflow の再利用価値が下がり、次回も sweep 対象の調査からやり直しになる

---

## 2. 何を達成するか（What）

### 2.1 目的

docs-only parent workflow の completed-task 移管後に必要な sweep 対象を manifest / validator / system spec rule として固定し、pointer 系 stale path と mirror drift を短時間で閉じられるようにする。

### 2.2 最終ゴール

1. parent workflow 向け sweep 対象が `pointer / master index / completed-task pointer docs / legacy index / interfaces-* / capture script / mirror root` の 1 セットとして定義される
2. old path / status drift を grep と diff で検出できる validator か監査スクリプトが追加される
3. `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` から同じ未タスク ID へ辿れる
4. task-060 parent pointer と child workflow follow-up の関係が仕様上で一意に説明される

### 2.3 スコープ

#### 含むもの

- docs-only parent workflow の sweep manifest 作成
- pointer docs / master index / completed-task pointer docs / legacy index / interfaces-\* / capture script / mirror root の監査手順標準化
- stale path / status drift を検出する grep ルールまたはスクリプト追加
- `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` / `LOGS.md` への関連未タスク同期
- task-060 parent pointer と child workflow の follow-up 証跡の再同期方針整理

#### 含まないもの

- child workflow 04A / 04B / 04C の UI 実装変更
- current build screenshot source pinning 自体の改修
- representative screenshot policy の詳細設計
- `.agents` を canonical root に戻す運用変更

### 2.4 成果物

- 本未タスク指示書
- docs-only parent workflow sweep manifest / validator 案
- 更新済み workflow task spec
- 更新済み system spec 反映計画
- stale path / mirror sync の検証ログ計画

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [task-060-ui-04-workspace-view.md](../../../skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-060-ui-04-workspace-view.md) の parent pointer doc と child 04A / 04B / 04C completed workflow が存在する
- `.claude/skills/aiworkflow-requirements/` を canonical root として編集できる
- `rg`、`diff -qr`、`verify-unassigned-links.js`、`audit-unassigned-tasks.js` を実行できる

### 3.2 依存タスク

- `TASK-UI-04-WORKSPACE-VIEW`
- `UT-IMP-PHASE12-DUAL-SKILL-ROOT-MIRROR-SYNC-GUARD-001`

### 3.3 必要な知識

- parent / child workflow の canonical path 運用
- `task-000-master-index.md`、completed-task pointer docs、legacy index の役割
- `interfaces-llm.md` / `interfaces-chat-history.md` の evidence path 構造
- `apps/desktop/scripts/capture-*.mjs` の workflow root 参照パターン

### 3.4 推奨アプローチ

1. sweep 対象を静的 manifest として確定し、監査範囲を固定する
2. stale path 検出と mirror sync 検出を別 concern として切り分ける
3. docs-only parent workflow の related UT は parent feature spec、台帳、教訓の 3 箇所へ同時登録する
4. task-060 pointer doc と child workflow の path 関係は Phase 1 で明文化し、Phase 2 以降はその契約から外れない

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                                                      | 発見経緯                                                                                | 解決策                                                                                              | 教訓                                                                        |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| parent pointer / master index だけ直しても completed-task pointer docs と legacy index に旧 path が残った | task-060 再監査で root 入口は直っているのに補助導線に stale path が残存した             | pointer doc、master index、completed-task pointer docs、legacy index を同一 sweep で補正する        | docs-only parent workflow は入口導線を 1 セットで閉じる                     |
| primary workflow だけ直して sibling interface spec / capture script を見落とした                          | `interfaces-llm.md` / `interfaces-chat-history.md` と capture script に旧 root が残った | `.claude` / `.agents` / `apps/desktop/scripts` / completed-task pointer docs を `rg` で横断監査する | completed 移管後は interface spec と capture script まで sweep 範囲に含める |
| `.claude` 更新後に `.agents` mirror が stale になりやすかった                                             | canonical root 補正後に mirror sync を完了条件へ含めていなかった                        | `diff -qr` を実行し、差分なしを記録する                                                             | dual-root repository では mirror sync を validator 扱いにする               |

### 3.6 SubAgent 分担

| SubAgent   | 関心ごと                              | 主担当成果物                                                   |
| ---------- | ------------------------------------- | -------------------------------------------------------------- |
| SubAgent-A | pointer / master / legacy inventory   | sweep manifest、監査対象一覧                                   |
| SubAgent-B | interfaces / capture script drift     | stale path grep ルール、対象 spec 更新方針                     |
| SubAgent-C | mirror sync / validator               | `diff -qr` 運用、drift 検出手順                                |
| SubAgent-D | task-060 follow-up / system spec sync | workflow task spec、task-workflow、feature spec、lessons、LOGS |

---

## 4. 実行手順

### Phase構成

- Phase A: sweep manifest の固定
- Phase B: stale path / mirror drift guard の設計
- Phase C: system spec と workflow outputs の同期設計
- Phase D: validator 実行計画と再現性確認

### Phase A: sweep manifest の固定

#### 目的

docs-only parent workflow で監査すべきファイル種別と探索範囲を一意にする。

#### 手順

1. parent pointer doc、child workflow、pointer docs、legacy index、interfaces、capture script、mirror root を列挙する
2. 各対象について `path drift` / `status drift` / `mirror drift` のどれを監査するか表にする
3. `task-workflow` と feature spec の関連未タスク導線を決める

#### 成果物

- sweep manifest
- 対象分類テーブル

#### 完了条件

- sweep 対象の漏れがない

### Phase B: stale path / mirror drift guard の設計

#### 目的

手動 grep に依存しすぎない検出手順を整備する。

#### 手順

1. old path を検出する `rg` パターンか validator スクリプトを設計する
2. status drift 用に `pending` / `completed` のチェック対象を定義する
3. `.claude` / `.agents` の mirror drift は `diff -qr` で fail-fast できるようにする

#### 成果物

- stale path / status / mirror drift guard

#### 完了条件

- task-060 と同種の docs-only parent workflow で同じ検出手順を再利用できる

### Phase C: system spec と workflow outputs の同期設計

#### 目的

未タスク ID を台帳・feature spec・教訓・workflow outputs へ同時反映する。

#### 手順

1. `task-workflow.md` に parent workflow の関連未タスクを追加する計画を作る
2. `ui-ux-feature-components.md` と `lessons-learned.md` に同 ID の導線と苦戦箇所を追記する計画を作る
3. task-060 parent pointer と child workflow follow-up の関係を 1 枚の説明へ集約する
4. `generate-index.js` の再生成条件を明文化する

#### 成果物

- 更新計画つき system spec 一覧
- task-060 follow-up 整合メモ

#### 完了条件

- parent pointer / child workflow / system spec の参照先が一意に説明できる

### Phase D: validator 実行計画と再現性確認

#### 目的

追加する guard が current diff と legacy baseline を分離して扱えることを確認する。

#### 手順

1. `verify-unassigned-links.js` の実行順を決める
2. `audit-unassigned-tasks.js --json --diff-from HEAD --target-file ...` の実行条件を決める
3. stale path grep、`diff -qr`、workflow validator の実行順を確定する
4. 実行結果を task spec / `task-workflow.md` / `LOGS.md` に転記する手順を固定する

#### 成果物

- validator 実行シーケンス
- current / baseline 分離ルール

#### 完了条件

- current diff が 0 violation で閉じる判定手順が明文化されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] docs-only parent workflow の sweep manifest が定義されている
- [ ] pointer / legacy / interfaces / capture script / mirror の drift 検出手順が固定されている
- [ ] `task-workflow.md` と `ui-ux-feature-components.md` と `lessons-learned.md` から同じ未タスク ID へ辿れる

### 品質要件

- [ ] `verify-unassigned-links.js` が PASS する
- [ ] `audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/unassigned-task/task-imp-workspace-parent-reference-sweep-guard-001.md` で `currentViolations.total = 0`
- [ ] stale path grep の対象が pointer docs / legacy index / interfaces / capture script / mirror root まで含まれている
- [ ] `.claude` / `.agents` の `diff -qr` 結果が記録されている

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] workflow task spec が `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/` に存在する
- [ ] task-060 parent pointer と child workflow の参照関係が task spec で説明されている

---

## 6. 検証方法

### テストケース

- Case 1: old path grep が pointer docs / legacy index / interfaces / capture script の全対象に当たる
- Case 2: `.claude` 側のみ更新した場合に `diff -qr` が drift を検知する
- Case 3: task spec が `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` の同期対象を列挙している
- Case 4: 本未タスク指示書が unassigned-task 監査で `currentViolations=0` になる

### 検証手順

```bash
rg -n "docs/30-workflows/task-058b-ui-04a-workspace-layout-filebrowser/|docs/30-workflows/task-059a-ui-04b-workspace-chat-panel/|docs/30-workflows/task-059b-ui-04c-workspace-preview-quicksearch/" \
  .claude/skills/aiworkflow-requirements/references/interfaces-llm.md \
  .claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md \
  apps/desktop/scripts/capture-task-058b-workspace-layout-phase11.mjs \
  docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-090-tasks-index-legacy.md

diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/unassigned-task/task-imp-workspace-parent-reference-sweep-guard-001.md
```

---

## 7. リスクと対策

| リスク                                                   | 影響度 | 発生確率 | 対策                                                                               |
| -------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------- |
| sweep 対象を広げすぎて docs-only parent 以外へ誤適用する | 中     | 中       | task profile を docs-only parent workflow に限定し、適用条件を明記する             |
| grep だけでは status drift を取りこぼす                  | 中     | 中       | path drift と status drift を別チェックとして定義する                              |
| mirror sync guard が既存タスクと重複する                 | 低     | 中       | dual-root generic guard ではなく docs-only parent sweep への接続点に責務を限定する |
| workflow task spec だけ更新して system spec が追随しない | 高     | 中       | `task-workflow` / feature spec / lessons / workflow spec を同一ターンで更新する    |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-060-ui-04-workspace-view.md`
- `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/`
- `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/`
- `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/unassigned-task/task-imp-workspace-phase11-current-build-capture-guard-001.md`
- `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-dual-skill-root-mirror-sync-guard-001.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
parent workflow root を直した時点で探索導線の監査を止めると、completed-task pointer docs / legacy index / interfaces / capture script に旧 path が残る。
```

### 補足事項

- 本タスクは docs-only parent workflow の sweep 範囲を固定するものであり、代表 screenshot の撮り方自体は別未タスクで扱う
- parent pointer doc は現状 `skill-import-agent-system/tasks/task-00-unified-implementation-sequence/` 配下にあり、child workflow との root 差分を前提として設計する
