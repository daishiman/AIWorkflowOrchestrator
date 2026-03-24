# Phase 5 成果物: 実装計画

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 5 - 実装

## 1. 実装計画の前提

このタスクは type:design のため、プロダクションコードの変更はない。
「実装計画」とは、Phase 12 において governance 仕様を成果物（md ファイル）として具現化する際の変更順序・責務分離・所有権を定義する文書である。

| 前提事項       | 内容                                                                  |
| -------------- | --------------------------------------------------------------------- |
| 変更対象       | `.claude/skills/` 配下の仕様書 md ファイル（LOGS.md/SKILL.md を含む） |
| コード変更     | なし（型定義・コンポーネント・IPC ハンドラは不変）                    |
| 実行タイミング | Phase 12 Task 2（システム仕様書更新）                                 |
| 変更の原子性   | トランザクション不要。Step A→E の順序実行で担保                       |

## 2. 変更順序（Step A→E）

### 変更順序テーブル

| Step | 変更対象カテゴリ   | 操作                                                       | 最大ファイル数/エージェント | 完了確認方法                         |
| ---- | ------------------ | ---------------------------------------------------------- | --------------------------- | ------------------------------------ |
| A    | Workflow Ledger    | task-workflow\*.md の完了記録・残課題テーブル更新          | 3                           | `grep "completed" task-workflow.md`  |
| B    | Lessons Learned    | lessons-learned-current.md への教訓追記                    | 2                           | `wc -l lessons-learned-current.md`   |
| C    | System Spec        | 対象 arch-_/api-_/interfaces-_/security-_/ui-ux-\*.md 更新 | 3                           | `git diff --stat -- .claude/skills/` |
| D    | Index 再生成       | `node generate-index.js` 実行                              | 自動（1コマンド）           | `ls -la indexes/topic-map.md`        |
| E    | Mirror Sync + Meta | LOGS.md x2 + SKILL.md x2 更新 + rsync --checksum           | 4（Meta） + rsync           | `diff -qr .claude/ .agents/skills/`  |

### Step 間の依存関係

```
Step A (Ledger)
    |
    v
Step B (Lessons)  ← Ledger 更新後の新教訓を記録
    |
    v
Step C (Spec)     ← Ledger + Lessons の整合が取れた状態で System Spec を更新
    |
    v
Step D (Index)    ← Spec 更新後に Index を再生成（最新 Spec を反映）
    |
    v
Step E (Mirror)   ← 全更新後に Mirror Sync + Skill Meta を最終更新
```

## 3. 責務分離マップ

### 3.1 Lane 別変更責務

| Lane | 変更責務                               | 変更者              | 変更タイミング  | 変更禁止事項                              |
| ---- | -------------------------------------- | ------------------- | --------------- | ----------------------------------------- |
| L-1  | artifacts.json の state フィールド更新 | Phase gate executor | Phase 3/10/12   | 手動での state 変更（gate executor 以外） |
| L-2  | canonical source table の path 追記    | Phase 12 executor   | Phase 12 Step C | `.agents/skills/` への直接編集            |
| L-3  | LOGS.md/SKILL.md 2ファイル同時更新     | Phase 12 executor   | Phase 12 Step E | 1ファイルのみの更新（P1/P25 防止）        |

### 3.2 ファイル変更権限マップ

| ファイル                                                      | 変更権限者             | 変更 Step | 読み取り権限 |
| ------------------------------------------------------------- | ---------------------- | --------- | ------------ |
| task-workflow.md / active / completed / backlog               | Phase 12 executor      | Step A    | 全 Phase     |
| lessons-learned-current.md                                    | Phase 12 executor      | Step B    | 全 Phase     |
| arch-_/api-_/interfaces-_/security-_/ui-ux-\*.md              | Phase 12 executor      | Step C    | 全 Phase     |
| indexes/topic-map.md + keywords.json                          | generate-index.js のみ | Step D    | 全 Phase     |
| .claude/skills/\*\*/LOGS.md（aiworkflow-requirements 側）     | Phase 12 executor      | Step E    | 全 Phase     |
| .claude/skills/\*\*/LOGS.md（task-specification-creator 側）  | Phase 12 executor      | Step E    | 全 Phase     |
| .claude/skills/\*\*/SKILL.md（aiworkflow-requirements 側）    | Phase 12 executor      | Step E    | 全 Phase     |
| .claude/skills/\*\*/SKILL.md（task-specification-creator 側） | Phase 12 executor      | Step E    | 全 Phase     |
| .agents/skills/ 全ファイル                                    | rsync process のみ     | Step E    | 全 Phase     |

## 4. 禁止事項と回避策

| 禁止アクション                         | 回避策                                                                       | 根拠     |
| -------------------------------------- | ---------------------------------------------------------------------------- | -------- |
| Step E より前に LOGS.md を更新する     | Step A〜D 完了後に Step E を実行する                                         | P43 対策 |
| documentation-changelog を先行記録     | 全 Task 完了後にメインエージェントが事後記録する                             | P4/P59   |
| 1エージェントに4ファイル以上を委譲     | 3ファイル/エージェントの分割を遵守する                                       | P43      |
| .agents/skills/ を直接編集する         | .claude/skills/ を編集後に rsync --checksum で同期する                       | L-2      |
| LOGS.md を1ファイルのみ更新する        | aiworkflow-requirements + task-specification-creator を必ず2ファイル同時更新 | P1/P25   |
| topic-map.md を手動編集する            | `node generate-index.js` のみで更新する（Step D）                            | P2/P27   |
| 再評価クローズ後に GitHub Issue を放置 | `gh issue close <number>` を同時実行する（P56）                              | P56      |

## 5. Rollback 手順

Phase 12 実行中に中断した場合のリカバリ手順:

| 中断 Step   | 診断コマンド                                                                          | リカバリ手順                                                         |
| ----------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Step A 中断 | `git diff --stat -- .claude/skills/aiworkflow-requirements/references/task-workflow*` | Step A の対象ファイルを再確認し未更新ファイルを特定して更新          |
| Step C 中断 | `git diff --stat -- .claude/skills/aiworkflow-requirements/references/`               | 変更済みファイル数を確認し、未変更の対象ファイルを特定して更新       |
| Step D 中断 | `ls -la .claude/skills/aiworkflow-requirements/indexes/topic-map.md`                  | `node generate-index.js` を再実行                                    |
| Step E 中断 | `diff -qr .claude/skills/ .agents/skills/`                                            | `rsync -avz --checksum ./.claude/skills/ ./.agents/skills/` を再実行 |

## 6. サブエージェント分割計画

Step C（System Spec 更新）は変更ファイル数に応じてサブエージェントを分割する:

| エージェント ID | 担当ファイル（例）                                           | ファイル数上限 |
| --------------- | ------------------------------------------------------------ | -------------- |
| SA-C-1          | task-workflow.md 以外の arch-\*.md（対象1〜3ファイル）       | 3              |
| SA-C-2          | interfaces-_.md または api-_.md（対象1〜3ファイル）          | 3              |
| SA-C-3          | lessons-learned*.md または security-*.md（対象1〜3ファイル） | 3              |

**documentation-changelog は分割禁止**: 全 SA 完了後にメインエージェントが統合作成する（P59 対策）。

## 7. 実装完了条件

| チェック項目                      | 検証コマンド                                                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Step A: Workflow Ledger 更新完了  | `grep -c "TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001" .claude/skills/aiworkflow-requirements/references/task-workflow.md` >= 1 |
| Step B: Lessons Learned 更新完了  | `wc -l .claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` が変化                                         |
| Step C: System Spec 更新完了      | `git diff --stat -- .claude/skills/aiworkflow-requirements/references/` で対象ファイルの変更が確認できる                            |
| Step D: Index 再生成完了          | `node generate-index.js` の終了コードが 0                                                                                           |
| Step E: Mirror 整合確認           | `diff -qr .claude/skills/ .agents/skills/` の出力が空                                                                               |
| Step E: LOGS.md 2ファイル更新完了 | 両 LOGS.md のタイムスタンプが同一 Phase 12 セッション内に更新                                                                       |
| Follow-up: 未タスク3ステップ完了  | `ls docs/30-workflows/unassigned-task/` の件数が documentation-changelog と一致                                                     |
