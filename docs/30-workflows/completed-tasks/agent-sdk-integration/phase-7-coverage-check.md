# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase番号  | 7                                  |
| Phase名    | テストカバレッジ確認               |
| 目的       | カバレッジ目標検証・統合テスト実行 |
| 前提Phase  | Phase 6（テスト拡充）              |
| 後続Phase  | Phase 8（リファクタリング）        |
| ステータス | 未実施                             |

---

## 目的

Phase 6の拡充結果を検証し、カバレッジ基準を満たすまでゲートとして確認する。

---

## 使用スキル

| スキル名         | パス                                       | 選定理由                                    |
| ---------------- | ------------------------------------------ | ------------------------------------------- |
| tdd-principles   | `.claude/skills/tdd-principles/SKILL.md`   | カバレッジ検証（Trigger: TDD、テスト）      |
| metrics-tracking | `.claude/skills/metrics-tracking/SKILL.md` | メトリクス追跡（Trigger: メトリクス、計測） |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

---

## 成果物

| 成果物                 | 説明               | 配置先                                       |
| ---------------------- | ------------------ | -------------------------------------------- |
| カバレッジ検証レポート | 最終カバレッジ状況 | `outputs/phase-7/coverage-verification.md`   |
| 統合テスト実行結果     | 統合テスト結果     | `outputs/phase-7/integration-test-report.md` |
| ゲート判定結果         | Phase通過可否      | `outputs/phase-7/gate-decision.md`           |

---

## 実行手順

### Step 1: ユニットテストカバレッジ検証

```bash
# カバレッジレポート生成
pnpm --filter @repo/shared test:coverage
```

**ユニットテストカバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 | 実績 | 判定 |
| ----------------- | -------- | -------- | ---- | ---- |
| Line Coverage     | 80%      | 90%      | TBD  | TBD  |
| Branch Coverage   | 60%      | 70%      | TBD  | TBD  |
| Function Coverage | 80%      | 90%      | TBD  | TBD  |

### Step 2: 結合テストカバレッジ検証

```bash
# 統合テスト実行
pnpm --filter @repo/desktop test:integration
```

**結合テストカバレッジ基準**:

| 指標                         | 目標 | 実績 | 判定 |
| ---------------------------- | ---- | ---- | ---- |
| APIエンドポイント            | 100% | TBD  | TBD  |
| モジュール間インターフェース | 100% | TBD  | TBD  |
| 正常系シナリオ               | 100% | TBD  | TBD  |
| 異常系シナリオ               | 80%+ | TBD  | TBD  |
| 外部連携ポイント             | 100% | TBD  | TBD  |

### Step 3: 統合テスト実行

すべての統合テストを実行し、結果を確認する。

**統合テスト結果**:

| テストカテゴリ       | 件数 | 成功 | 失敗 | スキップ |
| -------------------- | ---- | ---- | ---- | -------- |
| IPC通信テスト        | TBD  | TBD  | TBD  | TBD      |
| Agent SDK接続テスト  | TBD  | TBD  | TBD  | TBD      |
| エラーハンドリング   | TBD  | TBD  | TBD  | TBD      |
| セッション管理テスト | TBD  | TBD  | TBD  | TBD      |

### Step 4: ゲート判定

**判定基準**:

| 判定 | 条件                           | 対応                    |
| ---- | ------------------------------ | ----------------------- |
| PASS | 全基準達成・全テスト成功       | Phase 8へ進む           |
| FAIL | カバレッジ未達またはテスト失敗 | Phase 6へ戻りテスト拡充 |

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（API 100%, シナリオ 100%/80%）
- [ ] 統合テストが全て成功
- [ ] フロントエンド・バックエンド接続テストが成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## 統合テスト連携

統合テストの再実行とゲート判定:

- [ ] 全統合テストの実行
- [ ] テスト結果の集計
- [ ] ゲート判定の実施
- [ ] 未達の場合はPhase 6へ差し戻し

---

## システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                  | 内容                    |
| -------------- | --------------------------------------------------------------------- | ----------------------- |
| interfaces-llm | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md` | LLMインターフェース仕様 |

---

## スキルフィードバック記録

| スキル           | 結果    | 備考              |
| ---------------- | ------- | ----------------- |
| tdd-principles   | pending | Phase完了後に記録 |
| metrics-tracking | pending | Phase完了後に記録 |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. tdd-principlesスキルの実行
3. metrics-trackingスキルの実行
4. 統合テスト連携の実施
5. カバレッジ検証の実施
6. 成果物の作成・配置
7. ゲート判定の実施
8. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-sdk-integration --phase 7
```

---

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）

---

## 備考

- カバレッジ未達の場合はPhase 6へ戻り追加テストを行う
- 全テスト成功が必須条件
