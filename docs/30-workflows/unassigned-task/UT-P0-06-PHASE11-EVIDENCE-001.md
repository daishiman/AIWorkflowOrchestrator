# UT-P0-06-PHASE11-EVIDENCE-001

## メタ情報

| 項目       | 値                                                                    |
| ---------- | --------------------------------------------------------------------- |
| ステータス | 未着手                                                                |
| 優先度     | High                                                                  |
| 起票日     | 2026-03-30                                                            |
| 起票元     | TASK-P0-06 Phase 12 / unassigned-task-detection.md                    |
| 関連タスク | TASK-P0-06 (conversational-interview-ui), UT-P0-06-CANONICAL-SYNC-001 |
| Issue番号  | #1746                                                                 |

## 1. なぜこのタスクが必要か（Why）

TASK-P0-06（会話型インタビューUI）の Phase 11 において、手動テスト実施とrepresentative screenshotsの取得が未完のまま Phase 12 に進んだ。
UIタスクでは実動作の目視確認と証跡（スクリーンショット）が Phase 12 close-out の必須要件であり、これが欠如した状態では Phase 12 完了を宣言できない。
Phase 13（マージ・クローズアウト）および `aiworkflow-requirements` への同期もブロックされている。

## 2. 何を達成するか（What）

Electron アプリ上で会話型インタビューUIを実際に操作し、以下を取得・整備する：

- representative screenshots（各主要状態ごと）
- 手動テスト結果（Phase 11 テストプランに基づく実行ログ）
- Phase 11 完了宣言（manual-test-result: passed）

## 3. どのように実行するか（How）

1. Electron アプリをローカルで起動する
2. Phase 11 テストプランに従い、会話型インタビューUIを手動操作する
3. 各主要状態のスクリーンショットを取得する
4. テスト結果を `outputs/phase-11/manual-test-result.md` に記録する
5. `outputs/artifacts.json` の Phase 11 ステータスを `completed` に更新する

## 3.5 苦戦箇所と解決策

| 苦戦箇所                       | 原因                                                                                               | 解決策                                                                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| UIタスクのEvidence取得の難しさ | CIではUIの目視確認が不可能で、自動テストだけでは「画面が正しく見える」証跡にならない               | Electronアプリを実際に起動し、手動操作でスクリーンショットを取得する                                         |
| Phase 12 完了判定の曖昧さ      | completion-report.mdが存在するだけで「完了済み」に見えてしまい、Phase 11未完が見落とされがちだった | artifacts.jsonのPhase単位ステータスを常に確認する習慣を徹底する                                              |
| テストプランと実施の乖離       | Phase 11 テストプランは作成済みだったが、実施ステップが先行してしまい手動テストが後回しになった    | Phase 11完了条件にrepresentative screenshots必須を明記し、未取得の場合はPhase 12進行をブロックするよう規約化 |

## 4. 実行手順

1. ローカルのElectronアプリを起動する
   ```bash
   pnpm --filter @repo/desktop dev
   ```
2. Phase 11テストプランを参照する
   - `docs/30-workflows/step-09-par-task-p0-06-conversational-interview-ui/outputs/phase-11/`
3. 会話型インタビューUIを操作し、以下の状態のスクリーンショットを取得する
   - 初期表示（最初の質問が表示された状態）
   - 選択肢選択後（single_select）
   - multi_select での複数選択状態
   - undo実行後（前の質問へ戻った状態）
   - テキスト入力完了状態
   - 完了確認ダイアログ
4. スクリーンショットを `outputs/phase-11/screenshots/` に保存する
5. テスト結果を記録する
   ```
   docs/30-workflows/step-09-par-task-p0-06-conversational-interview-ui/outputs/phase-11/manual-test-result.md
   ```
6. `artifacts.json` を更新する
   ```json
   "11": "completed"
   ```

## 5. 完了条件チェックリスト

- [ ] Electronアプリで会話型インタビューUIが正常に動作することを目視確認
- [ ] representative screenshots が取得済み（最低6状態）
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] `artifacts.json` の Phase 11 が `completed` に更新されている
- [ ] Phase 12 close-out 再実行後に PASS 判定が得られる

## 6. 検証方法

```bash
# artifacts.json確認
cat docs/30-workflows/step-09-par-task-p0-06-conversational-interview-ui/outputs/artifacts.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['phases']['11'])"
# → "completed" であること

# Phase 11 出力物確認
ls docs/30-workflows/step-09-par-task-p0-06-conversational-interview-ui/outputs/phase-11/
# → screenshots/ と manual-test-result.md が存在すること
```

## 7. リスクと対策

- リスク: Electronアプリのビルドが壊れていてUIが起動できない
  - 対策: `pnpm --filter @repo/desktop build` を先に実行してエラーを確認する
- リスク: スクリーンショットツールがmacOS上で権限エラーになる
  - 対策: macOSの「画面収録」権限をターミナル/Electronに付与する

## 8. 参照情報

- `docs/30-workflows/step-09-par-task-p0-06-conversational-interview-ui/outputs/phase-11/`
- `docs/30-workflows/step-09-par-task-p0-06-conversational-interview-ui/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/step-09-par-task-p0-06-conversational-interview-ui/outputs/phase-12/phase12-task-spec-compliance-check.md`
- `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`
- `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts`

## 9. 備考

本タスクはUIの目視確認系（High）。representative screenshotsが揃うまでTASK-P0-06のPhase 12 close-outは達成不可。
UT-P0-06-CANONICAL-SYNC-001と並行作業は可能だが、どちらもPhase 12 PASS判定の前提条件。
