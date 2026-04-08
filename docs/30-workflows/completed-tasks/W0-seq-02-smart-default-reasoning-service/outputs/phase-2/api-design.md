# APIシグネチャ設計

## タスク情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| Phase    | 2                                              |

## 関数シグネチャ

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

## インターフェース整合確認

| 型名                 | 定義場所                                    | 本サービスでの利用方法 |
| -------------------- | ------------------------------------------- | ---------------------- |
| `SkillInfoFormData`  | `packages/shared/src/types/skillCreator.ts` | 関数引数               |
| `SmartDefaultResult` | `packages/shared/src/types/skillCreator.ts` | 関数返り値             |

## ファイル構造設計

```
packages/shared/src/services/skillCreator/
  smartDefaultReasoningService.ts       # 推論サービス本体
  index.ts                              # barrel（新規）
  __tests__/
    smartDefaultReasoningService.test.ts # ユニットテスト
packages/shared/index.ts                 # root barrel（@repo/shared からの公開）
```

## フォールバック設計

| フォールバックケース                         | 挙動                                           |
| -------------------------------------------- | ---------------------------------------------- |
| `input.purpose` が undefined / null          | `tool`・`timing` = null（category 推論は継続） |
| `input.purpose` が空文字 ""                  | `tool`・`timing` = null（category 推論は継続） |
| `input.category` が undefined / null         | `result.format = null`                         |
| `purpose`・`category` のいずれも推論できない | `inferenceLog = []`                            |
| `input.purpose` に複数ツール名が含む         | 先に一致したツールのみ採用（先勝ちルール）     |
