# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 2                        |
| Phase名    | 設計                     |
| 前提Phase  | Phase 1                  |
| 後続Phase  | Phase 3                  |
| ステータス | 未実施                   |
| 作成日     | 2026-01-07               |
| 機能名     | chat-multi-llm-switching |

---

## 目的

マルチLLM切り替え機能のアーキテクチャ設計、API設計、UI設計を行う。

## 背景

Phase 1で定義された要件を実現するための技術的な設計を行う。特に、複数のLLMプロバイダーを統一的に扱うためのアダプターパターンと、会話履歴の管理方式を設計する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: clean-architecture-principles

**パス**: `.claude/skills/clean-architecture-principles/SKILL.md`

**Trigger条件**:
マルチLLMアダプターの依存関係設計が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`

---

### スキル2: api-client-patterns

**パス**: `.claude/skills/api-client-patterns/SKILL.md`

**Trigger条件**:
複数LLM APIを統一的に扱うアダプター設計が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/api-specification.md`

---

### スキル3: design-system-architecture

**パス**: `.claude/skills/design-system-architecture/SKILL.md`

**Trigger条件**:
LLM選択UIのコンポーネント設計が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/ui-design.md`

---

### スキル4: state-lifting

**パス**: `.claude/skills/state-lifting/SKILL.md`

**Trigger条件**:
会話履歴とLLM設定の状態管理設計が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/state-management-design.md`

---

### スキル5: zod-validation

**パス**: `.claude/skills/zod-validation/SKILL.md`

**Trigger条件**:
LLM APIレスポンスのスキーマ検証設計が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/schema-design.md`

---

## 参照資料

| 参照資料      | パス                                         | 内容                       |
| ------------- | -------------------------------------------- | -------------------------- |
| Phase 1成果物 | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件の定義 |
| Phase 1成果物 | `outputs/phase-1/acceptance-criteria.md`     | 受け入れ基準               |
| システム仕様  | `.claude/skills/aiworkflow-requirements/`    | 既存システム仕様           |

---

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                   | 内容                |
| ---------------- | ---------------------------------------------------------------------- | ------------------- |
| アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/architecture.md`    | システム構造        |
| API設計          | `.claude/skills/aiworkflow-requirements/references/api-design.md`      | API設計ガイドライン |
| データベース設計 | `.claude/skills/aiworkflow-requirements/references/database-design.md` | DB設計方針          |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "architecture"`

---

## 成果物

| 成果物             | パス                                         | 内容                       |
| ------------------ | -------------------------------------------- | -------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | レイヤー構造・依存関係設計 |
| API仕様            | `outputs/phase-2/api-specification.md`       | LLMアダプターAPI設計       |
| UI設計             | `outputs/phase-2/ui-design.md`               | LLM選択コンポーネント設計  |
| 状態管理設計       | `outputs/phase-2/state-management-design.md` | 会話履歴・設定の状態管理   |
| スキーマ設計       | `outputs/phase-2/schema-design.md`           | Zodスキーマ定義            |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 2の統合テスト連携アクション**: 統合ポイント/契約（API・スキーマ）を設計に反映

具体的な確認項目:

- [ ] LLMアダプターインターフェースの契約を定義
- [ ] フロントエンド⇔バックエンドのAPI契約を定義
- [ ] 会話履歴データスキーマを定義
- [ ] LLM設定データスキーマを定義

---

## 完了条件

- [ ] アーキテクチャ設計が完了している
- [ ] LLMアダプターパターンが設計されている
- [ ] UI設計が完了している
- [ ] 状態管理設計が完了している
- [ ] Zodスキーマが定義されている
- [ ] 統合ポイント/契約が設計に反映されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. clean-architecture-principlesスキルの実行
3. api-client-patternsスキルの実行
4. design-system-architectureスキルの実行
5. state-liftingスキルの実行
6. zod-validationスキルの実行
7. 統合テスト連携の実施（統合ポイント/契約の設計）
8. 成果物の作成・配置
9. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/chat-multi-llm-switching --phase 2
```

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 使用スキル

- clean-architecture-principles: {{result}}
- api-client-patterns: {{result}}
- design-system-architecture: {{result}}
- state-lifting: {{result}}
- zod-validation: {{result}}

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

`docs/30-workflows/chat-multi-llm-switching/phase-3-design-review.md`
