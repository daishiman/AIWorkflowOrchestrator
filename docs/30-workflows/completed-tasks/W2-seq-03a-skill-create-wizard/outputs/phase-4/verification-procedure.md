# Phase 4 検証手順書 - UT-VERIFY-DOC-CONSOLIDATION-001

## TC-001〜TC-005: 目視確認手順

### TC-001: task-workflow.md インデックステーブル確認

1. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` を開く
2. `## 仕様書インデックス` セクションのテーブルヘッダーを確認する
3. `| ファイル | 役割 | 区分 | 主な見出し |` の形式になっていることを確認する
4. 全エントリに「正本」「履歴」「契約仕様」「—」いずれかの値が設定されていることを確認する

**PASS 条件:** 「区分」列が存在し、全エントリに値が設定されている

---

### TC-002: task-workflow-completed.md 冒頭確認

1. `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` の冒頭5行を確認する
2. `> 役割: completed records` の直後に `> 区分: 履歴記録（history record）` があることを確認する

**PASS 条件:** `> 区分: 履歴記録（history record）` が冒頭5行以内に記載されている

---

### TC-003: task-workflow-active.md 冒頭確認

1. `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md` の冒頭5行を確認する
2. `> 役割: active guide` の直後に `> 区分: 正本（current contract）` があることを確認する

**PASS 条件:** `> 区分: 正本（current contract）` が冒頭5行以内に記載されている

---

### TC-004: interfaces-skill-verify-contract.md 確認

1. `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` を開く
2. H1 タイトルの直後に `> 区分: 契約仕様（current contract / Check ID 体系）` があることを確認する

**PASS 条件:** `> 区分: 契約仕様（current contract / Check ID 体系）` が記載されている

---

### TC-005: 責務分離比較表確認

1. `interfaces-skill-verify-contract.md` の `## verify エンジン責務分離` セクションを確認する
2. 比較表に `verifySkill()` / `verifyAndImproveLoop()` / `verify()` の3行があることを確認する
3. 各行に「実装ファイル」「責務」「返却値」が正確に記載されていることを確認する

**PASS 条件:** 3関数が4列（関数名・実装ファイル・責務・返却値）の表で記載されている

---

## TC-006〜TC-008: コマンド確認手順

### TC-006: リンク有効性確認

```bash
ls .claude/skills/aiworkflow-requirements/references/task-workflow-active.md && echo "PASS" || echo "FAIL"
ls .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md && echo "PASS" || echo "FAIL"
ls .claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md && echo "PASS" || echo "FAIL"
```

**PASS 条件:** 全コマンドが PASS を出力する

---

### TC-007: Prettier フォーマット確認

```bash
pnpm prettier --check \
  ".claude/skills/aiworkflow-requirements/references/task-workflow.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-completed.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-active.md" \
  ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"
```

差分が出た場合の自動修正:

```bash
pnpm prettier --write \
  ".claude/skills/aiworkflow-requirements/references/task-workflow.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-completed.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-active.md" \
  ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"
```

**PASS 条件:** `--check` で差分なし（または `--write` 後に差分なし）

---

### TC-008: Check ID 数確認

```bash
grep -c "^| L[1-4]-[0-9]" \
  ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"
# 期待値: 19
```

Layer 別確認:

```bash
grep "^| L1-" ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md" | wc -l  # 期待値: 5
grep "^| L2-" ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md" | wc -l  # 期待値: 7
grep "^| L3-" ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md" | wc -l  # 期待値: 4
grep "^| L4-" ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md" | wc -l  # 期待値: 3
```

**PASS 条件:** 合計 19 件（L1:5, L2:7, L3:4, L4:3）

---

## 完了確認

- [x] TC-001〜TC-008 の具体的な実行手順が記述されている
- [x] 確認コマンドが明記されている
- [x] PASS/FAIL の判定基準が明確になっている
