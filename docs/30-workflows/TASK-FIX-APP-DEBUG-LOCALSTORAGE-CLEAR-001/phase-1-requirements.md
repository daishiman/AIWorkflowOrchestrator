# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase      | 1                                         |
| Phase名    | 要件定義                                  |
| カテゴリ   | fix                                       |
| 優先度     | Priority 1（最優先）                      |
| ステータス | pending                                   |
| 前提Phase  | なし                                      |
| 後続Phase  | Phase 2                                   |

## 目的

App.tsx に残存するデバッグ用 `useEffect`（L46-61）が引き起こす問題を要件として定義し、修正の受入基準を明確化する。

## 背景

### 問題の概要

`apps/desktop/src/renderer/App.tsx` の L46-61 に、デバッグ用の `useEffect` が残存している。このコードは以下の深刻な問題を引き起こす:

1. **localStorage.clear()** が毎回起動時に実行され、Zustand の persist 状態が全破壊される
2. TASK-07 で実装された persist hardening（破損データ自動回復パス）が無効化される
3. **window.location.reload()** が `BROWSER_GET_LAST_WEB_PREFERENCES: WebContents does not exist` エラーの直接原因となる
4. `sessionStorage` はウィンドウ終了時にクリアされるため、アプリ起動のたびに実行される

### 問題コード

```typescript
// apps/desktop/src/renderer/App.tsx L45-61
// デバッグ用: 初回起動時にストレージをクリア（TODO: テスト完了後に削除）
useEffect(() => {
  if (
    import.meta.env.VITE_E2E_MODE === "true" ||
    window.location.search.includes("skipAuth=true")
  ) {
    return;
  }

  const shouldClear = sessionStorage.getItem("debug-clear-storage");
  if (!shouldClear) {
    console.log("[DEBUG] Clearing all storage for clean auth test...");
    localStorage.clear();
    sessionStorage.setItem("debug-clear-storage", "done");
    window.location.reload();
  }
}, []);
```

## 実行タスク

### タスク1: 影響範囲の特定

**目的**: デバッグコード削除による影響範囲を明確にする

**手順**:

1. `VITE_E2E_MODE` 環境変数の使用箇所を全プロジェクトから検索
2. `skipAuth=true` の使用箇所を確認
3. `sessionStorage.getItem("debug-clear-storage")` の使用箇所を確認（App.tsx以外にないこと）
4. `localStorage.clear()` の呼び出し箇所を確認
5. Zustand persist ミドルウェアが localStorage を使用している箇所を特定

**期待される成果物**:

- 影響範囲分析ドキュメント

### タスク2: 受入基準の定義

**目的**: 修正完了の判定基準を定義する

**受入基準**:

| ID   | 基準                                                      | 検証方法       |
| ---- | --------------------------------------------------------- | -------------- |
| AC-1 | デバッグ用useEffectが完全に削除されていること             | コードレビュー |
| AC-2 | `localStorage.clear()` がアプリ起動時に実行されないこと   | テスト         |
| AC-3 | Zustand persist状態がアプリ再起動後も保持されること       | 手動テスト     |
| AC-4 | `BROWSER_GET_LAST_WEB_PREFERENCES` エラーが発生しないこと | ログ確認       |
| AC-5 | E2Eテスト（skipAuth=true）が引き続き動作すること          | E2Eテスト実行  |
| AC-6 | 全既存テストがPASSすること                                | テスト実行     |

### タスク3: スコープの明確化

**目的**: 修正範囲を限定し、スコープクリープを防止する

**スコープ内**:

- App.tsx L46-61 のデバッグ用 `useEffect` 削除
- 削除に伴う不要 import の除去（該当する場合）
- 関連テストの更新
- persist 動作確認テスト

**スコープ外**:

- AuthGuard の改修
- safeInvoke の変更
- Settings 画面の改修
- persist hardening の新規実装

## 参照資料

| 参照資料          | パス                                                                                |
| ----------------- | ----------------------------------------------------------------------------------- |
| 対象ファイル      | `apps/desktop/src/renderer/App.tsx` (L46-61)                                        |
| persist hardening | TASK-07 関連実装                                                                    |
| P31               | `.claude/rules/06-known-pitfalls.md` (Zustand Store Hooks無限ループ)                |
| P48               | `.claude/rules/06-known-pitfalls.md` (useShallow未適用による派生セレクタ無限ループ) |

## 成果物

| 成果物     | パス                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| 要件定義書 | `docs/30-workflows/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-1-requirements.md` |

## 完了条件

- [ ] 影響範囲が特定され、デバッグコード以外に影響がないことを確認
- [ ] 受入基準（AC-1〜AC-6）が定義されていること
- [ ] スコープが明確に限定されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 2: 設計へ進む。
