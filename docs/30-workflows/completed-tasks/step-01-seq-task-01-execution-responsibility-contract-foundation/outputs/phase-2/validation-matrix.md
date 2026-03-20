# Phase 2: 検証マトリクス (Validation Matrix)

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 2                                                         |
| 作成日   | 2026-03-20                                                |

## Integration Point 別検証観点

| 検証項目                             | Phase 3 (review)                                                                       | Phase 4 (test)                                                                                         | Phase 11 (manual)                                                       | Phase 12 (doc)                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | --------------------------------------------------- |
| capability 判定ロジック（Concern A） | 語彙 drift チェック: `authMode` / `integrated_api` 等の旧語彙が残存していないか        | Unit test: RuntimePolicyResolver の 4 状態出力を CA-1-CA-5 で検証                                      | -                                                                       | IPC contract ドキュメントに capability 4 状態を記載 |
| state 変換ロジック（Concern B）      | state drift チェック: capability x state の全組み合わせが contract-matrix と一致するか | Unit test: Renderer selector が capability から正しい uiState を導出するか CB-1-CB-5 で検証            | -                                                                       | Renderer 責務ドキュメントに state 変換ルールを記載  |
| CTA 表示条件（Concern C）            | contract-matrix 照合: 全セルの primary / secondary CTA が定義されているか              | Component test: capability x state の全組み合わせで CTA が正しく表示 / 非表示になるか CC-1-CC-5 で検証 | 画面確認: TC-01-TC-06 で CTA の表示状態を目視確認                       | UI 仕様ドキュメントに CTA 契約を記載                |
| 禁止事項（FR-4）                     | 境界定義の完全性: 3 禁止項目の enforcement 方法が記述されているか                      | Integration test: silent fallback / auto-send / hidden injection が発生しないことを R-1-R-3 で検証     | TC-06: capability=none で integrated_api への fallback がないことを確認 | 禁止事項ドキュメントに enforcement 方法を記載       |

## AC 別検証パス

| AC   | 検証対象                          | Phase 3 確認方法                                                   | Phase 4 テスト方法                             | Phase 11 手動確認                   |
| ---- | --------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- | ----------------------------------- |
| AC-1 | capability 4 状態の責務と表示契約 | contract-matrix に 4 行 x state/CTA が全記載                       | CA-1-CA-5 の Unit test                         | TC-01-TC-04 の capability card 確認 |
| AC-2 | UI 状態語彙と CTA 契約の 1:1 対応 | contract-matrix の state x CTA セルが全て primary + secondary 形式 | CB-1-CB-5 + CC-1-CC-5 の Unit / Component test | TC-05 の状態遷移確認                |
| AC-3 | 禁止事項の boundary 文章化        | validation-matrix に enforcement 方法が記述済み                    | R-1-R-3 の Integration test                    | TC-06 の silent fallback 不在確認   |
| AC-4 | canonical doc set の明示          | scope-definition.md にパス一覧が記載済み                           | -                                              | -                                   |

## 検証グレード基準

### Phase 3（設計レビュー）

| 判定  | 条件                                                          |
| ----- | ------------------------------------------------------------- |
| PASS  | 全 AC の検証パスが定義済み、語彙 drift 0 件、state drift 0 件 |
| MINOR | 用語の微修正のみ（型定義の変更を伴わない）                    |
| MAJOR | concern 分解の見直しが必要、または contract-matrix に矛盾あり |

### Phase 10（最終レビュー）

| 判定     | 条件                                                           |
| -------- | -------------------------------------------------------------- |
| PASS     | AC-1-AC-4 全て verified、後続影響なし                          |
| MINOR    | 用語の微修正・ドキュメント補足が必要（未タスク仕様書変換必須） |
| MAJOR    | concern 分解の見直しが必要                                     |
| CRITICAL | 親パックの task 分割方針との根本矛盾                           |

## テスト - 検証項目対応表

| テストカテゴリ         | テスト ID 範囲 | 対応 concern | 対応 AC | 担当 Phase |
| ---------------------- | -------------- | ------------ | ------- | ---------- |
| capability 判定        | CA-1 - CA-5    | Concern A    | AC-1    | Phase 4-5  |
| state 語彙変換         | CB-1 - CB-5    | Concern B    | AC-2    | Phase 4-5  |
| CTA 表示条件           | CC-1 - CC-5    | Concern C    | AC-2    | Phase 4-5  |
| 統合シナリオ           | S-1 - S-4      | A + B + C    | AC-1-3  | Phase 5-6  |
| 回帰テスト（禁止事項） | R-1 - R-3      | A + C        | AC-3    | Phase 6    |
| 境界ケース             | E-1 - E-8      | A + B + C    | AC-1-3  | Phase 6    |
| 手動 walkthrough       | TC-01 - TC-06  | A + B + C    | AC-1-3  | Phase 11   |
