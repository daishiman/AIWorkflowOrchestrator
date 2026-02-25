# UT-UI-THEME-DYNAMIC-SWITCH-001: settingsSlice テーマ動的切替対応 - タスク指示書

## メタ情報

```yaml
issue_number: 870
```

## メタ情報

| 項目        | 内容                                                          |
| ----------- | ------------------------------------------------------------- |
| タスクID    | UT-UI-THEME-DYNAMIC-SWITCH-001                                |
| タスク名    | settingsSlice テーマ動的切替対応                              |
| カテゴリ    | imp（機能実装）                                               |
| 優先度      | 中                                                            |
| 規模        | 中規模                                                        |
| 関連タスク  | TASK-UI-00-TOKENS                                             |
| 発見元      | TASK-UI-00-TOKENS Phase 12（未タスク検出）                    |
| 発見日      | 2026-02-22                                                    |
| 関連Pitfall | P31（Zustand Store Hooks無限ループ）                          |
| 影響範囲    | settingsSlice, ThemeProvider, Main Process, preload, 設定画面 |
| ステータス  | 完了（2026-02-25）                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

- TASK-UI-00-TOKENS で `tokens.css` に3テーマ（`kanagawa-dragon` / `light` / `dark`）のCSS変数セットを定義済み
- `[data-theme="kanagawa-dragon"]`、`[data-theme="light"]`、`[data-theme="dark"]` のセレクタが tokens.css に存在し、31種類のセマンティックCSS変数（`--bg-primary`, `--text-primary`, `--status-primary` 等）がテーマごとに定義されている
- `ui-ux-design-system.md` でテーマ切替仕様（kanagawa-dragon / light / dark / system の4モード、nativeTheme API使用、FOUC防止）が策定済み
- 現状は `kanagawa-dragon` テーマが固定適用されており、ユーザーが `light` / `dark` テーマを選択する手段がない

### 1.2 問題点・課題

- テーマ仕様（3テーマ + system追従の4モード）と実装（kanagawa-dragon固定）が乖離している
- settingsSlice にテーマモード管理の状態が存在しない
- Main Process の `nativeTheme` API を使った OS テーマ追従の仕組みが未実装
- テーマ選択の永続化（`electron-store`）が未実装
- 起動時の FOUC（Flash of Unstyled Content）防止ロジックが未実装

### 1.3 放置した場合の影響

- Apple HIG準拠で追加したライト/ダークテーマが実利用不能のまま残り、tokens.css の3テーマ定義が死コードになる
- テーマ関連の未タスクが継続的に再検出され、Phase 12 の未タスク検出で毎回報告される
- UI一貫性検証（色・コントラスト・状態色）を3テーマで実施できず、テーマ固有のバグが潜在化する
- ユーザーが macOS のライト/ダーク設定と異なるテーマを強制され、UX品質が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

`kanagawa-dragon` | `light` | `dark` | `system` の4モードを設定画面から切替可能にし、再起動後も選択を保持する。`system` 選択時は macOS の `nativeTheme` に追従する。

### 2.2 最終ゴール

- 設定画面にテーマ選択UIが表示され、4モードから選択できる
- 選択したテーマが即座に画面全体に反映される（`document.documentElement` の `data-theme` 属性が変更される）
- `system` モード選択時に macOS のライト/ダーク設定に自動追従する
- テーマ選択が `electron-store` に永続化され、アプリ再起動後も復元される
- 初期描画で FOUC が発生しない

### 2.3 スコープ

#### 含むもの

- `ThemeMode` 型定義（`"kanagawa-dragon" | "light" | "dark" | "system"`）の作成
- settingsSlice へのテーマ状態管理追加（`themeMode`, `resolvedTheme`, 切替アクション）
- 個別セレクタ Hooks の作成（`useThemeMode()`, `useSetThemeMode()`, `useResolvedTheme()`）
- ThemeProvider コンポーネント（`data-theme` 属性の同期、FOUC防止）
- Main Process での `nativeTheme.on("updated")` 監視と IPC 通知
- Preload 経由の安全なテーマ変更通知チャンネル
- 設定画面のテーマ選択UI（ラジオボタンまたはセグメントコントロール）
- `electron-store` へのテーマ選択永続化
- テーマ切替トランジションアニメーション（`html.theme-transition` クラスの活用）
- 単体テスト・コンポーネントテスト

#### 含まないもの

- tokens.css のCSS変数定義変更（TASK-UI-00-TOKENS で定義済み）
- 新規テーマの追加（既存3テーマの切替のみ）
- Tailwind CSS との tokens 統合（UT-UI-TAILWIND-TOKENS-INTEGRATION-001 で対応）
- テーマごとのカスタムカラー設定機能

### 2.4 成果物

| 成果物                        | パス                                                                        |
| ----------------------------- | --------------------------------------------------------------------------- |
| ThemeMode 型定義              | `packages/shared/src/ui/theme-types.ts`                                     |
| settingsSlice テーマ拡張      | `apps/desktop/src/renderer/stores/slices/settingsSlice.ts`                  |
| 個別セレクタ Hooks            | `apps/desktop/src/renderer/stores/selectors/settingsSelectors.ts`           |
| ThemeProvider コンポーネント  | `apps/desktop/src/renderer/components/atoms/ThemeProvider.tsx`              |
| テーマ設定 IPC ハンドラ       | `apps/desktop/src/main/ipc/themeHandlers.ts`                                |
| Preload テーマ API            | `apps/desktop/src/preload/theme-api.ts`                                     |
| テーマ選択 UI                 | `apps/desktop/src/renderer/components/organisms/settings/ThemeSelector.tsx` |
| テストファイル群              | `apps/desktop/src/renderer/tests/theme/`                                    |
| Phase 1-12 ワークフロー成果物 | `docs/30-workflows/completed-tasks/ut-ui-theme-dynamic-switch-001/`         |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-UI-00-TOKENS（tokens.css Apple HIG準拠テーマ定義）が完了していること ✅
- tokens.css に `[data-theme="kanagawa-dragon"]`, `[data-theme="light"]`, `[data-theme="dark"]` の3テーマセレクタが定義されていること ✅
- テーマ横断テストヘルパー（`renderWithTheme`, `renderWithAllThemes`）が `testing-component-patterns.md` に定義されていること ✅

### 3.2 依存タスク

| タスクID                              | ステータス | 依存内容                         |
| ------------------------------------- | ---------- | -------------------------------- |
| TASK-UI-00-TOKENS                     | 完了 ✅    | tokens.css 3テーマCSS変数定義    |
| UT-UI-TAILWIND-TOKENS-INTEGRATION-001 | 未実施     | 並行実施可能（本タスクとは独立） |

### 3.3 必要な知識

- Zustand Store / Slice パターン（`arch-state-management.md` 参照）
- 個別セレクタ設計（P31対策、`useXxx()` / `useSetXxx()` パターン）
- Electron `nativeTheme` API（`electron.nativeTheme.shouldUseDarkColors`, `nativeTheme.on("updated")`)
- IPC 通信（`ipcMain.handle` / `contextBridge` / `safeInvoke` / `safeOn`）
- CSS `data-theme` 属性セレクタとカスケード優先順位
- `electron-store` による設定永続化
- P39準拠テストパターン（happy-dom 環境では `fireEvent` を使用）

### 3.4 推奨アプローチ

#### Step 1: 型と状態（settingsSlice 拡張）

1. `packages/shared/src/ui/theme-types.ts` に `ThemeMode` 型を定義
2. settingsSlice に `themeMode: ThemeMode`（ユーザー選択値）と `resolvedTheme: "kanagawa-dragon" | "light" | "dark"`（実際の適用テーマ）を追加
3. `setThemeMode(mode: ThemeMode)` アクションを定義
4. 個別セレクタ `useThemeMode()`, `useSetThemeMode()`, `useResolvedTheme()` を作成

#### Step 2: Main Process / Preload 連携

1. Main Process で `nativeTheme.on("updated")` を監視し、OS テーマ変更を検知
2. IPC チャンネル `theme:get-system`, `theme:system-changed` を定義（`IPC_CHANNELS` 定数に追加）
3. Preload で `safeInvoke` / `safeOn` 経由のテーマ API を公開
4. `system` モード選択時のみ OS テーマ通知を Renderer に伝達

#### Step 3: ThemeProvider コンポーネント

1. `ThemeProvider` を作成し、`resolvedTheme` に基づいて `document.documentElement.setAttribute("data-theme", resolvedTheme)` を実行
2. 初回マウント時に `electron-store` から保存値を読み込み、FOUC を防止
3. テーマ切替時に `html.theme-transition` クラスを一時的に付与（300ms後に除去）

#### Step 4: 設定画面UI

1. ThemeSelector コンポーネントを作成（4モードのセグメントコントロール）
2. 各テーマのプレビュー表示（カラーサンプル）
3. `system` モード選択時に現在の OS テーマを表示

#### Step 5: 永続化

1. `electron-store` にテーマ設定キー `theme.mode` を追加
2. 起動時に保存値を読み込み、settingsSlice に反映
3. テーマ変更時に `electron-store` に自動保存

### 3.5 実装課題と解決策（TASK-UI-00-TOKENSからの教訓）

#### 課題1: CSS変数カスケードの優先順位

- **問題**: `:root` で定義したセマンティックカラーが `[data-theme]` セレクタで上書きされる設計になっている。テーマ切替時に `data-theme` 属性を正しく設定しないと `:root` のフォールバック値（Slate系のダークモードデフォルト）が使われ、意図しないテーマが表示される
- **根本原因**: CSS の詳細度（specificity）で `[data-theme]` は `:root` より高いが、属性が未設定の場合は `:root` のみが適用される。tokens.css の `:root` にはSlate系ダークモードのセマンティックカラーが定義されているため、`data-theme` 未設定 = 「どのテーマでもない中間状態」が表示される
- **解決策**: 起動時に `document.documentElement.setAttribute("data-theme", savedTheme)` を最初期に実行し、FOUC を防止する。Preload スクリプト内、または `index.html` の `<script>` タグで `electron-store` から直接読み込んで適用する
- **参照**: `tokens.css` レイヤー設計（`:root` → `[data-theme="light"]` → `[data-theme="dark"]` → `[data-theme="kanagawa-dragon"]`）

#### 課題2: P31（Zustand無限ループ）再発リスク

- **問題**: settingsSlice にテーマ切替機能を追加する際、合成Store Hook（`useSettingsStore()`）を使うと `useEffect` 依存配列で無限ループが発生する
- **根本原因**: 合成 Hook は毎回新しいオブジェクトを返すため、`useEffect` が無限に再実行される（P31パターン）。テーマ切替のように `useEffect` 内で DOM 操作（`setAttribute`）を行う場合、この問題が特に顕在化しやすい
- **解決策**: 個別セレクタ（`useThemeMode()`, `useSetThemeMode()`, `useResolvedTheme()`）を新規作成し、Zustand アクション参照の安定性を保証する。`useEffect` の依存配列には個別セレクタの返値のみを含める
- **参照**: `.claude/rules/06-known-pitfalls.md` P31、UT-STORE-HOOKS-COMPONENT-MIGRATION-001（先行事例）

```typescript
// ❌ 無限ループリスク（合成Hook使用）
const { themeMode, setThemeMode } = useSettingsStore();
useEffect(() => {
  document.documentElement.setAttribute("data-theme", resolvedTheme);
}, [resolvedTheme]); // resolvedThemeが毎回新しい参照

// ✅ 安全（個別セレクタ使用）
const resolvedTheme = useResolvedTheme();
useEffect(() => {
  document.documentElement.setAttribute("data-theme", resolvedTheme);
}, [resolvedTheme]); // プリミティブ値なので安定
```

#### 課題3: 3テーマ変数セットの整合性維持

- **問題**: tokens.css で全31セマンティック変数が3テーマ全てに定義されている必要がある。1変数でも欠落すると CSS が `:root` のフォールバック値を使い、テーマが部分的に混在する。現状 `[data-theme="dark"]` は `color-scheme: dark` のみ定義されており、セマンティック変数が未定義（`:root` のデフォルトにフォールバック）
- **根本原因**: CSS には「全テーマで同じ変数セットを強制する」仕組みがない。テーマ追加時に変数の定義漏れを検出できない
- **解決策**: `renderWithAllThemes` テストヘルパーで3テーマ横断検証を自動化する。変数追加時は3テーマ分を同時に追加する。`[data-theme="dark"]` のセマンティック変数を定義する作業が本タスクのスコープに含まれる可能性がある（Phase 1 で確認）
- **参照**: TASK-UI-00-TOKENS Phase 10 Task 10-2（3テーマ整合性レビュー）

#### 課題4: text-muted WCAG準拠の例外

- **問題**: `--text-muted`（Apple HIG tertiaryLabel 相当）は WCAG AA 4.5:1 コントラスト比基準を満たさない
- **解決策**: テーマ設定UI内で `--text-muted` を主要テキストに使用しない。使用箇所を「装飾的テキスト」「プレースホルダー」「非活性ラベル」に限定し、テストで制約を文書化する
- **参照**: TASK-UI-00-TOKENS Phase 10 Task 10-3

### 3.6 システム仕様書参照テーブル

| 仕様書                          | 参照セクション                                      | 用途                                  |
| ------------------------------- | --------------------------------------------------- | ------------------------------------- |
| `ui-ux-design-system.md`        | テーマ切替仕様・4モード定義・永続化方式（行73-94）  | テーマ設計の正本                      |
| `arch-state-management.md`      | Zustand Slice 設計原則・既存 Slice 一覧（行33-100） | settingsSlice 拡張設計                |
| `testing-component-patterns.md` | テーマ横断テストヘルパー（行690-718）               | renderWithTheme / renderWithAllThemes |
| `security-api-electron.md`      | IPC セキュリティ原則                                | nativeTheme API・IPC 経由テーマ通知   |
| `task-workflow.md`              | 残課題テーブル（行876）                             | 本タスクのエントリ                    |

---

## 4. 実行手順

### Phase 構成

| Phase | 名称                         | 目的                                                             |
| ----- | ---------------------------- | ---------------------------------------------------------------- |
| 1     | 要件定義                     | tokens.css のテーマ変数定義状況確認・dark テーマ変数欠落の調査   |
| 2     | 設計                         | settingsSlice 拡張設計・IPC チャンネル設計・ThemeProvider 設計   |
| 3     | 設計レビュー                 | レビューゲート（PASS/MINOR/MAJOR）                               |
| 4     | テスト作成                   | settingsSlice テスト・ThemeProvider テスト・IPC テスト設計・作成 |
| 5     | 実装                         | settingsSlice 拡張・ThemeProvider・IPC ハンドラ・設定 UI 実装    |
| 6-7   | テスト拡充・カバレッジ       | カバレッジ基準充足確認（Line 80%+, Branch 60%+, Function 80%+）  |
| 8-9   | リファクタリング・品質検証   | コード品質改善・Lint・型チェック・全テスト実行                   |
| 10-13 | レビュー・ドキュメント・完了 | 最終レビュー・手動テスト・仕様書更新・PR 準備                    |

### Phase 1: 要件定義

#### 目的

tokens.css の3テーマ定義状況を確認し、dark テーマの変数欠落を調査。テーマ切替に必要な全要件を確定する。

#### 手順

1. `tokens.css` の `[data-theme="dark"]` セクションを確認し、セマンティック変数の欠落箇所を特定する
2. `[data-theme="kanagawa-dragon"]` と `[data-theme="light"]` の変数セットを比較し、dark テーマに追加すべき変数を一覧化する
3. `ui-ux-design-system.md` のテーマ切替仕様（行73-94）と照合し、要件の過不足を確認する
4. `nativeTheme` API の動作確認（`shouldUseDarkColors` の返値パターン）

#### 成果物

- テーマ変数欠落調査レポート
- テーマ切替要件定義書

#### 完了条件

- [ ] 3テーマ全てのセマンティック変数セットが特定されている
- [ ] `[data-theme="dark"]` の変数欠落箇所が一覧化されている
- [ ] テーマ切替の全要件（4モード・永続化・FOUC防止・system追従）が確定している

### Phase 4-5: テスト作成・実装

#### 目的

TDD サイクルに従い、テスト先行でテーマ切替機能を実装する。

#### 手順

1. settingsSlice テーマ拡張テストを作成（Red）
   - `ThemeMode` 型の4値テスト
   - `setThemeMode` アクションテスト
   - `resolvedTheme` 解決ロジックテスト（`system` → OS設定に応じた解決）
2. 個別セレクタテストを作成（Red）
   - `useThemeMode()` / `useSetThemeMode()` / `useResolvedTheme()` の安定性テスト
3. ThemeProvider テストを作成（Red）
   - `data-theme` 属性の同期テスト
   - テーマ切替トランジションテスト
   - FOUC 防止テスト
4. 実装（Green）
   - settingsSlice 拡張
   - 個別セレクタ追加
   - ThemeProvider コンポーネント
   - IPC ハンドラ・Preload API
   - 設定画面 ThemeSelector UI
5. リファクタリング

#### 成果物

- `packages/shared/src/ui/theme-types.ts`
- `apps/desktop/src/renderer/stores/slices/settingsSlice.ts`（拡張）
- `apps/desktop/src/renderer/stores/selectors/settingsSelectors.ts`（追加）
- `apps/desktop/src/renderer/components/atoms/ThemeProvider.tsx`
- `apps/desktop/src/main/ipc/themeHandlers.ts`
- `apps/desktop/src/preload/theme-api.ts`
- `apps/desktop/src/renderer/components/organisms/settings/ThemeSelector.tsx`
- テストファイル群

#### 完了条件

- [ ] settingsSlice に `themeMode` / `resolvedTheme` が追加されている
- [ ] 個別セレクタが P31 対策済みで作成されている
- [ ] ThemeProvider が `data-theme` 属性を同期している
- [ ] IPC 経由で OS テーマ変更通知が Renderer に到達する
- [ ] 設定画面から4モードを選択できる
- [ ] 全テストが PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 設定画面から `kanagawa-dragon` / `light` / `dark` / `system` の4モードを選択できる
- [ ] テーマ選択が即座に画面全体に反映される（`data-theme` 属性変更）
- [ ] `system` モード選択時に macOS のライト/ダーク設定に自動追従する
- [ ] テーマ選択が `electron-store` に永続化される
- [ ] アプリ再起動後にテーマ選択が復元される
- [ ] 初期描画で FOUC が発生しない
- [ ] テーマ切替時にスムーズなトランジションが適用される（`html.theme-transition`）
- [ ] `[data-theme="dark"]` のセマンティック変数が全て定義されている（31変数）

### 品質要件

- [ ] Line Coverage 80% 以上
- [ ] Branch Coverage 60% 以上
- [ ] Function Coverage 80% 以上
- [ ] ESLint エラー 0 件
- [ ] TypeScript 型チェックエラー 0 件
- [ ] P31（Zustand 無限ループ）が発生しないことをテストで検証済み
- [ ] P39 準拠（happy-dom 環境で `fireEvent` を使用）
- [ ] `renderWithAllThemes` で3テーマ横断検証が PASS

### ドキュメント要件

- [ ] 実装ガイド Part 1（中学生レベル概念説明 — 日常例え必須）
- [ ] 実装ガイド Part 2（開発者向け実装詳細）
- [ ] コンポーネントドキュメント（ThemeProvider, ThemeSelector）
- [ ] システム仕様書更新（`ui-ux-design-system.md`, `arch-state-management.md` 等）
- [ ] `documentation-changelog.md`

---

## 6. 検証方法

### テストケース

| #   | カテゴリ      | テスト内容                                           | 期待結果                                                           |
| --- | ------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | settingsSlice | `setThemeMode("light")` を実行                       | `themeMode` が `"light"`、`resolvedTheme` が `"light"`             |
| 2   | settingsSlice | `setThemeMode("system")` を実行（OS=dark）           | `themeMode` が `"system"`、`resolvedTheme` が `"dark"`             |
| 3   | settingsSlice | `setThemeMode("system")` を実行（OS=light）          | `themeMode` が `"system"`、`resolvedTheme` が `"light"`            |
| 4   | セレクタ      | `useThemeMode()` を `useEffect` 依存配列に含めて使用 | 無限ループが発生しない（P31検証）                                  |
| 5   | セレクタ      | `useSetThemeMode()` の参照安定性                     | 複数レンダー間で同一参照                                           |
| 6   | ThemeProvider | `resolvedTheme` が `"light"` に変化                  | `document.documentElement.getAttribute("data-theme")` が `"light"` |
| 7   | ThemeProvider | テーマ切替実行                                       | `html.theme-transition` クラスが一時的に付与される                 |
| 8   | ThemeProvider | 初回マウント時                                       | FOUC なしで `data-theme` が設定される                              |
| 9   | IPC           | `theme:get-system` 呼び出し                          | 現在の OS テーマ（`"light"` or `"dark"`）が返る                    |
| 10  | IPC           | OS テーマ変更イベント発火                            | `theme:system-changed` で Renderer に通知される                    |
| 11  | 永続化        | テーマ変更後にアプリ再起動                           | `electron-store` の値が復元される                                  |
| 12  | 3テーマ横断   | `renderWithAllThemes` で全テーマをレンダリング       | 3テーマ全てでレイアウト崩れなし                                    |
| 13  | UI            | 設定画面で4モード選択                                | 各モードの選択が正しく反映される                                   |

### 検証手順

1. settingsSlice テスト: `cd apps/desktop && pnpm vitest run src/renderer/stores/slices/settingsSlice.test.ts`
2. ThemeProvider テスト: `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/ThemeProvider.test.tsx`
3. セレクタテスト: `cd apps/desktop && pnpm vitest run src/renderer/stores/selectors/settingsSelectors.test.ts`
4. テーマ横断テスト: `cd apps/desktop && pnpm vitest run src/renderer/tests/theme/`
5. カバレッジ確認: `cd apps/desktop && pnpm vitest run --coverage src/renderer/tests/theme/`
6. 品質検証: `pnpm lint && pnpm typecheck`
7. 手動テスト: 設定画面から4モード切替を実施、OS テーマ変更時の追従を確認

---

## 7. リスクと対策

| リスク                                  | 影響度 | 発生確率 | 対策                                                                                                                                |
| --------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| FOUC（初期描画時のテーマ未適用）        | 高     | 中       | Preload スクリプトまたは `index.html` の `<script>` で `electron-store` から直接読み込み、`data-theme` を最速で設定する             |
| P31 再発（Zustand 無限ループ）          | 高     | 中       | 個別セレクタ（`useThemeMode()` 等）を必ず使用。合成 Store Hook を `useEffect` 依存配列に含めない。テストで無限ループ不発生を検証    |
| `[data-theme="dark"]` 変数欠落          | 中     | 高       | Phase 1 で3テーマの変数セット差分を調査。`renderWithAllThemes` で全テーマの整合性を自動検証                                         |
| system 通知と手動切替の競合更新         | 中     | 中       | `themeMode` を SSOT（Single Source of Truth）とし、`system` モード時のみ OS 通知を `resolvedTheme` に反映する優先順位ルールを明確化 |
| 既存 kanagawa-dragon 固定前提の UI 崩れ | 中     | 低       | 既存テーマの回帰テストを維持。`renderWithAllThemes` でレイアウト崩れを検出                                                          |
| IPC チャンネル追加時の P44 パターン再発 | 中     | 低       | 新規 IPC チャンネルは `IPC_CHANNELS` 定数に追加し、P42準拠3段バリデーションを適用。`ipc-contract-checklist.md` Phase 1-6 を実施     |

---

## 8. 参照情報

### 関連仕様書

| 仕様書                          | 関連セクション                                                              |
| ------------------------------- | --------------------------------------------------------------------------- |
| `ui-ux-design-system.md`        | テーマ切替仕様・4モード定義・永続化方式                                     |
| `arch-state-management.md`      | Zustand Slice 設計原則・P31 対策                                            |
| `testing-component-patterns.md` | テーマ横断テストヘルパー（renderWithTheme / renderWithAllThemes）・P39 準拠 |
| `security-api-electron.md`      | nativeTheme API・IPC 経由テーマ通知                                         |
| `task-workflow.md`              | 残課題テーブル（UT-UI-THEME-DYNAMIC-SWITCH-001 エントリ）                   |

### 関連タスク

| タスクID                               | 関連内容                                       |
| -------------------------------------- | ---------------------------------------------- |
| TASK-UI-00-TOKENS                      | 親タスク（tokens.css Apple HIG準拠テーマ定義） |
| UT-UI-TAILWIND-TOKENS-INTEGRATION-001  | 兄弟タスク（Tailwind 統合）                    |
| UT-FIX-STORE-HOOKS-INFINITE-LOOP-001   | P31 対策の先行事例                             |
| UT-STORE-HOOKS-COMPONENT-MIGRATION-001 | 個別セレクタ移行の先行事例                     |

### 関連 Pitfall

| Pitfall | タイトル                                        | 本タスクでの適用                           |
| ------- | ----------------------------------------------- | ------------------------------------------ |
| P31     | Zustand Store Hooks 無限ループ                  | settingsSlice の個別セレクタ必須使用       |
| P39     | happy-dom 環境での userEvent 非互換             | テストで `fireEvent` を使用                |
| P42     | 文字列引数の `.trim()` バリデーション漏れ       | IPC ハンドラの3段バリデーション            |
| P44     | IPC ハンドラと Preload のインターフェース不整合 | 新規 IPC チャンネルの契約整合性確認        |
| P5      | リスナー二重登録                                | `nativeTheme.on("updated")` のリスナー管理 |

### 参考ファイル

- `apps/desktop/src/renderer/styles/tokens.css` — 3テーマ CSS 変数定義
- `.claude/rules/06-known-pitfalls.md` — P31, P39, P42, P44 の詳細
- `.claude/rules/03-state-management.md` — Zustand 設計原則

---

## 9. 備考

### レビュー指摘原文

TASK-UI-00-TOKENS Phase 12（未タスク検出）にて検出:

> settingsSlice にテーマ動的切替対応が未実装。tokens.css の3テーマ定義（kanagawa-dragon / light / dark）は完了しているが、ユーザーが設定画面からテーマを切り替える機能が存在しない。system モード（OS 追従）を含む4モードの実装が必要。

### 補足事項

- `[data-theme="dark"]` セクションは現状 `color-scheme: dark` のみ定義されている。本タスクの Phase 1 で、31セマンティック変数の追加が必要かどうかを判断する。追加が必要な場合はスコープに含める
- UT-STORE-HOOKS-COMPONENT-MIGRATION-001（個別セレクタ移行の先行事例）で確立された53個の個別セレクタパターンを参考にする
- テーマ切替のトランジションは tokens.css の `html.theme-transition` ルール（`--duration-normal` = 300ms）を活用する
- `electron-store` のキー設計は既存の設定永続化パターンに従う
- IPC チャンネル追加時は `ipc-contract-checklist.md` Phase 1-6 を必ず実施する
