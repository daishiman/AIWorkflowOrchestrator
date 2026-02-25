# Phase 12 実装ガイド

## Part 1（中学生向け）

### なぜやるのか

同じ意味の合図（チャネル名）がバラバラだと、あとで新しい機能を足したときにぶつかってエラーになります。だから、合図の付け方をそろえて事故を防ぎます。

### 何をやるのか

- `skill:get-detail` みたいな古い書き方を、決めたルールに合わせて直します。
- 直す順番は「よく使われるものから」です。
- 直した後、検索コマンドでもう一度チェックします。

## Part 2（技術者向け）

### 対象

- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/main/ipc/permission-handlers.ts`
- `apps/desktop/src/preload/skill-api.ts`

### 型定義例

```ts
export type SkillChannelName =
  | "skill:getDetail"
  | "skill:getStatus"
  | "skill:requestPermission"
  | "skill:respondPermission"
  | "skill:optimizeVariants"
  | "skill:evaluateOptimization";
```

### APIシグネチャ例

```ts
safeInvoke(IPC_CHANNELS.SKILL_GET_DETAIL, { skillName: string }): Promise<SkillDetail>
ipcMain.handle(IPC_CHANNELS.SKILL_GET_DETAIL, async (_event, args: { skillName: string }) => ...)
```

### エラーケースと再試行

- ケース1: 旧チャネル名をRendererが送信
  - 方針: 互換期間は旧名を受理し警告ログを出す
- ケース2: Main/Preloadで新旧名が不一致
  - 方針: `IPC_CHANNELS` 定数参照へ統一し、文字列直書きを禁止

### 設定値・判定基準

| 項目         | 値                                             |
| ------------ | ---------------------------------------------- |
| 高優先度閾値 | 参照総数30以上                                 |
| 中優先度閾値 | 参照総数15以上                                 |
| 重複判定     | `uniq -d` 0件                                  |
| 命名判定     | `skill:{動詞}` / `...FromSource` / `...Source` |
