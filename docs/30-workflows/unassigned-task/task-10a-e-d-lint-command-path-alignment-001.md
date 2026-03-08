# UT-10A-E-D-001 - タスク指示書

## メタ情報

```yaml
issue_number: 1054
```

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | UT-10A-E-D-001                     |
| タスク名   | quality gate lint コマンドパス整合 |
| 分類       | 改善                               |
| 優先度     | 低                                 |
| ステータス | 未実施                             |
| 発見元     | TASK-10A-E-D Phase 10 MINOR        |
| 発見日     | 2026-03-08                         |

---

## 1. なぜこのタスクが必要か（Why）

`apps/desktop/package.json` に `lint` script が無い状態で `pnpm lint` 前提の品質ゲート定義が残ると、運用時に Gate 2 が誤停止するため。

## 2. 何を達成するか（What）

品質ゲートの lint 実行パスを実装と仕様で一致させる。

## 3. どのように実行するか（How）

1. 実行方式を決定（A: `apps/desktop` に `lint` script 追加 / B: ルート `pnpm lint` に統一）
2. 決定方式で `task-043d` / `TASK-10A-G` 関連文書のコマンドを更新
3. `task-workflow.md` に完了記録を反映

## 4. 実行手順

1. `apps/desktop/package.json` の `lint` script 有無を確認
2. A/B いずれかでコマンドを統一
3. 文書更新後に lint と監査コマンドを実行

## 5. 完了条件チェックリスト

- [ ] `lint` 実行コマンドが仕様と実装で一致
- [ ] `verify-all-specs` が PASS
- [ ] `audit-unassigned-tasks --diff-from HEAD` で `currentViolations=0`

## 6. 検証方法

- `pnpm lint` または `cd apps/desktop && pnpm lint`（採用方式側）
- `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <target>`

## 7. リスクと対策

- リスク: 統一前に運用開始して Gate 2 が停止
- 対策: TASK-10A-G 着手前に本タスクを先行消化

## 8. 参照情報

- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-043d-test-quality-gate-design.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

## 9. 備考

- 本タスクは仕様・運用整合が目的で、機能追加は含まない。
