# AC-1 実測エビデンス: mirror-parity-summary

## 実測コマンド

```
$ diff -qr .claude/skills .agents/skills
$ echo "parity exit: $?"
parity exit: 0
```

## 実測結果

- **stdout**: 空出力
- **stderr**: 空出力
- **exit code**: 0
- **差分件数**: 0 ファイル

## 判定

AC-1（`diff -qr .claude/skills .agents/skills` が空出力となる）は Phase 5 完了時点で成立。

## Snapshot 比較

| snapshot                                           | drift 件数 | 主な差分                                                               |
| -------------------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| Phase 4 Red state（`red-state-diff-snapshot.txt`） | 4 件       | topic-map.md / task-workflow-completed.md / skill-creator LOGS / SKILL |
| Phase 5 before（`skills-diff-phase5-before.txt`）  | 4 件       | 同上                                                                   |
| Phase 5 after（`skills-diff-phase5-after.txt`）    | 0 件       | —                                                                      |

4 → 0 に収束を確認。AC-1 成立、本タスクの主要な受入基準が充足。

## 再現手順

```bash
# 1. drift を意図的に作成（副作用テスト）
echo "test-drift" >> .claude/skills/aiworkflow-requirements/LOGS.md
bash .claude/scripts/verify-skills-parity.sh  # 期待: [parity-check] NG: / exit 1

# 2. sync で修復
git restore .claude/skills/aiworkflow-requirements/LOGS.md
bash .claude/scripts/sync-skills-mirror.sh     # 期待: [mirror-sync] 完了: parity OK / exit 0

# 3. 確認
bash .claude/scripts/verify-skills-parity.sh   # 期待: [parity-check] OK: / exit 0
diff -qr .claude/skills .agents/skills         # 期待: 空出力
```
