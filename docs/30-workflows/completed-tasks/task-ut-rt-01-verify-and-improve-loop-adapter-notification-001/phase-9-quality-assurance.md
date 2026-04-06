# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                                             |
| ------ | -------------------------------------------------------------- |
| Phase  | 9                                                              |
| 機能名 | task-ut-rt-01-verify-and-improve-loop-adapter-notification-001 |
| 作成日 | 2026-04-06                                                     |

## 目的

実装・テスト・リファクタリングを経た成果物の総合品質を確認し、Phase 10（最終レビュー）に向けた準備を完了する。

## 実行タスク

- Task 9-1: 品質チェックリストの全項目実行
- Task 9-2: 統合テスト結果の確認
- Task 9-3: Phase 10 開始条件の確認

## 参照資料

| 資料名           | パス                                               | 説明                         |
| ---------------- | -------------------------------------------------- | ---------------------------- |
| Phase 8 成果物   | [phase-8-refactoring.md](phase-8-refactoring.md)   | リファクタリング後の状態確認 |
| Phase 1 受入基準 | [phase-1-requirements.md](phase-1-requirements.md) | AC-1〜AC-6 の参照            |

## 実行手順

### Step 1: Task 9-1 品質チェックリスト全項目実行

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト実行（全テスト）
pnpm --filter @repo/desktop test -- --testPathPattern="notification"
pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"

# Lint
pnpm lint
```

**チェックリスト**:

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過する
- [ ] T-VL-01〜07 が全て PASS する
- [ ] T-REG-01（既存テスト）がリグレッションなし
- [ ] `pnpm lint` がエラーなしで通過する

### Step 2: Task 9-2 統合テスト結果の確認

| テストカテゴリ     | 期待結果                  | 確認方法                                        |
| ------------------ | ------------------------- | ----------------------------------------------- |
| adapter エラー通知 | PASS（T-VL-01〜04）       | `pnpm test -- --testPathPattern="notification"` |
| リグレッション     | PASS（T-VL-05, T-REG-01） | 同上                                            |
| エッジケース拡充   | PASS（T-VL-06〜07）       | 同上                                            |

### Step 3: Task 9-3 Phase 10 開始条件確認

- [ ] 全品質チェックがクリア
- [ ] カバレッジ目標が達成されている（Phase 7 成果物確認）
- [ ] 実装・テスト・Lint が全てクリーンな状態

## 統合テスト連携【必須】

| 連携アクション               | 内容                                             |
| ---------------------------- | ------------------------------------------------ |
| 品質保証で統合テスト結果確認 | 全カテゴリの統合テストが PASS していることを確認 |

## 成果物

| 成果物                     | 配置先                                        |
| -------------------------- | --------------------------------------------- |
| 品質保証チェックリスト結果 | `outputs/phase-9/quality-assurance-report.md` |

## 完了条件

- [ ] typecheck エラーなし
- [ ] T-VL-01〜07 全て PASS
- [ ] T-REG-01 リグレッションなし
- [ ] lint エラーなし
- [ ] カバレッジ目標達成済み

## タスク100%実行確認【必須】

Phase 9 完了時に以下を確認すること:

- [ ] Task 9-1（品質チェックリスト全項目実行）を完全に実行した
- [ ] Task 9-2（統合テスト結果確認）を完全に実行した
- [ ] Task 9-3（Phase 10 開始条件確認）を完全に実行した

## 次Phase

→ [Phase 10: 最終レビューゲート](phase-10-final-review.md)

**Phase 9→10 の遷移条件**: 全品質チェックがクリアであること
