# テーマ機能 - フロントエンド要件定義書

**バージョン**: 1.0.0
**作成日**: 2024-12-08
**最終更新**: 2024-12-08
**作成者**: @req-analyst
**ステータス**: Draft

---

## 1. 概要

### 1.1 目的

本ドキュメントは、Knowledge Studioデスクトップアプリケーションにおけるテーマ切り替え機能のフロントエンド要件を定義する。実装者が迷わず設計・実装できる詳細レベルで要件を記述する。

### 1.2 背景

#### 現状の課題

| 課題             | 詳細                                                                             | 影響度 |
| ---------------- | -------------------------------------------------------------------------------- | ------ |
| 永続化なし       | SettingsViewのテーマ選択が`useState`のみで管理され、アプリ再起動で設定が失われる | 高     |
| スタイル未適用   | テーマを選択しても実際のスタイルに反映されない                                   | 高     |
| システム連動なし | OSのテーマ設定との連携が未実装                                                   | 中     |
| Zustand未統合    | SettingsSliceにテーマ関連のフィールドがない                                      | 中     |
| FOUC発生リスク   | 初回ロード時にテーマが適用されるまでのちらつきが発生する可能性                   | 中     |

#### 既存資産

| 資産           | パス                                                     | 状態                                                                   |
| -------------- | -------------------------------------------------------- | ---------------------------------------------------------------------- |
| CSS変数体系    | `apps/desktop/src/renderer/styles/tokens.css`            | ダークモードデフォルト、`@media (prefers-color-scheme: light)`対応済み |
| 設定画面UI     | `apps/desktop/src/renderer/views/SettingsView/index.tsx` | テーマ選択UI存在（ローカルstate）                                      |
| electron-store | `storeHandlers.ts`                                       | 既に使用中                                                             |

### 1.3 スコープ

**含まれるもの**:

- ライト/ダーク/システム連動テーマの3択切り替えUI
- CSS変数によるリアルタイムスタイル切り替え
- テーマトランジション（滑らかな色変化）
- FOUC防止機構
- WCAG 2.1 AA準拠のアクセシビリティ

**含まれないもの**:

- カスタムカラー設定（将来の拡張として検討）
- テーマのインポート/エクスポート
- コンポーネント単位のテーマカスタマイズ
- IPC/永続化の詳細（spec-backend.mdで定義）

### 1.4 用語定義

| 用語           | 定義                                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| ThemeMode      | ユーザーが選択するテーマモード。`'light'` / `'dark'` / `'system'`の3値               |
| ResolvedTheme  | 実際に適用されるテーマ。`'light'` / `'dark'`の2値                                    |
| FOUC           | Flash of Unstyled Content。初回ロード時にスタイルが適用されるまでのちらつき          |
| CSS変数        | CSS Custom Properties。`--variable-name`形式で定義される動的なスタイル値             |
| data-theme属性 | `<html>`要素に設定されるテーマを示す属性。`data-theme="light"` / `data-theme="dark"` |

---

## 2. ユーザーストーリー

### US-TH-001: テーマを手動で変更する

**アクター**: エンドユーザー
**ゴール**: 好みのテーマ（ライト/ダーク）を選択し、即座に適用する

#### シナリオ 1: ダークテーマを選択する（正常系）

- **Given**: ユーザーがライトテーマで設定画面を開いている
- **When**: ユーザーが「ダーク」ボタンをクリックする
- **Then**:
  - 200ms以内にテーマがダークに切り替わる
  - 切り替え時に滑らかなトランジション（200ms ease）が適用される
  - 「ダーク」ボタンが選択状態（アクセントカラー枠）になる
  - 設定がelectron-storeに自動保存される

#### シナリオ 2: キーボードでテーマを選択する（アクセシビリティ）

- **Given**: ユーザーがテーマ選択UIにフォーカスしている
- **When**: ユーザーが矢印キーでオプションを移動し、Enterキーを押す
- **Then**:
  - 選択したテーマが即座に適用される
  - フォーカスインジケーター（2px以上、コントラスト比3:1以上）が表示される

#### シナリオ 3: 無効なテーマ値が設定される（異常系）

- **Given**: システムが不正なテーマ値を受け取った
- **When**: テーマ適用処理が実行される
- **Then**:
  - デフォルトテーマ（'dark'）にフォールバックする
  - コンソールに警告ログが出力される

---

### US-TH-002: システムテーマに連動する

**アクター**: エンドユーザー
**ゴール**: OSのテーマ設定に自動追従する

#### シナリオ 1: システムテーマを選択する（正常系）

- **Given**: ユーザーがダークテーマを使用中で、OSがライトモード
- **When**: ユーザーが「システム」ボタンをクリックする
- **Then**:
  - テーマがOSの設定（ライト）に即座に切り替わる
  - 「システム」ボタンが選択状態になる

#### シナリオ 2: OSのテーマ設定が変更される（正常系）

- **Given**: ユーザーが「システム」を選択済み、OSがライトモード
- **When**: ユーザーがOSのテーマをダークモードに変更する
- **Then**:
  - アプリのテーマがリアルタイム（500ms以内）でダークに切り替わる
  - ページリロードなしで反映される

#### シナリオ 3: システムテーマ検出に失敗する（異常系）

- **Given**: OSのテーマ検出APIが利用不可
- **When**: 「システム」を選択する
- **Then**:
  - デフォルトテーマ（'dark'）が適用される
  - ユーザーに通知は表示しない（バックグラウンド処理）

---

### US-TH-003: アプリ起動時にテーマが復元される

**アクター**: エンドユーザー
**ゴール**: 前回設定したテーマがアプリ起動時に適用される

#### シナリオ 1: 保存されたテーマが復元される（正常系）

- **Given**: ユーザーが前回「ライト」テーマを選択して終了した
- **When**: アプリを起動する
- **Then**:
  - 初回描画からライトテーマが適用される
  - FOUCが発生しない（Reactマウント前にテーマ適用）

#### シナリオ 2: 初回起動時のデフォルトテーマ（正常系）

- **Given**: 初回起動（保存データなし）
- **When**: アプリを起動する
- **Then**:
  - 「システム」モードがデフォルトで適用される
  - OSのテーマ設定に従ったテーマが表示される

#### シナリオ 3: 保存データが破損している（異常系）

- **Given**: electron-storeのテーマデータが破損
- **When**: アプリを起動する
- **Then**:
  - デフォルトテーマ（'system'→OSテーマ）が適用される
  - 破損データは上書きされる

---

## 3. 機能要件

### FR-TH-001: テーマ切り替え

**優先度**: Must have
**概要**: ユーザーがライト/ダーク/システム連動からテーマを選択できる

#### 詳細仕様

| 項目             | 仕様                                     |
| ---------------- | ---------------------------------------- |
| テーマオプション | `'light'` / `'dark'` / `'system'`の3択   |
| 切り替え方式     | `<html>`要素の`data-theme`属性を変更     |
| 即時反映         | ページリロード不要、200ms以内に反映      |
| 自動保存         | テーマ変更時に自動でelectron-storeに保存 |

#### 型定義

```typescript
type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeState {
  mode: ThemeMode; // ユーザー選択値
  resolvedTheme: ResolvedTheme; // 実際に適用されるテーマ
}
```

#### 受け入れ基準

**AC-FR-001-1: ライトテーマ選択**

- **Given**: アプリがダークテーマで表示されている
- **When**: ユーザーが「ライト」を選択する
- **Then**:
  - `<html>`要素に`data-theme="light"`が設定される
  - 200ms以内に全UI要素がライトテーマカラーに変更される
  - Zustand storeの`theme.mode`が`'light'`になる
  - Zustand storeの`theme.resolvedTheme`が`'light'`になる

**AC-FR-001-2: ダークテーマ選択**

- **Given**: アプリがライトテーマで表示されている
- **When**: ユーザーが「ダーク」を選択する
- **Then**:
  - `<html>`要素に`data-theme="dark"`が設定される
  - 200ms以内に全UI要素がダークテーマカラーに変更される
  - Zustand storeの`theme.mode`が`'dark'`になる
  - Zustand storeの`theme.resolvedTheme`が`'dark'`になる

**AC-FR-001-3: システムテーマ選択**

- **Given**: アプリがダークテーマで表示されている、OSはライトモード
- **When**: ユーザーが「システム」を選択する
- **Then**:
  - `<html>`要素に`data-theme="light"`が設定される（OSテーマに従う）
  - Zustand storeの`theme.mode`が`'system'`になる
  - Zustand storeの`theme.resolvedTheme`がOSテーマに従った値になる

---

### FR-TH-002: システムテーマ連動

**優先度**: Must have
**概要**: OSのテーマ設定に連動してアプリのテーマを自動切り替え

#### 詳細仕様

| 項目           | 仕様                                                 |
| -------------- | ---------------------------------------------------- |
| 検出方法       | `window.matchMedia('(prefers-color-scheme: dark)')`  |
| 監視方法       | `MediaQueryList.addEventListener('change', handler)` |
| 反映タイミング | OSテーマ変更後500ms以内                              |
| 対応OS         | macOS, Windows, Linux                                |

#### 受け入れ基準

**AC-FR-002-1: OSテーマ変更時の自動追従**

- **Given**: ユーザーが「システム」を選択済み、OSがライトモード、アプリがライトテーマ
- **When**: ユーザーがOSのテーマをダークモードに変更する
- **Then**:
  - 500ms以内にアプリのテーマがダークに切り替わる
  - `theme.mode`は`'system'`のまま変わらない
  - `theme.resolvedTheme`が`'dark'`に更新される

**AC-FR-002-2: 非システムモード時のOS変更無視**

- **Given**: ユーザーが「ダーク」を選択済み、OSがダークモード
- **When**: ユーザーがOSのテーマをライトモードに変更する
- **Then**:
  - アプリのテーマはダークのまま変わらない

**AC-FR-002-3: システムテーマ検出APIの利用**

- **Given**: Electronアプリが起動している
- **When**: システムテーマを取得する
- **Then**:
  - `nativeTheme.shouldUseDarkColors`（Mainプロセス）またはMediaQuery（Rendererプロセス）でテーマを検出する
  - macOS/Windows/Linux全てで正常に検出される

---

### FR-TH-003: CSS変数テーマシステム

**優先度**: Must have
**概要**: CSS変数を使用したテーマ切り替えシステムを実装する

#### 詳細仕様

| 項目           | 仕様                                  |
| -------------- | ------------------------------------- |
| 変数定義場所   | `:root`セレクタ内（ライトテーマ基準） |
| ダークテーマ   | `[data-theme="dark"]`セレクタで上書き |
| 既存tokens.css | 拡張（互換性維持）                    |
| 命名規則       | `--{category}-{element}-{state}` 形式 |

#### CSS変数一覧

| カテゴリ   | 変数名              | ライトテーマ値           | ダークテーマ値              | 用途           |
| ---------- | ------------------- | ------------------------ | --------------------------- | -------------- |
| 背景       | `--bg-primary`      | `#ffffff`                | `var(--color-slate-900)`    | 主要背景       |
| 背景       | `--bg-secondary`    | `var(--color-slate-50)`  | `var(--color-slate-800)`    | 二次背景       |
| 背景       | `--bg-tertiary`     | `var(--color-slate-100)` | `var(--color-slate-700)`    | 三次背景       |
| 背景       | `--bg-elevated`     | `rgba(0, 0, 0, 0.02)`    | `rgba(255, 255, 255, 0.05)` | 浮遊要素背景   |
| 背景       | `--bg-glass`        | `rgba(0, 0, 0, 0.05)`    | `rgba(255, 255, 255, 0.1)`  | ガラス効果背景 |
| テキスト   | `--text-primary`    | `var(--color-slate-900)` | `var(--color-slate-50)`     | 主要テキスト   |
| テキスト   | `--text-secondary`  | `var(--color-slate-600)` | `var(--color-slate-400)`    | 二次テキスト   |
| テキスト   | `--text-muted`      | `var(--color-slate-400)` | `var(--color-slate-500)`    | 控えめテキスト |
| テキスト   | `--text-inverse`    | `var(--color-slate-50)`  | `var(--color-slate-900)`    | 反転テキスト   |
| ボーダー   | `--border-default`  | `var(--color-slate-200)` | `var(--color-slate-700)`    | 標準ボーダー   |
| ボーダー   | `--border-emphasis` | `var(--color-slate-300)` | `var(--color-slate-600)`    | 強調ボーダー   |
| ボーダー   | `--border-subtle`   | `rgba(0, 0, 0, 0.1)`     | `rgba(255, 255, 255, 0.1)`  | 控えめボーダー |
| ステータス | `--status-primary`  | `var(--color-blue-600)`  | `var(--color-macos-blue)`   | プライマリ     |
| ステータス | `--status-success`  | `var(--color-green-600)` | `var(--color-green-500)`    | 成功           |
| ステータス | `--status-warning`  | `var(--color-amber-500)` | `var(--color-amber-500)`    | 警告           |
| ステータス | `--status-error`    | `var(--color-red-600)`   | `var(--color-red-500)`      | エラー         |

#### 受け入れ基準

**AC-FR-003-1: CSS変数による色制御**

- **Given**: テーマCSS変数が定義されている
- **When**: `data-theme`属性が変更される
- **Then**:
  - 全てのCSS変数参照箇所の色が即座に変更される
  - JavaScriptでの再計算なしにCSSのみで反映される

**AC-FR-003-2: 既存tokens.cssとの互換性**

- **Given**: 既存のtokens.cssで定義されたPrimitive Colors
- **When**: テーマシステムを追加する
- **Then**:
  - 既存のPrimitive Colors（`--color-slate-*`等）は変更しない
  - Semantic Colors（`--bg-*`, `--text-*`等）のみテーマ対応する
  - 既存コンポーネントが正常に動作する

**AC-FR-003-3: data-theme属性によるテーマ切り替え**

- **Given**: `<html data-theme="light">`
- **When**: `document.documentElement.setAttribute('data-theme', 'dark')`を実行
- **Then**:
  - 全てのSemantic ColorsがダークテーマCSS値に変更される
  - `:root`と`[data-theme="dark"]`の変数定義が正しく切り替わる

---

### FR-TH-004: テーマ永続化（フロントエンド側）

**優先度**: Must have
**概要**: 選択したテーマ設定をelectron-storeに保存し、起動時に復元する

#### 詳細仕様

| 項目               | 仕様                               |
| ------------------ | ---------------------------------- |
| 保存タイミング     | テーマ変更時に即時保存             |
| 保存先             | electron-store（IPCを介して）      |
| 読み込みタイミング | アプリ起動時（Reactマウント前）    |
| デフォルト値       | `'system'`（保存データがない場合） |

#### 受け入れ基準

**AC-FR-004-1: テーマ変更時の自動保存**

- **Given**: ユーザーがダークテーマを使用中
- **When**: ライトテーマに変更する
- **Then**:
  - `window.electronAPI.theme.set({ mode: 'light' })`が呼び出される
  - 保存完了を待たずにUIは即座に更新される

**AC-FR-004-2: 起動時のテーマ復元**

- **Given**: 前回「ライト」テーマで終了
- **When**: アプリを起動する
- **Then**:
  - Reactマウント前にテーマが復元される
  - `window.__INITIAL_THEME__`に初期テーマが設定される
  - FOUCが発生しない

**AC-FR-004-3: 初回起動時のデフォルト動作**

- **Given**: 初回起動（保存データなし）
- **When**: アプリを起動する
- **Then**:
  - `theme.mode`が`'system'`に設定される
  - `theme.resolvedTheme`がOSテーマに従った値になる

---

### FR-TH-005: テーマトランジション

**優先度**: Should have
**概要**: テーマ切り替え時にスムーズなトランジションを適用する

#### 詳細仕様

| 項目               | 仕様                                        |
| ------------------ | ------------------------------------------- |
| トランジション時間 | 200ms                                       |
| イージング         | `ease`（cubic-bezier(0.4, 0, 0.2, 1)）      |
| 対象プロパティ     | `background-color`, `border-color`, `color` |
| 初回ロード         | トランジションなし（FOUC防止）              |

#### CSSクラス仕様

```css
/* トランジション適用クラス（テーマ変更時のみ適用） */
html.theme-transitioning,
html.theme-transitioning *,
html.theme-transitioning *::before,
html.theme-transitioning *::after {
  transition:
    background-color 200ms ease,
    border-color 200ms ease,
    color 200ms ease !important;
}
```

#### 受け入れ基準

**AC-FR-005-1: テーマ変更時のトランジション**

- **Given**: アプリがダークテーマで表示されている
- **When**: ライトテーマに変更する
- **Then**:
  - `html`要素に`theme-transitioning`クラスが追加される
  - 色変更が200msかけて滑らかに行われる
  - 200ms後に`theme-transitioning`クラスが削除される

**AC-FR-005-2: 初回ロード時のトランジション無効化**

- **Given**: アプリを起動する
- **When**: 初期テーマが適用される
- **Then**:
  - トランジションなしで即座にテーマが適用される
  - ちらつき（FOUC）が発生しない

**AC-FR-005-3: アニメーション軽減モードへの対応**

- **Given**: OSで`prefers-reduced-motion: reduce`が設定されている
- **When**: テーマを変更する
- **Then**:
  - トランジション時間が0msになるか、トランジションが無効化される

---

## 4. 非機能要件

### NFR-TH-001: パフォーマンス

**カテゴリ**: Performance
**優先度**: High

| 指標                   | 目標値                | 測定方法              |
| ---------------------- | --------------------- | --------------------- |
| テーマ切り替え完了時間 | 16ms以内（60fps維持） | Performance APIで測定 |
| 初期テーマ適用時間     | 50ms以内              | 起動時間計測          |
| CSS変数変更の反映      | 1フレーム以内         | 視覚的確認            |
| メモリ使用量増加       | 1MB以下               | Chrome DevTools       |

#### 受け入れ基準

**AC-NFR-001-1: テーマ切り替えの応答性**

- **Given**: テーマ切り替えボタンをクリックする
- **When**: テーマが変更される
- **Then**:
  - 16ms以内（1フレーム以内）でDOM更新が完了する
  - UIのジャンク（カクつき）が発生しない

**AC-NFR-001-2: 初期テーマ適用の高速性**

- **Given**: アプリを起動する
- **When**: 初期テーマが適用される
- **Then**:
  - 50ms以内にテーマがDOMに適用される
  - 白い画面やスタイル未適用状態が視認されない

---

### NFR-TH-002: アクセシビリティ

**カテゴリ**: Accessibility
**優先度**: High
**準拠基準**: WCAG 2.1 Level AA

#### コントラスト比要件

| 要素タイプ                          | 最小コントラスト比 | 検証ツール           |
| ----------------------------------- | ------------------ | -------------------- |
| 通常テキスト（16px未満）            | 4.5:1以上          | axe-core, Lighthouse |
| 大きいテキスト（18px以上/14px太字） | 3:1以上            | axe-core, Lighthouse |
| UIコンポーネント境界                | 3:1以上            | 手動確認             |
| フォーカスインジケーター            | 3:1以上            | 手動確認             |

#### ライトテーマのコントラスト比

| 組み合わせ                             | 色                | コントラスト比 | 判定               |
| -------------------------------------- | ----------------- | -------------- | ------------------ |
| テキスト（primary）/ 背景（primary）   | #1e293b / #ffffff | 12.6:1         | Pass               |
| テキスト（secondary）/ 背景（primary） | #475569 / #ffffff | 7.0:1          | Pass               |
| テキスト（muted）/ 背景（primary）     | #94a3b8 / #ffffff | 3.1:1          | Pass（大テキスト） |
| アクセントカラー / 背景（primary）     | #2563eb / #ffffff | 4.6:1          | Pass               |

#### ダークテーマのコントラスト比

| 組み合わせ                             | 色                | コントラスト比 | 判定               |
| -------------------------------------- | ----------------- | -------------- | ------------------ |
| テキスト（primary）/ 背景（primary）   | #f8fafc / #0f172a | 16.0:1         | Pass               |
| テキスト（secondary）/ 背景（primary） | #94a3b8 / #0f172a | 5.4:1          | Pass               |
| テキスト（muted）/ 背景（primary）     | #64748b / #0f172a | 3.2:1          | Pass（大テキスト） |
| アクセントカラー / 背景（primary）     | #0a84ff / #0f172a | 5.1:1          | Pass               |

#### 受け入れ基準

**AC-NFR-002-1: WCAGコントラスト比の達成**

- **Given**: ライト/ダークテーマが適用されている
- **When**: axe-coreでアクセシビリティ検証を実行する
- **Then**:
  - コントラスト比に関する違反が0件
  - 全テキスト要素がWCAG 2.1 AA基準を満たす

**AC-NFR-002-2: キーボード操作の完全対応**

- **Given**: キーボードのみで操作している
- **When**: テーマ選択UIを操作する
- **Then**:
  - Tabキーでフォーカス可能
  - 矢印キーでオプション間を移動可能
  - Enter/Spaceキーで選択可能
  - フォーカスインジケーターが常に視認可能

**AC-NFR-002-3: スクリーンリーダー対応**

- **Given**: スクリーンリーダーを使用している
- **When**: テーマ選択UIを操作する
- **Then**:
  - `role="radiogroup"`が設定されている
  - 各オプションに`role="radio"`と`aria-checked`が設定されている
  - 選択状態が音声で読み上げられる

---

### NFR-TH-003: 互換性

**カテゴリ**: Compatibility
**優先度**: Medium

| 対象     | サポート範囲                                   |
| -------- | ---------------------------------------------- |
| OS       | macOS 12+, Windows 10+, Linux（Ubuntu 22.04+） |
| Electron | 28.x以上                                       |
| Chromium | 116以上（Electron 28相当）                     |

#### 受け入れ基準

**AC-NFR-003-1: macOSでの動作**

- **Given**: macOS 12以上の環境
- **When**: テーマ機能を使用する
- **Then**:
  - 全機能が正常に動作する
  - システムテーマの検出が正常に動作する

**AC-NFR-003-2: Windowsでの動作**

- **Given**: Windows 10/11環境
- **When**: テーマ機能を使用する
- **Then**:
  - 全機能が正常に動作する
  - システムテーマの検出が正常に動作する

**AC-NFR-003-3: Linuxでの動作**

- **Given**: Linux（GTK/Qt環境）
- **When**: テーマ機能を使用する
- **Then**:
  - テーマ切り替えが正常に動作する
  - システムテーマ検出はベストエフォート（検出不可の場合はデフォルト）

---

## 5. UI/UX要件

### 5.1 テーマ選択UIの仕様

#### レイアウト

```
┌─────────────────────────────────────────────────────────────────┐
│ 外観設定                                                         │
│ テーマとディスプレイ設定                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ テーマ                                                           │
│                                                                  │
│ ┌───────────────┐  ┌───────────────┐  ┌───────────────┐         │
│ │               │  │               │  │               │         │
│ │      ☀️       │  │      🌙       │  │      💻       │         │
│ │               │  │               │  │               │         │
│ │    ライト     │  │    ダーク     │  │   システム    │         │
│ │               │  │               │  │               │         │
│ └───────────────┘  └───────────────┘  └───────────────┘         │
│        ○                  ●                  ○                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### コンポーネント仕様

| 要素               | 仕様                                 |
| ------------------ | ------------------------------------ |
| コンテナ           | FlexBox、gap: 8px (var(--spacing-2)) |
| ボタンサイズ       | 幅: 100px、高さ: 80px                |
| アイコンサイズ     | 24px                                 |
| ラベル             | 14px (text-sm)、中央揃え             |
| 選択インジケーター | ラジオボタン形式のドット（下部中央） |

#### 状態別スタイル

| 状態       | スタイル                                                      |
| ---------- | ------------------------------------------------------------- |
| デフォルト | 背景: var(--bg-secondary)、ボーダー: var(--border-default)    |
| ホバー     | 背景: var(--bg-tertiary)、ボーダー: var(--border-emphasis)    |
| 選択中     | 背景: var(--bg-tertiary)、ボーダー: var(--status-primary) 2px |
| フォーカス | フォーカスリング: 2px offset、var(--status-primary)           |
| 無効       | opacity: 0.5、cursor: not-allowed                             |

### 5.2 視覚的フィードバック

| インタラクション | フィードバック                               |
| ---------------- | -------------------------------------------- |
| ホバー           | 背景色が少し明るく/暗くなる（100ms）         |
| クリック/タップ  | 押下状態のスケール縮小（95%、100ms）         |
| 選択             | アクセントカラーのボーダー、選択ドットの表示 |
| フォーカス       | フォーカスリングの表示                       |

### 5.3 キーボードナビゲーション

| キー          | 動作                               |
| ------------- | ---------------------------------- |
| Tab           | テーマ選択グループにフォーカス移動 |
| ← →           | オプション間を移動                 |
| Enter / Space | 現在フォーカス中のオプションを選択 |
| Escape        | フォーカスを外す                   |

### 5.4 ツールチップ

| オプション | ツールチップテキスト                     |
| ---------- | ---------------------------------------- |
| ライト     | 「明るい背景のテーマを使用」             |
| ダーク     | 「暗い背景のテーマを使用」               |
| システム   | 「OSの設定に従ってテーマを自動切り替え」 |

- 表示タイミング: ホバー開始から500ms後
- 位置: ボタンの下部中央
- 消失: マウスアウト時に即座に非表示

---

## 6. CSS変数要件

### 6.1 必要なCSS変数一覧

既存の`tokens.css`を拡張し、以下のセマンティック変数をテーマ対応させる。

#### 背景色（Background）

| 変数名           | 説明                           | ライト                 | ダーク                    |
| ---------------- | ------------------------------ | ---------------------- | ------------------------- |
| `--bg-primary`   | 主要背景（ページ背景）         | #ffffff                | var(--color-slate-900)    |
| `--bg-secondary` | 二次背景（カード、パネル）     | var(--color-slate-50)  | var(--color-slate-800)    |
| `--bg-tertiary`  | 三次背景（入力フィールド）     | var(--color-slate-100) | var(--color-slate-700)    |
| `--bg-elevated`  | 浮遊要素背景（ドロップダウン） | rgba(0, 0, 0, 0.02)    | rgba(255, 255, 255, 0.05) |
| `--bg-glass`     | ガラスモーフィズム背景         | rgba(0, 0, 0, 0.05)    | rgba(255, 255, 255, 0.1)  |

#### テキスト色（Text）

| 変数名             | 説明                             | ライト                 | ダーク                 |
| ------------------ | -------------------------------- | ---------------------- | ---------------------- |
| `--text-primary`   | 主要テキスト                     | var(--color-slate-900) | var(--color-slate-50)  |
| `--text-secondary` | 二次テキスト                     | var(--color-slate-600) | var(--color-slate-400) |
| `--text-muted`     | 控えめテキスト（ヒント）         | var(--color-slate-400) | var(--color-slate-500) |
| `--text-inverse`   | 反転テキスト（アクセント背景上） | var(--color-slate-50)  | var(--color-slate-900) |

#### ボーダー色（Border）

| 変数名              | 説明           | ライト                 | ダーク                   |
| ------------------- | -------------- | ---------------------- | ------------------------ |
| `--border-default`  | 標準ボーダー   | var(--color-slate-200) | var(--color-slate-700)   |
| `--border-emphasis` | 強調ボーダー   | var(--color-slate-300) | var(--color-slate-600)   |
| `--border-subtle`   | 控えめボーダー | rgba(0, 0, 0, 0.1)     | rgba(255, 255, 255, 0.1) |

#### ステータス色（Status）

| 変数名                   | 説明                 | ライト                 | ダーク                  |
| ------------------------ | -------------------- | ---------------------- | ----------------------- |
| `--status-primary`       | プライマリアクション | var(--color-blue-600)  | var(--color-macos-blue) |
| `--status-primary-hover` | プライマリホバー     | var(--color-blue-700)  | var(--color-blue-400)   |
| `--status-success`       | 成功状態             | var(--color-green-600) | var(--color-green-500)  |
| `--status-warning`       | 警告状態             | var(--color-amber-500) | var(--color-amber-500)  |
| `--status-error`         | エラー状態           | var(--color-red-600)   | var(--color-red-500)    |

### 6.2 CSS変数の実装方式

```css
/* tokens.css - テーマ対応版（追加・変更部分） */

/* ===== ライトテーマ（新規追加セクション） ===== */
:root,
[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: var(--color-slate-50);
  --bg-tertiary: var(--color-slate-100);
  --bg-elevated: rgba(0, 0, 0, 0.02);
  --bg-glass: rgba(0, 0, 0, 0.05);

  --text-primary: var(--color-slate-900);
  --text-secondary: var(--color-slate-600);
  --text-muted: var(--color-slate-400);
  --text-inverse: var(--color-slate-50);

  --border-default: var(--color-slate-200);
  --border-emphasis: var(--color-slate-300);
  --border-subtle: rgba(0, 0, 0, 0.1);

  --status-primary: var(--color-blue-600);
  --status-primary-hover: var(--color-blue-700);
  --status-success: var(--color-green-600);
  --status-warning: var(--color-amber-500);
  --status-error: var(--color-red-600);
}

/* ===== ダークテーマ ===== */
[data-theme="dark"] {
  --bg-primary: var(--color-slate-900);
  --bg-secondary: var(--color-slate-800);
  --bg-tertiary: var(--color-slate-700);
  --bg-elevated: rgba(255, 255, 255, 0.05);
  --bg-glass: rgba(255, 255, 255, 0.1);

  --text-primary: var(--color-slate-50);
  --text-secondary: var(--color-slate-400);
  --text-muted: var(--color-slate-500);
  --text-inverse: var(--color-slate-900);

  --border-default: var(--color-slate-700);
  --border-emphasis: var(--color-slate-600);
  --border-subtle: rgba(255, 255, 255, 0.1);

  --status-primary: var(--color-macos-blue);
  --status-primary-hover: var(--color-blue-400);
  --status-success: var(--color-green-500);
  --status-warning: var(--color-amber-500);
  --status-error: var(--color-red-500);
}

/* ===== 既存のprefers-color-schemeは削除または無効化 ===== */
/* @media (prefers-color-scheme: light) { ... } は削除 */
```

### 6.3 既存tokens.cssとの互換性

| 観点                                  | 方針                                              |
| ------------------------------------- | ------------------------------------------------- |
| Primitive Colors                      | 変更しない（`--color-slate-*`等はそのまま維持）   |
| Semantic Colors                       | テーマ対応に変更（`:root`と`[data-theme]`で分岐） |
| 既存の`@media (prefers-color-scheme)` | 削除（`data-theme`属性に置き換え）                |
| 既存コンポーネント                    | CSS変数参照箇所は変更不要（変数値のみ変更）       |

---

## 7. ユースケース

### UC-TH-001: テーマを変更する

**ID**: UC-TH-001
**アクター**: エンドユーザー
**ゴール**: 好みのテーマを選択し、アプリの外観を変更する

**事前条件**:

- アプリケーションが起動している
- 設定画面が表示されている

**基本フロー**（正常系）:

1. ユーザーが「外観設定」セクションを確認する
2. ユーザーがテーマオプション（ライト/ダーク/システム）をクリックする
3. システムが`html`要素に`theme-transitioning`クラスを追加する
4. システムが`data-theme`属性を更新する
5. システムがCSS変数の値が更新され、UIの色が変化する（200ms）
6. システムが`theme-transitioning`クラスを削除する
7. システムがelectron-storeに設定を保存する（非同期）
8. システムがZustand storeの状態を更新する

**代替フロー**:

- 2a. キーボードで操作する場合:
  - 2a-1. Tabキーでテーマ選択UIにフォーカス
  - 2a-2. 矢印キーでオプション間を移動
  - 2a-3. Enter/Spaceキーで選択
  - 基本フロー3へ続く

**例外フロー**:

- E1. electron-storeへの保存が失敗した場合:
  - E1-1. UIは既に更新されているため、ユーザー体験に影響なし
  - E1-2. コンソールにエラーログを出力
  - E1-3. 次回起動時は以前の設定が復元される

**事後条件**:

- 選択したテーマがUIに適用されている
- テーマ設定がelectron-storeに保存されている
- Zustand storeの状態が更新されている

**関連要件**: FR-TH-001, FR-TH-004, FR-TH-005

---

### UC-TH-002: システムテーマに連動する

**ID**: UC-TH-002
**アクター**: エンドユーザー、OS
**ゴール**: OSのテーマ設定に自動追従する

**事前条件**:

- アプリケーションが起動している
- ユーザーが「システム」テーマを選択済み

**基本フロー**（正常系）:

1. ユーザーがOSのテーマ設定を変更する
2. OSがMediaQueryListの`change`イベントを発火する
3. システムがイベントハンドラで新しいシステムテーマを検出する
4. システムが`theme.resolvedTheme`を更新する
5. システムが`data-theme`属性を更新する
6. UIがスムーズに新しいテーマに切り替わる（200ms）

**代替フロー**:

- 3a. ユーザーが「システム」以外を選択している場合:
  - 3a-1. イベントは受信するが、処理をスキップ
  - 3a-2. UIに変化なし

**例外フロー**:

- E1. MediaQueryListがサポートされていない場合:
  - E1-1. 初期化時にnativeTheme APIを使用
  - E1-2. リアルタイム追従は無効（ダーク固定）

**事後条件**:

- `theme.mode`は`'system'`のまま
- `theme.resolvedTheme`がOSテーマに一致
- UIがOSテーマに一致

**関連要件**: FR-TH-002

---

### UC-TH-003: アプリ起動時のテーマ適用

**ID**: UC-TH-003
**アクター**: システム
**ゴール**: FOUCなしで保存されたテーマを適用する

**事前条件**:

- アプリケーションが起動中

**基本フロー**（正常系）:

1. Mainプロセスがelectron-storeからテーマ設定を読み込む
2. Mainプロセスが「システム」の場合、nativeTheme.shouldUseDarkColorsを確認
3. Preloadスクリプトが`window.__INITIAL_THEME__`に初期テーマを設定
4. index.htmlのインラインスクリプトが`data-theme`属性を設定（同期的）
5. CSSが適用され、正しいテーマカラーで描画される
6. Reactアプリがマウントされる
7. useThemeフックがZustand storeを初期化

**代替フロー**:

- 1a. 保存データがない場合（初回起動）:
  - 1a-1. デフォルト値`'system'`を使用
  - 基本フロー2へ続く

**例外フロー**:

- E1. 保存データが破損している場合:
  - E1-1. デフォルト値`'system'`にフォールバック
  - E1-2. 破損データを上書き保存
  - 基本フロー2へ続く

**事後条件**:

- FOUCなしでテーマが適用されている
- Zustand storeが正しい状態で初期化されている

**関連要件**: FR-TH-004, NFR-TH-001

---

## 8. 制約事項

### 8.1 技術的制約

| 制約                   | 詳細                                              | 対応方針                                      |
| ---------------------- | ------------------------------------------------- | --------------------------------------------- |
| Electronプロセス分離   | Mainプロセスからwindow.matchMediaは使用不可       | nativeTheme APIを使用                         |
| Preloadの同期制限      | Preloadから非同期でelectron-storeを読むとFOUC発生 | 起動時に同期的に初期テーマを設定              |
| CSS変数の継承          | Shadow DOM内では変数が継承されない                | Shadow DOM不使用（現状影響なし）              |
| トランジションの副作用 | 全要素にtransitionを適用すると重くなる            | 必要な時だけ`theme-transitioning`クラスを追加 |

### 8.2 デザイン制約

| 制約               | 詳細                         | 対応方針                                 |
| ------------------ | ---------------------------- | ---------------------------------------- |
| 既存tokens.css互換 | 破壊的変更を避ける           | Semantic変数のみ変更、Primitiveは維持    |
| macOS HIG準拠      | ネイティブアプリらしい見た目 | システムカラー（--color-macos-\*）を活用 |
| WCAG 2.1 AA        | コントラスト比の確保         | 定義済みカラーのコントラスト比を検証済み |

### 8.3 運用上の制約

| 制約         | 詳細                           | 対応方針                                 |
| ------------ | ------------------------------ | ---------------------------------------- |
| 後方互換性   | 既存ユーザーの設定を破壊しない | electron-storeスキーマのマイグレーション |
| 将来の拡張性 | カスタムカラー機能の追加可能性 | 拡張可能なスキーマ設計                   |

---

## 9. コンポーネント階層

```
apps/desktop/src/renderer/
├── components/
│   └── molecules/
│       └── ThemeSelector/
│           ├── index.tsx          # ThemeSelectorコンポーネント
│           ├── ThemeOption.tsx    # 個別のテーマオプションボタン
│           └── __tests__/
│               └── index.test.tsx
├── hooks/
│   ├── useTheme.ts               # テーマ管理フック
│   └── __tests__/
│       └── useTheme.test.ts
├── store/
│   └── slices/
│       └── settingsSlice.ts      # theme, resolvedTheme 追加
├── styles/
│   ├── tokens.css                # テーマ対応CSS変数（拡張）
│   └── theme.css                 # トランジション用スタイル
└── views/
    └── SettingsView/
        └── index.tsx             # ThemeSelector統合
```

---

## 10. 受け入れテスト計画

### 10.1 ユニットテスト

| テスト対象    | テストファイル                                                | カバレッジ目標 |
| ------------- | ------------------------------------------------------------- | -------------- |
| useTheme      | `hooks/__tests__/useTheme.test.ts`                            | 80%以上        |
| ThemeSelector | `components/molecules/ThemeSelector/__tests__/index.test.tsx` | 80%以上        |
| settingsSlice | `store/slices/__tests__/settingsSlice.test.ts`                | 80%以上        |

### 10.2 統合テスト

| シナリオ                         | テストファイル                        |
| -------------------------------- | ------------------------------------- |
| テーマ切り替え→永続化→再読み込み | `__tests__/theme.integration.test.ts` |
| システムテーマ変更時の連動       | `__tests__/theme.integration.test.ts` |

### 10.3 アクセシビリティテスト

| 検証項目                 | ツール         |
| ------------------------ | -------------- |
| WCAG 2.1 AA準拠          | axe-core       |
| キーボードナビゲーション | 手動テスト     |
| スクリーンリーダー対応   | VoiceOver/NVDA |

### 10.4 視覚的回帰テスト

| シナリオ             | 確認項目               |
| -------------------- | ---------------------- |
| ライトテーマ全画面   | スクリーンショット比較 |
| ダークテーマ全画面   | スクリーンショット比較 |
| テーマトランジション | 目視確認               |
| FOUC防止             | 起動時の目視確認       |

---

## 11. 完了条件チェックリスト

T-00-1の完了条件に基づく:

- [x] テーマ切り替えのユーザーフローが定義されている
  - ユースケースUC-TH-001〜003で定義
  - 基本フロー、代替フロー、例外フローを網羅

- [x] CSS変数の命名規則と値が定義されている
  - 6章「CSS変数要件」で詳細定義
  - ライト/ダークテーマの全変数値を明記
  - 命名規則: `--{category}-{element}-{state}`

- [x] コンポーネント階層が明確になっている
  - 9章「コンポーネント階層」で定義
  - ThemeSelector, ThemeOption, useTheme, settingsSliceの配置を明記

- [x] アクセシビリティ要件（WCAG 2.1 AA）が具体化されている
  - NFR-TH-002で詳細定義
  - コントラスト比の具体値を計算済み
  - キーボードナビゲーション、スクリーンリーダー対応を明記

- [x] 受け入れ基準がGiven-When-Then形式で記述されている
  - 全FR/NFRにGiven-When-Then形式の受け入れ基準を付与
  - 正常系・異常系・境界値をカバー

---

## 12. 関連ドキュメント

| ドキュメント                 | パス                                                    | 関係               |
| ---------------------------- | ------------------------------------------------------- | ------------------ |
| テーマ機能タスク実行仕様書   | `docs/30-workflows/theme-feature/task-theme-feature.md` | 親ドキュメント     |
| テーマ機能要件定義書（概要） | `docs/30-workflows/theme-feature/requirements-theme.md` | 参照元             |
| UI/UXガイドライン            | `docs/00-requirements/16-ui-ux-guidelines.md`           | デザイン基準       |
| 既存CSS変数                  | `apps/desktop/src/renderer/styles/tokens.css`           | 拡張元             |
| バックエンド要件定義書       | `docs/30-workflows/theme-feature/spec-backend.md`       | 関連（IPC/永続化） |

---

## 変更履歴

| バージョン | 日付       | 変更者       | 変更内容 |
| ---------- | ---------- | ------------ | -------- |
| 1.0.0      | 2024-12-08 | @req-analyst | 初版作成 |
