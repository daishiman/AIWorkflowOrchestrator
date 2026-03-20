# Phase 4: テスト作成

## メタ情報

| 項目          | 内容                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 4                                                                                                                 |
| 機能名        | LLM設定永続化修正 (TASK-FIX-LLM-CONFIG-PERSISTENCE)                                                               |
| 作成日        | 2026-03-20                                                                                                        |
| 担当          | -                                                                                                                 |
| ステータス    | 未着手                                                                                                            |
| 前Phase成果物 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-3-design-review.md` |

## 目的

Phase 2 で設計した「persist partialize拡張」「persist v1→v2 migration」「起動時バリデーション」「syncSelectedConfigToMain()の起動時呼び出し」に対するテストケースを先に設計・実装し、Red状態（テスト失敗）から始めるTDDサイクルを確立する。

## 実行タスク

### タスク1: テスト対象の確認

P63対策として、既存テストファイルのインポートパスを参照してから新規テストを作成する。

```bash
# 既存のstoreテストファイルを確認
find apps/desktop/src/renderer/store -name "*.test.ts" -o -name "*.spec.ts"

# llmSliceの既存テスト確認
find apps/desktop/src -name "llmSlice*test*" -o -name "llmSlice*spec*"

# store/index.tsのテスト確認
find apps/desktop/src -name "index*test*" -path "*/store/*"

# 既存テストのインポートパス参照（P63対策）
# 上記で発見したファイルに対して実行
# grep -n "^import" <発見したテストファイルのパス>
```

### タスク2: persist partialize関数のテスト

**テストファイル**: `apps/desktop/src/renderer/store/__tests__/persist-partialize.test.ts`（既存の場合は追記）

**テストケース一覧**:

| ID   | テスト名                                                      | 分類         |
| ---- | ------------------------------------------------------------- | ------------ |
| T1-1 | partializeが selectedProviderId を含むこと                    | 正常系       |
| T1-2 | partializeが selectedModelId を含むこと                       | 正常系       |
| T1-3 | partializeが既存フィールド（currentView等）を引き続き含むこと | 正常系       |
| T1-4 | partializeが apiKey / token 等の機密情報を含まないこと        | セキュリティ |
| T1-5 | selectedProviderId が null の場合も正しく永続化されること     | 境界値       |
| T1-6 | selectedModelId が null の場合も正しく永続化されること        | 境界値       |

**テストコード例**:

```typescript
describe("persist partialize", () => {
  it("T1-1: selectedProviderIdがpartialize対象に含まれる", () => {
    const state = { ...mockFullState, selectedProviderId: "anthropic" };
    const persisted = partialize(state);
    expect(persisted).toHaveProperty("selectedProviderId", "anthropic");
  });

  it("T1-4: apiKeyがpartialize対象に含まれない", () => {
    const persisted = partialize(mockFullState);
    expect(persisted).not.toHaveProperty("apiKey");
    expect(persisted).not.toHaveProperty("token");
  });
});
```

### タスク3: persist migration関数のテスト

**テストファイル**: `apps/desktop/src/renderer/store/__tests__/persist-migration.test.ts`（既存の場合は追記）

**テストケース一覧**:

| ID   | テスト名                                                                    | 分類   |
| ---- | --------------------------------------------------------------------------- | ------ |
| T2-1 | v1 ストアが v2 へ移行時に selectedProviderId: null が追加されること         | 正常系 |
| T2-2 | v1 ストアが v2 へ移行時に selectedModelId: null が追加されること            | 正常系 |
| T2-3 | v1 ストアが v2 へ移行時に既存フィールドが失われないこと                     | 正常系 |
| T2-4 | v0 ストアが v2 へ移行時も安全に処理されること                               | 境界値 |
| T2-5 | persistedState が null の場合に安全に処理されること（クラッシュしないこと） | 異常系 |
| T2-6 | persistedState が undefined の場合に安全に処理されること                    | 異常系 |
| T2-7 | 既に v2 のストアには migration が適用されないこと                           | 境界値 |

**テストコード例**:

```typescript
describe("persist migrate v1 -> v2", () => {
  it("T2-1: v1からv2移行時にselectedProviderIdがnullで追加される", () => {
    const v1State = {
      currentView: "chat",
      userProfile: null,
      autoSyncEnabled: false,
    };
    const result = migrate(v1State, 1);
    expect(result).toHaveProperty("selectedProviderId", null);
  });

  it("T2-3: 既存フィールドが失われない", () => {
    const v1State = { currentView: "settings", autoSyncEnabled: true };
    const result = migrate(v1State, 1);
    expect(result).toMatchObject({
      currentView: "settings",
      autoSyncEnabled: true,
    });
  });

  it("T2-5: persistedStateがnullでもクラッシュしない", () => {
    expect(() => migrate(null, 1)).not.toThrow();
  });
});
```

### タスク4: 起動時バリデーション関数のテスト

**テストファイル**: `apps/desktop/src/renderer/store/slices/__tests__/llmSlice-validation.test.ts`（既存の場合は追記）

**テストケース一覧**:

| ID   | テスト名                                                                                 | 分類   |
| ---- | ---------------------------------------------------------------------------------------- | ------ |
| T3-1 | 有効なProviderID + 有効なModelIDの場合、そのまま返すこと                                 | 正常系 |
| T3-2 | 有効なProviderID + 無効なModelIDの場合、modelIdをnullにすること                          | 正常系 |
| T3-3 | 無効なProviderIDの場合、providerId/modelId両方をnullにすること（P62対策）                | 正常系 |
| T3-4 | persistedProviderId が null の場合、{providerId: null, modelId: null} を返すこと         | 境界値 |
| T3-5 | availableProviders が空配列の場合、nullクリアせず永続化値を保持すること（fetch失敗対策） | 境界値 |
| T3-6 | DEFAULT_CONFIGへのfallbackが行われないこと（P62対策の明示的確認）                        | 境界値 |

**テストコード例**:

```typescript
describe("validateAndSyncPersistedConfig", () => {
  const mockProviders = [
    { id: "anthropic", models: [{ id: "claude-3-5-sonnet" }] },
  ];

  it("T3-3: 無効なProviderIDはnullクリアされる（P62対策）", () => {
    const result = validateAndSyncPersistedConfig(
      "non-existent-provider",
      "some-model",
      mockProviders,
    );
    expect(result).toEqual({ providerId: null, modelId: null });
  });

  it("T3-5: providers空配列時は永続化値を保持する", () => {
    const result = validateAndSyncPersistedConfig(
      "anthropic",
      "claude-3-5-sonnet",
      [], // fetchが未完了or失敗
    );
    // 空の場合は判断保留 → 既存値を保持
    expect(result.providerId).toBe("anthropic");
  });
});
```

### タスク5: syncSelectedConfigToMain() 起動時呼び出しのテスト

**テストファイル**: `apps/desktop/src/renderer/store/slices/__tests__/llmSlice-sync.test.ts`（既存の場合は追記）

**テストケース一覧**:

| ID   | テスト名                                                                                  | 分類   |
| ---- | ----------------------------------------------------------------------------------------- | ------ |
| T4-1 | providers fetch完了後に syncSelectedConfigToMain() が呼ばれること                         | 正常系 |
| T4-2 | 有効な永続化値がある場合、syncSelectedConfigToMain() が正しいProvider/Modelで呼ばれること | 正常系 |
| T4-3 | 無効な永続化値の場合（P62対策）、syncSelectedConfigToMain() が呼ばれないこと              | 正常系 |
| T4-4 | Zustand hydrate完了前は syncSelectedConfigToMain() が呼ばれないこと                       | 境界値 |
| T4-5 | syncSelectedConfigToMain() の二重呼び出しが副作用を起こさないこと                         | 境界値 |

### タスク6: テストファイルの作成

上記タスク2〜5のテストを実際のファイルに記述する。

**注意事項**:

- P63対策: インポートパスは必ず既存テストファイルから参照する
- P60対策: IPC レスポンス形式は `grep -rn "success:" apps/desktop/src/main/handlers/` で確認してから書く
- P9対策: テスト間で状態を共有しない（`beforeEach` でリセット）
- 既存のテストファイルが存在する場合は、新規作成せず追記する

## 参照資料

### システム仕様

| 資料名              | パス                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------- |
| Zustand persist設計 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |

### 前Phase成果物

| 資料名               | パス                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義     | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-1-requirements.md`  |
| Phase 2 設計         | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-2-design.md`        |
| Phase 3 設計レビュー | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-3-design-review.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                 | 対策                                             |
| ---------- | ------------------------------------ | ------------------------------------------------ |
| P9         | テスト間で状態共有                   | `beforeEach` でストア・モックをリセット          |
| P60        | IPC テスト応答形式の不一致           | 既存ハンドラのレスポンス形式を確認してから書く   |
| P62        | DEFAULT_CONFIG への暗黙 fallback     | T3-6 で明示的に fallback 禁止を検証する          |
| P63        | サブエージェントのインポートパス誤り | 既存テストファイルのインポートパスを必ず参照する |

## 実行手順

1. **既存テストファイルの確認**: タスク1のコマンドを実行し、テストファイルの配置とインポートパスを把握する
2. **テストケースの実装**: タスク2〜5の順でテストを実装する（Red状態を確認しながら進める）
3. **テスト実行でRed確認**: 実装前に全テストが失敗（Red）することを確認する

```bash
# テスト実行（apps/desktopディレクトリから）
cd apps/desktop && pnpm vitest run src/renderer/store/__tests__/persist-partialize.test.ts
```

4. **テストコードのレビュー**: テストが仕様（Phase 2）を正しく反映しているか確認する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                                              | 説明         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------ |
| Phase 4 仕様書（本ファイル） | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-4-test-creation.md` | テスト設計書 |
| persist partialize テスト    | `apps/desktop/src/renderer/store/__tests__/persist-partialize.test.ts`                                            | T1-1 〜 T1-6 |
| persist migration テスト     | `apps/desktop/src/renderer/store/__tests__/persist-migration.test.ts`                                             | T2-1 〜 T2-7 |
| バリデーション関数テスト     | `apps/desktop/src/renderer/store/slices/__tests__/llmSlice-validation.test.ts`                                    | T3-1 〜 T3-6 |
| 起動時同期テスト             | `apps/desktop/src/renderer/store/slices/__tests__/llmSlice-sync.test.ts`                                          | T4-1 〜 T4-5 |

## 完了条件

- [ ] タスク1のコマンドを実行し、既存テストファイルのインポートパスを確認した
- [ ] T1-1 〜 T1-6（partialize テスト）が実装され、Red状態であることを確認した
- [ ] T2-1 〜 T2-7（migration テスト）が実装され、Red状態であることを確認した
- [ ] T3-1 〜 T3-6（バリデーション テスト）が実装され、Red状態であることを確認した
- [ ] T4-1 〜 T4-5（起動時同期 テスト）が実装され、Red状態であることを確認した
- [ ] T3-6 で DEFAULT_CONFIG への fallback 禁止（P62対策）が明示的にテストされている
- [ ] T2-5/T2-6 でnull/undefined入力の安全性がテストされている
- [ ] テスト間で状態が共有されていない（P9対策）

## 次Phase

Phase 5: 実装（`phase-5-implementation.md`）
