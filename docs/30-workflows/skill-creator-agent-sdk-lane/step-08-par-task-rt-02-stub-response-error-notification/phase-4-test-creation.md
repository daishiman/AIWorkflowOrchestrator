# Phase 4: テスト作成

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 4                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

plan() / execute() / improve() のスタブ条件をテストケースに変換し、Facade・IPC handler・renderer 各層のエラー変換を検証するテストマトリクスを作成する。

## 実行タスク

- plan() のスタブ → エラー変換テストを作成する
- execute() のスタブ → エラー変換テストを作成する
- improve() のスタブ → エラー変換テストを作成する
- IPC handler のエラー検出・IpcResult 変換テストを作成する
- 正常系パスが変更されていないことの回帰テストを作成する

## 参照資料

| 資料名              | パス                                                                                 | 説明                       |
| ------------------- | ------------------------------------------------------------------------------------ | -------------------------- |
| Phase 1 要件        | `phase-1-requirements.md`                                                            | スタブ箇所・reason code    |
| Phase 2 設計        | `phase-2-design.md`                                                                  | エラー変換ロジック設計     |
| Phase 3 レビュー    | `phase-3-design-review.md`                                                           | gate 判定結果              |
| 既存テスト          | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | 既存テストパターン         |
| reason code catalog | `{outputs/phase-2/reason-code-catalog.md`                                            | reason code 一覧と発火条件 |

## 実行手順

### ステップ1: テストマトリクスを定義する

| テストケース ID | 対象メソッド | 条件                                                 | 期待結果                                                           | AC   |
| --------------- | ------------ | ---------------------------------------------------- | ------------------------------------------------------------------ | ---- |
| TC-01           | plan()       | llmAdapter 未注入                                    | `status: "error"`, `degradedReason: "llm_adapter_unavailable"`     | AC-1 |
| TC-02           | plan()       | resourceLoader 未設定 & dynamicResourcePipeline なし | `status: "error"`, `degradedReason: "resource_loader_unavailable"` | AC-1 |
| TC-03           | execute()    | llmAdapter 未注入                                    | `status: "error"`, `degradedReason: "llm_adapter_unavailable"`     | AC-2 |
| TC-04           | execute()    | resourceLoader 未設定                                | `status: "error"`, `degradedReason: "resource_loader_unavailable"` | AC-2 |
| TC-05           | improve()    | degraded 状態                                        | `status: "error"`, `degradedReason` が設定されている               | AC-3 |
| TC-06           | plan()       | エラーレスポンスに userMessage が含まれる            | `userMessage` が非 null の文字列                                   | AC-4 |
| TC-07           | IPC handler  | plan() が error status を返した場合                  | `{ success: false, error: "..." }` を返す                          | AC-5 |
| TC-08           | IPC handler  | execute() が error status を返した場合               | `{ success: false, error: "..." }` を返す                          | AC-5 |
| TC-09           | plan()       | llmAdapter & resourceLoader 正常（正常系）           | `status: "ok"`, 既存フィールドが正常                               | AC-7 |
| TC-10           | execute()    | 正常系                                               | `status: "ok"`, 既存ロジック不変                                   | AC-7 |

### ステップ2: Facade ユニットテストを作成する

```typescript
// RuntimeSkillCreatorFacade.test.ts に追加

describe("stub response → error conversion", () => {
  describe("plan()", () => {
    it("llmAdapter 未注入時に error status を返す (TC-01)", async () => {
      const facade = createFacadeWithoutLlmAdapter();
      const result = await facade.plan(skillSpec);
      expect(result.status).toBe("error");
      expect(result.degradedReason).toBe("llm_adapter_unavailable");
      expect(result.userMessage).toBeTruthy();
    });

    it("resourceLoader 未設定時に error status を返す (TC-02)", async () => {
      const facade = createFacadeWithoutResourceLoader();
      const result = await facade.plan(skillSpec);
      expect(result.status).toBe("error");
      expect(result.degradedReason).toBe("resource_loader_unavailable");
    });

    it("正常系で ok status を返す (TC-09)", async () => {
      const facade = createFullyConfiguredFacade();
      const result = await facade.plan(skillSpec);
      expect(result.status).toBe("ok");
      expect(result.skillName).toBeTruthy();
    });
  });

  describe("execute()", () => {
    it("llmAdapter 未注入時に error status を返す (TC-03)");
    it("resourceLoader 未設定時に error status を返す (TC-04)");
    it("正常系で ok status を返す (TC-10)");
  });

  describe("improve()", () => {
    it("degraded 状態時に error status を返す (TC-05)");
  });
});
```

### ステップ3: IPC handler テストを作成する

```typescript
describe("creatorHandlers error handling", () => {
  it("plan() error status を IpcResult failure に変換する (TC-07)");
  it("execute() error status を IpcResult failure に変換する (TC-08)");
  it("degradedReason を data に含める");
});
```

### ステップ4: テストを実行し RED 状態を確認する

- 全テストが FAIL することを確認する（実装は Phase 5）。
- テスト構文エラーがないことを確認する。

## 統合テスト連携

- Phase 5 で実装後に全テストが GREEN になることを検証する。
- Phase 6 で edge case テストを追加する。
- Phase 7 で coverage を計測する。

## 成果物

| 成果物           | パス                              | 説明                        |
| ---------------- | --------------------------------- | --------------------------- |
| テストマトリクス | `{outputs/phase-4/test-matrix.md` | TC-01〜TC-10 の対応表       |
| テストコード     | Phase 5 で配置                    | Facade / IPC handler テスト |

## 完了条件

- [ ] plan() / execute() / improve() の全スタブ条件がテストケース化されている
- [ ] IPC handler のエラー変換テストが定義されている
- [ ] 正常系回帰テストが定義されている
- [ ] AC-1〜AC-7 への写像が全テストケースでカバーされている
- [ ] テストが RED 状態（未実装）であることを確認している
- [ ] **本Phase内の全タスクを100%実行完了**
