# Phase 1: 要件定義 - 影響範囲分析

## メタ情報

| 項目     | 内容                                      |
| -------- | ----------------------------------------- |
| タスクID | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase    | 1                                         |
| 実行日   | 2026-03-09                                |

## 影響範囲分析

### 1. VITE_E2E_MODE の使用箇所

| ファイル                        | 行  | 用途                         |
| ------------------------------- | --- | ---------------------------- |
| `renderer/App.tsx`              | L48 | デバッグコード内（削除対象） |
| `renderer/utils/devMockAuth.ts` | L29 | E2Eモード判定（影響なし）    |

**結論**: デバッグコード削除後も `devMockAuth.ts` での使用は残るため、E2E機能に影響なし。

### 2. skipAuth=true の使用箇所

| ファイル                        | 行       | 用途                         |
| ------------------------------- | -------- | ---------------------------- |
| `renderer/App.tsx`              | L49      | デバッグコード内（削除対象） |
| `renderer/utils/devMockAuth.ts` | L20, L41 | skipAuth判定（影響なし）     |

**結論**: デバッグコード削除後も `devMockAuth.ts` での使用は残るため、skipAuth機能に影響なし。

### 3. debug-clear-storage の使用箇所

| ファイル           | 行       | 用途                             |
| ------------------ | -------- | -------------------------------- |
| `renderer/App.tsx` | L54, L58 | デバッグコード内のみ（削除対象） |

**結論**: App.tsx 以外に使用箇所なし。削除しても他への影響なし。

### 4. localStorage.clear() の呼び出し箇所

| ファイル                                         | 行  | 用途                                 |
| ------------------------------------------------ | --- | ------------------------------------ |
| `renderer/App.tsx`                               | L57 | デバッグコード内（削除対象）         |
| `renderer/store/__tests__/customStorage.test.ts` | L27 | テスト内のクリーンアップ（影響なし） |

**結論**: プロダクションコードでの `localStorage.clear()` は App.tsx のデバッグコードのみ。

### 5. Zustand persist が localStorage を使用しているファイル

- `store/index.ts` - persist ミドルウェア設定
- `store/sliceBaseline.ts` - persist 基盤
- `store/slices/workspaceSlice.ts` - workspace persist
- `store/slices/systemPromptTemplateSlice.ts` - template persist

**結論**: localStorage.clear() がこれら全ての persist 状態を破壊している。削除により正常に保持される。

## 受入基準

| ID   | 基準                                                    | 検証方法       |
| ---- | ------------------------------------------------------- | -------------- |
| AC-1 | デバッグ用useEffectが完全に削除されていること           | コードレビュー |
| AC-2 | localStorage.clear() がアプリ起動時に実行されないこと   | テスト         |
| AC-3 | Zustand persist状態がアプリ再起動後も保持されること     | 手動テスト     |
| AC-4 | BROWSER_GET_LAST_WEB_PREFERENCES エラーが発生しないこと | ログ確認       |
| AC-5 | E2Eテスト（skipAuth=true）が引き続き動作すること        | E2Eテスト実行  |
| AC-6 | 全既存テストがPASSすること                              | テスト実行     |

## スコープ

### スコープ内

- App.tsx L45-61 のデバッグ用 useEffect 削除
- 削除に伴う不要 import の除去（該当する場合）
- 関連テストの更新
- persist 動作確認テスト

### スコープ外

- AuthGuard の改修
- safeInvoke の変更
- Settings 画面の改修
- persist hardening の新規実装

## 完了条件チェック

- [x] 影響範囲が特定され、デバッグコード以外に影響がないことを確認
- [x] 受入基準（AC-1〜AC-6）が定義されていること
- [x] スコープが明確に限定されていること
- [x] 本Phase内の全タスクを100%実行完了
