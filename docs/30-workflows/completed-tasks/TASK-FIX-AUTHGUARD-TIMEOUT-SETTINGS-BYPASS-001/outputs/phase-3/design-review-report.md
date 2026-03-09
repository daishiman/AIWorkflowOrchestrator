# Phase 3: 設計レビューレポート

## タスク ID

TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001

## レビュー対象

Phase 2 設計レポート（design-report.md）

---

## 1. 要件-設計整合性レビュー

### AC-1: タイムアウト発動

| 項目                       | 判定 | 根拠                                                                         |
| -------------------------- | ---- | ---------------------------------------------------------------------------- |
| 10秒タイムアウト           | PASS | `AUTH_GUARD_TIMEOUT_MS = 10_000` で定数化。`useEffect` + `setTimeout` で実装 |
| checking -> timed-out 遷移 | PASS | `getAuthState` で `isLoading && isTimedOut` を判定。状態遷移テーブルで網羅   |

### AC-2: タイムアウト UI 表示

| 項目               | 判定 | 根拠                                                                       |
| ------------------ | ---- | -------------------------------------------------------------------------- |
| エラー状態アイコン | PASS | `Icon` コンポーネント（exclamationTriangle）を設計に含む                   |
| 説明テキスト       | PASS | 「認証の確認に時間がかかっています」を表示                                 |
| 再試行ボタン       | PASS | `onRetry` prop で `retry` 関数を呼び出す設計                               |
| 設定画面へボタン   | PASS | `onNavigateToSettings` prop で `setCurrentView("settings")` を呼び出す設計 |

### AC-3: 再試行機能

| 項目               | 判定 | 根拠                                                                                                  |
| ------------------ | ---- | ----------------------------------------------------------------------------------------------------- |
| タイマーリセット   | PASS | `retry` で `setIsTimedOut(false)` を実行。`isLoading` が `true` になると `useEffect` でタイマー再起動 |
| 認証チェック再実行 | PASS | `retry` で `initializeAuth()` を呼び出す                                                              |

### AC-4: Settings バイパス

| 項目                  | 判定 | 根拠                                                                         |
| --------------------- | ---- | ---------------------------------------------------------------------------- |
| Settings 画面アクセス | PASS | `isSettingsView` prop が `true` の場合、AuthGuard は `children` を即座に返す |
| 認証失敗時のアクセス  | PASS | バイパスは認証状態に依存しない早期 return                                    |

### AC-5: セキュリティ維持

| 項目                         | 判定 | 根拠                                                                                      |
| ---------------------------- | ---- | ----------------------------------------------------------------------------------------- |
| 他ビューの保護               | PASS | `isSettingsView` が `false`（デフォルト）の場合、通常の AuthGuard ロジックが適用          |
| URL 操作での回避不可         | PASS | `currentView` は Zustand Store 内部状態。URL パラメータからは設定不可                     |
| 認証済みユーザーへの影響なし | PASS | `isSettingsView` による早期 return は Hook 呼び出し後。認証済みユーザーのフローに変更なし |

### AC-6: 型安全

| 項目                       | 判定 | 根拠                                                           |
| -------------------------- | ---- | -------------------------------------------------------------- |
| AuthGuardDisplayState 拡張 | PASS | `"timed-out"` を追加。switch 文の網羅性は `assertNever` で保証 |
| AuthGuardState 拡張        | PASS | `{ status: "timed-out" }` を追加                               |
| isTimedOut 型ガード        | PASS | 新規型ガード関数を追加                                         |
| AuthStateInput 後方互換    | PASS | `isTimedOut?: boolean` でオプショナル。既存呼び出しに影響なし  |

### AC-7: アクセシビリティ

| 項目            | 判定 | 根拠                                                                     |
| --------------- | ---- | ------------------------------------------------------------------------ |
| role/aria-label | PASS | `role="alert"`, `aria-label="認証タイムアウト"`, `aria-live="assertive"` |
| キーボード操作  | PASS | `<button type="button">` で Tab/Enter/Space 操作可能                     |
| コントラスト比  | PASS | Apple HIG System Colors 使用。CSS 変数ベースでライト/ダーク両モード対応  |

### AC-8: 既存テスト互換

| 項目           | 判定            | 根拠                                                                                                                                                                                                                  |
| -------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 既存テスト互換 | 要確認（MINOR） | `useAuthState` の戻り値型がオブジェクトに変更される。既存テスト（AG-01〜AG-06）は `useAuthState` をモック経由で使用しているため、モックの戻り値型を更新する必要がある。ただし、`createMockState` パターンは維持される |

---

## 2. セキュリティレビュー

### 2.1 最小権限（Least Privilege）

| チェック項目                | 判定 | 詳細                                                                         |
| --------------------------- | ---- | ---------------------------------------------------------------------------- |
| Settings バイパスの権限範囲 | PASS | Renderer 内の UI 表示制御のみ。Main Process の権限に影響なし                 |
| タイムアウト状態の権限      | PASS | `"timed-out"` は `children` を表示しない。保護対象コンテンツへのアクセスなし |
| 新規 API の露出             | PASS | 新規 IPC チャンネルの追加なし。Preload 層の変更なし                          |

### 2.2 多層防御（Defense in Depth）

| 防御層                   | 影響                     | 判定                                                |
| ------------------------ | ------------------------ | --------------------------------------------------- |
| AuthGuard（Renderer）    | `"timed-out"` ケース追加 | PASS: 保護対象コンテンツは非表示                    |
| IPC ハンドラ（Main）     | 変更なし                 | PASS: バリデーション維持                            |
| Preload（contextBridge） | 変更なし                 | PASS: ホワイトリスト維持                            |
| CSP                      | 変更なし                 | PASS                                                |
| BrowserWindow 設定       | 変更なし                 | PASS: contextIsolation/nodeIntegration/sandbox 維持 |

### 2.3 フェイルセキュア（Fail-Secure）

| チェック項目               | 判定 | 詳細                                                                                                            |
| -------------------------- | ---- | --------------------------------------------------------------------------------------------------------------- |
| タイムアウト時の安全側倒し | PASS | `"timed-out"` は認証済みとして扱わない。フォールバック UI のみ表示                                              |
| getAuthState の判定順序    | PASS | `isLoading && isTimedOut` > `isLoading` > `isAuthenticated` > default。タイムアウトが認証をバイパスする経路なし |
| retry 失敗時               | PASS | `initializeAuth()` が失敗しても `isLoading` は最終的に `false` に設定される（既存の Store ガードパターン）      |

### 2.4 完全仲介（Complete Mediation）

| チェック項目            | 判定 | 詳細                                                                                                             |
| ----------------------- | ---- | ---------------------------------------------------------------------------------------------------------------- |
| Settings バイパスの検証 | PASS | `isSettingsView` は毎レンダーで `currentView === "settings"` から算出。キャッシュによるバイパスなし              |
| URL 操作耐性            | PASS | `currentView` は Store 内部状態。URL パラメータ/ハッシュ/クエリ文字列からは変更不可                              |
| DevTools 操作耐性       | 許容 | Renderer 内部の Store 操作は Electron セキュリティモデル上、ユーザーが DevTools にアクセス可能な前提で許容される |

---

## 3. 状態遷移ロジックレビュー

### 3.1 無限ループ検証

| パス                                        | 判定 | 詳細                                                                                                                             |
| ------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------- |
| checking -> timed-out -> checking（再試行） | PASS | `retry` が `initializeAuth()` を呼び、`isLoading=true` で `useEffect` 再起動。タイマーは新規 `setTimeout` で管理。無限ループなし |
| timed-out -> authenticated                  | PASS | `isLoading=false` で `useEffect` が `setIsTimedOut(false)` を実行。`getAuthState` が `"authenticated"` を返す。一方向遷移        |
| isTimedOut 変更 -> useEffect 再起動?        | PASS | `useEffect` の依存配列は `[isLoading]` のみ。`isTimedOut` の変更では `useEffect` は再起動しない                                  |

### 3.2 P31 準拠（Zustand 個別セレクタ）

| セレクタ                                        | 判定 | 詳細                         |
| ----------------------------------------------- | ---- | ---------------------------- |
| `useAppStore((state) => state.isAuthenticated)` | PASS | 個別セレクタ。参照安定       |
| `useAppStore((state) => state.isLoading)`       | PASS | 個別セレクタ。参照安定       |
| `useAppStore((state) => state.initializeAuth)`  | PASS | Zustand アクション参照は安定 |
| `useAppStore((state) => state.setCurrentView)`  | PASS | Zustand アクション参照は安定 |
| `useAppStore((state) => state.setDevModeAuth)`  | PASS | Zustand アクション参照は安定 |

### 3.3 P48 準拠（派生セレクタ）

派生セレクタ（`.filter()` / `.map()` 等）は本設計に含まれない。`useShallow` は不要。PASS。

### 3.4 useEffect cleanup（P5 準拠）

```typescript
useEffect(() => {
  if (!isLoading) {
    setIsTimedOut(false);
    return; // cleanup 不要（タイマー未設定）
  }
  const timer = setTimeout(...);
  return () => clearTimeout(timer); // cleanup でタイマー解除
}, [isLoading]);
```

PASS: `isLoading` が `false` に変わった場合も、前回の `useEffect` の cleanup が実行されるため `clearTimeout` は確実に呼ばれる。

### 3.5 React Hook ルール準拠

設計レポート Section 6.6 で Hook の条件付き呼び出し問題に対処済み。全ての Hook（`useAuthState`, `useAppStore`, `useEffect`）はコンポーネントのトップレベルで呼び出され、`isSettingsView` による早期 return はその後に配置される。PASS。

---

## 4. UI コンポーネント設計レビュー

### 4.1 Apple HIG 準拠

| 原則      | 判定 | 詳細                                                                              |
| --------- | ---- | --------------------------------------------------------------------------------- |
| Clarity   | PASS | 警告アイコン + 明確なテキスト + アクションボタン2つ。情報階層が明確               |
| Deference | PASS | 装飾を控え、コンテンツ（エラー状態の説明）に焦点。背景は `bg-[var(--bg-primary)]` |
| Depth     | PASS | フォールバック UI は全画面表示。レイヤー構造は LoadingScreen と同等               |

### 4.2 Apple HIG System Colors

| 要素               | カラートークン     | ライト               | ダーク                  | 判定 |
| ------------------ | ------------------ | -------------------- | ----------------------- | ---- |
| 背景               | `--bg-primary`     | `#FFFFFF`            | `#000000`               | PASS |
| 警告アイコン       | `--status-warning` | `#FF9500`            | `#FF9F0A`               | PASS |
| プライマリテキスト | `--text-primary`   | `#000000`            | `#FFFFFF`               | PASS |
| セカンダリテキスト | `--text-secondary` | `rgba(60,60,67,0.6)` | `rgba(235,235,245,0.6)` | PASS |
| プライマリボタン   | `--accent-primary` | `#007AFF`            | `#0A84FF`               | PASS |

### 4.3 Atomic Design

| コンポーネント        | レベル    | 判定 | 詳細                                                                       |
| --------------------- | --------- | ---- | -------------------------------------------------------------------------- |
| `AuthTimeoutFallback` | organisms | PASS | 複数の atoms（Icon, Button）と独自構造を組み合わせた自己完結コンポーネント |
| `Icon`                | atoms     | PASS | 既存コンポーネントの再利用                                                 |
| `Spinner`             | atoms     | N/A  | AuthTimeoutFallback では未使用（LoadingScreen でのみ使用）                 |

### 4.4 アクセシビリティ（WCAG 2.1 AA）

| チェック項目               | 判定 | 詳細                                                                                |
| -------------------------- | ---- | ----------------------------------------------------------------------------------- |
| コントラスト比（テキスト） | PASS | プライマリテキストは `#000000` on `#FFFFFF`（21:1）/ `#FFFFFF` on `#000000`（21:1） |
| コントラスト比（ボタン）   | PASS | `#007AFF` on `#FFFFFF` は 4.5:1 以上。白テキスト on `#007AFF` も 4.5:1 以上         |
| キーボードアクセス         | PASS | `<button type="button">` で Tab/Enter/Space 操作可能                                |
| スクリーンリーダー         | PASS | `role="alert"` + `aria-live="assertive"` + 各ボタンに `aria-label`                  |
| フォーカス表示             | PASS | `focus-visible:ring-2` でフォーカスリングを表示                                     |

### 4.5 レスポンシブデザイン

設計レポートでは明示的なレスポンシブ対応の記載なし。ただし、フォールバック UI は `flex-col items-center justify-center` の中央配置であり、画面サイズに関係なく適切に表示される。モバイルモードでのボタンサイズ（タッチターゲット 44x44px 以上）の確認は Phase 4 のテストで検証する。MINOR（後続確認で十分）。

---

## 5. 指摘事項

### 5.1 MINOR 指摘

#### MINOR-1: useAuthState 戻り値型変更の既存テスト影響

`useAuthState` の戻り値が `AuthGuardDisplayState`（文字列）からオブジェクト `{ state, retry }` に変更される。既存の `AuthGuard.test.tsx` では `useAuthState` を直接モックしていないが、AuthGuard 内部で `authState` を switch 文で使用しているため、Store モック経由の間接テストが影響を受ける可能性がある。

**対処**: Phase 4 で既存テストの互換性を確認し、必要に応じてモック更新。Phase 5 で実装時に対応。

#### MINOR-2: タイムアウト定数のエクスポート

`AUTH_GUARD_TIMEOUT_MS` がテストから参照可能であることを確認する。テスト側で `vi.advanceTimersByTime(AUTH_GUARD_TIMEOUT_MS)` を使用するため、定数のエクスポートが必要。

**対処**: Phase 4 のテスト設計で import 可能であることを確認。

#### MINOR-3: AuthTimeoutFallback のモバイルタッチターゲット

ボタンの最小タッチターゲットサイズ（44x44px）の確認が設計に含まれていない。

**対処**: Phase 4 のテスト設計で検証項目に追加。`px-6 py-3` は高さ約 48px を確保するため、おそらく十分だが明示的な確認が必要。

---

## 6. レビューゲート判定

### 判定: PASS

Phase 2 の設計は要件（AC-1 から AC-8）を全て満たしており、セキュリティ4原則（最小権限、多層防御、フェイルセキュア、完全仲介）に準拠している。状態遷移ロジックに無限ループのリスクなし。P31/P48/P5/P13/P39 の既知の落とし穴に対する対策が設計に組み込まれている。

MINOR 指摘3件は Phase 4（テスト作成）の着手時に対処可能であり、設計の変更は不要。

Phase 4 へ進む。

---

## 7. レビュー実施情報

- **レビュー日**: 2026-03-09
- **レビュー対象**: Phase 2 設計レポート（design-report.md）
- **レビュー範囲**: 要件整合性、セキュリティ、状態遷移、UI/UX、アクセシビリティ
- **判定**: PASS（MINOR 指摘3件は Phase 4 で対処）
