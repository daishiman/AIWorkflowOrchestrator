# UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001: runtime workflow failure verify artifact append 是正

## メタ情報

```yaml
issue_number: 1652
task_id: UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001
task_name: runtime workflow failure verify artifact append 是正
category: バグ修正
target_feature: SkillCreatorWorkflowEngine の failure lifecycle artifact 履歴
priority: 高
scale: 小規模
status: 未実施
source_phase: UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 Phase 12 再レビュー / 2回確認
created_date: 2026-03-26
dependencies:
  [UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001, TASK-SDK-02]
```

| 項目         | 内容                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001                                 |
| タスク名     | runtime workflow failure verify artifact append 是正                               |
| 分類         | バグ修正                                                                           |
| 対象機能     | `SkillCreatorWorkflowEngine.recordExecutionFailure()` の artifact 追記             |
| 優先度       | 高                                                                                 |
| 見積もり規模 | 小規模                                                                             |
| ステータス   | 未実施                                                                             |
| 発見元       | UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 Phase 12 再レビュー / 2回確認 |
| 発見日       | 2026-03-26                                                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001` では phase artifact 履歴を append 正本へ揃える方針を採用した。しかし実装確認で、成功系は `verify_result` を append する一方、失敗系は `verifyResult` state のみを更新し、履歴へ記録していないことが判明した。

### 1.2 問題点・課題

- `recordExecutionFailure()` が `verify_result` artifact を追加していない
- consumer が `phaseArtifacts` を正本として読むと、失敗時の verify 判定履歴が欠落する
- ownership matrix と implementation guide は append 正本前提で説明しており、code と docs が不一致になる

### 1.3 放置した場合の影響

- Task04 / Task08 が failure attempt の履歴を正しく再構成できない
- repeated failure 時に latest accessor 前提が崩れる
- review で「state は fail なのに artifact に fail 記録がない」矛盾が再発する

---

## 2. 何を達成するか（What）

### 2.1 目的

失敗系でも success 系と同じ粒度で verify 判定履歴を append し、phase artifact を canonical source of truth として成立させる。

### 2.2 最終ゴール

- `recordExecutionFailure()` が fail verify summary を `verify_result` artifact として append する
- facade / engine テストで failure 時の `verify_result` 追記を検証する
- parent workflow 文書と implementation guide の append 前提が code と一致する

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` の failure artifact 是正
- `SkillCreatorWorkflowEngine.test.ts` の failure artifact 回帰テスト追加
- `RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` の failure artifact 確認追加

#### 含まないもの

- shared/public 型の同期
- Phase 12 完了記録の是正
- UI 実装や screenshot 追加

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `phaseArtifacts` を append 正本として扱う契約が親 workflow 文書で固定済みである
- `recordExecutionFailure()` 呼び出しは execute phase 中のみである

### 3.2 必要な知識

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts`
- `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-2/ownership-matrix.md`

### 3.3 推奨アプローチ

1. fail verify summary を `state.verifyResult` に代入した直後に `verify_result` artifact を append する
2. failure path のテストで `execute_result` と `verify_result` の両方を確認する
3. repeated failure でも `execute_result` と `verify_result` の対が増えることを確認する

### 3.4 苦戦箇所

| ID     | 内容                                                                                                          | 解決策                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| S-VA-1 | state と artifact を別々に更新していたため、成功系だけが十分に見えて failure 側の履歴欠落を見落としやすかった | workflow 系レビューでは `state` と `phaseArtifacts` を常に対で確認し、片方だけの PASS を認めない |
| S-VA-2 | failure テストが state 検証中心で、artifact 正本戦略の崩れを捕捉できなかった                                  | test matrix に `artifact.kind` 検証を固定観点として追加する                                      |

---

## 4. 実行手順

### Step 1: failure artifact 追記

1. `recordExecutionFailure()` で `state.verifyResult` を構築する
2. 同じ payload を `verify_result` artifact として append する
3. `resumeTokenEnvelope.artifactCount` が期待通り増えることを確認する

### Step 2: テスト追加

1. engine failure テストで `verify_result` artifact 数を検証する
2. facade failure テストで `execute_result` と `verify_result` の両方を検証する
3. repeated failure テストで artifact の増分を確認する

### Step 3: targeted verification

```bash
ESBUILD_BINARY_PATH="$PWD/node_modules/.pnpm/@esbuild+darwin-arm64@0.21.5/node_modules/@esbuild/darwin-arm64/bin/esbuild" pnpm vitest apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts --run
```

---

## 5. 完了条件

- [ ] failure path で `verify_result` artifact が append される
- [ ] engine テストで failure 時の `verify_result` 追記を検証している
- [ ] facade テストで failure 時の artifact 正本を検証している
- [ ] append 正本契約と code / tests が一致している

## 6. 関連タスク

| タスクID                                             | 関係           | 説明                                   |
| ---------------------------------------------------- | -------------- | -------------------------------------- |
| UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 | 親タスク       | failure lifecycle 是正本体             |
| TASK-SDK-02                                          | 親ワークフロー | workflow engine orchestration 基礎契約 |
