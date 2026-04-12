# Phase 2: アーキテクチャ設計

## 依存方向

```
@repo/desktop
  └── apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
        └── @repo/shared/types/skillWizard (新規依存)
              └── packages/shared/src/types/skill-wizard-label-map.ts
```

逆依存なし（shared → desktop の依存は発生しない）。

## 改修方針

### Before

```
ConversationRoundStep.tsx
  └── createQuestionAnswer()
        ├── if (defaultValue === "scheduled") → "定期実行"  [ハードコード]
        ├── if (normalizedTool === "slack") → "Slack"       [ハードコード]
        ├── if (normalizedTool === "github") → "GitHub"     [ハードコード]
        └── if (normalizedTool === "notion") → "その他"     [ハードコード + freeText]
```

### After

```
ConversationRoundStep.tsx
  └── createQuestionAnswer(defaultValue, options, questionId, labelMap?)
        ├── notion 特別ケース（freeText付き）             [コード残存、仕様上許容]
        └── resolveSemanticLabel(normalizedKey, questionId, labelMap)
              └── SEMANTIC_LABEL_MAP[@repo/shared] ルックアップ

@repo/shared/types/skillWizard
  ├── QuestionSemanticLabelMap 型
  ├── SEMANTIC_LABEL_MAP 定数
  └── resolveSemanticLabel() 関数 (純粋関数・エクスポート)
```

## エクスポート方針

Phase 1 インベントリの混在命名を踏まえ、**subpath export** に閉じる:

- `@repo/shared/types/skillWizard` → `packages/shared/src/types/skill-wizard-label-map.ts`
- root barrel (`packages/shared/index.ts`) への追加なし（名前衝突リスク回避）

## resolveSemanticLabel の配置

`packages/shared/src/types/skill-wizard-label-map.ts` に配置しエクスポートする。
（Phase 5 仕様書では ConversationRoundStep.tsx 内定義とあるが、
テスト容易性・責務分離の観点から shared に配置する方が適切と判断）
