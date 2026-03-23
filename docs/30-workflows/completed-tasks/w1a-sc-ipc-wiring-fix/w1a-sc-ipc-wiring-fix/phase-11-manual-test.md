# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 11                        |
| タスクID | TASK-SC-01-IPC-WIRING-FIX |
| 作成日   | 2026-03-22                |

## 目的

Electron アプリを実際に起動し、`skill-creator:*` 機能が統合後も正常に動作することを確認する。特に P65 解消後の Renderer からの呼び出しが全て到達していることを E2E 観点で検証する。

## 実行タスク

1. `pnpm --filter @repo/desktop dev` でアプリを起動する
2. DevTools コンソールで `window.electronAPI` の `skill-creator:*` 関連メソッドが存在することを確認する
3. `creator:*` namespace のメソッドが `undefined` であることを確認する（dead-end 解消確認）
4. Skill Creator 画面を開き、以下のシナリオを実行する:
   - スキル作成フローの開始（plan チャネルの動作確認）
   - スキルのステータス取得（status チャネルの動作確認）
   - スキルのキャンセル操作（cancel チャネルの動作確認）
5. DevTools の Network/IPC タブで `skill-creator:*` チャネルが使用されていることを確認する
6. エラーがコンソールに出ていないことを確認する
7. CLI 環境の場合は Playwright スクリプトで代替検証を行う（P53対策）

## 参照資料

- `.claude/rules/06-known-pitfalls.md#P53`（CLI環境スクリーンショット制約）
- `.claude/rules/06-known-pitfalls.md#P28`（旧API undefined確認）

## 成果物

- 手動テスト実施記録（チェックリスト形式）
- 発見した不具合のリスト（0件でも記録）
- Playwright 代替検証スクリプト（CLI環境の場合）

## 完了条件

- [ ] Electron アプリが正常起動している
- [ ] `window.electronAPI` の `skill-creator:*` メソッドが全て存在している
- [ ] `creator:*` namespace のメソッドが存在しないことが確認されている
- [ ] Skill Creator の主要3シナリオ（plan/status/cancel）が動作している
- [ ] コンソールにエラーが出ていない

## 次のPhase

Phase 12: ドキュメント
