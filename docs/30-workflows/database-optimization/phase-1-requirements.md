# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 1                     |
| Phase名    | 要件定義              |
| 前提Phase  | なし（開始Phase）     |
| 後続Phase  | Phase 2（設計）       |
| ステータス | 未実施                |
| 作成日     | 2026-01-18            |
| 機能名     | database-optimization |

---

## 目的

チャット履歴DB最適化の要件、受け入れ基準、スコープを明文化し、以降の設計・実装の判断基準を固定する。

## 背景

最終レビューで、外部キーインデックス不足、onDelete動作未定義、message_count冗長保持が確認された。性能と整合性を同時に担保するため、要件とスコープを先に固定する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現行スキーマと運用状況の整理

**目的**: 現行スキーマとインデックス状態を把握する

**実行手順**:

1. `packages/shared/src/db/schema/chat-history.ts` を確認し、chat_sessions/chat_messagesの定義を整理する
2. `packages/shared/drizzle/migrations/` を確認し、現行インデックスと制約の状態を把握する
3. 整理結果を `outputs/phase-1/requirements-definition.md` に記録する

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`

---

### タスク2: 最適化要件と受け入れ基準の定義

**目的**: 性能・整合性の要件と検証可能な基準を定義する

**実行手順**:

1. 必須最適化項目（FKインデックス、onDelete方針、CHECK制約、部分インデックス）を列挙する
2. ベンチマークの判定基準（Index Scan確認、実測改善率、message_count判断条件）を定義する
3. 受け入れ基準を `outputs/phase-1/acceptance-criteria.md` に記録する

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

### タスク3: スコープと制約の明文化

**目的**: 対象範囲と非対象範囲を明確化する

**実行手順**:

1. 変更対象を chat_sessions / chat_messages と関連マイグレーションに限定する
2. 非対象（新規テーブル、検索方式変更、FTS導入）を明記する
3. スコープ定義を `outputs/phase-1/scope-definition.md` に記録する

**期待される成果物**:

- `outputs/phase-1/scope-definition.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                           | 内容                            |
| ---------------------------- | ------------------------------------------------------------------------------ | ------------------------------- |
| データベースアーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/database-architecture.md`   | DB接続・マイグレーション設計    |
| データベーススキーマ設計     | `.claude/skills/aiworkflow-requirements/references/database-schema.md`         | chat_sessions/chat_messages定義 |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | リポジトリ仕様とビジネスルール  |
| 非機能要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | パフォーマンス・テスト基準      |

**ユーザー指示**

| 参照資料       | パス                                                              | 内容                 |
| -------------- | ----------------------------------------------------------------- | -------------------- |
| 未タスク指示書 | `docs/30-workflows/unassigned-task/task-database-optimization.md` | DB最適化の背景と課題 |

---

## 成果物

| 成果物       | パス                                         | 内容                  |
| ------------ | -------------------------------------------- | --------------------- |
| 要件定義     | `outputs/phase-1/requirements-definition.md` | 現行スキーマ/課題整理 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 合否判定基準          |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象/非対象範囲       |

---

## 統合テスト連携（Phase 1〜11は必須）

- セッション削除とメッセージ取得の統合テスト要件を明文化
- Index Scan確認と孤立レコード検知を統合テスト観点に含める

---

## 完了条件

- [ ] 現行スキーマと課題が整理されている
- [ ] 受け入れ基準が検証可能な形で定義されている
- [ ] スコープが明確化されている
- [ ] 参照仕様との整合が確認されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonを更新

---

## 依存関係

- **前提**: なし（開始Phase）
- **後続**: Phase 2（設計）へ進む

---

## Phase 1 実行記録

### 実行タスク

- タスク1: 現行スキーマと運用状況の整理
- タスク2: 最適化要件と受け入れ基準の定義
- タスク3: スコープと制約の明文化

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-2-design.md`
