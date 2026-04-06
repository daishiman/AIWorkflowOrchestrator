# Phase 12 成果物: Implementation Guide

docs-only same-wave remediation（UT-IMP-SDK-02 + SDK-04）のため、**コード変更なし**。対象はドキュメントファイルのみ。

---

## Part 1: なぜこのタスクが必要か

### なぜ必要か

本棚のラベルと実際の棚の場所が一致していないと、利用者は本を見つけられない。たとえば、TASK-SDK-04 の完了記録に `step-04-par-task-04` と書いてあっても、実際のファイルは `completed-tasks/step-03-par-task-04` に移動済みであれば、リンクを辿った先は存在しないディレクトリになる。

また `SkillCreatorWorkflowEngine` が仕様書上で「将来実装予定（future）」のままだと、そのコンポーネントは「まだ動かない」と誤解される。実際には実装・稼働済みであり、仕様書の記述が現実と乖離している状態がこのタスクの根本問題である。

### 何をしたか（この機能でできること）

- **SDK-04**: `task-workflow-completed.md` L300 の stale path 1件を current path へ置換
- **SDK-04**: resource-map.md / quick-reference.md / topic-map.md — stale path 不在のため no-op 確認
- **SDK-02**: architecture-overview-core.md / arch-electron-services-details-part2.md / api-ipc-system-core.md — already current のため no-op 確認
- **mirror parity**: `.agents/skills/` 配下を `.claude/skills/` と同期（13件）

---

## Part 2: 技術的詳細

### TypeScript 型定義

このタスクで扱うデータ構造の概念型：

```typescript
interface StalePath {
  file: string; // 対象ファイルのパス
  line: number; // 変更した行番号
  from: string; // 変更前のパス文字列
  to: string; // 変更後のパス（current path）
}

type RemediationResult = {
  actualChanges: StalePath[]; // 実作業（path 置換）
  noOp: string[]; // no-op 確認ファイル一覧
  codeChanges: number; // 常に 0（docs-only 制約）
};
```

### CLIシグネチャ

path drift 検出・確認の grep コマンド一覧：

```bash
# AC-9: stale path 検出
rg "skill-creator-agent-sdk-lane.*step-03" .claude/skills/aiworkflow-requirements/
rg "step-04-par-task-04-user-interaction-bridge" .claude/skills/aiworkflow-requirements/

# AC-8: 未完了表現検出（task scope）
rg "更新予定|後でやる|後続判断待ち|仕様策定のみ|実行予定|保留として記録" \
  .claude/skills/aiworkflow-requirements/references/ \
  .claude/skills/aiworkflow-requirements/indexes/

# AC-1/2/3: SDK-02 future 表現検出
rg "future|将来的には|実装予定" \
  .claude/skills/aiworkflow-requirements/references/architecture-overview-core.md

# AC-10: コード変更なし確認
git diff --name-only | grep -v "^\.claude\|^docs"
```

### 使用例

path drift 修正の実際の操作例：

```bash
# 1. stale path を特定する
rg "step-04-par-task-04-user-interaction-bridge" \
  .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md

# 2. 行番号と内容を確認する
grep -n "step-04-par-task-04" \
  .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md

# 3. Edit ツールで 1行置換後に検証する
rg "step-04-par-task-04-user-interaction-bridge" .claude/skills/aiworkflow-requirements/
# → 0件が期待値

# 4. mirror parity を sync する
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
# → diff があるファイルを cp で同期
```

### エラーハンドリング

本タスクで発生した既知の問題と対処：

| 状況                                            | 原因                                                              | 対処                                              |
| ----------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------- |
| `aiworkflow-requirements` validate_all: 1 error | SKILL.md が 573行（> 500行制限）— pre-existing                    | 本タスクのスコープ外。別タスクで対処              |
| 未完了表現 grep 14件                            | lesson-learned archive での引用（scope 外の pre-existing）        | task scope 対象ファイルへの実更新は 0件で問題なし |
| `validate-phase-output.js` 10 errors（初回）    | Phase 2-11 spec ファイルに `## 統合テスト連携` セクションが未記載 | 全 10 ファイルにセクションを追加して解消          |

### エッジケース

SDK-04 の stale path は 2パターン（`skill-creator-agent-sdk-lane.*step-03` と `step-04-par-task-04`）を個別に検証する必要がある。前者のみ確認すると後者の drift を見落とす。

no-op ファイルの「変更なし」は根拠付きで記録必須。記録がない場合、後続の diff 検証で意図不明となる。

### 定数一覧

| 定数名                    | 値                                                                                            | 説明                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `STALE_PATH_PATTERN_1`    | `skill-creator-agent-sdk-lane.*step-03`                                                       | rg パターン（SDK-04 検出）                            |
| `STALE_PATH_PATTERN_2`    | `step-04-par-task-04-user-interaction-bridge`                                                 | rg 補足パターン                                       |
| `CURRENT_PATH`            | `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/` | 置換後の current path                                 |
| `INCOMPLETE_EXPR_PATTERN` | `更新予定\|後でやる\|後続判断待ち\|仕様策定のみ\|実行予定\|保留として記録`                    | 未完了表現 rg パターン（AC-8）                        |
| `CANONICAL_SET`           | `.claude/skills/`                                                                             | mirror の源泉。`.agents/skills/` はこちらを基準に同期 |
