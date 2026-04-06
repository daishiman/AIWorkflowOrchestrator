# Phase 5: 実装

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 5                             |
| 機能名 | rt-04-authkey-component-dedup |
| 作成日 | 2026-04-06                    |

## 目的

Phase 4 で設計したテストケースを Green にするための実装を行う。型統一・フック新規作成・コンポーネント更新の順で実施し、TECH-M-02（useAuthModeStatus 依存）の要否をこの Phase で最終判断する。

---

## 実行タスク

### タスク0: 実装前確認

```bash
# 現在のテスト状態（実装前の Red 確認）
pnpm --filter @repo/desktop test -- --run \
  apps/desktop/src/renderer/hooks/__tests__/useAuthKeyManagement.test.ts \
  2>/dev/null | tail -20

# useAuthModeStatus の現行実装確認（TECH-M-02）
grep -rn "useAuthModeStatus" apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx

# authKey.exists() の戻り値型確認
grep -n "authKey" apps/desktop/src/preload/types.ts 2>/dev/null || \
  grep -rn "authKey\.exists" apps/desktop/src/main/ | head -10
```

**TECH-M-02 判断基準:**

| 確認内容                                                                     | 判断                     |
| ---------------------------------------------------------------------------- | ------------------------ |
| `useAuthModeStatus` が `authKey.exists()` の `source` フィールドで代替できる | フックに含めない（除外） |
| `useAuthModeStatus` が独自の store 状態を管理している                        | フックに含める（統合）   |

---

### タスク1: `packages/shared/src/types/skillCreator.ts` — ApiKeyStatus 型拡張

**変更内容:** `ApiKeyStatus` に `"check-failed"` を追加する。

**新規作成ファイル:** なし

**修正ファイル:** `packages/shared/src/types/skillCreator.ts`

**変更前:**

```typescript
export type ApiKeyStatus = "not_set" | "validating" | "configured" | "error";
```

**変更後:**

```typescript
export type ApiKeyStatus =
  | "not_set"
  | "validating"
  | "configured"
  | "error"
  | "check-failed";
```

**実装後確認:**

```bash
pnpm --filter @repo/shared typecheck
grep -n "ApiKeyStatus" packages/shared/src/types/skillCreator.ts
```

---

### タスク2: `useAuthKeyManagement.ts` — フック新規作成

**新規作成ファイル:** `apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts`

**実装内容:**

1. インターフェース定義（`UseAuthKeyManagementReturn` / `UseAuthKeyManagementOptions`）
2. バリデーション関数 `validateApiKey`（sk- プレフィックス・200文字チェック）
3. `useAuthKeyManagement` 本体
   - 初期化: `authKey.exists()` → status・keySource 設定
   - `handleSave`: バリデーション → `authKey.set()` → status 更新 → `onStatusChange` 呼び出し
   - `handleDelete`: `authKey.delete()` → `authKey.exists()` 再確認 → status 更新
   - `refresh`: `authKey.exists()` 再実行

**状態遷移仕様:**

```
初期化
  └─ authKey.exists()
       ├─ { exists: true, source: "saved" }       → status="configured", keySource="saved"
       ├─ { exists: true, source: "env-fallback" } → status="configured", keySource="env-fallback"
       ├─ { exists: false }                        → status="not_set", keySource=null
       └─ 例外発生                                 → status="check-failed"

handleSave(inputValue)
  └─ validateApiKey(inputValue) → エラーあり → validationError 設定（IPC 呼び出しなし）
  └─ isSubmitting=true, status="validating"
  └─ authKey.set(key)
       ├─ { success: true }  → status="configured", keySource="saved", inputValue=""
       │                       onStatusChange?.("configured")
       └─ { success: false } → status="error", apiError 設定
  └─ isSubmitting=false

handleDelete()
  └─ authKey.delete()
       ├─ { success: true }  → authKey.exists() 再確認 → status 更新
       │                       onStatusChange?.(新 status)
       └─ { success: false } → apiError 設定
```

**コマンド確認:**

```bash
# hooks ディレクトリ確認
ls apps/desktop/src/renderer/hooks/

# 既存フックの import パターン確認
grep -n "window.electronAPI" apps/desktop/src/renderer/hooks/*.ts 2>/dev/null | head -10
```

---

### タスク3: `AuthKeySection/index.tsx` — フック適用・props 追加・AuthKeyStatus 廃止

**修正ファイル:** `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`

**変更内容:**

1. ローカル型 `AuthKeyStatus` の定義を削除
2. `ApiKeyStatus` を `packages/shared` からインポートに変更
3. `AuthKeySectionProps` インターフェースに `onStatusChange?: (status: ApiKeyStatus) => void` 追加
4. コンポーネントを `React.FC<AuthKeySectionProps>` に変更
5. `useAuthKeyManagement({ onStatusChange })` を呼び出し、返り値で既存ローカル state を置き換え
6. `checkAuthKeyStatus` / 直接 IPC 呼び出しコードを削除

**移行マッピング（AuthKeyStatus → ApiKeyStatus）:**

| AuthKeyStatus（削除） | ApiKeyStatus（使用）                        |
| --------------------- | ------------------------------------------- |
| `"saved"`             | `"configured"` + `keySource="saved"`        |
| `"env-fallback"`      | `"configured"` + `keySource="env-fallback"` |
| `"not-set"`           | `"not_set"`                                 |
| `"check-failed"`      | `"check-failed"`                            |

**実装後確認:**

```bash
# AuthKeyStatus ローカル型がないことを確認
grep -n "AuthKeyStatus" apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx

# 直接 IPC 呼び出しがないことを確認
grep -n "window.electronAPI.authKey" apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx

# 型チェック
pnpm --filter @repo/desktop typecheck 2>&1 | grep -i "authkey\|apikey" | head -20
```

---

### タスク4: `ApiKeySettingsPanel.tsx` — 委譲実装

**修正ファイル:** `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`

**変更内容:**

1. 既存の IPC 呼び出しロジック・state 管理コードを削除
2. `AuthKeySection` をインポート
3. コンポーネント本体を委譲ラッパーに変更（`<AuthKeySection onStatusChange={onStatusChange} />`）
4. `ApiKeySettingsPanelProps` は後方互換を維持（`onStatusChange?: (status: ApiKeyStatus) => void`）

**委譲後のコンポーネント構造:**

```typescript
// 委譲後の最小構造（実装時の参考）
export function ApiKeySettingsPanel({ onStatusChange }: ApiKeySettingsPanelProps) {
  return <AuthKeySection onStatusChange={onStatusChange} />;
}
```

**実装後確認:**

```bash
# 直接 IPC 呼び出しがないことを確認
grep -n "window.electronAPI.authKey" apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx

# AuthKeySection へのインポートが存在することを確認
grep -n "AuthKeySection" apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx
```

---

### タスク5: テストファイル更新

**更新対象1:** `apps/desktop/src/renderer/hooks/__tests__/useAuthKeyManagement.test.ts`（新規作成）

- TC-01〜TC-05 を実装
- `window.electronAPI.authKey` を `vi.mock` または `vi.stubGlobal` でモック

**更新対象2:** `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx`

- TC-06〜TC-10 を追加
- `useAuthKeyManagement` を `vi.mock` でモック
- `AuthKeyStatus` 参照を `ApiKeyStatus` に変更

**更新対象3:** `apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx`

- 委譲後の動作に合わせてテストを整理
- TC-11〜TC-15 を実装
- 削除した IPC ロジックのテストを除去

**実装後確認:**

```bash
# フックテスト実行
pnpm --filter @repo/desktop test -- --run \
  apps/desktop/src/renderer/hooks/__tests__/useAuthKeyManagement.test.ts

# コンポーネントテスト実行
pnpm --filter @repo/desktop test -- --run \
  apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx
```

---

### タスク6: 全体検証

```bash
# 全テスト実行（関連ファイル）
pnpm --filter @repo/desktop test -- --run

# 型チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck

# Lint
pnpm --filter @repo/desktop lint
pnpm --filter @repo/shared lint
```

**AC 検証チェック:**

| AC   | 確認コマンド                                                                                       | 合格基準                         |
| ---- | -------------------------------------------------------------------------------------------------- | -------------------------------- |
| AC-1 | `grep -n "electronAPI.authKey" apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx` | マッチ0件                        |
| AC-2 | `grep -rn "type ApiKeyStatus" packages/ apps/`                                                     | `packages/shared` のみ1件        |
| AC-3 | `grep -n "onStatusChange" apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`  | props 定義が存在する             |
| AC-4 | `pnpm --filter @repo/desktop test -- --run`                                                        | 全テスト PASS                    |
| AC-5 | `pnpm --filter @repo/desktop typecheck && pnpm --filter @repo/desktop lint`                        | エラーなし                       |
| AC-6 | `grep -n "electronAPI.authKey" apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts`            | exists / set / delete が存在する |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                     | 内容                |
| ---------- | ------------------------------------------------------------------------ | ------------------- |
| IPC 仕様   | `.claude/skills/aiworkflow-requirements/references/api-ipc-contracts.md` | IPC チャンネル定義  |
| 型定義仕様 | `packages/shared/src/types/skillCreator.ts`                              | 共有型 ApiKeyStatus |

### 実装参照ファイル

**新規作成ファイル:**

| ファイルパス                                                             | 内容               |
| ------------------------------------------------------------------------ | ------------------ |
| `apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts`                | カスタムフック本体 |
| `apps/desktop/src/renderer/hooks/__tests__/useAuthKeyManagement.test.ts` | フックのテスト     |

**修正ファイル:**

| ファイルパス                                                                           | 変更内容                                   |
| -------------------------------------------------------------------------------------- | ------------------------------------------ |
| `packages/shared/src/types/skillCreator.ts`                                            | `ApiKeyStatus` に `"check-failed"` 追加    |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`               | フック使用・props 追加・AuthKeyStatus 廃止 |
| `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`                   | AuthKeySection への委譲に変更              |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx` | フック使用後のテスト更新                   |
| `apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx`    | 委譲後のテスト整理                         |

### 設計参照

| ドキュメント     | パス                                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| Phase 2 設計     | `docs/30-workflows/rt-04-authkey-component-dedup/phase-2-design.md`        |
| Phase 3 レビュー | `docs/30-workflows/rt-04-authkey-component-dedup/phase-3-design-review.md` |
| Phase 4 テスト   | `docs/30-workflows/rt-04-authkey-component-dedup/phase-4-test-creation.md` |

---

## 統合テスト連携【必須】

| 判定項目                             | 基準                 | 実施方針                                           |
| ------------------------------------ | -------------------- | -------------------------------------------------- |
| フックテスト（TC-01〜TC-05）         | 全 Green             | `pnpm --filter @repo/desktop test -- --run` で確認 |
| コンポーネントテスト（TC-06〜TC-15） | 全 Green             | 同上                                               |
| 型テスト（TC-16〜TC-18）             | typecheck エラーなし | `pnpm typecheck` で確認                            |
| AC-1〜AC-6 全達成                    | grep による実装確認  | タスク6 の AC 検証チェックで確認                   |

---

## 成果物

| 成果物             | パス                                    | 説明                       |
| ------------------ | --------------------------------------- | -------------------------- |
| 実装記録           | `outputs/phase-5/implementation.md`     | 変更内容・判断記録         |
| TECH-M-02 解決記録 | `outputs/phase-5/tech-m-02-decision.md` | useAuthModeStatus 要否判断 |

---

## 完了条件

- [ ] TECH-M-02（useAuthModeStatus 依存）の要否が判断・記録されている
- [ ] `ApiKeyStatus` に `"check-failed"` が追加されている
- [ ] `useAuthKeyManagement.ts` が新規作成されている
- [ ] `AuthKeySection/index.tsx` がフックを使用し、`AuthKeyStatus` ローカル型が削除されている
- [ ] `ApiKeySettingsPanel.tsx` が委譲ラッパーに変更されている
- [ ] テストファイルが更新・新規作成されている
- [ ] AC-1〜AC-6 が全て達成されている
- [ ] `pnpm typecheck` / `pnpm lint` がエラーなし
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## タスク100%実行確認【必須】

| タスク                                         | 完了 |
| ---------------------------------------------- | ---- |
| タスク0: 実装前確認・TECH-M-02 判断            | [ ]  |
| タスク1: ApiKeyStatus 型拡張                   | [ ]  |
| タスク2: useAuthKeyManagement フック新規作成   | [ ]  |
| タスク3: AuthKeySection フック適用・props 追加 | [ ]  |
| タスク4: ApiKeySettingsPanel 委譲実装          | [ ]  |
| タスク5: テストファイル更新                    | [ ]  |
| タスク6: 全体検証（typecheck / lint / test）   | [ ]  |

## 次のPhase

Phase 6: テスト拡充（[phase-6-test-expansion.md](phase-6-test-expansion.md)）

**Phase 5 完了・全テスト Green 後にのみ Phase 6 へ進むこと。**
