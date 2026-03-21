# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 8                            |
| 機能名   | ut-slide-ui-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 作成日   | 2026-03-21                   |

## 目的

テストが全 PASS の状態を維持しながら、コード品質を改善する。SRP 準拠の責務分離、DRY 原則に基づく共通パターン抽出、Apple HIG System Colors のデザイントークン化を実施する。

## 実行タスク

| #   | タスク名                            | 目的                                                   |
| --- | ----------------------------------- | ------------------------------------------------------ |
| 1   | コンポーネントの責務分離確認（SRP） | 各コンポーネントが単一責務を満たしているか検証         |
| 2   | 共通パターンの抽出                  | Badge色マッピング、CTA スタイルの重複排除              |
| 3   | variantStyles の Record 外部定義    | P47対策: テスト側から import 参照可能にする            |
| 4   | 命名一貫性確認                      | Props名、セレクタ名、型名の命名規則統一                |
| 5   | 不要な import / export の削除       | 未使用コードの除去                                     |
| 6   | Tailwind クラス整理                 | Apple HIG System Colors の CSS 変数化検討              |
| 7   | リファクタリング後のテスト再実行    | 全テスト PASS を確認し、リグレッションがないことを保証 |

- リファクタリング: SRP、重複削減、命名統一、スタイル整理、回帰確認で複雑性を下げる。

## 参照資料

| 資料                                                                   | 用途                                  |
| ---------------------------------------------------------------------- | ------------------------------------- |
| `docs/30-workflows/ut-slide-ui-001/phase-1-requirements.md`            | Phase 1 受入基準の維持確認            |
| `docs/30-workflows/ut-slide-ui-001/phase-2-design.md`                  | Phase 2 設計意図の再確認              |
| `docs/30-workflows/ut-slide-ui-001/phase-5-implementation.md`          | 実装差分の確認                        |
| `docs/30-workflows/ut-slide-ui-001/phase-6-test-expansion.md`          | Phase 6 テスト補強内容の確認          |
| `apps/desktop/src/renderer/slide/components/*.tsx`                     | リファクタリング対象コンポーネント    |
| `apps/desktop/src/renderer/slide/types.ts`                             | 型定義の命名確認                      |
| `apps/desktop/src/renderer/slide/selectors.ts`                         | セレクタ名の命名確認                  |
| `.claude/rules/01-architecture.md`                                     | Apple HIG カラーパレット定義          |
| `.claude/rules/02-code-quality.md`                                     | コーディング規約                      |
| `.claude/rules/06-known-pitfalls.md#P47`                               | variantStyles Record 外部定義パターン |
| `.claude/rules/06-known-pitfalls.md#P48`                               | useShallow 適用基準                   |
| `docs/30-workflows/ut-slide-ui-001/phase-7-coverage-check.md`          | Phase 7 判定基準の確認                |
| `docs/30-workflows/ut-slide-ui-001/outputs/phase-7/coverage-report.md` | カバレッジ確認結果（Phase 7 成果物）  |

## 実行手順

### Task 1: コンポーネントの責務分離確認（SRP）

1. 各コンポーネントのファイルを読み込み、責務を列挙する
   - `SlideSyncCard.tsx`: 同期状態カードの表示
   - `SlideProgressRow.tsx`: 進捗行の表示
   - `SlideWatchStatus.tsx`: 監視ステータスの表示
   - `SlideGuidanceBlock.tsx`: ガイダンスブロックの表示
   - `TerminalLauncher.tsx`: ターミナル起動の表示
2. 1コンポーネントに複数責務が混在していないか確認する
3. ビジネスロジックがコンポーネント内に埋め込まれている場合、selectors.ts またはユーティリティ関数に抽出する
4. 抽出後、関連テストを実行して PASS を確認する

### Task 2: 共通パターンの抽出

1. Badge 色マッピングが複数コンポーネントに散在していないか `grep -rn "badge\|Badge\|variant" apps/desktop/src/renderer/slide/components/` で検索する
2. 共通の色マッピングを `Record<StatusType, string>` 型の定数として抽出する
3. CTA（Call To Action）ボタンのスタイルパターンが統一されているか確認する
4. 統一されていない場合、共通スタイル定数を作成する
5. 抽出後、関連テストを実行して PASS を確認する

### Task 3: variantStyles の Record 外部定義（P47対策）

1. 各コンポーネント内にインラインで定義されている variantStyles を特定する
2. `export const variantStyles: Record<Variant, string>` の形式でモジュールスコープに移動する
3. テスト側から `import { variantStyles } from "./Component"` で参照可能であることを確認する
4. テストコード内のハードコード文字列を variantStyles 参照に置換する
5. テスト実行で全 PASS を確認する

### Task 4: 命名一貫性確認

1. Props 型名: `{ComponentName}Props` の形式で統一されているか確認する
2. セレクタ名: `useSlide{Domain}` の形式で統一されているか確認する
3. 型名: `Slide{Domain}{Type}` の形式で統一されているか確認する
4. boolean 変数名: `is` / `has` / `can` / `should` プレフィックスが付いているか確認する
5. 不統一がある場合は修正し、テスト側も合わせて修正する

### Task 5: 不要な import / export の削除

1. `grep -rn "^import" apps/desktop/src/renderer/slide/` で全 import を列挙する
2. 未使用の import を特定して削除する
3. `grep -rn "^export" apps/desktop/src/renderer/slide/` で全 export を列挙する
4. 外部から参照されていない export を特定して削除する（テストからの参照も確認）
5. テスト実行で全 PASS を確認する

### Task 6: Tailwind クラス整理

1. Apple HIG System Colors のカラー値がハードコードされている箇所を特定する
2. CSS 変数（`var(--color-xxx)`）またはデザイントークンで管理されているか確認する
3. ハードコード値がある場合、CSS 変数への置換を検討する
4. 8px グリッド準拠のスペーシング（`p-2`, `m-4`, `gap-2` 等）が統一されているか確認する
5. 角丸（`rounded-lg` = 8px, `rounded-xl` = 12px）がコンポーネント間で統一されているか確認する

### Task 7: リファクタリング後のテスト再実行

1. `cd apps/desktop && pnpm vitest run src/renderer/slide/` で全テスト実行する
2. 全テスト PASS を確認する
3. カバレッジが Phase 7 基準（Line 80%+, Branch 60%+, Function 80%+）を維持していることを確認する
4. リグレッションがある場合は修正して再実行する

## 統合テスト連携

- Phase 7 で確認したカバレッジ基準を維持していることをリファクタリング後に再確認する
- リファクタリングによる機能変更は行わない（テストの期待値は変わらない）
- variantStyles の外部定義化に伴い、テスト側の import パスを更新する

## 多角的チェック観点

| 観点         | 確認内容                                                    | 判定基準                                          |
| ------------ | ----------------------------------------------------------- | ------------------------------------------------- |
| SRP          | 1コンポーネント1責務が守られているか                        | ビジネスロジックが UI 層に混在していない          |
| DRY          | Badge色マッピングが複数箇所に散在していないか               | 共通 Record 定数に集約されている                  |
| P47          | variantStyles が export されテスト参照可能か                | テスト側が import で参照している                  |
| P48          | useShallow が必要な派生セレクタに適用されているか           | `.filter()` / `.map()` セレクタに useShallow あり |
| Apple HIG    | カラー値が CSS 変数またはデザイントークンで管理されているか | ハードコードカラー値がない                        |
| 命名規則     | Props / セレクタ / 型の命名が統一されているか               | 規約に準拠している                                |
| 未使用コード | 不要な import / export が残っていないか                     | ESLint 警告がゼロ                                 |
| テスト維持   | リファクタリング後に全テスト PASS か                        | カバレッジ基準を維持                              |

## 成果物

| ファイル                                     | 説明                                   |
| -------------------------------------------- | -------------------------------------- |
| `outputs/phase-8/refactoring-report.md`      | リファクタリング実施内容と結果レポート |
| リファクタリング済みコンポーネントファイル群 | 品質改善後のソースコード               |

## 完了条件

- [ ] Task 1: 全コンポーネントが SRP を満たしている
- [ ] Task 2: Badge色マッピング・CTA スタイルが共通 Record 定数に集約されている
- [ ] Task 3: variantStyles がモジュールスコープで export され、テストから参照されている
- [ ] Task 4: Props名・セレクタ名・型名・boolean変数名の命名が統一されている
- [ ] Task 5: 未使用の import / export が削除されている
- [ ] Task 6: Apple HIG カラー値が CSS 変数またはデザイントークンで管理されている
- [ ] Task 7: 全テスト PASS かつカバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）維持
- [ ] refactoring-report.md が作成されている

## サブタスク管理

- [ ] Task 1: コンポーネントの責務分離確認（SRP）
- [ ] Task 2: 共通パターンの抽出
- [ ] Task 3: variantStyles の Record 外部定義（P47対策）
- [ ] Task 4: 命名一貫性確認
- [ ] Task 5: 不要な import / export の削除
- [ ] Task 6: Tailwind クラス整理
- [ ] Task 7: リファクタリング後のテスト再実行

## タスク100%実行確認

- [ ] 全 Task が完了している
- [ ] 完了条件が全てチェック済みである
- [ ] 成果物が全て生成されている
- [ ] テストが全 PASS である
- [ ] リファクタリングによる機能変更がないことを確認した

## 次のPhase

Phase 9: 品質保証（`phase-9-quality-assurance.md`）に進む。
