# カバレッジレポート (Phase 7)

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 7                                 |
| タスクID | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 実行日   | 2026-04-12                        |

---

## 実行コマンド

```bash
pnpm exec vitest run src/__tests__/utils/scheduleConfigValidator.test.ts \
  src/__tests__/utils/scheduleConfigValidator.edge.test.ts \
  --coverage --coverage.include="src/renderer/utils/scheduleConfigValidator.ts"
```

---

## 数値サマリ

| メトリクス | 実測値 | 最低基準 | 推奨目標 | 判定         |
| ---------- | ------ | -------- | -------- | ------------ |
| Statement  | 100%   | 80%      | 90%      | ✅ EXCELLENT |
| Branch     | 87.5%  | 80%      | 90%      | ✅ PASS      |
| Function   | 100%   | 80%      | 90%      | ✅ EXCELLENT |
| Line       | 100%   | 80%      | 90%      | ✅ EXCELLENT |

---

## テスト数

- **55 passed / 55**（TC-SV × 8, TC-EDGE × 8, TC-LEAP × 3, TC-COMP × 4, TC-REG × 6, 既存 × 26）

---

## Branch 87.5% の分析

`validateCronSemantics` 内の `!maxDays` ブランチ（月が 1〜12 外の場合）は、
Stage 2 の値域チェックで既に弾かれるため実際には到達しないパス。
実装上の防御的コーディングのため、未到達でも問題なし。

---

## 判定

**PASS（推奨90%基準をラインで満たし、ブランチも最低80%以上）**
Phase 8（リファクタリング）へ進む。
