# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                                      |
| ---------- | ------------------------------------------------------- |
| Phase      | 6                                                       |
| 機能名     | UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001                |
| 作成日     | 2026-03-01                                              |
| タスク種別 | Phase 12 運用ガード強化（スクリプト・テンプレート中心） |

## 目的

Phase 5 で実装したN/Aログバリデータ・三点突合検証・監査出力パーサーに対して、境界値テスト・異常系テスト・部分一致テストを追加し、カバレッジ基準を達成する。

## 実行タスク

- N/A判定ログ境界値テスト追加: 理由が1文字、代替証跡なし、specNameの空白のみ入力のテスト
- 三点突合部分一致テスト追加: 2/3 PASS の場合の判定テスト（全組み合わせ）
- 監査コマンド出力形式検証テスト追加: 不正JSON、フィールド欠損、負の数値のテスト
- 統合テスト追加: N/Aログ検証 → 三点突合 → 監査コマンドの順次実行パイプラインテスト

## 参照資料

| 資料名                   | パス                                        | 説明                      |
| ------------------------ | ------------------------------------------- | ------------------------- |
| Phase 4 テスト仕様書     | `outputs/phase-4/test-specification.md`     | Phase 4 成果物            |
| Phase 4 テストケース一覧 | `outputs/phase-4/test-cases.md`             | TC-01〜TC-06 の詳細ケース |
| Phase 5 実装サマリー     | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物            |
| N/Aログバリデータ        | `.claude/scripts/na-log-validator.ts`       | Phase 5 実装コード        |
| 三点突合検証スクリプト   | `.claude/scripts/triple-check-validator.ts` | Phase 5 実装コード        |
| 監査出力パーサー         | `.claude/scripts/audit-output-parser.ts`    | Phase 5 実装コード        |

### システム仕様（aiworkflow-requirements）参照テーブル

| 仕様書                      | 参照目的                                   | 適用判定 |
| --------------------------- | ------------------------------------------ | -------- |
| `task-workflow.md`          | 残課題テーブル・完了タスク記録形式         | 参照     |
| `error-handling.md`         | エラーカテゴリ（バリデーション 1000-1999） | 参照     |
| `development-guidelines.md` | テストカバレッジ基準                       | 参照     |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| バリデーション関数カバレッジ | 100% |
| 三点突合の判定パターン       | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 境界値シナリオ               | 100% |

## 実行手順

### ステップ 1: カバレッジ測定

現在のカバレッジを測定し、不足領域を特定する。

```bash
cd .claude/scripts && pnpm vitest run --coverage __tests__/na-log-validator.test.ts __tests__/triple-check-validator.test.ts __tests__/audit-output-parser.test.ts
```

### ステップ 2: N/A判定ログ境界値テスト追加

`na-log-validator.test.ts` に以下のテストケースを追加する:

| テストケース ID | シナリオ                        | 入力                                         | 期待結果                        |
| --------------- | ------------------------------- | -------------------------------------------- | ------------------------------- |
| TC-05-B1        | reason が1文字                  | `{ status: "N/A", reason: "a" }`             | PASS（1文字は有効）             |
| TC-05-B2        | reason がスペースのみ           | `{ status: "N/A", reason: "   " }`           | FAIL（trimで空になる）          |
| TC-05-B3        | alternativeEvidence が空        | `{ status: "N/A", alternativeEvidence: "" }` | FAIL（N/Aは代替証跡必須）       |
| TC-05-B4        | status が "更新" で reason が空 | `{ status: "更新", reason: "" }`             | PASS（更新の場合は理由不要）    |
| TC-05-B5        | specName がスペースのみ         | `{ specName: "   " }`                        | FAIL（P42: trim空チェック）     |
| TC-05-B6        | updatedBy が不正値              | `{ updatedBy: "SubAgent-F" }`                | FAIL（許可値リスト外）          |
| TC-05-B7        | status が不正値                 | `{ status: "スキップ" }`                     | FAIL（"更新" / "N/A" 以外）     |
| TC-05-B8        | 全フィールドが有効（N/A）       | 完全なN/Aエントリ                            | PASS                            |
| TC-05-B9        | 全フィールドが有効（更新）      | 完全な更新エントリ                           | PASS                            |
| TC-05-B10       | entries配列が空                 | `[]`                                         | FAIL（少なくとも1エントリ必須） |

### ステップ 3: 三点突合部分一致テスト追加

`triple-check-validator.test.ts` に以下の組み合わせテストを追加する:

| テストケース ID | artifacts | changelog | audit | 期待結果 | failedChecks                          |
| --------------- | --------- | --------- | ----- | -------- | ------------------------------------- |
| TC-06-C1        | PASS      | PASS      | PASS  | PASS     | `[]`                                  |
| TC-06-C2        | FAIL      | PASS      | PASS  | FAIL     | `["artifacts"]`                       |
| TC-06-C3        | PASS      | FAIL      | PASS  | FAIL     | `["changelog"]`                       |
| TC-06-C4        | PASS      | PASS      | FAIL  | FAIL     | `["audit"]`                           |
| TC-06-C5        | FAIL      | FAIL      | PASS  | FAIL     | `["artifacts", "changelog"]`          |
| TC-06-C6        | FAIL      | PASS      | FAIL  | FAIL     | `["artifacts", "audit"]`              |
| TC-06-C7        | PASS      | FAIL      | FAIL  | FAIL     | `["changelog", "audit"]`              |
| TC-06-C8        | FAIL      | FAIL      | FAIL  | FAIL     | `["artifacts", "changelog", "audit"]` |

### ステップ 4: 監査コマンド出力形式検証テスト追加

`audit-output-parser.test.ts` に以下のテストケースを追加する:

| テストケース ID | シナリオ                         | 入力                                                                    | 期待結果                          |
| --------------- | -------------------------------- | ----------------------------------------------------------------------- | --------------------------------- |
| TC-04-D1        | 正常なJSON（current=0）          | `{ currentViolations: { total: 0 } }`                                   | PASS                              |
| TC-04-D2        | 正常なJSON（current>0）          | `{ currentViolations: { total: 3 } }`                                   | FAIL（詳細付き）                  |
| TC-04-D3        | 不正なJSON                       | `"not json"`                                                            | ParseError                        |
| TC-04-D4        | currentViolations フィールド欠損 | `{ baselineViolations: { total: 0 } }`                                  | ParseError（必須フィールド欠損）  |
| TC-04-D5        | total が文字列                   | `{ currentViolations: { total: "0" } }`                                 | ParseError（型不正）              |
| TC-04-D6        | total が負の数値                 | `{ currentViolations: { total: -1 } }`                                  | ParseError（0以上の整数のみ許容） |
| TC-04-D7        | 空文字列                         | `""`                                                                    | ParseError                        |
| TC-04-D8        | baseline情報付き正常JSON         | `{ currentViolations: { total: 0 }, baselineViolations: { total: 5 } }` | PASS（currentのみで判定）         |

### ステップ 5: 統合テスト追加

`.claude/scripts/__tests__/phase12-guard-integration.test.ts` に統合テストを追加する:

| テストケース ID | シナリオ                               | 検証内容                                              |
| --------------- | -------------------------------------- | ----------------------------------------------------- |
| TC-INT-01       | 全要素正常で完了判定                   | N/Aログ検証PASS → 三点突合PASS → 総合PASS             |
| TC-INT-02       | N/Aログ検証失敗で中断                  | N/Aログ検証FAIL → 三点突合は実行されない → 総合FAIL   |
| TC-INT-03       | N/Aログ検証成功 + 三点突合失敗         | N/Aログ検証PASS → 三点突合FAIL → 総合FAIL             |
| TC-INT-04       | 監査結果にbaseline違反あり + current=0 | N/AログPASS → 三点突合PASS → 総合PASS（baseline無視） |

### ステップ 6: カバレッジ再測定

追加テスト後にカバレッジを再測定し、基準達成を確認する。

```bash
cd .claude/scripts && pnpm vitest run --coverage __tests__/na-log-validator.test.ts __tests__/triple-check-validator.test.ts __tests__/audit-output-parser.test.ts __tests__/phase12-guard-integration.test.ts
```

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ       | 検証項目                                               | 目標 |
| -------------------- | ------------------------------------------------------ | ---- |
| バリデーション境界値 | N/Aログの全フィールド境界値（空白のみ、1文字、不正値） | 100% |
| 判定組み合わせ       | 三点突合の全8パターン（2^3）                           | 100% |
| パーサー異常系       | JSON不正、フィールド欠損、型不正                       | 80%+ |
| パイプライン連携     | N/Aログ → 三点突合 → 監査の順次実行                    | 100% |

## 多角的チェック観点

| 観点               | 適用判断         | 確認項目                                             |
| ------------------ | ---------------- | ---------------------------------------------------- |
| エラーハンドリング | 境界値テスト     | 空白のみ入力、型不正、フィールド欠損での明確なエラー |
| データ整合性       | 組み合わせテスト | 三点突合の全8パターンで正しい判定が返る              |
| アーキテクチャ     | 統合テスト       | スクリプト間の責務分離が維持されている               |
| セキュリティ       | 対象外           | -                                                    |
| UI/UX              | 対象外           | -                                                    |

## 成果物

| 成果物               | パス                                                                 | 説明                     |
| -------------------- | -------------------------------------------------------------------- | ------------------------ |
| カバレッジレポート   | `outputs/phase-6/coverage-report.md`                                 | カバレッジ分析結果       |
| 統合テスト結果       | `outputs/phase-6/integration-test.md`                                | 統合テスト実行結果       |
| 境界値テスト         | `.claude/scripts/__tests__/na-log-validator.test.ts`（追加分）       | N/A判定ログ境界値テスト  |
| 組み合わせテスト     | `.claude/scripts/__tests__/triple-check-validator.test.ts`（追加分） | 三点突合全パターンテスト |
| パーサー異常系テスト | `.claude/scripts/__tests__/audit-output-parser.test.ts`（追加分）    | 監査出力の異常系テスト   |
| 統合テスト           | `.claude/scripts/__tests__/phase12-guard-integration.test.ts`        | パイプライン統合テスト   |

## 完了条件

- [ ] N/A判定ログ境界値テスト（TC-05-B1〜TC-05-B10）が追加され全PASS
- [ ] 三点突合組み合わせテスト（TC-06-C1〜TC-06-C8）が追加され全PASS
- [ ] 監査出力パーサー異常系テスト（TC-04-D1〜TC-04-D8）が追加され全PASS
- [ ] 統合テスト（TC-INT-01〜TC-INT-04）が追加され全PASS
- [ ] ユニットテストカバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] カバレッジレポートが `outputs/phase-6/coverage-report.md` に出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 4, 5 成果物を含む）
2. 現在のカバレッジ測定
3. N/A判定ログ境界値テスト追加（TC-05-B1〜TC-05-B10）
4. 三点突合部分一致テスト追加（TC-06-C1〜TC-06-C8）
5. 監査コマンド出力形式検証テスト追加（TC-04-D1〜TC-04-D8）
6. 統合テスト追加（TC-INT-01〜TC-INT-04）
7. カバレッジ再測定と基準達成確認
8. 成果物の作成・配置
9. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認
