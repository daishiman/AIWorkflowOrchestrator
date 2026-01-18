# テスト戦略設計書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| 作成日     | 2026-01-17             |
| Phase      | 2                      |
| ステータス | 完了                   |
| 作成者     | Claude Code (自動生成) |

---

## テスト方針

1. **TDD アプローチ**: 先にテストを作成し、その後実装を修正
2. **多層テスト**: ユニット → 統合 → 手動 の順で検証
3. **回帰防止**: 既存機能への影響がないことを確認

---

## ユニットテスト

### テスト対象1: preload/index.ts skillAPI

**ファイル**: `apps/desktop/src/renderer/preload/index.test.ts` (新規作成)

| テストケース                      | 検証内容                              | 優先度 |
| --------------------------------- | ------------------------------------- | ------ |
| import: オブジェクト形式で渡す    | `{ skillIds }` 形式でinvokeが呼ばれる | 高     |
| remove: オブジェクト形式で渡す    | `{ skillId }` 形式でinvokeが呼ばれる  | 高     |
| getDetail: オブジェクト形式で渡す | `{ skillId }` 形式でinvokeが呼ばれる  | 高     |
| import: 空配列の処理              | 空配列でもエラーにならない            | 中     |
| remove: 空文字列の処理            | 空文字列でもエラーにならない          | 中     |
| non-Electron環境のfallback        | fallback値が返される                  | 中     |

### テスト対象2: skillHandlers.ts

**ファイル**: `apps/desktop/src/main/ipc/skillHandlers.test.ts` (既存または新規)

| テストケース                             | 検証内容                         | 優先度 |
| ---------------------------------------- | -------------------------------- | ------ |
| skill:import: 正常なオブジェクト引数     | `{ skillIds: [...] }` で正常動作 | 高     |
| skill:import: 配列直接渡し (旧形式)      | VALIDATION_ERROR が返される      | 高     |
| skill:remove: 正常なオブジェクト引数     | `{ skillId: "..." }` で正常動作  | 高     |
| skill:remove: 文字列直接渡し (旧形式)    | VALIDATION_ERROR が返される      | 高     |
| skill:get-detail: 正常なオブジェクト引数 | `{ skillId: "..." }` で正常動作  | 高     |
| skill:get-detail: 文字列直接渡し         | エラーが返される                 | 高     |

---

## 統合テスト

### テストシナリオ

**ファイル**: `apps/desktop/src/__tests__/integration/skill-ipc.test.ts` (新規作成推奨)

| シナリオID | シナリオ名                   | テスト内容                   | 優先度 |
| ---------- | ---------------------------- | ---------------------------- | ------ |
| IT-001     | スキルインポートIPC通信      | preload → main 間の正常通信  | 高     |
| IT-002     | スキル削除IPC通信            | preload → main 間の正常通信  | 高     |
| IT-003     | スキル詳細取得IPC通信        | preload → main 間の正常通信  | 高     |
| IT-004     | 複数スキル一括インポート     | 複数IDの配列を正しく処理     | 中     |
| IT-005     | 存在しないスキルIDの削除     | エラーハンドリングが正常動作 | 中     |
| IT-006     | 存在しないスキルIDの詳細取得 | エラーハンドリングが正常動作 | 中     |

---

## 手動テスト

### テスト項目

| ID    | テスト項目           | 期待結果                         | 優先度 |
| ----- | -------------------- | -------------------------------- | ------ |
| MT-01 | Agent画面表示        | スキル一覧が正常に表示される     | 高     |
| MT-02 | スキルインポート機能 | 選択したスキルがインポートされる | 高     |
| MT-03 | スキル削除機能       | 選択したスキルが削除される       | 高     |
| MT-04 | スキル詳細表示       | スキルの詳細情報が表示される     | 高     |
| MT-05 | ローディング状態     | 適切にローディング→表示に遷移    | 中     |
| MT-06 | エラー表示           | エラー時に適切なメッセージが表示 | 中     |

---

## テスト優先順位

### Phase 4 (TDD Red - 失敗するテスト作成)

1. preload/index.ts の引数形式テスト
2. skillHandlers.ts の引数検証テスト

### Phase 5 (TDD Green - 実装)

1. preload/index.ts の修正

### Phase 6 (テスト拡充)

1. エッジケーステスト追加
2. 統合テスト追加

### Phase 11 (手動テスト)

1. 全手動テスト項目の実施

---

## テストカバレッジ目標

| 対象ファイル                                 | Line Coverage | Branch Coverage |
| -------------------------------------------- | ------------- | --------------- |
| `apps/desktop/src/renderer/preload/index.ts` | 90%+          | 70%+            |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | 80%+          | 60%+            |

---

## テスト実行コマンド

```bash
# ユニットテスト実行
pnpm --filter @repo/desktop test

# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test:coverage

# 特定ファイルのテスト実行
pnpm --filter @repo/desktop test -- preload/index.test.ts
pnpm --filter @repo/desktop test -- skillHandlers.test.ts
```

---

## テスト環境設定

### モック対象

| モック対象           | モック内容                     |
| -------------------- | ------------------------------ |
| `window.electronAPI` | invoke メソッドをスパイ/モック |
| `ipcMain.handle`     | ハンドラー登録をキャプチャ     |
| `SkillService`       | 各メソッドをモック             |
| `BrowserWindow`      | mainWindow をモック            |

### テストフレームワーク

- **Vitest**: ユニットテスト・統合テスト
- **Playwright**: E2Eテスト (必要に応じて)
