# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 6                                                |
| 機能名     | UNASSIGNED-EVALS-VALIDATOR-GUARD-001             |
| タスク名   | skill-fixture-runner EVALS.json スキーマ検証追加 |
| 前提Phase  | Phase 5 完了（TDD Green）                        |
| 後続Phase  | Phase 7                                          |
| 作成日     | 2026-04-21                                       |
| ステータス | pending                                          |

## 目的

Phase 4 の基本テスト（TC-001〜TC-022）では網羅しきれなかったエラーパス・エッジケース・回帰ガードを追加し、`validate-evals.js` の運用信頼性を確立する。特に以下の 4 観点を強化する。

1. **エラーパス**: 不正な JSON / 欠落フィールド / ドリフト検出の境界条件
2. **エッジケース**: 空 EVALS.json / 方言混在 / 新スキル追加時の拡張性
3. **回帰ガード**: 既存 `validate-*.js` が引き続き PASS すること
4. **TC-004 fixture テスト**: fixture 除外が機能し、既存テストが壊れないこと

## 実行タスク

### Step 1: エラーパステスト追加

不正な JSON、欠落フィールド、ドリフト検出に関する境界条件テストを追加する。

**追加先ファイル**: `validate-evals.test.js`（TC-001〜TC-022 に追記）

| テストケース | 層  | シナリオ                                              | 期待結果                                       |
| ------------ | --- | ----------------------------------------------------- | ---------------------------------------------- |
| TC-E-001     | L1  | 制御文字が含まれる JSON（Unicode エスケープ不備）     | L1 エラー、stderr に行番号と理由を出力         |
| TC-E-002     | L1  | BOM 付き UTF-8 JSON ファイル                          | L1 PASS または L1 エラー（設計書の方針に従う） |
| TC-E-003     | L2  | 必須キーの値が `null`（フィールドは存在するが null）  | L2 エラー（null 値は欠落と同等に扱う）         |
| TC-E-004     | L2  | 必須キーの値が空文字列 `""`                           | L2 エラー（空文字は欠落と同等に扱う）          |
| TC-E-005     | L2  | `timestamp` フィールドが ISO 8601 以外の形式          | L2 エラーまたは警告（設計書の方針に従う）      |
| TC-E-006     | L3  | `.claude` 側の EVALS.json が存在しない                | L3 エラー（正本欠損として報告）                |
| TC-E-007     | L3  | `.claude` と `.agents` の EVALS.json が改行コード違い | L3 ドリフト検出（CRLF vs LF）                  |
| TC-E-008     | L3  | `.agents` 側の EVALS.json が空ファイル                | L3 エラー（ミラーが破損）                      |

### Step 2: エッジケーステスト追加

空 EVALS.json、方言混在、新スキル追加時の拡張性に関するテストを追加する。

**追加先ファイル**: `validate-evals.test.js`

| テストケース | 層  | シナリオ                                                          | 期待結果                                          |
| ------------ | --- | ----------------------------------------------------------------- | ------------------------------------------------- |
| TC-E-009     | L1  | JSON として有効だが中身が空オブジェクト `{}`                      | L2 エラー（必須キーが全て欠落）                   |
| TC-E-010     | L2  | camelCase と snake_case が同一ファイル内で混在                    | 設計書の許容方針に従う（許容または警告）          |
| TC-E-011     | L2  | 既知スキルと異なるスキル名（新スキル追加シナリオ）                | L2 PASS（スキル名の値自体は検証対象外とする場合） |
| TC-E-012     | L3  | TARGET_SKILLS に存在しないスキルの EVALS.json                     | L3 スキップ（検証対象外として扱う）               |
| TC-E-013     | L3  | 6 スキル中 3 件同時ドリフト                                       | 3 件全てを stderr に報告し exit 非ゼロ            |
| TC-E-014     | -   | `--skill <name>` フラグで特定スキルのみ検証（設計で採用する場合） | 指定スキルのみ L1/L2/L3 を実行し他をスキップ      |

### Step 3: 回帰ガード

既存の `validate-*.js` が `validate-evals.js` の追加・`run-all-validations.js` の修正後も引き続き PASS することを確認する。

```bash
# 既存スクリプト全件の回帰確認
node .claude/skills/skill-fixture-runner/scripts/validate-schemas.js
echo "validate-schemas: exit $?"

node .claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js
echo "validate-skill-structure: exit $?"

node .claude/skills/skill-fixture-runner/scripts/validate-agents.js
echo "validate-agents: exit $?"

node .claude/skills/skill-fixture-runner/scripts/validate-skill-md.js
echo "validate-skill-md: exit $?"

# run-all-validations.js の統合確認（全件正常）
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js
echo "run-all-validations: exit $?"
```

回帰ガードテストケース:

| テストケース | シナリオ                                                             | 期待結果                                                  |
| ------------ | -------------------------------------------------------------------- | --------------------------------------------------------- |
| TC-R-001     | `validate-schemas.js` が Phase 5 実装後も PASS                       | exit 0、出力形式が Phase 4 実行時と同一                   |
| TC-R-002     | `validate-skill-structure.js` が Phase 5 実装後も PASS               | exit 0、EVALS.json 存在チェック強化後も既存チェックが継続 |
| TC-R-003     | `validate-agents.js` が Phase 5 実装後も PASS                        | exit 0、無変更であることを確認                            |
| TC-R-004     | `validate-skill-md.js` が Phase 5 実装後も PASS                      | exit 0、無変更であることを確認                            |
| TC-R-005     | `run-all-validations.js` が validate-evals.js 追加後も既存出力を維持 | 既存の validate-schemas 等の出力が消えていない            |

### Step 4: TC-004 fixture テスト

skill-fixture-runner スキル自身の fixture EVALS.json（テスト用途で意図的に不完全な内容を持つ可能性がある）が `validate-evals.js` の通常実行で誤検出されないことを確認する。同時に、Phase 4 で設計した TC-016〜TC-019 の除外ロジックが正しく機能することを E2E 的に検証する。

| テストケース | シナリオ                                                                         | 期待結果                                    |
| ------------ | -------------------------------------------------------------------------------- | ------------------------------------------- |
| TC-F-001     | `validate-evals.js` を引数なしで実行したとき、fixture パスが処理対象に含まれない | stderr に fixture パスが出力されない        |
| TC-F-002     | fixture ディレクトリ内に破損 EVALS.json を置いた状態で `validate-evals.js` 実行  | exit 0（fixture は除外されるため全件 PASS） |
| TC-F-003     | `--include-fixtures` フラグを指定した場合（設計で採用する場合）                  | fixture パスも検証対象に含まれる            |
| TC-F-004     | Phase 4 の TC-016〜TC-019 が Phase 5 実装後も全て PASS し続ける                  | 実装後も除外ロジックが維持されている        |

## テスト追加一覧

| テストケース | 分類         | 追加先ファイル             | 対応 AC |
| ------------ | ------------ | -------------------------- | ------- |
| TC-E-001     | エラーパス   | `validate-evals.test.js`   | AC-001  |
| TC-E-002     | エラーパス   | `validate-evals.test.js`   | AC-001  |
| TC-E-003     | エラーパス   | `validate-evals.test.js`   | AC-002  |
| TC-E-004     | エラーパス   | `validate-evals.test.js`   | AC-002  |
| TC-E-005     | エラーパス   | `validate-evals.test.js`   | AC-002  |
| TC-E-006     | エラーパス   | `validate-evals.test.js`   | AC-003  |
| TC-E-007     | エラーパス   | `validate-evals.test.js`   | AC-003  |
| TC-E-008     | エラーパス   | `validate-evals.test.js`   | AC-003  |
| TC-E-009     | エッジケース | `validate-evals.test.js`   | AC-002  |
| TC-E-010     | エッジケース | `validate-evals.test.js`   | AC-002  |
| TC-E-011     | エッジケース | `validate-evals.test.js`   | AC-002  |
| TC-E-012     | エッジケース | `validate-evals.test.js`   | AC-003  |
| TC-E-013     | エッジケース | `validate-evals.test.js`   | AC-003  |
| TC-E-014     | エッジケース | `validate-evals.test.js`   | AC-006  |
| TC-R-001     | 回帰ガード   | 回帰確認スクリプト or 手動 | -       |
| TC-R-002     | 回帰ガード   | 回帰確認スクリプト or 手動 | -       |
| TC-R-003     | 回帰ガード   | 回帰確認スクリプト or 手動 | -       |
| TC-R-004     | 回帰ガード   | 回帰確認スクリプト or 手動 | -       |
| TC-R-005     | 回帰ガード   | 回帰確認スクリプト or 手動 | AC-006  |
| TC-F-001     | fixture除外  | `validate-evals.test.js`   | AC-005  |
| TC-F-002     | fixture除外  | `validate-evals.test.js`   | AC-005  |
| TC-F-003     | fixture除外  | `validate-evals.test.js`   | AC-005  |
| TC-F-004     | fixture除外  | `validate-evals.test.js`   | AC-005  |

## 全テスト実行確認

Phase 6 完了時点での全テスト実行コマンド:

```bash
# Phase 4 の基本テスト（TC-001〜TC-022）が引き続き PASS
node --test .claude/skills/skill-fixture-runner/scripts/__tests__/validate-evals.test.js

# Phase 6 追加テスト（TC-E-001〜TC-E-014 / TC-F-001〜TC-F-004）が PASS
# （同一ファイルに追記している場合は上記コマンドで一括実行）

# 既存スクリプト回帰確認（TC-R-001〜TC-R-005）
node .claude/skills/skill-fixture-runner/scripts/validate-schemas.js
node .claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js
node .claude/skills/skill-fixture-runner/scripts/validate-agents.js
node .claude/skills/skill-fixture-runner/scripts/validate-skill-md.js
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js

# dual root ミラー一致の最終確認（AC-007）
diff -u .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
        .agents/skills/skill-fixture-runner/scripts/validate-evals.js
diff -u .claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js \
        .agents/skills/skill-fixture-runner/scripts/validate-skill-structure.js
diff -u .claude/skills/skill-fixture-runner/scripts/run-all-validations.js \
        .agents/skills/skill-fixture-runner/scripts/run-all-validations.js
```

## AC 対応表

| AC     | 対応テストケース（Phase 4 + Phase 6）                    | 検証内容                                                |
| ------ | -------------------------------------------------------- | ------------------------------------------------------- |
| AC-001 | TC-001〜TC-004 / TC-E-001 / TC-E-002                     | L1 JSON パース（境界条件・BOM 対応を含む）              |
| AC-002 | TC-005〜TC-010 / TC-E-003〜TC-E-005 / TC-E-009〜TC-E-011 | L2 必須キー検証（null/空文字/方言混在を含む）           |
| AC-003 | TC-011〜TC-015 / TC-E-006〜TC-E-008 / TC-E-012〜TC-E-013 | L3 dual root 一致（正本欠損・CRLF/LF・3件同時ドリフト） |
| AC-004 | TC-010 / TC-015 / TC-E-007 / TC-E-013                    | 4 種エラー検出（境界条件を強化）                        |
| AC-005 | TC-016〜TC-019 / TC-F-001〜TC-F-004                      | fixture 除外（E2E レベルで除外ロジックを確認）          |
| AC-006 | TC-020〜TC-022 / TC-R-005 / TC-E-014                     | run-all-validations.js 統合・拡張性                     |
| AC-007 | diff -u 確認（TC-R-001〜TC-R-005 の回帰確認内で実施）    | `.claude` と `.agents` の diff -u 差分ゼロ              |

## 統合テスト連携

- Phase 7 は本 Phase で追加した error / edge / regression ケースを対象に traceability を確認する
- Phase 10 の最終レビューでは本 Phase のケース追加が AC-004 / AC-007 を支えていることを確認する

## 成果物

- 拡張された `validate-evals.test.js`（TC-E-001〜TC-E-014 / TC-F-001〜TC-F-004 追加）
- `outputs/phase-6/test-expansion-log.md`: テスト追加一覧と全テスト実行ログ

## 完了条件

- [ ] Step 1: エラーパステスト（TC-E-001〜TC-E-008）が追加され PASS している
- [ ] Step 2: エッジケーステスト（TC-E-009〜TC-E-014）が追加され PASS している
- [ ] Step 3: 回帰ガード（TC-R-001〜TC-R-005）が確認され、既存スクリプトが全て PASS している
- [ ] Step 4: TC-004 fixture テスト（TC-F-001〜TC-F-004）が追加され PASS している
- [ ] Phase 4 の基本テスト（TC-001〜TC-022）が引き続き PASS している
- [ ] `diff -u` による dual root ミラー一致が確認されている（AC-007 最終確認）
- [ ] `outputs/phase-6/test-expansion-log.md` が出力されている

## 参照資料

### 実装・コード

| 資料名                              | パス                                                                      | 用途                                 |
| ----------------------------------- | ------------------------------------------------------------------------- | ------------------------------------ |
| Phase 4 test-design                 | `outputs/phase-4/test-design.md`                                          | 基底テストケース一覧（拡充の出発点） |
| Phase 5 implementation-log          | `outputs/phase-5/implementation-log.md`                                   | Green 化した実装の前提確認           |
| Phase 2 3層検証設計                 | `outputs/phase-2/three-layer-validation-design.md`                        | エラーパス・エッジケース設計の根拠   |
| Phase 2 方言許容モード設計          | `outputs/phase-2/dialect-tolerance-design.md`                             | TC-E-010 方言混在の判定根拠          |
| validate-evals.js（新規）           | `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`           | 拡充テストの対象実装                 |
| validate-skill-structure.js（修正） | `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js` | 回帰対象                             |
| run-all-validations.js（修正）      | `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js`      | 回帰対象・統合テスト対象             |
| 既存 validate-schemas.js            | `.claude/skills/skill-fixture-runner/scripts/validate-schemas.js`         | 回帰ガード対象                       |
| 既存 validate-agents.js             | `.claude/skills/skill-fixture-runner/scripts/validate-agents.js`          | 回帰ガード対象                       |
| 既存 validate-skill-md.js           | `.claude/skills/skill-fixture-runner/scripts/validate-skill-md.js`        | 回帰ガード対象                       |

## 次Phase

Phase 7（カバレッジ確認）へ進む。
