# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 1                            |
| タスクID   | TASK-RALLY-013               |
| 機能名     | Undo可能範囲の視覚的表現追加 |
| 前提Phase  | -                            |
| 後続Phase  | Phase 2                      |
| 作成日     | 2026-04-21                   |
| ステータス | pending                      |

## 目的

`canUndo === true` のときUndoボタンが有効化されるが、ユーザーは「何ステップ前まで戻れるのか」を把握できない。どこまで戻れるか分からない状態でUndoボタンを押すのは不安を伴う。

Undoボタン近辺に「N ステップ前まで戻れます」インジケーターを表示し、戻れるステップ数を視覚化する。

**前提**: RALLY-003（サーバー側rollback API）が完了し、Undo操作がサーバー状態も巻き戻すことが確立されていること。

## 背景

- **問題**: canUndo=trueでもどこまで戻れるか視覚的に不明
- **解決**: チャット履歴内でUndo可能な最古メッセージをハイライト、または戻れるステップ数をバッジ表示
- **前提**: RALLY-003でサーバー側Undoが確立されていること
- **対象ファイル**: `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`
- **前提タスク**: RALLY-003 + RALLY-012 両方完了後に着手

## SubAgentチーム編成

| SubAgent   | 関心ごと               | 主担当                                    | 実行形態 |
| ---------- | ---------------------- | ----------------------------------------- | -------- |
| SubAgent-A | 現状Undoボタン実装調査 | canUndo・steps・handleUndo の現状実装確認 | **並列** |
| SubAgent-B | UX設計                 | ステップ数インジケーターのUXフロー設計    | **並列** |

## P50チェックコマンド

```bash
# canUndo と handleUndo 周辺の実装を確認
grep -n "canUndo\|handleUndo\|undoable\|steps\|stepCount\|interview\." \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx

# useInterviewState が提供するAPIを確認
grep -n "canUndo\|steps\|undo\|currentStepIndex\|totalSteps" \
  apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts

# interview オブジェクトの型を確認
grep -n "return\|canUndo\|steps\b" \
  apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts | tail -30
```

## 受け入れ基準

| ID   | 基準                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------- |
| AC-1 | `canUndo === true` のとき、Undoボタンの近辺に「N ステップ前まで戻れます」が表示されること      |
| AC-2 | `canUndo === false`（`undoableStepCount === 0`）のとき、インジケーターラベルが表示されないこと |
| AC-3 | `undoableStepCount === 0` のとき、Undoボタンが `disabled` 状態であること                       |
| AC-4 | `isSubmitting === true` のとき、Undoボタンが `disabled` 状態であること（既存挙動の維持）       |
| AC-5 | ステップ数（N）が `interview.steps` のユーザー回答数と一致すること                             |
| AC-6 | TypeScript コンパイルエラーが 0 件であること                                                   |
| AC-7 | `pnpm lint` でESLintエラーが 0 件であること                                                    |

## スコープ

### 含む

- `ConversationalInterview.tsx` に `undoableStepCount` 計算ロジックの追加
- Undoボタン近辺に「N ステップ前まで戻れます」インジケーターラベルの追加
- `undoableStepCount === 0` のとき Undo ボタンが `disabled` かつ視覚的に非活性になる明示的な制御
- `canUndo` と `undoableStepCount` の整合チェック

### 含まない

- `useInterviewState.ts` への `undoableStepCount` API追加（既存の `steps` から計算できる場合）
- チャット履歴メッセージのハイライト表示
- Undo後のアニメーション演出
- RALLY-003 のrollback API実装自体（本タスクはUI側のみ）

## 成果物

| 成果物             | パス                                         | 説明                            |
| ------------------ | -------------------------------------------- | ------------------------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | 機能要件と非機能要件            |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | 検証可能なAC一覧                |
| Undoボタン実装調査 | `outputs/phase-1/undo-button-analysis.md`    | 現状canUndo/steps実装の調査結果 |
| UXフロー設計       | `outputs/phase-1/ux-flow-design.md`          | インジケーターUX設計            |

## 完了条件

- [ ] AC-1〜AC-7 が矛盾なく定義されていること
- [ ] `interview.steps` からの `undoableStepCount` 計算方法が確定していること
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

Phase 2: 設計
