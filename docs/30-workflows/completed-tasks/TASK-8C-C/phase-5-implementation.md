# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 5                            |
| 機能名 | TASK-8C-C-e2e-import-execute |
| 作成日 | 2026-02-02                   |

## 目的

E2Eテストを通すために必要な実装・調整を行う。このタスクはE2Eテストの作成が主目的のため、主にテストコードの完成度向上とセレクタ調整を行う。

## 実行タスク

- テストコード完成: Phase 4で作成したテストの完成度向上
- セレクタ調整: 実際のUI要素に合わせたセレクタ修正
- 待機処理追加: 非同期処理に対する適切なwaitFor追加

## 参照資料

| 資料名         | パス                                                     | 説明               |
| -------------- | -------------------------------------------------------- | ------------------ |
| テストファイル | `apps/desktop/src/__tests__/skillImportExecution.e2e.ts` | Phase 4成果物      |
| ChatPanel統合  | `apps/desktop/src/renderer/views/ChatView/`              | UI実装確認用       |
| SkillSelector  | `apps/desktop/src/renderer/components/skill/`            | コンポーネント確認 |

## 実行手順

### ステップ1: セレクタの実装確認・調整

既存UIコンポーネントのセレクタを確認し、テストコードを調整:

| 要素                 | 確認対象ファイル         |
| -------------------- | ------------------------ |
| スキル選択           | `SkillSelector.tsx`      |
| インポートダイアログ | `SkillImportDialog.tsx`  |
| ストリーミングビュー | `SkillStreamingView.tsx` |
| チャット入力         | `ChatInput.tsx`          |

### ステップ2: 非同期待機処理の追加

| 操作             | 待機処理                                       |
| ---------------- | ---------------------------------------------- |
| ダイアログ表示   | `waitForSelector('text="スキルをインポート"')` |
| ダイアログ非表示 | `waitForSelector(..., { state: "hidden" })`    |
| 実行状態変化     | `expect(...).toBeVisible()` のretry            |

### ステップ3: beforeEach内のスキルインポート

Skill Execution Flowのテストでは、beforeEachでスキルをプログラム的にインポート:

```typescript
beforeEach(async () => {
  await page.evaluate(async () => {
    await window.electronAPI?.skill?.import?.("test-skill");
  });
});
```

### ステップ4: テスト実行・デバッグ

| 確認項目       | コマンド                                   |
| -------------- | ------------------------------------------ |
| 単体テスト実行 | `pnpm --filter @repo/desktop test:e2e`     |
| デバッグモード | `DEBUG=pw:api pnpm test:e2e`               |
| 特定テストのみ | `pnpm test:e2e -- -t "should open import"` |

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト:

| 実装項目     | 内容                              |
| ------------ | --------------------------------- |
| Electron起動 | `electron.launch()` with env vars |
| IPC呼び出し  | `page.evaluate()` 経由            |
| 状態確認     | セレクタによるUI要素の可視性確認  |

## アーキテクチャ層別実装

| 層          | 実装観点                                    |
| ----------- | ------------------------------------------- |
| E2Eテスト層 | Playwright APIを使用したUI操作              |
| 待機処理    | `waitForSelector`, `toBeVisible`            |
| IPC連携     | `page.evaluate`でwindow.electronAPI呼び出し |

## 成果物

| 成果物             | パス                                                     | 説明      |
| ------------------ | -------------------------------------------------------- | --------- |
| 完成テストファイル | `apps/desktop/src/__tests__/skillImportExecution.e2e.ts` | Green状態 |

## 完了条件

- [ ] 6件のテストケースが実装完了している
- [ ] セレクタが実際のUIと一致している
- [ ] 非同期待機処理が適切に実装されている
- [ ] すべてのテストがGreen状態（または実行可能状態）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:e2e skillImportExecution

# 確認項目
# - [ ] 6件のテストが認識される
# - [ ] テストが成功する（Green状態）
```

## 次のPhase

Phase 6: テスト拡充
