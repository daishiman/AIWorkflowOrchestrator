# TASK-8C-B 実装ガイド

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| タスクID | TASK-8C-B                    |
| タスク名 | E2Eテスト - スキル選択フロー |
| 作成日   | 2026-02-02                   |

---

# Part 1: E2Eテストの概念説明（初学者向け）

## 1. E2Eテストって何？

### 1.1 身近な例えで理解する

E2Eテスト（End-to-End テスト）は、**自動操縦のロボット**のようなものです。

想像してみてください：

- あなたがアプリを使うとき、ボタンをクリックしたり、文字を入力したりしますよね
- E2Eテストは、**あなたの代わりにロボットがアプリを操作**して、正しく動くかチェックしてくれます

例えば、ドロップダウンメニューを開いて何かを選ぶ動作：

1. ロボットがボタンをクリック → メニューが開く
2. ロボットが項目をクリック → 項目が選ばれる
3. ロボットが結果を確認 → 正しく選ばれているかチェック

これを**自動的に何度も繰り返せる**のがE2Eテストの強みです。

### 1.2 なぜE2Eテストが必要？

| 理由               | 説明                                       |
| ------------------ | ------------------------------------------ |
| **人間は間違える** | 手動テストは見落としがある                 |
| **繰り返しが大変** | 同じテストを100回やるのは疲れる            |
| **時間を節約**     | ロボットは24時間働ける                     |
| **自信が持てる**   | テストが通れば「壊れていない」と確信できる |

### 1.3 スキル選択のテストで何を確認している？

今回のE2Eテストでは、スキル選択の機能が正しく動くかを確認しています：

1. **表示されるか**: 画面にスキル選択ボタンが見えるか
2. **開くか**: クリックするとリストが開くか
3. **選べるか**: スキルを選ぶと正しく反映されるか
4. **解除できるか**: 選択を取り消せるか
5. **キーボードで操作できるか**: マウスなしでも使えるか
6. **外をクリックしたら閉じるか**: 自然な動きをするか

## 2. テストの仕組み

### 2.1 テストの流れ

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  準備する   │ ──→ │  操作する   │ ──→ │  確認する   │
│  (Arrange)  │     │   (Act)     │     │  (Assert)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

例：スキルを選択するテスト

1. **準備**: アプリを起動、初期状態にする
2. **操作**: ドロップダウンを開いて、スキルをクリック
3. **確認**: ボタンに選んだスキルの名前が表示されているか

### 2.2 なぜ「安定性」が大切？

テストは**毎回同じ結果**になるべきです。

悪い例：

- 1回目: 成功 ✅
- 2回目: 失敗 ❌
- 3回目: 成功 ✅

これを「フレーキー（不安定）テスト」と呼びます。信頼できないテストは役に立ちません。

今回のテストでは、**待機処理**を入れて安定性を確保しています。

---

# Part 2: 技術的詳細（開発者向け）

## 1. テスト環境設定

### 1.1 技術スタック

| 技術       | 用途                 |
| ---------- | -------------------- |
| Vitest     | テストランナー       |
| Playwright | E2E Electron操作     |
| TypeScript | 型安全なテストコード |

### 1.2 ファイル構造

```
apps/desktop/src/__tests__/
├── __fixtures__/
│   └── skills/
│       ├── test-skill/
│       │   └── SKILL.md
│       └── another-skill/
│           └── SKILL.md
├── skillSelection.e2e.ts      ← 本タスクで作成
└── ...
```

### 1.3 環境変数

| 変数名            | 値               | 用途               |
| ----------------- | ---------------- | ------------------ |
| `NODE_ENV`        | `test`           | テストモード識別   |
| `TEST_SKILLS_DIR` | フィクスチャパス | テスト用スキル参照 |

## 2. セレクタ設計

### 2.1 セレクタ一覧

```typescript
const selectors = {
  skillSelector: '[role="combobox"][aria-haspopup="listbox"]',
  dropdown: '[role="listbox"]',
  noneOption: '[role="option"]:has-text("なし（スキルを使用しない）")',
  option: (text: string) => `[role="option"]:has-text("${text}")`,
  chatPanel: '[data-testid="chat-panel"]',
};
```

### 2.2 セレクタ選定基準

| 優先順位 | セレクタタイプ | 理由                 |
| -------- | -------------- | -------------------- |
| 1        | ARIA属性       | セマンティック、安定 |
| 2        | data-testid    | テスト専用、明示的   |
| 3        | テキストベース | 可読性高い           |
| 4        | ID             | 一意性保証           |

## 3. ヘルパー関数

### 3.1 openDropdown

```typescript
async function openDropdown(page: Page): Promise<void> {
  await page.click(selectors.skillSelector);
  await page.waitForSelector(selectors.dropdown, { state: "visible" });
}
```

### 3.2 selectSkill

```typescript
async function selectSkill(page: Page, skillName: string): Promise<void> {
  await openDropdown(page);
  await page.click(selectors.option(skillName));
}
```

### 3.3 deselectSkill

```typescript
async function deselectSkill(page: Page): Promise<void> {
  await openDropdown(page);
  await page.click(selectors.noneOption);
}
```

## 4. テストケース構造

### 4.1 グループ化

| グループ名       | テスト数 | 目的                   |
| ---------------- | -------- | ---------------------- |
| 基本表示         | 2        | 表示・ドロップダウン   |
| スキル選択       | 2        | 選択・解除             |
| キーボード操作   | 2        | キーナビ・外側クリック |
| アクセシビリティ | 2        | ARIA属性・Escape       |

### 4.2 テストケース一覧

| No  | テストケース                                   | 検証内容           |
| --- | ---------------------------------------------- | ------------------ |
| 1   | should display skill selector in chat panel    | セレクター表示     |
| 2   | should open dropdown and show available skills | ドロップダウン開く |
| 3   | should select a skill                          | スキル選択         |
| 4   | should deselect skill by clicking なし         | スキル選択解除     |
| 5   | should support keyboard navigation             | キーボード操作     |
| 6   | should close dropdown when clicking outside    | 外側クリック閉じ   |
| 7   | should have proper ARIA attributes             | ARIA属性検証       |
| 8   | should close dropdown on Escape key            | Escapeキー         |

## 5. 安定性対策

### 5.1 待機処理

| 対策               | 実装                                    |
| ------------------ | --------------------------------------- |
| 明示的セレクタ待機 | `waitForSelector({ state: "visible" })` |
| UI安定化待ち       | `waitForTimeout(100)` in beforeEach     |
| DOMロード待ち      | `waitForLoadState("domcontentloaded")`  |

### 5.2 エラーハンドリング

```typescript
// オプショナルAPI呼び出し
await page.evaluate(() => {
  window.electronAPI?.skill?.resetForTesting?.();
});
```

## 6. テスト実行

### 6.1 実行コマンド

```bash
# ビルド
pnpm --filter @repo/desktop build

# E2Eテスト実行
pnpm --filter @repo/desktop test skillSelection.e2e.ts

# 安定性確認（5回連続実行）
for i in {1..5}; do
  pnpm --filter @repo/desktop test skillSelection.e2e.ts
done
```

### 6.2 トラブルシューティング

| 問題                 | 対処法                            |
| -------------------- | --------------------------------- |
| テストが認識されない | ファイル拡張子が `.e2e.ts` か確認 |
| Electron起動失敗     | ビルドが完了しているか確認        |
| タイムアウト         | タイムアウト値を調整              |
| フレーキー           | 待機処理を追加                    |

## 完了チェック

- [x] Part 1（概念説明）が中学生レベルで理解可能
- [x] Part 2（技術詳細）が開発者向けに記載
- [x] セレクタ一覧が記載
- [x] ヘルパー関数の使い方が記載
- [x] テスト実行方法が記載
