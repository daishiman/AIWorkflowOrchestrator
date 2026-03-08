# Phase 2: 設計判断書

## メタ情報

| 項目     | 内容                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001                                |
| Phase    | 2                                                                                       |
| 作成日   | 2026-03-08                                                                              |
| 作成者   | SubAgent-Lead-Sync                                                                      |
| 入力     | Phase 1 成果物（requirements-definition.md, acceptance-criteria.md, scope-boundary.md） |

---

## 設計判断1: settings integration harness の構造

### 判断

store 初期化と electronAPI mock を一箇所で管理する `settings-test-harness.ts` を新規作成する。

### 構造設計

```
apps/desktop/src/renderer/views/SettingsView/
  __tests__/
    settings-test-harness.ts     # mock 一元管理
  SettingsView.test.tsx           # 既存 unit test（変更なし）
  SettingsView.integration.test.tsx  # 新規 integration test
```

### harness の責務

```typescript
// settings-test-harness.ts の概念設計

interface SettingsHarnessOptions {
  // Store 初期状態
  storeOverrides?: Partial<{
    // SettingsSlice
    apiKey: string;
    autoSyncEnabled: boolean;
    themeMode: ThemeMode;
    // AuthSlice（認証状態）
    isAuthenticated: boolean;
    isLoading: boolean;
    authUser: AuthUser | null;
    profile: UserProfile | null;
    linkedProviders: LinkedProvider[];
    // AuthModeSlice
    authMode: AuthMode;
    authModeStatus: AuthModeStatusDTO | null;
    authModeLoading: boolean;
  }>;

  // electronAPI mock レスポンス
  electronApiOverrides?: Partial<{
    apiKeyList: () => Promise<ApiKeyListResponse>;
    apiKeyValidate: () => Promise<ApiKeyValidateResponse>;
    apiKeySave: () => Promise<ApiKeySaveResponse>;
    apiKeyDelete: () => Promise<ApiKeyDeleteResponse>;
  }>;
}

// harness が提供する関数
function createSettingsHarness(options?: SettingsHarnessOptions): {
  // mock された store セレクタと action
  mockStore: MockedStoreState;
  // mock された electronAPI
  mockElectronAPI: MockedElectronAPI;
  // テスト前初期化（beforeEach で呼ぶ）
  setup: () => void;
  // テスト後クリーンアップ（afterEach で呼ぶ）
  cleanup: () => void;
};
```

### store mock の設計方針

- `useAppStore` は selector パターン（`useAppStore((state) => state.xxx)`）で使用されるため、mock は `vi.fn((selector) => selector(mockState))` で実装する
- AuthMode 系の個別セレクタ（`useAuthMode`, `useAuthModeStatus` 等）は `vi.fn(() => value)` で個別に mock する
- AccountSection が使用する 18 個の store セレクタは全て harness 内でデフォルト値を提供する
- テストケースごとに `storeOverrides` で部分的に上書き可能にする

### electronAPI mock の設計方針

- `window.electronAPI` を `Object.defineProperty` で設定する
- ApiKeysSection が使用する `apiKey.list()` / `apiKey.validate()` / `apiKey.save()` / `apiKey.delete()` の4メソッドを mock する
- デフォルトは正常レスポンス（4プロバイダー全て未登録）を返す
- テストケースごとに `electronApiOverrides` で異常レスポンスに差し替え可能にする

### 根拠

- AC-06: store + electronAPI の mock が harness で一元管理される
- NFR-02: モック境界を外部副作用に限定し、harness を再利用可能にする
- P40: テスト実行ディレクトリ依存を harness 内で吸収する

---

## 設計判断2: モック境界の定義

### Real composition にするコンポーネント

| コンポーネント   | 理由                                                                          |
| ---------------- | ----------------------------------------------------------------------------- |
| AccountSection   | store 状態との連動を検証する（認証/未認証の UI 切替）                         |
| ApiKeysSection   | electronAPI.apiKey.list() のレスポンス shape に依存し、防御ガードの検証が必要 |
| AuthModeSelector | role="radiogroup" の a11y 属性とキーボードナビゲーションを含む実体が必要      |
| ThemeSelector    | 既に既存テストで real composition として含まれている                          |
| ProfileSection   | 既に既存テストで real composition として含まれている                          |
| SettingsCard     | 純粋な presentational コンポーネント。mock 不要                               |
| Checkbox         | 純粋な presentational コンポーネント。mock 不要                               |
| Button           | 純粋な presentational コンポーネント。mock 不要                               |

### Mock にする境界

| 境界                        | Mock 対象                    | 理由                                                                   |
| --------------------------- | ---------------------------- | ---------------------------------------------------------------------- |
| IPC 通信                    | `window.electronAPI`         | Main Process が不在のため mock 必須                                    |
| Store 初期状態              | `useAppStore` + 個別セレクタ | 任意の状態をテストケースで制御するため                                 |
| Supabase Auth               | store 経由で制御             | AccountSection は store 経由で認証状態を取得するため store mock で十分 |
| React Portal (createPortal) | 必要に応じて mock            | AccountSection のアバターメニューが `document.body` に Portal を使用   |

### 判断の根拠

- 「リスク高導線のみ real composition 化」（index.md 採用案 C）に基づく
- モックは「外部副作用境界」に限定し、コンポーネント間のモックを排除する
- AccountSection の Supabase Auth 依存は store mock で吸収できるため、IPC mock は不要

---

## 設計判断3: テスト粒度の分離

### component test と integration test の責務分離

| テスト種別       | ファイル                                               | 責務                                                               | モック境界                       |
| ---------------- | ------------------------------------------------------ | ------------------------------------------------------------------ | -------------------------------- |
| Unit test (既存) | `SettingsView.test.tsx`                                | 各セクションの表示確認、store action 呼び出し、P31 対策の検証      | 3コンポーネント + store をモック |
| Integration test | `SettingsView.integration.test.tsx`                    | real composition での統合動作、IPC レスポンスの防御ガード、AC 検証 | electronAPI + store 初期状態のみ |
| Component test   | `AuthModeSelector/__tests__/AuthModeSelector.test.tsx` | AuthModeSelector 単体の a11y、キーボードナビゲーション             | Props のみ                       |
| Component test   | `ApiKeysSection/__tests__/ApiKeysSection.test.tsx`     | ApiKeysSection 単体の provider 表示、フォームモーダル              | electronAPI のみ                 |

### 責務重複の回避

- **既存 unit test**: セクション存在確認 + store action 呼び出し検証 → **維持**（高速、安定）
- **新規 integration test**: セクション間の連動 + IPC レスポンス防御 → **追加**（遅いが検知力が高い）
- 重複テストケースは設けない。例: 「テーマ変更で setThemeMode が呼ばれる」は既存 unit test のみで検証

---

## 異常系設計

### 異常系1: auth-mode invalid state

| 項目      | 内容                                                                            |
| --------- | ------------------------------------------------------------------------------- |
| トリガー  | `useAuthMode()` が `"subscription"` / `"api-key"` 以外の値を返す                |
| 期待動作  | AuthModeSelector が `currentMode="subscription"` として描画される               |
| 検証方法  | harness で `authMode: "invalid" as AuthMode` を設定し、描画崩壊しないことを確認 |
| テスト ID | INT-05                                                                          |

### 異常系2: apiKey malformed response

| 項目      | 内容                                                                     |
| --------- | ------------------------------------------------------------------------ |
| トリガー  | `apiKey.list()` が `{ success: true, data: { providers: null } }` を返す |
| 期待動作  | ApiKeysSection が空のプロバイダーリスト（4つの「未登録」状態）を表示する |
| 検証方法  | harness で `apiKeyList` を異常レスポンスに差し替え、エラー表示を確認     |
| テスト ID | INT-03                                                                   |

### 異常系3: apiKey.list() 未定義

| 項目      | 内容                                                             |
| --------- | ---------------------------------------------------------------- |
| トリガー  | `window.electronAPI.apiKey` が `undefined`                       |
| 期待動作  | ApiKeysSection が「APIキー機能が利用できません」エラーを表示する |
| 検証方法  | harness で `window.electronAPI.apiKey` を未定義に設定            |
| テスト ID | INT-03 の派生ケース                                              |

### 異常系4: persist corruption recovery

| 項目      | 内容                                                                 |
| --------- | -------------------------------------------------------------------- |
| トリガー  | store の hydrate で `viewHistory` / `expandedFolders` が非 iterable  |
| 期待動作  | SettingsView がクラッシュせず正常に表示される                        |
| 検証方法  | harness で破損 store 状態を設定し、SettingsView のレンダリングを確認 |
| テスト ID | INT-05 の派生ケース                                                  |

---

## テストケース ID と AC の対応行列

| テストケース ID | シナリオ名                         | AC-01 | AC-02 | AC-03 | AC-04 | AC-05 | AC-06 |
| --------------- | ---------------------------------- | ----- | ----- | ----- | ----- | ----- | ----- |
| INT-01          | settings shell mount               | x     |       |       |       |       | x     |
| INT-02          | auth-mode 切替 flow                | x     | x     |       |       | x     | x     |
| INT-03          | apiKey malformed response fallback | x     |       | x     |       | x     | x     |
| INT-04          | apiKey list success                | x     |       | x     |       |       | x     |
| INT-05          | auth-mode invalid state recovery   | x     |       |       |       | x     | x     |

| 先行タスク AC | テストケース ID | 検証内容                                       |
| ------------- | --------------- | ---------------------------------------------- |
| task-05 AC    | INT-02          | auth-mode 切替 UI 導線が動作する               |
| task-06 AC    | INT-03          | malformed apiKey response でクラッシュしない   |
| task-07 AC    | INT-05          | corrupted state で settings がクラッシュしない |
