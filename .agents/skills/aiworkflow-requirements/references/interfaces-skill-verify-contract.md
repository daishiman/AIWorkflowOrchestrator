# FR-04 verify 契約 — Check ID 体系

> 区分: 契約仕様（current contract / Check ID 体系）

## 概要

`SkillCreatorVerificationEngine` は、スキル定義の品質を保証する検証エンジンである。スキルディレクトリの構造・コンテンツ・参照整合性を 4 Layer で段階的に検証し、各検証項目に一意の Check ID を割り当てる。

- **実装**: `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
- **Layer 構成**: 4 Layer（構造 → コンテンツ → 詳細コンテンツ → 参照整合性）
- **Check ID 総数**: 19（Layer 1: 5, Layer 2: 7, Layer 3: 4, Layer 4: 3）
- **検証順序**: Layer 1 → 2 → 3 → 4（前 Layer の結果が後続 Layer の前提となる）

## Layer 命名規則

### Check ID 形式

```
L{N}-{NNN}
```

| 要素    | 意味                                | 例      |
| ------- | ----------------------------------- | ------- |
| `L`     | Layer の頭文字（固定プレフィックス）| —       |
| `{N}`   | Layer 番号（1〜4）                  | `1`     |
| `-`     | 区切り文字（固定）                  | —       |
| `{NNN}` | 3 桁連番（Layer 内で 001 から連番） | `001`   |

### Severity 方針

| Severity  | 意味           | 挙動                                      |
| --------- | -------------- | ----------------------------------------- |
| `error`   | 必須要件違反   | ハードゲート — この check が fail するとスキルは不合格 |
| `warning` | 推奨要件違反   | 改善推奨 — fail してもスキルは通過可能    |

### Layer 番号の意味

| Layer | 名称             | 責務                                           |
| ----- | ---------------- | ---------------------------------------------- |
| 1     | 構造検証         | ファイル・ディレクトリの存在確認               |
| 2     | コンテンツ検証   | ファイル内の必須セクション・構造の存在確認     |
| 3     | 詳細コンテンツ検証 | フィールド値の妥当性・コンテンツ品質の検証   |
| 4     | 参照整合性検証   | ファイル間の参照整合性・クロスリファレンス検証 |

## Layer 1: 構造検証（Structural Validation）

| Check ID | 検証内容 | Severity | 判定基準 | エラーメッセージ |
| -------- | -------- | -------- | -------- | ---------------- |
| L1-001 | SKILL.md の存在確認 | `error` | ファイルが存在する | `SKILL.md is missing` |
| L1-002 | agents/ ディレクトリの存在確認 | `error` | ディレクトリが存在する | `agents/ directory is missing` |
| L1-003 | agents/ が空でないことを確認 | `error` | ファイル数 > 0 | `agents/ directory is empty` |
| L1-004 | references/ ディレクトリの存在確認 | `warning` | ディレクトリが存在する | `references/ directory is missing` |
| L1-005 | output-schema.json の存在確認 | `warning` | ファイルが存在する | `output-schema.json is missing` |

## Layer 2: コンテンツ検証（Content Validation）

| Check ID | 検証内容 | Severity | 判定基準 | エラーメッセージ |
| -------- | -------- | -------- | -------- | ---------------- |
| L2-001 | SKILL.md に H1 見出しが存在するか確認 | `error` | H1 見出しが存在する | `SKILL.md is missing H1 heading (skill name)` |
| L2-002 | SKILL.md に概要セクションが存在するか確認 | `error` | セクションが存在する | `SKILL.md is missing overview section` |
| L2-003 | SKILL.md に Trigger セクションが存在するか確認 | `error` | セクションが存在する | `SKILL.md is missing Trigger section` |
| L2-004 | SKILL.md に Anchors セクションが存在するか確認 | `warning` | セクションが存在する | `SKILL.md is missing Anchors section` |
| L2-005 | agent ファイルに H1 見出しが存在するか確認 | `error` | H1 見出しが存在する | `Agent {file} is missing H1 heading` |
| L2-006 | agent ファイルに責務セクションが存在するか確認 | `warning` | セクションが存在する | `Agent {file} is missing responsibility section` |
| L2-007 | output-schema.json が有効な JSON か確認 | `error` | JSON パースが成功する | `output-schema.json is not valid JSON` |

## Layer 3: 詳細コンテンツ検証（Detailed Content Validation）

| Check ID | 検証内容 | Severity | 判定基準 | エラーメッセージ |
| -------- | -------- | -------- | -------- | ---------------- |
| L3-001 | output-schema.json に $schema フィールドが存在するか確認 | `warning` | フィールドが存在する | `output-schema.json is missing $schema field (JSON Schema draft-07 recommended)` |
| L3-002 | output-schema.json の type フィールドが有効か確認 | `error` | 有効な JSON Schema type である | `output-schema.json has invalid type: {value}` |
| L3-003 | agent の責務セクションが実質的内容を持つか確認 | `warning` | 20 文字以上である | `Agent {file} has minimal responsibility description ({N} chars, minimum 20 required)` |
| L3-004 | SKILL.md の Trigger セクションが実質的内容を持つか確認 | `warning` | 10 文字以上である | `SKILL.md Trigger section has minimal content ({N} chars, minimum 10 required)` |

## Layer 4: 参照整合性・結合検証（Reference Integrity Validation）

| Check ID | 検証内容 | Severity | 判定基準 | エラーメッセージ |
| -------- | -------- | -------- | -------- | ---------------- |
| L4-001 | SKILL.md の Anchors セクションにリスト項目が存在するか確認 | `error` | リスト項目が 1 件以上存在する | `SKILL.md Anchors section has no list items` |
| L4-002 | SKILL.md で言及された references/ ファイルが存在するか確認 | `warning` | 全ファイルが存在する | `Some referenced files in references/ are missing or escape references/: {files}` |
| L4-003 | agent ファイル名が SKILL.md で言及されているか確認 | `warning` | テキスト内で言及されている | `Agent file {file} is not mentioned in SKILL.md` |

## verify エンジン責務分離

verify エンジンは 3 つの関数で構成され、それぞれが明確に異なる責務を持つ。

| 関数名                   | 実装ファイル                        | 責務                                                      | 返却値                                      |
| ------------------------ | ----------------------------------- | --------------------------------------------------------- | ------------------------------------------- |
| `verifySkill()`          | `RuntimeSkillCreatorFacade.ts`      | `verificationEngine.verify()` を呼び出し Check 配列を返す | `RuntimeSkillCreatorVerifyCheck[]`          |
| `verifyAndImproveLoop()` | `RuntimeSkillCreatorFacade.ts`      | 検証結果の severity に基づく improve ループ制御           | `RuntimeSkillCreatorVerifyAndImproveResult` |
| `verify()`               | `SkillCreatorVerificationEngine.ts` | 19 件の Check を 4 Layer で実行し結果を収集する           | `RuntimeSkillCreatorVerifyCheck[]`          |

### 責務分離の原則

- **`verifySkill()`** — Facade の公開 API として外部から呼び出される。内部で `verificationEngine.verify(skillDir)` を呼び出し、`onSessionStart` / `onSessionEnd` ガバナンスフックを通じて監査ログを記録しながら Check 配列を中継する。
- **`verifyAndImproveLoop()`** — severity 判定と improve ループ制御を担う。`verifySkill()` を内部で繰り返し呼び出し、前回の改善要約を次回の feedback に織り込んで同一修正の反復を抑制する。
- **`verify()`** — 検証ロジックの本体。`RuntimeSkillCreatorFacade.ts` の `verifySkill()` からのみ呼び出される（外部公開しない）。19 件の Check を Layer 1 → 2 → 3 → 4 の順に実行する。

## Layer 拡張ガイドライン

### 新規 Layer 追加時の手順

1. Layer 番号は連番で割り当てる（次は Layer 5: `L5-001` から）
2. Layer の名称と責務を本ドキュメントの「Layer 番号の意味」テーブルに追記する
3. 新規 Layer のセクションを本ドキュメントに追加する（H2 見出し + check ID テーブル）
4. `SkillCreatorVerificationEngine.ts` に対応する検証ロジックを実装する
5. 概要セクションの check ID 総数を更新する

### 既存 Layer への check ID 追加時の手順

1. 該当 Layer の現在の最大連番 + 1 を新しい check ID とする（例: Layer 2 に追加なら L2-008）
2. 本ドキュメントの該当 Layer テーブルに行を追加する
3. `SkillCreatorVerificationEngine.ts` に検証ロジックを実装する
4. 概要セクションの check ID 総数を更新する

### 仕様書と実装の同期ルール

- 仕様書（本ドキュメント）と実装（`SkillCreatorVerificationEngine.ts`）は常に同期を保つ
- 同期確認コマンド: `grep -oE "L[1-4]-[0-9]{3}" <本ファイル> | sort -u` と実装の同コマンドを `diff` する
- 新規 check ID 追加時は仕様書を先に追記し、その後実装を追加する（TDD アプローチ推奨）
