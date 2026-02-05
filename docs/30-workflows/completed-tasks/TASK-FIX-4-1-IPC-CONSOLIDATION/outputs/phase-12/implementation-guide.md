# TASK-FIX-4-1-IPC-CONSOLIDATION 実装ガイド

## メタ情報

| 項目     | 値                             |
| -------- | ------------------------------ |
| タスクID | TASK-FIX-4-1-IPC-CONSOLIDATION |
| Phase    | 12                             |
| 作成日   | 2026-02-05                     |
| 作成者   | Claude Opus 4.5                |

---

# Part 1: 概念説明（初学者向け）

## 🎯 このタスクは何をしたの？

### 日常の例え話

家の中にたくさんのドアがあるとします。でも、同じ部屋に行くのに2つのドアがあったらどうでしょう？

- 「リビングへの赤いドア」と「リビングへの青いドア」が両方ある
- どっちを使えばいいか分からない
- 掃除するときも2つ掃除しなきゃいけない

**このタスクでやったこと**: 同じ場所に行くドアを1つにまとめて、どのドアを使えばいいか分かりやすくしました。

### なぜ必要だったの？

アプリの「メイン画面」と「裏方」が話すとき、「チャンネル」という通り道を使います。でも、開発を進めるうちに同じ用途のチャンネルが2つできてしまいました：

| 問題のチャンネル       | 何をするもの？                 |
| ---------------------- | ------------------------------ |
| `skill:list-available` | スキル一覧を取得（古い名前）   |
| `skill:list`           | スキル一覧を取得（新しい名前） |

2つあると混乱するので、新しい名前に統一しました。

### 何が良くなったの？

1. **迷わなくなった**: どのチャンネルを使えばいいか明確になった
2. **安全になった**: 「ホワイトリスト」という許可リストも整理された
3. **テストしやすくなった**: 42個のテストで正しく動くことを確認

---

# Part 2: 技術詳細（開発者向け）

## 1. 変更概要

### 1.1 削除されたチャンネル

```typescript
// 削除: apps/desktop/src/preload/channels.ts
export const IPC_CHANNELS = {
  // ❌ 以下は削除
  // SKILL_LIST_AVAILABLE: "skill:list-available",
  // SKILL_LIST_IMPORTED: "skill:list-imported",

  // ✅ 統一後の定義
  SKILL_LIST: "skill:list",
  SKILL_GET_IMPORTED: "skill:getImported",
  // ...
} as const;
```

### 1.2 チャンネルマッピング

| 旧チャンネル           | 新チャンネル         | 対応     |
| ---------------------- | -------------------- | -------- |
| `SKILL_LIST_AVAILABLE` | `SKILL_LIST`         | 統合     |
| `SKILL_LIST_IMPORTED`  | `SKILL_GET_IMPORTED` | 名前変更 |

## 2. 修正ファイル詳細

### 2.1 channels.ts（チャンネル定義）

**ファイル**: `apps/desktop/src/preload/channels.ts`

**変更内容**:

- 重複チャンネル定義（SKILL_LIST_AVAILABLE, SKILL_LIST_IMPORTED）を削除
- ALLOWED_INVOKE_CHANNELSから旧チャンネルを削除

```typescript
// 修正後のホワイトリスト
export const ALLOWED_INVOKE_CHANNELS = [
  IPC_CHANNELS.SKILL_LIST,
  IPC_CHANNELS.SKILL_GET_IMPORTED,
  // ...（他のチャンネル）
] as const;
```

### 2.2 skill-api.ts（Preload API）

**ファイル**: `apps/desktop/src/preload/skill-api.ts`

**変更内容**:

- ハードコード文字列をIPC_CHANNELS定数に置換

```typescript
// ❌ Before: ハードコード（型チェック・ホワイトリストバイパス）
return safeOn<{ executionId: string }>("skill:complete" as string, callback);

// ✅ After: 定数使用（型安全・ホワイトリスト準拠）
return safeOn<{ executionId: string }>(IPC_CHANNELS.SKILL_COMPLETE, callback);
```

### 2.3 skillHandlers.ts（Main Process ハンドラー）

**ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`

**変更内容**:

- ハンドラー登録を新チャンネル名に更新

```typescript
// ❌ Before
ipcMain.handle(IPC_CHANNELS.SKILL_LIST_AVAILABLE, ...)
ipcMain.handle(IPC_CHANNELS.SKILL_LIST_IMPORTED, ...)

// ✅ After
ipcMain.handle(IPC_CHANNELS.SKILL_LIST, ...)
ipcMain.handle(IPC_CHANNELS.SKILL_GET_IMPORTED, ...)
```

## 3. 型定義・インターフェース

### 3.1 IPC_CHANNELS定義

```typescript
export const IPC_CHANNELS = {
  // スキル管理
  SKILL_LIST: "skill:list",
  SKILL_SCAN: "skill:scan",
  SKILL_GET_IMPORTED: "skill:getImported",
  SKILL_UPDATE: "skill:update",

  // スキル実行イベント
  SKILL_COMPLETE: "skill:complete",
  SKILL_ERROR: "skill:error",

  // 権限制御
  SKILL_PERMISSION_REQUEST: "skill:permission:request",
  SKILL_PERMISSION_RESPONSE: "skill:permission:response",
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
```

### 3.2 ホワイトリスト定義

```typescript
// Renderer → Main（invoke用）
export const ALLOWED_INVOKE_CHANNELS = [
  IPC_CHANNELS.SKILL_LIST,
  IPC_CHANNELS.SKILL_SCAN,
  IPC_CHANNELS.SKILL_GET_IMPORTED,
  IPC_CHANNELS.SKILL_UPDATE,
  IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
] as const;

// Main → Renderer（on用）
export const ALLOWED_ON_CHANNELS = [
  IPC_CHANNELS.SKILL_COMPLETE,
  IPC_CHANNELS.SKILL_ERROR,
  IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
] as const;
```

## 4. テスト

### 4.1 テストファイル

**パス**: `apps/desktop/src/preload/__tests__/channels.ipc-consolidation.test.ts`

### 4.2 テストカテゴリ

| カテゴリ               | テスト数 | 内容                         |
| ---------------------- | -------- | ---------------------------- |
| 旧チャンネル削除       | 8        | 削除確認・ホワイトリスト確認 |
| チャンネル統一         | 10       | 新チャンネル存在確認         |
| ハードコード文字列排除 | 12       | 定数使用確認                 |
| 仕様準拠               | 12       | ホワイトリスト・通信方向確認 |

**合計**: 42テスト

## 5. 使用例

### 5.1 スキル一覧取得

```typescript
// Renderer側
const skills = await window.skillApi.listAvailable();

// → 内部でIPC_CHANNELS.SKILL_LISTを使用
// → Main Processのskill:listハンドラーが応答
```

### 5.2 イベント購読

```typescript
// スキル完了イベントを購読
window.skillApi.onComplete((data) => {
  console.log(`Skill ${data.executionId} completed`);
});

// → 内部でIPC_CHANNELS.SKILL_COMPLETEを使用
```

## 6. 注意事項

### 6.1 開発者向け

1. **新規チャンネル追加時**: `preload/channels.ts`のみに追加
2. **ホワイトリスト登録必須**: ALLOWED\_\*\_CHANNELSに追加
3. **型安全性維持**: 文字列リテラルではなくIPC_CHANNELS定数を使用

### 6.2 セキュリティ

- ハードコード文字列（`"skill:*" as string`）は禁止
- ホワイトリスト外チャンネルは`safeInvoke`/`safeOn`で拒否される

---

## 関連ドキュメント

| ドキュメント              | パス                                                                         |
| ------------------------- | ---------------------------------------------------------------------------- |
| セキュリティ仕様          | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`    |
| Preload APIアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` |
| テスト結果                | `docs/30-workflows/TASK-FIX-4-1-IPC-CONSOLIDATION/outputs/phase-11/`         |
