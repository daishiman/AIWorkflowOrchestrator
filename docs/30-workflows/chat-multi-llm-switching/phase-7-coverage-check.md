# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 7                        |
| Phase名    | カバレッジ確認           |
| 前提Phase  | Phase 6                  |
| 後続Phase  | Phase 8                  |
| ステータス | 未実施                   |
| 作成日     | 2026-01-07               |
| 機能名     | chat-multi-llm-switching |

---

## 目的

Phase 6の拡充結果を検証し、カバレッジ基準を満たすまでゲートとして確認する。

## 背景

ユニットテスト・結合テストのカバレッジ達成確認を行い、未達の場合はPhase 6へ戻りテスト拡充を行う。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: flaky-test-prevention

**パス**: `.claude/skills/flaky-test-prevention/SKILL.md`

**Trigger条件**:
テストの安定性確認が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-7/test-stability-report.md`

---

## 参照資料

| 参照資料      | パス                                  | 内容               |
| ------------- | ------------------------------------- | ------------------ |
| Phase 6成果物 | `outputs/phase-6/coverage-report.md`  | カバレッジレポート |
| Phase 6成果物 | `outputs/phase-6/integration-test.md` | 統合テスト結果     |

---

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料   | パス                                                                 | 内容       |
| ---------- | -------------------------------------------------------------------- | ---------- |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/test-strategy.md` | テスト方針 |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "coverage"`

---

## 成果物

| 成果物               | パス                                       | 内容                 |
| -------------------- | ------------------------------------------ | -------------------- |
| カバレッジ検証結果   | `outputs/phase-7/coverage-verification.md` | カバレッジゲート結果 |
| テスト安定性レポート | `outputs/phase-7/test-stability-report.md` | フレーキーテスト確認 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 7の統合テスト連携アクション**: 統合テストの再実行とゲート判定

具体的な確認項目:

- [ ] 全統合テストが成功している
- [ ] フレーキーテストがない
- [ ] カバレッジ基準を達成している

---

## カバレッジゲート判定

### ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 判定 |
| ----------------- | -------- | -------- | ---- |
| Line Coverage     | 80%      | 90%      | [ ]  |
| Branch Coverage   | 60%      | 70%      | [ ]  |
| Function Coverage | 80%      | 90%      | [ ]  |

### 結合テストカバレッジ基準

| 指標                         | 目標 | 判定 |
| ---------------------------- | ---- | ---- |
| APIエンドポイント            | 100% | [ ]  |
| モジュール間インターフェース | 100% | [ ]  |
| 正常系シナリオ               | 100% | [ ]  |
| 異常系シナリオ               | 80%+ | [ ]  |
| 外部連携ポイント             | 100% | [ ]  |

### 戻り判定

| 状態     | アクション                        |
| -------- | --------------------------------- |
| 基準達成 | Phase 8（リファクタリング）へ進む |
| 基準未達 | Phase 6（テスト拡充）へ戻る       |

---

## 実行コマンド

```bash
# カバレッジ確認
pnpm test:coverage

# 統合テスト再実行
pnpm test:integration

# カバレッジレポート出力
pnpm test:coverage --reporter=html
```

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（API 100%, シナリオ 100%/80%）
- [ ] 統合テストが全て成功
- [ ] フロントエンド・バックエンド接続テストが成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. flaky-test-preventionスキルの実行
3. 統合テスト連携の実施（統合テスト再実行・ゲート判定）
4. カバレッジ測定・分析
5. 成果物の作成・配置
6. ゲート判定（基準達成/未達）
7. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/chat-multi-llm-switching --phase 7
```

---

## 依存関係

- **前提**: Phase 6 が完了していること
- **後続**: Phase 8 へ進む（基準達成時）、Phase 6 へ戻る（未達時）

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

### 使用スキル

- flaky-test-prevention: {{result}}

### カバレッジ判定結果

- Line Coverage: {{percentage}}% (基準: 80%+) → {{PASS/FAIL}}
- Branch Coverage: {{percentage}}% (基準: 60%+) → {{PASS/FAIL}}
- Function Coverage: {{percentage}}% (基準: 80%+) → {{PASS/FAIL}}

### ゲート判定

- 結果: {{PASS/戻り（Phase 6）}}

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

`docs/30-workflows/chat-multi-llm-switching/phase-8-refactoring.md`
