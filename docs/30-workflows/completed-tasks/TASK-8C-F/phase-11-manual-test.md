# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 11                                                         |
| Phase名    | 手動テスト検証                                             |
| 前提Phase  | Phase 10（最終レビューゲート）                             |
| 後続Phase  | Phase 12（ドキュメント更新）                               |
| ステータス | 未実施                                                     |
| 作成日     | 2026-02-01                                                 |
| 機能名     | TASK-8C-F: Skill-Creator テスト用フィクスチャ & 実行スキル |

---

## 目的

自動テストでカバーできない観点（可読性、一貫性、実際の skill-creator との互換性）を手動で検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: フィクスチャ内容の目視確認

**目的**: フィクスチャファイルの内容が適切で読みやすいか確認する

**実行手順**:

1. 以下のファイルを目視で確認する：

| ファイル                                     | 確認項目                                       | 結果 |
| -------------------------------------------- | ---------------------------------------------- | ---- |
| complete-skill/SKILL.md                      | Frontmatter の正しさ、body の構造、日本語表記  |      |
| complete-skill/agents/analyze-request.md     | エージェント仕様書フォーマットの自然さ         |      |
| complete-skill/agents/generate-code.md       | エージェント仕様書フォーマットの一貫性         |      |
| complete-skill/references/overview.md        | 参照ガイドとしての適切さ                       |      |
| complete-skill/scripts/utils.js              | EXIT_CODES パターンの正しさ                    |      |
| complete-skill/schemas/agent-definition.json | JSON Schema の妥当性                           |      |
| minimal-skill/SKILL.md                       | 最小構成として十分か                           |      |
| partial-skill/SKILL.md                       | 部分構成として意図通りか                       |      |
| invalid-skill/SKILL.md                       | 意図的なエラーが明確か                         |      |
| orchestration-skill/assets/\*.yaml           | YAML 構造が skill-creator テンプレートに準拠か |      |

**期待される成果物**:

- 目視確認結果

---

### タスク2: 検証スクリプトの手動実行確認

**目的**: 検証スクリプトを実際に手動実行し、期待通りの結果が得られるか確認する

**実行手順**:

1. complete-skill に対して run-all-validations.js を実行する：

   ```bash
   node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js \
     --target apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill
   ```

   - 期待: overall: true

2. invalid-skill に対して実行する：

   ```bash
   node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js \
     --target apps/desktop/src/__tests__/__fixtures__/skill-creator/invalid-skill
   ```

   - 期待: overall: false, エラーメッセージが明確

3. 各個別スクリプトを手動実行して出力を確認する

**期待される成果物**:

- 手動実行結果

---

### タスク3: skill-fixture-runner スキルの動作確認

**目的**: スキルとしての使用感を確認する

**実行手順**:

1. skill-fixture-runner/SKILL.md の内容を確認し、トリガーキーワードが適切か確認する
2. EVALS.json の初期値が正しいか確認する
3. package.json の scripts が正しく定義されているか確認する

**期待される成果物**:

- スキル動作確認結果

---

### タスク4: 発見事項の記録

**目的**: 手動テストで発見された課題・改善点を記録する

**実行手順**:

1. `outputs/phase-11/manual-test-result.md` にテスト結果を出力する
2. 発見された課題があれば `outputs/phase-11/discovered-issues.md` に記録する

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/discovered-issues.md`（課題がある場合）

---

## 参照資料

| 参照資料                   | パス                                                     | 内容             |
| -------------------------- | -------------------------------------------------------- | ---------------- |
| フィクスチャファイル       | `apps/desktop/src/__tests__/__fixtures__/skill-creator/` | フィクスチャ群   |
| 検証スクリプト             | `.claude/skills/skill-fixture-runner/scripts/`           | スクリプト群     |
| skill-fixture-runner       | `.claude/skills/skill-fixture-runner/`                   | テスト実行スキル |
| skill-creator テンプレート | `.claude/skills/skill-creator/assets/`                   | 参照元           |

---

## 成果物

| 成果物           | パス                                     | 内容     |
| ---------------- | ---------------------------------------- | -------- |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md` | 検証結果 |
| 発見事項レポート | `outputs/phase-11/discovered-issues.md`  | 課題記録 |

---

## 多角的チェック観点

| 観点               | 確認内容                                                     |
| ------------------ | ------------------------------------------------------------ |
| 可読性             | フィクスチャの内容が読みやすく、目的が明確に理解できるか     |
| 一貫性             | フィクスチャ間・スクリプト間でフォーマットが統一されているか |
| skill-creator 互換 | フィクスチャが skill-creator の実際の出力と整合しているか    |
| 実用性             | skill-fixture-runner がスキルとして自然に使用できるか        |

---

## 完了条件

- [ ] フィクスチャ全ファイルの目視確認が完了している
- [ ] 検証スクリプトの手動実行結果が期待通りである
- [ ] skill-fixture-runner の動作確認が完了している
- [ ] 手動テスト結果が outputs/phase-11/ に配置されている

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

`phase-12-documentation.md`
