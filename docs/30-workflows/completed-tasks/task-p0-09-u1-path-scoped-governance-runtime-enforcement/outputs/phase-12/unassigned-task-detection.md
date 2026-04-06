# unassigned-task-detection.md — TASK-P0-09-U1

## 未タスク候補

### TASK-P0-09-U1-A: improve() フローへの canUseTool runtime 配線

| 項目   | 内容                                                                                                                                                                    |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 検出源 | Phase 8 リファクタリング備考・Phase 10 最終レビュー備考                                                                                                                 |
| 概要   | `createImproveGovernanceCanUseTool()` は method として実装済みだが、`improve()` フローが `llmAdapter.sendChat()` を使用するため SDK callback として直接配線されていない |
| 影響   | `applyImprovement()` でのファイル書き込み時に path-scoped enforcement が runtime で発動しない                                                                           |
| 優先度 | 低（AC-6 はテストで検証済み、実際の `improve()` は自身の skill ルート内にしか書き込まない設計）                                                                         |
| 対策案 | `applyImprovement()` 内で `evaluateGovernanceToolUse("Edit", "improve", context)` を呼び出す                                                                            |

### TASK-P0-09-U1-B: renderer 側 governance 表示 UI

| 項目   | 内容                                                             |
| ------ | ---------------------------------------------------------------- |
| 検出源 | TASK-P0-09-U1 スコープ外として明示済み                           |
| 概要   | path-scoped deny イベントを renderer 側でリアルタイム表示する UI |
| 優先度 | 低（将来スコープ）                                               |

### TASK-P0-09-U1-C: audit 永続化

| 項目   | 内容                                                                        |
| ------ | --------------------------------------------------------------------------- |
| 検出源 | TASK-P0-09-U1 スコープ外として明示済み                                      |
| 概要   | `SkillCreatorAuditSink` の in-memory ring buffer をファイル/DB へ永続化する |
| 優先度 | 低（将来スコープ）                                                          |

## コードコメント検索結果

```bash
grep -r "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/services/runtime/governance/ --include="*.ts"
# → SkillCreatorPermissionPolicy.ts の TODO(TASK-P0-09-U1) は本タスクで解決済み
```

**解決済み**: `SkillCreatorPermissionPolicy.ts:187` の `TODO(TASK-P0-09-U1)` コメントは本タスク完了により解消。
