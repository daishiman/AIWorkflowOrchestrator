# Phase 2: 設計

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 2                            |
| 機能名 | multi-select-user-input-kind |
| 作成日 | 2026-03-29                   |

## 目的

`multi_select` を shared type、engine、renderer にどう差し込むかを具体化し、既存の単数選択フローと分離したまま最小変更で設計する。

## 実行タスク

- `SkillCreatorUserInputKind` と `SkillCreatorUserInputSubmission` の型拡張を設計する
- `validateUserInputSubmission` の `multi_select` 分岐を設計する
- `SkillLifecyclePanel` の local state と submit 分岐を設計する
- checkbox host のレンダリング方式を設計する

## 参照資料

| 資料名       | パス                                                                   | 説明              |
| ------------ | ---------------------------------------------------------------------- | ----------------- |
| Phase 1 要件 | `phase-1-requirements.md`                                              | 契約と非対象      |
| 型定義       | `packages/shared/src/types/skillCreator.ts`                            | kind / submission |
| engine       | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | validation 分岐   |
| renderer     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`   | question host     |

### 現行コードアンカー

| ファイル                                                               | 設計観点                                                                |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                            | `request` 側は `options?: SkillCreatorUserInputOption[]` を保持している |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | `single_select` は `selectedOptionId` を `request.options` と照合する   |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`   | kind ごとに local state を切り替えて submit payload を構築している      |

## 実行手順

### ステップ1: shared type を設計する

```ts
export type SkillCreatorUserInputKind =
  | "single_select"
  | "multi_select"
  | "free_text"
  | "secret"
  | "confirm";

export interface SkillCreatorUserInputSubmission {
  planId: string;
  requestId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  textValue?: string;
  secretValue?: string;
  confirmed?: boolean;
}
```

### ステップ2: engine validation を設計する

- `case "multi_select"` を追加する
- `Array.isArray(submission.selectedOptionIds)` を必須とする
- `submission.selectedOptionIds.length > 0` を必須とする
- 全要素が `request.options?.some((option) => option.id === currentId)` を満たすことを必須とする
- `verification_review` 用の unknown option no-op fallback は `single_select` のみ維持し、`multi_select` へ拡張しない

### ステップ3: renderer state を設計する

| state               | 型                | 用途                 |
| ------------------- | ----------------- | -------------------- |
| `selectedOptionId`  | `string \| null`  | `single_select` 専用 |
| `selectedOptionIds` | `string[]`        | `multi_select` 専用  |
| `textAnswer`        | `string`          | `free_text`          |
| `secretAnswer`      | `string`          | `secret`             |
| `confirmAnswer`     | `boolean \| null` | `confirm`            |

- request kind 変更時に不要 state を reset する
- checkbox toggle は `id` の追加 / 除去のみを行う
- submit 時に `multi_select` だけ `selectedOptionIds` を payload へ設定する

### ステップ4: checkbox host を設計する

- レイアウトは既存 `single_select` host の card を流用する
- option ごとに checkbox input と label を持つ
- `description` があれば label 下に補足文として表示する
- submit ボタンの enable 条件は engine 側 validation に合わせる

## 統合テスト連携

- Phase 4 で shared type export、engine validation、renderer toggle の 3 観点を個別テストへ落とす
- Phase 6 で request kind 切り替え時の reset と既存 kind への非破壊を追加する
- Phase 9 で typecheck と既存 question host の回帰を確認する

## 成果物

| 成果物          | パス                                 | 説明                                  |
| --------------- | ------------------------------------ | ------------------------------------- |
| 設計書          | `phase-2-design.md`                  | 型、validation、renderer state の設計 |
| contract design | `outputs/phase-2/contract-design.md` | submission 拡張の詳細                 |
| renderer flow   | `outputs/phase-2/renderer-flow.md`   | local state と submit 分岐の設計      |

## 完了条件

- [ ] `SkillCreatorUserInputKind` と `SkillCreatorUserInputSubmission` の変更が定義されている
- [ ] `validateUserInputSubmission` の `multi_select` 分岐が定義されている
- [ ] renderer state の追加と reset 条件が定義されている
- [ ] checkbox host の描画方針が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
