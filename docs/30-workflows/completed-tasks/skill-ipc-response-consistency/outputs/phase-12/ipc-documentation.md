# Phase 12: IPC ドキュメント

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 |
| Phase      | 12                                        |
| ステータス | 完了                                      |
| 実行日     | 2026-02-27                                |

---

## skill: IPC チャンネル一覧

### 全14チャンネルの契約定義

| #   | チャンネル                | Profile | 引数                                              | 戻り値                                      | バリデーション       |
| --- | ------------------------- | ------- | ------------------------------------------------- | ------------------------------------------- | -------------------- |
| 1   | `skill:list`              | A       | なし                                              | `{ success, data: ScannedSkill[] }`         | 引数なし             |
| 2   | `skill:scan`              | A       | なし                                              | `{ success, data: ScannedSkill[] }`         | 引数なし             |
| 3   | `skill:getImported`       | A       | なし                                              | `{ success, data: ImportedSkill[] }`        | 引数なし             |
| 4   | `skill:import`            | B       | `skillName: string`                               | `ImportedSkill`                             | P42 3段              |
| 5   | `skill:remove`            | B       | `skillName: string`                               | `RemoveResult`                              | P42 3段              |
| 6   | `skill:get-detail`        | A       | `{ skillId: string }`                             | `{ success, data: SkillDetail }`            | P42 3段              |
| 7   | `skill:execute`           | A       | `SkillExecutionRequest` or `{ skillId, params? }` | `{ success, data: SkillExecutionResponse }` | P42 3段              |
| 8   | `skill:abort`             | C       | `executionId: string`                             | `boolean`                                   | P42 3段              |
| 9   | `skill:get-status`        | C       | `executionId: string`                             | `ExecutionStatus \| null`                   | P42 3段              |
| 10  | `skill:analyze`           | A       | `{ skillName: string }`                           | `{ success, data: SkillAnalysis }`          | P42 3段              |
| 11  | `skill:improve`           | A       | `{ skillName, analysis, options? }`               | `{ success, data: ImprovementResult }`      | P42 3段              |
| 12  | `skill:optimize`          | A       | `{ prompt: string }`                              | `{ success, data: OptimizationResult }`     | P42 3段（throw統一） |
| 13  | `skill:optimize:variants` | A       | `{ prompt: string, count?: number }`              | `{ success, data: string[] }`               | P42 3段（throw統一） |
| 14  | `skill:optimize:evaluate` | A       | `{ prompt: string }`                              | `{ success, data: PromptEvaluation }`       | P42 3段（throw統一） |

---

## Profile定義

### Profile A: ラッパー返却

```typescript
// 正常時
{ success: true, data: T }

// エラー時
{ success: false, error: string }
```

- Preload側: `safeInvokeUnwrap()` を使用。
- `success: false` は `safeInvokeUnwrap` で `Error` に変換。

### Profile B: 直接返却

```typescript
ImportedSkill | RemoveResult;
```

- Preload側: `safeInvoke()` を使用。
- バリデーション失敗時は `throw { code, message }`。

### Profile C: プリミティブ返却

```typescript
boolean | ExecutionStatus | null;
```

- Preload側: `safeInvoke()` を使用。

---

## セキュリティ仕様

### 1. validateIpcSender

- 全14ハンドラの先頭で `validateIpcSender` を実行。
- 不正senderは `toIPCValidationError` で例外化。

### 2. P42 3段バリデーション

文字列引数を持つチャネルは以下を適用。

```typescript
if (typeof value !== "string" || value.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "<field> must be a non-empty string",
  };
}
```

### 3. エラーサニタイズ

`skillHandlers.ts` の `sanitizeErrorMessage()` を Profile A の catch ブロックで使用。

- 置換対象: stack trace, Unix/Windows path, IP:port, 機密値（token/key/password/secret）
- JS runtime型の内部実装エラー（`Cannot read properties...`）はデフォルト文言へ統一
- デフォルト文言: `スキル処理でエラーが発生しました`

---

## 変更影響マトリクス

| 変更内容                                         | 影響範囲                         | リスク |
| ------------------------------------------------ | -------------------------------- | ------ |
| `sanitizeErrorMessage` 導入                      | Profile A チャンネルのエラー返却 | 低     |
| optimize系3チャンネルの `return` -> `throw` 統一 | バリデーションエラー処理         | 低     |
| 契約テスト追加（Main/Preload）                   | 回帰防止                         | 低     |
