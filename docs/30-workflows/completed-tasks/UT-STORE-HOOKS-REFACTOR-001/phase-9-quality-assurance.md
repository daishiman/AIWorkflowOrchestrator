# Phase 9: 品質保証

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 9                           |
| 機能名 | UT-STORE-HOOKS-REFACTOR-001 |
| 作成日 | 2026-02-11                  |

## 目的

定義された品質基準をすべて満たすことを検証する。Lint/型チェッククリア、ESLint exhaustive-deps警告なし、全自動テスト成功を確認する。

## 品質ゲート

| ゲート項目     | 基準                           | 必達 |
| -------------- | ------------------------------ | ---- |
| 機能検証       | 全自動テスト成功               | 必須 |
| コード品質     | Lint/型チェッククリア          | 必須 |
| Hooks警告      | ESLint exhaustive-deps警告なし | 必須 |
| テスト網羅性   | カバレッジ基準達成             | 必須 |
| 無限ループ防止 | useEffect依存配列が正しいこと  | 必須 |

## 実行タスク

- Lint検証: ESLint全体チェック（exhaustive-deps含む）
- 型チェック: TypeScript型チェック
- テスト実行: 全自動テストの実行
- セキュリティ確認: 重大な脆弱性の不在確認

## 参照資料

| 資料名               | パス                                 | 説明          |
| -------------------- | ------------------------------------ | ------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | Phase 8成果物 |
| コード品質ルール     | `.claude/rules/02-code-quality.md`   | 品質基準      |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md` | 注意事項      |

## 実行手順

### 1. Lint検証

```bash
# ESLint全体チェック
pnpm --filter @repo/desktop lint

# exhaustive-deps警告の確認（警告0件が期待値）
pnpm --filter @repo/desktop lint 2>&1 | grep -c "exhaustive-deps" || echo "警告なし"
```

### 2. 型チェック

```bash
# TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# 共有パッケージも含めた型チェック
pnpm typecheck
```

### 3. 全自動テスト実行

```bash
# 単体テスト
pnpm --filter @repo/desktop test

# 統合テスト
pnpm --filter @repo/desktop test -- --grep "integration"

# カバレッジ付きテスト
pnpm --filter @repo/desktop test:coverage
```

### 4. 無限ループ検証

手動確認項目:

| 確認項目                   | 方法                                       | 期待結果         |
| -------------------------- | ------------------------------------------ | ---------------- |
| SettingsView無限ループ     | 設定画面を開いてDevToolsでレンダー回数確認 | 1-2回で安定      |
| AgentView無限ループ        | エージェント画面を開いてレンダー回数確認   | 1-2回で安定      |
| LLMSelector無限ループ      | LLM選択を変更してレンダー回数確認          | 変更時のみ再描画 |
| AuthModeSelector無限ループ | 認証モード変更時のレンダー回数確認         | 変更時のみ再描画 |

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目        | 確認内容                               | 結果       |
| --------------- | -------------------------------------- | ---------- |
| 機能検証        | 全自動テスト成功                       | {{RESULT}} |
| 統合テスト      | モジュール間インターフェーステスト成功 | {{RESULT}} |
| Lint            | ESLintエラー/警告なし                  | {{RESULT}} |
| 型チェック      | TypeScriptエラーなし                   | {{RESULT}} |
| exhaustive-deps | 警告0件                                | {{RESULT}} |
| 無限ループ      | 発生しないことを確認                   | {{RESULT}} |

## 品質チェックリスト

### Lint/型チェック

| #   | 項目                     | 確認 |
| --- | ------------------------ | ---- |
| 1   | ESLintエラーが0件        | [ ]  |
| 2   | ESLint警告が許容範囲内   | [ ]  |
| 3   | exhaustive-deps警告が0件 | [ ]  |
| 4   | TypeScriptエラーが0件    | [ ]  |
| 5   | any型の使用がない        | [ ]  |

### テスト

| #   | 項目                                | 確認 |
| --- | ----------------------------------- | ---- |
| 1   | 全単体テストがパス                  | [ ]  |
| 2   | 全統合テストがパス                  | [ ]  |
| 3   | カバレッジ基準達成（Line 80%+）     | [ ]  |
| 4   | カバレッジ基準達成（Branch 60%+）   | [ ]  |
| 5   | カバレッジ基準達成（Function 80%+） | [ ]  |

### セキュリティ

| #   | 項目                               | 確認 |
| --- | ---------------------------------- | ---- |
| 1   | 機密情報のログ出力がない           | [ ]  |
| 2   | 入力検証が適切                     | [ ]  |
| 3   | 状態管理に機密情報が露出していない | [ ]  |

## 成果物

| 成果物       | パス                                | 説明             |
| ------------ | ----------------------------------- | ---------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果一覧 |
| Lintレポート | `outputs/phase-9/lint-report.md`    | Lint実行結果     |
| テスト結果   | `outputs/phase-9/test-report.md`    | テスト実行結果   |

## 完了条件

- [ ] ESLintエラー/警告が0件（またはexhaustive-deps以外の既知の警告のみ）
- [ ] exhaustive-deps警告が0件
- [ ] TypeScriptエラーが0件
- [ ] 全自動テストが成功
- [ ] カバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 無限ループが発生しないことを確認
- [ ] 品質レポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Lint検証実行
3. 型チェック実行
4. 全自動テスト実行
5. 無限ループ検証（手動）
6. 成果物の作成・配置
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001 --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート
