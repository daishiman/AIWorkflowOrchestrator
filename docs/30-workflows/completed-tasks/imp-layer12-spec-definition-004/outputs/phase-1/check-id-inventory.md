# Check ID 棚卸し結果

## 概要

`SkillCreatorVerificationEngine.ts` から抽出した全 19 check ID の詳細一覧。

## タスク分類

| 項目          | 判定       |
| ------------- | ---------- |
| タスク種別    | docs-only  |
| UI 変更       | なし       |
| コード変更    | なし       |
| Phase 11 判定 | NON_VISUAL |

## Layer 1: 構造検証（Structural Validation）— 5 checks

| Check ID | 検証内容                              | Severity | 判定基準               | Pass メッセージ                | Fail メッセージ                                                   |
| -------- | ------------------------------------- | -------- | ---------------------- | ------------------------------ | ----------------------------------------------------------------- |
| L1-001   | SKILL.md ファイルの存在確認           | error    | ファイルが存在する     | "SKILL.md exists"              | "SKILL.md is missing"                                             |
| L1-002   | agents/ ディレクトリの存在確認        | error    | ディレクトリが存在する | "agents/ directory exists"     | "agents/ directory is missing"                                    |
| L1-003   | agents/ ディレクトリが空でないか      | error    | ファイル数 > 0         | "agents/ contains {N} file(s)" | "agents/ directory is empty" / "Failed to read agents/ directory" |
| L1-004   | references/ ディレクトリの存在確認    | warning  | ディレクトリが存在する | "references/ directory exists" | "references/ directory is missing"                                |
| L1-005   | output-schema.json ファイルの存在確認 | warning  | ファイルが存在する     | "output-schema.json exists"    | "output-schema.json is missing"                                   |

## Layer 2: コンテンツ検証（Content Validation）— 7 checks

| Check ID | 検証内容                                   | Severity | 判定基準              | Pass メッセージ                           | Fail メッセージ                                  |
| -------- | ------------------------------------------ | -------- | --------------------- | ----------------------------------------- | ------------------------------------------------ |
| L2-001   | SKILL.md が H1 見出しを含むか              | error    | H1 見出しが存在する   | "SKILL.md has H1 heading"                 | "SKILL.md is missing H1 heading (skill name)"    |
| L2-002   | SKILL.md が「概要」セクションを含むか      | error    | セクションが存在する  | "SKILL.md has overview section"           | "SKILL.md is missing overview section"           |
| L2-003   | SKILL.md が「Trigger」セクションを含むか   | error    | セクションが存在する  | "SKILL.md has Trigger section"            | "SKILL.md is missing Trigger section"            |
| L2-004   | SKILL.md が「Anchors」セクションを含むか   | warning  | セクションが存在する  | "SKILL.md has Anchors section"            | "SKILL.md is missing Anchors section"            |
| L2-005   | agent ファイルが H1 見出しを含むか         | error    | H1 見出しが存在する   | "Agent {file} has H1 heading"             | "Agent {file} is missing H1 heading"             |
| L2-006   | agent ファイルが「責務」セクションを含むか | warning  | セクションが存在する  | "Agent {file} has responsibility section" | "Agent {file} is missing responsibility section" |
| L2-007   | output-schema.json が有効な JSON か        | error    | JSON パースが成功する | "output-schema.json is valid JSON"        | "output-schema.json is not valid JSON"           |

## Layer 3: 詳細コンテンツ検証（Detailed Content Validation）— 4 checks

| Check ID | 検証内容                                             | Severity | 判定基準                | Pass メッセージ                                                       | Fail メッセージ                                                                            |
| -------- | ---------------------------------------------------- | -------- | ----------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| L3-001   | output-schema.json が $schema フィールドを含むか     | warning  | フィールドが存在する    | "output-schema.json has $schema field"                                | "output-schema.json is missing $schema field (JSON Schema draft-07 recommended)"           |
| L3-002   | output-schema.json の type フィールドが有効か        | error    | 有効な JSON Schema type | "output-schema.json has valid type: {JSON}"                           | "output-schema.json has invalid type: {JSON}" / "output-schema.json is missing type field" |
| L3-003   | agent の「責務」セクションが実質的内容を持つか       | warning  | 20 文字以上             | "Agent {file} has substantial responsibility description ({N} chars)" | "Agent {file} has minimal responsibility description ({N} chars, minimum 20 required)"     |
| L3-004   | SKILL.md の「Trigger」セクションが実質的内容を持つか | warning  | 10 文字以上             | "SKILL.md Trigger section has substantial content ({N} chars)"        | "SKILL.md Trigger section has minimal content ({N} chars, minimum 10 required)"            |

## Layer 4: 参照整合性・結合検証（Reference Integrity Validation）— 3 checks

| Check ID | 検証内容                                               | Severity | 判定基準                   | Pass メッセージ                                           | Fail メッセージ                                                                   |
| -------- | ------------------------------------------------------ | -------- | -------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| L4-001   | SKILL.md の「Anchors」にリスト項目があるか             | error    | リスト項目が 1 件以上存在  | "SKILL.md Anchors section has at least one list item"     | "SKILL.md Anchors section has no list items"                                      |
| L4-002   | SKILL.md で言及された references/ ファイルが存在するか | warning  | 全ファイルが存在する       | "All referenced files in references/ exist ({N} checked)" | "Some referenced files in references/ are missing or escape references/: {files}" |
| L4-003   | agent ファイル名が SKILL.md で言及されているか         | warning  | テキスト内で言及されている | "Agent file {file} is mentioned in SKILL.md"              | "Agent file {file} is not mentioned in SKILL.md"                                  |

## 集計

| Layer    | Check 数 | error 数 | warning 数 | Check ID 範囲    |
| -------- | -------- | -------- | ---------- | ---------------- |
| Layer 1  | 5        | 3        | 2          | L1-001 〜 L1-005 |
| Layer 2  | 7        | 5        | 2          | L2-001 〜 L2-007 |
| Layer 3  | 4        | 1        | 3          | L3-001 〜 L3-004 |
| Layer 4  | 3        | 1        | 2          | L4-001 〜 L4-003 |
| **合計** | **19**   | **10**   | **9**      | L1-001 〜 L4-003 |

## AC 検証方法の具体化

| AC   | 検証方法                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------ |
| AC-1 | `grep -c "L1-00[1-5]" <追記先ファイル>` → 期待値 5                                                           |
| AC-2 | `grep -c "L2-00[1-7]" <追記先ファイル>` → 期待値 7                                                           |
| AC-3 | `grep -c "L3-00[1-4]" <追記先ファイル>` → 期待値 4                                                           |
| AC-4 | `grep -c "L4-00[1-3]" <追記先ファイル>` → 期待値 3                                                           |
| AC-5 | 各 check ID 行に「検証内容」「判定基準」「severity」カラムが存在するか確認                                   |
| AC-6 | `grep "L{N}-{NNN}" <追記先ファイル>` で命名規則セクションを検証                                              |
| AC-7 | `SkillCreatorVerificationEngine.ts` の check ID を `grep -oE` で抽出し、追記先ファイルと `diff` で突き合わせ |
