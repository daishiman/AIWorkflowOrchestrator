# Phase 4 成果物: テスト仕様書

## タスクID: UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001

## 作成日: 2026-03-01

## 概要

Phase 12 完了判定の三点突合、N/A判定ログの必須化、監査結果の一貫判定を検証するテストシナリオとテストコードの設計書。TDD Red 状態（テストが失敗する状態）でテストを作成し、Phase 5 で実装を行う。

## テストシナリオ一覧

| Case ID | シナリオ名                        | テストファイル                 | 入力状態                     | 期待結果                  |
| ------- | --------------------------------- | ------------------------------ | ---------------------------- | ------------------------- |
| TC-01   | N/A判定ログ未記載                 | na-log-validator.test.ts       | entries が空配列             | isValid=false, エラーあり |
| TC-02   | artifacts.json が pending         | triple-check-validator.test.ts | artifactsJsonPath="pending"  | overallStatus="FAIL"      |
| TC-03   | documentation-changelog 未同期    | triple-check-validator.test.ts | changelogPath="unsynced"     | overallStatus="FAIL"      |
| TC-04   | audit currentViolations.total===0 | audit-output-parser.test.ts    | currentViolations.total=0    | status="PASS"             |
| TC-05   | N/A判定の reason フィールド空     | na-log-validator.test.ts       | status="N/A", reason=""      | isValid=false             |
| TC-06   | 三点突合3要素すべてPASS           | triple-check-validator.test.ts | completed, synced, current=0 | overallStatus="PASS"      |

## テスト対象モジュール

### 1. na-log-validator.ts

| 関数名                 | 責務                                      | テスト数 |
| ---------------------- | ----------------------------------------- | -------- |
| `validateNaLogEntry`   | 単一のN/A判定ログエントリのバリデーション | 8        |
| `validateNaLogEntries` | N/A判定ログエントリ群の一括バリデーション | 2        |

**バリデーションルール:**

- specName: 空文字列を拒否
- status: "更新" または "N/A" のみ許可
- reason: status="N/A" の場合に空文字列を拒否
- alternativeEvidence: status="N/A" の場合に空文字列を拒否
- updatedBy: "SubAgent-A", "SubAgent-B", "SubAgent-C", "SubAgent-D", "SubAgent-E", "leader" のみ許可

### 2. triple-check-validator.ts

| 関数名                | 責務                                  | テスト数 |
| --------------------- | ------------------------------------- | -------- |
| `validateTripleCheck` | 三点突合の完了判定（3要素の合否判定） | 7        |

**判定ルール:**

- artifacts: "completed" で PASS、それ以外で FAIL
- changelog: "synced" で PASS、それ以外で FAIL
- audit: currentViolations.total === 0 で PASS、> 0 で FAIL
- overallStatus: 3要素すべて PASS の場合のみ "PASS"、それ以外は "FAIL"
- baselineViolations は PASS/FAIL 判定に影響しない（FR-3 AC-3-2 準拠）

### 3. audit-output-parser.ts

| 関数名                | 責務                                   | テスト数 |
| --------------------- | -------------------------------------- | -------- |
| `parseAuditOutput`    | audit コマンドの JSON 出力をパースする | 6        |
| `evaluateAuditResult` | パース結果から PASS/FAIL を判定する    | 4        |

**パースルール:**

- JSON パースが失敗した場合: isValid=false
- currentViolations フィールドが欠損: isValid=false
- baselineViolations フィールドが欠損: isValid=false
- total が数値型でない場合: isValid=false

## テストファイル配置先一覧

| テストファイル                                             | テスト対象                     |
| ---------------------------------------------------------- | ------------------------------ |
| `.claude/scripts/__tests__/na-log-validator.test.ts`       | N/A判定ログバリデーション      |
| `.claude/scripts/__tests__/triple-check-validator.test.ts` | 三点突合完了判定ロジック       |
| `.claude/scripts/__tests__/audit-output-parser.test.ts`    | 監査コマンド出力のパース・判定 |

## テスト実行コマンド

```bash
cd .claude/scripts && pnpm vitest run __tests__/na-log-validator.test.ts __tests__/triple-check-validator.test.ts __tests__/audit-output-parser.test.ts
```

## TDD 状態

Phase 4 完了時点では全テストが **Red（失敗）** 状態であること。実装ファイル（na-log-validator.ts, triple-check-validator.ts, audit-output-parser.ts）は Phase 5 で作成する。

## 要件トレーサビリティ

| 要件ID | テストケース        | 検証内容                                |
| ------ | ------------------- | --------------------------------------- |
| FR-1   | TC-01, TC-05        | N/A判定ログの必須フィールド検証         |
| FR-2   | TC-02, TC-03, TC-06 | 三点突合の完了判定ロジック検証          |
| FR-3   | TC-04               | current/baseline分離の判定基準検証      |
| AC-1-2 | TC-05               | N/A判定のreason空文字列拒否             |
| AC-3-1 | TC-04               | currentViolations.total===0 で PASS     |
| AC-3-2 | 基本テスト          | baseline違反がPASS/FAIL判定に影響しない |
