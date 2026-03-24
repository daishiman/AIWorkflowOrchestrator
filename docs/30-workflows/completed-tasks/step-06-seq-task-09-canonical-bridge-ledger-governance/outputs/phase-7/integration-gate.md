# Phase 7 成果物: 統合ゲート

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 7 - カバレッジ確認

## 1. 統合ゲートの目的

Phase 4-7 の成果物が全て作成され、Phase 8（リファクタリング）着手条件を満たしていることを確認する。
全チェック項目が PASS の場合のみ Phase 8 に進行する。1項目でも FAIL の場合は Phase 6 に戻る。

## 2. Phase 4 成果物の統合確認

| チェック項目                             | 確認方法                                        | 結果 |
| ---------------------------------------- | ----------------------------------------------- | ---- |
| test-matrix.md が存在する                | `ls outputs/phase-4/test-matrix.md`             | PASS |
| Unit TC が14件以上定義されている         | U-1-1 ~ U-3-8 の行数確認                        | PASS |
| Integration TC が6件以上定義されている   | I-1 ~ I-6 の行数確認                            | PASS |
| Contract TC が12件以上定義されている     | C-1 ~ C-12 の行数確認                           | PASS |
| Manual TC が5件以上定義されている        | M-1 ~ M-5 の行数確認                            | PASS |
| mock-strategy.md が存在する              | `ls outputs/phase-4/mock-strategy.md`           | PASS |
| モック境界が定義されている（副作用分離） | rsync/LOGS.md/gh issue close のモック方針を確認 | PASS |
| テスト優先度マップが定義されている       | test-matrix.md Section 6 の存在確認             | PASS |

## 3. Phase 5 成果物の統合確認

| チェック項目                                | 確認方法                                     | 結果 |
| ------------------------------------------- | -------------------------------------------- | ---- |
| implementation-plan.md が存在する           | `ls outputs/phase-5/implementation-plan.md`  | PASS |
| Step A-E の変更順序テーブルが定義されている | implementation-plan.md Section 2 の存在確認  | PASS |
| Step 間の依存関係が定義されている           | 依存関係図（A→B→C→D→E）の存在確認            | PASS |
| 責務分離マップが定義されている              | Lane 別変更責務テーブルの存在確認            | PASS |
| 禁止事項と回避策が定義されている            | P43/P4/P59/P1/P25/P2/P56 の回避策記載確認    | PASS |
| Rollback 手順が定義されている               | 中断 Step 別のリカバリ手順テーブルの存在確認 | PASS |
| サブエージェント分割計画が定義されている    | SA-C-1/2/3 の分割テーブルの存在確認          | PASS |
| file-change-scope.md が存在する             | `ls outputs/phase-5/file-change-scope.md`    | PASS |
| 新規作成ファイル一覧が定義されている        | 成果物ファイルリストの存在確認               | PASS |
| 参照のみファイル一覧が定義されている        | 7カテゴリのファイルリストの存在確認          | PASS |
| Phase 12 更新ファイル一覧が定義されている   | Step A-E 対象ファイルテーブルの存在確認      | PASS |
| 変更波及分析が定義されている                | 後続タスクへの影響記述の存在確認             | PASS |

## 4. Phase 6 成果物の統合確認

| チェック項目                                            | 確認方法                                             | 結果 |
| ------------------------------------------------------- | ---------------------------------------------------- | ---- |
| regression-expansion-plan.md が存在する                 | `ls outputs/phase-6/regression-expansion-plan.md`    | PASS |
| 既存 Pitfall の governance 関連分類が定義されている     | Phase 12 同期系の Pitfall テーブル（18件）の存在確認 | PASS |
| 新規 drift 検出ルール（D-SM/D-CS/D-SW）が定義されている | 10件の新規ルールテーブルの存在確認                   | PASS |
| 検出ルール統合テーブルが定義されている                  | Phase 10/12 別の実行ルールテーブルの存在確認         | PASS |
| edge-case-matrix.md が存在する                          | `ls outputs/phase-6/edge-case-matrix.md`             | PASS |
| UNVERIFIED 境界ケースが12件以上列挙されている           | BC-1 ~ BC-12 の行数確認                              | PASS |
| RISK-HIGH 境界ケースが5件列挙されている                 | BC-2/5/8/10/11 の予防策記載確認                      | PASS |
| Phase 別の対応マトリクスが定義されている                | Phase 9/10/11 別の BC 割り当て確認                   | PASS |

## 5. Phase 7 成果物の統合確認

| チェック項目                                 | 確認方法                                             | 結果 |
| -------------------------------------------- | ---------------------------------------------------- | ---- |
| coverage-targets.md が存在する               | `ls outputs/phase-7/coverage-targets.md`             | PASS |
| FR カバレッジ目標が 100% で定義されている    | FR-1〜5 の全グループが 100% 目標で記載されている     | PASS |
| AC カバレッジ目標が 100% で定義されている    | AC-1〜4 の全項目が 100% 目標で記載されている         | PASS |
| テストケース合計が63件以上                   | Phase 4 定義37件 + Phase 6 追加26件 = 63件の記載確認 | PASS |
| Pitfall カバレッジが必須9件をカバー          | P1/P2/P3/P4/P25/P43/P56/P59/P26 の対応 TC 記載確認   | PASS |
| Edge Case カバレッジ目標が定義されている     | RISK-HIGH 5件の対処期限 Phase が記載されている       | PASS |
| カバレッジ達成チェックリストが定義されている | 7項目のチェックリストテーブルの存在確認              | PASS |
| integration-gate.md が存在する（本書）       | `ls outputs/phase-7/integration-gate.md`             | PASS |

## 6. Cross-Phase 整合性確認

Phase 4-7 の成果物間で整合性が取れていることを確認する。

| 整合性チェック項目                                                                        | 検証方法                                                  | 結果 |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---- |
| test-matrix.md の FR 参照が requirements-definition.md と一致                             | TC の対象 FR 列が FR-1.1〜5.4 の範囲内                    | PASS |
| mock-strategy.md のモック対象が implementation-plan.md の Step と一致                     | rsync/generate-index.js/gh issue close が両ファイルに登場 | PASS |
| file-change-scope.md の更新ファイルが implementation-plan.md の Step 対象と一致           | Step A-E の対象ファイルが両ファイルで同一                 | PASS |
| edge-case-matrix.md の BC が coverage-targets.md の RISK-HIGH リストと一致                | BC-2/5/8/10/11 が両ファイルに登場                         | PASS |
| regression-expansion-plan.md の D-SW ルールが validation-matrix.md の回帰防止ルールを包含 | D-SW-1〜4 が P1/P2/P3/P4/P43/P56/P59 をカバー             | PASS |
| implementation-plan.md の禁止事項が contract-matrix.md の禁止アクションと一致             | 7件の禁止事項が両ファイルで矛盾なし                       | PASS |
| design-summary.md の 3 Lane が test-matrix.md のテスト分類と一致                          | L-1→U-1系/L-2→U-2系/L-3→U-3系の対応                       | PASS |

## 7. Gate 判定

### 7.1 判定結果

| 項目                          | 結果     | 根拠                                                                |
| ----------------------------- | -------- | ------------------------------------------------------------------- |
| Phase 4 成果物完了            | PASS     | test-matrix.md + mock-strategy.md が存在し要件充足                  |
| Phase 5 成果物完了            | PASS     | implementation-plan.md + file-change-scope.md が存在し要件充足      |
| Phase 6 成果物完了            | PASS     | regression-expansion-plan.md + edge-case-matrix.md が存在し要件充足 |
| Phase 7 成果物完了            | PASS     | coverage-targets.md + integration-gate.md が存在し要件充足          |
| Cross-Phase 整合性            | PASS     | 7件の整合性チェック全て PASS                                        |
| FR カバレッジ 100%            | PASS     | FR-1.1〜5.4 全18項目が validation-matrix.md にマッピング済み        |
| AC カバレッジ 100%            | PASS     | AC-1〜4 全4項目が validation-matrix.md にマッピング済み             |
| Pitfall カバレッジ（必須9件） | PASS     | 9件全てに対応 TC が存在                                             |
| **最終判定**                  | **PASS** | **Phase 8 着手条件を充足**                                          |

### 7.2 Phase 8 着手条件チェックリスト

Phase 8（リファクタリング）に着手するための前提条件:

- [x] Phase 4 成果物: test-matrix.md が存在し、TC が37件以上
- [x] Phase 4 成果物: mock-strategy.md が存在し、モック境界が定義されている
- [x] Phase 5 成果物: implementation-plan.md が存在し、Step A-E が定義されている
- [x] Phase 5 成果物: file-change-scope.md が存在し、変更/参照/除外が分類されている
- [x] Phase 6 成果物: regression-expansion-plan.md が存在し、drift 検出ルールが定義されている
- [x] Phase 6 成果物: edge-case-matrix.md が存在し、RISK-HIGH が5件特定されている
- [x] Phase 7 成果物: coverage-targets.md が存在し、FR/AC カバレッジが100%目標
- [x] Phase 7 成果物: integration-gate.md が存在し、PASS 判定されている
- [x] Cross-Phase 整合性: 7件のチェック全て PASS
- [x] Phase 2 design-summary.md の 3 Lane 設計と Phase 4-7 成果物に矛盾がない

### 7.3 Phase 6 戻り条件

以下のいずれかに該当する場合は Phase 6 に戻る:

| 戻り条件                                               | 判定方法                                            | 現在の状態     |
| ------------------------------------------------------ | --------------------------------------------------- | -------------- |
| FR カバレッジが100%未満                                | validation-matrix.md の FR 行数 < 18                | 非該当（PASS） |
| AC カバレッジが100%未満                                | validation-matrix.md の AC 行数 < 4                 | 非該当（PASS） |
| 必須 Pitfall（9件）のうち1件でも対応 TC がない         | coverage-targets.md の Pitfall テーブルに空欄がある | 非該当（PASS） |
| RISK-HIGH 境界ケース（5件）のうち1件でも対処方針が未定 | edge-case-matrix.md の予防策列に空欄がある          | 非該当（PASS） |
| Cross-Phase 整合性チェックで1件でも FAIL               | Section 6 のテーブルに FAIL が存在する              | 非該当（PASS） |
| Phase 4-7 の成果物ファイルが1つでも欠損                | `ls outputs/phase-{4,5,6,7}/` で期待ファイルが不足  | 非該当（PASS） |

## 8. 成果物ファイル一覧（Phase 4-7）

Phase 4-7 で作成された全成果物の最終一覧:

| Phase | ファイル名                   | 行数概算 | 主要コンテンツ                      |
| ----- | ---------------------------- | -------- | ----------------------------------- |
| 4     | test-matrix.md               | 100行    | Unit/Integration/Contract/Manual TC |
| 4     | mock-strategy.md             | 116行    | モック境界 + テンプレート           |
| 5     | implementation-plan.md       | 119行    | Step A-E + 責務分離 + Rollback      |
| 5     | file-change-scope.md         | 111行    | 新規/参照/更新ファイルの3層分類     |
| 6     | regression-expansion-plan.md | 89行     | drift 検出ルール + Pitfall 分類     |
| 6     | edge-case-matrix.md          | 76行     | UNVERIFIED/RISK-HIGH/MEDIUM/LOW BC  |
| 7     | coverage-targets.md          | 97行     | FR/AC/TC/Pitfall/Edge カバレッジ    |
| 7     | integration-gate.md          | 本書     | 統合完了判定 + Phase 8 着手条件     |
