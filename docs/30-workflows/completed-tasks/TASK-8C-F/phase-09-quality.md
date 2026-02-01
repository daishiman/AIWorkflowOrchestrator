# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 9                                                          |
| Phase名    | 品質保証                                                   |
| 前提Phase  | Phase 8（リファクタリング）                                |
| 後続Phase  | Phase 10（最終レビューゲート）                             |
| ステータス | 未実施                                                     |
| 作成日     | 2026-02-01                                                 |
| 機能名     | TASK-8C-F: Skill-Creator テスト用フィクスチャ & 実行スキル |

---

## 目的

フィクスチャ・検証スクリプト・テストの品質を多角的に検証し、品質基準を満たしていることを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 静的解析

**目的**: コードの品質を静的解析ツールで検証する

**実行手順**:

1. TypeScript 型チェック：

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

2. ESLint チェック：

   ```bash
   pnpm --filter @repo/desktop lint
   ```

3. Prettier フォーマットチェック：

   ```bash
   pnpm --filter @repo/desktop format:check
   ```

4. 検証スクリプトの Node.js 構文チェック：

   ```bash
   node --check .claude/skills/skill-fixture-runner/scripts/*.js
   ```

5. 結果を記録する

**期待される成果物**:

- 静的解析結果

---

### タスク2: セキュリティ確認

**目的**: フィクスチャとスクリプトにセキュリティ上の問題がないか確認する

**実行手順**:

1. 以下のチェックリストを確認する：

| チェック項目                                               | 判定 |
| ---------------------------------------------------------- | ---- |
| フィクスチャに機密情報（API キー、トークン等）が含まれない |      |
| フィクスチャにパストラバーサルパターンが含まれない         |      |
| 検証スクリプトに eval() や Function() が使用されていない   |      |
| 検証スクリプトがユーザー入力を安全に処理している           |      |
| YAML パースに safe load が使用されている                   |      |
| JSON パースに適切なエラーハンドリングがある                |      |

**期待される成果物**:

- セキュリティチェック結果

---

### タスク3: skill-creator 仕様整合性確認

**目的**: フィクスチャが skill-creator の最新仕様（v8.1.0）と整合していることを確認する

**実行手順**:

1. skill-creator の以下のコンポーネントとフィクスチャの整合性を確認する：

| skill-creator コンポーネント  | フィクスチャ対応物                 | 整合性 |
| ----------------------------- | ---------------------------------- | ------ |
| assets/skill-template.md      | complete-skill/SKILL.md            |        |
| assets/agent-template.md      | complete-skill/agents/\*.md        |        |
| schemas/agent-definition.json | complete-skill/schemas/\*.json     |        |
| scripts/utils.js              | complete-skill/scripts/utils.js    |        |
| assets/chain-template.yaml    | orchestration-skill/assets/\*.yaml |        |

2. aiworkflow-requirements のスキル構造仕様との整合性を確認する
3. `outputs/phase-09/quality-report.md` に結果を出力する

**期待される成果物**:

- `outputs/phase-09/quality-report.md`

---

## 参照資料

| 参照資料               | パス                                                                                | 内容       |
| ---------------------- | ----------------------------------------------------------------------------------- | ---------- |
| skill-creator SKILL.md | `.claude/skills/skill-creator/SKILL.md`                                             | 最新仕様   |
| スキル構造仕様         | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | スキル仕様 |
| 品質基準               | `.claude/skills/task-specification-creator/references/quality-standards.md`         | 品質基準   |

---

## 成果物

| 成果物       | パス                                 | 内容           |
| ------------ | ------------------------------------ | -------------- |
| 品質レポート | `outputs/phase-09/quality-report.md` | 多角的品質確認 |

---

## 多角的チェック観点

| 観点               | 確認内容                                                              |
| ------------------ | --------------------------------------------------------------------- |
| 静的解析           | TypeScript・ESLint・Prettier の全チェックがエラーなしでパスしているか |
| セキュリティ       | 機密情報混入・eval 使用・パストラバーサルが存在しないか               |
| skill-creator 整合 | フィクスチャが skill-creator v8.1.0 仕様と整合しているか              |
| コード品質         | 検証スクリプトのエラーハンドリング・出力形式が一貫しているか          |

---

## 完了条件

- [ ] TypeScript 型チェックがエラーなしでパスしている
- [ ] ESLint チェックがエラーなしでパスしている
- [ ] Prettier フォーマットが適用されている
- [ ] セキュリティチェックリストの全項目がクリアされている
- [ ] skill-creator v8.1.0 仕様との整合性が確認されている
- [ ] 品質レポートが outputs/phase-09/ に配置されている

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

`phase-10-final-review.md`
