# Phase 8: リファクタリング

## メタ情報

- Phase: 8
- タスクID: UT-SKILL-WIZARD-W0-seq-01
- 機能名: スキルウィザード共有型定義追加
- 作成日: 2026-04-07

## 目的

実装済みの型定義とテストを見直し、可読性・保守性・一貫性を向上させる。型定義ファイルの肥大化を抑えつつ、後続 wave が使いやすい構造に整える。

## 実行タスク

- [ ] `skillCreator.ts` のセクション構造が既存パターンと一致しているか確認する
- [ ] JSDoc コメントの表現が既存コメントと統一されているか確認する
- [ ] 型の配置順序（依存関係の順）を確認する
- [ ] テストファイルの `describe` / `it` 文が読みやすいか確認する
- [ ] 不要なコメントや重複がないか確認する

## 参照資料

| 資料名           | パス                                                              | 説明                 |
| ---------------- | ----------------------------------------------------------------- | -------------------- |
| 追記対象ファイル | `packages/shared/src/types/skillCreator.ts`                       | リファクタリング対象 |
| テストファイル   | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | リファクタリング対象 |

## 実行手順

### Step 1: `skillCreator.ts` のセクション構造確認

既存パターンとの比較:

```text
// ============================================
// [セクション名] ([タスクID])
// ============================================
```

追加セクションが以下の形式になっているか確認する:

```text
// ============================================
// Skill Wizard Shared Contracts (UT-SKILL-WIZARD-W0-seq-01)
// ============================================
```

### Step 2: 型の配置順序の確認

依存関係の順に型が配置されていることを確認する。

正しい順序:

1. `SkillCategory`（独立 type union）
2. `SkillInfoFormData`（`SkillCategory` を参照、`skillName` は optional）
3. `SkillWizardScheduleConfig`（独立）
4. `QuestionAnswer`（`SkillWizardScheduleConfig` を参照）
5. `ConversationAnswers`（`QuestionAnswer` を参照）
6. `SmartDefaultResult`（独立）
7. `SkeletonQualityFeedback`（独立）

### Step 3: JSDoc の表現統一

既存コードの JSDoc スタイルと統一されているか確認する。

確認ポイント:

- 型本体のコメント: `/**\n * 説明文\n */` 形式
- フィールドコメント: `/** 説明 */` のインラインコメント形式
- 使用場面の記述: 「〇〇で使用する」形式

### Step 4: テストファイルの整理

- `describe` のラベルが「型名 + 観点」の形式になっているか確認
- `it` のラベルが「〇〇できる / 〇〇である」の形式になっているか確認
- インポート文が依存関係の順になっているか確認

```typescript
// 推奨インポート順（依存関係順）
import type {
  SkillCategory,
  SkillInfoFormData,
  SkillWizardScheduleConfig,
  QuestionAnswer,
  ConversationAnswers,
  SmartDefaultResult,
  SkeletonQualityFeedback,
} from "../skillCreator";
```

### Step 5: リファクタリング後の確認

```bash
# 型チェック
pnpm --filter @repo/shared typecheck

# テスト全件パス確認
pnpm --filter @repo/shared test packages/shared/src/types/__tests__/skillCreator-wizard.test.ts

# リント
pnpm --filter @repo/shared lint
```

## 成果物

- `packages/shared/src/types/skillCreator.ts`: セクション構造・型順序・JSDoc を整理（**修正**）
- `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`: インポート順・記述スタイルを整理（**修正**）

## 完了条件

- [ ] セクション区切りコメントが既存パターンと一致している
- [ ] 型の配置順序が依存関係の順になっている
- [ ] JSDoc の表現が既存コードと統一されている
- [ ] テストのインポート文が依存関係の順になっている
- [ ] リファクタリング後も全テストがパスしている
- [ ] リファクタリング後も型チェックが通過している
