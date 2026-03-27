# UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001: TASK-SDK-06 の Layer 3 / Layer 4 verify 拡張

## メタ情報

```yaml
issue_number: 1655
task_id: UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001
task_name: TASK-SDK-06 の Layer 3 / Layer 4 verify 拡張
category: 改善
target_feature: Skill Creator verify / improve detail surface の Layer 3 / Layer 4 契約
priority: 高
scale: 中規模
status: 未実施
source_phase: TASK-SDK-06 Phase 12 / 2回確認
created_date: 2026-03-26
dependencies: [TASK-SDK-06, TASK-SDK-07, TASK-SDK-08]
```

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001                     |
| タスク名     | TASK-SDK-06 の Layer 3 / Layer 4 verify 拡張                        |
| 分類         | 改善                                                                |
| 対象機能     | verify detail panel / IPC-preload contract / renderer action wiring |
| 優先度       | 高                                                                  |
| 見積もり規模 | 中規模                                                              |
| ステータス   | 未実施                                                              |
| 発見元       | TASK-SDK-06 Phase 12 / 2回確認                                      |
| 発見日       | 2026-03-26                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-SDK-06` では verify / improve surface の設計書を Phase 1-13 で整備したが、初回スコープは Layer 1 / Layer 2 verify に限定している。detail DTO、panel layout、re-verify 起点は仕様化した一方で、Layer 3 / Layer 4 の verify depth は intentionally deferred として残した。

### 1.2 問題点・課題

- 現行 Task06 は `verifyResult` の summary と detail panel の骨格までしか確定しておらず、Layer 3 / Layer 4 の deeper verification rule を UI / IPC / shared types へ落とし切っていない
- provenance / hash / route snapshot を detail surface に載せる際、verify depth を増やすと Task07 の governance と Task08 の session semantics に接続する境界が曖昧になりやすい
- terminal handoff guidance を verify 拡張の代替にすると、`manual guidance` と `verification result` の責務が混ざる
- 2 回確認の結果、governance hardening と session compatibility は既存 sibling task の責務であり、Task06 follow-up として新規起票すべき genuine gap は Layer 3 / Layer 4 verify だけだった

### 1.3 放置した場合の影響

- verify detail surface が Layer 1 / 2 前提のまま固定化し、後続実装で DTO 追加と UI 拡張が場当たりになる
- Task07 / Task08 側で verify responsibility を吸収し始めると、ownership が再び drift する
- `execute -> verify -> improve -> apply -> re-verify` の閉ループが「浅い verify だけ成立」に留まり、将来の runtime evidence が分散する

---

## 2. 何を達成するか（What）

### 2.1 目的

Layer 3 / Layer 4 verify を独立タスクとして formalize し、shared type / IPC / renderer / state owner の責務境界を壊さずに deeper verification surface を導入できる状態へ落とす。

### 2.2 最終ゴール

- Layer 3 / Layer 4 verify で追加される判定軸、DTO、UI セクション、re-verify action を 1 つの契約として説明できる
- Task07 の governance と Task08 の session compatibility に跨る項目が「参照するが所有しない」形で固定される
- implementation 着手前に test matrix、artifact、manual test coverage が設計段階で確定する

### 2.3 スコープ

#### 含むもの

- Layer 3 / Layer 4 verify の判定軸定義
- shared types / IPC-preload / renderer の追加契約整理
- verify detail panel の section 拡張方針
- re-verify action と provenance detail の接続ルール
- manual test / implementation guide / compliance 観点の追加

#### 含まないもの

- Task07 の governance / disclosure / approval hardening 実装
- Task08 の session persistence / resume invalidation 実装
- terminal handoff 自体の UX redesign
- create mainline の導線変更

### 2.4 成果物

- Layer 3 / Layer 4 verify 用のタスク仕様書または corrective workflow
- 判定軸 / DTO / UI / validation の対応表
- Task06 / Task07 / Task08 境界の更新記録
- 検証コマンドと residual risk を含む Phase 12 close-out

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-SDK-06` の Phase 1-13 成果物を読了している
- Task07 / Task08 が governance と session compatibility の owner であることを把握している
- `aiworkflow-requirements` の skill lifecycle / workflow backlog / verify-unassigned-links 運用を理解している

### 3.2 依存タスク

- TASK-SDK-06
- TASK-SDK-07
- TASK-SDK-08

### 3.3 必要な知識

- `docs/30-workflows/completed-tasks/step-04-par-task-06-verify-and-improve-lifecycle-surface/`
- `.agents/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`
- `.agents/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `packages/shared/src/types/skillCreator.ts`

### 3.4 推奨アプローチ

1. Layer 3 / Layer 4 verify で追加したい情報を「owner」「consumer」「non-goal」に三分割する
2. governance / session の項目は参照専用に留め、Task07 / Task08 の責務を再定義しない
3. detail surface の拡張は shared DTO から renderer まで同じ field set で貫通させる
4. docs-only 設計で終わらせず、実装前提の validation matrix と manual-test coverage まで閉じる

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                           | 発見経緯                                                                             | 解決策                                                                                                | 教訓                                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| verify 深度を増やすと scope が肥大化しやすい                   | Task06 で Layer 1 / 2 までに絞らないと Task07 / Task08 まで巻き込むことが判明した    | owner / consumer / non-goal を Phase 2 で先に固定する                                                 | verify 拡張は「表示を増やす」ではなく「責務を分ける」作業として扱う |
| governance hardening を follow-up に見誤りやすい               | 1回目確認では Task06 follow-up 候補に入ったが、2回目確認で Task07 固有責務と判明した | terminal handoff / disclosure / approval は Task07 へ明示委譲し、Task06 側は参照に留める              | 2回確認で genuine gap と sibling ownership を分離する               |
| session compatibility を verify surface の一部に見せかけやすい | re-verify / resume semantics が UI 文言から連想され、Task08 との境界が曖昧になった   | persistence / resume invalidation は Task08 参照に固定し、Task06 派生では state snapshot 要件だけ残す | UI wording と session contract を同じタスクで閉じない               |

---

## 4. 実行手順

### Phase構成

- Phase A: 追加 verify scope の棚卸し
- Phase B: 契約設計と sibling boundary 固定
- Phase C: 検証計画と close-out 同期

### Phase A: 追加 verify scope の棚卸し

#### 目的

Layer 3 / Layer 4 verify で何を追加し、何を追加しないかを固定する。

#### 手順

1. Task06 の `validation-matrix.md`、`verify-improve-surface-matrix.md`、`implementation-guide.md` を起点に Layer 1 / 2 と deferred 項目を整理する
2. verify depth ごとに `owner`、`renderer consumer`、`future dependency` を表に分解する
3. governance / session 項目を sibling task 参照へ振り分ける

#### 成果物

- scope inventory
- deferred / owned 判定表

#### 完了条件

- Layer 3 / Layer 4 で新規に扱う項目だけが一意に列挙されている

### Phase B: 契約設計と sibling boundary 固定

#### 目的

shared type、IPC、renderer、workflow owner の契約を定義する。

#### 手順

1. `packages/shared/src/types/skillCreator.ts` へ必要な DTO 差分を設計する
2. `RuntimeSkillCreatorFacade`、`creatorHandlers.ts`、preload API、renderer panel の接続点を matrix 化する
3. Task07 / Task08 に委譲する境界を設計書と backlog の両方へ明記する

#### 成果物

- contract matrix
- boundary decision record

#### 完了条件

- owner / consumer / delegated item が各レイヤーで矛盾なく説明できる

### Phase C: 検証計画と close-out 同期

#### 目的

実装前に validation と manual test の閉じ方を固定する。

#### 手順

1. unit / integration / docs QA / manual test の test matrix を作成する
2. Phase 11 screenshot / evidence / non-visual 例外の扱いを定義する
3. Phase 12 の unassigned-task detection、documentation changelog、task-workflow backlog を同期する

#### 成果物

- test matrix
- manual test coverage plan
- Phase 12 close-out artifacts

#### 完了条件

- `verify-all-specs`、`validate-phase-output`、`verify-unassigned-links`、`audit-unassigned-tasks` の実行条件が設計段階で定義されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Layer 3 / Layer 4 verify の判定軸が定義されている
- [ ] shared types / IPC / renderer の接続契約が定義されている
- [ ] Task07 / Task08 への委譲境界が明文化されている

### 品質要件

- [ ] 2回確認の結果が unassigned-task detection と backlog に同期されている
- [ ] governance / session の重複起票がない
- [ ] residual risk と non-goal が明記されている

### ドキュメント要件

- [ ] Task06 の follow-up 参照と本未タスクのパスが一致している
- [ ] `task-workflow-backlog.md` に同一 ID が登録されている
- [ ] Phase 12 成果物から本未タスクを辿れる

---

## 6. 検証方法

### テストケース

- Case 1: Layer 3 / Layer 4 verify で追加される field と panel section をトレースできる
- Case 2: governance / session 項目が Task07 / Task08 へ重複起票されていない
- Case 3: unassigned-task spec の品質監査で `currentViolations = 0` になる

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json \
  --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-06-layer34-verify-expansion-001.md
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source \
  .agents/skills/aiworkflow-requirements/references/task-workflow-backlog.md
rg -n "UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001|Layer 3 / Layer 4 verify" \
  docs/30-workflows .agents/skills/aiworkflow-requirements/references
```

---

## 7. リスクと対策

| リスク                                         | 影響度 | 発生確率 | 対策                                                                |
| ---------------------------------------------- | ------ | -------- | ------------------------------------------------------------------- |
| verify 拡張が governance 実装まで飲み込む      | 高     | 中       | Task07 owner 項目を non-goal に固定する                             |
| session semantics が UI wording と一緒に混ざる | 高     | 中       | Task08 参照表を用意し、persistence 項目は参照のみとする             |
| docs-only のまま実装観点が抜ける               | 中     | 中       | validation matrix と manual test coverage を Phase B/C で必須にする |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/step-04-par-task-06-verify-and-improve-lifecycle-surface/index.md`
- `docs/30-workflows/completed-tasks/step-04-par-task-06-verify-and-improve-lifecycle-surface/outputs/phase-12/unassigned-task-detection.md`
- `.agents/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`
- `.agents/skills/aiworkflow-requirements/references/task-workflow-backlog.md`

### 参考資料

- `docs/30-workflows/skill-creator-agent-sdk-lane/root-workflow-pack/index.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-05-seq-task-07-execution-governance-and-handoff-alignment/index.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/index.md`

---

## 9. 備考

### レビュー指摘の原文（要約）

> Task06 の verify / improve surface は Layer 1 / Layer 2 までで閉じ、Layer 3 / Layer 4 verify は別 task 化する。  
> governance hardening と session compatibility はそれぞれ Task07 / Task08 の責務として重複起票しない。

### 補足事項

本未タスクは、Task06 の 1回目確認で見えた 3 候補を 2回目確認で再評価し、genuine gap だけを formalize した結果である。
