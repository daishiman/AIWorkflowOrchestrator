# デザインシステム UI/UX ガイドライン

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## デザインシステム概要

### Design Tokens の3層構造

| 層                   | 説明                                                | 例                                     |
| -------------------- | --------------------------------------------------- | -------------------------------------- |
| **Primitive Tokens** | 生の値を定義する基礎層                              | `gray-900: #111827`, `spacing-4: 16px` |
| **Semantic Tokens**  | 意味を持つトークン。Primitiveを参照して用途を明確化 | `color-text-primary: gray-900`         |
| **Component Tokens** | コンポーネント固有のトークン。Semanticを参照        | `button-primary-bg: color-primary`     |

### 一貫性の原則

- 同じ意味を持つ要素には同じトークンを適用する
- デザイン決定は必ずトークンを通じて行い、ハードコードを避ける
- Tailwind CSSのユーティリティクラスを基盤とし、カスタムクラスは最小限に留める
- Web版とDesktop版で同一のトークンセットを共有する

### 拡張性の確保

- 新しいコンポーネント追加時は既存トークンの再利用を優先する
- 既存トークンで対応できない場合のみ新規トークンを定義する
- トークン命名は予測可能なパターンに従う（用途-状態-バリアント）
- バージョニングを考慮し、非推奨トークンの移行期間を設ける

---

## Spatial Design Tokens（Knowledge Studio）

### 概要

Knowledge StudioデスクトップアプリではApple Human Interface GuidelinesのSpatial Design原則を取り入れたトークンを定義する。

### Glass Panel効果

| トークン         | 値                         | 用途              |
| ---------------- | -------------------------- | ----------------- |
| `--glass-bg`     | rgba(30,30,30,0.7)         | パネル背景        |
| `--glass-border` | rgba(255,255,255,0.1)      | パネルボーダー    |
| `--glass-blur`   | 20px                       | backdrop-filter値 |
| `--glass-shadow` | 0 8px 32px rgba(0,0,0,0.3) | パネルシャドウ    |

### Dynamic Island

| 要素       | 仕様                                   |
| ---------- | -------------------------------------- |
| 配置       | 画面上部中央                           |
| サイズ     | コンテンツに応じて動的に拡縮           |
| 状態       | idle, loading, success, error, warning |
| アニメ     | 300ms ease-in-out                      |
| 自動非表示 | 成功/エラー時3秒後、警告時5秒後        |

### App Dock

| 要素       | 仕様                                     |
| ---------- | ---------------------------------------- |
| 配置       | 左端固定                                 |
| 幅         | 64px                                     |
| アイテム   | Dashboard, Editor, Chat, Graph, Settings |
| ホバー効果 | Tooltip表示（300ms delay）               |
| 選択状態   | 背景色変更 + 左ボーダーインジケータ      |

---

## カラーシステム

### テーマ切り替え機能

| 項目         | 仕様                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| テーマモード | `kanagawa-dragon`, `light`, `dark`, `system` の4モード                   |
| 解決テーマ   | `system` 選択時は OS 設定に基づき `light` または `dark` を適用           |
| 永続化       | electron-store による設定保存                                             |
| システム連動 | `nativeTheme` API を使用してOS設定に自動追従（`theme:system-changed`）   |
| FOUC防止     | `data-theme` 属性による初期テーマ設定                                     |

### ライトモード / ダークモードの色定義

| 用途                   | ライトモード | ダークモード |
| ---------------------- | ------------ | ------------ |
| 背景（プライマリ）     | `#ffffff`    | `#000000` |
| 背景（セカンダリ）     | `#ffffff`    | `#1c1c1e` |
| 背景（ターシャリ）     | `#f5f5f7`    | `#2c2c2e` |
| 背景（elevated）       | `#ffffff`    | `#1c1c1e` |
| テキスト（プライマリ） | `#000000`    | `#ffffff` |
| テキスト（セカンダリ） | `rgba(0, 0, 0, 0.72)` | `rgba(235, 235, 245, 0.6)` |
| テキスト（ミュート）   | `rgba(0, 0, 0, 0.56)` | `rgba(235, 235, 245, 0.3)` |
| テキスト（ターシャリ） | `rgba(0, 0, 0, 0.42)` | `rgba(235, 235, 245, 0.45)` |
| ボーダー（標準）       | `#d2d2d7`    | `#38383a` |
| ボーダー（強調）       | `#b8b8bf`    | `#48484a` |
| ボーダー（primary）    | `var(--border-default)` | `var(--border-default)` |
| アクセント（primary）  | `#0a6ce9`    | `#0a84ff` |

- Light Mode の標準は「背景 `#ffffff` / 文字 `#000000`」とする。
- accent / danger / selected surface などの強い面だけ inverse text を許可し、それ以外で `text-white` を常態化しない。

### セマンティックカラー

| 種別        | ベース色              | 用途                                 |
| ----------- | --------------------- | ------------------------------------ |
| **Primary** | blue-600 / blue-500   | 主要アクション、リンク、アクティブ   |
| **Success** | green-600 / green-500 | 成功状態、完了、肯定的フィードバック |
| **Warning** | amber-500 / amber-400 | 警告、注意喚起、保留状態             |
| **Error**   | red-600 / red-500     | エラー、危険、破壊的アクション       |
| **Info**    | sky-500 / sky-400     | 情報提供、ヒント、補足説明           |

### アクセシビリティ対応（コントラスト比）

| 要件                       | 最低コントラスト比 | 対象                           |
| -------------------------- | ------------------ | ------------------------------ |
| 通常テキスト（14px未満）   | 4.5:1 以上         | 本文、ラベル、説明文           |
| 大きいテキスト（18px以上） | 3:1 以上           | 見出し、ボタンテキスト         |
| UIコンポーネント           | 3:1 以上           | アイコン、ボーダー、フォーカス |

**確認事項**

- ダークモードでも同等のコントラスト比を維持する
- 色覚多様性への配慮として、色だけでなく形状やテキストでも情報を伝達する
- コントラストチェッカーツールで定期的に検証する

---

## タイポグラフィ

### フォントファミリー（日本語対応）

| 用途                 | フォントスタック                                           |
| -------------------- | ---------------------------------------------------------- |
| UI全般（sans-serif） | Inter, Noto Sans JP, Hiragino Sans, sans-serif             |
| コード（monospace）  | JetBrains Mono, Source Code Pro, Noto Sans Mono, monospace |

**考慮事項**

- 日本語フォントは可変フォント対応のものを優先する
- system-uiフォールバックでOSネイティブフォントも活用する
- ウェブフォントの読み込みは`font-display: swap`を使用する

### フォントサイズスケール

| トークン名 | サイズ          | 用途                 |
| ---------- | --------------- | -------------------- |
| text-xs    | 12px / 0.75rem  | キャプション、バッジ |
| text-sm    | 14px / 0.875rem | 補助テキスト、ラベル |
| text-base  | 16px / 1rem     | 本文、デフォルト     |
| text-lg    | 18px / 1.125rem | 小見出し、強調       |
| text-xl    | 20px / 1.25rem  | セクション見出し     |
| text-2xl   | 24px / 1.5rem   | ページ見出し         |
| text-3xl   | 30px / 1.875rem | 大見出し             |
| text-4xl   | 36px / 2.25rem  | ヒーロー、タイトル   |

### 行間・文字間隔

| 要素               | 行間（line-height）     | 文字間隔（letter-spacing） |
| ------------------ | ----------------------- | -------------------------- |
| 本文（日本語含む） | 1.75（leading-relaxed） | 0.025em                    |
| 見出し             | 1.25-1.4                | -0.025em                   |
| UI要素（ボタン等） | 1.25                    | 0.025em                    |
| コード             | 1.5                     | 0                          |

---

## スペーシングとレイアウト

### 8pxグリッドシステム

- 全てのスペーシングは8pxの倍数を基本とする
- 微調整が必要な場合のみ4pxを許可する
- 1px, 2pxはボーダーやアウトライン専用とする

| トークン    | 値   | 主な用途                       |
| ----------- | ---- | ------------------------------ |
| spacing-0.5 | 2px  | ボーダー内側の微細な隙間       |
| spacing-1   | 4px  | アイコンとテキストの間隔       |
| spacing-2   | 8px  | コンパクトな内部パディング     |
| spacing-3   | 12px | 小要素間のギャップ             |
| spacing-4   | 16px | 標準パディング、要素間隔       |
| spacing-6   | 24px | セクション内のグループ間隔     |
| spacing-8   | 32px | カード・パネルの内部パディング |
| spacing-12  | 48px | セクション間のマージン         |
| spacing-16  | 64px | ページセクション間の大きな間隔 |

### マージン・パディングの規則

| コンテキスト               | 推奨値                                           |
| -------------------------- | ------------------------------------------------ |
| ボタン内部パディング（横） | spacing-4〜spacing-6                             |
| ボタン内部パディング（縦） | spacing-2〜spacing-3                             |
| 入力フィールド内部         | spacing-3（縦）、spacing-4（横）                 |
| カード内部パディング       | spacing-6〜spacing-8                             |
| リスト項目間のギャップ     | spacing-2〜spacing-4                             |
| フォーム項目間のギャップ   | spacing-6                                        |
| ページのサイドパディング   | spacing-4（モバイル）〜spacing-8（デスクトップ） |

### レスポンシブブレイクポイント

| ブレイクポイント | 値     | 対象デバイス                           |
| ---------------- | ------ | -------------------------------------- |
| sm               | 640px  | 大型スマートフォン（横向き）           |
| md               | 768px  | タブレット（縦向き）                   |
| lg               | 1024px | タブレット（横向き）、小型ラップトップ |
| xl               | 1280px | デスクトップ                           |
| 2xl              | 1536px | 大型デスクトップ                       |

**Electron固有の考慮事項**

- 最小ウィンドウサイズは800x600pxを推奨する
- サイドバーの表示/非表示はlg（1024px）を基準とする
- ウィンドウサイズ変更時のレイアウト崩れを防ぐ

---

## Tap & Discover デザイントークン拡張

> 参照: [00-ui-design-foundation.md](../../../docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-ui-design-foundation.md) Task 5C

### マイクロインタラクション用トークン

| トークン | 値 | カテゴリ | 用途 |
|----------|-----|----------|------|
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | イージング | 成功時のバウンスアニメーション |
| `--ease-anticipate` | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` | イージング | 溜めてから跳ねるアニメーション |
| `--scale-hover` | `1.02` | スケール | ホバー時の微拡大 |
| `--scale-active` | `0.97` | スケール | タップ/クリック時の微縮小 |
| `--scale-bounce` | `1.05` | スケール | 成功時のバウンスピーク |

### SuggestionBubble コンポーネントトークン

| トークン | ライトモード | ダークモード | 用途 |
|----------|-------------|-------------|------|
| `--suggestion-bg` | `var(--bg-secondary)` | `var(--bg-secondary)` | バブル背景色 |
| `--suggestion-bg-hover` | `var(--bg-elevated)` | `var(--bg-elevated)` | ホバー時の背景色 |
| `--suggestion-border` | `var(--border)` | `var(--border)` | ボーダー色 |
| `--suggestion-text` | `var(--text-primary)` | `var(--text-primary)` | テキスト色 |
| `--suggestion-icon` | `var(--accent-primary)` | `var(--accent-primary)` | アイコン色 |
| `--suggestion-radius` | `9999px` | `9999px` | 角丸（pill形状） |

### EmptyState mood トークン

| mood | アイコン色 | 背景色 | テキストトーン |
|------|-----------|--------|---------------|
| `welcoming` | `var(--accent-primary)` | `var(--bg-secondary)` | 暖かく迎え入れる |
| `encouraging` | `var(--status-info)` | `var(--bg-secondary)` | 前向きに促す |
| `celebrating` | `var(--status-success)` | `var(--bg-secondary)` | 達成を祝う |

### Workspace QuickFileSearch dialog トークン（TASK-UI-04C）

| トークン / 値 | 用途 | 意図 |
| --- | --- | --- |
| `width: 480px` | desktop dialog width | 候補一覧を 10 件出しても視線移動を増やしすぎない |
| `border-radius: 12px` | dialog radius | preview panel 系と同系統の角丸で統一感を保つ |
| `box-shadow: 0 8px 32px rgba(0,0,0,0.12)` | dialog shadow | 浮遊感は出すが、preview 本体より主張しすぎない |
| scrim + centered sheet | mobile / narrow viewport | overlay close を自然に理解できる層構造を保つ |
| muted path text + bold filename | result row hierarchy | fileName を主、relativePath を従にして探索速度を上げる |

---

## 完了タスク

| タスクID | タスク名 | 完了日 | 概要 |
|----------|----------|--------|------|
| TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 | ライトテーマ token 基盤是正 | 2026-03-11 | `tokens.css` の light baseline を `#ffffff` / `#000000` に是正し、`globals.css` の renderer-wide compatibility bridge と共通 primitives の token 移行で全画面共通の light drift を吸収。Phase 11 screenshot 5件を再取得し、Apple UI/UX 観点で white background / black text を再検証 |
| TASK-UI-00-TOKENS | デザイントークンCSS変数 Apple HIG準拠 light/dark テーマ定義 | 2026-02-22 | tokens.css に `[data-theme="light"]`/`[data-theme="dark"]` セレクタでApple HIG System Colors準拠のカラー定義を追加。マイクロインタラクション変数（ease-bounce/ease-anticipate/scale-hover/scale-active/scale-bounce）、キーフレームアニメーション（success-bounce/error-shake）、renderWithThemeテストヘルパーを作成。28テスト全PASS、カバレッジ100% |
| TASK-UI-00-ATOMS | Atoms共通コンポーネント7種でデザイントークン適用 | 2026-02-23 | 全コンポーネントでCSS変数（`var(--status-primary)`等）を使用、ハードコードカラー0件。EmptyState mood機能でSemanticトークン参照 |
| UT-UI-THEME-DYNAMIC-SWITCH-001 | settingsSlice テーマ動的切替対応 | 2026-02-25 | `ThemeMode` を4モードへ拡張し、settingsSlice / ThemeSelector / IPC（`theme:get-system`, `theme:system-changed`）でテーマ即時反映・OS追従・永続化を実装。Phase 1-12成果物を `docs/30-workflows/completed-tasks/ut-ui-theme-dynamic-switch-001/outputs/` に出力 |
| TASK-UI-04C-WORKSPACE-PREVIEW | Workspace preview quick search dialog | 2026-03-11 | quick search dialog の modal token（480px / 12px / shadow）と result hierarchy を固定し、preview panel と同系統の密度で統一 |

#### TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 実装内容（2026-03-11）

| 観点 | 内容 | 検証 |
| --- | --- | --- |
| Token 契約 | light を white background / black text 基準へ是正し、`--accent-primary` / `--border-primary` を正式 token として固定 | `tokens.light-theme.contract.test.ts` 4/4 PASS |
| Renderer 全画面整合 | `globals.css` に compatibility bridge を追加し、legacy hardcoded neutral class を light mode で white/black 基準へ寄せた | Dashboard / Settings / Auth / Agent の representative screenshot 5件 |
| Primitive 移行 | `Button` / `Input` / `TextArea` / `Checkbox` / `SettingsCard` を semantic token 基準へ寄せ、inverse text は accent surface のみに限定 | `Button.test.tsx` PASS |
| 3テーマ整合 | required token を light / dark / kanagawa 全テーマで定義 | contract test で一括検証 |
| CI 回復 | Dashboard の `--accent` 参照を `--accent-primary` に統一し、shard fail を local 再現して回復した | `pnpm --filter @repo/desktop exec vitest run --shard=11/16` PASS |
| 視覚検証 | Dashboard / Settings / Auth / AgentView + dark baseline を再撮影し、completed workflow 側の capture path と coverage を同期 | Phase 11 screenshot 5件 + coverage validator PASS |
| 残課題分離 | component 側の hardcoded color は current workflow へ切り分け | `docs/30-workflows/light-theme-shared-color-migration/index.md`（`spec_created`）へ引き継ぎ |

#### TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 苦戦箇所（2026-03-11）

| 苦戦箇所 | 再発条件 | 対策 |
| --- | --- | --- |
| token 値だけ直しても全画面の light drift が残る | renderer に `text-white` / `bg-gray-*` / `border-white/*` などの hardcoded neutral class が散在する | `globals.css` の compatibility bridge で全画面の基準を先に固定し、その後に primitives を token へ寄せる |
| CI fail が desktop の一部 shard だけで起きる | broad rerun だけで済ませ、失敗 shard を local で再現しない | `pnpm --filter @repo/desktop exec vitest run --shard=11/16` で再現し、Dashboard の `--accent` drift を局所修正した |
| global light remediation 後に screenshot 証跡が stale になる | token / primitive / bridge の変更後も旧 screenshot を流用する | capture script の workflow root を completed path へ更新し、5件を再取得して validator を再実行した |
| Phase 5-12 成果物不足で実装済みと台帳が乖離する | 実装後に outputs / artifacts 同期を後回しにする | `outputs/phase-5..12` を補完し、`artifacts.json` / `index.md` を同時同期した |
| Phase 11 必須節不足で screenshot coverage 判定がぶれる | `テストケース` / `画面カバレッジマトリクス` を省略する | `phase-11-manual-test.md` に必須節を追記し、`manual-test-result.md` と 1:1 対応にそろえた |
| completed workflow 移管後の follow-up backlog 正本がぶれる | workflow 名参照だけで残課題を管理する | `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/` に task spec を揃え、`audit --target-file` で個別 `currentViolations=0` を確認した |

#### TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 仕様作成追補（2026-03-12）

| 観点 | 内容 |
| --- | --- |
| ステータス | `spec_created`（実装未着手） |
| current workflow | `docs/30-workflows/light-theme-shared-color-migration/index.md` |
| primary targets | `ThemeSelector` / `AuthModeSelector` / `AuthKeySection` / `AccountSection` / `ApiKeysSection` / `AuthView` / `WorkspaceSearchPanel` |
| verification-only | `SettingsView` / `SettingsCard` / `DashboardView` は regression 確認専用 lane |
| 必要 cross-cutting spec | `ui-ux-settings` / `ui-ux-search-panel` / `ui-ux-portal-patterns` / `rag-desktop-state` / `api-ipc-auth` / `api-ipc-system` / `architecture-auth-security` / `security-electron-ipc` / `security-principles` |
| 苦戦箇所 | 旧 unassigned-task の対象を流用すると wrapper shell が P1 化してしまうため、現物監査で inventory correction が必要だった |

#### UT-UI-THEME-DYNAMIC-SWITCH-001 実装時の苦戦箇所

| 苦戦箇所 | 問題 | 対策 |
| --- | --- | --- |
| `themeMode` と `resolvedTheme` の責務混在 | `system` 選択時に保存値と適用値が混線しやすい | `themeMode`（選択値）と `resolvedTheme`（解決値）を分離し、SSOTを `themeMode` に固定 |
| Store Hook依存での再実行ループ | テーマ反映 `useEffect` が再実行され続けるリスク | 合成Hookではなく個別セレクタ（`useThemeMode`/`useResolvedTheme`）で参照を安定化 |
| Phase 12証跡と仕様書本体のズレ | 成果物が揃っても仕様書のチェック欄が未更新で残る | `outputs/phase-12` 実体と `phase-12-documentation.md` を1対1で突合する手順を固定 |

#### UT-UI-THEME-DYNAMIC-SWITCH-001 実装内容（テンプレート準拠要約）

| 観点 | 内容 | 検証観点 |
| --- | --- | --- |
| 状態設計 | `themeMode`（選択値）と `resolvedTheme`（適用値）を分離 | `system` でOS追従しつつ手動切替が競合しないこと |
| UI反映 | ThemeSelector + Store個別セレクタで即時反映 | 依存参照の不安定化による再実行ループがないこと |
| 運用証跡 | Phase 12成果物と実行記録を同時同期 | `outputs/phase-12` と `phase-12-documentation.md` の整合が取れること |

#### StatusIndicator ステータスカラー定義

| status | CSS変数 | ライトモード | ダークモード | 用途 |
|---|---|---|---|---|
| running | `--status-primary` | `#007AFF` | `#0A84FF` | 実行中（パルスアニメーション） |
| success | `--status-success` | `#34C759` | `#30D158` | 成功 |
| error | `--status-error` | `#FF3B30` | `#FF453A` | エラー |
| warning | `--status-warning` | `#FF9500` | `#FF9F0A` | 警告 |
| idle | `--text-tertiary` | `rgba(60,60,67,0.3)` | `rgba(235,235,245,0.3)` | 待機 |
| offline | `--text-disabled` | `rgba(60,60,67,0.18)` | `rgba(235,235,245,0.18)` | オフライン |

#### Atoms デザイントークン使用パターン

```typescript
// CSS変数 + Tailwind arbitrary values パターン
// テーマ切替はCSS変数値差し替えのみ、TSコードにテーマ固有ロジック0件
<div className="bg-[var(--status-primary)] text-[var(--text-muted)]" />

// Record型でバリアント→トークンマッピングを定義
const variantStyles: Record<Variant, string> = {
  default: "bg-[var(--bg-tertiary)]",
  primary: "bg-[var(--status-primary)]",
};
```

### 関連タスク

| タスクID | タスク名 | ステータス | 優先度 | 参照 |
|----------|----------|------------|--------|------|
| UT-UI-THEME-DYNAMIC-SWITCH-001 | settingsSlice テーマ動的切替対応 | 完了（2026-02-25） | 中 | `docs/30-workflows/completed-tasks/ut-ui-theme-dynamic-switch-001.md` |
| TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 | component 側の固定色を token へ移行 | `spec_created` | 高 | `docs/30-workflows/light-theme-shared-color-migration/index.md` |
| TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 | light theme 回帰検知（screenshot運用）を標準化 | 完了（Phase 1-12 完了 / Phase 13 未実施） | 中 | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/` |
| UT-UI-TAILWIND-TOKENS-INTEGRATION-001 | Tailwind CSS カスタムプロパティ統合 | 未実施 | 低 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/ut-ui-tailwind-tokens-integration-001.md` |
| UT-IMP-THEME-DYNAMIC-SWITCH-ROBUSTNESS-001 | テーマ動的切替の再発防止ガード強化 | 未実施 | 中 | `docs/30-workflows/completed-tasks/task-imp-theme-dynamic-switch-robustness-001.md` |

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.5.10 | 2026-03-12 | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 の Phase 1-12 完了を反映。関連タスクテーブルの status を `完了（Phase 1-12 完了 / Phase 13 未実施）` へ更新し、current workflow 正本 `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/` を参照先に切り替えた |
| 1.5.9 | 2026-03-12 | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 の `spec_created` 追補を反映。current workflow、actual target inventory、verification-only lane、settings/search/auth/security まで含む必要 cross-cutting spec を design system 正本へ同期 |
| 1.5.8 | 2026-03-11 | TASK-UI-04C-WORKSPACE-PREVIEW: `Workspace QuickFileSearch dialog` トークンを追加し、480px幅 / 12px radius / 0 8px 32px rgba(0,0,0,0.12) / mobile scrim / filename-path hierarchy を固定 |
| 1.5.7 | 2026-03-11 | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 の global light remediation 追補を反映。white background / black text 基準、renderer-wide compatibility bridge、primitive token 移行、shard 11 再現、screenshot 再取得を design system 正本へ同期した |
| 1.5.6 | 2026-03-11 | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 の completed workflow 同期を反映。light theme token 実装値（`bg/text/border/accent`）と完了タスクを追記し、follow-up 2件の正本導線を `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/` へ統一した |
| 1.5.3 | 2026-02-25 | UT-IMP-THEME-DYNAMIC-SWITCH-ROBUSTNESS-001 を関連タスクへ追加。UT-UI-THEME-DYNAMIC-SWITCH-001 実装時の苦戦箇所（状態責務混在/Hook依存不安定/Phase 12証跡同期）を再発防止タスクとして管理開始 |
| 1.5.2 | 2026-02-25 | UT-UI-THEME-DYNAMIC-SWITCH-001 の実装内容をテンプレート準拠で再編（状態設計/ UI反映/運用証跡の3観点で要約を追加） |
| 1.5.1 | 2026-02-25 | UT-UI-THEME-DYNAMIC-SWITCH-001 の苦戦箇所を追記（`themeMode`/`resolvedTheme` 分離、Store Hook再実行ループ回避、Phase 12証跡同期） |
| 1.5.0 | 2026-02-25 | UT-UI-THEME-DYNAMIC-SWITCH-001完了反映: テーマ切替仕様を4モード（kanagawa-dragon/light/dark/system）へ更新。関連タスクテーブルを完了/未実施の状態管理に変更し、完了タスクセクションへ実装概要を追記 |
| 1.4.0 | 2026-02-23 | TASK-UI-00-ATOMS StatusIndicatorステータスカラー定義追加（6状態のCSS変数マッピング）、Atomsデザイントークン使用パターン追加（CSS変数+Tailwind arbitrary valuesパターン、Record型バリアント→トークンマッピング） |
| 1.3.0 | 2026-02-23 | TASK-UI-00-ATOMS完了: 7コンポーネントでのデザイントークン使用パターン追加（StatusIndicator statusカラー/SuggestionBubble bg-tertiary/EmptyState moodパレット等） |
| 1.2.0 | 2026-02-22 | TASK-UI-00-TOKENS完了: Apple HIG System Colors準拠 light/darkテーマCSS変数定義追加、マイクロインタラクション変数・キーフレームアニメーション定義、renderWithThemeテストヘルパー作成（28テスト全PASS） |
| 1.1.0 | 2026-02-22 | Tap & Discover デザイントークン拡張（マイクロインタラクション、SuggestionBubble、EmptyState mood） |
| 1.0.0 | - | 初版作成 |
