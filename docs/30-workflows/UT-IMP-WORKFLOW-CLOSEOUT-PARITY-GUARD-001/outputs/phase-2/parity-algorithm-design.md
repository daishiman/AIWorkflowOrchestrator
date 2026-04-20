# parity判定アルゴリズム設計

## メタ情報

| 項目      | 内容                                      |
| --------- | ----------------------------------------- |
| 文書種別  | Phase 2 設計成果物                        |
| タスクID  | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| 作成日    | 2026-04-19                                |
| 対象Phase | Phase 2 設計                              |

---

## 1. 概要

この文書は `validate-closeout-parity.js` が実装すべきparity判定アルゴリズムを決定論的に記述する。実装者が本文書の疑似コードを1:1でコードに変換できる粒度を目標とする。

---

## 2. 情報源（S1〜S4）の定義

### 2.1 情報源マップ

| ID  | 名称              | 物理パス                                | 書き手              |
| --- | ----------------- | --------------------------------------- | ------------------- |
| S1  | index.md Phase表  | `<workflow>/index.md`                   | `generate-index.js` |
| S2  | root artifacts    | `<workflow>/artifacts.json`             | `complete-phase.js` |
| S3  | outputs artifacts | `<workflow>/outputs/artifacts.json`     | `complete-phase.js` |
| S4  | phase frontmatter | `<workflow>/phase-N-*.md`（N=1..13 各） | `complete-phase.js` |

### 2.2 S1の読み取り仕様（readIndexMdPhaseTable）

```
function readIndexMdPhaseTable(indexMdPath):
  if not fileExists(indexMdPath):
    return { missing: true, source: "S1", reason: "index.md が存在しない" }

  content = readFile(indexMdPath)

  // Phase表の検索パターン:
  //   | Phase N | ... | <status> |
  //   Markdownテーブルの3列目以降にstatusが入る
  tableRows = extractMarkdownTableRows(content)

  result = {}  // { phaseNum: status }
  for row in tableRows:
    match = row.match(/^\|\s*Phase\s*(\d+)\s*\|[^|]*\|\s*([^|]+?)\s*\|/)
    if match:
      phaseNum = parseInt(match[1])
      rawStatus = match[2].trim()
      // "-" は S1 で許容される特殊値
      result[phaseNum] = rawStatus

  return { data: result, missing: false }
```

**重要**: S1は `'-'` を許容する。`'-'` はS1においてのみ valid であり、`pending` と同義として扱う。

### 2.3 S2の読み取り仕様（readRootArtifactsJson）

```
function readRootArtifactsJson(artifactsJsonPath):
  if not fileExists(artifactsJsonPath):
    return { missing: true, source: "S2", reason: "artifacts.json が存在しない" }

  json = JSON.parse(readFile(artifactsJsonPath))

  result = {}
  for phaseNum in 1..13:
    if json.phases[phaseNum] exists:
      result[phaseNum] = json.phases[phaseNum].status
    else:
      result[phaseNum] = "pending"  // 未記録は pending 扱い

  return { data: result, missing: false }
```

### 2.4 S3の読み取り仕様（readOutputsArtifactsJson）

```
function readOutputsArtifactsJson(outputsArtifactsJsonPath):
  if not fileExists(outputsArtifactsJsonPath):
    return { missing: true, source: "S3", reason: "outputs/artifacts.json が存在しない" }

  json = JSON.parse(readFile(outputsArtifactsJsonPath))

  // S2と同一スキーマを想定
  result = {}
  for phaseNum in 1..13:
    if json.phases[phaseNum] exists:
      result[phaseNum] = json.phases[phaseNum].status
    else:
      result[phaseNum] = "pending"

  return { data: result, missing: false }
```

### 2.5 S4の読み取り仕様（readPhaseFrontmatters）

```
function readPhaseFrontmatters(workflowDir):
  result = {}

  for phaseNum in 1..13:
    files = glob(workflowDir + "/phase-" + phaseNum + "-*.md")

    if files is empty:
      // Phase MDが存在しない場合は pending 扱い（オプション）
      result[phaseNum] = "pending"
      continue

    phaseFile = files[0]  // 複数マッチはエラー
    content = readFile(phaseFile)

    // frontmatterのステータス行を検索
    // パターン: "| ステータス | <value> |" または "ステータス: <value>"
    match = content.match(/\|\s*ステータス\s*\|\s*([^|]+?)\s*\|/)
    if match:
      result[phaseNum] = match[1].trim()
    else:
      result[phaseNum] = "pending"

  return { data: result, missing: false }
```

---

## 3. 許可status列挙（ALLOWED_STATUS_SET）

```
ALLOWED_STATUS_SET = ['pending', 'in_progress', 'completed', 'blocked']

// S1のみ '-' を追加で許容
ALLOWED_STATUS_SET_S1 = ['pending', 'in_progress', 'completed', 'blocked', '-']
```

### 3.1 バリデーション規則

| 情報源 | 許可値                                                |
| ------ | ----------------------------------------------------- |
| S1     | `pending`, `in_progress`, `completed`, `blocked`, `-` |
| S2     | `pending`, `in_progress`, `completed`, `blocked`      |
| S3     | `pending`, `in_progress`, `completed`, `blocked`      |
| S4     | `pending`, `in_progress`, `completed`, `blocked`      |

---

## 4. canonical値の決定論

canonical値とは「parity比較の基準となる正規値」である。

### 4.1 優先順位

```
canonical = firstDefinedNonDash([S2, S3, S1, S4])
```

優先順位: **S2 → S3 → S1 → S4**

- S2（root artifacts.json）が最高権威
- S2が `pending` または未定義の場合はS3へフォールバック
- S1の `'-'` は `pending` と同義として扱い、canon決定では `pending` として処理する

### 4.2 `'-'`の同義扱い規則

```
function normalizeStatus(status, source):
  if status == "-" and source in ["S2", "S3"]:
    // S2/S3では '-' は許可されない → INVALID_STATUS_VALUE を返す
    return INVALID_STATUS_VALUE_ERROR

  if status == "-" and source == "S1":
    // S1の '-' は pending と同義
    return "pending"

  return status
```

### 4.3 parity比較の同義扱い

```
function toComparable(status, source):
  if source == "S1" and status == "-":
    return "pending"  // '-' を pending として比較
  return status
```

---

## 5. 決定論的アルゴリズム（疑似コード全体）

```
function validateParity(workflowDir):
  // Step 1: 全情報源を読み取る
  s1 = readIndexMdPhaseTable(workflowDir + "/index.md")
  s2 = readRootArtifactsJson(workflowDir + "/artifacts.json")
  s3 = readOutputsArtifactsJson(workflowDir + "/outputs/artifacts.json")
  s4 = readPhaseFrontmatters(workflowDir)

  // Step 2: missing チェック（先着優先）
  for [src, label] in [(s1, "S1"), (s2, "S2"), (s3, "S3"), (s4, "S4")]:
    if src.missing:
      return {
        code: "MISSING_SOURCE",
        exitCode: 2,
        missing: { source: label, reason: src.reason }
      }

  // Step 3: Phase 1..13 を順に検証
  drifts = []

  for n in 1..13:
    values = {
      S1: s1.data[n] ?? "pending",
      S2: s2.data[n] ?? "pending",
      S3: s3.data[n] ?? "pending",
      S4: s4.data[n] ?? "pending",
    }

    // Step 3a: INVALID_STATUS_VALUE チェック
    for [srcName, val] in entries(values):
      allowedSet = (srcName == "S1") ? ALLOWED_STATUS_SET_S1 : ALLOWED_STATUS_SET
      if val not in allowedSet:
        return {
          code: "INVALID_STATUS_VALUE",
          exitCode: 3,
          invalid: { phase: n, source: srcName, value: val }
        }

    // Step 3b: canonical 値を決定
    comparables = {
      S1: toComparable(values.S1, "S1"),
      S2: toComparable(values.S2, "S2"),
      S3: toComparable(values.S3, "S3"),
      S4: toComparable(values.S4, "S4"),
    }
    canonical = firstDefined([comparables.S2, comparables.S3, comparables.S1, comparables.S4])

    // Step 3c: uniqueセットを計算
    uniqueValues = distinct(values(comparables))

    // Step 3d: drift 判定
    if length(uniqueValues) > 1:
      drifts.push({
        phase: n,
        sources: values,  // 正規化前の生値
        expected: canonical,
        severity: "error",
      })

  // Step 4: 結果返却
  if length(drifts) > 0:
    return {
      code: "PARITY_DRIFT",
      exitCode: 1,
      drifts: drifts,
    }

  return {
    code: "PARITY_OK",
    exitCode: 0,
    drifts: [],
  }
```

---

## 6. exit code 仕様

| exitCode | code                   | 意味                           |
| -------- | ---------------------- | ------------------------------ |
| 0        | `PARITY_OK`            | 全情報源が一致（同義変換後）   |
| 1        | `PARITY_DRIFT`         | 1つ以上のPhaseでdriftを検出    |
| 2        | `MISSING_SOURCE`       | 必須情報源ファイルが存在しない |
| 3        | `INVALID_STATUS_VALUE` | 許可されていないstatus値を検出 |

---

## 7. 境界条件と考慮事項

### 7.1 Phase MDが存在しないケース

- S4の読み取りでPhase N のMDファイルが存在しない場合は `pending` とみなす
- これはphase-1〜phase-13の全MDがない新規workflowで必要な許容

### 7.2 outputs/artifacts.jsonが存在しないケース

- S3がMISSINGとなり exitCode=2 を返す
- `init-artifacts.js` が未実行のworkflowでは `outputs/artifacts.json` が存在しない場合がある

### 7.3 parity bypassフラグを設けない

- `--skip-parity` や `--force` フラグは実装しない
- validator通過を強制回避する手段を残さないことが設計の根幹

---

## 8. 参照

| 参照先                 | パス                                                 |
| ---------------------- | ---------------------------------------------------- |
| CLI・JSON出力契約      | `outputs/phase-2/validator-placement-design.md`      |
| complete-phase拡張設計 | `outputs/phase-2/complete-phase-extension-design.md` |
| Phase 1 AC-1〜AC-7     | `outputs/phase-1/acceptance-criteria.md`             |
| drift baseline実測     | `outputs/phase-1/drift-inventory.md`                 |
