# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 8                               |
| Phase名    | リファクタリング                |
| 前提Phase  | Phase 7（テストカバレッジ確認） |
| 後続Phase  | Phase 9（品質保証）             |
| ステータス | 未実施                          |
| 作成日     | 2026-01-18                      |
| 機能名     | graph-search-performance        |

---

## 目的

テスト成功状態を維持したまま、キャッシュ関連コードの可読性と保守性を向上させる。

## 背景

キャッシュ導入によりGraphSearchStrategyの責務が増えたため、コード構造を整理し今後の拡張に備える。

---

## 使用スキル

- `aiworkflow-requirements`: 仕様準拠の維持を確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: キャッシュ実装の整理

**目的**: キャッシュ関連の責務を明確に分離する。

**実行手順**:

1. キャッシュ実装がGraphSearchStrategyから分離されているか確認する。
2. 共有ロジックがあればヘルパー化する。
3. `outputs/phase-8/refactoring-log.md` に変更点を記録する。

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`

---

### タスク2: 命名と型定義の改善

**目的**: キャッシュ設定と統計の型を明確にする。

**実行手順**:

1. キャッシュ設定型の命名を整理する。
2. キャッシュ統計型に必要なプロパティがあるか確認する。
3. `outputs/phase-8/refactoring-log.md` に記録する。

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`

---

### タスク3: テスト再実行

**目的**: リファクタ後もテストが成功することを確認する。

**実行手順**:

1. `pnpm test` を実行する。
2. `pnpm test:integration` を実行する。
3. 失敗がないことを確認する。

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                         | 内容                            |
| ------------------------ | ---------------------------------------------------------------------------- | ------------------------------- |
| 検索クエリ・結果型定義   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | GraphSearchStrategyと検索型定義 |
| RAG・Knowledge Graph設計 | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | GraphRAG構成とKnowledge Graph型 |

**前Phase成果物**

| 参照資料       | パス                                         | 内容           |
| -------------- | -------------------------------------------- | -------------- |
| 要件定義       | `outputs/phase-1/requirements-definition.md` | 要件一覧       |
| キャッシュ設計 | `outputs/phase-2/cache-design.md`            | キャッシュ仕様 |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md`  | 実装内容       |
| テスト拡充結果 | `outputs/phase-6/coverage-report.md`         | カバレッジ分析 |
| ゲート判定結果 | `outputs/phase-7/gate-result.md`             | カバレッジ判定 |
| 統合テスト結果 | `outputs/phase-7/integration-test.md`        | 統合テスト結果 |

---

## 成果物

| 成果物               | パス                                 | 内容             |
| -------------------- | ------------------------------------ | ---------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 変更点と判断理由 |

---

## 統合テスト連携（Phase 1〜11は必須）

- リファクタ後も統合テストが成功することを確認する。
- キャッシュヒット時の挙動が保持されていることを確認する。

---

## 完了条件

- [ ] テストが成功している
- [ ] キャッシュ関連コードの可読性が向上している
- [ ] 変更内容が記録されている

---

## TDD検証

```bash
# テスト実行コマンド
pnpm test
```

- [ ] リファクタリング後もテストが成功することを確認

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] スキルフィードバックが記録されている

---

## スキルフィードバック記録

| スキル                  | 結果    | 備考                           |
| ----------------------- | ------- | ------------------------------ |
| aiworkflow-requirements | pending | 参照資料確認後に結果を記録する |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
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

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-performance --phase 8
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### 実行タスク

| タスク               | 結果   | 備考 |
| -------------------- | ------ | ---- |
| キャッシュ実装の整理 | 未実施 |      |
| 命名と型定義の改善   | 未実施 |      |
| テスト再実行         | 未実施 |      |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 9: 品質保証

`docs/30-workflows/graph-search-performance/phase-9-quality-assurance.md`
