# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 6                  |
| Phase名    | テスト拡充         |
| 前提Phase  | Phase 5            |
| 後続Phase  | Phase 7            |
| ステータス | 未実施             |
| 作成日     | 2026-01-10         |
| 機能名     | slide-reverse-sync |

---

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。統合テストを充実させ、フロント・バックエンド接続の品質を確保する。

## 背景

Phase 4で作成した基本テストに加え、追加のユニットテスト・統合テスト・E2Eテストを作成し、カバレッジ基準を達成する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: test-coverage

**パス**: `.claude/skills/test-coverage/SKILL.md`

**選定理由**: カバレッジ分析と不足テストの特定を行うため。

**Trigger条件**:

- テストカバレッジの分析、カバレッジギャップの特定を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. カバレッジ分析結果を出力

**期待される成果物**:

- `outputs/phase-6/coverage-report.md` - カバレッジ分析結果

---

### スキル2: integration-testing

**パス**: `.claude/skills/integration-testing/SKILL.md`

**選定理由**: 統合テストの拡充を行うため。

**Trigger条件**:

- 統合テストの拡充、コンポーネント間連携の追加検証を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 追加統合テストを作成

**期待される成果物**:

- `outputs/phase-6/integration-test.md` - 統合テスト実行結果
- 追加テストファイル（プロジェクトディレクトリに配置）

---

## 参照資料

| 参照資料       | パス                                         | 内容          |
| -------------- | -------------------------------------------- | ------------- |
| テスト仕様     | `outputs/phase-4/test-specification.md`      | Phase 4成果物 |
| 統合テスト設計 | `outputs/phase-4/integration-test-design.md` | Phase 4成果物 |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md`  | Phase 5成果物 |

### システム仕様（aiworkflow-requirements）

> テスト設計時に以下のシステム仕様を参照してください。

| 参照資料 | パス                                                                        | 内容       |
| -------- | --------------------------------------------------------------------------- | ---------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト戦略 |

---

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

---

## 成果物

| 成果物             | パス                                       | 内容               |
| ------------------ | ------------------------------------------ | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`       | カバレッジ分析結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`      | 統合テスト実行結果 |
| テストファイル     | `apps/desktop/src/main/slide/**/*.test.ts` | 追加テストコード   |

**注意**: テストファイル（コード成果物）は `outputs/` ではなくプロジェクトディレクトリに配置すること。

---

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ       | 検証項目                              | 目標 |
| -------------------- | ------------------------------------- | ---- |
| ファイル監視テスト   | 複数ファイル監視、イベント重複排除    | 100% |
| 同期フローテスト     | 正常系・異常系の往復フロー            | 100% |
| エラーハンドリング   | Agent API障害、タイムアウト、リトライ | 80%+ |
| 無限ループ防止テスト | TTL動作、双方向マーキング             | 100% |
| 状態同期テスト       | 同期中/成功/失敗状態の通知            | 100% |

---

## 実行手順

### 1. カバレッジ測定

```bash
pnpm --filter @repo/desktop test:coverage
```

### 2. ギャップ分析

- 未到達の行/分岐/関数を特定
- 統合テスト不足領域を特定

### 3. 追加テスト作成

- ユニット/統合の不足分を追加
- エラーケースを優先

### 4. 統合テスト再実行

```bash
pnpm --filter @repo/desktop test:integration
```

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（API 100%, シナリオ 100%/80%）
- [ ] 統合テストの追加が完了している
- [ ] Main/Renderer接続テストが成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 現在のカバレッジ測定
2. test-coverageスキルの実行
3. ギャップ分析
4. 追加ユニットテストの作成
5. integration-testingスキルの実行
6. 追加統合テストの作成
7. 統合テスト再実行
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] カバレッジ基準を達成
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-reverse-sync --phase 6
```

---

## スキルフィードバック記録（Phase完了後に記載）

```markdown
## Phase 6 実行記録

### 使用スキル

- test-coverage: {{result}}
- integration-testing: {{result}}

### カバレッジ結果

- Line Coverage: {{VALUE}}%
- Branch Coverage: {{VALUE}}%
- Function Coverage: {{VALUE}}%

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 7: テストカバレッジ確認

`docs/30-workflows/slide-reverse-sync/phase-7-coverage-check.md`
