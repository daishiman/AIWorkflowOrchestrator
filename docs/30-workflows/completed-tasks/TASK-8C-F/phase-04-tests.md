# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 4                                                          |
| Phase名    | テスト作成                                                 |
| 前提Phase  | Phase 3（設計レビューゲート）                              |
| 後続Phase  | Phase 5（実装）                                            |
| ステータス | 未実施                                                     |
| 作成日     | 2026-02-01                                                 |
| 機能名     | TASK-8C-F: Skill-Creator テスト用フィクスチャ & 実行スキル |

---

## 目的

フィクスチャの正当性・検証スクリプトの動作・テスト実行スキルの構造を検証するテストを先に作成する。フィクスチャファイルがまだ存在しないため、テストは FAIL する（Red 状態）。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: フィクスチャ存在・構造検証テストの作成

**目的**: フィクスチャファイルの存在と構造を検証するテストを作成する

**実行手順**:

1. テストファイルを作成する: `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`
2. 以下のテストケースを実装する：

```typescript
describe("Skill-Creator Fixture: complete-skill", () => {
  // TC-001: complete-skill/SKILL.md が存在する
  // TC-002: complete-skill/SKILL.md の YAML Frontmatter に name, description, allowed-tools が存在する
  // TC-003: complete-skill/package.json が存在し、valid JSON である
  // TC-004: complete-skill/EVALS.json が存在し、skill_name フィールドを持つ
  // TC-005: complete-skill/agents/ ディレクトリが存在し、.md ファイルを含む
  // TC-006: complete-skill/agents/analyze-request.md に TASK_TITLE セクションが存在する
  // TC-007: complete-skill/references/ ディレクトリが存在し、.md ファイルを含む
  // TC-008: complete-skill/scripts/ ディレクトリが存在し、.js ファイルを含む
  // TC-009: complete-skill/scripts/utils.js に EXIT_CODES が定義されている
  // TC-010: complete-skill/assets/ ディレクトリが存在する
  // TC-011: complete-skill/schemas/ ディレクトリが存在し、.json ファイルを含む
  // TC-012: complete-skill/schemas/agent-definition.json が valid JSON Schema である
});

describe("Skill-Creator Fixture: minimal-skill", () => {
  // TC-013: minimal-skill/SKILL.md が存在する
  // TC-014: minimal-skill/SKILL.md の YAML Frontmatter が正しい
  // TC-015: minimal-skill/ に agents/, references/, scripts/ ディレクトリが存在しない
});

describe("Skill-Creator Fixture: partial-skill", () => {
  // TC-016: partial-skill/SKILL.md が存在する
  // TC-017: partial-skill/agents/ ディレクトリが存在する
  // TC-018: partial-skill/agents/single-agent.md が存在する
  // TC-019: partial-skill/ に references/, scripts/, assets/, schemas/ が存在しない
});

describe("Skill-Creator Fixture: invalid-skill", () => {
  // TC-020: invalid-skill/SKILL.md が存在する
  // TC-021: invalid-skill/SKILL.md の YAML Frontmatter パースでエラーが発生する
});

describe("Skill-Creator Fixture: orchestration-skill", () => {
  // TC-022: orchestration-skill/SKILL.md が存在する
  // TC-023: orchestration-skill/assets/chain-config.yaml が存在し、パース可能である
  // TC-024: orchestration-skill/assets/parallel-config.yaml が存在し、パース可能である
});
```

3. テスト仕様書を `outputs/phase-04/test-specification.md` に出力する

**期待される成果物**:

- テストファイル: `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`
- テスト仕様書: `outputs/phase-04/test-specification.md`

---

### タスク2: 検証スクリプトテストの作成

**目的**: 検証スクリプトの動作を検証するテストを作成する

**実行手順**:

1. 以下のテストケースを `skill-creator.fixture.test.ts` に追加する：

```typescript
describe("Validation Scripts", () => {
  // TC-025: validate-skill-structure.js が complete-skill を valid と判定する
  // TC-026: validate-skill-structure.js が invalid-skill を invalid と判定する
  // TC-027: validate-skill-md.js が complete-skill/SKILL.md を valid と判定する
  // TC-028: validate-skill-md.js が invalid-skill/SKILL.md でエラーを返す
  // TC-029: validate-agents.js が complete-skill/agents/ を valid と判定する
  // TC-030: validate-schemas.js が complete-skill/schemas/ を valid と判定する
  // TC-031: run-all-validations.js が complete-skill に対して全検証をパスする
  // TC-032: run-all-validations.js が invalid-skill に対してエラーを含む結果を返す
});
```

**期待される成果物**:

- 検証スクリプトテスト（`skill-creator.fixture.test.ts` に含む）

---

### タスク3: skill-fixture-runner スキル構造テストの作成

**目的**: テスト実行スキルの構造を検証するテストを作成する

**実行手順**:

1. 以下のテストケースを `skill-creator.fixture.test.ts` に追加する：

```typescript
describe("skill-fixture-runner Skill", () => {
  // TC-033: skill-fixture-runner/SKILL.md が存在する
  // TC-034: skill-fixture-runner/SKILL.md の YAML Frontmatter が正しい
  // TC-035: skill-fixture-runner/scripts/ ディレクトリが存在する
  // TC-036: skill-fixture-runner/scripts/run-all-validations.js が存在する
  // TC-037: skill-fixture-runner/EVALS.json が存在する
});
```

**期待される成果物**:

- スキル構造テスト（`skill-creator.fixture.test.ts` に含む）

---

### タスク4: テスト実行確認（Red 状態）

**目的**: テストが正しく FAIL することを確認する

**実行手順**:

1. テストを実行する：
   ```bash
   pnpm --filter @repo/desktop vitest run src/__tests__/fixtures/skill-creator.fixture.test.ts
   ```
2. 全テストケース（TC-001〜TC-037）が FAIL することを確認する
3. FAIL 理由が「ファイルが存在しない」であることを確認する（テストコード自体のバグではないこと）

**期待される成果物**:

- テスト実行結果（FAIL 確認）

---

## 参照資料

| 参照資料                         | パス                                                         | 内容             |
| -------------------------------- | ------------------------------------------------------------ | ---------------- |
| Phase 2 設計書                   | `outputs/phase-02/fixture-design.md`                         | フィクスチャ設計 |
| skill-creator スキーマ           | `.claude/skills/skill-creator/schemas/agent-definition.json` | エージェント定義 |
| TASK-8C-E テスト                 | `apps/desktop/src/__tests__/fixtures/skills.fixture.test.ts` | テスト参考       |
| skill-creator validate_structure | `.claude/skills/skill-creator/scripts/validate_structure.js` | 検証ロジック参考 |

---

## 成果物

| 成果物         | パス                                                                | 内容             |
| -------------- | ------------------------------------------------------------------- | ---------------- |
| テストファイル | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` | 全37テストケース |
| テスト仕様書   | `outputs/phase-04/test-specification.md`                            | テストケース一覧 |

---

## 統合テスト連携

検証スクリプトテスト（TC-025〜TC-032）は、Node.js スクリプトの実行結果を検証する統合テストである。`child_process.execSync` を使用してスクリプトを実行し、JSON 出力をパースして検証する。

---

## 多角的チェック観点

| 観点           | 確認内容                                                 |
| -------------- | -------------------------------------------------------- |
| テスタビリティ | テストが独立して実行可能か（外部依存なし）               |
| 網羅性         | skill-creator の全出力パターンをテストでカバーしているか |
| 保守性         | テストケースの追加・変更が容易か                         |

---

## 完了条件

- [ ] テストファイル `skill-creator.fixture.test.ts` が作成されている
- [ ] TC-001〜TC-037 のテストケースが実装されている
- [ ] テスト実行結果が全件 FAIL（Red 状態）であることが確認されている
- [ ] FAIL 理由がフィクスチャ未作成によるものであることが確認されている
- [ ] テスト仕様書が outputs/phase-04/ に配置されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-05-implementation.md`
