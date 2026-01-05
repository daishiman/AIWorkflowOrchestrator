# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 2                      |
| Phase名    | 設計                   |
| 前提Phase  | Phase 1                |
| 後続Phase  | Phase 3                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-04             |
| 機能名     | チャット履歴永続化機能 |

---

## 目的

Phase 1で定義された要件に基づき、チャット履歴永続化機能のアーキテクチャ・詳細設計を行う。

## 背景

要件定義が完了し、具体的な設計フェーズに移行する。データベーススキーマ、API設計、UI設計を並行して進める。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: database-normalization

**パス**: `.claude/skills/database-normalization/SKILL.md`

**Trigger条件**:
データベーススキーマ設計、正規化判断が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- チャット履歴テーブル設計
- メッセージテーブル設計
- 添付ファイルテーブル設計

---

### スキル2: drizzle-orm

**パス**: `.claude/skills/drizzle-orm/SKILL.md`

**Trigger条件**:
Drizzle ORMスキーマ定義、型安全クエリ設計が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- Drizzleスキーマ定義ファイル
- マイグレーションファイル

---

### スキル3: repository-pattern

**パス**: `.claude/skills/repository-pattern/SKILL.md`

**Trigger条件**:
データアクセス層の抽象化設計が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- ChatHistoryRepositoryインターフェース設計
- MessageRepositoryインターフェース設計

---

### スキル4: clean-architecture-principles

**パス**: `.claude/skills/clean-architecture-principles/SKILL.md`

**Trigger条件**:
レイヤー分離、依存関係ルール設計が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- アーキテクチャ図
- レイヤー間依存関係定義

---

## 参照資料

| 参照資料      | パス                                                          | 内容           |
| ------------- | ------------------------------------------------------------- | -------------- |
| Phase 1成果物 | `docs/30-workflows/chat-history-persistence/outputs/phase-1/` | 要件定義成果物 |
| 既存スキーマ  | `packages/shared/src/db/schema/`                              | 既存DBスキーマ |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料    | パス                                                                   | 内容                 |
| ----------- | ---------------------------------------------------------------------- | -------------------- |
| DB設計方針  | `.claude/skills/aiworkflow-requirements/references/database-design.md` | データベース設計方針 |
| API設計方針 | `.claude/skills/aiworkflow-requirements/references/api-design.md`      | API設計方針          |

---

## 成果物

| 成果物               | パス                                                                         | 内容                       |
| -------------------- | ---------------------------------------------------------------------------- | -------------------------- |
| DBスキーマ設計書     | `docs/30-workflows/chat-history-persistence/outputs/phase-2/db-schema.md`    | テーブル設計・ER図         |
| API設計書            | `docs/30-workflows/chat-history-persistence/outputs/phase-2/api-design.md`   | エンドポイント・I/F定義    |
| UI設計書             | `docs/30-workflows/chat-history-persistence/outputs/phase-2/ui-design.md`    | ワイヤーフレーム・画面遷移 |
| アーキテクチャ設計書 | `docs/30-workflows/chat-history-persistence/outputs/phase-2/architecture.md` | レイヤー構成・依存関係     |

---

## 完了条件

- [ ] チャット履歴テーブルスキーマが設計されている
- [ ] メッセージテーブルスキーマが設計されている
- [ ] Repositoryインターフェースが定義されている
- [ ] API仕様（CRUD操作）が定義されている
- [ ] UI画面設計（一覧・検索・詳細）が完了している
- [ ] アーキテクチャ図が作成されている

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 使用スキル

- database-normalization: {{result}}
- drizzle-orm: {{result}}
- repository-pattern: {{result}}
- clean-architecture-principles: {{result}}

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

`docs/30-workflows/chat-history-persistence/phase-3-design-review.md`
