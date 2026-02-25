# task-imp-ipc-preload-extension-spec-alignment-001

## メタ情報

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| タスクID   | UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 |
| 優先度     | 中                                              |
| ステータス | 完了                                            |
| 発見元     | UT-SKILL-IPC-PRELOAD-EXTENSION-001 Phase 10/12  |
| 作成日     | 2026-02-25                                      |
| 完了日     | 2026-02-25                                      |
| 関連タスク | UT-SKILL-IPC-PRELOAD-EXTENSION-001              |

## 1. なぜこのタスクが必要か（Why）

UT-SKILL-IPC-PRELOAD-EXTENSION-001 の再監査で、以下3点の差分が残存した。

1. 参照資料 `references/06-known-pitfalls.md` が現行配置と不一致。
2. task-9系の一部に `apps/desktop/src/main/ipc/channels.ts` 記述が残り、現行実体（`apps/desktop/src/preload/channels.ts`）と差分がある。
3. `task-012` 推奨チャネル名と task-9 正本チャネル名の差分があり、後続実装時に命名ドリフトを起こす可能性がある。

放置すると、実装開始時にP44/P45系の契約ドリフトとレビュー手戻りが発生する。

## 2. 何を達成するか（What）

- 参照切れ、パス差分、命名差分を単一タスクで解消する。
- task-9D〜9J 仕様書の artifacts/チャネル記述を現行構成に正規化する。
- 参照資料の実在確認を機械検証可能な形で記録する。

成果物:

- task-9D〜9J 更新版
- 差分解消チェックリスト
- 検証ログ（参照パス存在、チャネル命名一致）

## 3. どのように実行するか（How）

### 前提

- 実装コードは変更しない（仕様書更新のみ）。
- `UT-SKILL-IPC-PRELOAD-EXTENSION-001` の outputs を参照して整合する。

### 方針

- 正本優先: task-9仕様書のチャネルを正本とし、task-012推奨案は説明注記として扱う。
- 現行構成優先: `preload/channels.ts` を正本パスとして統一する。
- 監査優先: 参照切れは代替参照を明記した上で修正する。

## 4. 実行手順

1. task-9D〜9JのIPCチャネル記述を抽出する。
2. `main/ipc/channels.ts` 記述を `preload/channels.ts` へ統一する。
3. `06-known-pitfalls.md` 参照の実在パスを確認し、必要なら参照先を差し替える。
4. チャネル命名差分（例: schedule add/create）を正本に寄せる。
5. 変更後に `verify-all-specs.js --strict` と `verify-unassigned-links.js` を実行する。

## 5. 完了条件チェックリスト

- [ ] task-9D〜9J の参照パス差分が0件
- [ ] 参照資料の実在確認がPASS
- [ ] チャネル命名差分が解消
- [ ] 変更内容が task-workflow.md に反映
- [ ] 検証スクリプト2種がPASS

## 6. 検証方法

```bash
rg -n "main/ipc/channels.ts|preload/channels.ts" docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023*.md docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md

rg -n "06-known-pitfalls.md" docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001 docs/30-workflows/skill-import-agent-system/tasks

node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001 --strict
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

## 7. リスクと対策

| リスク                                 | 影響                 | 対策                                       |
| -------------------------------------- | -------------------- | ------------------------------------------ |
| task-012推奨案との記述差異を誤って破壊 | 正本の意味が失われる | task-9を正本、task-012は補助資料として扱う |
| 参照切れ修正時の過修正                 | 他タスク参照へ波及   | 変更対象をtask-9D〜9J周辺に限定            |
| 大量ファイル更新の見落とし             | 差分再発             | grep + スクリプト検証を完了条件に固定      |

## 8. 参照情報

- `docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/outputs/phase-10/open-items.md`
- `docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/outputs/phase-12/documentation-changelog.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`

## 9. 備考

- 本未タスクは仕様書整合専用であり、コード実装は対象外。
- `completed-tasks/unassigned-task/` への移管を完了済み。
