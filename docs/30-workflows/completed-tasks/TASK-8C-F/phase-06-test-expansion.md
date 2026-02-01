# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 6                                                          |
| Phase名    | テスト拡充                                                 |
| 前提Phase  | Phase 5（実装）                                            |
| 後続Phase  | Phase 7（テストカバレッジ確認）                            |
| ステータス | 未実施                                                     |
| 作成日     | 2026-02-01                                                 |
| 機能名     | TASK-8C-F: Skill-Creator テスト用フィクスチャ & 実行スキル |

---

## 目的

Phase 4 で作成した基本テスト（TC-001〜TC-037）を拡張し、エッジケース、フォーマット準拠の詳細検証、クロスバリデーションを追加する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: YAML Frontmatter 詳細検証テストの追加

**目的**: SKILL.md の YAML Frontmatter パースの詳細を検証する

**実行手順**:

1. 以下のテストケースを追加する：

```typescript
describe("YAML Frontmatter Detailed Validation", () => {
  // TC-038: complete-skill/SKILL.md の version フィールドが semver 形式である
  // TC-039: complete-skill/SKILL.md の allowed-tools が配列である
  // TC-040: complete-skill/SKILL.md の allowed-tools の各要素が文字列である
  // TC-041: minimal-skill/SKILL.md の name フィールドが kebab-case である
  // TC-042: invalid-skill/SKILL.md のパースで具体的なエラーメッセージが返される
});
```

**期待される成果物**:

- TC-038〜TC-042 のテスト追加

---

### タスク2: エージェント仕様書フォーマット詳細テストの追加

**目的**: エージェント仕様書の必須セクション・構造を詳細に検証する

**実行手順**:

1. 以下のテストケースを追加する：

```typescript
describe("Agent Specification Format Validation", () => {
  // TC-043: analyze-request.md の PERSONA_NAME が存在する
  // TC-044: analyze-request.md の STEPS が番号付きリストである
  // TC-045: analyze-request.md の INPUTS, OUTPUTS セクションが存在する
  // TC-046: generate-code.md が analyze-request.md と同じフォーマットである
  // TC-047: partial-skill/agents/single-agent.md が最小エージェントフォーマットに準拠する
});
```

**期待される成果物**:

- TC-043〜TC-047 のテスト追加

---

### タスク3: スクリプトパターン検証テストの追加

**目的**: 検証スクリプトの出力フォーマット・エラーハンドリングを検証する

**実行手順**:

1. 以下のテストケースを追加する：

```typescript
describe("Validation Script Output Format", () => {
  // TC-048: validate-skill-structure.js の出力が { valid, errors, structure } 形式である
  // TC-049: validate-skill-md.js の出力が { valid, errors, frontmatter, body } 形式である
  // TC-050: validate-agents.js の出力が { valid, errors, agents } 形式である
  // TC-051: validate-schemas.js の出力が { valid, errors, schemas } 形式である
  // TC-052: run-all-validations.js の出力が { overall, results } 形式である
  // TC-053: 存在しないディレクトリを指定した場合、適切なエラーが返される
});
```

**期待される成果物**:

- TC-048〜TC-053 のテスト追加

---

### タスク4: オーケストレーション設定テストの追加

**目的**: YAML 設定ファイルの構造を詳細に検証する

**実行手順**:

1. 以下のテストケースを追加する：

```typescript
describe("Orchestration Config Validation", () => {
  // TC-054: chain-config.yaml に skills 配列が存在する
  // TC-055: chain-config.yaml の skills が最低2つのスキルを含む
  // TC-056: chain-config.yaml に on_error ハンドリングが定義されている
  // TC-057: parallel-config.yaml に skills 配列が存在する
  // TC-058: parallel-config.yaml に result_aggregation 設定が存在する
});
```

**期待される成果物**:

- TC-054〜TC-058 のテスト追加

---

### タスク5: クロスバリデーションテストの追加

**目的**: フィクスチャ間の整合性と skill-creator 仕様との整合性を検証する

**実行手順**:

1. 以下のテストケースを追加する：

```typescript
describe("Cross-Validation", () => {
  // TC-059: complete-skill の agents/*.md が schemas/agent-definition.json の required を満たす
  // TC-060: complete-skill の scripts/utils.js の EXIT_CODES がスクリプトパターンに準拠する
  // TC-061: 全フィクスチャの SKILL.md の name フィールドが一意である
  // TC-062: complete-skill の全ディレクトリが skill-creator/SKILL.md で定義されたディレクトリと一致する
});
```

**期待される成果物**:

- TC-059〜TC-062 のテスト追加

---

### タスク6: テスト実行確認

**目的**: 拡充されたテストが全件パスすることを確認する

**実行手順**:

1. テストを実行する：
   ```bash
   pnpm --filter @repo/desktop vitest run src/__tests__/fixtures/skill-creator.fixture.test.ts
   ```
2. 全テストケース（TC-001〜TC-062）がパスすることを確認する

**期待される成果物**:

- テスト実行結果（全件 PASS）

---

## 参照資料

| 参照資料                           | パス                                                         | 内容             |
| ---------------------------------- | ------------------------------------------------------------ | ---------------- |
| Phase 4 テスト仕様                 | `outputs/phase-04/test-specification.md`                     | 基本テスト仕様   |
| skill-creator エージェントスキーマ | `.claude/skills/skill-creator/schemas/agent-definition.json` | エージェント定義 |
| skill-creator スクリプトパターン   | `.claude/skills/skill-creator/scripts/utils.js`              | スクリプト共通   |

---

## 成果物

| 成果物             | パス                                                                | 内容           |
| ------------------ | ------------------------------------------------------------------- | -------------- |
| 拡充テストファイル | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` | TC-001〜TC-062 |

---

## 統合テスト連携

拡充テストの中で、検証スクリプトの出力フォーマット検証（TC-048〜TC-053）が統合テストに該当する。

---

## 多角的チェック観点

| 観点           | 確認内容                                                           |
| -------------- | ------------------------------------------------------------------ |
| テスタビリティ | 拡充テストが独立して実行可能か                                     |
| 網羅性         | エッジケース・境界値がカバーされているか                           |
| 保守性         | テストケースの追加・変更が容易な構造か                             |
| セキュリティ   | フィクスチャ検証でパストラバーサル等のセキュリティ観点が含まれるか |

---

## 完了条件

- [ ] TC-038〜TC-062 の25テストケースが追加されている
- [ ] 全テスト（TC-001〜TC-062）がパスしている
- [ ] テスト仕様書が更新されている

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

`phase-07-coverage.md`
