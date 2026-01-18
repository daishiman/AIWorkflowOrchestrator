# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 4                                      |
| Phase名    | テスト作成（TDD Red）                  |
| 前提Phase  | Phase 3                                |
| 後続Phase  | Phase 5                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-17                             |
| 機能名     | skill-ipc-handlers-registration-bugfix |

---

## 目的

TDDのRed（失敗するテスト作成）フェーズとして、バグ修正を検証するテストを作成する。
修正前の状態ではテストが失敗することを確認し、修正の正しさを検証できる状態を確立する。

## 背景

バグ修正においてもTDDアプローチを採用することで、
修正の正確性を保証し、回帰テストとしても機能するテストを作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: preload skillAPIの引数形式テスト作成

**目的**: preload側のskillAPIが正しい引数形式でIPCを呼び出すことを検証するテストを作成

**実行手順**:

1. テストファイルを作成または更新: `apps/desktop/src/renderer/preload/__tests__/skillAPI.test.ts`
2. `import` メソッドがオブジェクト形式で引数を渡すテストを作成
3. `remove` メソッドがオブジェクト形式で引数を渡すテストを作成
4. `getDetail` メソッドがオブジェクト形式で引数を渡すテストを作成
5. テストが失敗することを確認（Red状態）

**テストケース例**:

```typescript
describe("skillAPI", () => {
  describe("import", () => {
    it("should call IPC with object format { skillIds }", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ success: true });
      window.electronAPI = { invoke: mockInvoke };

      await skillAPI.import(["skill-1", "skill-2"]);

      expect(mockInvoke).toHaveBeenCalledWith(
        "skill:import",
        { skillIds: ["skill-1", "skill-2"] }, // オブジェクト形式を期待
      );
    });
  });

  describe("remove", () => {
    it("should call IPC with object format { skillId }", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ success: true });
      window.electronAPI = { invoke: mockInvoke };

      await skillAPI.remove("skill-1");

      expect(mockInvoke).toHaveBeenCalledWith(
        "skill:remove",
        { skillId: "skill-1" }, // オブジェクト形式を期待
      );
    });
  });

  describe("getDetail", () => {
    it("should call IPC with object format { skillId }", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ success: true, data: {} });
      window.electronAPI = { invoke: mockInvoke };

      await skillAPI.getDetail("skill-1");

      expect(mockInvoke).toHaveBeenCalledWith(
        "skill:get-detail",
        { skillId: "skill-1" }, // オブジェクト形式を期待
      );
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/preload/__tests__/skillAPI.test.ts`: preload APIテスト

---

### タスク2: skillHandlersの引数受け取りテスト作成

**目的**: mainプロセス側のハンドラーが正しく引数を受け取ることを検証するテストを作成

**実行手順**:

1. 既存テストファイルを確認: `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`
2. 引数形式の検証テストを追加または更新
3. テストが正常に動作することを確認

**テストケース例**:

```typescript
describe("skillHandlers", () => {
  describe("skill:import handler", () => {
    it("should receive args as object { skillIds }", async () => {
      const mockSkillService = {
        importSkills: vi.fn().mockResolvedValue({ success: true }),
      };

      // ハンドラーを直接呼び出してテスト
      const handler = createImportHandler(mockSkillService);
      await handler(mockEvent, { skillIds: ["skill-1"] });

      expect(mockSkillService.importSkills).toHaveBeenCalledWith(["skill-1"]);
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`: ハンドラーテスト更新

---

### タスク3: IPCハンドラー登録テスト作成

**目的**: `registerSkillHandlers` が正しく呼び出されていることを検証するテストを作成

**実行手順**:

1. テストファイルを確認: `apps/desktop/src/main/ipc/__tests__/index.test.ts`
2. `registerSkillHandlers` が `registerAllIpcHandlers` 内で呼び出されることを検証
3. 必要に応じてモック戦略を設計

**テストケース例**:

```typescript
describe("registerAllIpcHandlers", () => {
  it("should register skill handlers", () => {
    const mockMainWindow = {} as BrowserWindow;
    const mockStore = {} as Store;

    // registerSkillHandlersが呼ばれることを確認
    const registerSkillHandlersSpy = vi.spyOn(
      skillHandlersModule,
      "registerSkillHandlers",
    );

    registerAllIpcHandlers(mockMainWindow, mockStore);

    expect(registerSkillHandlersSpy).toHaveBeenCalled();
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/ipc/__tests__/index.test.ts`: IPCインデックステスト更新

---

### タスク4: テスト失敗確認（Red状態）

**目的**: 作成したテストが現状のコードで失敗することを確認する

**実行手順**:

1. 全テストを実行: `pnpm --filter @repo/desktop test`
2. 新規追加したテストが失敗することを確認
3. 失敗理由が期待通り（引数形式の不一致）であることを確認
4. テスト失敗結果を記録

**期待される成果物**:

- `outputs/phase-4/test-red-result.md`: テスト失敗結果レポート

---

## 参照資料

| 参照資料           | パス                                                        | 内容           |
| ------------------ | ----------------------------------------------------------- | -------------- |
| Phase 2成果物      | `outputs/phase-2/`                                          | 修正設計書     |
| Phase 3成果物      | `outputs/phase-3/`                                          | レビュー結果   |
| 既存テストファイル | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` | 既存テスト参考 |
| テスト戦略         | `outputs/phase-2/test-strategy.md`                          | テスト計画     |

### システム仕様（aiworkflow-requirements）

> テスト設計時に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                         | 内容                      |
| ------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| IPC Handler Pattern | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | IPCハンドラー登録パターン |

---

## 成果物

| 成果物                | パス                                                           | 内容                |
| --------------------- | -------------------------------------------------------------- | ------------------- |
| preload APIテスト     | `apps/desktop/src/renderer/preload/__tests__/skillAPI.test.ts` | 引数形式テスト      |
| ハンドラーテスト更新  | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`    | 引数受け取りテスト  |
| IPCインデックステスト | `apps/desktop/src/main/ipc/__tests__/index.test.ts`            | 登録確認テスト      |
| テスト失敗結果        | `outputs/phase-4/test-red-result.md`                           | Red状態確認レポート |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 4の統合テスト連携アクション**:

- IPC引数形式の統合テストシナリオを作成
- preload ⇔ main間の通信テストを設計
- エラーケースのテストシナリオを含める

---

## 完了条件

- [ ] preload skillAPIの引数形式テストが作成されている
- [ ] skillHandlersの引数受け取りテストが作成/更新されている
- [ ] IPCハンドラー登録テストが作成/更新されている
- [ ] 新規テストが失敗することが確認されている（Red状態）
- [ ] 全成果物が配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-ipc-handlers-registration-bugfix/phase-5-implementation.md`
