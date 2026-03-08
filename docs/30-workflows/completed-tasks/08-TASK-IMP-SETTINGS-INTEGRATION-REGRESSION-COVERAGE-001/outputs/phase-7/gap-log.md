# Phase 7: カバレッジギャップログ

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 7                                                        |
| 作成日   | 2026-03-08                                               |

---

## 現時点でのギャップ

**ギャップ: なし**

INT-01 〜 INT-05（サブケース含む9件）の全テストケースが GREEN であり、Phase 7 のカバレッジ基準を満たしている。

---

## act() 警告の記録

### 対象テストケース

INT-05 の3テスト（INT-05a, INT-05b, INT-05c）で ApiKeysSection の非同期更新による `act()` 警告が発生している。

### 警告内容

```
Warning: An update to ApiKeysSection inside a test was not wrapped in act(...).
```

### 原因

ApiKeysSection は `useEffect` 内で `window.electronAPI.apiKey.list()` を非同期呼び出しし、結果を state に反映する。INT-05 のテストは auth-mode status の検証が主目的であり、ApiKeysSection の非同期更新完了を `waitFor` で待機していない。そのため、テスト終了後に state 更新が発生し、act() 警告が出力される。

### テスト機能への影響

**影響なし**。act() 警告はテストの PASS/FAIL には影響しない。INT-05 のアサーション対象は auth-mode status の表示/非表示であり、ApiKeysSection の非同期更新結果は検証対象外である。

### 対策

Phase 8 のリファクタリングで `waitFor` 追加を検討する。具体的には、INT-05 の各テストケースの末尾に以下を追加することで警告を解消可能:

```typescript
await waitFor(() => {
  expect(mockApiKeyList).toHaveBeenCalled();
});
```

**優先度**: 低（テスト機能に影響なし。コンソール出力の清浄性のみの問題）

---

## ギャップサマリ

| 項目                        | 状態                                                      |
| --------------------------- | --------------------------------------------------------- |
| INT-01 〜 INT-05 テスト結果 | 全9件 GREEN                                               |
| カバレッジ基準達成          | 達成                                                      |
| act() 警告                  | 3件（INT-05a, INT-05b, INT-05c）-- テスト機能への影響なし |
| Phase 6 への差し戻し        | 不要                                                      |
