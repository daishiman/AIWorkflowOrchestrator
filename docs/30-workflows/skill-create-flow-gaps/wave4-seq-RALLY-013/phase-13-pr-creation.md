# Phase 13: PR作成

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| タスクID   | TASK-RALLY-013               |
| 機能名     | Undo可能範囲の視覚的表現追加 |
| 前提Phase  | Phase 12                     |
| 後続Phase  | -                            |
| 作成日     | 2026-04-21                   |
| ステータス | pending                      |

## 目的

提出準備を完了し、ユーザー承認後のみPR作成へ進む。RALLY-013 は ConversationalInterview ドメインのチェーン末尾のため、RALLY-010〜013 の全変更をまとめたPRとして提出することも検討する。

## 直列/並列情報

- **本タスクが ConversationalInterview ドメインの最終タスク**
- 後続に同一ファイルへの変更タスクなし

## PR説明テンプレート

```markdown
## 概要

RALLY-013: Undo可能範囲の視覚的表現追加

## 変更内容

- `undoableStepCount` 変数の追加（`interview.steps` のユーザー回答数から計算）
- UndoボタンJSXをラッパー `div` + ボタン + インジケーター `span` に変更
- `disabled` 条件を `undoableStepCount === 0 || isSubmitting` に統一
- `data-testid="interview-undo-hint"` の追加

## RALLY-010〜013 チェーン完了

本PRにより ConversationalInterview ドメインの全UI強化タスクが完了：

- RALLY-010: ラリー完了状態UI表示追加
- RALLY-011: 送信中競合防止UI強化
- RALLY-012: エラー回復導線追加
- RALLY-013: Undo可能範囲の視覚的表現追加（本PR）

## テスト

- ユニットテスト: AC-1〜AC-7 全件カバー
- 手動テスト: TC-11-UI-01〜04 全件 PASS（RALLY-010〜013 統合確認含む）

## 前提

- RALLY-003（サーバー側rollback API）完了後にUndoがサーバー状態も巻き戻す
```

## 成果物

| 成果物           | パス                                     | 説明                               |
| ---------------- | ---------------------------------------- | ---------------------------------- |
| PR準備メモ       | `outputs/phase-13/pr-preparation.md`     | 提出準備情報                       |
| 引き継ぎサマリー | `outputs/phase-13/handoff-summary.md`    | チェーン完了・後続タスクなしの記録 |
| 承認チェック     | `outputs/phase-13/approval-checklist.md` | ユーザー承認確認                   |

## 完了条件

- [ ] PR準備メモが作成されていること
- [ ] ConversationalInterview ドメイン完了の引き継ぎサマリーが作成されていること
- [ ] ユーザーの明示承認がある場合のみ PR を作成すること
- [ ] 本Phase内の全タスクを100%実行完了

## PR作成制約

- ユーザーの明示承認がある場合だけ PR 作成へ進む
- 明示承認がない場合は `outputs/phase-13/pr-preparation.md` の作成で終了する

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

Phase -: - （RALLY-013 完了。ConversationalInterviewドメイン全タスク完了）
