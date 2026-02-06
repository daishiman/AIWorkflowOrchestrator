# Phase 1 成果物: 仕様書照合結果

## 作成日: 2026-02-05

## 参照仕様書

- `specification.md` §5.4（Renderer側インターフェース / preload API）

## 仕様書定義メソッド一覧（12メソッド）

```typescript
export interface SkillAPI {
  list(): Promise<SkillMetadata[]>;
  rescan(): Promise<SkillMetadata[]>;
  import(skillName: string): Promise<ImportedSkill>;
  getImported(): Promise<ImportedSkill[]>;
  remove(skillName: string): Promise<void>;
  execute(request: SkillExecutionRequest): Promise<SkillExecutionResponse>;
  abort(executionId: string): Promise<void>;
  respondToPermission(response: PermissionResponse): void;
  onStream(callback: (data: SkillStreamMessage) => void): () => void;
  onComplete(callback: (data: { executionId: string }) => void): () => void;
  onError(
    callback: (data: { executionId: string; error: string }) => void,
  ): () => void;
  onPermissionRequest(callback: (data: PermissionRequest) => void): () => void;
}
```

---

## 照合結果: 仕様書 vs API#1 (preload/skill-api.ts)

| 仕様書メソッド                                         | API#1対応                                                         | 一致度            | 差異内容                     |
| ------------------------------------------------------ | ----------------------------------------------------------------- | ----------------- | ---------------------------- |
| `list()` → `Promise<SkillMetadata[]>`                  | `list()` → `Promise<SkillMetadata[]>`                             | **一致** (スタブ) | 実装がスタブ（空配列返却）   |
| `rescan()` → `Promise<SkillMetadata[]>`                | `rescan()` → `Promise<SkillMetadata[]>`                           | **一致** (スタブ) | 実装がスタブ（空配列返却）   |
| `import(skillName: string)` → `Promise<ImportedSkill>` | `import(skillName: string)` → `Promise<ImportedSkill>`            | **一致** (スタブ) | 実装がスタブ（ダミー返却）   |
| `getImported()` → `Promise<ImportedSkill[]>`           | `getImported()` → `Promise<ImportedSkill[]>`                      | **一致** (スタブ) | 実装がスタブ（空配列返却）   |
| `remove(skillName: string)` → `Promise<void>`          | `remove(skillName: string)` → `Promise<boolean>`                  | **差異あり**      | 戻り値: void vs boolean      |
| `execute(request)` → `Promise<SkillExecutionResponse>` | `execute(request)` → `Promise<SkillExecutionResponse>`            | **一致**          | -                            |
| `abort(executionId)` → `Promise<void>`                 | `abort(executionId)` → `Promise<boolean>`                         | **差異あり**      | 戻り値: void vs boolean      |
| `respondToPermission(response)` → `void`               | `respondToPermission(response)` → `Promise<{ success: boolean }>` | **差異あり**      | 戻り値型が異なる、仕様はsync |
| `onStream(callback)` → `() => void`                    | `onStream(callback)` → `() => void`                               | **一致**          | -                            |
| `onComplete(callback)` → `() => void`                  | `onComplete(callback)` → `() => void`                             | **一致**          | -                            |
| `onError(callback)` → `() => void`                     | `onError(callback)` → `() => void`                                | **一致**          | -                            |
| `onPermissionRequest(callback)` → `() => void`         | `onPermissionRequest(callback)` → `() => void`                    | **一致**          | -                            |

### API#1に追加メソッド（仕様書に未定義）

| メソッド                 | 用途         | 判断                                  |
| ------------------------ | ------------ | ------------------------------------- |
| `getExecutionStatus`     | 実行状態取得 | 実用的、保持推奨                      |
| `sendPermissionResponse` | 権限応答送信 | `respondToPermission`と重複、統一推奨 |

---

## 照合結果: 仕様書 vs API#2 (renderer/preload/index.ts)

| 仕様書メソッド          | API#2対応                    | 一致度               | 差異内容                                       |
| ----------------------- | ---------------------------- | -------------------- | ---------------------------------------------- |
| `list()`                | `listAvailable()`            | **名称不一致**       | メソッド名、戻り値型（OperationResult ラップ） |
| `getImported()`         | `listImported()`             | **名称不一致**       | メソッド名、戻り値型（OperationResult ラップ） |
| `import(skillName)`     | `import(skillIds: string[])` | **シグネチャ不一致** | 引数: 単数 vs 配列、戻り値型不一致             |
| `remove(skillName)`     | `remove(skillId)`            | **戻り値不一致**     | 戻り値: `void` vs `OperationResult<void>`      |
| `execute(request)`      | `execute(skillId, params?)`  | **完全不一致**       | シグネチャ、戻り値型ともに不一致               |
| `rescan()`              | なし                         | **未実装**           | API#2に存在しない                              |
| `abort()`               | なし                         | **未実装**           | API#2に存在しない                              |
| `respondToPermission()` | なし                         | **未実装**           | API#2に存在しない                              |
| `onStream()`            | なし                         | **未実装**           | API#2に存在しない                              |
| `onComplete()`          | なし                         | **未実装**           | API#2に存在しない                              |
| `onError()`             | なし                         | **未実装**           | API#2に存在しない                              |
| `onPermissionRequest()` | なし                         | **未実装**           | API#2に存在しない                              |

### API#2に追加メソッド（仕様書に未定義）

| メソッド    | 用途           | 判断                                                      |
| ----------- | -------------- | --------------------------------------------------------- |
| `getDetail` | スキル詳細取得 | 仕様書に未定義、IPCチャンネルは存在（`SKILL_GET_DETAIL`） |

---

## 差異サマリ

### 修正必要な差異（API#1）

| #   | 差異                         | 現状                            | 仕様書                    | 修正方針                   |
| --- | ---------------------------- | ------------------------------- | ------------------------- | -------------------------- |
| 1   | `remove`戻り値               | `Promise<boolean>`              | `Promise<void>`           | 仕様書に準拠（void化）     |
| 2   | `abort`戻り値                | `Promise<boolean>`              | `Promise<void>`           | 仕様書に準拠（void化）     |
| 3   | `respondToPermission`戻り値  | `Promise<{ success: boolean }>` | `void`                    | 非同期維持が実用的、要検討 |
| 4   | `sendPermissionResponse`重複 | 別名で存在                      | `respondToPermission`のみ | 統一                       |
| 5   | 管理メソッド（5個）がスタブ  | スタブ実装                      | IPC接続必要               | safeInvokeで実装           |

### セキュリティ観点の差異

| #   | 問題                                                                     | 参照仕様                   |
| --- | ------------------------------------------------------------------------ | -------------------------- |
| 1   | API#2は`window.electronAPI.invoke`汎用メソッドでハードコード文字列を使用 | `security-api-electron.md` |
| 2   | API#2は`safeInvoke`のホワイトリスト検証を経由しない                      | `security-skill-ipc.md`    |
| 3   | `window.skillAPI`の二重公開はAPI攻撃面を増加させる                       | `security-api-electron.md` |

---

## interfaces-agent-sdk-skill.md との照合

| 仕様書の定義                | 現行実装の状態                                 |
| --------------------------- | ---------------------------------------------- |
| `OperationResult<T>` 型定義 | API#2のみで使用、API#1では未使用               |
| SkillAPI Preload API定義    | API#2の定義に近いがAPI#1の方が仕様書§5.4に近い |
| 権限API (TASK-3-1-D)        | API#1で実装済み、API#2では未実装               |

**結論**: API#1をベースに仕様書§5.4に完全準拠させ、API#2は廃止すべき。
