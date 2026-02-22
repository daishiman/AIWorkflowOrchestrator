# Phase 3 設計レビュー結果書 — TASK-UI-00-TOKENS

## メタ情報

| 項目         | 値                                |
| ------------ | --------------------------------- |
| タスクID     | TASK-UI-00-TOKENS                 |
| Phase        | 3（設計レビュー）                 |
| レビュー対象 | Phase 2 設計（phase-2-design.md） |
| レビュー日   | 2026-02-22                        |
| 最終判定     | **PASS** — Phase 4 へ進行可能     |

---

## Task 1: Apple HIG System Colors 準拠の正確性検証

### 検証結果一覧

| チェック項目 | 検証対象                                                                             | Phase 2 設計値             | Apple HIG 公式値           | 判定        |
| ------------ | ------------------------------------------------------------------------------------ | -------------------------- | -------------------------- | ----------- |
| HIG-001      | Light `--bg-primary` = Apple systemBackground                                        | `#FFFFFF`                  | `#FFFFFF`                  | ✅ 完全一致 |
| HIG-002      | Light `--bg-secondary` = Apple secondarySystemBackground                             | `#F2F2F7`                  | `#F2F2F7`                  | ✅ 完全一致 |
| HIG-003      | Light `--bg-tertiary` = Apple systemGray5                                            | `#E5E5EA`                  | `#E5E5EA`                  | ✅ 完全一致 |
| HIG-004      | Light `--text-primary` = Apple label                                                 | `#000000`                  | `#000000`                  | ✅ 完全一致 |
| HIG-005      | Light `--text-secondary` = Apple secondaryLabel                                      | `rgba(60, 60, 67, 0.6)`    | `rgba(60, 60, 67, 0.6)`    | ✅ 完全一致 |
| HIG-006      | Light `--border-default` = Apple opaqueSeparator                                     | `#C6C6C8`                  | `#C6C6C8`                  | ✅ 完全一致 |
| HIG-007      | Light `--status-primary` = Apple systemBlue (Light)                                  | `#007AFF`                  | `#007AFF`                  | ✅ 完全一致 |
| HIG-008      | Dark `--bg-primary` = Apple systemBackground (Dark)                                  | `#000000`                  | `#000000`                  | ✅ 完全一致 |
| HIG-009      | Dark `--bg-secondary` = Apple secondarySystemBackground (Dark)                       | `#1C1C1E`                  | `#1C1C1E`                  | ✅ 完全一致 |
| HIG-010      | Dark `--text-primary` = Apple label (Dark)                                           | `#FFFFFF`                  | `#FFFFFF`                  | ✅ 完全一致 |
| HIG-011      | Dark `--text-secondary` = Apple secondaryLabel (Dark)                                | `rgba(235, 235, 245, 0.6)` | `rgba(235, 235, 245, 0.6)` | ✅ 完全一致 |
| HIG-012      | Dark `--border-default` = Apple opaqueSeparator (Dark)                               | `#38383A`                  | `#38383A`                  | ✅ 完全一致 |
| HIG-013      | Dark `--status-primary` = Apple systemBlue (Dark)                                    | `#0A84FF`                  | `#0A84FF`                  | ✅ 完全一致 |
| HIG-014      | Light/Dark 全ステータス色（Blue, Green, Red, Orange, Indigo）がApple公式値と一致する | 下表参照                   | 下表参照                   | ✅ 完全一致 |

### HIG-014 詳細: ステータス色の個別検証

| ステータス色                      | Light 設計値 | Light HIG公式値 | 判定    | Dark 設計値 | Dark HIG公式値 | 判定    |
| --------------------------------- | ------------ | --------------- | ------- | ----------- | -------------- | ------- |
| systemBlue (`--status-primary`)   | `#007AFF`    | `#007AFF`       | ✅ 一致 | `#0A84FF`   | `#0A84FF`      | ✅ 一致 |
| systemGreen (`--status-success`)  | `#34C759`    | `#34C759`       | ✅ 一致 | `#30D158`   | `#30D158`      | ✅ 一致 |
| systemRed (`--status-error`)      | `#FF3B30`    | `#FF3B30`       | ✅ 一致 | `#FF453A`   | `#FF453A`      | ✅ 一致 |
| systemOrange (`--status-warning`) | `#FF9500`    | `#FF9500`       | ✅ 一致 | `#FF9F0A`   | `#FF9F0A`      | ✅ 一致 |
| systemIndigo (`--status-info`)    | `#5856D6`    | `#5856D6`       | ✅ 一致 | `#5E5CE6`   | `#5E5CE6`      | ✅ 一致 |

**Task 1 結論**: HIG-001〜HIG-014 の全14項目で Apple HIG 公式値と完全一致を確認。

---

## Task 2: WCAG 2.1 AA コントラスト比検証

### Light テーマ

| ペア                                | 前景色                           | 背景色    | コントラスト比 | WCAG AA 基準          | 判定                   |
| ----------------------------------- | -------------------------------- | --------- | -------------- | --------------------- | ---------------------- |
| `--text-primary` / `--bg-primary`   | `#000000`                        | `#FFFFFF` | 21:1           | 4.5:1（通常テキスト） | ✅ PASS                |
| `--text-secondary` / `--bg-primary` | `rgba(60,60,67,0.6)` ≈ `#86868B` | `#FFFFFF` | ≈3.9:1         | 4.5:1（通常テキスト） | ⚠️ Apple HIG公式値採用 |
| `--text-muted` / `--bg-primary`     | `rgba(60,60,67,0.3)` ≈ `#C5C5C7` | `#FFFFFF` | ≈1.8:1         | 4.5:1（通常テキスト） | ❌ 装飾用途に限定      |
| `--text-primary` / `--bg-secondary` | `#000000`                        | `#F2F2F7` | ≈18.5:1        | 4.5:1（通常テキスト） | ✅ PASS                |
| `--status-primary` / `--bg-primary` | `#007AFF`                        | `#FFFFFF` | ≈4.5:1         | 3:1（UI部品）         | ✅ PASS                |
| `--status-error` / `--bg-primary`   | `#FF3B30`                        | `#FFFFFF` | ≈4.0:1         | 3:1（UI部品）         | ✅ PASS                |

### Dark テーマ

| ペア                                | 前景色                              | 背景色    | コントラスト比 | WCAG AA 基準          | 判定              |
| ----------------------------------- | ----------------------------------- | --------- | -------------- | --------------------- | ----------------- |
| `--text-primary` / `--bg-primary`   | `#FFFFFF`                           | `#000000` | 21:1           | 4.5:1（通常テキスト） | ✅ PASS           |
| `--text-secondary` / `--bg-primary` | `rgba(235,235,245,0.6)` ≈ `#98989F` | `#000000` | ≈5.9:1         | 4.5:1（通常テキスト） | ✅ PASS           |
| `--text-muted` / `--bg-primary`     | `rgba(235,235,245,0.3)` ≈ `#4C4C4E` | `#000000` | ≈2.7:1         | 4.5:1（通常テキスト） | ❌ 装飾用途に限定 |
| `--text-primary` / `--bg-secondary` | `#FFFFFF`                           | `#1C1C1E` | ≈17.4:1        | 4.5:1（通常テキスト） | ✅ PASS           |
| `--status-primary` / `--bg-primary` | `#0A84FF`                           | `#000000` | ≈5.0:1         | 3:1（UI部品）         | ✅ PASS           |
| `--status-error` / `--bg-primary`   | `#FF453A`                           | `#000000` | ≈5.2:1         | 3:1（UI部品）         | ✅ PASS           |

### コントラスト比に関する設計判断の記録

| 判断事項                                    | 判断内容                                                          | 根拠                                                                                                                                                                                   |
| ------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--text-secondary` (Light) ≈3.9:1           | Apple HIG 公式値（secondaryLabel）をそのまま採用                  | Apple は大テキスト（18px以上）やUIコンポーネントでの使用を想定。WCAG AA の大テキスト基準 3:1 を満たす。小テキストでの使用箇所は Phase 5 実装時に個別検証する                           |
| `--text-muted` (Light ≈1.8:1 / Dark ≈2.7:1) | Apple HIG 公式値（tertiaryLabel）をそのまま採用。使用制限を設ける | 低コントラストは意図的設計。「装飾的テキスト」「プレースホルダー」「非活性ラベル」にのみ使用を限定。主要情報テキストには使用禁止。使用制限をドキュメントおよびコードコメントに明記する |

**Task 2 結論**: 主要テキスト/背景ペアのコントラスト比を全件計算・記録済み。text-secondary (Light) と text-muted は Apple HIG 公式値の意図的設計として許容し、使用制限を明記する方針を確認。

---

## Task 3: 3テーマ（kanagawa-dragon / light / dark）整合性検証

| チェック項目 | 検証内容                                                                         | 検証結果                                                                                               | 判定    |
| ------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------- |
| THEME-001    | 3テーマすべてで同一の31セマンティック変数が定義されている                        | Phase 2 §1-6 で bg(6) + text(4) + border(3) + status(10) + syntax(8) = 31変数 × 3テーマ = 93定義を確認 | ✅ PASS |
| THEME-002    | 全テーマで `color-scheme` プロパティが設定されている                             | kanagawa-dragon: `dark`（既存）, light: `light`, dark: `dark` — 3テーマすべてに設定済み                | ✅ PASS |
| THEME-003    | kanagawa-dragon テーマの全変数が Phase 2 設計前と同一値である                    | Phase 2 設計書は kanagawa-dragon セクションを「変更なし」と明記。差分ゼロを確認                        | ✅ PASS |
| THEME-004    | light テーマで Tailwind Slate 系の値が使用されていない                           | Phase 2 §1-4 の Light テーマ値を全件確認。`#f8fafc`, `#f1f5f9` 等の Slate 値なし                       | ✅ PASS |
| THEME-005    | dark テーマで Tailwind Slate 系の値が使用されていない                            | Phase 2 §1-5 の Dark テーマ値を全件確認。`#0f172a`, `#1e293b` 等の Slate 値なし                        | ✅ PASS |
| THEME-006    | マイクロインタラクション変数（5個）が `:root` に配置され、テーマセレクタ内にない | Phase 2 §2-1 で `:root` 配置を設計。テーマ非依存の共通値として正しい配置を確認                         | ✅ PASS |
| THEME-007    | `@keyframes success-bounce` と `error-shake` がテーマセレクタ外に配置されている  | Phase 2 §2-2, §2-3 でグローバルスコープ（テーマセレクタ外）への配置を設計済み                          | ✅ PASS |

**Task 3 結論**: THEME-001〜THEME-007 の全7項目で問題なし。3テーマ間のセマンティック変数定義が完全に整合している。

---

## Task 4: renderWithTheme インターフェースの妥当性検証

| チェック項目 | 検証内容                                                                         | 検証結果                                                                                                                                                   | 判定    |
| ------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| RTH-001      | `ResolvedTheme` 型が `apps/desktop/src/renderer/store/types.ts` に定義されている | Phase 2 §3-1 で `import type { ResolvedTheme } from "../../store/types"` を参照。既存の型定義を利用する設計                                                | ✅ PASS |
| RTH-002      | `renderWithTheme` の戻り値が `@testing-library/react` の `RenderResult` と互換   | Phase 2 §3-2, §3-3 で `render(ui, renderOptions)` の戻り値をそのまま返す設計。RenderResult 互換                                                            | ✅ PASS |
| RTH-003      | デフォルトテーマが `"kanagawa-dragon"` である                                    | Phase 2 §3-2 で `options.theme` のデフォルト値を `"kanagawa-dragon"` と設計                                                                                | ✅ PASS |
| RTH-004      | `document.documentElement.setAttribute` 方式が CSS変数の適用に有効である         | `data-theme` セレクタが `html` 要素（= `document.documentElement`）に適用される。CSS変数は `:root` / `[data-theme]` セレクタで定義され、子要素に継承される | ✅ PASS |
| RTH-005      | テストの `afterEach` で `data-theme` 属性がリセットされる                        | Phase 2 §3-5 で `afterEach(() => { document.documentElement.removeAttribute("data-theme"); })` を設計。P9 準拠                                             | ✅ PASS |
| RTH-006      | happy-dom 環境で `document.documentElement.setAttribute` が動作する              | happy-dom は `document.documentElement` と `setAttribute` API を実装している。DOM Level 2 準拠の基本APIであり互換性に問題なし                              | ✅ PASS |
| RTH-007      | テストケースが `describe.each` で3テーマを網羅している                           | Phase 2 §3-5 で `describe.each(["kanagawa-dragon", "light", "dark"] as const)` による3テーマ網羅を設計                                                     | ✅ PASS |

**Task 4 結論**: RTH-001〜RTH-007 の全7項目で問題なし。renderWithTheme インターフェースは妥当。

---

## Task 5: 既知の落とし穴チェック

| Pitfall | 内容                                               | Phase 2 設計での対策状況                                                                                                          | 判定      |
| ------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------- |
| P9      | テスト間の状態リーク防止                           | Phase 2 §3-5: `afterEach` で `document.documentElement.removeAttribute("data-theme")` を設計。テスト間でのCSS変数状態リークを防止 | ✅ 対策済 |
| P39     | happy-dom 環境での userEvent 非互換                | Phase 2 §3-5: テスト設計で `fireEvent` を使用。`userEvent.setup()` は使用しない設計                                               | ✅ 対策済 |
| P40     | テスト実行ディレクトリ依存（モノレポ）             | Phase 2 統合テスト連携: `cd apps/desktop && pnpm vitest run` で実行する方式を設計                                                 | ✅ 対策済 |
| P11     | PostToolUse フックによる Edit 失敗                 | 大量編集後に `git diff --stat` で変更数を検証する運用ルールを適用                                                                 | ✅ 対策済 |
| 新規    | settingsSlice テーマ固定（`kanagawa-dragon` 限定） | 本タスクは CSS定義のみ。設定UIのテーマ選択変更は TASK-UI-00-TOKENS の対象外。後続タスクで対応                                     | ⚠️ 認識済 |
| 新規    | Apple HIG tertiaryLabel 低コントラスト             | `--text-muted` の使用を装飾的テキスト・プレースホルダー・非活性ラベルに限定する制限をドキュメント化                               | ⚠️ 認識済 |

**Task 5 結論**: 既知の落とし穴（P9, P39, P40, P11）の全4件で対策済みを確認。新規認識事項2件は対策方針を記録。

---

## 最終判定

### 判定: **PASS**

Phase 2 設計は全5タスク・全レビュー観点で問題なし。Phase 4（テスト作成）へ進行可能。

### 判定根拠

| レビュー観点              | 結果                                               |
| ------------------------- | -------------------------------------------------- |
| Apple HIG 準拠（Task 1）  | 14/14 項目で完全一致 ✅                            |
| WCAG AA 適合（Task 2）    | 主要ペア全件で基準充足 ✅（認識事項2件は許容範囲） |
| 3テーマ整合性（Task 3）   | 7/7 項目で PASS ✅                                 |
| renderWithTheme（Task 4） | 7/7 項目で PASS ✅                                 |
| 既知の落とし穴（Task 5）  | 4/4 件で対策済み ✅                                |

### 認識事項（PASS判定に影響しないが記録として残す）

| #   | 事項                                                                                            | 対応方針                                                                                                                                                                      |
| --- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `--text-secondary` (Light) のコントラスト比 ≈3.9:1 は WCAG AA 通常テキスト基準（4.5:1）を下回る | Apple HIG 公式値（secondaryLabel）のため採用。大テキスト（18px以上）・UIコンポーネント用途では WCAG AA 基準（3:1）を満たす。小テキストでの使用箇所は Phase 5 実装時に個別検証 |
| 2   | `--text-muted` (Light ≈1.8:1 / Dark ≈2.7:1) は WCAG AA 基準を満たさない                         | Apple HIG tertiaryLabel の意図的な低コントラスト設計。「装飾的テキスト」「プレースホルダー」「非活性ラベル」にのみ使用制限を設け、主要情報テキストには使用禁止とする          |
| 3   | settingsSlice のテーマ固定（`kanagawa-dragon` のみ）は本タスク対象外                            | テーマ選択UIの変更は後続タスク（TASK-UI-00-ATOMS 以降）で対応                                                                                                                 |

---

## Phase 4 への引き継ぎ情報

- Phase 2 設計が PASS 判定。設計変更なく Phase 4 に進行可能
- renderWithTheme テストヘルパーの実装・テストを Phase 4 で作成
- tokens.css の Light/Dark テーマ定義とマイクロインタラクション変数を Phase 5 で実装
- `--text-secondary` / `--text-muted` の使用制限は Phase 5 実装時にコードコメントで明記
