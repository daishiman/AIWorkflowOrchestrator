# Phase 9 セキュリティ検証レポート

## 実行日時

2026-02-27（Phase 8-9 統合検証時に実行）

## 検証対象

| ファイル                                                 | 検証範囲                                                       |
| -------------------------------------------------------- | -------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`             | L544-784（registerSkillScheduleHandlers 及び補助関数）         |
| `apps/desktop/src/preload/skill-api.ts`                  | L390-416（Skill Schedule Operations）                          |
| `apps/desktop/src/preload/channels.ts`                   | L306-311（SKILL*SCHEDULE*\* 定義）、L539-544（ホワイトリスト） |
| `apps/desktop/src/main/services/skill/SkillScheduler.ts` | 全域（node-cron セキュリティ）                                 |

## セキュリティチェックマトリクス

| チャンネル              | validateIpcSender | 3段バリデーション | エラーサニタイズ | IPC_CHANNELS定数 |
| ----------------------- | ----------------- | ----------------- | ---------------- | ---------------- |
| `skill:schedule:list`   | PASS              | N/A（引数なし）   | PASS             | PASS             |
| `skill:schedule:add`    | PASS              | PASS              | PASS             | PASS             |
| `skill:schedule:update` | PASS              | PASS              | PASS             | PASS             |
| `skill:schedule:delete` | PASS              | PASS              | PASS             | PASS             |
| `skill:schedule:toggle` | PASS              | PASS              | PASS             | PASS             |

## P42準拠3段バリデーション詳細

全文字列引数に対して `validateStringArg()` 共通関数で3段バリデーションを実施:

| ハンドラー | バリデーション対象 | 型チェック | 空文字列チェック | trim空文字列チェック |
| ---------- | ------------------ | ---------- | ---------------- | -------------------- |
| add        | skillName          | PASS       | PASS             | PASS                 |
| add        | prompt             | PASS       | PASS             | PASS                 |
| add        | schedule.type      | PASS       | PASS             | -                    |
| add        | cronExpression     | PASS       | PASS             | PASS                 |
| add        | interval           | PASS（>0） | -                | -                    |
| update     | id                 | PASS       | PASS             | PASS                 |
| delete     | id                 | PASS       | PASS             | PASS                 |
| toggle     | id                 | PASS       | PASS             | PASS                 |

`validateStringArg` 関数の実装:

```typescript
function validateStringArg(
  value: unknown,
  argName: string,
): { success: false; error: string } | null {
  if (typeof value !== "string" || value.trim() === "") {
    return {
      success: false,
      error: `${argName} must be a non-empty string`,
    };
  }
  return null;
}
```

## ハードコード文字列検出（P27対策）

Preload側の全5メソッドで `IPC_CHANNELS.SKILL_SCHEDULE_*` 定数を使用していることを確認:

```typescript
// skill-api.ts L392-416
scheduleList: () => safeInvokeUnwrap<...>(IPC_CHANNELS.SKILL_SCHEDULE_LIST),
scheduleAdd: (...) => safeInvokeUnwrap<...>(IPC_CHANNELS.SKILL_SCHEDULE_ADD, input),
scheduleUpdate: (...) => safeInvokeUnwrap<...>(IPC_CHANNELS.SKILL_SCHEDULE_UPDATE, { id, updates }),
scheduleDelete: (...) => safeInvokeUnwrap<...>(IPC_CHANNELS.SKILL_SCHEDULE_DELETE, { id }),
scheduleToggle: (...) => safeInvokeUnwrap<...>(IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE, { id }),
```

ハードコード文字列は検出されなかった。

## エラーサニタイズ確認

全5ハンドラーの catch ブロックで `toIpcErrorResponse()` を使用:

```typescript
function toIpcErrorResponse(error: unknown): {
  success: false;
  error: string;
} {
  return {
    success: false,
    error: error instanceof Error ? error.message : "Internal error",
  };
}
```

- `error.message` のみを返し、スタックトレースやファイルパスは送信しない
- Error 以外の例外は `"Internal error"` に置換して内部情報を遮断

## node-cron セキュリティ確認

| チェック項目               | 確認内容                                                                                                       | 結果 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- | ---- |
| cron式インジェクション防止 | `cron.validate()` で検証後のみ `cron.schedule()` を実行（SkillScheduler.ts L94-100）                           | PASS |
| タイマーリソースリーク防止 | `deactivateSchedule()` で cron.stop() / clearInterval / clearTimeout を呼び出し（L249-266）                    | PASS |
| 同時実行制御               | `activateSchedule()` 内で先に `deactivateSchedule()` を呼び出して既存ジョブを停止（L205）                      | PASS |
| アプリ終了時クリーンアップ | `unregisterSkillScheduleHandlers()` で全ハンドラーを解除。activeJobsのクリーンアップはスケジューラ破棄時に実行 | PASS |

## ホワイトリスト登録確認

`ALLOWED_INVOKE_CHANNELS` に5チャンネルが追加されていることを確認（channels.ts L539-544）:

```typescript
// Skill schedule channels (TASK-9G)
IPC_CHANNELS.SKILL_SCHEDULE_LIST,
IPC_CHANNELS.SKILL_SCHEDULE_ADD,
IPC_CHANNELS.SKILL_SCHEDULE_UPDATE,
IPC_CHANNELS.SKILL_SCHEDULE_DELETE,
IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE,
```

`ALLOWED_ON_CHANNELS` にスケジュール関連のイベントチャンネルは追加されていないことを確認（スケジュール機能はイベント駆動のストリーミングを使用しないため、追加不要）。

## sender検証の方式差異（情報提供）

| ハンドラーカテゴリ               | sender検証失敗時の処理方式                |
| -------------------------------- | ----------------------------------------- |
| 既存ハンドラー（skill:import等） | `throw toIPCValidationError(validation)`  |
| スケジュールハンドラー           | `return toIPCValidationError(validation)` |

スケジュールハンドラーは `return` 方式を採用している。`throw` と `return` で Renderer 側の受信挙動が異なる可能性がある（throw は ipcRenderer.invoke の Promise を reject、return は resolve）。ただし、sender 検証の失敗は正常なアプリケーション使用では発生しないセキュリティ防御であるため、実用上の影響は限定的。統一化は TASK-9G のスコープ外。

## 判定

**PASS** - 全5ハンドラーでセキュリティ要件を充足
