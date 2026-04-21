# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 1                    |
| タスクID   | TASK-RALLY-011       |
| 機能名     | 送信中競合防止UI強化 |
| 前提Phase  | -                    |
| 後続Phase  | Phase 2              |
| 作成日     | 2026-04-21           |
| ステータス | pending              |

## 目的

`isSubmitting === true`（回答を送信中）の間に `onWorkflowStateChanged` の IPC push で新しい `workflowSnapshot` が届いた場合、送信中のローディング表示と次の質問表示が競合する可能性がある。

`pendingSnapshotRef` にバッファリングし、送信完了後に適用する2段構成を導入することで、送信中のUI競合を排除する。

## 背景

- **競合シナリオ**: submit完了前に新しい `awaitingUserInput` がstateに反映されると「送信中...」ボタンと「次の質問」が同時に画面上に現れる
- **関連設計書**: `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md` RALLY-011 節
- **対象ファイル**: `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`
- **前提タスク**: RALLY-010（完了UI追加）・RALLY-005（IPC権限設計）両方完了後に着手

## SubAgentチーム編成

| SubAgent   | 関心ごと                           | 主担当                                   | 実行形態 |
| ---------- | ---------------------------------- | ---------------------------------------- | -------- |
| SubAgent-A | isSubmitting中push受信シナリオ分析 | 競合発生条件・タイミング・影響範囲の特定 | 直列     |

## 実行タスク

- 競合シナリオ分析: `isSubmitting` 中に push が来た場合の現状挙動を確認する
- バッファリング要件定義: `pendingSnapshotRef` と `activeSnapshot` の役割を定義する
- 受け入れ基準化: 競合防止の検証可能な基準を固定する

## 参照資料

| 資料名                      | パス                                                                     | 用途                                         |
| --------------------------- | ------------------------------------------------------------------------ | -------------------------------------------- |
| ConversationalInterview実装 | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | isSubmitting・onWorkflowStateChanged周辺確認 |
| RALLY Phase2設計書          | `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md`   | RALLY-011 設計方針参照                       |

## P50チェックコマンド

```bash
# isSubmitting と onWorkflowStateChanged 周辺の実装を確認
grep -n "isSubmitting\|onWorkflowStateChanged\|pendingPush\|workflowSnapshot" \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx

# propsの型定義を確認（onWorkflowStateChanged があるかどうか）
grep -n "ConversationalInterviewProps\|onWorkflow\|onError\|onSubmit" \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx | head -30
```

## 受け入れ基準

| ID   | 基準                                                                                                                                                            |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `isSubmitting === true` の間に親から `workflowSnapshot` が更新されても、UIに新しい質問が即時反映されないこと（`pendingSnapshotRef` にバッファリングされること） |
| AC-2 | `isSubmitting` が `false` に変わった直後に、バッファリングされていた `workflowSnapshot` の内容が反映されること                                                  |
| AC-3 | `isSubmitting === true` の間、送信ボタンが `disabled` 状態であること                                                                                            |
| AC-4 | `isSubmitting === false` かつ `pendingRequest === null` の間、送信ボタンが表示されないまたは `disabled` であること                                              |
| AC-5 | バッファが空のとき（`pendingSnapshotRef.current === null`）、`isSubmitting` 完了後に余分な再レンダリングが発生しないこと                                        |
| AC-6 | TypeScript コンパイルエラーが 0 件であること                                                                                                                    |
| AC-7 | `pnpm lint` でESLintエラーが 0 件であること                                                                                                                     |

## スコープ

### 含む

- `ConversationalInterview.tsx` に `pendingSnapshotRef`（バッファ）を `useRef` で追加
- `workflowSnapshot` が `isSubmitting` 中に更新される場合のバッファリング制御
- `isSubmitting` が `false` に戻った際に `pendingSnapshotRef` の内容を適用するロジック
- 送信ボタンの `disabled` 条件の明示的な管理

### 含まない

- `SkillLifecyclePanel.tsx` 側のキューイングロジック（RALLY-005の責務）
- IPC チャンネル自体の変更
- サーバー側のシーケンス番号（seqNo）設計
- `onWorkflowStateChanged` コールバックの新規追加

## 成果物

| 成果物           | パス                                            | 説明                   |
| ---------------- | ----------------------------------------------- | ---------------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`    | 機能要件と非機能要件   |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`        | 検証可能なAC一覧       |
| 競合シナリオ分析 | `outputs/phase-1/conflict-scenario-analysis.md` | 競合発生条件の分析結果 |

## 完了条件

- [ ] 成果物を全件作成
- [ ] AC-1〜AC-7 が矛盾なく定義されていること
- [ ] バッファリングの役割（pendingSnapshotRef / activeSnapshot）が明確であること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p11-seq-RALLY-011
```

## 次のPhase

Phase 2: 設計
