# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 10                   |
| Phase名    | 最終レビューゲート   |
| 対象機能   | TASK-SW-TODO-001     |
| 前提Phase  | Phase 9: 品質保証    |
| 次Phase    | Phase 11: 手動テスト |
| ステータス | 未実施               |
| 作成日     | 2026-04-16           |

## 目的

AC・依存関係・品質ゲート・技術的負債の4条件が全て満たされていることを最終確認し、
Phase 11（手動テスト）への進行可否を判断する。

## 実行タスク

### Task 1: AC 最終確認

| AC   | 条件                                                                        | 達成状態 |
| ---- | --------------------------------------------------------------------------- | -------- |
| AC-1 | `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況が確認・記録されている | TBD      |
| AC-2 | TODOコメントが整理されている（削除または明確化）                            | TBD      |
| AC-3 | `shouldShowMainToolBadge` の動作が変わらない（UIの機能は維持）              | TBD      |
| AC-4 | TypeScriptの型エラーがない                                                  | TBD      |

### Task 2: 依存関係確認

| 確認項目                                                               | 状態 |
| ---------------------------------------------------------------------- | ---- |
| 本タスクが他タスクの前提条件になっていないことを確認                   | TBD  |
| `ConversationRoundStep.tsx` の外部インターフェースに破壊的変更がないか | TBD  |
| `shouldShowMainToolBadge` の戻り値型が変更されていないか               | TBD  |

### Task 3: 品質ゲート再確認

| ゲート    | 状態 |
| --------- | ---- |
| lint      | TBD  |
| typecheck | TBD  |
| test      | TBD  |

### Task 4: 技術的負債の最終確認

Phase 8 で記録した技術的負債（TD-001〜TD-002）が適切に記録・追跡されていることを確認する。

- TD-001: `resolveExternalIntegration` の主ツール参照ロジック変更が将来タスクとして記録されているか
- TD-002: オプション B 採用時のTODO残存が将来タスクとして記録されているか

### Task 5: ゲート判定

PASS / MINOR / MAJOR の判定を下す。

- **PASS**: 全 AC 達成・品質ゲート通過・依存関係整合 → Phase 11 へ進む
- **MINOR**: 軽微な指摘あり → Phase 11 進行可だが MINOR を記録する
- **MAJOR**: 重大な問題あり → 該当 Phase へ差し戻す

## 参照資料

- `outputs/phase-9/TASK-SW-TODO-001-quality-report.md` — 品質ゲート結果
- `outputs/phase-8/TASK-SW-TODO-001-refactoring-record.md` — 技術的負債記録

## 統合テスト連携

- Phase 9 の品質ゲート結果を最終レビューで確認する
- `ConversationRoundStep.tsx` の外部動作変更がないことを確認する

## 成果物

| 成果物                                  | パス                                                       |
| --------------------------------------- | ---------------------------------------------------------- |
| TASK-SW-TODO-001-final-review-result.md | `outputs/phase-10/TASK-SW-TODO-001-final-review-result.md` |

## 完了条件

- [ ] 全 AC（AC-1〜AC-4）が達成されていることを確認した
- [ ] 依存関係確認が完了している
- [ ] 品質ゲート再確認が完了している
- [ ] 技術的負債の最終確認が完了している
- [ ] ゲート判定（PASS / MINOR / MAJOR）が下されている

## タスク100%実行確認【必須】

- [ ] Task 1（AC 最終確認）を100%実行した
- [ ] Task 2（依存関係確認）を100%実行した
- [ ] Task 3（品質ゲート再確認）を100%実行した
- [ ] Task 4（技術的負債の最終確認）を100%実行した
- [ ] Task 5（ゲート判定）を100%実行した
- [ ] 成果物（TASK-SW-TODO-001-final-review-result.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 11: 手動テスト](./phase-11-manual-test.md)
