# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| Phase      | 9                                                                                                           |
| タスクID   | TASK-UI-00-TOKENS                                                                                           |
| タスク名   | デザイントークン・テーマ定義（Apple HIG準拠light/darkテーマ・マイクロインタラクション変数・テストヘルパー） |
| 作成日     | 2026-02-22                                                                                                  |
| 前提Phase  | Phase 8（リファクタリング）完了済み                                                                         |
| 成果物パス | `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-9/quality-report.md`                                     |

## 目的

Phase 8 でリファクタリング済みの tokens.css と renderWithTheme に対して、プロジェクトで定義された品質基準（ESLint / TypeScript型チェック / テストカバレッジ / WCAGコントラスト比）を全て満たすことを検証する。品質ゲートの1つでも未達の場合は、該当箇所を修正してから次の Phase に進む。

## 実行タスク

- 品質ゲート検証: テスト・lint・型チェック・カバレッジ・WCAGを検証する

### Task 9-1: 機能テスト実行

**実行コマンド**: `cd apps/desktop && pnpm vitest run`

**期待結果**:

- renderWithTheme テストが全件 PASS
- 既存テストが壊れていないこと（tokens.css の変更による副作用がないこと）

**失敗時の対応**:

1. 失敗テストのエラーメッセージを確認する
2. tokens.css の変数値が Phase 5 の定義と一致しているか確認する
3. renderWithTheme.tsx の実装が Phase 5 の仕様と一致しているか確認する
4. 修正後、再度テストを実行する

### Task 9-2: ESLint 実行

**実行コマンド**: `pnpm lint`

**対象ファイル**:

- `apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx`
- `apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx`

**期待結果**: ESLint エラー 0件

**失敗時の対応**:

1. エラー内容を確認する
2. `pnpm lint --fix` で自動修正可能か試行する
3. 自動修正不可のエラーは手動で修正する
4. 修正後、再度 `pnpm lint` を実行して 0件を確認する

### Task 9-3: TypeScript 型チェック実行

**実行コマンド**: `pnpm typecheck`

**期待結果**: TypeScript コンパイルエラー 0件

**確認対象**:

- `renderWithTheme.tsx` の `ResolvedTheme` 型インポートが正しいこと
- `ThemeRenderOptions` インターフェースの型定義が `RenderOptions` と互換であること
- `renderWithTheme.test.tsx` のテストコードに型エラーがないこと

**失敗時の対応**:

1. エラーメッセージから型不整合の箇所を特定する
2. `apps/desktop/src/renderer/store/types.ts` の `ResolvedTheme` 型定義を確認する
3. 型定義を修正し、再度 `pnpm typecheck` を実行する

### Task 9-4: テストカバレッジ確認

**実行コマンド**: `cd apps/desktop && pnpm vitest run --coverage`

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**対象ファイル**: `apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx`

**確認方法**:

1. カバレッジレポートの `renderWithTheme.tsx` の行を確認する
2. 3つの指標が全て最低基準を満たしていることを確認する
3. 未カバーの行がある場合、テスト追加が必要かログに記録する

**未達時の対応**:

- Phase 6 に戻り、カバレッジ不足箇所のテストを追加する

### Task 9-5: CSS変数定義検証

**対象ファイル**: `apps/desktop/src/renderer/styles/tokens.css`

**検証内容**:

1. **テーマ完全性**: 以下の全変数が kanagawa-dragon / light / dark の3テーマ全てで定義されていることを確認する

| 変数カテゴリ          | 変数名                                                                                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 背景（6変数）         | `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-elevated`, `--bg-glass`, `--bg-selection`                                                                                                                         |
| テキスト（4変数）     | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`                                                                                                                                                     |
| ボーダー（3変数）     | `--border-default`, `--border-emphasis`, `--border-subtle`                                                                                                                                                                 |
| ステータス（10変数）  | `--status-primary`, `--status-primary-hover`, `--status-success`, `--status-success-hover`, `--status-warning`, `--status-warning-hover`, `--status-error`, `--status-error-hover`, `--status-info`, `--status-info-hover` |
| シンタックス（8変数） | `--syntax-keyword`, `--syntax-function`, `--syntax-string`, `--syntax-number`, `--syntax-constant`, `--syntax-type`, `--syntax-comment`, `--syntax-variable`                                                               |

2. **マイクロインタラクション変数**: `:root` に以下の変数が定義されていることを確認する

| 変数名              | 期待値                                  |
| ------------------- | --------------------------------------- |
| `--ease-bounce`     | `cubic-bezier(0.34, 1.56, 0.64, 1)`     |
| `--ease-anticipate` | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` |
| `--scale-hover`     | `1.02`                                  |
| `--scale-active`    | `0.97`                                  |
| `--scale-bounce`    | `1.05`                                  |

3. **@keyframes 定義**: 以下の2つが定義されていることを確認する
   - `@keyframes success-bounce`
   - `@keyframes error-shake`

### Task 9-6: WCAGコントラスト比検証

**対象テーマ**: light / dark（kanagawa-dragon は本タスクのスコープ外）

**検証ペア（WCAG 2.1 AA基準）**:

#### light テーマ

| 前景                                    | 背景                       | 必要比率 | 計算方法                                                    |
| --------------------------------------- | -------------------------- | -------- | ----------------------------------------------------------- |
| `--text-primary` (#000000)              | `--bg-primary` (#FFFFFF)   | 4.5:1    | 黒と白 → 21:1 ✅                                            |
| `--text-primary` (#000000)              | `--bg-secondary` (#F2F2F7) | 4.5:1    | コントラスト比を計算して確認                                |
| `--text-secondary` (rgba(60,60,67,0.6)) | `--bg-primary` (#FFFFFF)   | 4.5:1    | rgba→実効色に変換して計算                                   |
| `--text-muted` (rgba(60,60,67,0.3))     | `--bg-primary` (#FFFFFF)   | 3:1      | 大テキスト/UI部品のみで使用する前提。小テキストには使用禁止 |
| `--status-primary` (#007AFF)            | `--bg-primary` (#FFFFFF)   | 3:1      | UI部品・大テキスト基準                                      |
| `--status-error` (#FF3B30)              | `--bg-primary` (#FFFFFF)   | 3:1      | UI部品・大テキスト基準                                      |
| `--status-success` (#34C759)            | `--bg-primary` (#FFFFFF)   | 3:1      | UI部品・大テキスト基準                                      |
| `--status-warning` (#FF9500)            | `--bg-primary` (#FFFFFF)   | 3:1      | UI部品・大テキスト基準                                      |

#### dark テーマ

| 前景                                       | 背景                       | 必要比率 | 計算方法                                                    |
| ------------------------------------------ | -------------------------- | -------- | ----------------------------------------------------------- |
| `--text-primary` (#FFFFFF)                 | `--bg-primary` (#000000)   | 4.5:1    | 白と黒 → 21:1 ✅                                            |
| `--text-primary` (#FFFFFF)                 | `--bg-secondary` (#1C1C1E) | 4.5:1    | コントラスト比を計算して確認                                |
| `--text-secondary` (rgba(235,235,245,0.6)) | `--bg-primary` (#000000)   | 4.5:1    | rgba→実効色に変換して計算                                   |
| `--text-muted` (rgba(235,235,245,0.3))     | `--bg-primary` (#000000)   | 3:1      | 大テキスト/UI部品のみで使用する前提。小テキストには使用禁止 |
| `--status-primary` (#0A84FF)               | `--bg-primary` (#000000)   | 3:1      | UI部品・大テキスト基準                                      |
| `--status-error` (#FF453A)                 | `--bg-primary` (#000000)   | 3:1      | UI部品・大テキスト基準                                      |
| `--status-success` (#30D158)               | `--bg-primary` (#000000)   | 3:1      | UI部品・大テキスト基準                                      |
| `--status-warning` (#FF9F0A)               | `--bg-primary` (#000000)   | 3:1      | UI部品・大テキスト基準                                      |

**コントラスト比計算方法**:

1. rgba 前景色を背景色上で合成し、実効RGB値を算出する
2. 相対輝度を計算する: `L = 0.2126 * R + 0.7152 * G + 0.0722 * B`（各チャンネルはリニア変換後）
3. コントラスト比 = `(L1 + 0.05) / (L2 + 0.05)` （L1 > L2）

**未達時の対応**:

- コントラスト比が基準未達の場合、該当するCSS変数の値を調整し、Apple HIG の近似色で基準を満たす値に変更する
- `--text-muted` が小テキストで 4.5:1 を満たさない場合は、使用箇所の制限事項として記録する（既知の制約: Phase 7 の落とし穴に記載済み）

## 参照資料

| 参照                                                                           | 目的                       |
| ------------------------------------------------------------------------------ | -------------------------- |
| `apps/desktop/src/renderer/styles/tokens.css`                                  | 品質検証対象               |
| `apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx`                  | 品質検証対象               |
| `apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx`             | 品質検証対象               |
| `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-8/refactoring-log.md`       | リファクタリング結果の参照 |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     | トークン体系の設計基準     |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | Apple HIG準拠・WCAG基準    |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`   | アクセシビリティテスト観点 |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | テスト品質ゲート基準       |

- 依存Phase成果物参照: `phase-5-*`

## システム仕様（aiworkflow-requirements）

本Phaseは `aiworkflow-requirements` の参照仕様を根拠として進める。適用対象は本書の「参照資料」に列挙した `.claude/skills/aiworkflow-requirements/references/*.md` とし、UI/UX・アクセシビリティ・テスト品質の3観点を完了条件にトレースする。

| 観点             | 抽出した必須要件                              | 反映先                     |
| ---------------- | --------------------------------------------- | -------------------------- |
| UI/UX            | Apple HIG準拠のトークン・テーマ設計を維持する | 実行タスク、完了条件       |
| アクセシビリティ | WCAG 2.1 AA（コントラスト/操作性）を満たす    | 実行タスク、統合テスト連携 |
| 品質保証         | Vitest/品質ゲートを満たす                     | 統合テスト連携、完了条件   |

## 実行手順

| Step | 内容                                                                                          | 実行方式 |
| ---- | --------------------------------------------------------------------------------------------- | -------- |
| 1    | Task 9-1: 機能テスト実行（`cd apps/desktop && pnpm vitest run`）                              | 直列     |
| 2    | Task 9-2: ESLint 実行（`pnpm lint`）と Task 9-3: TypeScript型チェック実行（`pnpm typecheck`） | 並列     |
| 3    | Task 9-4: テストカバレッジ確認（`cd apps/desktop && pnpm vitest run --coverage`）             | 直列     |
| 4    | Task 9-5: CSS変数定義検証（手動チェック）                                                     | 直列     |
| 5    | Task 9-6: WCAGコントラスト比検証（コントラスト比計算）                                        | 直列     |
| 6    | 品質ゲート結果を quality-report.md に記録する                                                 | 直列     |

## 統合テスト連携

| テスト               | 実行コマンド                                    | 期待結果                                        | ゲート |
| -------------------- | ----------------------------------------------- | ----------------------------------------------- | ------ |
| 機能テスト           | `cd apps/desktop && pnpm vitest run`            | 全テスト PASS                                   | 必須   |
| ESLint               | `pnpm lint`                                     | エラー 0件                                      | 必須   |
| TypeScript型チェック | `pnpm typecheck`                                | エラー 0件                                      | 必須   |
| カバレッジ           | `cd apps/desktop && pnpm vitest run --coverage` | Line 80%+ / Branch 60%+ / Function 80%+         | 必須   |
| CSS変数定義          | 手動チェック                                    | 3テーマ全変数定義済み                           | 必須   |
| WCAGコントラスト     | コントラスト比計算                              | 4.5:1（通常テキスト）/ 3:1（大テキスト/UI部品） | 必須   |

## 多角的チェック観点

| 観点                     | 確認内容                                                               |
| ------------------------ | ---------------------------------------------------------------------- |
| テスト全PASS             | renderWithTheme テスト + 既存テストが全て PASS であること              |
| Lint/型エラーゼロ        | ESLint エラー 0件、TypeScript エラー 0件                               |
| カバレッジ基準達成       | Line 80%+ / Branch 60%+ / Function 80%+                                |
| テーマ変数完全性         | 31セマンティック変数 × 3テーマ = 93定義が全て存在すること              |
| マイクロインタラクション | 5変数 + 2 @keyframes が `:root` に存在すること                         |
| WCAGコントラスト         | light/dark テーマの主要カラーペアが基準を満たすこと                    |
| Apple HIG準拠            | light/dark テーマの色値が Apple 公式ドキュメントの値と一致していること |

## 成果物

| #   | 成果物       | パス                                                                    |
| --- | ------------ | ----------------------------------------------------------------------- |
| 1   | 品質レポート | `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-9/quality-report.md` |

### quality-report.md の必須セクション

```markdown
# Phase 9: 品質レポート

## 品質ゲート結果サマリー

| ゲート               | 結果      | 詳細          |
| -------------------- | --------- | ------------- |
| 機能テスト           | PASS/FAIL | テスト数: N/N |
| ESLint               | PASS/FAIL | エラー数: N   |
| TypeScript型チェック | PASS/FAIL | エラー数: N   |
| カバレッジ（Line）   | PASS/FAIL | 実績値: N%    |
| カバレッジ（Branch） | PASS/FAIL | 実績値: N%    |
| カバレッジ（Func）   | PASS/FAIL | 実績値: N%    |
| CSS変数定義          | PASS/FAIL | 検証結果      |
| WCAGコントラスト     | PASS/FAIL | 検証結果      |

## Task 9-1: 機能テスト結果

[テスト実行ログ]

## Task 9-2: ESLint 結果

[lint実行ログ]

## Task 9-3: TypeScript型チェック結果

[typecheck実行ログ]

## Task 9-4: カバレッジ結果

[カバレッジレポート抜粋]

## Task 9-5: CSS変数定義検証結果

[変数リストと3テーマでの存在確認結果]

## Task 9-6: WCAGコントラスト比検証結果

[各カラーペアのコントラスト比計算結果]

## 未達項目と対応

[未達がある場合の対応内容。全てPASSの場合は「なし」]
```

## 完了条件

- [ ] 機能テストが全件 PASS（`cd apps/desktop && pnpm vitest run`）
- [ ] ESLint エラーが 0件（`pnpm lint`）
- [ ] TypeScript型チェックエラーが 0件（`pnpm typecheck`）
- [ ] テストカバレッジが最低基準を達成（Line 80%+ / Branch 60%+ / Function 80%+）
- [ ] 3テーマ（kanagawa-dragon / light / dark）の全セマンティック変数（31変数 × 3テーマ）が定義済み
- [ ] マイクロインタラクション変数（5変数）と @keyframes（2定義）が `:root` に存在する
- [ ] light テーマの主要カラーペアが WCAG 2.1 AA コントラスト比を満たす
- [ ] dark テーマの主要カラーペアが WCAG 2.1 AA コントラスト比を満たす
- [ ] `--text-muted` の使用制限事項が記録されている（小テキスト < 18px での使用禁止）
- [ ] quality-report.md に全ゲートの結果が記録されている
- [ ] 本Phase内の全タスク（Task 9-1〜9-6）を100%実行完了

## サブタスク管理

| サブタスクID | タスク名                 | 状態   | 完了条件                                         |
| ------------ | ------------------------ | ------ | ------------------------------------------------ |
| Task 9-1     | 機能テスト実行           | 未着手 | 全テスト PASS                                    |
| Task 9-2     | ESLint 実行              | 未着手 | エラー 0件                                       |
| Task 9-3     | TypeScript型チェック実行 | 未着手 | エラー 0件                                       |
| Task 9-4     | テストカバレッジ確認     | 未着手 | Line 80%+ / Branch 60%+ / Function 80%+          |
| Task 9-5     | CSS変数定義検証          | 未着手 | 3テーマ全変数定義済み + マイクロインタラクション |
| Task 9-6     | WCAGコントラスト比検証   | 未着手 | 全カラーペアが基準達成                           |

## タスク100%実行確認

Phase 9 完了時に以下を確認する:

- [ ] Task 9-1〜9-6 の全てが実行済み
- [ ] 品質ゲート結果サマリーの全項目が PASS（FAIL の場合は修正済み）
- [ ] quality-report.md に全タスクの結果が漏れなく記録されている

## 次のPhase

Phase 10: 最終レビューゲート → `docs/30-workflows/TASK-UI-00-TOKENS/phase-10-final-review.md`
