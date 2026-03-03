# Phase 12: IPC ドキュメント — skill:getFileTree

## チャンネル定義

| 項目           | 値                                   |
| -------------- | ------------------------------------ |
| チャンネル名   | `skill:getFileTree`                  |
| 定数名         | `IPC_CHANNELS.SKILL_GET_FILE_TREE`   |
| 方向           | Renderer → Main（invoke/handle）     |
| ホワイトリスト | `ALLOWED_INVOKE_CHANNELS` に登録済み |

## リクエスト

```typescript
// Preload (skill-api.ts)
getFileTree(skillName: string): Promise<SkillFileTreeNode[]>

// IPC ハンドラ引数
args: { skillName: string }
```

## レスポンス

### 成功時

```typescript
{
  success: true,
  data: SkillFileTreeNode[]
}
```

### 失敗時

```typescript
{
  success: false,
  error: string  // "skillName must be a non-empty string" | "Skill not found: ..." | "Internal error"
}
```

## SkillFileTreeNode 型

```typescript
interface SkillFileTreeNode {
  name: string; // ファイル名またはディレクトリ名
  path: string; // スキルディレクトリからの相対パス（POSIX形式）
  type: "file" | "directory"; // ノード種別
  children?: SkillFileTreeNode[]; // ディレクトリの場合のみ
}
```

## セキュリティ

1. `validateIpcSender` — 送信元ウィンドウ検証
2. P42 3段バリデーション — `typeof` + `trim()` + 空文字列チェック
3. `findSkillDir` — パストラバーサル防止
4. `isKnownSkillFileError` — 既知エラーのメッセージ返却、未知エラーは "Internal error" にサニタイズ

## 使用例

```typescript
// Renderer (useFileTree.ts)
const tree = await window.electronAPI.skill.getFileTree(skillName);
```
