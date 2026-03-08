# Phase 11: 手動テスト

## メタ情報

| 項目      | 値                                            |
| --------- | --------------------------------------------- |
| Phase     | 11                                            |
| タスクID  | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| 機能名    | supabase-fallback-profile-avatar              |
| 作成日    | 2026-03-08                                    |
| 前提Phase | Phase 10 最終レビュー（PASS）                 |

## 目的

Supabase 未設定時でも Settings 画面の Profile / Avatar 操作がクラッシュせず、fallback エラーが UI 上で安全に表示されることをスクリーンショット付きで確認する。

## 実行タスク

- Task 1: Settings 全体表示を撮影し、画面崩れがないことを確認する
- Task 2: Profile 通知設定更新で fallback エラーを表示し、クラッシュしないことを確認する
- Task 3: Avatar アップロードで fallback エラーを表示し、クラッシュしないことを確認する
- Task 4: Main IPC の補助テストを再実行し、19 チャネル fallback と再登録防止回帰が維持されていることを確認する

## テストケース

| TC-ID       | 分類       | シナリオ                    | 前提                                  | 操作                                          | 期待結果                                                                                     | 証跡                                                                  |
| ----------- | ---------- | --------------------------- | ------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| TC-11-UI-01 | SCREENSHOT | Settings 全体の正常表示     | Phase 11 harness で認証済み状態を注入 | `/phase11-auth-mode.html` を開く              | 設定画面の主要セクションが表示され、レイアウト崩れやクラッシュがない                         | `outputs/phase-11/screenshots/TC-11-UI-01-settings-overview.png`      |
| TC-11-UI-02 | SCREENSHOT | Profile fallback エラー表示 | Supabase fallback mock を注入         | 通知設定の「メール通知」を切り替える          | `profile/not-configured` 相当のエラーが画面上に表示され、通知設定 UI がクラッシュしない      | `outputs/phase-11/screenshots/TC-11-UI-02-profile-fallback-error.png` |
| TC-11-UI-03 | SCREENSHOT | Avatar fallback エラー表示  | Supabase fallback mock を注入         | 「アバターを編集」→「アップロード」を実行する | `avatar/not-configured` 相当のエラーが画面上に表示され、アカウント設定 UI がクラッシュしない | `outputs/phase-11/screenshots/TC-11-UI-03-avatar-fallback-error.png`  |

## 画面カバレッジマトリクス

| 画面 / 領域       | 状態                | テストケース | スクリーンショット                     | 確認観点                                                    |
| ----------------- | ------------------- | ------------ | -------------------------------------- | ----------------------------------------------------------- |
| SettingsView 全体 | 認証済み・通常表示  | TC-11-UI-01  | TC-11-UI-01-settings-overview.png      | セクション配置、主要情報、テーマ崩れなし                    |
| ProfileSection    | fallback エラー表示 | TC-11-UI-02  | TC-11-UI-02-profile-fallback-error.png | 通知トグル後の error banner、操作継続性                     |
| AccountSection    | fallback エラー表示 | TC-11-UI-03  | TC-11-UI-03-avatar-fallback-error.png  | avatar menu 操作後の error banner、アカウントカード崩れなし |

## 実行手順

1. `apps/desktop` で `npx vite --config vite.e2e.config.ts --host 127.0.0.1` を起動する
2. `node apps/desktop/scripts/capture-task-11-supabase-fallback-phase11.mjs` を実行する
3. `outputs/phase-11/screenshot-plan.json` と `outputs/phase-11/screenshots/phase11-capture-metadata.json` を確認する
4. `outputs/phase-11/screenshots/*.png` を目視し、レイアウト崩れとエラーバナー表示を確認する
5. `pnpm vitest run apps/desktop/src/main/ipc/__tests__/fallback-handlers.test.ts apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` を実行する

## 統合テスト連携

- Phase 10 で確定した AC-1〜AC-6 のうち、UI 露出を持つ Profile / Avatar fallback 経路を `TC-11-UI-01..03` で確認する
- 画面証跡では「表示崩れなし」「fallback error banner 表示」「No handler registered 不在」を確認し、補助テストで 19 チャネル契約を再確認する
- Phase 12 では本結果を `implementation-guide.md`、`spec-update-summary.md`、`unassigned-task-detection.md` の根拠として再利用する

## 参照資料

| 資料名           | パス                                                                                                                       | 説明          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Phase 1 要件定義 | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/phase-1-requirements.md`               | 受け入れ条件  |
| Phase 5 実装     | `apps/desktop/src/main/ipc/index.ts`                                                                                       | fallback 実装 |
| Screen plan      | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/outputs/phase-11/screenshot-plan.json` | 撮影計画      |

### システム仕様（aiworkflow-requirements）

- `references/api-ipc-auth.md` - Auth / Profile / Avatar fallback 契約
- `references/error-handling.md` - not-configured error code と UI 責務

## 成果物

| 成果物              | パス                                                                                                                         | 説明                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 手動テスト結果      | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/outputs/phase-11/manual-test-result.md`  | 判定と証跡                    |
| Screenshot coverage | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/outputs/phase-11/screenshot-coverage.md` | 3 ケース網羅性                |
| 発見事項            | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/outputs/phase-11/discovered-issues.md`   | Phase 11 で見つけた follow-up |

## 完了条件

- [ ] `TC-11-UI-01..03` の全スクリーンショットが取得済み
- [ ] `phase-11-manual-test.md` のテストケースと証跡ファイルが 1:1 で対応している
- [ ] Settings / Profile / Avatar で画面クラッシュが発生しない
- [ ] 補助テスト 36 件が PASS である
- [ ] 発見事項があれば `discovered-issues.md` と Phase 12 未タスクへ同期する

## 次のPhase

Phase 12: ドキュメント更新
