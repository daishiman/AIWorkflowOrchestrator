# PR 準備メモ

## タスク情報

- タスクID: UT-SKILL-WIZARD-W2-seq-03b
- 対象: wizard/index.ts エクスポート更新
- 作成日: 2026-04-08

## 変更要約

- `wizard/index.ts` から `DescribeStep` / `DescribeStepProps` を除外
- `SkillInfoStep.tsx` の `SkillInfoStepProps` を export 可能に整理
- `DescribeStep.tsx` の `GenerationMode` 依存を barrel から直接実装元へ切り替え
- `wizard-exports.test.ts` を追加し、公開 API の契約を確認

## 検証結果

- `pnpm --filter @repo/desktop typecheck` : PASS
- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/wizard-exports.test.ts` : 環境依存の `esbuild` 不整合で起動失敗

## レビュー観点

1. `wizard/index.ts` の export 契約が current facts に一致しているか
2. `DescribeStep.tsx` の deprecated 化と依存境界が適切か
3. Phase 11/12 の成果物リンクが canonical filename に揃っているか
4. UI 変更がない前提で screenshot を no-op 扱いにしてよいか

## blocked 条件

- ユーザーの明示承認がないため、`gh pr create` は実行しない

## PR ひな形

- タイトル案: `feat(skill-wizard): wizard/index.ts エクスポート更新（W2-seq-03b）`
- 本文案: `docs/30-workflows/W2-seq-03b-wizard-exports/phase-13-pr-creation.md` を参照
