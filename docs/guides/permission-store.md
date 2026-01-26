# Permission Store 実装ガイド

> rememberChoice機能による権限永続化の使用方法

**実装タスク**: TASK-3-1-E（2026-01-26完了）

---

## Part 1: 概念的説明（ユーザー向け）

### rememberChoice機能とは

rememberChoice機能は、スキル実行時の権限確認ダイアログで「次回から確認しない」を選択した場合に、その設定を記憶する機能です。

**メリット**:

- 毎回同じツールの権限確認を行う手間を省略
- 作業フローの中断を最小化
- アプリを再起動しても設定が維持される

### ユーザー向け使い方

#### 権限を記憶する

1. スキル実行時に権限確認ダイアログが表示される
2. 「このツールを許可」を選択
3. 「次回から確認しない」にチェックを入れる
4. 確認ボタンをクリック

以降、同じツールの権限確認はスキップされます。

#### 設定画面での管理

**許可済みツールの確認**:

1. アプリの設定画面を開く
2. 「Allowed Tools」セクションを表示
3. 許可済みのツール一覧が表示される（許可日時付き）

**個別の許可を取り消す**:

1. 取り消したいツールの横にある「Revoke」ボタンをクリック
2. 許可が取り消され、次回からダイアログが表示される

**すべての許可をクリア**:

1. 「Clear All」ボタンをクリック
2. 確認ダイアログで「OK」を選択
3. すべての許可設定がクリアされる

### データの保存場所

設定は以下の場所に自動保存されます：

| OS      | パス                                                              |
| ------- | ----------------------------------------------------------------- |
| macOS   | ~/Library/Application Support/@repo-desktop/permission-store.json |
| Windows | %APPDATA%/@repo-desktop/permission-store.json                     |
| Linux   | ~/.config/@repo-desktop/permission-store.json                     |

---

## Part 2: 技術的詳細（開発者向け）

### PermissionStore API

`PermissionStore`クラスは、ツール許可状態の永続化を管理します。

**ファイル**: `apps/desktop/src/main/services/skill/PermissionStore.ts`

#### インスタンス取得

```typescript
import { PermissionStore } from "./services/skill/PermissionStore";

// シングルトンインスタンスを取得
const store = PermissionStore.getInstance();
```

#### 主要メソッド

| メソッド                  | 戻り値               | 計算量 | 説明                         |
| ------------------------- | -------------------- | ------ | ---------------------------- |
| `isToolAllowed(tool)`     | `boolean`            | O(1)   | ツールが許可済みか判定       |
| `allowTool(tool)`         | `void`               | O(1)   | ツールを許可リストに追加     |
| `revokeTool(tool)`        | `boolean`            | O(1)   | ツールを許可リストから削除   |
| `getAllowedTools()`       | `string[]`           | O(n)   | 許可ツール名一覧を取得       |
| `getAllowedToolEntries()` | `AllowedToolEntry[]` | O(n)   | 許可ツール詳細一覧を取得     |
| `clearAll()`              | `number`             | O(n)   | 全許可をクリア（削除数返却） |

#### 使用例

```typescript
const store = PermissionStore.getInstance();

// ツールが許可済みか確認
if (store.isToolAllowed("Read")) {
  // 許可済み - ダイアログをスキップ
  executeSkill();
} else {
  // 未許可 - ダイアログを表示
  showPermissionDialog();
}

// ツールを許可リストに追加
store.allowTool("Read");

// 許可を取り消し
store.revokeTool("Read");

// 全許可をクリア
const clearedCount = store.clearAll();
console.log(`${clearedCount}件の許可をクリアしました`);
```

### SkillExecutorとの連携

`SkillExecutor`は`PermissionStore`と連携して、許可済みツールのダイアログスキップを実現します。

**連携フロー**:

```
┌─────────────────┐
│  Skill Request  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ isToolAllowed() │────▶│  PermissionStore │
└────────┬────────┘     └─────────────────┘
         │
    ┌────┴────┐
    │ Allowed?│
    └────┬────┘
    ┌────▼────┐    ┌────▼────┐
    │  Yes    │    │   No    │
    └────┬────┘    └────┬────┘
         │              │
         ▼              ▼
    ┌─────────┐    ┌─────────────┐
    │ Execute │    │ Show Dialog │
    └─────────┘    └──────┬──────┘
                          │
                    ┌─────▼─────┐
                    │ Remember? │
                    └─────┬─────┘
                    ┌─────▼─────┐
                    │allowTool()│
                    └───────────┘
```

**SkillExecutor内での使用**:

```typescript
class SkillExecutor {
  private permissionStore = PermissionStore.getInstance();

  async executeWithPermission(toolName: string): Promise<void> {
    // 許可済みならダイアログスキップ
    if (this.permissionStore.isToolAllowed(toolName)) {
      return this.execute(toolName);
    }

    // 権限確認ダイアログを表示
    const response = await this.showPermissionDialog(toolName);

    if (response.allowed && response.rememberChoice) {
      // 「次回から確認しない」が選択された
      this.permissionStore.allowTool(toolName);
    }

    if (response.allowed) {
      return this.execute(toolName);
    }

    throw new Error("Permission denied");
  }
}
```

### IPCハンドラーの使用方法

**ファイル**: `apps/desktop/src/main/ipc/permission-handlers.ts`

#### IPCチャンネル一覧

| チャンネル                   | 機能           | 引数                   | 戻り値                               |
| ---------------------------- | -------------- | ---------------------- | ------------------------------------ |
| `permission:getAllowedTools` | 許可ツール取得 | なし                   | `{ tools: AllowedToolEntry[] }`      |
| `permission:revokeTool`      | 許可取消       | `{ toolName: string }` | `{ success: boolean }`               |
| `permission:clearAll`        | 全クリア       | なし                   | `{ success: boolean, clearedCount }` |

#### Renderer側での使用（window.permissionAPI）

```typescript
// 許可済みツール一覧を取得
const { tools } = await window.permissionAPI.getAllowedTools();
console.log(tools);
// [{ toolName: "Read", allowedAt: "2026-01-26T10:00:00.000Z" }, ...]

// 特定ツールの許可を取り消し
const { success } = await window.permissionAPI.revokeTool("Read");

// 全許可をクリア
const { success, clearedCount } = await window.permissionAPI.clearAll();
```

### 型定義

**ファイル**: `packages/shared/src/types/permission-store.ts`

```typescript
/**
 * 許可済みツールのエントリ
 */
export interface AllowedToolEntry {
  /** ツール識別子 */
  toolName: string;
  /** 許可日時（ISO 8601形式） */
  allowedAt: string;
}

/**
 * PermissionStoreのデータスキーマ
 */
export interface PermissionStoreSchema {
  /** スキーマバージョン */
  version: number;
  /** 許可済みツール一覧 */
  allowedTools: AllowedToolEntry[];
  /** 最終更新日時（ISO 8601形式） */
  updatedAt: string;
}

/**
 * PermissionStore公開インターフェース
 */
export interface IPermissionStore {
  isToolAllowed(toolName: string): boolean;
  allowTool(toolName: string): void;
  revokeTool(toolName: string): boolean;
  getAllowedTools(): string[];
  getAllowedToolEntries(): AllowedToolEntry[];
  clearAll(): number;
}
```

### テスト

```bash
# PermissionStoreのユニットテスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="PermissionStore"

# permission-handlersのテスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="permission-handlers"

# PermissionSettings UIのテスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="PermissionSettings"
```

### トラブルシューティング

| 問題                               | 原因                       | 解決策                                             |
| ---------------------------------- | -------------------------- | -------------------------------------------------- |
| 設定が保存されない                 | electron-storeの初期化失敗 | アプリを再起動し、設定ファイルを確認               |
| 許可したはずのツールが表示されない | キャッシュ不整合           | `clearAll()`で一度クリアしてやり直す               |
| IPCエラーが発生する                | ハンドラー未登録           | `registerPermissionHandlers()`が呼ばれているか確認 |

---

## 関連ドキュメント

- [セキュリティ仕様](/.claude/skills/aiworkflow-requirements/references/security-skill-execution.md) - Permission Storeセキュリティ
- [設定UI仕様](/.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md) - PermissionSettings UI
- [Agent SDKインターフェース](/.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md) - IPC仕様

---

## 変更履歴

| Version | Date       | Changes                |
| ------- | ---------- | ---------------------- |
| 1.0.0   | 2026-01-26 | 初版作成（TASK-3-1-E） |
