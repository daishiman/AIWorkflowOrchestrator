# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 4                                      |
| 機能名 | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| 作成日 | 2026-02-12                             |

## 目的

個別セレクタHook移行後の動作を検証するテストを作成する。現在の`useRef`ガードを使用した実装から、個別セレクタHookを使用する実装に移行した際の動作が正しく保たれることを確認する。

## 実行タスク

- TDD原則適用: テストファースト開発の実践
- 無限ループ非発生テスト: 個別セレクタHook使用時の無限ループ非発生検証
- 既存テスト更新方針策定: 現行テストの移行計画作成

## 参照資料

| 資料名                 | パス                                                                           | 説明                    |
| ---------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| P31既知の落とし穴      | `.claude/rules/06-known-pitfalls.md`                                           | P31対策パターン         |
| Store実装              | `apps/desktop/src/renderer/store/index.ts`                                     | 現在のStore Hook実装    |
| LLMSelectorPanel       | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`                | 移行対象コンポーネント1 |
| SkillSelector          | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`                 | 移行対象コンポーネント2 |
| SettingsView           | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                       | 移行対象コンポーネント3 |
| 既存テスト（LLM）      | `apps/desktop/src/renderer/components/llm/__tests__/LLMSelectorPanel.test.tsx` | 既存テストファイル      |
| 既存テスト（Skill）    | `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx`  | 既存テストファイル      |
| 既存テスト（Settings） | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`           | 既存テストファイル      |

## 実行手順

### ステップ1: テストシナリオ設計

#### 1.1 無限ループ非発生検証シナリオ

**LLMSelectorPanel**

| テストID       | シナリオ                                            | 期待結果                           |
| -------------- | --------------------------------------------------- | ---------------------------------- |
| TC-LLM-MIG-001 | 個別セレクタ使用時のマウント                        | `fetchProviders`が1回のみ呼ばれる  |
| TC-LLM-MIG-002 | 個別セレクタ使用時のre-render                       | `fetchProviders`が追加で呼ばれない |
| TC-LLM-MIG-003 | `selectedProviderId`変更時のみ`checkHealth`呼び出し | 同じIDでは再呼び出しされない       |
| TC-LLM-MIG-004 | useRefガード不要の検証                              | useRefなしでも無限ループしない     |

**SkillSelector**

| テストID      | シナリオ                        | 期待結果                               |
| ------------- | ------------------------------- | -------------------------------------- |
| TC-SK-MIG-001 | 個別セレクタ使用時のマウント    | `rescanSkills`がマウント時に呼ばれない |
| TC-SK-MIG-002 | re-render時の安定性             | `rescanSkills`コールバックが安定       |
| TC-SK-MIG-003 | `isScanning`変更時の挙動        | 無限ループしない                       |
| TC-SK-MIG-004 | `selectedSkillName`変更時の挙動 | 無限ループしない                       |

**SettingsView**

| テストID      | シナリオ                   | 期待結果                              |
| ------------- | -------------------------- | ------------------------------------- |
| TC-SV-MIG-001 | 個別セレクタ使用時の初期化 | `initializeAuthMode`が1回のみ呼ばれる |
| TC-SV-MIG-002 | mode変更後のre-render      | 追加の初期化呼び出しなし              |
| TC-SV-MIG-003 | useRefガード不要の検証     | useRefなしでも無限ループしない        |

#### 1.2 個別セレクタHook設計

**LLM用個別セレクタ（新規作成）**

```typescript
// store/index.ts に追加予定
export const useLLMProviders = () => useAppStore((state) => state.providers);
export const useLLMSelectedProviderId = () =>
  useAppStore((state) => state.selectedProviderId);
export const useLLMSelectedModelId = () =>
  useAppStore((state) => state.selectedModelId);
export const useLLMIsLoading = () => useAppStore((state) => state.llmIsLoading);
export const useLLMError = () => useAppStore((state) => state.llmError);
export const useLLMHealthStatus = () =>
  useAppStore((state) => state.healthStatus);
export const useLLMFetchProviders = () =>
  useAppStore((state) => state.fetchProviders);
export const useLLMSelectProvider = () =>
  useAppStore((state) => state.selectProvider);
export const useLLMSelectModel = () =>
  useAppStore((state) => state.selectModel);
export const useLLMCheckHealth = () =>
  useAppStore((state) => state.checkHealth);
```

**Skill用個別セレクタ（新規作成）**

```typescript
// store/index.ts に追加予定
export const useAvailableSkillsMetadata = () =>
  useAppStore((state) => state.availableSkillsMetadata);
export const useImportedSkills = () =>
  useAppStore((state) => state.importedSkills);
export const useSelectedSkillName = () =>
  useAppStore((state) => state.selectedSkillName);
export const useIsScanning = () => useAppStore((state) => state.isScanning);
export const useRescanSkills = () => useAppStore((state) => state.rescanSkills);
export const useSelectSkillByName = () =>
  useAppStore((state) => state.selectSkillByName);
```

**AuthMode用個別セレクタ（既存）**

既に以下が存在:

- `useAuthMode()`
- `useAuthModeStatus()`
- `useAuthModeLoading()`
- `useAuthModeError()`
- `useIsAuthModeValid()`

追加が必要:

```typescript
export const useSetAuthMode = () => useAppStore((state) => state.setMode);
export const useInitializeAuthMode = () =>
  useAppStore((state) => state.initializeAuthMode);
```

### ステップ2: ユニットテスト作成

#### 2.1 Store個別セレクタテスト

```typescript
// apps/desktop/src/renderer/store/__tests__/selectors.test.ts
describe("Store Individual Selectors", () => {
  describe("LLM Selectors", () => {
    it("TC-SEL-001: useLLMProviders returns stable reference when providers unchanged", () => {
      // 同じprovidersに対して同じ参照を返すことを確認
    });

    it("TC-SEL-002: useLLMFetchProviders returns stable function reference", () => {
      // アクション関数の参照安定性を確認
    });
  });

  describe("Skill Selectors", () => {
    it("TC-SEL-003: useImportedSkills returns stable reference when skills unchanged", () => {
      // 同じskillsに対して同じ参照を返すことを確認
    });

    it("TC-SEL-004: useRescanSkills returns stable function reference", () => {
      // アクション関数の参照安定性を確認
    });
  });

  describe("AuthMode Selectors", () => {
    it("TC-SEL-005: useInitializeAuthMode returns stable function reference", () => {
      // アクション関数の参照安定性を確認
    });
  });
});
```

#### 2.2 コンポーネント移行テスト

**LLMSelectorPanel移行テスト**

```typescript
// apps/desktop/src/renderer/components/llm/__tests__/LLMSelectorPanel.migration.test.tsx
describe("LLMSelectorPanel Migration Tests", () => {
  describe("個別セレクタHook使用後の動作確認", () => {
    it("TC-LLM-MIG-001: マウント時にfetchProvidersが1回のみ呼ばれる", async () => {
      // useRefガードなしでも1回のみ実行されることを確認
    });

    it("TC-LLM-MIG-002: re-renderしてもfetchProvidersは追加呼び出しされない", async () => {
      // props変更によるre-renderで追加呼び出しなし
    });

    it("TC-LLM-MIG-003: selectedProviderIdが同じ場合checkHealthは再呼び出しされない", async () => {
      // 同じproviderIdではcheckHealthが呼ばれない
    });

    it("TC-LLM-MIG-004: useRefガードなしでも無限ループしない", async () => {
      // 個別セレクタにより参照が安定し、useEffectが無限実行しない
    });
  });
});
```

**SkillSelector移行テスト**

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.migration.test.tsx
describe("SkillSelector Migration Tests", () => {
  describe("個別セレクタHook使用後の動作確認", () => {
    it("TC-SK-MIG-001: マウント時にrescanSkillsは呼ばれない", () => {
      // ボタンクリック時のみ呼ばれることを確認
    });

    it("TC-SK-MIG-002: handleRescanコールバックが安定している", () => {
      // re-renderしてもコールバック参照が変わらない
    });

    it("TC-SK-MIG-003: isScanning変更時に無限ループしない", () => {
      // state変更でも無限ループしない
    });

    it("TC-SK-MIG-004: selectedSkillName変更時に無限ループしない", () => {
      // 選択変更でも無限ループしない
    });
  });
});
```

**SettingsView移行テスト**

```typescript
// apps/desktop/src/renderer/views/SettingsView/SettingsView.migration.test.tsx
describe("SettingsView Migration Tests", () => {
  describe("個別セレクタHook使用後の動作確認", () => {
    it("TC-SV-MIG-001: initializeAuthModeが1回のみ呼ばれる", async () => {
      // useRefガードなしでも1回のみ実行
    });

    it("TC-SV-MIG-002: mode変更後も追加の初期化呼び出しなし", async () => {
      // state変更でも初期化は再実行されない
    });

    it("TC-SV-MIG-003: useRefガードなしでも無限ループしない", async () => {
      // 個別セレクタにより参照が安定
    });
  });
});
```

### ステップ3: 既存テストの更新方針

#### 3.1 更新が必要なテスト

| ファイル                    | 更新内容                           |
| --------------------------- | ---------------------------------- |
| `LLMSelectorPanel.test.tsx` | Store mockを個別セレクタ対応に更新 |
| `SkillSelector.test.tsx`    | Store mockを個別セレクタ対応に更新 |
| `SettingsView.test.tsx`     | Store mockを個別セレクタ対応に更新 |

#### 3.2 Mock更新パターン

**Before（合成Hook）:**

```typescript
vi.mock("@/renderer/store", () => ({
  useLLMStore: vi.fn(),
}));
```

**After（個別セレクタ）:**

```typescript
vi.mock("@/renderer/store", () => ({
  useLLMProviders: vi.fn(),
  useLLMSelectedProviderId: vi.fn(),
  useLLMIsLoading: vi.fn(),
  useLLMError: vi.fn(),
  useLLMHealthStatus: vi.fn(),
  useLLMFetchProviders: vi.fn(),
  useLLMSelectProvider: vi.fn(),
  useLLMSelectModel: vi.fn(),
  useLLMCheckHealth: vi.fn(),
}));
```

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ | 検証内容                         | テストファイル          |
| ---------------- | -------------------------------- | ----------------------- |
| 状態管理テスト   | Store→コンポーネント間の状態同期 | `*.integration.test.ts` |
| 無限ループ検証   | useEffect依存配列の安定性        | `*.migration.test.ts`   |
| 参照安定性テスト | 個別セレクタの参照安定性         | `selectors.test.ts`     |

## アーキテクチャ層別テスト

| 層               | テスト観点                        | テストファイル配置                                    |
| ---------------- | --------------------------------- | ----------------------------------------------------- |
| Renderer Process | UIコンポーネント、状態管理、Hooks | `apps/desktop/src/renderer/**/*.test.ts`              |
| Store            | セレクタ、アクション、状態更新    | `apps/desktop/src/renderer/store/__tests__/*.test.ts` |

## 成果物

| 成果物                 | パス                                                                                     | 説明               |
| ---------------------- | ---------------------------------------------------------------------------------------- | ------------------ |
| テスト仕様書           | `outputs/phase-4/test-specification.md`                                                  | テスト設計         |
| テストケース           | `outputs/phase-4/test-cases.md`                                                          | ケース一覧         |
| セレクタテスト         | `apps/desktop/src/renderer/store/__tests__/selectors.test.ts`                            | セレクタ参照安定性 |
| 移行テスト（LLM）      | `apps/desktop/src/renderer/components/llm/__tests__/LLMSelectorPanel.migration.test.tsx` | 移行検証テスト     |
| 移行テスト（Skill）    | `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.migration.test.tsx`  | 移行検証テスト     |
| 移行テスト（Settings） | `apps/desktop/src/renderer/views/SettingsView/SettingsView.migration.test.tsx`           | 移行検証テスト     |

## 完了条件

- [ ] テストシナリオが全コンポーネントに対して定義されている
- [ ] 個別セレクタHookの設計が完了している
- [ ] Store個別セレクタのテストが作成されている
- [ ] 各コンポーネントの移行テストが作成されている
- [ ] すべてのテストが失敗状態（Red）であることを確認
- [ ] 既存テストの更新方針が策定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
# - [ ] 移行テストがまだ実装されていない状態で失敗
```

## 次のPhase

Phase 5: 実装（TDD: Green）
