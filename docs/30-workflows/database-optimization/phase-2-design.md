# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 2                       |
| Phase名    | 設計                    |
| 前提Phase  | Phase 1（要件定義）     |
| 後続Phase  | Phase 3（設計レビュー） |
| ステータス | 未実施                  |
| 作成日     | 2026-01-18              |
| 機能名     | database-optimization   |

---

## 目的

スキーマ最適化の具体設計を確定し、マイグレーションとベンチマークの実行方針を定義する。

## 背景

Phase 1で定義した要件を実装可能な設計に落とし込み、SQLite制約と運用方針を踏まえた移行戦略を定める必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: インデックス・制約の設計

**目的**: 追加すべきインデックスと制約を設計する

**実行手順**:

1. chat_sessions / chat_messages の既存インデックスを一覧化する
2. 追加対象を設計する
   - session_idの外部キーインデックス
   - 論理削除対応の部分インデックス
   - roleのCHECK制約
3. 設計内容を `outputs/phase-2/schema-optimization-design.md` に記録する

**期待される成果物**:

- `outputs/phase-2/schema-optimization-design.md`

---

### タスク2: onDelete戦略の確定

**目的**: 削除時の整合性を保証する方針を決定する

**実行手順**:

1. 論理削除運用と整合するonDelete方針（RESTRICT/NO ACTION）を決定する
2. SQLite制約で表現できない場合のアプリケーション層対策を明文化する
3. 方針を `outputs/phase-2/schema-optimization-design.md` に追記する

**期待される成果物**:

- `outputs/phase-2/schema-optimization-design.md`

---

### タスク3: マイグレーション・ベンチマーク計画

**目的**: 移行手順と評価手順を明確化する

**実行手順**:

1. マイグレーション実行順序とロールバック手順を整理する
2. message_countの削除判断に使うベンチマークシナリオを定義する
3. 結果を `outputs/phase-2/migration-plan.md` と `outputs/phase-2/benchmark-plan.md` に記録する

**期待される成果物**:

- `outputs/phase-2/migration-plan.md`
- `outputs/phase-2/benchmark-plan.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                           | 内容                            |
| ---------------------------- | ------------------------------------------------------------------------------ | ------------------------------- |
| データベースアーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/database-architecture.md`   | DB接続・マイグレーション設計    |
| データベーススキーマ設計     | `.claude/skills/aiworkflow-requirements/references/database-schema.md`         | chat_sessions/chat_messages定義 |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | リポジトリ仕様とビジネスルール  |
| データベース実装             | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Drizzle実装と運用               |
| 非機能要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | ベンチマーク判定基準            |

**前Phase成果物**

| 参照資料     | パス                                         | 内容     |
| ------------ | -------------------------------------------- | -------- |
| 要件定義     | `outputs/phase-1/requirements-definition.md` | 課題整理 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 判定基準 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲 |

---

## 成果物

| 成果物               | パス                                            | 内容                      |
| -------------------- | ----------------------------------------------- | ------------------------- |
| スキーマ最適化設計   | `outputs/phase-2/schema-optimization-design.md` | 追加インデックス/制約設計 |
| マイグレーション計画 | `outputs/phase-2/migration-plan.md`             | 実行順序とロールバック    |
| ベンチマーク計画     | `outputs/phase-2/benchmark-plan.md`             | 計測条件と判定基準        |

---

## 統合テスト連携（Phase 1〜11は必須）

- インデックス追加と削除フローの統合テスト観点を設計に反映
- message_count判断に必要な統合シナリオを明記

---

## 完了条件

- [ ] インデックスと制約の設計が確定している
- [ ] onDelete方針が決定されている
- [ ] マイグレーションとベンチマーク計画が作成されている
- [ ] 参照仕様との整合が確認されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonを更新

---

## 依存関係

- **前提**: Phase 1（要件定義）の完了
- **後続**: Phase 3（設計レビュー）へ進む

---

## Phase 2 実行記録

### 実行タスク

- タスク1: インデックス・制約の設計
- タスク2: onDelete戦略の確定
- タスク3: マイグレーション・ベンチマーク計画

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-3-design-review.md`
