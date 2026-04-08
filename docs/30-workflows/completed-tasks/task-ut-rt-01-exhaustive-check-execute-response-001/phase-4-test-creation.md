# Phase 4: テスト作成（TDD Red）- タスク仕様書

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 4                                                   |
| Phase 名   | テスト作成（TDD Red）                               |
| 前提 Phase | Phase 3（設計レビューゲート）                       |
| 後続 Phase | Phase 5（実装）                                     |
| ステータス | 未実施                                              |
| 作成日     | 2026-04-08                                          |
| 機能名     | task-ut-rt-01-exhaustive-check-execute-response-001 |

---

## 目的

`classifyExecuteResult()` は module-local helper であるため、`executeAsync()` の観測可能な振る舞いを主軸にユニットテストを作成する。テストが失敗することを確認してから Phase 5 の実装に進む。

## 背景

Phase 3 で設計した TC-01〜TC-05 をテストコードとして実装する。TDD パターンに従い、まず失敗するテスト（Red）を作成することで、Phase 5 での実装が正しいことをテストが Green になることで検証できる。

> **[Feedback P0-09-U1]** module-local helper は public seam 経由で検証し、型レベルの exhaustive check は typecheck で担保する方針を本仕様書に明記する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `Phase 実行記録` へ記録する。

### タスク 1: テスト環境確認と既存テストファイル調査

**目的**: 既存のテストファイルと命名規則を確認し、新しいテストファイルの配置方針を決定する。

**実行手順**:

1. `apps/desktop/src/main/services/runtime/__tests__/` ディレクトリを確認し、既存テストファイル一覧を確認する
2. 親タスクのテストファイル（`RuntimeSkillCreatorFacade.executeAsync.test.ts`）の構造を確認する
3. テスト記述スタイル（describe/it/beforeEach パターン）を把握する
4. 新テストファイルを既存ファイルに追記するか新規作成するかを決定する：
   - 既存 `RuntimeSkillCreatorFacade.executeAsync.test.ts` に追記、または
   - 新規 `RuntimeSkillCreatorFacade.executeAsync.exhaustive.test.ts` を作成

**期待される成果物**:

- テストファイル配置方針の決定（Phase 実行記録）

---

### タスク 2: module-local helper のテスト方針の明記

**目的**: `classifyExecuteResult()` が module-local helper である前提で、テスト方針を確定する。

**実行手順**:

1. `classifyExecuteResult()` が module-local helper であり、直接 public API では呼ばれないことを Phase 2 設計書で確認する
2. テスト方針を以下から選択し記録する：
   - **方針 A**: `executeAsync()` パブリックメソッド経由での動作検証（推奨）
   - **方針 B**: typecheck / `@ts-expect-error` を使った exhaustive check の型レベル確認
3. 選択した方針と理由を Phase 実行記録に明記する

**期待される成果物**:

- プライベートメソッドテスト方針の記録

---

### タスク 3: TC-01〜TC-04 テストコード作成（TDD Red）

**目的**: `executeAsync()` の各 union ケースに対応するユニットテストを作成し、失敗（Red）状態を確認する。

**実行手順**:

1. テストファイルを作成する（`RuntimeSkillCreatorFacade.executeAsync.exhaustive.test.ts` または既存ファイルへの追記）
2. 以下のテストケースを実装する：

   **TC-01**: `success: true` ケース（ExecuteResult 成功）

   ```typescript
   it("TC-01: execute が success:true を返す場合、phase が complete に遷移する", async () => {
     // execute() が RuntimeSkillCreatorExecuteResult (success: true) を返すようにモック
     // executeAsync() を呼び出し
     // onWorkflowStateSnapshot の最後の呼び出しで phase === "complete" を確認
   });
   ```

   **TC-02**: `success: false` ケース（ExecuteResult 実行失敗）

   ```typescript
   it("TC-02: execute が success:false (ExecuteResult) を返す場合、phase が error に遷移する", async () => {
     // execute() が RuntimeSkillCreatorExecuteResult (success: false, 詳細 error なし) を返すようにモック
     // executeAsync() を呼び出し
     // onWorkflowStateSnapshot の最後の呼び出しで phase === "error" を確認
   });
   ```

   **TC-03**: `RuntimeSkillCreatorExecuteErrorResponse` ケース（error message 伝搬）

   ```typescript
   it("TC-03: execute が ErrorResponse を返す場合、phase が error に遷移し errorMessage が伝搬する", async () => {
     // execute() が RuntimeSkillCreatorExecuteErrorResponse を返すようにモック
     // executeAsync() を呼び出し
     // onWorkflowStateSnapshot に error 引数が渡されていることを確認
   });
   ```

   **TC-04**: `terminal_handoff` ケース

   ```typescript
   it("TC-04: execute が terminal_handoff を返す場合、適切なフェーズ遷移が行われる", async () => {
     // execute() が { type: "terminal_handoff", bundle: ... } を返すようにモック
     // executeAsync() を呼び出し
     // 既存の terminal_handoff 処理と等価な動作を確認
   });
   ```

3. `pnpm --filter @repo/desktop test` を実行し、作成したテストが **失敗（Red）** することを確認する
4. 失敗していない場合は実装が既にあることを意味するため、その旨を記録する

**期待される成果物**:

- TC-01〜TC-04 のテストコード（Red 状態）
- テスト失敗確認記録

---

### タスク 4: TC-05 型テスト作成

**目的**: `assertNever` の exhaustive check が機能することを確認する型レベルテストを作成する。

**実行手順**:

1. 型テストの方針を確定する：
   - **方針 A**: 一時的に `RuntimeSkillCreatorExecuteResponse` に新しい union メンバーを追加してコンパイルエラーが発生することをローカルで確認（実装 Phase で確認し、その後元に戻す）
   - **方針 B**: `@ts-expect-error` コメントを使った型テスト（vitest の `expectTypeOf` 利用）

2. TC-05 の実装方針を Phase 実行記録に記録する

3. 型テストコードの skeleton を作成する

**期待される成果物**:

- TC-05 型テストの skeleton または実装方針記録

---

## 参照資料

| 参照資料                       | パス                                                                                              | 内容                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 2 実行記録（テスト設計） | 本ワークフロー Phase 2 完了記録                                                                   | TC-01〜TC-05 設計表          |
| Phase 3 実行記録               | 本ワークフロー Phase 3 完了記録                                                                   | レビュー判定と指摘事項       |
| 既存テストファイル             | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | テスト構造の参考             |
| RuntimeSkillCreatorFacade.ts   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | executeAsync() の現行実装    |
| skillCreator.ts                | `packages/shared/src/types/skillCreator.ts`                                                       | ExecuteResponse union 型定義 |

---

## 成果物

| 成果物                | パス                                                                                                         | 内容                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------- |
| テストファイル（Red） | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.exhaustive.test.ts` | TC-01〜TC-05 のテストコード |
| 失敗確認記録          | （Phase 実行記録）                                                                                           | Red 状態のテスト出力        |

---

## 統合テスト連携

- 各 union ケース（3 outcome）のテストシナリオと error message 正規化を作成する。
- 親タスクのテスト（`RuntimeSkillCreatorFacade.executeAsync.test.ts`）が引き続き PASS することを確認する。

---

## 完了条件

- [ ] テストファイルの配置方針が決定している
- [ ] プライベートメソッドのテスト方針が明記されている
- [ ] TC-01〜TC-04 のテストコードが作成されている
- [ ] 作成したテストが失敗（Red）状態であることが確認されている
- [ ] TC-05 の型テスト方針が記録されている

---

## TDD 検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --reporter=verbose \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.exhaustive.test.ts
```

**確認項目**:

- [ ] テストが失敗することを確認（Red 状態）

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が PASS/MINOR で完了していること
- **後続**: Phase 5（実装）へ進む

---

## Phase 実行記録

Phase 完了後、以下を記録してください：

```markdown
## Phase 4 実行記録

### 実行タスク

- タスク 1 テスト環境確認: [結果]
- タスク 2 プライベートメソッドテスト方針: [選択した方針と理由]
- タスク 3 TC-01〜TC-04 作成: [テスト件数・失敗確認]
- タスク 4 TC-05 型テスト: [方針と skeleton]

### テスト失敗確認

- テスト件数: N 件
- 失敗件数: N 件（全件失敗で Red 確認）

### 次 Phase への引き継ぎ事項

-
```

---

## 次の Phase

完了後、以下のファイルを実行してください：

`docs/30-workflows/task-ut-rt-01-exhaustive-check-execute-response-001/phase-5-implementation.md`
