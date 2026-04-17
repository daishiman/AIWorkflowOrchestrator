# TASK-SW-TODO-001: ConversationRoundStep TODOコメント整理 - 成果物

## 変更ファイルと行番号

- **対象ファイル**: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`
- **変更行**: 456行（変更後は456〜458行の3行コメントに展開）

## 変更前/変更後

### 変更前（1行）

```typescript
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除
const isMainTool = shouldShowMainToolBadge({...});
```

### 変更後（3行）

```typescript
// NOTE: 主ツールバッジは resolveExternalIntegration が selectedOptions[0] 以外の選択方式を採用するまで維持する。
// 削除条件: resolveExternalIntegration の主ツール参照ロジックが変更された時点で
//   shouldShowMainToolBadge / MAIN_TOOL_BADGE_ENABLED を削除し、バッジ表示を直接実装に変更する。
const isMainTool = shouldShowMainToolBadge({...});
```

## 選択したオプション: Option B（TODOを具体的な条件で書き直す）

### 理由

`SkillCreateWizard.tsx:177-183` の `resolveExternalIntegration` が依然として `selectedOptions[0]` を
主ツールとして参照しているため、`shouldShowMainToolBadge` の削除条件（主ツール参照ロジックの変更）は
**まだ満たされていない**。

- Option A（コメント削除 + コード削除）は時期尚早であり、バッジ表示が壊れるリスクがある。
- Option B により、削除タイミングと削除対象（`shouldShowMainToolBadge` / `MAIN_TOOL_BADGE_ENABLED`）を
  明示し、将来の担当者が判断できる状態にする。
- タスク番号 `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の参照は完了済みタスクへの言及として
  意味が薄くなっていたため、具体的な削除条件の記述に置き換えた。
