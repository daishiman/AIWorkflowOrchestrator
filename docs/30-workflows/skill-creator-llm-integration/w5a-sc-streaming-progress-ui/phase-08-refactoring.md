# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 8                                |
| タスクID | TASK-SC-07-STREAMING-PROGRESS-UI |
| 作成日   | 2026-03-22                       |

## 目的

実装コードの品質を向上させる。進捗状態管理の共通ロジックをカスタムHookに抽出し、コンポーネントの責務を明確にする。

## 実行タスク

1. **進捗状態管理のカスタムHook抽出**
   - `GenerateStep.tsx` 内にインライン実装されているリスナーロジックを `useGenerationProgress` Hook に完全移動する
   - コンポーネントが受け取るのは Hook の戻り値のみになるよう整理する
   - `useGenerationProgress` の返却型を明確に定義する

2. **エラー表示コンポーネントの分離**
   - エラー種別（API Key / LLM / Network）ごとのサブコンポーネントを atoms に切り出す
     - `ApiKeyErrorCard.tsx`
     - `LlmErrorCard.tsx`
     - `NetworkErrorCard.tsx`
   - `GenerateStep.tsx` は条件分岐のみ担当する

3. **プログレスバーの再利用可能コンポーネント化**
   - プログレスバーを `packages/ui` の atoms として切り出す（再利用可能な場合）
   - ステップ表示コンポーネントを分離する

4. **型安全性の強化**
   - `any` 型の排除
   - エラーコードを union 型（`'API_KEY_NOT_SET' | 'LLM_ERROR' | 'NETWORK_ERROR'`）で定義する
   - `Record<ErrorCode, ReactNode>` パターンでエラーUIの対応表を管理する（P47対策）

5. **リファクタリング後の動作確認**
   - 全テストが引き続き Green であることを確認する
   - `pnpm typecheck` が通過することを確認する

## 参照資料

- Phase 5 実装ファイル
- `.claude/rules/02-code-quality.md` (コーディング規約)
- `.claude/rules/01-architecture.md` (Atomic Design)
- `.claude/rules/06-known-pitfalls.md` (P47)

## 成果物

- リファクタリング済みの実装ファイル群
- 抽出されたサブコンポーネント（atoms）

## 完了条件

- [ ] `useGenerationProgress` Hook がリスナーロジックを完全にカプセル化している
- [ ] エラー種別ごとのサブコンポーネント（3種）が作成されている
- [ ] `any` 型が排除されている
- [ ] エラーコードが union 型で定義されている
- [ ] リファクタリング後も全テストが Green である
- [ ] `pnpm typecheck` が通過している

## 次のPhase

Phase 9: 品質検証
