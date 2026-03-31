# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 11                                |
| 機能名 | safety-gov-production-integration |
| 作成日 | 2026-03-31                        |

## 目的

Electron アプリを実際に起動し、approval フロー・disclosure 情報表示・terminal log 表示・revokeAll() の動作を手動で確認する。

## タスク分類（Phase 1 確認）

| 分類       | 値                                                                          |
| ---------- | --------------------------------------------------------------------------- |
| 表示変更   | No（新規 visible surface 追加なし）                                         |
| NON_VISUAL | Yes（Phase 11 は IPC / preload / session cleanup の統合確認を主対象とする） |

## 実行タスク

- Electron 起動と handler 登録状態を手動で確認する
- preload 経由の `execution` API 到達性を確認する
- approval request / respond / revokeAll の統合フローを確認する
- 発見事項を current facts と未タスク要否に分けて記録する

### 1. 手動テスト環境準備

```bash
# 開発ビルド起動
pnpm --filter @repo/desktop dev
```

### 2. 手動テストチェックリスト

#### 2.1 IPC Handler 登録確認

| チェック項目                                         | 手順                    | 期待結果               | 結果 |
| ---------------------------------------------------- | ----------------------- | ---------------------- | ---- |
| アプリ起動時にエラーがないか                         | DevTools Console を確認 | handler 登録エラーなし | -    |
| `registerApprovalHandlers` が登録されているか        | ログ確認                | 登録成功ログ           | -    |
| `registerDisclosureHandlers` が登録されているか      | ログ確認                | 登録成功ログ           | -    |
| `registerAdvancedConsoleHandlers` が登録されているか | ログ確認                | 登録成功ログ           | -    |

#### 2.2 Preload execution API 確認

| チェック項目                                | 手順                                                              | 期待結果            | 結果 |
| ------------------------------------------- | ----------------------------------------------------------------- | ------------------- | ---- |
| `window.electronAPI.execution` が存在するか | DevTools Console: `window.electronAPI.execution`                  | Object が表示される | -    |
| `getDisclosureInfo` が呼び出せるか          | Console: `await window.electronAPI.execution.getDisclosureInfo()` | レスポンス返却      | -    |

#### 2.3 Approval フロー確認

| チェック項目                             | 手順                  | 期待結果                    | 結果 |
| ---------------------------------------- | --------------------- | --------------------------- | ---- |
| approval:request push 通知が受信されるか | Main から手動送信     | Renderer 側でイベントが発火 | -    |
| respondApproval が動作するか             | approve/reject を送信 | Main Process が応答を受信   | -    |

#### 2.4 セッション終了確認

| チェック項目                              | 手順                         | 期待結果                         | 結果 |
| ----------------------------------------- | ---------------------------- | -------------------------------- | ---- |
| セッション終了時に revokeAll が呼ばれるか | セッションを abort/done する | ログで revokeAll(sessionId) 確認 | -    |

### 3. 発見事項の記録

| 発見 No. | 内容 | 種別（バグ/改善/スコープ外） | 対応 |
| -------- | ---- | ---------------------------- | ---- |
| -        | -    | -                            | -    |

## 参照資料

| 参照資料              | パス                              |
| --------------------- | --------------------------------- |
| Phase 10 最終レビュー | `outputs/phase-10/review-gate.md` |

## 統合テスト連携【必須】

| 判定項目                       | 基準      | 結果（実行時に記録） |
| ------------------------------ | --------- | -------------------- |
| 手動チェックリスト全 PASS      | 全項目 OK | -                    |
| 発見事項が未タスク化されている | 対応済み  | -                    |

## 成果物

| 成果物           | パス                                                               | 説明                             |
| ---------------- | ------------------------------------------------------------------ | -------------------------------- |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                           | チェックリスト結果・発見事項     |
| 非可視タスク証跡 | `outputs/phase-11/screenshots/TC-11-00-non-visual-placeholder.png` | validator 整合用 placeholder PNG |

## 完了条件

- [ ] 全手動テストチェックリストが実行されている
- [ ] IPC handler 登録がアプリ起動で確認されている
- [ ] `window.electronAPI.execution` が公開されていることが確認されている
- [ ] approval フローが動作することが確認されている
- [ ] セッション終了時の revokeAll() が確認されている
- [ ] 発見事項があれば未タスク化されている
- [ ] `outputs/phase-11/manual-test-result.md` が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新
