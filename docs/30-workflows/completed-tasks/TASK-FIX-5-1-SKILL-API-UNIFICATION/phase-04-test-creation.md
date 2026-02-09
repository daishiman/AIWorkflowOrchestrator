# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 4                                  |
| タスクID | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| タスク名 | SkillAPI二重定義の解消             |
| 分類     | リファクタリング                   |
| 対象機能 | Preload SkillAPI                   |
| 作成日   | 2026-02-08                         |

## 目的

期待される動作を検証するテストを実装より先に作成する（TDD Red状態）。本タスクはリファクタリングのため、既存テストの維持と型安全性の検証に焦点を当てる。

## 実行タスク

### Task 1: 既存テストの確認

#### 1.1 Preload API テスト

| ファイル                       | テスト内容           | 状態         |
| ------------------------------ | -------------------- | ------------ |
| `skill-api.test.ts`            | 13メソッドの基本動作 | 既存（維持） |
| `skill-api.permission.test.ts` | 権限系メソッド       | 既存（維持） |

#### 1.2 Store/Hooks テスト

| ファイル                      | テスト内容     | 状態         |
| ----------------------------- | -------------- | ------------ |
| `skillSlice.test.ts`          | Store状態管理  | 既存（維持） |
| `useSkillExecution.test.ts`   | Hook動作       | 既存（維持） |
| `usePermissionDialog.test.ts` | 権限ダイアログ | 既存（維持） |

### Task 2: 型安全性テストの設計

本タスクでは型宣言の変更のため、TypeScriptコンパイラによる型チェックがテストの役割を果たす。

#### 2.1 型チェックテスト（コンパイル時検証）

```typescript
// 期待される動作: コンパイルエラーなし
const skillApi = window.electronAPI.skill;

// 13メソッドの型チェック
// 一覧・管理系
const list: () => Promise<SkillMetadata[]> = skillApi.list;
const getImported: () => Promise<ImportedSkill[]> = skillApi.getImported;
const importSkill: (name: string) => Promise<ImportedSkill> = skillApi.import;
const remove: (name: string) => Promise<void> = skillApi.remove;
const rescan: () => Promise<SkillMetadata[]> = skillApi.rescan;

// 実行系
const execute: (req: SkillExecutionRequest) => Promise<SkillExecutionResponse> =
  skillApi.execute;
const abort: (id: string) => Promise<void> = skillApi.abort;
const getStatus: (id: string) => Promise<ExecutionInfo | null> =
  skillApi.getExecutionStatus;

// イベント系
const onStream: (cb: (msg: SkillStreamMessage) => void) => () => void =
  skillApi.onStream;
const onComplete: (cb: (data: { executionId: string }) => void) => () => void =
  skillApi.onComplete;
const onError: (
  cb: (data: { executionId: string; error: string }) => void,
) => () => void = skillApi.onError;

// 権限系
const onPermReq: (cb: (req: SkillPermissionRequest) => void) => () => void =
  skillApi.onPermissionRequest;
const sendPermRes: (
  res: SkillPermissionResponse,
) => Promise<{ success: boolean }> = skillApi.sendPermissionResponse;
```

#### 2.2 削除後の型エラーテスト（期待される失敗）

```typescript
// 期待される動作: types.d.ts修正後はコンパイルエラー
// @ts-expect-error window.skillAPI は存在しない
window.skillAPI.list();
```

### Task 3: 統一APIのモックテスト設計

#### 3.1 モック構造

```typescript
// test/setup.ts または __mocks__/preload.ts
const mockSkillAPI = {
  // 一覧・管理系
  list: vi.fn().mockResolvedValue([]),
  getImported: vi.fn().mockResolvedValue([]),
  import: vi.fn().mockResolvedValue({ name: "test-skill" }),
  remove: vi.fn().mockResolvedValue(undefined),
  rescan: vi.fn().mockResolvedValue([]),

  // 実行系
  execute: vi
    .fn()
    .mockResolvedValue({ success: true, executionId: "exec-123" }),
  abort: vi.fn().mockResolvedValue(undefined),
  getExecutionStatus: vi.fn().mockResolvedValue(null),

  // イベント系
  onStream: vi.fn().mockReturnValue(() => {}),
  onComplete: vi.fn().mockReturnValue(() => {}),
  onError: vi.fn().mockReturnValue(() => {}),

  // 権限系
  onPermissionRequest: vi.fn().mockReturnValue(() => {}),
  sendPermissionResponse: vi.fn().mockResolvedValue({ success: true }),
};

// グローバル定義
Object.defineProperty(window, "electronAPI", {
  value: {
    skill: mockSkillAPI,
    // ... other APIs
  },
  writable: true,
});
```

#### 3.2 テストケース（Red状態確認用）

```typescript
// apps/desktop/src/preload/__tests__/skill-api.unification.test.ts
describe("SkillAPI Unification", () => {
  describe("window.electronAPI.skill", () => {
    it("should expose all 13 methods", () => {
      const skillApi = window.electronAPI.skill;

      // 一覧・管理系
      expect(typeof skillApi.list).toBe("function");
      expect(typeof skillApi.getImported).toBe("function");
      expect(typeof skillApi.import).toBe("function");
      expect(typeof skillApi.remove).toBe("function");
      expect(typeof skillApi.rescan).toBe("function");

      // 実行系
      expect(typeof skillApi.execute).toBe("function");
      expect(typeof skillApi.abort).toBe("function");
      expect(typeof skillApi.getExecutionStatus).toBe("function");

      // イベント系
      expect(typeof skillApi.onStream).toBe("function");
      expect(typeof skillApi.onComplete).toBe("function");
      expect(typeof skillApi.onError).toBe("function");

      // 権限系
      expect(typeof skillApi.onPermissionRequest).toBe("function");
      expect(typeof skillApi.sendPermissionResponse).toBe("function");
    });
  });

  describe("window.skillAPI (deprecated)", () => {
    it("should not be defined after unification", () => {
      // Phase 5実装後にPASSすることを期待
      // 現時点ではFAIL（Red状態）
      expect(window.skillAPI).toBeUndefined();
    });
  });
});
```

### Task 4: 呼び出し元の移行テスト設計

#### 4.1 テストシナリオ

本タスクでは呼び出し元の変更は不要だが、念のため移行完了を検証するテストを設計する。

```typescript
// apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.migration.test.ts
describe("useSkillExecution migration", () => {
  it("should use window.electronAPI.skill instead of window.skillAPI", async () => {
    // window.skillAPI が呼ばれていないことを確認
    const skillAPISpy = vi.spyOn(window, "skillAPI", "get");

    const { result } = renderHook(() => useSkillExecution("test-skill"));
    await result.current.execute("test prompt");

    expect(skillAPISpy).not.toHaveBeenCalled();
    expect(window.electronAPI.skill.execute).toHaveBeenCalled();
  });
});
```

#### 4.2 Store移行テスト

```typescript
// apps/desktop/src/renderer/store/slices/__tests__/skillSlice.migration.test.ts
describe("skillSlice migration", () => {
  it("should use window.electronAPI.skill for all API calls", async () => {
    const store = createStore();

    await store.getState().fetchSkills();

    expect(window.electronAPI.skill.list).toHaveBeenCalled();
    expect(window.electronAPI.skill.getImported).toHaveBeenCalled();
  });
});
```

## 統合テスト連携

| シナリオカテゴリ   | 検証内容                           | テストファイル                  |
| ------------------ | ---------------------------------- | ------------------------------- |
| API接続テスト      | electronAPI.skill の13メソッド疎通 | `skill-api.unification.test.ts` |
| データフローテスト | Renderer → Preload → IPC の経路    | `skill-api.test.ts`             |
| エラーハンドリング | 不正チャンネルのreject             | `skill-api.test.ts`             |
| 状態同期テスト     | Store/Hooks が正しいAPIを使用      | `*.migration.test.ts`           |

## アーキテクチャ層別テスト

| 層               | テスト観点                                              | テストファイル配置                             |
| ---------------- | ------------------------------------------------------- | ---------------------------------------------- |
| Renderer Process | Hooks/Store が `electronAPI.skill` を使用               | `renderer/**/*.test.ts`                        |
| Preload          | 13メソッドの公開と型安全性                              | `preload/__tests__/*.test.ts`                  |
| IPC通信          | safeInvoke/safeOn の動作                                | `preload/__tests__/skill-api.test.ts`          |
| セキュリティ     | 不正チャンネル拒否、safeInvoke/safeOnホワイトリスト検証 | `preload/__tests__/skill-api.security.test.ts` |

## 参照資料

| 資料名        | パス                                                   | 説明         |
| ------------- | ------------------------------------------------------ | ------------ |
| Phase 1成果物 | `outputs/phase-1/requirements-definition.md`           | 要件定義     |
| Phase 2成果物 | `outputs/phase-2/unified-api-design.md`                | 統一API設計  |
| Phase 3成果物 | `outputs/phase-3/design-review-result.md`              | 設計レビュー |
| 既存テスト    | `apps/desktop/src/preload/__tests__/skill-api.test.ts` | 既存テスト   |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                                        | 内容                                           |
| ------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| IPCセキュリティテスト要件 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` 行293-319         | safeInvoke/safeOn検証フローのテスト観点        |
| スキルAPI仕様             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` 行242-349 | 13メソッドの戻り値型（テストアサーション基準） |

## 成果物

| 成果物             | パス                                                               | 説明             |
| ------------------ | ------------------------------------------------------------------ | ---------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                            | テスト設計       |
| テストケース       | `outputs/phase-4/test-cases.md`                                    | ケース一覧       |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md`                       | 統合テスト設計   |
| テストファイル     | `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts` | 新規テストコード |

## 完了条件

- [ ] 13メソッド全てに対応するテストケースが存在する
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標（Line 80%+, Branch 60%+, Function 80%+）が設定されている
- [ ] 境界値テスト（空文字列、null/undefined、最大長）が5ケース以上含まれている
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] 型安全性テストが設計されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] 新規テスト（unification.test.ts）が失敗することを確認（Red状態）
# - [ ] 既存テストは成功することを確認（既存機能の維持）
```

### Red状態の確認ポイント

1. `window.skillAPI` がまだ `types.d.ts` に定義されているため、`toBeUndefined()` テストは失敗する
2. Phase 5で `types.d.ts` から削除した後、テストがPASS（Green）になることを期待

## 次のPhase

Phase 5: 実装（TDD: Green）
