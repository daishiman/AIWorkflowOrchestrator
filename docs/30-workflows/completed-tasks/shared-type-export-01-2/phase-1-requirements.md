# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 1                     |
| Phase名    | 要件定義              |
| 前提Phase  | -                     |
| 後続Phase  | Phase 2               |
| ステータス | 未実施                |
| 作成日     | 2026-01-22            |
| 機能名     | shared-type-export-01 |

---

## 目的

`@repo/shared` パッケージからCommunity関連の型をエクスポートするための要件を定義する。

## 背景

CONV-08-05（Community Visualization UI）の実装で、`apps/desktop` から `@repo/shared` の Community 関連型をインポートしようとしたが、型がエクスポートされていないためビルドエラーが発生した。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存型定義の確認

**目的**: エクスポート対象の型を特定する

**実行手順**:

1. `packages/shared/src/services/graph/types.ts` を開く
2. 以下の型が定義されていることを確認:
   - `Community`
   - `CommunitySummary`
   - `StoredEntity`
   - `CommunityStructure`
   - `CommunityDetectionOptions`
   - `CommunityDetectionResult`
3. 各型の用途と依存関係を把握

**期待される成果物**:

- エクスポート対象型の一覧
- 各型の用途・責務の理解

---

### タスク2: エクスポート要件の定義

**目的**: エクスポートすべき型と形式を明確化する

**実行手順**:

1. `architecture-monorepo.md` の「型エクスポートパターン」セクションを参照
2. 以下を決定:
   - `export type { }` でエクスポートする型（インターフェース）
   - `export { }` でエクスポートする値（enum、class、function）
3. 下位互換性の確認（既存インポートが壊れないか）

**期待される成果物**:

- エクスポート形式の決定
- 下位互換性チェックリスト

---

### タスク3: 要件ドキュメント作成

**目的**: 要件を文書化する

**実行手順**:

1. `outputs/phase-1/requirements.md` を作成
2. 以下を記載:
   - エクスポート対象型一覧
   - エクスポート形式（type vs value）
   - 受け入れ基準
   - 下位互換性要件

**期待される成果物**:

- `outputs/phase-1/requirements.md`

---

## 参照資料

| 参照資料                         | パス                                                                                      | 内容                   |
| -------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------- |
| モノレポアーキテクチャ           | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`              | 型エクスポートパターン |
| コミュニティ検出インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md` | 型定義詳細             |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                           |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| モノレポアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | バレルファイル戦略・依存ルール |

---

## 成果物

| 成果物           | パス                              | 内容               |
| ---------------- | --------------------------------- | ------------------ |
| 要件ドキュメント | `outputs/phase-1/requirements.md` | 型エクスポート要件 |

---

## 統合テスト連携

**Phase 1 アクション**: 型インポート要件（apps/desktop からのインポート）を要件に明記

- `apps/desktop` から `@repo/shared/services/graph` への型インポートパスを要件として定義
- 期待されるインポート構文を明確化

---

## 完了条件

- [ ] `services/graph/types.ts` の型定義を確認完了
- [ ] エクスポート対象型の一覧を作成
- [ ] エクスポート形式（type vs value）を決定
- [ ] 下位互換性要件を確認
- [ ] `outputs/phase-1/requirements.md` を作成

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（このPhaseが最初）
- **後続**: Phase 2 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-01/phase-2-design.md`
