# Phase 2: 設計書

## 処置方針テーブル（最終確定）

| TC    | スキップ原因（確認済み）                                         | 分類 | 処置方針                            |
| ----- | ---------------------------------------------------------------- | ---- | ----------------------------------- |
| TC-03 | `isOpen`/`defaultTab`廃止 + `skill-lifecycle-prepare-button`削除 | C    | ブロック削除（フロー廃止）          |
| TC-05 | `isOpen`/`defaultTab`廃止 + `skill-lifecycle-prepare-button`削除 | C    | ブロック削除（フロー廃止）          |
| TC-06 | `isOpen`/`defaultTab`廃止 + `skill-lifecycle-prepare-button`削除 | C    | ブロック削除（フロー廃止）          |
| TC-07 | `isOpen`/`defaultTab`廃止 + `skill-lifecycle-prepare-button`削除 | C    | ブロック削除（フロー廃止）          |
| TC-08 | `resetAuthModeListenerFlag`はexport済み・skipは誤り              | A    | `describe.skip` → `describe` に昇格 |

## 詳細設計

### TC-03/TC-05/TC-06/TC-07 削除理由（分類C: フロー廃止）

**廃止確認項目**:

1. `SkillLifecyclePanelProps` に `isOpen`/`defaultTab` が存在しない（行381-387確認）
2. `skill-lifecycle-prepare-button` testidがコンポーネントに存在しない（grep結果空）
3. `fillCreateRequest()` が既にno-op化されている（行172-175）
4. TC-01（アクティブ）がウィザード起動での auth:login 非呼び出しを既にカバー済み

**削除範囲**:

- TC-03: 行305〜360（`// ============================================================`コメントから`});`まで）
- TC-05: 行427〜495（`// ============================================================`コメントから`});`まで）
- TC-06: 行497〜584（`// ============================================================`コメントから`});`まで）
- TC-07: 行586〜680（`// ============================================================`コメントから`});`まで）

**削除後の副次効果**:

- `fillCreateRequest()` / `clickPrepareButton()` / `waitForCreateModeReady()` ヘルパーが未使用になる
  - `fillCreateRequest()`: 既にno-op、削除可
  - `clickPrepareButton()`: TC削除で参照消滅、削除可
  - `waitForCreateModeReady()`: TC削除で参照消滅、削除可
  - `defaultCreateRequest`: TC削除で参照消滅、削除可

### TC-08 修正設計（分類A: describe昇格）

**修正内容**: `describe.skip(` → `describe(` への変換

**前提確認**:

- `resetAuthModeListenerFlag` は `authModeSlice.ts` 行58にexport済み ✓
- TC-08はコンポーネントをrenderしない（sliceを直接テスト）✓
- `window.electronAPI.authMode` モックが適切に設定されている ✓

**昇格後の検証意図**: `authModeSlice.setMode()` が `auth.login` を呼ばないことを確認するセキュリティ重要テスト

## auth:login モックパターン整合設計

現行アクティブテスト（TC-01/TC-02/TC-04）のモックパターン:

```typescript
(window as Window & { electronAPI?: unknown }).electronAPI = {
  auth: { login: mockAuthLogin },
};
```

TC-08のモックパターン（現行設計で整合済み）:

```typescript
(window as Window & { electronAPI?: unknown }).electronAPI = {
  auth: { login: mockLoginIPC },
  authMode: { get, set, status, validate, onModeChanged },
};
```

→ 現行フローに整合。修正不要。

## 変更対象ファイル

| ファイル                                       | 変更種別 | 変更内容                                                     |
| ---------------------------------------------- | -------- | ------------------------------------------------------------ |
| `SkillLifecyclePanel.auth-regression.test.tsx` | 修正     | TC-03/05/06/07削除 + TC-08 describe昇格 + 未使用ヘルパー削除 |

**変更対象はテストファイル1件のみ。プロダクションコード変更なし。**

## 検証マトリクス

| テスト対象                   | コマンド                                                                  |
| ---------------------------- | ------------------------------------------------------------------------- |
| 対象テストファイル単体       | `pnpm --filter @repo/desktop test -- SkillLifecyclePanel.auth-regression` |
| SkillLifecyclePanel 関連全体 | `pnpm --filter @repo/desktop test -- SkillLifecyclePanel`                 |
| desktop テスト全体           | `pnpm --filter @repo/desktop test:run`                                    |
| 型チェック                   | `pnpm --filter @repo/desktop typecheck`                                   |
| lint                         | `pnpm --filter @repo/desktop lint`                                        |

## concern数による設計判断

concern数 = 1（テストファイル1件のみ）。サブタスク分割不要。単一ファイル設計。
