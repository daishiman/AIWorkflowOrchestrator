# Phase 8 リファクタリング分析

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 8                            |
| Phase名    | リファクタリング             |
| タスクID   | TASK-AUTH-MODE-SELECTION-001 |
| 実行日     | 2026-02-09                   |
| ステータス | 完了                         |

---

## 1. 重複コードの検出

### 1.1 型定義の重複

#### 発見箇所

| ファイル                                                  | 重複内容                                  |
| --------------------------------------------------------- | ----------------------------------------- |
| `packages/shared/src/types/auth-mode.ts`                  | AuthMode, AuthStatus, IAuthModeService 等 |
| `apps/desktop/src/main/services/auth/types.ts`            | AuthMode, AuthStatus, IAuthModeService 等 |
| `apps/desktop/src/renderer/store/slices/authModeSlice.ts` | AuthMode, AuthModeValidationResult        |

#### 分析

- `packages/shared` と `apps/desktop/src/main/services/auth/types.ts` で同名の型が重複定義されている
- authModeSlice.ts でも AuthMode が再定義されている
- エラーコードの定数も両方のファイルで異なる定義がある

#### 影響度

**低〜中**: 現時点では機能に影響はないが、将来的に型の不一致が発生するリスク

### 1.2 バリデーション関数の重複

#### 発見箇所

| ファイル                         | 関数名             |
| -------------------------------- | ------------------ |
| `AuthModeService.ts` (行102-106) | `isValidAuthMode`  |
| `authModeHandlers.ts` (行94-98)  | `validateAuthMode` |

#### コード比較

```typescript
// AuthModeService.ts
private isValidAuthMode(mode: unknown): mode is AuthMode {
  return (
    typeof mode === "string" && VALID_AUTH_MODES.includes(mode as AuthMode)
  );
}

// authModeHandlers.ts
function validateAuthMode(mode: unknown): mode is AuthMode {
  return (
    typeof mode === "string" && VALID_AUTH_MODES.includes(mode as AuthMode)
  );
}
```

#### 影響度

**低**: 同一ロジックのため、機能には影響なし

---

## 2. 複雑度の確認

### 2.1 循環複雑度分析

| ファイル                    | メソッド数 | 最大分岐深度 | 評価 |
| --------------------------- | ---------- | ------------ | ---- |
| AuthModeService.ts          | 7          | 2            | 良好 |
| SubscriptionAuthProvider.ts | 12         | 3            | 良好 |
| authModeHandlers.ts         | 4 handlers | 2            | 良好 |
| authModeSlice.ts            | 10         | 2            | 良好 |
| AuthModeSelector/index.tsx  | 3          | 2            | 良好 |

### 2.2 依存関係グラフ

```
packages/shared/types/auth-mode.ts
        ↓
apps/desktop/src/main/services/auth/types.ts
        ↓
AuthModeService.ts ← SubscriptionAuthProvider.ts
        ↓
authModeHandlers.ts
        ↓
preload/index.ts
        ↓
authModeSlice.ts → AuthModeSelector/index.tsx
```

依存方向は上から下への一方向で、循環参照なし。

---

## 3. 命名規則の統一

### 3.1 確認結果

| カテゴリ         | 規則              | 準拠状況 |
| ---------------- | ----------------- | -------- |
| クラス           | PascalCase        | OK       |
| インターフェース | I + PascalCase    | OK       |
| 関数             | camelCase         | OK       |
| 定数             | SCREAMING_SNAKE   | OK       |
| 型エイリアス     | PascalCase        | OK       |
| boolean変数      | is/has/can prefix | OK       |

### 3.2 具体例

```typescript
// クラス: PascalCase ✓
class AuthModeService
class SubscriptionAuthProvider

// インターフェース: I + PascalCase ✓
interface IAuthModeService
interface ISubscriptionAuthProvider

// 関数: camelCase ✓
function validateAuthMode()
function sanitizeErrorMessage()

// 定数: SCREAMING_SNAKE_CASE ✓
const AUTH_MODE_ERROR_CODES
const DEFAULT_AUTH_MODE
const TOKEN_CACHE_TTL_MS

// boolean変数: is/has prefix ✓
isAuthenticated
hasToken
isValid
```

---

## 4. リファクタリング提案

### 4.1 提案1: 型定義の一本化

**優先度**: 高
**影響範囲**: 広範囲（複数ファイル）

#### 現状

- `packages/shared/src/types/auth-mode.ts` と `apps/desktop/src/main/services/auth/types.ts` で型が重複

#### 提案

- `packages/shared/src/types/auth-mode.ts` を正（Single Source of Truth）とする
- `apps/desktop/src/main/services/auth/types.ts` からは shared からの re-export のみにする
- authModeSlice.ts では shared から import する

#### 実装手順

1. types.ts を整理し、shared に存在しない型のみを残す
2. authModeSlice.ts の型を shared から import に変更
3. 依存関係を確認し、テストを実行

**注意**: 影響範囲が広いため、別タスクとして切り出すことを推奨

### 4.2 提案2: バリデーション関数の共通化

**優先度**: 中
**影響範囲**: 限定的

#### 提案

```typescript
// packages/shared/src/utils/auth-mode.ts
export function isValidAuthMode(mode: unknown): mode is AuthMode {
  return (
    typeof mode === "string" && VALID_AUTH_MODES.includes(mode as AuthMode)
  );
}
```

### 4.3 提案3: エラーコードの統一

**優先度**: 中
**影響範囲**: 中程度

#### 現状

- 2箇所で異なるエラーコード定義が存在
- 数値コードと文字列コードが混在

#### 提案

- shared に統一エラーコード定義を配置
- 既存コードは非推奨（deprecated）としてマイグレーション

---

## 5. 発見した実装漏れ（修正済み）

### 5.1 preload/index.ts への authMode API 追加

**発見時の状態**:

- `preload/types.ts` に `AuthModeAPI` 型定義あり
- `preload/channels.ts` に `AUTH_MODE_*` チャンネル定義あり
- `preload/index.ts` に `authMode` API 実装なし

**修正内容**:

```typescript
// apps/desktop/src/preload/index.ts に追加
authMode: {
  get: () => safeInvoke(IPC_CHANNELS.AUTH_MODE_GET),
  set: (request: AuthModeSetRequest) =>
    safeInvoke(IPC_CHANNELS.AUTH_MODE_SET, request),
  status: () => safeInvoke(IPC_CHANNELS.AUTH_MODE_STATUS),
  validate: () => safeInvoke(IPC_CHANNELS.AUTH_MODE_VALIDATE),
  onModeChanged: (callback: (event: AuthModeChangedEvent) => void) =>
    safeOn<AuthModeChangedEvent>(IPC_CHANNELS.AUTH_MODE_CHANGED, callback),
},
```

---

## 6. 実施したリファクタリング

### 6.1 ESLint エラー修正

| ファイル                     | 修正内容                                 |
| ---------------------------- | ---------------------------------------- |
| AuthModeService.edge.test.ts | 未使用の `AuthMode` import を削除        |
| authModeSlice.test.ts        | 未使用の `AuthMode` import を削除        |
| authModeSlice.error.test.ts  | `loadingState` を `_loadingState` に変更 |

### 6.2 preload API 追加

- `preload/index.ts` に authMode API を追加
- TypeScript 型エラーを解消

---

## 7. 今後のタスク提案

| タスクID候補                  | 内容                       | 優先度 |
| ----------------------------- | -------------------------- | ------ |
| TASK-REFACTOR-AUTH-TYPES      | 型定義の一本化             | 中     |
| TASK-REFACTOR-AUTH-VALIDATION | バリデーション関数の共通化 | 低     |
| TASK-REFACTOR-ERROR-CODES     | エラーコードの統一         | 低     |

---

## 8. 結論

Phase 5 で実装されたコードは全体的に高品質であり、以下の点で優れている:

1. **一貫した命名規則**: PascalCase/camelCase/SCREAMING_SNAKE_CASE が適切に使い分けられている
2. **低い循環複雑度**: 各メソッドは単純で理解しやすい
3. **セキュリティパターン**: IPCハンドラでsender検証・エラーサニタイズが実装されている
4. **P5防止パターン**: authModeSliceでリスナー二重登録防止が実装されている

発見された重複は機能に影響がなく、将来的なリファクタリングタスクとして管理することを推奨する。

preload/index.ts への authMode API 追加漏れは本 Phase で修正済み。
