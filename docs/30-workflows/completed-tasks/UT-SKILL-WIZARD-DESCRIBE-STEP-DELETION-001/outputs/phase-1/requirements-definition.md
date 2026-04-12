# 要件定義書 - DescribeStep.tsx / DescribeStep.test.tsx 物理削除

## タスクID: UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001

## 現行状態の確認（P50チェック）

### 削除対象ファイルの存在確認

| ファイル              | 存在        | パス                                                                                |
| --------------------- | ----------- | ----------------------------------------------------------------------------------- |
| DescribeStep.tsx      | ✅ 存在する | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                |
| DescribeStep.test.tsx | ✅ 存在する | `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx` |

### 重要な発見（前提条件との差異）

仕様書では「W2-seq-03b にて `wizard/index.ts` からのエクスポートを削除済み」とされていたが、
実際には **`wizard/index.ts` にまだ以下のエクスポートが残存している**：

```typescript
export { DescribeStep } from "./DescribeStep";
export type { DescribeStepProps } from "./DescribeStep";
```

この差異は Phase 5 の実装で対処する（index.ts からの削除も実施する）。

## 機能要件

| ID    | 要件                                                                          |
| ----- | ----------------------------------------------------------------------------- |
| FR-01 | `DescribeStep.tsx` がファイルシステム上に存在しない                           |
| FR-02 | `DescribeStep.test.tsx` がファイルシステム上に存在しない                      |
| FR-03 | `wizard/index.ts` に `DescribeStep` のエクスポートが含まれない                |
| FR-04 | `DescribeStep` を import している全ファイルが存在しない                       |
| FR-05 | `wizard-exports.test.ts` の DescribeStep 非存在テストが新規作成され、パスする |

## 非機能要件

| ID     | 要件                                     |
| ------ | ---------------------------------------- |
| NFR-01 | 削除による既存テストへの回帰がないこと   |
| NFR-02 | `pnpm typecheck` が通過すること          |
| NFR-03 | CI/CD パイプラインで問題なく動作すること |

## 受入基準（AC-1〜AC-5）

| ID   | 基準                                                  | 検証方法           |
| ---- | ----------------------------------------------------- | ------------------ |
| AC-1 | `DescribeStep.tsx` が存在しない                       | `ls` が失敗する    |
| AC-2 | `DescribeStep.test.tsx` が存在しない                  | `ls` が失敗する    |
| AC-3 | `pnpm typecheck` がエラーなく通過する                 | exit code 0        |
| AC-4 | `DescribeStep` を import している箇所がない           | grep 結果が空      |
| AC-5 | `wizard-exports.test.ts` のテストが新規作成・パスする | `pnpm test` でPASS |

## 参照確認結果（import/export 残留確認）

### `import.*DescribeStep` パターン（重要）

実際の import 参照が存在するファイル：

- `wizard/index.ts`：`export { DescribeStep } from "./DescribeStep"` （削除必要）
- `wizard/__tests__/DescribeStep.test.tsx`：`import { DescribeStep } from "../DescribeStep"` （ファイルごと削除）

### コメント・文字列としての言及（import/export ではない）

- `SkillCreateWizard.tsx`：コメント内に "Step 0: DescribeStep → SkillInfoStep" （変更不要）
- `SkillCreateWizard.*.test.tsx`：テスト説明文に "DescribeStep" 文字列（変更不要）
- coverage HTML ファイル：生成物のため対象外

**結論**: 実際の `import.*DescribeStep` 参照は `wizard/index.ts` と `DescribeStep.test.tsx` のみ。
両ファイルの対処（エクスポート削除・ファイル削除）で参照ゼロを達成できる。

## wizard-exports.test.ts 作成前提

`apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts` は未作成。
Phase 4 で新規作成する。
