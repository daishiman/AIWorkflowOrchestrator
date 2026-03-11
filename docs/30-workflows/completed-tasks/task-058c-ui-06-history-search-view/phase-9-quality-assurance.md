# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-UI-06-HISTORY-SEARCH-VIEW |
| Phase        | 9                              |
| Phase名      | 品質保証                       |
| カテゴリ     | UI改善                         |
| ステータス   | completed                      |
| 前提Phase    | Phase 8                        |
| 後続Phase    | Phase 10                       |
| 担当SubAgent | SubAgent-C, SubAgent-D         |

## 目的

UI、Store、IPC、shared types の実装結果が仕様と一致し、failure surface と a11y 条件が満たされているかを検証する。

## 実行タスク

- UI品質確認: zero state、error、sticky header、responsive を確認する
- 契約品質確認: `history:search` と `history:get-stats` の envelope を確認する
- a11y品質確認: keyboard、role、aria-label、focus 移動を確認する
- data 品質確認: metadata 欠損時の表示と sort 安定性を確認する

## 参照資料

| 参照資料       | パス               | 内容          |
| -------------- | ------------------ | ------------- |
| Phase 2 成果物 | `outputs/phase-2/` | 設計正本      |
| Phase 5 成果物 | `outputs/phase-5/` | 実装結果      |
| Phase 7 成果物 | `outputs/phase-7/` | coverage 結果 |
| Phase 8 成果物 | `outputs/phase-8/` | refactor 方針 |

### システム仕様（aiworkflow-requirements）

| 参照資料       | パス                                                                         | 内容            |
| -------------- | ---------------------------------------------------------------------------- | --------------- |
| error handling | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | failure surface |
| security       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | IPC 安全性      |
| quality        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | QA 基準         |
| UI design      | `.claude/skills/aiworkflow-requirements/references/ui-history-design.md`     | a11y と loading |

## 実行手順

### ステップ1: UI条件の確認

設計した全 UI状態がレンダーされるかを checklist 化する。

### ステップ2: 契約条件の確認

success / error envelope、query trim、append 条件、stats の扱いを確認する。

### ステップ3: a11y 条件の確認

Tab 移動、Enter / Space toggle、aria-label、role を項目化する。

## 統合テスト連携

- UI、slice、IPC の最終確認を 1 つの QA checklist へ束ねる
- screenshot 依存の視覚確認は Phase 11 へ引き継ぐが、対象状態はここで固定する
- error と zero state の renderer surface を IPC failure と紐付けて確認する

## 成果物

| 成果物                     | パス                                              | 説明                |
| -------------------------- | ------------------------------------------------- | ------------------- |
| QA checklist               | `outputs/phase-9/qa-checklist.md`                 | UI と data の品質表 |
| IPC validation plan        | `outputs/phase-9/ipc-contract-validation-plan.md` | invoke 契約確認     |
| accessibility quality gate | `outputs/phase-9/accessibility-quality-gate.md`   | a11y 判定表         |

## 品質ゲート

- [x] UI状態ごとの failure surface が確認可能である
- [x] `history:search` / `history:get-stats` の envelope 契約が一致している
- [x] keyboard 操作と aria の確認項目が揃っている

## 完了条件

- [x] UI、Store、IPC、a11y の品質項目が一覧化されている
- [x] 失敗時メッセージと fallback 表示の確認項目がある
- [x] keyboard 操作の確認項目がある
- [x] 本Phase内の全タスクを100%実行完了

## Phase実行記録

### 実行タスク

| タスク        | 結果      | 備考                                     |
| ------------- | --------- | ---------------------------------------- |
| UI品質確認    | completed | `qa-checklist.md` に反映                 |
| 契約品質確認  | completed | `ipc-contract-validation-plan.md` に反映 |
| a11y品質確認  | completed | `accessibility-quality-gate.md` に反映   |
| data 品質確認 | completed | trim / dedupe / metadata 欠損を確認      |

### 発見事項

- 良かった点: UI、Store、IPC、a11y を 3 枚の checklist に分離できた
- 問題点: 視覚 polish は QA checklist だけでは足りない
- 改善提案: mobile screenshot を定常的に取る UI task template が欲しい

### 次Phaseへの引き継ぎ事項

- Phase 10 では blocker なし前提で final review gate を通す

## 次のPhase

Phase 10: 最終レビューゲートへ進む。
