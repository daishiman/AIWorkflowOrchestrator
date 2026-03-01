# Phase 4 成果物: 統合テスト設計

## タスクID: UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001

## 作成日: 2026-03-01

## 概要

本ドキュメントでは、N/Aログ検証、三点突合、監査コマンド出力パースの3モジュール間の連携テスト設計を定義する。Phase 12 完了判定パイプライン全体の整合性を検証する。

## パイプライン全体像

```
N/Aログ検証 → 三点突合 → 監査コマンド出力パース
     │              │              │
     ▼              ▼              ▼
NaLogEntry[]   TripleCheckInput   AuditResult
  の検証         の合否判定        のパース・評価
     │              │              │
     ▼              ▼              ▼
ValidationResult  TripleCheckResult  EvaluateResult
```

### 実行順序

1. **N/Aログ検証**: SubAgent が記録したN/A判定ログの完全性を検証する
2. **監査コマンド出力パース**: `audit --diff-from HEAD` の stdout を JSON パースし、AuditResult を生成する
3. **三点突合**: artifacts.json ステータス、changelog 同期状態、AuditResult の3要素で最終判定を行う

### モジュール間データフロー

```
                  ┌─────────────────────┐
                  │  audit コマンド出力   │
                  │  (JSON文字列)        │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  parseAuditOutput   │
                  │  → ParseResult       │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  evaluateAuditResult│
                  │  → EvaluateResult    │
                  └──────────┬──────────┘
                             │
  ┌──────────────┐           │         ┌──────────────────┐
  │ artifacts.json│           │         │ changelog 同期状態│
  │ ステータス   │           │         │                  │
  └──────┬───────┘           │         └────────┬─────────┘
         │                   │                  │
         ▼                   ▼                  ▼
  ┌──────────────────────────────────────────────────┐
  │              validateTripleCheck                  │
  │  → TripleCheckResult (overallStatus: PASS|FAIL) │
  └──────────────────────────────────────────────────┘
```

## スクリプト間連携テスト設計

### 連携パターン

| 連携カテゴリ         | 検証内容                                        | テスト種別 |
| -------------------- | ----------------------------------------------- | ---------- |
| スクリプト間連携     | N/Aログ検証 → 三点突合 → 監査コマンドの順次実行 | 結合テスト |
| ファイルI/O検証      | テンプレートからのN/Aログ生成 → バリデーション  | ユニット   |
| コマンド出力パース   | `audit --diff-from HEAD` の stdout パース       | ユニット   |
| 完了判定パイプライン | 三点突合の全要素を順次検証し最終判定を出力      | 統合テスト |

## 統合テストケース

### TC-INT-01: 正常系パイプライン（全 PASS）

**目的**: N/Aログ検証 PASS → 監査結果パース PASS → 三点突合 PASS の完全成功パスを検証する

**前提条件**:

- N/A判定ログに有効なエントリが5件存在する
- audit コマンド出力が有効な JSON で currentViolations.total === 0
- artifacts.json が "completed"、changelog が "synced"

**入力データ**:

```typescript
// Step 1: N/Aログ検証
const naEntries: NaLogEntry[] = [
  {
    specName: "interfaces-agent.md",
    status: "更新",
    reason: "AgentConfig型にtimeoutフィールドを追加",
    alternativeEvidence: "diff: +timeout: number (L42)",
    updatedBy: "SubAgent-A",
  },
  {
    specName: "api-ipc-agent.md",
    status: "N/A",
    reason: "今回のタスクはIPC変更を含まないため",
    alternativeEvidence:
      "grep -rn 'agent:' apps/desktop/src/main/ で変更0件を確認",
    updatedBy: "SubAgent-B",
  },
  {
    specName: "security-api.md",
    status: "N/A",
    reason: "セキュリティ関連の変更を含まないため",
    alternativeEvidence:
      "git diff --stat -- apps/desktop/src/main/security/ で0ファイル変更",
    updatedBy: "SubAgent-C",
  },
  {
    specName: "task-workflow.md",
    status: "更新",
    reason: "完了タスクテーブルにタスクIDを追加",
    alternativeEvidence: "diff: +UT-IMP-PHASE12 | completed (L120)",
    updatedBy: "SubAgent-D",
  },
  {
    specName: "lessons-learned.md",
    status: "N/A",
    reason: "今回のタスクで新規教訓は検出されなかったため",
    alternativeEvidence: "Phase 10レビュー結果: 教訓候補0件",
    updatedBy: "SubAgent-E",
  },
];

// Step 2: 監査コマンド出力パース
const auditJson = JSON.stringify({
  currentViolations: { total: 0, details: [] },
  baselineViolations: {
    total: 1,
    details: ["topic-map.md のセクション数不一致"],
  },
});

// Step 3: 三点突合
const tripleCheckInput: TripleCheckInput = {
  artifactsJsonPath: "completed",
  changelogPath: "synced",
  auditResult: parseAuditOutput(auditJson).result!,
};
```

**期待結果**:

- Step 1: `validateNaLogEntries(naEntries).isValid === true`
- Step 2: `parseAuditOutput(auditJson).isValid === true`
- Step 3: `validateTripleCheck(tripleCheckInput).overallStatus === "PASS"`

---

### TC-INT-02: N/Aログ検証失敗による早期中断

**目的**: N/Aログ検証が失敗した場合、後続の三点突合に進まずエラーを報告することを検証する

**前提条件**:

- N/A判定ログに reason 空のエントリが存在する
- 他の条件はすべて正常

**入力データ**:

```typescript
// Step 1: N/Aログ検証（reason 空で失敗）
const naEntries: NaLogEntry[] = [
  {
    specName: "api-ipc-agent.md",
    status: "N/A",
    reason: "", // 空 → バリデーションエラー
    alternativeEvidence: "grep で確認済み",
    updatedBy: "SubAgent-B",
  },
];
```

**期待結果**:

- Step 1: `validateNaLogEntries(naEntries).isValid === false`
- パイプラインは Step 1 で中断し、エラーを報告する
- 三点突合は実行されない

**判定基準**:

N/Aログ検証が失敗した状態で三点突合を実行しても、Phase 12 完了は宣言できない。早期中断により不完全な状態での完了判定を防止する。

---

### TC-INT-03: 監査出力パース失敗による三点突合 FAIL

**目的**: audit コマンド出力のパースが失敗した場合、三点突合で audit 要素が FAIL となることを検証する

**前提条件**:

- audit コマンドが不正な JSON を出力した
- N/Aログ検証は PASS
- artifacts.json と changelog は正常

**入力データ**:

```typescript
// Step 1: N/Aログ検証（PASS）
const naEntries: NaLogEntry[] = [
  {
    specName: "task-workflow.md",
    status: "更新",
    reason: "完了タスクテーブルを更新",
    alternativeEvidence: "diff 出力で確認",
    updatedBy: "SubAgent-D",
  },
];

// Step 2: 監査コマンド出力パース（失敗）
const auditJson = "{ invalid json output from audit command";
const parseResult = parseAuditOutput(auditJson);
// parseResult.isValid === false

// Step 3: パース失敗時のフォールバック AuditResult
const fallbackAuditResult = {
  currentViolations: {
    total: -1,
    details: ["パースエラー: 監査出力を解析できない"],
  },
  baselineViolations: { total: 0, details: [] },
};

const tripleCheckInput: TripleCheckInput = {
  artifactsJsonPath: "completed",
  changelogPath: "synced",
  auditResult: fallbackAuditResult,
};
```

**期待結果**:

- Step 2: `parseAuditOutput(auditJson).isValid === false`
- Step 3: `validateTripleCheck(tripleCheckInput).overallStatus === "FAIL"`
- `result.checks.audit.status === "FAIL"`

**判定基準**:

監査出力のパースに失敗した場合、currentViolations.total を正確に判定できないため、安全側に倒して FAIL とする（フェイルセキュア原則）。

---

### TC-INT-04: 複合失敗シナリオ（N/Aログ FAIL + artifacts pending）

**目的**: 複数の検証要素が同時に失敗した場合、全失敗要素が明示されることを検証する

**前提条件**:

- N/A判定ログに空の entries が存在する
- artifacts.json が "pending"
- audit 結果に currentViolations が存在する

**入力データ**:

```typescript
// Step 1: N/Aログ検証（FAIL — 空配列）
const naEntries: NaLogEntry[] = [];
const naResult = validateNaLogEntries(naEntries);
// naResult.isValid === false

// Step 3: 三点突合（複数 FAIL）
const tripleCheckInput: TripleCheckInput = {
  artifactsJsonPath: "pending",
  changelogPath: "unsynced",
  auditResult: {
    currentViolations: { total: 2, details: ["違反A", "違反B"] },
    baselineViolations: { total: 0, details: [] },
  },
};
```

**期待結果**:

- Step 1: `validateNaLogEntries(naEntries).isValid === false`
- Step 3: `validateTripleCheck(tripleCheckInput).overallStatus === "FAIL"`
- `result.failedChecks` に "artifacts", "changelog", "audit" の3要素が含まれる

**判定基準**:

複数の検証要素が同時に失敗した場合、failedChecks に全失敗要素を列挙することで、修正が必要な箇所を一目で把握できるようにする。

## ファイルI/O検証設計

### 検証対象

| ファイル                   | 操作     | 検証内容                                    |
| -------------------------- | -------- | ------------------------------------------- |
| spec-update-summary.md     | 読み取り | N/A管理ログセクションからエントリを抽出可能 |
| artifacts.json             | 読み取り | Phase 12 ステータスフィールドの取得         |
| documentation-changelog.md | 読み取り | 変更記録の同期状態の判定                    |
| audit コマンド stdout      | パース   | JSON 形式の監査結果の取得                   |

### 設計方針

本タスクのスクリプトはファイルI/Oを直接行わず、関数が入力データを直接受け取る設計とする。ファイルの読み込みは呼び出し側の責務とし、バリデーション・判定ロジックを純粋関数として実装する。

**理由**:

1. テストの実行速度を高速に保つ（ファイルシステムアクセス不要）
2. テスト間のファイルシステム状態の依存を排除する
3. 入力データのバリエーションを容易にテスト可能にする

### ファイルI/O統合テスト（将来実装）

ファイルの実際の読み書きを検証する統合テストは、Phase 6（テスト拡充）で検討する。Phase 4 では関数の入出力ロジックのみをテスト対象とする。

## テスト実行コマンド

```bash
# 個別実行
cd .claude/scripts && pnpm vitest run __tests__/na-log-validator.test.ts
cd .claude/scripts && pnpm vitest run __tests__/triple-check-validator.test.ts
cd .claude/scripts && pnpm vitest run __tests__/audit-output-parser.test.ts

# 全テスト一括実行
cd .claude/scripts && pnpm vitest run

# カバレッジ付き実行
cd .claude/scripts && pnpm vitest run --coverage
```

## 要件トレーサビリティ

| 統合テストケース | 検証対象要件     | 検証内容                                   |
| ---------------- | ---------------- | ------------------------------------------ |
| TC-INT-01        | FR-1, FR-2, FR-3 | 正常系パイプライン全体の PASS 判定         |
| TC-INT-02        | FR-1, AC-1-2     | N/Aログ検証失敗時の早期中断                |
| TC-INT-03        | FR-3, NFR-3      | 監査出力パース失敗時のフェイルセキュア動作 |
| TC-INT-04        | FR-1, FR-2       | 複合失敗時の全失敗要素の明示               |
