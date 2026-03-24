# TASK-SC-11: AbortController による plan/execute キャンセル実装

## メタ情報

- 検出元: TASK-SC-06-UI-RUNTIME-CONNECTION Phase 10 レビュー
- 優先度: Medium
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
  - `apps/desktop/src/preload/skill-creator-api.ts`
  - `apps/desktop/src/main/handlers/skillCreatorHandlers.ts`

## 目的

handleCancelPlan が UI 状態のクリアだけでなく、進行中の IPC 呼出し（planSkill/executePlan）を AbortController で実際にキャンセルし、ネットワークリソースの無駄遣いと遅延レスポンスによる state 上書きリスクを排除する。

## 背景

現在の handleCancelPlan は generationStep や generationProgress 等の UI 状態をリセットするのみで、バックグラウンドで進行中の planSkill / executePlan の IPC 呼出しは継続する。これにより以下の問題が発生する:

1. **ネットワークリソースの無駄遣い**: キャンセル後も AI API へのリクエストが継続し、トークン消費とネットワーク帯域を浪費する
2. **遅延レスポンスによる state 上書き**: キャンセル後にユーザーが別の操作を開始した場合、先行リクエストの遅延レスポンスが新しい state を上書きし、UI が不整合になるリスクがある

## 実行タスク

- [ ] AbortController インスタンスの管理方法を設計する（useRef / Store / モジュールスコープ）
- [ ] planSkill / executePlan の IPC 呼出し時に AbortSignal を渡す仕組みを実装する
- [ ] Main Process 側の IPC ハンドラで AbortSignal を受け取り、AI API 呼出しをキャンセルする処理を追加する
- [ ] handleCancelPlan で AbortController.abort() を呼出す処理を追加する
- [ ] キャンセル後の遅延レスポンスを無視するガードを追加する（stale response guard）
- [ ] AbortError 発生時のエラーハンドリングを実装する（ユーザー起因のキャンセルはエラー表示しない）
- [ ] キャンセルフローのユニットテストを追加する
- [ ] キャンセル後の再実行が正常動作することを確認するテストを追加する

## 完了条件

- [ ] handleCancelPlan 実行時に進行中の IPC 呼出しがキャンセルされること
- [ ] キャンセル後に遅延レスポンスが state を上書きしないこと
- [ ] キャンセル後に新しい plan/execute を正常に開始できること
- [ ] ユーザー起因のキャンセルでエラーメッセージが表示されないこと
- [ ] TypeScript 型チェック PASS
- [ ] 関連テスト全件 PASS

## 参照

- TASK-SC-06-UI-RUNTIME-CONNECTION Phase 10 レビュー（U-3）
- TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE（プログレス更新との連携）
