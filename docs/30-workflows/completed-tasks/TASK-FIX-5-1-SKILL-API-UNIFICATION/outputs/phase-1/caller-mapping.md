# Phase 1 成果物: 呼び出し元マップ

## 作成日: 2026-02-05

## 呼び出し元一覧

### `window.skillAPI` を使用するファイル（3ファイル）

| #   | ファイルパス                            | 使用メソッド                                    | アクセスパス      | 備考               |
| --- | --------------------------------------- | ----------------------------------------------- | ----------------- | ------------------ |
| 1   | `renderer/hooks/useSkillExecution.ts`   | `onStream`, `execute`, `abort`                  | `window.skillAPI` | L79, L132, L178    |
| 2   | `renderer/hooks/useSkillPermission.ts`  | `onPermissionRequest`, `sendPermissionResponse` | `window.skillAPI` | L54, L59, L75, L97 |
| 3   | `renderer/hooks/usePermissionDialog.ts` | `onPermissionRequest`, `sendPermissionResponse` | `window.skillAPI` | L72, L99           |

### `window.electronAPI.skill` を使用するファイル（2ファイル）

| #   | ファイルパス                            | 使用メソッド                                                                                      | アクセスパス               | 備考                                             |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------ |
| 4   | `renderer/store/slices/skillSlice.ts`   | `list`, `getImported`, `rescan`, `import`, `remove`, `execute`, `abort`, `sendPermissionResponse` | `window.electronAPI.skill` | L133-134, L196-197, L217, L240, L277, L295, L323 |
| 5   | `renderer/store/setupSkillListeners.ts` | `onStream`, `onComplete`, `onError`, `onPermissionRequest`                                        | `window.electronAPI.skill` | L24, L29, L34, L39                               |

---

## 詳細マッピング

### 1. `useSkillExecution.ts`

| 行番号 | 使用メソッド                                    | 引数の使い方                        | 戻り値の利用                                                     |
| ------ | ----------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| L79    | `window.skillAPI.onStream(callback)`            | `SkillStreamMessage`コールバック    | unsubscribe関数をuseEffectのcleanupに使用                        |
| L132   | `window.skillAPI.execute({prompt, skillName})`  | `SkillExecutionRequest`オブジェクト | `response.success`/`response.executionId`/`response.error`を参照 |
| L178   | `window.skillAPI.abort(executionIdRef.current)` | executionId文字列                   | 結果は使用せず（catch処理のみ）                                  |

### 2. `useSkillPermission.ts`

| 行番号 | 使用メソッド                                     | 引数の使い方                            | 戻り値の利用      |
| ------ | ------------------------------------------------ | --------------------------------------- | ----------------- |
| L54    | `window.skillAPI?.onPermissionRequest`           | 存在チェック                            | -                 |
| L59    | `window.skillAPI.onPermissionRequest(callback)`  | `SkillPermissionRequest`コールバック    | cleanup関数を返却 |
| L75-76 | `window.skillAPI?.sendPermissionResponse({...})` | `{requestId, approved, rememberChoice}` | Promise.catch     |
| L97-98 | `window.skillAPI?.sendPermissionResponse({...})` | 同上                                    | Promise.catch     |

### 3. `usePermissionDialog.ts`

| 行番号 | 使用メソッド                                       | 引数の使い方                          | 戻り値の利用                          |
| ------ | -------------------------------------------------- | ------------------------------------- | ------------------------------------- |
| L72    | `window.skillAPI.onPermissionRequest(callback)`    | `SkillPermissionRequest`コールバック  | unsubscribeをuseEffectのcleanupに使用 |
| L99    | `window.skillAPI.sendPermissionResponse(response)` | `SkillPermissionResponse`オブジェクト | awaitで待機                           |

### 4. `skillSlice.ts`

| 行番号 | 使用メソッド                                               | 引数の使い方                          | 戻り値の利用                 |
| ------ | ---------------------------------------------------------- | ------------------------------------- | ---------------------------- |
| L133   | `window.electronAPI.skill.list()`                          | なし                                  | `SkillMetadata[]`直接使用    |
| L134   | `window.electronAPI.skill.getImported()`                   | なし                                  | `ImportedSkill[]`直接使用    |
| L196   | `window.electronAPI.skill.rescan()`                        | なし                                  | `SkillMetadata[]`直接使用    |
| L197   | `window.electronAPI.skill.getImported()`                   | なし                                  | `ImportedSkill[]`直接使用    |
| L217   | `window.electronAPI.skill.import(skillName)`               | `string`型skillName                   | `ImportedSkill`を配列に追加  |
| L240   | `window.electronAPI.skill.remove(skillName)`               | `string`型skillName                   | awaitのみ（戻り値未使用）    |
| L277   | `window.electronAPI.skill.execute({skillName, prompt})`    | `SkillExecutionRequest`オブジェクト   | `response.executionId`を使用 |
| L295   | `window.electronAPI?.skill?.abort(executionId)`            | `string`型executionId                 | 戻り値未使用                 |
| L323   | `window.electronAPI?.skill?.sendPermissionResponse({...})` | `SkillPermissionResponse`オブジェクト | 戻り値未使用                 |

### 5. `setupSkillListeners.ts`

| 行番号 | 使用メソッド                                             | 引数の使い方                            | 戻り値の利用    |
| ------ | -------------------------------------------------------- | --------------------------------------- | --------------- |
| L24    | `window.electronAPI.skill.onStream(callback)`            | store.\_handleStreamMessageへの接続     | unsubscribe関数 |
| L29    | `window.electronAPI.skill.onComplete(callback)`          | store.\_handleCompleteへの接続          | unsubscribe関数 |
| L34    | `window.electronAPI.skill.onError(callback)`             | store.\_handleErrorへの接続             | unsubscribe関数 |
| L39    | `window.electronAPI.skill.onPermissionRequest(callback)` | store.\_handlePermissionRequestへの接続 | unsubscribe関数 |

---

## テストファイルでの参照

| ファイルパス                                                            | モック対象                        |
| ----------------------------------------------------------------------- | --------------------------------- |
| `hooks/__tests__/usePermissionDialog.test.ts`                           | `window.skillAPI` モック          |
| `hooks/__tests__/useSkillExecution.test.ts`                             | `window.skillAPI` モック          |
| `store/slices/__tests__/skillSlice.test.ts`                             | `window.electronAPI.skill` モック |
| `store/slices/__tests__/skillSlice.integration.test.ts`                 | `window.electronAPI.skill` モック |
| `store/slices/__tests__/skillSlice.edge-cases.test.ts`                  | `window.electronAPI.skill` モック |
| `store/slices/__tests__/skillSlice.state-transition.test.ts`            | `window.electronAPI.skill` モック |
| `store/slices/__tests__/skillSlice.ipc.test.ts`                         | `window.electronAPI.skill` モック |
| `components/AgentView/__tests__/debug.test.ts`                          | `window.skillAPI` 存在確認        |
| `components/AgentView/__tests__/SkillStreamDisplay.permission.test.tsx` | `window.skillAPI` モック          |

---

## 影響分析

| 移行対象                 | アクセスパス変更                               | 型変更                 | リスクレベル |
| ------------------------ | ---------------------------------------------- | ---------------------- | ------------ |
| `useSkillExecution.ts`   | `window.skillAPI` → `window.electronAPI.skill` | なし                   | **中**       |
| `useSkillPermission.ts`  | `window.skillAPI` → `window.electronAPI.skill` | なし                   | **低**       |
| `usePermissionDialog.ts` | `window.skillAPI` → `window.electronAPI.skill` | なし                   | **低**       |
| `skillSlice.ts`          | パス変更なし                                   | なし（既に直接型使用） | **低**       |
| `setupSkillListeners.ts` | パス変更なし                                   | なし                   | **低**       |
| テストファイル（9件）    | モック対象の変更                               | モック戻り値の修正     | **中**       |
