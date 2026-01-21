# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 13                                    |
| Phase名    | PR作成                                |
| 前提Phase  | Phase 12（ドキュメント更新）          |
| 後続Phase  | なし（最終Phase）                     |
| ステータス | 未実施                                |
| 作成日     | 2026-01-18                            |
| 機能名     | graph-search-reliability-improvements |

---

## 目的

ローカル確認結果とPR作成情報をまとめ、PR作成準備を完了する。

## 背景

PR作成はユーザーの明示的許可が必要なため、事前にローカル検証結果とPR内容を整理する。

---

## PR作成に関する注意

- PR作成はユーザーの明示的な許可を得た後に実行する
- `/ai:diff-to-pr` は許可取得後にのみ実行する

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認

**目的**: PR作成前の必須チェックを実行する

**実行手順**:

1. `pnpm build` を実行
2. `pnpm lint` を実行
3. `pnpm typecheck` を実行
4. `pnpm test` を実行
5. 実行環境での動作確認が必要なときは `pnpm dev` を実行
6. 結果を `outputs/phase-13/local-check-result.md` に記録

**期待される成果物**:

- `outputs/phase-13/local-check-result.md`

---

### タスク2: コミット作成

**目的**: 変更内容をコミットとしてまとめる

**実行手順**:

1. 変更ファイルを確認
2. コミットメッセージ案を作成
3. ユーザーの明示的な許可を得てからコミットを実行

**期待される成果物**:

- コミット作成

---

### タスク3: PR作成

**目的**: PRを作成し、概要とテスト計画を整理する

**実行手順**:

1. PRタイトル/概要/変更点/テスト計画を整理
2. ユーザーの明示的な許可を得てから `/ai:diff-to-pr` を実行
3. PR URLを控える

**期待される成果物**:

- PR URL

---

### タスク4: CI結果記録

**目的**: CI結果を記録する

**実行手順**:

1. CI実行結果を確認
2. `outputs/phase-13/ci-result.md` に記録

**期待される成果物**:

- `outputs/phase-13/ci-result.md`

---

### タスク5: 完了報告

**目的**: PR作成とCI結果をまとめて報告する

**実行手順**:

1. PR URLとCI結果を整理
2. `outputs/phase-13/completion-report.md` に記録

**期待される成果物**:

- `outputs/phase-13/completion-report.md`

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

| 参照資料     | パス                                       | 内容     |
| ------------ | ------------------------------------------ | -------- |
| 実装ガイド   | `outputs/phase-12/implementation-guide.md` | 実装解説 |
| 仕様更新判断 | `outputs/phase-12/spec-update-decision.md` | 更新要否 |

**依存Phase成果物**

| 参照資料             | パス                                         | 内容       |
| -------------------- | -------------------------------------------- | ---------- |
| 要件定義             | `outputs/phase-1/requirements-definition.md` | 要件一覧   |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`     | 合否基準   |
| スコープ定義         | `outputs/phase-1/scope-definition.md`        | 対象範囲   |
| 設計ドキュメント     | `outputs/phase-2/design-document.md`         | 統合設計書 |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`  | 実装内容   |
| テスト拡充結果       | `outputs/phase-6/test-expansion-result.md`   | 拡充結果   |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`         | 計測結果   |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`         | 変更記録   |
| 品質サマリー         | `outputs/phase-9/quality-summary.md`         | 品質結果   |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`    | 判定結果   |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`     | 手動テスト |

---

## 成果物

| 成果物           | パス                                     | 内容             |
| ---------------- | ---------------------------------------- | ---------------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | ローカル検証結果 |
| CI結果           | `outputs/phase-13/ci-result.md`          | CI結果           |
| 完了報告         | `outputs/phase-13/completion-report.md`  | 変更内容まとめ   |

---

## 完了条件

- [ ] ローカル確認結果が記録されている
- [ ] コミットが作成されている
- [ ] PRが作成されている
- [ ] CI結果が記録されている
- [ ] 完了報告が作成されている

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
3. 成果物の作成・配置
4. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-reliability-improvements --phase 13
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 実行タスク

- タスク1:
- タスク2:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

- なし（ワークフロー完了）
```

## 依存関係

- **前提**: Phase 12（ドキュメント更新）の完了
- **後続**: なし（ワークフロー完了）

---

## 次のPhase

なし（ワークフロー完了）
