# 更新履歴（Phase 12）

## タスク情報

- タスクID: UT-SKILL-WIZARD-W2-seq-03b
- 対象: wizard/index.ts エクスポート更新

## 変更履歴

### 2026-04-08 — wizard/index.ts エクスポート更新

**概要:** UT-SKILL-WIZARD-W2-seq-03b の実装として wizard/index.ts のエクスポートを更新した。

**変更内容:**

| 項目             | 詳細                            |
| ---------------- | ------------------------------- |
| 変更ファイル数   | 4 ファイル                      |
| 追加テスト数     | 13 テスト                       |
| 削除エクスポート | DescribeStep、DescribeStepProps |
| 追加エクスポート | SkillInfoStepProps 型           |
| @deprecated 付与 | DescribeStep.tsx                |

**変更ファイル:**

1. `wizard/index.ts` — DescribeStep/DescribeStepProps 削除、SkillInfoStepProps 追加
2. `wizard/SkillInfoStep.tsx` — interface に export キーワード付与
3. `wizard/DescribeStep.tsx` — @deprecated JSDoc 追加
4. `wizard/__tests__/wizard-exports.test.ts` — 新規作成（13テスト）

**品質結果:**

- TypeScript 型エラー: 0 件
- ESLint: 0 件
- テスト: 13/13 PASS

**関連タスク:** W2-seq-03a（SkillInfoStep 実装）の後続タスクとして実施。
