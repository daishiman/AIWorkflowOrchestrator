# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 7                                |
| タスクID | TASK-SC-07-STREAMING-PROGRESS-UI |
| 作成日   | 2026-03-22                       |

## 目的

`GenerateStep.tsx` および関連 Hook のテストカバレッジが基準値（Line 80% / Branch 60% / Function 80%）を充足していることを確認する。未達の場合は Phase 6 に戻る。

## 実行タスク

1. **カバレッジ計測の実行**
   - 対象パッケージのディレクトリから実行する（P40対策）
   - コマンド: `cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/wizard/GenerateStep.tsx src/renderer/hooks/useGenerationProgress.ts src/renderer/hooks/useCancelGeneration.ts`

2. **カバレッジレポートの確認**
   - Line Coverage: 80%以上
   - Branch Coverage: 60%以上
   - Function Coverage: 80%以上

3. **未達箇所の特定**
   - Branch Coverage が低い場合: エラーパスの分岐が未テストの可能性が高い
   - Function Coverage が低い場合: v8プロバイダのインライン関数カウントを確認（P41対策）

4. **ゲート判定**
   - 全指標が基準値以上: Phase 8 へ
   - いずれかが未達: Phase 6 に戻り追加テストを作成する

## 参照資料

- Phase 6 テスト拡充結果
- `.claude/rules/02-code-quality.md` (カバレッジ基準)
- `.claude/rules/06-known-pitfalls.md` (P40, P41)

## 成果物

- カバレッジレポート（スクリーンショットまたはテキスト出力）
- 未達箇所のリスト（未達の場合のみ）

## 完了条件

- [ ] カバレッジ計測が対象パッケージのディレクトリから実行されている（P40対策）
- [ ] Line Coverage が 80% 以上である
- [ ] Branch Coverage が 60% 以上である
- [ ] Function Coverage が 80% 以上である
- [ ] ゲート判定が記録されている（PASS または Phase 6 へ戻る）

## 次のPhase

Phase 8: リファクタリング（カバレッジ基準達成の場合）
