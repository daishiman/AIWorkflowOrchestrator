# Phase 12 実装ガイド

## Part 1（初学者向け）

### なぜこの作業が必要か

今回の監査タスクは「仕様書に書いてあること」と「実際の仕様ファイル」がズレないようにするために行う。
ズレたままだと、次の実装者が古い説明を信じてしまい、同じ手戻りが繰り返される。

### 日常生活での例え

これは「学校の案内板の更新」に近い。
教室が移動したのに案内板が古いままだと、みんな迷う。
今回の作業は、案内板（仕様書）を正しい場所（正本）と同じ内容にそろえる作業。

### このタスクでやったこと

| 観点     | 実施内容                                             | 効果                         |
| -------- | ---------------------------------------------------- | ---------------------------- |
| 正本導線 | `00-1-design-tokens.md` の正本リンクを実在パスに修正 | 参照先の迷子を防止           |
| UX言語   | `task-059a` に Before/After の具体例を追加           | 用語統一の実装解釈を固定     |
| 適用境界 | `task-061` に Task 5B の対象/対象外を明示            | 対象外判断のぶれを防止       |
| 自動検証 | `validate-foundation-findings.mjs` + テスト追加      | 同じ指摘の再発を機械的に検出 |

### 対象外判定テンプレート（QA-ACT-003）

Task 5B のように「適用しない」場合は、下の形で必ず理由を書く。

| 観点     | 判定   | 理由                                            |
| -------- | ------ | ----------------------------------------------- |
| <機能名> | 対象外 | <主責務ではないため / 別仕様で管理しているため> |

## Part 2（技術者向け）

### 変更アーキテクチャ

- 仕様修正: `skill-import-agent-system/tasks/*` の監査対象仕様を修正
- 検証コード: `tools/validate-foundation-findings.mjs`
- 単体テスト: `tools/__tests__/validate-foundation-findings.test.mjs`
- Step 1-A 同期: `task-workflow.md` / `lessons-learned.md` / `ui-ux-components.md` / `ui-ux-feature-components.md`

### 型定義（TypeScript相当）

```ts
export type CheckStatus = "PASS" | "FAIL";

export interface FindingCheck {
  id: "FND-055-001" | "FND-055-002" | "FND-055-003";
  status: CheckStatus;
  detail: string;
  target: string;
}

export interface ValidationReport {
  generatedAt: string;
  repoRoot: string;
  checks: FindingCheck[];
  pass: boolean;
}
```

### APIシグネチャ

```ts
runValidation(options?: { repoRoot?: string }): ValidationReport;
validateCanonicalLink(filePath: string, markdown: string, repoRoot: string): FindingCheck;
validateUxExamples(filePath: string, markdown: string, repoRoot: string): FindingCheck;
validateTask5BScope(filePath: string, markdown: string, repoRoot: string): FindingCheck;
```

### CLI使用例

```bash
node docs/30-workflows/completed-tasks/task-055-ui-00-foundation-reflection-audit/tools/validate-foundation-findings.mjs \
  --output docs/30-workflows/completed-tasks/task-055-ui-00-foundation-reflection-audit/outputs/phase-12/finding-validation-report.json \
  --json
```

### エラーハンドリング

- 不明オプション: exit code `2`
- 入力ファイル欠落: exit code `1`
- チェックFAIL: exit code `1`
- 全チェックPASS: exit code `0`

### エッジケース

- `## 正本` セクション未定義
- 正本リンクが自己参照
- Task 5D 具体例テーブルの行数不足
- Task 5B 境界で「対象」「対象外」のどちらか欠落

### 設定項目

| オプション    | 必須 | 既定値                | 説明                     |
| ------------- | ---- | --------------------- | ------------------------ |
| `--repo-root` | 任意 | スクリプトから4階層上 | 検証対象リポジトリルート |
| `--output`    | 任意 | なし                  | JSONレポート出力先       |
| `--json`      | 任意 | `false`               | 標準出力へJSON表示       |

### テスト実行

```bash
node --test \
  docs/30-workflows/completed-tasks/task-055-ui-00-foundation-reflection-audit/tools/__tests__/traceability-audit.test.mjs \
  docs/30-workflows/completed-tasks/task-055-ui-00-foundation-reflection-audit/tools/__tests__/validate-foundation-findings.test.mjs
```
