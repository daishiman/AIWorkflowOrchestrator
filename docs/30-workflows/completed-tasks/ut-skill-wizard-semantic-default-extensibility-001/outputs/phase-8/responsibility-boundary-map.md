# Phase 8: 責務境界マップ

## 依存方向（単方向）

```
apps/desktop (ConversationRoundStep.tsx)
    ↓ import
packages/shared (skill-wizard-label-map.ts)
```

逆依存なし。shared → desktop の参照は発生していない。

## 責務分担

| モジュール                                            | 責務                                                  | 変更頻度          |
| ----------------------------------------------------- | ----------------------------------------------------- | ----------------- |
| `packages/shared/src/types/skill-wizard-label-map.ts` | rawValue → displayLabel 変換テーブルの定義・保守      | q7 以降追加時のみ |
| `apps/desktop/.../ConversationRoundStep.tsx`          | ウィザード UI・スマートデフォルト適用・ページング制御 | UI 変更時         |
| `apps/desktop/.../ConversationRoundStep.test.tsx`     | 変換ロジック・UI 動作の単体テスト                     | 仕様変更時        |

## 変換テーブル拡張手順

将来 q7 以降が追加された場合の手順:

1. `packages/shared/src/types/skill-wizard-label-map.ts` の `SEMANTIC_LABEL_MAP` に q7 エントリを追記
2. `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` の `QUESTIONS` 配列に q7 定義を追加
3. `applySmartDefaults` 内に q7 の変換ロジックを追加
4. テストに TC（q7 対応）を追加

コンポーネント本体（`createQuestionAnswer`・`resolveSemanticLabel`）の変更は不要。
