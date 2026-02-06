# Phase 2 成果物: 型変更設計書

## 作成日: 2026-02-05

## 型変更一覧

### 1. SkillAPI インターフェース更新

| 項目                  | 変更前                                  | 変更後                                   |
| --------------------- | --------------------------------------- | ---------------------------------------- |
| ファイル              | `apps/desktop/src/preload/skill-api.ts` | 同左                                     |
| `abort`戻り値         | `Promise<boolean>`                      | `Promise<void>`                          |
| `remove`戻り値        | `Promise<boolean>`                      | `Promise<void>`                          |
| `respondToPermission` | 存在                                    | **削除**（sendPermissionResponseに統一） |
| 管理メソッド群        | スタブ実装                              | safeInvoke実装                           |

### 2. ElectronAPI 型定義への影響

| 項目     | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/preload/types.ts`                                                |
| 変更     | `ElectronAPI.skill` の型が `SkillAPI` のまま（preload/skill-api.tsからインポート） |
| 影響     | SkillAPI型の変更に自動追従                                                         |

### 3. OperationResult 型の扱い

| 項目 | 内容                                                                               |
| ---- | ---------------------------------------------------------------------------------- |
| 型   | `OperationResult<T> = { success: boolean; data?: T; error?: string }`              |
| 現状 | `renderer/preload/index.ts`のAPI#2のみで使用                                       |
| 方針 | skillAPI関連での使用を廃止。型定義自体は他機能で使用されている可能性があるため残置 |

#### OperationResult使用箇所の調査

```bash
grep -rn "OperationResult" apps/desktop/src/ --include="*.ts" --include="*.tsx"
```

skillAPI関連のOperationResult参照を全て削除対象とする。

### 4. window.skillAPI 型定義の削除

| 項目 | 内容                                                                 |
| ---- | -------------------------------------------------------------------- |
| 対象 | `renderer/preload/index.ts` のSkillAPIインターフェース定義（L15-31） |
| 方針 | 完全削除（preload/skill-api.tsの型定義が正本）                       |

### 5. window グローバル型宣言の確認

`window.skillAPI` の型宣言が存在する場合、削除が必要。

確認対象:

- `apps/desktop/src/renderer/types/global.d.ts`
- `apps/desktop/src/preload/types.ts`
- `apps/desktop/src/renderer/preload/index.ts`

---

## 型変更の影響マトリクス

| 変更                       | 影響ファイル                | 修正内容                                              |
| -------------------------- | --------------------------- | ----------------------------------------------------- |
| `abort` → `Promise<void>`  | `skillSlice.ts` L295        | 影響なし（戻り値未使用）                              |
| `abort` → `Promise<void>`  | `useSkillExecution.ts` L178 | 影響なし（awaitのみ）                                 |
| `remove` → `Promise<void>` | `skillSlice.ts` L240        | 影響なし（awaitのみ）                                 |
| `respondToPermission` 削除 | テストファイル              | respondToPermission参照をsendPermissionResponseに変更 |
| `OperationResult` 廃止     | `renderer/preload/index.ts` | ファイルからskillAPI定義ごと削除                      |

---

## 型安全性の確保

### インポートパス

```typescript
// Preload層
import type { SkillAPI } from "./skill-api";

// Renderer層（型参照のみ）
// window.electronAPI.skill の型は ElectronAPI.skill: SkillAPI で保証

// 共有型
import type {
  SkillMetadata,
  ImportedSkill,
  SkillExecutionRequest,
  SkillExecutionResponse,
  SkillStreamMessage,
  ExecutionInfo,
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";
```

### TypeScript strictモード互換性

| チェック項目          | 対応                                                        |
| --------------------- | ----------------------------------------------------------- |
| `strictNullChecks`    | `window.electronAPI?.skill?` のオプショナルチェイニング維持 |
| `noImplicitAny`       | 全メソッドに明示的な型注釈                                  |
| `strictFunctionTypes` | コールバック型の共変・反変チェック対応                      |

---

## IPC通信エラー時の型設計

```typescript
// safeInvokeのエラーはPromise.rejectで伝播
// 呼び出し元はtry/catchで処理

// 例: skillSlice.ts
try {
  const available = await window.electronAPI.skill.list();
  // available: SkillMetadata[]（直接型）
} catch (error) {
  // error: unknown（Errorインスタンスまたは文字列）
  const message = error instanceof Error ? error.message : String(error);
}
```

**OperationResult パターンは使用しない**:

- 成功時: 直接型を返却
- 失敗時: Promiseをreject（Error throw）
