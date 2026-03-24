# Phase 5 成果物: 変更スコープ

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 5 - 実装

## 1. スコープ定義の前提

このタスクは type:design のため、変更スコープとは「Phase 12 において更新する仕様書ファイルの範囲」を指す。
プロダクションコード（TypeScript/React/Electron）の変更は一切含まない。

| 前提事項           | 内容                                                          |
| ------------------ | ------------------------------------------------------------- |
| 変更種別           | 仕様書 md ファイルの追記・更新のみ                            |
| コードファイル変更 | なし（.ts / .tsx / .js / .json の変更なし）                   |
| 影響範囲           | `.claude/skills/aiworkflow-requirements/` 配下                |
| Mirror 対象        | `.agents/skills/aiworkflow-requirements/`（rsync で自動同期） |

## 2. 変更対象ファイル一覧（Phase 12 Step 別）

### 2.1 Step A: Workflow Ledger 対象ファイル

| ファイルパス                                                                                     | 変更内容                                | 優先度 |
| ------------------------------------------------------------------------------------------------ | --------------------------------------- | ------ |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                             | タスク完了記録の追加                    | 必須   |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-*.md`（該当ファイル） | 完了タスクセクションへの追記            | 必須   |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                     | 残課題テーブルの更新（0件の場合も記録） | 必須   |

### 2.2 Step B: Lessons Learned 対象ファイル

| ファイルパス                                                                   | 変更内容                                              | 優先度   |
| ------------------------------------------------------------------------------ | ----------------------------------------------------- | -------- |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` | governance タスクから得た教訓の追記                   | 必須     |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | current.md へのリンク更新（新規教訓が生じた場合のみ） | 条件付き |

### 2.3 Step C: System Spec 対象ファイル

このタスクは型定義・IPC 契約・UI コンポーネントを変更しないため、Step C での System Spec 更新は governance 手順書のみ:

| ファイルパス                                                                                                    | 変更内容                                        | 優先度   |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | -------- |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                                     | governance Phase 仕様の更新（存在する場合）     | 条件付き |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                                      | governance ルール更新（存在する場合）           | 条件付き |
| `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` | canonical workflow の governance セクション更新 | 必須     |

### 2.4 Step D: Index 再生成対象ファイル（自動生成）

| ファイルパス                                                   | 変更内容           | 更新方法                 |
| -------------------------------------------------------------- | ------------------ | ------------------------ |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`  | 全仕様書から再生成 | `node generate-index.js` |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json` | 全仕様書から再生成 | `node generate-index.js` |

### 2.5 Step E: Skill Meta 対象ファイル

| ファイルパス                                         | 変更内容                          | 優先度 |
| ---------------------------------------------------- | --------------------------------- | ------ |
| `.claude/skills/aiworkflow-requirements/LOGS.md`     | Phase 12 完了ログの追記           | 必須   |
| `.claude/skills/task-specification-creator/LOGS.md`  | Phase 12 完了ログの追記（P1/P25） | 必須   |
| `.claude/skills/aiworkflow-requirements/SKILL.md`    | 変更履歴テーブルへの追記          | 必須   |
| `.claude/skills/task-specification-creator/SKILL.md` | 変更履歴テーブルへの追記          | 必須   |

## 3. 変更除外ファイル一覧

以下のファイルはこのタスクのスコープ外（変更禁止）:

| ファイルカテゴリ                          | 除外理由                                                     |
| ----------------------------------------- | ------------------------------------------------------------ |
| apps/desktop/src/\*_/_.ts                 | プロダクションコードは変更対象外（type:design）              |
| apps/desktop/src/\*_/_.tsx                | 同上                                                         |
| packages/shared/src/\*_/_.ts              | 共有型定義は変更対象外                                       |
| apps/desktop/src/preload/types.ts         | IPC 型定義は変更対象外                                       |
| .agents/skills/ 全ファイル                | .claude/skills/ からの rsync でのみ更新（直接編集禁止）      |
| indexes/topic-map.md（手動編集）          | generate-index.js でのみ更新（手動編集禁止）                 |
| indexes/keywords.json（手動編集）         | generate-index.js でのみ更新（手動編集禁止）                 |
| legacy-ordinal-family-register.md（追記） | 参照専用（新規パス追加禁止。既存エントリ修正は条件付き許可） |

## 4. 変更スコープ境界の根拠

| 境界決定                        | 根拠                                                             |
| ------------------------------- | ---------------------------------------------------------------- |
| TypeScript ファイルを除外       | type:design タスクではコード実装を行わない（Phase 5 仕様書準拠） |
| .agents/ の直接編集を禁止       | L-2 の Canonical Root 設計（.claude/ のみが正本）                |
| indexes/ の手動編集を禁止       | generate-index.js が唯一の更新手段（P2/P27 防止）                |
| LOGS.md を2ファイル同時に必須化 | P1/P25（LOGS.md 2ファイル更新漏れ）の再発防止                    |

## 5. 変更ファイル数サマリー

| Step | 必須ファイル数 | 条件付きファイル数 | 合計上限    | P43 制約充足                           |
| ---- | -------------- | ------------------ | ----------- | -------------------------------------- |
| A    | 3              | 0                  | 3           | 充足（3以下）                          |
| B    | 1              | 1                  | 2           | 充足（3以下）                          |
| C    | 1              | 2                  | 3           | 充足（3以下）                          |
| D    | 2（自動）      | 0                  | 2           | 充足（自動）                           |
| E    | 4              | 0                  | 4（+rsync） | 充足（4ファイル + rsync コマンド 1件） |

**合計必須変更ファイル数（Step A〜E）: 11ファイル**
（各 Step 内はサブエージェント分割で3ファイル/エージェント以内を維持）

## 6. Phase 12 実行前チェックリスト

変更を開始する前に以下を確認する:

- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow.md` が存在する
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` が存在する
- [ ] `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` が存在する
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` が存在する
- [ ] `.claude/skills/task-specification-creator/LOGS.md` が存在する
- [ ] `node generate-index.js` が実行可能（Node.js が利用可能）
- [ ] `rsync` コマンドが利用可能（`which rsync` で確認）
- [ ] `diff` コマンドが利用可能（`which diff` で確認）
