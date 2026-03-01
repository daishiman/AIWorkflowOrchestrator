# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目       | 値                                                      |
| ---------- | ------------------------------------------------------- |
| Phase      | 5                                                       |
| 機能名     | UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001                |
| 作成日     | 2026-03-01                                              |
| タスク種別 | Phase 12 運用ガード強化（スクリプト・テンプレート中心） |

## 目的

Phase 4 で作成したテストをすべて成功（Green）にするために、N/A判定ログテンプレート、三点突合検証スクリプト、監査出力パーサー、完了判定ガードチェックリストを実装する。

## 実行タスク

- N/A判定ログテンプレート実装: 仕様書ごとに `更新` または `N/A` を記録するMarkdownテンプレート
- 仕様書別SubAgent分担表テンプレート実装: SubAgent A〜E の担当仕様書割り当てテンプレート
- 三点突合検証スクリプト実装: artifacts.json・changelog・audit結果の3要素を検証するNode.jsスクリプト
- current/baseline分離記録テンプレート実装: 監査結果のcurrent/baselineを分離記録するテンプレート
- Phase 12完了判定ガードチェックリスト実装: 全検証を統合した最終チェックリスト

## 参照資料

| 資料名                    | パス                                                                                | 説明                                        |
| ------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------- |
| Phase 4 テスト仕様書      | `outputs/phase-4/test-specification.md`                                             | Phase 4 成果物                              |
| Phase 4 テストケース一覧  | `outputs/phase-4/test-cases.md`                                                     | TC-01〜TC-06 の詳細ケース                   |
| Phase 4 統合テスト設計    | `outputs/phase-4/integration-test-design.md`                                        | スクリプト間連携の検証設計                  |
| Phase 12 運用テンプレート | `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md` | SubAgent分担・N/A判定ログの既存テンプレート |
| Phase 11-12 ガイド        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`         | Phase 12 の5タスク構成                      |

### システム仕様（aiworkflow-requirements）参照テーブル

| 仕様書                      | 参照目的                           | 適用判定 |
| --------------------------- | ---------------------------------- | -------- |
| `task-workflow.md`          | 残課題テーブル・完了タスク記録形式 | 参照     |
| `error-handling.md`         | バリデーションエラーパターン       | 参照     |
| `development-guidelines.md` | コーディング規約                   | 参照     |

## 実行手順

### ステップ 1: N/A判定ログテンプレート実装

仕様書ごとに `更新` または `N/A` を必ず記録するMarkdownテンプレートを作成する。

配置先: `.claude/skills/skill-creator/assets/phase12-na-judgment-log-template.md`

テンプレート構造:

```markdown
## 仕様書別判定ログ

| #   | 仕様書名     | 判定       | 理由       | 代替証跡                | 担当SubAgent  | 更新日   |
| --- | ------------ | ---------- | ---------- | ----------------------- | ------------- | -------- |
| 1   | {{specName}} | 更新 / N/A | {{reason}} | {{alternativeEvidence}} | {{updatedBy}} | {{date}} |
```

必須制約:

- `判定` 列は `更新` または `N/A` のいずれかのみ許容（空欄は禁止）
- `N/A` の場合、`理由` と `代替証跡` は1文字以上を必須とする
- `担当SubAgent` は `SubAgent-A` 〜 `SubAgent-E` または `leader` のいずれか

### ステップ 2: 仕様書別SubAgent分担表テンプレート実装

SubAgent A〜E の担当仕様書割り当てを固定化するテンプレートを作成する。

配置先: `.claude/skills/skill-creator/assets/phase12-subagent-assignment-template.md`

分担表構造:

| SubAgent   | 担当領域                    | 対象仕様書パターン                  | 最大ファイル数 |
| ---------- | --------------------------- | ----------------------------------- | -------------- |
| SubAgent-A | interfaces（型定義）        | `interfaces-*.md`                   | 3              |
| SubAgent-B | api-ipc（IPC通信）          | `api-ipc-*.md`                      | 3              |
| SubAgent-C | security（セキュリティ）    | `security-*.md`                     | 3              |
| SubAgent-D | task-workflow（タスク管理） | `task-workflow.md`, `LOGS.md`       | 3              |
| SubAgent-E | lessons（教訓・パターン）   | `lessons-learned.md`, `patterns.md` | 3              |

制約: P43 対策として、1 SubAgent あたり最大3ファイルに制限する。

### ステップ 3: N/A判定ログバリデータ実装

Phase 4 のテスト（`na-log-validator.test.ts`）を成功させるバリデーション関数を実装する。

配置先: `.claude/scripts/na-log-validator.ts`

関数シグネチャ:

```typescript
interface NaLogEntry {
  specName: string;
  status: "更新" | "N/A";
  reason: string;
  alternativeEvidence: string;
  updatedBy: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateNaLogEntry(entry: NaLogEntry): ValidationResult;
function validateNaLogEntries(entries: NaLogEntry[]): ValidationResult;
```

バリデーションルール:

1. `specName` が `typeof === "string"` かつ `.trim() !== ""` であること
2. `status` が `"更新"` または `"N/A"` のいずれかであること
3. `status === "N/A"` の場合、`reason.trim() !== ""` であること
4. `status === "N/A"` の場合、`alternativeEvidence.trim() !== ""` であること
5. `updatedBy` が許可値リスト（`SubAgent-A` 〜 `SubAgent-E`, `leader`）に含まれること

### ステップ 4: 三点突合検証スクリプト実装

Phase 4 のテスト（`triple-check-validator.test.ts`）を成功させる検証関数を実装する。

配置先: `.claude/scripts/triple-check-validator.ts`

関数シグネチャ:

```typescript
interface TripleCheckInput {
  artifactsJsonPath: string;
  changelogPath: string;
  auditResult: AuditResult;
}

interface TripleCheckResult {
  overallStatus: "PASS" | "FAIL";
  checks: {
    artifacts: { status: "PASS" | "FAIL"; detail: string };
    changelog: { status: "PASS" | "FAIL"; detail: string };
    audit: { status: "PASS" | "FAIL"; detail: string };
  };
  failedChecks: string[];
}

function validateTripleCheck(input: TripleCheckInput): TripleCheckResult;
```

判定ロジック:

1. `artifacts.json` の Phase 12 ステータスが `"completed"` → PASS、それ以外 → FAIL
2. `documentation-changelog.md` に全変更仕様書が記録 → PASS、未記録あり → FAIL
3. `auditResult.currentViolations.total === 0` → PASS、それ以外 → FAIL
4. 3要素すべて PASS の場合のみ `overallStatus: "PASS"`

### ステップ 5: 監査出力パーサー実装

Phase 4 のテスト（`audit-output-parser.test.ts`）を成功させるパーサーを実装する。

配置先: `.claude/scripts/audit-output-parser.ts`

関数シグネチャ:

```typescript
interface AuditResult {
  currentViolations: { total: number; details: string[] };
  baselineViolations: { total: number; details: string[] };
}

interface ParseResult {
  isValid: boolean;
  result?: AuditResult;
  error?: string;
}

function parseAuditOutput(stdout: string): ParseResult;
function evaluateAuditResult(result: AuditResult): {
  status: "PASS" | "FAIL";
  message: string;
};
```

### ステップ 6: Phase 12 完了判定ガードチェックリスト実装

三点突合の全検証を統合した最終チェックリストテンプレートを作成する。

配置先: `.claude/skills/skill-creator/assets/phase12-completion-guard-checklist.md`

チェックリスト構造:

````markdown
## Phase 12 完了判定ガード

### 前提確認

- [ ] Phase 11（手動テスト）が完了している

### 三点突合

- [ ] artifacts.json の Phase 12 ステータスが `completed`
- [ ] documentation-changelog.md に全変更仕様書が記録されている
- [ ] `audit --diff-from HEAD` の `currentViolations.total === 0`

### N/A判定ログ

- [ ] 全仕様書に `更新` または `N/A` の判定が記録されている
- [ ] N/A判定には理由と代替証跡が記録されている
- [ ] SubAgent分担表に沿った担当者が記録されている

### 検証コマンド実行結果

```bash
# 三点突合検証
node .claude/scripts/triple-check-validator.js --artifacts-path artifacts.json --changelog-path outputs/phase-12/documentation-changelog.md --audit-diff-from HEAD

# N/Aログ検証
node .claude/scripts/na-log-validator.js --log-path outputs/phase-12/na-judgment-log.md
```
````

### 最終判定

- [ ] 三点突合: PASS / FAIL
- [ ] N/Aログ検証: PASS / FAIL
- [ ] 総合判定: PASS（両方PASSの場合のみ）

````

### ステップ 7: current/baseline分離記録テンプレート実装

監査結果のcurrent/baselineを分離記録するテンプレートを作成する。

配置先: `.claude/skills/skill-creator/assets/phase12-audit-record-template.md`

テンプレート構造:

```markdown
## 監査結果記録

### 実行情報
- 実行日時: {{timestamp}}
- diff-from: {{diffFrom}}
- 実行コマンド: `audit-unassigned-tasks --diff-from {{diffFrom}}`

### Current Violations（本タスクで発生）
| total | 詳細 |
|-------|------|
| {{currentTotal}} | {{currentDetails}} |

**合否判定**: {{currentTotal}} === 0 → PASS / FAIL

### Baseline Violations（既存の未解決）
| total | 詳細 |
|-------|------|
| {{baselineTotal}} | {{baselineDetails}} |

**注記**: baseline violations は本タスクのスコープ外。別タスクで対応する。
````

## 統合テスト連携【必須】

Phase 4 で設計した統合テストシナリオの実装を行う:

| 実装項目          | 内容                                                        | 対応テスト                       |
| ----------------- | ----------------------------------------------------------- | -------------------------------- |
| N/Aログバリデータ | `validateNaLogEntry()` / `validateNaLogEntries()` の実装    | `na-log-validator.test.ts`       |
| 三点突合検証関数  | `validateTripleCheck()` の実装                              | `triple-check-validator.test.ts` |
| 監査出力パーサー  | `parseAuditOutput()` / `evaluateAuditResult()` の実装       | `audit-output-parser.test.ts`    |
| スクリプト間連携  | N/Aログ検証 → 三点突合 → 監査コマンドの順次実行パイプライン | 統合テスト                       |

## 多角的チェック観点

| 観点               | 適用判断           | 確認項目                                              |
| ------------------ | ------------------ | ----------------------------------------------------- |
| エラーハンドリング | バリデーション実装 | 不正入力時の明確なエラーメッセージ、型チェック        |
| データ整合性       | 三点突合           | artifacts.json・changelog・audit結果の3ファイル整合性 |
| アーキテクチャ     | スクリプト設計     | 各関数が単一責務を守り、テスト可能な構造              |
| セキュリティ       | 対象外             | -                                                     |
| UI/UX              | 対象外             | -                                                     |

## 実装時の注意事項（既知のPitfall対策）

| Pitfall ID | 注意事項                                     | 対策                                                              |
| ---------- | -------------------------------------------- | ----------------------------------------------------------------- |
| P42        | 文字列引数の .trim() バリデーション漏れ      | 全文字列フィールドで `.trim() === ""` チェックを3段バリデーション |
| P43        | SubAgent の rate limit 中断                  | 1 SubAgent あたり最大3ファイルに制限                              |
| P4         | documentation-changelog への早期「完了」記載 | 全 Step 完了前に「完了」と記載しない                              |

## 設計変更記録（該当する場合）

実装中に Phase 2 の設計から乖離が発生した場合:

- [ ] 乖離内容と理由を `outputs/phase-5/design-changes.md` に記録
- [ ] Phase 2 設計書への影響を評価し、Phase 10 レビューで検証できるようにする

## 成果物

| 成果物                               | パス                                                                          | 説明                               |
| ------------------------------------ | ----------------------------------------------------------------------------- | ---------------------------------- |
| N/A判定ログテンプレート              | `.claude/skills/skill-creator/assets/phase12-na-judgment-log-template.md`     | N/A判定記録用Markdownテンプレート  |
| SubAgent分担表テンプレート           | `.claude/skills/skill-creator/assets/phase12-subagent-assignment-template.md` | SubAgent担当仕様書割り当て表       |
| N/Aログバリデータ                    | `.claude/scripts/na-log-validator.ts`                                         | N/A判定ログの検証スクリプト        |
| 三点突合検証スクリプト               | `.claude/scripts/triple-check-validator.ts`                                   | 完了判定の三点突合検証             |
| 監査出力パーサー                     | `.claude/scripts/audit-output-parser.ts`                                      | audit コマンド出力のパーサー       |
| 完了判定ガードチェックリスト         | `.claude/skills/skill-creator/assets/phase12-completion-guard-checklist.md`   | Phase 12 最終チェックリスト        |
| current/baseline分離記録テンプレート | `.claude/skills/skill-creator/assets/phase12-audit-record-template.md`        | 監査結果のcurrent/baseline分離記録 |
| 実装サマリー                         | `outputs/phase-5/implementation-summary.md`                                   | 実装内容の要約                     |

## 完了条件

- [ ] Phase 4 の全テスト（`na-log-validator.test.ts`, `triple-check-validator.test.ts`, `audit-output-parser.test.ts`）が成功状態（Green）
- [ ] N/A判定ログテンプレートが作成されている
- [ ] SubAgent分担表テンプレートが作成されている
- [ ] N/Aログバリデータが実装されている
- [ ] 三点突合検証スクリプトが実装されている
- [ ] 監査出力パーサーが実装されている
- [ ] 完了判定ガードチェックリストが作成されている
- [ ] current/baseline分離記録テンプレートが作成されている
- [ ] 実装コードが単一責務を守り、テスト可能な構造である
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 4 成果物を含む）
2. N/A判定ログテンプレート実装
3. SubAgent分担表テンプレート実装
4. N/Aログバリデータ実装
5. 三点突合検証スクリプト実装
6. 監査出力パーサー実装
7. Phase 12 完了判定ガードチェックリスト実装
8. current/baseline分離記録テンプレート実装
9. 統合テスト連携の実施
10. 成果物の作成・配置
11. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 --phase 5
```

## TDD検証

```bash
# テスト実行コマンド
cd .claude/scripts && pnpm vitest run __tests__/na-log-validator.test.ts __tests__/triple-check-validator.test.ts __tests__/audit-output-parser.test.ts

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## 次のPhase

Phase 6: テスト拡充
