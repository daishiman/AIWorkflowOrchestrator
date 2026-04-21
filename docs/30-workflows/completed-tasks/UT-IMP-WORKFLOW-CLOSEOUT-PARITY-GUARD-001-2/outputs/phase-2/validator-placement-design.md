# validator-placement-design.md

## メタ情報

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| 文書種別 | Phase 2 設計成果物                            |
| タスクID | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001     |
| 作成日   | 2026-04-19                                    |
| 対象     | validate-closeout-parity.js CLI契約・配置設計 |

---

## 1. 概要

この文書は `validate-closeout-parity.js` のCLI契約（引数・終了コード）、JSON出力スキーマ、および `verify-all-specs.js` への組込み位置を設計する。

---

## 2. CLIインターフェース契約

### 2.1 配置パス

```
.claude/skills/task-specification-creator/scripts/validate-closeout-parity.js
```

### 2.2 引数仕様

| 引数         | 必須 | 型     | 説明                                               |
| ------------ | ---- | ------ | -------------------------------------------------- |
| `--workflow` | 必須 | string | 対象workflowディレクトリのパス（相対・絶対両対応） |
| `--json`     | 任意 | flag   | 指定時はJSON出力モード、省略時は人間可読テキスト   |

**未知の引数はusage errorとして即時rejectする（exit code 1、stderr出力）**

### 2.3 呼び出し例

```bash
# 標準テキスト出力（人間確認用）
node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
  --workflow docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001

# JSON出力モード（CI・スクリプト連携用）
node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
  --workflow docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 \
  --json
```

### 2.4 終了コード仕様

| exitCode | 意味                                          |
| -------- | --------------------------------------------- |
| 0        | `PARITY_OK` - 全情報源が一致                  |
| 1        | `PARITY_DRIFT` - 1つ以上のPhaseでdrift検出    |
| 2        | `MISSING_SOURCE` - 必須ファイルが存在しない   |
| 3        | `INVALID_STATUS_VALUE` - 不正なstatus値を検出 |

---

## 3. JSON出力スキーマ

### 3.1 TypeScript型定義（ParityReport）

```typescript
type ParityReport = {
  workflow: string;
  code:
    | "PARITY_OK"
    | "PARITY_DRIFT"
    | "MISSING_SOURCE"
    | "INVALID_STATUS_VALUE";
  exitCode: 0 | 1 | 2 | 3;
  generatedAt: string; // ISO8601
  sourcesChecked: ["S1", "S2", "S3", "S4"];
  drifts: Array<{
    phase: number;
    sources: { S1: string; S2: string; S3: string; S4: string };
    expected: string;
    severity: "error";
  }>;
  missing?: { source: "S1" | "S2" | "S3" | "S4"; reason: string };
  invalid?: { phase: number; source: string; value: string };
};
```

### 3.2 各フィールドの意味

| フィールド          | 型                       | 必須 | 説明                                                 |
| ------------------- | ------------------------ | ---- | ---------------------------------------------------- |
| `workflow`          | string                   | 必須 | 検証対象workflowの絶対パス（--workflowの解決済み値） |
| `code`              | union string             | 必須 | 結果コード（4種類）                                  |
| `exitCode`          | 0 \| 1 \| 2 \| 3         | 必須 | プロセス終了コード（codeと1:1対応）                  |
| `generatedAt`       | string (ISO8601)         | 必須 | レポート生成日時（UTC）                              |
| `sourcesChecked`    | `["S1","S2","S3","S4"]`  | 必須 | 常に固定値（4情報源を検証したことの記録）            |
| `drifts`            | Array                    | 必須 | drift一覧（PARITY_OKの場合は空配列 `[]`）            |
| `drifts[].phase`    | number                   | 必須 | drift発生Phase番号（1..13）                          |
| `drifts[].sources`  | object                   | 必須 | 各情報源の生値（正規化前、'-' はそのまま表示）       |
| `drifts[].expected` | string                   | 必須 | canonical値（S2→S3→S1→S4の優先順位で決定）           |
| `drifts[].severity` | `"error"`                | 必須 | 常に `"error"`（severity段階はこの版では1種類のみ）  |
| `missing`           | object (optional)        | 任意 | MISSING_SOURCEの場合のみ存在                         |
| `missing.source`    | `"S1"\|"S2"\|"S3"\|"S4"` | 必須 | 欠損情報源のID                                       |
| `missing.reason`    | string                   | 必須 | 欠損の理由（人間可読メッセージ）                     |
| `invalid`           | object (optional)        | 任意 | INVALID_STATUS_VALUEの場合のみ存在                   |
| `invalid.phase`     | number                   | 必須 | 不正値が検出されたPhase番号                          |
| `invalid.source`    | string                   | 必須 | 不正値の情報源ID（"S1"〜"S4"）                       |
| `invalid.value`     | string                   | 必須 | 検出された不正なstatus値                             |

### 3.3 出力例（PARITY_OK）

```json
{
  "workflow": "/absolute/path/to/docs/30-workflows/feature-name",
  "code": "PARITY_OK",
  "exitCode": 0,
  "generatedAt": "2026-04-19T10:00:00.000Z",
  "sourcesChecked": ["S1", "S2", "S3", "S4"],
  "drifts": []
}
```

### 3.4 出力例（PARITY_DRIFT）

```json
{
  "workflow": "/absolute/path/to/docs/30-workflows/feature-name",
  "code": "PARITY_DRIFT",
  "exitCode": 1,
  "generatedAt": "2026-04-19T10:00:00.000Z",
  "sourcesChecked": ["S1", "S2", "S3", "S4"],
  "drifts": [
    {
      "phase": 3,
      "sources": {
        "S1": "completed",
        "S2": "completed",
        "S3": "pending",
        "S4": "completed"
      },
      "expected": "completed",
      "severity": "error"
    }
  ]
}
```

### 3.5 出力例（MISSING_SOURCE）

```json
{
  "workflow": "/absolute/path/to/docs/30-workflows/feature-name",
  "code": "MISSING_SOURCE",
  "exitCode": 2,
  "generatedAt": "2026-04-19T10:00:00.000Z",
  "sourcesChecked": ["S1", "S2", "S3", "S4"],
  "drifts": [],
  "missing": {
    "source": "S3",
    "reason": "outputs/artifacts.json が存在しない"
  }
}
```

### 3.6 出力例（INVALID_STATUS_VALUE）

```json
{
  "workflow": "/absolute/path/to/docs/30-workflows/feature-name",
  "code": "INVALID_STATUS_VALUE",
  "exitCode": 3,
  "generatedAt": "2026-04-19T10:00:00.000Z",
  "sourcesChecked": ["S1", "S2", "S3", "S4"],
  "drifts": [],
  "invalid": {
    "phase": 5,
    "source": "S2",
    "value": "done"
  }
}
```

---

## 4. verify-all-specs.js への組込み設計

### 4.1 組込み位置

既存の検証パイプラインの末尾、PASS判定の直前に挿入する。

```
【変更前】
  [構造検証] → [整合性検証] → [品質検証] → [完全性検証] → PASS/FAIL出力

【変更後】
  [構造検証] → [整合性検証] → [品質検証] → [完全性検証] → [parity検証] → PASS/FAIL出力
                                                              ↑ 新規追加
```

### 4.2 組込みロジック

```javascript
// verify-all-specs.js 末尾に追加するブロック（概略）

const { execSync } = require("child_process");

function runParityValidation(workflowDir) {
  try {
    const output = execSync(
      `node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
       --workflow ${workflowDir} --json`,
      { encoding: "utf-8" },
    );
    const report = JSON.parse(output);
    return report;
  } catch (err) {
    // execSyncはexit code != 0でthrowする
    const report = JSON.parse(err.stdout || "{}");
    return report;
  }
}

// 既存検証完了後、PASS判定前に実行
const parityReport = runParityValidation(workflowDir);

if (parityReport.code !== "PARITY_OK") {
  // drift検出時は全体をFAILに格上げ
  overallResult = "FAIL";
  results.parity = {
    status: "FAIL",
    code: parityReport.code,
    drifts: parityReport.drifts,
  };
} else {
  results.parity = {
    status: "PASS",
    code: "PARITY_OK",
    drifts: [],
  };
}
```

### 4.3 後方互換性の設計

- 既存のJSON出力スキーマに `parity` フィールドを追加する（optional扱い）
- 既存consumerは `parity` フィールドを参照しなければ従来通り動作する
- `parity` フィールドが存在しない古い出力を参照するconsumerは影響を受けない

### 4.4 parity検証の失敗処理

- drift検出時（exitCode 1）: 全体をFAIL扱いとする
- missing検出時（exitCode 2）: 全体をFAIL扱いとする
- invalid検出時（exitCode 3）: 全体をFAIL扱いとする
- validator自体のクラッシュ: 全体をFAIL扱いとし、エラーメッセージを出力する

---

## 5. read-only契約

`validate-closeout-parity.js` は読み取り専用（read-only）とする。

### 5.1 禁止される操作

```
# 絶対に使用禁止
fs.writeFile(...)
fs.writeFileSync(...)
fs.appendFile(...)
fs.appendFileSync(...)
fs.mkdir(...)  // 出力ディレクトリ作成も禁止
```

### 5.2 許可される操作

```
# 読み取り専用操作のみ許可
fs.readFile(...)
fs.readFileSync(...)
fs.existsSync(...)
fs.readdirSync(...)
```

### 5.3 read-only契約の検証方法

Phase 4のテスト作成時に、validator実行後のファイルシステムが変化していないことをsnapshotで確認する。

---

## 6. 既存 validate-phase-output.js との責務境界

| 観点               | validate-phase-output.js      | validate-closeout-parity.js              |
| ------------------ | ----------------------------- | ---------------------------------------- |
| 検証対象           | 単一Phase出力の内容・構造     | S1〜S4の4情報源間status一致性            |
| 読み取り先         | outputs/phase-N/ 配下ファイル | index.md / artifacts.json*2 / phase-*.md |
| 書き込み           | なし（read-only）             | なし（read-only）                        |
| 呼び出しタイミング | Phase完了時の個別検証         | verify-all-specs.js経由の全体検証        |
| exitCode           | 独自（0/1）                   | 0/1/2/3（独立した値体系）                |

両者は独立して動作し、互いの機能を重複しない。

---

## 7. 参照

| 参照先                 | パス                                                 |
| ---------------------- | ---------------------------------------------------- |
| parity判定アルゴリズム | `outputs/phase-2/parity-algorithm-design.md`         |
| complete-phase拡張設計 | `outputs/phase-2/complete-phase-extension-design.md` |
| Phase 1 要件定義       | `outputs/phase-1/requirements.md`                    |
| Phase 1 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`             |
