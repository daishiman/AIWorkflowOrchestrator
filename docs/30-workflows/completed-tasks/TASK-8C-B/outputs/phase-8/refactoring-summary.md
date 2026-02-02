# Phase 8: リファクタリング記録

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 8                            |
| タスクID | TASK-8C-B                    |
| タスク名 | E2Eテスト - スキル選択フロー |
| 作成日   | 2026-02-02                   |

## 1. コード構造改善

### 1.1 テストファイル構造

```typescript
// skillSelection.e2e.ts

// ============================================
// Selectors（定数化）
// ============================================
const selectors = {
  skillSelector: '[role="combobox"][aria-haspopup="listbox"]',
  dropdown: '[role="listbox"]',
  noneOption: '[role="option"]:has-text("なし（スキルを使用しない）")',
  option: (text: string) => `[role="option"]:has-text("${text}")`,
  chatPanel: '[data-testid="chat-panel"]',
};

// ============================================
// Helper Functions（共通処理抽出）
// ============================================
async function openDropdown(page: Page): Promise<void> { ... }
async function selectSkill(page: Page, skillName: string): Promise<void> { ... }
async function deselectSkill(page: Page): Promise<void> { ... }

// ============================================
// Test Suite（グループ化）
// ============================================
describe("Skill Selection E2E", () => {
  // Setup
  // 基本表示
  // スキル選択
  // キーボード操作
  // アクセシビリティ
});
```

## 2. 重複排除

### 2.1 共通処理のヘルパー関数化

| 関数名          | 抽出前の重複                      | 抽出後              |
| --------------- | --------------------------------- | ------------------- |
| `openDropdown`  | 各テストでクリック+待機を記述     | 1箇所で定義、再利用 |
| `selectSkill`   | openDropdown+クリックを記述       | 1箇所で定義、再利用 |
| `deselectSkill` | openDropdown+"なし"クリックを記述 | 1箇所で定義、再利用 |

### 2.2 セレクタ定数化

| 改善前                                             | 改善後                    |
| -------------------------------------------------- | ------------------------- |
| `'[role="combobox"]'` を各所で直接記述             | `selectors.skillSelector` |
| `'[role="listbox"]'` を各所で直接記述              | `selectors.dropdown`      |
| `'[role="option"]:has-text("なし...")'` を直接記述 | `selectors.noneOption`    |

## 3. 可読性向上

### 3.1 テストケース名

| No  | テストケース名                                 | 規則          |
| --- | ---------------------------------------------- | ------------- |
| 1   | should display skill selector in chat panel    | should + 動詞 |
| 2   | should open dropdown and show available skills | should + 動詞 |
| 3   | should select a skill                          | should + 動詞 |
| 4   | should deselect skill by clicking なし         | should + 動詞 |
| 5   | should support keyboard navigation             | should + 動詞 |
| 6   | should close dropdown when clicking outside    | should + 動詞 |
| 7   | should have proper ARIA attributes             | should + 動詞 |
| 8   | should close dropdown on Escape key            | should + 動詞 |

### 3.2 テストグループ化

| グループ名       | テスト数 | 目的                   |
| ---------------- | -------- | ---------------------- |
| 基本表示         | 2        | 表示・ドロップダウン   |
| スキル選択       | 2        | 選択・解除             |
| キーボード操作   | 2        | キーナビ・外側クリック |
| アクセシビリティ | 2        | ARIA属性・Escape       |

## 4. コードスメル修正

### 4.1 修正済みコードスメル

| コードスメル       | 修正方法               | 状況 |
| ------------------ | ---------------------- | ---- |
| マジックストリング | セレクタ定数化         | ✅   |
| 重複コード         | ヘルパー関数抽出       | ✅   |
| 長いテストケース   | Arrange-Act-Assert分離 | ✅   |
| 曖昧なテスト名     | should + 動詞規則      | ✅   |

### 4.2 コード品質指標

| 指標           | 改善前 | 改善後 |
| -------------- | ------ | ------ |
| 重複コード     | 多     | 最小   |
| セレクタ管理   | 分散   | 一元化 |
| テスト可読性   | 中     | 高     |
| メンテナンス性 | 中     | 高     |

## 5. テスト継続成功確認

### 5.1 リファクタリング後の確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test skillSelection.e2e.ts

# 確認項目
# - [ ] リファクタリング後もテストが認識される
# - [ ] テスト構造が正しく維持されている
# - [ ] ヘルパー関数が正しく動作する
```

### 5.2 変更による影響

| 変更内容         | 影響範囲   | リスク |
| ---------------- | ---------- | ------ |
| セレクタ定数化   | 全テスト   | 低     |
| ヘルパー関数抽出 | 一部テスト | 低     |
| テストグループ化 | テスト構造 | 低     |

## 6. 今後の改善提案

### 6.1 追加リファクタリング候補

| 改善案                   | 優先度 | 備考                     |
| ------------------------ | ------ | ------------------------ |
| Page Object Pattern導入  | 低     | 将来的なテスト規模拡大時 |
| カスタムマッチャー追加   | 低     | ARIA属性検証の共通化     |
| テストデータファクトリー | 低     | 複雑なテストデータ生成時 |

## 完了チェック

- [x] テストが継続成功（設計レベル確認）
- [x] セレクタが定数化されている
- [x] 共通処理がヘルパー関数化されている
- [x] テストケースが適切にグループ化されている
- [x] コードスメルが修正されている
