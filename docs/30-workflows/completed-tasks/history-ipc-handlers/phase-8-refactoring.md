# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 8                    |
| Phase名    | リファクタリング     |
| 前提Phase  | Phase 7              |
| 後続Phase  | Phase 9              |
| ステータス | 未実施               |
| 作成日     | 2026-01-11           |
| 機能名     | history-ipc-handlers |

---

## 目的

TDDのRefactorフェーズとして、テストが成功する状態を維持しながらコード品質を改善する。
重複コードの削除、命名の改善、構造の最適化を行う。

## 背景

Phase 5〜7でテストが成功し、カバレッジ基準を満たしている状態。本Phaseでは、機能を変更せずにコードの可読性・保守性を向上させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コード重複の削除

**目的**: 重複しているコードを共通化する。

**実行手順**:

1. historyHandlers.ts 内の重複パターンを特定する
2. エラーハンドリングのtry-catchパターンを共通化する
3. Result型の生成ロジックを共通関数に抽出する
4. リファクタリング後もテストが成功することを確認する

**期待される成果物**:

- リファクタリングされたコード

---

### タスク2: 命名の改善

**目的**: 変数名・関数名をより明確にする。

**実行手順**:

1. 曖昧な命名を特定する
2. より明確な命名に変更する
3. コメントの追加・改善を行う
4. リファクタリング後もテストが成功することを確認する

**期待される成果物**:

- 命名が改善されたコード

---

### タスク3: 構造の最適化

**目的**: コードの構造を最適化する。

**実行手順**:

1. 関数の責務が単一かを確認する
2. 必要に応じて関数を分割する
3. インポート/エクスポートの整理を行う
4. リファクタリング後もテストが成功することを確認する

**期待される成果物**:

- 構造が最適化されたコード

---

### タスク4: 型定義の改善

**目的**: 型定義をより厳密にする。

**実行手順**:

1. any型の使用箇所を特定する
2. 適切な型に置き換える
3. 型エイリアスやインターフェースを整理する
4. リファクタリング後もテストが成功することを確認する

**期待される成果物**:

- 型定義が改善されたコード

---

### タスク5: リファクタリング結果の確認

**目的**: リファクタリング後もテストが成功することを最終確認する。

**実行手順**:

1. `pnpm --filter @repo/desktop test` を実行する
2. 全テストが成功することを確認する
3. カバレッジが維持されていることを確認する
4. `outputs/phase-8/refactoring-result.md` に結果を記録する

**期待される成果物**:

- `outputs/phase-8/refactoring-result.md`（リファクタリング結果）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | コード構造の指針       |
| Electronセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | セキュリティ維持の確認 |

---

## 成果物

| 成果物               | パス                                           | 内容                   |
| -------------------- | ---------------------------------------------- | ---------------------- |
| リファクタリング結果 | `outputs/phase-8/refactoring-result.md`        | リファクタリングの記録 |
| 更新されたコード     | `apps/desktop/src/main/ipc/historyHandlers.ts` | 改善されたコード       |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 8での統合テスト連携アクション

リファクタ後のIPC統合テスト継続成功を確認すること。

| 項目               | 内容                                       |
| ------------------ | ------------------------------------------ |
| 統合テスト継続成功 | リファクタリング後も全統合テストが成功する |
| カバレッジ維持     | カバレッジが低下していないことを確認       |
| 機能変更なし       | 機能的な変更がないことを確認               |

---

## 完了条件

- [ ] コード重複が削除された
- [ ] 命名が改善された
- [ ] 構造が最適化された
- [ ] 型定義が改善された
- [ ] リファクタリング後もテストが成功している
- [ ] カバレッジが維持されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## リファクタリング例（参考）

### Before: 重複コード

```typescript
ipcMain.handle("history:getFileHistory", async (_event, fileId, options) => {
  try {
    const result = await historyService.getFileHistory(fileId, options);
    return { success: true, data: result };
  } catch (error) {
    console.error("[IPC] history:getFileHistory error:", error);
    return { success: false, error: { message: error.message } };
  }
});

ipcMain.handle("history:getVersionDetail", async (_event, conversionId) => {
  try {
    const result = await historyService.getVersionDetail(conversionId);
    return { success: true, data: result };
  } catch (error) {
    console.error("[IPC] history:getVersionDetail error:", error);
    return { success: false, error: { message: error.message } };
  }
});
```

### After: 共通化

```typescript
function createHandler<T, A extends unknown[]>(
  channel: string,
  handler: (...args: A) => Promise<T>,
): (...args: A) => Promise<Result<T>> {
  return async (...args: A) => {
    try {
      const result = await handler(...args);
      return { success: true, data: result };
    } catch (error) {
      console.error(`[IPC] ${channel} error:`, error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };
}
```

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### 実行タスク

- タスク1（コード重複の削除）: [結果を記入]
- タスク2（命名の改善）: [結果を記入]
- タスク3（構造の最適化）: [結果を記入]
- タスク4（型定義の改善）: [結果を記入]
- タスク5（リファクタリング結果の確認）: [結果を記入]

### リファクタリング内容

- 削除した重複:
- 改善した命名:
- 最適化した構造:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/history-ipc-handlers/phase-9-quality.md`
