# Phase 2: API設計 — UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

## APIシグネチャ

```typescript
/**
 * ユーザー入力（SkillInfoFormData）からスマートデフォルトを推論する
 * @param input スキル情報入力フォームの値
 * @returns SmartDefaultResult 推論結果（推論不能フィールドは null）
 */
export function inferSmartDefaults(
  input: SkillInfoFormData,
): SmartDefaultResult;
```

## ファイル構造

```
packages/shared/src/services/skillCreator/
  smartDefaultReasoningService.ts       # 推論サービス本体
  index.ts                              # barrel（inferSmartDefaults を named export）
  __tests__/
    smartDefaultReasoningService.test.ts
```

## インターフェース整合

| 型名                 | 定義場所                                    | 利用方法   |
| -------------------- | ------------------------------------------- | ---------- |
| `SkillInfoFormData`  | `packages/shared/src/types/skillCreator.ts` | 関数引数   |
| `SmartDefaultResult` | `packages/shared/src/types/skillCreator.ts` | 関数返り値 |

## 実装詳細

内部推論ヘルパーを3関数に分離:

- `inferTool(purpose: string)` — 先勝ちルールでツール推論
- `inferTiming(purpose: string)` — 正規表現でタイミング推論
- `inferFormat(category)` — カテゴリからフォーマット推論
- `normalizePurpose(value)` — null/undefined/空白を正規化
