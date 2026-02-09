# TASK-FIX-5-1: 型変更設計仕様

## タスク情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| タスクID     | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| Phase        | 2 - 設計                           |
| ドキュメント | 型変更設計                         |
| 作成日       | 2026-02-09                         |

## 概要

本ドキュメントでは、SkillAPI の二重型定義を解消するための変更内容を詳細に設計する。`window.skillAPI` の型宣言を削除し、`window.electronAPI.skill` への統一を実現する。

## 現状分析

### 現在の型定義構造

#### 1. `preload/types.d.ts` （グローバル型宣言）

**ファイルパス:** `apps/desktop/src/preload/types.d.ts`

**現在の内容:**

```typescript
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
    conversationAPI: ConversationAPI;
    skillAPI: SkillAPI; // ← 削除対象（幽霊型定義）
  }
}

export {};
```

**問題点:**

- `skillAPI: SkillAPI` の宣言が存在
- しかし `contextBridge.exposeInMainWorld` で実装は公開されていない
- 実装なしの「幽霊型定義」

#### 2. `preload/types.ts` （ElectronAPI型定義）

**ファイルパス:** `apps/desktop/src/preload/types.ts`

**現在の内容（該当部分）:**

```typescript
import { SkillAPI } from "./skill-api";
// ... other imports

export interface ElectronAPI {
  // ... other APIs
  skill: SkillAPI;
}

// グローバル宣言（2つ目の skillAPI）
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    skillAPI: SkillAPI; // ← 削除対象
  }
}
```

**問題点:**

- `ElectronAPI.skill: SkillAPI` は正しい（実装あり）
- しかし同じファイル内で `window.skillAPI: SkillAPI` も宣言
- グローバル宣言の重複

#### 3. `preload/index.ts` （実装）

**ファイルパス:** `apps/desktop/src/preload/index.ts`

**現在の内容（該当部分）:**

```typescript
import { skillAPI } from "./skill-api";
// ... other implementations

const electronAPI = {
  // ... other APIs
  skill: skillAPI,
};

// contextBridge で exposeInMainWorld
contextBridge.exposeInMainWorld("electronAPI", electronAPI);
// ← skillAPI は直接公開していない（正しい）
```

### 型定義の現状まとめ

| 定義箇所                 | 型宣言内容                    | 実装状況 | 使用状況    |
| ------------------------ | ----------------------------- | -------- | ----------- |
| `types.d.ts` (global)    | `window.skillAPI: SkillAPI`   | ❌ なし  | ❌ 使用0件  |
| `types.ts` (ElectronAPI) | `electronAPI.skill: SkillAPI` | ✅ あり  | ✅ 使用15件 |
| `types.ts` (global)      | `window.skillAPI: SkillAPI`   | ❌ なし  | ❌ 使用0件  |
| `preload/index.ts`       | 実装あり                      | ✅ あり  | -           |

**結論:** `window.skillAPI` 型宣言は2箇所で重複し、実装がない幽霊型定義

## 設計方針

### 目標

単一の統一型定義により、以下を実現する：

1. **型の統一:** `window.electronAPI.skill` への一本化
2. **重複排除:** `window.skillAPI` 型宣言の削除
3. **実装との一致:** 型宣言と実装の完全対応

### 実装パターン

```
Before（現状）:
  ┌─────────────────────────┐
  │ types.d.ts (global)     │
  │ window.skillAPI ← 幽霊型 │
  └─────────────────────────┘
            +
  ┌─────────────────────────┐
  │ types.ts (ElectronAPI)  │
  │ electronAPI.skill ✓     │  ← 実装あり
  └─────────────────────────┘
            +
  ┌─────────────────────────┐
  │ types.ts (global)       │
  │ window.skillAPI ← 幽霊型 │
  └─────────────────────────┘

After（統一後）:
  ┌─────────────────────────┐
  │ types.ts (ElectronAPI)  │
  │ electronAPI.skill ✓     │  ← 唯一の型定義
  └─────────────────────────┘
```

## 変更設計

### Step 1: `types.d.ts` の修正

**対象ファイル:** `apps/desktop/src/preload/types.d.ts`

**変更内容:**

**Before:**

```typescript
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
    conversationAPI: ConversationAPI;
    skillAPI: SkillAPI; // ← 削除
  }
}

export {};
```

**After:**

```typescript
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
    conversationAPI: ConversationAPI;
    // skillAPI は削除（electronAPI.skill 経由でアクセス）
  }
}

export {};
```

**変更量:**

- 削除行数: 1行 (`skillAPI: SkillAPI;`)

**副作用:**

- なし（実装コード無関係）
- 型チェックのみに影響

### Step 2: `types.ts` の修正（グローバル宣言）

**対象ファイル:** `apps/desktop/src/preload/types.ts`

**変更内容:**

**Before:**

```typescript
import { SkillAPI } from "./skill-api";
// ... other imports

export interface ElectronAPI {
  // ... other properties
  skill: SkillAPI;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    skillAPI: SkillAPI; // ← 削除
  }
}
```

**After:**

```typescript
import { SkillAPI } from "./skill-api";
// ... other imports

export interface ElectronAPI {
  // ... other properties
  skill: SkillAPI;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    // skillAPI は削除（electronAPI.skill 経由でアクセス）
  }
}
```

**変更量:**

- 削除行数: 1行 (`skillAPI: SkillAPI;`)

**副作用:**

- なし（実装コード無関係）
- 型チェックのみに影響

### Step 3: `skill-api.ts` の確認（変更不要）

**対象ファイル:** `apps/desktop/src/preload/skill-api.ts`

**確認内容:**

```typescript
export interface SkillAPI {
  list: () => Promise<SkillMetadata[]>;
  getImported: () => Promise<ImportedSkill[]>;
  import: (skillName: string) => Promise<ImportedSkill>;
  remove: (skillName: string) => Promise<void>;
  rescan: () => Promise<SkillMetadata[]>;
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;
  abort: (executionId: string) => Promise<void>;
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
  onComplete: (callback: (data: { executionId: string }) => void) => () => void;
  onError: (
    callback: (data: { executionId: string; error: string }) => void,
  ) => () => void;
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ) => Promise<{ success: boolean }>;
}

export const skillAPI: SkillAPI = {
  // ... 実装
};
```

**状態:** ✅ そのまま維持（変更不要）

### Step 4: `index.ts` の確認（変更不要）

**対象ファイル:** `apps/desktop/src/preload/index.ts`

**確認内容:**

```typescript
import { skillAPI } from "./skill-api";

const electronAPI = {
  file: fileAPI,
  store: storeAPI,
  skill: skillAPI, // ✅ 正しい公開方法
  // ... other APIs
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
```

**状態:** ✅ そのまま維持（変更不要）

## 変更の影響範囲

### 直接影響を受けるファイル

| ファイル             | 変更    | 理由                             |
| -------------------- | ------- | -------------------------------- |
| `preload/types.d.ts` | ✏️ 修正 | `skillAPI` 型宣言を削除          |
| `preload/types.ts`   | ✏️ 修正 | グローバル `skillAPI` 型宣言削除 |

**変更総量:**

- ファイル数: 2
- 削除行数: 2行
- 追加行数: 0行
- 修正行数: 0行

### 間接影響を受けるファイル

#### Renderer Layer（使用元）

| ファイル                           | 型参照                     | 影響    | 理由                         |
| ---------------------------------- | -------------------------- | ------- | ---------------------------- |
| `renderer/hooks/useSkillExecution` | `window.electronAPI.skill` | ❌ なし | 既に使用中（型定義変更なし） |
| `renderer/store/skillSlice`        | `window.electronAPI.skill` | ❌ なし | 既に使用中（型定義変更なし） |
| `renderer/views/AgentView`         | `window.electronAPI.skill` | ❌ なし | 既に使用中（型定義変更なし） |

**重要:** これらのファイルは既に `window.electronAPI.skill` を使用しているため、変更不要

#### Test Files

| ファイル                    | 型参照     | 影響    | 理由                       |
| --------------------------- | ---------- | ------- | -------------------------- |
| `skill-api.test.ts`         | モック関数 | ❌ なし | モック経由のため型参照なし |
| `useSkillExecution.test.ts` | モック関数 | ❌ なし | モック経由のため型参照なし |
| その他テストファイル        | モック関数 | ❌ なし | モック経由のため型参照なし |

**重要:** テストコードはモック経由のため、型定義の削除に影響されない

## 変更の安全性分析

### 互換性検証

| 項目           | 検証結果 | 説明                                                 |
| -------------- | -------- | ---------------------------------------------------- |
| 実装コード     | ✅ 安全  | 変更対象は型定義のみ、実装は変更なし                 |
| 呼び出し元     | ✅ 安全  | 全呼び出し元が既に `electronAPI.skill` を使用        |
| テストコード   | ✅ 安全  | モック経由のため型定義の削除に影響されない           |
| IPC通信        | ✅ 安全  | チャンネル定義は変更なし                             |
| セキュリティ   | ✅ 向上  | 幽霊型定義を削除することで、開発者の誤用を防止       |
| バンドルサイズ | ✅ 微減  | 型定義削除によるバンドルサイズ微減（無視できる水準） |

### リスク評価

**リスク度:** 🟢 **極めて低い**

**理由:**

1. **影響範囲が最小:** 型定義ファイル2件のみ
2. **実装コード無影響:** 削除されるのは宣言のみ
3. **使用パターン一致:** 全呼び出し元が削除対象外の `electronAPI.skill` を使用
4. **段階的移行不要:** 使用コードが存在しないため即座に削除可能

## 型チェック検証

### TypeScript Strict Mode での検証

#### Before（変更前）

```typescript
// types.d.ts の skillAPI 宣言により、以下が可能
const skill1 = window.skillAPI;  // ✅ OK（型定義あり、実装なし）
const skill2 = window.electronAPI.skill;  // ✅ OK（型定義あり、実装あり）

// しかし実行時に skillAPI は存在しない
skill1.execute({...});  // ❌ Runtime Error
```

#### After（変更後）

```typescript
// skillAPI 宣言削除後
const skill1 = window.skillAPI; // ❌ Type Error（型定義なし）
const skill2 = window.electronAPI.skill; // ✅ OK（型定義あり、実装あり）

// 開発段階で誤用を検出可能
```

**効果:** 開発者が誤って `window.skillAPI` を使用しようとした場合、ビルド時にエラーを検出

## 段階的移行計画（不要）

### 方針

本タスクでは**段階的移行は不要**。理由：

1. **使用コード 0件:** `window.skillAPI` を使用しているコードが存在しない
2. **型定義のみ:** 実装されていない幽霊型定義であるため、安全に削除可能
3. **即座の削除:** 段階的な deprecation 警告は不要

### 代替案の検討（不採用）

#### 案1: Deprecation 警告を追加

```typescript
/**
 * @deprecated Use window.electronAPI.skill instead
 */
skillAPI: SkillAPI;
```

**採用しない理由:**

- 実装がない幽霊型定義であるため、実行時には警告が機能しない
- TypeScript の `@deprecated` タグは削除までの猶予期間を示すが、本タスクでは使用コードが0件
- 不必要な複雑性を増加させるだけ

#### 案2: 別ファイルで互換性レイヤーを作成

```typescript
// compat.ts
/**
 * Compatibility layer for window.skillAPI
 * This will be removed in the next major version
 */
declare global {
  interface Window {
    skillAPI: SkillAPI;
  }
}
```

**採用しない理由:**

- 使用コードが0件であるため、互換性レイヤーは不要
- 技術的負債を増加させるだけ

## 動作検証計画

### 静的検証（ビルド時）

```bash
# TypeScript 型チェック
pnpm typecheck

# 期待結果:
# - 型エラーなし
# - 警告なし
# - 削除されたプロパティへのアクセスは検出不可（使用コードがないため）
```

### 動的検証（実行時テスト）

```bash
# 既存テスト全実行
pnpm test

# 期待結果:
# - 全テスト PASS
# - モック経由のため、型定義削除に影響されない
```

### 統合検証（マニュアルテスト）

| テストケース       | 期待結果             |
| ------------------ | -------------------- |
| スキール一覧表示   | 動作継続             |
| スキール実行       | 動作継続             |
| ストリーム出力取得 | 動作継続             |
| 権限リクエスト処理 | 動作継続             |
| IDE での型補完     | 正しく表示（補完）   |
| 誤用時のエラー検出 | ビルド時にエラー検出 |

## ファイル変更レシピ

### 変更 1: `apps/desktop/src/preload/types.d.ts`

**操作:**

1. ファイルを開く
2. 以下の行を削除：
   ```typescript
   skillAPI: SkillAPI;
   ```
3. 保存

**変更前:**

```typescript
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
    conversationAPI: ConversationAPI;
    skillAPI: SkillAPI;
  }
}

export {};
```

**変更後:**

```typescript
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
    conversationAPI: ConversationAPI;
  }
}

export {};
```

### 変更 2: `apps/desktop/src/preload/types.ts`

**操作:**

1. ファイルを開く
2. グローバル宣言内の以下の行を削除：
   ```typescript
   skillAPI: SkillAPI;
   ```
3. 保存

**変更前:**

```typescript
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    skillAPI: SkillAPI;
  }
}
```

**変更後:**

```typescript
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

## チェックリスト

### Phase 5（実装）での確認項目

- [ ] `types.d.ts` から `skillAPI: SkillAPI` を削除
- [ ] `types.ts` のグローバル宣言から `skillAPI: SkillAPI` を削除
- [ ] `pnpm typecheck` が通ることを確認
- [ ] `pnpm test` が全て PASS することを確認
- [ ] ビルドが成功することを確認
- [ ] IDE での型補完が正しく動作することを確認（`window.electronAPI.skill.*`）
- [ ] `window.skillAPI` への参照がないことを確認（grep確認）

## 設計のまとめ

### 変更概要

| 項目         | 詳細                              |
| ------------ | --------------------------------- |
| 削除対象     | `window.skillAPI` 型宣言（2箇所） |
| 理由         | 幽霊型定義（実装なし）            |
| 影響ファイル | 2個                               |
| 変更行数     | 2行削除                           |
| リスク度     | 🟢 極めて低い                     |
| 段階的移行   | 不要（使用コード0件）             |
| テスト       | 既存テスト全実行で十分            |

### 設計決定の正当性

1. **単一責務:** 型定義は1箇所（`types.ts` の `ElectronAPI`）に集約
2. **実装との対応:** 型宣言と実装が完全に対応
3. **セキュリティ向上:** 幽霊型定義削除により、開発者の誤用を防止
4. **保守性向上:** 型定義箇所の削減により保守性が向上

---

**作成日:** 2026-02-09
**ステータス:** Phase 2 成果物
**参照:** Phase 2 設計ドキュメント
