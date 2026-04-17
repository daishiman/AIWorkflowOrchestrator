# 実装ガイド — skill-create-flow-gaps キャンセル・AbortSignal IPC 4層接続

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| 対象タスク | TASK-SW-CANCEL-001〜004, TASK-SC-STREAM-001, TASK-SC-STRUCT-001 |
| 機能名     | skill-creator キャンセル機能 IPC 4層接続 + AbortSignal 完全伝播 |
| 作成日     | 2026-04-16                                                      |
| ステータス | completed                                                       |

---

## Part 1: 中学生レベルの概念説明

### スキル生成のキャンセルって何？

AIWorkflowOrchestrator では「スキル」と呼ばれる機能を AI が自動で作成します。
この作成処理（スキル生成）は時間がかかるため、途中でキャンセルできる機能が必要でした。

### 以前の問題

「キャンセルボタン」を押すと、画面の表示（「キャンセル中...」など）は変わっていました。
しかし **裏側（メインプロセス）では作業が止まっていませんでした**。

これはゲームの「一時停止ボタン」を押したのに、キャラクターが動き続けているような状態です。

### 今回の修正でどう変わった？

CANCEL-001〜004 の4つのタスクで、**「連絡経路」を順番に構築**しました。

```
ボタンを押す（画面）
    ↓
useCancelGeneration (Renderer)  ← CANCEL-004 で async 化
    ↓ IPC メッセージ
skillCreatorHandlers (Main IPC)  ← CANCEL-001/002 でチャネル追加＋ハンドラ登録
    ↓
SkillCreatorService              ← CANCEL-003 で AbortController 追加
    ↓ AbortSignal
ScriptExecutor / ResourceLoader  ← STREAM-001/STRUCT-001 で Signal 受信・子プロセス終了
```

これで「キャンセルボタン」を押すと、バックグラウンドで動いている AI の処理（子プロセス）まで
本当に止まるようになりました。

### 「settled フラグ」って何？

処理が終わった後に「あれ、キャンセルされた？」と二度確認してしまうと、エラーが二重に起きてしまいます。
`settled` フラグは「もう終わったよ」という目印で、これを使って「二重キャンセル」を防いでいます。

---

## Part 2: 開発者向け技術的詳細

### 1. IPC 4層アーキテクチャ全体図

```
Layer 1: channels.ts (定数定義)
  SKILL_CREATOR_CANCEL = "skill-creator:cancel"

Layer 2: skill-creator-api.ts (Preload API)
  cancelGeneration: () => safeInvoke(channels.SKILL_CREATOR_CANCEL)

Layer 3: skillCreatorHandlers.ts (Main IPC Handler)
  ipcMain.handle(channels.SKILL_CREATOR_CANCEL, async (_event) => {
    await skillCreatorService.cancelCurrentOperation();
    return { success: true };
  });

Layer 4: SkillCreatorService.ts (Domain Service)
  private abortController: AbortController | null = null;
  async cancelCurrentOperation(): Promise<void> {
    this.abortController?.abort();
    // cleanupCancelledSkillDir() も実行
  }
```

### 2. AbortSignal 伝播チェーン

```typescript
// SkillCreatorService.ts
this.abortController = new AbortController();
const signal = this.abortController.signal;

// ScriptExecutor に Signal を渡す
await this.scriptExecutor.execute(scriptPath, args, { signal });

// ResourceLoader に Signal を渡す
await this.resourceLoader.load(resourcePath, { signal });
```

#### ScriptExecutor での Signal 処理（settled フラグパターン）

```typescript
async execute(scriptPath: string, args: string[], options?: { signal?: AbortSignal }) {
  const { signal } = options ?? {};
  let settled = false;

  return new Promise<string>((resolve, reject) => {
    const child = spawn(scriptPath, args);

    signal?.addEventListener('abort', () => {
      if (settled) return;   // 二重reject防止
      settled = true;
      child.kill('SIGTERM');
      reject(new Error('AbortError: operation cancelled'));
    });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      if (code === 0) resolve(output);
      else reject(new Error(`Exit code: ${code}`));
    });
  });
}
```

#### ResourceLoader での二段階チェック

```typescript
async load(path: string, options?: { signal?: AbortSignal }) {
  // Stage 1: 呼び出し直後にチェック（早期リターン）
  options?.signal?.throwIfAborted();

  const data = await fs.readFile(path, 'utf-8');

  // Stage 2: 非同期処理完了後にもチェック
  options?.signal?.throwIfAborted();

  return data;
}
```

### 3. キャンセル後クリーンアップ（cleanupCancelledSkillDir）

キャンセル時、半作成状態のスキルディレクトリが残ることがある。
`SkillCreatorService.cancelCurrentOperation()` 内で `cleanupCancelledSkillDir()` を呼び出し、
不完全なディレクトリを削除する。

```typescript
private async cleanupCancelledSkillDir(skillPath: string): Promise<void> {
  try {
    await fs.rm(skillPath, { recursive: true, force: true });
  } catch (err) {
    // クリーンアップ失敗は無視（キャンセル自体は成功）
    this.logger.warn('cleanupCancelledSkillDir failed', err);
  }
}
```

### 4. useCancelGeneration の async 化（CANCEL-004）

```typescript
// 変更前: fire-and-forget
const cancelGeneration = () => {
  window.skillCreatorApi.cancelGeneration();
};

// 変更後: async/await で IPC 完了を待機
const cancelGeneration = async () => {
  await window.skillCreatorApi.cancelGeneration();
};
```

この変更により、UI 側でキャンセル完了を await できるようになった。

### 5. STREAM-001: generateSkillMd 戻り値の接続

`runCreateWorkflow()` の戻り値（`WorkflowResult`）を `generateSkillMd()` に接続。
`SkillCreatorService` の内部で、ワークフロー結果に基づいて次のフェーズの入力を構築する。

### 6. 変更ファイル一覧

| レイヤー | ファイル                                                           | 変更概要                                                              |
| -------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Layer 1  | `apps/desktop/src/preload/channels.ts`                             | `SKILL_CREATOR_CANCEL` 定数追加                                       |
| Layer 2  | `apps/desktop/src/preload/skill-creator-api.ts`                    | `cancelGeneration()` API 追加                                         |
| Layer 3  | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                | cancel ハンドラ登録                                                   |
| Layer 3  | `apps/desktop/src/main/ipc/index.ts`                               | skillCreatorHandlers インポート追加                                   |
| Layer 4  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`      | AbortController, cancelCurrentOperation(), cleanupCancelledSkillDir() |
| Layer 4  | `apps/desktop/src/main/services/skill/ScriptExecutor.ts`           | AbortSignal listener, settled flag                                    |
| Layer 4  | `apps/desktop/src/main/services/skill/ResourceLoader.ts`           | AbortSignal 二段階チェック                                            |
| Layer 4  | `apps/desktop/src/main/services/skill/SkillService.ts`             | Signal 伝播対応                                                       |
| Renderer | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`           | async/await 化                                                        |
| UI       | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | cancelGeneration 呼び出し更新                                         |

### 7. テスト一覧

| ファイル                                                | 追加テスト内容                                    |
| ------------------------------------------------------- | ------------------------------------------------- |
| `__tests__/SkillCreatorService.test.ts`                 | cancelCurrentOperation, AbortSignal 伝播, cleanup |
| `__tests__/ScriptExecutor.test.ts`                      | AbortSignal で子プロセスが kill されること        |
| `__tests__/SkillService.test.ts`                        | Signal 伝播の統合テスト                           |
| `ipc/__tests__/skillCreatorHandlers.validation.test.ts` | cancel ハンドラの IPC 応答テスト                  |
| `hooks/__tests__/useCancelGeneration.test.ts`           | async cancelGeneration の Promise 解決テスト      |

### 8. 既知の未タスク（next steps）

| タスクID                             | 内容                                       | 優先度 |
| ------------------------------------ | ------------------------------------------ | ------ |
| TASK-SW-ABORTSIGNAL-FULL-PROPAGATION | AbortSignal を createSkill() 全体に接続    | 中     |
| TASK-SW-CANCEL-SKILL-CLEANUP         | キャンセル後クリーンアップのより詳細な実装 | 低     |
| TASK-SW-LLM-PURPOSE-AUTO-EXTRACT     | LLM purpose の自動抽出機能                 | 低     |

---

## Part 3: 実装時の学び（lessons learned）

1. **AbortSignal は「渡すだけ」では不十分** — `ScriptExecutor` では `addEventListener` による能動的なリスナー登録、`ResourceLoader` では `throwIfAborted()` による受動的チェックの両方が必要
2. **settled フラグは必須** — `AbortSignal` の `abort` イベントと `child.on('close')` が競合するため、両方から `reject` が呼ばれうる。フラグなしでは `UnhandledPromiseRejection` が発生する
3. **IPC は 4 層で設計する** — 定数定義 → Preload API → Main Handler → Domain Service の4層に分離することで、テストと型安全性が大幅に改善する
4. **async 化は UI の responsiveness に直結** — `cancelGeneration` を async にすることで、UI 側でスピナーを表示しながらキャンセル完了を待てるようになる

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
