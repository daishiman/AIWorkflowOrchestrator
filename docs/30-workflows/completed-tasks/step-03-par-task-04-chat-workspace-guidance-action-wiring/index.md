# chat-workspace-guidance-action-wiring - タスク実行仕様書

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| タスク名     | chat-workspace-guidance-action-wiring              |
| 分類         | 設計                                               |
| 対象機能     | Main Chat / Workspace の blocked guidance 実配線   |
| 優先度       | 高                                                 |
| 見積もり規模 | 中規模                                             |
| ステータス   | implementation_ready                               |
| 作成日       | 2026-03-19                                         |
| 更新日       | 2026-03-22                                         |

## タスク概要

### 目的

Main Chat と Workspace の blocked guidance を shared mapping へ寄せ、同じ reason には同じ message / CTA / guard を返す状態を固定する。

### 最終ゴール

- Chat / Workspace の model selection blocked が同じ文言と同じ settings CTA を使う
- `blockedReason` が send guard の single source になる
- screenshot evidence、unassigned、canonical sync まで同じ wave で閉じる

## Phase 一覧

| Phase | 名称             | 仕様書                                                         | ステータス | 主な成果物                                                                      |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  | requirements-definition / scope-definition / current-state-inventory            |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  | design-summary / contract-matrix / validation-matrix                            |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  | design-review-report / gate-decision                                            |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  | test-matrix / mock-strategy                                                     |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  | implementation-plan / file-change-scope                                         |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  | regression-expansion-plan / edge-case-matrix                                    |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  | coverage-targets / integration-gate                                             |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  | refactor-boundaries / simplification-candidates                                 |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  | quality-checklist / risk-register                                               |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  | final-review-report / final-gate-decision                                       |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  | manual-test-plan / manual-test-result / screenshot-plan / screenshot-coverage   |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  | implementation-guide / spec-update-summary / unassigned / feedback / compliance |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    | pr-preparation                                                                  |

## 実行サマリー

1. shared guidance module を追加し、Chat / Workspace の local 判定を `blockedReason` 基準へ統一した
2. `GuidanceBlock` を secondary CTA 対応に拡張し、handler 未実装時は no-op を避けて非表示にした
3. typecheck / vitest / dedicated capture script で code と screenshot evidence を取得した
4. standalone root、parent/downstream path、canonical refs、unassigned 4件、mirror parity を同期した
5. Phase 13 は user approval 待ちのため blocked を維持した

## 完了条件

- [x] Phase 1〜12 が completed、Phase 13 が blocked
- [x] AC-1〜AC-5 を code / tests / screenshots / docs で裏付けた
- [x] outputs/phase-11 に screenshot evidence 一式が存在する
- [x] outputs/phase-12 に required 6 artifacts が存在する
- [x] workflow / backlog / lessons / mirror parity が same-wave sync されている
