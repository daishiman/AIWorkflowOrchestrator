# Phase 12: 実装ガイド

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 12                                                       |
| 作成日   | 2026-03-08                                               |

---

## Part 1: 概念説明（中学生レベル）

### テストの「仲間はずれ」問題

学校の合唱コンクールを想像してみてください。

**個人練習（単体テスト）** では、一人ひとりが正しい音程で歌えるかを確認します。ソプラノのAさん、アルトのBさん、テノールのCさん、それぞれが別々の部屋で練習して「上手に歌えた」と言っています。

でも、3人が合わせて歌ったことは一度もありません。本番で3人が一緒に歌ったら、テンポがずれたり、音量バランスがおかしかったりするかもしれません。

これが「統合テスト」が必要な理由です。

### 影武者（モック）の問題

さらに問題があります。合唱コンクールの練習で、Aさんの代わりにAさんの声を録音したテープを使ったらどうなるでしょう？テープは毎回同じように再生されるので、Aさんが風邪で声が出なくなっても、練習では気づけません。

ソフトウェアテストでの「モック（vi.mock）」は、この録音テープと同じです。本物のコンポーネントの代わりに偽物を使うと、本物に不具合があっても見逃してしまいます。

**今回のタスクの前の状態**: SettingsView（設定画面）のテストでは、AccountSection（アカウント欄）、ApiKeysSection（APIキー欄）、AuthModeSelector（認証方式選択）の3つが全て「影武者」でした。つまり、設定画面の主要パーツが全部偽物だったのです。

**今回のタスクで直したこと**: 3つの「影武者」を全て「本人」に戻しました。これで、設定画面が実際の構成通りに動くかを確認できるようになりました。

### 練習場の準備係（テストハーネス）

合唱コンクールのチーム練習では、毎回同じ条件で練習する必要があります。練習場の温度、マイクの位置、伴奏の音量など、毎回バラバラだと「前回はうまくいったのに今回はダメだった」ということが起きます。

「テストハーネス（settings-test-harness.ts）」は、この練習場の準備係です。テストに必要な環境（store の状態、electronAPI の応答）を毎回同じ条件で準備してくれます。テストケースごとに「今回はAPIキーがエラーを返す環境で練習しよう」とカスタマイズもできます。

### まとめ

| 日常の例え           | ソフトウェアでの対応                   | 今回やったこと                    |
| -------------------- | -------------------------------------- | --------------------------------- |
| 個人練習             | 単体テスト（vi.mock 使用）             | 既存のまま残す                    |
| チーム練習           | 統合テスト（real composition）         | 新規作成                          |
| 影武者をやめて本人に | vi.mock を外して実コンポーネントを使用 | 3コンポーネントのモック除去       |
| 練習場の準備係       | settings-test-harness.ts               | store + electronAPI mock を一本化 |

---

## Part 2: 開発者向け実装詳細

### アーキテクチャ概要

```
SettingsView.integration.test.tsx
  |
  +-- settings-test-harness.ts (store mock + electronAPI mock 一本化)
  |     |
  |     +-- createSettingsHarness(options)     // ハーネス生成
  |     +-- createDefaultStoreState(overrides) // store state デフォルト値
  |     +-- createDefaultAuthModeSelectors()   // AuthMode セレクタ
  |     +-- createDefaultApiKeyListResult()    // apiKey.list 正常レスポンス
  |     +-- createDefaultElectronApiKey()      // electronAPI.apiKey mock
  |
  +-- SettingsView (real)
        +-- AccountSection (real, vi.mock なし)
        +-- AuthModeSelector (real, vi.mock なし)
        +-- ApiKeysSection (real, vi.mock なし)
        +-- ThemeSelector (real)
        +-- RAG設定セクション (real)
```

### settings-test-harness.ts の設計

#### 型定義

| 型名                    | 目的                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| `MockStoreState`        | AccountSection の 17 セレクタ + SettingsView のセレクタ全網羅        |
| `MockAuthModeSelectors` | AuthMode 個別セレクタ（P31 対策）                                    |
| `MockElectronApiKey`    | electronAPI.apiKey の list/save/delete/validate                      |
| `HarnessOptions`        | storeOverrides, authModeOverrides, apiKeyListResult, apiKeyOverrides |

#### createSettingsHarness(options) の戻り値

```typescript
{
  storeState: MockStoreState;           // store の全状態
  authModeSelectors: MockAuthModeSelectors; // AuthMode 個別セレクタ
  electronApiKey: MockElectronApiKey;   // electronAPI.apiKey mock

  createStoreMockFactory(): object;     // vi.mock に渡す factory
  setupElectronApi(): void;             // window.electronAPI を設定
  updateStoreState(updates): void;      // テスト中の動的変更
  updateAuthModeSelectors(updates): void; // AuthMode 動的変更
}
```

#### P31 対策: 個別セレクタのモック戦略

合成 Hook（`useAuthModeStore()`）の戻り値関数を `useEffect` 依存配列に含めると無限ループが発生する（P31）。このため、個別セレクタ（`useAuthMode`, `useAuthModeStatus`, `useSetAuthMode` 等）をモジュールスコープ変数で管理し、`vi.mock` ファクトリ内でそれらを参照する。

```typescript
// モジュールスコープの変数（beforeEach で再初期化）
let currentAuthMode = "subscription";
let currentSetMode = vi.fn();

// vi.mock は hoist される -> モジュールスコープ変数を参照
vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector) => selector(currentStoreState)),
  useAuthMode: vi.fn(() => currentAuthMode),
  useSetAuthMode: vi.fn(() => currentSetMode),
  // ...
}));
```

#### P39 対策: happy-dom 環境での fireEvent 使用

`@testing-library/user-event` は happy-dom 環境で Symbol 操作エラーを起こすため（P39）、全てのユーザー操作は `fireEvent` で実行する。非同期ハンドラは `act()` でラップする。

```typescript
// P39 準拠: fireEvent + act
await act(async () => {
  fireEvent.click(apiKeyRadio);
});
```

### テストケース設計

#### INT-01 ~ INT-05（Phase 4-5 で実装）

| ID     | シナリオ                                    | 主要アサーション                                 |
| ------ | ------------------------------------------- | ------------------------------------------------ |
| INT-01 | 全セクション real composition 表示          | 設定, アカウント, 認証方式, APIキー, テーマ, RAG |
| INT-02 | AuthModeSelector mode 切替                  | role="radio" 経由、setMode("api-key") 検証       |
| INT-03 | ApiKeysSection 正常プロバイダー表示         | 4プロバイダー表示、apiKey.list 呼び出し検証      |
| INT-04 | ApiKeysSection 異常レスポンスフォールバック | 非配列/undefined/失敗の3パターン                 |
| INT-05 | auth-mode status メッセージ条件付き表示     | null 非表示、エラー表示、成功スタイル            |

#### INT-06 ~ INT-10（Phase 6 で拡張）

| ID     | シナリオ                                    | 主要アサーション                                 |
| ------ | ------------------------------------------- | ------------------------------------------------ |
| INT-06 | AuthModeSelector disabled 状態              | isLoading=true で radio disabled、setMode 未呼出 |
| INT-07 | task-05 回帰: api-key 初期選択              | aria-checked="true" + ApiKeysSection 表示        |
| INT-08 | task-06 回帰: null レスポンスフォールバック | クラッシュせず4プロバイダー未登録表示            |
| INT-09 | task-07 回帰: 不正 themeMode リカバリー     | クラッシュせず全セクション表示                   |
| INT-10 | 保存ボタン・チェックボックス操作            | setAutoSyncEnabled 呼び出し検証                  |

### テスト実行方法

```bash
# apps/desktop ディレクトリから実行（P40 準拠）
cd apps/desktop
pnpm vitest run src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx
```

### 変更ファイル一覧

| 操作     | ファイルパス                                                                               | 目的                                   |
| -------- | ------------------------------------------------------------------------------------------ | -------------------------------------- |
| 新規     | `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts`          | store + electronAPI 統合 mock ハーネス |
| 新規     | `apps/desktop/src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx` | SettingsView 統合テスト（15テスト）    |
| 変更なし | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                   | テスト対象（変更なし）                 |
| 変更なし | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`                       | 既存単体テスト（変更なし、共存）       |

### 関連 Pitfall 対応表

| Pitfall | 内容                                | 本実装での対策                                   |
| ------- | ----------------------------------- | ------------------------------------------------ |
| P31     | Zustand Store Hooks 無限ループ      | 個別セレクタをモジュールスコープ変数で管理       |
| P39     | happy-dom での userEvent 非互換     | fireEvent + act() パターンを使用                 |
| P40     | テスト実行ディレクトリ依存          | apps/desktop から実行を明記                      |
| P48     | non-null assertion による安全性偽装 | ApiKeysSection の Array.isArray ガードを統合検証 |
