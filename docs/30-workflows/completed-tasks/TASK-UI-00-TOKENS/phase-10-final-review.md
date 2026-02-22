# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 値                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| Phase      | 10                                                                                                          |
| タスクID   | TASK-UI-00-TOKENS                                                                                           |
| タスク名   | デザイントークン・テーマ定義（Apple HIG準拠light/darkテーマ・マイクロインタラクション変数・テストヘルパー） |
| 作成日     | 2026-02-22                                                                                                  |
| 前提Phase  | Phase 9（品質保証）完了済み                                                                                 |
| 成果物パス | `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-10/final-review-result.md`                               |

## 目的

Phase 1〜9 の全成果物に対して、多角的な最終レビューを実施する。Apple HIG System Colors の正確性、3テーマ整合性、WCAGコントラスト、CSS変数命名、マイクロインタラクション、テストヘルパーの動作、テストカバレッジの7観点でレビューし、PASS / MINOR / MAJOR / CRITICAL の判定を下す。

## 判定基準

| 判定     | 条件                                                                     | 対応                                                |
| -------- | ------------------------------------------------------------------------ | --------------------------------------------------- |
| PASS     | 全レビュー観点で問題なし                                                 | Phase 11（手動テスト）へ進む                        |
| MINOR    | 機能に影響しない軽微な問題（コメント誤り、命名の微修正）                 | 未タスク仕様書に変換後、Phase 11 へ進む（省略不可） |
| MAJOR    | 機能・品質に影響する問題（変数値の誤り、テーマ間不整合、カバレッジ未達） | 影響範囲に応じて Phase 1-5 へ戻る                   |
| CRITICAL | 根本的な設計問題（Apple HIG 非準拠、全テーマで破綻、セキュリティ問題）   | Phase 1 へ戻り要件再確認                            |

**MINOR 指摘の処理ルール**:

- 全ての MINOR 指摘は未タスク仕様書に変換する（「機能影響なし」でも省略不可）
- 未タスク仕様書は `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-10/unassigned-tasks/` に配置する
- 変換後、Phase 11 へ進む

## 実行タスク

- Phaseタスク実行: 本PhaseのTaskを順に実行し、結果を成果物へ記録する

### Task 10-1: Apple HIG System Colors 正確性レビュー

**対象ファイル**: `apps/desktop/src/renderer/styles/tokens.css`

**レビュー観点**:

1. **light テーマの色値がApple公式ドキュメントと一致しているか**

| CSS変数            | 期待値（Apple HIG）     | Apple 名称                |
| ------------------ | ----------------------- | ------------------------- |
| `--bg-primary`     | `#FFFFFF`               | systemBackground          |
| `--bg-secondary`   | `#F2F2F7`               | secondarySystemBackground |
| `--bg-tertiary`    | `#E5E5EA`               | systemGray5               |
| `--text-primary`   | `#000000`               | label                     |
| `--text-secondary` | `rgba(60, 60, 67, 0.6)` | secondaryLabel            |
| `--text-muted`     | `rgba(60, 60, 67, 0.3)` | tertiaryLabel             |
| `--border-default` | `#C6C6C8`               | opaqueSeparator           |
| `--status-primary` | `#007AFF`               | systemBlue                |
| `--status-success` | `#34C759`               | systemGreen               |
| `--status-error`   | `#FF3B30`               | systemRed                 |
| `--status-warning` | `#FF9500`               | systemOrange              |
| `--status-info`    | `#5856D6`               | systemIndigo              |

2. **dark テーマの色値がApple公式ドキュメントと一致しているか**

| CSS変数            | 期待値（Apple HIG）        | Apple 名称                |
| ------------------ | -------------------------- | ------------------------- |
| `--bg-primary`     | `#000000`                  | systemBackground          |
| `--bg-secondary`   | `#1C1C1E`                  | secondarySystemBackground |
| `--bg-tertiary`    | `#2C2C2E`                  | tertiarySystemBackground  |
| `--text-primary`   | `#FFFFFF`                  | label                     |
| `--text-secondary` | `rgba(235, 235, 245, 0.6)` | secondaryLabel            |
| `--text-muted`     | `rgba(235, 235, 245, 0.3)` | tertiaryLabel             |
| `--border-default` | `#38383A`                  | opaqueSeparator           |
| `--status-primary` | `#0A84FF`                  | systemBlue                |
| `--status-success` | `#30D158`                  | systemGreen               |
| `--status-error`   | `#FF453A`                  | systemRed                 |
| `--status-warning` | `#FF9F0A`                  | systemOrange              |
| `--status-info`    | `#5E5CE6`                  | systemIndigo              |

3. **Xcode準拠のシンタックスカラー**

| CSS変数             | light 期待値 | dark 期待値 |
| ------------------- | ------------ | ----------- |
| `--syntax-keyword`  | `#9B2393`    | `#FC5FA3`   |
| `--syntax-function` | `#007AFF`    | `#0A84FF`   |
| `--syntax-string`   | `#C41A16`    | `#FC6A5D`   |
| `--syntax-number`   | `#1C00CF`    | `#D0BF69`   |
| `--syntax-constant` | `#703DAA`    | `#A167E6`   |
| `--syntax-type`     | `#5856D6`    | `#5E5CE6`   |
| `--syntax-comment`  | `#8E8E93`    | `#7F8C98`   |
| `--syntax-variable` | `#3900A0`    | `#67B7A4`   |

**判定基準**:

- 1つでも色値が不一致 → MAJOR（色値修正が必要）
- 全て一致 → PASS

### Task 10-2: 3テーマ整合性レビュー

**対象ファイル**: `apps/desktop/src/renderer/styles/tokens.css`

**レビュー観点**:

1. **kanagawa-dragon テーマが変更されていないこと**: `git diff HEAD -- apps/desktop/src/renderer/styles/tokens.css` で kanagawa-dragon セクションに差分がないことを確認する
2. **3テーマの変数セット一致**: light / dark / kanagawa-dragon の3テーマが同一のセマンティック変数名セットを持つことを確認する。変数の欠損・過剰がないこと
3. **セクション構造一致**: 3テーマのセクションコメント順序が統一されていること
4. **`color-scheme` 宣言**: light テーマに `color-scheme: light;`、dark テーマに `color-scheme: dark;` が宣言されていること

**判定基準**:

- kanagawa-dragon に意図しない変更がある → MAJOR
- 変数セットの不一致がある → MAJOR
- セクション構造のみの不一致 → MINOR

### Task 10-3: WCAGコントラスト比レビュー

**対象テーマ**: light / dark

**レビュー観点**:

Phase 9 で実施したコントラスト比検証の結果を再確認し、以下を検証する:

1. 通常テキスト（< 18px）のコントラスト比が 4.5:1 以上であること:
   - `--text-primary` on `--bg-primary` → 21:1（light/dark 両方）
   - `--text-primary` on `--bg-secondary` → 計算確認
   - `--text-secondary` on `--bg-primary` → 計算確認

2. 大テキスト（>= 18px bold）/ UI部品のコントラスト比が 3:1 以上であること:
   - `--status-primary` on `--bg-primary`
   - `--status-error` on `--bg-primary`
   - `--status-success` on `--bg-primary`
   - `--status-warning` on `--bg-primary`

3. `--text-muted` の制限事項が文書化されていること:
   - 小テキスト（< 18px）での使用禁止が明記されていること
   - 大テキスト / 補足的な装飾テキストでのみ使用する制約

**判定基準**:

- 通常テキスト用変数が 4.5:1 未満 → CRITICAL（アクセシビリティ違反）
- UI部品用変数が 3:1 未満 → MAJOR
- `--text-muted` の制限事項が未記載 → MINOR

### Task 10-4: CSS変数命名一貫性レビュー

**対象ファイル**: `apps/desktop/src/renderer/styles/tokens.css`

**レビュー観点**:

1. 全セマンティック変数が以下の命名プレフィックスに準拠していること:
   - `--bg-*`: 背景色
   - `--text-*`: テキスト色
   - `--border-*`: ボーダー色
   - `--status-*`: ステータスカラー（アクセント・成功・エラー・警告・情報）
   - `--syntax-*`: シンタックスハイライトカラー
   - `--ease-*`: イージング関数
   - `--scale-*`: スケール値
   - `--spacing-*`: 間隔
   - `--radius-*`: 角丸
   - `--shadow-*`: 影
   - `--duration-*`: 時間
   - `--font-*`: フォントファミリー

2. hover ステートの命名が `{base}-hover` パターンであること（例: `--status-primary-hover`）

3. 命名が用途を明確に表現していること（曖昧な命名がないこと）

**判定基準**:

- 命名規則から外れた変数がある → MINOR（未タスク化して後続対応）
- 命名が曖昧で用途が不明確 → MINOR

### Task 10-5: マイクロインタラクション変数レビュー

**対象ファイル**: `apps/desktop/src/renderer/styles/tokens.css`

**レビュー観点**:

1. `:root` に以下のマイクロインタラクション変数が定義されていること:

| 変数名              | 期待値                                  | 用途                      |
| ------------------- | --------------------------------------- | ------------------------- |
| `--ease-bounce`     | `cubic-bezier(0.34, 1.56, 0.64, 1)`     | バウンス感のある跳ね返り  |
| `--ease-anticipate` | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` | 溜めてから跳ねる          |
| `--scale-hover`     | `1.02`                                  | ホバー時の微拡大          |
| `--scale-active`    | `0.97`                                  | タップ/クリック時の微縮小 |
| `--scale-bounce`    | `1.05`                                  | 成功時のバウンスピーク    |

2. `@keyframes success-bounce` が定義されていること:
   - 0%: `scale(1)` → 50%: `scale(var(--scale-bounce))` → 100%: `scale(1)`

3. `@keyframes error-shake` が定義されていること:
   - 0%,100%: `translateX(0)` → 20%: `translateX(-4px)` → 40%: `translateX(4px)` → 60%: `translateX(-4px)` → 80%: `translateX(4px)`

4. 既存のイージング/トランジション変数（`--ease-out`, `--ease-spring`, `--duration-*`）との重複・競合がないこと

**判定基準**:

- 変数の欠損 → MAJOR
- @keyframes の欠損 → MAJOR
- 値が仕様と異なる → MAJOR
- 既存変数との競合 → MINOR

### Task 10-6: renderWithTheme テストヘルパーレビュー

**対象ファイル**:

- `apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx`
- `apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx`

**レビュー観点**:

1. **テストヘルパー実装**:
   - `renderWithTheme` が `ThemeRenderOptions` を受け取り、`data-theme` 属性を設定してから `render` を呼び出していること
   - デフォルトテーマが `kanagawa-dragon` であること
   - `RenderOptions` の全オプション（`wrapper`, `container` 等）がパススルーされること
   - `ResolvedTheme` 型を使用して型安全であること

2. **テストコード**:
   - 3テーマ（kanagawa-dragon / light / dark）の全てでレンダリングテストが存在すること
   - デフォルトテーマのテストが存在すること
   - `afterEach` で `data-theme` 属性がクリーンアップされていること（P9対策）
   - `fireEvent` が使用されていること（P39対策: `userEvent` 使用禁止）

3. **テスト結果**: `cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme` で全テスト PASS

**判定基準**:

- テストヘルパーが3テーマで動作しない → MAJOR
- テストが不足している → MINOR
- クリーンアップが欠損 → MINOR（テスト間リーク P9 リスク）

### Task 10-7: テストカバレッジレビュー

**対象**: Phase 9 の品質レポートの カバレッジ結果

**レビュー観点**:

| 指標              | 最低基準 | 推奨基準 | 判定           |
| ----------------- | -------- | -------- | -------------- |
| Line Coverage     | 80%      | 90%      | 最低基準で判定 |
| Branch Coverage   | 60%      | 70%      | 最低基準で判定 |
| Function Coverage | 80%      | 90%      | 最低基準で判定 |

**判定基準**:

- 最低基準未達 → MAJOR（Phase 6 に戻ってテスト追加）
- 最低基準達成・推奨基準未達 → MINOR（改善を未タスク化）
- 推奨基準達成 → PASS

## 参照資料

| 参照                                                                                             | 目的                         |
| ------------------------------------------------------------------------------------------------ | ---------------------------- |
| `apps/desktop/src/renderer/styles/tokens.css`                                                    | 最終レビュー対象             |
| `apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx`                                    | 最終レビュー対象             |
| `apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx`                               | 最終レビュー対象             |
| `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-9/quality-report.md`                          | 品質ゲート結果の参照         |
| `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-8/refactoring-log.md`                         | リファクタリング結果の参照   |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                       | トークン体系の設計基準       |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                   | Apple HIG準拠・WCAG基準      |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                     | アクセシビリティテスト観点   |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                      | テスト品質ゲート基準         |
| [Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color)         | Apple 公式カラーガイドライン |
| [Apple HIG — Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) | ダークモード設計ガイド       |

- 依存Phase成果物参照: `phase-1-*`、`phase-2-*`、`phase-5-*`
  | 要件定義書 | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
  | アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md` | Phase 2 成果物 |
  | カバレッジ確認レポート | `outputs/phase-7/coverage-report.md` | Phase 7 成果物 |

## システム仕様（aiworkflow-requirements）

本Phaseは `aiworkflow-requirements` の参照仕様を根拠として進める。適用対象は本書の「参照資料」に列挙した `.claude/skills/aiworkflow-requirements/references/*.md` とし、UI/UX・アクセシビリティ・テスト品質の3観点を完了条件にトレースする。

| 観点             | 抽出した必須要件                              | 反映先                     |
| ---------------- | --------------------------------------------- | -------------------------- |
| UI/UX            | Apple HIG準拠のトークン・テーマ設計を維持する | 実行タスク、完了条件       |
| アクセシビリティ | WCAG 2.1 AA（コントラスト/操作性）を満たす    | 実行タスク、統合テスト連携 |
| 品質保証         | Vitest/品質ゲートを満たす                     | 統合テスト連携、完了条件   |

## 実行手順

| Step | 内容                                                                                                  | 実行方式 |
| ---- | ----------------------------------------------------------------------------------------------------- | -------- |
| 1    | Task 10-1: Apple HIG System Colors 正確性レビュー（tokens.css の色値を Apple 公式ドキュメントと照合） | 直列     |
| 2    | Task 10-2: 3テーマ整合性レビュー（kanagawa-dragon 非変更確認 + 変数セット一致確認）                   | 直列     |
| 3    | Task 10-3: WCAGコントラスト比レビュー（Phase 9 の結果再確認 + 制限事項の文書化確認）                  | 直列     |
| 4    | Task 10-4: CSS変数命名一貫性レビュー と Task 10-5: マイクロインタラクション変数レビュー               | 並列     |
| 5    | Task 10-6: renderWithTheme テストヘルパーレビュー（テスト実行含む）                                   | 直列     |
| 6    | Task 10-7: テストカバレッジレビュー（Phase 9 の結果確認）                                             | 直列     |
| 7    | 全レビュー観点の結果を集約し、PASS / MINOR / MAJOR / CRITICAL の総合判定を下す                        | 直列     |
| 8    | MINOR 指摘がある場合は未タスク仕様書を作成する                                                        | 直列     |
| 9    | final-review-result.md に全レビュー結果と総合判定を記録する                                           | 直列     |

## 統合テスト連携

| テスト               | 実行コマンド                                                                    | 期待結果      |
| -------------------- | ------------------------------------------------------------------------------- | ------------- |
| テストヘルパーテスト | `cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme` | 全テスト PASS |
| 全テスト             | `cd apps/desktop && pnpm vitest run`                                            | 全テスト PASS |

## 多角的チェック観点

| 観点                           | 確認内容                                                                             | 担当Task  |
| ------------------------------ | ------------------------------------------------------------------------------------ | --------- |
| Apple HIG System Colors 正確性 | light/dark テーマの各色値が Apple 公式ドキュメントと1値も相違なく一致すること        | Task 10-1 |
| 3テーマ整合性                  | kanagawa-dragon 非変更 + light/dark の変数セット/セクション構造が一致すること        | Task 10-2 |
| WCAGコントラスト               | 通常テキスト 4.5:1 / 大テキスト・UI部品 3:1 / `--text-muted` 制限事項の文書化        | Task 10-3 |
| CSS変数命名                    | 全変数が `--bg-*` / `--text-*` / `--border-*` / `--status-*` / `--syntax-*` 等で一貫 | Task 10-4 |
| マイクロインタラクション       | 5変数 + 2 @keyframes の存在・値・仕様一致                                            | Task 10-5 |
| テストヘルパー動作             | renderWithTheme が3テーマ全てで動作 + テスト全PASS + クリーンアップ存在              | Task 10-6 |
| テストカバレッジ               | Line 80%+ / Branch 60%+ / Function 80%+                                              | Task 10-7 |

## 成果物

| #   | 成果物                    | パス                                                                                       |
| --- | ------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | 最終レビュー結果          | `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-10/final-review-result.md`              |
| 2   | 未タスク仕様書（MINOR時） | `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-10/unassigned-tasks/*.md`（該当時のみ） |

### final-review-result.md の必須セクション

```markdown
# Phase 10: 最終レビュー結果

## 総合判定: [PASS / MINOR / MAJOR / CRITICAL]

## レビュー観点別結果

| #   | 観点                           | 判定     | 指摘内容 |
| --- | ------------------------------ | -------- | -------- |
| 1   | Apple HIG System Colors 正確性 | PASS/... | [詳細]   |
| 2   | 3テーマ整合性                  | PASS/... | [詳細]   |
| 3   | WCAGコントラスト               | PASS/... | [詳細]   |
| 4   | CSS変数命名                    | PASS/... | [詳細]   |
| 5   | マイクロインタラクション       | PASS/... | [詳細]   |
| 6   | テストヘルパー                 | PASS/... | [詳細]   |
| 7   | テストカバレッジ               | PASS/... | [詳細]   |

## Task 10-1: Apple HIG System Colors 正確性レビュー詳細

[light/dark テーマの全色値照合結果]

## Task 10-2: 3テーマ整合性レビュー詳細

[kanagawa-dragon 非変更確認 + 変数セット一致結果]

## Task 10-3: WCAGコントラスト比レビュー詳細

[各カラーペアの再確認結果]

## Task 10-4: CSS変数命名一貫性レビュー詳細

[命名規則準拠確認結果]

## Task 10-5: マイクロインタラクション変数レビュー詳細

[変数と@keyframesの存在・値確認結果]

## Task 10-6: renderWithTheme テストヘルパーレビュー詳細

[テスト実行結果 + コードレビュー結果]

## Task 10-7: テストカバレッジレビュー詳細

[カバレッジ数値と判定]

## MINOR 指摘一覧（該当する場合）

| #   | 指摘内容 | 未タスク仕様書パス |
| --- | -------- | ------------------ |
| 1   | ...      | ...                |

## 次のアクション

- PASS → Phase 11 へ進む
- MINOR → 未タスク仕様書作成完了後、Phase 11 へ進む
- MAJOR → 指定の Phase へ戻る（戻り先: Phase N）
- CRITICAL → Phase 1 へ戻り要件再確認
```

## 完了条件

- [ ] Task 10-1〜10-7 の全レビュー観点が実行済みである
- [ ] 各レビュー観点に PASS / MINOR / MAJOR / CRITICAL の判定が付与されている
- [ ] 総合判定が決定されている
- [ ] MINOR 指摘は全て未タスク仕様書に変換されている（0件の場合は「MINOR指摘なし」と記録）
- [ ] final-review-result.md に全レビュー結果が記録されている
- [ ] テストヘルパーのテスト実行結果が記録されている（`cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme`）
- [ ] 本Phase内の全タスク（Task 10-1〜10-7）を100%実行完了

## サブタスク管理

| サブタスクID | タスク名                               | 状態   | 完了条件                                |
| ------------ | -------------------------------------- | ------ | --------------------------------------- |
| Task 10-1    | Apple HIG System Colors 正確性レビュー | 未着手 | light/dark 全色値が Apple 公式と一致    |
| Task 10-2    | 3テーマ整合性レビュー                  | 未着手 | kanagawa-dragon 非変更 + 変数セット一致 |
| Task 10-3    | WCAGコントラスト比レビュー             | 未着手 | 全カラーペア基準達成 + 制限事項文書化   |
| Task 10-4    | CSS変数命名一貫性レビュー              | 未着手 | 全変数の命名プレフィックス準拠確認      |
| Task 10-5    | マイクロインタラクション変数レビュー   | 未着手 | 5変数 + 2 @keyframes の存在・値確認     |
| Task 10-6    | renderWithTheme テストヘルパーレビュー | 未着手 | 3テーマ動作確認 + テスト全PASS          |
| Task 10-7    | テストカバレッジレビュー               | 未着手 | カバレッジ基準達成確認                  |

## タスク100%実行確認

Phase 10 完了時に以下を確認する:

- [ ] Task 10-1〜10-7 の全てが実行済み
- [ ] 総合判定が決定され、final-review-result.md に記録されている
- [ ] MINOR 指摘がある場合は全て未タスク仕様書に変換済み

## 次のPhase

- **PASS / MINOR** → Phase 11: 手動テスト → `docs/30-workflows/TASK-UI-00-TOKENS/phase-11-manual-test.md`
- **MAJOR** → 影響範囲に応じて Phase 1-5 へ戻る
- **CRITICAL** → Phase 1 へ戻り要件再確認
