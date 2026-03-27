# TASK-IMP-TASK-SPEC-STALE-PATH-DUPLICATE-SOURCE-GUARD-001: docs-only workflow の stale path / duplicate source ガード追加

## メタ情報

```yaml
issue_number: 1673
task_id: TASK-IMP-TASK-SPEC-STALE-PATH-DUPLICATE-SOURCE-GUARD-001
task_name: docs-only workflow の stale path / duplicate source ガード追加
category: 改善
target_feature: task-specification-creator / verify-all-specs / docs-only workflow guard
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-EXEC-01 Phase 12 skill feedback + branch 2回確認
created_date: 2026-03-27
dependencies:
  - task-specification-creator
  - aiworkflow-requirements
spec_path: docs/30-workflows/unassigned-task/task-imp-task-spec-stale-path-duplicate-source-guard-001.md
```

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| タスクID     | TASK-IMP-TASK-SPEC-STALE-PATH-DUPLICATE-SOURCE-GUARD-001                       |
| タスク名     | docs-only workflow の stale path / duplicate source ガード追加                 |
| 分類         | 改善                                                                           |
| 対象機能     | `task-specification-creator` / `verify-all-specs.js` / docs-only workflow 運用 |
| 優先度       | 中                                                                             |
| 見積もり規模 | 中規模                                                                         |
| ステータス   | 未実施                                                                         |
| 発見元       | UT-EXEC-01 Phase 12 skill feedback + branch 2回確認                            |
| 発見日       | 2026-03-27                                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-EXEC-01` の実行では、source unassigned 文書が `docs/30-workflows/ai-runtime-execution-responsibility-realignment/scope-definition.md` を target としていたが、current worktree にそのパスは存在しなかった。さらに duplicate source 文書も残っており、actual target は人手で `completed-tasks/.../outputs/phase-1/scope-definition.md` を突き止める必要があった。

### 1.2 問題点・課題

- `verify-all-specs.js` は phase 依存や構造整合は検出できるが、docs-only workflow の source path が stale でも自動では止められない
- duplicate source 文書が残っていても、actual target を 1 つに固定する guard が標準化されていない
- Phase 12 の skill feedback に「target path existence の自動チェック」「duplicate source doc 検出の組み込み」が残った

### 1.3 放置した場合の影響

- docs-only follow-up task で誤ファイルへ追記する再発リスクが残る
- validator が PASS でも、運用者が stale path を手作業で読み解く必要があり review cost が高い
- `unassigned-task` と workflow root の path drift が再び後工程へ流入する

---

## 2. 何を達成するか（What）

### 2.1 目的

docs-only workflow に対して、source / target / duplicate source の関係を機械検証できる最小ガードを `task-specification-creator` に追加する。

### 2.2 最終ゴール

1. source として記載した target path が実在しない場合、workflow 検証で warning 以上として検出される
2. duplicate source 文書が存在する場合、actual target decision の明記有無を検証できる
3. docs-only workflow の implementation guide / verification-report に、target existence check を標準手順として残せる
4. `UT-EXEC-01` 型の誤着手を、個別判断ではなくガード済み運用で防げる

### 2.3 スコープ

#### 含むもの

- `verify-all-specs.js` または補助 audit による stale path / duplicate source 検知
- docs-only workflow 向け reference / template / validation rule の追加
- target path existence check の標準手順化

#### 含まないもの

- 全 workflow の全面再監査
- GitHub Issue 管理側の同期ロジック修正
- `aiworkflow-requirements` 側の既存 completed workflow 全件書き換え

### 2.4 成果物

- validator または audit の追加修正
- docs-only workflow 向けガード手順の文書化
- 再現ケースを使った検証ログ

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の `verify-all-specs.js` と関連 reference を編集できること
- stale path / duplicate source を含む再現ケースとして `UT-EXEC-01` を参照できること
- `aiworkflow-requirements` の workflow 正本を必要最小限で参照できること

### 3.2 依存タスク

- `UT-EXEC-01`
- `TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001`

### 3.3 必要な知識

- `.agents/skills/task-specification-creator/scripts/verify-all-specs.js`
- `.agents/skills/task-specification-creator/references/spec-update-validation-matrix.md`
- `.agents/skills/task-specification-creator/references/spec-update-workflow.md`
- `.agents/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md`

### 3.4 推奨アプローチ

1. `UT-EXEC-01` を再現ケースとして、stale source path と actual target decision の差を固定する
2. validator 本体へ入れるか、補助 audit として切り出すかを責務ベースで決める
3. `warning は根拠付きで 0 へ寄せる` 既存方針に合わせ、current な stale path は必ず検出対象にする
4. reference / template / verification-report の標準手順を同一ターンで同期する

### 3.5 苦戦箇所

| ID     | 内容                                                                               | 解決策                                                   |
| ------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| TSG-01 | source task の path を信じると current worktree に存在しない target を追ってしまう | existence check を first gate にする                     |
| TSG-02 | duplicate source があると「どれを正本と見るか」を人手で判断する必要がある          | actual target decision の明記を validator 条件へ昇格する |
| TSG-03 | `verify-all-specs` PASS でも docs-only の意味的 stale が残る                       | 構造検証とは別に path ガード責務を明文化する             |

---

## 4. 実行手順

### Phase A: 再現ケース固定

#### 目的

`UT-EXEC-01` の stale path / duplicate source / actual target を再現ケースとして固定する。

#### 手順

1. source unassigned 文書 2 本と workflow root を比較する
2. actual target と reject target を一覧化する
3. guard が検出すべき条件を言語化する

#### 完了条件

- 再現ケースが 1 つの表で説明できる

### Phase B: ガード実装

#### 目的

validator か audit に stale path / duplicate source の検出を追加する。

#### 手順

1. `verify-all-specs.js` へ追加するか、別 audit を追加するか決める
2. current workflow の source / target 記述から path existence を判定する
3. duplicate source の場合、actual target decision 記述の有無を判定する

#### 完了条件

- current stale path を自動検出できる

### Phase C: reference / template 同期

#### 目的

再発防止を運用手順として残す。

#### 手順

1. docs-only workflow 向け reference に target existence check を追記する
2. `spec-update-validation-matrix.md` へ必要コマンドを追加する
3. `verification-report.md` の標準記録項目を更新する

#### 完了条件

- 新規 workflow 作成時点で guard 手順を再利用できる

### Phase D: 検証

#### 目的

追加ガードが false positive を増やさず、`UT-EXEC-01` 型だけを確実に拾えることを確認する。

#### 手順

1. 再現ケースで validator / audit を実行する
2. 正常 workflow でも回し、過剰検出がないことを確認する
3. 結果を report に残す

#### 完了条件

- 再現ケースは検出、正常ケースは PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] stale path が current workflow で検出される
- [ ] duplicate source がある場合に actual target decision の有無を評価できる
- [ ] docs-only workflow の標準手順に existence check が追加される

### 品質要件

- [ ] `UT-EXEC-01` を再現ケースとして使っている
- [ ] false positive を増やさない正常ケース確認がある
- [ ] validator と運用文書の責務境界が明確である

### ドキュメント要件

- [ ] `task-specification-creator` reference が更新されている
- [ ] 検証コマンドと結果記録先が明示されている

---

## 6. 検証方法

```bash
node .agents/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <repro-workflow> --json
node .agents/skills/task-specification-creator/scripts/validate-phase-output.js <repro-workflow>
rg -n "source|duplicate source|target path" <repro-workflow> -S
```

- Case 1: stale path を含む再現 workflow で検出される
- Case 2: duplicate source があっても actual target decision が明記されていれば PASS する
- Case 3: 正常 workflow では追加 warning が発生しない

---

## 7. 参照情報

| 種別             | パス                                                                                                              | 用途                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 再現 workflow    | `docs/30-workflows/completed-tasks/task-exec-scope-definition-path-update-001/`                                   | stale path / duplicate source の再現ケース |
| source task      | `docs/30-workflows/completed-tasks/unassigned-task/task-exec-scope-definition-path-update-001.md`                 | stale source の実例                        |
| duplicate source | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-exec-01-scope-definition-execution-capability-path.md` | duplicate source の実例                    |
| validator        | `.agents/skills/task-specification-creator/scripts/verify-all-specs.js`                                           | ガード追加候補                             |
| validation rule  | `.agents/skills/task-specification-creator/references/spec-update-validation-matrix.md`                           | warning 0 方針                             |
| system spec      | `.agents/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md`   | workflow 正本の文脈                        |

---

## 8. 備考

- 本タスクは `UT-EXEC-01` の実装修正そのものではなく、同種の誤着手を次回から機械的に防ぐ follow-up である
- commit、push、PR 作成は含まない
