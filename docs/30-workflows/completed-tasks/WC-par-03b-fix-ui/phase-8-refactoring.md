# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 8                                                                       |
| タスクID   | TASK-SW-FIX-UI-001                                                      |
| 機能名     | UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar・カテゴリ解除） |
| 前提Phase  | Phase 7                                                                 |
| 後続Phase  | Phase 9                                                                 |
| 作成日     | 2026-04-12                                                              |
| ステータス | pending                                                                 |

## 目的

実装済みの変更を見直し、可読性・保守性・一貫性を向上させる。
重複コードの除去・命名の統一・コメントの整理を行い、後続Waveが参照しやすい状態にする。

## 実行タスク

- [ ] `handleCategoryClick`の実装が設計の意図を明確に表現しているか確認する
- [ ] `currentQuestion`の計算ロジックに適切なコメントが付いているか確認する
- [ ] ボタンスタイルの変更箇所に一貫性があるか確認する
- [ ] 型定義のJSDocコメントが更新されているか確認する
- [ ] リファクタリング後も全テストがパスすることを確認する

## 参照資料

| 資料名           | パス                                                                          | 説明                 |
| ---------------- | ----------------------------------------------------------------------------- | -------------------- |
| 実装済みファイル | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         | リファクタリング対象 |
| 実装済みファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | リファクタリング対象 |
| 実装済みファイル | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | リファクタリング対象 |
| 実装済みファイル | `packages/shared/src/types/skillCreator.ts`                                   | リファクタリング対象 |

## 実行手順

### Step 1: `skillCreator.ts` のJSDocコメント更新確認

`SkillInfoFormData.category`のコメントが変更後の仕様を正しく説明しているか確認する。

```typescript
// 変更前コメント
/** スキルカテゴリ（未選択時は null） */
category: SkillCategory | null;

// 変更後コメント（推奨）
/** スキルカテゴリ（複数選択可・未選択時は空配列） */
category: SkillCategory[];
```

### Step 2: `SkillInfoStep.tsx` の実装整理

#### `handleCategoryClick`の可読性確認

```typescript
// 推奨コメント付き実装
const handleCategoryClick = (value: SkillCategory) => {
  // 既選択の場合は除去（トグル解除）、未選択の場合は追加
  const next = formData.category.includes(value)
    ? formData.category.filter((c) => c !== value)
    : [...formData.category, value];
  onFormDataChange({ ...formData, category: next });
};
```

#### コンポーネントコメントの更新確認

`SkillInfoStep`のJSDocコメントに「一度選択した値は再クリックで解除される」「全カテゴリを解除しても `[]` を維持する」という記述が残っているか確認する。

```typescript
// 追加すべき新コメント
// - カテゴリは複数選択可能で、選択済みカテゴリを再クリックすると解除される。
// - 全カテゴリを解除した場合も `[]` を維持する。
```

### Step 3: `ConversationRoundStep.tsx` の計算ロジック整理

`currentQuestion`の計算ロジックにコメントを追加して意図を明確化する。

```typescript
// 回答済み問数を集計してProgressBarに渡す（問題16修正: 固定値1・4から動的計算へ）
const answeredCount = Object.values(answers).filter(
  (a) => a.selectedOptions.length > 0 || a.freeText.trim() !== "",
).length;
// 最小値1を保証（未回答でも「質問0/6」とは表示しない）
const currentQuestion = Math.max(1, answeredCount);
```

### Step 4: ボタンスタイルの一貫性確認

ウィザード内の全プライマリボタンが以下のパターンに揃っているか確認する。

| 確認項目                    | 期待値                        |
| --------------------------- | ----------------------------- |
| 背景色クラス                | `bg-[var(--status-primary)]`  |
| 文字色クラス                | `text-[var(--text-inverse)]`  |
| 角丸クラス                  | `rounded-lg`                  |
| `bg-blue-600`の残存         | 0件                           |
| `text-white`のhardcoded残存 | 0件（`--text-inverse`に統一） |

確認コマンド:

```bash
# bg-blue-600 の残存確認
grep -rn "bg-blue-600" apps/desktop/src/renderer/components/skill/ --include="*.tsx"

# text-white の残存確認（ウィザード関連のみ）
grep -n "text-white" \
  apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

### Step 5: テストファイルの整理

テストの`describe`・`it`ラベルが意図を明確に表現しているか確認する。

推奨フォーマット:

- `describe`: 「コンポーネント名 + 機能名」（例: `SkillInfoStep カテゴリ選択`）
- `it`: 「〇〇すると〇〇になる / 〇〇の場合は〇〇である」

### Step 6: リファクタリング後の確認

```bash
# 型チェック
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck

# テスト全件パス確認
pnpm --filter @repo/shared test
pnpm --filter @repo/desktop test

# リント
pnpm --filter @repo/shared lint
pnpm --filter @repo/desktop lint
```

## 成果物

- `packages/shared/src/types/skillCreator.ts`: JSDocコメント更新（修正）
- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`: コメント・スタイル整理（修正）
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`: 計算ロジックコメント追加（修正）

## 完了条件

- [ ] `SkillInfoFormData.category`のJSDocが複数選択を説明している
- [ ] `handleCategoryClick`のコメントが追加・解除・空配列維持の意図を説明している
- [ ] `currentQuestion`計算コードにコメントが付いている
- [ ] `bg-blue-600`と`text-white`のhardcodedクラスが除去されている
- [ ] リファクタリング後も全テストがパスしている
- [ ] リファクタリング後も型チェックが通過している
