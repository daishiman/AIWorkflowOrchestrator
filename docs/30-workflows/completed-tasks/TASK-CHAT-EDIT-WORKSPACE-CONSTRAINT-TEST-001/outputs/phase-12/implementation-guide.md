# Implementation Guide: UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001

## Part 1: 中学生向けの説明

### なぜ必要か

`workspacePath` 制約のテストは、編集対象のファイルが「作業してよいフォルダ」の中にあるかを守るために必要です。これがないと、関係ない場所のファイルまで読み書きしてしまう事故や攻撃につながります。

### 何をするか

このタスクでは `chat-edit:send-with-context` に対して、workspace 内外・未指定・空配列・パストラバーサルを含むケースをテストします。

### 日常のたとえ

学校の図書室で「この棚の本だけ借りてよい」と決まっているのに、別の教室の棚まで取りに行けたら困ります。`workspacePath` はこの「借りてよい棚の境界線」です。

## Part 2: 開発者向け詳細

### TypeScript 型定義

```typescript
interface WorkspaceConstraintCase {
  id: string;
  workspacePath?: string | null;
  filePaths: string[];
  expected: {
    success: boolean;
    errorCode?: "PERMISSION_DENIED";
  };
}
```

### APIシグネチャ

- `chat-edit:send-with-context(request: SendWithContextRequest): Promise<SendWithContextResponse>`
- `isAllowedPath(filePath: string, allowedDirs: string[]): boolean`

### 使用例

```bash
cd apps/desktop
pnpm exec vitest run src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts
```

```typescript
const response = await handler(event, {
  contexts: [{ filePath: "/workspace/src/index.ts", content: "..." }],
  command: { type: "refactor", targetContextId: "ctx-1" },
  workspacePath: "/workspace",
});
```

### エラーハンドリング

- 境界外パス検出時は `PERMISSION_DENIED` を返す。
- sender 検証失敗時は IPC validation error envelope を返す。

### エッジケース

- `workspacePath` 未指定: 検証をスキップする後方互換挙動。
- `contexts=[]`: `isAllowedPath` 未呼び出しで正常終了。
- `workspacePath` が空文字/非 string: ガード条件を通らない入力として扱う。

### 設定可能なパラメータと定数

- `workspacePath`: 検証境界ルート。
- `contexts[].filePath`: 対象ファイルパス。
- 判定結果コード: `PERMISSION_DENIED`。
