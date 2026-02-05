# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                   |
| ------ | -------------------- |
| Phase  | 8                    |
| 機能名 | auth-session-refresh |
| 作成日 | 2026-02-05           |

## 目的

動作を変えずにコード品質を改善する。TokenRefreshSchedulerとauthSlice統合コードの可読性・保守性を向上させる。

## 実行タスク

- コードスメル検出: 重複コード、長いメソッド、不明確な命名の特定
- リファクタリング: コード構造の改善
- SOLID原則適用: 単一責務、依存性逆転の確認

## 参照資料

| 資料名               | パス                                        | 説明          |
| -------------------- | ------------------------------------------- | ------------- |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`    | Phase 2成果物 |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md` | Phase 5成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                                        | 内容                                |
| ------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 設計原則、パターン適用              |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | SOLID原則、リファクタリングパターン |

## リファクタリング観点

| 観点               | 確認項目                                                              |
| ------------------ | --------------------------------------------------------------------- |
| 命名               | クラス名・メソッド名・変数名が意図を明確に表現しているか              |
| 重複排除           | リトライロジックが共通ユーティリティとして抽出可能か                  |
| 責務分離           | TokenRefreshSchedulerの責務が単一か（スケジューリングのみ）           |
| エラーハンドリング | エラー処理が一貫しているか                                            |
| 定数外部化         | マジックナンバー（300000ms、3回、5000ms）が定数として定義されているか |
| テスタビリティ     | Date.now()などの外部依存がDI可能か                                    |

## 統合テスト連携【必須】

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test:run tokenRefreshScheduler.test.ts
pnpm --filter @repo/desktop test:run authSlice.test.ts
pnpm --filter @repo/desktop test:run
```

## 成果物

| 成果物               | パス                                 | 説明           |
| -------------------- | ------------------------------------ | -------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 変更内容の記録 |

## 完了条件

- [ ] テストが継続成功（全テストGreen）
- [ ] コード品質が改善されている
- [ ] マジックナンバーが定数として外部化されている
- [ ] 命名が明確である
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
pnpm --filter @repo/desktop test:run

# - [ ] リファクタリング後もテストが成功することを確認
```

## サブタスク管理

1. 参照資料の確認（Phase 5成果物、アーキテクチャ設計書）
2. コードスメル検出
3. リファクタリング実施
4. SOLID原則適用確認
5. テスト再実行（全テストGreen確認）
6. リファクタリング記録作成
7. 完了条件の検証

## タスク100%実行確認【必須】

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001 --phase 8
```

## 次のPhase

Phase 9: 品質保証
