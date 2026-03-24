# Phase 12 成果物: 実装ガイド

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 12 - ドキュメント

---

## Part 1: 中学生レベルの概念説明

### 「3つの台帳管理」とは何か — 図書館の貸出カードで理解する

学校の図書館を想像してください。本を借りるときに3つのカードがあります。

**カード1: 「今借りている人リスト」（Workflow Ledger）**

誰がどの本を借りているか、返却期限はいつか、がすぐわかるカードです。
このプロジェクトでは `task-workflow.md` がこれにあたります。
「今どのタスクが進行中か」「完了したか」「まだ着手していないか」が一覧でわかります。

**カード2: 「本はどの棚にあるか一覧」（Canonical Source Table）**

本の正式な置き場所（正本）が決まっています。同じ本が2箇所に置いてあると混乱するので、
「この本の正式な置き場所は3番棚」と決めて、それ以外の棚は「コピー」と明記します。
このプロジェクトでは `.claude/skills/` が唯一の「正式な棚」です。
`.agents/skills/` は毎日コピーされる「複製棚」で、直接書き込んではいけません。

**カード3: 「過去の借り忘れ・返し忘れ記録」（Lessons Learned）**

過去に誰かが本を2回予約してトラブルになった、などの教訓を記録します。
同じミスが繰り返されないよう、`lessons-learned.md` に残します。
新しい教訓は `lessons-learned-current.md`（今期の教訓帳）に書き、
学期が終わったら `archive`（過去の教訓帳）に移します。

### 「同期プロトコル」とは何か — 郵便局の仕分け作業で理解する

毎日夕方、郵便局で手紙を仕分けする作業があります。順番を守らないと手紙が迷子になります。

| ステップ | 郵便局の例え                   | このプロジェクトでの作業                     |
| -------- | ------------------------------ | -------------------------------------------- |
| Step A   | 当日の配達済みリストを更新する | task-workflow.md / backlog を更新する        |
| Step B   | トラブル報告書を記録する       | lessons-learned.md を更新する                |
| Step C   | 本局マニュアルを更新する       | arch-_ / api-_ などシステム仕様書を更新する  |
| Step D   | 索引カードを再印刷する         | generate-index.js を実行して目次を再作成する |
| Step E   | 各支局にコピーを送る           | rsync で .agents/skills/ を同期する          |

このステップを **A → B → C → D → E の順番で実行すること** が重要です。
逆の順番にしたり、飛ばしたりすると、「支局のコピーが古いまま」になります。

### 「状態遷移」とは何か — 読書感想文の審査で理解する

夏休みの読書感想文には3つの状態があります。

1. **spec_created（設計完了）**: 先生に「この本を読んで感想文を書きます」と届け出た状態
2. **implementation_ready（実装準備完了）**: 感想文を書き終えて先生に提出した状態
3. **completed（完了）**: 先生が採点して評価を返してくれた状態

一度「採点済み」になった感想文を「書いている途中」に戻すことは通常ありません。
でも「大きな間違いが見つかった場合」だけは戻ることができます（rollback）。

設計タスク（この TASK の種別）は感想文のテーマを決めるだけの作業なので、
「書き終えたかどうかのテスト」は不要です。テーマ申請書（設計成果物）が揃えば OK です。

---

## Part 2: 開発者向け実装詳細

### 2.1 このタスクが解決する課題

| 課題ID | 課題                                                         | 影響                                        |
| ------ | ------------------------------------------------------------ | ------------------------------------------- |
| C-1    | 設計タスクと実装タスクで state 遷移条件が未分化だった        | 設計タスクに coverage gate が誤適用される   |
| C-2    | Phase 12 の5カテゴリ同期に明示的な順序が定義されていなかった | 同期の漏れ・順序逆転による diff 残存        |
| C-3    | legacy path の deprecation timeline が未定義だった           | bridge rule の無効期間が曖昧で drift が継続 |

### 2.2 Governance State Machine の適用手順

#### State 確認コマンド

```bash
# artifacts.json の status を確認
cat docs/30-workflows/completed-tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/outputs/artifacts.json \
  | grep '"status"'
```

#### Type 別 state 遷移条件

| 遷移先               | type: design の条件                           | type: implementation の条件                        |
| -------------------- | --------------------------------------------- | -------------------------------------------------- |
| spec_created         | Phase 3 PASS/MINOR + outputs/phase-1〜3/ 存在 | 同左                                               |
| implementation_ready | Phase 10 PASS + outputs/phase-1〜11/ 存在     | Phase 10 PASS + 全テスト PASS + coverage gate 充足 |
| completed            | Phase 12-13 完了 + PR マージ + branch 削除    | 同左                                               |

**注意**: 設計タスクでは `implementation_ready` への遷移にテスト実行・coverage gate は不要。
設計成果物の網羅性（outputs/phase-1〜11/ 全ファイル存在）のみで判定する。

#### Rollback 手順

| 現在の state         | rollback 先          | 実行する操作                                                          |
| -------------------- | -------------------- | --------------------------------------------------------------------- |
| spec_created         | (未作成)             | artifacts.json の status を `draft` に変更し Phase 1 から再開         |
| implementation_ready | spec_created         | artifacts.json の status を `spec_created` に変更し Phase 10 から再開 |
| completed            | implementation_ready | PR revert + branch 復元（手動操作）                                   |

### 2.3 Canonical Source Table の運用手順

#### 正本ファイル確認コマンド

```bash
# canonical root の存在確認
ls .claude/skills/aiworkflow-requirements/references/ | wc -l

# mirror との差分確認
diff -qr .claude/skills/ .agents/skills/ | head -20
```

#### ファイルカテゴリ別更新権限

| カテゴリ        | 正本パス                                                                | 更新タイミング       | 編集禁止パス           |
| --------------- | ----------------------------------------------------------------------- | -------------------- | ---------------------- |
| Workflow Ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow*.md`   | Phase 12 Step A      | `.agents/skills/` 以下 |
| Lessons Learned | `.claude/skills/aiworkflow-requirements/references/lessons-learned*.md` | Phase 12 Step B      | `.agents/skills/` 以下 |
| System Spec     | `.claude/skills/aiworkflow-requirements/references/arch-*.md` 等        | Phase 12 Step C      | `.agents/skills/` 以下 |
| Indexes         | `.claude/skills/aiworkflow-requirements/indexes/`                       | Phase 12 Step D のみ | 手動編集禁止           |
| Skill Meta      | `.claude/skills/aiworkflow-requirements/LOGS.md` 等                     | Phase 12 Step E      | `.agents/skills/` 以下 |

#### Legacy Bridge Rule の運用

```bash
# 旧パスの逆引き確認
cat .claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md

# 新規パス追加は .claude/ のみ（.agents/ への直接追加禁止）
# legacy register への新規追加禁止（既存エントリの参照専用）
```

### 2.4 Same-Wave Sync Protocol の実行手順

Phase 12 完了時に **Step A → B → C → D → E の順序で** 実行する。

#### Step A: Workflow Ledger 更新

```bash
# 対象ファイル（最大3ファイル/エージェント: P43 対策）
# - .claude/skills/aiworkflow-requirements/references/task-workflow.md
# - .claude/skills/aiworkflow-requirements/references/task-workflow-active.md
# - .claude/skills/aiworkflow-requirements/references/task-workflow-completed-*.md
# - .claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md

# 更新後の確認
git diff --stat -- .claude/skills/aiworkflow-requirements/references/task-workflow*.md
```

#### Step B: Lessons Learned 更新

```bash
# 対象ファイル
# - .claude/skills/aiworkflow-requirements/references/lessons-learned.md
# - .claude/skills/aiworkflow-requirements/references/lessons-learned-current.md

# current → baseline 移管判定（wave 完了時のみ）
# wave 完了条件: 親パック index の全 task が completed
```

#### Step C: System Spec 更新

```bash
# 対象ファイルを特定（最大3ファイル/エージェント: P43 対策）
grep -rn "TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001" \
  .claude/skills/aiworkflow-requirements/references/

# 更新対象（このタスクの場合）
# - task-workflow.md（タスク完了記録）
# - task-workflow-backlog.md（follow-up 登録）
```

#### Step D: Index 再生成

```bash
# generate-index.js を実行
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js

# 実行後の確認
ls -la .claude/skills/aiworkflow-requirements/indexes/topic-map.md
ls -la .claude/skills/aiworkflow-requirements/indexes/keywords.json
```

#### Step E: Mirror Sync + Skill Meta 更新

```bash
# LOGS.md 2ファイル更新（P1/P25 対策: 必ず両方）
# - .claude/skills/aiworkflow-requirements/LOGS.md
# - .claude/skills/task-specification-creator/LOGS.md

# SKILL.md 2ファイル変更履歴更新
# - .claude/skills/aiworkflow-requirements/SKILL.md
# - .claude/skills/task-specification-creator/SKILL.md

# Mirror Sync 実行
rsync -avz --checksum ./.claude/skills/ ./.agents/skills/

# 差分0件の確認
diff -qr ./.claude/skills/ ./.agents/skills/
# 出力が空 = 同期成功
```

### 2.5 サブエージェント中断時のリカバリ手順（P43 対策）

```bash
# 1. 実際に更新されたファイルを確認
git diff --stat -- .claude/skills/

# 2. documentation-changelog.md との照合
#    changelog の "完了" 記録と実際の diff ファイル数を比較

# 3. 未完了 Step を特定して再実行
#    indexes/ ディレクトリに変更がない場合 → Step D が未完了
#    .agents/skills/ に変更がない場合 → Step E が未完了
```

### 2.6 Follow-up Formalization の3ステップ

未タスクを発見した場合（0件でも以下を確認）:

| ステップ | 操作                                                                       | 配置先                                               |
| -------- | -------------------------------------------------------------------------- | ---------------------------------------------------- |
| Step 1   | 独立した指示書ファイルを作成する                                           | `docs/30-workflows/unassigned-task/` 以下            |
| Step 2   | task-workflow-backlog.md の残課題テーブルに行を追加する                    | `.claude/skills/aiworkflow-requirements/references/` |
| Step 3   | 発見元仕様書に参照リンクを追加する                                         | 発見元ファイルの該当セクション                       |
| Issue    | 再評価クローズ時は `gh issue close <number> --comment "再評価クローズ..."` | GitHub Issues（P56 対策）                            |

**重要**: 設計タスクでも Step 1〜3 は省略不可（P3/P38/P58 対策）。

### 2.7 Current / Baseline 切り分け手順

| 区分     | 記録場所                                       | 移管条件                                              |
| -------- | ---------------------------------------------- | ----------------------------------------------------- |
| Current  | `lessons-learned-current.md`                   | wave 進行中（移管不要）                               |
| Baseline | `lessons-learned-archive-YYYY-MM-*.md` 等      | wave 完了宣言後に手動移管                             |
| 移管判定 | 親パック index の全 task が `completed` か確認 | `grep '"status": "completed"' outputs/artifacts.json` |
