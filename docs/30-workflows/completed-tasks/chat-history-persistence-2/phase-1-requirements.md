# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 1                      |
| Phase名    | 要件定義               |
| 前提Phase  | -                      |
| 後続Phase  | Phase 2                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-04             |
| 機能名     | チャット履歴永続化機能 |

---

## 目的

チャット履歴永続化機能の目的・スコープ・受け入れ基準を明確に定義し、後続の設計・実装フェーズの基盤を確立する。

## 背景

ユーザー要望「チャットの履歴を保存してほしいです」を実現可能な要件として具体化する必要がある。曖昧な要件のまま設計を進めると、手戻りが発生するリスクがある。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: requirements-engineering

**パス**: `.claude/skills/requirements-engineering/SKILL.md`

**Trigger条件**:
要件抽出/仕様化/品質検証/合意形成の統合プロセスが必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- 要件一覧ドキュメント
- 用語定義（ユビキタス言語）

---

### スキル2: use-case-modeling

**パス**: `.claude/skills/use-case-modeling/SKILL.md`

**Trigger条件**:
ユースケースの識別・定義・シナリオ作成が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- ユースケース一覧
- 主要ユースケースシナリオ

---

### スキル3: acceptance-criteria-writing

**パス**: `.claude/skills/acceptance-criteria-writing/SKILL.md`

**Trigger条件**:
テスト可能な受け入れ基準の定義が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- 受け入れ基準一覧（Given-When-Then形式）

---

## 参照資料

| 参照資料         | パス                                                                 | 内容               |
| ---------------- | -------------------------------------------------------------------- | ------------------ |
| 元のタスク指示書 | `docs/30-workflows/unassigned-task/task-chat-history-persistence.md` | ユーザー要望の詳細 |
| システム設計     | `docs/00-requirements/master_system_design.md`                       | システム全体設計   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料     | パス                                                              | 内容             |
| ------------ | ----------------------------------------------------------------- | ---------------- |
| チャット仕様 | `.claude/skills/aiworkflow-requirements/references/chat-spec.md`  | チャット機能仕様 |
| データモデル | `.claude/skills/aiworkflow-requirements/references/data-model.md` | データモデル仕様 |

---

## 成果物

| 成果物           | パス                                                                                | 内容                     |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------ |
| 要件定義書       | `docs/30-workflows/chat-history-persistence/outputs/phase-1/requirements.md`        | 機能要件・非機能要件     |
| ユースケース一覧 | `docs/30-workflows/chat-history-persistence/outputs/phase-1/use-cases.md`           | ユースケース定義         |
| 受け入れ基準     | `docs/30-workflows/chat-history-persistence/outputs/phase-1/acceptance-criteria.md` | テスト可能な受け入れ基準 |
| 用語定義         | `docs/30-workflows/chat-history-persistence/outputs/phase-1/glossary.md`            | ユビキタス言語定義       |

---

## 完了条件

- [ ] 機能要件が明確に定義されている
- [ ] 非機能要件（性能、セキュリティ）が定義されている
- [ ] ユースケースが網羅的に識別されている
- [ ] 受け入れ基準がGiven-When-Then形式で記述されている
- [ ] 用語定義（ユビキタス言語）が確立されている
- [ ] スコープ（含む/含まない）が明確化されている

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2 へ進む

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 使用スキル

- requirements-engineering: {{result}}
- use-case-modeling: {{result}}
- acceptance-criteria-writing: {{result}}

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

`docs/30-workflows/chat-history-persistence/phase-2-design.md`
