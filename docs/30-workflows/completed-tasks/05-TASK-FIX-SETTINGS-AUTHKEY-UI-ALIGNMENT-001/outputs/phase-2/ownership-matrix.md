# Phase 2: 責務分担マトリクス

## タスク ID

TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001

---

## 1. レイヤー別責務一覧

### 1.1 Renderer (変更あり)

| 対象ファイル                                                             | 操作         | 責務                                                                        |
| ------------------------------------------------------------------------ | ------------ | --------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx` | **新規作成** | authKey 入力・保存・削除・4状態表示の専用セクションコンポーネント           |
| `apps/desktop/src/renderer/components/settings/SettingsView/index.tsx`   | **修正**     | AuthKeySection の条件付きレンダリング (`authMode === 'api-key'` 時のみ表示) |

#### AuthKeySection の内部責務

| 責務         | 詳細                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| 入力管理     | APIキーの一時入力 state 管理 (useState)                                            |
| 保存操作     | `window.electronAPI.authKey.set()` 呼び出し、成功/失敗ハンドリング                 |
| 削除操作     | `window.electronAPI.authKey.delete()` 呼び出し、確認ダイアログ表示                 |
| 状態判定     | `authModeStatus.hasCredentials` と `authKeyAPI.exists()` の組み合わせで4状態を判定 |
| 状態表示     | 4状態バッジ (stored / env-fallback / not-set / error) のレンダリング               |
| セキュリティ | type="password" マスク、submit 後の inputValue 即破棄                              |
| a11y         | aria-label, aria-describedby, role="status", キーボード操作                        |

#### SettingsView の修正内容

| 修正箇所    | 内容                                                                            |
| ----------- | ------------------------------------------------------------------------------- |
| import 追加 | `AuthKeySection` のインポート                                                   |
| JSX 追加    | AuthModeSelector 直下に `{authMode === 'api-key' && <AuthKeySection />}` を追加 |

### 1.2 Preload (変更なし)

| 対象ファイル                                 | 操作     | 理由                                                                        |
| -------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| `apps/desktop/src/preload/api/authKeyApi.ts` | 変更なし | 既存の set/exists/validate/delete API で4状態判定に必要な情報が全て取得可能 |
| `apps/desktop/src/preload/types.ts`          | 変更なし | 既存の型定義で十分                                                          |

### 1.3 Main Process (変更なし)

| 対象ファイル                                        | 操作     | 理由                                                             |
| --------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| `apps/desktop/src/main/handlers/authKeyHandlers.ts` | 変更なし | `auth-key:exists` は `hasStoredKey \|\| hasEnvKey` で判定済み    |
| `apps/desktop/src/main/services/AuthModeService.ts` | 変更なし | `getStatus()` の `hasCredentials` は保存キー基準で既に正しく動作 |
| `apps/desktop/src/main/services/AuthKeyService.ts`  | 変更なし | 既存の set/exists/validate/delete 実装で十分                     |

### 1.4 Test (変更あり)

| 対象ファイル                                                                                     | 操作         | 責務                                          |
| ------------------------------------------------------------------------------------------------ | ------------ | --------------------------------------------- |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/__tests__/AuthKeySection.test.tsx` | **新規作成** | AuthKeySection 単体テスト                     |
| `apps/desktop/src/renderer/components/settings/SettingsView/__tests__/SettingsView.test.tsx`     | **修正**     | AuthKeySection 統合テスト(条件付き表示の検証) |

---

## 2. 依存関係マトリクス

```
AuthKeySection (新規)
  +-- uses --> window.electronAPI.authKey.set()     [Preload API / 既存]
  +-- uses --> window.electronAPI.authKey.exists()   [Preload API / 既存]
  +-- uses --> window.electronAPI.authKey.delete()   [Preload API / 既存]
  +-- uses --> useAuthMode()                         [Zustand セレクタ / 既存]
  +-- uses --> useAuthModeStatus()                   [Zustand セレクタ / 既存]
  +-- uses --> useFetchAuthModeStatus()              [Zustand セレクタ / 既存]

SettingsView (既存・修正)
  +-- renders --> AuthModeSelector                   [既存 / 変更なし]
  +-- renders --> AuthKeySection                     [新規 / 条件付き]
```

---

## 3. 変更影響範囲

### 3.1 影響を受けるファイル

| ファイル                 | 影響度 | 内容                          |
| ------------------------ | ------ | ----------------------------- |
| `SettingsView/index.tsx` | 低     | import 追加 + JSX 1行追加のみ |
| `SettingsView テスト`    | 中     | 統合テストケース追加          |

### 3.2 影響を受けないファイル(確認済み)

| ファイル                         | 理由                            |
| -------------------------------- | ------------------------------- |
| `AuthModeSelector/index.tsx`     | authMode 切替ロジックに変更なし |
| `authKeyApi.ts`                  | Preload API に変更なし          |
| `authKeyHandlers.ts`             | Main ハンドラーに変更なし       |
| `authModeSlice.ts`               | Store に変更なし                |
| `skillExecutionAuthPreflight.ts` | 既存の exists() 利用に影響なし  |

---

## 4. テスト責務マトリクス

### 4.1 AuthKeySection 単体テスト

| テストカテゴリ | テストケース                                                     | 優先度 |
| -------------- | ---------------------------------------------------------------- | ------ |
| レンダリング   | コンポーネントが正常にレンダリングされること                     | 高     |
| 4状態表示      | stored 状態で緑バッジ「APIキー設定済み」が表示されること         | 高     |
| 4状態表示      | env-fallback 状態で黄バッジが表示されること                      | 高     |
| 4状態表示      | not-set 状態で赤バッジが表示されること                           | 高     |
| 4状態表示      | error 状態で灰バッジが表示されること                             | 高     |
| 保存操作       | 有効なキー入力後に保存ボタン押下で authKeyAPI.set が呼ばれること | 高     |
| 保存操作       | 保存成功後に inputValue がクリアされること                       | 高     |
| 保存操作       | 保存成功後に状態が再取得されること                               | 高     |
| 保存操作       | 空文字列で保存ボタン押下時にバリデーションエラーが表示されること | 高     |
| 削除操作       | stored 状態で削除ボタンが有効であること                          | 中     |
| 削除操作       | not-set / env-fallback 状態で削除ボタンが無効であること          | 中     |
| 削除操作       | 削除成功後に状態が再取得されること                               | 中     |
| セキュリティ   | 入力フィールドが type="password" であること                      | 中     |
| セキュリティ   | マスクトグルで表示/非表示が切り替わること                        | 中     |
| a11y           | aria-label が適切に設定されていること                            | 中     |
| エラー         | IPC エラー時に error 状態になること                              | 中     |
| ローディング   | isSubmitting 中にボタンが disabled になること                    | 中     |

### 4.2 SettingsView 統合テスト(追加分)

| テストケース                                                  | 優先度 |
| ------------------------------------------------------------- | ------ |
| authMode === 'api-key' 時に AuthKeySection が表示されること   | 高     |
| authMode !== 'api-key' 時に AuthKeySection が非表示であること | 高     |

### 4.3 テスト環境の注意事項

- happy-dom 環境のため `fireEvent` を使用する (P39: userEvent 非互換)
- 非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む
- `window.electronAPI.authKey` のモックを beforeEach でリセットする
