# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 11                               |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 作成日   | 2026-03-22                       |

## 目的

自然言語入力→plan→execute→完了の UI フロー全体を手動で確認する。TerminalHandoff 表示の動作確認と既存フローの非破壊を確認する。

## 実行タスク

1. 手動テスト環境の準備
   - Electron アプリを開発モードで起動 (`pnpm --filter @repo/desktop dev`)
   - Anthropic API キーが設定されていることを確認
2. 手動テストシナリオ MT-1: LLM 生成フロー全体
   - SkillLifecyclePanel を開く
   - 「新しいスキルを作成」ボタンをクリック
   - DescribeStep で「何を自動化したいですか？」に「GitHub のプルリクエストを自動的にレビューする」と入力
   - 「LLM で生成」ボタンをクリック
   - GenerateStep で plan 結果が表示されることを確認（AC-1）
   - 「実行する」ボタンをクリック
   - TerminalHandoff 表示が表示されることを確認（AC-3）
   - 実行完了後にスキルリストに新スキルが追加されることを確認（AC-4）
3. 手動テストシナリオ MT-2: 既存フロー（テンプレートから作成）の非破壊確認
   - DescribeStep で「テンプレートから作成」を選択
   - 従来のウィザードフローが正常に動作することを確認（AC-7）
4. 手動テストシナリオ MT-3: planSkill エラー時のフォールバック確認
   - 無効な入力で planSkill を呼び出し
   - エラーメッセージが UI に表示されることを確認
5. スクリーンショット記録（P53対策）
   - CLI 環境の場合: `webContents.capturePage()` でキャプチャ
   - または Playwright の `page.screenshot()` で自動取得
6. テスト結果を本ファイルに記録する

## 参照資料

- Phase 10 最終レビュー報告書
- `apps/desktop/src/renderer/components/skill/`
- `.claude/rules/06-known-pitfalls.md`（P53: CLI 環境でのスクリーンショット制約）

## 成果物

- 手動テスト結果レポート（MT-1〜MT-3 の結果）
- スクリーンショット（可能な場合）

## 完了条件

- [ ] MT-1（LLM 生成フロー全体）を実行し結果を記録した
- [ ] AC-1（LLM 生成フロー開始）を確認した
- [ ] AC-3（TerminalHandoff 表示）を確認した
- [ ] AC-4（実行完了後スキル利用可能）を確認した
- [ ] MT-2（既存フロー非破壊）を実行し結果を記録した（AC-7）
- [ ] MT-3（planSkill エラーフォールバック）を実行し結果を記録した
- [ ] 全シナリオで期待結果と一致したことを確認した
- [ ] 失敗したシナリオがある場合は原因を記録した

## 次のPhase

Phase 12: ドキュメント
