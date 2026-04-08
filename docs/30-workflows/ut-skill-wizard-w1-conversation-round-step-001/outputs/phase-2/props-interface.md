# Phase 2 成果物: Props インターフェース設計

## ConversationRoundStepProps

```typescript
import type {
  SmartDefaultResult,
  ConversationAnswers,
} from "@repo/shared/types/skillCreator";

export interface ConversationRoundStepProps {
  /** W0-seq-02 で公開された inferSmartDefaults() の結果 */
  smartDefaults: SmartDefaultResult;
  /** 全 6 問への回答完了時に呼ばれるコールバック */
  onComplete: (answers: ConversationAnswers) => void;
  /** ページ 1 の「戻る」（Step 0 へ）コールバック（任意） */
  onBack?: () => void;
}
```

## 型整合確認

| Props フィールド | 型                                       | 根拠                                                  |
| ---------------- | ---------------------------------------- | ----------------------------------------------------- |
| `smartDefaults`  | `SmartDefaultResult`                     | W0-seq-02 完了済み・packages/shared で公開済み        |
| `onComplete`     | `(answers: ConversationAnswers) => void` | AC-8/AC-9 要件 — 6問完了時に ConversationAnswers 渡す |
| `onBack`         | `() => void` (optional)                  | AC-12 要件 — 戻る導線（任意）                         |

## Wave 2 整合確認

- `onComplete` の型は Wave 2（`SkillCreateWizard.tsx`）が期待する `ConversationAnswers` 型と一致する
- `smartDefaults` は Step 0 完了後に `inferSmartDefaults()` の結果として渡される
- `onBack` は Step 0 に戻る導線として使用される
