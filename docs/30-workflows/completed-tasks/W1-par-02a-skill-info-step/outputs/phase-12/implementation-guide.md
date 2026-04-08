# Phase 12 成果物: 実装ガイド

## タスクID: UT-SKILL-WIZARD-W1-par-02a

---

## Part 1: コンポーネント概要と使用方法

### SkillInfoStep とは

スキル作成ウィザードの Step 0 コンポーネント。ユーザーがスキルの基本情報（スキル名・目的・カテゴリ）を入力するフォームを提供する。

**ファイルパス**: `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`

たとえば、何かを買う前に「商品名（任意）」「なぜ必要か（必須）」「カテゴリ（必須）」を先に決めるようなもの。ここで基本情報が揃うと、次のステップ（設定や生成）に進める。

### Props インターフェース

```typescript
interface SkillInfoStepProps {
  /** スキル名・目的・カテゴリをまとめたフォーム全体の入力値。 */
  formData: SkillInfoFormData;
  /** フォーム変更時に親へ全体値を通知する。 */
  onFormDataChange: (data: SkillInfoFormData) => void;
  /** Step 1 へ進む。 */
  onNext: () => void;
}
```

### 共有型の参照

`SkillInfoFormData` と `SkillCategory` は `packages/shared/src/types/skillCreator.ts` に定義された正本をそのまま参照する。

```typescript
import type {
  SkillInfoFormData,
  SkillCategory,
} from "@repo/shared/types/skillCreator";
```

### 使用例

```tsx
<SkillInfoStep
  formData={formData}
  onFormDataChange={setFormData}
  onNext={handleSkillInfoNext}
/>
```

---

## Part 2: 実装詳細と設計判断

### バリデーション設計

- **Touched-state パターン**: `purposeTouched` ステートを使用し、`onBlur` 発火後のみエラーを表示する。初回レンダリングではエラーを表示しない。
- **「次へ」ボタンの活性化条件**: `formData.purpose.trim().length >= 10` かつ `formData.category !== null` の場合のみ有効。スキル名は活性化条件に含まない。

### カテゴリ選択の設計

- `CATEGORY_OPTIONS` はコンポーネント外のモジュールスコープに定義（再レンダリング最適化）
- `handleCategoryClick` は同じ値の再クリック時に `onFormDataChange` を呼ばない（不要な再レンダリング防止）
- カテゴリは一度選択すると `null` に戻らない（`SkillInfoFormData.category` の型は `SkillCategory | null` だが、Step 0 で選択後は必ず値を持つ）

### `external-integration` の伝達

`formData.category === "external-integration"` のとき、Step 1（ConversationRoundStep）の Q5「外部ツール連携」が必須になる仕様。`formData` を親経由で渡す設計のため、`SkillInfoStep` 自体は伝達ロジックを持たない。

### テスト環境上の制約

happy-dom 環境では `@testing-library/user-event` が利用できないため、`fireEvent` のみを使用する（P39 準拠）。

### ウィザードへの統合

`SkillCreateWizard.tsx` の `currentStep === 0` ブロックで `SkillInfoStep` を使用する。`handleSkillInfoNext` が `generationMode` に応じてテンプレート生成または LLM 生成のどちらかへ分岐する。

### 画面証跡

`outputs/phase-11/screenshots/` のスクリーンショットを参照すると、Step 0 の入力条件と Step 1 以降の遷移が画面レベルで追跡できる。

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
