# Phase 2: 設計

## メタ情報

| 項目      | 内容                                       |
| --------- | ------------------------------------------ |
| Phase     | 2                                          |
| 名称      | 設計                                       |
| 前提Phase | Phase 1                                    |
| 成果物    | 変更設計書、コード差分設計（before/after） |

## 目的

Phase 1 で定義した FR-01 から FR-05 の具体的なコード変更箇所と変更内容を設計し、before/after のコード差分を確定する。

## 実行タスク

- タスク 2-1: 変更箇所を `AgentView/index.tsx` の3点に限定する
- タスク 2-2: `getPermissionApi()` を `window.permissionAPI` 基準へ再設計する
- タスク 2-3: `loadPermissions()` を `getAllowedTools()` 基準へ再設計する
- タスク 2-4: 権限モードはローカル state、リセットは `clearAll()` として責務分離する
- タスク 2-5: テスト影響と将来タスク境界を設計に織り込む

### タスク 2-1: 変更箇所の確定

変更対象は `apps/desktop/src/renderer/views/AgentView/index.tsx` の以下3箇所に限定する。他のファイル（`AdvancedSettingsPanel.tsx`, `types.ts`）は変更不要。

| 変更箇所 | 行番号  | 変更内容                                                    | 対応FR       |
| -------- | ------- | ----------------------------------------------------------- | ------------ |
| 箇所A    | 77-90   | 型定義削除 + getPermissionApi 書き換え                      | FR-01, FR-02 |
| 箇所B    | 260-293 | loadPermissions 書き換え                                    | FR-03        |
| 箇所C    | 523-565 | handlePermissionModeChange + handleResetRemembered 書き換え | FR-04, FR-05 |

### タスク 2-2: 箇所A の設計（型定義 + getPermissionApi）

**Before** (77-90行):

```typescript
type PermissionApi = {
  getMode?: () => Promise<string>;
  getRemembered?: () => Promise<unknown[]>;
  setMode?: (mode: AgentPermissionMode) => Promise<unknown>;
  clearRemembered?: () => Promise<unknown>;
};

function getPermissionApi(): PermissionApi | undefined {
  return (
    window.electronAPI as typeof window.electronAPI & {
      permissions?: PermissionApi;
    }
  ).permissions;
}
```

**After**:

```typescript
function getPermissionApi(): typeof window.permissionAPI | undefined {
  try {
    return window.permissionAPI;
  } catch {
    return undefined;
  }
}
```

**設計判断**:

- ローカル `PermissionApi` 型は削除する。`window.permissionAPI` の型は `preload/types.ts` の `PermissionAPI` として Window global に宣言済みであるため、`typeof window.permissionAPI` で十分
- `try-catch` で囲むのは、preload 未初期化環境（テスト環境等）で `window.permissionAPI` が undefined の場合に安全にフォールバックするため
- 戻り値の型は `typeof window.permissionAPI | undefined` とし、呼び出し側で `?.` でガードする既存パターンを維持する

### タスク 2-3: 箇所B の設計（loadPermissions）

**Before** (260-293行):

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

**After**:

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

**設計判断**:

- `getMode()` 呼び出しは削除する。権限モードは preload に未実装のため、ローカル state の初期値 `"default"` をそのまま使用する
- `getRemembered()` は `getAllowedTools()` に置き換える
- `Promise.all` は不要になる（単一の API 呼び出しのみ）
- `result.tools.length` を `rememberedCount` にセットする

### タスク 2-4: 箇所C の設計（handlePermissionModeChange + handleResetRemembered）

**handlePermissionModeChange Before** (523-544行):

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

**handlePermissionModeChange After**:

```typescript
const handlePermissionModeChange = useCallback((mode: AgentPermissionMode) => {
  setPermissionMode(mode);
}, []);
```

**設計判断**:

- `setMode()` は preload に存在しないため、IPC 呼び出しを全て削除する
- ローカル state の `setPermissionMode` のみで管理する
- async を削除し、同期関数にする
- `showToast` への依存を削除する（エラーが発生しないため）

**handleResetRemembered Before** (546-565行):

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

**handleResetRemembered After**:

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

**設計判断**:

- `clearRemembered()` を `clearAll()` に置き換える
- API が取得できない場合のフォールバック（`setRememberedCount(0)`）は維持する
- 成功/エラーの Toast 表示は維持する

### タスク 2-5: テストへの影響分析

| テストファイル                   | 影響                                                                                     | 対応                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------- |
| `AgentView.test.tsx`             | `window.electronAPI.permissions` のモック定義があれば修正が必要                          | `window.permissionAPI` のモックに変更 |
| `AgentView.layout.test.tsx`      | 権限関連のモックがあれば修正が必要                                                       | 同上                                  |
| `AgentView.cta.test.tsx`         | 権限関連のモックがあれば修正が必要                                                       | 同上                                  |
| `AgentView.coverage.test.tsx`    | 権限関連のモックがあれば修正が必要                                                       | 同上                                  |
| `AdvancedSettingsPanel.test.tsx` | props として `permissionMode` と `rememberedCount` を渡すのみ。内部の API 呼び出しはない | 変更不要                              |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名                     | パス                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| Phase 1 要件定義           | `docs/30-workflows/agentview-permission-api-fix/phase-1-requirements.md`     |
| preload/types.ts           | `apps/desktop/src/preload/types.ts:1746-1762`                                |
| PermissionSettings（参考） | `apps/desktop/src/renderer/components/settings/PermissionSettings/index.tsx` |

## 成果物

| 成果物 | 配置先                                                             |
| ------ | ------------------------------------------------------------------ |
| 設計書 | `docs/30-workflows/agentview-permission-api-fix/phase-2-design.md` |

## 完了条件

- [ ] 変更箇所A（型定義 + getPermissionApi）の before/after コードが確定した
- [ ] 変更箇所B（loadPermissions）の before/after コードが確定した
- [ ] 変更箇所C（handlePermissionModeChange + handleResetRemembered）の before/after コードが確定した
- [ ] テストファイルへの影響を分析し、対応方針を記載した
- [ ] 変更対象ファイルが `AgentView/index.tsx` の1ファイルに限定されることを確認した

## 統合テスト連携

| 観点     | 内容                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| Red設計  | `permissionAPI` 存在時 / 不在時 / `getAllowedTools()` 反映 / `clearAll()` 呼び出しを Phase 4 で失敗テスト化する |
| 回帰防止 | `window.electronAPI.permissions` へ戻る退行を grep とテストの両方で検知する                                     |
| 手動検証 | 「件数表示」「リセット」「TypeError 非発生」を Phase 11 の代表シナリオに固定する                                |

## 多角的チェック観点

| 観点           | 適用 | 理由                                                                      |
| -------------- | ---- | ------------------------------------------------------------------------- |
| アーキテクチャ | ✅   | 存在しない API に合わせるのではなく、既存公開面に renderer を合わせるため |
| API設計        | ✅   | `PermissionAPI` の既存メソッドだけを使う最小修正が妥当なため              |
| UI/UX          | ✅   | 許可モード UI は保持しつつ、永続化期待を持ち込まないため                  |
| セキュリティ   | ✅   | 許可クリア操作は既存 `clearAll()` 契約に閉じるため                        |

## 実行手順

### ステップ1: 変更対象を責務ごとに分割する

`getPermissionApi`、`loadPermissions`、`handlePermissionModeChange`、`handleResetRemembered` を個別責務として設計する。

### ステップ2: public contract 不変を確認する

`PermissionAPI` の追加変更ではなく、Renderer の参照整合だけで解決できることを確認する。

### ステップ3: テストと手動確認へ接続する

Phase 4-11 がそのまま追従できるよう、期待する変更点と確認方法を揃える。

## 統合テスト連携

- Phase 4/6 のテストケースが設計の4論点を網羅するように紐付ける。
- `window.permissionAPI` あり/なし、成功/失敗の枝を明示して branch coverage へ接続する。
- manual test は UI 反映とエラーログ不在の2観点で閉じる。

## 多角的チェック観点

| 観点           | 本Phaseでの確認内容                                            |
| -------------- | -------------------------------------------------------------- |
| API設計        | `typeof window.permissionAPI` をそのまま使えるか               |
| アーキテクチャ | Renderer の local state と preload contract を混同していないか |
| セキュリティ   | `permissionAPI` 未初期化時に危険な bypass を導入していないか   |
| 保守性         | 将来の `AgentPermissionMode` 永続化を疎結合に保てるか          |

## サブタスク管理

1. 変更責務の分解
2. 変更前後コードの設計
3. テスト観点の整理
4. スコープ外の切り出し
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 実装対象とスコープ外対象が分離されている
- [ ] 後続Phaseがこの設計だけで実行できる

## 次のPhase

Phase 3: 設計レビュー
