# UT-IMP-TASK-SDK-04-PHASE12-CANONICAL-PATH-RESYNC-001: TASK-SDK-04 の Phase 12/13 証跡と canonical path を最新実装へ再同期する

## メタ情報

```yaml
issue_number: 1662
task_id: UT-IMP-TASK-SDK-04-PHASE12-CANONICAL-PATH-RESYNC-001
task_name: TASK-SDK-04 の Phase 12/13 証跡と canonical path を最新実装へ再同期する
category: 改善
target_feature: user interaction bridge / phase UI の Phase 12 close-out
priority: 高
scale: 小規模
status: 完了
source_phase: TASK-SDK-04 branch 監査（2回確認）
created_date: 2026-03-27
completed_date: 2026-03-27
dependencies:
  - TASK-SDK-04
parent_workflow: docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui
spec_path: docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-04-phase12-canonical-path-resync-001.md
completion_workflow: docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui
```

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK-SDK-04-PHASE12-CANONICAL-PATH-RESYNC-001          |
| タスク名     | TASK-SDK-04 の Phase 12/13 証跡と canonical path を再同期する |
| 分類         | 改善                                                          |
| 対象機能     | Task04 workflow close-out / documentation evidence            |
| 優先度       | 高                                                            |
| 見積もり規模 | 小規模                                                        |
| ステータス   | 完了（2026-03-27）                                            |
| 発見元       | TASK-SDK-04 branch 監査（2回確認）                            |
| 発見日       | 2026-03-27                                                    |

---

## 1. なぜこのタスクが必要か（Why）

## 完了メモ

- 2026-03-27: `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/phase-12/` と `outputs/phase-13/` の current fact を再同期し、旧 canonical path 参照、validator path drift、`spec_created` judgement drift を解消した。
- backlog 正本では open set を `TASK-SDK-04-U1` / `TASK-SDK-04-U2` の 2 件へ整理し、本指示書は completed-tasks/unassigned-task 配下へ移管した。
- 以後の正本は親 workflow の close-out 証跡と `task-workflow-completed.md` とし、本指示書は完了記録として保持する。

### 1.1 背景

`TASK-SDK-04` は `SkillCreatorWorkflowEngine` 起点の workflow state bridge、`get-workflow-state` / `submit-user-input` / `workflow-state-changed` の public IPC、`SkillLifecyclePanel` の phase UI / handoff visible 化までコードが進んでいる。一方で Phase 12/13 の一部証跡は、旧 canonical path と docs-only 前提の記述を残したままである。

### 1.2 問題点・課題

- `outputs/phase-12/system-spec-update-summary.md` に旧 path `docs/30-workflows/skill-creator-agent-sdk-lane/.../step-03-par-task-04-user-interaction-bridge-and-phase-ui/` が残っている
- `outputs/phase-13/local-check-result.md` の validator 実行パスが旧 path のままで、現ルート実体と一致していない
- `outputs/phase-12/unassigned-task-detection.md` と `system-spec-update-summary.md` では「Task04 は spec_created のまま、completed ledger 更新不要」としているが、現ブランチではコード実装と workflow 移設まで進んでおり、再監査なしでは説明が弱い
- Phase 12 ファイル自体は揃っていても、「現在の実装・現在の path・現在の completed 判定」が 1 つの事実へ閉じていない

### 1.3 放置した場合の影響

- completed-tasks へ移動後も旧 path を参照する stale evidence が残る
- Phase 12 close-out を再利用する後続 task が、誤った canonical path と stale 判定を前提にしてしまう
- 「実装は進んだが証跡が古い」状態が再発し、2回確認をしても監査品質が下がる

---

## 2. 何を達成するか（What）

### 2.1 目的

`TASK-SDK-04` の Phase 12/13 証跡を、最新コード差分・新 canonical path・completed-tasks 移動後の実体へ再同期する。

### 2.2 最終ゴール

1. Phase 12/13 証跡から旧 path が除去されている
2. validator / local check の実行対象が現 canonical path と一致している
3. `spec_created` 維持か、completed record へ昇格するかの判断根拠が最新実装ベースで説明されている
4. completed-tasks 配下の workflow と follow-up unassigned-task の導線が一貫している

### 2.3 スコープ

#### 含むもの

- `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/` 配下の Phase 12/13 証跡再同期
- old path / new path の canonical cleanup
- `verification-report.md` / `system-spec-update-summary.md` / `unassigned-task-detection.md` / `local-check-result.md` の整合是正

#### 含まないもの

- Task05 / Task07 / Task08 の downstream 実装
- `esbuild` 環境不整合そのものの解消
- 新規 IPC / UI 機能追加

### 2.4 成果物

- 更新済み `outputs/phase-12/system-spec-update-summary.md`
- 更新済み `outputs/phase-12/unassigned-task-detection.md`
- 更新済み `outputs/verification-report.md`
- 更新済み `outputs/phase-13/local-check-result.md`
- 必要に応じて更新した `artifacts.json` / `outputs/artifacts.json`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-SDK-04` workflow 本体が `completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/` に存在している
- `UT-SC-02-006` が Task04 吸収済みであることを branch 上で確認できる
- `aiworkflow-requirements` の canonical path / same-wave sync / Phase 12 close-out ルールを参照できる

### 3.2 依存タスク

- TASK-SDK-04

### 3.3 必要な知識

- `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`
- `.agents/skills/aiworkflow-requirements/references/security-electron-ipc-details.md`
- `.agents/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md`
- `.agents/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`

### 3.4 推奨アプローチ

1. 旧 path 残存箇所を `rg` で全件洗い出す
2. 最新コード差分と Phase 12 文言のズレを表にする
3. path cleanup と status/ledger 判断を同一ターンで閉じる
4. validator 実行コマンドも新 canonical path に揃える

### 3.5 苦戦箇所

| ID        | 内容                                                                    | 解決策                                                                  |
| --------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| SDK4-CL-1 | workflow 移設後も outputs 側に旧 canonical path が残りやすい            | `system-spec-update-summary` と `local-check-result` をセットで更新する |
| SDK4-CL-2 | docs-only 判定のままコード実装が進むと completed 根拠が曖昧になる       | 現在差分を基準に `spec_created` 維持理由か昇格理由を明文化する          |
| SDK4-CL-3 | Phase 12 完了と downstream follow-up を同じ表で扱うと責務が混ざりやすい | Task05 / 07 / 08 は参照に留め、本 task は証跡同期だけに限定する         |

---

## 4. 実行手順

### Phase A: stale evidence 棚卸し

1. 旧 path 参照を洗い出す
2. 最新コード差分と Phase 12/13 文言のズレを一覧化する
3. `spec_created` 判定の妥当性を再確認する

### Phase B: evidence 再同期

1. `system-spec-update-summary.md` の current canonical set を現 path へ更新する
2. `local-check-result.md` の validator 対象パスを現 path へ更新する
3. `verification-report.md` / `unassigned-task-detection.md` の判断根拠を最新差分へ寄せる

### Phase C: 最終監査

1. Phase 12/13 証跡の path drift が 0 件であることを確認する
2. completed-tasks 配下の workflow と本未タスクのリンクを確認する
3. 必要なら Issue / backlog の状態を同期する

---

## 5. 完了条件チェックリスト

### 機能要件

- [x] Phase 12/13 証跡の旧 path が除去されている
- [x] validator 実行対象が現 canonical path と一致している
- [x] `spec_created` / completed 判定の根拠が最新差分ベースで説明されている

### 品質要件

- [x] path drift が 0 件である
- [x] stale evidence と downstream follow-up が分離されている
- [x] 2回確認の結果が文書へ反映されている

### ドキュメント要件

- [x] completed-tasks 側 workflow への導線が正しい
- [x] 本未タスクが GitHub Issue と連動している

---

## 6. 検証方法

### テストケース

- Case 1: Task04 outputs 内に旧 path が残っていない
- Case 2: local check / verification report が現 path を参照する
- Case 3: `UT-SC-02-006` 吸収済みと Task05/07/08 follow-up が矛盾なく説明される

### 検証手順

```bash
rg -n "skill-creator-agent-sdk-lane/step-03-par-task-04-user-interaction-bridge-and-phase-ui" \
  docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui

node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui
```

---

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                                                  |
| ----------------------------------------- | ------ | -------- | ----------------------------------------------------- |
| docs 修正だけで完了判定を誤って昇格させる | 中     | 中       | 実装差分と outputs をセットで再確認する               |
| old path 清掃漏れが別ファイルに残る       | 中     | 中       | `rg` で workflow 配下を全件確認する                   |
| Issue / backlog が stale のまま残る       | 低     | 中       | move 後に Issue 同期と local issue cache を再確認する |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/phase-12/system-spec-update-summary.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/phase-13/local-check-result.md`
- `docs/30-workflows/completed-tasks/unassigned-task/ut-sc-02-006-skill-lifecycle-panel-execute-handoff-ui-connection.md`

### 参考資料

- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `packages/shared/src/types/skillCreator.ts`

---

## 9. 備考

- `esbuild` host/binary mismatch は既存未タスクで追跡されているため、本 task では再起票しない
- Task05 / Task07 / Task08 は sibling/downstream follow-up として維持し、本 task の責務には含めない
- 完了後の canonical path は `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-04-phase12-canonical-path-resync-001.md`
