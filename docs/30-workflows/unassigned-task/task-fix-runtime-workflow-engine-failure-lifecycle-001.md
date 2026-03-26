# UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001: Runtime workflow engine の失敗系 state lifecycle 是正

## メタ情報

```yaml
issue_number: 1646
task_id: UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001
task_name: Runtime workflow engine の失敗系 state lifecycle 是正
category: バグ修正
target_feature: Runtime Skill Creator workflow engine の execute/verify/review 遷移
priority: 高
scale: 中規模
status: 未実施
source_phase: TASK-SDK-02 Phase 12 レビュー / 2回確認
created_date: 2026-03-26
dependencies: [TASK-SDK-02]
```

| 項目         | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001                                |
| タスク名     | Runtime workflow engine の失敗系 state lifecycle 是正                               |
| 分類         | バグ修正                                                                            |
| 対象機能     | `RuntimeSkillCreatorFacade.execute()` と `SkillCreatorWorkflowEngine` の phase 遷移 |
| 優先度       | 高                                                                                  |
| 見積もり規模 | 中規模                                                                              |
| ステータス   | 未実施                                                                              |
| 発見元       | TASK-SDK-02 Phase 12 レビュー / 2回確認                                             |
| 発見日       | 2026-03-26                                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-SDK-02` は `SkillCreatorWorkflowEngine` を workflow state owner として新設したが、レビューで execute 失敗系と verify 再レビュー系の遷移が未完成であることが判明した。

### 1.2 問題点・課題

- `skillExecutor.execute()` が reject すると state が `execute` のまま残り、失敗 artifact と `verifyResult` が保存されない
- `success: false` の execute 結果でも `verify/pending` に遷移し、UI が「検証待ち」と誤認する
- `verification_review` reason は型定義だけ存在し、`awaitingUserInput` が生成されない
- invalid transition guard がなく、`plan -> verify` などの飛び越し遷移を防げない
- ownership matrix は phase artifacts を append 前提で説明しているが、実装は upsert で履歴が失われる

### 1.3 放置した場合の影響

- Task04 / Task08 が依存する resume / review / retry 契約が壊れる
- Renderer が review ではなく verify pending と誤表示し、後続 UI 設計がドリフトする
- 失敗時の source of truth が残らず、再現性と監査性が落ちる

---

## 2. 何を達成するか（What）

### 2.1 目的

workflow engine を「正常系だけ通る箱」ではなく、失敗系でも一貫した state owner として成立させる。

### 2.2 最終ゴール

- reject / `success:false` / verify fail review の全経路で `currentPhase`、`awaitingUserInput`、`verifyResult`、artifacts が一貫して保存される
- invalid transition が reject され、誤った phase jump が防止される
- append 前提の artifact 履歴と actual 実装が一致する

### 2.3 スコープ

#### 含むもの

- `RuntimeSkillCreatorFacade.execute()` の reject path 整理
- `SkillCreatorWorkflowEngine` の phase guard 追加
- `verification_review` の prompt / reason 実装
- execute fail / retry / review 系テスト追加
- artifact 履歴の append 方式または仕様文言のどちらかを正本に揃える

#### 含まないもの

- Task04 の UI 実装本体
- session persistence の永続化実装
- terminal handoff surface のデザイン改善

### 2.4 成果物

- workflow engine / facade の修正コード
- 失敗系を含む unit test 更新
- TASK-SDK-02 文書内の ownership / transition 記述是正

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-SDK-02` の現行コードと review findings を確認済みである
- Task04 / Task08 が `awaitingUserInput` と `resumeTokenEnvelope` に依存することを理解している

### 3.2 依存タスク

- TASK-SDK-02（親タスク）

### 3.3 必要な知識

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-2/ownership-matrix.md`
- `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-6-test-expansion.md`
- `.agents/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`

### 3.4 推奨アプローチ

1. state machine の正本を `ownership-matrix.md` と code の両方で固定する
2. reject / fail / review を明示的な API に分け、暗黙遷移をなくす
3. 「append を維持する」か「latest snapshot にする」かを決め、文書と実装を同時更新する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                            | 発見経緯                                                                                | 解決策                                                                      | 教訓                                                                    |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| validator が通っても state machine の欠陥は残る | `verify-all-specs` と targeted vitest は PASS したが、レビューで reject path 欠落を検出 | 正常系 PASS を完了条件にせず、失敗系 transition を専用テストで固定する      | workflow task は設計文書 PASS と state machine 正当性を分離して確認する |
| review 用 reason が型定義だけ先行した           | `verification_review` が宣言済みでも prompt 未実装だった                                | enum 追加だけで終えず、consumer が必要とする payload まで同ターンで実装する | 型追加は consumer contract まで閉じて初めて完了とみなす                 |
| owner matrix と実装の履歴戦略がズレた           | 文書は append、実装は upsert だった                                                     | append / upsert のどちらを正本にするか明示し、Task08 依存まで再確認する     | ownership matrix は実装注釈ではなく契約なので、曖昧語を残さない         |

---

## 4. 実行手順

### Phase A: 失敗系契約の固定

#### 目的

execute / verify / review の失敗時契約を定義し直す。

#### 手順

1. reject、`success:false`、verify fail review の3経路を表に整理する
2. `currentPhase`、`awaitingUserInput`、`verifyResult`、artifact 保存方針を各経路で定義する
3. append / upsert 方針を決め、ownership matrix を更新する

#### 成果物

- 契約表
- ownership / transition 文書更新

#### 完了条件

- 3経路すべてで state 保存仕様が一意に決まっている

### Phase B: コード修正

#### 目的

workflow engine と facade を契約どおりに実装する。

#### 手順

1. `execute()` の reject path を `try/catch` で捕捉する
2. `success:false` 専用の遷移 API または分岐を追加する
3. `recordVerifyFailure(..., "review")` で `verification_review` prompt を生成する
4. invalid transition guard を追加する
5. artifact 戦略に応じて append / upsert を修正する

#### 成果物

- facade / engine 修正コード

#### 完了条件

- reject / fail / review の全ケースで state snapshot が壊れない

### Phase C: テストと文書同期

#### 目的

再発防止のためのテストと文書同期を完了する。

#### 手順

1. reject path、`success:false` path、`verification_review` path、invalid transition path のテストを追加する
2. `phase-6-test-expansion.md` の要求観点が実テストに反映されたことを確認する
3. 必要なら Task04 仕様書への handoff 前提文言も更新する

#### 成果物

- 追加テスト
- 同期済み文書

#### 完了条件

- failure lifecycle を検証する targeted vitest が追加されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `skillExecutor.execute()` reject 時も workflow state が保存される
- [ ] `success:false` で `verify/pending` に遷移しない
- [ ] `verification_review` で `awaitingUserInput` が生成される
- [ ] invalid transition が拒否される

### 品質要件

- [ ] execute / verify failure 系の unit test が追加されている
- [ ] artifact 履歴戦略が実装と文書で一致している
- [ ] Task04 / Task08 の前提を壊していない

### ドキュメント要件

- [ ] `ownership-matrix.md` と phase 文書が実装に同期している
- [ ] 親タスクの unassigned / changelog に本未タスクが参照される

---

## 6. 検証方法

### テストケース

- Case 1: executor reject 時に `currentPhase` が失敗系の正しい状態へ遷移する
- Case 2: `success:false` 実行結果で `verify.pending` にならない
- Case 3: verify fail review 時に `awaitingUserInput.reason === "verification_review"` になる
- Case 4: invalid transition 呼び出しでエラーまたは拒否結果を返す

### 検証手順

```bash
ESBUILD_BINARY_PATH=$PWD/node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/bin/esbuild \
  pnpm vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```

---

## 7. リスクと対策

| リスク                                              | 影響度 | 発生確率 | 対策                                                                                      |
| --------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------- |
| Task04 が期待する snapshot shape を壊す             | 高     | 中       | shared contract と Task04 spec を同時参照し、フィールド追加時は downstream 影響を確認する |
| append 化で既存テストが大量に壊れる                 | 中     | 中       | 履歴戦略を先に決め、snapshot 比較を helper 化する                                         |
| reject path 対応だけで `success:false` 誤遷移が残る | 高     | 中       | exception 系と result 系を別ケースとしてテストに固定する                                  |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-2/ownership-matrix.md`
- `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-6-test-expansion.md`
- `.agents/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`

### 参考資料

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`

---

## 9. 備考

### レビュー指摘の原文（要約）

> execute reject 時に state が `execute` のまま壊れる。  
> `success:false` でも `verify/pending` に進む。  
> `verification_review` が死んでおり、invalid transition も守られていない。
