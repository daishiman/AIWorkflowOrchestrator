# Phase 2 成果物: 契約マトリクス

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 2 - 設計

## 1. State 契約

### 1.1 State 定義

| State                | 所有者                 | 進入条件                        | 退出条件                     |
| -------------------- | ---------------------- | ------------------------------- | ---------------------------- |
| spec_created         | Phase 3 gate executor  | Phase 3 PASS/MINOR 消化         | Phase 10 PASS                |
| implementation_ready | Phase 10 gate executor | Phase 10 PASS + type 別条件充足 | Phase 12-13 完了 + PR マージ |
| completed            | PR merge executor      | PR マージ + branch 削除         | (terminal state)             |

### 1.2 Type 別条件テーブル

| 条件カテゴリ     | type: design                 | type: implementation                          |
| ---------------- | ---------------------------- | --------------------------------------------- |
| 設計成果物の存在 | 必須（outputs/phase-1〜11/） | 必須                                          |
| テスト PASS      | 不要                         | 必須（全テスト PASS）                         |
| Coverage gate    | 不要                         | 必須（Line 80%+, Branch 60%+, Function 80%+） |
| 手動テスト TC    | 設計レビューで代替           | 必須（全 TC PASS + screenshot）               |
| 実装コード       | 不要                         | 必須                                          |

## 2. Action 契約

### 2.1 同期アクション一覧

| Action              | トリガー        | 対象                                            | 完了条件                       |
| ------------------- | --------------- | ----------------------------------------------- | ------------------------------ |
| ledger-update       | Phase 12 Step A | task-workflow.md + active + completed + backlog | 4ファイル更新 + git diff 確認  |
| lessons-update      | Phase 12 Step B | lessons-learned.md + current child              | 2ファイル更新                  |
| spec-update         | Phase 12 Step C | 対象 system spec files                          | 最大3ファイル/エージェント     |
| index-regen         | Phase 12 Step D | topic-map.md + keywords.json                    | generate-index.js 実行ログ確認 |
| mirror-sync         | Phase 12 Step E | .agents/skills/                                 | diff -qr 差分0件               |
| skill-meta-update   | Phase 12 Step E | LOGS.md x2 + SKILL.md x2                        | 4ファイル更新                  |
| follow-up-formalize | Phase 12 Task 4 | unassigned-task/ + backlog + 仕様書リンク       | 3ステップ全完了                |
| issue-sync          | Phase 12 Task 4 | GitHub Issue                                    | gh issue close 実行確認        |

### 2.2 禁止アクション

| 禁止アクション                | 理由                            | 代替手段                                         |
| ----------------------------- | ------------------------------- | ------------------------------------------------ |
| silent fallback               | 暗黙の状態変更は drift の原因   | 明示的エラー + ユーザー確認                      |
| local 判定のみでの state 遷移 | gate 条件を迂回する             | Phase 3/10 の gate executor が判定               |
| no-op（同期スキップ）         | 「変更なし」でも記録が必要      | 「0件更新」として documentation-changelog に記録 |
| .agents/ の直接編集           | canonical root は .claude/ のみ | .claude/ を編集後に mirror sync                  |
| LOGS.md 片方のみ更新          | P1/P25 の再発                   | 2ファイル同時更新を強制                          |

## 3. Ownership 契約

### 3.1 ファイル所有権テーブル

| ファイルカテゴリ                  | 所有者              | 読み取り権限 | 書き込み権限                  |
| --------------------------------- | ------------------- | ------------ | ----------------------------- |
| task-workflow-\*.md               | Phase 12 executor   | 全 Phase     | Phase 12 のみ                 |
| lessons-learned-\*.md             | Phase 12 executor   | 全 Phase     | Phase 12 のみ                 |
| legacy-ordinal-family-register.md | Phase 12 executor   | 全 Phase     | Phase 12 のみ（新規追加禁止） |
| indexes/_.md, _.json              | generate-index.js   | 全 Phase     | Phase 12 Step D のみ          |
| LOGS.md (x2)                      | Phase 12 executor   | 全 Phase     | Phase 12 Step 1-A のみ        |
| SKILL.md (x2)                     | Phase 12 executor   | 全 Phase     | Phase 12 Step 1-A のみ        |
| .agents/skills/                   | mirror sync process | 全 Phase     | Phase 12 Step E のみ          |

### 3.2 サブエージェント分割制約

| 制約                        | 値                             | 根拠     |
| --------------------------- | ------------------------------ | -------- |
| 最大ファイル数/エージェント | 3                              | P43 対策 |
| changelog 作成担当          | メインエージェント（分割禁止） | P59 対策 |
| LOGS.md 更新順序            | 全ファイル更新後の最終ステップ | P43 対策 |
