# TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001

## AuthGuard タイムアウトフォールバック + Settings認証除外

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| タスク種別 | fix                                            |
| 優先度     | Priority 3                                     |
| ステータス | pending                                        |

## 概要

AuthGuard が `isLoading === true` の間、全画面をブロックし続ける問題と、Settings 画面が AuthGuard 内にあるため認証失敗時に到達不能になる問題を修正する。

### 修正内容

1. **AuthGuard にタイムアウト付きフォールバック**: 10秒タイムアウト後にエラーメッセージ + リトライボタン + Settings遷移ボタンを表示
2. **Settings 画面を AuthGuard 除外ルートに追加**: App.tsx のルーティングで Settings を AuthGuard 外に配置

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

## 対象ファイル

| ファイル                                                                 | 変更種別 |
| ------------------------------------------------------------------------ | -------- |
| `apps/desktop/src/renderer/components/AuthGuard/types.ts`                | 修正     |
| `apps/desktop/src/renderer/components/AuthGuard/utils/getAuthState.ts`   | 修正     |
| `apps/desktop/src/renderer/components/AuthGuard/hooks/useAuthState.ts`   | 修正     |
| `apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx` | 新規     |
| `apps/desktop/src/renderer/components/AuthGuard/index.tsx`               | 修正     |
| `apps/desktop/src/renderer/App.tsx`                                      | 修正     |

## 受け入れ基準

- AC-1: 認証初期化が10秒以内に完了しない場合、タイムアウトフォールバックUIが表示されること
- AC-2: フォールバックUIに「リトライ」ボタンが含まれ、クリックで認証再初期化が実行されること
- AC-3: フォールバックUIに「設定画面へ」ボタンが含まれ、クリックでSettings画面に遷移できること
- AC-4: Settings画面がAuthGuard認証なしで直接アクセス可能であること
- AC-5: 認証成功時は従来どおり即座にコンテンツが表示されること
- AC-6: タイムアウト後に認証が完了した場合、自動的にコンテンツが表示されること
- AC-7: ダークモード/ライトモード両方でフォールバックUIが正しく表示されること
- AC-8: 全既存テストがPASSすること

## 関連タスク

- TASK-FIX-SAFEINVOKE-TIMEOUT-001（safeInvoke タイムアウト — 別タスク）
- TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001（デバッグコード削除 — 別タスク）

## 関連する既知の落とし穴

- P31: Zustand Store Hooks無限ループ
- P48: useShallow未適用による派生セレクタ無限ループ
- P13: タイマーテストの無限ループ
- P39: happy-dom環境でのuserEvent非互換
