# Spec Update Step 1-G 検証コマンド詳細

> 親ファイル: [spec-update-workflow.md](spec-update-workflow.md)
> 読み込み条件: Phase 12 Task 2 の Step 1-G（検証コマンド順次実行）を実施するとき。

---

## Step 1-G: 検証コマンド順次実行（Phase 12同期ガード）

Phase 12 Task 2 の更新後は、以下を**この順序で**実行する。

- 前提: すべてのコマンドは **リポジトリルート**（`AIWorkflowOrchestrator/`）をカレントディレクトリとして実行する。

---

### 1. 未タスク参照リンク検証

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

- 正常時: `ALL_LINKS_EXIST` が出力され、exit code 0
- 異常時: `missing` と欠損パスが出力されるため、該当参照を修正して再実行
- 注意: repo 全体 baseline 欠損が多い場合でも、今回追加した未タスクは `--target-file` 監査で current/baseline を分離して評価する

---

### 2. 索引再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js
git diff --stat -- .claude/skills/*/indexes/topic-map.md .claude/skills/*/indexes/keywords.json
```

- 正常時: 再生成コマンドが exit code 0
- 異常時: コマンド失敗、または意図しない差分が残る。差分内容を確認し必要箇所を反映

---

### 3. SKILL 検証（全3スキル: 正規経路）

個別実行:

```bash
# 正規経路（primary）: quick_validate.js（Node.js v18以上）
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

- 正常時: 全3スキルで Error 0件（終了コード 0）
- 異常時: Error の内容を確認し、SKILL構造を修正後に再実行

**補助経路（fallback）の使用条件:**

以下の**全条件**を満たす場合のみ、`quick_validate.py` を使用してよい:

1. Node.js ランタイム（v18以上）が利用不可である
2. Python 3.10 以上がインストールされている
3. PyYAML ライブラリがインストールされている

```bash
# 補助経路（Node.js が利用不可の場合のみ）
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/aiworkflow-requirements
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
```

補助経路使用時は `documentation-changelog.md` に「補助経路を使用した」旨を明記する。

全3スキル一括検証:

```bash
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done
```

---

### 3.1 検証結果の判定基準

**合格基準**: Error 0件で合格。Warning は合否に影響しないが、以下の3段階分類に基づき対応する。

**Warning 3段階分類:**

| 分類   | 定義                                                                   | 対応方針                                                       | 具体例                                                                                                     |
| ------ | ---------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 許容   | 運用上避けられない Warning で、修正コストが高く機能影響がない          | 件数を記録し、前回比で増加傾向がないことを確認する             | `aiworkflow-requirements` の大量 reference ファイルの参照リンク警告（Progressive Disclosure 設計に起因）   |
| 要監視 | 新規に発生した Warning で、放置すると品質低下の兆候となる              | 次回 Phase 12 までに対応方針（修正/許容昇格/未タスク化）を決定 | 新規追加した reference ファイルが SKILL.md からリンクされていない                                         |
| 要対応 | 機能やスキル構造の正確性に直接影響する Warning で、本Phase内で修正必要 | 本 Phase 内で修正する。修正不可の場合は未タスク化              | agents/*.md の必須セクション不足、name フィールドとディレクトリ名の不一致                                 |

**判定フロー:**

```
Warning 発生
  │
  ├─ [Q1] 当該 Warning は Phase 5 以前から存在する既知の Warning か？
  │   │    判定方法: 前回の Phase 12 検証記録（documentation-changelog.md）
  │   │    に同一パターンの Warning が記録されているか確認する。
  │   │    ※ 初回実行時（前回記録なし）は全て NO として扱う。
  │   │
  │   ├─ YES → [Q2] 前回比で件数が増加しているか？
  │   │   │
  │   │   ├─ YES → 「要監視」に分類
  │   │   │
  │   │   └─ NO → 「許容」に分類
  │   │
  │   └─ NO → [Q3] スキルの動作・構造の正確性に直接影響するか？
  │       │    判定基準:
  │       │    - name フィールドとディレクトリ名の不一致 → YES
  │       │    - agents/*.md の必須セクション不足 → YES
  │       │    - SKILL.md の 500行制限超過 → YES
  │       │    - 不要な補助ドキュメント（README.md等）の存在 → YES
  │       │    - references/ 内ファイルの SKILL.md リンク切れ → NO
  │       │    - description の Anchors/Trigger 未記載 → NO
  │       │
  │       ├─ YES → 「要対応」に分類
  │       │
  │       └─ NO → 「要監視」に分類
```

**大規模 references スキルの許容条件:**

`references/` 配下のファイル数が20件以上のスキルで、ファイルが SKILL.md からリンクされていない場合、以下の条件を**全て**満たせば「許容」と判定する:

1. 該当ファイルが `indexes/resource-map.md` または `indexes/topic-map.md` からリンクされている
2. 該当ファイルの内容がスキルの目的に関連する

許容条件に該当しないファイルは「要監視」に分類する。

**既知の制限事項（未タスク / 解消済み）:**

- 未タスク（対応中）: BOM付きUTF-8の SKILL.md で frontmatter 検出が失敗する
- 解消済み: name/description フィールド空値で `desc.toLowerCase()` ランタイムエラー

---

### 4. Phase仕様書参照と outputs 実体の整合確認

```bash
# 完了移管後の旧参照残存を検出
rg -n "docs/30-workflows/unassigned-task/task-.*\.md" docs/30-workflows/{{FEATURE_NAME}}/phase-*.md

# docs配下 outputs とルート outputs の差分確認（差分0が正常）
comm -3 \
  <(cd docs/30-workflows/{{FEATURE_NAME}}/outputs && find . -type f | sort) \
  <(cd outputs && find . -type f | sort)
```

- 正常時: `phase-*.md` に旧 `unassigned-task` 参照が残っていない、`comm -3` の出力が空
- 異常時: 完了済みタスクの参照を `completed-tasks` に更新し、旧成果物・`.tmp-*` 一時ファイルを削除して再実行
- Phase 11 が completed の場合は `outputs/phase-11/manual-test-checklist.md` の存在も確認する

---

## Step 1-G.1: baseline / current 分離監査（全体FAIL誤判定防止）

監査FAIL時は、以下で `baseline` と `current` を分離する。

```bash
# 1) 全体監査（既存違反を含む）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json

# 1.5) 対象ファイル監査（今回差分の current を抽出）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/<task>.md | \
  jq '{scope, current_total: .currentViolations.total, baseline_total: .baselineViolations.total}'

# 2) 今回差分の候補抽出（変更範囲を指定）
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001 \
  --output docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-12/.tmp-unassigned-candidates.json

# 3) Phase出力構造の整合確認（位置引数）
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/<workflow-dir>
```

判定ルール:

- `baseline`: 着手前から存在する違反。スコープ外として記録し、別途改善対象化
- `current`: 今回変更で新規発生した違反。今回タスク内で修正必須
- `--target-file`: 対象のみを表示する機能ではなく、`current/baseline` を分類する機能
- `--target-file` の有効範囲: `docs/30-workflows/unassigned-task/` または `docs/30-workflows/completed-tasks/unassigned-task/` 配下のみ

記録フォーマット:

```text
audit-unassigned-tasks: 全体 <PASS/FAIL>（baseline: N件, current: M件）→ current <PASS/FAIL>
```

補足:

- `current = 0` でも repo 全体 `baseline` が非 0 の場合は、その差を `documentation-changelog.md` と `phase12-task-spec-compliance-check.md` に明記する
- `verify-unassigned-links.js` が repo 全体欠損で失敗する場合も、今回追加した `target-file` の current を PASS 根拠として別記録する

---

## 新規仕様の追加手順

```bash
# 1. テンプレートをコピー
cp .claude/skills/aiworkflow-requirements/assets/spec-template.md \
   .claude/skills/aiworkflow-requirements/references/{prefix}-{topic}.md

# 2. 内容を記述（spec-guidelines.md参照）

# 3. インデックス再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```
