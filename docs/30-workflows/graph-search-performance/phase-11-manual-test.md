# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 11                             |
| Phase名    | 手動テスト                     |
| 前提Phase  | Phase 10（最終レビューゲート） |
| 後続Phase  | Phase 12（ドキュメント更新）   |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | graph-search-performance       |

---

## 目的

実運用に近い手動シナリオでキャッシュ導入後の検索挙動とメトリクスを確認する。

## 背景

自動テストで検証できない応答時間の体感やメトリクスの見え方を確認するため、手動テストを行う。

---

## 使用スキル

- `aiworkflow-requirements`: 手動テスト観点が仕様に沿うか確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 反復検索の挙動確認

**目的**: キャッシュのヒットとミスを手動で確認する。

**実行手順**:

1. 同一クエリを連続で2回実行する。
2. 2回目の応答時間とEmbeddingProvider呼び出し有無を確認する。
3. 結果を `outputs/phase-11/manual-test-result.md` に記録する。

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

### タスク2: キャッシュ無効時の確認

**目的**: cache.enabledがfalseのときに従来挙動となることを確認する。

**実行手順**:

1. キャッシュ無効設定で同一クエリを実行する。
2. EmbeddingProviderが毎回呼ばれることを確認する。
3. 結果を `outputs/phase-11/manual-test-result.md` に記録する。

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

### タスク3: TTL経過後の挙動確認

**目的**: TTL経過時に再生成されることを手動で確認する。

**実行手順**:

1. TTLを短く設定してクエリを実行する。
2. TTL経過後に同一クエリを実行する。
3. キャッシュミスとして埋め込みが再生成されることを確認する。
4. 結果を `outputs/phase-11/manual-test-result.md` に記録する。

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

## 参照資料

**前Phase成果物**

| 参照資料             | パス                                         | 内容           |
| -------------------- | -------------------------------------------- | -------------- |
| 要件定義             | `outputs/phase-1/requirements-definition.md` | 要件一覧       |
| キャッシュ設計       | `outputs/phase-2/cache-design.md`            | キャッシュ仕様 |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`  | 実装内容       |
| テスト拡充結果       | `outputs/phase-6/coverage-report.md`         | カバレッジ分析 |
| ゲート判定結果       | `outputs/phase-7/gate-result.md`             | 判定結果       |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`         | 変更点         |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`    | 判定結果       |
| 品質レポート         | `outputs/phase-9/quality-report.md`          | 品質検証結果   |

---

## 成果物

| 成果物         | パス                                     | 内容         |
| -------------- | ---------------------------------------- | ------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 手動検証結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

| テスト項目         | 確認内容                              | 期待結果           | 実行結果 |
| ------------------ | ------------------------------------- | ------------------ | -------- |
| API接続            | GraphSearchStrategyが検索を成功させる | 結果が返る         | 未記入   |
| 埋め込み再利用     | 2回目の検索で埋め込み再利用           | キャッシュヒット   | 未記入   |
| エラーハンドリング | EmbeddingProvider失敗時の復帰         | エラーが通知される | 未記入   |

---

## 完了条件

- [ ] 手動テストがすべて実行されている
- [ ] 期待結果が満たされている
- [ ] 手動テスト結果が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] スキルフィードバックが記録されている

---

## スキルフィードバック記録

| スキル                  | 結果    | 備考                           |
| ----------------------- | ------- | ------------------------------ |
| aiworkflow-requirements | pending | 参照資料確認後に結果を記録する |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/graph-search-performance --phase 11
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### 実行タスク

| タスク                 | 結果   | 備考 |
| ---------------------- | ------ | ---- |
| 反復検索の挙動確認     | 未実施 |      |
| キャッシュ無効時の確認 | 未実施 |      |
| TTL経過後の挙動確認    | 未実施 |      |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 12: ドキュメント更新

`docs/30-workflows/graph-search-performance/phase-12-documentation.md`
