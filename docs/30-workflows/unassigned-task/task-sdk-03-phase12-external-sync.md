# UT-TASK-SDK-03-PHASE12-EXTERNAL-SYNC-001: TASK-SDK-03 Phase 12 外部同期台帳未反映の是正

## メタ情報

```yaml
issue_number: 1661
task_id: UT-TASK-SDK-03-PHASE12-EXTERNAL-SYNC-001
task_name: TASK-SDK-03 Phase 12 外部同期台帳未反映の是正
category: ドキュメント更新
target_feature: TASK-SDK-03 Phase 12 外部同期 / task-workflow / LOGS / topic-map
priority: 高
scale: 中規模
status: 未実施
source_phase: TASK-SDK-03 Phase 12 再レビュー / 2回確認
created_date: 2026-03-27
dependencies: [TASK-SDK-03]
```

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | UT-TASK-SDK-03-PHASE12-EXTERNAL-SYNC-001                            |
| タスク名     | TASK-SDK-03 Phase 12 外部同期台帳未反映の是正                       |
| 分類         | ドキュメント更新                                                    |
| 対象機能     | Phase 12 外部同期台帳 / completed ledger / `task-workflow` / `LOGS` |
| 優先度       | 高                                                                  |
| 見積もり規模 | 中規模                                                              |
| ステータス   | 未実施                                                              |
| 発見元       | TASK-SDK-03 Phase 12 再レビュー / 2回確認                           |
| 発見日       | 2026-03-27                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SDK-03 の実装と Phase 12 の成果物は `docs/30-workflows/step-03-par-task-03-context-budget-and-resource-selection/` 配下に揃っている。一方で、外部同期に必要な台帳はまだ閉じ切っていない。

特に、`task-specification-creator` と `aiworkflow-requirements` の `LOGS.md`、`aiworkflow-requirements/indexes/topic-map.md`、`task-workflow` 系の completed / backlog 参照が、Task03 の current facts に追随していない。

### 1.2 問題点・課題

- Phase 12 の実体はあるのに、`.claude` 正本の記録が stale のまま残りやすい。
- `LOGS.md` は skill 使用履歴の入口であり、ここが更新されないと後続の監査で Task03 の変更を追えない。
- `topic-map.md` は検索導線なので、未再生成のままだと Task03 の current facts が索引に出てこない。
- `task-workflow-completed.md` と `task-workflow-backlog.md` のどちらに何を残すかを曖昧にすると、完了判定と残課題判定がずれる。

### 1.3 放置した場合の影響

- Phase 12 は見た目だけ完了し、外部からは未同期に見える。
- 以後の仕様確認で Task03 の更新履歴を誤って参照する。
- completed ledger と backlog の二重管理が崩れ、同じ指摘を再度掘り起こす。
- `aiworkflow-requirements` の canonical search が stale になる。

---

## 2. 何を達成するか（What）

### 2.1 目的

TASK-SDK-03 の Phase 12 実績を、`task-specification-creator` と `aiworkflow-requirements` の外部台帳へ同一 wave で反映し、検索導線と完了記録を current facts に揃える。

### 2.2 最終ゴール

1. `task-specification-creator/LOGS.md` と `aiworkflow-requirements/LOGS.md` に TASK-SDK-03 の同期記録が残る。
2. `aiworkflow-requirements/indexes/topic-map.md` が TASK-SDK-03 の current state を検索できる状態になる。
3. `task-workflow-completed.md` と `task-workflow-backlog.md` の参照が TASK-SDK-03 の完了状況と矛盾しない。
4. Phase 12 の external sync が、手動確認でも機械確認でも追跡できる。

### 2.3 スコープ

#### 含むもの

- `.claude/skills/task-specification-creator/LOGS.md` への TASK-SDK-03 同期記録追加
- `.claude/skills/aiworkflow-requirements/LOGS.md` への TASK-SDK-03 同期記録追加
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` の再生成または更新
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` の TASK-SDK-03 完了記録整理
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` の残課題参照整合
- 外部同期後の参照リンク点検

#### 含まないもの

- TASK-SDK-03 の runtime code 再実装
- 追加の UI / screenshot 作業
- 他 workflow の completed ledger まとめ直し
- PR 作成

### 2.4 成果物

- 更新済み `LOGS.md` 2ファイル
- 更新済み `topic-map.md`
- 更新済み `task-workflow-completed.md` / `task-workflow-backlog.md` の参照整合
- Phase 12 外部同期完了を説明できる記録

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SDK-03 の Phase 12 outputs が存在していること
- 変更対象が `docs/30-workflows/unassigned-task/` ではなく `.claude/skills/...` の正本台帳であること
- 1回目確認と 2回目確認を分けて実施すること

### 3.2 依存タスク

- TASK-SDK-03
- TASK-SDK-03 Phase 12 outputs
- `task-specification-creator` の Phase 12 ルール

### 3.3 必要な知識

- `task-specification-creator` の Phase 12 Step 1-A / 1-B / 1-C
- `aiworkflow-requirements` の `LOGS.md` / `task-workflow` / `topic-map.md` の役割分担
- `generate-index.js` による topic-map 再生成手順

### 3.4 推奨アプローチ

1. 1回目確認で、TASK-SDK-03 の current facts と external ledger の差分を列挙する。
2. 2回目確認で、`LOGS.md`、`topic-map.md`、`task-workflow` の参照先が同じ TASK-SDK-03 を指すか再検証する。
3. 更新後は、検索導線が TASK-SDK-03 を拾えることを `rg` と index 再生成結果で確認する。

---

## 4. 実行手順

### Phase構成

1. 1回目確認
2. 2回目確認
3. 外部同期反映と検証

### Phase 1: 1回目確認

#### 目的

TASK-SDK-03 の current facts と、`.claude` 正本の external ledger の差を洗い出す。

#### 手順

1. TASK-SDK-03 の Phase 12 outputs を列挙する。
2. `task-specification-creator/LOGS.md` と `aiworkflow-requirements/LOGS.md` の TASK-SDK-03 記録有無を確認する。
3. `task-workflow-completed.md` / `task-workflow-backlog.md` / `topic-map.md` の Task03 導線を確認する。

#### 成果物

- 差分一覧
- 同期対象ファイル一覧

#### 完了条件

- 同期漏れがどこにあるかを1回目で明確化できている。

### Phase 2: 2回目確認

#### 目的

1回目の差分が誤認ではないことを再確認し、更新対象を固定する。

#### 手順

1. 1回目で抽出したファイルを再読する。
2. `task-workflow` の completed / backlog のどちらに TASK-SDK-03 を置くべきかを再判定する。
3. `topic-map.md` が current Task03 を索引できるか確認する。

#### 成果物

- 再確認メモ
- 更新対象の最終確定

#### 完了条件

- 1回目と2回目の判定が一致している。

### Phase 3: 外部同期反映と検証

#### 目的

external ledger を current facts へ揃え、検索導線と完了記録を閉じる。

#### 手順

1. `task-specification-creator/LOGS.md` を更新する。
2. `aiworkflow-requirements/LOGS.md` を更新する。
3. `aiworkflow-requirements/indexes/topic-map.md` を再生成する。
4. `task-workflow-completed.md` と `task-workflow-backlog.md` の TASK-SDK-03 参照を整える。
5. 反映後に `rg` と `git diff` で stale 参照が残っていないことを確認する。

#### 成果物

- 更新済み外部台帳
- 検証結果メモ

#### 完了条件

- TASK-SDK-03 の Phase 12 実績が external ledger から追跡できる。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `task-specification-creator/LOGS.md` に TASK-SDK-03 記録がある
- [ ] `aiworkflow-requirements/LOGS.md` に TASK-SDK-03 記録がある
- [ ] `task-workflow-completed.md` または該当 completed record に TASK-SDK-03 完了記録がある
- [ ] `task-workflow-backlog.md` の参照が current 状態と矛盾しない

### 品質要件

- [ ] 1回目確認と2回目確認の結果が一致している
- [ ] stale 参照を残していない
- [ ] `topic-map.md` が current Task03 を索引できる
- [ ] 他の workflow の ledger を巻き込んでいない

### ドキュメント要件

- [ ] Phase 12 外部同期の記録が残っている
- [ ] 変更理由が `LOGS.md` と `task-workflow` で辿れる
- [ ] completed ledger / backlog / topic-map の役割差が崩れていない

---

## 6. 検証方法

### テストケース

1. `rg -n "TASK-SDK-03|context-budget-and-resource-selection" .claude/skills/aiworkflow-requirements .claude/skills/task-specification-creator` で記録を確認する。
2. `node scripts/generate-index.js` 後に `indexes/topic-map.md` が更新されることを確認する。
3. `git diff --stat` で対象ファイルが external ledger に限定されていることを確認する。

### 検証手順

1. 反映前後で TASK-SDK-03 の参照数を比較する。
2. `task-workflow-completed.md` と `task-workflow-backlog.md` の Task03 関連行を突合する。
3. 2回確認の記録を残し、最終的に stale 参照が残っていないことを確認する。

---

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                                     |
| -------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------ |
| completed ledger と backlog の更新先を取り違える   | 高     | 中       | 1回目確認で current state を固定し、2回目確認で参照先を再判定する        |
| `topic-map.md` を更新せずに LOGS だけ更新する      | 中     | 中       | `generate-index.js` を必須手順に入れる                                   |
| `LOGS.md` への追記を 1ファイルだけで済ませてしまう | 高     | 中       | `task-specification-creator` と `aiworkflow-requirements` を同時更新する |

---

## 8. 参照情報

### 関連ドキュメント

- [TASK-SDK-03 index](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260327-070604-wt-2/docs/30-workflows/step-03-par-task-03-context-budget-and-resource-selection/index.md)
- [TASK-SDK-03 Phase 12 implementation guide](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260327-070604-wt-2/docs/30-workflows/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-12/implementation-guide.md)
- [TASK-SDK-03 Phase 12 system spec update summary](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260327-070604-wt-2/docs/30-workflows/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-12/system-spec-update-summary.md)
- [TASK-SDK-03 Phase 12 documentation changelog](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260327-070604-wt-2/docs/30-workflows/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-12/documentation-changelog.md)
- [TASK-SDK-03 Phase 12 compliance check](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260327-070604-wt-2/docs/30-workflows/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-12/phase12-task-spec-compliance-check.md)
- [task-specification-creator LOGS](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260327-070604-wt-2/.claude/skills/task-specification-creator/LOGS.md)
- [aiworkflow-requirements LOGS](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260327-070604-wt-2/.claude/skills/aiworkflow-requirements/LOGS.md)
- [task-workflow](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260327-070604-wt-2/.claude/skills/aiworkflow-requirements/references/task-workflow.md)
- [task-workflow completed](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260327-070604-wt-2/.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md)
- [task-workflow backlog](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260327-070604-wt-2/.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md)
- [topic-map](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260327-070604-wt-2/.claude/skills/aiworkflow-requirements/indexes/topic-map.md)

### 参考資料

- `task-specification-creator` の Phase 12 / unassigned-task template
- `aiworkflow-requirements` の current canonical set と index 生成ルール

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
TASK-SDK-03 の Phase 12 実装は見えているが、外部同期台帳がまだ current facts に追随していない。
LOGS.md×2、topic-map.md、task-workflow completed/backlog の参照を同一 wave で閉じる必要がある。
```

### 補足事項

- Issue 追加は別工程で実施する前提にしている。
- 完了タスク移動は、この未タスク自体が完了した後に別途行う。
- 2回確認の結果を必ず残し、1回目の結果をそのまま採用しない。
