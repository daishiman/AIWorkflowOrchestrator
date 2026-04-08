# Phase 1 成果物: 要件定義

## タスクID: UT-SKILL-WIZARD-W1-par-02a

## 調査結果

### 既存 DescribeStep.tsx の実装内容

- `description` テキストエリア（任意の長さ、空でも OK）
- `GenerationMode` ラジオボタン（template / llm の2択）
- 「次へ」ボタン（description が空でなければ有効）
- `React.forwardRef` でラップされた実装

### GenerationMode 型の利用箇所（削除対象）

| ファイル                | 用途                                       |
| ----------------------- | ------------------------------------------ |
| `DescribeStep.tsx`      | Props 型定義・ラジオボタン制御             |
| `wizard/index.ts`       | スタンドアロン型エクスポート               |
| `GenerateStep.tsx`      | Props の `generationMode?: GenerationMode` |
| `SkillCreateWizard.tsx` | `useState<GenerationMode>`                 |

### SkillInfoFormData / SkillCategory の確定仕様

`packages/shared/src/types/skillCreator.ts` (line 933-951) に W0-seq-01 で追加済み:

```typescript
export type SkillCategory =
  | "automation"
  | "external-integration"
  | "data-analysis"
  | "code-support"
  | "other";

export interface SkillInfoFormData {
  skillName?: string;
  purpose: string;
  category: SkillCategory | null;
}
```

### バリデーションルール

| フィールド  | ルール                     | エラーメッセージ                             |
| ----------- | -------------------------- | -------------------------------------------- |
| `purpose`   | 必須・最低10文字（trim後） | 「目的・背景は10文字以上で入力してください」 |
| `category`  | 必須（SkillCategory）      | —                                            |
| `skillName` | 任意                       | —                                            |

### カテゴリ表示仕様

| 値                     | 表示名         |
| ---------------------- | -------------- |
| `automation`           | 自動化         |
| `external-integration` | 外部連携       |
| `data-analysis`        | データ分析     |
| `code-support`         | コードサポート |
| `other`                | その他         |

### Step 1 への伝達仕様

- `category === "external-integration"` の場合、Step 1 の Q5 が必須となる
- `SkillInfoFormData` を Props として流通させるだけで伝達が完結する

## 完了確認

- [x] 既存 DescribeStep.tsx の実装内容が把握されている
- [x] GenerationMode 型の全利用箇所が洗い出されている
- [x] SkillInfoFormData の型定義が確定している
- [x] バリデーションルールが文書化されている
- [x] カテゴリ5種の表示名が確定している
- [x] Step 1 への伝達インターフェースが明確になっている
