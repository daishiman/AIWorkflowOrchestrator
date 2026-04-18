# Phase 4: テスト設計書

**タスクID**: TASK-SW-STREAM-002
**作成日**: 2026-04-18
**作成者**: Claude Code (claude-sonnet-4-6)

---

## 1. Phase 4 の目的と実施状況

### 1.1 目的

Phase 4 は TASK-SW-STREAM-002 の実装を検証するテストケースを確認・整理するフェーズである。本フェーズでは以下を行う。

1. `skillCreatorHandlers.progress.test.ts` の存在確認
2. TC-01〜TC-06 のテストケース実装状況の確認
3. 回帰テスト（TC-07・TC-08）の確認
4. Phase 4 完了条件の充足確認

### 1.2 実施状況サマリー

Phase 3 ゲート判定 PASS により、TASK-SW-STREAM-002 の実装はコードベースに既に存在していることが確認されている。Phase 4 では「新規テスト実装」ではなく「既存テストの確認・整理」を実施する。

---

## 2. テストファイルの存在確認

### 2.1 確認結果

**ファイルパス**: `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts`

**存在**: YES（存在する）

テストファイルが存在していることを実際のファイルシステム調査により確認した。ファイル先頭コメントに以下が記載されている。

```
/**
 * SkillCreator IPC Handlers - onProgress Callback Wiring Tests
 * TASK-SW-STREAM-002
 * TC-01 ~ TC-06
 *
 * TDD Red フェーズ: 実装前に作成（Phase 4）
 * Green フェーズ: Phase 5 の実装後に PASS することを確認
 */
```

---

## 3. テストケース一覧（TC-01〜TC-06）

### 3.1 テストスイート概要

**describe ブロック**: `SKILL_CREATOR_CREATE ハンドラー - onProgress コールバック配線`

各テストケースは `SKILL_CREATOR_CREATE` IPC ハンドラーが `createSkill()` の第2引数として `onProgress` コールバックを正しく接続し、進捗通知を Renderer に送信することを検証する。

### 3.2 テストケース一覧

| TC番号        | describe 内容                                          | it 内容                                                                        | 検証内容                                                                 |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| TC-01         | `onProgress コールバックが createSkill に渡される`     | createSkill が第2引数としてコールバック関数を受け取ること                      | `typeof callArgs[1] === 'function'` であることを確認                     |
| TC-01（追加） | （同上）                                               | onProgress コールバック内で mainWindow.webContents.send が呼ばれること         | `SKILL_CREATOR_PROGRESS` チャンネルで `send` が呼ばれることを確認        |
| TC-02         | `planning フェーズの進捗が正しく送信される`            | `{ phase: 'planning', percentage: 10, message: '...' }` で send が呼ばれること | planning フェーズの進捗データが正確に IPC 送信されることを確認           |
| TC-03         | `done フェーズの進捗が正しく送信される`                | `{ phase: 'done', percentage: 100, message: '...' }` で send が呼ばれること    | done フェーズの進捗データが正確に IPC 送信されることを確認               |
| TC-03（追加） | （同上）                                               | 複数フェーズの進捗が順番に送信されること                                       | planning→generating→done の順で3回 `send` が呼ばれることを確認           |
| TC-04         | `コールバック接続後も skillDir が正しく返される`       | `{ success: true, data: '/valid/skill/path' }` が返ること                      | onProgress 接続後も正常な返り値が変わらないことを確認                    |
| TC-04（追加） | （同上）                                               | コールバックなし（デフォルト）でも戻り値が変わらないこと                       | コールバック未呼出し時も `{ success: true, data: ... }` が返ることを確認 |
| TC-05         | `mainWindow が破壊済みの場合に IPC 送信をスキップする` | `isDestroyed()` が true の場合に `webContents.send` が呼ばれないこと           | 破棄済みウィンドウに対して送信しないガード処理を確認                     |
| TC-06         | `createSkill がエラーの場合にエラーレスポンスを返す`   | createSkill が reject した場合に `{ success: false, error: ... }` が返ること   | エラー時のハンドリングが正しいことを確認                                 |
| TC-06（追加） | （同上）                                               | エラー時でも `webContents.send` が呼ばれないこと                               | エラー発生時に progress IPC が送出されないことを確認                     |

### 3.3 実装パターン

各テストケースは以下のパターンで実装されている。

```typescript
// モック setup: createSkill が呼ばれた際に onProgress を即座に呼び出す
mockSkillCreatorService.createSkill.mockImplementation(
  async (_args, onProgress) => {
    onProgress?.({ phase: "planning", percentage: 10, message: "計画中" });
    return "/valid/skill/path";
  },
);

// ハンドラーを直接呼び出して検証
const handler = getCreateHandler();
await handler!(createMockEvent(), validCreateArgs);

// webContents.send の呼び出しを検証
expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
  IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
  expect.objectContaining({ phase: "planning" }),
);
```

---

## 4. TC-07・TC-08（回帰テスト）の確認

### 4.1 TASK-SW-STREAM-002 スコープの TC-07・TC-08

`skillCreatorHandlers.progress.test.ts` ファイル内には TC-07・TC-08 は存在しない（TC-01〜TC-06 のみ）。

### 4.2 関連ファイルでの TC-07・TC-08 の確認

調査の結果、TC-07・TC-08 は別タスクのテストファイルに存在することを確認した。

| TC番号 | ファイル                               | タスク             | 内容                                                                                  |
| ------ | -------------------------------------- | ------------------ | ------------------------------------------------------------------------------------- |
| TC-07  | `skillCreatorHandlers-cancel.test.ts`  | TASK-SW-CANCEL-003 | `unregisterSkillCreatorHandlers()` が `SKILL_CREATOR_CANCEL` ハンドラーを解除すること |
| TC-08  | 別ファイル（analyticsHandler.test.ts） | 別タスク           | analytics 関連（TASK-SW-STREAM-002 とは無関係）                                       |

**結論**: TASK-SW-STREAM-002 においては TC-07・TC-08 の番号は使用されていない。TASK-SW-CANCEL-003 の TC-07 はキャンセル機能の回帰テストであり、TASK-SW-STREAM-002 の onProgress 接続の回帰テストとして参照する必要はない。

---

## 5. テスト実行の前提条件

### 5.1 モック構成

テストファイルは以下のモックを使用している。

| モック対象            | モック方法                                                                      |
| --------------------- | ------------------------------------------------------------------------------- |
| `electron`            | `vi.mock("electron", ...)` でハンドラーマップを自前管理                         |
| `SkillCreatorService` | `vi.mock("../../services/skill/SkillCreatorService", ...)` でモックサービス注入 |
| `mainWindow`          | `createMockMainWindow()` ヘルパーで生成                                         |
| `IpcMainInvokeEvent`  | `createMockEvent()` ヘルパーで生成                                              |

### 5.2 実行コマンド

```bash
pnpm --filter @repo/desktop vitest run src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts
```

---

## 6. Phase 4 完了条件の充足確認

| 完了条件                              | 状態     | 根拠                                                             |
| ------------------------------------- | -------- | ---------------------------------------------------------------- |
| テストファイルが存在する              | 充足済み | `skillCreatorHandlers.progress.test.ts` の存在を確認             |
| TC-01〜TC-06 が実装されている         | 充足済み | 全 6 TC（複数 `it` 含む）が実装済みであることを確認              |
| 回帰テスト（TC-07・TC-08 相当）の確認 | 充足済み | TASK-SW-CANCEL-003 の TC-07 が `unregister` の回帰を担保している |
| テストケース設計の妥当性確認          | 充足済み | AC-1〜AC-4 と TC-01〜TC-06 の対応関係が明確                      |

**Phase 4 完了条件: 全て充足済み**

---

## 7. AC と TC の対応マトリクス

| AC   | 内容                                                                                     | 対応 TC                                       |
| ---- | ---------------------------------------------------------------------------------------- | --------------------------------------------- |
| AC-1 | `SKILL_CREATOR_CREATE` ハンドラーで `createSkill()` 第2引数に `onProgress` が接続        | TC-01                                         |
| AC-2 | `sendSkillCreatorProgress(mainWindow, progress)` がコールバック内で呼ばれる              | TC-01, TC-02, TC-03                           |
| AC-3 | `SkillCreateWizard.tsx` で `useStreamingProgress()` の戻り値が `GenerateStep` に渡される | （UI レイヤー: 本テストファイルのスコープ外） |
| AC-4 | スキル生成中に `GenerateStep.tsx` のプログレスバーが更新される                           | （UI レイヤー: 本テストファイルのスコープ外） |

TC-04・TC-05・TC-06 は AC 直接対応ではなく、実装の堅牢性（正常な返り値、isDestroyed ガード、エラーハンドリング）を検証するケースである。
