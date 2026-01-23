# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 8                   |
| 機能名 | workspace-chat-edit |
| 作成日 | 2026-01-23          |

## 目的

動作を変えずにコード品質を改善する。TDDのRefactorフェーズとして、テストが通る状態を維持しながらコードの可読性・保守性を向上させる。

## 実行タスク

- **リファクタリング**: コード構造の改善（重複排除、命名改善、構造整理）
- **コードスメル検出**: 問題のあるコードパターンの特定と修正
- **SOLID原則適用**: 設計原則に基づくコード改善

## 参照資料

| 資料名         | パス                             | 説明          |
| -------------- | -------------------------------- | ------------- |
| ゲート判定結果 | `outputs/phase-7/gate-result.md` | Phase 7成果物 |
| 実装コード     | `apps/desktop/src/`              | Phase 5成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容               |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------ |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | コード構造パターン |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 保守性基準         |

## リファクタリング対象

| 対象             | 改善内容                 | 優先度 |
| ---------------- | ------------------------ | ------ |
| chatEditSlice    | 状態更新ロジックの抽象化 | 高     |
| useFileContext   | 共通処理の抽出           | 高     |
| IPC Handler      | エラーハンドリングの統一 | 中     |
| UIコンポーネント | コンポーネント分割       | 中     |

## 実行手順

### 1. コードスメル検出

以下のコードスメルを検出し、修正対象を特定:

- 重複コード
- 長すぎる関数
- 複雑な条件分岐
- 不適切な命名
- マジックナンバー

### 2. リファクタリング実施

#### 状態管理のリファクタリング

```typescript
// Before: 直接的な状態更新
approveResult: (resultId) => {
  set((state) => ({
    generatedResults: state.generatedResults.map((r) =>
      r.id === resultId ? { ...r, status: "approved" } : r,
    ),
  }));
};

// After: 共通ユーティリティの使用
const updateResultStatus = (
  results: GeneratedResult[],
  id: string,
  status: ResultStatus,
) => results.map((r) => (r.id === id ? { ...r, status } : r));

approveResult: (resultId) => {
  set((state) => ({
    generatedResults: updateResultStatus(
      state.generatedResults,
      resultId,
      "approved",
    ),
  }));
};
```

#### エラーハンドリングの統一

```typescript
// Before: 個別のエラーハンドリング
ipcMain.handle("chat-edit:read-file", async (event, filePath: string) => {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return { success: true, content };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// After: 共通エラーハンドラーの使用
const withErrorHandling = <T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>,
): ((...args: A) => Promise<Result<T>>) => {
  return async (...args) => {
    try {
      const result = await fn(...args);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };
};
```

### 3. テスト実行

リファクタリング後にテストが継続成功することを確認:

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
pnpm --filter @repo/desktop test:e2e
```

| 確認項目           | 結果 |
| ------------------ | ---- |
| ユニットテスト成功 | -    |
| 統合テスト成功     | -    |
| E2Eテスト成功      | -    |

## 成果物

| 成果物               | パス                                 | 説明         |
| -------------------- | ------------------------------------ | ------------ |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 変更内容記録 |
| リファクタ後コード   | `apps/desktop/src/`                  | 改善後コード |

## 完了条件

- [ ] テストが継続成功
- [ ] コード品質が改善されている
- [ ] 重複が排除されている
- [ ] 統合テストが継続成功
- [ ] コードスメルが解消されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. コードスメル検出
3. chatEditSliceリファクタリング
4. useFileContextリファクタリング
5. IPC Handlerリファクタリング
6. UIコンポーネントリファクタリング
7. テスト実行・成功確認
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/workspace-chat-edit --phase 8
```

## 次のPhase

Phase 9: 品質保証
