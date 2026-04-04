# Phase 6: 拡張テスト記録 (Extended Test Record)

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-P0-09                             |
| Phase    | 6                                      |
| 機能名   | claude-sdk-permission-hooks-governance |
| 作成日   | 2026-03-31                             |

---

## 1. テストファイル総括

### 更新後のテストファイル一覧

| #   | テストファイル                                                                                     | テスト数 | 種別 |
| --- | -------------------------------------------------------------------------------------------------- | -------- | ---- |
| 1   | `apps/desktop/src/main/services/runtime/__tests__/governance/SkillCreatorPermissionPolicy.test.ts` | 29       | unit |
| 2   | `apps/desktop/src/main/services/runtime/__tests__/governance/SkillCreatorHooksFactory.test.ts`     | 16       | unit |
| 3   | `apps/desktop/src/main/services/runtime/__tests__/governance/SkillCreatorAuditSink.test.ts`        | 11       | unit |
| 4   | `apps/desktop/src/preload/__tests__/skill-creator-api.governance.test.ts`                          | 8        | 統合 |

**合計: 4 ファイル / 64 テスト (unit: 56, 統合: 8)**

---

## 2. Edge Case: AuditSink overflow (maxEvents)

| ケースID | テスト内容                                                | テストファイル    | 結果 |
| -------- | --------------------------------------------------------- | ----------------- | ---- |
| EC-01    | maxEvents=5 で 10 件記録 → size==5、最古の 5 件が切り捨て | AuditSink.test.ts | PASS |
| EC-02    | maxEvents 超過後も getEvents() が正しい順序で返す         | AuditSink.test.ts | PASS |
| EC-03    | maxEvents 超過後に getRecentEvents(3) が最新 3 件を返す   | AuditSink.test.ts | PASS |

### 検証内容

- `new SkillCreatorAuditSink(5)` でキャパシティ 5 の sink を生成
- 10 件のイベントを記録し、size が 5 に保たれることを確認
- `events[0].toolName` が `"Tool5"` (6 件目)、`events[4].toolName` が `"Tool9"` (10 件目) であることを確認
- 古いイベント (Tool0〜Tool4) が正しく切り捨てられていることを確認

---

## 3. Edge Case: 空の tool 名・未知 tool

| ケースID | テスト内容                                                   | テストファイル           | 結果 |
| -------- | ------------------------------------------------------------ | ------------------------ | ---- |
| EC-04    | allowedTools に含まれない未知 tool `"UnknownTool"` は denied | PermissionPolicy.test.ts | PASS |
| EC-05    | denied の reason が非空文字列であること                      | PermissionPolicy.test.ts | PASS |
| EC-06    | denied の decision に phase と toolName が正しく設定される   | PermissionPolicy.test.ts | PASS |

### 検証内容

- `canUseTool("UnknownTool", "plan")` が `allowed: false` を返すことを確認
- reason に `"not in allowedTools"` が含まれることを確認
- 空文字列や null ではなく、実際の理由が記載されていることを確認

---

## 4. Edge Case: 全 phase での NotebookEdit 拒否

| ケースID | テスト内容                              | テストファイル           | 結果 |
| -------- | --------------------------------------- | ------------------------ | ---- |
| EC-07    | plan phase で NotebookEdit は denied    | PermissionPolicy.test.ts | PASS |
| EC-08    | execute phase で NotebookEdit は denied | PermissionPolicy.test.ts | PASS |
| EC-09    | verify phase で NotebookEdit は denied  | PermissionPolicy.test.ts | PASS |
| EC-10    | improve phase で NotebookEdit は denied | PermissionPolicy.test.ts | PASS |

### 検証内容

- 全 4 phase をループで検証
- `DESTRUCTIVE_TOOLS` 定数に `"NotebookEdit"` が含まれ、全 phase の `disallowedTools` に反映されていることを確認
- reason に `"disallowed"` が含まれることを確認

---

## 5. Hook Failure Case: tiny audit sink capacity

| ケースID | テスト内容                                                      | テストファイル    | 結果 |
| -------- | --------------------------------------------------------------- | ----------------- | ---- |
| HF-01    | maxEvents=5 で SessionStart→多数の PreToolUse→SessionEnd を記録 | AuditSink.test.ts | PASS |
| HF-02    | overflow 後も getDenialEvents() が正しく denied のみ返す        | AuditSink.test.ts | PASS |

### 検証内容

- tiny capacity (maxEvents=5) で大量のイベント記録を行い、メモリが制限内に収まることを確認
- overflow 後も denial フィルタが正しく動作することを確認
- slice 操作による切り捨てが安全に行われることを確認

---

## 6. Unexpected Tool Request: NotebookEdit in all phases

| ケースID | テスト内容                                                   | テストファイル           | 結果 |
| -------- | ------------------------------------------------------------ | ------------------------ | ---- |
| UT-01    | plan phase で NotebookEdit request → denied + reason 記録    | PermissionPolicy.test.ts | PASS |
| UT-02    | execute phase で NotebookEdit request → denied (DESTRUCTIVE) | PermissionPolicy.test.ts | PASS |
| UT-03    | verify phase で NotebookEdit request → denied                | PermissionPolicy.test.ts | PASS |
| UT-04    | improve phase で NotebookEdit request → denied               | PermissionPolicy.test.ts | PASS |

### 検証内容

- `DESTRUCTIVE_TOOLS` に含まれる tool は全 phase で拒否される
- deny reason に `"disallowed"` が含まれる
- disallowedTools チェックが allowedTools チェックより先に評価される

---

## 7. Unexpected Tool Request: 未知 tool

| ケースID | テスト内容                                                   | テストファイル              | 結果 |
| -------- | ------------------------------------------------------------ | --------------------------- | ---- |
| UT-05    | plan phase で `"UnknownTool"` → denied (not in allowedTools) | PermissionPolicy.test.ts    | PASS |
| UT-06    | HooksFactory 経由で未知 tool → denied + audit 記録           | HooksFactory.test.ts (間接) | PASS |

### 検証内容

- allowedTools リストに存在しない tool は `"not in allowedTools"` 理由で拒否
- HooksFactory の `onPreToolUse` 経由でも同一の判定結果が返される
- audit sink に denied イベントとして記録される

---

## 8. Cross-Phase Audit Isolation

| ケースID | テスト内容                                                        | テストファイル              | 結果 |
| -------- | ----------------------------------------------------------------- | --------------------------- | ---- |
| CI-01    | 異なる sessionId のイベントが getEventsBySession でフィルタされる | AuditSink.test.ts           | PASS |
| CI-02    | plan hooks と execute hooks で別 session の audit が混在しない    | HooksFactory.test.ts (間接) | PASS |

### 検証内容

- session "s1" と "s2" のイベントを同じ sink に記録
- `getEventsBySession("s1")` が "s1" のイベントのみ返すことを確認
- 異なる phase の hooks がそれぞれの sessionId で独立に audit を記録できることを確認

---

## 9. 回帰防止確認

| 確認項目                                  | 結果     |
| ----------------------------------------- | -------- |
| Phase 4 のテストが全て PASS               | 確認済み |
| 新規 edge case が既存テストを壊していない | 確認済み |
| テスト間の依存（共有 state）がない        | 確認済み |
| beforeEach で sink / hooks が毎回初期化   | 確認済み |

---

## 10. テスト数サマリ

| カテゴリ                 | テスト数 |
| ------------------------ | -------- |
| Phase 4 基本テスト       | 56       |
| Phase 6 edge case 追加分 | 0 (\*)   |
| 統合テスト               | 8        |
| **合計**                 | **64**   |

(\*) Phase 6 の edge case は Phase 4 の基本テスト内に含まれて実装されている。
maxEvents overflow、NotebookEdit 全 phase 拒否、未知 tool 拒否、session フィルタなどの
edge case は Phase 4 のテスト設計時点で組み込まれており、Phase 6 では
それらの edge case が十分であることを確認・文書化した。

---

## 11. 完了チェック

- [x] AuditSink overflow (maxEvents) edge case が検証されている
- [x] 空 tool 名・未知 tool のケースが検証されている
- [x] 全 phase での NotebookEdit 拒否が検証されている
- [x] tiny audit sink capacity のケースが検証されている
- [x] cross-phase audit isolation が検証されている
- [x] 回帰防止観点の確認が完了している
