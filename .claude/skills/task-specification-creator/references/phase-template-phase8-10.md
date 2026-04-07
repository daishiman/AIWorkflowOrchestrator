# Phase Template Phase 8-10

> 親ファイル: [phase-templates.md](phase-templates.md)

## 対象

Phase 8（リファクタリング）、Phase 9（品質保証）、Phase 10（最終レビューゲート）。

---

## Phase 8: リファクタリング（TDD: Refactor）

```markdown
# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                 |
| ------ | ------------------ |
| Phase  | 8                  |
| 機能名 | {{FEATURE_NAME}}   |
| 作成日 | {{CREATED_DATE}}   |

## 目的

動作を変えずにコード品質を改善する。

## 実行タスク

- リファクタリング: コード構造の改善（重複排除、命名改善、構造整理）
- コードスメル検出: 問題のあるコードパターンの特定と修正
- SOLID原則適用: 設計原則に基づくコード改善

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm test
pnpm test:integration
pnpm test:e2e
```

## 完了条件

- [ ] テストが継続成功
- [ ] コード品質が改善されている
- [ ] 重複が排除されている
- [ ] 統合テストが継続成功
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## 次のPhase

Phase 9: 品質保証
```

---

## Phase 9: 品質保証

```markdown
# Phase 9: 品質保証

## メタ情報

| 項目   | 値                 |
| ------ | ------------------ |
| Phase  | 9                  |
| 機能名 | {{FEATURE_NAME}}   |
| 作成日 | {{CREATED_DATE}}   |

## 目的

定義された品質基準をすべて満たすことを検証する。

## 品質ゲート

- 機能検証: 自動テストの完全成功
- コード品質: Lint/型チェッククリア
- テスト網羅性: カバレッジ基準達成
- セキュリティ: 重大な脆弱性の不在

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目 | 確認内容 | 結果 |
| -------- | -------- | ---- |
| 機能検証 | 全自動テスト成功 | {{RESULT}} |
| 統合テスト | 全統合テスト成功 | {{RESULT}} |
| E2Eテスト | 全E2Eテスト成功 | {{RESULT}} |
| セキュリティ | 脆弱性スキャン通過 | {{RESULT}} |

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

## テスト実行コマンド（vitest v2）

> **注意**: `--testPathPattern` は vitest v2 で廃止済み。positional args を使用すること。

```bash
# 特定ファイルを指定（推奨）
pnpm --filter @repo/desktop exec vitest run src/path/to/target.test.ts

# ファイル名キーワードで絞り込む
pnpm --filter @repo/desktop exec vitest run --reporter=verbose TargetComponent

# 全テスト実行（non-watch）
pnpm --filter @repo/desktop exec vitest run

# 廃止（vitest v2 では無効）
# vitest run --testPathPattern="xxx"
```

## 完了条件

- [ ] 全品質ゲートをクリア
- [ ] セキュリティチェック完了
- [ ] 統合テスト結果が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

### IPC契約ドリフト検証【Phase 9 品質ゲート】

- [ ] `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` が exit 0 で完了する
- [ ] チャンネル孤児（R-01）の検出結果が妥当である
- [ ] 引数形式不一致（R-02）が存在しないことを確認する

## 次のPhase

Phase 10: 最終レビューゲート
```

---

## Phase 10: 最終レビューゲート

```markdown
# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値               |
| ------ | ---------------- |
| Phase  | 10               |
| 機能名 | {{FEATURE_NAME}} |
| 作成日 | {{CREATED_DATE}} |

## 目的

実装完了後、全体的な品質・整合性を検証する。

## 判定基準

| 判定     | 条件             | 対応                                   |
| -------- | ---------------- | -------------------------------------- |
| PASS     | 全観点で問題なし | Phase 11へ進行                         |
| MINOR    | 軽微な指摘あり   | 未完了タスクとして記録後Phase 11へ進行 |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて戻り先を決定           |
| CRITICAL | 致命的な問題あり | Phase 1へ戻りユーザーと要件を再確認    |

## 統合テスト連携【必須】

最終レビューで統合テスト結果を確認:

| レビュー項目 | 確認内容                  |
| ------------ | ------------------------- |
| 全テスト結果 | ユニット/統合/E2E全て成功 |
| カバレッジ   | 基準達成                  |
| 接続テスト   | フロント/バック接続成功   |

## 成果物

| 成果物       | パス                                      | 説明     |
| ------------ | ----------------------------------------- | -------- |
| レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果 |

## 完了条件

- [ ] 全レビュー観点で確認完了
- [ ] 判定結果が記録されている
- [ ] 統合テスト結果が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 11: 手動テスト検証
```

## 関連ガイド

- [phase-template-execution.md](phase-template-execution.md) — Phase 4-10 共通骨格
