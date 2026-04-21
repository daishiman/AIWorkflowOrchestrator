# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 12                           |
| タスクID   | TASK-RALLY-013               |
| 機能名     | Undo可能範囲の視覚的表現追加 |
| 前提Phase  | Phase 11                     |
| 後続Phase  | Phase 13                     |
| 作成日     | 2026-04-21                   |
| ステータス | pending                      |

## 目的

実装内容をドキュメントとして記録する。RALLY-013 は ConversationalInterview ドメインのチェーン末尾のため、RALLY-010〜013 の全変更内容を統合した引き継ぎ情報も作成する。

## 変更内容の説明（中学生レベル）

このタスクでは「元に戻す（Undo）ボタンの近くに、どこまで戻れるかを表示する機能」を作りました。

ラリーでは、回答を間違えたとき「← 戻る」ボタンで前の質問に戻ることができます。でも、今までは何回分戻れるか画面に表示されていなかったので、ユーザーは「3つ前まで戻れるの？1つだけ？」と分からない状態でした。

変更後は「← 戻る」ボタンの下に「3 ステップ前まで戻れます」のような小さな説明テキストが表示されるようになりました。ゲームで「残り命: 3」と表示されるのと同じイメージです。これで、ユーザーが安心して「戻る」ボタンを使えるようになります。

また、1ステップも戻れないときは「← 戻る」ボタンがグレーアウトされたまま（押せない状態）で、ヒントテキストも表示されません。

## 変更ファイル

| ファイル                                                                 | 変更内容                                                                       |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | `undoableStepCount`変数追加、UndoボタンJSXにラッパーdiv+インジケーターspan追加 |

## RALLY-010〜013 チェーン完了サマリー

ConversationalInterview ドメインの全5タスク（RALLY-002含む）が完了したことで、以下の機能がConversationalInterview.tsx に追加された：

| タスク    | 追加内容                                                                      |
| --------- | ----------------------------------------------------------------------------- |
| RALLY-002 | `restoredPendingRequest` 優先合成ルールのコメント明確化                       |
| RALLY-010 | `isRallyCompleted` 判定・完了UI (`data-testid="interview-completed"`)         |
| RALLY-011 | `pendingSnapshotRef`・`activeSnapshot`・バッファリング制御useEffect           |
| RALLY-012 | `localError`・`lastAnswerRef`・`handleRetry`/`handleReset`・エラー回復UI      |
| RALLY-013 | `undoableStepCount`・Undoインジケーター (`data-testid="interview-undo-hint"`) |

## 成果物

| 成果物               | パス                                            | 説明                          |
| -------------------- | ----------------------------------------------- | ----------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | 技術的変更内容の説明          |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | AC達成状況と変更概要          |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | 変更履歴                      |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 未対応タスクの検出結果        |
| チェーン完了サマリー | `outputs/phase-12/chain-completion-summary.md`  | RALLY-010〜013 統合完了の記録 |

## 完了条件

- [ ] 実装ガイドが作成されていること
- [ ] RALLY-010〜013 チェーン完了サマリーが作成されていること
- [ ] 中学生レベルの変更説明が含まれていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p13-seq-RALLY-013
```

## 次のPhase

Phase 13: PR作成
