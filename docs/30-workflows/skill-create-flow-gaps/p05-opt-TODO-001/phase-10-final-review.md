# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 10                                   |
| タスクID   | TASK-SW-TODO-001                     |
| 機能名     | conversation-round-step-todo-cleanup |
| 前提Phase  | Phase 9                              |
| 後続Phase  | Phase 11（PASS の場合）              |
| 作成日     | 2026-04-15                           |
| ステータス | 未実施                               |

## 目的

Phase 1〜9 の全成果物を総合的にレビューし、Phase 11（手動テスト）への進行可否を判定する。PASS / MINOR / MAJOR のいずれかを決定する。

## 実行タスク

- 全 Phase 成果物の確認
- 受け入れ基準（AC-1〜AC-3）の最終充足確認
- Phase 3 の MINOR 指摘事項の解決確認
- 変更の一貫性・完全性の確認
- 最終レビュー結果の記録

## 参照資料

| 資料名         | パス                                         | 用途                 |
| -------------- | -------------------------------------------- | -------------------- |
| Phase 1 成果物 | `outputs/phase-1/requirements-definition.md` | 要件・AC確認         |
| Phase 2 成果物 | `outputs/phase-2/design.md`                  | 設計確認             |
| Phase 3 成果物 | `outputs/phase-3/gate-decision.md`           | MINOR 追跡確認       |
| Phase 5 成果物 | `outputs/phase-5/implementation-summary.md`  | 実装確認             |
| Phase 7 成果物 | `outputs/phase-7/coverage-report.md`         | カバレッジ確認       |
| Phase 8 成果物 | `outputs/phase-8/refactoring-log.md`         | リファクタリング確認 |
| Phase 9 成果物 | `outputs/phase-9/quality-report.md`          | 品質保証確認         |

## 実行手順

### 1. 受け入れ基準の最終充足確認

**パターンA（TODOコメント削除）の場合**:

| AC ID | 受け入れ基準                                                         | 充足判定 |
| ----- | -------------------------------------------------------------------- | -------- |
| AC-1  | 旧 TODOコメントが `ConversationRoundStep.tsx` から削除されていること | -        |
| AC-2  | `MAIN_TOOL_BADGE_ENABLED` フラグが整理されていること                 | -        |
| AC-3  | `pnpm typecheck` が 0 error で通過すること                           | -        |

**パターンB（TODOコメント更新）の場合**:

| AC ID | 受け入れ基準                                                                                           | 充足判定 |
| ----- | ------------------------------------------------------------------------------------------------------ | -------- |
| AC-1  | 旧 TODO が現状に即した NOTE コメントへ更新されていること                                               | -        |
| AC-2  | 新コメントが `MAIN_TOOL_BADGE_ENABLED` フラグと `shouldShowMainToolBadge` の存在意義を明示していること | -        |
| AC-3  | `pnpm typecheck` が 0 error で通過すること                                                             | -        |

### 2. Phase 3 MINOR 指摘事項の解決確認

```
Phase 3 gate-decision.md の MINOR 追跡テーブルを参照し、全指摘が解決済みであることを確認する。
```

| MINOR ID                 | 指摘内容 | 解決Phase | 解決確認 |
| ------------------------ | -------- | --------- | -------- |
| （Phase 3 実行時に記録） | -        | -         | -        |

### 3. 変更の一貫性・完全性の確認

```bash
# 最終確認: 旧 TODOコメントが存在しないこと
grep -rn "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# 最終確認: 型チェック
pnpm --filter @repo/desktop typecheck

# 最終確認: 既存テスト
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

### 4. 最終レビュー判定基準

| 判定  | 条件                                                          | 次のアクション          |
| ----- | ------------------------------------------------------------- | ----------------------- |
| PASS  | AC-1〜AC-3 全充足・MINOR 全解決・型チェック PASS・テスト PASS | Phase 11 へ進む         |
| MINOR | 軽微な指摘事項あり（Phase 11 と並行解消可能）                 | Phase 11 へ進む（追跡） |
| MAJOR | AC 未充足・設計との不整合・テスト失敗                         | 該当 Phase へ戻る       |

**MAJOR 判定となる条件の例**:

- 旧 TODOコメントが残留している
- 型チェックまたは lint がエラー
- 既存テストが失敗
- 採用パターンと実装内容が不一致

**総合判定**: （実行時に PASS / MINOR / MAJOR を記録）

## 統合テスト連携【必須】

| 判定項目          | 基準 | 結果 |
| ----------------- | ---- | ---- |
| AC-1〜AC-3 全充足 | PASS | -    |
| 型チェック        | PASS | -    |
| 既存テスト全 PASS | PASS | -    |

## 多角的チェック観点

| 観点             | 確認内容                                                                           |
| ---------------- | ---------------------------------------------------------------------------------- |
| 完全性           | Phase 1〜9 の全成果物が揃っているか                                                |
| 一貫性           | 採用パターンが Phase 1〜9 を通じて一貫しているか                                   |
| トレーサビリティ | パターンBの場合、新コメントが将来の変更者に明確な指示を与えているか                |
| リスク           | マージ後に `resolveExternalIntegration` が変更された場合の影響が文書化されているか |

## 成果物

| 成果物           | パス                                      | 説明                        |
| ---------------- | ----------------------------------------- | --------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PASS/MINOR/MAJOR 判定・根拠 |

## 完了条件

- [ ] 全 Phase 成果物の確認が完了
- [ ] AC-1〜AC-3 の最終充足確認が完了
- [ ] Phase 3 MINOR 指摘事項の解決確認が完了
- [ ] 最終の型チェック・lint・テストが全 PASS
- [ ] 総合判定（PASS/MINOR/MAJOR）が記録されている
- [ ] 最終レビュー結果が作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 全 Phase 成果物の確認
2. AC-1〜AC-3 最終充足確認
3. Phase 3 MINOR 追跡テーブルの解決確認
4. 最終 grep / 型チェック / テスト実行
5. 総合判定記録
6. 最終レビュー結果の作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 11: 手動テスト（PASS または MINOR の場合）
該当 Phase へ戻る（MAJOR の場合）
