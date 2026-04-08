# Phase 2: 設計

## メタ情報

- Phase: 2
- タスクID: UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001
- 機能名: SkillInfoStep コンポーネント実装（Step 0: スキル情報入力）
- 作成日: 2026-04-08
- ステータス: **completed**

## 目的

コンポーネント設計・props 型・フィールド定義・変更ファイル一覧を確定する。
`formData` を親が持ち、`onFormDataChange` と `onNext` を子が受け取る controlled component として整理する。

## 変更ファイル一覧

| 変更種別 | ファイルパス                                                                         | 変更内容                          |
| -------- | ------------------------------------------------------------------------------------ | --------------------------------- |
| 新規作成 | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`                | Step 0 フォームコンポーネント     |
| 新規作成 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` | ユニットテスト                    |
| 修正     | `apps/desktop/src/renderer/components/skill/wizard/index.ts`                         | `SkillInfoStep` の re-export 追加 |

## コンポーネント設計

```typescript
// props の型設計
interface SkillInfoStepProps {
  formData: SkillInfoFormData;
  onFormDataChange: (data: SkillInfoFormData) => void;
  onNext: () => void;
}

// SkillInfoFormData / SkillCategory は @repo/shared/types/skillCreator からの subpath import
import type {
  SkillInfoFormData,
  SkillCategory,
} from "@repo/shared/types/skillCreator";
```

### 設計方針

- **controlled component パターン**: フォームの状態は親（後続の `SkillCreateWizard.tsx`）が持ち、`SkillInfoStep` は `formData` + `onFormDataChange` + `onNext` を受け取る薄いコンポーネントとして実装する
- **subpath import 必須**: `SkillInfoFormData` / `SkillCategory` は `@repo/shared/types/skillCreator` からの subpath import に閉じる（root `@repo/shared` への拡張は行わない）
- **最小ローカル state**: 目的の blur 判定に必要な touched 状態だけを局所保持し、選択値の正は親に寄せる

## フィールド構成（3フィールド）

| フィールド | 入力 UI   | 型                      | 必須 | `SkillInfoFormData` フィールド名 |
| ---------- | --------- | ----------------------- | ---- | -------------------------------- |
| スキル名   | text 入力 | `string \| undefined`   | 任意 | `skillName`                      |
| 目的       | textarea  | `string`                | 必須 | `purpose`                        |
| カテゴリ   | button 群 | `SkillCategory \| null` | 必須 | `category`                       |

> フィールド名と optional / nullable の扱いは `packages/shared/src/types/skillCreator.ts` の current facts に従うこと

## UI 設計

### スキル名フィールド

```html
<input
  type="text"
  value="{formData.skillName ?? ''}"
  onChange="{...}"
  placeholder="例: メール自動返信スキル"
/>
```

### 目的フィールド

```html
<textarea
  value="{formData.purpose}"
  onChange="{...}"
  onBlur="{...}"
  rows="{4}"
  placeholder="このスキルで何を実現したいか..."
/>
```

### カテゴリフィールド

```html
<div role="group" aria-label="カテゴリを選択">
  {/* SkillCategory の全値を button として列挙 */}
</div>
```

## スタイリング方針

- 既存の wizard コンポーネント（`ConversationRoundStep.tsx` / `CompleteStep.tsx` 等）のスタイリングパターンを参照する
- Tailwind CSS を使用する
- フォームラベルは各フィールドに `<label>` 要素を付与する
- カテゴリは select ではなく chip/button 群で見せ、`aria-pressed` で選択状態を表す

## コードインベントリ補足

- `wizard/index.ts` への re-export 追加は既存パターンを踏襲する
  ```typescript
  export { SkillInfoStep } from "../SkillInfoStep";
  ```

## 手順

1. `packages/shared/src/types/skillCreator.ts` で `SkillInfoFormData` と `SkillCategory` の定義を精読し、フィールド名・型・オプショナル性を確認する
2. controlled component パターン（`formData` + `onFormDataChange` + `onNext`）でコンポーネント設計を確定する
3. `SkillCategory` の全値を選択肢として列挙したデザインを確定する
4. 既存の wizard コンポーネントのスタイリングパターンを参照してスタイルを確定する

## 成果物

- 変更ファイル一覧テーブル（上記）
- コンポーネント props インターフェース設計
- フィールド構成テーブル（上記）
- UI 設計（フィールドごとの HTML/JSX 方針）

## 完了条件

- [x] 変更ファイル一覧が「新規作成」「修正」で分類されて記録されている
- [x] props 型設計が確定している
- [x] フィールド構成テーブルが記録されている
- [x] subpath import 方針が明記されている
