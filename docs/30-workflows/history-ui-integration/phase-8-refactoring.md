# Phase 8: リファクタリング（TDD: Refactor） - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 8                      |
| Phase名    | リファクタリング       |
| 前提Phase  | Phase 7                |
| 後続Phase  | Phase 9                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-10             |
| 機能名     | history-ui-integration |

---

## 目的

動作を変えずにコード品質を改善する。TDDのRefactorフェーズとして、テストが通る状態を維持しながらコードを整理する。

## 背景

Phase 5で実装したコードは「テストを通すための最小限の実装」。Phase 8ではコード品質を向上させ、保守性・可読性を高める。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コードスメル検出

**目的**: 問題のあるコードパターンを特定

**実行手順**:

1. 重複コードを検出
2. 長すぎる関数を特定
3. 複雑な条件分岐を特定
4. 命名の改善点を特定

**チェック項目**:

| チェック項目 | 対象ファイル       | 発見事項                   |
| ------------ | ------------------ | -------------------------- |
| 重複コード   | historyHandlers.ts | try-catchパターンの重複    |
| 長い関数     | HistoryPage.tsx    | handleRestoreConfirmが複雑 |
| 命名         | 全ファイル         | 一貫性確認                 |
| 型安全性     | 全ファイル         | any型の使用箇所            |

**期待される成果物**:

- コードスメル一覧

---

### タスク2: 重複排除

**目的**: 重複コードを抽出して共通化

**実行手順**:

1. historyHandlers.tsのtry-catchパターンを共通化
2. ユーティリティ関数を抽出
3. テストが継続して通ることを確認

**リファクタリング例**:

```typescript
// Before: 重複したtry-catch
ipcMain.handle("history:getFileHistory", async (_, fileId, options) => {
  try {
    const result = await historyService.getFileHistory(fileId, options);
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: { message } };
  }
});

// After: 共通ハンドラーラッパー
function createHandler<T>(
  handler: (...args: any[]) => Promise<T>,
): (event: IpcMainInvokeEvent, ...args: any[]) => Promise<Result<T>> {
  return async (_, ...args) => {
    try {
      const data = await handler(...args);
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: { message } };
    }
  };
}

ipcMain.handle(
  "history:getFileHistory",
  createHandler((fileId, options) =>
    historyService.getFileHistory(fileId, options),
  ),
);
```

**期待される成果物**:

- リファクタリング済みコード

---

### タスク3: 命名改善

**目的**: 変数名・関数名を明確化

**実行手順**:

1. 略語を正式名称に変更
2. 意図が明確な命名に変更
3. 一貫した命名規則を適用

**期待される成果物**:

- 命名改善済みコード

---

### タスク4: 型安全性向上

**目的**: any型を排除し、厳密な型定義を適用

**実行手順**:

1. any型の使用箇所を特定
2. 適切な型定義に置換
3. 型エラーがないことを確認

**期待される成果物**:

- 型安全なコード

---

### タスク5: テスト継続確認

**目的**: リファクタリング後もテストが通ることを確認

**実行手順**:

1. 全テストを実行
2. カバレッジが維持されていることを確認
3. 失敗がある場合は修正

**実行コマンド**:

```bash
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:coverage
```

**期待される成果物**:

- テスト実行結果

---

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:coverage
```

---

## 参照資料

| 参照資料                  | パス                                 | 内容                 |
| ------------------------- | ------------------------------------ | -------------------- |
| Phase 7カバレッジレポート | `outputs/phase-7/coverage-report.md` | 現在のカバレッジ     |
| 実装コード                | `apps/desktop/src/`                  | リファクタリング対象 |

---

## 成果物

| 成果物                   | パス                                    | 内容               |
| ------------------------ | --------------------------------------- | ------------------ |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` | 変更内容           |
| テスト結果               | `outputs/phase-8/test-result.md`        | テスト継続成功確認 |

---

## 完了条件

- [ ] コードスメルが特定されている
- [ ] 重複コードが排除されている
- [ ] 命名が改善されている
- [ ] any型が排除されている
- [ ] テストが継続成功
- [ ] カバレッジが維持されている
- [ ] コード品質が改善されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonが更新されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. コードスメル検出
2. 重複排除
3. 命名改善
4. 型安全性向上
5. テスト継続確認
6. リファクタリングレポート作成
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/history-ui-integration --phase 8
```

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/history-ui-integration/phase-9-quality-assurance.md`
