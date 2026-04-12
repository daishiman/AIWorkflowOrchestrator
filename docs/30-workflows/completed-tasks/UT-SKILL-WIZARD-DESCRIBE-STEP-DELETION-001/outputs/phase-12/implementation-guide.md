# 実装ガイド - DescribeStep.tsx / DescribeStep.test.tsx 物理削除

## タスクID: UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001

---

## Part 1: 中学生レベルの説明

### どうして古いファイルを消すの？

使わなくなったファイルを残すと、「まだ使うのかな？」と迷いやすくなります。
このタスクでは、画面の古い部品だった `DescribeStep.tsx` と、
それを確認するための古いテスト `DescribeStep.test.tsx` を消しました。

古い部品に「もう使わない」という印をつけただけでは、棚に古い教科書を残しているのと同じです。
本当にもう使わないと分かったら、片付けてしまった方が分かりやすくなります。

### 日常の例え話

学校のロッカーに、去年の部活で使った道具が残っているとします。
誰も使わないなら、名前札を貼ったまま残すより、きちんと片付けた方が場所も気持ちもすっきりします。
このタスクでは、その片付けにあたる作業をしました。

---

## Part 2: 技術者向け説明

### 変更内容サマリー

| ファイル                                                                                  | 変更種別     | 理由                                                                       |
| ----------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                      | **削除**     | @deprecated 付与済み・barrel export から除外済み・SkillInfoStep に置換済み |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx`       | **削除**     | DescribeStep.tsx の companion test のため同時削除                          |
| `apps/desktop/src/renderer/components/skill/wizard/index.ts`                              | **編集**     | DescribeStep / DescribeStepProps のエクスポート行を削除                    |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts`      | **新規作成** | barrel contract ガードテスト（DescribeStep 非存在の永続保証）              |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.typecheck.ts` | **新規作成** | type-only export の compile-time ガード                                    |

### wizard/index.ts の変更

削除した行：

```typescript
export { DescribeStep } from "./DescribeStep";
export type { DescribeStepProps } from "./DescribeStep";
```

### wizard-exports.test.ts（新規作成）

`DescribeStep` が `wizard/index.ts` から再露出しないことを保証する contract guard テスト。
9テストケースで barrel export の整合性を検証する。

### wizard-exports.typecheck.ts（新規作成）

`DescribeStepProps` のような type-only export は runtime の property check だけでは検出できないため、
`@ts-expect-error` を使った compile-time guard を別ファイルで維持する。

### 受入基準充足状況

| AC   | 基準                                             | 結果                      |
| ---- | ------------------------------------------------ | ------------------------- |
| AC-1 | DescribeStep.tsx が存在しない                    | ✅ PASS                   |
| AC-2 | DescribeStep.test.tsx が存在しない               | ✅ PASS                   |
| AC-3 | pnpm typecheck がエラーなく通過                  | ✅ PASS                   |
| AC-4 | DescribeStep を import している箇所がない        | ✅ PASS                   |
| AC-5 | wizard-exports.test.ts / typecheck guard が PASS | ✅ PASS（runtime + type） |

### 注意事項

`scoring-gate.test.ts` が `@repo/shared/types/skill-improver` 欠落で失敗しているが、
これは本タスクの変更とは無関係の既存問題である。

---

## 関連 Issue

Issue #2054（CLOSED）- DescribeStep.tsx 物理削除
