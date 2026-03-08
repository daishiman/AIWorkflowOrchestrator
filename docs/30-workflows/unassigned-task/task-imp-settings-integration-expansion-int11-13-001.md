# SettingsView 統合テスト拡充（INT-11~INT-13） - タスク指示書

## メタ情報

```yaml
issue_number: 1081
```

## メタ情報

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-08-003-SETTINGS-INTEGRATION-EXPANSION-INT11-13                    |
| タスク名     | SettingsView 統合テスト拡充（INT-11~INT-13）                         |
| 分類         | テストカバレッジ拡充                                                 |
| 対象機能     | SettingsView 統合テスト（regression-expansion-plan の残実装）        |
| 優先度       | 中                                                                   |
| 見積もり規模 | 中規模                                                               |
| ステータス   | 未実施                                                               |
| 発見元       | Phase 12（08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001） |
| 発見日       | 2026-03-08                                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

08-TASK の Phase 6（回帰テスト拡充）で regression-expansion-plan.md に INT-06 ~ INT-13 の8テストケースを計画した。このうち INT-06 ~ INT-10 は Phase 6 で実装完了したが、INT-11 ~ INT-13 は技術的制約により未実装となった。

| テストケース | 計画内容                                      | 未実装理由                                                                 |
| ------------ | --------------------------------------------- | -------------------------------------------------------------------------- |
| INT-11       | auth-mode 切替後の ApiKeysSection 連動        | ApiKeysSection は auth-mode に依存せず常時表示のため連動テストの意義が低い |
| INT-12       | malformed provider entry のフィルタリング     | 統合テストよりも単体テストが適切                                           |
| INT-13       | persist corruption 後の SettingsView 正常表示 | localStorage mock の harness 非対応。専用 setup 関数の追加が必要           |

### 1.2 問題点・課題

1. **INT-11**: ApiKeysSection の表示条件が auth-mode に連動するか実装を確認する必要がある。連動する実装変更があった場合、回帰テストが存在しないため検出できない
2. **INT-12**: malformed provider entry のフィルタリングは ApiKeysSection 内部で行われるが、統合テストレベルでのエンドツーエンド検証が不足
3. **INT-13**: Zustand の persist middleware が localStorage から破損データを復元した場合の SettingsView の挙動が未検証。Phase 2 設計判断の異常系4（persist corruption recovery）に対応

### 1.3 放置した場合の影響

- auth-mode と ApiKeysSection の表示条件が連動する実装変更があった場合、回帰バグが検出されない
- malformed API レスポンスによるクラッシュが本番環境で発生する可能性
- persist corruption による設定画面クラッシュがユーザーに影響する

---

## 2. 何を達成するか（What）

### 2.1 目的

regression-expansion-plan.md で計画された INT-11 ~ INT-13 の未実装テストケースを実装し、SettingsView 統合テストのカバレッジを完全化する。

### 2.2 最終ゴール

- INT-11 ~ INT-13 の3テストケースが実装され、全て PASS する
- 既存の18テスト + 新規3テスト = 21テスト全て PASS
- regression-expansion-plan.md の全テストケース（INT-01 ~ INT-13）がカバーされる

### 2.3 スコープ

#### 含むもの

- INT-11: auth-mode 切替後の ApiKeysSection 連動テスト
- INT-12: malformed provider entry フィルタリングテスト
- INT-13: persist corruption 後の SettingsView 正常表示テスト
- settings-test-harness.ts への localStorage mock 機能追加（INT-13 用）

#### 含まないもの

- INT-01 ~ INT-10 の変更
- プロダクションコードの変更
- E2E テストの追加

### 2.4 成果物

- 更新済み `SettingsView.integration.test.tsx`（INT-11 ~ INT-13 追加）
- 更新済み `settings-test-harness.ts`（localStorage mock 追加）

---

## 3. どのように実行するか（How）

### 3.1 実装手順

#### Step 1: INT-11 の実装判定

1. ApiKeysSection が auth-mode に連動するか実装を確認:
   ```bash
   grep -rn "authMode\|auth-mode\|mode" apps/desktop/src/renderer/views/SettingsView/components/ApiKeysSection/
   ```
2. 連動する場合: テストを実装
3. 連動しない場合: スキップし、理由をコメントに記載

#### Step 2: INT-12 の実装

```typescript
it("INT-12: malformed provider entry がフィルタされクラッシュしない", async () => {
  // harness で malformed entry を含むレスポンスを設定
  const malformedListResult = {
    success: true,
    data: {
      providers: [
        {
          provider: "openai",
          displayName: "OpenAI",
          status: "registered",
          lastValidatedAt: "2026-03-01",
        },
        null, // null entry
        { name: 123 }, // 型不正 entry
        undefined, // undefined entry
        {
          provider: "anthropic",
          displayName: "Anthropic",
          status: "not_registered",
          lastValidatedAt: null,
        },
      ],
    },
  };

  // レンダー & 正常 provider のみ表示されることを確認
  // クラッシュしないことを確認
});
```

#### Step 3: INT-13 の実装（localStorage mock 追加）

1. settings-test-harness.ts に localStorage mock 機能を追加:

```typescript
// harness に追加
setupLocalStorageMock: (corruptedData?: Record<string, string>) => {
  const storage: Record<string, string> = corruptedData ?? {};
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: vi.fn((key: string) => storage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(storage).forEach((k) => delete storage[k]);
      }),
    },
    writable: true,
    configurable: true,
  });
};
```

2. INT-13 テスト実装:

```typescript
it("INT-13: persist corruption 後も SettingsView が正常表示される", async () => {
  // 破損データを localStorage に注入
  harness.setupLocalStorageMock({
    "app-store": JSON.stringify({
      state: {
        viewHistory: "not-an-array", // 型不正
        expandedFolders: null, // null
        themeMode: 12345, // 型不正
      },
    }),
  });

  // SettingsView をレンダー
  // クラッシュせず全セクションが表示されることを確認
});
```

#### Step 4: テスト実行・確認

```bash
cd apps/desktop
pnpm vitest run src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx
```

### 3.2 実装時の苦戦箇所と解決策（08-TASK 知見）

#### 苦戦箇所1: vi.mock hoisting とモジュールスコープ変数パターン

**問題**: vi.mock はファイル先頭に hoisting されるため、テスト内で設定した変数を vi.mock ファクトリ内で参照できない。08-TASK で最も苦戦した技術課題。

**解決策**: モジュールスコープで `let` 変数を宣言し、vi.mock ファクトリ内でその変数を参照する。`beforeEach` で変数を再代入してテストごとの状態を制御する。

```typescript
let currentStoreState: MockStoreState;
let currentAuthMode = "subscription" as const;

vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector) => selector(currentStoreState)),
  useAuthMode: vi.fn(() => currentAuthMode),
}));

beforeEach(() => {
  currentStoreState = createDefaultStoreState();
  currentAuthMode = "subscription";
});
```

#### 苦戦箇所2: settings-test-harness の設計（M-01 対応）

**問題**: AccountSection が使用する store セレクタが17個以上あり、全てのデフォルト値を harness に含めないと `TypeError: Cannot read properties of undefined` が発生する。Phase 3 の MINOR 指摘 M-01 で指摘された。

**解決策**: `createDefaultStoreState()` に全18セレクタのデフォルト値を網羅的に定義。新規テストケースでは `storeOverrides` で必要なプロパティのみ上書きする。

#### 苦戦箇所3: real composition でのコンポーネント副作用管理

**問題**: SettingsView を real composition（vi.mock 不使用）でレンダーすると、AccountSection, ApiKeysSection, AuthModeSelector の各コンポーネントの `useEffect` が全て実行され、予期しない副作用（API 呼び出し、state 更新）が発生する。

**解決策**: harness で全ての外部 API（electronAPI.apiKey 等）をモックし、副作用を制御する。テスト対象外のコンポーネントの副作用は、harness のデフォルト値で安全に処理される。

#### 苦戦箇所4: P39 happy-dom での userEvent 非互換

**問題**: `@testing-library/user-event` の `userEvent.setup()` は happy-dom 環境で Symbol 操作エラーを起こす。49/53テストが一斉に失敗した事例あり。

**解決策**: happy-dom 環境では `fireEvent` を使用。非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む。

---

## 4. 受け入れ基準

- [ ] INT-11 が実装される（または実装不要の判定根拠がコメントに記載）
- [ ] INT-12 が実装され、malformed entry でクラッシュしないことが検証される
- [ ] INT-13 が実装され、persist corruption 後の正常表示が検証される
- [ ] 全テスト（既存18 + 新規）が PASS する
- [ ] `act()` 警告が新規テストから出力されない

---

## 5. 参照資料

| 資料                      | パス                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| regression-expansion-plan | `docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001/outputs/phase-6/regression-expansion-plan.md` |
| 統合テスト本体            | `apps/desktop/src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx`                                |
| テストハーネス            | `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts`                                         |
| Phase 2 設計判断          | `docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001/outputs/phase-2/design-decisions.md`          |

---

## 6. 関連タスク

| タスクID                                                 | 関係                           |
| -------------------------------------------------------- | ------------------------------ |
| 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 | 親タスク（発見元）             |
| UT-08-001                                                | act() 警告解消（先行対応推奨） |
| UT-08-002                                                | E2E テスト導入（上位テスト層） |
