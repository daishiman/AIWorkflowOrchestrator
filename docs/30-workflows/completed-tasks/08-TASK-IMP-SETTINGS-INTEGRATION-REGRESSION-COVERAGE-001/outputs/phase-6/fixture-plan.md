# Phase 6: テスト Fixture 計画

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 6                                                        |
| 作成日   | 2026-03-08                                               |
| 作成者   | SubAgent-Component-Scope                                 |
| 入力     | Phase 4-5 成果物（settings-test-harness.ts 設計）        |

---

## 概要

Phase 4 で作成されるテスト fixture を regression fixture へ昇格させ、Phase 6 の追加テストケース（INT-06 ~ INT-13）で再利用可能にする計画を定義する。

---

## Fixture カテゴリ一覧

### 1. electronAPI mock fixture

Phase 4 の `createSettingsHarness` で使用される `electronApiOverrides` のプリセットを regression fixture として定義する。

| Fixture 名                           | 用途                                       | 使用テストケース               | レスポンス概要                                                                                          |
| ------------------------------------ | ------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `electronApiFixtures.normal`         | 正常系デフォルト                           | INT-01, INT-04, INT-09, INT-10 | `apiKey.list()` が4プロバイダー（全て未登録）を返す                                                     |
| `electronApiFixtures.malformed`      | providers が非配列                         | INT-03                         | `apiKey.list()` が `{ success: true, data: { providers: null } }` を返す                                |
| `electronApiFixtures.networkError`   | Promise reject                             | INT-07                         | `apiKey.list()` が `Promise.reject(new Error("Network Error"))` を返す                                  |
| `electronApiFixtures.undefined`      | electronAPI 自体が未定義                   | INT-08                         | `window.electronAPI` を `undefined` に設定                                                              |
| `electronApiFixtures.mixedProviders` | 正常 + malformed entry が混在              | INT-12                         | `apiKey.list()` が `[validProvider, null, { name: 123 }, validProvider2]` を providers に含むレスポンス |
| `electronApiFixtures.timeout`        | タイムアウトシミュレーション（将来拡張用） | （未使用）                     | `apiKey.list()` が `new Promise(() => {})` を返す（resolve しない）                                     |

#### 正常系 fixture の詳細設計

```typescript
// electronApiFixtures.normal の概念設計
const normalElectronApi = {
  apiKeyList: () =>
    Promise.resolve({
      success: true,
      data: {
        providers: [
          { name: "OpenAI", hasKey: false, isValid: null },
          { name: "Anthropic", hasKey: false, isValid: null },
          { name: "Google", hasKey: false, isValid: null },
          { name: "Azure", hasKey: false, isValid: null },
        ],
      },
    }),
  apiKeyValidate: () =>
    Promise.resolve({ success: true, data: { isValid: true } }),
  apiKeySave: () => Promise.resolve({ success: true }),
  apiKeyDelete: () => Promise.resolve({ success: true }),
};
```

#### malformed provider entry fixture の詳細設計

```typescript
// electronApiFixtures.mixedProviders の概念設計
const mixedProvidersElectronApi = {
  apiKeyList: () =>
    Promise.resolve({
      success: true,
      data: {
        providers: [
          { name: "OpenAI", hasKey: true, isValid: true }, // 正常
          null, // malformed: null entry
          { name: 123 }, // malformed: name が number
          { name: "Anthropic", hasKey: false, isValid: null }, // 正常
          undefined, // malformed: undefined entry
          { hasKey: true }, // malformed: name 欠落
        ],
      },
    }),
};
```

---

### 2. Store state fixture

Phase 4 の `createSettingsHarness` で使用される `storeOverrides` のプリセットを regression fixture として定義する。

| Fixture 名                       | 用途                | 使用テストケース          | 状態概要                                               |
| -------------------------------- | ------------------- | ------------------------- | ------------------------------------------------------ |
| `storeFixtures.authenticated`    | 認証済みデフォルト  | INT-01, INT-02, INT-04    | `isAuthenticated: true`, `authMode: "subscription"`    |
| `storeFixtures.unauthenticated`  | 未認証状態          | （component test で使用） | `isAuthenticated: false`, `authUser: null`             |
| `storeFixtures.loading`          | ローディング中      | INT-06                    | `authModeLoading: true`, `isLoading: true`             |
| `storeFixtures.error`            | エラー状態          | （将来拡張用）            | `authModeStatus: { type: "error", message: "..." }`    |
| `storeFixtures.apiKeyMode`       | api-key モード      | INT-11                    | `authMode: "api-key"`, `isAuthenticated: false`        |
| `storeFixtures.corruptedPersist` | 破損 persist データ | INT-13                    | `viewHistory: "not-an-array"`, `expandedFolders: null` |
| `storeFixtures.invalidAuthMode`  | 不正な authMode     | INT-05                    | `authMode: "invalid" as AuthMode`                      |

#### 認証済みデフォルト fixture の詳細設計

```typescript
// storeFixtures.authenticated の概念設計
const authenticatedStore = {
  // SettingsSlice
  apiKey: "",
  autoSyncEnabled: false,
  themeMode: "light" as ThemeMode,
  // AuthSlice
  isAuthenticated: true,
  isLoading: false,
  authUser: { id: "test-user-id", email: "test@example.com" },
  profile: { displayName: "Test User", avatarUrl: null },
  linkedProviders: [],
  // AuthModeSlice
  authMode: "subscription" as AuthMode,
  authModeStatus: { type: "active", message: "サブスクリプション有効" },
  authModeLoading: false,
};
```

#### 破損 persist fixture の詳細設計

```typescript
// storeFixtures.corruptedPersist の概念設計
const corruptedPersistStore = {
  ...authenticatedStore,
  // 以下は persist hydrate で破損した想定のデータ
  viewHistory: "not-an-array" as unknown, // Array であるべきが string
  expandedFolders: null as unknown, // Set であるべきが null
  recentFiles: 42 as unknown, // Array であるべきが number
};
```

---

### 3. Provider list fixture

ApiKeysSection で使用される provider リストの fixture を定義する。

| Fixture 名                             | 用途                   | 使用テストケース | 内容                                              |
| -------------------------------------- | ---------------------- | ---------------- | ------------------------------------------------- |
| `providerFixtures.allUnregistered`     | 全プロバイダー未登録   | INT-01, INT-04   | 4プロバイダー、全て `hasKey: false`               |
| `providerFixtures.allRegistered`       | 全プロバイダー登録済み | （将来拡張用）   | 4プロバイダー、全て `hasKey: true, isValid: true` |
| `providerFixtures.partialRegistered`   | 一部登録済み           | INT-11           | OpenAI と Anthropic のみ `hasKey: true`           |
| `providerFixtures.malformedEntryMixed` | malformed entry 混入   | INT-12           | 正常2件 + null + 型不正2件                        |
| `providerFixtures.emptyArray`          | 空配列                 | INT-03 の派生    | `providers: []`                                   |
| `providerFixtures.nonArray`            | 非配列（null）         | INT-03           | `providers: null`                                 |
| `providerFixtures.nonArrayString`      | 非配列（文字列）       | INT-03 の派生    | `providers: "invalid"`                            |
| `providerFixtures.nonArrayNumber`      | 非配列（数値）         | INT-03 の派生    | `providers: 42`                                   |

---

### 4. Auth-mode fixture

AuthModeSelector で使用される auth-mode 状態の fixture を定義する。

| Fixture 名                          | 用途                     | 使用テストケース | 内容                                                                |
| ----------------------------------- | ------------------------ | ---------------- | ------------------------------------------------------------------- |
| `authModeFixtures.subscription`     | サブスクリプションモード | INT-01, INT-02   | `authMode: "subscription"`, `status: { type: "active" }`            |
| `authModeFixtures.apiKey`           | APIキーモード            | INT-11           | `authMode: "api-key"`, `status: { type: "active" }`                 |
| `authModeFixtures.loading`          | ローディング中           | INT-06           | `authMode: "subscription"`, `authModeLoading: true`, `status: null` |
| `authModeFixtures.invalidStatus`    | 不正なステータス         | INT-05           | `authMode: "invalid" as AuthMode`, `status: null`                   |
| `authModeFixtures.errorStatus`      | エラーステータス         | （将来拡張用）   | `authMode: "api-key"`, `status: { type: "error", message: "..." }`  |
| `authModeFixtures.switchTransition` | 切替中の遷移状態         | INT-02           | `authMode: "subscription"` から `"api-key"` への遷移パラメータ      |

---

## Fixture ファイル配置計画

```
apps/desktop/src/renderer/views/SettingsView/
  __tests__/
    settings-test-harness.ts          # Phase 4 で作成（harness 本体）
    fixtures/
      electronApi.fixtures.ts         # electronAPI mock プリセット
      store.fixtures.ts               # store state プリセット
      provider.fixtures.ts            # provider リストプリセット
      authMode.fixtures.ts            # auth-mode 状態プリセット
      index.ts                        # 全 fixture の re-export
    SettingsView.integration.test.tsx  # Phase 4-5 で作成（INT-01~05）
```

### 配置根拠

- Phase 2 設計判断で `__tests__/` 配下に harness を配置する方針が決定済み
- fixture は harness と同階層の `fixtures/` サブディレクトリに配置し、テストファイルからの import パスを短くする
- `index.ts` で re-export することで、テストファイルでは `from "./fixtures"` の1行で全 fixture にアクセス可能にする

---

## Phase 4 fixture からの昇格手順

### Step 1: Phase 4 のインライン mock を fixture へ抽出

Phase 4-5 で `SettingsView.integration.test.tsx` 内にインラインで定義された mock パターンを、fixture ファイルへ抽出する。

```typescript
// Phase 4-5 のインライン定義（抽出前）
const harness = createSettingsHarness({
  electronApiOverrides: {
    apiKeyList: () =>
      Promise.resolve({
        success: true,
        data: { providers: null },
      }),
  },
});

// Phase 6 の fixture 使用（抽出後）
import { electronApiFixtures } from "./fixtures";
const harness = createSettingsHarness({
  electronApiOverrides: electronApiFixtures.malformed,
});
```

### Step 2: 命名規則の統一

| 命名パターン     | 用途               | 例                                 |
| ---------------- | ------------------ | ---------------------------------- |
| `*.normal`       | 正常系デフォルト   | `electronApiFixtures.normal`       |
| `*.malformed`    | データ形式不正     | `electronApiFixtures.malformed`    |
| `*.networkError` | ネットワークエラー | `electronApiFixtures.networkError` |
| `*.undefined`    | 値未定義           | `electronApiFixtures.undefined`    |
| `*.loading`      | ローディング状態   | `storeFixtures.loading`            |
| `*.corrupted*`   | 破損データ         | `storeFixtures.corruptedPersist`   |

### Step 3: 型安全性の確保

各 fixture ファイルは、harness の `SettingsHarnessOptions` 型に準拠する型定義を持つ。

```typescript
// fixtures/electronApi.fixtures.ts の型設計
import type { SettingsHarnessOptions } from "../settings-test-harness";

type ElectronApiFixture = NonNullable<
  SettingsHarnessOptions["electronApiOverrides"]
>;

export const electronApiFixtures: Record<string, ElectronApiFixture> = {
  normal: {
    /* ... */
  },
  malformed: {
    /* ... */
  },
  // ...
};
```

---

## Fixture と テストケースの対応表

| Fixture カテゴリ | Fixture 名       | INT-01 | INT-02 | INT-03 | INT-04 | INT-05 | INT-06 | INT-07 | INT-08 | INT-09 | INT-10 | INT-11 | INT-12 | INT-13 |
| ---------------- | ---------------- | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| electronAPI      | normal           | x      |        |        | x      |        |        |        |        | x      | x      |        |        |        |
| electronAPI      | malformed        |        |        | x      |        |        |        |        |        |        |        |        |        |        |
| electronAPI      | networkError     |        |        |        |        |        |        | x      |        |        |        |        |        |        |
| electronAPI      | undefined        |        |        |        |        |        |        |        | x      |        |        |        |        |        |
| electronAPI      | mixedProviders   |        |        |        |        |        |        |        |        |        |        |        | x      |        |
| store            | authenticated    | x      | x      |        | x      |        |        |        |        | x      | x      |        |        |        |
| store            | loading          |        |        |        |        |        | x      |        |        |        |        |        |        |        |
| store            | apiKeyMode       |        |        |        |        |        |        |        |        |        |        | x      |        |        |
| store            | invalidAuthMode  |        |        |        |        | x      |        |        |        |        |        |        |        |        |
| store            | corruptedPersist |        |        |        |        |        |        |        |        |        |        |        |        | x      |
| authMode         | subscription     | x      | x      |        |        |        |        |        |        |        |        |        |        |        |
| authMode         | loading          |        |        |        |        |        | x      |        |        |        |        |        |        |        |
| authMode         | invalidStatus    |        |        |        |        | x      |        |        |        |        |        |        |        |        |

---

## リスクと対策

| リスク                                            | 影響度 | 対策                                                                          |
| ------------------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| Phase 4-5 で harness の型定義が変更される         | 高     | fixture の型は harness の型に依存させ、型エラーで不整合を即座に検出する       |
| fixture の過剰定義によるメンテナンスコスト増加    | 中     | 実際に使用されない fixture は定義しない。`timeout` は将来拡張用として明示する |
| インライン mock と fixture の混在による可読性低下 | 中     | Phase 6 完了後にインライン mock を全て fixture に統合する方針を徹底する       |
| provider fixture の型が実装と乖離する             | 低     | `@repo/shared` の provider 型定義を import して fixture の型安全性を確保する  |
