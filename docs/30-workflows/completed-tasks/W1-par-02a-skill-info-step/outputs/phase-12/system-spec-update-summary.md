# Phase 12 成果物: システム仕様更新サマリー

## タスクID: UT-SKILL-WIZARD-W1-par-02a

## 変更サマリー（2026-04-07）

## UI current facts（Step 0）

- Step 0 は `SkillInfoStep` で、入力は `skillName`（任意）/ `purpose`（必須・10文字以上）/ `category`（必須・単選択）を扱う
- 「次へ」ボタンは `purpose` が 10 文字以上かつ `category !== null` のときに有効になる

### 追加

| ファイル                                                                             | 内容                                           |
| ------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`                | スキルウィザード Step 0 コンポーネント（新規） |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` | SkillInfoStep の単体テスト 26 件（新規）       |

### 変更

| ファイル                                                                                         | 内容                                                                 |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/index.ts`                                     | `SkillInfoStep` エクスポート追加、`DescribeStep` エクスポート削除    |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`                             | `GenerationMode` の standalone 定義を撤去し、export を正本化         |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                               | `DescribeStep` → `SkillInfoStep` 置き換え、`formData` ステートへ変更 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | 新 UI に合わせたテスト更新（LLM ラジオボタン依存テスト削除）         |

### 削除

| ファイル                                                                            | 内容                         |
| ----------------------------------------------------------------------------------- | ---------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                | 削除済み（旧 Step 0 実装）   |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx` | 削除済み（旧 Step 0 テスト） |

## 共有型の参照方針

`SkillInfoFormData` と `SkillCategory` は W0-seq-01 で `packages/shared/src/types/skillCreator.ts` に追加された正本定義をそのまま参照する。デスクトップ側でこれらの型を再定義しない。

```typescript
// 正規の参照パス
import type {
  SkillInfoFormData,
  SkillCategory,
} from "@repo/shared/types/skillCreator";
```

## W2 への引き継ぎ事項

| 事項                                                    | 担当 Lane  |
| ------------------------------------------------------- | ---------- |
| `wizard/index.ts` の最終的なエクスポート整理            | W2-seq-03b |
| Step 1（ConversationRoundStep）への `formData` 引き継ぎ | W1-par-02b |
| `external-integration` 時の Q5 必須ロジック実装         | W1-par-02b |

## 画面証跡

`outputs/phase-11/screenshots/` に保存したスクリーンショットで、Step 0 の入力条件と Step 1 以降の遷移を確認できる。

| ファイル                                                           | 内容                           |
| ------------------------------------------------------------------ | ------------------------------ |
| `outputs/phase-11/screenshots/TC-01-step0-initial-dark.png`        | Step 0 初期表示（Dark）        |
| `outputs/phase-11/screenshots/TC-02-step0-filled-dark.png`         | Step 0 入力後（Dark）          |
| `outputs/phase-11/screenshots/TC-03-step1-configure-dark.png`      | Step 1 設定（Dark）            |
| `outputs/phase-11/screenshots/TC-04-step2-generating-dark.png`     | Step 2 生成中（Dark）          |
| `outputs/phase-11/screenshots/TC-05-step3-complete-dark.png`       | Step 3 完了（Dark）            |
| `outputs/phase-11/screenshots/TC-06-step2-error-dark.png`          | Step 2 エラー（Dark）          |
| `outputs/phase-11/screenshots/TC-07-step0-initial-light.png`       | Step 0 初期表示（Light）       |
| `outputs/phase-11/screenshots/TC-08-step0-initial-mobile-dark.png` | Step 0 初期表示（Mobile Dark） |

## テスト結果サマリー

| 指標                       | 結果                              |
| -------------------------- | --------------------------------- |
| `SkillInfoStep` 単体テスト | 26 件（`SkillInfoStep.test.tsx`） |
