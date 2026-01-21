# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 11                                    |
| Phase名    | 手動テスト検証                        |
| 前提Phase  | Phase 10（最終レビューゲート）        |
| 後続Phase  | Phase 12（ドキュメント更新）          |
| ステータス | 未実施                                |
| 作成日     | 2026-01-18                            |
| 機能名     | graph-search-reliability-improvements |

---

## 目的

実環境相当でタイムアウトとエラーコードの挙動を確認し、手動テスト結果を記録する。

## 背景

自動テストで検証できない実行環境のタイムアウト挙動を手動で確認する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 手動テスト実行

**目的**: タイムアウト時の挙動を実機相当で確認する

**実行手順**:

1. GraphSearchStrategyの依存（GraphStore/Embedding）を遅延スタブに差し替える
   - 例: 返却まで `timeoutMs + 5000ms` の遅延を入れる
2. timeoutMsを1000msに設定して実行し、タイムアウトエラーが返ることを確認
3. HybridRAGが継続動作することを確認
4. `outputs/phase-11/manual-test-result.md` に記録

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

### タスク2: 発見課題の記録

**目的**: 手動テストで発見した課題を記録する

**実行手順**:

1. 手動テスト中に発見した課題を整理
2. `outputs/phase-11/discovered-issues.md` に記録

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

---

## テスト結果レポート形式

手動テスト結果は以下の形式で `outputs/phase-11/manual-test-result.md` に記録する。

```markdown
## テストカテゴリ別結果

### 機能テスト（正常系）

| TC-ID  | 機能                    | 期待結果           | 結果 | 備考 |
| ------ | ----------------------- | ------------------ | ---- | ---- |
| TC-001 | GraphSearchタイムアウト | TimeoutErrorが返る | PASS |      |

### エラーハンドリングテスト（異常系）

| TC-ID  | 状況           | 期待結果                        | 結果 | 備考 |
| ------ | -------------- | ------------------------------- | ---- | ---- |
| TC-101 | GraphStore遅延 | GraphSearchがフォールバックする | PASS |      |

### アクセシビリティテスト

| TC-ID  | 要件                     | 結果 | WCAG違反 |
| ------ | ------------------------ | ---- | -------- |
| TC-201 | キーボードナビゲーション | PASS | なし     |

### 統合テスト連携

| テスト項目                  | 結果 | 課題有無 |
| --------------------------- | ---- | -------- |
| GraphSearchタイムアウト統合 | PASS | なし     |
```

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                    |
| ------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| GraphSearchStrategy仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                | GraphSearchOptions/インターフェース仕様 |
| Knowledge Graph Store仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | GraphStoreインターフェースとエラー処理  |
| Embedding API仕様         | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`               | 埋め込み生成のタイムアウト設定          |
| エラーハンドリング仕様    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーコード体系と分類                  |
| RAGアーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                     | 検索パイプライン全体像                  |

**前Phase成果物**

| 参照資料         | パス                                      | 内容     |
| ---------------- | ----------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果 |
| 要件充足確認     | `outputs/phase-10/requirements-check.md`  | 要件確認 |

**依存Phase成果物**

| 参照資料             | パス                                         | 内容       |
| -------------------- | -------------------------------------------- | ---------- |
| 要件定義             | `outputs/phase-1/requirements-definition.md` | 要件一覧   |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`     | 合否基準   |
| スコープ定義         | `outputs/phase-1/scope-definition.md`        | 対象範囲   |
| 設計ドキュメント     | `outputs/phase-2/design-document.md`         | 統合設計書 |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`  | 実装内容   |
| Green状態確認        | `outputs/phase-5/test-green-status.md`       | テスト結果 |
| テスト拡充結果       | `outputs/phase-6/test-expansion-result.md`   | 拡充結果   |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`         | 計測結果   |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`         | 変更記録   |
| 品質サマリー         | `outputs/phase-9/quality-summary.md`         | 品質結果   |

---

## 成果物

| 成果物         | パス                                     | 内容           |
| -------------- | ---------------------------------------- | -------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 手動テスト記録 |
| 発見課題       | `outputs/phase-11/discovered-issues.md`  | 課題一覧       |

---

## 統合テスト連携（Phase 1〜11は必須）

- 実行環境でGraphSearchタイムアウトの統合挙動を確認

---

## 完了条件

- [ ] 手動テスト結果が記録されている
- [ ] 発見課題が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-reliability-improvements --phase 11
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### 実行タスク

- タスク1:
- タスク2:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 10（最終レビューゲート）の完了
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-reliability-improvements/phase-12-documentation.md`
