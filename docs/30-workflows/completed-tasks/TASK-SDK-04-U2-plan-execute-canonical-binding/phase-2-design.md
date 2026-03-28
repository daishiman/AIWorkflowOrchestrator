# Phase 2: 設計

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 2                                             |
| Phase名    | 設計                                          |
| 対象機能   | TASK-SDK-04-U2-plan-execute-canonical-binding |
| 前提Phase  | Phase 1: 要件定義                             |
| 次Phase    | Phase 3: 設計レビュー                         |
| ステータス | completed                                     |
| 作成日     | 2026-03-27                                    |

## 目的

approved plan snapshot を単一の execution source にし、draft input と review 済み payload の責務を分離した最小設計を確定する。

## 実行タスク

### Task 1: 状態所有権設計

- draft input は textarea state が持つ
- approved payload は plan review 完了時の snapshot state が持つ
- execute は `planId + approved snapshot` の組だけを参照する

### Task 2: 失敗系設計

- approved snapshot 不在時は execute を禁止する
- cancel で related state を対称クリアする
- terminal handoff と integrated_api の既存 result type を壊さない

### Task 3: 30思考法の反映

- 論理分析系で矛盾を除去する
- 構造分解系で owner と dependency を分ける
- 発想・拡張系で patch 過多を避け、最小複雑性へ寄せる

## 参照資料

| 資料名     | パス                                                                                   | 説明             |
| ---------- | -------------------------------------------------------------------------------------- | ---------------- |
| 要件定義   | `phase-1-requirements.md`                                                              | AC-1〜AC-5       |
| 実装コード | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                   | state と flow    |
| 教訓       | `.agents/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md` | エレガンス監査軸 |

## 統合テスト連携

- state owner の分離を renderer test で観測可能にする
- cancel / execute / review の3段階を単一フローで追えるようにする

## 成果物

| 成果物 | パス                                 | 説明                              |
| ------ | ------------------------------------ | --------------------------------- |
| 設計書 | `outputs/phase-2/design-document.md` | state ownership、30思考法適用結果 |

## 完了条件

- [ ] draft と approved の owner が分離されている
- [ ] execute の参照元が 1 つに固定されている
- [ ] cancel / 回帰 / handoff の扱いが定義されている
- [ ] 30思考法の設計反映が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
