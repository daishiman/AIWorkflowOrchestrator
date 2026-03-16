# UT-SPEC-LINE-BUDGET-SPLIT-001: aiworkflow-requirements 500行超過仕様書の責務分割

## メタ情報

```yaml
task_id: UT-SPEC-LINE-BUDGET-SPLIT-001
task_name: aiworkflow-requirements 500行超過仕様書の責務分割
category: リファクタリング
target_feature: .claude/skills/aiworkflow-requirements/references/
priority: 低
scale: 小規模
status: unassigned
source_phase: TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 Phase 12（validate-structure.js 警告検出）
created_date: 2026-03-16
related_tasks:
  - TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001
  - TASK-IMP-SKILL-DOCS-AI-RUNTIME-001
spec_path: docs/30-workflows/unassigned-task/task-ut-spec-line-budget-split-001.md
```

| 項目         | 内容                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| タスクID     | UT-SPEC-LINE-BUDGET-SPLIT-001                                                 |
| タスク名     | aiworkflow-requirements 500行超過仕様書の責務分割                             |
| 分類         | リファクタリング                                                              |
| 対象機能     | `.claude/skills/aiworkflow-requirements/references/` 配下の超過ファイル群     |
| 優先度       | 低                                                                            |
| 見積もり規模 | 小規模                                                                        |
| ステータス   | unassigned                                                                    |
| 発見元       | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 Phase 12（validate-structure.js 警告検出） |
| 発見日       | 2026-03-16                                                                    |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`validate-structure.js` が以下3ファイルの500行超過を検出した:

| ファイル名                                                          | 行数  |
| ------------------------------------------------------------------- | ----- |
| `arch-electron-services-details.md`                                 | 502行 |
| `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` | 535行 |
| `task-workflow-completed-workspace-chat-lifecycle-tests.md`         | 522行 |

### 1.2 問題点・課題

500行を超える仕様書は可読性が低下し、AI エージェントがファイル全体を読む際にコンテキストウィンドウを圧迫する。
TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 で確立した line budget 基準（500行以下）に違反しており、
validate-structure.js が毎回3件の警告を出力し続けている状態である。

### 1.3 放置した場合の影響

- validate-structure.js の警告が常時3件発生し、新規の超過ファイルを見逃すリスクが高まる
- AI エージェントがファイル全体を読む際にコンテキスト効率が低下する
- line budget 基準の形骸化を招く

## 2. 何を達成するか（What）

### 2.1 目的

3ファイルを責務ごとに family file に分割し、各ファイルを500行以下に収める。

### 2.2 最終ゴール

- 対象3ファイル全てが500行以下
- validate-structure.js の警告が0件
- topic-map.md / keywords.json が再生成済み
- legacy-ordinal-family-register.md に旧ファイル名のマッピングが追加済み

### 2.3 スコープ

#### 含むもの

- `arch-electron-services-details.md` の責務分割（サービス種別ごと）
- `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` のタスク群別 archive 分割
- `task-workflow-completed-workspace-chat-lifecycle-tests.md` のタスク群別 archive 分割
- 親ファイルからの参照リンク整備
- generate-index.js / validate-structure.js 再実行
- `.agents/` mirror 同期

#### 含まないもの

- ファイル内容の変更（分割のみ、内容の編集は行わない）
- 他の500行以下ファイルの予防的分割

### 2.4 成果物

- 分割後の family file 群（各ファイル500行以下）
- 更新された親ファイル（参照リンク付き）
- `legacy-ordinal-family-register.md` の更新（旧ファイル名 → 分割後ファイル名のマッピング）

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 の分割パターンを把握していること
- `scripts/split-reference.js` の使用方法を把握していること

### 3.2 依存タスク

- `TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001`（分割パターンの正本）

### 3.3 推奨アプローチ

#### arch-electron-services-details.md (502行)

1. サービスカテゴリ（スキル管理 / 認証 / ファイル操作等）で分割
2. 親ファイルは目次 + 参照リンクのみ（100行以下）に整理

#### task-workflow-completed-skill-lifecycle-agent-view-line-budget.md (535行)

1. タスク完了記録をタスク群別（lifecycle / agent-view 等）に分割
2. 親ファイルは最新10件 + archive 参照リンクを保持

#### task-workflow-completed-workspace-chat-lifecycle-tests.md (522行)

1. タスク完了記録をタスク群別（workspace-chat / lifecycle-tests 等）に分割
2. 親ファイルは最新10件 + archive 参照リンクを保持

### 3.4 既知の落とし穴

| 落とし穴 ID                        | 内容                                      | 対策                                                             |
| ---------------------------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| P2 / P27                           | topic-map.md 再生成忘れ                   | 分割後に必ず `node scripts/generate-index.js` を実行すること     |
| 同一 wave インデックス同期パターン | resource-map / quick-reference の更新漏れ | Phase 12 Task 2 に「Step 2.5: インデックス同期」を必ず含めること |
| mirror sync 遅延パターン           | `.agents/` への同期が漏れる               | `diff -rq` で差分0を確認してから完了とすること                   |

### 3.5 TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 の教訓

| 教訓                               | 本タスクへの関連性                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 同一 wave インデックス同期パターン | 分割後に resource-map.md / quick-reference.md の更新が漏れるリスク。Phase 12 Task 2 に「Step 2.5: インデックス同期」を必ず含めること |
| mirror sync 遅延パターン           | 分割後の新ファイルが `.agents/` に同期されないリスク。`diff -rq` で差分0を確認してから完了とすること                                 |
| Phase 4-5 統合実行パターン         | 分割はテスト不要のため適用外だが、validate-structure.js を Red-Green テストとして活用可能（分割前: WARN → 分割後: 0件）              |

## 4. 実行手順

### Phase 1: 現状確認

1. 対象3ファイルの行数と構成を確認
2. 分割境界（セクション境界）を特定
3. family file の命名規則を確認（TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 準拠）

### Phase 2: 分割実施

1. `arch-electron-services-details.md` をサービスカテゴリ別に分割
2. `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` をタスク群別に分割
3. `task-workflow-completed-workspace-chat-lifecycle-tests.md` をタスク群別に分割
4. 各親ファイルに参照リンクを追加

### Phase 3: インデックス更新

1. `node scripts/generate-index.js` を実行
2. `node scripts/validate-structure.js` で警告0件を確認
3. `legacy-ordinal-family-register.md` に旧ファイル名マッピングを追加

### Phase 4: mirror 同期

1. `.agents/` への同期を実行
2. `diff -rq .claude/skills/aiworkflow-requirements/ .agents/skills/aiworkflow-requirements/` で差分0を確認

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `arch-electron-services-details.md` が500行以下
- [ ] `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` が500行以下
- [ ] `task-workflow-completed-workspace-chat-lifecycle-tests.md` が500行以下
- [ ] `validate-structure.js` の警告が0件
- [ ] 親ファイルからの参照リンクが全て有効

### 品質要件

- [ ] `generate-index.js` 再実行済み
- [ ] `legacy-ordinal-family-register.md` 更新済み
- [ ] `diff -rq .claude/ .agents/` で差分0

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` の残課題テーブルに登録されている
- [ ] 関連仕様書に参照リンクが追加されている

## 6. 検証方法

```bash
cd .claude/skills/aiworkflow-requirements
node scripts/validate-structure.js | grep -c "警告"
# 期待値: 0

node scripts/generate-index.js

diff -rq . ../../.agents/skills/aiworkflow-requirements/
# 期待値: 差分なし
```

## 7. リスクと対策

| リスク                                            | 影響度 | 発生確率 | 対策                                                                  |
| ------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------- |
| 分割境界が不明確でセクションが分断される          | 中     | 中       | 分割前にセクション構造を可視化し、h2 境界で分割する                   |
| 参照リンクが切れる                                | 高     | 低       | 分割後に `grep -rn "arch-electron-services-details"` で全参照元を確認 |
| mirror 同期の遅延により `.agents/` が古いまま残る | 中     | 中       | `diff -rq` で差分0を確認してから完了とする                            |

## 8. 参照情報

- 発見元タスク: `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration/`
- 検出 Phase: Phase 12（validate-structure.js 警告検出）
- 関連タスク: TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001（分割パターン正本）
