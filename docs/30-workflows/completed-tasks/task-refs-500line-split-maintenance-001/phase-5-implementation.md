# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 5                                                   |
| Phase名    | 実装                                                |
| 機能名     | refs-500line-split-maintenance                      |
| 対象機能   | TASK-REFS-500LINE-SPLIT-001 References ファイル分離 |
| 前提Phase  | Phase 4                                             |
| 次Phase    | Phase 6: テスト拡充                                 |
| ステータス | pending                                             |
| 作成日     | 2026-04-07                                          |

## 目的

Phase 2 で設計した分離計画に従い、実際にファイルを分離する。
aiworkflow-requirements 系（Group A/B/C）と task-specification-creator 系（Group D）を**並列実行**する。

## 実行タスク

### Task 1: ブランチ確認

```bash
git status
git branch --show-current
```

### Task 2: Group A — aiworkflow-requirements 最高優先ファイル（並列実行可能）

#### 2-A-1: task-workflow-completed.md（2,444行）の分離

```bash
# 現在の行数確認
wc -l .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md

# セクション確認
grep "^## " .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md
```

分離手順:

1. 分離計画書（`outputs/phase-2/split-plan.md`）を参照
2. セクションごとに新規ファイルへ切り出し
3. 親ファイルを目次・概要に縮小
4. SKILL.md の `### 完了タスク` セクションを更新

### Task 3: Group D — task-specification-creator 系ファイル（Group A と並列実行可能）

#### 3-D-1: patterns.md（2,225行）の分離

```bash
# 既存子ファイル確認
ls .claude/skills/task-specification-creator/references/patterns*.md
wc -l .claude/skills/task-specification-creator/references/patterns*.md
```

分離手順:

1. 既存子ファイルへの移動が可能なセクションを特定
2. 既存子ファイルへコンテンツを移動
3. `patterns.md` を目次・概要ファイルに縮小（200行以内目標）
4. SKILL.md の参照を確認・更新

#### 3-D-2: phase-templates.md（1,247行）の分離

```bash
wc -l .claude/skills/task-specification-creator/references/phase-templates.md
ls .claude/skills/task-specification-creator/references/phase-template*.md
```

分離手順:

1. 既存の `phase-template*.md` へ移動できるセクションを特定する
2. 重複を避けて内容を移動する（同名テンプレートを二重に持たない）
3. `phase-templates.md` を目次・インデックスに縮小する

#### 3-D-3: spec-update-workflow.md（974行）の分離

```bash
wc -l .claude/skills/task-specification-creator/references/spec-update-workflow.md
ls .claude/skills/task-specification-creator/references/spec-update*.md
```

分離手順:

1. Step/validation の詳細は既存の `spec-update-*.md` に寄せる
2. `spec-update-workflow.md` は index（判断フロー、リンク集）に縮小する

#### 3-D-4: phase-11-12-guide.md の分離

```bash
wc -l .claude/skills/task-specification-creator/references/phase-11-12-guide.md
```

分離手順:

1. 実行ガイドを「Phase 11」と「Phase 12（+補足）」で責務分割する
2. 入口ファイルは読み込み条件とリンク集に絞る

#### 3-D-5: patterns-parallel-ipc.md の分離

```bash
wc -l .claude/skills/task-specification-creator/references/patterns-parallel-ipc.md
```

分離手順:

1. parallel 実行パターンと IPC パターンが混在している場合は concern で分割する
2. 参照元（patterns.md / SKILL.md）から辿れる導線を維持する

### Task 4: Group B — aiworkflow-requirements 高優先ファイル

（Group A/D 完了後に実行）

lessons-learned 系 3 件の分離:

- `lessons-learned-current.md`（1,299行）
- `lessons-learned-phase12-workflow-lifecycle.md`（1,269行）
- `lessons-learned-ipc-preload-runtime.md`（728行）

### Task 5: Group C — aiworkflow-requirements 中・低優先ファイル

（Group B 完了後に実行。並列実行推奨）

残り全ファイルを分離。

### Task 6: SKILL.md の更新

```bash
# 正本の更新
# .claude/skills/aiworkflow-requirements/SKILL.md
# .claude/skills/task-specification-creator/SKILL.md
```

### Task 7: indexes/topic-map.md / indexes/keywords.json の再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/task-refs-500line-split-maintenance-001 --regenerate
```

### Task 8: mirror 同期

```bash
# .agents を .claude に揃える
rsync -av --delete .claude/skills/aiworkflow-requirements/references/ .agents/skills/aiworkflow-requirements/references/
rsync -av --delete .claude/skills/aiworkflow-requirements/indexes/ .agents/skills/aiworkflow-requirements/indexes/
rsync -av --delete .claude/skills/task-specification-creator/references/ .agents/skills/task-specification-creator/references/
rsync -av --delete .claude/skills/task-specification-creator/indexes/ .agents/skills/task-specification-creator/indexes/
rsync -av .claude/skills/aiworkflow-requirements/SKILL.md .agents/skills/aiworkflow-requirements/SKILL.md
rsync -av .claude/skills/task-specification-creator/SKILL.md .agents/skills/task-specification-creator/SKILL.md
```

## 新規作成ファイル一覧（実装計画から追記する）

| ファイルパス                       | 内容 | 親ファイル |
| ---------------------------------- | ---- | ---------- |
| （Phase 2 成果物に基づき記入する） |      |            |

## 参照資料

| 資料名     | パス                                       | 説明             |
| ---------- | ------------------------------------------ | ---------------- |
| 分離計画書 | `outputs/phase-2/split-plan.md`            | 実装の主参照資料 |
| 検証基準書 | `outputs/phase-4/verification-criteria.md` | TC-01〜TC-06     |

## 成果物

| 成果物       | パス                                        | 説明                       |
| ------------ | ------------------------------------------- | -------------------------- |
| 実装ログ     | `outputs/phase-5/implementation-log.md`     | 変更ファイル一覧と行数変化 |
| 分離実行記録 | `outputs/phase-5/split-execution-record.md` | 各グループの実行結果       |

## 完了条件

- [ ] 全対象ファイルが 499 行以内に縮小されている（`wc -l` 確認）
- [ ] SKILL.md が更新されている
- [ ] indexes/topic-map.md / indexes/keywords.json が再生成されている
- [ ] mirror 同期が完了している
- [ ] コードファイルへの変更がゼロ（`git diff --stat` 確認）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] TC-01 が PASS（500 行超ファイル 0 件）

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
