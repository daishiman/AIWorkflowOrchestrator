# Phase 1: 分離基準書

## 分離方針

### 基本原則

| 基準           | 内容                                                            |
| -------------- | --------------------------------------------------------------- |
| サイズ制限     | 分離後の各ファイルは 499 行以内                                 |
| セクション原則 | H2 見出し単位で分離。1 H2 が 499 行超の場合は H3 単位           |
| 命名規則       | 既存ファイル名から `-part1`/`-part2` または意味的なサフィックス |
| 親ファイル     | 目次・概要レベルに縮小（概要 + 各子ファイルへの参照リンク）     |
| SKILL.md 更新  | 新規ファイルを同時にリソース導線へ追加                          |

### 命名規則

```
{既存ファイル名}-{サフィックス}.md

サフィックス例:
  - 日付帯: -2026-04.md, -2026-03.md
  - 機能別: -sdk.md, -ipc.md, -ui.md
  - 連番: -part1.md, -part2.md, -part3.md
  - セマンティック: -overview.md, -details.md, -reference.md
```

### 親ファイルの縮小方針

- 100〜200行以内を目標
- 構成: メタ情報 + 概要説明 + 子ファイルへの目次リンク
- 詳細コンテンツは全て子ファイルへ委譲

## 実行優先順位

| 優先度     | 対象ファイル                                            | 理由                              |
| ---------- | ------------------------------------------------------- | --------------------------------- |
| 最高（P0） | task-workflow-completed.md (2,444行)                    | 最大ファイル                      |
| 最高（P0） | patterns.md (2,225行)                                   | 最大ファイル（task-spec-creator） |
| 高（P1）   | lessons-learned-current.md (1,299行)                    | 1,000行超                         |
| 高（P1）   | lessons-learned-phase12-workflow-lifecycle.md (1,269行) | 1,000行超                         |
| 高（P1）   | phase-templates.md (1,247行)                            | 1,000行超                         |
| 高（P1）   | api-ipc-system-core.md (958行)                          | 900行超                           |
| 高（P1）   | spec-update-workflow.md (974行)                         | 900行超                           |
| 中（P2）   | 残り中優先ファイル（700〜760行）                        | 700行超                           |
| 低（P3）   | 残り低優先ファイル（500〜640行）                        | 500行超                           |

## 並列実行グループ

| グループ | 対象                                                           | 並列実行可否    |
| -------- | -------------------------------------------------------------- | --------------- |
| Group A  | aiworkflow-requirements 最高優先（task-workflow-completed.md） | GroupDと並列可  |
| Group B  | aiworkflow-requirements 高優先（lessons-learned系 + api-ipc）  | Group A完了後   |
| Group C  | aiworkflow-requirements 中・低優先（残り15件）                 | Group B完了後   |
| Group D  | task-specification-creator 全件（5件）                         | Group Aと並列可 |

## 参照整合性更新対象

以下を同時に更新する:

1. `SKILL.md` × 2 (aiworkflow-requirements / task-specification-creator)
2. `indexes/topic-map.md` × 2 (再生成)
3. `indexes/keywords.json` × 2 (再生成)
4. `artifacts.json` / `outputs/artifacts.json`
5. `.agents/skills/` mirror 同期

## 特殊ケース対応

### 既存子ファイルが500行超の場合

以下の既存子ファイルも500行超のため、同時に分割対象：

- `task-workflow-completed-skill-lifecycle-ui.md` (700行)
- `task-workflow-completed-chat-lifecycle-tests.md` (540行)
- `task-workflow-completed-ipc-contract-preload-alignment.md` (561行)
- `patterns-parallel-ipc.md` (532行) ※task-specification-creator

### 1セクションが499行超の場合

H2セクション内をH3単位で分割し、それでも超える場合は連番サフィックスを使用。
