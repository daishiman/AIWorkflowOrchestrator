# Phase 11: 手動テスト

## メタ情報

| 項目      | 値                                            |
| --------- | --------------------------------------------- |
| Phase     | 11                                            |
| タスクID  | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| 機能名    | supabase-fallback-profile-avatar              |
| 作成日    | 2026-03-07                                    |
| 前提Phase | Phase 10 最終レビュー（PASS）                 |

## 目的

Supabase未設定環境と設定済み環境の両方で、Profile/Avatar操作が期待どおりに動作することを手動で確認する。

## 実行タスク

### Task 1: Supabase未設定環境での手動テスト

#### 前提条件

- `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を未設定（`.env` から削除またはコメントアウト）
- アプリをクリーンビルドして起動

#### テストシナリオ

| #    | 操作                      | 期待結果                                                                                                                                    | 結果   |
| ---- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| MT-1 | アプリ起動                | クラッシュせず起動完了。コンソールに `[IPC] Auth, profile, and avatar handlers not registered - Supabase not configured` のログが出力される | 要確認 |
| MT-2 | Profile画面を開く         | クラッシュしない。「サービス未設定」のエラー表示またはグレースフル表示                                                                      | 要確認 |
| MT-3 | Profile情報の取得を試行   | `{ success: false, error: { code: 'PROFILE_NOT_CONFIGURED' } }` が返され、画面がクラッシュしない                                            | 要確認 |
| MT-4 | Avatar アップロードを試行 | `{ success: false, error: { code: 'AVATAR_NOT_CONFIGURED' } }` が返され、画面がクラッシュしない                                             | 要確認 |
| MT-5 | Auth画面を開く            | 既存のフォールバックが動作し、正常表示（回帰なし）                                                                                          | 要確認 |

### Task 2: Supabase設定済み環境での手動テスト（回帰確認）

#### 前提条件

- `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定
- アプリをクリーンビルドして起動

#### テストシナリオ

| #    | 操作              | 期待結果                                   | 結果   |
| ---- | ----------------- | ------------------------------------------ | ------ |
| MT-6 | アプリ起動        | 通常起動。フォールバックログが出力されない | 要確認 |
| MT-7 | Profile画面を開く | 通常のProfile機能が動作                    | 要確認 |
| MT-8 | Avatar操作を試行  | 通常のAvatar機能が動作                     | 要確認 |

### Task 3: DevTools検証

| #    | 確認項目                                    | 方法                      | 結果   |
| ---- | ------------------------------------------- | ------------------------- | ------ |
| DT-1 | コンソールに未処理例外がない                | DevTools Console タブ確認 | 要確認 |
| DT-2 | `Error: No handler registered` が発生しない | DevTools Console タブ確認 | 要確認 |
| DT-3 | ネットワークタブに不正なリクエストがない    | DevTools Network タブ確認 | 要確認 |

## 参照資料

| 資料名           | パス                                                                                         | 説明         |
| ---------------- | -------------------------------------------------------------------------------------------- | ------------ |
| Phase 1 要件定義 | `docs/30-workflows/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/phase-1-requirements.md` | 再現シナリオ |
| Phase 5 実装     | `apps/desktop/src/main/ipc/index.ts`                                                         | 実装コード   |

### システム仕様（aiworkflow-requirements）

- `references/api-ipc-auth.md` - 認証IPC仕様

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

1. Supabase環境変数を未設定にする
2. アプリをクリーンビルド（`pnpm --filter @repo/desktop build`）
3. アプリを起動
4. MT-1〜MT-5のテストシナリオを実行
5. Supabase環境変数を設定する
6. アプリを再ビルド・起動
7. MT-6〜MT-8のテストシナリオを実行
8. DT-1〜DT-3のDevTools検証を実施

## 成果物

| 成果物         | パス                                                                                         | 説明           |
| -------------- | -------------------------------------------------------------------------------------------- | -------------- |
| 手動テスト結果 | `docs/30-workflows/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/phase-11-manual-test.md` | 本ドキュメント |

## 完了条件

- [ ] MT-1〜MT-5（Supabase未設定）の全シナリオが期待結果と一致
- [ ] MT-6〜MT-8（Supabase設定済み）の全シナリオが期待結果と一致（回帰なし）
- [ ] DT-1〜DT-3のDevTools検証が全項目クリア
- [ ] 画面クラッシュが発生しないことを確認

## 次のPhase

Phase 12: ドキュメント更新
