# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 2                                                   |
| Phase名    | 設計                                                |
| 機能名     | refs-500line-split-maintenance                      |
| 対象機能   | TASK-REFS-500LINE-SPLIT-001 References ファイル分離 |
| 前提Phase  | Phase 1                                             |
| 次Phase    | Phase 3: 設計レビュー                               |
| ステータス | pending                                             |
| 作成日     | 2026-04-07                                          |

## 目的

Phase 1 で確定した分離基準に基づき、各ファイルの具体的な分離計画（どのセクションをどのファイルへ）を設計する。

## 実行タスク

### Task 1: aiworkflow-requirements 系ファイルの分離設計

#### 1-A: task-workflow-completed.md（2,444行）の分離設計

```bash
# セクション構造確認
grep "^## \|^### " .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md | head -40
```

分離方針:

- 期間別または機能フェーズ別に 3〜5 ファイルへ分離
- 命名例: `task-workflow-completed-core.md`, `task-workflow-completed-sdk.md`, `task-workflow-completed-ui.md`

#### 1-B: lessons-learned-current.md（1,299行）の分離設計

分離方針:

- Phase 別または機能ドメイン別に 2〜3 ファイルへ分離
- 命名例: `lessons-learned-current-phase12.md`, `lessons-learned-current-testing.md`

#### 1-C: lessons-learned-phase12-workflow-lifecycle.md（1,269行）の分離設計

分離方針:

- ライフサイクル段階別に 2〜3 ファイルへ分離
- 命名例: `lessons-learned-phase12-start.md`, `lessons-learned-phase12-close.md`

#### 1-D: api-ipc-system-core.md（958行）の分離設計

分離方針:

- API セクションと IPC セクションを分離
- 命名例: `api-system-core.md`, `ipc-system-core.md`

#### 1-E: その他中・低優先ファイルの分離設計

各ファイルについて Phase 1 のセクション分析結果に基づいて設計する。

### Task 2: task-specification-creator 系ファイルの分離設計

#### 2-A: patterns.md（2,225行）の分離設計

既存子ファイル確認:

```bash
ls .claude/skills/task-specification-creator/references/patterns*.md
```

分離方針:

- 既存子ファイル（`patterns-workflow-generation.md` 等）との重複排除
- `patterns.md` 自体を目次・概要ファイルに縮小（100行以内）
- 残ったセクションを既存子ファイルへ移動

#### 2-B: phase-templates.md（1,247行）の分離設計

既存子ファイル確認:

```bash
ls .claude/skills/task-specification-creator/references/phase-template*.md
```

分離方針:

- 既存子ファイル（`phase-template-core.md` 等）への内容移動
- `phase-templates.md` を目次・インデックスに縮小

#### 2-C: spec-update-workflow.md（974行）の分離設計

既存子ファイル確認:

```bash
ls .claude/skills/task-specification-creator/references/spec-update*.md
```

分離方針:

- 既存 Step ファイルへの内容移動
- 主ファイルを概要・フロー図のみに縮小

#### 2-D: phase-11-12-guide.md / patterns-parallel-ipc.md の分離設計

分離方針:

- H2 セクション境界で 2 分割

### Task 3: SKILL.md / index 更新設計

各スキルの SKILL.md に追加が必要なリソース導線を設計する:

```markdown
# 追加が必要なリソース導線（例）

- [references/task-workflow-completed-sdk.md](references/task-workflow-completed-sdk.md)
- [references/task-workflow-completed-ui.md](references/task-workflow-completed-ui.md)
```

各スキルで再生成が必要な index も同時に設計する:

- `aiworkflow-requirements/indexes/topic-map.md` / `aiworkflow-requirements/indexes/keywords.json`
- `task-specification-creator/indexes/topic-map.md` / `task-specification-creator/indexes/keywords.json`

### Task 4: 実行順序の設計

並列実行可能なグループを定義する:

| グループ | 対象スキル                            | 並列実行                   |
| -------- | ------------------------------------- | -------------------------- |
| Group A  | aiworkflow-requirements（最高優先）   | task-workflow-completed.md |
| Group B  | aiworkflow-requirements（高優先）     | lessons-learned 系 3 件    |
| Group C  | aiworkflow-requirements（中・低優先） | その他 15 件               |
| Group D  | task-specification-creator（全件）    | patterns.md 系 5 件        |

Group A と Group D は同時並列実行可能。

## 参照資料

| 資料名           | パス                                | 説明               |
| ---------------- | ----------------------------------- | ------------------ |
| Phase 1 成果物   | `outputs/phase-1/file-inventory.md` | セクション構造一覧 |
| Phase 1 分離基準 | `outputs/phase-1/split-criteria.md` | 分離基準・命名規則 |

## 成果物

| 成果物     | パス                                    | 説明                         |
| ---------- | --------------------------------------- | ---------------------------- |
| 分離計画書 | `outputs/phase-2/split-plan.md`         | 各ファイルの分離先マッピング |
| 命名規則書 | `outputs/phase-2/naming-conventions.md` | 新規ファイル名の確定一覧     |

## 完了条件

- [ ] 全 24 件以上のファイルについて分離先が設計されている
- [ ] SKILL.md 更新内容が設計されている
- [ ] 並列実行グループが定義されている
- [ ] 命名規則が既存パターンと整合している

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
