# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 7                              |
| Phase名    | テストカバレッジ確認           |
| 前提Phase  | Phase 6                        |
| 後続Phase  | Phase 8                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-07                     |
| 機能名     | CONV-06-05-relation-extraction |

---

## 目的

Phase 6のテスト拡充結果を検証し、カバレッジ基準を満たすことを確認するゲート。

## 背景

テストカバレッジはコード品質の重要な指標。基準未達の場合はPhase 6に戻り、追加テストを作成する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: test-coverage-analysis

**パス**: `.claude/skills/test-coverage-analysis/SKILL.md`

**Trigger条件**: カバレッジ分析が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. カバレッジレポートを分析
3. 基準達成を確認

---

### スキル2: integration-testing

**パス**: `.claude/skills/integration-testing/SKILL.md`

**Trigger条件**: 統合テストの実行と検証が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 統合テストを実行
3. 結果を検証

---

## 参照資料

| 参照資料      | パス                                  | 内容               |
| ------------- | ------------------------------------- | ------------------ |
| Phase 6成果物 | `outputs/phase-6/coverage-report.md`  | カバレッジ測定結果 |
| Phase 6成果物 | `outputs/phase-6/integration-test.md` | 統合テスト結果     |

---

## 成果物

| 成果物             | パス                                  | 内容               |
| ------------------ | ------------------------------------- | ------------------ |
| カバレッジ検証結果 | `outputs/phase-7/coverage-report.md`  | 検証結果と判定     |
| 統合テスト結果     | `outputs/phase-7/integration-test.md` | 統合テスト実行結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

Phase 7では以下の統合テスト連携アクションを実施:

- [ ] 統合テストの再実行とゲート判定
- [ ] エンティティ抽出サービスとの連携テスト確認
- [ ] ExtractionPipelineとの統合テスト確認

---

## カバレッジ基準

### ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 現在値 | 判定 |
| ----------------- | -------- | -------- | ------ | ---- |
| Line Coverage     | 80%      | 90%      | -      | -    |
| Branch Coverage   | 60%      | 70%      | -      | -    |
| Function Coverage | 80%      | 90%      | -      | -    |

### 結合テストカバレッジ基準

| 指標                         | 目標 | 現在値 | 判定 |
| ---------------------------- | ---- | ------ | ---- |
| APIエンドポイント            | 100% | -      | -    |
| モジュール間インターフェース | 100% | -      | -    |
| 正常系シナリオ               | 100% | -      | -    |
| 異常系シナリオ               | 80%+ | -      | -    |
| 外部連携ポイント             | 100% | -      | -    |

---

## 検証手順

### 1. ユニットテストカバレッジ測定

```bash
# カバレッジ計測
pnpm --filter @repo/shared test:coverage

# 結果確認
cat coverage/lcov-report/index.html
```

### 2. 統合テスト実行

```bash
# 統合テスト実行
pnpm --filter @repo/shared test:run -- --grep "統合"
```

### 3. 判定

| 判定 | 条件                 | 次のアクション |
| ---- | -------------------- | -------------- |
| PASS | 全基準を達成         | Phase 8へ進行  |
| FAIL | いずれかの基準が未達 | Phase 6へ戻る  |

---

## ゲート判定チェックリスト

### ユニットテスト

- [ ] Line Coverage ≥ 80%
- [ ] Branch Coverage ≥ 60%
- [ ] Function Coverage ≥ 80%
- [ ] 全テストが成功

### 統合テスト

- [ ] IRelationExtractor.extract のテストが成功
- [ ] IRelationExtractor.extractBatch のテストが成功
- [ ] IRelationExtractor.mergeRelations のテストが成功
- [ ] ExtractionPipeline統合テストが成功

### フラッキーテスト確認

- [ ] 同じテストを3回実行して全て成功
- [ ] LLMモックが安定して動作

---

## 未達時の対応

カバレッジ基準未達の場合:

1. 未カバーのコードパスを特定
2. 追加テストケースを設計
3. Phase 6に戻りテストを追加
4. 再度Phase 7で検証

```bash
# カバレッジレポートで未カバー箇所を確認
pnpm --filter @repo/shared test:coverage -- --reporter=text-summary
```

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成
- [ ] 統合テストが全て成功
- [ ] フラッキーテストがない
- [ ] カバレッジレポートが出力されている
- [ ] 統合テスト連携アクションが完了している
- [ ] 本Phase内の全作業を100%完了

---

## Phase末端アクション【必須】

- [ ] カバレッジ検証が完了している
- [ ] 判定結果が記録されている
- [ ] 未達の場合はPhase 6への戻りが記録されている

---

## 依存関係

- **前提**: Phase 5, 6 が完了していること
- **後続**: Phase 8（リファクタリング）へ進む

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 使用スキルの実行（各スキルごとに1タスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/CONV-06-05-relation-extraction --phase 7
```

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

### カバレッジ結果

- Line Coverage: [数値]%
- Branch Coverage: [数値]%
- Function Coverage: [数値]%

### 判定

- ゲート判定: [PASS/FAIL]
- 戻り回数: [数値]

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

`docs/30-workflows/CONV-06-05-relation-extraction/phase-8-refactoring.md`
