# 契約マトリクス: skill: チャネル全14+6の戻り値/throwパターン分析

> **作成日**: 2026-02-27
> **対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`, `apps/desktop/src/main/ipc/skillFileHandlers.ts`
> **タスク**: TASK-SKILL-IPC-RESPONSE-CONSISTENCY Phase 1 Task 1-1

## 概要

skillHandlers.ts の14チャネル + skillFileHandlers.ts の6チャネル（合計20チャネル）を分析し、戻り値パターン・throwパターン・バリデーション方式・エラーハンドリング方式を棚卸しした。

## 凡例

| 記号         | 意味                                                              |
| ------------ | ----------------------------------------------------------------- |
| **W**        | ラッパー返却 `{ success: true/false, data/error }`                |
| **D**        | 直接返却（サービス戻り値をそのまま return）                       |
| **P**        | プリミティブ返却（`boolean`, `null` 等）                          |
| **T-struct** | 構造化エラー throw `{ code, message }`                            |
| **T-ipc**    | IPC バリデーション throw（`toIPCValidationError`）                |
| **3段**      | P42準拠 3段バリデーション（型チェック + 空文字列 + trim空文字列） |
| **raw**      | `error.message` 直接使用（サニタイズなし）                        |
| **safe**     | `isKnownSkillFileError` による既知/未知エラー分岐                 |

---

## A. skillHandlers.ts（14チャネル）

### A-1. skill:list (`IPC_CHANNELS.SKILL_LIST`)

| 項目                   | 内容                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| **戻り値パターン**     | **W** — 成功: `{ success: true, data: result.skills }` / 失敗: `{ success: false, error: string }` |
| **throw パターン**     | **T-ipc** — `toIPCValidationError(validation)` のみ（送信元検証失敗時）                            |
| **バリデーション**     | 引数はオプショナル `{ basePath?, forceRefresh? }` のため必須バリデーションなし                     |
| **エラーハンドリング** | **raw** — `error instanceof Error ? error.message : "スキャンに失敗しました"`                      |
| **不整合**             | なし                                                                                               |

### A-2. skill:scan (`IPC_CHANNELS.SKILL_SCAN`)

| 項目                   | 内容                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| **戻り値パターン**     | **W** — 成功: `{ success: true, data: result.skills }` / 失敗: `{ success: false, error: string }` |
| **throw パターン**     | **T-ipc** — 送信元検証失敗時のみ                                                                   |
| **バリデーション**     | 引数なし                                                                                           |
| **エラーハンドリング** | **raw** — `error instanceof Error ? error.message : "スキャンに失敗しました"`                      |
| **不整合**             | なし                                                                                               |

### A-3. skill:getImported (`IPC_CHANNELS.SKILL_GET_IMPORTED`)

| 項目                   | 内容                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| **戻り値パターン**     | **W** — 成功: `{ success: true, data: skills }` / 失敗: `{ success: false, error: string }` |
| **throw パターン**     | **T-ipc** — 送信元検証失敗時のみ                                                            |
| **バリデーション**     | 引数なし                                                                                    |
| **エラーハンドリング** | **raw** — `error instanceof Error ? error.message : "スキル取得に失敗しました"`             |
| **不整合**             | `log.error` でエラーをログ出力（他チャネルにはない — 不統一）                               |

### A-4. skill:import (`IPC_CHANNELS.SKILL_IMPORT`)

| 項目                   | 内容                                                                                                                                                                                                                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **戻り値パターン**     | **D** — 成功: `ImportedSkill` オブジェクトを直接返却                                                                                                                                                                                                                                                           |
| **throw パターン**     | **T-ipc** + **T-struct** — 送信元検証 + `{ code: "VALIDATION_ERROR", message }` + `{ code: "IMPORT_ERROR", message }`                                                                                                                                                                                          |
| **バリデーション**     | **3段** — `typeof skillName !== "string" \|\| skillName.trim() === ""`                                                                                                                                                                                                                                         |
| **エラーハンドリング** | throw 経由（try/catch なし） — エラーは全て throw で伝播                                                                                                                                                                                                                                                       |
| **不整合**             | **重大**: ラッパー不使用。他チャネル（list, scan, getImported等）は `{ success, data/error }` 形式だが、このチャネルだけ `ImportedSkill` を直接返す。Preload側は `safeInvoke`（unwrapなし）で受け取っており、Renderer到達型が `ImportedSkill` になるため型は一致するが、エラーハンドリング方式が他と全く異なる |

### A-5. skill:remove (`IPC_CHANNELS.SKILL_REMOVE`)

| 項目                   | 内容                                                                                                                                                                                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **戻り値パターン**     | **D** — `skillService.removeSkill(skillName)` の戻り値 `RemoveResult` を直接返却                                                                                                                                                                                                                    |
| **throw パターン**     | **T-ipc** + **T-struct** — 送信元検証 + `{ code: "VALIDATION_ERROR", message }`                                                                                                                                                                                                                     |
| **バリデーション**     | **3段** — `typeof skillName !== "string" \|\| skillName.trim() === ""`                                                                                                                                                                                                                              |
| **エラーハンドリング** | throw 経由 + サービス戻り値依存（try/catch なし）                                                                                                                                                                                                                                                   |
| **不整合**             | **重大**: ラッパー不使用。`RemoveResult` は `{ success: boolean, removed: boolean }` 型であり、ラッパーの `{ success, data }` 形式ではない。Preload側は `safeInvoke` で受け取り `RemoveResult` がそのまま到達する。ただし `RemoveResult.success` と ラッパーの `success` の意味が異なる可能性がある |

### A-6. skill:get-detail (`IPC_CHANNELS.SKILL_GET_DETAIL`)

| 項目                   | 内容                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **戻り値パターン**     | **W** — 成功: `{ success: true, data: skill }` / 失敗: `{ success: false, error: string }`      |
| **throw パターン**     | **T-ipc** + **T-struct** — 送信元検証 + `{ code: "VALIDATION_ERROR", message }`                 |
| **バリデーション**     | **3段** — `typeof args?.skillId !== "string" \|\| args.skillId.trim() === ""`                   |
| **エラーハンドリング** | **raw** — `error instanceof Error ? error.message : "スキル取得に失敗しました"`                 |
| **不整合**             | なし（ただしPreload側に対応する skillAPI メソッドが存在しない — skillHandlers.ts 内にのみ定義） |

### A-7. skill:execute (`IPC_CHANNELS.SKILL_EXECUTE`)

| 項目                   | 内容                                                                                                                                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **戻り値パターン**     | **W** — 成功: `{ success: true, data: result }` / 失敗: `{ success: false, error: string }`                                                                                                                             |
| **throw パターン**     | **T-ipc** + **T-struct** — 送信元検証 + `{ code: "VALIDATION_ERROR", message }`                                                                                                                                         |
| **バリデーション**     | **3段** — `skillName` または `skillId` に対して適用。2パターン（SkillExecutionRequest / { skillId }）の型ガード付き                                                                                                     |
| **エラーハンドリング** | **raw** — `error instanceof Error ? error.message : "スキル実行に失敗しました"`                                                                                                                                         |
| **不整合**             | Preload側は `safeInvokeUnwrap` を使用するため、ラッパーの `data` を取り出して `SkillExecutionResponse` として返す。ただし Main 側の `result` の型が `SkillExecutionResponse` かどうかは `executeSkill` の戻り値型に依存 |

### A-8. skill:abort (`IPC_CHANNELS.SKILL_ABORT`)

| 項目                   | 内容                                                                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **戻り値パターン**     | **P** — `boolean` (`false` または `_skillExecutorInstance.abort()` の戻り値)                                                                       |
| **throw パターン**     | **T-ipc** + **T-struct** — 送信元検証 + `{ code: "VALIDATION_ERROR", message }`                                                                    |
| **バリデーション**     | **3段** — `typeof executionId !== "string" \|\| executionId.trim() === ""`                                                                         |
| **エラーハンドリング** | なし（try/catch なし — abort は例外を throw する可能性がある）                                                                                     |
| **不整合**             | **重大**: ラッパー不使用。Preload側は `safeInvoke<void>` で呼び出し。Main側は `boolean` を返すが、Preload型定義は `Promise<void>` — 戻り値型不一致 |

### A-9. skill:get-status (`IPC_CHANNELS.SKILL_GET_STATUS`)

| 項目                   | 内容                                                                            |
| ---------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **戻り値パターン**     | **P/D** — `null` または `ExecutionInfo` オブジェクト                            |
| **throw パターン**     | **T-ipc** + **T-struct** — 送信元検証 + `{ code: "VALIDATION_ERROR", message }` |
| **バリデーション**     | **3段** — `typeof executionId !== "string" \|\| executionId.trim() === ""`      |
| **エラーハンドリング** | なし（try/catch なし）                                                          |
| **不整合**             | ラッパー不使用。Preload側は `safeInvoke<ExecutionInfo                           | null>` で直接受け取り。型は一致するが、他チャネルのラッパーパターンとは異なる |

### A-10. skill:analyze (`IPC_CHANNELS.SKILL_ANALYZE`)

| 項目                   | 内容                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| **戻り値パターン**     | **W** — 成功: `{ success: true, data: analysis }` / 失敗: `{ success: false, error: string }` |
| **throw パターン**     | **T-ipc** + **T-struct** — 送信元検証 + `{ code: "VALIDATION_ERROR", message }`               |
| **バリデーション**     | **3段** — `typeof args?.skillName !== "string" \|\| args.skillName.trim() === ""`             |
| **エラーハンドリング** | **raw** — `error instanceof Error ? error.message : "スキル分析に失敗しました"`               |
| **不整合**             | なし（Preload側の対応メソッドは確認対象外 — skill-api.ts に未定義）                           |

### A-11. skill:improve (`IPC_CHANNELS.SKILL_IMPROVE`)

| 項目                   | 内容                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| **戻り値パターン**     | **W** — 成功: `{ success: true, data: result }` / 失敗: `{ success: false, error: string }`                 |
| **throw パターン**     | **T-ipc** + **T-struct** — 送信元検証 + `{ code: "VALIDATION_ERROR", message }` × 2（skillName + analysis） |
| **バリデーション**     | **3段**（skillName） + `!args.analysis` チェック（analysis）                                                |
| **エラーハンドリング** | **raw** — `error instanceof Error ? error.message : "スキル改善に失敗しました"`                             |
| **不整合**             | `analysis` のバリデーションは truthy チェックのみ（型チェックなし）                                         |

### A-12. skill:optimize (`IPC_CHANNELS.SKILL_OPTIMIZE`)

| 項目                   | 内容                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **戻り値パターン**     | **W** — 成功: `{ success: true, data: result }` / 失敗: `{ success: false, error: string }`                                                      |
| **throw パターン**     | **T-ipc** — 送信元検証失敗時のみ                                                                                                                 |
| **バリデーション**     | **3段相当** — `typeof args?.prompt !== "string" \|\| args.prompt.trim() === ""` だが、**throw ではなく return** `{ success: false, error }`      |
| **エラーハンドリング** | **raw** — `error instanceof Error ? error.message : "プロンプト最適化に失敗しました"`                                                            |
| **不整合**             | **中**: バリデーション失敗時に throw ではなく `{ success: false }` を return。A-4〜A-11 の `throw { code: "VALIDATION_ERROR" }` パターンと不統一 |

### A-13. skill:optimize:variants (`IPC_CHANNELS.SKILL_OPTIMIZE_VARIANTS`)

| 項目                   | 内容                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| **戻り値パターン**     | **W** — 成功: `{ success: true, data: variants }` / 失敗: `{ success: false, error: string }` |
| **throw パターン**     | **T-ipc** — 送信元検証失敗時のみ                                                              |
| **バリデーション**     | **3段相当** — A-12 と同一パターン。**throw ではなく return**                                  |
| **エラーハンドリング** | **raw** — `error instanceof Error ? error.message : "バリアント生成に失敗しました"`           |
| **不整合**             | A-12 と同一問題                                                                               |

### A-14. skill:optimize:evaluate (`IPC_CHANNELS.SKILL_OPTIMIZE_EVALUATE`)

| 項目                   | 内容                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **戻り値パターン**     | **W** — 成功: `{ success: true, data: evaluation }` / 失敗: `{ success: false, error: string }` |
| **throw パターン**     | **T-ipc** — 送信元検証失敗時のみ                                                                |
| **バリデーション**     | **3段相当** — A-12 と同一パターン。**throw ではなく return**                                    |
| **エラーハンドリング** | **raw** — `error instanceof Error ? error.message : "プロンプト評価に失敗しました"`             |
| **不整合**             | A-12 と同一問題                                                                                 |

---

## B. skillFileHandlers.ts（6チャネル）

### B-1. skill:readFile (`IPC_CHANNELS.SKILL_READ_FILE`)

| 項目                   | 内容                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| **戻り値パターン**     | **W** — 成功: `{ success: true, data: content }` / 失敗: `{ success: false, error: string }`             |
| **throw パターン**     | **T-ipc** — 送信元検証失敗時のみ                                                                         |
| **バリデーション**     | **3段相当** — `typeof + .trim() === ""` だが、**throw ではなく return** `{ success: false }`             |
| **エラーハンドリング** | **safe** — `isKnownSkillFileError` で既知/未知エラーを分岐。未知エラーは `"Internal error"` でサニタイズ |
| **不整合**             | バリデーション失敗時の処理が skillHandlers.ts の throw パターンと不統一                                  |

### B-2. skill:writeFile (`IPC_CHANNELS.SKILL_WRITE_FILE`)

| 項目                   | 内容                                                                                                                                                                                                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **戻り値パターン**     | **W** — 成功: `{ success: true }` **（data フィールドなし）** / 失敗: `{ success: false, error: string }`                                                                                                                                                                                                 |
| **throw パターン**     | **T-ipc** — 送信元検証失敗時のみ                                                                                                                                                                                                                                                                          |
| **バリデーション**     | **3段相当**（skillName, relativePath） + 型チェックのみ（content）                                                                                                                                                                                                                                        |
| **エラーハンドリング** | **safe** — B-1 と同一                                                                                                                                                                                                                                                                                     |
| **不整合**             | **重大**: 成功レスポンスに `data` フィールドがない。Preload側で `safeInvokeUnwrap<void>` を使用するため、`result.data as void` になるが、`result.success === true` の場合に `data` が `undefined` で問題なく動作する。ただし `{ success: true }` と `{ success: true, data: undefined }` は厳密には異なる |

### B-3. skill:createFile (`IPC_CHANNELS.SKILL_CREATE_FILE`)

| 項目                   | 内容                                        |
| ---------------------- | ------------------------------------------- |
| **戻り値パターン**     | **W** — B-2 と同一（`data` フィールドなし） |
| **throw パターン**     | **T-ipc**                                   |
| **バリデーション**     | B-2 と同一                                  |
| **エラーハンドリング** | **safe**                                    |
| **不整合**             | B-2 と同一問題                              |

### B-4. skill:deleteFile (`IPC_CHANNELS.SKILL_DELETE_FILE`)

| 項目                   | 内容                                        |
| ---------------------- | ------------------------------------------- |
| **戻り値パターン**     | **W** — B-2 と同一（`data` フィールドなし） |
| **throw パターン**     | **T-ipc**                                   |
| **バリデーション**     | **3段相当**（skillName, relativePath）      |
| **エラーハンドリング** | **safe**                                    |
| **不整合**             | B-2 と同一問題                              |

### B-5. skill:listBackups (`IPC_CHANNELS.SKILL_LIST_BACKUPS`)

| 項目                   | 内容                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| **戻り値パターン**     | **W** — 成功: `{ success: true, data: backups }` / 失敗: `{ success: false, error: string }` |
| **throw パターン**     | **T-ipc**                                                                                    |
| **バリデーション**     | **3段相当**（skillName のみ）                                                                |
| **エラーハンドリング** | **safe**                                                                                     |
| **不整合**             | なし                                                                                         |

### B-6. skill:restoreBackup (`IPC_CHANNELS.SKILL_RESTORE_BACKUP`)

| 項目                   | 内容                                        |
| ---------------------- | ------------------------------------------- |
| **戻り値パターン**     | **W** — B-2 と同一（`data` フィールドなし） |
| **throw パターン**     | **T-ipc**                                   |
| **バリデーション**     | **3段相当**（skillName, backupPath）        |
| **エラーハンドリング** | **safe**                                    |
| **不整合**             | B-2 と同一問題                              |

---

## 不整合サマリーテーブル

| チャネル                    | 戻り値 | バリデーション              | エラー処理                 | 不整合レベル | 詳細                                    |
| --------------------------- | ------ | --------------------------- | -------------------------- | ------------ | --------------------------------------- |
| skill:list                  | W      | なし（任意引数）            | raw                        | -            | -                                       |
| skill:scan                  | W      | なし                        | raw                        | -            | -                                       |
| skill:getImported           | W      | なし                        | raw + log                  | 軽微         | `log.error` が他にない                  |
| **skill:import**            | **D**  | **3段 + throw**             | **throw のみ**             | **重大**     | ラッパー不使用、直接返却                |
| **skill:remove**            | **D**  | **3段 + throw**             | **throw のみ**             | **重大**     | ラッパー不使用、RemoveResult 直接返却   |
| skill:get-detail            | W      | 3段 + throw                 | raw                        | -            | -                                       |
| skill:execute               | W      | 3段 + throw                 | raw                        | -            | -                                       |
| **skill:abort**             | **P**  | **3段 + throw**             | **なし（try/catch なし）** | **重大**     | boolean 返却、Preload は void 期待      |
| skill:get-status            | P/D    | 3段 + throw                 | なし                       | 中           | ラッパー不使用（ただし Preload 型一致） |
| skill:analyze               | W      | 3段 + throw                 | raw                        | -            | -                                       |
| skill:improve               | W      | 3段 + throw(×2)             | raw                        | 軽微         | analysis の型チェック不足               |
| **skill:optimize**          | **W**  | **return（throwではない）** | **raw**                    | **中**       | バリデーション方式不統一                |
| **skill:optimize:variants** | **W**  | **return（throwではない）** | **raw**                    | **中**       | 同上                                    |
| **skill:optimize:evaluate** | **W**  | **return（throwではない）** | **raw**                    | **中**       | 同上                                    |
| skill:readFile              | W      | return                      | safe                       | 軽微         | throw/return 不統一                     |
| skill:writeFile             | W      | return                      | safe                       | 中           | data フィールド欠落                     |
| skill:createFile            | W      | return                      | safe                       | 中           | 同上                                    |
| skill:deleteFile            | W      | return                      | safe                       | 中           | 同上                                    |
| skill:listBackups           | W      | return                      | safe                       | -            | -                                       |
| skill:restoreBackup         | W      | return                      | safe                       | 中           | data フィールド欠落                     |

---

## 不整合パターンの分類

### パターン1: ラッパー不使用（直接返却）

**該当**: skill:import, skill:remove, skill:abort, skill:get-status

Main側がラッパー `{ success, data/error }` を使用せず、サービス戻り値やプリミティブを直接返却している。Preload側が `safeInvoke`（unwrapなし）を使用しているため実害は限定的だが、レスポンス形式の一貫性が損なわれている。

### パターン2: バリデーション失敗時の throw vs return

**該当**: skill:optimize, skill:optimize:variants, skill:optimize:evaluate（return パターン） vs skill:import, skill:remove, skill:execute 等（throw パターン）

3段バリデーション失敗時の処理が throw と return で混在。throw の場合は Electron IPC が自動的にエラーを伝播するが、return の場合は `{ success: false }` で正常レスポンスとして返る。

### パターン3: エラーメッセージのサニタイズ不備

**該当**: skillHandlers.ts の全ラッパーチャネル（list, scan, getImported, get-detail, execute, analyze, improve, optimize 系）

`error instanceof Error ? error.message : "フォールバック"` パターンを使用しており、`error.message` がサニタイズされていない。内部実装の詳細（ファイルパス、スタックトレース等）がRenderer側に漏洩する可能性がある。skillFileHandlers.ts の `isKnownSkillFileError` + `"Internal error"` パターンの方がセキュア。

### パターン4: 成功レスポンスの data フィールド欠落

**該当**: skill:writeFile, skill:createFile, skill:deleteFile, skill:restoreBackup

`{ success: true }` で `data` フィールドがない。Preload側の `safeInvokeUnwrap<void>` は `result.data as void` を返すため実害はないが、`IpcResult<T>` 型の契約違反。
