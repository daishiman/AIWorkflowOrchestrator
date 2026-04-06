# Phase 12: 未タスク検出レポート

## 検出日: 2026-04-06

## 検出ソース

- `apps/desktop/src/main/services/runtime/governance/` 内の TODO/FIXME
- Phase 3 / Phase 10 の MINOR 判定指摘事項
- 実装時に発見した改善候補

## 検出結果

### TODO コメント

| ファイル                          | 行     | 内容                                                    | 分類                        |
| --------------------------------- | ------ | ------------------------------------------------------- | --------------------------- |
| `SkillCreatorPermissionPolicy.ts` | L184   | `TODO(TASK-P0-09-U1): context はまだ Facade から未供給` | TASK-P0-09-U1 carry-forward |
| `RuntimeSkillCreatorFacade.ts`    | 複数行 | `_input` 未使用（U1 carry-forward コメント）            | TASK-P0-09-U1 carry-forward |

### TASK-P0-09-U1 carry-forward 一覧

上記 TODO は既知の carry-forward であり、以下の未タスクとして管理済み:

- `docs/30-workflows/unassigned-task/TASK-P0-09-U1-governance-actual-enforcement-completion.md`
- `docs/30-workflows/unassigned-task/TASK-P0-09-U1-path-scoped-governance-runtime-enforcement.md`

### 検出したが未タスクにしない（将来スコープ / false positive）

本タスクの基準で正式な未タスクには昇格しないメモ:

- `audit sink 永続化`: in-memory → ファイル/DB への書き出しは将来スコープ（P0-09 本体では未タスク化しない）
- `getGovernanceState() IPC handler 追加`: false positive（`creatorHandlers.ts` で既に登録済みのため未タスク不要）

**新規未タスク件数: 0件（TASK-P0-09-U1 として管理済み分を除く）**

## 結論

P0-09 本体のスコープ内での未解決 TODO は 0 件。
U1 carry-forward の 2 件は既知であり、TASK-P0-09-U1 として管理されている。

**作成日**: 2026-04-06
