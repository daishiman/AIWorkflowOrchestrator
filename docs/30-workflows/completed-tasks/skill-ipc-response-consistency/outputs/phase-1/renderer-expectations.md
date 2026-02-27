# Renderer 利用側の期待形抽出

> Phase 1 Task 1-3 成果物
> 作成日: 2026-02-27
> タスク: skill-ipc-response-consistency

---

## 調査対象

`apps/desktop/src/renderer` 配下で `window.electronAPI.skill` を使用している全箇所を grep で特定し、各利用箇所の戻り値解釈パターンを記録する。

---

## 利用箇所一覧

### 1. agentSlice.ts: `fetchSkills`

| 項目        | 内容                                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| ファイル    | `apps/desktop/src/renderer/store/slices/agentSlice.ts` L564-569                                                         |
| 呼び出し    | `window.electronAPI.skill.list()` / `window.electronAPI.skill.getImported()`                                            |
| 戻り値解釈  | **直接変数代入** -- `const [available, imported] = await Promise.all([list(), getImported()])`                          |
| 期待する型  | `SkillMetadata[]` / `ImportedSkill[]`                                                                                   |
| Preload実装 | `safeInvokeUnwrap(SKILL_LIST)` / `safeInvokeUnwrap(SKILL_GET_IMPORTED)`                                                 |
| Main側返却  | `{ success: true, data: result.skills }` / `{ success: true, data: skills }`                                            |
| 一致判定    | **一致** -- `safeInvokeUnwrap` が `{ success, data }` を展開して `data` を返却するため、Renderer が期待する直接型と一致 |

### 2. agentSlice.ts: `rescanSkills`

| 項目        | 内容                                                                           |
| ----------- | ------------------------------------------------------------------------------ |
| ファイル    | `apps/desktop/src/renderer/store/slices/agentSlice.ts` L590-591                |
| 呼び出し    | `window.electronAPI.skill.rescan()` / `window.electronAPI.skill.getImported()` |
| 戻り値解釈  | **直接変数代入** -- `const available = await rescan()`                         |
| 期待する型  | `SkillMetadata[]` / `ImportedSkill[]`                                          |
| Preload実装 | `safeInvokeUnwrap(SKILL_SCAN)` / `safeInvokeUnwrap(SKILL_GET_IMPORTED)`        |
| Main側返却  | `{ success: true, data: result.skills }`                                       |
| 一致判定    | **一致** -- `safeInvokeUnwrap` による展開で型が一致                            |

### 3. agentSlice.ts: `importSkill`

| 項目        | 内容                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| ファイル    | `apps/desktop/src/renderer/store/slices/agentSlice.ts` L611-613                                                                      |
| 呼び出し    | `window.electronAPI.skill.import(skillName)`                                                                                         |
| 戻り値解釈  | **直接変数代入** -- `const imported = await import(skillName)` → `importedSkills: [...state.importedSkills, imported]`               |
| 期待する型  | `ImportedSkill`                                                                                                                      |
| Preload実装 | `safeInvoke(SKILL_IMPORT, skillName)` (**unwrap なし**)                                                                              |
| Main側返却  | `return importedSkill;` (直接 `ImportedSkill` を返却) / throw (エラー時)                                                             |
| 一致判定    | **一致** -- ハンドラが `ImportedSkill` を直接返し、`safeInvoke` がそのまま通すため型一致。エラーは throw で Renderer の catch に到達 |

### 4. agentSlice.ts: `removeSkill`

| 項目        | 内容                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| ファイル    | `apps/desktop/src/renderer/store/slices/agentSlice.ts` L634                                                                                |
| 呼び出し    | `window.electronAPI.skill.remove(skillName)`                                                                                               |
| 戻り値解釈  | **戻り値未使用** -- `await window.electronAPI.skill.remove(skillName)` の結果を変数に代入していない                                        |
| 期待する型  | `RemoveResult`（Preload型定義）だが、実際には使用していない                                                                                |
| Preload実装 | `safeInvoke(SKILL_REMOVE, skillName)` (**unwrap なし**)                                                                                    |
| Main側返却  | `return skillService.removeSkill(skillName)` → `RemoveResult { success, removed }`                                                         |
| 一致判定    | **部分一致** -- 型定義上は `RemoveResult` を返すが、Renderer側は戻り値を使用していない。戻り値を使い始めた場合に問題が顕在化するリスクあり |

### 5. agentSlice.ts: `executeSkill`

| 項目        | 内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ファイル    | `apps/desktop/src/renderer/store/slices/agentSlice.ts` L676-682                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 呼び出し    | `window.electronAPI.skill.execute({ skillName, prompt })`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 戻り値解釈  | **`.executionId` 直参照** -- `set({ executionId: response.executionId })`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 期待する型  | `SkillExecutionResponse { executionId, success, error? }`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Preload実装 | `safeInvokeUnwrap(SKILL_EXECUTE, request)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Main側返却  | `{ success: true, data: result }` where `result: SkillExecutionResponse`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 一致判定    | **不一致（重大）** -- `safeInvokeUnwrap` は `{ success, data }` の `data` フィールドを展開して返す。`data` = `SkillExecutionResponse { executionId, success, error? }`。agentSlice は `response.executionId` にアクセスしており、これは展開後の SkillExecutionResponse のフィールドに一致する。ただし、Main側がエラー時に `{ success: false, error: ... }` を返した場合、`safeInvokeUnwrap` が throw するため、agentSlice の catch ブロックに到達する。**型宣言上は一致するが、二重 success パターンが存在する**（外側の IpcResult.success と内側の SkillExecutionResponse.success が混在） |

### 6. useSkillExecution.ts: `execute`

| 項目        | 内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ファイル    | `apps/desktop/src/renderer/hooks/useSkillExecution.ts` L132-154                                                                                                                                                                                                                                                                                                                                                                                                            |
| 呼び出し    | `window.electronAPI.skill.execute({ prompt, skillName: skillId })`                                                                                                                                                                                                                                                                                                                                                                                                         |
| 戻り値解釈  | **`.success` 判定 + `.executionId` 直参照 + `.error` アクセス**                                                                                                                                                                                                                                                                                                                                                                                                            |
| 期待する型  | `SkillExecutionResponse { executionId, success, error? }`                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Preload実装 | `safeInvokeUnwrap(SKILL_EXECUTE, request)`                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Main側返却  | `{ success: true, data: SkillExecutionResponse }` (成功) / `{ success: false, error: string }` (失敗)                                                                                                                                                                                                                                                                                                                                                                      |
| 一致判定    | **不整合あり** -- `safeInvokeUnwrap` は成功時に `data`（= `SkillExecutionResponse`）を返す。`response.success` はこの展開後の SkillExecutionResponse.success を参照する。Main側が `{ success: false, error }` を返した場合は `safeInvokeUnwrap` が throw するため、useSkillExecution の catch に到達し、`response.success === false` の分岐には到達しない。**つまり `response.success` が `false` になるパスは理論上存在しないが、コード上は対応している（デッドコード）** |

### 7. AgentView/index.tsx: `handleExecute`

| 項目        | 内容                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| ファイル    | `apps/desktop/src/renderer/views/AgentView/index.tsx` L181-184                                                |
| 呼び出し    | `window.electronAPI.skill.execute({ skillName: skill.name, prompt: "" })`                                     |
| 戻り値解釈  | **try/catch のみ** -- `await execute(...)` の結果を変数に代入せず、成功時は toast 表示、失敗時は catch で処理 |
| 期待する型  | なし（void 的使用）                                                                                           |
| Preload実装 | `safeInvokeUnwrap(SKILL_EXECUTE, request)`                                                                    |
| 一致判定    | **一致** -- 戻り値を使用しないため型の不一致は問題にならない                                                  |

### 8. agentSlice.ts: `abortExecution`

| 項目        | 内容                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| ファイル    | `apps/desktop/src/renderer/store/slices/agentSlice.ts` L695                                                                     |
| 呼び出し    | `window.electronAPI?.skill?.abort(executionId)`                                                                                 |
| 戻り値解釈  | **戻り値未使用** -- fire-and-forget パターン                                                                                    |
| 期待する型  | `void`（Preload型定義では `Promise<void>`）                                                                                     |
| Preload実装 | `safeInvoke(SKILL_ABORT, executionId)`                                                                                          |
| Main側返却  | `return _skillExecutorInstance.abort(executionId)` → `boolean`                                                                  |
| 一致判定    | **型不一致（軽微）** -- Preload型は `Promise<void>` だがMainは `boolean` を返す。Renderer側は戻り値を使用していないため実害なし |

### 9. useSkillExecution.ts: `abort`

| 項目        | 内容                                                                              |
| ----------- | --------------------------------------------------------------------------------- |
| ファイル    | `apps/desktop/src/renderer/hooks/useSkillExecution.ts` L178                       |
| 呼び出し    | `window.electronAPI.skill.abort(executionIdRef.current)`                          |
| 戻り値解釈  | **try/catch のみ**                                                                |
| 期待する型  | `void`                                                                            |
| Preload実装 | `safeInvoke(SKILL_ABORT, executionId)`                                            |
| 一致判定    | **型不一致（軽微）** -- 上記 #8 と同様。Mainが `boolean` を返すが使用されていない |

### 10. agentSlice.ts: `respondToPermission`

| 項目        | 内容                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------- |
| ファイル    | `apps/desktop/src/renderer/store/slices/agentSlice.ts` L725-729                              |
| 呼び出し    | `window.electronAPI?.skill?.sendPermissionResponse({ requestId, approved, rememberChoice })` |
| 戻り値解釈  | **戻り値未使用** -- fire-and-forget                                                          |
| 期待する型  | `{ success: boolean }` (Preload型定義)                                                       |
| Preload実装 | `safeInvoke(SKILL_PERMISSION_RESPONSE, response)`                                            |
| 一致判定    | **一致** -- 戻り値は使用されていないため問題なし                                             |

### 11. usePermissionDialog.ts: `handleRespond`

| 項目       | 内容                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| ファイル   | `apps/desktop/src/renderer/hooks/usePermissionDialog.ts` L72, L99                                                      |
| 呼び出し   | `window.electronAPI.skill.onPermissionRequest(callback)` / `window.electronAPI.skill.sendPermissionResponse(response)` |
| 戻り値解釈 | **onPermissionRequest**: クリーンアップ関数を返す。**sendPermissionResponse**: `await` で待つが戻り値は使わない        |
| 期待する型 | onPermissionRequest: `() => void` (unsubscribe), sendPermissionResponse: `{ success: boolean }`                        |
| 一致判定   | **一致**                                                                                                               |

### 12. useSkillPermission.ts: `handleApprove` / `handleDeny`

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| ファイル   | `apps/desktop/src/renderer/hooks/useSkillPermission.ts` L54-102 |
| 呼び出し   | `window.electronAPI?.skill?.sendPermissionResponse({ ... })`    |
| 戻り値解釈 | **戻り値未使用** -- `.then(clearPending)` チェーンで後処理      |
| 期待する型 | `{ success: boolean }`                                          |
| 一致判定   | **一致**                                                        |

### 13. setupSkillListeners.ts: イベントリスナー

| 項目       | 内容                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| ファイル   | `apps/desktop/src/renderer/store/setupSkillListeners.ts` L32-64                                                       |
| 呼び出し   | `onStream`, `onComplete`, `onError`, `onPermissionRequest`                                                            |
| 戻り値解釈 | 各リスナーのクリーンアップ関数を取得して、返却される cleanup 関数内で呼び出す                                         |
| 期待する型 | 各コールバックの引数型（`SkillStreamMessage`, `{ executionId }`, `{ executionId, error }`, `SkillPermissionRequest`） |
| 一致判定   | **一致** -- イベント型はMain側送信と一致                                                                              |

---

## 戻り値解釈パターン分類

| パターン                           | 該当メソッド                                       | 件数 |
| ---------------------------------- | -------------------------------------------------- | ---- |
| `.executionId` 直参照              | execute (agentSlice)                               | 1    |
| `.success` 判定                    | execute (useSkillExecution)                        | 1    |
| 直接変数代入（型そのまま使用）     | list, getImported, rescan, import                  | 4    |
| try/catch のみ（throw を期待）     | execute (AgentView), abort                         | 2    |
| 戻り値未使用（fire-and-forget）    | remove, abort (agentSlice), sendPermissionResponse | 3    |
| リスナー登録（クリーンアップ関数） | onStream, onComplete, onError, onPermissionRequest | 4    |

---

## 不一致サマリ

| 重要度 | 箇所                      | 不一致内容                                                                                                                                                |
| ------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **高** | useSkillExecution.execute | `safeInvokeUnwrap` による展開で `response.success === false` パスがデッドコード化。Main側 `{ success: false }` は throw に変換されるため catch に到達する |
| **中** | agentSlice.executeSkill   | 二重 success パターン（外側 IpcResult.success と内側 SkillExecutionResponse.success）。現在は動作するが保守上のリスク                                     |
| **低** | abort                     | Preload型 `Promise<void>` vs Main実返却 `boolean`。戻り値未使用のため実害なし                                                                             |
| **低** | remove                    | 戻り値 `RemoveResult` を Renderer 側で使用していない。将来使用時にリスク                                                                                  |

---

## Preload の safeInvoke / safeInvokeUnwrap 使い分け現状

| メソッド               | Preload関数        | Main側レスポンス形式         | 整合性                                                                                                                                         |
| ---------------------- | ------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| list                   | `safeInvokeUnwrap` | `{ success, data }`          | 適切                                                                                                                                           |
| getImported            | `safeInvokeUnwrap` | `{ success, data }`          | 適切                                                                                                                                           |
| rescan                 | `safeInvokeUnwrap` | `{ success, data }`          | 適切                                                                                                                                           |
| execute                | `safeInvokeUnwrap` | `{ success, data }`          | 適切（ただし二重success問題あり）                                                                                                              |
| import                 | `safeInvoke`       | 直接 `ImportedSkill` / throw | **要検証** -- AR-2 制約では `{ success, data }` 系に `safeInvokeUnwrap` を使うべきだが、ハンドラは直接返却                                     |
| remove                 | `safeInvoke`       | 直接 `RemoveResult`          | **要検証** -- AR-7 制約で `RemoveResult` を返す。`RemoveResult { success, removed }` の `success` が IpcResult の `success` と混同されるリスク |
| abort                  | `safeInvoke`       | `boolean` / `false`          | 適切（型宣言との不一致は軽微）                                                                                                                 |
| getExecutionStatus     | `safeInvoke`       | `ExecutionInfo \| null`      | 適切                                                                                                                                           |
| sendPermissionResponse | `safeInvoke`       | 不明（Main側ハンドラ未確認） | 要確認                                                                                                                                         |
