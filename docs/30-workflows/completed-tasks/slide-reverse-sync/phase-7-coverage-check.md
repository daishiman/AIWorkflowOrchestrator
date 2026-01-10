# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 7                    |
| Phase名    | テストカバレッジ確認 |
| 前提Phase  | Phase 6              |
| 後続Phase  | Phase 8              |
| ステータス | 未実施               |
| 作成日     | 2026-01-10           |
| 機能名     | slide-reverse-sync   |

---

## 目的

Phase 6で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。未達の場合はPhase 6へ戻る。

## 背景

カバレッジ基準はリファクタリング（Phase 8）に進む前のゲートとして機能する。基準を満たさない場合は、テスト拡充を継続する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: test-coverage

**パス**: `.claude/skills/test-coverage/SKILL.md`

**選定理由**: カバレッジ基準達成の最終確認を行うため。

**Trigger条件**:

- テストカバレッジの最終確認、ゲート判定を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. カバレッジ検証結果を出力

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` - カバレッジ再測定結果

---

## 参照資料

| 参照資料           | パス                                  | 内容          |
| ------------------ | ------------------------------------- | ------------- |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`  | Phase 6成果物 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md` | Phase 6成果物 |

### システム仕様（aiworkflow-requirements）

> カバレッジ基準は以下のシステム仕様を参照してください。

| 参照資料 | パス                                                                        | 内容                       |
| -------- | --------------------------------------------------------------------------- | -------------------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト戦略・カバレッジ基準 |

---

## カバレッジ基準

### ユニットテスト

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 結合テスト

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

---

## 成果物

| 成果物             | パス                                  | 内容               |
| ------------------ | ------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`  | 再測定結果         |
| 統合テスト結果     | `outputs/phase-7/integration-test.md` | 統合テスト実行結果 |

---

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| 判定項目                 | 基準 | 結果       |
| ------------------------ | ---- | ---------- |
| ユニットテストLine       | 80%+ | {{RESULT}} |
| ユニットテストBranch     | 60%+ | {{RESULT}} |
| ユニットテストFunction   | 80%+ | {{RESULT}} |
| 結合テストAPI            | 100% | {{RESULT}} |
| 結合テストシナリオ正常系 | 100% | {{RESULT}} |
| 結合テストシナリオ異常系 | 80%+ | {{RESULT}} |

---

## 実行手順

### 1. カバレッジ再測定

```bash
pnpm --filter @repo/desktop test:coverage
```

### 2. 統合テスト実行

```bash
pnpm --filter @repo/desktop test:integration
```

### 3. 未達の場合の対応

カバレッジ未達や統合テスト失敗がある場合、Phase 6へ戻って拡充する。

---

## 判定基準

| 判定 | 条件               | 次のアクション |
| ---- | ------------------ | -------------- |
| PASS | 全基準達成         | Phase 8へ進行  |
| FAIL | いずれかの基準未達 | Phase 6へ戻る  |

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（API 100%, シナリオ 100%/80%）
- [ ] 統合テストが全て成功
- [ ] Main/Renderer接続テストが成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. カバレッジ再測定
2. test-coverageスキルの実行
3. 統合テスト再実行
4. 判定結果の記録
5. 成果物の作成・配置
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] カバレッジ基準を達成
- [ ] 統合テストが全て成功
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-reverse-sync --phase 7
```

---

## スキルフィードバック記録（Phase完了後に記載）

```markdown
## Phase 7 実行記録

### 使用スキル

- test-coverage: {{result}}

### カバレッジ最終結果

- Line Coverage: {{VALUE}}% (基準: 80%)
- Branch Coverage: {{VALUE}}% (基準: 60%)
- Function Coverage: {{VALUE}}% (基準: 80%)

### 判定結果

- 判定: {{PASS/FAIL}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）

`docs/30-workflows/slide-reverse-sync/phase-8-refactoring.md`
