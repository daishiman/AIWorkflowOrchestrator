# Phase 5: 実装結果 (TDD Green)

## メタ情報

| 項目         | 値                             |
| ------------ | ------------------------------ |
| Phase        | 5（実装）                      |
| 機能名       | ipc-response-unwrap            |
| タスクID     | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| GitHub Issue | #816                           |
| 作成日       | 2026-02-14                     |
| 種別         | バグ修正 (fix)                 |

## 実装サマリ

- **対象ファイル**: `apps/desktop/src/preload/skill-api.ts`
- **実装方針**: B案（safeInvokeUnwrap 関数追加） -- Phase 2 設計ドキュメント、Phase 3 設計レビューで PASS 判定済み
- **変更ファイル数**: 3ファイル（実装1 + テスト修正2）

## 変更内容

### 1. IpcResult\<T\> 型定義追加（行 136-140）

Main Process IPC ハンドラの `{ success: boolean, data?: T, error?: string }` レスポンスラッパーを型で表現する。ファイルスコープ（エクスポートしない）で定義し、Preload 層の内部実装詳細として Renderer 層に公開しない。

```typescript
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 2. safeInvokeUnwrap\<T\> 関数追加（行 164-173）

- `safeInvoke<IpcResult<T>>` を呼び出し、ホワイトリスト検証を既存の `safeInvoke` に委譲
- `result.success` が `false` の場合、`result.error` メッセージ付きの `Error` をスロー
- `result.error` が未定義の場合、デフォルトメッセージ `IPC call failed: ${channel}` でスロー
- `result.data` を `T` として返却（ラッパー展開）

```typescript
async function safeInvokeUnwrap<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
  const result = await safeInvoke<IpcResult<T>>(channel, ...args);
  if (!result.success) {
    throw new Error(result.error || `IPC call failed: ${channel}`);
  }
  return result.data as T;
}
```

### 3. 3メソッドを safeInvokeUnwrap に変更

| メソッド        | 変更前                           | 変更後                                 | 対象行  |
| --------------- | -------------------------------- | -------------------------------------- | ------- |
| `list()`        | `safeInvoke(SKILL_LIST)`         | `safeInvokeUnwrap(SKILL_LIST)`         | 228-229 |
| `getImported()` | `safeInvoke(SKILL_GET_IMPORTED)` | `safeInvokeUnwrap(SKILL_GET_IMPORTED)` | 231-232 |
| `rescan()`      | `safeInvoke(SKILL_SCAN)`         | `safeInvokeUnwrap(SKILL_SCAN)`         | 234-235 |

### 4. import() は safeInvoke のまま維持

`skillHandlers.ts` の `SKILL_IMPORT` ハンドラは `skillService.importSkills(args.skillIds)` の戻り値を直接返す（`{ success, data }` ラッパーで包まない）。そのため `import` メソッドは `safeInvoke` をそのまま使用する。

```typescript
// safeInvoke 維持（ハンドラがラッパーなしで返すため）
import: (skillName: string): Promise<ImportedSkill> =>
  safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName),
```

これは Phase 2 設計ドキュメントの「3. SKILL_IMPORT の特殊ケース - パターン B」に対応する。

### 5. 既存テスト修正

`list()`, `getImported()`, `rescan()` が `safeInvokeUnwrap` を使用するようになったため、モックの戻り値を `{ success: true, data: ... }` 形式に更新した。

#### skill-api.test.ts（11箇所修正）

| 修正箇所 | テスト名                               | 変更内容                                                                                              |
| -------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1        | list() - safeInvoke呼び出し            | `mockResolvedValue(mockMetadata)` -> `mockResolvedValue({ success: true, data: mockMetadata })`       |
| 2        | list() - SkillMetadata[]型返却         | 同上                                                                                                  |
| 3        | getImported() - safeInvoke呼び出し     | `mockResolvedValue(mockImported)` -> `mockResolvedValue({ success: true, data: mockImported })`       |
| 4        | getImported() - ImportedSkill[]型返却  | 同上                                                                                                  |
| 5        | rescan() - safeInvoke呼び出し          | `mockResolvedValue(mockMetadata)` -> `mockResolvedValue({ success: true, data: mockMetadata })`       |
| 6        | rescan() - SkillMetadata[]型返却       | 同上                                                                                                  |
| 7        | 呼び出し元移行テスト - list()          | 同上                                                                                                  |
| 8        | 統合テスト - import/remove後の一覧更新 | `mockResolvedValueOnce(updatedList)` -> `mockResolvedValueOnce({ success: true, data: updatedList })` |
| 9        | IPCチャンネル統合 - list()             | `mockResolvedValueOnce([])` -> `mockResolvedValueOnce({ success: true, data: [] })`                   |
| 10       | IPCチャンネル統合 - getImported()      | 同上                                                                                                  |
| 11       | IPCチャンネル統合 - rescan()           | 同上                                                                                                  |

#### skill-api.unification.test.ts（8箇所修正）

| 修正箇所 | テスト名                              | 変更内容                                                                                            |
| -------- | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1        | Type Safety - list()                  | `mockResolvedValueOnce(mockResult)` -> `mockResolvedValueOnce({ success: true, data: mockResult })` |
| 2        | Type Safety - getImported()           | 同上                                                                                                |
| 3        | Type Safety - rescan()                | 同上                                                                                                |
| 4        | Integration - list初回取得            | 同上                                                                                                |
| 5        | Integration - rescan結果              | 同上                                                                                                |
| 6        | Integration - list再取得              | 同上                                                                                                |
| 7        | Integration - importフロー初回list    | 同上                                                                                                |
| 8        | Integration - importフローgetImported | 同上                                                                                                |

**注意**: `import()` のモック値は `{ success, data }` 形式に変更していない。`import()` は `safeInvoke` を使用しており、ハンドラが直接 `ImportedSkill` を返すため。

## テスト結果

全 163 テスト PASS（4ファイル）。

| テストファイル                  | テスト数 | 結果         |
| ------------------------------- | -------- | ------------ |
| `skill-api.unwrap.test.ts`      | 25       | PASS         |
| `skill-api.test.ts`             | 83       | PASS         |
| `skill-api.unification.test.ts` | 25       | PASS         |
| `skill-api.permission.test.ts`  | 30       | PASS         |
| **合計**                        | **163**  | **ALL PASS** |

実行時間: 1.46s

```
Test Files  4 passed (4)
      Tests  163 passed (163)
   Start at  12:53:45
   Duration  1.46s (transform 270ms, setup 675ms, collect 282ms, tests 42ms, environment 1.85s, prepare 632ms)
```

## 受入基準との対応

| 基準ID | 受入基準                                             | 実装での対応                                                   | 状態 |
| ------ | ---------------------------------------------------- | -------------------------------------------------------------- | ---- |
| AC-1   | `getImported()` が `ImportedSkill[]` を直接返す      | `safeInvokeUnwrap<ImportedSkill[]>(SKILL_GET_IMPORTED)` で展開 | 達成 |
| AC-2   | `list()` が `SkillMetadata[]` を直接返す             | `safeInvokeUnwrap<SkillMetadata[]>(SKILL_LIST)` で展開         | 達成 |
| AC-3   | `import()` が `ImportedSkill` を直接返す             | ハンドラがラッパーなしで返すため `safeInvoke` を維持           | 達成 |
| AC-4   | `rescan()` が `SkillMetadata[]` を直接返す           | `safeInvokeUnwrap<SkillMetadata[]>(SKILL_SCAN)` で展開         | 達成 |
| AC-5   | AgentView で `importedSkills.forEach` が正常動作する | Preload 層で配列を直接返すため `forEach` が成功する            | 達成 |
| AC-6   | 型注釈と実行時の値が一致する                         | `IpcResult<T>` + `safeInvokeUnwrap` で型推論が正しく機能       | 達成 |
| AC-7   | 既存テストが全て PASS する                           | 163テスト全て PASS                                             | 達成 |

## 完了条件チェックリスト

- [x] `IpcResult<T>` 型がファイルスコープで定義されている
- [x] `safeInvokeUnwrap` 関数が実装されている
- [x] `safeInvokeUnwrap` が内部で `safeInvoke` を呼び出し、ホワイトリスト検証を維持している
- [x] `list()`, `getImported()`, `rescan()` が `safeInvokeUnwrap` を使用している
- [x] `import()` は `safeInvoke` のまま維持されている
- [x] `safeInvokeUnwrap` のエラーハンドリングが設計通り実装されている（`result.error` 優先、フォールバックメッセージ付き）
- [x] 既存テストのモック値が `{ success: true, data: ... }` 形式に更新されている
- [x] 全 163 テストが GREEN

## 次Phase

Phase 6（テスト拡充）へ進む。
