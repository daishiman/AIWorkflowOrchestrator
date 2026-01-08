# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 1                              |
| Phase名    | 要件定義                       |
| 前提Phase  | -                              |
| 後続Phase  | Phase 2                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-07                     |
| 機能名     | CONV-06-05-relation-extraction |

---

## 目的

関係抽出サービスの機能要件・非機能要件・受け入れ基準を明確に定義する。

## 背景

Knowledge Graphを構築するためには、エンティティ間の関係性を抽出する必要がある。CONV-06-04で実装したエンティティ抽出サービスの出力を受けて、エンティティ間の関係（エッジ）を識別・構造化するサービスが必要。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: acceptance-criteria-writing

**パス**: `.claude/skills/acceptance-criteria-writing/SKILL.md`

**Trigger条件**: 受け入れ基準を定義する必要がある

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

### スキル2: functional-non-functional-requirements

**パス**: `.claude/skills/functional-non-functional-requirements/SKILL.md`

**Trigger条件**: 機能要件・非機能要件を整理する必要がある

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-1/scope-definition.md`

---

## 参照資料

| 参照資料                 | パス                                                                  | 内容                     |
| ------------------------ | --------------------------------------------------------------------- | ------------------------ |
| 元タスク指示書           | `docs/30-workflows/unassigned-task/task-06-05-relation-extraction.md` | タスクの詳細要件         |
| エンティティ抽出サービス | `packages/shared/src/services/extraction/entity-extractor.ts`         | 依存元のインターフェース |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                          | 内容                       |
| -------------------------- | ----------------------------------------------------------------------------- | -------------------------- |
| エンティティ・関係スキーマ | `.claude/skills/aiworkflow-requirements/references/entity-relation-schema.md` | エンティティと関係の型定義 |

---

## 成果物

| 成果物       | パス                                         | 内容                   |
| ------------ | -------------------------------------------- | ---------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件の定義 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 各要件の受け入れ条件   |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲の明確化       |

---

## 統合テスト連携（Phase 1〜11は必須）

Phase 1では以下の統合テスト連携アクションを実施:

- [ ] 接続要件（API/認証/データフロー）を要件に明記
- [ ] エンティティ抽出サービス（CONV-06-04）との連携インターフェースを定義
- [ ] ExtractionPipelineとの統合ポイントを特定

---

## 要件定義ガイドライン

### 機能要件

以下の機能要件を定義すること:

1. **単一チャンク関係抽出**: ContentChunkとExtractedEntity[]から関係を抽出
2. **バッチ関係抽出**: 複数チャンクの一括処理
3. **関係マージ**: 重複関係の統合とエビデンス集約
4. **関係タイプ分類**: 15種類の関係タイプへの分類
5. **信頼度評価**: 0.0〜1.0の信頼度スコア付与
6. **エビデンス抽出**: 関係を示すテキストの特定

### 非機能要件

以下の非機能要件を定義すること:

1. **パフォーマンス**: 1チャンクあたりの処理時間目標
2. **精度**: 関係抽出の精度目標（適合率・再現率）
3. **スケーラビリティ**: バッチサイズの上限
4. **エラー耐性**: LLM障害時の振る舞い

### 受け入れ基準

以下の形式で受け入れ基準を定義:

```
Given: [前提条件]
When: [実行アクション]
Then: [期待結果]
```

---

## 完了条件

- [ ] 機能要件が定義されている
- [ ] 非機能要件が定義されている
- [ ] 受け入れ基準がGiven-When-Then形式で記述されている
- [ ] スコープ（含む/含まない）が明確化されている
- [ ] 依存タスク（CONV-06-04）との連携が明記されている
- [ ] 統合テスト連携アクションが完了している
- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2（設計）へ進む

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 使用スキルの実行（各スキルごとに1タスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/CONV-06-05-relation-extraction --phase 1
```

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 使用スキル

- acceptance-criteria-writing: [success/failure/partial]
- functional-non-functional-requirements: [success/failure/partial]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/CONV-06-05-relation-extraction/phase-2-design.md`
