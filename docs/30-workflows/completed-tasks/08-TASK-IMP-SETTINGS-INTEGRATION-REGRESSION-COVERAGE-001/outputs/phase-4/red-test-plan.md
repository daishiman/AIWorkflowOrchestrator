# Phase 4: Red テスト計画

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 4                                                        |
| 作成日   | 2026-03-08                                               |

---

## テストケース一覧

### INT-01: 全セクション表示（real composition）

| 項目        | 内容                                                                                                                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| テスト名    | `SettingsView が real composition で全セクションを表示する`                                                                                                                                                        |
| 目的        | vi.mock() を使用せず、AccountSection / ApiKeysSection / AuthModeSelector の実コンポーネントが正しくレンダリングされることを検証する                                                                                |
| 検証対象 AC | AC-01（過剰モック解消）                                                                                                                                                                                            |
| 期待結果    | ヘッダー「設定」、AccountSection「アカウント登録・ログイン」、AuthModeSelector（radiogroup）、ApiKeysSection「APIキー設定」、ThemeSelector「テーマ設定」、RAG 設定セクション、「設定を保存」ボタンが全て表示される |

### INT-02: AuthModeSelector mode 切替（role="radio"）

| 項目        | 内容                                                                                                                  |
| ----------- | --------------------------------------------------------------------------------------------------------------------- |
| テスト名    | `real AuthModeSelector で auth-mode を subscription から api-key に切り替える`                                        |
| 目的        | real AuthModeSelector コンポーネントを経由して、role="radio" の要素による mode 切替操作が正しく動作することを検証する |
| 検証対象 AC | AC-02（real AuthModeSelector 経由の auth-mode 切替テスト）                                                            |
| 期待結果    | サブスクリプション radio が aria-checked="true"、APIキー radio をクリック後 setMode("api-key") が呼ばれる             |

### INT-03: ApiKeysSection 正常プロバイダー表示

| 項目        | 内容                                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| テスト名    | `real ApiKeysSection が正常な apiKey.list() レスポンスで4プロバイダーを表示する`                                |
| 目的        | real ApiKeysSection コンポーネントが正常な IPC レスポンスを受けて、全プロバイダーを正しく表示することを検証する |
| 検証対象 AC | AC-03（real ApiKeysSection 経由の provider fallback テスト）                                                    |
| 期待結果    | OpenAI, Anthropic, Google AI, xAI の4プロバイダーが表示される。apiKey.list が1回呼ばれる                        |

### INT-04: ApiKeysSection 異常レスポンスフォールバック

| 項目        | 内容                                                                                                                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テスト名    | `real ApiKeysSection が malformed apiKey response でクラッシュせずフォールバックする`                                                                                                        |
| 目的        | apiKey.list() が非配列・undefined・失敗レスポンスを返した場合に、ApiKeysSection がクラッシュせずフォールバック表示することを検証する                                                         |
| 検証対象 AC | AC-03（real ApiKeysSection 経由の provider fallback テスト）                                                                                                                                 |
| 期待結果    | INT-04a: providers 非配列時に4プロバイダーが「未登録」で表示。INT-04b: providers undefined 時に4プロバイダーが「未登録」で表示。INT-04c: list 失敗時に role="alert" とエラーメッセージが表示 |

### INT-05: auth-mode status メッセージの条件付き表示

| 項目        | 内容                                                                                                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テスト名    | `auth-mode status が条件に応じて正しく表示/非表示される`                                                                                                                                 |
| 目的        | useAuthModeStatus の返却値に応じて、status メッセージの表示/非表示と成功/失敗スタイルが正しく適用されることを検証する                                                                    |
| 検証対象 AC | AC-05（先行タスク AC の統合テスト行列反映）                                                                                                                                              |
| 期待結果    | INT-05a: status null 時に data-testid="auth-mode-status" が存在しない。INT-05b: status 設定時に message, errorCode, guidance が表示。INT-05c: isValid=true 時に bg-green-50 クラスが適用 |

---

## settings-test-harness.ts 設計概要

### 目的

store mock と electronAPI mock の境界を一箇所で管理する統合テストハーネス（AC-06 対応）。

### 主要エクスポート

| 関数名                             | 責務                                                                                                                                |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `createDefaultStoreState()`        | AccountSection 全18セレクタ + SettingsSlice + AuthModeSlice のデフォルト状態を返す                                                  |
| `createDefaultAuthModeSelectors()` | useAuthMode, useSetAuthMode, useAuthModeStatus, useIsAuthModeLoading, useInitializeAuthMode の5個の個別セレクタのデフォルト値を返す |
| `createDefaultElectronApiKey()`    | electronAPI.apiKey の list / save / delete / validate 4メソッドの vi.fn() モックを返す                                              |
| `createSettingsHarness(options)`   | 上記3つを統合し、テストケースごとのカスタマイズを options 経由で受け付けるファクトリ関数                                            |

### Mock 境界

| レイヤー         | Mock/Real | 理由                               |
| ---------------- | --------- | ---------------------------------- |
| AccountSection   | Real      | AC-01: vi.mock() 不使用            |
| ApiKeysSection   | Real      | AC-01: vi.mock() 不使用            |
| AuthModeSelector | Real      | AC-01: vi.mock() 不使用            |
| Zustand store    | Mock      | useAppStore + 個別セレクタをモック |
| electronAPI      | Mock      | IPC 通信の境界                     |
| ThemeSelector    | Real      | store 経由で動作                   |
| ProfileSection   | Real      | store 経由で動作                   |

---

## Red 状態確認手順

1. `settings-test-harness.ts` を**未作成**の状態で `SettingsView.integration.test.tsx` を実行する
2. 全テストケース（INT-01 〜 INT-05、サブケース含む9件）が import エラーまたは mock 未定義エラーで **Red（FAIL）** となることを確認する
3. Red 状態のスクリーンショットまたはターミナル出力を記録する
4. Red 確認後、Phase 5 の実装順序に従って harness → テストの順で Green 化を進める

### 技術的注意事項

- P39 準拠: happy-dom 環境では fireEvent を使用（userEvent 不可）
- P40 準拠: テスト実行は `apps/desktop` ディレクトリから実施
- P31 準拠: 個別セレクタ（useAuthMode 等）を使用
- vi.mock はファイル先頭に hoist されるため、モジュールスコープ変数で制御
