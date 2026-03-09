# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase      | 1                                              |
| Phase名    | 要件定義                                       |
| カテゴリ   | fix                                            |
| 優先度     | Priority 3                                     |
| ステータス | pending                                        |
| 前提Phase  | なし                                           |
| 後続Phase  | Phase 2                                        |

## 目的

AuthGuard の無限ブロック問題と Settings 画面への到達不能問題を解決するために、要件を正確に定義し受け入れ基準を策定する。

## 背景

### 問題1: AuthGuard の無限ブロック

AuthGuard が `isLoading === true` の間、全画面 `<LoadingScreen />` を表示してアプリ全体をブロックする。`getAuthState.ts` で `isLoading` が `true` の場合、常に `"checking"` を返すため、認証初期化が遅延/失敗した場合にユーザーはどの画面にも到達できない。

```typescript
// apps/desktop/src/renderer/components/AuthGuard/hooks/useAuthState.ts
// → getAuthState({ isLoading, isAuthenticated }) を呼び出し

// apps/desktop/src/renderer/components/AuthGuard/utils/getAuthState.ts (L45)
if (isLoading) return "checking"; // isLoading=true → 常に "checking"
```

### 問題2: Settings 画面が認証ガード内

Settings 画面は認証の前提条件（APIキー設定）を扱うにもかかわらず、AuthGuard 内に配置されている。認証初期化が失敗すると Settings に到達できず、APIキーの設定もできない悪循環が発生する。

```typescript
// apps/desktop/src/renderer/App.tsx (L184-361)
<BrowserRouter>
  <AuthGuard>  {/* 全ルートが AuthGuard 内 */}
    <Routes>
      {/* ... Settings を含む全ルート ... */}
    </Routes>
  </AuthGuard>
</BrowserRouter>
```

### 影響分析

1. 認証初期化が遅延/失敗した場合、ユーザーはどの画面にも到達できない
2. Settings 画面に到達できないため、APIキーの設定・変更が不可能
3. アプリが「白い画面 + スピナー」で永久停止する
4. ユーザーにリカバリー手段が提供されていない

## 実行タスク

### タスク1: 現状コード調査

**目的**: 対象ファイルの現在の実装状態を正確に把握する

**手順**:

1. `AuthGuard/index.tsx` の現在の状態分岐ロジックを確認
2. `AuthGuard/hooks/useAuthState.ts` の状態取得ロジックを確認
3. `AuthGuard/utils/getAuthState.ts` の状態判定ロジックを確認
4. `AuthGuard/types.ts` の `AuthGuardDisplayState` 型を確認
5. `App.tsx` のルーティング構造と AuthGuard の配置を確認
6. `LoadingScreen.tsx` の現在のUI構成を確認

**期待される成果物**:

- 現状コードの調査レポート

### タスク2: 要件定義

**目的**: 修正内容の要件を明確に定義する

**手順**:

1. AuthGuard タイムアウト機能の要件を定義
   - タイムアウト時間: 10秒（`AUTH_TIMEOUT_MS = 10_000`）
   - タイムアウト後の表示: エラーメッセージ + リトライボタン + Settings遷移ボタン
   - タイムアウト後に認証完了した場合の自動遷移
2. Settings 画面の AuthGuard 除外要件を定義
   - Settings 画面は認証なしでアクセス可能
   - Settings 内の機密操作の保護レベルを検討
3. 既存機能への影響がないことを確認

**期待される成果物**:

- 要件定義書

### タスク3: 受け入れ基準の策定

**目的**: テスト可能な受け入れ基準を策定する

**受け入れ基準**:

| AC ID | 基準                                                                                   | 検証方法                                            |
| ----- | -------------------------------------------------------------------------------------- | --------------------------------------------------- |
| AC-1  | 認証初期化が10秒以内に完了しない場合、タイムアウトフォールバックUIが表示されること     | タイマーテスト（`advanceTimersByTime(10_000)`）     |
| AC-2  | フォールバックUIに「リトライ」ボタンが含まれ、クリックで認証再初期化が実行されること   | クリックイベントテスト + initializeAuth呼び出し検証 |
| AC-3  | フォールバックUIに「設定画面へ」ボタンが含まれ、クリックでSettings画面に遷移できること | ナビゲーションテスト                                |
| AC-4  | Settings画面がAuthGuard認証なしで直接アクセス可能であること                            | ルーティングテスト                                  |
| AC-5  | 認証成功時は従来どおり即座にコンテンツが表示されること                                 | 既存テスト回帰                                      |
| AC-6  | タイムアウト後に認証が完了した場合、自動的にコンテンツが表示されること                 | 状態遷移テスト                                      |
| AC-7  | ダークモード/ライトモード両方でフォールバックUIが正しく表示されること                  | ビジュアルテスト                                    |
| AC-8  | 全既存テストがPASSすること                                                             | テストスイート実行                                  |

## スコープ

### 含む

- AuthGuard にタイムアウトロジック追加
- タイムアウト時のフォールバックUI（エラーメッセージ + リトライボタン + Settings遷移ボタン）
- Settings 画面の AuthGuard 除外ルート追加
- `useAuthState` hook にタイムアウト管理追加
- `AuthGuardDisplayState` 型に `"timed-out"` を追加

### 含まない

- `safeInvoke` の変更（別タスク: TASK-FIX-SAFEINVOKE-TIMEOUT-001）
- デバッグコードの削除（別タスク: TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001）
- 認証フロー自体の修正
- Supabase クライアントの変更

## 対象ファイル

| ファイル                                                               | 変更内容                                      |
| ---------------------------------------------------------------------- | --------------------------------------------- |
| `apps/desktop/src/renderer/components/AuthGuard/types.ts`              | `AuthGuardDisplayState` に `"timed-out"` 追加 |
| `apps/desktop/src/renderer/components/AuthGuard/utils/getAuthState.ts` | `isTimedOut` パラメータ追加                   |
| `apps/desktop/src/renderer/components/AuthGuard/hooks/useAuthState.ts` | タイムアウトロジック追加                      |
| `apps/desktop/src/renderer/components/AuthGuard/index.tsx`             | `"timed-out"` 時のフォールバックUI追加        |
| `apps/desktop/src/renderer/components/AuthGuard/LoadingScreen.tsx`     | タイムアウト表示の統合（必要に応じて）        |
| `apps/desktop/src/renderer/App.tsx`                                    | Settings 除外ルート追加                       |

## 関連する既知の落とし穴

| Pitfall | 内容                                         | 対策                                            |
| ------- | -------------------------------------------- | ----------------------------------------------- |
| P31     | Zustand Store Hooks無限ループ                | useAuthState のセレクタ設計で個別セレクタを使用 |
| P48     | useShallow未適用による派生セレクタ無限ループ | 派生セレクタを使用する場合は useShallow を適用  |
| P13     | タイマーテストの無限ループ                   | `advanceTimersByTime` で1ステップずつ進める     |
| P39     | happy-dom環境でのuserEvent非互換             | `fireEvent` を使用                              |

## セキュリティ考慮事項

1. Settings 画面を AuthGuard 外に出す場合、Settings 内の機密操作（APIキー表示等）は既存の保護メカニズムで十分か検討
2. AuthGuard バイパスルートが認証なしでアクセスできるビューを最小限に留める
3. タイムアウトフォールバックUIからの遷移先を Settings のみに限定する

## 参照資料

| 参照資料                 | パス                                              |
| ------------------------ | ------------------------------------------------- |
| AuthGuard コンポーネント | `apps/desktop/src/renderer/components/AuthGuard/` |
| App.tsx ルーティング     | `apps/desktop/src/renderer/App.tsx`               |
| 状態管理ルール           | `.claude/rules/03-state-management.md`            |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`              |

## 成果物

| 成果物     | パス                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| 要件定義書 | `docs/30-workflows/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-1-requirements.md` |

## 完了条件

- [ ] 現状コードの調査が完了し、問題箇所が特定されていること
- [ ] 受け入れ基準（AC-1〜AC-8）が策定されていること
- [ ] スコープが明確に定義されていること
- [ ] セキュリティ考慮事項が検討されていること
- [ ] 関連する既知の落とし穴が列挙されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 2: 設計へ進む。AuthGuard のタイムアウト機能と Settings 除外ルートの詳細設計を行う。
