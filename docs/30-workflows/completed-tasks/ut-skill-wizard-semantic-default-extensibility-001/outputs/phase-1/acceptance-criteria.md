# Phase 1: 受け入れ基準

## AC-1: QuestionSemanticLabelMap 型のインポート

- 条件: `import { QuestionSemanticLabelMap, SEMANTIC_LABEL_MAP } from "@repo/shared/types/skillWizard"` がコンパイルエラーなし
- 検証: `pnpm --filter @repo/shared typecheck` および `pnpm --filter @repo/desktop typecheck` が型エラー0件

## AC-2: ハードコードテーブルの排除

- 条件: `ConversationRoundStep.tsx` に以下のパターンが存在しない
  - `normalizedTool === "slack"` などの直接比較
  - `defaultValue === "scheduled"` の直接比較（SEMANTIC_LABEL_MAP に移動）
- 検証コマンド: `grep -n '"slack"\|"github"\|"scheduled"' apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` で変換テーブルコードが0件

## AC-3: テスト件数・PASS確認

- 条件: `applySmartDefaults()` に関するテストが 10件以上存在し、全件 PASS
- 検証: `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx --reporter=verbose`

## AC-4: 正準形マッピング表のドキュメント化

- 条件: `outputs/phase-3/design-decisions.md` に q1〜q6 の正準形マッピング表が存在する
- 検証: ファイル内容確認

## AC-5: 回帰テスト通過

- 条件: Phase 5 実装後に既存テスト（36件以上）が全件 PASS
- 検証: `pnpm vitest run` で全件 PASS
