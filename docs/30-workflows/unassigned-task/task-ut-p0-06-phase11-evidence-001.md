# UT-P0-06-PHASE11-EVIDENCE-001

## メタ情報

| 項目       | 値                                                                    |
| ---------- | --------------------------------------------------------------------- |
| ステータス | 未着手                                                                |
| 優先度     | High                                                                  |
| 起票日     | 2026-03-30                                                            |
| 起票元     | TASK-P0-06 Phase 12 / unassigned-task-detection.md                    |
| 関連タスク | TASK-P0-06 (conversational-interview-ui), UT-P0-06-CANONICAL-SYNC-001 |
| Issue番号  | #1767                                                                 |

## 1. なぜこのタスクが必要か（Why）

TASK-P0-06 では会話型インタビュー UI を実装し、Phase 12 のドキュメント化が完了した。
しかし Phase 11 の手動テストで必要な「代表的な実機スクリーンショット」と「手動テスト実行結果エビデンス」の取得が完了していない。

Phase 12 の `close-out` が incomplete のまま残っており、将来のリグレッション検出や PR レビューで実機動作の証跡が参照できない状態にある。

## 2. 何を達成するか（What）

以下を取得・記録する：

1. **代表スクリーンショット**（最低 3 枚）:
   - 会話型インタビューの初期状態（最初の質問が表示された状態）
   - 複数のユーザー回答が積み重なった中盤状態
   - 最終確認・スキル作成完了状態

2. **手動テスト実行結果**:
   - `outputs/phase-11/manual-test-result.md` に実機での動作確認結果を記録
   - エラー発生時は error-log も記録
   - Phase 11 のテストシナリオ（`manual-test-plan.md`）に沿った全ステップの実行確認

## 3. どのように実行するか（How）

1. アプリケーションをローカルで起動する（`pnpm --filter @repo/desktop dev`）
2. `docs/30-workflows/completed-tasks/step-09-par-task-p0-06-conversational-interview-ui/outputs/phase-11/manual-test-plan.md` のシナリオに沿って手動テストを実施する
3. 各テストステップで Electron のスクリーンショット機能または OS スクリーンショットで証跡を取得する
4. スクリーンショットを `outputs/phase-11/screenshots/` ディレクトリに配置する
5. `outputs/phase-11/manual-test-result.md` にテスト実行サマリーを記録する
6. Phase 12 の `completion-report.md` を「Phase 11 evidence: COMPLETE」に更新する

## 3.5 苦戦箇所と解決策

| 苦戦箇所                                    | 原因                                                             | 解決策                                                                                             |
| ------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Electron 実機環境でのスクリーンショット取得 | CI 環境と異なり、実際のウィンドウが必要                          | ローカル dev 環境で手動実行し、OS スクリーンショット（Cmd+Shift+4）で取得する                      |
| 会話型 UI の状態遷移の再現                  | Phase 11 テスト時点の UI が PR マージ後に変更されている可能性    | `git log` で TASK-P0-06 の実装コミットを確認し、必要に応じて `git checkout` で再現する             |
| Phase 12 完了後のドキュメント更新の矛盾     | `completion-report.md` が「incomplete」のまま close-out している | 本タスク完了後に `completion-report.md` と `phase-12-documentation.md` を同時更新する（same-wave） |

## 受入基準

| ID   | 基準                                                                               |
| ---- | ---------------------------------------------------------------------------------- |
| AC-1 | 代表スクリーンショット 3 枚以上が `outputs/phase-11/screenshots/` に保存されている |
| AC-2 | `outputs/phase-11/manual-test-result.md` に全シナリオの実行結果が記録されている    |
| AC-3 | `outputs/phase-12/completion-report.md` が Phase 11 evidence COMPLETE に更新済み   |
| AC-4 | スクリーンショットは会話型 UI の各主要ステート（初期・中盤・完了）を含む           |
