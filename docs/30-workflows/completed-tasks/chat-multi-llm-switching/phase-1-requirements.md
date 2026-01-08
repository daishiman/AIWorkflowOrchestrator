# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 1                        |
| Phase名    | 要件定義                 |
| 前提Phase  | -                        |
| 後続Phase  | Phase 2                  |
| ステータス | 未実施                   |
| 作成日     | 2026-01-07               |
| 機能名     | chat-multi-llm-switching |

---

## 目的

チャット内LLMモデル切り替え機能の要件を明確化し、受け入れ基準を定義する。

## 背景

異なるLLMはそれぞれ得意分野が異なる。ユーザーがタスクに応じてLLMを動的に切り替えられるようにすることで、最適な回答を得られる環境を提供する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: acceptance-criteria-writing

**パス**: `.claude/skills/acceptance-criteria-writing/SKILL.md`

**Trigger条件**:
要件定義時、受け入れ基準の策定が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

### スキル2: functional-non-functional-requirements

**パス**: `.claude/skills/functional-non-functional-requirements/SKILL.md`

**Trigger条件**:
機能要件・非機能要件の分類と定義が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`

---

### スキル3: use-case-modeling

**パス**: `.claude/skills/use-case-modeling/SKILL.md`

**Trigger条件**:
ユースケースの特定と詳細化が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/use-cases.md`

---

## 参照資料

| 参照資料         | パス                                                                 | 内容                   |
| ---------------- | -------------------------------------------------------------------- | ---------------------- |
| 元のタスク指示書 | `docs/30-workflows/unassigned-task/task-chat-multi-llm-switching.md` | ユーザー要望の原文     |
| システム設計     | `docs/00-requirements/master_system_design.md`                       | 全体システム要件       |
| チャット機能仕様 | `.claude/skills/aiworkflow-requirements/references/`                 | 既存チャット機能の仕様 |

---

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料     | パス                                                                    | 内容                 |
| ------------ | ----------------------------------------------------------------------- | -------------------- |
| チャット機能 | `.claude/skills/aiworkflow-requirements/references/chat-feature.md`     | 既存チャット機能仕様 |
| LLM統合      | `.claude/skills/aiworkflow-requirements/references/llm-integration.md`  | LLM統合仕様          |
| 状態管理     | `.claude/skills/aiworkflow-requirements/references/state-management.md` | 状態管理仕様         |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "chat"`

---

## 成果物

| 成果物       | パス                                         | 内容                       |
| ------------ | -------------------------------------------- | -------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件の定義 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 各要件の受け入れ条件       |
| ユースケース | `outputs/phase-1/use-cases.md`               | ユースケース詳細           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲の明確化           |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 1の統合テスト連携アクション**: 接続要件（API/認証/データフロー）を要件に明記

具体的な確認項目:

- [ ] 各LLM APIへの接続要件を定義
- [ ] 認証フロー（APIキー管理）の要件を定義
- [ ] 会話データフローの要件を定義
- [ ] LLM間でのコンテキスト共有要件を定義

---

## 完了条件

- [ ] 機能要件が網羅的に定義されている
- [ ] 非機能要件（パフォーマンス、セキュリティ）が定義されている
- [ ] 受け入れ基準が測定可能な形で記述されている
- [ ] ユースケースが特定・詳細化されている
- [ ] スコープ（含むもの/含まないもの）が明確
- [ ] 接続要件（API/認証/データフロー）が要件に明記されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. acceptance-criteria-writingスキルの実行
3. functional-non-functional-requirementsスキルの実行
4. use-case-modelingスキルの実行
5. 統合テスト連携の実施（接続要件の明記）
6. 成果物の作成・配置
7. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/chat-multi-llm-switching --phase 1
```

---

## 依存関係

- **前提**: なし（初期Phase）
- **後続**: Phase 2 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 使用スキル

- acceptance-criteria-writing: {{result}}
- functional-non-functional-requirements: {{result}}
- use-case-modeling: {{result}}

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

`docs/30-workflows/chat-multi-llm-switching/phase-2-design.md`
