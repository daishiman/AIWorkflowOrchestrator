# Phase 13: PR作成

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 13                       |
| タスクID   | TASK-RALLY-010           |
| 機能名     | ラリー完了状態UI表示追加 |
| 前提Phase  | Phase 12                 |
| 後続Phase  | -                        |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

提出準備を完了し、ユーザー承認後のみPR作成へ進む。RALLY-010 完了後に RALLY-011 が着手できる状態であることを確認する。

## 直列/並列情報

- **本Phase完了後、RALLY-011 が着手可能になる**
- PR は RALLY-010〜013 を個別に出すか、チェーン完了後にまとめて出すかはユーザーの判断に委ねる

## 実行タスク

- 差分要約: `ConversationalInterview.tsx` の変更差分を整理する
- 承認条件確認: ユーザー明示承認がある場合のみ PR 作成へ進む
- 引き継ぎ記録: RALLY-011 担当者が迷わない引き継ぎ情報を固定する

## PR説明テンプレート

```markdown
## 概要

RALLY-010: ラリー完了状態のUI表示を追加

## 変更内容

- `ConversationalInterview.tsx` に `isRallyCompleted` 判定ロジックを追加
- ラリー完了時に「ラリーが完了しました」専用UIを表示
- 待機メッセージを「次の質問を準備しています...」に変更
- 完了/待機/入力の3分岐レンダリングを実装

## テスト

- ユニットテスト: 完了/待機/入力の3分岐を全件カバー
- 手動テスト: TC-11-UI-01〜04 全件 PASS

## 後続タスク

RALLY-011（送信中競合防止UI強化）が本PRマージ後に着手可能
```

## 参照資料

| 資料名           | パス                                       | 説明            |
| ---------------- | ------------------------------------------ | --------------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md` | Phase 12 成果物 |
| 仕様更新サマリー | `outputs/phase-12/spec-update-summary.md`  | Phase 12 成果物 |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`   | Phase 11 成果物 |

## 成果物

| 成果物           | パス                                     | 説明                  |
| ---------------- | ---------------------------------------- | --------------------- |
| PR準備メモ       | `outputs/phase-13/pr-preparation.md`     | 提出準備情報          |
| 引き継ぎサマリー | `outputs/phase-13/handoff-summary.md`    | RALLY-011への引き継ぎ |
| 承認チェック     | `outputs/phase-13/approval-checklist.md` | ユーザー承認確認      |

## 完了条件

- [ ] PR準備メモが作成されていること
- [ ] RALLY-011 への引き継ぎサマリーが作成されていること
- [ ] ユーザーの明示承認がある場合のみ PR を作成すること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p10-seq-RALLY-010
```

## PR作成制約

- ユーザーの明示承認がある場合だけ PR 作成へ進む
- 明示承認がない場合は `outputs/phase-13/pr-preparation.md` の作成で終了する

## 次のPhase

Phase -: - （RALLY-010 完了。RALLY-011 へ引き継ぎ）
