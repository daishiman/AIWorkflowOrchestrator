# Phase 1: 要件定義書

## P50チェック実施結果

### describe.skip 件数確認

```
5件確認済み（行305, 431, 501, 590, 686）
```

### SkillLifecyclePanel現行Props確認

```
isOpen: 存在しない（廃止済み）
defaultTab: 存在しない（廃止済み）
現行Props: onClose, onOpenWizard?, onOpenSkillWizard?, onOpenSettings?, skillName?
```

### skill-lifecycle-prepare-button testid確認

```
grep結果: 存在しない（UIリファクタリングにより削除済み）
```

### resetAuthModeListenerFlag確認

```
authModeSlice.ts 行58: export function resetAuthModeListenerFlag(): void
→ 存在確認済み
```

## 5件の describe.skip 分類結果

| ID    | describe 名                                                            | スキップ原因                                                            | 分類                    |
| ----- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------- |
| TC-03 | skill generation completes without auth:login timeout                  | `isOpen`/`defaultTab` props廃止 + `skill-lifecycle-prepare-button` 削除 | C: フロー廃止→削除      |
| TC-05 | skill generation does not call auth:login when user is unauthenticated | `isOpen`/`defaultTab` props廃止 + `skill-lifecycle-prepare-button` 削除 | C: フロー廃止→削除      |
| TC-06 | rapid skill generation clicks do not trigger multiple auth:login       | `isOpen`/`defaultTab` props廃止 + `skill-lifecycle-prepare-button` 削除 | C: フロー廃止→削除      |
| TC-07 | auth:login is not triggered on component re-render during skill flow   | `isOpen`/`defaultTab` props廃止 + `skill-lifecycle-prepare-button` 削除 | C: フロー廃止→削除      |
| TC-08 | authModeSlice state changes do not trigger unexpected auth:login       | `resetAuthModeListenerFlag`はexport済み・skipは誤り                     | A: 修正（describe昇格） |

## 問題点の整理

| 問題               | 詳細                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| auth回帰検出不能   | TC-03〜TC-08がスキップのため、`auth:login` IPC の不正呼び出しを検出できない  |
| セキュリティリスク | スキル生成フロー中の auth:login 不正呼び出しが検知されない状態               |
| スキップ理由不明   | コメントなしのdescribe.skipで、保守コストが増大                              |
| CI信頼性低下       | skip状態のテストはカバレッジ算入されず、CI「全テストPASS」がミスリーディング |

## 受け入れ基準 AC-1〜AC-5

| ID   | 受け入れ基準                                                | 検証方法                                        |
| ---- | ----------------------------------------------------------- | ----------------------------------------------- |
| AC-1 | 5件の `describe.skip` が 0件になっている                    | `grep -c "describe\.skip"` の結果が 0           |
| AC-2 | 修正したテスト（TC-08）が PASS する                         | vitest run で TC-08 が PASS                     |
| AC-3 | `auth:login` IPC を検証するテストが最低 1件有効化されている | TC-08が `describe` 状態で PASS する             |
| AC-4 | `pnpm --filter @repo/desktop test:run` が PASS する         | CI相当のテスト実行が全件 PASS                   |
| AC-5 | TypeScript 型チェックが 0 error である                      | `pnpm --filter @repo/desktop typecheck` が PASS |

## スコープ定義

### 含む

- TC-03/TC-05/TC-06/TC-07 の describe.skip ブロック削除（フロー廃止のため）
- TC-08 の describe.skip → describe への昇格
- `fillCreateRequest()`・`clickPrepareButton()`・`waitForCreateModeReady()` ヘルパー関数の残留確認と削除

### 含まない

- プロダクションコード（`SkillLifecyclePanel.tsx` / `authModeSlice.ts`）の変更
- 新しいテストケースの追加
- auth関連仕様変更

## タスク分類

| 分類項目   | 値                                         |
| ---------- | ------------------------------------------ |
| タスク種別 | CLEANUPタスク                              |
| 変更範囲   | テストファイルのみ                         |
| UIタスク   | 非UIタスク                                 |
| 可視性     | NON_VISUAL                                 |
| テスト種別 | コンポーネントテスト（desktop renderer層） |
