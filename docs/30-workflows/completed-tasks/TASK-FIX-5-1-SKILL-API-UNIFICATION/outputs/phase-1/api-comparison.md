# API比較表: window.skillAPI vs window.electronAPI.skill

## タスク情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| タスクID     | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| Phase        | 1 - 要件定義                       |
| ドキュメント | API比較表                          |
| 作成日       | 2026-02-09                         |

## 概要

このドキュメントでは、`window.skillAPI` と `window.electronAPI.skill` の2つのAPIエントリポイントを比較し、差異を分析する。

## 比較結果サマリー

| 観点                  | window.skillAPI                    | window.electronAPI.skill |
| --------------------- | ---------------------------------- | ------------------------ |
| **型宣言**            | ✅ あり (`types.d.ts`, `types.ts`) | ✅ あり (`types.ts`)     |
| **実装**              | ❌ なし                            | ✅ あり (`index.ts`)     |
| **contextBridge公開** | ❌ なし                            | ✅ あり                  |
| **使用箇所**          | ❌ 0件                             | ✅ 15ファイル            |
| **ステータス**        | **幽霊型定義**                     | **正式API**              |

## 詳細比較

### 1. 型宣言の比較

#### window.skillAPI

**場所:** `apps/desktop/src/preload/types.d.ts`

```typescript
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
    conversationAPI: ConversationAPI;
    skillAPI: SkillAPI; // ← この宣言
  }
}
```

**場所:** `apps/desktop/src/preload/types.ts`

```typescript
declare global {
  interface Window {
    // ... other APIs
    skillAPI: import("./skill-api").SkillAPI; // ← この宣言
    permissionAPI: PermissionAPI;
  }
}
```

**分析:**

- 型宣言が2箇所に存在（重複）
- `types.d.ts` と `types.ts` の両方で宣言
- 実装は存在しない（型だけの宣言）

#### window.electronAPI.skill

**場所:** `apps/desktop/src/preload/types.ts`

```typescript
export interface ElectronAPI {
  // ... other APIs

  // Skill API (TASK-6-1)
  skill: import("./skill-api").SkillAPI; // ← この宣言
}
```

**分析:**

- `ElectronAPI` インターフェースの一部として定義
- 実装が存在する（`index.ts` で割り当て）
- `contextBridge.exposeInMainWorld` で公開される

### 2. 実装の比較

#### window.skillAPI

**検証:** `apps/desktop/src/preload/index.ts` を調査

```typescript
// contextBridge.exposeInMainWorld で skillAPI を独立公開する処理は存在しない

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electronAPI", electronAPI);
    contextBridge.exposeInMainWorld("slideApi", slideApi);
    contextBridge.exposeInMainWorld("historyAPI", historyAPI);
    // ... other APIs
    // contextBridge.exposeInMainWorld("skillAPI", skillAPI); ← これは存在しない
  } catch (error) {
    console.error("Failed to expose APIs:", error);
  }
}
```

**結論:** 実装なし（公開されていない）

#### window.electronAPI.skill

**検証:** `apps/desktop/src/preload/index.ts` を調査

```typescript
import { skillAPI } from "./skill-api";

// electronAPI の一部として skillAPI を含める
const electronAPI: ElectronAPI = {
  file: {
    /* ... */
  },
  store: {
    /* ... */
  },
  // ... other APIs

  // Skill API (TASK-6-1)
  skill: skillAPI, // ← ここで割り当て (351行目)
};

// contextBridge で公開
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electronAPI", electronAPI); // ← ここで公開 (542行目)
    // ...
  } catch (error) {
    console.error("Failed to expose APIs:", error);
  }
}
```

**結論:** 実装あり（`electronAPI` の一部として公開）

### 3. APIメソッドの比較

両方とも同じ `SkillAPI` インターフェースを参照しているため、**型定義上のメソッドは同一**。

| カテゴリ     | メソッド数 | メソッド名                                          |
| ------------ | ---------- | --------------------------------------------------- |
| 一覧・管理系 | 5          | `list`, `getImported`, `import`, `remove`, `rescan` |
| 実行系       | 3          | `execute`, `abort`, `getExecutionStatus`            |
| イベント系   | 3          | `onStream`, `onComplete`, `onError`                 |
| 権限系       | 2          | `onPermissionRequest`, `sendPermissionResponse`     |
| **合計**     | **13**     |                                                     |

ただし：

- `window.skillAPI` は**実装が存在しない**ため、呼び出すと**実行時エラー**
- `window.electronAPI.skill` は**実装が存在する**ため、正常に動作

### 4. 使用箇所の比較

#### window.skillAPI の使用箇所

**検索結果:**

```bash
$ grep -r "window\.skillAPI" apps/desktop/src/renderer
# → 0件
```

**結論:** 使用されていない

#### window.electronAPI.skill の使用箇所

**検索結果:** 15ファイルで使用

| カテゴリ  | ファイル                 | 使用例                                              |
| --------- | ------------------------ | --------------------------------------------------- |
| **Hooks** | `useSkillExecution.ts`   | `window.electronAPI.skill.onStream(...)`            |
|           | `useSkillPermission.ts`  | `window.electronAPI.skill.onPermissionRequest(...)` |
|           | `usePermissionDialog.ts` | `window.electronAPI.skill.onPermissionRequest(...)` |
| **Store** | `skillSlice.ts`          | `window.electronAPI.skill.list()`                   |
|           | `setupSkillListeners.ts` | `window.electronAPI.skill.onStream(...)`            |
| **Views** | `AgentView/index.tsx`    | `window.electronAPI.skill.execute(...)`             |
| **Tests** | 9ファイル                | モック経由で使用                                    |

**結論:** 全ての呼び出し元が `window.electronAPI.skill` を使用

### 5. セキュリティ比較

#### window.skillAPI

- `contextBridge` で公開されていない
- `contextIsolation` の恩恵を受けない
- 仮に実装しても、セキュリティ上の問題が発生する可能性

#### window.electronAPI.skill

- `contextBridge` で正式に公開
- `contextIsolation: true` の保護下で動作
- `safeInvoke` / `safeOn` パターンで保護
- チャンネルホワイトリストで制限

## 差異の原因分析

### なぜ二重定義が存在するのか

**推測される経緯:**

1. **初期設計段階:**
   - `window.skillAPI` として独立したAPIを計画
   - `types.d.ts` に型宣言を追加

2. **設計変更:**
   - `window.electronAPI` の一部として統合する方針に変更
   - `electronAPI.skill` として実装

3. **クリーンアップ漏れ:**
   - `types.d.ts` の古い型宣言が削除されずに残った
   - `types.ts` にも重複して宣言が追加された

### なぜ問題なのか

1. **混乱を招く:**
   - 開発者が `window.skillAPI` を使用できると誤解する
   - 実際には実行時エラーになる

2. **保守性の低下:**
   - 使用されていない型定義が残る
   - コードの理解を妨げる

3. **一貫性の欠如:**
   - 他のAPIは `electronAPI.*` で統一されている
   - `skillAPI` だけが例外的な型宣言を持つ

## 統一方針

### 削除対象

- `apps/desktop/src/preload/types.d.ts` の `skillAPI: SkillAPI` 宣言
- `apps/desktop/src/preload/types.ts` のグローバル宣言内の `skillAPI` 宣言

### 維持対象

- `apps/desktop/src/preload/skill-api.ts` の `SkillAPI` インターフェース
- `apps/desktop/src/preload/skill-api.ts` の `skillAPI` 実装
- `apps/desktop/src/preload/index.ts` の `skill: skillAPI` 割り当て
- `apps/desktop/src/preload/types.ts` の `ElectronAPI.skill` 型定義

### 期待される効果

1. **一貫性の向上:**
   - 全てのAPIが `window.electronAPI.*` で統一

2. **保守性の向上:**
   - 使用されていない型定義が削除される
   - コードの意図が明確になる

3. **混乱の解消:**
   - 開発者が正しいAPIパスを即座に理解できる

## まとめ

| 項目       | 現状                             | 目標                                  |
| ---------- | -------------------------------- | ------------------------------------- |
| 型宣言箇所 | 3箇所（types.d.ts, types.ts x2） | 1箇所（types.ts: ElectronAPI.skill）  |
| 実装       | electronAPI.skill のみ           | 変更なし                              |
| 使用箇所   | electronAPI.skill のみ           | 変更なし                              |
| 削除対象   | -                                | types.d.ts, types.ts のグローバル宣言 |

**結論:** `window.skillAPI` は実体のない幽霊型定義であり、削除しても影響はない。

---

**作成日:** 2026-02-09
**ステータス:** Phase 1 完了
