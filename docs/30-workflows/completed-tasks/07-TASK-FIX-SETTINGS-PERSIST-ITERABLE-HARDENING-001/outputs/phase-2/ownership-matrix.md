# Phase 2: 責務分担表（Ownership Matrix）

> タスク: TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001
> 作成日: 2026-03-07

---

## 変更対象ファイル一覧

| 層             | ファイル                                                          | 変更内容                                                             | 担当設計判断 |
| -------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- | ------------ |
| Renderer Store | `apps/desktop/src/renderer/store/index.ts`                        | customStorage.getItem: expandedFolders 配列チェック + Set 変換ガード | DD-01        |
| Renderer Store | `apps/desktop/src/renderer/store/index.ts`                        | customStorage.setItem: expandedFolders Set/Array 型チェック + 直列化 | DD-02        |
| Renderer Store | `apps/desktop/src/renderer/store/index.ts`                        | useCanGoBack セレクタ: Array.isArray ガード追加                      | DD-05        |
| Renderer Slice | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`       | setCurrentView: viewHistory spread ガード追加                        | DD-03        |
| Renderer Slice | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`       | goBack: viewHistory 配列チェック追加                                 | DD-04        |
| Renderer Slice | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`       | canGoBack: viewHistory 配列チェック追加                              | DD-05        |
| Tests          | `apps/desktop/src/renderer/store/slices/navigationSlice.test.ts`  | viewHistory 破損シナリオのテストケース追加（DD-03, DD-04, DD-05）    | DD-03~05     |
| Tests          | `apps/desktop/src/renderer/store/__tests__/customStorage.test.ts` | customStorage 破損 fixture テスト新規作成（DD-01, DD-02）            | DD-01~02     |
| Docs           | `docs/30-workflows/07-TASK-FIX-.../outputs/phase-2/*.md`          | 設計判断書、責務分担表、実装計画                                     | -            |

---

## 変更影響分析

### 直接影響

| 変更ファイル         | 影響を受けるコンポーネント / セレクタ                    |
| -------------------- | -------------------------------------------------------- |
| `store/index.ts`     | Store hydrate 全体、`useCanGoBack` セレクタ使用箇所      |
| `navigationSlice.ts` | `setCurrentView` / `goBack` / `canGoBack` の全呼び出し元 |

### 間接影響

- `useCanGoBack` セレクタを使用するコンポーネント（ナビゲーション UI）は、破損時に `false` を受け取り「戻るボタン無効化」として表示される。ユーザー体験上は安全側に倒す挙動。
- `customStorage` のガード追加により、破損した localStorage データでも Store が正常に hydrate されるため、他の persist 対象フィールド（`currentView`, `selectedFile` 等）への連鎖障害が防止される。

### 変更しないファイル

| ファイル                         | 理由                                                       |
| -------------------------------- | ---------------------------------------------------------- |
| `store/types.ts`                 | 型定義の変更は不要（ガードは実行時チェックのみ）           |
| `store/slices/editorSlice.ts` 等 | expandedFolders / viewHistory を直接操作しないため影響なし |
| `partialize` 設定                | viewHistory は persist 対象外のため変更不要                |
