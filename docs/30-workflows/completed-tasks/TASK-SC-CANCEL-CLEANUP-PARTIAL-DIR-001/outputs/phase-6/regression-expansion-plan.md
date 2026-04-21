# 回帰拡充計画

## 既存テスト（回帰根拠）

| テスト ID     | 観点                                  | 状態   |
| ------------- | ------------------------------------- | ------ |
| SC-CANCEL-001 | cancel 時に新規 dir が削除される      | ✓ PASS |
| SC-CANCEL-002 | 既存 dir は cancel しても削除されない | ✓ PASS |

## spec 整合観点（追加）

| 観点                                | 確認内容                                                      | 確認方法                                |
| ----------------------------------- | ------------------------------------------------------------- | --------------------------------------- |
| `cleanupCancelledSkillDir` 前提一致 | spec が `catch` ブロック前提で記述されているか                | Phase 5 diff-check.md 参照              |
| `skillDirExistedBefore` 前提一致    | spec が `createdByThisRun` ではなくこのフラグを使用しているか | Phase 5 diff-check.md 参照              |
| artifact 参照整合                   | Phase 間の artifact 名が canonical 一覧と一致するか           | Phase 1 artifact-canonical-list.md 参照 |

## エッジケース観点

| ケース                | 説明                                                   | 既存カバレッジ                                  |
| --------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| abort + 既存 dir      | キャンセルしても既存 dir は保護される                  | SC-CANCEL-002 でカバー                          |
| abort + 新規 dir      | キャンセルで新規 dir は削除される                      | SC-CANCEL-001 でカバー                          |
| 通常エラー + 新規 dir | abort/cancel でない場合は削除しない                    | `isAbortError` 判定でカバー（コードで確認済み） |
| cleanup 自体の失敗    | `fs.rm` が失敗しても warn ログのみでエラーを伝播しない | コードの `catch (cleanupError)` でカバー        |

## 回帰観点の証跡導線

```
実コード (SkillCreatorService.ts)
    ↓ catch ブロックで cleanupCancelledSkillDir 呼び出し
回帰テスト (SkillCreatorService.test.ts)
    ↓ SC-CANCEL-001: fs.rm 呼び出し確認
    ↓ SC-CANCEL-002: fs.rm 非呼び出し確認
Phase 9 (quality-gate-report.md)
    ↓ typecheck + targeted test PASS 記録
Phase 10 (final-review-result.md)
    ↓ AC-1〜AC-5 最終判定
Phase 11 (manual-test-result.md)
    ↓ NON_VISUAL 代替証跡として記録
```

## 追加テスト不要の根拠

SC-CANCEL-001/002 が既に：

1. abort 時の cleanup 動作を網羅している
2. 既存 dir 保護を検証している
3. `skillDirExistedBefore` フラグの動作を間接的に確認している

追加テストコードの実装は**不要**。既存テストが回帰根拠として十分。
