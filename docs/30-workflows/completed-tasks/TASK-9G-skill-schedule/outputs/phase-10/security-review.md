# Phase 10 セキュリティレビュー

## メタ情報

| 項目          | 内容                                     |
| ------------- | ---------------------------------------- |
| レビュー日    | 2026-02-27                               |
| 対象タスク    | TASK-9G                                  |
| レビューPhase | 10（再実行）                             |
| レビュー担当  | Claude Code（自動レビュー + テスト実行） |

---

## セキュリティレビューマトリクス

| チャンネル              | validateIpcSender | sanitizeError | getAllowedWindows | IPC_CHANNELS定数 | 3段バリデーション |
| ----------------------- | :---------------: | :-----------: | :---------------: | :--------------: | :---------------: |
| `skill:schedule:list`   |        OK         |  部分的 (※1)  |        OK         |        OK        |  N/A（引数なし）  |
| `skill:schedule:add`    |        OK         |  部分的 (※1)  |        OK         |        OK        |        OK         |
| `skill:schedule:update` |        OK         |  部分的 (※1)  |        OK         |        OK        |        OK         |
| `skill:schedule:delete` |        OK         |  部分的 (※1)  |        OK         |        OK        |        OK         |
| `skill:schedule:toggle` |        OK         |  部分的 (※1)  |        OK         |        OK        |        OK         |

### (※1) sanitizeError の評価詳細

スケジュールハンドラーのエラー処理パターン:

```typescript
catch (error) {
  return {
    success: false,
    error: error instanceof Error ? error.message : "Internal error",
  };
}
```

- `error.message` をそのまま返している。`skillCreatorHandlers.ts` では `sanitizeErrorMessage()` 関数でスタックトレース・ファイルパス・機密データを正規表現で除去しているが、スケジュールハンドラーではこの処理がない
- ただし、スケジュール機能のエラーソースは `ScheduleStore`（`Schedule not found: ${id}`）と `node-cron`（`Invalid cron expression`）のみであり、内部パス漏洩リスクは限定的
- **判定: MINOR** - 機能上の深刻なリスクではないが、プロジェクト全体のセキュリティ基準（`sanitizeErrorMessage` 統一）との一貫性が欠如

### validateIpcSender の使い分け差異

既存スキルハンドラー（list/import/remove等）:

```typescript
if (!validation.valid) {
  throw toIPCValidationError(validation); // throw
}
```

スケジュールハンドラー（list/add/update/delete/toggle）:

```typescript
if (!validation.valid) {
  return toIPCValidationError(validation); // return
}
```

- スケジュールハンドラーは `return` で返しているが、既存ハンドラーは `throw` している
- 機能的には同等（invoke側でcatchされる）だが、パターンが不統一
- **判定: MINOR** - 動作に影響なし。コードスタイルの統一性の問題

---

## スケジュール機能固有のセキュリティ検証

| 攻撃ベクトル                   | 対策確認内容                                                          | 結果 |
| ------------------------------ | --------------------------------------------------------------------- | :--: |
| 不正cron式によるリソース枯渇   | `cron.validate()` で事前検証し、不正な式を拒否する                    |  OK  |
| インターバル値ゼロ/負値        | IPCハンドラーで `interval <= 0` チェック実装済み                      |  OK  |
| 過去日時のワンショット登録     | `activateSchedule()` で `delay <= 0` の場合は実行しない               |  OK  |
| 大量スケジュール登録によるDoS  | 最大登録数の上限チェックが**未実装**                                  | 指摘 |
| タイマーリソースリーク         | `deactivateSchedule()` で確実に停止。`destroy()` メソッドは**未実装** | 指摘 |
| 同一スケジュールの重複起動     | `activateSchedule()` 冒頭で `deactivateSchedule(id)` を呼び出し       |  OK  |
| アプリ異常終了時のタイマー残存 | `destroy()` メソッドが**未実装**のため全タイマー停止手段がない        | 指摘 |

### 指摘事項

#### MINOR-SEC-01: destroy() メソッドの未実装

- **重要度**: MINOR
- **内容**: `SkillScheduler` に全アクティブジョブを一括停止する `destroy()` メソッドが存在しない。アプリ終了時に `activeJobs` Map 内の全タイマー/cron ジョブを停止する手段がない
- **影響**: Electron の `will-quit` イベントで呼び出すクリーンアップ処理が不可能。ただし、プロセス終了時にタイマーは自動破棄されるため、実害は限定的
- **推奨対応**: `destroy()` メソッドを追加し、`activeJobs` 全エントリを `deactivateSchedule()` で停止する

#### MINOR-SEC-02: 大量スケジュール登録の上限チェック未実装

- **重要度**: MINOR
- **内容**: スケジュールの最大登録数に制限がない。悪意のあるRenderer側コードが大量の `skill:schedule:add` を呼び出した場合、メモリとタイマーリソースが消費される
- **影響**: Electron のセキュリティモデルでは Renderer はサンドボックス化されており、直接の攻撃リスクは低い。ただし、UI のバグによる意図しない大量登録は防止すべき
- **推奨対応**: `addSchedule()` で `scheduleStore.getAll().length >= MAX_SCHEDULES` をチェック（推奨上限: 100件）

#### MINOR-SEC-03: sanitizeErrorMessage の未適用

- **重要度**: MINOR
- **内容**: `skillCreatorHandlers.ts` では `sanitizeErrorMessage()` でスタックトレース・ファイルパスを除去しているが、スケジュールハンドラーでは `error.message` をそのまま返している
- **影響**: 現状のエラーソース（ScheduleStore, node-cron）では内部パス漏洩リスクは低いが、将来のスキル実行連携時にリスクが顕在化する可能性がある
- **推奨対応**: `sanitizeErrorMessage` を共通ユーティリティとして抽出し、全ハンドラーで使用する

---

## P42 準拠 3段バリデーション確認

### 共通関数 validateStringArg の実装確認

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

| バリデーション段階  | チェック内容                | 実装確認 |
| ------------------- | --------------------------- | :------: |
| 1. 型チェック       | `typeof value !== "string"` |    OK    |
| 2. 空文字列チェック | 暗黙的に含まれる            |    OK    |
| 3. trim チェック    | `value.trim() === ""`       |    OK    |

### 適用箇所

| ハンドラ              | 引数      | validateStringArg 適用 |
| --------------------- | --------- | :--------------------: |
| skill:schedule:add    | skillName |           OK           |
| skill:schedule:add    | prompt    |           OK           |
| skill:schedule:update | id        |           OK           |
| skill:schedule:delete | id        |           OK           |
| skill:schedule:toggle | id        |           OK           |

---

## ScheduleStore のデータバリデーション（P19 対策）

```typescript
const raw: unknown = this.store.get("scheduledSkills");
this.schedules = Array.isArray(raw)
  ? raw.filter(
      (item): item is ScheduledSkill =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).id === "string",
    )
  : [];
```

- `unknown` 型での受け取り: OK
- `Array.isArray()` チェック: OK
- 要素フィルタリング（`id` フィールド検証）: OK
- テスト検証: D-15（不正データフォールバック）、DB-05（要素レベルフィルタ）で確認済み

---

## 判定

**指摘あり（MINOR x 3）**

- 全5チャンネルで `validateIpcSender` + `getAllowedWindows` + `IPC_CHANNELS` 定数使用が確認済み
- P42準拠3段バリデーションが必要な全フィールド（skillName, prompt, id）に適用済み
- cron式バリデーション（`cron.validate()`）が実装済み
- 3件の MINOR 指摘はいずれもセキュリティ機能に直接的な影響を与えないが、プロジェクト品質基準との一貫性確保のために未タスク化が必要
