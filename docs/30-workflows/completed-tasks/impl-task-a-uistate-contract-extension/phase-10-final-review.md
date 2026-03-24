# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 10 - 最終レビュー                       |
| 機能名   | uistate-contract-extension              |
| タスクID | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 |
| 作成日   | 2026-03-24                              |

## 目的

多角的な品質・整合性検証を実施し、PASS / MINOR / MAJOR / CRITICAL の判定を下す。要件充足（AC-1〜AC-7）、Contract Matrix 仕様との整合性、後方互換性、型安全性、P62 暗黙 fallback 禁止を総合的に検証する。

## 前提成果物

| Phase | 成果物   | パス               |
| ----- | -------- | ------------------ |
| 9     | 品質検証 | `outputs/phase-9/` |

## 参照資料

| 資料名                      | パス / 説明                                                   |
| --------------------------- | ------------------------------------------------------------- |
| レビューゲート判定基準      | `.claude/rules/05-task-execution.md#Phase 10（最終レビュー）` |
| P62 暗黙 fallback 禁止      | `.claude/rules/06-known-pitfalls.md#P62`                      |
| P48 non-null assertion 禁止 | `.claude/rules/06-known-pitfalls.md#P48`                      |
| P49 type predicate 注意     | `.claude/rules/06-known-pitfalls.md#P49`                      |
| 型安全ルール                | `.claude/rules/02-code-quality.md#TypeScript型安全`           |

## 実行タスク

### Task 1: 要件充足検証（AC-1〜AC-7）

| AC   | 受入基準（index.md 正本準拠）                                                     | 検証方法                                   | 判定 |
| ---- | --------------------------------------------------------------------------------- | ------------------------------------------ | ---- |
| AC-1 | `UiState` 型が 8 値を含み、`UI_STATE_VALUES` と一致する                           | 型定義の目視確認                           | -    |
| AC-2 | `resolveUiState()` が `CapabilityContext` の全フィールドに基づき 8 値を正しく導出 | Phase 4 テスト結果で確認                   | -    |
| AC-3 | `resolveCtaContract()` が全組み合わせで仕様準拠の CTA を返す                      | Contract Matrix テスト結果 + Record 網羅性 | -    |
| AC-4 | `handoff` 状態で `UiStateResult.handoffGuidance` が `HandoffGuidance` 型を返す    | 型定義 + テスト結果で確認                  | -    |
| AC-5 | 既存の 3 値テスト（CC-1〜CC-5）が全て PASS する（後方互換性）                     | `pnpm --filter @repo/shared vitest run`    | -    |
| AC-6 | 新規 Contract Matrix テスト（全 32 セル + エッジケース）が PASS する              | テスト結果で確認                           | -    |
| AC-7 | `pnpm typecheck` / `pnpm lint` が PASS する                                       | コマンド実行結果で確認                     | -    |

### Task 2: Contract Matrix 仕様との整合性

Phase 2 設計書の Contract Matrix 定義と、実装された `resolveCtaContract()` のマッピングが完全に一致することを検証する。

確認ポイント:

- 各セルの CTA 値（enabled/disabled/hidden）が仕様と一致
- 到達不能セルの扱い（undefined/throw/never）が仕様と一致
- 状態遷移の整合性（例: ready -> streaming への遷移で CTA が正しく変化）

### Task 3: 後方互換性検証

- overload 2 のシグネチャが変更されていないこと
- 新 optional フィールドが全て optional であること
- 既存の import パスが変更されていないこと
- 既存の export が削除されていないこと

### Task 4: 型安全性検証

- `any` 型が使用されていないこと
- `as` キャストが使用されていないこと（P49 準拠）
- non-null assertion (`!`) が使用されていないこと（P48 準拠）
- `Record<UiState, ...>` で網羅性が型レベルで保証されていること
- `Partial` や `as unknown` によるバイパスが存在しないこと

### Task 5: P62 暗黙 fallback 禁止の検証

- resolveUiState() にデフォルト fallback が存在しないこと
- 全条件が明示的に評価されていること
- switch 文の default ケースが `never` 型で到達不能を保証していること

### Task 6: 総合判定

| 判定     | 基準                                             | 対応                               |
| -------- | ------------------------------------------------ | ---------------------------------- |
| PASS     | 全 AC 充足、品質基準達成、後方互換維持           | Phase 11 へ進む                    |
| MINOR    | 軽微な改善点あり（命名、コメント、テスト追加等） | 未タスク仕様書に変換後 Phase 11 へ |
| MAJOR    | AC 未充足、型安全性違反、後方互換性破壊等        | 影響範囲に応じて Phase 1-5 へ戻る  |
| CRITICAL | 設計根本問題、Contract Matrix 仕様との重大な乖離 | Phase 1 へ戻り要件再確認           |

注意: MINOR 指摘は全て未タスク仕様書に変換する。「機能影響なし」でも省略不可。

## 成果物

| 成果物                     | パス                                                 |
| -------------------------- | ---------------------------------------------------- |
| 最終レビューレポート       | `outputs/phase-10/review-report.md`                  |
| MINOR 指摘の未タスク仕様書 | `outputs/phase-10/unassigned-tasks/`（該当する場合） |
| Phase 10 完了レポート      | `outputs/phase-10/`                                  |

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                         | 確認方法                                                                    | 判定基準      |
| -------------------------------- | --------------------------------------------------------------------------- | ------------- |
| 既存テスト（CC-1〜CC-5）への影響 | `pnpm --filter @repo/shared vitest run`                                     | 全テスト PASS |
| Task B（HealthPolicy）との型整合 | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 の CapabilityContext.isDegraded 参照 | 型定義が一致  |

## サブタスク管理

Phase 実行時に TaskCreate / TaskUpdate で進捗を管理する。

- [ ] Phase 開始時: TaskUpdate で status を `in_progress` に更新
- [ ] 各 Task 完了時: TaskUpdate で該当サブタスクを `completed` に更新
- [ ] Phase 完了時: 全サブタスクが `completed` であることを確認

## タスク100%実行確認【必須】

Phase 完了前に以下を確認する:

- [ ] 実行タスクの全項目が実施されている
- [ ] 成果物テーブルの全成果物が作成されている
- [ ] 完了条件の全チェックボックスがチェックされている
- [ ] 次 Phase への引き継ぎ事項が明確である

## 完了条件

- [ ] AC-1〜AC-7 の全受入基準が検証されている
- [ ] Contract Matrix 仕様との整合性が確認されている
- [ ] 後方互換性が確認されている
- [ ] 型安全性が確認されている（any/as/! 不使用）
- [ ] P62 暗黙 fallback 禁止が確認されている
- [ ] 総合判定が PASS / MINOR / MAJOR / CRITICAL のいずれかで下されている
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換されている
- [ ] レビューレポートが `outputs/phase-10/` に保存されている

## 次Phase

[Phase 11: 手動テスト](./phase-11-manual-testing.md)
