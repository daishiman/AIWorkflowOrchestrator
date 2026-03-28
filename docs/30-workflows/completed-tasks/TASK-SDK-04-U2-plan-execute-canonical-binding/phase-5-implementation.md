# Phase 5: 実装

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 5                                             |
| Phase名    | 実装                                          |
| 対象機能   | TASK-SDK-04-U2-plan-execute-canonical-binding |
| 前提Phase  | Phase 4: テスト作成                           |
| 次Phase    | Phase 6: テスト拡充                           |
| ステータス | completed                                     |
| 作成日     | 2026-03-27                                    |

## 目的

approved snapshot を renderer state に導入し、execute が canonical plan snapshot のみを使う実装へ修正する。

## 実行タスク

### Task 1: state 修正

- approved plan spec を state として保持する
- plan 完了時に snapshot を保存する

### Task 2: execute binding 修正

- `executePlan(planId, approvedSnapshot, ...)` を使う
- textarea draft から直接送らない

### Task 3: clear 動作修正

- cancel と clear 系で approved snapshot を対称的に破棄する

## 参照資料

| 資料名     | パス                                                                                               | 説明         |
| ---------- | -------------------------------------------------------------------------------------------------- | ------------ |
| 実装対象   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | 修正本体     |
| テスト対象 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 同時更新対象 |

## 統合テスト連携

- Phase 4 で定義した fail-first ケースを pass に反転する
- executePlan の API shape を維持したまま期待値を更新する

## 成果物

| 成果物   | パス                                       | 説明                |
| -------- | ------------------------------------------ | ------------------- |
| 実装記録 | `outputs/phase-5/implementation-record.md` | 変更点と owner 分離 |

## 完了条件

- [ ] execute が approved snapshot のみを参照する
- [ ] cancel で関連 state が対称クリアされる
- [ ] API shape に破壊的変更がない
- [ ] 変更対象ファイルが明示されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
