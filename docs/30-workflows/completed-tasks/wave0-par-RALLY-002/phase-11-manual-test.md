# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 11                                     |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 10                               |
| 後続Phase  | Phase 12                               |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

今回の差分が `NON_VISUAL` タスクであることを明示し、`pendingRequest` の切り替えルールがコード・テスト・成果物で矛盾なく追跡できる状態にする。

## 実行タスク

1. 今回差分が DOM/CSS/レイアウト変更を伴わない `NON_VISUAL` タスクであることを確認する
2. `ConversationalInterview.tsx` の差分と `ConversationalInterview.test.tsx` の S-1〜S-4 / X-1〜X-2 を一次証跡として整理する
3. Phase 12 の close-out に使える `manual-test-result.md` / `manual-test-checklist.md` / `evidence-index.md` を生成する

## NON_VISUAL 判定

- 差分対象は `pendingRequest` 合成式直上の説明コメントと clear `useEffect` 直上コメント、ならびにシナリオテスト追加のみ
- `ConversationalInterview.tsx` の JSX 構造、スタイル、ラベル、入力ウィジェット構成に変更なし
- よって Phase 11 は screenshot evidence ではなく、コード差分と automated scenario test を一次証跡とする

## 確認シナリオ

| シナリオ  | 確認方法                                                            | 期待結果                                              |
| --------- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| S-1       | `workflowSnapshot.awaitingUserInput` をそのまま表示するテストを確認 | 通常フローで現在の質問が表示される                    |
| S-2       | undo 後の single-select 表示テストを確認                            | `restoredPendingRequest` が優先される                 |
| S-3       | requestId 更新後の rerender テストを確認                            | `restoredPendingRequest` がクリアされ通常フローへ戻る |
| S-4       | `awaitingUserInput = null` の rerender テストを確認                 | クリアされず restored state が維持される              |
| X-1 / X-2 | 境界値テストを確認                                                  | 不要な再クリアや副作用再実行が発生しない              |

## 統合テスト連携

- Phase 5〜7 の成果物に加え、Phase 11 では `NON_VISUAL` 判定根拠と targeted scenario test の参照関係を固定する
- screenshot / capture metadata は不要とし、その理由を Phase 12 `implementation-guide.md` に明記する

## 多角的チェック観点（AIが判断）

- システム思考: 復元直後、snapshot 到着後、通常入力再開後の3状態が連続で破綻しないか
- 水平思考: console と DOM の両方で問題が出ていないか
- 素人思考: 実際の利用者視点で「続きから自然に始まる」体験になっているか

## サブタスク管理

- M-1: NON_VISUAL 判定
- M-2: targeted scenario test の証跡整理
- M-3: Phase 12 向け一次証跡整理

## 参照資料

| 資料名           | パス                                                                                    | 用途                           |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                               | Phase 10 成果物                |
| ゲート判定       | `outputs/phase-10/gate-decision.md`                                                     | 実施可否の確認                 |
| シナリオテスト   | `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx` | S-1〜S-4 / X-1〜X-2 の一次証跡 |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md`                                       | Phase 10 成果物                |

## 成果物

| 成果物                   | パス                                        | 説明                   |
| ------------------------ | ------------------------------------------- | ---------------------- |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | シナリオごとの実行結果 |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 実施前確認と観点一覧   |
| 証跡インデックス         | `outputs/phase-11/evidence-index.md`        | テスト証跡の一覧       |

## 完了条件

- [ ] `NON_VISUAL` 判定根拠を記録した
- [ ] S-1〜S-4 / X-1〜X-2 の参照先を明記した
- [ ] screenshot 不要理由を明記した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 12: ドキュメント更新
