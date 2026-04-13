# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 7                                                                       |
| タスクID   | TASK-SW-FIX-UI-001                                                      |
| 機能名     | UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar・カテゴリ解除） |
| 前提Phase  | Phase 6                                                                 |
| 後続Phase  | Phase 8                                                                 |
| 作成日     | 2026-04-12                                                              |
| ステータス | pending                                                                 |

## 目的

Phase 4・6 で作成したテストが修正箇所の全ロジック分岐を網羅しているかを確認する。
未テスト箇所があれば追加テストを作成して網羅率を高める。

## 実行タスク

- [ ] `handleCategoryClick`の全分岐（追加・解除・空配列維持）がテストされていることを確認する
- [ ] `isNextEnabled`の全条件組み合わせがテストされていることを確認する
- [ ] `currentQuestion`の回答済み判定の全パスがテストされていることを確認する
- [ ] ボタンスタイル変更の対象3ファイルが網羅されていることを確認する
- [ ] 未テスト箇所があれば追加テストを作成する

## 参照資料

| 資料名         | パス                                                                                 | 説明                   |
| -------------- | ------------------------------------------------------------------------------------ | ---------------------- |
| テストファイル | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`                    | カバレッジ確認対象     |
| テストファイル | `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` | カバレッジ確認対象     |
| 設計書         | `phase-2-design.md`                                                                  | 全変更箇所・分岐の一覧 |

## 実行手順

### Step 1: `handleCategoryClick`の分岐網羅確認

| 分岐                                   | テスト有無 | テストファイル         |
| -------------------------------------- | ---------- | ---------------------- |
| 未選択状態でカテゴリをクリック→追加    | Phase 4    | SkillInfoStep.test.tsx |
| 選択済みカテゴリをクリック→解除        | Phase 4    | SkillInfoStep.test.tsx |
| 解除後に空配列のまま維持               | Phase 6    | SkillInfoStep.test.tsx |
| 複数選択中に追加                       | Phase 4    | SkillInfoStep.test.tsx |
| 複数選択中の一部解除（配列に残りあり） | Phase 6    | SkillInfoStep.test.tsx |

**判定**: 全分岐がテストされている。

### Step 2: `isNextEnabled`の条件組み合わせ網羅確認

| purpose文字数 | category状態     | 期待される活性状態 | テスト有無 |
| ------------- | ---------------- | ------------------ | ---------- |
| 9文字         | 1件選択          | 非活性             | Phase 6    |
| 10文字        | 1件選択          | 活性               | Phase 6    |
| 10文字以上    | 空配列           | 非活性             | Phase 6    |
| 10文字以上    | 1件以上選択      | 活性               | Phase 4    |
| 10文字以上    | 空配列（理論上） | 非活性             | -          |

**判定**: 空配列のケースは設計上ありうるため、`category.length > 0` の境界値として追加で確認する。

### Step 3: `currentQuestion`動的計算の分岐網羅確認

| 回答状況                                                  | `answeredCount` | `currentQuestion` | テスト有無 |
| --------------------------------------------------------- | --------------- | ----------------- | ---------- |
| 全問未回答（selectedOptions=[], freeText=""）             | 0               | 1                 | Phase 6    |
| selectedOptionsのみ設定                                   | 1〜6            | 1〜6              | Phase 6    |
| freeTextのみ入力                                          | 1〜6            | 1〜6              | Phase 6    |
| 空白のみのfreeText                                        | 0               | 1                 | Phase 6    |
| scheduleConfigのみ設定（selectedOptions=[], freeText=""） | 0               | 1                 | -          |

**判定**: `scheduleConfig`のみ設定されて`selectedOptions=[], freeText=""`のケースは未回答判定になる。
これは意図した動作（scheduleConfigはQ3の補足情報のため、Q3自体の回答は`selectedOptions`で判断）。

### Step 4: ボタンスタイル変更の網羅確認

| ファイル                    | `bg-blue-600`除去 | CSS変数適用 | テスト有無                |
| --------------------------- | ----------------- | ----------- | ------------------------- |
| `SkillInfoStep.tsx`         | 要確認            | 要確認      | Phase 4（スタイル検証）   |
| `SkillCreateWizard.tsx`     | 要確認            | 要確認      | -（スナップショット推奨） |
| `ConversationRoundStep.tsx` | 変更不要          | 適用済み    | 不要                      |

**SkillCreateWizard.tsxの確認コマンド:**

```bash
grep -n "bg-blue-600" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

0件であれば変更完了。

### Step 5: カバレッジサマリー

| 変更カテゴリ                        | 変更内容                        | テスト済み | カバレッジ     |
| ----------------------------------- | ------------------------------- | ---------- | -------------- |
| 型変更                              | `category: SkillCategory[]`     | Phase 4+6  | 100%           |
| `handleCategoryClick`               | 追加・解除・空配列維持          | Phase 4+6  | 100%           |
| `isSelected`判定                    | `includes(value)`               | Phase 4    | 100%           |
| `isNextEnabled`                     | purpose長 + category length条件 | Phase 4+6  | 95%            |
| `currentQuestion`動的計算           | 回答済み判定・Math.max          | Phase 6    | 95%            |
| ボタンスタイル（SkillInfoStep）     | CSS変数適用                     | Phase 4    | 100%           |
| ボタンスタイル（SkillCreateWizard） | CSS変数適用                     | -          | 0%（手動確認） |

### Step 6: 追加テスト（必要な場合）

```bash
# カバレッジレポートの生成
pnpm --filter @repo/desktop test --coverage
pnpm --filter @repo/shared test --coverage
```

## 成果物

- テスト網羅表（このファイル内のStep 1〜4）
- 必要に応じて追加テスト（修正）

## 完了条件

- [ ] `handleCategoryClick`の全分岐がテストされている
- [ ] `isNextEnabled`の主要条件組み合わせがテストされている
- [ ] `currentQuestion`の回答済み判定ロジックがテストされている
- [ ] ボタンスタイル変更の主要ファイルが確認されている
- [ ] 全テストケースがパスしている
