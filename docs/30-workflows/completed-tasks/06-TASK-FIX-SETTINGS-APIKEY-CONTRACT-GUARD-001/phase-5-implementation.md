# Phase 5: 実装

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 5                                                |
| 機能名     | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| タスク名   | 設定画面 apiKey.list 契約防御と providers 正規化 |
| 作成日     | 2026-03-06                                       |
| 更新日     | 2026-03-07                                       |
| ステータス | 未実施                                           |

## 目的

Phase 4 の Red テスト（GAP-TEST-01〜09）を Green にするための実装を行い、GAP-01〜06 の残存カバレッジ gap を充填する。

## 背景

PR #1036/#1038 で基本防御は実装済み。本 Phase では残存 gap に対する追加実装を、テストファーストの原則に従い Red → Green で進める。

## Agent Team 編成

| SubAgent                | 関心ごと                         | 実行モード | Phase 5 の責務                                    |
| ----------------------- | -------------------------------- | ---------- | ------------------------------------------------- |
| SubAgent-Renderer-Guard | Renderer defensive normalization | 並列       | GAP-01〜04 の Renderer 実装                       |
| SubAgent-Contract-IPC   | Main / Preload / Shared contract | 並列       | GAP-05 の Main バリデーション実装                 |
| SubAgent-Test-Fallback  | 異常系テスト / fallback UX       | 並列       | GAP-06 の profileHandlers パターン統一実装        |
| SubAgent-Lead-Sync      | 仕様統合 / aiworkflow 同期       | 直列統合   | 実装の整合性確認と Red → Green 全テスト PASS 確認 |

## 実行タスク

- Task 1: 実装順序の確定
- Task 2: 変更ファイル計画
- Task 3: 実装詳細（Main/Renderer/profile）
- Task 4: Red→Green確認手順

### Task 1: 実装順序（依存関係ベース）

```
Step 1: Main 側バリデーション追加（GAP-05）
  → apiKeyHandlers.ts の handleApiKeyList 関数
  → 他の変更に依存しない独立した変更

Step 2: Renderer 層 normalizeProviders 追加（GAP-01, GAP-03）
  → ApiKeysSection/index.tsx に正規化関数を追加
  → result.data の nullish チェック + 要素フィルタ

Step 3: 空配列 UI フィードバック（GAP-02）
  → ApiKeysSection/index.tsx の render 部に条件分岐追加
  → Step 2 の normalizeProviders に依存

Step 4: Promise rejection ハンドリング（GAP-04）
  → ApiKeysSection/index.tsx の fetchProviders に try-catch 追加
  → Step 2 と独立（並列可能）

Step 5: profileHandlers パターン統一（GAP-06）
  → profileHandlers.ts の identities ?? [] → Array.isArray に変更
  → 他の変更に依存しない独立した変更
```

### Task 2: 変更ファイル計画

| 順序 | ファイル                                                                                          | 変更内容                                          | Gap ID         | 関数/箇所                                                                          |
| ---- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------- |
| 1    | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                                                     | providers 配列バリデーション追加                  | GAP-05         | `handleApiKeyList` — レスポンス生成前に `Array.isArray(result.providers)` チェック |
| 2    | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                         | `normalizeProviders` 正規化関数追加               | GAP-01, GAP-03 | 新規関数 `normalizeProviders(data: unknown): ProviderStatus[]`                     |
| 3    | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                         | 空配列時の UI フィードバック                      | GAP-02         | render 部 — `providers.length === 0` 判定と「未登録」メッセージ表示                |
| 4    | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                         | `fetchProviders` に try-catch 追加                | GAP-04         | `fetchProviders` 関数 — rejection 時にエラー state 遷移                            |
| 5    | `apps/desktop/src/main/ipc/profileHandlers.ts`                                                    | `identities ?? []` → `Array.isArray` パターン統一 | GAP-06         | identities 取得箇所                                                                |
| T1   | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx` | GAP-TEST-01〜07 テスト追加                        | GAP-01〜04     | 既存テストファイルに追加                                                           |
| T2   | Main テストファイル（`apiKeyHandlers.test.ts` / `profileHandlers.test.ts`）                       | GAP-TEST-08〜09 テスト追加                        | GAP-05〜06     | 対応テストファイルに追加                                                           |

### Task 3: 実装詳細

#### Step 1: Main 側バリデーション（`apiKeyHandlers.ts`）

```typescript
// handleApiKeyList 内 — レスポンス生成前
const rawProviders = result.providers;
const providers = Array.isArray(rawProviders) ? rawProviders : [];
return {
  success: true,
  data: {
    providers,
    registeredCount: providers.length,
    totalCount,
  },
};
```

#### Step 2: normalizeProviders 関数（`ApiKeysSection/index.tsx`）

```typescript
/**
 * IPCResponse.data から安全に ProviderStatus 配列を抽出する。
 * P48 準拠: non-null assertion を使わず実行時検証。
 */
function normalizeProviders(data: unknown): ProviderStatus[] {
  if (data == null || typeof data !== "object") return [];
  const raw = (data as Record<string, unknown>).providers;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is ProviderStatus =>
      item != null &&
      typeof (item as Record<string, unknown>).provider === "string" &&
      typeof (item as Record<string, unknown>).status === "string",
  );
}
```

#### Step 3: 空配列 UI フィードバック

```tsx
{
  providers.length === 0 && (
    <p className="text-[var(--text-secondary)] text-sm">
      プロバイダーが登録されていません
    </p>
  );
}
```

#### Step 4: Promise rejection ハンドリング

```typescript
// fetchProviders 内
try {
  const result = await window.electronAPI.apiKey.list();
  const providers = normalizeProviders(result?.data);
  setProviders(providers);
} catch (error) {
  console.error("apiKey.list() failed:", error);
  setError("APIキー情報の取得に失敗しました");
  setProviders([]);
}
```

#### Step 5: profileHandlers パターン統一

```typescript
// Before: identities ?? []
// After:
const identities = Array.isArray(rawIdentities) ? rawIdentities : [];
```

### Task 4: Red → Green 確認手順

```bash
# Step 1: Red テスト確認（全 GAP-TEST が FAIL であること）
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx

# Step 2: 実装適用後の Green 確認
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx

# Step 3: 既存テスト回帰確認（RED-01〜RED-03b が引き続き PASS）
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/ApiKeysSection/__tests__/

# Step 4: Main テスト確認
cd apps/desktop && pnpm vitest run src/main/ipc/

# Step 5: 型チェック
pnpm --filter @repo/desktop exec tsc --noEmit
```

## 参照資料

### 実装・証跡

| 資料名             | パス                                                                                              | 用途                    |
| ------------------ | ------------------------------------------------------------------------------------------------- | ----------------------- |
| Renderer Component | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                         | GAP-01〜04 実装対象     |
| Renderer Tests     | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx` | GAP-TEST-01〜07 追加先  |
| Main IPC           | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                                                     | GAP-05 実装対象         |
| Main IPC           | `apps/desktop/src/main/ipc/profileHandlers.ts`                                                    | GAP-06 実装対象         |
| Shared Types       | `packages/shared/types/api-keys.ts`                                                               | `ProviderStatus` 型参照 |

### システム仕様

| 資料名                 | パス                                                                          | 用途                            |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------------------- |
| ipc-contract-checklist | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | 6段チェック CC-1〜CC-6 準拠確認 |
| security-electron-ipc  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | 4層防御パターン準拠             |
| ui-ux-settings         | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`         | 空配列・エラー表示テキスト      |
| known-pitfalls         | `.claude/rules/06-known-pitfalls.md`                                          | P42/P48 実装準拠                |

### 前提Phase成果物

| 資料名         | パス               | 用途                                               |
| -------------- | ------------------ | -------------------------------------------------- |
| Phase 4 成果物 | `outputs/phase-4/` | GAP-TEST-01〜09 テスト計画、フィクスチャ設計を参照 |

## 実行手順

1. Phase 4 の Red テスト計画とフィクスチャを入力にして、Step 1〜5 の変更順序を確認する。
2. Step 1（Main バリデーション）を実装し、GAP-TEST-08 が Green になることを確認する。
3. Step 2（normalizeProviders）を実装し、GAP-TEST-01〜02, 04〜06 が Green になることを確認する。
4. Step 3（空配列 UI）を実装し、GAP-TEST-03 が Green になることを確認する。
5. Step 4（try-catch）を実装し、GAP-TEST-07 が Green になることを確認する。
6. Step 5（profileHandlers 統一）を実装し、GAP-TEST-09 が Green になることを確認する。
7. 既存 RED-01〜RED-03b テストの回帰確認（全 PASS）。
8. 型チェック（`tsc --noEmit`）PASS を確認する。
9. commit / PR を行わず、ローカル変更とテスト結果だけで Phase 完了条件を満たす。

## 統合テスト連携

- Step 2 の `normalizeProviders` が適用された状態で、既存 RED-01〜RED-03b テストが引き続き PASS することを確認する
- Step 1（Main）と Step 2-4（Renderer）は独立した変更であり、並列実装が可能
- Step 5（profileHandlers）は他の変更と完全に独立しており、並列実装が可能

## 多角的チェック観点

| 観点     | 確認内容                                                                               |
| -------- | -------------------------------------------------------------------------------------- |
| 防御境界 | `normalizeProviders` が唯一の正規化ポイントであり、render 部が配列前提を直接持たないか |
| 契約監査 | Main 側バリデーション（Step 1）と Renderer 側正規化（Step 2）の責務が重複していないか  |
| UX       | 空配列（Step 3）・rejection（Step 4）の fallback テキストが ui-ux-settings.md 準拠か   |
| 回帰耐性 | 既存 RED-01〜RED-03b テスト + 新規 GAP-TEST-01〜09 が全て PASS か                      |
| P48 準拠 | `normalizeProviders` 内で non-null assertion (`!`) を使っていないか                    |

## 成果物

| 成果物           | パス                                         | 説明                                      |
| ---------------- | -------------------------------------------- | ----------------------------------------- |
| 実装順序         | `outputs/phase-5/implementation-sequence.md` | Step 1〜5 の依存関係と並列可能性          |
| 変更ファイル計画 | `outputs/phase-5/changed-files-plan.md`      | 更新対象ファイル・関数名・Gap ID の対応表 |

## 完了条件

- [ ] GAP-TEST-01〜09 が全て Green（PASS）
- [ ] 既存 RED-01〜RED-03b テストが全て PASS（回帰なし）
- [ ] 型チェック（`tsc --noEmit`）が PASS
- [ ] 変更ファイルと GAP-ID が対応表で紐づけられている
- [ ] `normalizeProviders` が P48 準拠（non-null assertion 不使用）
- [ ] commit / PR 非実行ポリシーが守られている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 4 テスト計画の確認
2. Step 1: Main バリデーション実装 + GAP-TEST-08 Green 確認
3. Step 2: normalizeProviders 実装 + GAP-TEST-01〜02, 04〜06 Green 確認
4. Step 3: 空配列 UI フィードバック実装 + GAP-TEST-03 Green 確認
5. Step 4: try-catch 追加 + GAP-TEST-07 Green 確認
6. Step 5: profileHandlers パターン統一 + GAP-TEST-09 Green 確認
7. 既存テスト回帰確認（RED-01〜RED-03b PASS）
8. 型チェック PASS 確認
9. 成果物の作成・配置
10. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次のPhase

Phase 6: テスト拡充
