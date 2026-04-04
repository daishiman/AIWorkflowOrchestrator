# Phase 7: カバレッジレポート (Coverage Report)

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-P0-09                             |
| Phase    | 7                                      |
| 機能名   | claude-sdk-permission-hooks-governance |
| 作成日   | 2026-03-31                             |

---

## 1. Policy Coverage

### Phase 別 coverage

| Phase     | permissionMode | allowedTools | disallowedTools | canUseTool | テスト数 |
| --------- | -------------- | ------------ | --------------- | ---------- | -------- |
| `plan`    | tested         | tested       | tested          | tested     | 8        |
| `execute` | tested         | tested       | tested          | tested     | 8        |
| `verify`  | tested         | tested       | tested          | tested     | 6        |
| `improve` | tested         | tested       | tested          | tested     | 6        |

**結果**: 全 4 phase で permissionMode / allowedTools / disallowedTools / canUseTool が検証済み。

### canUseTool strategy coverage

| strategy       | 対象 phase       | テスト内容                              | テスト数 |
| -------------- | ---------------- | --------------------------------------- | -------- |
| tool_list_only | plan, verify     | allowedTools / disallowedTools のみ判定 | 12       |
| path_scoped    | execute, improve | skill dir 内外のパス制約判定            | 5        |

---

## 2. Hook Coverage

### Hook event type 別 coverage

| Hook event    | テスト数 | テスト対象                                 |
| ------------- | -------- | ------------------------------------------ |
| session_start | 3        | provenance 記録、session provenance 上書き |
| pre_tool_use  | 5        | allow/deny 判定、audit 記録                |
| post_tool_use | 2        | success/error metadata 記録                |
| session_end   | 1        | summary metadata 記録                      |

**結果**: 全 4 hook event type が検証済み。

### Hook 実行順 coverage

| パターン                                                             | テスト数 | 結果 |
| -------------------------------------------------------------------- | -------- | ---- |
| SessionStart → PreToolUse → PostToolUse → SessionEnd (単一 tool)     | 1        | PASS |
| SessionStart → [PreToolUse → PostToolUse]\* → SessionEnd (複数 tool) | 1        | PASS |

**結果**: 単一 tool・複数 tool の両パターンで hook 実行順が検証済み。

---

## 3. Audit Coverage

### AuditSink 操作別 coverage

| 操作               | テスト数 | テスト内容                               |
| ------------------ | -------- | ---------------------------------------- |
| record             | 2        | 単一記録、複数記録・順序保持             |
| recordEvent        | 3        | timestamp 自動生成、provenance、decision |
| getEvents          | 1        | read-only コピー                         |
| getRecentEvents    | 1        | 直近 N 件取得                            |
| getEventsBySession | 1        | session フィルタ                         |
| getDenialEvents    | 1        | denied のみフィルタ                      |
| maxEvents          | 1        | overflow 時の古い event 切り捨て         |
| clear              | 1        | 全イベントクリア                         |

**結果**: AuditSink の全 public メソッドが検証済み。

---

## 4. UI / IPC Coverage

### getGovernanceState() coverage

| テスト内容                                                               | テストファイル                       | 結果 |
| ------------------------------------------------------------------------ | ------------------------------------ | ---- |
| SKILL_CREATOR_GET_GOVERNANCE_STATE が ALLOWED_INVOKE_CHANNELS に含まれる | skill-creator-api.governance.test.ts | PASS |
| skill-creator: 専用 approval/disclosure channel が存在しない             | skill-creator-api.governance.test.ts | PASS |

**結果**: getGovernanceState() の IPC channel 登録と、不正 channel の不在が検証済み。

---

## 5. Denial Coverage

### Denial 関連テスト coverage

| テスト観点                    | テスト数 | テストファイル           |
| ----------------------------- | -------- | ------------------------ |
| disallowed tool の deny       | 8        | PermissionPolicy.test.ts |
| allowedTools 外 tool の deny  | 1        | PermissionPolicy.test.ts |
| deny reason メッセージ検証    | 4        | PermissionPolicy.test.ts |
| path_scoped deny              | 3        | PermissionPolicy.test.ts |
| hook 経由の denial audit 記録 | 1        | HooksFactory.test.ts     |
| getDenialEvents() フィルタ    | 1        | AuditSink.test.ts        |

**結果**: 拒否される全パターン（disallowed / not-in-allowed / path 外）と reason メッセージが検証済み。

---

## 6. Coverage Summary

### テスト数集計

| カテゴリ            | テスト数 |
| ------------------- | -------- |
| PermissionPolicy UT | 29       |
| HooksFactory UT     | 16       |
| AuditSink UT        | 11       |
| 統合テスト          | 8        |
| **governance 合計** | **64**   |

### 全体テストとの関係

| 範囲              | テスト数 |
| ----------------- | -------- |
| governance テスト | 64       |
| 関連テスト (全体) | 575 (\*) |
| **全て PASS**     | 確認済み |

(\*) 関連テストには skill-creator lane の既存テストを含む。governance 追加後の回帰テストも全 PASS。

---

## 7. Coverage Matrix (AC 別)

| AC   | 観点                                                | テスト数 | 網羅率 |
| ---- | --------------------------------------------------- | -------- | ------ |
| AC-1 | phase 別 permissionMode / tool 境界定義             | 18       | 100%   |
| AC-2 | allowedTools / disallowedTools / canUseTool 実装    | 25       | 100%   |
| AC-3 | Hook による監査イベント記録                         | 20       | 100%   |
| AC-4 | permission denial / hook 判断結果の UI / audit 反映 | 12       | 100%   |
| AC-5 | 動的読込結果 / provenance の hook / audit への包含  | 6        | 100%   |
| AC-6 | skill-creator の固定化 / hardcoded prompt 不在      | 2        | 100%   |

---

## 8. Dependency Edge 可視化

```
TASK-RT-06 (SDK message 正規化) → normalizeSdkMessage() 利用 → COVERED
    ↓
TASK-P0-03 (manifest 配置) → ManifestLoader / SourceResolver → COVERED (provenance)
    ↓
TASK-P0-04 (dynamic pipeline) → PhaseResourcePlanner → COVERED (provenance)
    ↓
TASK-P0-09 (governance) ← 本タスク → ALL ACs COVERED
```

upstream 依存先の provenance がテストで参照されており、missing edge なし。

---

## 9. 完了チェック

- [x] phase 別 policy coverage が確認されている
- [x] hook coverage が確認されている
- [x] audit sink の全操作が検証されている
- [x] UI / IPC coverage が確認されている
- [x] denial coverage が確認されている
- [x] AC-1〜AC-6 全てに対する coverage が 100%
- [x] dependency edge に missing edge がない
