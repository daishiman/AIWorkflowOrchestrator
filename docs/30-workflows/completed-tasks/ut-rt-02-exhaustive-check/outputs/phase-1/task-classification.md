# Phase 1: タスク分類・受け入れ基準

## タスク分類

| 分類項目   | 判定                           | 理由                                            |
| ---------- | ------------------------------ | ----------------------------------------------- |
| タスク種別 | 実装タスク（リファクタリング） | RuntimeSkillCreatorFacade.ts のコード変更を伴う |
| UI変更     | NON_VISUAL                     | Main Process の内部変更のみ、UI変更なし         |
| テスト戦略 | ユニットテスト主体             | Vitest で自動テスト実施                         |

## 受け入れ基準（Acceptance Criteria）

| AC ID | 基準                                                                   | 検証方法                                |
| ----- | ---------------------------------------------------------------------- | --------------------------------------- |
| AC-1  | `executeAsync()` が switch 文 + `assertNever` パターンで実装されている | コードレビュー                          |
| AC-2  | `assertNever` が switch の default case に配置されている               | コードレビュー                          |
| AC-3  | union 型に仮バリアントを追加するとコンパイルエラーが発生する           | `pnpm typecheck` で確認                 |
| AC-4  | 既存テスト T-01〜T-06 が全て PASS する（回帰なし）                     | `pnpm vitest run <testfile>`            |
| AC-5  | TypeScript 型チェックエラー 0 件                                       | `pnpm --filter @repo/desktop typecheck` |
| AC-6  | ESLint エラー 0 件                                                     | `pnpm --filter @repo/desktop lint`      |

## Phase 1 完了確認

- [x] assertNever の有無が確認済み（プロジェクト全体に存在しない）
- [x] union 型の全バリアントが列挙されている（A/B/C 3バリアント）
- [x] 各バリアントの判別子プロパティの型が確認済み（B は literal、A は boolean、C は false literal）
- [x] executeAsync() の現在の分岐構造が把握済み（isStructuredError パターン）
- [x] タスク分類（NON_VISUAL / リファクタリング）が宣言されている
- [x] 受け入れ基準（AC-1〜AC-6）が記録されている
- [x] 本Phase内の全タスクを100%実行完了
