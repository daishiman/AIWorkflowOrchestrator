# Phase 1: 要件定義

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 1                  |
| タスクID   | TASK-RALLY-012     |
| 機能名     | エラー回復導線追加 |
| 前提Phase  | -                  |
| 後続Phase  | Phase 2            |
| 作成日     | 2026-04-21         |
| ステータス | pending            |

## 目的

`onError` コールバック後に `interview.rollbackLastUserMessage()` が実行されてUIがロールバックされるが、ユーザーには「再試行する」「最初からやり直す」などの選択肢が提示されない。エラー後のユーザー詰まりを解消するためのエラー回復導線をConversationalInterview内に追加する。

## 背景

- **問題**: エラー発生後にrollbackLastUserMessage()は呼ばれるが、ユーザーに「再試行」「リセット」の選択肢が表示されない
- **解決方針**: lastAnswerRefに直前の回答を保持し再試行可能に。onResetオプショナルプロップスを追加しリセット導線を設置
- **対象ファイル**: `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`
- **前提タスク**: RALLY-011（バッファリング実装）完了後に着手

## SubAgentチーム編成

| SubAgent   | 関心ごと           | 主担当                                       | 実行形態 |
| ---------- | ------------------ | -------------------------------------------- | -------- |
| SubAgent-A | エラー発生箇所調査 | submitAnswer内のエラー処理・rollback箇所特定 | **並列** |
| SubAgent-B | UXフロー設計       | 再試行・リセットのUXフロー定義               | **並列** |

## P50チェックコマンド

```bash
# submitAnswer と onError 周辺の実装を確認
grep -n "onError\|rollbackLastUserMessage\|submitAnswer\|catch\|setIsSubmitting" \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx

# ConversationalInterviewProps の型定義を確認
grep -n -A 10 "ConversationalInterviewProps" \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx
```

## 受け入れ基準

| ID   | 基準                                                                                                                    |
| ---- | ----------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `submitAnswer` で `onSubmit` が reject した場合、`localError` state が設定され、エラーUIが表示されること                |
| AC-2 | エラーUIに「再試行する」ボタンが表示されること                                                                          |
| AC-3 | エラーUIに「最初からやり直す」ボタンが表示されること（`onReset` が定義されている場合）                                  |
| AC-4 | 「再試行する」クリックで `localError` がクリアされ、直前の送信と同じ入力内容で再送信が実行されること                    |
| AC-5 | 「最初からやり直す」クリックで `onReset` プロップスが呼ばれること（`onReset` が未定義の場合はボタンを非表示にすること） |
| AC-6 | エラーUIが表示されている間、通常の入力エリアは非表示または操作不可であること                                            |
| AC-7 | `localError` がクリアされた後、入力エリアが正常に戻ること                                                               |
| AC-8 | TypeScript コンパイルエラーが 0 件であること                                                                            |
| AC-9 | `pnpm lint` でESLintエラーが 0 件であること                                                                             |

## スコープ

### 含む

- `ConversationalInterview.tsx` 内部エラー state（`localError`）の追加
- `submitAnswer` 失敗時に `localError` をセットするロジック
- エラー表示エリアへの「再試行する」「最初からやり直す」ボタンの追加
- `handleRetry` ハンドラ: 最後の送信を再実行する
- `handleReset` ハンドラ: `onReset` プロップス経由でワークフローリセットを親に委譲する
- `onReset` プロップスの `ConversationalInterviewProps` への追加（オプショナル）

### 含まない

- 親コンポーネント（`SkillLifecyclePanel.tsx`）での `onReset` 実装
- ネットワーク層のリトライロジック（指数バックオフ等）
- エラーの種別分類
- `onError` プロップスの削除または変更

## 成果物

| 成果物             | パス                                         | 説明                           |
| ------------------ | -------------------------------------------- | ------------------------------ |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | 機能要件と非機能要件           |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | 検証可能なAC一覧               |
| エラー発生箇所調査 | `outputs/phase-1/error-location-analysis.md` | submitAnswer内エラー処理の調査 |
| UXフロー設計       | `outputs/phase-1/ux-flow-design.md`          | 再試行・リセットのUXフロー     |

## 完了条件

- [ ] AC-1〜AC-9 が矛盾なく定義されていること
- [ ] SubAgent-A/B の調査・設計結果が統合されていること
- [ ] 本Phase内の全タスクを100%実行完了

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

Phase 2: 設計
