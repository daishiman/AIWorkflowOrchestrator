# Phase 5 成果物: 実装

## タスクID: UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001

## 実装完了ファイル

### 新規作成

- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`

### 修正

- `apps/desktop/src/renderer/components/skill/wizard/index.ts`（`SkillInfoStep` re-export 追加）

## 実装の主要決定事項

### 1. controlled component パターン

```typescript
interface SkillInfoStepProps {
  formData: SkillInfoFormData;
  onFormDataChange: (data: SkillInfoFormData) => void;
  onNext: () => void;
}
```

### 2. CATEGORY_OPTIONS 定数

```typescript
const CATEGORY_OPTIONS: { value: SkillCategory; label: string }[] = [
  { value: "automation", label: "自動化" },
  { value: "external-integration", label: "外部連携" },
  { value: "data-analysis", label: "データ分析" },
  { value: "code-support", label: "コードサポート" },
  { value: "other", label: "その他" },
];
```

### 3. 最小ローカル state

```typescript
const [purposeTouched, setPurposeTouched] = useState(false);
```

### 4. 「次へ」活性条件

```typescript
const isNextEnabled =
  formData.purpose.trim().length >= 10 && formData.category !== null;
```

### 5. カテゴリ再クリック防止

```typescript
const handleCategoryClick = (value: SkillCategory) => {
  if (formData.category === value) return;
  onFormDataChange({ ...formData, category: value });
};
```

## wizard/index.ts への re-export

```typescript
export { SkillInfoStep } from "./SkillInfoStep";
```

## テスト実行結果

- TC-01〜TC-09 が全て PASS（Phase 5 完了時点）
