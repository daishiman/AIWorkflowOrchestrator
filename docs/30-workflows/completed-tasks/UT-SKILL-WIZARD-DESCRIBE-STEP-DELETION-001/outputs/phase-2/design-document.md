# 設計書 - DescribeStep.tsx / DescribeStep.test.tsx 物理削除

## タスクID: UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001

## 実行シーケンス

```
Step 1: wizard/index.ts からのエクスポート削除
  - export { DescribeStep } from "./DescribeStep"; を削除
  - export type { DescribeStepProps } from "./DescribeStep"; を削除
  ↓ Phase 1 で確認済み（前提条件との差異として記録）

Step 2: barrel contract ガードの準備
  wizard-exports.test.ts を Phase 4 で新規作成
  DescribeStep 非存在の contract を固定する

Step 3: 物理削除
  git rm apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx
  git rm apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx

Step 4: 型チェック
  pnpm typecheck
  ↓ エラーなし

Step 5: テスト実行
  pnpm test
  ↓ wizard-exports.test.ts が PASS
```

## 変更対象ファイル

| ファイル                                                                            | 変更種別 | 変更内容                                              |
| ----------------------------------------------------------------------------------- | -------- | ----------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/index.ts`                        | 編集     | DescribeStep / DescribeStepProps エクスポート行を削除 |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                | 削除     | 物理削除                                              |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx` | 削除     | companion test 物理削除                               |

## Concern Topology

| Concern | 内容                                              | 前提 | 後続 |
| ------- | ------------------------------------------------- | ---- | ---- |
| C-01    | wizard/index.ts からのエクスポート削除            | -    | C-02 |
| C-02    | DescribeStep.tsx / DescribeStep.test.tsx 物理削除 | C-01 | C-03 |
| C-03    | 型チェック・テスト通過確認                        | C-02 | -    |

## リスク評価

| リスク                               | 確率 | 影響 | 対策                                        |
| ------------------------------------ | ---- | ---- | ------------------------------------------- |
| 参照残存による型エラー               | 低   | 高   | 削除前に grep で参照ゼロを確認              |
| wizard-exports.test.ts 未作成        | 低   | 中   | Phase 4 で先行作成                          |
| wizard/index.ts エクスポート削除漏れ | 中   | 高   | Step 1 で明示的に実施（前提条件差異のため） |
