# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                                             |
| ------ | -------------------------------------------------------------- |
| Phase  | 8                                                              |
| 機能名 | task-ut-rt-01-verify-and-improve-loop-adapter-notification-001 |
| 作成日 | 2026-04-06                                                     |

## 目的

実装した通知コードの品質を確認し、将来の保守性を考慮した整理を行う。ただし本タスクでは最小変更を方針としているため、リファクタリングの範囲は限定的である。

## 実行タスク

- Task 8-1: 通知パターンの一貫性確認
- Task 8-2: 共通ヘルパー化の検討（別タスクへの移管判断）
- Task 8-3: 実装コードの最終整理

## 参照資料

| 資料名           | パス                                                                  | 説明                 |
| ---------------- | --------------------------------------------------------------------- | -------------------- |
| Phase 5 成果物   | [phase-5-implementation.md](phase-5-implementation.md)                | 実装済みコードの参照 |
| Phase 7 成果物   | [phase-7-coverage-check.md](phase-7-coverage-check.md)                | カバレッジ確認結果   |
| 対象実装ファイル | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | リファクタリング対象 |

## 実行手順

### Step 1: Task 8-1 通知パターンの一貫性確認

`RuntimeSkillCreatorFacade.ts` 内の全ての `notify()` 呼び出し箇所を確認する。

```bash
rg -n "notify|notificationService" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

**確認観点**:

| 対象                                                  | Before                               | After                                          | 理由                        |
| ----------------------------------------------------- | ------------------------------------ | ---------------------------------------------- | --------------------------- |
| `_executeInternal()` の通知パターン                   | `try { notify() } catch {}` パターン | 変更なし（参照基準）                           | 基準パターン                |
| `improve()` 単体の通知パターン                        | `try { notify() } catch {}` パターン | 変更なし（実装済み）                           | 統一済み                    |
| `verifyAndImproveLoop()` 内の通知パターン（追加箇所） | 通知なし（エラーコードのみ返却）     | `try { notify() } catch {}` パターンで通知追加 | `_executeInternal()` と統一 |

### Step 2: Task 8-2 共通ヘルパー化の検討

**現状分析**:
`_executeInternal()`、`improve()` 単体、`verifyAndImproveLoop()` 内の3か所で `notify("スキル作成失敗", ...)` パターンを使用する。

**判断**:
現時点では共通ヘルパー化よりインライン維持を選択。理由:

- 変更範囲を最小化するため
- 3か所の呼び出しコンテキストが微妙に異なるため

**別タスクへの移管**:
共通ヘルパー化は Phase 10/12 の MINOR 指摘として別タスクに積む。

### Step 3: Task 8-3 実装コードの最終整理

```bash
# 最終的な型チェックとLint
pnpm --filter @repo/desktop typecheck
pnpm lint
```

**期待結果**: エラーなし

## 統合テスト連携【必須】

| 連携アクション           | 内容                                                         |
| ------------------------ | ------------------------------------------------------------ |
| リファクタ後の統合テスト | 変更後も T-VL-01〜07 + T-REG-01 全て PASS していることを確認 |

## 成果物

| 成果物               | 配置先                                 |
| -------------------- | -------------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-notes.md` |

## 完了条件

- [ ] 3か所の `notify()` パターンが一貫していることを確認済み
- [ ] 共通ヘルパー化の判断（別タスク）が記録されている
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm lint` がエラーなし
- [ ] T-VL-01〜07 + T-REG-01 全て PASS

## タスク100%実行確認【必須】

Phase 8 完了時に以下を確認すること:

- [ ] Task 8-1（通知パターン一貫性確認）を完全に実行した
- [ ] Task 8-2（共通ヘルパー化検討）を完全に実行した
- [ ] Task 8-3（実装コード最終整理）を完全に実行した

## 次Phase

→ [Phase 9: 品質保証](phase-9-quality-assurance.md)

**Phase 8→9 の遷移条件**: 全テストPASS・型チェック・Lint が全てクリアであること
