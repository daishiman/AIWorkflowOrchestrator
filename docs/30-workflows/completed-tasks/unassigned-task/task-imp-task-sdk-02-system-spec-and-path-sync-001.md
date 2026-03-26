# UT-IMP-TASK-SDK-02-SYSTEM-SPEC-AND-PATH-SYNC-001: TASK-SDK-02 の system spec same-wave 同期と path drift 是正

## メタ情報

```yaml
issue_number: 1647
task_id: UT-IMP-TASK-SDK-02-SYSTEM-SPEC-AND-PATH-SYNC-001
task_name: TASK-SDK-02 の system spec same-wave 同期と path drift 是正
category: 改善
target_feature: TASK-SDK-02 の canonical spec 同期と workflow path 正規化
priority: 高
scale: 大規模
status: 未実施
source_phase: TASK-SDK-02 Phase 12 レビュー / 2回確認
created_date: 2026-03-26
dependencies: [TASK-SDK-02]
```

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | UT-IMP-TASK-SDK-02-SYSTEM-SPEC-AND-PATH-SYNC-001            |
| タスク名     | TASK-SDK-02 の system spec same-wave 同期と path drift 是正 |
| 分類         | 改善                                                        |
| 対象機能     | canonical spec、task ledger、workflow path、親子リンク      |
| 優先度       | 高                                                          |
| 見積もり規模 | 大規模                                                      |
| ステータス   | 未実施                                                      |
| 発見元       | TASK-SDK-02 Phase 12 レビュー / 2回確認                     |
| 発見日       | 2026-03-26                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-SDK-02` の workflow ディレクトリは `skill-creator-agent-sdk-lane/` 配下から root 配下へ移されたが、system spec と workflow 内リンクの same-wave 同期が完了していない。

### 1.2 問題点・課題

- canonical spec は `SkillCreatorWorkflowEngine` をまだ `future state owner` と記述している
- `task-workflow.md` / `lessons-learned-current.md` に `TASK-SDK-02` の完了記録がない
- workflow 内リンクが `../root-workflow-pack` や `../step-03-*` を参照し、実体 path とずれている
- `artifacts.json` の `parentWorkflow` は `skill-creator-agent-sdk-lane` のままだが、現在の配置と整合していない
- Phase 12 summary は「same-wave 更新が必要なら後でやる」と書き、完了条件を満たしていない

### 1.3 放置した場合の影響

- canonical spec を読んだ後続 task が古い前提で設計する
- workflow navigation が壊れ、completed 移動や downstream handoff の追跡が難しくなる
- Phase 12 で最も避けるべき「計画だけ残して実更新しない」状態が再発する

---

## 2. 何を達成するか（What）

### 2.1 目的

TASK-SDK-02 の current facts を canonical system spec と workflow 本文へ同一 wave で反映し、path drift を解消する。

### 2.2 最終ゴール

- canonical spec が `future` ではなく current state owner を記述する
- `task-workflow` / `lessons-learned-current` / 必要な LOGS / SKILL 履歴が同期される
- workflow 本文 / artifacts / downstream 参照 path が実体と一致する

### 2.3 スコープ

#### 含むもの

- `architecture-overview-core.md` など canonical spec 更新
- `task-workflow.md` / `lessons-learned-current.md` 完了記録
- TASK-SDK-02 workflow 本文の path 修正
- `artifacts.json` / `outputs/artifacts.json` / parentWorkflow の整合化
- 必要な index / topic-map 再生成

#### 含まないもの

- workflow engine コード自体のバグ修正
- Task04 以降の downstream 実装

### 2.4 成果物

- 更新済み system spec
- 更新済み task ledger / lessons
- path 修正済み workflow 文書

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- aiworkflow-requirements の canonical set と mirror policy を理解している
- current workflow の実体 path を repo 全体で確認済みである

### 3.2 依存タスク

- TASK-SDK-02

### 3.3 必要な知識

- `.agents/skills/aiworkflow-requirements/references/architecture-overview-core.md`
- `.agents/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`
- `.agents/skills/aiworkflow-requirements/references/task-workflow.md`
- `.agents/skills/aiworkflow-requirements/references/lessons-learned-current.md`

### 3.4 推奨アプローチ

1. current canonical set を先に固定する
2. system spec / workflow path / ledger を同一ターンで更新する
3. path 正規化後に `verify-all-specs` と `rg` で旧経路残存を確認する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                            | 発見経緯                                                    | 解決策                                                              | 教訓                                             |
| ----------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| workflow を移動したのに相対リンクを更新し忘れた | root 配下へ移設後も `../step-*` が残存                      | path 変更時は index / phase / artifacts を一括監査する              | workflow path 変更は本文リンク修正まで含めて完了 |
| system spec を「後で同期」と記録して閉じた      | summary が未更新を明示していた                              | docs-only でも same-wave 更新を必須化する                           | Phase 12 は pending memo を残さない              |
| canonical spec が future state のまま残った     | `architecture-overview-core.md` が old wording のままだった | current fact を architecture / task ledger / lessons へ同時反映する | 一箇所だけ更新すると canonical set が壊れる      |

---

## 4. 実行手順

### Phase A: canonical target 固定

1. 更新対象 spec を `architecture-overview-core.md`、`arch-electron-services-details-part2.md`、`task-workflow.md`、`lessons-learned-current.md` から確定する
2. 必要なら LOGS / SKILL change log 更新対象も洗い出す

### Phase B: same-wave 更新

1. current facts を canonical spec に反映する
2. `TASK-SDK-02` の完了記録と苦戦箇所を ledger / lessons に追記する
3. `topic-map` / index を再生成する

### Phase C: workflow path 正規化

1. TASK-SDK-02 本文内の旧相対 path を current 実体に合わせて修正する
2. `parentWorkflow` と downstream path を正規化する
3. 旧 path 残存を `rg` で確認する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] canonical spec が `SkillCreatorWorkflowEngine` を current owner として記述している
- [ ] `task-workflow` / `lessons-learned-current` に TASK-SDK-02 が登録されている
- [ ] TASK-SDK-02 workflow 文書の path が実体と一致する

### 品質要件

- [ ] same-wave 更新で pending wording が残っていない
- [ ] 旧 path 残存が `rg` で 0 件になっている

### ドキュメント要件

- [ ] `artifacts.json` / `outputs/artifacts.json` / index / phase 文書が同期している
- [ ] 必要な index / topic-map が再生成されている

---

## 6. 検証方法

### テストケース

- Case 1: canonical spec が future wording を含まない
- Case 2: workflow 文書から downstream task へ辿れる
- Case 3: ledger / lessons / spec が同じ current fact を持つ

### 検証手順

```bash
rg -n "future state owner|../root-workflow-pack|../step-03-par-task-03|../step-03-par-task-04" \
  docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration \
  .agents/skills/aiworkflow-requirements/references
node .agents/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration --json
```

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                                |
| -------------------------------------- | ------ | -------- | --------------------------------------------------- |
| canonical 更新対象を漏らす             | 高     | 中       | current canonical set を先に表で固定する            |
| path 修正で別 workflow 参照を壊す      | 中     | 中       | `rg` と `verify-all-specs` を同一ターンで実行する   |
| ledger 更新だけで lessons が追従しない | 中     | 中       | same-wave 更新チェックリストを作り、4点同期で閉じる |

---

## 8. 参照情報

### 関連ドキュメント

- `.agents/skills/aiworkflow-requirements/references/architecture-overview-core.md`
- `.agents/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`
- `.agents/skills/aiworkflow-requirements/references/task-workflow.md`
- `.agents/skills/aiworkflow-requirements/references/lessons-learned-current.md`

### 参考資料

- `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`
- `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/artifacts.json`

---

## 9. 備考

### レビュー指摘の原文（要約）

> system spec 本体が未更新のまま Phase 12 を閉じている。  
> workflow path と parentWorkflow が旧配置前提のままで、内部リンクも壊れている。
