# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 1                        |
| タスクID   | TASK-RALLY-010           |
| 機能名     | ラリー完了状態UI表示追加 |
| 前提Phase  | -                        |
| 後続Phase  | Phase 2                  |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

`awaitingUserInput === null` のとき「質問を待っています...」という待機メッセージだけが表示される現状では、
ラリーが進行中で次の質問を待っている状態と、ラリーが完了して終了した状態の両方で同じ表示になり、
ユーザーは「まだ待てばいいのか」「もう終わったのか」を区別できない。

`workflowSnapshot` が終了フェーズにある場合を「ラリー完了」として専用UIを表示することで、
待機中と完了後を明確に区別できるようにする。

## 背景

- **関連設計書**: `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md` RALLY-010 節
- **対象ファイル**: `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`
- **直列チェーン**: RALLY-002 完了後に着手。後続は RALLY-011

## SubAgentチーム編成

| SubAgent   | 関心ごと           | 主担当                                   | 実行形態 |
| ---------- | ------------------ | ---------------------------------------- | -------- |
| SubAgent-A | ラリー完了条件調査 | workflowSnapshot型・完了フェーズ値の確認 | **並列** |
| SubAgent-B | UI設計方針策定     | 完了/待機/入力の3分岐レンダリング設計    | **並列** |

## 実行タスク

- 要件抽出: workflowSnapshot の型定義から完了フェーズを示すフィールドと値を確認する
- 受け入れ基準化: 完了UI・待機UI・入力UIの表示条件を検証可能な形で固定する
- スコープ境界確認: 含む/含まない を明示する

## 参照資料

| 資料名                      | パス                                                                     | 用途                              |
| --------------------------- | ------------------------------------------------------------------------ | --------------------------------- |
| ConversationalInterview実装 | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | 現状の awaitingUserInput 周辺確認 |
| workflowSnapshot型定義      | `packages/shared/src/types/skillCreator.ts`                              | phase/status フィールドの型確認   |
| RALLY Phase2設計書          | `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md`   | RALLY-010 設計方針参照            |

## P50チェックコマンド

```bash
# ConversationalInterview.tsx の pendingRequest/awaitingUserInput 周辺を確認
grep -n "pendingRequest\|awaitingUserInput\|waiting\|質問を待って" \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx

# workflowSnapshot の型定義を確認
grep -n "phase\|status\|workflowStatus\|completed\|handoff\|reverify" \
  packages/shared/src/types/skillCreator.ts
```

## 受け入れ基準

| ID   | 基準                                                                                                                       |
| ---- | -------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `workflowSnapshot` の `phase` または `status` が完了フェーズを示す値の場合、「ラリーが完了しました」旨のUIが表示されること |
| AC-2 | `awaitingUserInput === null` かつ未完了フェーズのとき、「次の質問を準備しています...」が表示されること                     |
| AC-3 | 完了UIと待機UIが同時に表示されることはないこと                                                                             |
| AC-4 | `pendingRequest` が存在する（入力待ち）場合は完了UIが表示されないこと                                                      |
| AC-5 | TypeScript コンパイルエラーが 0 件であること                                                                               |
| AC-6 | `pnpm lint` でESLintエラーが 0 件であること                                                                                |

## スコープ

### 含む

- `ConversationalInterview.tsx` に `isRallyCompleted` 判定ロジックの追加
- ラリー完了専用コンポーネント（インライン実装）の追加
- `awaitingUserInput === null` かつ未完了のとき「次の質問を準備しています...」に表示を変更
- 完了状態・待機状態・通常入力状態の3分岐レンダリング

### 含まない

- 完了後の画面遷移処理（`onProceedToReview` コールバック実装）
- `SkillLifecyclePanel.tsx` 側の状態管理変更
- ラリー完了後にスキル仕様を確認するレビュー画面の実装
- サーバー側のワークフロースナップショット仕様変更

## 実行手順

1. SubAgent-A: `packages/shared/src/types/skillCreator.ts` を読み `SkillCreatorWorkflowUiSnapshot` の `phase`/`status` フィールドを確認する
2. SubAgent-B: 3分岐レンダリングのUI設計方針を策定する（data-testid命名含む）
3. SubAgent-A/B の調査結果を統合し受け入れ基準の最終形を固定する
4. 成果物を `outputs/phase-1/` に出力する

## 成果物

| 成果物                 | パス                                         | 説明                     |
| ---------------------- | -------------------------------------------- | ------------------------ |
| 要件定義書             | `outputs/phase-1/requirements-definition.md` | 機能要件と非機能要件     |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`     | 検証可能なAC一覧         |
| workflowSnapshot型調査 | `outputs/phase-1/snapshot-type-analysis.md`  | 完了フェーズ値の調査結果 |

## 完了条件

- [ ] 成果物を全件作成
- [ ] AC-1〜AC-6 が矛盾なく定義されていること
- [ ] workflowSnapshot の完了フェーズ値が特定されていること
- [ ] スコープ境界（含む/含まない）が明確であること
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

## 次のPhase

Phase 2: 設計
