# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 1                          |
| Phase名    | 要件定義                   |
| 前提Phase  | -                          |
| 後続Phase  | Phase 2 (設計)             |
| ステータス | 未実施                     |
| 作成日     | 2026-01-08                 |
| 機能名     | CONV-05-02-history-service |

---

## 目的

履歴取得サービスの機能要件・非機能要件を明確化し、テスト可能な受け入れ基準を定義する。

## 背景

CONV-05（履歴/ログ管理）の一環として、ファイルごとのバージョン履歴取得と復元機能が必要。
CONV-04-02（files/conversions テーブル）の実装に依存し、データ層との連携を前提とする。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: requirements-engineering

**パス**: `.claude/skills/requirements-engineering/SKILL.md`

**Trigger条件**:

- 要件抽出・仕様化・品質検証が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`

---

### スキル2: acceptance-criteria-writing

**パス**: `.claude/skills/acceptance-criteria-writing/SKILL.md`

**Trigger条件**:

- Given-When-Then形式の受け入れ基準作成が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

## 参照資料

| 参照資料     | パス                                                              | 内容                       |
| ------------ | ----------------------------------------------------------------- | -------------------------- |
| タスク指示書 | `docs/30-workflows/unassigned-task/task-05-02-history-service.md` | 元タスクの詳細仕様         |
| 親タスク仕様 | CONV-05                                                           | 履歴/ログ管理の親タスク    |
| 依存タスク   | CONV-04-02                                                        | files/conversions テーブル |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                              | 内容                     |
| ---------------- | ----------------------------------------------------------------- | ------------------------ |
| データモデル仕様 | `.claude/skills/aiworkflow-requirements/references/data-model.md` | DB設計・エンティティ定義 |

---

## 成果物

| 成果物       | パス                                         | 内容                       |
| ------------ | -------------------------------------------- | -------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件の定義 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Given-When-Then形式の基準  |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲の明確化           |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 1での必須アクション

- [ ] 接続要件（API/認証/データフロー）を要件に明記
- [ ] 統合対象のモジュール・インターフェースを特定
- [ ] 外部依存（ConversionRepository, FileRepository）を明確化

---

## 完了条件

- [ ] 機能要件が明文化されている
- [ ] 非機能要件（パフォーマンス、セキュリティ）が定義されている
- [ ] 受け入れ基準がGiven-When-Then形式で記述されている
- [ ] スコープ（実装範囲・除外範囲）が明確である
- [ ] 依存タスク（CONV-04-02）との連携要件が明記されている
- [ ] 統合テスト観点の接続要件が記載されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 使用スキル

- requirements-engineering: {{result}}
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

`docs/30-workflows/CONV-05-02-history-service/phase-2-design.md`
