# UT-IMP-RUNTIME-WORKFLOW-PHASE12-COMPLIANCE-RESYNC-001: runtime workflow failure lifecycle の Phase 12 実績同期是正

## メタ情報

```yaml
issue_number: 1653
task_id: UT-IMP-RUNTIME-WORKFLOW-PHASE12-COMPLIANCE-RESYNC-001
task_name: runtime workflow failure lifecycle の Phase 12 実績同期是正
category: ドキュメント更新
target_feature: UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 の Phase 12 記録
priority: 高
scale: 中規模
status: 未実施
source_phase: UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 Phase 12 再レビュー / 2回確認
created_date: 2026-03-26
dependencies: [UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001]
```

| 項目         | 内容                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-RUNTIME-WORKFLOW-PHASE12-COMPLIANCE-RESYNC-001                                 |
| タスク名     | runtime workflow failure lifecycle の Phase 12 実績同期是正                           |
| 分類         | ドキュメント更新                                                                      |
| 対象機能     | task status / Phase 12 compliance / unassigned detection / system spec update summary |
| 優先度       | 高                                                                                    |
| 見積もり規模 | 中規模                                                                                |
| ステータス   | 未実施                                                                                |
| 発見元       | UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 Phase 12 再レビュー / 2回確認    |
| 発見日       | 2026-03-26                                                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001` の Phase 12 成果物は一式生成されているが、再レビューで task-specification-creator の必須 Step との乖離が見つかった。特に Step 1-A/1-B 相当の記録不足、未タスク 0 件判定の根拠不足、Part 1 記述品質の不足が残っている。

### 1.2 問題点・課題

- `index.md` と `artifacts.json` は `spec_created` のままなのに、Phase 12 文書は実装済み前提で PASS にしている
- `LOGS.md×2` と `topic-map.md` の更新有無が summary/compliance に記録されていない
- `discovered-issues.md` の follow-up 候補が `unassigned-task-detection.md` に接続されていない
- implementation guide の Part 1 が「専門用語なし」要件に完全準拠していない

### 1.3 放置した場合の影響

- Phase 12 完了判定の信頼性が下がる
- 同じ task を completed 扱いした後で差し戻しが発生する
- future review が stale な PASS 記録を信じて未タスクを見逃す

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 の実績記録を task-specification-creator の必須要件に沿って再同期し、未タスク・完了判定・system spec 同期判断を一貫させる。

### 2.2 最終ゴール

- `index.md` / `artifacts.json` / Phase 12 outputs の状態表現が一致する
- Step 1-A / 1-B / 1-C の実施証跡または未実施理由が summary に明記される
- follow-up 候補が未タスク 0 件判定と矛盾しない
- implementation guide Part 1 がテンプレート要件を満たす

### 2.3 スコープ

#### 含むもの

- `index.md` / `artifacts.json` / `outputs/artifacts.json` の状態同期
- `outputs/phase-12/system-spec-update-summary.md` / `phase12-task-spec-compliance-check.md` / `unassigned-task-detection.md` / `implementation-guide.md` の是正
- 必要なら `.claude/skills/*/LOGS.md` と `topic-map.md` 更新有無の整理

#### 含まないもの

- runtime code 修正そのもの
- unrelated workflow の Phase 12 再監査
- PR 作成

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-specification-creator の Phase 12 Step 1-A/1-B/1-C を正本要件として扱う
- 実装コードとテストの current 状態を先に確認してから文書へ反映する

### 3.2 必要な知識

- `.claude/skills/task-specification-creator/SKILL.md`
- `docs/30-workflows/ut-imp-runtime-workflow-engine-failure-lifecycle-001/index.md`
- `docs/30-workflows/ut-imp-runtime-workflow-engine-failure-lifecycle-001/artifacts.json`
- `docs/30-workflows/ut-imp-runtime-workflow-engine-failure-lifecycle-001/outputs/phase-12/*.md`

### 3.3 推奨アプローチ

1. current 事実を 1 回目確認で列挙する
2. Phase 12 outputs の PASS 判定と照合し、差分を 2 回目確認で再検証する
3. 未タスク候補が残るなら 0 件判定を取り消し、仕様書/Issue へ正式化する

### 3.4 苦戦箇所

| ID      | 内容                                                                                    | 解決策                                                                          |
| ------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| S-P12-1 | 成果物が存在すると Phase 12 を完了扱いしやすく、内容の stale を見落としやすい           | 生成有無と内容整合を別チェックに分け、2回確認で再検証する                       |
| S-P12-2 | Step 1-A の `LOGS.md×2` と `topic-map.md` が summary から抜けやすい                     | system spec update summary に Step 単位の証跡欄を固定する                       |
| S-P12-3 | Phase 11 の発見事項が Phase 12 unassigned 判定へ接続されず、0件と書き切ってしまいやすい | `discovered-issues.md` の各項目に「未タスク化/却下/親タスク吸収」を必ず付記する |

---

## 4. 実行手順

### Step 1: 1回目確認

1. code / tests / outputs の current 状態を列挙する
2. task status と artifacts status を確認する
3. Phase 12 文書の PASS 根拠を抽出する

### Step 2: 2回目確認

1. Step 1-A / 1-B / 1-C の証跡有無を再確認する
2. discovered issue と unassigned 判定を照合する
3. implementation guide Part 1 のテンプレート準拠を確認する

### Step 3: 是正

1. 状態表現を current 事実に合わせて更新する
2. 不足証跡を追記または no-op 理由を明記する
3. 新規未タスクがある場合は unassigned-task と Issue へ反映する

---

## 5. 完了条件

- [ ] `index.md` / `artifacts.json` / outputs の状態表現が一致する
- [ ] Step 1-A / 1-B / 1-C の証跡または no-op 理由が記録されている
- [ ] unassigned 判定が Phase 11 の発見事項と矛盾しない
- [ ] implementation guide Part 1 がテンプレート要件に準拠している
- [ ] 2回確認の結果が記録されている

## 6. 関連タスク

| タスクID                                             | 関係     | 説明                                        |
| ---------------------------------------------------- | -------- | ------------------------------------------- |
| UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 | 親タスク | Phase 12 実績同期の対象                     |
| TASK-1093 相当の stale 記録問題                      | 類似課題 | Phase 12 で stale PASS を見逃す既知パターン |
