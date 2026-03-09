# Phase 1: 要件定義レポート

## タスク ID

TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001

## 目的

AuthGuard が `isLoading === true` の間、全画面をブロックし続ける問題を解決し、Settings 画面が認証失敗時に到達不能になる問題を修正する。

---

## 1. 現状コード調査レポート

### 1.1 AuthGuard コンポーネント構造

| ファイル                | 責務                                                                                                                        | 行数  |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----- |
| `types.ts`              | `AuthGuardDisplayState` 型定義（3状態: checking/authenticated/unauthenticated）、Discriminated Union、型ガード、assertNever | 242行 |
| `utils/getAuthState.ts` | 純粋関数: `{ isLoading, isAuthenticated }` から `AuthGuardDisplayState` を算出                                              | 52行  |
| `hooks/useAuthState.ts` | Zustand Store の個別セレクタで `isAuthenticated` / `isLoading` を取得し `getAuthState` に委譲                               | 43行  |
| `index.tsx`             | switch 文で3状態を分岐（checking -> LoadingScreen, authenticated -> children, unauthenticated -> AuthView）                 | 99行  |
| `LoadingScreen.tsx`     | `role="status"` aria-label="認証確認中"、Spinner + テキスト表示                                                             | 44行  |

### 1.2 問題箇所の特定

#### 問題 A: isLoading 永続ブロッキング

- **箇所**: `utils/getAuthState.ts` L45: `if (isLoading) return "checking";`
- **症状**: `isLoading` が `true` のまま変わらない場合、`getAuthState` は永続的に `"checking"` を返す
- **影響**: `AuthGuard/index.tsx` L56-57 で LoadingScreen が無限表示される
- **根本原因**: タイムアウト機構が存在しない。IPC ハング（TASK-FIX-SAFEINVOKE-TIMEOUT-001）やデバッグコードによる localStorage.clear()（TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001）が `isLoading = true` を永続化する

#### 問題 B: Settings 画面が AuthGuard 内

- **箇所**: `App.tsx` L184-361: `<BrowserRouter><AuthGuard>` が全ルートを包む
- **症状**: Settings 画面（`currentView === "settings"` で `renderView()` 経由）は AuthGuard の子要素として描画される
- **影響**: 認証失敗時に Settings 画面に到達できない。API キー設定等の認証関連設定を変更する手段がなくなる
- **ルート構造**: catch-all `path="*"` の `renderView()` 内で `case "settings": return <SettingsView />` として描画

### 1.3 既存テストの状態

| テストファイル         | テスト数 | カバー範囲                                    |
| ---------------------- | -------- | --------------------------------------------- |
| `getAuthState.test.ts` | 4        | checking/authenticated/unauthenticated/境界値 |
| `AuthGuard.test.tsx`   | 7        | AG-01〜AG-06 + アクセシビリティ               |
| `types.test.ts`        | 存在     | 型ガード関数のテスト                          |

### 1.4 Store 層の現状（調査済み）

- **P31 対策済み**: `useAuthState` は個別セレクタ（`useAppStore((state) => state.isAuthenticated)`）を使用
- **P48 対策済み**: Settings 画面の派生セレクタに `useShallow` 適用済み
- **初期値**: 全スライスで `isLoading = false` が初期状態
- **IPC 失敗時**: `isLoading = false` に設定するガードパターン実装済み

---

## 2. 受け入れ基準

### AC-1: タイムアウト発動

AuthGuard の checking 状態が **10秒** を超えた場合、自動的にタイムアウト状態に遷移すること。

### AC-2: タイムアウト UI 表示

タイムアウト発動時に、以下の要素を含むフォールバック UI を表示すること:

- エラー状態を示すアイコン
- 「認証の確認に時間がかかっています」等の説明テキスト
- 「再試行」ボタン
- 「設定画面へ」ボタン（認証設定の変更手段を提供）

### AC-3: 再試行機能

タイムアウト UI の「再試行」ボタン押下で、タイムアウトタイマーがリセットされ、認証チェックが再実行されること。

### AC-4: Settings バイパス

Settings 画面（`currentView === "settings"`）は AuthGuard による認証チェックをバイパスし、認証失敗時でもアクセス可能であること。

### AC-5: セキュリティ維持

Settings バイパスにおいて、以下のセキュリティ要件を維持すること:

- Settings 以外のビューは引き続き AuthGuard で保護される
- バイパスはビュー状態（`currentView`）に基づく判定で、URL パラメータ操作では回避不可
- 認証済みユーザーの操作に影響を与えない

### AC-6: 型安全

`AuthGuardDisplayState` に `"timed-out"` を追加し、switch 文の網羅性チェック（`assertNever`）がコンパイル時に保証されること。

### AC-7: アクセシビリティ

- タイムアウト UI に適切な `role` / `aria-label` / `aria-live` 属性を付与
- キーボード操作で「再試行」「設定画面へ」ボタンにアクセス可能
- コントラスト比 4.5:1 以上（WCAG 2.1 AA）

### AC-8: 既存テスト互換

既存の AuthGuard テスト（AG-01〜AG-06 + アクセシビリティ）が全て PASS し続けること。新規テストは既存パターン（`createMockState` + `vi.mock("../../store")`）を踏襲すること。

---

## 3. スコープ定義

### スコープ内

| 項目                                           | 対象ファイル                                             |
| ---------------------------------------------- | -------------------------------------------------------- |
| `AuthGuardDisplayState` 型拡張                 | `types.ts`                                               |
| `getAuthState` 関数拡張                        | `utils/getAuthState.ts`                                  |
| `useAuthState` タイムアウトロジック追加        | `hooks/useAuthState.ts`                                  |
| AuthGuard switch 文に `"timed-out"` ケース追加 | `index.tsx`                                              |
| `AuthTimeoutFallback` 新規コンポーネント       | 新規ファイル                                             |
| Settings バイパスロジック                      | `App.tsx` または `index.tsx`                             |
| 関連テスト追加・更新                           | `getAuthState.test.ts`, `AuthGuard.test.tsx`, 新規テスト |

### スコープ外

| 項目                                 | 理由                                             |
| ------------------------------------ | ------------------------------------------------ |
| デバッグコード削除（App.tsx L45-61） | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 で対応 |
| safeInvoke タイムアウト追加          | TASK-FIX-SAFEINVOKE-TIMEOUT-001 で対応           |
| Store 層の isLoading 制御修正        | 既に正常動作（調査済み）                         |
| AuthView コンポーネント修正          | 本タスクのスコープ外                             |

---

## 4. セキュリティ考慮事項

### 4.1 Settings バイパスのリスク分析

| リスク                                | 緩和策                                                                                                                              | 残余リスク                                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| バイパスを悪用した認証回避            | `currentView` は Zustand Store 内の状態であり、URL パラメータ操作では変更不可                                                       | 低: DevTools からの直接 Store 操作は Renderer 内部であり、Electron セキュリティモデル上許容範囲 |
| Settings 画面経由の機密データアクセス | Settings 画面の機密操作（API キー取得等）は IPC 経由で Main Process に問い合わせるため、Main Process 側のバリデーションが維持される | 低: IPC ハンドラ側のバリデーションは本タスクのスコープ外で既に実装済み                          |
| タイムアウト値の不適切設定            | 10秒は IPC 通信の通常レイテンシ（100ms〜2s）を十分上回る値。定数として定義し変更を追跡可能にする                                    | なし                                                                                            |

### 4.2 フェイルセキュア原則の適用

タイムアウト発動時は `"timed-out"` 状態に遷移し、**認証済みとして扱わない**。子コンポーネント（保護対象コンテンツ）は表示せず、専用のフォールバック UI を表示する。これにより、タイムアウトが認証バイパスにならないことを保証する。

---

## 5. 関連する既知の落とし穴

| ID  | 内容                                | 本タスクへの影響                                                                                                                 |
| --- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| P31 | Zustand 合成 Hook 無限ループ        | `useAuthState` は個別セレクタを使用しており安全。タイムアウト用の `useState`/`useEffect` 追加時も個別セレクタパターンを維持する  |
| P48 | 派生セレクタ無限ループ              | 本タスクで派生セレクタは追加しない（boolean 値のみ）。`useShallow` は不要                                                        |
| P13 | タイマーテストの無限ループ          | `setTimeout` + `useEffect` のテストでは `vi.useFakeTimers()` + `vi.advanceTimersByTime()` を使用。`vi.runAllTimers()` は使用禁止 |
| P39 | happy-dom 環境での userEvent 非互換 | テストでは `fireEvent` を使用。`userEvent.setup()` は使用禁止                                                                    |
| P5  | リスナー二重登録                    | タイマーの `useEffect` には cleanup 関数で `clearTimeout` を確実に実行する                                                       |

---

## 6. 依存タスク関係

```
TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 (P1)
  -> TASK-FIX-SAFEINVOKE-TIMEOUT-001 (P2)
    -> TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 (P3, 本タスク)
```

本タスクは P1/P2 タスクが未実装でも独立して実装・テスト可能。ただし、P1/P2 が修正されない限り、本タスクのタイムアウト UI が実際にユーザーに表示される状況が発生し続ける。

---

## 7. 次フェーズ

Phase 2（設計）へ進む。
