# UT-UI-TAILWIND-TOKENS-INTEGRATION-001: Tailwind CSS カスタムプロパティ統合

## メタ情報

```yaml
issue_number: 876
```

## メタ情報

| 項目        | 値                                                                                   |
| ----------- | ------------------------------------------------------------------------------------ |
| タスクID    | UT-UI-TAILWIND-TOKENS-INTEGRATION-001                                                |
| タスク名    | Tailwind CSS カスタムプロパティ統合                                                  |
| カテゴリ    | ref（リファクタリング）                                                              |
| 優先度      | 低                                                                                   |
| 規模        | 中規模                                                                               |
| 関連タスク  | TASK-UI-00-TOKENS, UT-UI-THEME-DYNAMIC-SWITCH-001                                    |
| 発見元      | TASK-UI-00-TOKENS Phase 12（未タスク検出）                                           |
| 関連Pitfall | なし（CSS/Tailwind固有課題）                                                         |
| 影響範囲    | `apps/desktop/tailwind.config.js`, `apps/desktop/src/renderer/` 配下UIコンポーネント |
| ステータス  | 未実施                                                                               |

## 2. Why（なぜ必要か）

### 背景

TASK-UI-00-TOKENS で `tokens.css` にプリミティブ・セマンティック・テーマ別の3層CSS変数体系が整備された。しかし、現在のUIコンポーネントはCSS変数をインラインスタイル（`style={{ color: 'var(--text-primary)' }}`）で直接参照しており、Tailwindユーティリティクラスとして利用できない状態にある。

### 問題点

1. **スタイル指定の二重管理**: Tailwindユーティリティ（`bg-slate-900` 等）とインラインCSS変数参照が混在し、コンポーネントごとに記述方法が分散している
2. **検索性・保守性の低下**: インラインスタイルは `className` と異なりグローバル検索やリファクタリングツールの恩恵を受けにくい
3. **テーマ切替時の品質検証コスト増大**: Tailwindクラスとインラインスタイルの2系統を両方検証する必要があり、テスト対象が倍増する

### 放置時の影響

- コンポーネント間でスタイル指定方法が統一されず、新規メンバーのオンボーディングコストが上がる
- テーマ切替バグの発生時、インラインスタイルとTailwindクラスの両系統を調査する必要がある
- `tokens.css` で定義したセマンティックトークンとコンポーネント実装の対応関係が不明瞭になる

## 3. What（何を達成するか）

### 目的

`tokens.css` のセマンティックCSS変数を `tailwind.config.js` の `theme.extend` にマッピングし、`bg-surface-primary` / `text-content-primary` / `border-stroke-default` のようなTailwindユーティリティクラスで参照できるようにする。

### ゴール

- 主要セマンティックカラー（bg/text/border/status）がTailwindクラスとして利用可能
- テーマ切替時（dark / light / kanagawa-dragon）にTailwindクラス経由でも色が正しく変化する
- 代表的コンポーネント（1-2件）でインラインスタイル→Tailwindクラス移行の実証を完了する

### スコープ

#### 含む

- `tailwind.config.js` の `theme.extend.colors` にCSS変数参照（`var(--bg-primary)` 等）を追加
- 主要セマンティックカラー（bg 6種 / text 4種 / border 3種 / status 10種）のTailwindマッピング
- 代表的コンポーネント（1-2件）でのインラインスタイル→Tailwindクラス移行検証
- spacing / radius / shadow の段階的導入検討（設計のみ、本タスクでの実装は bg/text/border/status に限定）

#### 含まない

- 全コンポーネントの一括クラス置換（本タスクは段階的移行の初手のみ）
- Tailwindプラグインの独自開発
- CSSモジュールとの統合
- `tokens.css` 自体の変数定義の変更

### 成果物

| 成果物                            | パス                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------- |
| 更新済 Tailwind 設定ファイル      | `apps/desktop/tailwind.config.js`                                            |
| マッピング設計ドキュメント        | `docs/30-workflows/TASK-UI-TAILWIND-TOKENS/phase-2-design.md`                |
| 移行検証済コンポーネント（1-2件） | `apps/desktop/src/renderer/components/` 配下                                 |
| テストコード                      | `apps/desktop/src/renderer/tests/` 配下                                      |
| 実装ガイド                        | `docs/30-workflows/TASK-UI-TAILWIND-TOKENS/phase-12/implementation-guide.md` |

## 4. How（どのように実行するか）

### 前提条件

- TASK-UI-00-TOKENS が完了し、`tokens.css` に3層CSS変数体系が定義済みであること
- `apps/desktop/tailwind.config.js` が存在し、ビルドが正常に動作すること
- テーマ切替が `data-theme` 属性で動作する仕組みが稼働していること

### 推奨アプローチ

Tailwindの `theme.extend.colors` にCSS変数参照を定義する方式を採用する。

```js
// tailwind.config.js（例）
theme: {
  extend: {
    colors: {
      surface: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        tertiary: 'var(--bg-tertiary)',
        elevated: 'var(--bg-elevated)',
        glass: 'var(--bg-glass)',
        selection: 'var(--bg-selection)',
      },
      content: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        inverse: 'var(--text-inverse)',
      },
      stroke: {
        DEFAULT: 'var(--border-default)',
        emphasis: 'var(--border-emphasis)',
        subtle: 'var(--border-subtle)',
      },
      status: {
        primary: 'var(--status-primary)',
        'primary-hover': 'var(--status-primary-hover)',
        success: 'var(--status-success)',
        'success-hover': 'var(--status-success-hover)',
        warning: 'var(--status-warning)',
        'warning-hover': 'var(--status-warning-hover)',
        error: 'var(--status-error)',
        'error-hover': 'var(--status-error-hover)',
        info: 'var(--status-info)',
        'info-hover': 'var(--status-info-hover)',
      },
    },
  },
}
```

この設計により以下のクラスが生成される:

- 背景: `bg-surface-primary`, `bg-surface-secondary` 等
- 文字: `text-content-primary`, `text-content-secondary` 等
- ボーダー: `border-stroke`, `border-stroke-emphasis` 等
- ステータス: `bg-status-primary`, `text-status-error` 等

### 段階的実行計画

1. **Phase 1-3**: マッピング設計・命名規則確定・設計レビュー
2. **Phase 4-7**: テスト作成 → 設定実装 → カバレッジ確認
3. **Phase 8-10**: リファクタリング → 品質検証 → 最終レビュー
4. **Phase 11**: 手動テスト（3テーマでの色反映確認）
5. **Phase 12-13**: ドキュメント → 完了

### 3.5 実装課題と解決策（TASK-UI-00-TOKENSからの教訓）

#### 課題1: CSS変数のレイヤー構造とTailwindの統合ポイント

- **問題**: `tokens.css` は3レイヤー設計（`:root` プリミティブ → `[data-theme]` セマンティック → コンポーネント）で構成されており、Tailwindの `theme.extend.colors` にどのレイヤーを橋渡しすべきか判断が必要
- **根本原因**: Tailwindはビルド時に静的なCSSを生成するが、CSS変数はランタイムで値が変わるため、`var(--bg-primary)` のようなCSS変数参照をTailwind設定に含めるアプローチが必要
- **解決策**: `theme.extend.colors` にCSS変数参照を定義する（例: `primary: 'var(--bg-primary)'`）。これによりTailwindのJIT modeで `bg-surface-primary` ユーティリティクラスが生成され、テーマ切替時に自動的に色が変わる。セマンティックレイヤー（`--bg-*`, `--text-*`, `--border-*`, `--status-*`）のみをマッピング対象とし、プリミティブレイヤー（`--color-slate-*` 等）は直接マッピングしない
- **参照**: `tokens.css` `:root` セクション

#### 課題2: 既存Tailwindカラー名との命名衝突

- **問題**: Tailwindのデフォルトパレットには `blue`, `green`, `red` 等が存在し、`tokens.css` の `--status-primary` 等と命名が競合する可能性がある。また単純に `primary` を `theme.extend.colors` に追加すると `bg-primary` のように既存Tailwindユーティリティと意味が重複する
- **解決策**: セマンティック名で名前空間を分離する。具体的には以下の命名設計を採用:
  - 背景色: `surface.primary` → クラス名 `bg-surface-primary`
  - 文字色: `content.primary` → クラス名 `text-content-primary`
  - ボーダー: `stroke.DEFAULT` → クラス名 `border-stroke`
  - ステータス: `status.primary` → クラス名 `bg-status-primary` / `text-status-primary`
- Tailwindのプリミティブカラー（`blue-500` 等）とは別レイヤーで共存させる

#### 課題3: 3テーマ変数セットの整合性とTailwindクラス

- **問題**: 3テーマ（dark / light / kanagawa-dragon）で同一の31変数が定義されているため、Tailwindクラス経由で参照する場合もテーマ切替で正しく色が変わることを保証する必要がある
- **根本原因**: Tailwindは静的クラスを生成するが、CSS変数はランタイムで変化するため、テスト戦略が通常のTailwindテストと異なる
- **解決策**: `renderWithTheme` テストヘルパーを使い、3テーマ全てでTailwindクラス経由の色が正しく適用されることを検証する。各テーマの `data-theme` 属性を切り替えた状態で `getComputedStyle` を確認する
- **参照**: `testing-component-patterns.md` セクション12

## 5. 実行手順

| Phase | 名称             | 実行内容                                                                                                                                                            | 完了条件                                           |
| ----- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 1     | 要件定義         | `tokens.css` の全セマンティック変数（31種）を棚卸しし、Tailwindマッピング対象を確定。既存 `tailwind.config.js` のカラー定義（`macos`, `glass`）との衝突リストを作成 | マッピング対象変数リスト・命名規則ドキュメント完成 |
| 2     | 設計             | `tailwind.config.js` の `theme.extend.colors` 構造を設計。命名規則（`surface-*`, `content-*`, `stroke-*`, `status-*`）を確定。移行対象コンポーネント（1-2件）を選定 | 設計ドキュメント（`phase-2-design.md`）完成        |
| 3     | 設計レビュー     | 命名規則の妥当性、既存クラスとの衝突可能性、`darkMode: "class"` と `data-theme` の関係整理、段階移行計画を検証                                                      | PASS / MINOR / MAJOR 判定                          |
| 4     | テスト作成       | Tailwindクラス生成確認テスト、テーマ切替反映テスト（3テーマ × 代表カラー）、コンポーネント回帰テストのテストケース設計・コード作成                                  | テストコード作成完了（RED状態）                    |
| 5     | 実装             | `tailwind.config.js` の `theme.extend.colors` にセマンティックカラーマッピング追加。移行対象コンポーネントのインラインスタイルをTailwindクラスに置換                | 設定追加・コンポーネント移行完了、テストGREEN      |
| 6     | テスト拡充       | カバレッジ不足箇所（テーマ切替エッジケース、未マッピング変数のフォールバック、hover状態の色変化）のテスト追加                                                       | カバレッジ基準充足                                 |
| 7     | カバレッジ確認   | Line 80%+, Branch 60%+, Function 80%+ を確認                                                                                                                        | 基準達成（未達→Phase 6へ戻る）                     |
| 8     | リファクタリング | 冗長な設定記述の整理、コメント追加、不要なインラインスタイル残骸の除去                                                                                              | コード品質改善完了                                 |
| 9     | 品質検証         | `pnpm lint` / `pnpm typecheck` / 全テスト実行（`pnpm --filter @repo/desktop exec vitest run`）                                                                      | 全チェック PASS                                    |
| 10    | 最終レビュー     | 命名規則の一貫性、テーマ切替動作、既存UIへの影響を多角的に検証                                                                                                      | PASS / MINOR / MAJOR / CRITICAL 判定               |
| 11    | 手動テスト       | 3テーマ全てで移行済コンポーネントの見た目確認。DevTools で `getComputedStyle` による色値検証。`darkMode: "class"` 設定との干渉がないことを確認                      | 3テーマ全て視覚的に正常                            |
| 12    | ドキュメント     | 実装ガイド（Part 1: 概念説明 + Part 2: 実装詳細）、`component-documentation.md`（Tailwindマッピング一覧）、システム仕様書更新、未タスク検出                         | Phase 12チェックリスト全項目完了                   |
| 13    | 完了             | 成果物最終確認・PR準備                                                                                                                                              | PR作成可能状態                                     |

## 6. 完了条件チェックリスト

### 機能要件

- [ ] `tailwind.config.js` の `theme.extend.colors` にセマンティック背景色（`surface`: primary, secondary, tertiary, elevated, glass, selection の6種）のCSS変数参照が定義されている
- [ ] `tailwind.config.js` の `theme.extend.colors` にセマンティック文字色（`content`: primary, secondary, muted, inverse の4種）のCSS変数参照が定義されている
- [ ] `tailwind.config.js` の `theme.extend.colors` にセマンティックボーダー色（`stroke`: DEFAULT, emphasis, subtle の3種）のCSS変数参照が定義されている
- [ ] `tailwind.config.js` の `theme.extend.colors` にステータス色（`status`: primary, primary-hover, success, success-hover, warning, warning-hover, error, error-hover, info, info-hover の10種）のCSS変数参照が定義されている
- [ ] `bg-surface-primary` / `text-content-primary` / `border-stroke` 等のTailwindクラスが生成され、利用可能である
- [ ] テーマ切替（`data-theme="dark"` / `"light"` / `"kanagawa-dragon"`）時にTailwindクラス経由の色が正しく変化する
- [ ] 移行対象コンポーネント（1-2件）のインラインスタイルがTailwindクラスに置換されている
- [ ] 既存テストが全てPASSする（退行なし）

### 品質要件

- [ ] `pnpm lint` がPASS
- [ ] `pnpm typecheck` がPASS
- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上
- [ ] Function Coverage 80%以上
- [ ] Tailwindデフォルトカラー名との衝突がない
- [ ] 既存の `macos` / `glass` カラー定義との名前空間が分離されている

### ドキュメント要件

- [ ] `implementation-guide.md` Part 1（中学生レベル概念説明 — 日常例え必須）作成
- [ ] `implementation-guide.md` Part 2（開発者向け実装詳細）作成
- [ ] `component-documentation.md`（Tailwindマッピング一覧）作成
- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `task-specification-creator/LOGS.md` 更新（**2ファイル両方**）
- [ ] `documentation-changelog.md` 作成
- [ ] `topic-map.md` 再生成

## 7. 検証方法

### テストケース

| #   | テスト対象                    | テスト内容                                                                                                         | 期待結果                                                                                                   |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| 1   | Tailwind設定                  | `theme.extend.colors` に定義した全キー（`surface`, `content`, `stroke`, `status`）がTailwindクラスとして生成される | `bg-surface-primary`, `text-content-primary`, `border-stroke`, `bg-status-error` 等のクラスがCSSに含まれる |
| 2   | テーマ切替（dark）            | `data-theme="dark"` で `bg-surface-primary` クラスの要素の `background-color` を取得                               | `#000000`（Apple Dark systemBackground）                                                                   |
| 3   | テーマ切替（light）           | `data-theme="light"` で `bg-surface-primary` クラスの要素の `background-color` を取得                              | `#ffffff`（Apple Light systemBackground）                                                                  |
| 4   | テーマ切替（kanagawa-dragon） | `data-theme="kanagawa-dragon"` で `bg-surface-primary` クラスの要素の `background-color` を取得                    | kanagawa-dragon-black-1 の値                                                                               |
| 5   | ステータス色                  | `text-status-error` クラスの要素が3テーマ全てで赤系の色を表示                                                      | 各テーマの `--status-error` 値と一致                                                                       |
| 6   | コンポーネント移行            | 移行済コンポーネントがインラインスタイルに `var(--bg-*)` / `var(--text-*)` を使用していない                        | `style` 属性にCSS変数参照が含まれない                                                                      |
| 7   | 既存テスト回帰                | 既存の全テストスイートを実行                                                                                       | 全テストPASS、失敗件数 0                                                                                   |
| 8   | 既存カラー共存                | `macos.blue` / `glass.DEFAULT` 等の既存Tailwindカラーが引き続き利用可能                                            | 既存クラス（`bg-macos-blue`, `bg-glass`）が正常に動作                                                      |

### 検証手順

1. `pnpm --filter @repo/desktop exec vitest run` で全テスト実行（P40対策: 対象パッケージディレクトリから実行）
2. DevTools で各テーマ（dark / light / kanagawa-dragon）に切り替え、移行済コンポーネントの `getComputedStyle` を確認
3. Tailwind の JIT/PurgeCSS が正しくクラスを生成していることを確認（ビルド後のCSS出力を検査）
4. `pnpm lint` / `pnpm typecheck` で静的解析PASS確認

## 8. リスクと対策

| #   | リスク                                         | 影響度 | 発生確率 | 対策                                                                                                                                              |
| --- | ---------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 既存Tailwindクラス名との命名衝突               | 中     | 中       | セマンティック名前空間（`surface-*`, `content-*`, `stroke-*`, `status-*`）で分離。Phase 1 で全衝突リストを作成して事前回避                        |
| 2   | 一括クラス置換による視覚的退行                 | 高     | 低       | 段階移行（1-2コンポーネントのみ）+ 3テーマ全てで手動視覚確認                                                                                      |
| 3   | CSS変数参照とTailwindビルドの互換性問題        | 中     | 低       | Tailwind v3.x の JIT mode はCSS変数参照を正常に処理する。Phase 2 の設計段階でPoC（概念実証）を実施し動作確認                                      |
| 4   | `tokens.css` の変数名変更による設定の同期切れ  | 中     | 低       | トークン正本を `tokens.css` に固定し、`tailwind.config.js` は変数参照のみ。変数名変更時は `grep -rn "var(--" tailwind.config.js` で影響箇所を検出 |
| 5   | PurgeCSS によるクラスの誤削除                  | 高     | 低       | `content` 配列に全テンプレートパスが含まれていることを確認。動的クラス生成がある場合は `safelist` に追加                                          |
| 6   | `darkMode: "class"` と `data-theme` 属性の干渉 | 中     | 中       | Phase 3 の設計レビューで `dark:` バリアントと `data-theme` の関係を整理し、競合しない構成を確認する                                               |

## 9. 参照情報

### 関連仕様書

| 仕様書                          | 関連セクション                                                   |
| ------------------------------- | ---------------------------------------------------------------- |
| `ui-ux-design-system.md`        | Design Tokens 3層構造・カラーシステム                            |
| `testing-component-patterns.md` | テーマ横断テストヘルパー・renderWithTheme（セクション12）        |
| `task-workflow.md`              | 残課題テーブル（UT-UI-TAILWIND-TOKENS-INTEGRATION-001 エントリ） |

### 関連タスク

| タスクID                       | 関連内容                                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| TASK-UI-00-TOKENS              | 親タスク（`tokens.css` 3層CSS変数体系の定義）                                                |
| UT-UI-THEME-DYNAMIC-SWITCH-001 | 兄弟タスク（テーマ動的切替機能。本タスクのTailwindマッピングはテーマ切替と連動して動作する） |

### ファイル参照

| ファイル                                                                            | 用途                                                        |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `apps/desktop/src/renderer/styles/tokens.css`                                       | CSS変数定義の正本（3層構造・31セマンティック変数・3テーマ） |
| `apps/desktop/tailwind.config.js`                                                   | Tailwind設定ファイル（本タスクの主要変更対象）              |
| `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-12/unassigned-task-detection.md` | 本タスク発見時の検出レポート                                |

## 10. 備考

### レビュー指摘原文

TASK-UI-00-TOKENS Phase 12 の未タスク検出にて発見。`tokens.css` のCSS変数体系は完成したが、Tailwindユーティリティクラスとの統合は本タスクのスコープ外として切り出された。

### 補足事項

- 本タスクは「段階的移行の初手」であり、全コンポーネントの一括置換は行わない。移行パターンの確立と実証が目的
- `tailwind.config.js` は現在 `.js` 拡張子で存在する。TypeScript化（`.ts`）は本タスクのスコープ外とする
- 既存の `tailwind.config.js` には `macos` カラー（9色）と `glass` カラー（4段階）が定義済み。これらとの名前空間の整合性に注意が必要
- `darkMode: "class"` が設定されているが、テーマ切替は `data-theme` 属性で行われているため、Tailwindの `dark:` バリアントとの関係をPhase 2-3 で整理する必要がある
- テスト実行時はモノレポのディレクトリ依存に注意（P40対策: `pnpm --filter @repo/desktop exec vitest run` で実行）
- happy-dom環境では `userEvent` ではなく `fireEvent` を使用すること（P39対策）
