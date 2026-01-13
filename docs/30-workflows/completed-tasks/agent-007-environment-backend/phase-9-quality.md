# Phase 9: 品質保証

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 9                             |
| 機能名 | agent-007-environment-backend |
| 作成日 | 2026-01-13                    |

## 目的

定義された品質基準をすべて満たすことを検証する。

## 実行タスク

- 機能検証: 自動テストの完全成功
- コード品質: Lint/型チェッククリア
- テスト網羅性: カバレッジ基準達成
- セキュリティ: 重大な脆弱性の不在

## 参照資料

| 資料名             | パス                                     | 説明          |
| ------------------ | ---------------------------------------- | ------------- |
| リファクタ記録     | `outputs/phase-8/refactoring-log.md`     | Phase 8成果物 |
| コード品質レポート | `outputs/phase-8/code-quality-report.md` | Phase 8成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                           | 内容             |
| ---------------- | ------------------------------------------------------------------------------ | ---------------- |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 品質基準         |
| セキュリティ実装 | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | セキュリティ要件 |

## 品質ゲート

### 機能検証

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 統合テスト
pnpm --filter @repo/desktop test:integration
```

| 検証項目       | 基準     | 結果 |
| -------------- | -------- | ---- |
| ユニットテスト | 全件PASS |      |
| 統合テスト     | 全件PASS |      |

### コード品質

```bash
# Lint
pnpm --filter @repo/desktop lint

# 型チェック
pnpm --filter @repo/desktop typecheck
```

| 検証項目         | 基準 | 結果 |
| ---------------- | ---- | ---- |
| ESLintエラー     | 0件  |      |
| TypeScriptエラー | 0件  |      |
| Prettierエラー   | 0件  |      |

### テスト網羅性

| 指標              | 基準 | 結果 |
| ----------------- | ---- | ---- |
| Line Coverage     | 80%+ |      |
| Branch Coverage   | 60%+ |      |
| Function Coverage | 80%+ |      |

### セキュリティ

| 検証項目                   | 基準               | 結果 |
| -------------------------- | ------------------ | ---- |
| XSS対策                    | DOMPurify設定確認  |      |
| 一時ファイルパーミッション | 0o600              |      |
| 入力バリデーション         | 全入力に対して実施 |      |

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目     | 確認内容         | 結果 |
| ------------ | ---------------- | ---- |
| 機能検証     | 全自動テスト成功 |      |
| 統合テスト   | 全統合テスト成功 |      |
| セキュリティ | XSS対策確認済み  |      |

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

## 完了条件

- [ ] 全テストがPASS
- [ ] ESLintエラーなし
- [ ] TypeScriptエラーなし
- [ ] カバレッジ基準達成
- [ ] セキュリティチェック完了
- [ ] 統合テスト結果が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 機能検証（テスト実行）
2. コード品質（Lint/型チェック）
3. テスト網羅性確認
4. セキュリティチェック
5. 統合テスト結果確認
6. 品質レポート作成
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-007-environment-backend --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート
