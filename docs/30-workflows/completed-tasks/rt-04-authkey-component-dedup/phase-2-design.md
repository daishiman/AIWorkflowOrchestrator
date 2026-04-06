# Phase 2: 設計

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 2                             |
| 機能名 | rt-04-authkey-component-dedup |
| 作成日 | 2026-04-06                    |

## 目的

`useAuthKeyManagement` フックの API 設計・型統一戦略・委譲パターン・テスト設計の方針を確定する。

---

## 実行タスク

### タスク1: concern 分解と topology 設計

**concern 数: 3（セクション分割で対応）**

| concern                   | 責務                                          | 対象ファイル                                                      |
| ------------------------- | --------------------------------------------- | ----------------------------------------------------------------- |
| **A: フック共通化**       | IPC 呼び出し・状態管理ロジックの抽出          | `apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts`（新規） |
| **B: 型統一**             | ApiKeyStatus の一元化・AuthKeyStatus 廃止     | `packages/shared/src/types/skillCreator.ts`（既存に追記）         |
| **C: コンポーネント統合** | AuthKeySection 拡張・ApiKeySettingsPanel 委譲 | 既存2ファイルの変更                                               |

---

### タスク2: useAuthKeyManagement フック設計

#### フックインターフェース

```typescript
// apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts

export interface UseAuthKeyManagementReturn {
  // 状態
  status: ApiKeyStatus;
  keySource: "saved" | "env-fallback" | null;
  inputValue: string;
  isSubmitting: boolean;
  validationError: string | null;
  apiError: string | null;

  // アクション
  setInputValue: (value: string) => void;
  handleSave: () => Promise<boolean>;
  handleDelete: () => Promise<boolean>;
  refresh: () => Promise<boolean>;
}

export interface UseAuthKeyManagementOptions {
  onStatusChange?: (status: ApiKeyStatus) => void;
}

export function useAuthKeyManagement(
  options?: UseAuthKeyManagementOptions,
): UseAuthKeyManagementReturn;
```

#### 状態遷移設計

```
初期化
  └─ authKey.exists() 呼び出し
       ├─ exists=true, source=saved    → status="configured", keySource="saved"
       ├─ exists=true, source=env-fallback → status="configured", keySource="env-fallback"
       └─ exists=false               → status="not_set", keySource=null
       └─ electronAPI 未提供 / exists() 例外 → status="check-failed", apiError 設定

保存フロー
  └─ validateApiKey(inputValue) → エラーあり → validationError 設定（return）
  └─ status="validating"
  └─ authKey.set(key)
       ├─ success=true  → status="configured", keySource="saved", inputValue=""
       └─ success=false → status="error", apiError 設定

削除フロー
  └─ authKey.delete()
       ├─ success=true  → authKey.exists() 再確認 → status 更新
       └─ success=false → status="error", apiError 設定
       └─ delete 未提供 / 例外 → status="error", apiError 設定
       └─ delete 後の exists() 再確認に失敗 → status="check-failed", apiError 設定
```

#### バリデーション関数（フック内に統合）

```typescript
// ApiKeySettingsPanel から移植・拡張
function validateApiKey(key: string): string | null {
  const trimmed = key.trim();
  if (trimmed === "") return "APIキーを入力してください";
  if (trimmed.length > 200) return "APIキーの長さが不正です";
  if (!/^sk-/.test(trimmed)) return "APIキーの形式が正しくありません";
  return null;
}
```

---

### タスク3: 型統一設計（concern B）

#### 現状の問題

| 型名            | 定義場所                                    | 値セット                                      |
| --------------- | ------------------------------------------- | --------------------------------------------- |
| `AuthKeyStatus` | `AuthKeySection/index.tsx`（ローカル）      | saved / env-fallback / not-set / check-failed |
| `ApiKeyStatus`  | `packages/shared/src/types/skillCreator.ts` | not_set / validating / configured / error     |

#### 統一方針

**`ApiKeyStatus` を拡張して `packages/shared` に一元化する。**

```typescript
// packages/shared/src/types/skillCreator.ts に追加（または authKey.ts を新規作成）
export type ApiKeyStatus =
  | "not_set" // 未設定
  | "validating" // 検証中
  | "configured" // 設定済み
  | "error" // エラー
  | "check-failed"; // 状態確認失敗（AuthKeySection 互換）
```

**移行マッピング（AuthKeyStatus → ApiKeyStatus）:**

| AuthKeyStatus（廃止） | ApiKeyStatus（統一後） | 備考                            |
| --------------------- | ---------------------- | ------------------------------- |
| "saved"               | "configured"           | keySource="saved" で補完        |
| "env-fallback"        | "configured"           | keySource="env-fallback" で補完 |
| "not-set"             | "not_set"              | 値名の正規化                    |
| "check-failed"        | "check-failed"         | 型に追加                        |

> **設計判断**: AuthKeySection が保持していた「saved」と「env-fallback」の区別は `keySource` 状態で継続管理。`ApiKeyStatus` は大分類（configured/not_set/error 等）のみを担う。

---

### タスク4: コンポーネント統合設計（concern C）

#### AuthKeySection の拡張

```typescript
// 変更前: props なし
export const AuthKeySection: React.FC = () => { ... }

// 変更後: onStatusChange を追加
interface AuthKeySectionProps {
  onStatusChange?: (status: ApiKeyStatus) => void;
}
export const AuthKeySection: React.FC<AuthKeySectionProps> = ({
  onStatusChange,
}) => {
  const { status, ... } = useAuthKeyManagement({ onStatusChange });
  // ...
};
```

#### ApiKeySettingsPanel の委譲

**Option A（委譲パターン - 推奨）**: `ApiKeySettingsPanel` を `AuthKeySection` のラッパーに変更

```typescript
// apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx
export function ApiKeySettingsPanel({ onStatusChange }: ApiKeySettingsPanelProps) {
  return <AuthKeySection onStatusChange={onStatusChange} />;
}
```

**Option B（廃止パターン）**: `ApiKeySettingsPanel` を削除し、呼び出し元を `AuthKeySection` に直接変更

> **推奨: Option A（委譲）**
> 廃止は `SkillLifecyclePanel` 等の呼び出し元の変更を伴いスコープが広がるため、まず委譲に変更し、廃止は未タスクとして積む。

---

### タスク5: IPC 4層整合性チェック

新規 IPC チャンネルは追加しないため、既存4層の整合確認のみ：

| 層                | 確認内容                                                | 状態 |
| ----------------- | ------------------------------------------------------- | ---- |
| 1. 定数定義       | `IPC_CHANNELS` に authKey チャンネルが存在する          | 既存 |
| 2. ホワイトリスト | Preload の allowedChannels に登録済み                   | 既存 |
| 3. ハンドラ登録   | `ipcMain.handle` で authKey.{exists,set,delete} 処理中  | 既存 |
| 4. Preload API    | `window.electronAPI.authKey` で Renderer から呼び出せる | 既存 |

---

### タスク6: 型互換性検証テーブル（Phase 3 で確認）

| 対象                            | 変更前型        | 変更後型       | 互換性         |
| ------------------------------- | --------------- | -------------- | -------------- |
| `AuthKeySection` 内 status      | `AuthKeyStatus` | `ApiKeyStatus` | TBD（Phase 3） |
| `ApiKeySettingsPanel` の status | `ApiKeyStatus`  | `ApiKeyStatus` | ✅ 変更なし    |
| `onStatusChange` コールバック   | なし            | `ApiKeyStatus` | TBD（Phase 3） |

---

### タスク7: ファイル変更計画

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

---

### タスク8: SubAgent lane 設計（Phase 4 以降）

**実行パターン（3 lane 以下）:**

| Lane | 内容                                | 実行形態 |
| ---- | ----------------------------------- | -------- |
| 1    | フックテスト作成（Phase 4）         | seq      |
| 2    | コンポーネントテスト更新（Phase 4） | seq      |
| 3    | 型テスト作成（Phase 4）             | seq      |

Phase 5 以降は実装完了後に検証 lane を直列で実行。

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                     | 内容                |
| ---------- | ------------------------------------------------------------------------ | ------------------- |
| IPC 仕様   | `.claude/skills/aiworkflow-requirements/references/api-ipc-contracts.md` | IPC チャンネル定義  |
| 型定義仕様 | `packages/shared/src/types/skillCreator.ts`                              | 共有型 ApiKeyStatus |

---

## 成果物

| 成果物 | パス                        | 説明                |
| ------ | --------------------------- | ------------------- |
| 設計書 | `outputs/phase-2/design.md` | 本 Phase の実行記録 |

---

## 完了条件

- [x] concern 分解（A: フック / B: 型 / C: コンポーネント）が完了している
- [x] `useAuthKeyManagement` フックのインターフェースが定義されている
- [x] 状態遷移設計が記述されている
- [x] 型統一方針（ApiKeyStatus 拡張）が確定している
- [x] AuthKeyStatus → ApiKeyStatus の移行マッピングが定義されている
- [x] ApiKeySettingsPanel の委譲パターン（Option A）が選択されている
- [x] IPC 4層整合確認済み（新規 IPC なし）
- [x] ファイル変更計画（新規/修正）が明示されている
- [x] 型互換性検証テーブルが下書き済み（Phase 3 で確認）
- [x] **本 Phase 内の全タスクを 100% 実行完了**

## タスク100%実行確認【必須】

| タスク                              | 完了 |
| ----------------------------------- | ---- |
| タスク1: concern 分解・topology     | ✅   |
| タスク2: フックインターフェース設計 | ✅   |
| タスク3: 型統一設計                 | ✅   |
| タスク4: コンポーネント統合設計     | ✅   |
| タスク5: IPC 4層整合確認            | ✅   |
| タスク6: 型互換性検証テーブル       | ✅   |
| タスク7: ファイル変更計画           | ✅   |
| タスク8: SubAgent lane 設計         | ✅   |

## 次のPhase

Phase 3: 設計レビューゲート（[phase-3-design-review.md](phase-3-design-review.md)）

**Phase 2 完了後にのみ Phase 3 へ進むこと。**
