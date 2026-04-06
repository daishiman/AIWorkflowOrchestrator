# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 11                                                |
| 機能名   | Advanced Console 実セッションログ接続             |
| タスクID | UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 |
| 作成日   | 2026-04-02                                        |

## 手動テストシナリオ

### シナリオ 1: 実行中セッションのログ表示

1. Electron アプリを起動する
2. スキルを実行してセッションを開始する
3. Advanced Console パネルを開く
4. ターミナルログが空配列ではなく実ログが表示されることを確認する

**期待**: セッションの `output` が画面に表示される

### シナリオ 2: Copy Command 表示

1. 実行済みセッションを選択する
2. Advanced Console の Copy Command ボタンをクリックする
3. クリップボードに実起動形式（`node` + `scriptPath` + `args`）の文字列がコピーされることを確認する

**期待**: `node /path/to/skill.js [args]` 形式の文字列がコピーされる

### シナリオ 3: 存在しないセッション ID での操作

1. 無効な sessionId で `execution:get-terminal-log` を呼び出す
2. エラーが表示されること（空配列ではなくエラーレスポンス）を確認する

**期待**: エラー表示が表示される

## スモークテスト確認コマンド

```bash
# デスクトップアプリを開発モードで起動
pnpm --filter @repo/desktop dev
```

## 完了条件チェックリスト

- [ ] シナリオ 1 が正常動作することを確認した
- [ ] シナリオ 2 が正常動作することを確認した
- [ ] シナリオ 3 でエラー表示を確認した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 目的

Main process の IPC 接続改善タスクとして、Renderer UI 変更がないことを前提に
文書構成とリンク整合を確認する。

## 実行タスク

- docs walkthrough を行う。
- `NON_VISUAL` 判定を固定する。
- 必要な手動テスト成果物を `outputs/phase-11/` に出力する。

## 参照資料

- Phase 10 最終レビュー
- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-report.md`

## 成果物/実行手順

- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-report.md`
- `outputs/phase-11/discovered-issues.md`
- `outputs/phase-11/phase11-capture-metadata.json`

## 統合テスト連携

- `phase-12-documentation.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`
