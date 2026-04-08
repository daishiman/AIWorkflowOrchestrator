# W1-par-02a: SkillInfoStep コンポーネント実装（Step 0）

## メタ情報

- タスクID: UT-SKILL-WIZARD-W1-par-02a
- 機能名: SkillInfoStep コンポーネント実装（Step 0）
- 実行順: Wave 1（並列実行可）
- 依存: W0-seq-01完了後
- 作成日: 2026-04-07

## タスク概要

`apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` を削除し、`SkillInfoStep.tsx` を新規作成する。スキルウィザードのStep 0として、スキルの基本情報（名前・目的・カテゴリ）を入力するUIコンポーネントを実装する。

## 実装スコープ

### 新規作成

- `SkillInfoStep.tsx` — スキル名・目的・カテゴリ入力フォーム

### 削除対象

- `DescribeStep.tsx` の UI 実装（GenerationMode ラジオボタン含む旧 Step 0 相当）
- `wizard/index.ts` からの `DescribeStep` エクスポート
- `GenerationMode` 型の standalone な定義場所（`GenerateStep.tsx` に集約して正本化）

## UIコンポーネント仕様

| 要素         | 種別           | バリデーション   |
| ------------ | -------------- | ---------------- |
| スキル名     | テキスト入力   | 任意             |
| 目的・背景   | テキストエリア | 必須・最低10文字 |
| カテゴリタグ | 単選択（5種）  | 必須             |

### カテゴリ一覧

- `automation`
- `external-integration`
- `data-analysis`
- `code-support`
- `other`

### 特記事項

- カテゴリ = `external-integration` 選択時: Step 1の Q5 が必須になることを伝達
- カテゴリは `SkillCategory` の5値のいずれかを保持し、初期状態は `null` を許容するが、再クリックで `null` に戻さない
- 「次へ」ボタン: 目的入力（10文字以上）かつカテゴリ選択済みで活性化

## コンポーネントProps

本コンポーネントで扱う `SkillInfoFormData` / `SkillCategory` は `packages/shared/src/types/skillCreator.ts` に集約された正本をそのまま読み込む。W0 で定義された `category` は `SkillCategory | null` で、初期状態では `null` を許容する。W1 では選択後に `category` を `null` に戻さない単一選択 UI として扱う。

```typescript
interface SkillInfoStepProps {
  formData: SkillInfoFormData;
  onFormDataChange: (data: SkillInfoFormData) => void;
  onNext: () => void;
}
```

## Phase一覧

| Phase | ファイル                  | 内容               |
| ----- | ------------------------- | ------------------ |
| 1     | phase-1-requirements.md   | 要件定義           |
| 2     | phase-2-design.md         | 設計               |
| 3     | phase-3-design-review.md  | 設計レビュー       |
| 4     | phase-4-test-creation.md  | テスト作成         |
| 5     | phase-5-implementation.md | 実装               |
| 6     | phase-6-test-expansion.md | テスト拡充         |
| 7     | phase-7-coverage.md       | カバレッジ確認     |
| 8     | phase-8-refactoring.md    | リファクタリング   |
| 9     | phase-9-qa.md             | QA                 |
| 10    | phase-10-final-review.md  | 最終レビュー       |
| 11    | phase-11-manual-test.md   | 手動テスト         |
| 12    | phase-12-docs.md          | ドキュメント整備   |
| 13    | phase-13-pr.md            | PRレビュー・マージ |
