# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 3                                                                       |
| タスクID   | TASK-SW-FIX-UI-001                                                      |
| 機能名     | UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar・カテゴリ解除） |
| 前提Phase  | Phase 2                                                                 |
| 後続Phase  | Phase 4                                                                 |
| 作成日     | 2026-04-12                                                              |
| ステータス | pending                                                                 |

## 目的

Phase 2 の設計を多角的にレビューし、実装前に問題を検出する。
型変更の影響範囲・ロジックの正確性・スタイル統一の網羅性を確認する。

## 実行タスク

- [ ] `SkillInfoFormData.category`型変更の後方互換性を確認する
- [ ] `handleCategoryClick`トグルロジックの境界値を確認する
- [ ] `currentQuestion`動的計算の全状態遷移を確認する
- [ ] ボタンスタイル変更の網羅性を確認する
- [ ] subpathexport方針の整合性を確認する

## 参照資料

| 資料名   | パス                      | 説明                 |
| -------- | ------------------------- | -------------------- |
| 設計書   | `phase-2-design.md`       | レビュー対象の設計   |
| 要件定義 | `phase-1-requirements.md` | 受け入れ基準との照合 |

## 実行手順

### Step 1: `SkillInfoFormData.category`型変更のレビュー

#### 確認項目

| 確認項目                                           | 期待値                                      | 判定   |
| -------------------------------------------------- | ------------------------------------------- | ------ |
| `category`が`SkillCategory[]`に変更されている      | `SkillCategory[]`                           | 要確認 |
| `SkillCategory`のunion型自体は変更されていない     | 変更なし（CategoryOptionの`value`型に使用） | 要確認 |
| ルートbarrelへの波及がない                         | `@repo/shared`のindex.tsに変更なし          | 要確認 |
| subpathexport`@repo/shared/types/skillCreator`のみ | 当該パスのみ変更                            | 要確認 |

#### 後方互換性の確認

`category: SkillCategory | null`から`category: SkillCategory[]`への変更は破壊的変更（breaking change）である。
影響するすべての参照箇所を実装前に確認する必要がある。

確認コマンド:

```bash
grep -rn "\.category" apps/desktop/src/renderer/components/skill/ --include="*.tsx"
grep -rn "SkillInfoFormData" apps/ packages/ --include="*.ts" --include="*.tsx"
```

### Step 2: `handleCategoryClick`トグルロジックのレビュー

#### 境界値チェック

| 操作                                 | `current`   | `next`          | `category`フィールド |
| ------------------------------------ | ----------- | --------------- | -------------------- |
| 未選択状態でカテゴリAをクリック      | `[]`        | `["A"]`         | `["A"]`              |
| カテゴリAのみ選択状態でAを再クリック | `["A"]`     | `[]`            | `[]`                 |
| カテゴリABで選択中にBをクリック      | `["A","B"]` | `["A"]`         | `["A"]`              |
| カテゴリABで選択中にCをクリック      | `["A","B"]` | `["A","B","C"]` | `["A","B","C"]`      |

**判定**: `SkillInfoFormData.category` は常に配列として扱うため、`null` 分岐は不要である。
未選択は空配列 `[]` に統一し、トグル処理は `includes` / `filter` だけで表現できる。

#### `isNextEnabled`のレビュー

```typescript
const isNextEnabled =
  formData.purpose.trim().length >= 10 && formData.category.length > 0;
```

`category.length > 0`だけで未選択判定できるため、`null` チェックは不要である。
Step 0 の state と判定条件を一致させることで、ロジックの重複を避ける。

### Step 3: `currentQuestion`動的計算のレビュー

#### 全状態遷移の妥当性確認

| シナリオ                                           | `answeredCount` | `currentQuestion` | 表示結果 |
| -------------------------------------------------- | --------------- | ----------------- | -------- |
| 全問未回答                                         | 0               | 1                 | 質問 1/6 |
| Q1のみ回答済み（selectedOptions設定）              | 1               | 1                 | 質問 1/6 |
| Q1・Q2回答済み                                     | 2               | 2                 | 質問 2/6 |
| Q1〜Q3回答済み（Page 1終了）                       | 3               | 3                 | 質問 3/6 |
| Q1〜Q4回答済み（Page 2開始）                       | 4               | 4                 | 質問 4/6 |
| Q1〜Q6全回答済み                                   | 6               | 6                 | 質問 6/6 |
| Q3定期実行選択・freeTextのみ入力（scheduleConfig） | 1               | 1                 | 質問 1/6 |

**判定**: `QUESTION_KEYS.filter((key) => isQuestionAnswered(answers[key]))` で全問を走査し、`selectedOptions.length > 0 || freeText.trim() !== "" || scheduleConfig !== undefined` で回答済み判定する設計は正当。
`Math.max(1, answeredCount)`で最小値1を保証するため、未回答時にも`0/6`と表示されることはない。

#### 固定値からの変更による影響

- 旧: Page 1では常に1/6、Page 2では常に4/6
- 新: 実際の回答数に基づいて動的変化

この変更により、Page 2に遷移直後（Q4未回答）は「質問3/6」と表示されうる（Q1〜Q3が回答済みの場合）。
これはPage 2開始時に「4/6」を期待していた設計と一部異なるが、**実際の進捗を正確に反映する**という目的には合致する。

### Step 4: ボタンスタイル変更の網羅性レビュー

#### 変更対象箇所の確認

| ファイル                    | 変更対象                | `bg-blue-600`除去  | `--status-primary`追加 | `rounded-lg`統一 |
| --------------------------- | ----------------------- | ------------------ | ---------------------- | ---------------- |
| `SkillInfoStep.tsx`         | 「次へ」ボタン          | 要確認             | 要確認                 | 要確認           |
| `SkillCreateWizard.tsx`     | LLMモード「次へ」ボタン | 要確認             | 要確認                 | 要確認           |
| `ConversationRoundStep.tsx` | 「次のページ」ボタン    | 不要（既に変更済） | 不要（既に適用済）     | 要確認           |

確認コマンド:

```bash
grep -rn "bg-blue-600" apps/ --include="*.tsx"
```

#### `hover`クラスの扱い

`bg-blue-600`を除去する際、`hover:bg-blue-700`も合わせて除去する必要がある。
CSS変数を使用するボタンではhoverエフェクトは`opacity`や`brightness`フィルタで対応する、またはCSS変数側で定義する。
設計としては`hover:opacity-90`を追加することを推奨する。

### Step 5: subpathexport整合性のレビュー

`SkillInfoFormData.category`の型変更は`@repo/shared/types/skillCreator`サブパスから公開されている。
ルートbarrel（`packages/shared/src/index.ts`）には`SkillInfoFormData`のエクスポートが含まれていないことを確認する。

```bash
grep -n "SkillInfoFormData" packages/shared/src/index.ts
```

もし含まれている場合、他パッケージからの参照に対して破壊的変更となるため、Phase 5実装前に対処方針を確定する。

## 成果物

- このファイル（Phase 3 設計レビュー記録）: レビュー結果と判定を記録

## 完了条件

- [ ] `category`型変更の後方互換性確認が完了している
- [ ] `handleCategoryClick`の全境界値が設計上問題ないことを確認している
- [ ] `currentQuestion`の全状態遷移が正常であることを確認している
- [ ] ボタンスタイル変更の網羅性が確認されている
- [ ] subpathexportの影響範囲が確認されている
- [ ] レビューで発見した問題点が Phase 5 実装前に解決されている
