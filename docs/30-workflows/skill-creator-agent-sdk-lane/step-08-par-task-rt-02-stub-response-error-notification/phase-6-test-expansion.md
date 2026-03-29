# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 6                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

Phase 4 の基本テストに加え、エッジケース・境界条件・異常系の組み合わせテストを追加し、テストカバレッジを拡充する。

## 実行タスク

- llmAdapter と resourceLoader の両方が未設定の場合のテストを追加する
- degradedReason の優先順位テストを追加する（llmAdapter > resourceLoader）
- IPC handler で Facade が例外を投げた場合のテストを追加する
- renderer で unexpected な degradedReason を受け取った場合のテストを追加する
- workflowEngine.recordPlanResult がエラーレスポンスでも呼ばれることを確認する

## 参照資料

| 資料名         | パス                                                                  | 説明                 |
| -------------- | --------------------------------------------------------------------- | -------------------- |
| Phase 4 テスト | `phase-4-test-creation.md`                                            | 基本テストマトリクス |
| Phase 5 実装   | `phase-5-implementation.md`                                           | 実装内容             |
| Facade         | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 実装コード           |
| IPC handler    | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | IPC 実装コード       |

## 実行手順

### ステップ1: エッジケーステストを追加する

| テストケース ID | 条件                                                         | 期待結果                                                       |
| --------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| TC-11           | llmAdapter & resourceLoader 両方未設定                       | `degradedReason: "llm_adapter_unavailable"`（llmAdapter 優先） |
| TC-12           | plan() エラー時に workflowEngine.recordPlanResult が呼ばれる | recordPlanResult のモック呼び出し確認                          |
| TC-13           | IPC handler で Facade が throw した場合                      | `{ success: false, error: "..." }` （catch ブロック処理）      |
| TC-14           | renderer で未知の degradedReason を受け取った場合            | デフォルトエラーメッセージを表示                               |
| TC-15           | plan() エラーレスポンスの `estimatedSteps` が `0` であること | `estimatedSteps === 0`                                         |
| TC-16           | userMessage が空文字でないこと                               | `userMessage.length > 0`                                       |

### ステップ2: Facade エッジケーステストを実装する

```typescript
describe("edge cases", () => {
  it(
    "llmAdapter & resourceLoader 両方未設定時は llmAdapter エラーが優先 (TC-11)",
  );
  it("エラー時も workflowEngine.recordPlanResult が呼ばれる (TC-12)");
  it("estimatedSteps が 0 である (TC-15)");
  it("userMessage が空文字でない (TC-16)");
});
```

### ステップ3: IPC / renderer エッジケーステストを実装する

```typescript
describe("IPC edge cases", () => {
  it("Facade が throw した場合に catch で処理する (TC-13)");
});

describe("renderer edge cases", () => {
  it("未知の degradedReason でデフォルトメッセージを表示する (TC-14)");
});
```

### ステップ4: 全テストを実行する

- TC-01〜TC-16 を全て実行し GREEN を確認する。

## 統合テスト連携

- Phase 7 で coverage を計測し、不足箇所を特定する。
- Phase 9 で品質監査を実施する。

## 成果物

| 成果物                 | パス           | 説明                  |
| ---------------------- | -------------- | --------------------- |
| エッジケーステスト追加 | テストファイル | TC-11〜TC-16 のテスト |

## 完了条件

- [ ] llmAdapter & resourceLoader 両方未設定のテストが存在する
- [ ] degradedReason 優先順位のテストが存在する
- [ ] IPC handler 例外ケースのテストが存在する
- [ ] renderer 未知 reason ケースのテストが存在する
- [ ] workflowEngine 呼び出し確認テストが存在する
- [ ] 全テスト（TC-01〜TC-16）が GREEN である
- [ ] **本Phase内の全タスクを100%実行完了**
