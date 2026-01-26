# TASK-4-1: IPCチャネル定義 - 実装ガイド

## メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | TASK-4-1           |
| 作成日   | 2026-01-25         |
| 対象者   | 後続タスク開発者   |
| 関連     | TASK-4-2, TASK-5-1 |

---

# Part 1: 概念的説明（初学者向け）

## 1. IPCチャネルとは

### 1.1 概要

IPC（Inter-Process Communication）チャネルは、Electronアプリケーションにおいて
**Mainプロセス**と**Rendererプロセス**間の通信を行うための「通信経路の名前」です。

```
┌─────────────────────┐     IPC Channel      ┌─────────────────────┐
│   Renderer Process  │ ◄───────────────────► │    Main Process     │
│   (フロントエンド)   │    "skill:list"     │   (バックエンド)     │
└─────────────────────┘                       └─────────────────────┘
```

### 1.2 なぜチャネル名が重要か

- **セキュリティ**: 未知のチャネルへのアクセスを防止
- **型安全性**: TypeScriptで静的に検証可能
- **保守性**: 一元管理により変更容易

## 2. ホワイトリスト方式

### 2.1 概念

ホワイトリスト方式とは、「許可されたチャネルのみ通信可能」とするセキュリティ機構です。

```typescript
// ホワイトリストに登録されたチャネルのみ許可
ALLOWED_INVOKE_CHANNELS = ["skill:list", "skill:scan", ...];
ALLOWED_ON_CHANNELS = ["skill:complete", "skill:error", ...];
```

### 2.2 invoke vs on

| 種別   | 方向          | 用途           | ホワイトリスト          |
| ------ | ------------- | -------------- | ----------------------- |
| invoke | Renderer→Main | リクエスト送信 | ALLOWED_INVOKE_CHANNELS |
| on     | Main→Renderer | イベント受信   | ALLOWED_ON_CHANNELS     |

## 3. 追加したチャネルの用途

### 3.1 スキル発見系

| チャネル     | 用途                         |
| ------------ | ---------------------------- |
| `skill:list` | 利用可能なスキル一覧を取得   |
| `skill:scan` | スキルディレクトリをスキャン |

### 3.2 インポート管理系

| チャネル            | 用途                           |
| ------------------- | ------------------------------ |
| `skill:getImported` | インポート済みスキル一覧を取得 |
| `skill:update`      | スキル設定を更新               |

### 3.3 ストリーミングイベント系

| チャネル         | 用途                       |
| ---------------- | -------------------------- |
| `skill:complete` | スキル実行完了イベント受信 |
| `skill:error`    | スキルエラーイベント受信   |

### 3.4 権限管理系

| チャネル                    | 用途                            |
| --------------------------- | ------------------------------- |
| `skill:permission:request`  | Main→Rendererへの権限リクエスト |
| `skill:permission:response` | Renderer→Mainへの権限レスポンス |

---

# Part 2: 技術的詳細（開発者向け）

## 1. チャネル定数の使用方法

### 1.1 インポート

```typescript
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
  type IpcChannel,
} from "@repo/desktop/preload/channels";
```

### 1.2 Main Process側での使用

```typescript
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "./preload/channels";

// ハンドラー登録
ipcMain.handle(IPC_CHANNELS.SKILL_LIST, async () => {
  return await skillService.listSkills();
});

// イベント送信
mainWindow.webContents.send(IPC_CHANNELS.SKILL_COMPLETE, { skillId: "xxx" });
```

### 1.3 Renderer Process側での使用

```typescript
import { IPC_CHANNELS } from "@repo/desktop/preload/channels";

// 呼び出し（invoke）
const skills = await window.electronAPI.invoke(IPC_CHANNELS.SKILL_LIST);

// イベントリスナー（on）
window.electronAPI.on(IPC_CHANNELS.SKILL_COMPLETE, (data) => {
  console.log("Skill completed:", data);
});
```

## 2. 型定義の参照方法

### 2.1 IpcChannel型

```typescript
import { type IpcChannel } from "@repo/desktop/preload/channels";

// IpcChannel型は全チャネル値のユニオン型
function handleChannel(channel: IpcChannel) {
  // channel は "skill:list" | "skill:scan" | ... のいずれか
}
```

### 2.2 リテラル型の活用

```typescript
// 各チャネルはリテラル型として推論される
const channel = IPC_CHANNELS.SKILL_LIST; // 型: "skill:list"

// 型チェックが効く
function expectSkillList(c: "skill:list") {}
expectSkillList(IPC_CHANNELS.SKILL_LIST); // OK
expectSkillList(IPC_CHANNELS.SKILL_SCAN); // エラー
```

## 3. ホワイトリスト登録の確認方法

### 3.1 プログラムでの確認

```typescript
import { ALLOWED_INVOKE_CHANNELS, IPC_CHANNELS } from "./channels";

// invokeチャネルとして登録されているか確認
const isAllowed = ALLOWED_INVOKE_CHANNELS.includes(IPC_CHANNELS.SKILL_LIST);
console.log(isAllowed); // true
```

### 3.2 テストでの確認

```typescript
describe("Whitelist", () => {
  it("should include SKILL_LIST in invoke channels", () => {
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.SKILL_LIST);
  });
});
```

## 4. 後続タスクでの使用例

### 4.1 TASK-4-2: スキル発見・一覧API実装

```typescript
// Main Process (skillHandlers.ts)
ipcMain.handle(IPC_CHANNELS.SKILL_LIST, async () => {
  return await skillService.listAvailableSkills();
});

ipcMain.handle(IPC_CHANNELS.SKILL_SCAN, async (_, directory: string) => {
  return await skillService.scanDirectory(directory);
});
```

### 4.2 TASK-5-1: 権限リクエストUI実装

```typescript
// Renderer Process
window.electronAPI.on(IPC_CHANNELS.SKILL_PERMISSION_REQUEST, (request) => {
  // 権限ダイアログを表示
  showPermissionDialog(request);
});

// ユーザーが承認した場合
const response = await window.electronAPI.invoke(
  IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
  { approved: true },
);
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
