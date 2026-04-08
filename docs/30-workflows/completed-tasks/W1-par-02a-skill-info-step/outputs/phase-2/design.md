# Phase 2 成果物: 設計書

## タスクID: UT-SKILL-WIZARD-W1-par-02a

## コンポーネント構造

```
SkillInfoStep (単一ファイル実装)
├── スキル名 input[type=text]  (任意)
├── 目的・背景 textarea        (必須・10文字以上)
├── カテゴリタグ div[role=group] (単選択・5種)
│   └── button[aria-pressed] × 5
└── 「次へ」 button             (isNextEnabled 時に有効)
```

サブコンポーネントはインライン実装（別ファイル分割なし）

## Props 設計

```typescript
import type {
  SkillInfoFormData,
  SkillCategory,
} from "@repo/shared/types/skillCreator";

interface SkillInfoStepProps {
  /** スキル名・目的・カテゴリをまとめたフォーム全体の入力値。 */
  formData: SkillInfoFormData;
  /** フォーム変更時に親へ全体値を通知する。 */
  onFormDataChange: (data: SkillInfoFormData) => void;
  /** Step 1 へ進む。 */
  onNext: () => void;
}
```

## バリデーションロジック設計

Touched-state 方式（フォーカスが外れたタイミングでエラー表示）:

```typescript
const [purposeTouched, setPurposeTouched] = useState(false);
const isNextEnabled =
  formData.purpose.trim().length >= 10 && formData.category !== null;
const showPurposeError = purposeTouched && formData.purpose.trim().length < 10;
```

## カテゴリタグ選択 UI 設計

```typescript
const CATEGORY_OPTIONS: { value: SkillCategory; label: string }[] = [
  { value: "automation", label: "自動化" },
  { value: "external-integration", label: "外部連携" },
  { value: "data-analysis", label: "データ分析" },
  { value: "code-support", label: "コードサポート" },
  { value: "other", label: "その他" },
];
```

- 各タグはボタン形式、単選択（再クリックで null に戻らない）
- 選択中: `border-blue-500 bg-blue-100 text-blue-700`
- 未選択: `border-gray-300 bg-white text-gray-600`

## ファイル配置設計

| ファイル                                                              | 操作                                  |
| --------------------------------------------------------------------- | ------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` | 新規作成                              |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`  | 削除（空化）                          |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`  | GenerationMode 型を移設               |
| `apps/desktop/src/renderer/components/skill/wizard/index.ts`          | DescribeStep 削除・SkillInfoStep 追加 |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`    | SkillInfoStep 置き換え                |

## 完了確認

- [x] コンポーネント構造が明確に設計されている
- [x] SkillInfoFormData / SkillInfoStepProps の型定義が確定している
- [x] バリデーションロジック（Touched-state 方式）が設計されている
- [x] カテゴリタグ選択 UI の挙動が仕様化されている
- [x] 「次へ」ボタンの活性化条件が明確になっている
- [x] ファイルの新規作成・削除計画が確定している
