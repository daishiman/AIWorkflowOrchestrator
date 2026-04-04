---
task_id: TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001
task_name: AuthKeySection と ApiKeySettingsPanel の重複解消
category: リファクタリング
target_feature: Settings AuthKeySection / SkillLifecyclePanel ApiKeySettingsPanel
priority: 中
scale: 中規模
status: pending
source_phase: Phase 12 (TASK-RT-04)
created_date: 2026-04-04
dependencies:
  - TASK-RT-04-API-KEY-MANAGEMENT-UI
issue_number: 1903
---

# AuthKeySection と ApiKeySettingsPanel の重複解消 - タスク指示書

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001                            |
| タスク名     | AuthKeySection と ApiKeySettingsPanel の重複解消                  |
| 分類         | リファクタリング                                                  |
| 対象機能     | Settings AuthKeySection / SkillLifecyclePanel ApiKeySettingsPanel |
| 優先度       | 中                                                                |
| 見積もり規模 | 中規模（4-8時間）                                                 |
| ステータス   | pending                                                           |
| 発見元       | TASK-RT-04-API-KEY-MANAGEMENT-UI Phase 12 分析                    |
| 発見日       | 2026-04-04                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-RT-04（API キー管理 UI）の実装完了後、以下の2つの類似コンポーネントが並存する状態になっている。

| コンポーネント        | 用途                                             | パス                                                                     |
| --------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| `AuthKeySection`      | SettingsView（主導線）での API キー設定          | `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx` |
| `ApiKeySettingsPanel` | SkillLifecyclePanel（補助導線）での API キー設定 | `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`     |

両コンポーネントは同じ IPC チャネル（`auth-key:exists` / `auth-key:set` / `auth-key:validate` / `auth-key:delete`）を呼び出し、ほぼ同じ UI フローを実装している。

**違いの比較表**:

| 観点                          | AuthKeySection                                                             | ApiKeySettingsPanel                                                   |
| ----------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 状態型名                      | `AuthKeyStatus = "saved" \| "env-fallback" \| "not-set" \| "check-failed"` | `ApiKeyStatus = "not_set" \| "validating" \| "configured" \| "error"` |
| 削除ボタン表示                | `saved` のみ表示                                                           | `configured` のみ表示                                                 |
| `onStatusChange` コールバック | なし                                                                       | あり（props）                                                         |
| Store 依存                    | `useAuthModeStatus`                                                        | なし                                                                  |
| `validating` 状態             | `isSubmitting` でカバー                                                    | 独立した `ApiKeyStatus` 状態                                          |

### 1.2 問題点・課題

1. 同じ IPC チャネルを呼び出すロジックが2箇所に分散しており、保守コストが2倍になる
2. 型定義（`AuthKeyStatus` / `ApiKeyStatus`）が `packages/shared` と `components` に分散している
3. IPC 仕様変更（例: `auth-key:exists` のレスポンス拡張）が発生した場合、2コンポーネントを同時に更新する必要がある
4. ユニットテストが重複している（`AuthKeySection.test.tsx` と `ApiKeySettingsPanel.test.tsx` の両方に類似テストがある）

### 1.3 放置した場合の影響

- IPC 仕様の変更（UT-IMP-AUTHKEY-EXISTS-SOURCE-FIELD-001 等）の対応コストが2倍になる
- 両コンポーネントの UI 挙動が乖離し、ユーザー体験の一貫性が失われる
- テストカバレッジが見かけ上高くなるが、実質的に重複したテストが増え続ける

---

## 2. 何を達成するか（What）

### 2.1 目的

`AuthKeySection` と `ApiKeySettingsPanel` の共通ロジックを抽出し、単一の再利用可能なコンポーネント（または hooks）に統合する。

### 2.2 最終ゴール

```typescript
// 共通フックとして抽出（案1）
function useAuthKeyManagement(): {
  status: ApiKeyStatus;
  keySource: "saved" | "env-fallback" | null;
  inputValue: string;
  setInputValue: (v: string) => void;
  isSubmitting: boolean;
  apiError: string | null;
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
};

// SettingsView 主導線（AuthKeySection 代替）
<AuthKeyPanel variant="settings" />

// SkillLifecyclePanel 補助導線（ApiKeySettingsPanel 代替）
<AuthKeyPanel variant="compact" onStatusChange={...} />
```

または:

```typescript
// 共通コンポーネントに統合（案2）
// SettingsView 主導線
<AuthKeySection />  // 変更なし

// SkillLifecyclePanel 補助導線
import { AuthKeySection } from "../../components/settings/AuthKeySection";
// ApiKeySettingsPanel を AuthKeySection でリプレース
```

### 2.3 スコープ

#### 含むもの

- `AuthKeySection` と `ApiKeySettingsPanel` の差分分析と統合方針決定
- 共通ロジックの `useAuthKeyManagement` カスタムフックへの抽出
- `ApiKeySettingsPanel` を廃止（または `AuthKeySection` への委譲に変更）
- `ApiKeyStatus` 型の `packages/shared` への集約（`AuthKeyStatus` との統一）
- 重複テストのクリーンアップ

#### 含まないもの

- IPC ハンドラの変更
- SettingsView / SkillLifecyclePanel の構造変更
- 既存の機能仕様変更

### 2.4 成果物

- `useAuthKeyManagement` カスタムフック（新規）
- 統合後の `AuthKeySection`（更新）
- `ApiKeySettingsPanel` の廃止または委譲（更新/削除）
- `ApiKeyStatus` 型の統一
- 重複テストの削除・統合

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-RT-04-API-KEY-MANAGEMENT-UI が完了していること（完了済み）

### 3.2 依存タスク

- UT-IMP-AUTHKEY-EXISTS-SOURCE-FIELD-001（source フィールド型定義変更を含む）
  - 先に完了している場合は型定義の統合が容易になる

### 3.3 必要な知識

- React カスタムフックパターン（`useXxx` 命名規則）
- `packages/shared/src/types/skillCreator.ts` の型定義（`ApiKeyStatus` が定義済み）
- P32（型定義の2箇所同時更新必須）
- P31（Zustand 個別セレクタパターン）

### 3.4 推奨アプローチ

**ステップ1: 差分分析**

```bash
diff <(cat apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx) \
     <(cat apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx)
```

**ステップ2: 共通フック抽出**

```typescript
// apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts
export function useAuthKeyManagement(options?: {
  onStatusChange?: (status: ApiKeyStatus) => void;
}) {
  // AuthKeySection と ApiKeySettingsPanel の共通ロジックを統合
}
```

**ステップ3: 型統一**

現在の状況:

- `AuthKeyStatus = "saved" | "env-fallback" | "not-set" | "check-failed"` (AuthKeySection ローカル)
- `ApiKeyStatus = "not_set" | "validating" | "configured" | "error"` (packages/shared)

`ApiKeyStatus`（packages/shared）を正規の型として採用し、`AuthKeySection` の `AuthKeyStatus` を廃止する（または `ApiKeyStatus` にマップする）。

**ステップ4: `ApiKeySettingsPanel` を `AuthKeySection` に委譲**

```typescript
// ApiKeySettingsPanel.tsx (簡略化後)
import { AuthKeySection } from "../settings/AuthKeySection";

export function ApiKeySettingsPanel({ onStatusChange }: Props) {
  return <AuthKeySection onStatusChange={onStatusChange} />;
}
```

---

## 4. 苦戦箇所と解決のヒント

### 4.1 TASK-RT-04 での実装経験から得られた知見

| 課題                                                               | 原因                                                                                     | 解決のヒント                                                                                                                                                                  |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthKeyExistsResponse.source` が型定義上 optional                 | `AuthKeyExistsResponse` に `source?` で定義されており、常に返すが型が保証されない        | `source` を必須フィールドにするか、呼び出し側で optional チェックを追加する。TASK-RT-04 では呼び出し側（`ApiKeySettingsPanel.tsx` L57-61）でガードを追加することで対処        |
| esbuild バージョン mismatch によるテスト実行エラー（worktree環境） | worktree が main repo の node_modules を共有するが platform バイナリが不一致             | worktree でのテスト実行は main repo 側で行う（`task-fix-worktree-native-binary-guard-001` 参照）                                                                              |
| Electron IPC の `withValidation` の適切な適用                      | `BrowserWindow.fromWebContents` をモックしないと withValidation のフレーム検証で失敗する | テストの `beforeEach` で `BrowserWindow.fromWebContents` を `mockWindow` 返すようモック設定する                                                                               |
| `ApiKeyStatus` 4状態遷移テストのパターン                           | `not_set → validating → configured` の遷移で非同期タイミングが難しい                     | `vi.fn().mockResolvedValue()` で各 IPC 呼び出しをモックし、`await handler(event, ...)` で直接ハンドラを実行する（`authKeyHandlers.runtime-sync.test.ts` の S28 パターン参照） |
| 2コンポーネント並存による型不整合                                  | `AuthKeyStatus`（AuthKeySection ローカル）と `ApiKeyStatus`（shared）が重複定義          | `packages/shared` の `ApiKeyStatus` を正規型として採用し、`AuthKeySection` のローカル型を廃止する                                                                             |

### 4.2 参照すべき仕様書

| 仕様書                     | 内容                                                                       |
| -------------------------- | -------------------------------------------------------------------------- |
| `api-ipc-auth.md`          | `auth-key:*` IPC チャネル契約                                              |
| `arch-ui-components.md`    | AuthKeySection 4状態判定ロジック                                           |
| `arch-state-management.md` | Zustand Store 設計（P31 個別セレクタパターン）                             |
| `06-known-pitfalls.md`     | P31（re-render過多）、P32（型定義2箇所更新）、P42（.trim()バリデーション） |
| `lessons-learned.md`       | TASK-RT-04 苦戦箇所                                                        |

---

## 5. 受入条件

- [ ] `ApiKeySettingsPanel` の IPC 呼び出しロジックが `AuthKeySection`（または共通フック）に統合されている
- [ ] `ApiKeyStatus` 型が `packages/shared` に唯一定義され、両コンポーネントが共有している
- [ ] `AuthKeySection` が `onStatusChange` props を受け取れるよう拡張されている（SkillLifecyclePanel 補助導線対応）
- [ ] 既存テスト（`AuthKeySection.test.tsx` + `ApiKeySettingsPanel.test.tsx`）が全 PASS
- [ ] 重複するテストがクリーンアップされている
- [ ] `pnpm lint` / `pnpm typecheck` がエラーなし

---

## 6. 参照資料

- 仕様書: `docs/30-workflows/completed-tasks/task-rt-04-api-key-management-ui/`
- 関連タスク: TASK-RT-04-API-KEY-MANAGEMENT-UI（完了）
- 依存タスク: UT-IMP-AUTHKEY-EXISTS-SOURCE-FIELD-001（未実施）
- 実装ファイル:
  - `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`
  - `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`
  - `packages/shared/src/types/skillCreator.ts`（`ApiKeyStatus` 定義元）
