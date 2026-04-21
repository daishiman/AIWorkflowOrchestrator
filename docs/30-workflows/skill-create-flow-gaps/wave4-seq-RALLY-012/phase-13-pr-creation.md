# Phase 13: PR作成

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 13                 |
| タスクID   | TASK-RALLY-012     |
| 機能名     | エラー回復導線追加 |
| 前提Phase  | Phase 12           |
| 後続Phase  | -                  |
| 作成日     | 2026-04-21         |
| ステータス | pending            |

## 目的

提出準備を完了し、ユーザー承認後のみPR作成へ進む。RALLY-012 完了後に RALLY-013 が着手できる状態であることを確認する。

## 直列/並列情報

- **本Phase完了後、RALLY-013 が着手可能になる**

## PR説明テンプレート

```markdown
## 概要

RALLY-012: エラー回復導線追加

## 変更内容

- `ConversationalInterviewProps` に `onReset` オプショナルプロップス追加
- `localError` state と `lastAnswerRef` の追加
- `submitAnswer` のエラー処理に `setLocalError` と `lastAnswerRef` への保持を追加
- `handleRetry` / `handleReset` ハンドラの追加
- エラー回復UI（`data-testid="interview-error-recovery"`）の追加
- レンダリングが エラー→入力→完了→待機 の4分岐構成に変更

## テスト

- ユニットテスト: AC-1〜AC-9 全件カバー
- 手動テスト: TC-11-UI-01〜04 全件 PASS

## 後続タスク

RALLY-013（Undo可能範囲の視覚的表現追加）が本PRマージ後に着手可能
```

## 成果物

| 成果物           | パス                                     | 説明                  |
| ---------------- | ---------------------------------------- | --------------------- |
| PR準備メモ       | `outputs/phase-13/pr-preparation.md`     | 提出準備情報          |
| 引き継ぎサマリー | `outputs/phase-13/handoff-summary.md`    | RALLY-013への引き継ぎ |
| 承認チェック     | `outputs/phase-13/approval-checklist.md` | ユーザー承認確認      |

## 完了条件

- [ ] PR準備メモが作成されていること
- [ ] RALLY-013 への引き継ぎサマリーが作成されていること
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
  docs/30-workflows/skill-create-flow-gaps/p12-seq-RALLY-012
```

## 次のPhase

Phase -: - （RALLY-012 完了。RALLY-013 へ引き継ぎ）
