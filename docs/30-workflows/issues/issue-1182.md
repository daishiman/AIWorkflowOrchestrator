# [#1182] "[UT-IMP-PHASE12-RELATED-UT-EXACT-COUNT-RESYNC-GUARD-001] Phase 12 related UT exact count 再同期ガード"

## メタ情報

```yaml
task_id: UT-IMP-PHASE12-RELATED-UT-EXACT-COUNT-RESYNC-GUARD-001
task_name: Phase 12 related UT exact count 再同期ガード
category: 改善
target_feature: Phase 12 related unassigned task migration / verify-unassigned-links exact count resync
priority: 中
scale: 小規模
status: 未実施
source_phase: UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001 Phase 12 追補監査（2026-03-12）
created_date: 2026-03-12
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-phase12-related-ut-exact-count-resync-guard-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001` の Phase 12 再確認で、related unassigned row を completed 実績へ移した直後に `verify-unassigned-links` の exact count が古いまま残る問題を確認した。  
当時は row 移動後に再実行して `219 / 219` へ是正したが、その後に follow-up 未タスクを 1 件 formalize すると current exact count は再び `220 / 220` へ変わるため、summary / workflow spec / task-workflow / detection report の同値転記ルールを別タスクとして固定する必要がある。

### 1.2 問題点・課題

- related UT の row を moved/closed した後に exact count を再取得しないと、`220 / 220` や `219 / 219` が文書ごとに食い違う。
- `verify-unassigned-links.js` の既定 source は `.agents/skills/aiworkflow-requirements/references/task-workflow.md` なので、`.claude` 正本だけ更新しても mirror sync 前は件数が変わらない。
- `task-workflow.md` / `workflow spec` / `outputs/phase-12/*.md` のどれか 1 箇所だけ更新すると、同種課題で再監査コストが増える。

### 1.3 放置した場合の影響

- Phase 12 の「exact count を再同期した」という記録自体が再び stale になる。
- 同種タスクで row 移動のたびに count 差分調査をやり直し、短手順化できない。
- `.claude` と `.agents` の source 差分が count 不整合として見え、原因切り分けが難しくなる。

## 2. 何を達成するか（What）

### 2.1 目的

related UT を completed 実績へ移した後、exact count の再取得から `.claude` / `.agents` 同期、system spec / workflow outputs への同値転記までを 1 手順に固定する。

### 2.2 最終ゴール

1. related UT の moved/closed 後に再実行すべきコマンド順が固定されている。
2. `task-workflow.md` / `workflow-workspace-parent-reference-sweep-guard.md` / `outputs/phase-12/*.md` の exact count が同値になる。
3. `.claude` 正本と `.agents` mirror の count source 差分を `rsync + diff -qr` で即座に検知できる。
4. 同種課題を 5 分程度で閉じる短手順が `aiworkflow-requirements` と未タスク指示書に残る。

### 2.3 スコープ

#### 含むもの

- related UT moved/closed 後の exact count 再取得手順
- `.claude` 正本更新後の `.agents` mirror sync 手順
- `task-workflow.md` / workflow spec / Phase 12 outputs の同値転記ルール
- 検証コマンドと grep 確認手順の標準化

#### 含まないもの

- `verify-unassigned-links.js` 本体の機能拡張
- legacy baseline 134 件の一括解消
- unrelated workflow の Phase 12 再監査

### 2.4 成果物

- 本未タスク指示書
- exact count 再同期ルールを追記した system spec
- current workflow の更新済み `unassigned-task-detection.md` / `spec-update-summary.md`
- 検証ログ（`verify-unassigned-links` / `audit` / `diff -qr`）

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-workflow.md` に root `docs/30-workflows/unassigned-task/*.md` への参照が存在する。
- `.claude/skills/aiworkflow-requirements/` を正本として更新できる。
- `rsync`、`diff -qr`、`verify-unassigned-links.js`、`audit-unassigned-tasks.js` を実行できる。

### 3.2 依存タスク

- `UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001`
- `UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001`

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-workspace-parent-reference-sweep-guard.md`
- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

### 3.4 推奨アプローチ

1. related UT row を moved/closed した直後に `verify-unassigned-links` を再実行し、exact count の current 値を先に確定する。
2. `.claude` 更新後に `.agents` へ mirror sync し、既定 source でも同じ count が出ることを確認する。
3. `task-workflow.md` / workflow spec / Phase 12 outputs を同一ターンで更新し、grep で同値確認する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                           | 発見経緯                                                                                                | 解決策                                                                                                                                                  | 教訓                                                            |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| related UT row を completed 実績へ移した後に exact count が stale になる       | `UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001` の Phase 12 再確認で `220 / 220` が一部文書に残った | row 移動後に `verify-unassigned-links` を再実行し、count を `task-workflow.md` / workflow spec / `outputs/phase-12/*.md` へ同値転記する                 | row 移動と count 再取得を別ターンにしない                       |
| `.claude` 更新後も `verify-unassigned-links` の結果が変わらない                | script の既定 source が `.agents/.../task-workflow.md` だった                                           | `.claude` 更新後に `rsync -a .claude/skills/aiworkflow-requirements/ .agents/skills/aiworkflow-requirements/` を実行し、`diff -qr` で差分なしを確認した | exact count 監査は canonical root 更新だけでは閉じない          |
| detection report は 0件のまま、system spec だけ follow-up を持つ不整合が起きる | 新規未タスクを formalize しても `unassigned-task-detection.md` を更新し忘れやすい                       | Phase 12 outputs に「新規未タスク 1 件」と target-file audit を追記した                                                                                 | 未タスク formalize 時は detection report も同一ターンで更新する |

### 3.6 SubAgent 分担

| SubAgent   | 関心ごと                     | 主担当成果物                                                                 |
| ---------- | ---------------------------- | ---------------------------------------------------------------------------- |
| SubAgent-A | count source / command order | 再取得コマンド順、grep チェック手順                                          |
| SubAgent-B | system spec sync             | `task-workflow.md` / `lessons-learned.md` / workflow spec の related UT 同期 |
| SubAgent-C | mirror / validation          | `rsync` / `diff -qr` / `verify-unassigned-links` / `audit` 記録              |

## 4. 実行手順

### Phase構成

- Phase A: count source の確定
- Phase B: related UT 同期
- Phase C: mirror sync と検証

### Phase A: count source の確定

#### 目的

related UT moved/closed 後の exact count を 1 回で確定する。

#### 手順

1. related UT row の moved/closed を反映する。
2. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md` を実行する。
3. current count を `task-workflow.md` / workflow spec / Phase 12 outputs に転記する。

#### 成果物

- current exact count
- 更新対象一覧

#### 完了条件

- `.claude` 正本で current exact count が 1 値に確定している。

### Phase B: related UT 同期

#### 目的

exact count と follow-up UT を system spec / outputs へ同値反映する。

#### 手順

1. `task-workflow.md` に related 未タスク row を追加する。
2. `workflow-workspace-parent-reference-sweep-guard.md` と `lessons-learned.md` に同 UT を追加する。
3. `unassigned-task-detection.md` / `spec-update-summary.md` / `phase12-task-spec-compliance-check.md` を current count へ更新する。

#### 成果物

- 更新済み system spec
- 更新済み Phase 12 outputs

#### 完了条件

- related UT と exact count が対象文書で一致している。

### Phase C: mirror sync と検証

#### 目的

`.claude` と `.agents` の source 差分による count 不整合を除去する。

#### 手順

1. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する。
2. `rsync -a .claude/skills/aiworkflow-requirements/ .agents/skills/aiworkflow-requirements/` を実行する。
3. `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` を実行する。
4. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` と `audit-unassigned-tasks.js --json --diff-from HEAD --target-file ...` を実行する。

#### 成果物

- index 再生成結果
- mirror sync 記録
- 検証ログ

#### 完了条件

- `verify-unassigned-links` が source 既定値でも PASS し、target-file audit の `currentViolations.total = 0` を満たす。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] related UT moved/closed 後の exact count 再取得順が明文化されている
- [ ] `task-workflow.md` / workflow spec / Phase 12 outputs の exact count が一致している
- [ ] new follow-up UT が `docs/30-workflows/unassigned-task/` に配置されている

### 品質要件

- [ ] `.claude` と `.agents` の `diff -qr` が差分なし
- [ ] `verify-unassigned-links` が PASS
- [ ] `audit-unassigned-tasks --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-imp-phase12-related-ut-exact-count-resync-guard-001.md` で `currentViolations.total = 0`

### ドキュメント要件

- [ ] `task-workflow.md` に関連未タスクとして登録されている
- [ ] `lessons-learned.md` に関連未タスクとして登録されている
- [ ] `workflow-workspace-parent-reference-sweep-guard.md` と Phase 12 outputs に current count が反映されている

## 6. 検証方法

### テストケース

- Case 1: related UT row moved/closed 後に current count が 1 値へ再同期される
- Case 2: `.claude` のみ更新した状態では `.agents` 既定 source が stale になり、mirror sync 後に解消される
- Case 3: 新規未タスク追加後も `audit --target-file` の `currentViolations.total = 0` を維持できる
- Case 4: 対象文書群の exact count 表記を grep で横断確認できる

### 検証手順

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
rsync -a .claude/skills/aiworkflow-requirements/ .agents/skills/aiworkflow-requirements/
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-imp-phase12-related-ut-exact-count-resync-guard-001.md
rg -n "220 / 220|total 220 / missing 0|UT-IMP-PHASE12-RELATED-UT-EXACT-COUNT-RESYNC-GUARD-001" \
  .claude/skills/aiworkflow-requirements/references/task-workflow.md \
  .claude/skills/aiworkflow-requirements/references/workflow-workspace-parent-reference-sweep-guard.md \
  docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-12
```

## 7. リスクと対策

| リスク                                                      | 影響度 | 発生確率 | 対策                                                                                |
| ----------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------- |
| exact count を 1 文書だけ更新して不整合が残る               | 高     | 中       | 更新対象を `task-workflow` / workflow spec / Phase 12 outputs の 3 系統で固定する   |
| `.claude` 正本と `.agents` mirror の差分で count が食い違う | 高     | 中       | `rsync + diff -qr` を必須手順にする                                                 |
| baseline backlog を今回差分 fail と誤認する                 | 中     | 中       | `audit --diff-from HEAD` の `current` を合否、`baseline` を監視値として分離記録する |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-workspace-parent-reference-sweep-guard.md`
- `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-12/unassigned-task-detection.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
- `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
related unassigned row を completed 実績へ移した後に exact count が stale になる。
row 移動後の再実行、mirror sync、summary/system spec への同値転記を 1 手順として固定する。
```

### 補足事項

このタスクは `verify-unassigned-links.js` の既定 source が `.agents/.../task-workflow.md` であることを前提に、count source の切り替わりを誤解しない運用ガードを目的とする。
