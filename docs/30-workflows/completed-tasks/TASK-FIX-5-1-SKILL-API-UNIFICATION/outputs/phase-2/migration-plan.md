# Phase 2 成果物: 移行計画書

## 作成日: 2026-02-05

## 移行戦略

**方針**: API#1（preload/skill-api.ts）をベースに統一インターフェースに拡張し、全呼び出し元を`window.electronAPI.skill`に移行後、`window.skillAPI`の二重公開とAPI#2（renderer/preload/index.ts）を削除する。

---

## 移行ステップ（7ステップ）

### Step 1: preload/skill-api.ts の統一インターフェースに拡張

| 項目   | 内容                                                              |
| ------ | ----------------------------------------------------------------- |
| 対象   | `apps/desktop/src/preload/skill-api.ts`                           |
| 変更   | スタブ5メソッドをsafeInvoke実装に変更、戻り値型を仕様書準拠に修正 |
| リスク | **低**（既存実装済みメソッドは保持）                              |

#### 詳細変更

| メソッド              | 変更前                            | 変更後                                                    |
| --------------------- | --------------------------------- | --------------------------------------------------------- |
| `list()`              | `Promise.resolve([])`             | `safeInvoke(IPC_CHANNELS.SKILL_LIST)`                     |
| `getImported()`       | `Promise.resolve([])`             | `safeInvoke(IPC_CHANNELS.SKILL_GET_IMPORTED)`             |
| `rescan()`            | `Promise.resolve([])`             | `safeInvoke(IPC_CHANNELS.SKILL_SCAN)`                     |
| `import(skillName)`   | `Promise.resolve(stub)`           | `safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)`        |
| `remove(skillName)`   | `Promise.resolve(true)` (boolean) | `safeInvoke(IPC_CHANNELS.SKILL_REMOVE, skillName)` (void) |
| `abort(executionId)`  | 戻り値 `boolean`                  | 戻り値 `void`                                             |
| `respondToPermission` | エイリアスとして存在              | **削除**（sendPermissionResponseに統一）                  |

### Step 2: preload/index.ts の公開ポイント統一

| 項目   | 内容                                            |
| ------ | ----------------------------------------------- |
| 対象   | `apps/desktop/src/preload/index.ts`             |
| 変更   | `window.skillAPI`の個別公開（L542, L563）を削除 |
| リスク | **中**（アクセスパス変更）                      |

#### 詳細変更

- L542: `contextBridge.exposeInMainWorld("skillAPI", skillAPI)` → **削除**
- L563: `(window as ...).skillAPI = skillAPI` → **削除**
- L342: `skill: skillAPI` → **保持**（electronAPI内でのskill公開は維持）

### Step 3: hooks/useSkillExecution.ts の移行

| 項目   | 内容                                                   |
| ------ | ------------------------------------------------------ |
| 対象   | `apps/desktop/src/renderer/hooks/useSkillExecution.ts` |
| 変更   | `window.skillAPI` → `window.electronAPI.skill`         |
| リスク | **中**                                                 |

#### 変更箇所

| 行   | 変更前                           | 変更後                                    |
| ---- | -------------------------------- | ----------------------------------------- |
| L79  | `window.skillAPI.onStream(...)`  | `window.electronAPI.skill.onStream(...)`  |
| L132 | `window.skillAPI.execute({...})` | `window.electronAPI.skill.execute({...})` |
| L178 | `window.skillAPI.abort(...)`     | `window.electronAPI.skill.abort(...)`     |

### Step 4: hooks/useSkillPermission.ts の移行

| 項目   | 内容                                                    |
| ------ | ------------------------------------------------------- |
| 対象   | `apps/desktop/src/renderer/hooks/useSkillPermission.ts` |
| 変更   | `window.skillAPI` → `window.electronAPI.skill`          |
| リスク | **低**                                                  |

#### 変更箇所

| 行  | 変更前                                         | 変更後                                                   |
| --- | ---------------------------------------------- | -------------------------------------------------------- |
| L54 | `window.skillAPI?.onPermissionRequest`         | `window.electronAPI?.skill?.onPermissionRequest`         |
| L59 | `window.skillAPI.onPermissionRequest(...)`     | `window.electronAPI.skill.onPermissionRequest(...)`      |
| L75 | `window.skillAPI?.sendPermissionResponse(...)` | `window.electronAPI?.skill?.sendPermissionResponse(...)` |
| L97 | `window.skillAPI?.sendPermissionResponse(...)` | `window.electronAPI?.skill?.sendPermissionResponse(...)` |

### Step 5: hooks/usePermissionDialog.ts の移行

| 項目   | 内容                                                     |
| ------ | -------------------------------------------------------- |
| 対象   | `apps/desktop/src/renderer/hooks/usePermissionDialog.ts` |
| 変更   | `window.skillAPI` → `window.electronAPI.skill`           |
| リスク | **低**                                                   |

#### 変更箇所

| 行  | 変更前                                        | 変更後                                                 |
| --- | --------------------------------------------- | ------------------------------------------------------ |
| L72 | `window.skillAPI.onPermissionRequest(...)`    | `window.electronAPI.skill.onPermissionRequest(...)`    |
| L99 | `window.skillAPI.sendPermissionResponse(...)` | `window.electronAPI.skill.sendPermissionResponse(...)` |

### Step 6: skillSlice.ts の型調整

| 項目   | 内容                                                                   |
| ------ | ---------------------------------------------------------------------- |
| 対象   | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                 |
| 変更   | `abort`/`remove`の戻り値型変更への対応                                 |
| リスク | **低**（既にwindow.electronAPI.skill使用、戻り値未使用箇所がほとんど） |

#### 変更箇所

| 行   | メソッド             | 影響                                             |
| ---- | -------------------- | ------------------------------------------------ |
| L240 | `remove(skillName)`  | 戻り値がvoidに変更（awaitのみなので影響なし）    |
| L295 | `abort(executionId)` | 戻り値がvoidに変更（戻り値未使用なので影響なし） |

### Step 7: renderer/preload/index.ts のskillAPI定義削除

| 項目   | 内容                                                         |
| ------ | ------------------------------------------------------------ |
| 対象   | `apps/desktop/src/renderer/preload/index.ts`                 |
| 変更   | SkillAPIインターフェース定義・skillAPI実装・関連import全削除 |
| リスク | **低**（Step 3-5完了後、参照なし）                           |

#### 削除対象

- L1-31: `SkillAPI` インターフェース定義
- L36-42: `hasElectronAPI` 型ガード関数
- L47-109: `skillAPI` 実装オブジェクト
- L6-10: `OperationResult`, `Skill`, `SkillRunResult` のインポート

---

## テストファイル移行計画

| テストファイル                           | モック変更                                                   |
| ---------------------------------------- | ------------------------------------------------------------ |
| `usePermissionDialog.test.ts`            | `window.skillAPI` モック → `window.electronAPI.skill` モック |
| `useSkillExecution.test.ts`              | `window.skillAPI` モック → `window.electronAPI.skill` モック |
| `debug.test.ts`                          | `window.skillAPI` 参照 → `window.electronAPI.skill` 参照     |
| `SkillStreamDisplay.permission.test.tsx` | `window.skillAPI` モック → `window.electronAPI.skill` モック |
| skillSlice系テスト（5ファイル）          | 変更不要（既に`window.electronAPI.skill`モック使用）         |

---

## 状態同期設計

| 操作                 | IPCフロー                               | Renderer状態更新                                          |
| -------------------- | --------------------------------------- | --------------------------------------------------------- |
| import → 一覧更新    | `SKILL_IMPORT` → レスポンス             | `importedSkills`に追加、`availableSkillsMetadata`から除去 |
| remove → 一覧更新    | `SKILL_REMOVE` → レスポンス             | `importedSkills`から除去                                  |
| rescan → 一覧更新    | `SKILL_SCAN` → レスポンス               | `availableSkillsMetadata`を完全置換                       |
| execute → ストリーム | `SKILL_EXECUTE` → `SKILL_STREAM` events | `streamingMessages`に追加                                 |
