# 設定画面 UI/UX ガイドライン / core specification

> 親仕様書: [ui-ux-settings.md](ui-ux-settings.md)
> 役割: core specification

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
| permission:clear-session   | セッションクリア | { sessionId: string } | ClearSessionResponse               |

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

## Mainline Access Matrix（TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001）

**完了日**: 2026-03-22

### 概要

Settings 画面に `mainline access matrix` を追加し、現在利用可能な実行経路を 1 セクションで判断できるようにする。未認証でも shell 自体は公開しつつ、実行系 CTA は guidance-only に落とす。

### UI 契約

| 観点 | 仕様 |
| --- | --- |
| capability card | `integratedRuntime` / `terminalSurface` / `both` / `none` の 4 状態を表示し、shared `resolveCapability()` / `resolveCtaContract()` を唯一の authority とする |
| health row | selected provider の `connected` / `disconnected` / `error` / `null` を表示し、`disconnected` 時のみ `再確認` CTA を出す |
| provider summary | provider / model の明示選択を表示し、`DEFAULT_CONFIG` への silent fallback を行わない |
| blocked recovery | `none` で primary CTA が `設定を開く` の場合、`SettingsView` 内の認証方式セクションへ scroll して no-op を避ける |
| unauthenticated | matrix 自体は表示するが、実行系 CTA は非表示にし guidance-only 文言を出す |
| feedback | command copy / terminal 起動 / blocked recovery は `mainline-access-feedback` で短時間表示する |

### 実装ファイル

| ファイル | 役割 |
| --- | --- |
| `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts` | capability / uiState / launcher disabled reason の導出 |
| `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` | auth mode / provider / model / health から access state を構成 |
| `apps/desktop/src/renderer/views/SettingsView/MainlineAccessMatrixSection.tsx` | capability card / health row / provider summary の描画 |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx` | settings shell への組み込みと action dispatch |

### 検証

| 種別 | 証跡 |
| --- | --- |
| unit / integration | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx` |
| state contract | `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.test.ts` |
| hook | `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.test.ts` |

---

## AuthKeySection 表示契約（TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001）

**完了日**: 2026-03-11  
**実装ファイル**:

- `apps/desktop/src/renderer/views/SettingsView/index.tsx`
- `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`
- `apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts`
- `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`

現在は `useAuthKeyManagement` が AuthKeySection の状態・IPC 契約を集約し、`ApiKeySettingsPanel` は後方互換の委譲ラッパーとして `AuthKeySection` に接続する。

### 表示条件

| 条件 | 動作 |
| --- | --- |
| `authMode === "api-key"` | `AuthKeySection` を表示する |
| `authMode !== "api-key"` | `AuthKeySection` を非表示にする |

### 状態表示（`auth-key:exists` の `source` 優先）

`AuthKeySection` は `ApiKeyStatus`（`not_set` / `validating` / `configured` / `error` / `check-failed`）を使い、
`configured` の場合のみ `keySource`（`saved` / `env-fallback`）で表示バッジを切り替える。

| `auth-key:exists` レスポンス | UI状態 | 表示意図 |
| --- | --- | --- |
| `{ exists: false, source: "not-set" }` | `not_set` | APIキー未設定を明示 |
| `{ exists: true, source: "saved" }` | `configured` + `keySource="saved"` | 保存済みキーを優先表示 |
| `{ exists: true, source: "env-fallback" }` | `configured` + `keySource="env-fallback"` | 環境変数 fallback 使用を表示 |
| `source` が想定外 | `configured` + `keySource=null` | 設定済みとして表示（表示名は「設定済み」） |
| `electronAPI` 未提供 / `exists()` 例外 | `check-failed` | 状態確認に失敗したことを明示（ステータスメッセージ欄に `apiError` を表示する） |

### Phase 11 視覚検証

| テストケース | 証跡 | 判定 |
| --- | --- | --- |
| TC-11-01 | `outputs/phase-11/screenshots/TC-11-01-settings-apikey-authkey-initial.png` | PASS |
| TC-11-02 | `outputs/phase-11/screenshots/TC-11-02-settings-apikey-save-success.png` | PASS |
| TC-11-03 | `outputs/phase-11/screenshots/TC-11-03-settings-authkey-env-fallback.png` | PASS |

---
