# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 6                        |
| Phase名    | テスト拡充               |
| 前提Phase  | Phase 5                  |
| 後続Phase  | Phase 7                  |
| ステータス | 未実施                   |
| 作成日     | 2026-01-07               |
| 機能名     | chat-multi-llm-switching |

---

## 目的

Phase 5の実装完了後、リファクタリングに進む前にテストを拡充し、カバレッジ目標を達成する。

## 背景

追加テストによりカバレッジ目標を達成し、フロントエンド・バックエンド統合テストを拡充することで、接続不良による不具合を事前に防止する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: frontend-testing

**パス**: `.claude/skills/frontend-testing/SKILL.md`

**Trigger条件**:
UIコンポーネントのテスト拡充が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-6/frontend-test-report.md`
- `packages/ui/src/**/*.test.tsx`（追加テスト）

---

### スキル2: boundary-value-analysis

**パス**: `.claude/skills/boundary-value-analysis/SKILL.md`

**Trigger条件**:
境界値テストの追加が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-6/boundary-test-cases.md`

---

## 参照資料

| 参照資料      | パス                                        | 内容         |
| ------------- | ------------------------------------------- | ------------ |
| Phase 4成果物 | `outputs/phase-4/test-specification.md`     | テスト仕様書 |
| Phase 5成果物 | `outputs/phase-5/implementation-summary.md` | 実装サマリー |

---

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料   | パス                                                                 | 内容       |
| ---------- | -------------------------------------------------------------------- | ---------- |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/test-strategy.md` | テスト方針 |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "test"`

---

## 成果物

| 成果物                 | パス                                      | 内容                           |
| ---------------------- | ----------------------------------------- | ------------------------------ |
| カバレッジレポート     | `outputs/phase-6/coverage-report.md`      | テストカバレッジ結果           |
| 統合テスト結果         | `outputs/phase-6/integration-test.md`     | 統合テスト実行結果             |
| フロントテストレポート | `outputs/phase-6/frontend-test-report.md` | UIテスト結果                   |
| 追加テストコード       | `packages/*/src/**/*.test.ts`             | 追加テスト（プロジェクト配置） |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 6の統合テスト連携アクション**: 統合テストの拡充（全カテゴリのカバレッジ向上）

### 統合テスト拡充【必須】

| テストカテゴリ     | 検証項目                                        |
| ------------------ | ----------------------------------------------- |
| API接続テスト      | エンドポイント疎通・レスポンス形式              |
| データフローテスト | フロント→API→LLM→API→フロントの往復             |
| エラーハンドリング | API障害時のフロントエンド表示・リトライ         |
| 認証連携テスト     | APIキー検証・リフレッシュ・期限切れ処理         |
| 状態同期テスト     | LLM切り替え後の会話履歴・システムプロンプト維持 |

---

## テストカバレッジ基準

### ユニットテストカバレッジ

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 結合テストカバレッジ

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

---

## 実行コマンド

```bash
# ユニットテストカバレッジ確認
pnpm test:coverage

# 統合テスト実行
pnpm test:integration

# E2Eテスト実行
pnpm test:e2e
```

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（または達成に向けた追加完了）
- [ ] 結合テストカバレッジ基準を達成（または達成に向けた追加完了）
- [ ] 統合テストの追加が完了している
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
2. frontend-testingスキルの実行
3. boundary-value-analysisスキルの実行
4. 統合テスト連携の実施（全カテゴリのカバレッジ向上）
5. 成果物の作成・配置
6. カバレッジ確認
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/chat-multi-llm-switching --phase 6
```

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 6 実行記録

### 使用スキル

- frontend-testing: {{result}}
- boundary-value-analysis: {{result}}

### カバレッジ状況

- Line Coverage: {{percentage}}%
- Branch Coverage: {{percentage}}%
- Function Coverage: {{percentage}}%

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

`docs/30-workflows/chat-multi-llm-switching/phase-7-coverage-check.md`
