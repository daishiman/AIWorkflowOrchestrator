# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 8                     |
| 機能名 | history-preload-setup |
| 作成日 | 2026-01-12            |

---

## 目的

動作を変えずにコード品質を改善する。preload実装の可読性・保守性を向上させる。

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> リファクタリング時に必ず以下のシステム仕様を確認し、仕様準拠を維持してください。

| 参照資料                  | パス                                                                         | 内容                               |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| 履歴/ログ表示UI仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`   | HistoryAPI仕様・IPCチャンネル名    |
| APIセキュリティ・Electron | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | preload・contextBridgeセキュリティ |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "preload"`

---

## 実行タスク

| タスク           | 責務                           |
| ---------------- | ------------------------------ |
| コードスメル検出 | 問題のあるコードパターンの特定 |
| 重複排除         | 重複コードの共通化             |
| 命名改善         | 変数・関数名の明確化           |

---

## リファクタリング観点

### 1. コード構造

| 観点       | 確認項目                               |
| ---------- | -------------------------------------- |
| 関数分離   | historyAPI定義が適切に分離されているか |
| 型定義     | 型が再利用可能な形で定義されているか   |
| インポート | 不要なインポートがないか               |

### 2. 可読性

| 観点         | 確認項目                               |
| ------------ | -------------------------------------- |
| 命名         | 変数・関数名が意図を表現しているか     |
| コメント     | 必要なコメントが適切に配置されているか |
| フォーマット | コードフォーマットが一貫しているか     |

### 3. 保守性

| 観点         | 確認項目                           |
| ------------ | ---------------------------------- |
| DRY原則      | 重複コードがないか                 |
| 単一責務     | 各関数が単一の責務を持っているか   |
| テスト容易性 | モック・スタブが容易に適用できるか |

---

## リファクタリング例

### Before（問題がある場合）

```typescript
// historyAPIの公開（インライン定義）
contextBridge.exposeInMainWorld("historyAPI", {
  getFileHistory: (
    fileId: string,
    options?: { limit?: number; offset?: number },
  ) => ipcRenderer.invoke("history:getFileHistory", fileId, options),
  // ... 他のメソッドも同様にハードコード
});
```

### After（改善後）

```typescript
import { HISTORY_CHANNELS } from "./channels";

// 型定義を分離
interface PaginationOptions {
  limit?: number;
  offset?: number;
}

// historyAPI定義を分離
const historyAPI = {
  getFileHistory: (fileId: string, options?: PaginationOptions) =>
    ipcRenderer.invoke(HISTORY_CHANNELS.GET_FILE_HISTORY, fileId, options),
  // ... チャンネル定数を使用
};

// 公開
contextBridge.exposeInMainWorld("historyAPI", historyAPI);
```

---

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test
```

---

## 成果物

| 成果物               | パス                                    | 説明         |
| -------------------- | --------------------------------------- | ------------ |
| リファクタリング結果 | `outputs/phase-8/refactoring-report.md` | 変更内容記録 |

---

## 完了条件

- [ ] コードスメルが解消されている
- [ ] テストが継続成功
- [ ] コード品質が改善されている
- [ ] 重複が排除されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

---

## 次のPhase

Phase 9: 品質保証
