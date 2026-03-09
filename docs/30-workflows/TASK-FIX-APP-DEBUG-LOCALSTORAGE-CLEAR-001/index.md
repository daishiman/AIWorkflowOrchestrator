# TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001: App.tsx デバッグコード削除

## 概要

`apps/desktop/src/renderer/App.tsx` の L46-61 に残存するデバッグ用 `useEffect` を削除する。このコードは `localStorage.clear()` を毎回起動時に実行し、Zustand persist 状態を全破壊している。また `window.location.reload()` が `BROWSER_GET_LAST_WEB_PREFERENCES: WebContents does not exist` エラーの直接原因。

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001    |
| タスク種別   | fix                                          |
| 優先度       | Priority 1（最優先）                         |
| ステータス   | pending                                      |
| 対象ファイル | `apps/desktop/src/renderer/App.tsx` (L46-61) |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | pending    |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | pending    |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | pending    |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | pending    |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | pending    |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | pending    |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | pending    |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | pending    |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | pending    |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | pending    |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | pending    |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | pending    |
| 13    | 完了             | [phase-13-completion.md](./phase-13-completion.md)             | pending    |

## 受入基準

| ID   | 基準                                                      |
| ---- | --------------------------------------------------------- |
| AC-1 | デバッグ用useEffectが完全に削除されていること             |
| AC-2 | `localStorage.clear()` がアプリ起動時に実行されないこと   |
| AC-3 | Zustand persist状態がアプリ再起動後も保持されること       |
| AC-4 | `BROWSER_GET_LAST_WEB_PREFERENCES` エラーが発生しないこと |
| AC-5 | E2Eテスト（skipAuth=true）が引き続き動作すること          |
| AC-6 | 全既存テストがPASSすること                                |

## スコープ

**含む**:

- App.tsx L46-61 のデバッグ用 `useEffect` 削除
- 関連テスト更新
- persist 動作確認

**含まない**:

- AuthGuard の改修
- safeInvoke の変更
- Settings 画面の改修

## 関連する既知の落とし穴

- P31: Zustand Store Hooks無限ループ
- P48: useShallow未適用による派生セレクタ無限ループ
