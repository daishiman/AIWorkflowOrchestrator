# Phase 4: テスト仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-FIX-GOOGLE-LOGIN-001 |
| Phase      | 4                         |
| 作成日     | 2026-02-04                |
| ステータス | 完了                      |

---

## テスト戦略

### TDD原則

1. **Red**: 失敗するテストを先に作成
2. **Green**: テストを通す最小限の実装
3. **Refactor**: コード品質を改善

### テストカテゴリ

| カテゴリ       | 説明                       | ファイルパターン        |
| -------------- | -------------------------- | ----------------------- |
| ユニットテスト | 単一関数・モジュールの検証 | `*.test.ts`             |
| 統合テスト     | モジュール間連携の検証     | `*.integration.test.ts` |
| IPC通信テスト  | Main/Renderer間通信の検証  | `*.ipc.test.ts`         |

---

## テスト対象モジュール

### 1. Auth Callbackエラーハンドリング

| テスト対象                 | ファイル                         |
| -------------------------- | -------------------------------- |
| OAuthエラーパラメータ検出  | `apps/desktop/src/main/index.ts` |
| エラーメッセージマッピング | 新規ユーティリティ関数           |

**テストファイル**: `apps/desktop/src/main/__tests__/auth-callback.test.ts`

### 2. Supabase設定検証

| テスト対象               | ファイル                             |
| ------------------------ | ------------------------------------ |
| AUTH_NOT_CONFIGURED追加  | `packages/shared/types/auth.ts`      |
| フォールバックレスポンス | `apps/desktop/src/main/ipc/index.ts` |

**テストファイル**: `packages/shared/types/__tests__/auth.test.ts`

### 3. セッション管理

| テスト対象                   | ファイル                                    |
| ---------------------------- | ------------------------------------------- |
| AuthSession型拡張            | `packages/shared/types/auth.ts`             |
| リフレッシュトークン期限送信 | `apps/desktop/src/main/ipc/authHandlers.ts` |

**テストファイル**: `apps/desktop/src/main/ipc/__tests__/authHandlers.test.ts`

### 4. 認証状態リスナー

| テスト対象       | ファイル                                              |
| ---------------- | ----------------------------------------------------- |
| 二重登録防止     | `apps/desktop/src/renderer/store/slices/authSlice.ts` |
| 動的タイムアウト | `apps/desktop/src/renderer/store/slices/authSlice.ts` |

**テストファイル**: `apps/desktop/src/renderer/store/slices/__tests__/authSlice.test.ts`

---

## テストカバレッジ目標

### ユニットテスト

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 統合テスト

| 指標              | 目標 |
| ----------------- | ---- |
| APIエンドポイント | 100% |
| 正常系シナリオ    | 100% |
| 異常系シナリオ    | 80%+ |

---

## テスト環境

### モックライブラリ

| ライブラリ | 用途                 |
| ---------- | -------------------- |
| vitest     | テストフレームワーク |
| vi.fn()    | 関数モック           |
| vi.mock()  | モジュールモック     |

### モック対象

| モジュール                | モック理由           |
| ------------------------- | -------------------- |
| window.electronAPI        | Rendererプロセス環境 |
| Supabase Auth             | 外部サービス依存     |
| BrowserWindow.webContents | Electron IPC         |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-02-04 | 1.0.0      | 初版作成 |
