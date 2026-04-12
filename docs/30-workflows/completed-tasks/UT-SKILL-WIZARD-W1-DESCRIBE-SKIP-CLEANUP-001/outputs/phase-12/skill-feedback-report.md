# スキルフィードバックレポート

## タスクID: UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001

## フィードバック内容

| フィードバックID | 内容                                                                                   | 種別 |
| ---------------- | -------------------------------------------------------------------------------------- | ---- |
| FB-TASK-01       | `describe.skip` 内の testid は CI で検出されないため、実装タスク完了時に手動確認が必要 | 警告 |
| FB-TASK-02       | testid 削除時に describe.skip ブロックも一括チェックするルールがない                   | 課題 |

## describe.skip 内 testid 管理改善提案

実装タスク完了時に `describe.skip` 内の testid も一括チェックするルールを
Phase 5 チェックリストに追加することを提案する。

具体的な追加内容:

```bash
# Phase 5 完了チェック: 削除した testid が describe.skip 内にも残存していないか確認
grep -rn "削除したtestid" apps/desktop/src/renderer/components/
```

## スキル改善提案

| スキル                     | 改善内容                                                                  |
| -------------------------- | ------------------------------------------------------------------------- |
| task-specification-creator | Phase 5 の完了チェックリストに describe.skip 内 testid 確認項目を追加する |
| aiworkflow-requirements    | testid 削除時の describe.skip 内残存参照チェックを標準プロセスとして記録  |

---

_作成日: 2026-04-11_
