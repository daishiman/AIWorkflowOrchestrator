# Phase 9: 品質保証

## メタ情報

| 項目   | 値                   |
| ------ | -------------------- |
| Phase  | 9                    |
| 機能名 | auth-session-refresh |
| 作成日 | 2026-02-05           |

## 目的

定義された品質基準をすべて満たすことを検証する。

## 品質ゲート

| ゲート項目   | 確認内容                           | 基準                   |
| ------------ | ---------------------------------- | ---------------------- |
| 機能検証     | 全自動テスト成功                   | 全テストGreen          |
| コード品質   | ESLint/Prettier/TypeScriptチェック | エラーゼロ             |
| テスト網羅性 | カバレッジ基準達成                 | Line 80%+, Branch 60%+ |
| セキュリティ | トークン非露出、暗号化保存         | 違反なし               |

## 参照資料

| 資料名         | パス                                 | 説明          |
| -------------- | ------------------------------------ | ------------- |
| 品質レポート   | `outputs/phase-7/coverage-report.md` | Phase 7成果物 |
| リファクタ記録 | `outputs/phase-8/refactoring-log.md` | Phase 8成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                       | 内容                             |
| -------------------- | -------------------------------------------------------------------------- | -------------------------------- |
| セキュリティ原則     | `.claude/skills/aiworkflow-requirements/references/security-principles.md` | トークン非露出、暗号化保存の検証 |
| 認証インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`     | AuthSession型、セキュリティ制約  |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`      | エラーコード、リトライ仕様の検証 |

## 実行手順

### ステップ1: 全テスト実行

```bash
pnpm --filter @repo/desktop test:run
```

### ステップ2: ESLint/TypeScriptチェック

```bash
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck
```

### ステップ3: セキュリティチェック

| チェック項目                                       | 期待結果                    | 結果       |
| -------------------------------------------------- | --------------------------- | ---------- |
| Rendererプロセスにトークンが露出していないこと     | sessionExpiresAtのみ        | {{RESULT}} |
| SecureStorageの暗号化が維持されていること          | safeStorage.encryptString() | {{RESULT}} |
| IPC通信でトークンがログ出力されていないこと        | expiresAtのみログ           | {{RESULT}} |
| withValidation()がauth:refreshに適用されていること | ハンドラーに適用            | {{RESULT}} |

## 統合テスト連携【必須】

| 品質項目     | 確認内容         | 結果       |
| ------------ | ---------------- | ---------- |
| 機能検証     | 全自動テスト成功 | {{RESULT}} |
| セキュリティ | トークン非露出   | {{RESULT}} |

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

## 完了条件

- [ ] 全テスト成功
- [ ] ESLint/TypeScriptエラーゼロ
- [ ] カバレッジ基準達成
- [ ] セキュリティチェック全項目PASS
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認（Phase 7-8成果物）
2. 全テスト実行
3. ESLint/TypeScriptチェック
4. セキュリティチェック
5. 品質レポート作成
6. 完了条件の検証

## タスク100%実行確認【必須】

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001 --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート
