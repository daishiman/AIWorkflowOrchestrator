# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 9                                    |
| タスクID   | TASK-SW-TODO-001                     |
| 機能名     | conversation-round-step-todo-cleanup |
| 前提Phase  | Phase 8                              |
| 後続Phase  | Phase 10                             |
| 作成日     | 2026-04-15                           |
| ステータス | 未実施                               |

## 目的

実装・リファクタリング完了後の最終品質確認を行う。型チェック・lint・テスト・コードレビュー観点での総合的な品質保証を実施し、Phase 10 の最終レビューゲートへの進行可否を判断する。

## 実行タスク

- 型チェックの全件実行
- lint の全件実行
- 既存テストの全件実行
- コードレビュー観点でのセルフチェック
- 品質保証レポートの作成

## 参照資料

| 資料名                    | パス                                                                          | 用途                 |
| ------------------------- | ----------------------------------------------------------------------------- | -------------------- |
| Phase 5 成果物            | `outputs/phase-5/implementation-summary.md`                                   | 変更内容確認         |
| Phase 7 成果物            | `outputs/phase-7/coverage-report.md`                                          | カバレッジ確認       |
| Phase 8 成果物            | `outputs/phase-8/refactoring-log.md`                                          | リファクタリング記録 |
| ConversationRoundStep.tsx | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 品質確認対象         |

## 実行手順

### 1. 型チェック全件実行

```bash
# desktop パッケージの型チェック
pnpm --filter @repo/desktop typecheck

# 全パッケージの型チェック（必要に応じて）
pnpm typecheck
```

### 2. lint 全件実行

```bash
# desktop パッケージの lint
pnpm --filter @repo/desktop lint

# 必要に応じて全パッケージ
pnpm lint
```

### 3. 既存テスト全件実行

```bash
# ConversationRoundStep 関連テスト
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx

# desktop パッケージ全テスト
pnpm --filter @repo/desktop exec vitest run
```

### 4. セルフレビューチェックリスト

| 観点                                                    | 確認内容                   | 結果 |
| ------------------------------------------------------- | -------------------------- | ---- |
| TODOコメントの整理が AC-1〜AC-3 を充足しているか        | 受け入れ基準との照合       | -    |
| パターンA: 旧 TODOコメントが完全に削除されているか      | grep で0件確認             | -    |
| パターンB: 新コメントが削除条件を明確に示しているか     | 内容の目視確認             | -    |
| `shouldShowMainToolBadge` の動作が変化していないか      | ロジック変更なし           | -    |
| `resolveExternalIntegration` との整合が維持されているか | 主ツール参照ロジックの一致 | -    |
| 不要なコード（残留した TODO・フラグ参照）がないか       | grep / コードレビュー      | -    |
| 型チェック PASS                                         | 0 error                    | -    |
| lint PASS                                               | 0 error                    | -    |
| 既存テスト全 PASS                                       | PASS                       | -    |

### 5. 品質総合判定

| 判定 | 条件                           | 次のアクション    |
| ---- | ------------------------------ | ----------------- |
| PASS | 全チェック項目が合格           | Phase 10 へ進む   |
| FAIL | いずれかのチェック項目が未合格 | 該当 Phase へ戻る |

**総合判定**: （実行時に PASS / FAIL を記録）

## 統合テスト連携【必須】

| 判定項目          | 基準    | 結果 |
| ----------------- | ------- | ---- |
| 型チェック        | PASS    | -    |
| lint              | 0 error | -    |
| 既存テスト全 PASS | PASS    | -    |

## 多角的チェック観点

| 観点     | 確認内容                                             |
| -------- | ---------------------------------------------------- |
| 矛盾     | 採用パターンと実際の変更内容が一致しているか         |
| 漏れ     | 品質保証のチェック項目に抜けがないか                 |
| 整合性   | Phase 3 の MINOR 指摘事項が全て解決されているか      |
| 依存関係 | 他の skill-create-flow-gaps タスクへの悪影響がないか |

## 成果物

| 成果物           | パス                                | 説明                         |
| ---------------- | ----------------------------------- | ---------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | チェック結果・総合判定・根拠 |

## 完了条件

- [ ] 型チェック（`pnpm typecheck`）が PASS
- [ ] lint（`pnpm lint`）が 0 error
- [ ] 既存テストが全 PASS
- [ ] セルフレビューチェックリスト（9項目）が全て合格
- [ ] 総合判定（PASS）が記録されている
- [ ] 品質保証レポートが作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 型チェック全件実行
2. lint 全件実行
3. 既存テスト全件実行
4. セルフレビューチェックリスト記録
5. 総合判定記録
6. 品質保証レポート作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 10: 最終レビューゲート
