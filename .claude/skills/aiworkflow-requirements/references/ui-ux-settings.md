# 設定画面 UI/UX ガイドライン

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

Electronデスクトップアプリにおける設定画面のUI/UX仕様を定義する。
アプリケーション設定、スキル設定、その他のユーザー設定を管理する。

---

## 設定画面アーキテクチャ

### レイヤー構成

| レイヤー         | コンポーネント               | 役割                             |
| ---------------- | ---------------------------- | -------------------------------- |
| Renderer Process | Settings Components (React)  | UIレンダリング                   |
|                  | - SlideDirectorySettings.tsx | 設定画面コンポーネント           |
|                  | - useSlideSettings フック    | 状態管理                         |
|                  | window.slideSettingsAPI      | Preloadから公開されたAPI         |
| Preload Script   | channels.ts + index.ts       | IPC通信の橋渡し                  |
|                  | - SLIDE_SETTINGS_CHANNELS    | ホワイトリストチャンネル定義     |
|                  | - slideSettingsAPI 公開      | contextBridgeによるAPI公開       |
| Main Process     | slideSettingsHandlers.ts     | IPCハンドラー実装                |
|                  | slideSettingsStore.ts        | electron-storeによる永続化       |
|                  | - validateIpcSender()        | sender検証によるセキュリティ確保 |

**通信フロー**: Renderer Process → contextBridge → Preload Script → IPC通信 → Main Process

---

## スライド出力ディレクトリ設定

### 機能概要

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| 機能名     | スライド出力ディレクトリ設定             |
| 目的       | プレゼンスライドの保存先をユーザーが指定 |
| 対象スキル | presentation-slide-generator             |
| 永続化     | electron-store（アプリ再起動後も維持）   |

### UIコンポーネント構成

| コンポーネント                    | 役割・属性                                          |
| --------------------------------- | --------------------------------------------------- |
| SlideDirectorySettings            | 親コンポーネント                                    |
| - ディレクトリパス入力欄          | 読み取り専用、aria-label="スライド出力ディレクトリ" |
| - フォルダ選択ボタン              | OSネイティブダイアログを起動                        |
| - 自動作成チェックボックス        | ディレクトリが存在しない場合に自動作成              |
| - エラー/成功メッセージ表示エリア | フィードバック表示                                  |

### UI仕様

| 要素               | 仕様                                    |
| ------------------ | --------------------------------------- |
| パス入力欄         | 読み取り専用、最大幅500px、等幅フォント |
| フォルダ選択ボタン | プライマリスタイル、アイコン付き        |
| チェックボックス   | ラベル「フォルダを自動作成」            |
| エラー表示         | 赤色、インラインで即時表示              |
| 成功表示           | 緑色、3秒後にフェードアウト             |

### 状態管理（useSlideSettings）

useSlideSettingsフックが返すオブジェクトの構造を以下に示す。

| プロパティ        | 型                                            | 説明             |
| ----------------- | --------------------------------------------- | ---------------- |
| settings          | SlideSettings または null                     | 現在の設定       |
| loading           | boolean                                       | 読み込み中フラグ |
| error             | string または null                            | エラーメッセージ |
| selectDirectory   | () => Promise\<void\>                         | フォルダ選択関数 |
| setDirectory      | (path: string) => Promise\<void\>             | 設定保存関数     |
| validateDirectory | (path: string) => Promise\<ValidationResult\> | パス検証関数     |

### バリデーション仕様

| チェック項目     | エラーコード            | メッセージ例                 |
| ---------------- | ----------------------- | ---------------------------- |
| 空パス           | EMPTY_PATH              | パスを入力してください       |
| パストラバーサル | PATH_TRAVERSAL_DETECTED | 不正なパスです               |
| 存在しないパス   | PATH_NOT_EXISTS         | 指定されたパスが存在しません |
| 書き込み権限なし | NO_WRITE_PERMISSION     | 書き込み権限がありません     |

### アクセシビリティ要件

| 要件               | 実装                                       |
| ------------------ | ------------------------------------------ |
| キーボード操作     | Tab移動、Enter/Spaceでボタン操作           |
| スクリーンリーダー | aria-label、aria-describedby、role属性設定 |
| フォーカス表示     | visible focus indicator（2px solid）       |
| コントラスト比     | WCAG AA準拠（4.5:1以上）                   |
| ダークモード       | prefers-color-scheme対応                   |

---

## 設定永続化

### electron-store スキーマ

SlideSettings型の構造を以下に示す。

| プロパティ          | 型      | デフォルト値       | 説明                   |
| ------------------- | ------- | ------------------ | ---------------------- |
| outputDirectory     | string  | ~/Documents/Slides | 出力先ディレクトリパス |
| autoCreateDirectory | boolean | true               | ディレクトリ自動作成   |

### 設定ファイル配置

| OS      | パス                                                 |
| ------- | ---------------------------------------------------- |
| macOS   | ~/Library/Application Support/AIWorkflow/config.json |
| Windows | %APPDATA%/AIWorkflow/config.json                     |
| Linux   | ~/.config/AIWorkflow/config.json                     |

---

## IPC API仕様

### チャンネル一覧

| チャンネル                      | 機能           | 引数         | 戻り値                      |
| ------------------------------- | -------------- | ------------ | --------------------------- |
| slideSettings:getDirectory      | 現在のパス取得 | なし         | IPCResult<string>           |
| slideSettings:setDirectory      | パス設定       | path: string | IPCResult<void>             |
| slideSettings:selectDirectory   | ダイアログ表示 | なし         | IPCResult<string \| null>   |
| slideSettings:validateDirectory | パス検証       | path: string | IPCResult<ValidationResult> |
| slideSettings:getAll            | 全設定取得     | なし         | IPCResult<SlideSettings>    |

### IPCResult型

IPCResult型は成功または失敗を表すユニオン型であり、以下の2つのパターンを持つ。

| パターン | プロパティ | 型             | 説明                 |
| -------- | ---------- | -------------- | -------------------- |
| 成功時   | success    | true           | 成功フラグ           |
|          | data       | T              | 結果データ（型引数） |
| 失敗時   | success    | false          | 失敗フラグ           |
|          | error      | string         | エラーコード         |
|          | message    | string（任意） | エラーメッセージ     |

---

## セキュリティ要件

### IPC通信セキュリティ

| 要件             | 実装                                  |
| ---------------- | ------------------------------------- |
| ホワイトリスト   | SLIDE_SETTINGS_CHANNELS定数で管理     |
| sender検証       | validateIpcSender()で全ハンドラー保護 |
| パストラバーサル | detectPathTraversal()で32パターン検出 |
| Unicode正規化    | normalize("NFC")で統一                |

詳細: [security-api-electron.md](./security-api-electron.md)（slideSettingsAPIセクション）

---

## テスト要件

### テストカバレッジ目標

| 指標            | 目標 | 実績   |
| --------------- | ---- | ------ |
| Line Coverage   | 80%  | 94.30% |
| Branch Coverage | 60%  | 75%+   |
| テスト数        | 100+ | 156    |

### テストケースカテゴリ

| カテゴリ           | テスト数 | 内容                     |
| ------------------ | -------- | ------------------------ |
| Store基本操作      | 24       | get/set/validate         |
| パストラバーサル   | 32       | 攻撃パターン検出         |
| IPCハンドラー      | 48       | 正常系・異常系           |
| sender検証         | 24       | DevTools拒否・Window検証 |
| Reactフック        | 12       | 状態管理・非同期処理     |
| エラーハンドリング | 16       | 境界値・例外処理         |

---

## ツール許可設定（Permission Settings）

**実装タスク**: TASK-3-1-E（2026-01-26完了）

### 機能概要

| 項目   | 内容                                                     |
| ------ | -------------------------------------------------------- |
| 機能名 | ツール許可設定                                           |
| 目的   | 永続化された許可済みツールの管理（表示・取消・全クリア） |
| 永続化 | electron-store（permission-store.json）                  |

### UIコンポーネント構成

| コンポーネント           | 役割・属性                       |
| ------------------------ | -------------------------------- |
| PermissionSettings       | 親コンポーネント                 |
| - ヘッダー               | h2: "Allowed Tools"              |
| - ローディングスケルトン | データ取得中に表示               |
| - エラー表示             | 取得失敗時に表示                 |
| - 許可済みツールリスト   | ツールごとに以下を表示           |
| - ツール名               | 許可されたツールの名前           |
| - 許可日時               | "Allowed: 日時" 形式で表示       |
| - Revokeボタン           | 個別ツールの許可取消             |
| - 空状態表示             | "No tools have been allowed yet" |
| - Clear Allボタン        | 全クリア（確認ダイアログ付き）   |

### UI仕様

| 要素            | 仕様                                  |
| --------------- | ------------------------------------- |
| ツールリスト    | 許可日時でソート（新しい順）          |
| Revokeボタン    | 赤系カラー、個別ツールの許可取消      |
| Clear Allボタン | 確認ダイアログ後に全クリア            |
| ローディング    | スケルトンUI（3行のプレースホルダー） |
| エラー表示      | 赤色、インラインで即時表示            |

### アクセシビリティ要件

| 要件               | 実装                                     |
| ------------------ | ---------------------------------------- |
| キーボード操作     | Tab移動、Enter/Spaceでボタン操作         |
| スクリーンリーダー | role="list"、aria-live="polite"、sr-only |
| フォーカス表示     | visible focus indicator                  |
| 状態通知           | 操作完了時に視覚的フィードバック         |

### IPC API仕様

| チャンネル                 | 機能           | 引数                 | 戻り値                             |
| -------------------------- | -------------- | -------------------- | ---------------------------------- |
| permission:getAllowedTools | 許可ツール取得 | なし                 | { tools: AllowedToolEntry[] }      |
| permission:revokeTool      | 許可取消       | { toolName: string } | { success: boolean }               |
| permission:clearAll        | 全クリア       | なし                 | { success: boolean, clearedCount } |

### テストカバレッジ

| 指標              | 値  |
| ----------------- | --- |
| UI Tests          | 17  |
| Integration Tests | 17  |
| Unit Tests        | 52  |
| **Total**         | 86  |

---

## 権限要求履歴パネル（Permission History Panel）

**実装タスク**: task-imp-permission-history-001（2026-02-01完了）

### 機能概要

| 項目   | 内容                                                                    |
| ------ | ----------------------------------------------------------------------- |
| 機能名 | 権限要求履歴パネル                                                      |
| 目的   | 権限リクエストの判断履歴（approved/denied/approved_once）を時系列で閲覧 |
| 永続化 | Zustand persist middleware（localStorage: knowledge-studio-store）      |

### UIコンポーネント構成

| コンポーネント            | 役割・属性                                                                 |
| ------------------------- | -------------------------------------------------------------------------- |
| PermissionHistoryPanel    | 親コンポーネント（仮想スクロール管理）                                     |
| - PermissionHistoryFilter | ツール名・判断結果・期間のフィルタUI（3ドロップダウン + カスタム日付入力） |
| - 仮想スクロールリスト    | @tanstack/react-virtual（estimateSize=72px, overscan=5）                   |
| - PermissionHistoryItem   | 個別エントリ（emoji icon、判断バッジ、相対時刻）                           |
| - 空状態メッセージ        | 履歴なし時 / フィルタ結果0件時                                             |
| - クリアボタン            | 確認ダイアログ付き全履歴クリア                                             |
| - 件数表示                | "N件の権限要求履歴" 形式                                                   |

### UI仕様

| 要素               | 仕様                                             |
| ------------------ | ------------------------------------------------ |
| リスト最大高       | 400px                                            |
| エントリ推定サイズ | 72px（仮想スクロール用）                         |
| オーバースキャン   | 5エントリ                                        |
| 判断バッジ色       | approved: 緑、denied: 赤、approved_once: 黄      |
| 時刻表示           | 24時間以内: "N分前"/"N時間前"、それ以降: "N日前" |
| ツールアイコン     | emoji表示（Bash:💻、Read:📖 等、デフォルト:🔧）  |

### フィルタ仕様

| フィルタ項目 | 型                | 選択肢                                            |
| ------------ | ----------------- | ------------------------------------------------- |
| ツール名     | select (combobox) | 履歴内の全ツール名を動的生成                      |
| 判断結果     | select (combobox) | 全て / approved / denied / approved_once          |
| 期間         | select            | 全期間 / 今日 / 過去7日 / 過去30日 / カスタム範囲 |

#### 期間フィルタ詳細（task-imp-permission-date-filter）

| 項目         | 仕様                                                             |
| ------------ | ---------------------------------------------------------------- |
| 型定義       | `DatePreset = "all" \| "today" \| "week" \| "month" \| "custom"` |
| カスタム入力 | `<input type="date" />`（プリセット="custom"時のみ表示）         |
| デフォルト   | "all"（全期間）                                                  |
| aria-label   | "期間フィルタ"                                                   |
| 日付入力     | "開始日" / "終了日"（aria-label）                                |
| ヘルパー     | `dateFilterUtils.ts`（getDateRangeStartDate, filterByDateRange） |
| 定数         | DAYS_IN_WEEK=7, DAYS_IN_MONTH=30                                 |

### データ制限

| パラメータ                     | 値   | 説明               |
| ------------------------------ | ---- | ------------------ |
| PERMISSION_HISTORY_MAX_ENTRIES | 1000 | 履歴最大保持件数   |
| ARGS_SNAPSHOT_MAX_LENGTH       | 200  | 引数要約最大文字数 |

### テストカバレッジ

| 指標              | 値     |
| ----------------- | ------ |
| テスト数          | 72     |
| Line Coverage     | 98.50% |
| Branch Coverage   | 87.82% |
| Function Coverage | 100%   |

---

## Settings 画面の AuthGuard 非依存アクセス（TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001）

**完了日**: 2026-03-09

### 概要

Settings 画面は認証状態に依存せず常時アクセス可能である。認証タイムアウト時や未認証状態でも、ユーザーが API キー設定等の認証前操作を行えるようにする。

### アクセス導線

| 導線 | トリガー | 説明 |
| --- | --- | --- |
| 通常アクセス | `Cmd/Ctrl + ,` または GlobalNavStrip/MobileNavBar | 認証済み・未認証を問わずアクセス可能 |
| タイムアウトフォールバック | AuthTimeoutFallback の「設定画面へ」ボタン | 認証確認が 10 秒以内に完了しない場合に表示される導線 |

### 設計仕様

| 観点 | 仕様 |
| --- | --- |
| shell bypass | `App.tsx` で `currentView === "settings"` の場合、AuthGuard の外側で `SettingsView` を直接レンダリング |
| reset exclusion | 未認証時の view reset で `settings` を除外し、設定作業中に dashboard へ強制遷移させない |
| 公開ビュー定義 | `PUBLIC_UNAUTHENTICATED_VIEWS = ["settings"]` で AuthGuard 外アクセス可能なビューを明示管理 |
| セキュリティ境界 | Settings シェルのみが AuthGuard 外に配置され、他のビュー（agent, chat, history 等）は全て AuthGuard 内で保護 |

### 未認証状態での動作

| 機能 | 動作 | 安全性 |
| --- | --- | --- |
| API キー設定 | IPC 経由で Main Process の暗号化ストレージに保存。Renderer にトークン平文は露出しない | contextBridge + safeStorage による保護 |
| LLM プロバイダー選択 | IPC 経由で設定取得・保存。未認証でも設定可能 | IPC ホワイトリスト + sender 検証 |
| アカウント設定 | 認証情報が必要な操作はエラーメッセージを表示（クラッシュしない） | fallback ハンドラによる安全な error envelope 返却 |

### 関連ファイル

| ファイル | 役割 |
| --- | --- |
| `apps/desktop/src/renderer/App.tsx` | Settings bypass 条件分岐 |
| `apps/desktop/src/renderer/utils/shouldResetUnauthenticatedView.ts` | 未認証 reset 除外判定 |
| `apps/desktop/src/renderer/components/AuthGuard/index.tsx` | AuthGuard 本体 |
| `apps/desktop/src/renderer/components/AuthGuard/__tests__/AuthTimeoutFallback.tsx` | タイムアウトフォールバック UI |

---

## AuthKeySection 表示契約（TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001）

**完了日**: 2026-03-11  
**実装ファイル**:

- `apps/desktop/src/renderer/views/SettingsView/index.tsx`
- `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`

### 表示条件

| 条件 | 動作 |
| --- | --- |
| `authMode === "api-key"` | `AuthKeySection` を表示する |
| `authMode !== "api-key"` | `AuthKeySection` を非表示にする |

### 状態表示（`auth-key:exists` の `source` 優先）

| `auth-key:exists` レスポンス | UI状態 | 表示意図 |
| --- | --- | --- |
| `{ exists: false, source: "not-set" }` | `not-set` | APIキー未設定を明示 |
| `{ exists: true, source: "saved" }` | `saved` | 保存済みキーを優先表示 |
| `{ exists: true, source: "env-fallback" }` | `env-fallback` | 環境変数 fallback 使用を表示 |
| `source` 未提供（後方互換） | `hasCredentials` 補助判定 | 旧実装互換で状態を決定 |

### Phase 11 視覚検証

| テストケース | 証跡 | 判定 |
| --- | --- | --- |
| TC-11-01 | `outputs/phase-11/screenshots/TC-11-01-settings-apikey-authkey-initial.png` | PASS |
| TC-11-02 | `outputs/phase-11/screenshots/TC-11-02-settings-apikey-save-success.png` | PASS |
| TC-11-03 | `outputs/phase-11/screenshots/TC-11-03-settings-authkey-env-fallback.png` | PASS |

---

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

## 関連ドキュメント

- [security-api-electron.md](./security-api-electron.md) - IPCセキュリティ詳細
- [security-skill-execution.md](./security-skill-execution.md) - Permission Store詳細
- [ui-ux-forms.md](./ui-ux-forms.md) - フォーム設計ガイドライン
- [deployment-electron.md](./deployment-electron.md) - Electronデプロイ
- [期間フィルタ実装ガイド](../../../docs/30-workflows/TASK-IMP-permission-date-filter/outputs/phase-12/implementation-guide.md) - 期間別フィルタリング実装詳細

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
