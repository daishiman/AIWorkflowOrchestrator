# 実装ガイド: skill-wizard-runtime-validation

## タスクID: UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001

---

## Part 1: 中学生レベルの説明

### バリデーションとは何か

**バリデーション**とは、入力した内容が「正しいかどうかチェックする仕組み」です。

たとえば、図書館で本を借りるときに「学生証を見せてください」と確認されます。名前や学校が正しく書かれていないと借りられません。フォームのバリデーションもこれと同じで、「スキル名は入力されていますか？」「目的は十分な長さで書かれていますか？」をチェックしてくれます。

### なぜバリデーションが必要か

- スキル名を入力しないで登録しようとすると、後でそのスキルを探せなくなります
- 目的を「短い」の2文字だけで書いても、他の人が「このスキルは何のためのもの？」と困ります
- 入力ミスを入力直後に教えてくれるので、最初からやり直す必要がありません

### 今回実装したもの

スキルウィザードの入力画面で、

1. **スキル名が空白のみ** → 「スキル名を入力してください」とエラー表示
2. **目的が9文字以下** → 「目的は10文字以上で入力してください」とエラー表示

これらのチェックを実行時（実際に入力するとき）に行う関数を実装しました。

---

## Part 2: 技術者レベルの説明

### 背景

`SkillInfoFormData` の TypeScript 型定義（W0-seq-01 で完成）はコンパイル時のみ有効。
空白のみのスキル名や1文字の目的文字列はコンパイル時チェックを通過してしまうため、
ランタイムバリデーション関数を `packages/shared/src/types/skillInfoFormValidation.ts` に実装した。

### インターフェース型定義

```typescript
import type { SkillInfoFormData } from "./skillCreator";

// フィールド単位バリデーション結果の型（専用名。ValidationResult との名称衝突を回避）
export interface SkillInfoFieldValidationResult {
  valid: boolean;
  error?: string; // エラー時のみ日本語メッセージ
}

// フォーム全体の入力境界（category は本タスクの検証対象外）
export type SkillInfoValidationInput = Pick<
  SkillInfoFormData,
  "skillName" | "purpose"
>;

// フォーム全体の戻り値
export interface SkillInfoFormValidationResult {
  skillName?: string; // エラーメッセージ（エラーなし時は undefined）
  purpose?: string; // エラーメッセージ（エラーなし時は undefined）
  isValid: boolean;
}

// 文字数制限定数（magic number 排除）
export const SKILL_INFO_VALIDATION_LIMITS = {
  skillName: { maxLength: 100 },
  purpose: { minLength: 10, maxLength: 500 },
} as const;

// エラーメッセージ定数（日本語、一元管理）
export const SKILL_INFO_VALIDATION_MESSAGES = {
  skillName: {
    required: "スキル名を入力してください",
    maxLength: "スキル名は100文字以内で入力してください",
  },
  purpose: {
    minLength: "目的は10文字以上で入力してください",
    maxLength: "目的は500文字以内で入力してください",
  },
} as const;
```

### 関数シグネチャ

```typescript
// skillName バリデーション（undefined / null は valid：任意フィールド）
function validateSkillName(
  skillName: string | undefined | null,
): SkillInfoFieldValidationResult;

// purpose バリデーション（必須フィールド）
function validatePurpose(purpose: string): SkillInfoFieldValidationResult;

// フォーム全体バリデーション
function validateSkillInfoForm(
  values: SkillInfoValidationInput,
): SkillInfoFormValidationResult;
```

### 使用例

```typescript
// フィールド単位バリデーション
const r1 = validateSkillName("   ");
// => { valid: false, error: "スキル名を入力してください" }

const r2 = validateSkillName(undefined);
// => { valid: true }  （任意フィールドのため）

const r3 = validatePurpose("短い");
// => { valid: false, error: "目的は10文字以上で入力してください" }

// フォーム全体バリデーション
const formResult = validateSkillInfoForm({
  skillName: "スキルA",
  purpose: "十分な長さの目的文字列",
});
// => { skillName: undefined, purpose: undefined, isValid: true }

const formError = validateSkillInfoForm({
  skillName: "  ",
  purpose: "短い",
});
// => { skillName: "スキル名を入力してください", purpose: "目的は10文字以上で入力してください", isValid: false }
```

### エラーハンドリング

- `SkillInfoFieldValidationResult.valid === false` のとき `error` に日本語メッセージが格納される
- `SkillInfoFormValidationResult.isValid === false` のとき、失敗フィールドのみメッセージが格納される（成功フィールドは `undefined`）
- 呼び出し元は `valid` / `isValid` フラグで分岐し、`error` をUIに表示する

### 配置先・公開API

| ファイル                                               | 役割                               |
| ------------------------------------------------------ | ---------------------------------- |
| `packages/shared/src/types/skillInfoFormValidation.ts` | バリデーション関数・型・定数       |
| `packages/shared/src/types/index.ts`                   | 公開エクスポート（再エクスポート） |

`packages/shared/index.ts` は既存の `export * from "./types"` により自動的に公開される。

### テスト

ユニットテスト: `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts`

- TC-01〜TC-12（基本テストケース）+ EC-01〜EC-13（エッジケース）= 合計 **25件 PASS**
- カバレッジ: Line 100% / Branch 100% / Function 100%

### 今後の拡張

UIフォームコンポーネントへの統合（バリデーション結果の表示）は後続 Wave で対応。
バックエンド（IPCハンドラ）での同一バリデーション再利用も、本ファイルを参照することで実現可能。
