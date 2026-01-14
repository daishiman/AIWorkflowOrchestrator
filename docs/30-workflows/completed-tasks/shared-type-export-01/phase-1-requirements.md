# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 1                     |
| Phase名    | 要件定義              |
| 前提Phase  | なし                  |
| 後続Phase  | Phase 2               |
| ステータス | 未実施                |
| 作成日     | 2026-01-13            |
| 機能名     | shared-type-export-01 |

---

## 目的

Community関連の型エクスポート要件を明確化し、実装スコープを定義する。

## 背景

CONV-08-05（Community Visualization UI）の実装で、`apps/desktop` から `@repo/shared` の Community 関連型をインポートしようとしたが、型がエクスポートされていないためビルドエラーが発生した。この問題を解決するため、型のエクスポート構造を整備する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現状の型定義確認

**目的**: 既存の型定義ファイルの内容を把握する

**実行手順**:

1. `packages/shared/src/services/graph/types.ts` を確認
2. エクスポートすべき型・インターフェース・関数を一覧化
3. 各型の用途と依存関係を整理

**期待される成果物**:

- 型一覧リスト（出力: `outputs/phase-1/type-inventory.md`）

---

### タスク2: 依存関係の確認

**目的**: 型の依存関係と使用パターンを把握する

**実行手順**:

1. `types.ts` がインポートしている外部型を確認
2. `types/rag/branded.ts` から使用している Branded Types を確認
3. `types/rag/graph/types.ts` から使用している型を確認

**期待される成果物**:

- 依存関係図（出力: `outputs/phase-1/dependency-analysis.md`）

---

### タスク3: 受け入れ基準の定義

**目的**: 実装完了の判定基準を明確化する

**実行手順**:

1. エクスポートすべき型の最終リストを確定
2. 型チェック成功の基準を定義
3. 後続タスク（Part 2, Part 3）との境界を明確化

**期待される成果物**:

- 受け入れ基準書（出力: `outputs/phase-1/acceptance-criteria.md`）

---

## 参照資料

| 参照資料                             | パス                                                                                          | 内容                     |
| ------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------ |
| モノレポアーキテクチャ               | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`                  | パッケージ依存関係ルール |
| コミュニティ検出インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md`     | Community型の仕様        |
| コミュニティ要約インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | CommunitySummary型の仕様 |

---

## 成果物

| 成果物         | パス                                     | 内容                   |
| -------------- | ---------------------------------------- | ---------------------- |
| 型一覧リスト   | `outputs/phase-1/type-inventory.md`      | エクスポート対象型一覧 |
| 依存関係分析   | `outputs/phase-1/dependency-analysis.md` | 型の依存関係図         |
| 受け入れ基準書 | `outputs/phase-1/acceptance-criteria.md` | 完了判定基準           |

---

## 統合テスト連携（Phase 1〜11は必須）

### 接続要件の明記

- 型エクスポートの主目的は `apps/desktop` からのインポート成功
- `@repo/shared/services/graph` パスからの型インポートが可能であること
- 既存の内部インポート（`@repo/shared` 内部）を壊さないこと

---

## 完了条件

- [ ] `types.ts` 内の全ての public 型が一覧化されている
- [ ] 依存関係（Branded Types等）が整理されている
- [ ] 受け入れ基準が明確に定義されている
- [ ] スコープ境界（Part 1/2/3）が明確化されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 1 ステータスを `completed` に更新

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-01/phase-2-design.md`
