# Phase 3: 設計レビュー — TASK-UI-00-TOKENS

## メタ情報

| 項目     | 値                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| Phase    | 3（設計レビュー）                                                                                           |
| タスクID | TASK-UI-00-TOKENS                                                                                           |
| タスク名 | デザイントークン・テーマ定義（Apple HIG準拠light/darkテーマ・マイクロインタラクション変数・テストヘルパー） |
| 機能名   | TASK-UI-00-TOKENS                                                                                           |
| 作成日   | 2026-02-22                                                                                                  |
| 前Phase  | Phase 2: 設計（phase-2-design.md）                                                                          |

## 目的

Phase 2 で設計した tokens.css 構造、Apple HIG カラーマッピング、マイクロインタラクション変数、renderWithTheme インターフェースの妥当性を検証し、実装開始前に設計上の問題を検出・解決する。

## 判定基準

| 判定              | 条件                                                          | 対応                  |
| ----------------- | ------------------------------------------------------------- | --------------------- |
| PASS              | 全レビュー観点で問題なし                                      | Phase 4 へ進む        |
| MINOR             | 軽微な修正指摘あり（コントラスト比微調整、変数名統一等）      | 指摘対応後 Phase 4 へ |
| MAJOR（要件問題） | 要件の漏れ・矛盾が発見された（Apple HIG値の誤り、変数欠落等） | Phase 1 へ戻る        |
| MAJOR（設計問題） | 設計の構造的問題（3層構造の破綻、テーマ切替方式の不備等）     | Phase 2 へ戻る        |

## 実行タスク

- Phaseタスク実行: 本PhaseのTaskを順に実行し、結果を成果物へ記録する

### Task 1: Apple HIG System Colors 準拠の正確性検証

| チェック項目 | 検証内容                                                                                             | 検証方法                                                                                      | 判定基準 |
| ------------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- |
| HIG-001      | Light テーマの `--bg-primary: #FFFFFF` が Apple systemBackground と一致する                          | [Apple HIG Color](https://developer.apple.com/design/human-interface-guidelines/color) と照合 | 完全一致 |
| HIG-002      | Light テーマの `--bg-secondary: #F2F2F7` が Apple secondarySystemBackground と一致する               | Apple HIG Color と照合                                                                        | 完全一致 |
| HIG-003      | Light テーマの `--bg-tertiary: #E5E5EA` が Apple systemGray5 と一致する                              | Apple HIG Color と照合                                                                        | 完全一致 |
| HIG-004      | Light テーマの `--text-primary: #000000` が Apple label と一致する                                   | Apple HIG Color と照合                                                                        | 完全一致 |
| HIG-005      | Light テーマの `--text-secondary: rgba(60, 60, 67, 0.6)` が Apple secondaryLabel と一致する          | Apple HIG Color と照合（`#3C3C43` を10進変換: `60, 60, 67`）                                  | 完全一致 |
| HIG-006      | Light テーマの `--border-default: #C6C6C8` が Apple opaqueSeparator と一致する                       | Apple HIG Color と照合                                                                        | 完全一致 |
| HIG-007      | Light テーマの `--status-primary: #007AFF` が Apple systemBlue (Light) と一致する                    | Apple HIG Color と照合                                                                        | 完全一致 |
| HIG-008      | Dark テーマの `--bg-primary: #000000` が Apple systemBackground (Dark) と一致する                    | Apple HIG Color と照合                                                                        | 完全一致 |
| HIG-009      | Dark テーマの `--bg-secondary: #1C1C1E` が Apple secondarySystemBackground (Dark) と一致する         | Apple HIG Color と照合                                                                        | 完全一致 |
| HIG-010      | Dark テーマの `--text-primary: #FFFFFF` が Apple label (Dark) と一致する                             | Apple HIG Color と照合                                                                        | 完全一致 |
| HIG-011      | Dark テーマの `--text-secondary: rgba(235, 235, 245, 0.6)` が Apple secondaryLabel (Dark) と一致する | Apple HIG Color と照合（`#EBEBF5` を10進変換: `235, 235, 245`）                               | 完全一致 |
| HIG-012      | Dark テーマの `--border-default: #38383A` が Apple opaqueSeparator (Dark) と一致する                 | Apple HIG Color と照合                                                                        | 完全一致 |
| HIG-013      | Dark テーマの `--status-primary: #0A84FF` が Apple systemBlue (Dark) と一致する                      | Apple HIG Color と照合                                                                        | 完全一致 |
| HIG-014      | Light/Dark の全ステータス色（Blue, Green, Red, Orange, Indigo）がApple公式値と一致する               | Apple HIG System Colors テーブルと照合                                                        | 完全一致 |

### Task 2: WCAG 2.1 AA コントラスト比検証

#### 検証対象ペア

以下の主要なテキスト/背景の組み合わせについて、コントラスト比を計算する。

**Light テーマ:**

| ペア                                | 前景色                         | 背景色    | 計算コントラスト比 | WCAG AA 基準 | 判定      |
| ----------------------------------- | ------------------------------ | --------- | ------------------ | ------------ | --------- |
| `--text-primary` / `--bg-primary`   | `#000000`                      | `#FFFFFF` | 21:1               | 4.5:1        | ✅ PASS   |
| `--text-secondary` / `--bg-primary` | `rgba(60,60,67,0.6)`≈`#86868B` | `#FFFFFF` | ≈3.9:1             | 4.5:1        | ⚠️ 要確認 |
| `--text-muted` / `--bg-primary`     | `rgba(60,60,67,0.3)`≈`#C5C5C7` | `#FFFFFF` | ≈1.8:1             | 4.5:1        | ❌ 不適合 |
| `--text-primary` / `--bg-secondary` | `#000000`                      | `#F2F2F7` | ≈18.5:1            | 4.5:1        | ✅ PASS   |
| `--status-primary` / `--bg-primary` | `#007AFF`                      | `#FFFFFF` | ≈4.5:1             | 3:1 (UI)     | ✅ PASS   |
| `--status-error` / `--bg-primary`   | `#FF3B30`                      | `#FFFFFF` | ≈4.0:1             | 3:1 (UI)     | ✅ PASS   |

**Dark テーマ:**

| ペア                                | 前景色                            | 背景色    | 計算コントラスト比 | WCAG AA 基準 | 判定      |
| ----------------------------------- | --------------------------------- | --------- | ------------------ | ------------ | --------- |
| `--text-primary` / `--bg-primary`   | `#FFFFFF`                         | `#000000` | 21:1               | 4.5:1        | ✅ PASS   |
| `--text-secondary` / `--bg-primary` | `rgba(235,235,245,0.6)`≈`#98989F` | `#000000` | ≈5.9:1             | 4.5:1        | ✅ PASS   |
| `--text-muted` / `--bg-primary`     | `rgba(235,235,245,0.3)`≈`#4C4C4E` | `#000000` | ≈2.7:1             | 4.5:1        | ❌ 不適合 |
| `--text-primary` / `--bg-secondary` | `#FFFFFF`                         | `#1C1C1E` | ≈17.4:1            | 4.5:1        | ✅ PASS   |
| `--status-primary` / `--bg-primary` | `#0A84FF`                         | `#000000` | ≈5.0:1             | 3:1 (UI)     | ✅ PASS   |
| `--status-error` / `--bg-primary`   | `#FF453A`                         | `#000000` | ≈5.2:1             | 3:1 (UI)     | ✅ PASS   |

#### コントラスト比に関する設計判断

| 判断事項                                                       | 判断                                                                                                                                                                                      |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--text-secondary` (Light) のコントラスト比 ≈3.9:1             | Apple HIG 公式値をそのまま採用する。Apple は大テキスト（18px以上）やUIコンポーネントでの使用を想定している。小テキストでの使用箇所は Phase 5 実装時に個別検証する                         |
| `--text-muted` のコントラスト比（Light: ≈1.8:1, Dark: ≈2.7:1） | Apple HIG の tertiaryLabel は低コントラストが意図的。「装飾的テキスト」「プレースホルダー」「非活性ラベル」にのみ使用し、主要情報テキストには使用しない。使用制限をドキュメントに明記する |

### Task 3: 3テーマ（kanagawa-dragon / light / dark）整合性検証

| チェック項目 | 検証内容                                                                             | 検証方法                                                              | 判定基準                  |
| ------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------- |
| THEME-001    | 3テーマすべてで同一の31セマンティック変数が定義されている                            | Phase 2 §1-6 の変数リストと各テーマのCSS定義を照合                    | 31変数 × 3テーマ = 93定義 |
| THEME-002    | 全テーマで `color-scheme` プロパティが設定されている                                 | kanagawa-dragon: `dark`, light: `light`, dark: `dark` を確認          | 完全一致                  |
| THEME-003    | kanagawa-dragon テーマの全変数が Phase 2 設計前と同一値である                        | 既存 tokens.css の kanagawa-dragon セクションとの差分がないことを確認 | 差分ゼロ                  |
| THEME-004    | light テーマで Tailwind Slate 系の値（`#f8fafc`, `#f1f5f9` 等）が使用されていない    | CSS定義内の値を目視確認                                               | Slate 値なし              |
| THEME-005    | dark テーマで Tailwind Slate 系の値（`#0f172a`, `#1e293b` 等）が使用されていない     | CSS定義内の値を目視確認                                               | Slate 値なし              |
| THEME-006    | マイクロインタラクション変数（5個）が `:root` に配置され、テーマセレクタ内にないこと | tokens.css の配置を確認                                               | `:root` 内に配置          |
| THEME-007    | `@keyframes success-bounce` と `error-shake` がテーマセレクタ外に配置されていること  | tokens.css の配置を確認                                               | グローバルスコープに配置  |

### Task 4: renderWithTheme インターフェースの妥当性検証

| チェック項目 | 検証内容                                                                               | 検証方法                                        | 判定基準                     |
| ------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------- |
| RTH-001      | `ResolvedTheme` 型が `apps/desktop/src/renderer/store/types.ts` に定義されている       | ファイルを確認                                  | 型が存在する                 |
| RTH-002      | `renderWithTheme` の戻り値が `@testing-library/react` の `RenderResult` と互換性がある | 型定義を確認                                    | 型互換                       |
| RTH-003      | デフォルトテーマが `"kanagawa-dragon"` であること                                      | 関数シグネチャを確認                            | 完全一致                     |
| RTH-004      | `document.documentElement.setAttribute` 方式が CSS変数の適用に有効であること           | `data-theme` セレクタと `html` 要素の対応を確認 | CSS変数が適用される          |
| RTH-005      | テストの `afterEach` で `data-theme` 属性がリセットされること                          | テスト設計を確認                                | `removeAttribute` が呼ばれる |
| RTH-006      | happy-dom 環境で `document.documentElement.setAttribute` が動作すること                | happy-dom のDOM API互換性を確認                 | 動作する                     |
| RTH-007      | テストケースが `describe.each` で3テーマを網羅していること                             | テスト設計を確認                                | 3テーマ網羅                  |

### Task 5: 既知の落とし穴チェック

| Pitfall | 検証内容                                           | 設計での対策状況                            | 判定      |
| ------- | -------------------------------------------------- | ------------------------------------------- | --------- |
| P9      | テスト間の状態リーク防止                           | `afterEach` で `data-theme` リセット        | ✅ 対策済 |
| P39     | happy-dom 環境での userEvent 非互換                | テスト設計で `fireEvent` を使用             | ✅ 対策済 |
| P40     | テスト実行ディレクトリ依存                         | `cd apps/desktop && pnpm vitest run` で実行 | ✅ 対策済 |
| P11     | PostToolUse フックによる Edit 失敗                 | 大量編集後に `git diff --stat` で検証       | ✅ 対策済 |
| 新規    | settingsSlice テーマ固定（`kanagawa-dragon` 限定） | 本タスクは CSS定義のみ。設定UI変更は対象外  | ⚠️ 認識済 |
| 新規    | Apple HIG tertiaryLabel 低コントラスト             | 使用制限をドキュメントに明記                | ⚠️ 認識済 |

## 参照資料

| 参照仕様                                                                                    | 用途                                         | 本レビューでの参照箇所     |
| ------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------- |
| `docs/30-workflows/TASK-UI-00-TOKENS/phase-1-requirements.md`                               | Phase 1 要件定義                             | Task 1〜4 の検証根拠       |
| `docs/30-workflows/TASK-UI-00-TOKENS/phase-2-design.md`                                     | Phase 2 設計                                 | 全Task の検証対象          |
| [Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color)    | Apple 公式 System Colors                     | Task 1: HIG値照合          |
| [WCAG 2.1 — Contrast Minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum) | コントラスト比基準                           | Task 2: AA基準検証         |
| `.claude/rules/01-architecture.md`                                                          | Apple HIG カラーパレット                     | Task 1: HIG値の二次照合    |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | a11y テスト観点                              | Task 2: コントラスト比要件 |
| 要件定義書                                                                                  | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物             |
| アーキテクチャ設計書                                                                        | `outputs/phase-2/architecture-design.md`     | Phase 2 成果物             |

## システム仕様（aiworkflow-requirements）

本Phaseは `aiworkflow-requirements` の参照仕様を根拠として進める。適用対象は本書の「参照資料」に列挙した `.claude/skills/aiworkflow-requirements/references/*.md` とし、UI/UX・アクセシビリティ・テスト品質の3観点を完了条件にトレースする。

| 観点             | 抽出した必須要件                              | 反映先                     |
| ---------------- | --------------------------------------------- | -------------------------- |
| UI/UX            | Apple HIG準拠のトークン・テーマ設計を維持する | 実行タスク、完了条件       |
| アクセシビリティ | WCAG 2.1 AA（コントラスト/操作性）を満たす    | 実行タスク、統合テスト連携 |
| 品質保証         | Vitest/品質ゲートを満たす                     | 統合テスト連携、完了条件   |

## 実行手順

| Step | 内容                                                                          | 実行方式 |
| ---- | ----------------------------------------------------------------------------- | -------- |
| 1    | Task 1: Apple HIG 公式ドキュメントと Phase 2 のカラー値を1対1で照合する       | 直列     |
| 2    | Task 2: 主要テキスト/背景ペアのコントラスト比を計算し、WCAG AA 基準と比較する | 直列     |
| 3    | Task 3: 3テーマ間のセマンティック変数定義を照合する                           | 直列     |
| 4    | Task 4: renderWithTheme の型・動作・テスト設計を検証する                      | 並列     |
| 5    | Task 5: 既知の落とし穴チェックリストを確認する                                | 並列     |
| 6    | 全Task の結果を集計し、PASS / MINOR / MAJOR の判定を行う                      | 直列     |

## 統合テスト連携

| テスト種別         | 実行コマンド                       | 目的                   |
| ------------------ | ---------------------------------- | ---------------------- |
| 設計検証（手動）   | Apple HIG ドキュメントとの目視照合 | カラー値の正確性       |
| コントラスト比計算 | WCAG コントラスト比ツールで計算    | WCAG 2.1 AA 基準の充足 |

## 多角的チェック観点

| 観点             | チェック内容                                                                  |
| ---------------- | ----------------------------------------------------------------------------- |
| 要件カバレッジ   | Phase 1 の40件FR + 6件NFR が Phase 2 設計で全件カバーされているか             |
| 設計一貫性       | 3テーマ間で変数名・構造が統一されているか                                     |
| Apple HIG 忠実性 | 公式値との乖離がないか（特に rgba 表記の正確性）                              |
| WCAG AA 適合     | 主要テキスト/背景ペアでコントラスト比基準を満たしているか                     |
| テスト設計妥当性 | P9/P39/P40 対策が組み込まれているか                                           |
| 後続タスク影響   | TASK-UI-00-ATOMS 等がセマンティック変数に依存する際の互換性が確保されているか |

## 成果物

| #   | 成果物             | パス                                                                          |
| --- | ------------------ | ----------------------------------------------------------------------------- |
| 1   | 設計レビュー結果書 | `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-3/design-review-result.md` |

> **注記**: 本 Phase 仕様書自体がレビュー観点・判定基準・検証テーブルの全情報を含むため、outputs/ フォルダの成果物は本仕様書からの判定結果記録とする。

## 完了条件

- [ ] Task 1: Apple HIG 値照合（HIG-001〜HIG-014）の全項目が検証済み
- [ ] Task 2: WCAG コントラスト比が全主要ペアで計算済み、判定結果が記録済み
- [ ] Task 3: 3テーマ整合性（THEME-001〜THEME-007）の全項目が検証済み
- [ ] Task 4: renderWithTheme インターフェース（RTH-001〜RTH-007）の全項目が検証済み
- [ ] Task 5: 既知の落とし穴チェック（6項目）が全件確認済み
- [ ] レビュー判定（PASS / MINOR / MAJOR）が決定済み
- [ ] MINOR 指摘がある場合、指摘対応方針が記録済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

| サブタスク                         | 状態     | 担当    |
| ---------------------------------- | -------- | ------- |
| Task 1: Apple HIG 準拠検証         | 完了予定 | 本Phase |
| Task 2: WCAG コントラスト比検証    | 完了予定 | 本Phase |
| Task 3: 3テーマ整合性検証          | 完了予定 | 本Phase |
| Task 4: renderWithTheme 妥当性検証 | 完了予定 | 本Phase |
| Task 5: 既知の落とし穴チェック     | 完了予定 | 本Phase |

## タスク100%実行確認

> 本セクションはPhase完了時に記入する。

- [ ] 全タスクの成果物が生成されている
- [ ] 完了条件の全チェックボックスがON
- [ ] レビュー判定結果が outputs/phase-3/ に記録されている
- [ ] 次Phaseへの引き継ぎ情報が明確

## 次のPhase

Phase 4: テスト作成（`phase-4-testing.md`）

- renderWithTheme テストコード実装
- テーマ横断テストケースの実装
- コントラスト比検証テストの設計
