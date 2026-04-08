# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 5                                                   |
| Phase 名   | 実装                                                |
| 前提 Phase | Phase 4（テスト作成）                               |
| 後続 Phase | Phase 6（テスト拡充）                               |
| ステータス | 未実施                                              |
| 作成日     | 2026-04-08                                          |
| 機能名     | task-ut-rt-01-exhaustive-check-execute-response-001 |

---

## 目的

Phase 2 の設計に従い `assertNever` ヘルパーと `classifyExecuteResult()` / `extractExecuteErrorMessage()` の役割分担を実装し、`executeAsync()` を 3 outcome の exhaustive switch に揃える。Phase 4 のテストが Green になることを確認する。

## 背景

TDD Green フェーズ。Phase 4 で作成した失敗テストを通過させるための実装を行う。既存の動作（phase 遷移・`onWorkflowStateSnapshot` 呼び出し）を維持しつつ、discriminated union の exhaustive check パターンを導入する。

> **[Feedback RT-03]** 実装計画に「新規作成」「修正」ファイルパス一覧を本仕様書に必須記載する。

---

## 実装ファイル一覧

| 種別 | ファイルパス                                                          | 変更内容                                                                  |
| ---- | --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 修正 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `assertNever` 追加・`classifyExecuteResult()` 追加・`executeAsync()` 修正 |

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `Phase 実行記録` へ記録する。

### タスク 1: assertNever ヘルパー追加

**目的**: Phase 2 で設計した `assertNever` を決定した配置場所に追加する。

**実行手順**:

1. Phase 2 実行記録で決定した配置場所（`RuntimeSkillCreatorFacade.ts` モジュールスコープ or 共有ユーティリティ）を確認する
2. `RuntimeSkillCreatorFacade.ts` のモジュールスコープに追加する場合、ファイル先頭付近（import 文の後）に以下を追加する：

   ```typescript
   function assertNever(value: never): never {
     throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
   }
   ```

3. コンパイルエラーがないことを確認する

**期待される成果物**:

- `assertNever` 関数が追加された `RuntimeSkillCreatorFacade.ts`

---

### タスク 2: classifyExecuteResult 関数実装

**目的**: Phase 2 で設計した `classifyExecuteResult()` を実装する。

**実行手順**:

1. `RuntimeSkillCreatorFacade.ts` に `ExecuteOutcome` 型と `classifyExecuteResult()` 関数を追加する：

   ```typescript
   type ExecuteOutcome = "terminal_handoff" | "error" | "success";

   function classifyExecuteResult(
     result: RuntimeSkillCreatorExecuteResponse,
   ): ExecuteOutcome {
     // Step 1: terminal_handoff の早期判定（type フィールドで判別）
     if ("type" in result && result.type === "terminal_handoff") {
       return "terminal_handoff";
     }
     // Step 2: success フィールドがある場合
     if ("success" in result) {
       return result.success === false ? "error" : "success";
     }
     // exhaustive check: 上記以外の union メンバーが追加された場合にコンパイルエラーになる
     return assertNever(result);
   }
   ```

2. `pnpm --filter @repo/desktop typecheck` を実行してコンパイルエラーがないことを確認する

**期待される成果物**:

- `classifyExecuteResult()` 関数が追加された `RuntimeSkillCreatorFacade.ts`

---

### タスク 3: executeAsync() の switch 化

**目的**: `executeAsync()` の結果分岐を `classifyExecuteResult()` ベースの exhaustive switch に置き換える。

**実行手順**:

1. `executeAsync()` メソッド内の `classifyExecuteResult()` 呼び出し位置を特定する
2. 以下のように置換する（等価な動作を維持すること）：

   ```typescript
   const outcome = classifyExecuteResult(executeResult);
   let phase: "complete" | "error";

   switch (outcome) {
     case "terminal_handoff":
       phase = "complete";
       break;
     case "error":
       phase = "error";
       this.onWorkflowStateSnapshot?.(
         planId,
         snapshot ?? null,
         extractExecuteErrorMessage(executeResult),
       );
       break;
     case "success":
       phase = "complete";
       break;
     default:
       assertNever(outcome);
   }
   ```

3. 変更前後の動作が等価であることを確認する（`onWorkflowStateSnapshot` の呼び出し引数に注意）

**期待される成果物**:

- `classifyExecuteResult()` + `switch` + `extractExecuteErrorMessage()` に置換された `executeAsync()` の実装

---

### タスク 4: TDD Green 確認

**目的**: Phase 4 で作成したテストが全て PASS（Green）になることを確認する。

**実行手順**:

1. テストを実行して Green を確認する：

   ```bash
   pnpm --filter @repo/desktop test -- --reporter=verbose \
     src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.exhaustive.test.ts
   ```

2. 親タスクのテスト（リグレッション確認）も実行する：

   ```bash
   pnpm --filter @repo/desktop test -- --reporter=verbose \
     src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
   ```

3. lint を実行する：

   ```bash
   pnpm --filter @repo/desktop lint
   ```

4. typecheck を実行する：

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

5. いずれかが失敗した場合は修正してから次のタスクに進む

**期待される成果物**:

- 全テスト PASS 確認記録（Green 状態）

---

## 参照資料

| 参照資料                     | パス                                                                  | 内容                                                                |
| ---------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Phase 2 実行記録（設計）     | 本ワークフロー Phase 2 完了記録                                       | assertNever・classifyExecuteResult・extractExecuteErrorMessage 設計 |
| Phase 4 実行記録（テスト）   | 本ワークフロー Phase 4 完了記録                                       | TC-01〜TC-05 テストコード                                           |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 対象実装ファイル                                                    |
| skillCreator.ts              | `packages/shared/src/types/skillCreator.ts`                           | ExecuteResponse union 型定義                                        |

---

## 成果物

| 成果物                               | パス                                                                  | 内容                                         |
| ------------------------------------ | --------------------------------------------------------------------- | -------------------------------------------- |
| RuntimeSkillCreatorFacade.ts（修正） | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | assertNever・switch 化・error 正規化済み実装 |
| Green テスト確認記録                 | （Phase 実行記録）                                                    | 全テスト PASS の証跡                         |

---

## 統合テスト連携

- switch 化後の既存テスト（親タスクのテスト）継続 PASS を確認する。
- Renderer 側の IPC consumer への影響がないことを確認する。

---

## 完了条件

- [ ] `assertNever` ヘルパーが追加されている
- [ ] `classifyExecuteResult()` が実装されている
- [ ] `classifyExecuteResult()` + `switch` + `extractExecuteErrorMessage()` に結果分岐が集約されている
- [ ] Phase 4 の全テストが PASS（Green）している
- [ ] 親タスクのテストがリグレッションしていない
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし

---

## TDD 検証

### TDD サイクル確認

```bash
# 新規テスト（Green 確認）
pnpm --filter @repo/desktop test -- --reporter=verbose \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.exhaustive.test.ts

# 既存テスト（リグレッション確認）
pnpm --filter @repo/desktop test -- --reporter=verbose \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
```

**確認項目**:

- [ ] テストが成功することを確認（Green 状態）

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## Phase 実行記録

Phase 完了後、以下を記録してください：

```markdown
## Phase 5 実行記録

### 実行タスク

- タスク 1 assertNever 追加: [結果]
- タスク 2 classifyExecuteResult 実装: [結果]
- タスク 3 switch 化: [結果]
- タスク 4 TDD Green 確認: [テスト件数・PASS/FAIL]

### 変更ファイル

| ファイル                     | 変更内容                                                |
| ---------------------------- | ------------------------------------------------------- |
| RuntimeSkillCreatorFacade.ts | assertNever 追加・classifyExecuteResult 追加・switch 化 |

### 次 Phase への引き継ぎ事項

-
```

---

## 次の Phase

完了後、以下のファイルを実行してください：

`docs/30-workflows/task-ut-rt-01-exhaustive-check-execute-response-001/phase-6-test-expansion.md`
