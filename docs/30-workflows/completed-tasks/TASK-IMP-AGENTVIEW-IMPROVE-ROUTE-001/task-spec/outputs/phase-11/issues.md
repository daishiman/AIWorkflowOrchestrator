# Phase 11 発見事項

## メタ情報

| 項目     | 内容                                      |
| -------- | ----------------------------------------- |
| タスクID | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001      |
| フェーズ | Phase 11                                  |
| 作成日   | 2026-03-20                                |
| 判定     | MINOR（機能に影響なし、未タスク化で対応） |

---

## 発見事項一覧

### ISSUE-P11-001: AgentView テストでの `act()` ラップ未適用 warning

**種別**: MINOR（機能影響なし）
**対象ファイル**: `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.cta.test.tsx`
**発見方法**: テスト実行時の stderr 出力確認

**内容**:

`AgentView.cta.test.tsx` の一部テストケースで以下の warning が出力される:

```
Warning: An update to AgentView inside a test was not wrapped in act(...).
```

具体的には `loadPermissions` の非同期 IPC 呼び出し（L260-293, `useEffect` 内）が `act()` なしで状態更新を行うため発生している。

**影響評価**:

- テスト結果: 全 10 tests PASS（warning のみで FAIL なし）
- 機能動作: 影響なし
- CI: PASS（warning は exit code 0）

**対応方針**:

未タスクとして記録し、後続タスクで `vi.fn().mockResolvedValue()` の async useEffect を `act(async () => {})` でラップするよう修正する。

**戻り先 Phase**: なし（機能影響なし）
**未タスク候補 ID**: UT-FIX-AGENTVIEW-CTA-ACT-WRAP-001

---

## 結論

機能的 PASS 事項はゼロ。ISSUE-P11-001 は MINOR レベルの warning であり、Phase 11 の合否に影響しない。

Phase 12（ドキュメント）へ進む。
