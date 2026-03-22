# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 11                         |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-22                 |

## 目的

実際の Anthropic API を使用して plan() を呼び出し、自然言語入力からスキル構造計画が返ることを実環境で確認する。

## 実行タスク

1. **環境準備**
   - Anthropic API キーが環境変数（`ANTHROPIC_API_KEY`）に設定されていることを確認する
   - Electron アプリを開発モードで起動する（`pnpm --filter @repo/desktop dev`）
2. **正常系テスト**
   - シナリオ A: 「GitHubのIssueを自動で分類するスキルを作りたい」という入力で plan() を呼び出す
     - skillName / description / agents / scripts / triggers / anchors が返ることを確認する
   - シナリオ B: 「Slackメッセージを要約してNotionに保存するスキル」という入力で plan() を呼び出す
     - 前回と異なるスキル構造が返ることを確認する
3. **terminal_handoff 経路テスト**
   - integrated_api モードを false に設定して plan() を呼び出す
   - terminal_handoff レスポンスが返り、LLM が呼び出されないことを確認する（ログで確認）
4. **エラー系テスト**
   - 無効な API キーで plan() を呼び出し、エラーが適切にハンドリングされることを確認する
5. **P53 対策: スクリーンショット取得**
   - CLI 環境の場合、`webContents.capturePage()` でスクリーンショットを取得するか、テストログを代替記録とする

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/03-phase-10-final-review.md`
- `.claude/rules/06-known-pitfalls.md`（P53: CLI 環境でのスクリーンショット取得制約）

## 成果物

- `docs/30-workflows/skill-creator-llm-integration/03-phase-11-manual-test-output.md`（手動テスト結果記録）
  - 各シナリオの入力・出力の記録
  - 実際の LLM レスポンス（JSON 構造）のサンプル

## 完了条件

- [ ] Anthropic API に実際に接続し、plan() が構造計画を返した
- [ ] シナリオ A・B の結果（入力・出力 JSON）を記録した
- [ ] terminal_handoff 経路が正常に動作することを確認した
- [ ] 無効 API キー時のエラーハンドリングを確認した
- [ ] 結果を `03-phase-11-manual-test-output.md` に記録した

## 次のPhase

Phase 12: ドキュメント
