# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 11                           |
| Phase名    | 手動テスト                   |
| 対象機能   | TASK-SW-TODO-001             |
| 前提Phase  | Phase 10: 最終レビューゲート |
| 次Phase    | Phase 12: ドキュメント更新   |
| ステータス | 未実施                       |
| 作成日     | 2026-04-16                   |

## 目的

実際にUIを操作し、`shouldShowMainToolBadge` によるバッジ表示が
コメント整理前と変わらず正常に機能していることを確認する。
自動テストでは検証できない実際のレンダリング動作を確認する。

## 実行タスク

### Task 1: 手動テストシナリオ定義

| シナリオID | シナリオ名                                           | 確認内容                                                            |
| ---------- | ---------------------------------------------------- | ------------------------------------------------------------------- |
| MT-01      | ConversationRoundStep で主ツールバッジが表示される   | `shouldShowMainToolBadge` が true の条件でバッジ要素が表示される    |
| MT-02      | ConversationRoundStep で主ツールバッジが非表示になる | `shouldShowMainToolBadge` が false の条件でバッジ要素が非表示になる |
| MT-03      | コメント整理後もUIレイアウトが崩れていない           | バッジ周辺のUI要素のレイアウトが変わっていない                      |

### Task 2: テスト実行手順

1. Electron アプリを起動する（または開発環境で `ConversationRoundStep` を表示する）
2. スキルウィザード画面を開き、`ConversationRoundStep` が表示される状態を作る
3. 主ツールバッジの表示・非表示が条件に応じて正しく切り替わることを目視確認する

```typescript
// 一時的なデバッグ確認（手動テスト時のみ追加、コミット前に削除）
console.log(
  "[DEBUG TODO-001] shouldShowMainToolBadge:",
  shouldShowMainToolBadge,
);
```

### Task 3: 手動テスト結果記録

| シナリオID | 結果                  | 観察内容 |
| ---------- | --------------------- | -------- |
| MT-01      | PASS / FAIL / BLOCKED | TBD      |
| MT-02      | PASS / FAIL / BLOCKED | TBD      |
| MT-03      | PASS / FAIL / BLOCKED | TBD      |

## 参照資料

- `outputs/phase-10/TASK-SW-TODO-001-final-review-result.md` — 最終レビュー結果

## 統合テスト連携

- 手動テストで `ConversationRoundStep` の実UIフローを確認する
- バッジ表示の動作変化がないことを目視で確認する

## 成果物

| 成果物                                    | パス                                                         |
| ----------------------------------------- | ------------------------------------------------------------ |
| TASK-SW-TODO-001-manual-test-checklist.md | `outputs/phase-11/TASK-SW-TODO-001-manual-test-checklist.md` |
| TASK-SW-TODO-001-manual-test-result.md    | `outputs/phase-11/TASK-SW-TODO-001-manual-test-result.md`    |

## 完了条件

- [ ] 手動テストシナリオ（MT-01〜MT-03）が全て実行されている
- [ ] 手動テスト結果が記録されている
- [ ] PASS / FAIL / BLOCKED の判定が全件埋まっている

## タスク100%実行確認【必須】

- [ ] Task 1（手動テストシナリオ定義）を100%実行した
- [ ] Task 2（テスト実行手順）を100%実行した
- [ ] Task 3（手動テスト結果記録）を100%実行した
- [ ] 成果物（TASK-SW-TODO-001-manual-test-checklist.md / TASK-SW-TODO-001-manual-test-result.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
