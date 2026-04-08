# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 6                                                   |
| Phase 名   | テスト拡充                                          |
| 前提 Phase | Phase 5（実装）                                     |
| 後続 Phase | Phase 7（カバレッジ確認）                           |
| ステータス | 未実施                                              |
| 作成日     | 2026-04-08                                          |
| 機能名     | task-ut-rt-01-exhaustive-check-execute-response-001 |

---

## 目的

Phase 4 で作成した TC-01〜TC-05 に加え、edge case・回帰ガード・エラーメッセージ伝搬の詳細テストを追加し、`classifyExecuteResult()` / `extractExecuteErrorMessage()` / `executeAsync()` の動作を包括的に検証する。

## 背景

TC-01〜TC-04 は正常系・基本異常系のカバレッジを担保するが、error message 正規化と terminal_handoff の境界はまだ薄い。Phase 6 でこれらを追加することで Phase 7 のカバレッジ目標を達成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `Phase 実行記録` へ記録する。

### タスク 1: エラーメッセージ伝搬テストの追加

**目的**: `error` ケースで `onWorkflowStateSnapshot` に正しい error メッセージが渡されることを詳細に検証する。

**実行手順**:

1. 以下のテストケースを追加する：

   **TC-06**: `RuntimeSkillCreatorExecuteErrorResponse` の errorMessage が `onWorkflowStateSnapshot` に渡される

   ```typescript
   it("TC-06: ErrorResponse の error.message が onWorkflowStateSnapshot に渡される", async () => {
     const errorMessage = "LLM adapter unavailable: test-error";
     // execute() が error.message = errorMessage の ErrorResponse を返すようにモック
     // onWorkflowStateSnapshot が error === errorMessage で呼ばれていることを確認
   });
   ```

   **TC-07**: `success:false` かつ詳細 error がない場合は fallback message が渡される

   ```typescript
   it("TC-07: success:false かつ詳細 error がない場合は fallback message が渡される", async () => {
     // execute() が RuntimeSkillCreatorExecuteResult (success: false, error なし) を返す
     // onWorkflowStateSnapshot の第3引数が "Unknown execute error" であることを確認
   });
   ```

**期待される成果物**:

- TC-06・TC-07 のテストコード

---

### タスク 2: classifyExecuteResult と error 正規化の境界値テスト

**目的**: `classifyExecuteResult()` の 3 outcome 判定と `extractExecuteErrorMessage()` の fallback が境界値でも正しく動作することを確認する。

**実行手順**:

1. 以下の境界値テストを追加する：

   **TC-08**: `terminal_handoff` と `success` を混同しないか

   ```typescript
   it("TC-08: terminal_handoff を success と誤判定しない", async () => {
     // execute() が terminal_handoff を返すようにモック
     // executeAsync() を呼び出し、phase が complete かつ error が伝搬しないことを確認
   });
   ```

   **TC-09**: `success: false` で詳細 error がない場合は fallback message を返す

   ```typescript
   it("TC-09: success:false で詳細 error がない場合は fallback message を返す", async () => {
     // execute() が RuntimeSkillCreatorExecuteResult (success: false, 詳細 error なし) を返す
     // onWorkflowStateSnapshot の第3引数が "Unknown execute error" であることを確認
   });
   ```

2. `classifyExecuteResult()` が直接テストできない場合は、`executeAsync()` 経由での動作確認に切り替える

**期待される成果物**:

- TC-08・TC-09 のテストコード（またはその等価な統合テスト）

---

### タスク 3: リグレッションガードテストの確認

**目的**: 親タスク（`TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001`）のテストが全て引き続き PASS することを確認する。

**実行手順**:

1. 親タスクのテストスイートを実行する：

   ```bash
   pnpm --filter @repo/desktop test -- --reporter=verbose \
     src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
   ```

2. 失敗したテストがあれば、switch 化による動作変更が原因かを調査し修正する

3. 全テストスイートを実行してリグレッションがないことを確認する：

   ```bash
   pnpm --filter @repo/desktop test
   ```

**期待される成果物**:

- リグレッションガード確認記録（親テスト全件 PASS）

---

### タスク 4: TC-05 型テストの完成

**目的**: Phase 4 で skeleton として作成した TC-05（exhaustive check の型テスト）を完成させる。

**実行手順**:

1. Phase 4 の TC-05 方針（`@ts-expect-error` or 一時的な union 拡張）を実行する
2. exhaustive check が機能していることを記録する（ローカル確認で十分）
3. 型テストを最終的な形でテストファイルに追加する（またはコメントとして記録する）

**期待される成果物**:

- TC-05 完成記録

---

## 参照資料

| 参照資料                         | パス                                                                                              | 内容                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------- |
| Phase 4 実行記録（テストコード） | 本ワークフロー Phase 4 完了記録                                                                   | TC-01〜TC-05 のテストコード |
| Phase 5 実行記録                 | 本ワークフロー Phase 5 完了記録                                                                   | 実装内容                    |
| 既存テストファイル（親タスク）   | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | リグレッション確認対象      |

---

## 成果物

| 成果物                 | パス                                                                                                         | 内容                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| 拡充テストファイル     | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.exhaustive.test.ts` | TC-06〜TC-09 追加済み        |
| リグレッション確認記録 | （Phase 実行記録）                                                                                           | 親タスクテスト全件 PASS 確認 |

---

## 統合テスト連携

- 追加テストで edge case（errorMessage 伝搬・境界値判定）を網羅する。
- 親タスクテストのリグレッションがないことを確認する。

---

## 完了条件

- [ ] TC-06（errorMessage 伝搬）テストが追加・PASS している
- [ ] TC-07（success:false の fallback errorMessage）テストが追加・PASS している
- [ ] TC-08・TC-09（境界値）テストが追加・PASS している（またはその等価な確認）
- [ ] TC-05 型テストが完成・記録されている
- [ ] 親タスクテストがリグレッションなく PASS している

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## Phase 実行記録

Phase 完了後、以下を記録してください：

```markdown
## Phase 6 実行記録

### 実行タスク

- タスク 1 エラーメッセージ伝搬テスト: [TC-06・TC-07 追加・PASS確認]
- タスク 2 境界値テスト: [TC-08・TC-09 追加・PASS確認]
- タスク 3 リグレッションガード確認: [親テスト件数・PASS/FAIL]
- タスク 4 TC-05 型テスト完成: [完成方針と記録]

### テストサマリー

- 新規追加テスト件数: N 件
- 総テスト件数: N 件
- 全件 PASS: Yes/No

### 次 Phase への引き継ぎ事項

-
```

---

## 次の Phase

完了後、以下のファイルを実行してください：

`docs/30-workflows/task-ut-rt-01-exhaustive-check-execute-response-001/phase-7-coverage-check.md`
