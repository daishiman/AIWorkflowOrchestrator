# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 12                    |
| Phase名    | ドキュメント更新      |
| 前提Phase  | Phase 11              |
| 後続Phase  | Phase 13              |
| ステータス | 未実施                |
| 作成日     | 2026-01-17            |
| 機能名     | hybridrag-integration |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 背景

HybridRAGエンジンの実装が完了したため、システム仕様書（aiworkflow-requirements）の更新、実装ガイドの作成、未タスクの検出を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成【必須】

**目的**: 2パート構成の実装ガイドを作成する

**実行手順**:

1. Part 1: 概念的説明（初学者・非技術者向け）を作成:
   - HybridRAGとは何か
   - 4ステージパイプラインの概念
   - 各検索戦略の役割
   - なぜ複数の検索を組み合わせるのか
   - 図解を含む説明
2. Part 2: 技術的詳細（開発者向け）を作成:
   - APIリファレンス
   - 型定義
   - 使用例
   - 設定オプション
   - エラーハンドリング
   - パフォーマンスチューニング
3. ファイルを配置: `outputs/phase-12/implementation-guide.md`

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（2パート構成）

---

### タスク2: システムドキュメント更新

**目的**: aiworkflow-requirementsを更新する

**実行手順**:

1. 更新対象を確認:
   - `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`
   - `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`
2. 更新判断基準:
   | 更新が必要な場合 | 更新が不要な場合 |
   | -------------------------------- | ---------------------------------- |
   | 新規インターフェース/型追加 | 内部実装の詳細変更のみ |
   | 既存インターフェース変更 | リファクタリング（インターフェース不変） |
   | 新規定数/設定値追加 | バグ修正（仕様変更なし） |
   | 外部連携インターフェース追加 | テスト追加のみ |
3. 必要な場合のみ更新を実施:
   - HybridRAGEngine/Factory のインターフェースを追記
   - HybridRAGResponse型を追記
   - パイプラインアーキテクチャ図を更新
4. タスク完了ステータスセクションを追加

**期待される成果物**:

- システム仕様書の更新（必要な場合）
- `outputs/phase-12/documentation-update-log.md`

---

### タスク3: 未タスク検出【必須】

**目的**: 残課題を検出し記録する

**実行手順**:

1. 検出ソースを確認:
   | # | ソース | 確認項目 |
   | - | ---------------------- | ------------------------------ |
   | 1 | Phase 3レビュー結果 | MINOR判定の指摘事項 |
   | 2 | Phase 10レビュー結果 | MINOR判定の指摘事項 |
   | 3 | Phase 11手動テスト結果 | スコープ外の発見事項 |
   | 4 | 各Phase成果物 | 「将来対応」「TODO」「FIXME」 |
   | 5 | コードベース | TODO/FIXME/HACK/XXXコメント |
2. 検出コマンドを実行:
   ```bash
   grep -rn "TODO\|FIXME\|HACK\|XXX" packages/shared/src/services/search/hybrid-rag-*.ts
   ```
3. 検出結果をレポートに記録:
   - 検出された場合: 未タスク指示書を作成
   - 検出されなかった場合: 「検出タスクなし」と明記
4. ファイルを配置: `outputs/phase-12/unassigned-task-report.md`

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`（0件でも必須）
- `docs/30-workflows/unassigned-task/*.md`（検出時のみ）

---

## 参照資料

| 参照資料       | パス                                      | 内容             |
| -------------- | ----------------------------------------- | ---------------- |
| Phase 11成果物 | `outputs/phase-11/manual-test-result.md`  | 手動テスト結果   |
| Phase 3成果物  | `outputs/phase-3/design-review-result.md` | 設計レビュー結果 |
| Phase 10成果物 | `outputs/phase-10/final-review-result.md` | 最終レビュー結果 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                           | 内容         |
| ----------------------- | ------------------------------------------------------------------------------ | ------------ |
| RAG検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`   | 更新対象     |
| RAGアーキテクチャ設計   | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`        | 更新対象     |
| 仕様更新ワークフロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準 |

---

## 成果物

| 成果物               | パス                                           | 必須 | 説明                      |
| -------------------- | ---------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成            |

---

## 未タスク検出レポート形式

### 検出あり（例）

```markdown
## 検出結果サマリー

| ソース             | 検出数  |
| ------------------ | ------- |
| Phase 3レビュー    | 2件     |
| Phase 10レビュー   | 1件     |
| Phase 11手動テスト | 0件     |
| コードベース       | 3件     |
| **合計**           | **6件** |

## 検出タスク一覧

| ID    | ソース  | 内容       | 重要度 |
| ----- | ------- | ---------- | ------ |
| U-001 | Phase 3 | 〇〇の改善 | 中     |

...
```

### 検出なし（例）

```markdown
## 検出結果サマリー

| ソース             | 検出数  |
| ------------------ | ------- |
| Phase 3レビュー    | 0件     |
| Phase 10レビュー   | 0件     |
| Phase 11手動テスト | 0件     |
| コードベース       | 0件     |
| **合計**           | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] ドキュメント更新履歴が作成されている
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 実行タスク

- タスク1（実装ガイド作成）: {{result}}
- タスク2（システムドキュメント更新）: {{result}}
- タスク3（未タスク検出）: {{result}}

### ドキュメント更新サマリー

| 更新対象 | 更新内容   |
| -------- | ---------- |
| {{FILE}} | {{CHANGE}} |

### 未タスク検出結果

- **検出数**: {{COUNT}}件
- **未タスク指示書**: {{作成済み / なし}}

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

`docs/30-workflows/hybridrag-integration/phase-13-pr-creation.md`
