# Phase 4 成果物: テストケース詳細

## タスクID: UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001

## 作成日: 2026-03-01

## TC-01: N/A判定ログ未記載シナリオ

### 前提条件

- Phase 12 のシステム仕様書更新タスクが開始されている
- N/A判定ログの entries 配列が空のまま提出された

### 入力データ

```typescript
const entries: NaLogEntry[] = [];
```

### 実行手順

1. `validateNaLogEntries(entries)` を呼び出す
2. 戻り値の `isValid` と `errors` を検証する

### 期待結果

- `result.isValid === false`
- `result.errors.length > 0`
- エラーメッセージに「空」を含む文字列が存在する

### 判定基準

entries が空配列の場合、仕様書に対して更新もN/A判定も行われていないことを意味するため、バリデーションエラーとして拒否する。

### テストファイル

`.claude/scripts/__tests__/na-log-validator.test.ts`

### 対応要件

FR-1（N/A判定ログテンプレートの定義）

---

## TC-02: artifacts.json が pending シナリオ

### 前提条件

- Phase 12 の全タスクがまだ完了していない
- artifacts.json の Phase 12 ステータスが "pending" のまま

### 入力データ

```typescript
const input: TripleCheckInput = {
  artifactsJsonPath: "pending",
  changelogPath: "synced",
  auditResult: {
    currentViolations: { total: 0, details: [] },
    baselineViolations: { total: 0, details: [] },
  },
};
```

### 実行手順

1. `validateTripleCheck(input)` を呼び出す
2. 戻り値の `overallStatus`, `checks.artifacts.status`, `failedChecks` を検証する

### 期待結果

- `result.overallStatus === "FAIL"`
- `result.checks.artifacts.status === "FAIL"`
- `result.failedChecks` に `"artifacts"` が含まれる

### 判定基準

artifacts.json のステータスが "completed" でない場合、Phase 12 完了を宣言できない。三点突合の1要素が FAIL であるため、全体判定も FAIL となる。

### テストファイル

`.claude/scripts/__tests__/triple-check-validator.test.ts`

### 対応要件

FR-2（三点突合の判定基準定義）

---

## TC-03: documentation-changelog 未同期シナリオ

### 前提条件

- Phase 12 のシステム仕様書更新は完了している
- documentation-changelog.md に未記録の仕様書変更が存在する

### 入力データ

```typescript
const input: TripleCheckInput = {
  artifactsJsonPath: "completed",
  changelogPath: "unsynced",
  auditResult: {
    currentViolations: { total: 0, details: [] },
    baselineViolations: { total: 0, details: [] },
  },
};
```

### 実行手順

1. `validateTripleCheck(input)` を呼び出す
2. 戻り値の `overallStatus`, `checks.changelog.status`, `failedChecks` を検証する

### 期待結果

- `result.overallStatus === "FAIL"`
- `result.checks.changelog.status === "FAIL"`
- `result.failedChecks` に `"changelog"` が含まれる

### 判定基準

documentation-changelog.md が未同期の場合、仕様書変更の記録が不完全であるため、Phase 12 完了を宣言できない。P4（documentation-changelog への早期「完了」記載）防止策の検証でもある。

### テストファイル

`.claude/scripts/__tests__/triple-check-validator.test.ts`

### 対応要件

FR-2（三点突合の判定基準定義）、P4 防止策

---

## TC-04: audit currentViolations.total===0 シナリオ

### 前提条件

- audit コマンド (`audit-unassigned-tasks --diff-from HEAD`) が実行済み
- 今回のタスクで新規に発生した違反は 0 件

### 入力データ

```typescript
const auditResult = {
  currentViolations: { total: 0, details: [] },
  baselineViolations: {
    total: 3,
    details: ["既知違反1", "既知違反2", "既知違反3"],
  },
};
```

### 実行手順

1. `evaluateAuditResult(auditResult)` を呼び出す
2. 戻り値の `status` を検証する

### 期待結果

- `result.status === "PASS"`

### 判定基準

currentViolations.total === 0 の場合、今回のタスクで新規違反が発生していないため、監査結果は PASS と判定する。baselineViolations（タスク着手前から存在する既知の違反）は PASS/FAIL 判定に影響しない（FR-3 AC-3-2 準拠）。

### テストファイル

`.claude/scripts/__tests__/audit-output-parser.test.ts`

### 対応要件

FR-3（current/baseline分離記録フォーマット）、AC-3-1、AC-3-2

---

## TC-05: N/A判定の reason フィールド空シナリオ

### 前提条件

- SubAgent が仕様書をN/A判定としたが、理由を記録していない

### 入力データ

```typescript
const entry: NaLogEntry = {
  specName: "api-ipc-agent.md",
  status: "N/A",
  reason: "",
  alternativeEvidence: "grep で確認済み、変更対象外であることを検証",
  updatedBy: "SubAgent-B",
};
```

### 実行手順

1. `validateNaLogEntry(entry)` を呼び出す
2. 戻り値の `isValid` と `errors` を検証する

### 期待結果

- `result.isValid === false`
- `result.errors` に `"reason"` を含むエラーメッセージが存在する

### 判定基準

status="N/A" の場合、reason フィールドは必須である（FR-1 AC-1-2 準拠）。空文字列は「判定理由が記録されていない」ことを意味するため、バリデーションエラーとして拒否する。

### テストファイル

`.claude/scripts/__tests__/na-log-validator.test.ts`

### 対応要件

FR-1（N/A判定ログテンプレートの定義）、AC-1-2

---

## TC-06: 三点突合3要素すべてPASSシナリオ

### 前提条件

- artifacts.json の Phase 12 ステータスが "completed"
- documentation-changelog.md が全仕様書変更を記録済み（synced）
- audit 結果の currentViolations.total === 0

### 入力データ

```typescript
const input: TripleCheckInput = {
  artifactsJsonPath: "completed",
  changelogPath: "synced",
  auditResult: {
    currentViolations: { total: 0, details: [] },
    baselineViolations: {
      total: 2,
      details: ["既知の違反A", "既知の違反B"],
    },
  },
};
```

### 実行手順

1. `validateTripleCheck(input)` を呼び出す
2. 戻り値の `overallStatus`, 各 `checks` の `status`, `failedChecks` を検証する

### 期待結果

- `result.overallStatus === "PASS"`
- `result.checks.artifacts.status === "PASS"`
- `result.checks.changelog.status === "PASS"`
- `result.checks.audit.status === "PASS"`
- `result.failedChecks` が空配列

### 判定基準

3要素すべてが PASS の場合、Phase 12 完了判定として PASS を返す。baselineViolations が存在しても、currentViolations.total === 0 であるため audit は PASS と判定する（FR-3 AC-3-2 準拠）。

### テストファイル

`.claude/scripts/__tests__/triple-check-validator.test.ts`

### 対応要件

FR-2（三点突合の判定基準定義）、FR-3（current/baseline分離）

---

## 追加テストケース（基本検証）

### na-log-validator 追加テスト

| テスト名                                                    | 入力                                            | 期待結果      | 対応要件 |
| ----------------------------------------------------------- | ----------------------------------------------- | ------------- | -------- |
| specName が空文字列の場合に FAIL                            | specName=""                                     | isValid=false | FR-1     |
| status が "更新" の場合は有効                               | status="更新"                                   | isValid=true  | FR-1     |
| status が "N/A" の場合に reason と alternativeEvidence 必須 | status="N/A", reason="", alternativeEvidence="" | isValid=false | FR-1     |
| updatedBy が許可値リスト外の場合に FAIL                     | updatedBy="Unknown-Agent"                       | isValid=false | FR-1     |
| 有効な N/A エントリの場合に PASS                            | 全フィールド有効                                | isValid=true  | FR-1     |
| 有効な更新エントリの場合に PASS                             | status="更新", 全フィールド有効                 | isValid=true  | FR-1     |
| updatedBy が "SubAgent-A" の場合に有効                      | updatedBy="SubAgent-A"                          | isValid=true  | FR-4     |
| updatedBy が "SubAgent-E" の場合に有効                      | updatedBy="SubAgent-E"                          | isValid=true  | FR-4     |
| updatedBy が "leader" の場合に有効                          | updatedBy="leader"                              | isValid=true  | FR-4     |

### triple-check-validator 追加テスト

| テスト名                                     | 入力                                  | 期待結果                | 対応要件    |
| -------------------------------------------- | ------------------------------------- | ----------------------- | ----------- |
| audit の currentViolations.total > 0 で FAIL | currentViolations.total=3             | overallStatus="FAIL"    | FR-3        |
| 複数要素 FAIL で failedChecks に全要素含む   | pending, unsynced, total=1            | failedChecks.length===3 | FR-2        |
| baseline 違反のみ存在でも PASS               | currentViolations.total=0, baseline=5 | overallStatus="PASS"    | FR-3 AC-3-2 |
| 2/3 PASS（部分一致）で FAIL、残り1要素を明示 | completed, synced, total=2            | failedChecks=["audit"]  | FR-2        |

### audit-output-parser 追加テスト

| テスト名                                 | 入力                   | 期待結果                | 対応要件 |
| ---------------------------------------- | ---------------------- | ----------------------- | -------- |
| 正常な JSON で isValid=true              | 有効な JSON 文字列     | isValid=true            | NFR-3    |
| 不正な JSON で isValid=false             | "{ invalid json"       | isValid=false           | NFR-3    |
| baselineViolations 欠損で isValid=false  | currentViolations のみ | isValid=false           | FR-3     |
| total が数値型でない場合に isValid=false | total="zero"           | isValid=false           | FR-3     |
| 空文字列で isValid=false                 | ""                     | isValid=false           | NFR-3    |
| currentViolations.total > 0 で FAIL      | total=2                | status="FAIL"           | FR-3     |
| current=0, baseline > 0 で PASS          | current=0, baseline=5  | status="PASS"           | FR-3     |
| FAIL 時に details 内容が結果に含まれる   | details=["違反内容"]   | detail に違反内容を含む | FR-3     |
