# Phase 5: 実装

## メタ情報

| 項目          | 内容                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 5                                                                                                                 |
| 機能名        | LLM設定永続化修正 (TASK-FIX-LLM-CONFIG-PERSISTENCE)                                                               |
| 作成日        | 2026-03-20                                                                                                        |
| 担当          | -                                                                                                                 |
| ステータス    | 未着手                                                                                                            |
| 前Phase成果物 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-4-test-creation.md` |

## 目的

Phase 4 で作成したテスト（Red状態）をGreen（全PASS）にするための実装を行う。4つの修正箇所（partialize拡張・migrate追加・バリデーション関数・起動時同期）をTDDサイクルに従って実装する。

## 実行タスク

### タスク0: 実装前の現状確認

```bash
# 現在のpartialize関数の確認
grep -n "partialize" apps/desktop/src/renderer/store/index.ts

# 現在のpersist version確認
grep -n "version" apps/desktop/src/renderer/store/index.ts

# llmSliceの現状確認
grep -n "syncSelectedConfigToMain\|fetchProviders\|selectedProviderId\|selectedModelId" \
  apps/desktop/src/renderer/store/slices/llmSlice.ts

# validateAndSyncPersistedConfigが既に実装済みか確認（P50対策）
grep -rn "validateAndSyncPersistedConfig" apps/desktop/src/renderer/
```

### タスク1: persist partialize関数の拡張

**対象ファイル**: `apps/desktop/src/renderer/store/index.ts`

**修正内容**: partialize関数に `selectedProviderId` と `selectedModelId` を追加する。

```typescript
// 修正前
partialize: (state) => ({
  currentView: state.currentView,
  userProfile: state.userProfile,
  autoSyncEnabled: state.autoSyncEnabled,
}),

// 修正後
partialize: (state) => ({
  currentView: state.currentView,
  userProfile: state.userProfile,
  autoSyncEnabled: state.autoSyncEnabled,
  selectedProviderId: state.selectedProviderId,
  selectedModelId: state.selectedModelId,
}),
```

**セキュリティチェック**:

- `apiKey`, `token`, `secret`, `password` が含まれていないこと
- `providers`（動的データ）が含まれていないこと

### タスク2: persist version v1→v2 更新とmigrate関数追加

**対象ファイル**: `apps/desktop/src/renderer/store/index.ts`

**修正内容**: `version` を更新し、`migrate` 関数を追加する。

```typescript
// persist設定に追加
{
  name: "aiworkflow-store",
  version: 2,  // v1 → v2 に更新
  migrate: (persistedState: unknown, version: number) => {
    if (version === 0 || version === 1) {
      // v1 → v2: selectedProviderId, selectedModelId を追加（デフォルトnull）
      return {
        ...(persistedState != null && typeof persistedState === "object"
          ? persistedState
          : {}),
        selectedProviderId: null,
        selectedModelId: null,
      };
    }
    return persistedState;
  },
  partialize: (state) => ({
    // ... タスク1の修正内容
  }),
}
```

**注意事項**:

- `persistedState` が null/undefined の場合にクラッシュしないよう安全なスプレッドを使用する（T2-5/T2-6対策）
- `version` は既存の値を確認してから更新する（タスク0で確認）

### タスク3: validateAndSyncPersistedConfig 関数の実装

**対象ファイル**: `apps/desktop/src/renderer/store/slices/llmSlice.ts`

**実装内容**: Phase 2 設計の疑似コードを実際のコードに変換する。

```typescript
// llmSlice.ts にエクスポート関数として追加（テストからインポート可能にする）
export function validateAndSyncPersistedConfig(
  persistedProviderId: string | null,
  persistedModelId: string | null,
  availableProviders: Provider[],
): { providerId: string | null; modelId: string | null } {
  // providers未取得（空配列）の場合は判断保留 → 既存値を保持
  if (availableProviders.length === 0) {
    return { providerId: persistedProviderId, modelId: persistedModelId };
  }

  if (persistedProviderId === null) {
    return { providerId: null, modelId: null };
  }

  const providerExists = availableProviders.some(
    (p) => p.id === persistedProviderId,
  );

  if (!providerExists) {
    // P62対策: 無効なProviderIDはnullクリア（DEFAULT_CONFIGへのfallback禁止）
    return { providerId: null, modelId: null };
  }

  const provider = availableProviders.find((p) => p.id === persistedProviderId);
  const modelExists = provider?.models.some((m) => m.id === persistedModelId);

  return {
    providerId: persistedProviderId,
    modelId: modelExists ? persistedModelId : null,
  };
}
```

**Provider型の確認**:

```bash
# Provider型の定義を確認してから実装する
grep -n "interface Provider\|type Provider" apps/desktop/src/renderer/store/slices/llmSlice.ts
grep -rn "interface Provider\|type Provider" packages/shared/src/
```

### タスク4: syncSelectedConfigToMain() の起動時呼び出し実装

**対象ファイル**: `apps/desktop/src/renderer/store/slices/llmSlice.ts`

**実装内容**: `fetchProviders` アクション完了後にバリデーションと同期を実行する。

```typescript
// fetchProviders アクションの完了後（または fetchProviders 内部）に追加
// Zustand hydrate完了後に実行されることを保証する

// fetchProviders の実装を確認してから、完了後のコールバックを追加する
// 実装パターンは既存の fetchProviders の処理フローに合わせる
```

**実装前の確認コマンド**:

```bash
# fetchProvidersの現在の実装を確認
grep -n "fetchProviders\|syncSelectedConfigToMain" \
  apps/desktop/src/renderer/store/slices/llmSlice.ts

# syncSelectedConfigToMainの現在の実装を確認
grep -n "syncSelectedConfigToMain" apps/desktop/src/renderer/store/slices/llmSlice.ts
```

**実装フロー**:

1. fetchProviders 完了時に `validateAndSyncPersistedConfig` を呼び出す
2. 有効な結果が返った場合（providerId !== null）のみ `syncSelectedConfigToMain()` を呼ぶ
3. 無効な場合はストアの selectedProviderId/selectedModelId を null にクリアする

### タスク5: テスト実行でGreen確認

```bash
# apps/desktopディレクトリから実行（P40対策）
cd apps/desktop

# partialize テスト
pnpm vitest run src/renderer/store/__tests__/persist-partialize.test.ts

# migration テスト
pnpm vitest run src/renderer/store/__tests__/persist-migration.test.ts

# バリデーションテスト
pnpm vitest run src/renderer/store/slices/__tests__/llmSlice-validation.test.ts

# 起動時同期テスト
pnpm vitest run src/renderer/store/slices/__tests__/llmSlice-sync.test.ts

# 既存テストへの影響確認（リグレッション防止）
pnpm vitest run src/renderer/store/
```

## 参照資料

### システム仕様

| 資料名              | パス                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------- |
| Zustand persist設計 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |

### 前Phase成果物

| 資料名             | パス                                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計       | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-2-design.md`        |
| Phase 4 テスト設計 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-4-test-creation.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                              | 対策                                                       |
| ---------- | --------------------------------- | ---------------------------------------------------------- |
| P50        | 既実装防御の発見による Phase 転換 | タスク0のP50チェックを必ず実施する                         |
| P62        | DEFAULT_CONFIG への暗黙 fallback  | validateAndSyncPersistedConfigでnullクリア（fallback禁止） |
| P31        | Zustand Store Hooks 無限ループ    | 個別セレクタを使用、合成Hookへの依存を避ける               |
| P40        | テスト実行ディレクトリ依存        | `apps/desktop` ディレクトリからテストを実行する            |

## 実行手順

1. **タスク0の実施**: P50チェックを行い、既実装箇所を確認する
2. **タスク1の実施**: partialize関数を拡張する
3. **タスク1後のテスト実行**: T1テストがGreenになることを確認する
4. **タスク2の実施**: persist versionとmigrate関数を追加する
5. **タスク2後のテスト実行**: T2テストがGreenになることを確認する
6. **タスク3の実施**: validateAndSyncPersistedConfig関数を実装する
7. **タスク3後のテスト実行**: T3テストがGreenになることを確認する
8. **タスク4の実施**: 起動時同期呼び出しを実装する
9. **タスク4後のテスト実行**: T4テストがGreenになることを確認する
10. **リグレッション確認**: 既存のstore関連テストが全PASS であることを確認する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                                               | 説明                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| Phase 5 仕様書（本ファイル） | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-5-implementation.md` | 実装手順書                     |
| store/index.ts 修正          | `apps/desktop/src/renderer/store/index.ts`                                                                         | partialize拡張・migrate追加    |
| llmSlice.ts 修正             | `apps/desktop/src/renderer/store/slices/llmSlice.ts`                                                               | バリデーション関数・起動時同期 |

## 完了条件

- [ ] タスク0のP50チェックを実施し、既実装状況を確認した
- [ ] partialize関数に `selectedProviderId` と `selectedModelId` が追加された
- [ ] persist version が v2 に更新され、migrate関数が追加された
- [ ] `validateAndSyncPersistedConfig` 関数が実装され、P62対策（nullクリア）が含まれている
- [ ] 起動時（providers fetch完了後）に `syncSelectedConfigToMain()` が呼ばれる実装が追加された
- [ ] T1-1 〜 T4-5 の全テストがGreen（PASS）になった
- [ ] 既存のstore関連テストがすべてPASSのままである（リグレッションなし）
- [ ] セキュリティチェック: partializeに機密情報が含まれていないことを確認した

## 次Phase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）
