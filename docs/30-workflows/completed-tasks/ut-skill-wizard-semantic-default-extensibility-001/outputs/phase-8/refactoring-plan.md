# Phase 8: リファクタリング記録

## Before/After テーブル

| 対象                                | Before                                     | After                                            | 理由                                          |
| ----------------------------------- | ------------------------------------------ | ------------------------------------------------ | --------------------------------------------- |
| resolveSemanticLabel 変換テーブル   | ConversationRoundStep.tsx 内にハードコード | SEMANTIC_LABEL_MAP への参照に変更                | 管理責務を shared に集約                      |
| createQuestionAnswer シグネチャ     | `(defaultValue, options)`                  | `(defaultValue, options, questionId, labelMap?)` | questionId による変換テーブル参照を可能にする |
| applySmartDefaults                  | ファイル内非公開関数                       | `export function` に変更                         | テストから直接検証可能にする                  |
| outputs/phase-3/design-decisions.md | 存在しない                                 | 正準形マッピング表 + 設計根拠を追記              | AC-4 対応                                     |

## コードクリーンアップ確認

| 確認項目                               | 結果                                                            |
| -------------------------------------- | --------------------------------------------------------------- |
| 旧ハードコード残骸（案・だけ・のみ等） | 0件（grep 確認済み）                                            |
| resolveSemanticLabel の JSDoc          | 実装済み（packages/shared/src/types/skill-wizard-label-map.ts） |
| 不要 import                            | なし（TypeScript コンパイル通過）                               |

## 再テスト結果

```
Test Files  1 passed (1)
Tests  72 passed (72)
```

全件 PASS。リファクタリングによるリグレッションなし。
