# Phase 7: カバレッジ計画・計測結果

## 計測対象宣言（BEFORE-QUIT-002 対応）

```
計測対象:
  - packages/shared/src/types/skill-wizard-label-map.ts（新規）
  - apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx（修正部分）

計測対象外:
  - その他の全ファイル（変更なし）
```

## 実測カバレッジ

### ConversationRoundStep.tsx（全体）

| 指標       | 実測値 | 目標        | 達成             |
| ---------- | ------ | ----------- | ---------------- |
| Statements | 89.82% | 変更行 100% | ✅（変更行のみ） |
| Branch     | 83.62% | 変更行 90%+ | ✅（変更行のみ） |
| Functions  | 77.27% | 変更行 100% | ✅（変更行のみ） |
| Lines      | 89.82% | 変更行 100% | ✅（変更行のみ） |

**注**: 全体数値は変更していない既存コード（handleTimezoneChange 等）を含む。変更行（createQuestionAnswer, applySmartDefaults）は 100% カバー。

### skill-wizard-label-map.ts（新規・解析的確認）

| 指標   | 実測値         | 目標 | 達成 |
| ------ | -------------- | ---- | ---- |
| Line   | 100%（解析的） | 100% | ✅   |
| Branch | 100%（解析的） | 90%+ | ✅   |

**根拠**: `resolveSemanticLabel()` の全分岐がテストでカバーされている：

- `value === undefined` → TC-04
- `!questionMap`（未定義 questionId） → TC-05
- `questionMap[value]` 一致 → TC-01, TC-02, TC-03
- `questionMap[value]` 不一致（フォールバック） → TC-06

v8 カバレッジツールは `apps/desktop` 外のファイルを直接計測できないため解析的確認。

## 実行コマンド

```bash
pnpm exec vitest run \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx \
  --coverage \
  --coverage.include="src/renderer/components/skill/wizard/ConversationRoundStep.tsx"
```
