# トレーサビリティ網羅率レポート

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 7                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## AC-01〜AC-05 対応トレーサビリティ

| AC-ID | イベント名                          | Phase 4 テスト      | Phase 6 エッジケース | Phase 11 手動確認   | カバー状況 |
| ----- | ----------------------------------- | ------------------- | -------------------- | ------------------- | ---------- |
| AC-01 | `skill_wizard_started`              | TC-01               | TC-E01               | TC-01               | COVERED    |
| AC-02 | `skill_wizard_step1_completed`      | TC-02, TC-03        | -                    | TC-02, TC-03        | COVERED    |
| AC-03 | `skill_wizard_generation_completed` | TC-04               | TC-E02               | TC-04               | COVERED    |
| AC-04 | `skill_skeleton_quality_feedback`   | TC-05, TC-06        | TC-E03               | TC-05, TC-06        | COVERED    |
| AC-05 | `skill_wizard_next_action`          | TC-10, TC-11, TC-12 | -                    | TC-07, TC-08, TC-09 | COVERED    |

**全 AC: 5/5 COVERED**

---

## テストケース × AC 対応マトリクス

| TC-ID  | AC-01 | AC-02 | AC-03 | AC-04 | AC-05 |
| ------ | ----- | ----- | ----- | ----- | ----- |
| TC-01  | ✓     |       |       |       |       |
| TC-02  |       | ✓     |       |       |       |
| TC-03  |       | ✓     |       |       |       |
| TC-04  |       |       | ✓     |       |       |
| TC-05  |       |       |       | ✓     |       |
| TC-06  |       |       |       | ✓     |       |
| TC-07  |       |       |       |       |       |
| TC-08  |       |       |       |       |       |
| TC-08b |       |       |       |       |       |
| TC-09  |       |       |       |       |       |
| TC-10  |       |       |       |       | ✓     |
| TC-11  |       |       |       |       | ✓     |
| TC-12  |       |       |       |       | ✓     |
| TC-E01 | ✓     |       |       |       |       |
| TC-E02 |       |       | ✓     |       |       |
| TC-E03 |       |       |       | ✓     |       |

---

## 発火シナリオ網羅確認

| 発火シナリオ                                               | 対応 TC       | 確認状況 |
| ---------------------------------------------------------- | ------------- | -------- |
| `skill_wizard_started`（マウント時・1 回）                 | TC-01, TC-E01 | COVERED  |
| `skill_wizard_step1_completed`（complete, skippedAt=null） | TC-02         | COVERED  |
| `skill_wizard_step1_completed`（skip, skippedAt=N）        | TC-03         | COVERED  |
| `skill_wizard_generation_completed`（成功時）              | TC-04         | COVERED  |
| `skill_wizard_generation_completed`（失敗時・非発火）      | TC-E02        | COVERED  |
| `skill_skeleton_quality_feedback`（satisfied=true）        | TC-05         | COVERED  |
| `skill_skeleton_quality_feedback`（satisfied=false）       | TC-06         | COVERED  |
| `skill_wizard_next_action`（execute）                      | TC-10         | COVERED  |
| `skill_wizard_next_action`（open_editor）                  | TC-11         | COVERED  |
| `skill_wizard_next_action`（create_another）               | TC-12         | COVERED  |

**発火シナリオ: 10/10 COVERED**

---

## `resolveSkippedAtQuestion` トレーサビリティ

AC-02 の `skippedAtQuestion` 記録精度を支えるヘルパー関数の境界値テストとの対応。

| 境界値ケース              | 期待値 | テスト状況 |
| ------------------------- | ------ | ---------- |
| 全問未回答 → スキップ     | `1`    | COVERED    |
| Q1 回答後スキップ         | `2`    | COVERED    |
| Q1〜Q3 回答後スキップ     | `4`    | COVERED    |
| 全問回答（complete 方式） | `null` | COVERED    |

---

## 網羅率サマリー

| 指標                      | 件数  | 網羅率 |
| ------------------------- | ----- | ------ |
| AC カバー率               | 5/5   | 100%   |
| 発火シナリオカバー率      | 10/10 | 100%   |
| テストケース合計（Green） | 15/15 | 100%   |

---

## 完了条件チェックリスト

- [x] AC-01〜AC-05 の全 5 件が COVERED であること
- [x] 10 発火シナリオが全て COVERED であること
- [x] `resolveSkippedAtQuestion` の境界値が AC-02 に紐付いていること
- [x] Phase 11 手動確認との対応が記録されていること
