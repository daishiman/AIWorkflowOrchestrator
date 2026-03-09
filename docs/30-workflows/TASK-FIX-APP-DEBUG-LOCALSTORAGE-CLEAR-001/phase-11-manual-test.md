# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase      | 11                                        |
| Phase名    | 手動テスト                                |
| カテゴリ   | fix                                       |
| ステータス | pending                                   |
| 前提Phase  | Phase 10                                  |
| 後続Phase  | Phase 12                                  |

## 目的

修正後のアプリケーションを手動で操作し、persist 状態の保持やエラーの非発生を確認する。

## 実行タスク

### タスク1: 起動テスト

**目的**: アプリが正常に起動し、デバッグコードが実行されないことを確認する

**手順**:

1. `pnpm --filter @repo/desktop dev` でアプリを起動
2. DevTools コンソールを開く
3. `[DEBUG] Clearing all storage for clean auth test...` メッセージが出力されないことを確認
4. `localStorage` の内容が保持されていることを確認（DevTools > Application > Local Storage）
5. `BROWSER_GET_LAST_WEB_PREFERENCES` エラーが発生しないことを確認

**期待結果**: デバッグログなし、エラーなし

### タスク2: persist 状態保持テスト

**目的**: AC-3（Zustand persist 状態がアプリ再起動後も保持されること）を検証する

**手順**:

1. アプリを起動
2. Settings 画面で設定を変更（テーマ切替など）
3. DevTools > Application > Local Storage で persist データの存在を確認
4. アプリを終了
5. アプリを再起動
6. 変更した設定が保持されていることを確認
7. DevTools > Application > Local Storage で persist データが消えていないことを確認

**期待結果**: 設定が保持されている、persist データが存在する

### タスク3: 連続起動テスト

**目的**: 複数回の起動で `sessionStorage` ベースのデバッグ動作が発生しないことを確認する

**手順**:

1. アプリを起動 → 終了 → 再起動 を3回繰り返す
2. 各起動時に `localStorage` が消えていないことを確認
3. `window.location.reload()` による画面フラッシュが発生しないことを確認

**期待結果**: 3回の起動全てで正常動作

### タスク4: E2E テスト互換性確認

**目的**: AC-5（E2Eテストが引き続き動作すること）を確認する

**手順**:

1. `VITE_E2E_MODE=true` 環境変数を設定した状態でアプリが起動できることを確認
2. `skipAuth=true` パラメータでの起動に影響がないことを確認
3. 既存の E2E テストスクリプトが存在する場合は実行

**注意**: VITE_E2E_MODE と skipAuth=true はデバッグコード内でのみ使用されていたため、削除による影響はない。ただし、他の箇所で使用されている場合に備えて確認する。

## 参照資料

| 参照資料        | パス                                                                                   |
| --------------- | -------------------------------------------------------------------------------------- |
| Phase 10 成果物 | `docs/30-workflows/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-10-final-review.md` |
| P53             | `.claude/rules/06-known-pitfalls.md` (CLI環境でのスクリーンショット取得制約)           |

## 統合テスト連携

- 手動テスト結果を Phase 12 のドキュメントに記録
- CLI 環境ではスクリーンショット取得が困難なため、P53 準拠で自動テスト結果を代替とする

## 成果物

| 成果物         | パス                                     |
| -------------- | ---------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` |

## 完了条件

- [ ] 起動テストで デバッグログ・エラーが発生しないことを確認
- [ ] persist 状態がアプリ再起動後も保持されることを確認
- [ ] 連続起動テストで安定動作を確認
- [ ] E2E テスト互換性が確認されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 12: ドキュメントへ進む。
