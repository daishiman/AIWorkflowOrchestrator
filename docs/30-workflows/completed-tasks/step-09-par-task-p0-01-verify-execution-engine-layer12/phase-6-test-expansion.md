# Phase 6: テスト拡充 - TASK-P0-01 verify 実行エンジン（Layer 1/2 コア + Layer 3/4 互換）

## メタ情報

| 項目      | 内容                                                   |
| --------- | ------------------------------------------------------ |
| Phase     | 6                                                      |
| Phase名   | テスト拡充                                             |
| カテゴリ  | テスト                                                 |
| 機能名    | step-09-par-task-p0-01-verify-execution-engine-layer12 |
| 作成日    | 2026-04-04                                             |
| 前提Phase | Phase 5                                                |
| 後続Phase | Phase 7                                                |

## 目的

Phase 4 の基本テスト 15 件に加え、fail path・回帰ガード・エッジケースのテストを追加する。実装の堅牢性を高め、将来の変更に対する回帰安全網を構築する。current facts では Layer 3/4 の regression も既に存在するため、拡充は core と互換性の両方を守る。

## 実行タスク

- fail pathテスト追加: Layer 1 error時のLayer 2出力制御（error 明示 / 非発行）の異常系テストを追加する
- Facade graceful degradationテスト追加: verificationEngine未注入時の動作テストを追加する
- エッジケーステスト追加: 非.mdファイル混在、不完全Markdown、大規模ディレクトリ、空ファイルのテストを追加する
- 回帰ガードテスト追加: verify結果→WorkflowEngine状態遷移の回帰テストを追加する

### タスク1: fail path テストの追加

**目的**: 異常系・境界条件での動作を追加テストでカバーする

#### T-SKIP-01: Layer 1 error 時の Layer 2 error 明示

| 項目     | 内容                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| テスト名 | `verify() returns L2-001~L2-004 error placeholders when SKILL.md is missing (L1-001 error)` |
| 入力条件 | SKILL.md が存在しない（L1-001 error が発生）                                                |
| 期待結果 | L2-001〜L2-004 のチェックが error として結果に含まれる                                      |
| 確認観点 | Layer 1 error に対して Layer 2 の説明可能性が維持されること                                 |

#### T-SKIP-02: agents/ 欠如時の Layer 2 非発行

| 項目     | 内容                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| テスト名 | `verify() does not emit L2-005 and L2-006 when agents/ directory is missing (L1-002 error)` |
| 入力条件 | agents/ ディレクトリが存在しない（L1-002 error が発生）                                     |
| 期待結果 | L2-005・L2-006 のチェックが結果に含まれない                                                 |

#### T-SKIP-03: output-schema.json 欠如時の L2-007 非発行

| 項目     | 内容                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| テスト名 | `verify() does not emit L2-007 when output-schema.json is missing (L1-005 warning)` |
| 入力条件 | output-schema.json が存在しない（L1-005 warning が発生）                            |
| 期待結果 | L2-007 のチェックが結果に含まれない（存在しないファイルのパース試行をしていない）   |

#### T-SKIP-04: agents/ 空ディレクトリ時の Layer 2 非発行

| 項目     | 内容                                                                                      |
| -------- | ----------------------------------------------------------------------------------------- |
| テスト名 | `verify() does not emit L2-005 and L2-006 when agents/ directory is empty (L1-003 error)` |
| 入力条件 | agents/ ディレクトリが存在するがファイルが 0 件（L1-003 error が発生）                    |
| 期待結果 | L2-005・L2-006 のチェックが結果に含まれない                                               |
| 確認観点 | 空ディレクトリでも Layer 2 の不要なエラーが発生しないこと                                 |

### タスク2: Facade graceful degradation テストの追加

**目的**: `verificationEngine` が未注入の場合に Facade が正常動作することを確認する

#### T-DEG-01: verificationEngine 未注入時の空配列返却

| 項目     | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| テスト名 | `verifySkill() returns empty checks when verificationEngine is not injected`    |
| 入力条件 | `RuntimeSkillCreatorFacade` の `deps` に `verificationEngine` が渡されていない  |
| 期待結果 | エラーが発生せず、チェック配列が空（`[]`）で返る                                |
| 確認観点 | `verificationEngine` の optional 注入が graceful degradation を保証していること |

### タスク3: エッジケーステストの追加

**目的**: 特殊入力・境界値でのエッジケース動作を確認する

#### T-EDGE-01: agents/ 配下に .md 以外のファイルがある場合

| 項目     | 内容                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| テスト名 | `verify() handles non-.md files in agents/ directory correctly`                |
| 入力条件 | agents/ 配下に `.txt`・`.json` 等の .md 以外のファイルのみが存在する           |
| 期待結果 | L1-003（agents/ 空）ではなく、L2-005・L2-006 の対象ファイルが 0 件と判定される |
| 確認観点 | `.md` 以外のファイルを agent スペックとして扱わないこと                        |

#### T-EDGE-02: SKILL.md が空ファイルの場合

| 項目     | 内容                                                                      |
| -------- | ------------------------------------------------------------------------- |
| テスト名 | `verify() handles empty SKILL.md gracefully`                              |
| 入力条件 | SKILL.md が存在するが内容が空文字列（0 バイト）                           |
| 期待結果 | エラーをスローせず、L2-001〜L2-004 の該当チェックが適切な severity で返る |
| 確認観点 | 空ファイルでも Markdown の最小検証が安全に失敗すること                    |

#### T-EDGE-03: 大きなスキルディレクトリでの動作

| 項目     | 内容                                                                             |
| -------- | -------------------------------------------------------------------------------- |
| テスト名 | `verify() completes in reasonable time with many agent files`                    |
| 入力条件 | agents/ 配下に 50 件の .md ファイルが存在し、各ファイルに H1 と `## 責務` がある |
| 期待結果 | 全ファイルが検証される（L2-005・L2-006 が 50 件分 info として返る）              |
| 確認観点 | 多数ファイル処理でタイムアウトやメモリ問題が発生しないこと                       |

#### T-EDGE-04: output-schema.json が空ファイルの場合

| 項目     | 内容                                                                       |
| -------- | -------------------------------------------------------------------------- |
| テスト名 | `verify() returns L2-007 error when output-schema.json is an empty file`   |
| 入力条件 | output-schema.json が存在するが内容が空文字列（0 バイト）                  |
| 期待結果 | `id === "L2-007"` かつ `severity === "error"` のチェックが含まれる         |
| 確認観点 | 空文字列は JSON として無効（`JSON.parse("")` が throw する）ことを検証する |

### タスク4: 回帰ガードテストの追加

**目的**: 将来の変更で既存動作が壊れないよう、回帰安全網を構築する

#### T-REG-01: Layer 1 warning が Layer 2 の出力を抑制しない

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| テスト名 | `verify() does not suppress Layer2 checks when Layer1 has only warning` |
| 入力条件 | references/ が存在しない（L1-004 warning のみ）                         |
| 期待結果 | L2-001〜L2-004 は実行される（warning は出力抑制条件にならない）         |
| 確認観点 | 出力制御条件が `error` に限定されており、`warning` で抑制しないこと     |

#### T-REG-02: check ID の形式が仕様通りである

| 項目     | 内容                                                                 |
| -------- | -------------------------------------------------------------------- |
| テスト名 | `verify() returns checks with IDs matching L{N}-{NNN} format`        |
| 入力条件 | 全ファイル揃いの正常スキル                                           |
| 期待結果 | 全チェックの `id` フィールドが `/^L[1-9]-\d{3}$/` の形式にマッチする |
| 確認観点 | 命名規則 `L{N}-{NNN}` が実装上も維持されていること                   |

#### T-REG-03: layer フィールドの正確性

| 項目     | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| テスト名 | `verify() returns checks with correct layer field`                                 |
| 入力条件 | 全ファイル揃いの正常スキル                                                         |
| 期待結果 | L1-xxx のチェックの `layer === "layer1"`、L2-xxx のチェックの `layer === "layer2"` |
| 確認観点 | `layer` フィールドが ID と整合していること                                         |

## 参照資料

| 資料名         | パス                                                                                      | 説明                         |
| -------------- | ----------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 4 テスト | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | 拡充対象の既存テストファイル |
| Phase 5 実装   | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                | 拡充対象の実装ファイル       |
| Phase 2 設計書 | `outputs/phase-2/design.md`                                                               | Layer 境界・出力制御設計     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                                    | 内容                                |
| ------------------------ | --------------------------------------------------------------------------------------- | ----------------------------------- |
| Verify契約・Check ID体系 | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | 出力制御条件・命名規則の根拠        |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`       | graceful degradation パターンの根拠 |

## 統合テスト連携

| テスト観点           | 内容                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| Layer 2 出力制御     | T-SKIP-01〜04 が Phase 5 実装の Layer 境界設計を正しく検証していること |
| graceful degradation | T-DEG-01 が Facade の optional 注入パターンを検証していること          |
| P0-02 との型整合     | T-REG-02/03 が check ID・layer フィールドの型契約を保証していること    |

## 成果物

| 成果物               | パス                                                                                      | 説明                           |
| -------------------- | ----------------------------------------------------------------------------------------- | ------------------------------ |
| 拡充後テストファイル | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | 15件 + 追加テストケース        |
| テスト拡充レポート   | `outputs/phase-6/expanded-test-report.md`                                                 | 追加テストの設計根拠・結果記録 |

## 完了条件

- [ ] T-SKIP-01〜04（Layer 2 出力制御）のテストが追加されている
- [ ] T-DEG-01（graceful degradation）のテストが追加されている
- [ ] T-EDGE-01〜04（エッジケース）のテストが追加されている
- [ ] T-REG-01〜03（回帰ガード）のテストが追加されている
- [ ] 追加した全テストケースが PASS している
- [ ] 既存 15 件の core テストが引き続き PASS している
- [ ] テスト拡充レポート `outputs/phase-6/expanded-test-report.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
