# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 8                                    |
| 機能名 | llm-conversation-history-persistence |
| 作成日 | 2026-01-24                           |

## 目的

動作を変えずにコード品質を改善する。

## 実行タスク

- **コード重複排除**: Repository/IPCハンドラーの共通処理抽出
- **命名改善**: 変数名・関数名・ファイル名の改善
- **構造整理**: ファイル構成・モジュール分割の最適化
- **SOLID原則適用**: 設計原則に基づくコード改善

## リファクタリング観点

### 1. 重複排除

| 対象                  | 改善内容                               |
| --------------------- | -------------------------------------- |
| IPCエラーハンドリング | 共通のtry-catchラッパー関数を作成      |
| DBクエリ              | 共通のクエリビルダーまたはヘルパー関数 |
| バリデーション        | 入力バリデーションの共通化             |

### 2. 命名改善

| 対象       | 確認項目                             |
| ---------- | ------------------------------------ |
| 変数名     | 意図が明確か、省略されすぎていないか |
| 関数名     | 動詞+目的語形式になっているか        |
| ファイル名 | 責務が明確に表現されているか         |
| 型名       | ドメイン用語に準拠しているか         |

### 3. 構造整理

| 対象         | 確認項目                                   |
| ------------ | ------------------------------------------ |
| ファイル構成 | 関連ファイルが適切にグループ化されているか |
| 依存関係     | 循環依存がないか                           |
| 責務分離     | 各クラス/関数が単一責務になっているか      |

### 4. SOLID原則

| 原則          | 確認項目                                       |
| ------------- | ---------------------------------------------- |
| 単一責務(S)   | Repository/Handler/Componentが単一責務か       |
| 開放閉鎖(O)   | 拡張に開いて修正に閉じているか                 |
| 依存性逆転(D) | 高レベルモジュールが低レベルに依存していないか |

## 実行手順

### ステップ1: コードレビュー

現在の実装を確認し、改善ポイントを洗い出す。

### ステップ2: リファクタリング実施

```typescript
// Before: 重複したエラーハンドリング
ipcMain.handle("conversation:list", async (event, { userId, options }) => {
  try {
    const conversations = repository.listConversations(userId, options);
    return { success: true, data: conversations };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// After: 共通ラッパーを使用
const handleIpc = <T>(handler: () => T) => {
  try {
    return { success: true, data: handler() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

ipcMain.handle("conversation:list", async (event, { userId, options }) =>
  handleIpc(() => repository.listConversations(userId, options)),
);
```

### ステップ3: テスト再実行

```bash
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:integration
```

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:integration
```

## 成果物

| 成果物             | パス                                     | 説明         |
| ------------------ | ---------------------------------------- | ------------ |
| リファクタ記録     | `outputs/phase-8/refactoring-log.md`     | 実施内容     |
| コード品質レポート | `outputs/phase-8/code-quality-report.md` | 品質改善結果 |

## 完了条件

- [ ] テストが継続成功（リファクタ後もGreen状態）
- [ ] コード重複が排除されている
- [ ] 命名が改善されている
- [ ] 構造が整理されている
- [ ] 統合テストが継続成功
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## 次のPhase

Phase 9: 品質保証
