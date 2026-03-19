# 未タスク検出レポート - TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001

## 検出日: 2026-03-19

## 検出件数: 1件

### UT-IMP-SKILL-UPDATE-BUSINESS-LOGIC-001

| 項目         | 値                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| 種別         | 実装                                                                                                      |
| 優先度       | Medium                                                                                                    |
| 発見Phase    | Phase 5                                                                                                   |
| 内容         | SkillService.updateSkill() が現在スタブ実装（ログ出力のみ）。実際のスキルファイル更新ロジックの実装が必要 |
| 対象ファイル | apps/desktop/src/main/services/skill/SkillService.ts L136                                                 |
| 備考         | TODOコメント「実際の更新ロジックを実装する（後続タスクで対応）」                                          |

## P3準拠 3ステップ完了状態

| ステップ | 内容                 | 状態 | 確認先                                                                                        |
| -------- | -------------------- | ---- | --------------------------------------------------------------------------------------------- |
| ①        | 指示書作成           | 完了 | `docs/30-workflows/unassigned-task/task-ut-imp-skill-update-business-logic-001.md`            |
| ②        | 残課題テーブル登録   | 完了 | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` L13              |
| ③        | 関連仕様書リンク追加 | 完了 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md` L46 |

## current / baseline 監査

| コマンド                                                                                                                                           | 結果                                            | 解釈                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| `audit-unassigned-tasks.js --json --diff-from HEAD`                                                                                                | `currentViolations=0`, `baselineViolations=157` | 今回差分は準拠。repo 全体の legacy 未タスク負債は継続 |
| `audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-ut-imp-skill-update-business-logic-001.md` | `currentViolations=0`, `baselineViolations=157` | 本未タスク指示書は今回差分として違反なし              |
| `verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-contract-preload-alignment.md`  | `total=1`, `existing=1`, `missing=0`            | 今回 task の completed record からの参照切れなし      |

## 検出方法

```bash
grep -rn "TODO\|FIXME" \
  apps/desktop/src/main/ipc/skillHandlers.ts \
  apps/desktop/src/preload/skill-api.ts \
  apps/desktop/src/main/services/skill/SkillService.ts
```

**結果:**

```
apps/desktop/src/main/services/skill/SkillService.ts:136:    // TODO: 実際の更新ロジックを実装する（後続タスクで対応）
```

- `skillHandlers.ts`: TODOなし
- `skill-api.ts`: TODOなし
- `SkillService.ts`: L136 に1件

## P52対策: non-null assertion 残存確認

```bash
grep -n '[a-zA-Z0-9_\])]!\.' \
  apps/desktop/src/main/ipc/skillHandlers.ts \
  apps/desktop/src/preload/skill-api.ts \
  apps/desktop/src/main/services/skill/SkillService.ts
```

**結果:** 対象3ファイルすべてに non-null assertion の残存なし（マッチ0件）。

## Phase 10/11 発見課題との照合

| 発見元   | 内容                                                         | 対応状況                                        |
| -------- | ------------------------------------------------------------ | ----------------------------------------------- |
| Phase 10 | `updateSkill()` 具体ロジックは out-of-scope として未タスク化 | UT-IMP-SKILL-UPDATE-BUSINESS-LOGIC-001 で管理中 |
| Phase 11 | `updateSkill()` がスタブで永続化・バリデーションが未定義     | 同上                                            |

## 結論

検出された未タスクは1件。P3準拠の3ステップ（指示書・残課題テーブル・関連仕様書リンク）はすべて完了済み。今回差分監査は `currentViolations=0` で合格。`baselineViolations=157` は既存 legacy backlog であり、本タスク起因の不合格理由ではない。
