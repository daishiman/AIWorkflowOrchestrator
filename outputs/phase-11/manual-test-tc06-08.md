# Phase 11 TC-006〜TC-008 確認レポート - UT-VERIFY-DOC-CONSOLIDATION-001

## TC-006: リンク有効性確認

```bash
ls .claude/skills/aiworkflow-requirements/references/task-workflow-active.md
# → PASS

ls .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md
# → PASS

ls .claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md
# → PASS
```

**判定: PASS**

---

## TC-007: Prettier フォーマット確認

```bash
pnpm prettier --check \
  ".claude/skills/aiworkflow-requirements/references/task-workflow.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-completed.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-active.md" \
  ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"

# 結果:
# Checking formatting...
# All matched files use Prettier code style!
# EXIT:0
```

**判定: PASS**

---

## TC-008: Check ID 数確認

```bash
grep -c "^| L[1-4]-[0-9]" \
  ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"
# 結果: 19
```

期待値（19）と一致 ✓

**判定: PASS**
