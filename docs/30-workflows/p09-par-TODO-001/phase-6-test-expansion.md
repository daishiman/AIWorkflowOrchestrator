# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 6                       |
| Phase名    | テスト拡充              |
| 対象機能   | TASK-SW-TODO-001        |
| 前提Phase  | Phase 5: 実装           |
| 次Phase    | Phase 7: カバレッジ確認 |
| ステータス | 未実施                  |
| 作成日     | 2026-04-16              |

## 目的

Phase 4 で設計したテストケースに加え、`shouldShowMainToolBadge` の境界条件・
フラグ変更影響のエッジケースを補強し、AC-3（UIの機能維持）の網羅性を高める。
本タスクはコメント整理のため、テスト拡充の対象は最小限とする。

## 実行タスク

### Task 1: 境界条件テストの追加

Phase 5 の実装内容に応じて、以下の境界条件を確認する。

| 境界条件                                                   | 期待動作                                                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `MAIN_TOOL_BADGE_ENABLED` を削除した場合（オプション A-1） | `shouldShowMainToolBadge` が同じ値を返す                                                 |
| コメントのみ変更した場合（オプション A-2 / B）             | コンパイルエラーなし・動作変更なし                                                       |
| TODOコメントが完全に除去されている                         | コード上に `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` への参照が残らない（オプション A） |

### Task 2: 拡充テストケース

本タスクはコメント整理のため、新規テストケースの追加は最小限とする。
既存テストで AC-3 / AC-4 がカバーできる場合は追加不要。

**追加検討テストケース**（Phase 5 実装内容に応じて判断する）:

| TC ID | テストタイトル                                           | 期待結果                                    |
| ----- | -------------------------------------------------------- | ------------------------------------------- |
| TC-03 | `shouldShowMainToolBadge` がフラグ変更前後で同じ値を返す | 変更前後で `shouldShowMainToolBadge` が一致 |
| TC-04 | コンポーネントのレンダリングでバッジ表示が維持される     | バッジ要素が DOM に存在する                 |

### Task 3: 回帰テスト追加実行確認

Phase 5 実装後の状態で回帰テストを実行し、全て Green であることを確認する。

```bash
# 拡充テスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="ConversationRoundStep"

# カバレッジ確認
pnpm --filter @repo/desktop test -- --testPathPattern="ConversationRoundStep" --coverage
```

## 参照資料

- `outputs/phase-4/TASK-SW-TODO-001-test-design.md` — 基本テストケース
- `outputs/phase-5/TASK-SW-TODO-001-implementation-plan.md` — 実装内容

## 統合テスト連携

- 拡充テストはユニットテストの範囲内で実施する
- コンポーネントの外部インターフェースは変更しないため統合テストの変更は不要

## 成果物

| 成果物                                   | パス                                                       |
| ---------------------------------------- | ---------------------------------------------------------- |
| TASK-SW-TODO-001-extended-test-record.md | `outputs/phase-6/TASK-SW-TODO-001-extended-test-record.md` |

## 完了条件

- [ ] 境界条件の確認が完了している
- [ ] 全テストケース（TC-R01 含む）が Green である
- [ ] TASK-SW-TODO-001-extended-test-record.md に追加テストの記録がある

## タスク100%実行確認【必須】

- [ ] Task 1（境界条件テストの追加）を100%実行した
- [ ] Task 2（拡充テストケース検討）を100%実行した
- [ ] Task 3（回帰テスト追加実行確認）を100%実行した
- [ ] 成果物（TASK-SW-TODO-001-extended-test-record.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
