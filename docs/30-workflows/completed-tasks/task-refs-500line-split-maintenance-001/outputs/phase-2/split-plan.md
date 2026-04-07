# Phase 2: 分離計画書

## Group A: aiworkflow-requirements 最高優先

### task-workflow-completed.md（2,444行）

#### 分離方針

- 79件のH3タスクエントリを日付帯別に新規ファイルへ切り出し
- 親ファイルは目次（概要 + 全子ファイルへのリンク）に縮小（200行以内）
- 既存の子ファイル（task-workflow-completed-\*.md）を参照として維持

#### 新規ファイル計画

| 新規ファイル                                 | 内容                                         | 概算行数 |
| -------------------------------------------- | -------------------------------------------- | -------- |
| `task-workflow-completed-recent-2026-04b.md` | 2026-04-04〜2026-04-07のタスク記録（新規H3） | ~490     |
| `task-workflow-completed-recent-2026-04a.md` | 2026-04-01〜2026-04-03のタスク記録           | ~490     |
| `task-workflow-completed-recent-2026-03d.md` | 2026-03-29〜2026-03-31のタスク記録           | ~490     |
| `task-workflow-completed-recent-2026-03c.md` | 2026-03-22〜2026-03-28のタスク記録           | ~490     |
| `task-workflow-completed-recent-2026-03b.md` | 2026-03-10〜2026-03-21のタスク記録           | ~490     |

#### 親ファイル縮小後の構成

```markdown
# タスク完了記録 - インデックス

## 最近の完了タスク（2026-04）

→ [2026-04-04以降](./task-workflow-completed-recent-2026-04b.md)
→ [2026-04-01〜2026-04-03](./task-workflow-completed-recent-2026-04a.md)

## 完了タスク（2026-03）

→ [2026-03-29〜2026-03-31](./task-workflow-completed-recent-2026-03d.md)
...（既存子ファイルへのリンクを整理）
```

---

## Group B: aiworkflow-requirements 高優先

### lessons-learned-current.md（1,299行）

#### 分離方針

- H2エントリを時系列で3ファイルに分割
- 分割点: line 287（H2 TASK-IMP-CHAT...）、line 619（H2 UT-TASK06-007）、line 826（H2 TASK-SC-08）

| 新規ファイル                               | 行範囲                                             | 概算行数 |
| ------------------------------------------ | -------------------------------------------------- | -------- |
| `lessons-learned-current.md`（縮小）       | Header + meta + index（1〜106）                    | ~150     |
| `lessons-learned-current-2026-04.md`       | 2026-04系（line 826〜end）                         | ~475     |
| `lessons-learned-current-2026-03-late.md`  | 2026-03下旬（line 619〜825）                       | ~210     |
| `lessons-learned-current-2026-03-mid.md`   | 2026-03中旬（line 287〜618）                       | ~330     |
| `lessons-learned-current-2026-03-early.md` | 2026-03初旬〜クイックリファレンス（line 106〜286） | ~180     |

### lessons-learned-phase12-workflow-lifecycle.md（1,269行）

#### 分離方針

- H2エントリを時系列で3ファイルに分割
- 分割点: line 437（2026-03-21）、line 703（2026-03-17再監査）

| 新規ファイル                                            | 行範囲                          | 概算行数 |
| ------------------------------------------------------- | ------------------------------- | -------- |
| `lessons-learned-phase12-workflow-lifecycle.md`（縮小） | Header + meta + index           | ~100     |
| `lessons-learned-phase12-lifecycle-recent.md`           | line 437〜end（2026-03-21以降） | ~830     |
| `lessons-learned-phase12-lifecycle-mid.md`              | line 53〜436                    | ~385     |

→ `lessons-learned-phase12-lifecycle-recent.md`が830行になるため再分割が必要:

- `lessons-learned-phase12-lifecycle-2026-04.md`（2026-04系）
- `lessons-learned-phase12-lifecycle-2026-03-late.md`（2026-03-21〜2026-04-01）

### lessons-learned-ipc-preload-runtime.md（728行）

#### 分離方針

- H2エントリをline 383付近で2分割

| 新規ファイル                                           | 行範囲                       | 概算行数 |
| ------------------------------------------------------ | ---------------------------- | -------- |
| `lessons-learned-ipc-preload-runtime.md`（縮小）       | Header + meta + index        | ~100     |
| `lessons-learned-ipc-preload-runtime-2026-04.md`       | line 605〜end（2026-04系）   | ~125     |
| `lessons-learned-ipc-preload-runtime-2026-03-late.md`  | line 383〜604（2026-03後半） | ~220     |
| `lessons-learned-ipc-preload-runtime-2026-03-early.md` | line 45〜382（2026-03前半）  | ~340     |

### api-ipc-system-core.md（958行）

#### 分離方針

- H2セクションを機能別に2ファイルに分割
- line 423（Skill Creator Runtime Public IPC）が分割境界

| 新規ファイル                      | 行範囲                                                                             | 概算行数 |
| --------------------------------- | ---------------------------------------------------------------------------------- | -------- |
| `api-ipc-system-core.md`（縮小）  | Header + 概要（H2: AI/チャット、Slide、Workspace、Conversation、Electron IPC設計） | ~420     |
| `api-ipc-system-skill-creator.md` | line 423〜end（Skill Creator IPC系）                                               | ~535     |

→ `api-ipc-system-skill-creator.md`が535行になるため再確認が必要

---

## Group C: aiworkflow-requirements 中・低優先

### arch-state-management-core.md（759行）

- H2セクションをline 352付近（LLMConfigProvider）で2分割
- `arch-state-management-core.md`（〜line 351）+ `arch-state-management-skill-creator.md`（line 352〜）

### task-workflow-completed-skill-lifecycle-ui.md（700行）

- H2セクションをline 341付近（TASK-RT-03-VERIFY-IMPROVE）で2分割
- `task-workflow-completed-skill-lifecycle-ui.md`（〜line 340）+ `task-workflow-completed-skill-lifecycle-ui-verify.md`（line 341〜）

### task-workflow-backlog.md（640行）

- 1つの大きなH2テーブルのため行数で分割
- `task-workflow-backlog.md`（ヘッダ + テーブル前半）+ `task-workflow-backlog-part2.md`（テーブル後半）

### interfaces-agent-sdk-skill-reference.md（624行）

- line 420（SkillEditor UI）で2分割
- `interfaces-agent-sdk-skill-reference.md`（〜line 419）+ `interfaces-agent-sdk-skill-editor.md`（line 420〜）

### security-electron-ipc-core.md（583行）

- line 342（実装例）で2分割
- `security-electron-ipc-core.md`（〜line 341）+ `security-electron-ipc-examples.md`（line 342〜）

### architecture-implementation-patterns-core.md（580行）

- line 453（共有パッケージ）で2分割
- `architecture-implementation-patterns-core.md`（〜line 452）+ `architecture-implementation-patterns-shared.md`（line 453〜）

### ui-ux-feature-components-core.md（574行）

- line 266（Custom Execution Environment）で2分割
- `ui-ux-feature-components-core.md`（〜line 265）+ `ui-ux-feature-components-advanced.md`（line 266〜）

### task-workflow-completed-ipc-contract-preload-alignment.md（561行）

- H3エントリline 338付近で2分割
- 前半: `task-workflow-completed-ipc-contract-preload-alignment.md`（〜line 337）
- 後半: `task-workflow-completed-ipc-preload-foundation.md`（line 338〜）

### ui-ux-feature-components-details.md（556行）

- line 328（Light Theme）で2分割
- `ui-ux-feature-components-details.md`（〜line 327）+ `ui-ux-feature-components-theme-chat.md`（line 328〜）

### security-skill-execution.md（549行）

- line 280（Permission Store）で2分割
- `security-skill-execution.md`（〜line 279）+ `security-skill-execution-permission.md`（line 280〜）

### ui-ux-navigation.md（547行）

- line 372（ChatViewナビゲーション）で2分割
- `ui-ux-navigation.md`（〜line 371）+ `ui-ux-navigation-chat-patterns.md`（line 372〜）

### task-workflow-completed-chat-lifecycle-tests.md（540行）

- H3エントリ境界で2分割（line 270付近）
- `task-workflow-completed-chat-lifecycle-tests.md`（〜line 269）+ `task-workflow-completed-chat-lifecycle-tests-part2.md`（line 270〜）

### ui-ux-feature-components-reference.md（530行）

- line 298（SkillAnalysisView）で2分割
- `ui-ux-feature-components-reference.md`（〜line 297）+ `ui-ux-feature-components-skill-analysis.md`（line 298〜）

### architecture-implementation-patterns-reference-ipc-contract-audits.md（519行）

- line 257（IPCチャネル命名監査）で2分割
- `architecture-implementation-patterns-reference-ipc-contract-audits.md`（〜line 256）+ `architecture-implementation-patterns-reference-ipc-naming.md`（line 257〜）

---

## Group D: task-specification-creator 全件

### patterns.md（2,225行）

- 既存子ファイル14件が存在
- 各H2セクションを対応する既存子ファイルへ移動
- `patterns.md`を目次（〜100行）に縮小

| H2セクション                           | 移動先                                       |
| -------------------------------------- | -------------------------------------------- |
| 成功パターン (line 269〜890)           | `patterns-success-implementation.md`         |
| ガイドライン (line 891〜1144)          | `patterns-guidelines.md`                     |
| フェーズ境界遷移パターン (line 1145〜) | `patterns-phase12-sync.md`                   |
| 失敗回避パターン                       | `patterns-lessons-and-pitfalls.md`           |
| 単体テスト設計パターン (line 1176〜)   | `patterns-testing.md`                        |
| E2Eテスト設計パターン (line 1294〜)    | `patterns-testing-and-implementation.md`     |
| CI/DevOps (line 1360〜)                | `patterns-agent-and-devops.md`               |
| Main→Renderer IPC (line 1412〜)        | `patterns-ui-ipc-modules.md`                 |
| サービス設計パターン (line 1443〜)     | `patterns-success-implementation.md`（追記） |
| 検索/置換UI (line 1527〜)              | `patterns-ui-ipc-modules.md`（追記）         |
| 外部APIデータ正規化 (line 1598〜)      | `patterns-ui-type-auth.md`                   |
| 型定義統合/移行 (line 1660〜)          | `patterns-validation-and-audit.md`           |
| 認証UIバグ修正 (line 1758〜)           | `patterns-troubleshooting.md`                |
| IPC型不整合解決 (line 2072〜)          | `patterns-parallel-ipc.md`                   |

### phase-templates.md（1,247行）

- 既存子ファイル8件が存在（phase-template-\*.md）
- Phase別にコンテンツを既存子ファイルへ移動
- `phase-templates.md`を目次インデックスに縮小（50行以内）

### spec-update-workflow.md（974行）

- 既存子ファイル7件が存在（spec-update-\*.md）
- StepやValidation詳細を既存子ファイルへ移動
- `spec-update-workflow.md`をフロー図 + リンク集（100行以内）に縮小

### phase-11-12-guide.md（590行）

- H2 "Phase 12" (line 273)で2分割
- `phase-11-guide.md`（〜line 272）+ `phase-12-guide.md`（line 273〜）
- 既存の`phase-11-screenshot-guide.md` / `phase-11-test-report-template.md`との整合性確認

### patterns-parallel-ipc.md（532行）

- H2 "Phase 12 検証・完了最適化パターン" (line 181)で2分割
- `patterns-parallel-ipc.md`（〜line 180: 並列エージェント + IPC型不整合）
- `patterns-phase12-optimization.md`（line 181〜: Phase12パターン）

---

## SKILL.md 更新設計

### aiworkflow-requirements/SKILL.md 追加リソース導線

新規作成ファイル全件を `### 完了タスク` / `### lessons-learned` セクションに追加。

### task-specification-creator/SKILL.md 追加リソース導線

新規作成ファイル全件をリソースセクションに追加。

## Index再生成

`node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
`node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/task-refs-500line-split-maintenance-001 --regenerate`

## Mirror同期

`rsync -av --delete .claude/skills/*/references/ .agents/skills/*/references/`
`rsync -av --delete .claude/skills/*/indexes/ .agents/skills/*/indexes/`
