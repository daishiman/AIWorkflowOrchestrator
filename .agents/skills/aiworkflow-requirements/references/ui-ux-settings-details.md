# 設定画面 UI/UX ガイドライン / detail specification

> 親仕様書: [ui-ux-settings.md](ui-ux-settings.md)
> 役割: detail specification

## ApiKeysSection 異常系表示仕様（2026-03-07追加）

**関連タスク**: 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001, TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001
**実装ファイル**: `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`

loadProviders における Preload 境界の防御ガードにより、以下の異常状態を安全に処理する。

### 防御レイヤーとフォールバック UI

| レイヤー           | 検出条件                                    | フォールバック UI                         | ユーザー体験                                    |
| ------------------ | ------------------------------------------- | ----------------------------------------- | ----------------------------------------------- |
| L1: API不在        | `window.electronAPI?.apiKey?.list` が falsy | 「APIキー機能が利用できません」エラー表示 | 設定画面は開けるが API キー管理不可             |
| L2: レスポンス失敗 | `result?.success` が false                  | 「APIキーの取得に失敗しました」エラー表示 | リトライ促進                                    |
| L3: データ異常     | `result.data` が null/undefined             | providers: [] でローディング終了          | 空リスト表示（「APIキーが登録されていません」） |
| L4: 要素異常       | malformed 要素混在                          | type predicate フィルタで正常要素のみ表示 | 正常要素は正しく表示、異常要素は無視            |

### 防御パターン（実装詳細）

| 防御層                          | 実装                                           | 目的                                       |
| ------------------------------- | ---------------------------------------------- | ------------------------------------------ |
| 1. API存在確認                  | `window.electronAPI?.apiKey` optional chaining | sandbox/preload 部分失敗時のクラッシュ防止 |
| 2. メソッド存在確認             | `apiKeyApi?.list` + console.warn               | contextBridge 公開不完全の検出             |
| 3. レスポンス形状検証           | `Array.isArray(result.data.providers)`         | 非iterable レスポンスの安全処理            |
| 4. 要素 shape フィルタ          | `normalizeProviders()` type predicate          | malformed 要素の除外（P49準拠）            |
| 5. エラーメッセージ安全アクセス | `result?.error?.message` null-safe             | 部分的レスポンス構造への耐性               |

### normalizeProviders フィルタ仕様

入力: `unknown[]`（IPC境界を超えた後の実行時型）
出力: `ProviderStatus[]`（検証済み型安全な配列）

フィルタ条件（全て AND）:

- `item != null` — null/undefined 除外
- `typeof item === "object"` — プリミティブ除外
- `"provider" in item && typeof item.provider === "string"` — provider フィールド存在＋型検証
- `"status" in item && typeof item.status === "string"` — status フィールド存在＋型検証

注意: `as` キャストは使用禁止（P49準拠）。`in` 演算子で実行時にプロパティ存在を検証する。

### テストケース

| テストID      | テスト内容                                    | 検証結果                                |
| ------------- | --------------------------------------------- | --------------------------------------- |
| RED-01        | electronAPI undefined でクラッシュしない      | エラーメッセージ表示 + 再試行ボタン表示 |
| RED-02        | apiKey namespace undefined でクラッシュしない | エラーメッセージ表示 + 再試行ボタン表示 |
| RED-03        | apiKey.list undefined でクラッシュしない      | エラーメッセージ表示 + 再試行ボタン表示 |
| RED-03b       | providers 非配列で空一覧にフォールバック      | 4プロバイダー「未登録」表示             |
| RED-success   | 正常レスポンスで providers を正しく表示       | プロバイダー一覧正常描画                |
| RED-error-msg | result.error.message を安全に表示             | null-safe アクセスでクラッシュなし      |

テスト合計: 46件（正常系33 + 防御ガード13）全PASS

### 関連タスク

| タスクID                                                | 完了日     | 概要                                                          |
| ------------------------------------------------------- | ---------- | ------------------------------------------------------------- |
| 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 | 2026-03-07 | Preload境界の3段防御ガード（L1-L3）                           |
| TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001             | 2026-03-08 | providers 要素 shape フィルタ（L4）+ IPC レスポンス契約正規化 |

---

## 実装ファイル

| ファイル                                                                                     | 役割                          |
| -------------------------------------------------------------------------------------------- | ----------------------------- |
| apps/desktop/src/renderer/components/settings/SlideDirectorySettings.tsx                     | UIコンポーネント              |
| apps/desktop/src/renderer/hooks/useSlideSettings.ts                                          | カスタムフック                |
| apps/desktop/src/renderer/components/settings/PermissionSettings/index.tsx                   | 許可設定UIコンポーネント      |
| apps/desktop/src/renderer/components/settings/PermissionSettings/dateFilterUtils.ts          | 期間フィルタヘルパー関数      |
| apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryFilter.tsx | フィルタUI（3ドロップダウン） |
| apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryPanel.tsx  | 履歴パネル（仮想スクロール）  |
| apps/desktop/src/preload/channels.ts                                                         | チャンネル定義                |
| apps/desktop/src/preload/index.ts                                                            | API公開                       |
| apps/desktop/src/main/settings/slideSettingsStore.ts                                         | 永続化ストア                  |
| apps/desktop/src/main/ipc/slideSettingsHandlers.ts                                           | IPCハンドラー                 |
| apps/desktop/src/main/services/skill/PermissionStore.ts                                      | 許可永続化ストア              |
| apps/desktop/src/main/ipc/permission-handlers.ts                                             | 許可IPCハンドラー             |
| packages/shared/src/types/permission-store.ts                                                | 許可型定義                    |
| apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryPanel.tsx  | 履歴パネルUIコンポーネント    |
| apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryItem.tsx   | 個別エントリ表示              |
| apps/desktop/src/renderer/components/settings/PermissionSettings/PermissionHistoryFilter.tsx | フィルタUIコンポーネント      |
| apps/desktop/src/renderer/components/skill/permissionHistory.ts                              | データモデル・ヘルパー関数    |
| apps/desktop/src/renderer/store/slices/permissionHistorySlice.ts                             | 履歴Store Slice               |

---

## バージョン履歴

| Version | Date       | Changes                                                                                                                                                                         |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.8.0   | 2026-03-11 | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 反映: `authMode === "api-key"` 時のみ `AuthKeySection` を表示する契約と、`auth-key:exists.source`（saved/env-fallback/not-set）優先表示を追加。Phase 11 screenshot 3件を同期 |
| 1.6.0   | 2026-03-08 | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 拡充: 防御レイヤーテーブル（L1-L4）、normalizeProviders フィルタ仕様（P49準拠 in 演算子）、テスト合計46件、関連タスクテーブルを追加 |
| 1.5.1   | 2026-03-07 | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 反映: providers 要素 shape フィルタ（`provider/status` 必須）と実画面検証（TC-11-01〜03）を追記                                     |
| 1.5.0   | 2026-03-07 | ApiKeysSection 異常系表示仕様追加（09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001）: Preload境界の4段防御ガード、6テストケース                                         |
| 1.4.0   | 2026-02-02 | 実装詳細拡充: フィルタUI説明を3ドロップダウン化、テストカバレッジ72件反映、実装ファイル3件追加                                                                                  |
| 1.3.0   | 2026-02-02 | 期間フィルタ追加（task-imp-permission-date-filter: DatePreset/DateRangeFilter型追加）                                                                                           |
| 1.2.0   | 2026-02-01 | PermissionHistoryPanel追加（task-imp-permission-history-001）                                                                                                                   |
| 1.1.1   | 2026-01-26 | 仕様ガイドライン準拠: コード例を表形式・文章に変換                                                                                                                              |
| 1.1.0   | 2026-01-26 | PermissionSettings UI追加（TASK-3-1-E）                                                                                                                                         |
| 1.0.0   | 2026-01-14 | 初版作成: スライド出力ディレクトリ設定機能                                                                                                                                      |

