# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目       | 値                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| Phase      | 8                                                                                                           |
| タスクID   | TASK-UI-00-TOKENS                                                                                           |
| タスク名   | デザイントークン・テーマ定義（Apple HIG準拠light/darkテーマ・マイクロインタラクション変数・テストヘルパー） |
| 作成日     | 2026-02-22                                                                                                  |
| 前提Phase  | Phase 7（カバレッジ確認）完了済み                                                                           |
| 成果物パス | `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-8/refactoring-log.md`                                    |

## 目的

Phase 4〜7 で Green（テスト全PASS）を達成した tokens.css と renderWithTheme テストコードに対して、TDD の「Refactor」ステップとして**動作を変えずに**構造品質を改善する。CSS変数の命名一貫性、セクションコメント整理、テストコードの構造最適化を実施し、後続タスク（TASK-UI-00-ATOMS / MOLECULES / ORGANISMS）が利用しやすい状態にする。

## 実行タスク

- リファクタリング実施: コメント整備・命名検証・重複排除・テスト構造改善を実行する

### Task 8-1: tokens.css セクションコメント整理

**対象ファイル**: `apps/desktop/src/renderer/styles/tokens.css`

**実行内容**:

1. 3テーマ（kanagawa-dragon / light / dark）のセクションコメントが以下の統一フォーマットに準拠しているか確認する:
   ```css
   /* ─── セクション名 ─── */
   ```
2. セクション順序が全テーマで統一されていることを確認する:
   - Background Colors → Label Colors → Separator Colors → System Tint Colors → Syntax Highlighting
3. kanagawa-dragon テーマのセクションコメントが light / dark と同一フォーマットでない場合、コメントのフォーマットのみ統一する（変数値は変更しない）
4. `:root` のマイクロインタラクション変数セクションのコメントフォーマットを統一する

**変更禁止事項**:

- CSS変数の値は一切変更しない
- CSS変数の名前は変更しない
- `@keyframes` の定義内容は変更しない

### Task 8-2: CSS変数命名一貫性検証

**対象ファイル**: `apps/desktop/src/renderer/styles/tokens.css`

**実行内容**:

1. 全セマンティック変数が以下の命名規則に準拠しているか確認する:
   - 背景系: `--bg-*`
   - テキスト系: `--text-*`
   - ボーダー系: `--border-*`
   - ステータス系: `--status-*`
   - シンタックス系: `--syntax-*`
   - イージング系: `--ease-*`
   - スケール系: `--scale-*`
   - 間隔系: `--spacing-*`
   - 角丸系: `--radius-*`
   - 影系: `--shadow-*`
   - 時間系: `--duration-*`
   - フォント系: `--font-*`（ファミリー）/ `--text-*`（サイズ）
2. 命名規則から外れている変数が存在する場合、ログに記録する（修正はスコープ外とし、修正が必要な場合は未タスク化する）

### Task 8-3: テーマ間の変数重複排除検証

**対象ファイル**: `apps/desktop/src/renderer/styles/tokens.css`

**実行内容**:

1. light テーマと dark テーマで同一値を持つ変数が存在するか確認する
2. 3テーマ共通で同一値を持つ変数がある場合、`:root` への移動候補としてログに記録する
3. 移動が妥当な変数（テーマに依存しない値）がある場合はリファクタリングを実施する
4. テーマ依存の変数（色値）は各テーマブロック内に残す

**判断基準**:

- スペーシング・角丸・フォントサイズ・時間値: テーマ非依存 → `:root` に統一可能
- 色・影: テーマ依存 → 各テーマブロックに残す

### Task 8-4: テストコード構造改善

**対象ファイル**: `apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx`

**実行内容**:

1. `describe` / `it` ブロックの命名が以下の規則に準拠しているか確認する:
   - `describe`: テスト対象の機能名（例: `"renderWithTheme"`）
   - `it`: 期待される動作を英語で記述（例: `"renders with correct theme attribute"`）
2. `describe.each` パターンが3テーマを漏れなく網羅しているか確認する
3. `afterEach` で `data-theme` 属性のクリーンアップが実施されているか確認する（P9対策）
4. テスト間で状態が漏れていないか確認する
5. 改善点がある場合はリファクタリングを実施する

### Task 8-5: SOLID原則適用確認

**対象ファイル**: `apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx`

**実行内容**:

1. **単一責務（SRP）**: `renderWithTheme` 関数が「テーマ設定 + レンダリング」の2責務を持っているが、テストヘルパーとしてはこの粒度が妥当か検証する
2. **開放閉鎖（OCP）**: 新テーマ追加時に `renderWithTheme` の変更が不要であることを確認する（`ResolvedTheme` 型に依存しているため、型定義の追加のみで対応可能であること）
3. 改善が必要な場合はリファクタリングを実施する

## 参照資料

| 参照                                                                           | 目的                       |
| ------------------------------------------------------------------------------ | -------------------------- |
| `apps/desktop/src/renderer/styles/tokens.css`                                  | リファクタリング対象       |
| `apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx`                  | リファクタリング対象       |
| `apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx`             | リファクタリング対象       |
| `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-7/coverage-report.md`       | カバレッジ基準の確認       |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     | トークン体系の設計基準     |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | Apple HIG準拠の設計原則    |
| `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`   | アクセシビリティテスト観点 |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | テスト品質ゲート           |
| `docs/30-workflows/TASK-UI-00-TOKENS/phase-8-refactoring.md`                   | 本仕様書                   |

- 依存Phase成果物参照: `phase-1-*`、`phase-2-*`、`phase-5-*`、`phase-6-*`、`phase-7-*`

## システム仕様（aiworkflow-requirements）

本Phaseは `aiworkflow-requirements` の参照仕様を根拠として進める。適用対象は本書の「参照資料」に列挙した `.claude/skills/aiworkflow-requirements/references/*.md` とし、UI/UX・アクセシビリティ・テスト品質の3観点を完了条件にトレースする。

| 観点             | 抽出した必須要件                              | 反映先                     |
| ---------------- | --------------------------------------------- | -------------------------- |
| UI/UX            | Apple HIG準拠のトークン・テーマ設計を維持する | 実行タスク、完了条件       |
| アクセシビリティ | WCAG 2.1 AA（コントラスト/操作性）を満たす    | 実行タスク、統合テスト連携 |
| 品質保証         | Vitest/品質ゲートを満たす                     | 統合テスト連携、完了条件   |

## 実行手順

| Step | 内容                                                                                                          | 実行方式 |
| ---- | ------------------------------------------------------------------------------------------------------------- | -------- |
| 1    | リファクタリング前のテスト結果をベースラインとして記録する（`cd apps/desktop && pnpm vitest run` を実行）     | 直列     |
| 2    | Task 8-1（セクションコメント整理）を実施する                                                                  | 直列     |
| 3    | Task 8-2（命名一貫性検証）を実施する                                                                          | 直列     |
| 4    | Task 8-3（重複排除検証）を実施する                                                                            | 直列     |
| 5    | Task 8-4（テストコード構造改善）を実施する                                                                    | 直列     |
| 6    | Task 8-5（SOLID原則適用確認）を実施する                                                                       | 直列     |
| 7    | リファクタリング後のテスト結果を確認し、ベースラインと比較する（`cd apps/desktop && pnpm vitest run` を実行） | 直列     |
| 8    | refactoring-log.md に全タスクの結果を記録する                                                                 | 直列     |

## 統合テスト連携

| テスト           | 実行コマンド                                                                    | 期待結果                                        |
| ---------------- | ------------------------------------------------------------------------------- | ----------------------------------------------- |
| テーマ横断テスト | `cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme` | 全テスト PASS（リファクタリング前後で結果同一） |
| 全テスト         | `cd apps/desktop && pnpm vitest run`                                            | 既存テストが壊れていないこと                    |
| ESLint           | `pnpm lint`                                                                     | エラーなし                                      |

## 多角的チェック観点

| 観点                   | 確認内容                                                                      |
| ---------------------- | ----------------------------------------------------------------------------- |
| テスト結果の同一性     | リファクタリング前後でテスト数・PASS数が同一であること                        |
| CSS変数値の非変更      | リファクタリング前後で `git diff` により値の変更がないことを確認              |
| セクションコメント統一 | 3テーマ全てのセクションコメントが統一フォーマットに準拠していること           |
| 命名規則準拠           | 全CSS変数が規定の命名プレフィックスに準拠していること                         |
| テスト間独立性         | `afterEach` による状態クリーンアップが存在すること（P9対策）                  |
| テーマ網羅性           | `describe.each` で kanagawa-dragon / light / dark の3テーマを検証していること |

## 成果物

| #   | 成果物               | パス                                                                     |
| --- | -------------------- | ------------------------------------------------------------------------ |
| 1   | リファクタリングログ | `docs/30-workflows/TASK-UI-00-TOKENS/outputs/phase-8/refactoring-log.md` |

### refactoring-log.md の必須セクション

```markdown
# Phase 8: リファクタリングログ

## ベースライン（リファクタリング前）

- テスト数: N
- PASS数: N
- 実行日時: YYYY-MM-DD HH:mm

## Task 8-1: セクションコメント整理

- 変更有無: あり / なし
- 変更内容: [具体的な変更箇所]

## Task 8-2: 命名一貫性検証

- 規則外の変数: [0件 or 具体的な変数名]
- 対応: [修正済み or 未タスク化]

## Task 8-3: 重複排除検証

- 共通値の変数: [0件 or 具体的な変数名]
- 対応: [移動済み or 現状維持（理由）]

## Task 8-4: テストコード構造改善

- 変更有無: あり / なし
- 変更内容: [具体的な変更箇所]

## Task 8-5: SOLID原則適用確認

- 改善有無: あり / なし
- 改善内容: [具体的な内容]

## 結果（リファクタリング後）

- テスト数: N（ベースラインと同一であること）
- PASS数: N（ベースラインと同一であること）
- 実行日時: YYYY-MM-DD HH:mm
```

## 完了条件

- [ ] リファクタリング前後でテスト数・PASS数が同一である
- [ ] CSS変数の値がリファクタリング前後で変更されていない（`git diff` で確認）
- [ ] tokens.css の3テーマ全てでセクションコメントが統一フォーマットに準拠している
- [ ] CSS変数の命名一貫性検証が完了し、結果がログに記録されている
- [ ] テーマ間の変数重複排除検証が完了し、結果がログに記録されている
- [ ] テストコードの構造改善が完了している
- [ ] SOLID原則適用確認が完了している
- [ ] `cd apps/desktop && pnpm vitest run` で全テスト PASS
- [ ] `pnpm lint` でエラーなし
- [ ] `refactoring-log.md` に全タスクの結果が記録されている
- [ ] 本Phase内の全タスク（Task 8-1〜8-5）を100%実行完了

## サブタスク管理

| サブタスクID | タスク名               | 状態   | 完了条件                                      |
| ------------ | ---------------------- | ------ | --------------------------------------------- |
| Task 8-1     | セクションコメント整理 | 未着手 | 3テーマでフォーマット統一、セクション順序統一 |
| Task 8-2     | 命名一貫性検証         | 未着手 | 全変数の命名プレフィックス確認完了            |
| Task 8-3     | 重複排除検証           | 未着手 | テーマ間共通値の確認・対応完了                |
| Task 8-4     | テストコード構造改善   | 未着手 | describe/it命名統一、クリーンアップ確認       |
| Task 8-5     | SOLID原則適用確認      | 未着手 | SRP/OCP確認完了                               |

## タスク100%実行確認

Phase 8 完了時に以下を確認する:

- [ ] Task 8-1〜8-5 の全てが実行済み（「対応なし」も結果として記録）
- [ ] refactoring-log.md に全タスクの結果が漏れなく記録されている
- [ ] ベースラインとリファクタリング後のテスト結果比較が記録されている

## 次のPhase

Phase 9: 品質保証 → `docs/30-workflows/TASK-UI-00-TOKENS/phase-9-quality-assurance.md`
