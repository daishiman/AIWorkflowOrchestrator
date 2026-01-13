# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 10                    |
| Phase名    | 最終レビューゲート    |
| 前提Phase  | Phase 9               |
| 後続Phase  | Phase 11              |
| ステータス | 未実施                |
| 作成日     | 2026-01-12            |
| 機能名     | graph-search-strategy |

---

## 目的

全Phaseの成果物とコードを最終確認し、品質ゲートを通過させる。マージ可能な状態であることを確認する。

## 背景

Phase 1-9で作成した全成果物を総合的にレビューし、品質基準を満たしていることを確認する。問題があれば該当Phaseに戻って修正を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 成果物完全性チェック

**目的**: 全Phaseの成果物が揃っていることを確認

**実行手順**:

1. 各Phaseの成果物リストを確認
2. 成果物ファイルの存在確認
3. 成果物の内容が適切か確認

**期待される成果物**:

- 成果物チェックリスト

**チェック対象**:

| Phase | 成果物                                       | 存在 |
| ----- | -------------------------------------------- | ---- |
| 1     | `outputs/phase-1/requirements-definition.md` | [ ]  |
| 2     | `outputs/phase-2/architecture-design.md`     | [ ]  |
| 3     | `outputs/phase-3/design-review-result.md`    | [ ]  |
| 4     | `outputs/phase-4/test-specification.md`      | [ ]  |
| 4     | テストファイル（\*.test.ts）                 | [ ]  |
| 5     | `graph-search-strategy.ts`                   | [ ]  |
| 6     | `outputs/phase-6/coverage-report.md`         | [ ]  |
| 7     | `outputs/phase-7/coverage-report.md`         | [ ]  |
| 8     | `outputs/phase-8/refactoring-report.md`      | [ ]  |
| 9     | `outputs/phase-9/quality-summary.md`         | [ ]  |

---

### タスク2: コード品質最終確認

**目的**: コードが品質基準を満たすことを確認

**実行手順**:

1. ESLintエラーがないことを確認
2. TypeScript型エラーがないことを確認
3. テストがすべて成功することを確認
4. カバレッジが基準を満たすことを確認

**期待される成果物**:

- コード品質レポート

**実行コマンド**:

```bash
# Lint確認
pnpm lint -- --filter="@repo/shared"

# 型チェック
pnpm typecheck -- --filter="@repo/shared"

# テスト実行
pnpm test -- --filter="GraphSearchStrategy"

# カバレッジ確認
pnpm test:coverage -- --filter="GraphSearchStrategy"
```

---

### タスク3: 要件トレーサビリティ確認

**目的**: 全要件が実装・テストされていることを確認

**実行手順**:

1. FR（機能要件）の実装確認
2. NFR（非機能要件）の検証確認
3. 受け入れ基準の達成確認

**期待される成果物**:

- トレーサビリティマトリクス

---

### タスク4: 最終レビュー判定

**目的**: マージ可能かどうかを判定

**実行手順**:

1. 全チェック項目の確認
2. 問題点の洗い出し
3. 判定結果の記録

**期待される成果物**:

- 最終レビュー結果（`outputs/phase-10/final-review-result.md`）

---

## 参照資料

| 参照資料       | パス                                         | 内容          |
| -------------- | -------------------------------------------- | ------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 品質保証サマリ | `outputs/phase-9/quality-summary.md`         | Phase 9成果物 |

---

## 成果物

| 成果物           | パス                                      | 説明         |
| ---------------- | ----------------------------------------- | ------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 総合判定結果 |
| トレーサビリティ | `outputs/phase-10/traceability-matrix.md` | 要件追跡表   |

---

## 統合テスト連携【必須】

最終確認として全テストを実行:

```bash
# 全テスト実行
pnpm test -- --filter="GraphSearchStrategy"
pnpm test:integration -- --filter="GraphSearchStrategy"

# ビルド確認
pnpm --filter @repo/shared build
```

---

## 完了条件

- [ ] 全成果物が存在する
- [ ] ESLintエラーがない
- [ ] TypeScript型エラーがない
- [ ] 全テストが成功
- [ ] カバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 全要件がトレースされている
- [ ] 最終レビュー結果がPASS
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11: 手動テスト検証 へ進む

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 1-9の成果物存在確認
2. ESLintエラー確認
3. TypeScript型エラー確認
4. 全テスト実行確認
5. カバレッジ基準達成確認
6. 要件トレーサビリティ確認（FR/NFR）
7. 設計品質確認（SOLID・インターフェース準拠）
8. トレーサビリティマトリクス作成
9. 最終レビュー結果ドキュメント作成
10. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/graph-search-strategy --phase 10
```

---

## Phase実行記録

| 項目            | 内容                     |
| --------------- | ------------------------ |
| 実行開始日時    | {{EXECUTION_START}}      |
| 実行完了日時    | {{EXECUTION_END}}        |
| 実行者          | {{EXECUTOR}}             |
| 成果物確認      | [ ] 全て生成済み         |
| artifacts.json  | [ ] 更新済み             |
| 次Phase移行可否 | [ ] 可 / [ ] 否（理由:） |

---

## 最終レビューチェックリスト

### コード品質

| 項目              | 基準        | 結果 |
| ----------------- | ----------- | ---- |
| ESLint            | エラー0件   | [ ]  |
| TypeScript        | 型エラー0件 | [ ]  |
| ユニットテスト    | 全件成功    | [ ]  |
| 統合テスト        | 全件成功    | [ ]  |
| Line Coverage     | 80%以上     | [ ]  |
| Branch Coverage   | 60%以上     | [ ]  |
| Function Coverage | 80%以上     | [ ]  |

### 設計品質

| 項目                 | 基準                        | 結果 |
| -------------------- | --------------------------- | ---- |
| SOLID原則            | 適用されている              | [ ]  |
| インターフェース準拠 | ISearchStrategy準拠         | [ ]  |
| エラーハンドリング   | Result型で統一              | [ ]  |
| 依存性注入           | constructor injectionで統一 | [ ]  |

### ドキュメント

| 項目               | 基準                           | 結果 |
| ------------------ | ------------------------------ | ---- |
| 要件定義書         | 全FR/NFRが定義されている       | [ ]  |
| 設計書             | クラス図・シーケンス図がある   | [ ]  |
| テスト仕様書       | 全テストケースが定義されている | [ ]  |
| カバレッジレポート | 基準達成が確認されている       | [ ]  |

---

## トレーサビリティマトリクス形式

```markdown
## トレーサビリティマトリクス

| 要件ID  | 要件概要               | 実装箇所                   | テストケース             | 結果 |
| ------- | ---------------------- | -------------------------- | ------------------------ | ---- |
| FR-001  | ISearchStrategy準拠    | GraphSearchStrategy class  | constructor tests        | [ ]  |
| FR-002  | localSearch実装        | localSearch()              | localSearch tests        | [ ]  |
| FR-003  | globalSearch実装       | globalSearch()             | globalSearch tests       | [ ]  |
| FR-004  | relationshipSearch実装 | relationshipSearch()       | relationshipSearch tests | [ ]  |
| FR-005  | queryType切り替え      | search()                   | search tests             | [ ]  |
| FR-006  | スコアリング           | calculateLocalScore() etc. | scoring tests            | [ ]  |
| FR-007  | フィルタ適用           | search() filters           | filter tests             | [ ]  |
| FR-008  | エラーハンドリング     | Result<T, Error>           | error handling tests     | [ ]  |
| NFR-001 | 応答時間 < 200ms       | -                          | performance tests        | [ ]  |
| NFR-002 | スコア 0-1範囲         | scoring functions          | scoring validation tests | [ ]  |
| NFR-003 | テストカバレッジ80%    | -                          | coverage report          | [ ]  |
| NFR-004 | 依存性注入パターン     | constructor                | DI tests                 | [ ]  |
```

---

## 最終判定基準

### PASS条件

以下のすべてを満たす場合、Phase 11へ進む:

1. 全成果物が存在する
2. コード品質チェックがすべてPASS
3. 設計品質チェックがすべてPASS
4. ドキュメントチェックがすべてPASS
5. トレーサビリティが100%

### FAIL時の対応

いずれかがFAILの場合:

1. 問題点を特定
2. 該当Phaseに戻って修正
3. 再度Phase 10でレビュー

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-strategy/phase-11-manual-test.md`
