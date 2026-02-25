# TASK-013 再監査 実装ガイド

## Part 1: 中学生向け（なぜ必要か）

### これは何をしているか

今回の作業は「点検で見つけた問題メモ」を、そのまま放置せず「次に誰が何をするか」まで決める作業です。

### 日常の例え

学校の掃除で「ここが汚れてる」と付箋だけ貼って終わると、次の日も同じ場所が汚れたままになります。

- 付箋を貼るだけ: 監査結果だけある状態
- 掃除当番表まで作る: 次アクションまで決めた状態

今回やったのは後者です。

### 何が良くなるか

- 次に着手するタスクが迷わない
- 仕様書と実装のズレが再発しにくい
- 「どこまで終わったか」が見える

## Part 2: 技術者向け（何をどうやるか）

### 実施内容

1. TASK-013の再監査結果を `task-00` 配下へアクション計画として再定義
2. Phase 12 必須5タスクの証跡を `outputs/phase-12/` に標準出力
3. 未タスク台帳を再点検し、誤検知は再評価クローズ化
4. aiworkflow-requirements / task-specification-creator / skill-creator へ苦戦箇所を反映
5. `completed-tasks/unassigned-task/` に混在していた未実施6件を `unassigned-task/` へ是正

### 変更対象

- `task-00-unified-implementation-sequence/task-013e-phase12-action-bridge.md`（新規）
- `task-000-master-index.md`（リンク追加）
- `task-013-task9-ui-backend-consistency-improvements-001.md`（ステータス・導線更新）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`（苦戦箇所追記）
- `.claude/skills/skill-creator/references/patterns.md`（Phase 12パターン追記）
- `docs/30-workflows/unassigned-task/`（未実施6件の再配置）

### エッジケース

- `audit-unassigned-tasks.js` は全体baseline違反を含むため、current差分判定を別レポート化する
- 未タスクの「完了」と「再評価クローズ」は区別して記録する

### 実行コマンド

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js --scan docs/30-workflows/completed-tasks/task-013-subagent-team --output .tmp/task013-phase12-unassigned.json
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/aiworkflow-requirements
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/task-specification-creator
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/skill-creator
```
