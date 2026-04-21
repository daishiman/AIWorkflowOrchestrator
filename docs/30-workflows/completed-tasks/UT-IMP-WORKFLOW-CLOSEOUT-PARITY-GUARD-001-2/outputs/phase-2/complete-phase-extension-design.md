# complete-phase-extension-design.md

## メタ情報

| 項目     | 内容                                                   |
| -------- | ------------------------------------------------------ |
| 文書種別 | Phase 2 設計成果物                                     |
| タスクID | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001              |
| 作成日   | 2026-04-19                                             |
| 対象     | complete-phase.js 拡張設計（S1〜S4同値更新・atomic性） |

---

## 1. 概要

この文書は `complete-phase.js` をS1〜S4の全情報源を同値更新するよう拡張する設計を記述する。atomic性の保証とrollback機構を中心に、7ステップのフローを定義する。

---

## 2. 拡張前後の責務比較

### 2.1 拡張前（現状）

```
complete-phase.js（現状）:
  1. artifacts.json (S2) の phases.N.status を "completed" に更新
  2. 後続PhaseのMDの参照資料セクションを更新
  ※ S1 / S3 / S4 は手動で更新する想定
  ※ parity検証なし
```

### 2.2 拡張後（設計目標）

```
complete-phase.js（拡張後）:
  1. pre-snapshot取得（rollback用）
  2. S2（root artifacts.json）更新
  3. S3（outputs/artifacts.json）更新
  4. S1（generate-index.js呼び出し→index.md再生成）
  5. S4（phase-N-*.md frontmatter置換）
  6. parity検証（validate-closeout-parity.js内部呼び出し）
  7. validator FAIL時rollback
  （既存）後続PhaseのMDの参照資料セクション更新（変更なし）
```

---

## 3. S1〜S4同値更新フロー（7ステップ）

### Step 1: pre-snapshot取得（rollback用）

```
function takeSnapshot(workflowDir):
  snapshot = {
    timestamp: new Date().toISOString(),
    files: {}
  }

  targets = [
    workflowDir + "/artifacts.json",           // S2
    workflowDir + "/outputs/artifacts.json",   // S3
    workflowDir + "/index.md",                 // S1
    ...glob(workflowDir + "/phase-N-*.md"),    // S4 (対象Phase)
  ]

  for path in targets:
    if fileExists(path):
      snapshot.files[path] = readFile(path)
    else:
      snapshot.files[path] = null  // 存在しない場合はnullを記録

  return snapshot
```

**目的**: Step 7のrollbackで利用する。ディスクには書き込まず、メモリ上に保持する。

---

### Step 2: S2（root artifacts.json）更新

```
function updateRootArtifactsJson(workflowDir, phaseNum, phaseArtifacts):
  path = workflowDir + "/artifacts.json"
  json = loadOrInit(path)

  json.phases[phaseNum] = {
    status: "completed",
    completedAt: new Date().toISOString(),
    artifacts: phaseArtifacts.map(a => ({
      type: "document",
      path: a.path,
      description: a.description,
    }))
  }
  json.lastUpdated = new Date().toISOString()

  writeFile(path, JSON.stringify(json, null, 2))
  log("S2 updated: " + path)
```

**注意**: これは既存の `saveArtifacts()` 関数の処理を踏襲する。拡張により責務は変わらない。

---

### Step 3: S3（outputs/artifacts.json）更新

```
function updateOutputsArtifactsJson(workflowDir, phaseNum, phaseArtifacts):
  path = workflowDir + "/outputs/artifacts.json"

  if not fileExists(path):
    // outputs/artifacts.json が存在しない場合は初期化
    json = initOutputsArtifacts(workflowDir)
  else:
    json = JSON.parse(readFile(path))

  // S2と同一スキーマで更新
  json.phases[phaseNum] = {
    status: "completed",
    completedAt: new Date().toISOString(),
    artifacts: phaseArtifacts.map(a => ({
      type: "document",
      path: a.path,
      description: a.description,
    }))
  }
  json.lastUpdated = new Date().toISOString()

  writeFile(path, JSON.stringify(json, null, 2))
  log("S3 updated: " + path)
```

---

### Step 4: S1（generate-index.js呼び出し → index.md再生成）

```
function regenerateIndexMd(workflowDir):
  // generate-index.js はS2を読んでindex.mdを生成する
  // complete-phase.js からは直接index.mdを書かない（generate-index.jsが唯一の書き手）
  result = execSync(
    "node .claude/skills/task-specification-creator/scripts/generate-index.js " +
    "--workflow " + workflowDir,
    { encoding: "utf-8" }
  )
  log("S1 regenerated via generate-index.js: " + workflowDir + "/index.md")
```

**設計上の重要事項**:

- `complete-phase.js` はindex.mdに直接writeしない
- `generate-index.js` がS1の唯一の書き手（SSOT writer）
- generate-index.jsはS2（artifacts.json）を読んでindex.mdを生成するため、Step 2の後に実行する

---

### Step 5: S4（phase-N-\*.md frontmatter置換）

```
function updatePhaseFrontmatter(workflowDir, phaseNum):
  files = glob(workflowDir + "/phase-" + phaseNum + "-*.md")

  if files is empty:
    log("WARNING: phase-" + phaseNum + "-*.md が見つかりません")
    return

  if files.length > 1:
    throw Error("phase-" + phaseNum + "-*.md が複数存在します: " + files.join(", "))

  phaseFile = files[0]
  content = readFile(phaseFile)

  // frontmatterのステータス行を置換
  // パターン: "| ステータス | <current> |" → "| ステータス | completed |"
  updated = content.replace(
    /(\|\s*ステータス\s*\|\s*)([^|]+?)(\s*\|)/,
    "$1completed$3"
  )

  if updated === content:
    log("WARNING: phase-" + phaseNum + " frontmatterのステータス行が見つかりません")
    return

  writeFile(phaseFile, updated)
  log("S4 updated: " + phaseFile)
```

---

### Step 6: parity検証（validate-closeout-parity.js内部呼び出し）

```
function runParityValidation(workflowDir):
  try:
    output = execSync(
      "node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js" +
      " --workflow " + workflowDir + " --json",
      { encoding: "utf-8" }
    )
    report = JSON.parse(output)
    return report

  catch err:
    // execSync は exit code != 0 でthrowする
    // stdout にJSONが含まれる場合はパースを試みる
    try:
      report = JSON.parse(err.stdout || "{}")
      return report
    catch:
      return { code: "MISSING_SOURCE", exitCode: 2, reason: err.message }
```

---

### Step 7: validator FAIL時rollback

```
function rollback(snapshot):
  log("parity validation FAILED - rolling back changes")

  for [path, originalContent] in entries(snapshot.files):
    if originalContent is null:
      // 元々存在しなかったファイルは削除
      if fileExists(path):
        deleteFile(path)
      log("  ROLLBACK deleted: " + path)
    else:
      // 元の内容に戻す
      writeFile(path, originalContent)
      log("  ROLLBACK restored: " + path)

  log("Rollback completed")
```

---

## 4. 全体フロー（統合疑似コード）

```
function main(args):
  { workflow, phase, artifacts } = parseArgs(args)

  // Step 1: pre-snapshot取得
  snapshot = takeSnapshot(workflow)

  try:
    // Step 2: S2更新
    updateRootArtifactsJson(workflow, phase, artifacts)

    // Step 3: S3更新
    updateOutputsArtifactsJson(workflow, phase, artifacts)

    // Step 4: S1再生成（generate-index.js経由）
    regenerateIndexMd(workflow)

    // Step 5: S4更新
    updatePhaseFrontmatter(workflow, phase)

    // Step 6: parity検証
    report = runParityValidation(workflow)

    // Step 7: FAIL時rollback
    if report.code != "PARITY_OK":
      rollback(snapshot)
      printError("parity validation FAILED: " + report.code)
      printError("Drifts detected: " + JSON.stringify(report.drifts, null, 2))
      exit(1)

    // 既存処理: 後続Phaseの参照資料セクション更新
    updateDependentPhases(workflow, phase, artifacts)

    log("Phase " + phase + " 完了処理が完了しました")

  catch unexpectedError:
    // 予期しないエラー時もrollback
    rollback(snapshot)
    printError("Unexpected error: " + unexpectedError.message)
    exit(1)
```

---

## 5. atomic性の設計

### 5.1 atomic性の定義

この設計における「atomic性」は、S1〜S4の全更新が成功するか、または全て元の状態に戻ることを保証する。データベースのACIDトランザクションとは異なり、ファイルシステムレベルの「best-effort atomicity」である。

### 5.2 atomic性の保証範囲

| 操作            | atomic性の扱い                                     |
| --------------- | -------------------------------------------------- |
| S2/S3の書き込み | 両方成功後にparity検証。失敗時はrollbackで元に戻す |
| S1の再生成      | generate-index.jsが失敗した場合もrollbackで対応    |
| S4の書き込み    | 書き込み後にparity検証。失敗時はrollbackで元に戻す |
| parity検証自体  | 検証FAIL時は即座にrollbackを開始する               |

### 5.3 rollbackの限界と注意事項

- rollback中に別プロセスがファイルを書き換えた場合、rollback結果は保証されない
- このscriptは並列実行を想定していない（同一workflowへの並列実行は禁止）
- rollback失敗時はエラーメッセージを出力し、手動復旧の手順を案内する

---

## 6. CLIの後方互換性

### 6.1 維持する引数

| 引数          | 変更 | 説明     |
| ------------- | ---- | -------- |
| `--workflow`  | なし | 既存通り |
| `--phase`     | なし | 既存通り |
| `--artifacts` | なし | 既存通り |

### 6.2 追加しない引数

| 引数候補         | 追加しない理由                                 |
| ---------------- | ---------------------------------------------- |
| `--skip-parity`  | parity bypass手段を提供しないことが設計の根幹  |
| `--force`        | 同上                                           |
| `--no-s1-update` | S1〜S4の同値更新は不可分。部分更新は許可しない |

**未知のフラグはusage errorとして即時reject（exit code 1）する。**

---

## 7. parity bypass用フラグを追加しない理由

1. bypass手段が存在すると、CI/CD環境で「とりあえずbypassして通す」運用が定着するリスクがある
2. Phase 1のdrift inventory観測結果が示すとおり、手動更新の抜けが本タスクの発端である
3. parity不成立のまま進むことは、後続Phase（レビュー・手動テスト）の判断根拠を失わせる

---

## 8. 参照

| 参照先                      | パス                                                                            |
| --------------------------- | ------------------------------------------------------------------------------- |
| parity判定アルゴリズム      | `outputs/phase-2/parity-algorithm-design.md`                                    |
| validator CLI/JSON契約      | `outputs/phase-2/validator-placement-design.md`                                 |
| generate-index.js           | `.claude/skills/task-specification-creator/scripts/generate-index.js`           |
| validate-closeout-parity.js | `.claude/skills/task-specification-creator/scripts/validate-closeout-parity.js` |
| Phase 1 受け入れ基準        | `outputs/phase-1/acceptance-criteria.md`                                        |
