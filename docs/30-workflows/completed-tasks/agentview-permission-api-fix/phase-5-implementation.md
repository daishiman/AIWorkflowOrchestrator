# Phase 5: 実装

## メタ情報

| 項目      | 内容                                          |
| --------- | --------------------------------------------- |
| Phase     | 5                                             |
| 名称      | 実装                                          |
| 前提Phase | Phase 4                                       |
| 成果物    | 修正済みの `AgentView/index.tsx`、テスト PASS |

## 目的

Phase 2 の設計に従い、`AgentView/index.tsx` の3箇所を修正して、Permission API のランタイムエラーを解消する。

## 実行タスク

- タスク 5-1: ローカル `PermissionApi` 型と `getPermissionApi()` を正規化する
- タスク 5-2: `loadPermissions()` を `getAllowedTools()` 基準へ修正する
- タスク 5-3: `handlePermissionModeChange()` の IPC 呼び出しを削除する
- タスク 5-4: `handleResetRemembered()` を `clearAll()` 基準へ修正する
- タスク 5-5: 旧 API 参照の残存を確認する
- タスク 5-6: テストと型チェックを実行する

### タスク 5-1: 箇所A を修正する（型定義 + getPermissionApi）

**対象ファイル**: `apps/desktop/src/renderer/views/AgentView/index.tsx`

**削除するコード** (77-82行):

```typescript
type PermissionApi = {
  getMode?: () => Promise<string>;
  getRemembered?: () => Promise<unknown[]>;
  setMode?: (mode: AgentPermissionMode) => Promise<unknown>;
  clearRemembered?: () => Promise<unknown>;
};
```

**変更するコード** (84-90行):

Before:

```typescript
function getPermissionApi(): PermissionApi | undefined {
  return (
    window.electronAPI as typeof window.electronAPI & {
      permissions?: PermissionApi;
    }
  ).permissions;
}
```

After:

```typescript
function getPermissionApi(): typeof window.permissionAPI | undefined {
  try {
    return window.permissionAPI;
  } catch {
    return undefined;
  }
}
```

**確認コマンド**:

```bash
grep -n "PermissionApi\|getPermissionApi" apps/desktop/src/renderer/views/AgentView/index.tsx
```

出力に `type PermissionApi` が含まれていないことを確認する。

### タスク 5-2: 箇所B を修正する（loadPermissions）

**対象ファイル**: `apps/desktop/src/renderer/views/AgentView/index.tsx`

**変更するコード** (260-293行の loadPermissions 関数内部):

Before:

```typescript
const loadPermissions = async () => {
  const permissionsApi = getPermissionApi();
  if (!permissionsApi) {
    return;
  }

  try {
    const [mode, remembered] = await Promise.all([
      permissionsApi.getMode?.(),
      permissionsApi.getRemembered?.(),
    ]);

    if (!isMounted) {
      return;
    }

    if (typeof mode === "string") {
      setPermissionMode(mode as AgentPermissionMode);
    }

    if (Array.isArray(remembered)) {
      setRememberedCount(remembered.length);
    }
  } catch {
    // 権限設定APIが利用できない環境では既定値のまま表示する。
  }
};
```

After:

```typescript
const loadPermissions = async () => {
  const api = getPermissionApi();
  if (!api) {
    return;
  }

  try {
    const result = await api.getAllowedTools();

    if (!isMounted) {
      return;
    }

    setRememberedCount(result.tools.length);
  } catch {
    // 権限設定APIが利用できない環境では既定値のまま表示する。
  }
};
```

### タスク 5-3: 箇所C-1 を修正する（handlePermissionModeChange）

**対象ファイル**: `apps/desktop/src/renderer/views/AgentView/index.tsx`

Before:

```typescript
const handlePermissionModeChange = useCallback(
  async (mode: AgentPermissionMode) => {
    setPermissionMode(mode);

    const permissionsApi = getPermissionApi();
    if (!permissionsApi?.setMode) {
      return;
    }

    try {
      await permissionsApi.setMode(mode);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? `許可モードの更新に失敗しました: ${error.message}`
          : "許可モードの更新に失敗しました",
      );
    }
  },
  [showToast],
);
```

After:

```typescript
const handlePermissionModeChange = useCallback((mode: AgentPermissionMode) => {
  setPermissionMode(mode);
}, []);
```

### タスク 5-4: 箇所C-2 を修正する（handleResetRemembered）

**対象ファイル**: `apps/desktop/src/renderer/views/AgentView/index.tsx`

Before:

```typescript
const handleResetRemembered = useCallback(async () => {
  const permissionsApi = getPermissionApi();
  if (!permissionsApi?.clearRemembered) {
    setRememberedCount(0);
    return;
  }

  try {
    await permissionsApi.clearRemembered();
    setRememberedCount(0);
    showToast("success", "記憶済みの許可をリセットしました");
  } catch (error) {
    showToast(
      "error",
      error instanceof Error
        ? `記憶済み許可のリセットに失敗しました: ${error.message}`
        : "記憶済み許可のリセットに失敗しました",
    );
  }
}, [showToast]);
```

After:

```typescript
const handleResetRemembered = useCallback(async () => {
  const api = getPermissionApi();
  if (!api) {
    setRememberedCount(0);
    return;
  }

  try {
    await api.clearAll();
    setRememberedCount(0);
    showToast("success", "記憶済みの許可をリセットしました");
  } catch (error) {
    showToast(
      "error",
      error instanceof Error
        ? `記憶済み許可のリセットに失敗しました: ${error.message}`
        : "記憶済み許可のリセットに失敗しました",
    );
  }
}, [showToast]);
```

### タスク 5-5: 不要な import が残っていないか確認する

`AgentPermissionMode` の import は AdvancedSettingsPanel の props で引き続き使用するため、削除しない。

```bash
grep -n "import.*AgentPermissionMode" apps/desktop/src/renderer/views/AgentView/index.tsx
```

### タスク 5-6: テストの実行

```bash
pnpm --filter @repo/desktop exec vitest run apps/desktop/src/renderer/views/AgentView/__tests__/
```

Phase 4 で追加したテストを含む全テストが PASS することを確認する。

### タスク 5-7: 型チェックの実行

```bash
pnpm --filter @repo/desktop exec tsc --noEmit
```

TypeScript コンパイルが PASS することを確認する。

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名         | パス                                                                      |
| -------------- | ------------------------------------------------------------------------- |
| Phase 2 設計   | `docs/30-workflows/agentview-permission-api-fix/phase-2-design.md`        |
| Phase 4 テスト | `docs/30-workflows/agentview-permission-api-fix/phase-4-test-creation.md` |

## 成果物

| 成果物               | 配置先                                                |
| -------------------- | ----------------------------------------------------- |
| 修正済みソースコード | `apps/desktop/src/renderer/views/AgentView/index.tsx` |

## 完了条件

- [ ] 箇所A: ローカル `PermissionApi` 型を削除し、`getPermissionApi()` を `window.permissionAPI` に変更した
- [ ] 箇所B: `loadPermissions()` を `getAllowedTools()` に変更した
- [ ] 箇所C-1: `handlePermissionModeChange()` から IPC 呼び出しを削除した
- [ ] 箇所C-2: `handleResetRemembered()` を `clearAll()` に変更した
- [ ] `vitest run` で AgentView 関連テストが全て PASS した
- [ ] `tsc --noEmit` が PASS した

## 実行手順

### ステップ1: 型と参照先を修正する

誤った `PermissionApi` ローカル定義と `window.electronAPI.permissions` 参照を除去する。

### ステップ2: 状態更新ロジックを最小差分で揃える

`rememberedCount` と reset 処理だけを preload 契約へ寄せ、未実装の mode 永続化は触らない。

### ステップ3: Green を確認する

Phase 4 の Red テストが最小変更で PASS することを確認する。

## 統合テスト連携

- Phase 4 の Red ケースを Green 化する。
- Phase 6 で failure path を追加できるよう、例外処理の境界を明示しておく。

## 多角的チェック観点

| 観点     | 本Phaseでの確認内容                            |
| -------- | ---------------------------------------------- |
| API整合  | preload 公開面と Renderer 参照が一致しているか |
| 責務境界 | mode 永続化を本タスクに混入させていないか      |
| 可読性   | 変更後の変数名とコメントが実態に合っているか   |

## サブタスク管理

1. 型置換
2. API パス修正
3. ロジック修正
4. Green 確認
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 実装差分が設計範囲内に収まっている
- [ ] Phase 4 テストが通る前提を満たした

## 次のPhase

Phase 6: テスト拡充

## 統合テスト連携

| 観点     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| Green    | Phase 4 で追加した Red テストを PASS に反転させる                |
| 契約整合 | `PermissionSettings` と同じ `permissionAPI` 利用パターンへ揃える |
| 安全性   | preload 不在時のフォールバックを壊さないことを確認する           |
