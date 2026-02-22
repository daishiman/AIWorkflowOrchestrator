# Phase 1: 要件定義 — TASK-UI-00-TOKENS

## メタ情報

| 項目       | 値                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| Phase      | 1（要件定義）                                                                                               |
| タスクID   | TASK-UI-00-TOKENS                                                                                           |
| タスク名   | デザイントークン・テーマ定義（Apple HIG準拠light/darkテーマ・マイクロインタラクション変数・テストヘルパー） |
| 機能名     | TASK-UI-00-TOKENS                                                                                           |
| 作成日     | 2026-02-22                                                                                                  |
| 優先度     | 最高（全コンポーネントの前提条件）                                                                          |
| 複雑度     | medium                                                                                                      |
| 依存タスク | なし                                                                                                        |
| ブロック   | TASK-UI-00-ATOMS, TASK-UI-00-MOLECULES, TASK-UI-00-ORGANISMS                                                |

## 目的

tokens.css の light/dark テーマを Apple HIG System Colors に全面置き換えし、マイクロインタラクション用CSS変数を追加し、テーマ横断テスト用の `renderWithTheme` テストヘルパーを作成する。本Phaseでは、これらの実装に必要な要件を漏れなく抽出し、検証可能な受け入れ基準を定義する。

## 実行タスク

- 要件抽出: light/darkテーマ、マイクロインタラクション、テストヘルパー要件を定義する
- 受け入れ基準作成: 各要件に対する検証可能なACを定義する
- FR/NFR分類: 実装要件を機能要件と非機能要件に分類する

### Task 1: 要件抽出

#### 1-1. Light テーマカラー要件（Apple HIG System Colors 全面置き換え）

| 要件ID   | カテゴリ | 要件内容                                                                                                                                                                                                  | 根拠                         |
| -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR-L-001 | FR       | `[data-theme="light"]` セレクタで `color-scheme: light` を設定する                                                                                                                                        | Apple HIG Dark Mode ガイド   |
| FR-L-002 | FR       | 背景色を Apple System Background Colors に置き換える: `--bg-primary: #FFFFFF`, `--bg-secondary: #F2F2F7`, `--bg-tertiary: #E5E5EA`                                                                        | Apple HIG Color              |
| FR-L-003 | FR       | `--bg-elevated: #FFFFFF`（elevated surface）を定義する                                                                                                                                                    | Apple HIG Elevation          |
| FR-L-004 | FR       | `--bg-glass: rgba(242, 242, 247, 0.8)`（半透明セカンダリ）を定義する                                                                                                                                      | ui-ux-design-system.md       |
| FR-L-005 | FR       | `--bg-selection: rgba(0, 122, 255, 0.15)`（systemBlue 15%）を定義する                                                                                                                                     | Apple HIG Selection          |
| FR-L-006 | FR       | テキスト色を Apple Label Colors に置き換える: `--text-primary: #000000`, `--text-secondary: rgba(60, 60, 67, 0.6)`, `--text-muted: rgba(60, 60, 67, 0.3)`                                                 | Apple HIG Label Colors       |
| FR-L-007 | FR       | `--text-inverse: #FFFFFF` を定義する                                                                                                                                                                      | 反転テキスト用途             |
| FR-L-008 | FR       | ボーダー色を Apple Separator Colors に置き換える: `--border-default: #C6C6C8`, `--border-emphasis: #AEAEB2`, `--border-subtle: rgba(60, 60, 67, 0.12)`                                                    | Apple HIG Separator          |
| FR-L-009 | FR       | ステータス色を Apple System Tint Colors (Light) に置き換える: systemBlue `#007AFF`, systemGreen `#34C759`, systemOrange `#FF9500`, systemRed `#FF3B30`                                                    | Apple HIG System Colors      |
| FR-L-010 | FR       | ステータスホバー色を定義する: primary `#0056B3`, success `#28A745`, warning `#CC7700`, error `#CC2F26`                                                                                                    | マイクロインタラクション要件 |
| FR-L-011 | FR       | info色を systemIndigo に変更する: `--status-info: #5856D6`, `--status-info-hover: #4240A8`                                                                                                                | Apple HIG System Colors      |
| FR-L-012 | FR       | Syntax Highlighting を Xcode Light 準拠に定義する（keyword `#9B2393`, function `#007AFF`, string `#C41A16`, number `#1C00CF`, constant `#703DAA`, type `#5856D6`, comment `#8E8E93`, variable `#3900A0`） | Xcode Light テーマ           |

#### 1-2. Dark テーマカラー要件（Apple HIG System Colors 新規定義）

| 要件ID   | カテゴリ | 要件内容                                                                                                                                                                                                 | 根拠                         |
| -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR-D-001 | FR       | `[data-theme="dark"]` セレクタで `color-scheme: dark` を設定する                                                                                                                                         | Apple HIG Dark Mode ガイド   |
| FR-D-002 | FR       | 背景色を Apple System Background Colors (Dark) に定義する: `--bg-primary: #000000`, `--bg-secondary: #1C1C1E`, `--bg-tertiary: #2C2C2E`                                                                  | Apple HIG Color (Dark)       |
| FR-D-003 | FR       | `--bg-elevated: #1C1C1E`（elevated surface）を定義する                                                                                                                                                   | Apple HIG Elevation (Dark)   |
| FR-D-004 | FR       | `--bg-glass: rgba(28, 28, 30, 0.8)`（半透明セカンダリ）を定義する                                                                                                                                        | ui-ux-design-system.md       |
| FR-D-005 | FR       | `--bg-selection: rgba(10, 132, 255, 0.25)`（systemBlue 25%）を定義する                                                                                                                                   | Apple HIG Selection (Dark)   |
| FR-D-006 | FR       | テキスト色を Apple Label Colors (Dark) に定義する: `--text-primary: #FFFFFF`, `--text-secondary: rgba(235, 235, 245, 0.6)`, `--text-muted: rgba(235, 235, 245, 0.3)`                                     | Apple HIG Label Colors       |
| FR-D-007 | FR       | `--text-inverse: #000000` を定義する                                                                                                                                                                     | 反転テキスト用途             |
| FR-D-008 | FR       | ボーダー色を Apple Separator Colors (Dark) に定義する: `--border-default: #38383A`, `--border-emphasis: #48484A`, `--border-subtle: rgba(84, 84, 88, 0.36)`                                              | Apple HIG Separator (Dark)   |
| FR-D-009 | FR       | ステータス色を Apple System Tint Colors (Dark) に定義する: systemBlue `#0A84FF`, systemGreen `#30D158`, systemOrange `#FF9F0A`, systemRed `#FF453A`                                                      | Apple HIG System Colors      |
| FR-D-010 | FR       | ステータスホバー色を定義する: primary `#409CFF`, success `#5BD97D`, warning `#FFB840`, error `#FF6961`                                                                                                   | マイクロインタラクション要件 |
| FR-D-011 | FR       | info色を systemIndigo (Dark) に定義する: `--status-info: #5E5CE6`, `--status-info-hover: #7A78EB`                                                                                                        | Apple HIG System Colors      |
| FR-D-012 | FR       | Syntax Highlighting を Xcode Dark 準拠に定義する（keyword `#FC5FA3`, function `#0A84FF`, string `#FC6A5D`, number `#D0BF69`, constant `#A167E6`, type `#5E5CE6`, comment `#7F8C98`, variable `#67B7A4`） | Xcode Dark テーマ            |

#### 1-3. マイクロインタラクション変数要件

| 要件ID    | カテゴリ | 要件内容                                                                                                        | 根拠                       |
| --------- | -------- | --------------------------------------------------------------------------------------------------------------- | -------------------------- |
| FR-MI-001 | FR       | `:root` に `--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)` を追加する                                        | ui-ux-design-principles.md |
| FR-MI-002 | FR       | `:root` に `--ease-anticipate: cubic-bezier(0.68, -0.55, 0.27, 1.55)` を追加する                                | ui-ux-design-principles.md |
| FR-MI-003 | FR       | `:root` に `--scale-hover: 1.02` を追加する                                                                     | ui-ux-design-principles.md |
| FR-MI-004 | FR       | `:root` に `--scale-active: 0.97` を追加する                                                                    | ui-ux-design-principles.md |
| FR-MI-005 | FR       | `:root` に `--scale-bounce: 1.05` を追加する                                                                    | ui-ux-design-principles.md |
| FR-MI-006 | FR       | `@keyframes success-bounce` を定義する（`0%: scale(1)` → `50%: scale(var(--scale-bounce))` → `100%: scale(1)`） | タスク仕様書 Task 3        |
| FR-MI-007 | FR       | `@keyframes error-shake` を定義する（`translateX` による4px振幅の左右振動アニメーション）                       | タスク仕様書 Task 3        |

#### 1-4. テストヘルパー要件

| 要件ID    | カテゴリ | 要件内容                                                                                                                                                   | 根拠                |
| --------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| FR-TH-001 | FR       | `renderWithTheme(ui, options?)` 関数を作成する。`@testing-library/react` の `render` をラップし、`document.documentElement` に `data-theme` 属性を設定する | タスク仕様書 Task 4 |
| FR-TH-002 | FR       | `options.theme` パラメータで `"kanagawa-dragon"` / `"light"` / `"dark"` を指定可能にする                                                                   | タスク仕様書 Task 4 |
| FR-TH-003 | FR       | `options.theme` のデフォルト値は `"kanagawa-dragon"` とする                                                                                                | タスク仕様書 Task 4 |
| FR-TH-004 | FR       | `@testing-library/react` の `RenderOptions` を拡張し、`theme` 以外のオプションをそのまま `render` に渡す                                                   | タスク仕様書 Task 4 |
| FR-TH-005 | FR       | 型定義で `ResolvedTheme` 型（`apps/desktop/src/renderer/store/types.ts`）を使用する                                                                        | 型安全要件          |

#### 1-5. テーマ横断テスト要件

| 要件ID    | カテゴリ | 要件内容                                                                                              | 根拠                   |
| --------- | -------- | ----------------------------------------------------------------------------------------------------- | ---------------------- |
| FR-TT-001 | FR       | 3テーマ（`kanagawa-dragon`, `light`, `dark`）で `renderWithTheme` のレンダリングテストを実施する      | タスク仕様書 Task 5    |
| FR-TT-002 | FR       | 各テーマで `document.documentElement.getAttribute("data-theme")` が正しいテーマ名を返すことを検証する | タスク仕様書 Task 5    |
| FR-TT-003 | FR       | テーマ未指定時のデフォルト値が `"kanagawa-dragon"` であることを検証する                               | タスク仕様書 Task 5    |
| FR-TT-004 | FR       | `afterEach` で `data-theme` 属性をリセットし、テスト間の状態汚染を防止する                            | P9: テスト間リーク防止 |

### Task 2: 受け入れ基準作成

#### AC-1: テーマカラー正確性

| AC ID  | 基準                                                                                             | 検証方法                                                                |
| ------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| AC-001 | `[data-theme="light"]` の全セマンティック変数が Apple HIG System Colors の公式値と一致する       | tokens.css の値と本仕様書 FR-L-001〜FR-L-012 の値を1対1で照合           |
| AC-002 | `[data-theme="dark"]` の全セマンティック変数が Apple HIG System Colors (Dark) の公式値と一致する | tokens.css の値と本仕様書 FR-D-001〜FR-D-012 の値を1対1で照合           |
| AC-003 | `[data-theme="kanagawa-dragon"]` の全変数が本タスク実施前と同一である（変更なし）                | `git diff` で kanagawa-dragon セレクタ内のCSS変数に差分がないことを確認 |

#### AC-2: WCAG 2.1 AA コントラスト比

| AC ID  | 基準                                                                                                                                                               | 検証方法                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| AC-004 | `--text-primary` と `--bg-primary` のコントラスト比が全3テーマで 4.5:1 以上                                                                                        | WCAG コントラスト比計算ツールで検証 |
| AC-005 | `--text-secondary` と `--bg-primary` のコントラスト比が全3テーマで 4.5:1 以上                                                                                      | WCAG コントラスト比計算ツールで検証 |
| AC-006 | `--text-muted` と `--bg-primary` のコントラスト比は18px未満のテキストで 4.5:1 を満たさない可能性がある。使用箇所で個別検証が必要であることをドキュメントに明記する | 計算結果を記録し、使用制限を文書化  |

#### AC-3: マイクロインタラクション

| AC ID  | 基準                                                                                                                         | 検証方法                                   |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| AC-007 | `:root` に `--ease-bounce`, `--ease-anticipate`, `--scale-hover`, `--scale-active`, `--scale-bounce` の5変数が定義されている | tokens.css の `:root` セクションを目視確認 |
| AC-008 | `@keyframes success-bounce` が3ステップ（0%, 50%, 100%）で定義されている                                                     | tokens.css のキーフレーム定義を確認        |
| AC-009 | `@keyframes error-shake` が5ステップ（0%, 20%, 40%, 60%, 80%, 100%）で定義されている                                         | tokens.css のキーフレーム定義を確認        |

#### AC-4: テストヘルパー

| AC ID  | 基準                                                                                     | 検証方法                                                  |
| ------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| AC-010 | `renderWithTheme` が `@testing-library/react` の `render` 戻り値と同じオブジェクトを返す | テストコードで `screen`, `getByTestId` 等が使用可能か確認 |
| AC-011 | 3テーマ × レンダリングテストが全て PASS                                                  | `cd apps/desktop && pnpm vitest run` で確認               |
| AC-012 | `afterEach` で `data-theme` 属性が確実にリセットされる                                   | テスト実行後に属性が残っていないことを確認                |

### Task 3: FR/NFR 分類

#### 機能要件（FR）

| 分類                     | 要件ID範囲             | 要件数 |
| ------------------------ | ---------------------- | ------ |
| Light テーマカラー定義   | FR-L-001 〜 FR-L-012   | 12     |
| Dark テーマカラー定義    | FR-D-001 〜 FR-D-012   | 12     |
| マイクロインタラクション | FR-MI-001 〜 FR-MI-007 | 7      |
| テストヘルパー           | FR-TH-001 〜 FR-TH-005 | 5      |
| テーマ横断テスト         | FR-TT-001 〜 FR-TT-004 | 4      |
| **合計**                 |                        | **40** |

#### 非機能要件（NFR）

| 要件ID  | カテゴリ         | 要件内容                                                                                          | 根拠                        |
| ------- | ---------------- | ------------------------------------------------------------------------------------------------- | --------------------------- |
| NFR-001 | アクセシビリティ | 全テーマで `--text-primary` / `--bg-primary` 間のコントラスト比が WCAG 2.1 AA（4.5:1）を満たす    | 01-architecture.md WCAG     |
| NFR-002 | アクセシビリティ | 全テーマで `--status-*` 色と `--bg-primary` 間のコントラスト比が 3:1 以上（UIコンポーネント基準） | testing-accessibility.md    |
| NFR-003 | パフォーマンス   | CSS変数の追加によるレンダリング遅延が計測不能レベル（10ms未満）であること                         | quality-requirements.md     |
| NFR-004 | 互換性           | `kanagawa-dragon` テーマの全変数が変更されないこと                                                | タスク仕様書 §6             |
| NFR-005 | テスト品質       | テストヘルパーのテストが `cd apps/desktop && pnpm vitest run` で全件 PASS                         | P40: テスト実行ディレクトリ |
| NFR-006 | テスト品質       | テストで `userEvent` を使用しない（happy-dom環境では `fireEvent` を使用）                         | P39: happy-dom非互換        |

## 参照資料

| 参照仕様                                                                                                                      | 用途                                    | 本仕様での参照箇所              |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------- |
| `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-051-ui-00-1-design-tokens.md` | 元タスク仕様書（Task 1〜5定義）         | 全要件の根拠                    |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                                    | Design Token 3層体系・テーマ管理        | FR-L/FR-D: テーマ定義方式       |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                                                | Apple HIG準拠・マイクロインタラクション | FR-MI: イージング・スケール値   |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                                                  | WCAG 2.1 AA・ARIA属性検証               | NFR-001/NFR-002: コントラスト比 |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                   | Vitest実行基準・テスト品質ゲート        | NFR-005: テスト実行方式         |
| `.claude/rules/01-architecture.md`                                                                                            | Apple HIG カラーパレット定義            | FR-L/FR-D: 公式カラー値         |
| [Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color)                                      | Apple 公式 System Colors                | FR-L/FR-D: 全カラー値の正本     |
| [Apple HIG — Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)                              | ダークモード設計原則                    | FR-D: Dark テーマ設計根拠       |

## システム仕様（aiworkflow-requirements）

本Phaseは `aiworkflow-requirements` の参照仕様を根拠として進める。適用対象は本書の「参照資料」に列挙した `.claude/skills/aiworkflow-requirements/references/*.md` とし、UI/UX・アクセシビリティ・テスト品質の3観点を完了条件にトレースする。

| 観点             | 抽出した必須要件                              | 反映先                     |
| ---------------- | --------------------------------------------- | -------------------------- |
| UI/UX            | Apple HIG準拠のトークン・テーマ設計を維持する | 実行タスク、完了条件       |
| アクセシビリティ | WCAG 2.1 AA（コントラスト/操作性）を満たす    | 実行タスク、統合テスト連携 |
| 品質保証         | Vitest/品質ゲートを満たす                     | 統合テスト連携、完了条件   |

## 実行手順

| Step | 内容                                                                              | 実行方式 |
| ---- | --------------------------------------------------------------------------------- | -------- |
| 1    | 元タスク仕様書（00-1-design-tokens.md）を読み、Task 1〜5 の全要件を抽出する       | 直列     |
| 2    | aiworkflow-requirements の4仕様書からテーマ・a11y・テスト関連の追加要件を抽出する | 並列     |
| 3    | 01-architecture.md の Apple HIG カラーパレットと元タスク仕様のカラー値を照合する  | 直列     |
| 4    | 要件を FR/NFR に分類し、要件テーブルを作成する                                    | 直列     |
| 5    | 各要件に対応する受け入れ基準（AC）を作成する                                      | 直列     |
| 6    | scope-definition.md でスコープ境界（含む/含まない）を明確化する                   | 直列     |

## アーキテクチャ層別要件

本タスクは **Renderer層のみ** に影響する。Main Process / Preload層への変更は不要。

| 層       | 影響範囲                                      | 変更内容                                           |
| -------- | --------------------------------------------- | -------------------------------------------------- |
| Renderer | `apps/desktop/src/renderer/styles/tokens.css` | light/darkテーマ定義、マイクロインタラクション変数 |
| Renderer | `apps/desktop/src/renderer/tests/helpers/`    | renderWithTheme ヘルパー + テスト                  |
| Main     | なし                                          | 変更なし                                           |
| Preload  | なし                                          | 変更なし                                           |

## 統合テスト連携

| テスト種別               | 実行コマンド                                                                             | 目的                               |
| ------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------- |
| テーマ横断ユニットテスト | `cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme.test.tsx` | renderWithTheme の動作検証         |
| 全テスト回帰             | `cd apps/desktop && pnpm vitest run`                                                     | 既存テストへの影響がないことを確認 |

## 多角的チェック観点

| 観点           | チェック内容                                                                  |
| -------------- | ----------------------------------------------------------------------------- |
| Apple HIG 準拠 | 全カラー値が Apple 公式ドキュメントの値と完全一致しているか                   |
| WCAG 2.1 AA    | 主要テキスト/背景の組み合わせでコントラスト比 4.5:1 以上が確保されているか    |
| 3テーマ整合性  | kanagawa-dragon / light / dark で同一のセマンティック変数名が定義されているか |
| 既存テーマ保護 | kanagawa-dragon テーマに意図しない変更が入っていないか                        |
| テスト実行環境 | P40 準拠で `cd apps/desktop` から実行しているか                               |
| テスト安定性   | P9/P39 準拠で状態リセット・fireEvent 使用が徹底されているか                   |

## 成果物

| #   | 成果物         | パス                                                                             |
| --- | -------------- | -------------------------------------------------------------------------------- |
| 1   | 要件定義書     | `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-1/requirements-definition.md` |
| 2   | 受け入れ基準書 | `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-1/acceptance-criteria.md`     |
| 3   | スコープ定義書 | `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-1/scope-definition.md`        |

> **注記**: 本 Phase 仕様書自体が要件定義・受け入れ基準・スコープの全情報を含むため、outputs/ フォルダの成果物は本仕様書からの抽出・整形版とする。

## 完了条件

- [ ] Light テーマの全要件（FR-L-001〜FR-L-012）が Apple HIG 公式値と照合済み
- [ ] Dark テーマの全要件（FR-D-001〜FR-D-012）が Apple HIG 公式値と照合済み
- [ ] マイクロインタラクション要件（FR-MI-001〜FR-MI-007）が ui-ux-design-principles.md と整合済み
- [ ] テストヘルパー要件（FR-TH-001〜FR-TH-005）が定義済み
- [ ] テーマ横断テスト要件（FR-TT-001〜FR-TT-004）が定義済み
- [ ] 非機能要件（NFR-001〜NFR-006）が定義済み
- [ ] 受け入れ基準（AC-001〜AC-012）が全要件をカバーしている
- [ ] FR/NFR 分類テーブルが作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

| サブタスク               | 状態     | 担当    |
| ------------------------ | -------- | ------- |
| Task 1: 要件抽出         | 完了予定 | 本Phase |
| Task 2: 受け入れ基準作成 | 完了予定 | 本Phase |
| Task 3: FR/NFR分類       | 完了予定 | 本Phase |

## タスク100%実行確認

> 本セクションはPhase完了時に記入する。

- [ ] 全タスクの成果物が生成されている
- [ ] 完了条件の全チェックボックスがON
- [ ] 次Phaseへの引き継ぎ情報が明確

## 次のPhase

Phase 2: 設計（`phase-2-design.md`）

- tokens.css の構造設計（3層トークン体系）
- renderWithTheme のインターフェース設計
- マイクロインタラクション変数の定義方針
