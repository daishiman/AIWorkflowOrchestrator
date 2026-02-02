# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 8                            |
| 機能名 | TASK-8C-C-e2e-import-execute |
| 作成日 | 2026-02-02                   |

## 目的

テストの動作を変えずにテストコードの品質を改善する。

## 実行タスク

- コード品質改善: テストコードの可読性・保守性向上
- 重複排除: 共通処理のヘルパー関数化
- 命名改善: テストケース名・変数名の改善

## 実行手順

### ステップ1: 重複コードの特定と抽出

| 重複パターン             | ヘルパー化候補                |
| ------------------------ | ----------------------------- |
| スキル選択ダイアログ表示 | `openSkillSelector()`         |
| インポートダイアログ表示 | `openImportDialog()`          |
| スキル実行開始           | `startSkillExecution(prompt)` |

### ステップ2: ヘルパー関数の実装

```typescript
// ヘルパー関数例
async function openSkillSelector(page: Page): Promise<void> {
  await page.click('[aria-label="スキルを選択"]');
}

async function openImportDialog(page: Page): Promise<void> {
  await openSkillSelector(page);
  await page.click('[data-testid="import-skill-button"]');
}

async function startSkillExecution(page: Page, prompt: string): Promise<void> {
  await page.fill('[data-testid="chat-input"]', prompt);
  await page.press('[data-testid="chat-input"]', "Enter");
}
```

### ステップ3: テストケース名の改善

| Before                                         | After                                           |
| ---------------------------------------------- | ----------------------------------------------- |
| should open import dialog for unimported skill | opens import dialog when clicking import button |
| should display skill details in import dialog  | displays allowed tools and subagents in dialog  |
| should import skill and add to imported list   | adds skill to imported section after import     |

### ステップ4: リファクタリング後のテスト実行

```bash
# テスト実行
pnpm --filter @repo/desktop test:e2e skillImportExecution

# 確認項目
# - [ ] リファクタリング後もテストが成功する
```

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test:e2e
```

## 成果物

| 成果物               | パス                                                     | 説明         |
| -------------------- | -------------------------------------------------------- | ------------ |
| リファクタ済みテスト | `apps/desktop/src/__tests__/skillImportExecution.e2e.ts` | 品質改善済み |

## 完了条件

- [ ] テストが継続成功している
- [ ] コード品質が改善されている
- [ ] 重複が排除されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:e2e

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## 次のPhase

Phase 9: 品質保証
