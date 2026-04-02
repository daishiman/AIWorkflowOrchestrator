# TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001: before-quit guard の実装

## メタ情報

| 項目     | 値                                                                                         |
| -------- | ------------------------------------------------------------------------------------------ |
| タスクID | TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001                                                   |
| 検出元   | TASK-FIX-EXECUTE-PLAN-FF-001 Phase 12 unassigned-task-detection（2026-04-01）              |
| 優先度   | MEDIUM                                                                                     |
| 影響     | アプリ終了時にバックグラウンドで実行中のスキル生成が突然中断され、不整合な状態が残るリスク |
| 検出日   | 2026-04-01                                                                                 |

## 概要

Electron アプリ終了時にバックグラウンドで実行中のスキル生成を適切に処理（中断通知 or 待機）する機能が未実装。`before-quit` イベントを利用したガードが必要。

## 背景

TASK-FIX-EXECUTE-PLAN-FF-001 で `skill-creator:execute-plan` を非ブロッキング化（fire-and-forget）した結果、スキル生成処理がバックグラウンドで実行されるようになった。これにより、ユーザーがアプリを終了した場合に:

1. **処理の突然中断**: バックグラウンドで実行中の LLM 処理が正常に終了できない
2. **不整合な状態の残存**: 中断によりファイルシステムや状態が中途半端な状態になる可能性
3. **ユーザーへの通知なし**: スキル生成中にアプリを終了しようとしても警告が表示されない

Electron には `app.on('before-quit', ...)` イベントがあり、アプリ終了前に処理を挟み込むことができる。このイベントを利用して、実行中のスキル生成がある場合に適切に対処する仕組みが必要。

## 推定作業内容

- [ ] `SkillCreatorWorkflowEngine` または `RuntimeSkillCreatorFacade` に「実行中かどうか」を問い合わせる API を追加する
- [ ] Electron の `app.on('before-quit', ...)` ハンドラを実装する
- [ ] スキル生成実行中にアプリ終了が要求された場合の挙動を設計する（例: ダイアログ表示 / 強制中断 / 待機）
- [ ] 選択した挙動を実装する
- [ ] `before-quit` ガードが正常に動作することをテストで確認する
- [ ] ユーザーへの通知 UI（ダイアログ等）を実装する場合はアクセシビリティを考慮する

## 完了条件

- [ ] スキル生成実行中にアプリを終了しようとした際に適切な処理（警告表示 or 待機 or 中断通知）が行われる
- [ ] アプリが突然終了してもファイルシステムや状態が不整合にならない
- [ ] スキル生成を実行していない場合は通常通りアプリが終了できる
- [ ] TypeScript 型チェック PASS
- [ ] 関連テスト全件 PASS

## 苦戦箇所（TASK-FIX-EXECUTE-PLAN-FF-001 より）

### fire-and-forget 化の副産物として顕在化したライフサイクル問題

- **困難だった理由**: 元々のブロッキング方式ではアプリ終了時に IPC タイムアウトで処理が中断されていた。fire-and-forget 化によって長時間処理が継続可能になった一方で、アプリ終了時の graceful shutdown が未対応であることが Phase 9/10 レビューで発覚した。実装完了後に新たな課題が発生したため、対応タイミングの判断が難しかった
- **採った解決策**: 今回のスコープ外として切り出し、未タスクとして記録。before-quit guard の実装は次タスクへ委譲
- **将来への知見**: 同期→非同期（fire-and-forget）移行時は、必ずアプリケーションライフサイクル（起動・終了・クラッシュ）への影響を Phase 2 設計段階でチェックリストに含めること。特に Electron の `before-quit` / `will-quit` イベントとの整合は設計初期に確認する

## 関連

- 親タスク: TASK-FIX-EXECUTE-PLAN-FF-001
- 関連ファイル:
  - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
  - `apps/desktop/src/main/ipc/creatorHandlers.ts`
