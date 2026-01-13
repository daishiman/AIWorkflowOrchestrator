# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 2                         |
| Phase名    | 設計                      |
| 前提Phase  | Phase 1                   |
| 後続Phase  | Phase 3                   |
| ステータス | 未実施                    |
| 作成日     | 2026-01-12                |
| 機能名     | knowledge-graph-migration |

---

## 目的

要件を実現可能な構造に落とし込み、drizzle.config.tsの確認・設計を行う。

## 背景

Phase 1で定義された要件に基づき、Drizzle Kitを使用したマイグレーション生成・適用の設計を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: drizzle.config.ts確認

**目的**: 現在の設定を確認し、graph/ディレクトリのスキーマが含まれているか検証する

**実行手順**:

1. `packages/shared/drizzle.config.ts` を読み込む
2. `schema` プロパティにgraph/index.tsが含まれているか確認
3. `out` プロパティ（マイグレーション出力先）を確認
4. 必要に応じて設定更新方針を策定

**期待される成果物**:

- drizzle.config.ts確認結果

---

### タスク2: スキーマ構造確認

**目的**: Knowledge Graphスキーマの依存関係を確認する

**実行手順**:

1. `packages/shared/src/db/schema/graph/` 配下のファイル構造を確認
2. 各テーブルの外部キー依存関係を図示
3. マイグレーション適用順序を決定

**期待される成果物**:

- スキーマ依存関係図
- マイグレーション適用順序

---

### タスク3: マイグレーション設計

**目的**: マイグレーション生成・適用の手順を設計する

**実行手順**:

1. drizzle-kit generateコマンドの実行方法を設計
2. drizzle-kit pushコマンドの実行方法を設計
3. 検証手順（テーブル存在確認、外部キー確認）を設計
4. ロールバック手順を設計

**期待される成果物**:

- マイグレーション設計書

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料     | パス                                                                           | 内容                |
| ------------ | ------------------------------------------------------------------------------ | ------------------- |
| DB実装仕様   | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Drizzle Kit使用方法 |
| スキーマ仕様 | `.claude/skills/aiworkflow-requirements/references/database-schema.md`         | テーブル定義        |
| 要件定義書   | `outputs/phase-1/requirements-definition.md`                                   | Phase 1成果物       |

---

## 成果物

| 成果物     | パス                                    | 内容                 |
| ---------- | --------------------------------------- | -------------------- |
| 設計書     | `outputs/phase-2/design-document.md`    | マイグレーション設計 |
| 依存関係図 | `outputs/phase-2/dependency-diagram.md` | スキーマ依存関係     |

---

## 統合テスト連携【必須】

統合ポイント/契約（drizzle.config.ts設定）を設計に反映する:

| 統合ポイント           | 契約定義                                       |
| ---------------------- | ---------------------------------------------- |
| スキーマパス           | `packages/shared/src/db/schema/graph/index.ts` |
| マイグレーション出力先 | `packages/shared/src/db/migrations/`           |
| DB接続                 | SQLite（libSQL）via Drizzle ORM                |

---

## 完了条件

- [ ] drizzle.config.tsの設定が確認されている
- [ ] スキーマ依存関係が図示されている
- [ ] マイグレーション生成・適用手順が設計されている
- [ ] 検証手順が設計されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

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

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/knowledge-graph-migration --phase 2
```

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## Phase実行記録（実行後に記入）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 実行タスク

- drizzle.config.ts確認: {{結果}}
- スキーマ構造確認: {{結果}}
- マイグレーション設計: {{結果}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/knowledge-graph-migration/phase-3-design-review.md`
