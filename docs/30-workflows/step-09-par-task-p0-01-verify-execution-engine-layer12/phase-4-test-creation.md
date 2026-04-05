# Phase 4: テスト作成（TDD: Red）- TASK-P0-01 verify 実行エンジン（Layer 1/2 コア + Layer 3/4 互換）

## メタ情報

| 項目      | 内容                                                   |
| --------- | ------------------------------------------------------ |
| Phase     | 4                                                      |
| Phase名   | テスト作成（TDD: Red）                                 |
| カテゴリ  | テスト                                                 |
| 機能名    | step-09-par-task-p0-01-verify-execution-engine-layer12 |
| 作成日    | 2026-04-04                                             |
| 前提Phase | Phase 3                                                |
| 後続Phase | Phase 5                                                |

## 目的

Layer 1/2 コアの全チェックに対するユニットテストを TDD Red フェーズとして作成する。実装（Green）に先行してテストを書き、テストが失敗することを確認する。current facts では Layer 3/4 互換が既に存在するため、この Phase では core の red baseline を固定する。

## 実行タスク

### タスク1: テストファイルの新規作成

**目的**: `SkillCreatorVerificationEngine` のユニットテストを TDD Red として作成する

**テストファイルパス**:

```
apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts
```

**フィクスチャ設計**:

- テスト用フィクスチャは `os.tmpdir()` 配下に動的生成する
- `createSkillFixture(baseDir, options)` ヘルパー関数を用意する
- `afterEach` で `fs.rm(skillDir, { recursive: true, force: true })` を実行してクリーンアップする
- 実スキルディレクトリ（`.claude/skills/` 配下等）を変更するテストは書かない

**フィクスチャオプション設計**:

```typescript
interface SkillFixtureOptions {
  skillMd?: string | false; // false = ファイルを作成しない
  agentFiles?: Record<string, string | false>; // key = ファイル名, value = 内容 or false
  hasReferences?: boolean; // references/ ディレクトリ有無
  outputSchema?: string | false; // false = ファイルを作成しない
}
```

**`createSkillFixture` の責務**:

1. `os.tmpdir()` 配下に一意のディレクトリ（`skill-test-XXXXXX`）を生成する
2. オプションに応じて `SKILL.md`、`agents/`、`references/`、`output-schema.json` を作成する
3. 生成したスキルディレクトリの絶対パスを返す

### タスク2: テストケース実装（15件）

**目的**: Phase 2 設計書のテストケース #1〜#15 に対応するテストを実装する

#### T-ENG-01: 全ファイル揃い正常系

| 項目     | 内容                                                                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テスト名 | `verify() returns all info checks when skill directory is complete`                                                                                        |
| 入力条件 | SKILL.md（H1・## 概要・## Trigger・## Anchors あり）、agents/（.md 1件・H1・`## 責務` あり）、references/、output-schema.json（有効 JSON）が全て揃っている |
| 期待結果 | 全チェックが `severity === "info"` で返る。`severity === "error"` のチェックが 0 件                                                                        |

#### T-L1-01: SKILL.md 欠如

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| テスト名 | `verify() returns L1-001 error when SKILL.md is missing`           |
| 入力条件 | SKILL.md が存在しない                                              |
| 期待結果 | `id === "L1-001"` かつ `severity === "error"` のチェックが含まれる |

#### T-L1-02: agents/ ディレクトリ欠如

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| テスト名 | `verify() returns L1-002 error when agents/ directory is missing`  |
| 入力条件 | agents/ ディレクトリが存在しない                                   |
| 期待結果 | `id === "L1-002"` かつ `severity === "error"` のチェックが含まれる |

#### T-L1-03: agents/ 空ディレクトリ

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| テスト名 | `verify() returns L1-003 error when agents/ directory is empty`    |
| 入力条件 | agents/ ディレクトリが存在するがファイルが 0 件                    |
| 期待結果 | `id === "L1-003"` かつ `severity === "error"` のチェックが含まれる |

#### T-L1-04: references/ 欠如

| 項目     | 内容                                                                                 |
| -------- | ------------------------------------------------------------------------------------ |
| テスト名 | `verify() returns L1-004 warning when references/ directory is missing`              |
| 入力条件 | references/ ディレクトリが存在しない                                                 |
| 期待結果 | `id === "L1-004"` かつ `severity === "warning"` のチェックが含まれる（error でない） |

#### T-L1-05: output-schema.json 欠如

| 項目     | 内容                                                                                 |
| -------- | ------------------------------------------------------------------------------------ |
| テスト名 | `verify() returns L1-005 warning when output-schema.json is missing`                 |
| 入力条件 | output-schema.json が存在しない                                                      |
| 期待結果 | `id === "L1-005"` かつ `severity === "warning"` のチェックが含まれる（error でない） |

#### T-L2-01: SKILL.md に H1 なし

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| テスト名 | `verify() returns L2-001 error when SKILL.md has no H1 heading`    |
| 入力条件 | SKILL.md が存在するが `# ` で始まる行がない                        |
| 期待結果 | `id === "L2-001"` かつ `severity === "error"` のチェックが含まれる |

#### T-L2-02: SKILL.md に ## 概要 なし

| 項目     | 内容                                                                 |
| -------- | -------------------------------------------------------------------- |
| テスト名 | `verify() returns L2-002 error when SKILL.md has no ## 概要 section` |
| 入力条件 | SKILL.md が存在するが `## 概要` セクションがない                     |
| 期待結果 | `id === "L2-002"` かつ `severity === "error"` のチェックが含まれる   |

#### T-L2-03: SKILL.md に ## Trigger なし

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| テスト名 | `verify() returns L2-003 error when SKILL.md has no ## Trigger section` |
| 入力条件 | SKILL.md が存在するが `## Trigger` セクションがない                     |
| 期待結果 | `id === "L2-003"` かつ `severity === "error"` のチェックが含まれる      |

#### T-L2-04: SKILL.md に ## Anchors なし

| 項目     | 内容                                                                                 |
| -------- | ------------------------------------------------------------------------------------ |
| テスト名 | `verify() returns L2-004 warning when SKILL.md has no ## Anchors section`            |
| 入力条件 | SKILL.md が存在するが `## Anchors` セクションがない                                  |
| 期待結果 | `id === "L2-004"` かつ `severity === "warning"` のチェックが含まれる（error でない） |

#### T-L2-05: agent ファイルに H1 なし

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| テスト名 | `verify() returns L2-005 error when agent file has no H1 heading`  |
| 入力条件 | agents/ 配下の .md ファイルに `# ` で始まる行がない                |
| 期待結果 | `id === "L2-005"` かつ `severity === "error"` のチェックが含まれる |

#### T-L2-06: agent ファイルに ## 責務 なし

| 項目     | 内容                                                                                 |
| -------- | ------------------------------------------------------------------------------------ |
| テスト名 | `verify() returns L2-006 warning when agent file has no ## 責務 section`             |
| 入力条件 | agents/ 配下の .md ファイルに H1 はあるが `## 責務` セクションがない                 |
| 期待結果 | `id === "L2-006"` かつ `severity === "warning"` のチェックが含まれる（error でない） |

#### T-L2-07: output-schema.json が invalid JSON

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| テスト名 | `verify() returns L2-007 error when output-schema.json is invalid JSON` |
| 入力条件 | output-schema.json が存在するが JSON としてパースできない文字列         |
| 期待結果 | `id === "L2-007"` かつ `severity === "error"` のチェックが含まれる      |

#### T-FAC-01: error 含む場合の Facade 呼び出し確認

| 項目     | 内容                                                                 |
| -------- | -------------------------------------------------------------------- |
| テスト名 | `verifySkill() returns results when engine is injected`              |
| 入力条件 | SKILL.md が十分に揃っており、verificationEngine が verify 結果を返す |
| 期待結果 | `result.length > 0` かつ `layer1` / `layer2` のチェックが含まれる    |

#### T-FAC-02: 全 pass の場合の Facade 呼び出し確認

| 項目     | 内容                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| テスト名 | `verifySkill() returns empty array when engine is not injected`                |
| 入力条件 | `RuntimeSkillCreatorFacade` の `deps` に `verificationEngine` が渡されていない |
| 期待結果 | `[]` が返る                                                                    |

### タスク3: Red 確認

**目的**: テストが実装なしで失敗（Red）することを確認する

**手順**:

1. テストファイルを作成する（実装ファイルはまだ作成しない）
2. `pnpm --filter @repo/desktop test -- SkillCreatorVerificationEngine` を実行する
3. 全テストケース（15件）が失敗することを確認する
4. エラーメッセージが「モジュールが見つからない」または「関数が未定義」であることを確認する（想定外のエラーでないこと）

## 参照資料

| 資料名               | パス                                                                                    | 説明                         |
| -------------------- | --------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義     | `outputs/phase-1/requirements.md`                                                       | テスト作成の前提条件         |
| Phase 2 設計書       | `outputs/phase-2/design.md`                                                             | テストケース15件の元定義     |
| Phase 3 レビュー結果 | `outputs/phase-3/design-review-result.md`                                               | テスト戦略レビューの確認事項 |
| Verify契約仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | Check ID 体系                |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                                    | 内容                                |
| ------------------------ | --------------------------------------------------------------------------------------- | ----------------------------------- |
| Verify契約・Check ID体系 | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | チェック ID（L1-001〜L2-007）の定義 |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`       | Facade / Engine の責務分離          |

## 統合テスト連携

| テスト観点                                | 内容                                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| T-FAC-01/02 の設計                        | WorkflowEngine モックを使い、`recordVerifyPass/Failure` の呼び出しを検証する |
| フィクスチャ汚染防止                      | `os.tmpdir()` を使い、`afterEach` でクリーンアップすることを徹底する         |
| Layer 1 error 時の Layer 2 出力制御の検証 | Phase 6（テスト拡充）での追加テストと連携する                                |

## 成果物

| 成果物         | パス                                                                                      | 説明                                   |
| -------------- | ----------------------------------------------------------------------------------------- | -------------------------------------- |
| テストファイル | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | 15件のユニットテスト（Red）            |
| テスト計画書   | `outputs/phase-4/test-plan.md`                                                            | テストケース一覧・フィクスチャ設計記録 |

## 完了条件

- [ ] テストファイルが `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` に作成されている
- [ ] `createSkillFixture(baseDir, options)` ヘルパー関数が実装されている
- [ ] `afterEach` でフィクスチャのクリーンアップが設定されている
- [ ] T-ENG-01〜T-FAC-02 の 15 件のテストケースが全て記述されている
- [ ] `pnpm --filter @repo/desktop test` でテストが全件失敗（Red）することを確認している
- [ ] テスト計画書 `outputs/phase-4/test-plan.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装（TDD: Green）
