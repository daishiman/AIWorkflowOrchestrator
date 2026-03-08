# Phase 6: 回帰テスト拡張計画

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 6                                                        |
| 作成日   | 2026-03-08                                               |
| 作成者   | SubAgent-Component-Scope                                 |
| 入力     | Phase 4-5 成果物（INT-01 ~ INT-05 テストケース設計）     |

---

## 概要

Phase 4-5 で設計・実装される INT-01 ~ INT-05 の主経路テストに対して、異常系・境界値・状態遷移の回帰テストを追加する。Phase 4-5 完了後に本計画に基づいてテストコードを実装する。

---

## 追加テストケース一覧

### INT-06: auth-mode loading 中の AuthModeSelector disabled 検証

| 項目         | 内容                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------ |
| カテゴリ     | 異常系 / 状態遷移                                                                                |
| 前提条件     | harness で `authModeLoading: true` を設定                                                        |
| 操作         | `role="radio"` 要素をクリックする                                                                |
| 期待結果     | AuthModeSelector の radio ボタンが `aria-disabled="true"` であり、`setAuthMode` が呼び出されない |
| 検証方法     | `expect(radioButton).toBeDisabled()` + `expect(mockSetAuthMode).not.toHaveBeenCalled()`          |
| 対応 AC      | AC-02                                                                                            |
| 根拠         | INT-02 は正常な切替のみ検証。loading 中の操作ガードは回帰テストとして必須                        |
| 関連 Pitfall | P31（store hooks 無限ループ）— loading 状態は無限ループの初期徴候として検出可能                  |

### INT-07: ApiKeysSection network error 時のエラー表示と再試行

| 項目     | 内容                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| カテゴリ | 異常系 / リカバリー                                                                                                            |
| 前提条件 | harness で `apiKeyList` を `() => Promise.reject(new Error("Network Error"))` に差し替え                                       |
| 操作     | SettingsView をレンダリング                                                                                                    |
| 期待結果 | ApiKeysSection にエラーメッセージが表示される。再試行ボタン（存在する場合）をクリックすると `apiKey.list()` が再度呼び出される |
| 検証方法 | `screen.getByText(/エラー                                                                                                      | error/i)`でエラー表示を確認。再試行ボタンが実装されている場合は`fireEvent.click` 後に呼び出し回数を検証 |
| 対応 AC  | AC-03                                                                                                                          |
| 根拠     | INT-03/INT-04 は malformed レスポンスと正常レスポンスの検証。network reject は未カバー                                         |
| 備考     | ApiKeysSection の実装が再試行ボタンを持たない場合、エラー表示確認のみとし、再試行テストは未タスクとして記録する                |

### INT-08: window.electronAPI undefined（sandbox 制約）のフォールバック

| 項目         | 内容                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| カテゴリ     | 異常系 / 環境依存                                                                                                       |
| 前提条件     | harness で `window.electronAPI` を `undefined` に設定                                                                   |
| 操作         | SettingsView をレンダリング                                                                                             |
| 期待結果     | SettingsView がクラッシュせず表示される。ApiKeysSection は「APIキー機能が利用できません」またはフォールバック UI を表示 |
| 検証方法     | `expect(container).toBeTruthy()` + エラーバウンダリ非発火の確認                                                         |
| 対応 AC      | AC-01, AC-03                                                                                                            |
| 根拠         | Phase 2 設計判断の異常系3 に対応。Electron sandbox 制約下で contextBridge が失敗するケースの回帰防止                    |
| 関連 Pitfall | P48（non-null assertion による安全性偽装）— `window.electronAPI!` の使用箇所が実行時クラッシュする                      |

### INT-09: テーマ切替が store アクションを呼び出す

| 項目     | 内容                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------- |
| カテゴリ | 統合動作                                                                                            |
| 前提条件 | harness でデフォルト設定（`themeMode: "light"`）                                                    |
| 操作     | ThemeSelector のテーマ変更コントロールを操作する                                                    |
| 期待結果 | `setThemeMode` アクションが呼び出される                                                             |
| 検証方法 | `expect(mockSetThemeMode).toHaveBeenCalledWith("dark")` または相当の検証                            |
| 対応 AC  | AC-01, AC-06                                                                                        |
| 根拠     | 既存 unit test では ThemeSelector がモックされている場合がある。real composition での連動確認が必要 |
| 備考     | 既存 unit test と重複する場合は省略可能（Phase 2 設計判断3 の責務重複回避原則に基づく）             |

### INT-10: RAG チェックボックスの auto-sync toggle

| 項目     | 内容                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| カテゴリ | 統合動作                                                                                     |
| 前提条件 | harness でデフォルト設定（`autoSyncEnabled: false`）                                         |
| 操作     | RAG auto-sync チェックボックスをクリックする                                                 |
| 期待結果 | `setAutoSyncEnabled(true)` アクションが呼び出される                                          |
| 検証方法 | `fireEvent.click(checkbox)` 後に `expect(mockSetAutoSyncEnabled).toHaveBeenCalledWith(true)` |
| 対応 AC  | AC-01, AC-06                                                                                 |
| 根拠     | SettingsView の全インタラクション経路をカバーするため                                        |
| 備考     | 既存 unit test と重複する場合は省略可能                                                      |

### INT-11: auth-mode 切替後の ApiKeysSection 表示（task-05 対応）

| 項目           | 内容                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------- | --------- | ------ | -------------------------------- |
| カテゴリ       | 状態遷移 / 統合連動                                                                                           |
| 前提条件       | harness で `authMode: "subscription"` を設定                                                                  |
| 操作           | auth-mode を `api-key` に切り替える（`role="radio"` の api-key 要素をクリック）                               |
| 期待結果       | ApiKeysSection が表示され、`apiKey.list()` が呼び出されてプロバイダーリストが表示される                       |
| 検証方法       | 切替後に `await waitFor(() => screen.getByText(/OpenAI                                                        | Anthropic | Google | Azure/))` で provider 表示を確認 |
| 対応 AC        | AC-02, AC-03, AC-05                                                                                           |
| 先行タスク対応 | task-05（auth-mode → api-key 切替 UI 導線）                                                                   |
| 根拠           | INT-02 は切替操作の検証のみ。切替後の ApiKeysSection 連動は未カバー                                           |
| 備考           | AuthModeSelector の mode 変更が ApiKeysSection の表示条件に影響するかは実装依存。影響しない場合はスキップ可能 |

### INT-12: malformed provider entry のフィルタリング（task-06 対応）

| 項目           | 内容                                                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| カテゴリ       | 異常系 / データ整合性                                                                                                                              |
| 前提条件       | harness で `apiKeyList` が malformed entry を含むレスポンスを返すよう設定（例: `providers: [validProvider, null, { name: 123 }, validProvider2]`） |
| 操作           | SettingsView をレンダリング                                                                                                                        |
| 期待結果       | 正常な provider のみが表示され、malformed entry（null、型不正）はフィルタされる。クラッシュしない                                                  |
| 検証方法       | 正常 provider のみが表示されることを確認 + 表示数の検証                                                                                            |
| 対応 AC        | AC-03, AC-05                                                                                                                                       |
| 先行タスク対応 | task-06（malformed apiKey response fallback）                                                                                                      |
| 根拠           | INT-03 は providers 全体が非配列のケース。個別 entry が malformed なケースは未カバー                                                               |
| 関連 Pitfall   | P49（type predicate 内での as キャスト）— provider フィルタリングで `in` 演算子による実行時検証が必要                                              |

### INT-13: persist recovery 後の SettingsView 正常表示（task-07 対応）

| 項目           | 内容                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| カテゴリ       | 異常系 / リカバリー                                                                                      |
| 前提条件       | harness で store hydrate 時に破損データを注入（`viewHistory: "not-an-array"`, `expandedFolders: null`）  |
| 操作           | SettingsView をレンダリング                                                                              |
| 期待結果       | SettingsView がクラッシュせず正常に全セクションが表示される                                              |
| 検証方法       | `expect(screen.getByText("設定"or 相当のヘッダー)).toBeInTheDocument()` + 各セクション存在確認           |
| 対応 AC        | AC-01, AC-05                                                                                             |
| 先行タスク対応 | task-07（corrupted persist state recovery）                                                              |
| 根拠           | Phase 2 設計判断の異常系4 に対応。store hydrate の破損データに対する回帰防止                             |
| 備考           | localStorage モックが必要。harness の `storeOverrides` で制御不可能な場合は、専用の setup 関数を追加する |

---

## テストケース ID と AC の対応行列（拡張版）

| テストケース ID | シナリオ名                              | AC-01 | AC-02 | AC-03 | AC-04 | AC-05 | AC-06 |
| --------------- | --------------------------------------- | ----- | ----- | ----- | ----- | ----- | ----- |
| INT-01          | settings shell mount                    | x     |       |       |       |       | x     |
| INT-02          | auth-mode 切替 flow                     | x     | x     |       |       | x     | x     |
| INT-03          | apiKey malformed response fallback      | x     |       | x     |       | x     | x     |
| INT-04          | apiKey list success                     | x     |       | x     |       |       | x     |
| INT-05          | auth-mode invalid state recovery        | x     |       |       |       | x     | x     |
| INT-06          | auth-mode loading disabled              |       | x     |       |       |       | x     |
| INT-07          | apiKey network error + retry            |       |       | x     |       |       | x     |
| INT-08          | electronAPI undefined fallback          | x     |       | x     |       |       |       |
| INT-09          | theme toggle store action               | x     |       |       |       |       | x     |
| INT-10          | RAG auto-sync toggle                    | x     |       |       |       |       | x     |
| INT-11          | auth-mode → api-key ApiKeysSection 連動 |       | x     | x     |       | x     | x     |
| INT-12          | malformed provider entry filter         |       |       | x     |       | x     |       |
| INT-13          | persist corruption recovery             | x     |       |       |       | x     |       |

---

## 先行タスク対応の追跡行列

| 先行タスク | AC 内容                            | 対応テストケース ID            | カバー範囲                                      |
| ---------- | ---------------------------------- | ------------------------------ | ----------------------------------------------- |
| task-05    | auth-mode → api-key 切替 UI 導線   | INT-02, INT-06, INT-11         | 正常切替 + loading ガード + 連動表示            |
| task-06    | malformed apiKey response fallback | INT-03, INT-07, INT-08, INT-12 | 非配列 + network error + undefined + 個別 entry |
| task-07    | corrupted persist state recovery   | INT-05, INT-13                 | invalid auth-mode + 破損 store hydrate          |

---

## 実装優先順位

| 優先度 | テストケース ID | 理由                                                           |
| ------ | --------------- | -------------------------------------------------------------- |
| P1     | INT-11          | task-05 対応。auth-mode と ApiKeysSection の統合連動は高リスク |
| P1     | INT-12          | task-06 対応。malformed entry フィルタは防御ガードの核心       |
| P1     | INT-13          | task-07 対応。persist corruption は本タスクの動機              |
| P2     | INT-06          | loading 中の操作ガードは UX 品質に直結                         |
| P2     | INT-07          | network error は本番環境で頻発する異常系                       |
| P2     | INT-08          | sandbox 制約は Electron 固有のリスク                           |
| P3     | INT-09          | 既存 unit test との重複可能性あり                              |
| P3     | INT-10          | 既存 unit test との重複可能性あり                              |

---

## リスクと前提条件

| リスク                                                    | 影響度 | 対策                                                 |
| --------------------------------------------------------- | ------ | ---------------------------------------------------- |
| Phase 4-5 の harness 設計が変更される                     | 高     | harness API の安定部分のみに依存する設計にする       |
| INT-11 で authMode 切替が ApiKeysSection に影響しない実装 | 中     | 実装確認後にスキップ判定。代替テストを検討           |
| INT-13 の localStorage モックが harness で非対応          | 中     | 専用の setup 関数を追加するか、beforeEach で直接設定 |
| INT-09/INT-10 が既存 unit test と完全重複する             | 低     | 重複確認後に除外。Phase 2 設計判断3 の原則に従う     |
