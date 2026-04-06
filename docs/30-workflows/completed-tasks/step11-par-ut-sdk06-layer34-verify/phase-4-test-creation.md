# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 4                                 |
| 機能名 | ut-sdk06-layer34-verify-expansion |
| 作成日 | 2026-03-31                        |

## 目的

Layer3/4 全チェック項目の pass/fail テストケースと、verify→improve→reverify 結合テストケースを、具体的な `it()` 文として定義する。

## 実行タスク

- Layer3 pass/fail test case を具体的な `it()` 文で定義する
- Layer4 pass/fail test case を具体的な `it()` 文で定義する
- verify→improve→reverify 結合テスト case を定義する
- fixture 拡張の実装手順を記述する

## テストレーン

| レーン      | 責務                                     | 実行順        | 依存                         |
| ----------- | ---------------------------------------- | ------------- | ---------------------------- |
| Unit        | Layer3 / Layer4 の個別 `it()` ケース定義 | 先行          | `createSkillFixture` 拡張    |
| Integration | verify→improve→reverify 結合テスト       | Unit 後       | Layer3 / Layer4 ケースの固定 |
| Validation  | skill validator replay / mirror parity   | Unit と並行可 | `.claude` 正本の存在         |

## 参照資料

| 資料名           | パス                       | 説明                         |
| ---------------- | -------------------------- | ---------------------------- |
| Phase 1 要件     | `phase-1-requirements.md`  | Layer3/4 チェック項目一覧    |
| Phase 2 設計     | `phase-2-design.md`        | fixture 拡張と結合テスト設計 |
| Phase 3 レビュー | `phase-3-design-review.md` | go/no-go 判定と MINOR 指摘   |

## Layer3 テストケース定義

### `describe("Layer 3 checks")` ブロック

```
it("T-L3-01: output-schema.json に $schema フィールドがある場合 L3-001 が info を返す")
it("T-L3-02: output-schema.json に $schema フィールドがない場合 L3-001 が warning を返す")
it("T-L3-03: output-schema.json の type が 'object' の場合 L3-002 が info を返す")
it("T-L3-04: output-schema.json の type が 'invalid_type' の場合 L3-002 が error を返す")
it("T-L3-05: output-schema.json の type フィールドがない場合 L3-002 が warning を返す")
it("T-L3-06: agent の責務記述が 20 文字以上の場合 L3-003 が info を返す")
it("T-L3-07: agent の責務記述が 5 文字以下の場合 L3-003 が warning を返す")
it("T-L3-08: SKILL.md の Trigger 記述が 10 文字以上の場合 L3-004 が info を返す")
it("T-L3-09: SKILL.md の Trigger 記述が 5 文字以下の場合 L3-004 が warning を返す")
it("T-L3-10: output-schema.json が存在しない場合 L3-001/L3-002 は emit されない")
```

### テストケース詳細表

| テストケース | チェックID | シナリオ                                         | 期待結果                              |
| ------------ | ---------- | ------------------------------------------------ | ------------------------------------- |
| `T-L3-01`    | L3-001     | output-schema.json に `$schema` フィールドあり   | pass, severity: info                  |
| `T-L3-02`    | L3-001     | output-schema.json に `$schema` フィールドなし   | fail, severity: warning               |
| `T-L3-03`    | L3-002     | output-schema.json の `type` が `"object"`       | pass, severity: info                  |
| `T-L3-04`    | L3-002     | output-schema.json の `type` が `"invalid_type"` | fail, severity: error                 |
| `T-L3-05`    | L3-002     | output-schema.json の `type` フィールドなし      | fail, severity: warning               |
| `T-L3-06`    | L3-003     | agent の `## 責務` 記述が 30 文字                | pass, severity: info, layer: "layer3" |
| `T-L3-07`    | L3-003     | agent の `## 責務` 記述が 4 文字                 | fail, severity: warning               |
| `T-L3-08`    | L3-004     | SKILL.md の `## Trigger` 記述が 20 文字          | pass, severity: info                  |
| `T-L3-09`    | L3-004     | SKILL.md の `## Trigger` 記述が 5 文字           | fail, severity: warning               |
| `T-L3-10`    | L3-001/002 | output-schema.json が存在しない                  | L3-001/L3-002 が emit されない        |

## Layer4 テストケース定義

### `describe("Layer 4 checks")` ブロック

```
it("T-L4-01: Anchors セクションにリスト項目が 1 件以上ある場合 L4-001 が info を返す")
it("T-L4-02: Anchors セクションにリスト項目が 0 件の場合 L4-001 が error を返す")
it("T-L4-03: Anchors セクション自体がない場合 L4-001 が error を返す")
it("T-L4-04: references/spec.md が実在し SKILL.md で参照されている場合 L4-002 が info を返す")
it("T-L4-05: SKILL.md で参照されているが references/ にファイルが実在しない場合 L4-002 が warning を返す")
it("T-L4-06: references/ が存在しない場合 L4-002 は emit されない")
it("T-L4-07: agent ファイル名が SKILL.md で言及されている場合 L4-003 が info を返す")
it("T-L4-08: agent ファイル名が SKILL.md で言及されていない場合 L4-003 が warning を返す")
```

### テストケース詳細表

| テストケース | チェックID | シナリオ                                                   | 期待結果                              |
| ------------ | ---------- | ---------------------------------------------------------- | ------------------------------------- |
| `T-L4-01`    | L4-001     | Anchors セクションに `- anchor1` が 1 件以上ある           | pass, severity: info, layer: "layer4" |
| `T-L4-02`    | L4-001     | Anchors セクションはあるがリスト項目なし（テキストのみ）   | fail, severity: error                 |
| `T-L4-03`    | L4-001     | Anchors セクション自体がない                               | fail, severity: error                 |
| `T-L4-04`    | L4-002     | `references/spec.md` が実在し SKILL.md で言及されている    | pass, severity: info                  |
| `T-L4-05`    | L4-002     | SKILL.md で `references/missing.md` を参照するが実在しない | fail, severity: warning               |
| `T-L4-06`    | L4-002     | `references/` ディレクトリが存在しない                     | L4-002 が emit されない               |
| `T-L4-07`    | L4-003     | `planner.md` が SKILL.md 本文で言及されている              | pass, severity: info                  |
| `T-L4-08`    | L4-003     | `planner.md` が SKILL.md 本文で言及されていない            | fail, severity: warning               |

## 結合テストケース定義

### `describe("verify→improve→reverify loop")` ブロック

```
it("T-LOOP-01: L4-001 が fail する fixture を verify して error を確認し、改善後に re-verify で info になること")
it("T-LOOP-02: L3-001 が warn する fixture を verify して warning を確認し、$schema 追加後に re-verify で info になること")
it("T-LOOP-03: Facade.verifySkill() が Layer3/4 チェック結果を含む配列を返すこと")
it("T-LOOP-04: WorkflowEngine と VerificationEngine の結合で verifyResult が更新されること")
```

### 結合テストケース詳細表

| テストケース | シナリオ                                                             | 期待結果                                          |
| ------------ | -------------------------------------------------------------------- | ------------------------------------------------- |
| `T-LOOP-01`  | Anchors なし fixture → verify → SKILL.md 修正 → re-verify            | 1回目: L4-001 error、2回目: L4-001 info           |
| `T-LOOP-02`  | `$schema` なし fixture → verify → schema 修正 → re-verify            | 1回目: L3-001 warning、2回目: L3-001 info         |
| `T-LOOP-03`  | 完全な fixture で `Facade.verifySkill()` を呼ぶ                      | `layer: "layer3"` と `layer: "layer4"` が混在する |
| `T-LOOP-04`  | `SkillCreatorWorkflowEngine` + `SkillCreatorVerificationEngine` 結合 | WorkflowEngine が verifyResult を正しく更新する   |

## fixture 拡張の実装手順

1. `createSkillFixture` に `referenceFiles` オプションを追加する
2. `referenceFiles` が指定された場合、`references/` ディレクトリ配下にファイルを生成する
3. `skillMdReferenceLinks` が指定された場合、SKILL.md 末尾に参照リンクを追加する
4. 既存テストへの影響がないことを `T-ENG-01` の実行で確認する

## skill validator matrix

| 検証対象                                | コマンド                                                                                                                                                          | pass 条件                   | 実行タイミング    |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------- |
| `task-specification-creator` 構造       | `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator`                                                           | error 0                     | Phase 4 / Phase 9 |
| `task-specification-creator` 全体       | `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator`                                                             | error 0                     | Phase 4 / Phase 9 |
| `aiworkflow-requirements` 構造          | `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements`                                                              | error 0                     | Phase 4 / Phase 9 |
| `aiworkflow-requirements` 全体          | `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/aiworkflow-requirements`                                                                | error 0                     | Phase 4 / Phase 9 |
| workflow 構造                           | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/step11-par-ut-sdk06-layer34-verify --json`               | error 0                     | Phase 4 / Phase 9 |
| workflow phase 出力                     | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/step11-par-ut-sdk06-layer34-verify`                            | error 0                     | Phase 4 / Phase 9 |
| implementation guide                    | `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/step11-par-ut-sdk06-layer34-verify` | Part 1 / Part 2 全項目 PASS | Phase 12 前提確認 |
| mirror parity                           | `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                                    | diff 0                      | Phase 4 / Phase 9 |
| `aiworkflow-requirements` mirror parity | `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`                                                                          | diff 0                      | Phase 4 / Phase 9 |

## 検証コマンド

```bash
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts
pnpm --filter @repo/desktop vitest run
```

## 統合テスト連携

- Phase 6 でエンコーディング、大量ファイル等の edge case を追加する
- Phase 7 で L3-001〜L3-004 と L4-001〜L4-003 の全 check ID coverage を確認する

## 成果物

| 成果物           | パス                             | 説明                                  |
| ---------------- | -------------------------------- | ------------------------------------- |
| テスト作成仕様書 | `phase-4-test-creation.md`       | 具体的な it() 文と pass/fail シナリオ |
| テスト行列       | `outputs/phase-4/test-matrix.md` | 具体的な test matrix と検証コマンド   |

## 完了条件

- [ ] L3-001〜L3-004 の pass/fail case が具体的な `it()` 文として定義されている
- [ ] L4-001〜L4-003 の pass/fail case が具体的な `it()` 文として定義されている
- [ ] verify→improve→reverify 結合テストの case が定義されている
- [ ] fixture 拡張の実装手順が記述されている
- [ ] `outputs/phase-4/test-matrix.md` が成果物として明示されている
- [ ] 検証コマンドが明示されている
- [ ] **本Phase内の全タスクを100%実行完了**
