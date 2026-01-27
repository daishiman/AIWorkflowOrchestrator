# Phase 6: テスト拡充

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| Phase     | 6                               |
| 名称      | テスト拡充                      |
| タスクID  | TASK-3-2-A                      |
| Issue番号 | #520                            |
| 前提Phase | Phase 5（実装）                 |
| 次Phase   | Phase 7（テストカバレッジ確認） |

---

## 1. 目的

Phase 5の実装完了後、エッジケースや追加シナリオのテストを拡充し、品質を向上させる。

---

## 2. タスク

### Task 6-1: R1 ローディングスピナー追加テスト

**追加テストケース**:

| TC-ID   | テスト名                                             | 期待結果                  |
| ------- | ---------------------------------------------------- | ------------------------- |
| TC-R1-7 | spinner should stop when status changes from running | running→completedで非表示 |
| TC-R1-8 | spinner should coexist with abort button             | 両方同時に表示可能        |
| TC-R1-9 | spinner animation should not affect layout           | レイアウト崩れなし        |

---

### Task 6-2: R2 タイムスタンプ追加テスト

**追加テストケース**:

| TC-ID    | テスト名                                       | 期待結果                     |
| -------- | ---------------------------------------------- | ---------------------------- |
| TC-R2-9  | should handle future timestamp gracefully      | 異常値でもクラッシュしない   |
| TC-R2-10 | should handle very old timestamp               | 大きな日数でも表示           |
| TC-R2-11 | timestamp should update on message list change | 新メッセージ追加時に正常表示 |
| TC-R2-12 | should handle timestamp of 0                   | エポック時刻でも正常動作     |

---

### Task 6-3: R3 クリップボードコピー追加テスト

**追加テストケース**:

| TC-ID    | テスト名                                               | 期待結果                 |
| -------- | ------------------------------------------------------ | ------------------------ |
| TC-R3-8  | should handle empty message content                    | 空文字でもコピー可能     |
| TC-R3-9  | should handle very long message content                | 長文でも正常コピー       |
| TC-R3-10 | should handle special characters in content            | 特殊文字でも正常コピー   |
| TC-R3-11 | should handle rapid consecutive copy clicks            | 連続クリックでも安定動作 |
| TC-R3-12 | copy button should be visible on focus                 | Tab移動でボタン表示      |
| TC-R3-13 | multiple messages can show copy feedback independently | 各メッセージ独立した状態 |

---

### Task 6-4: 統合シナリオテスト

**追加テストケース**:

| TC-ID    | テスト名                                              | 期待結果               |
| -------- | ----------------------------------------------------- | ---------------------- |
| TC-INT-1 | all features work together during execution           | R1〜R3が同時に正常動作 |
| TC-INT-2 | copy works during running state with spinner          | 実行中もコピー可能     |
| TC-INT-3 | timestamp displays correctly with copy button visible | 両方正常に表示         |
| TC-INT-4 | features work correctly after reset                   | リセット後も全機能正常 |

---

### Task 6-5: パフォーマンステスト

**追加テストケース**:

| TC-ID     | テスト名                                       | 期待結果             |
| --------- | ---------------------------------------------- | -------------------- |
| TC-PERF-1 | should handle 100 messages without lag         | レンダリング遅延なし |
| TC-PERF-2 | should handle 1000 messages gracefully         | メモリリークなし     |
| TC-PERF-3 | rapid message updates should not cause flicker | ちらつきなし         |

---

## 3. 完了条件

| ID  | 条件                               | 確認方法           |
| --- | ---------------------------------- | ------------------ |
| 1   | 全追加テストケースが作成されている | テストファイル確認 |
| 2   | 全追加テストがPASS                 | テスト実行         |
| 3   | 既存テストに影響なし               | 回帰テスト         |

---

## 4. 成果物

| 成果物             | パス                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------ |
| 拡充テスト         | apps/desktop/src/renderer/components/AgentView/**tests**/SkillStreamDisplay.test.tsx |
| テスト拡充レポート | outputs/phase-06/test-expansion-report.md                                            |

---

## 5. テストコマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test SkillStreamDisplay

# カバレッジ確認
pnpm --filter @repo/desktop test -- --coverage

# 特定テストグループのみ
pnpm --filter @repo/desktop test -- --testNamePattern="edge cases"
```

---

## 6. 参考資料

| 資料                 | パス/URL                                                                   |
| -------------------- | -------------------------------------------------------------------------- |
| Phase 4テスト設計    | phase-04-test-creation.md                                                  |
| テストカバレッジ基準 | .claude/skills/task-specification-creator/references/coverage-standards.md |
