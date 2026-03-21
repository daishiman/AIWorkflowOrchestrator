# Phase 2: 設計

## メタ情報

| 項目          | 内容                                                                           |
| ------------- | ------------------------------------------------------------------------------ |
| Phase番号     | 2                                                                              |
| 機能名        | LLM設定永続化修正 (TASK-FIX-LLM-CONFIG-PERSISTENCE)                            |
| 作成日        | 2026-03-20                                                                     |
| 担当          | -                                                                              |
| ステータス    | completed                                                                      |
| 前Phase成果物 | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-1-requirements.md` |

## 目的

Phase 1 で定義した要件を満たす実装設計を行う。persist partialize関数の拡張、persist versionマイグレーション戦略、起動時バリデーションと同期タイミング、P62対策のフォールバック設計を確定する。

## 実行タスク

### タスク1: persist partialize関数の拡張設計

**現状** (`apps/desktop/src/renderer/store/index.ts` L157-168):

```typescript
// 現在のpersist対象フィールド
partialize: (state) => ({
  currentView: state.currentView,
  userProfile: state.userProfile,
  autoSyncEnabled: state.autoSyncEnabled,
  // selectedProviderId, selectedModelId が含まれていない
});
```

**修正後**:

```typescript
partialize: (state) => ({
  currentView: state.currentView,
  userProfile: state.userProfile,
  autoSyncEnabled: state.autoSyncEnabled,
  selectedProviderId: state.selectedProviderId,
  selectedModelId: state.selectedModelId,
});
```

**設計上の注意事項**:

- `selectedProviderId` と `selectedModelId` は文字列型（または null）であること
- APIキー・認証情報・トークン類は含めない（セキュリティ要件）
- 他のLLMスライス状態（`providers`, `isLoading`等）は含めない（動的データのため）

### タスク2: persist versionマイグレーション戦略

既存のpersist storeはv1として動作している。`selectedProviderId` / `selectedModelId` 追加に伴いv2へ更新する。

**マイグレーション設計**:

```typescript
// Zustand persist の migrate オプションを使用
{
  name: "aiworkflow-store",
  version: 2,
  migrate: (persistedState: unknown, version: number) => {
    if (version === 0 || version === 1) {
      // v1 → v2: selectedProviderId, selectedModelId を追加（デフォルトnull）
      return {
        ...(persistedState as object),
        selectedProviderId: null,
        selectedModelId: null,
      };
    }
    return persistedState;
  },
}
```

**考慮点**:

- 既存ユーザーの`currentView`, `userProfile`, `autoSyncEnabled`は引き継がれる
- 初回起動時（v1データなし）は自然にnullとなる
- migrate関数が存在しない場合、Zustandはstore全体をリセットするため必須

### タスク3: 起動時バリデーション設計

永続化されたProviderIDが現在利用可能なプロバイダ一覧に存在しない場合のバリデーションを設計する。

**バリデーションロジック** (`llmSlice.ts` に追加):

```typescript
// アプリ起動時（providers fetch完了後）に呼び出す
function validateAndSyncPersistedConfig(
  persistedProviderId: string | null,
  persistedModelId: string | null,
  availableProviders: Provider[],
): { providerId: string | null; modelId: string | null } {
  if (persistedProviderId === null) {
    return { providerId: null, modelId: null };
  }

  const providerExists = availableProviders.some(
    (p) => p.id === persistedProviderId,
  );

  if (!providerExists) {
    // P62対策: 無効なProviderIDはnullにクリア（fallbackしない）
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

**P62対策の明示**:

- 無効なProviderIDが永続化されていた場合: `DEFAULT_CONFIG`へのfallbackは行わず、nullクリアする
- nullクリア後、UIはSettings画面でProvider/Modelを再選択するよう促す

### タスク4: syncSelectedConfigToMain() の呼び出しタイミング設計

**同期フロー**:

```
アプリ起動
  ↓
Zustand hydrate（persist storage読み込み）
  ↓
providers fetch完了（IPC経由）
  ↓
validateAndSyncPersistedConfig() 実行
  ↓
有効な場合: syncSelectedConfigToMain() 呼び出し
無効な場合: store を null クリア（同期不要）
  ↓
Main Process の currentConfig 更新完了
```

**タイミング制約**:

- Zustand hydrate完了前に `syncSelectedConfigToMain()` を呼ぶと古い値（null）が同期される
- providers fetch完了後にバリデーションを行うため、3秒以内の同期完了を保証する

**呼び出し箇所**: `llmSlice.ts` の `fetchProviders` アクション完了後のコールバックまたは `useEffect` で実装

### タスク5: インターフェース定義

```typescript
// 永続化対象フィールドの型定義（store/index.tsのPartializeの型に追加）
type PersistedState = {
  currentView: string;
  userProfile: UserProfile | null;
  autoSyncEnabled: boolean;
  selectedProviderId: string | null; // 追加
  selectedModelId: string | null; // 追加
};
```

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名              | パス                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------- |
| Zustand persist設計 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                |
| セキュリティ考慮    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |

### 関連ソースファイル

| ファイル            | パス                                                 |
| ------------------- | ---------------------------------------------------- |
| Store index         | `apps/desktop/src/renderer/store/index.ts`           |
| LLM Slice           | `apps/desktop/src/renderer/store/slices/llmSlice.ts` |
| LLM Config Provider | `apps/desktop/src/main/ipc/llmConfigProvider.ts`     |

### 既知の落とし穴

| 落とし穴ID | 説明                                         | 対策                                         |
| ---------- | -------------------------------------------- | -------------------------------------------- |
| P62        | DEFAULT_CONFIGへの暗黙fallback               | 無効なProviderIDはnullクリア（fallback禁止） |
| P31        | Zustand Store Hooks無限ループ                | 個別セレクタを使用、合成Hookの乱用禁止       |
| P48        | useShallow未適用による派生セレクタ無限ループ | 配列を返すセレクタにはuseShallowを適用       |

## 実行手順

1. **既存コードの精査**: `store/index.ts` と `llmSlice.ts` の現状を確認する
2. **partialize関数の拡張設計を確定**: タスク1の設計をレビューし、型定義との整合性を確認する
3. **migrate関数の設計を確定**: 既存persistのversionを確認し、適切なバージョン番号を決定する
4. **バリデーションロジックの設計を確定**: タスク3の疑似コードをレビューし、実際のProvider/Model型定義と整合させる
5. **同期タイミングの設計を確定**: タスク4のフローが既存のfetchProvidersフローと矛盾しないか確認する
6. **設計ドキュメントのフォーマット確認**: Phase 3レビューに備えて設計書を整理する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                     | 説明     |
| ---------------------------- | ------------------------------------------------------------------------ | -------- |
| Phase 2 仕様書（本ファイル） | `docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-2-design.md` | 設計詳細 |

## 完了条件

- [ ] persist partialize関数の拡張設計が記述されている
- [ ] persist versionマイグレーション戦略（v1→v2）が設計されている
- [ ] 起動時バリデーションロジックが疑似コードで記述されている
- [ ] P62対策（無効なProviderIDのnullクリア）が明示されている
- [ ] syncSelectedConfigToMain()の呼び出しタイミングがフロー図で示されている
- [ ] APIキー・認証情報がpersist対象に含まれないことが設計で保証されている
- [ ] インターフェース定義（PersistedState型）が記述されている

## 次Phase

Phase 3: 設計レビュー（`phase-3-design-review.md`）
