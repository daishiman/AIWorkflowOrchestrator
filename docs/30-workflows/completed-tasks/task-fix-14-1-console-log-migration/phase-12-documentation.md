# Phase 12: ドキュメント更新 — console → electron-log 移行

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 12                                  |
| タスクID | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| 機能名   | console → electron-log 移行         |
| 作成日   | 2026-02-14                          |

## 目的

実装ガイドの作成、システム仕様書の更新、未タスクの検出を行う。

## 事前チェック

Phase 12 開始前に、以下の参照資料を確認すること:

- [spec-update-workflow.md](.claude/skills/task-specification-creator/references/spec-update-workflow.md)
- [phase-11-12-guide.md](.claude/skills/task-specification-creator/references/phase-11-12-guide.md)
- [06-known-pitfalls.md](.claude/rules/06-known-pitfalls.md) の P1-P4, P25-P28

## 実行タスク

### Task 1: 実装ガイド作成

#### Part 1: 中学生レベル概念説明

**タイトル**: 「ログを整理して、問題を見つけやすくする話」

- **日常の例え**: 日記帳を想像してみてください。ただメモをバラバラに書くのと、ノートに日付・タイトル・重要度のマークをつけて書くのでは、後から見返すときの探しやすさが全然違いますよね？
  - `console.log` = メモ用紙にバラバラに書く（後から探せない）
  - `electron-log` = 整理されたノートに書く（日付・重要度つきで検索可能）
- **なぜ必要か**: アプリが本番環境で動いているとき、問題が起きたら「いつ」「どこで」「何が」起きたかを素早く見つける必要がある。console.log だとログファイルに残らず、レベル制御もできない。
- **何をしたか**: 4つのファイルで「メモ用紙」方式から「整理されたノート」方式に切り替えた。

#### Part 2: 開発者向け技術詳細

- **変更概要**: 4ファイル・27箇所の console → electron-log 移行
- **ログレベルマッピング**:
  - `console.error` → `log.error` (致命的エラー)
  - `console.warn` → `log.warn` (非致命的問題)
  - `console.info` → `log.info` (状態変化・操作記録)
  - `console.log` (debug) → `log.debug` (開発用デバッグ)
- **モックパターン**: `vi.mock("electron-log", ...)` の使用方法
- **設定**: electron-log のトランスポート設定（ファイル・コンソール・レベル制御）

成果物: `outputs/phase-12/implementation-guide.md`

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

- [ ] `aiworkflow-requirements/LOGS.md` 更新（タスク完了記録追加）
- [ ] `task-specification-creator/LOGS.md` 更新（**2ファイル両方**）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル更新

- [ ] 関連する仕様書の実装ステータスを更新（該当する場合）

#### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "TASK-FIX-14-1" .claude/skills/aiworkflow-requirements/references/
grep -rn "console-log-migration" .claude/skills/aiworkflow-requirements/references/
```

- [ ] 該当する仕様書の関連タスクテーブルを更新

#### Step 1-D: topic-map.md 再生成

```bash
cd .claude/skills/aiworkflow-requirements && node generate-index.js
cd .claude/skills/task-specification-creator && node generate-index.js
```

- [ ] topic-map.md を再生成

#### Step 2: システム仕様更新

本タスクはリファクタリング（内部実装の変更のみ、インターフェース不変）のため、**Step 2 は不要**。

理由:

- 新規インターフェース追加なし
- 既存インターフェース変更なし
- API仕様変更なし

### Task 3: ドキュメント更新履歴作成

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js --workflow docs/30-workflows/task-fix-14-1-console-log-migration
```

成果物: `outputs/phase-12/documentation-changelog.md`

**注意**: 全 Step の完了結果を個別に記録してから「Phase 12 完了」とすること（P4対策）。

### Task 4: 未タスク検出

#### 検出ソース

| ソース               | 確認項目                                                 |
| -------------------- | -------------------------------------------------------- |
| 元タスク仕様書       | skillHandlers.ts のDEBUGログ整理（スコープ外として明示） |
| Phase 10レビュー結果 | MINOR判定の指摘事項                                      |
| コードコメント       | TODO/FIXME/HACK                                          |

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js --scan apps/desktop/src/main/services/skill --output .tmp/unassigned-candidates.json
```

未タスク検出時の3ステップ:

1. `docs/30-workflows/unassigned-task/` に指示書作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンク追加

成果物: `outputs/phase-12/unassigned-task-detection.md`（**0件でも作成必須**）

### Task 5: スキルフィードバックレポート作成

成果物: `outputs/phase-12/skill-feedback-report.md`（**改善点なしでも作成必須**）

## 参照資料

| 資料                | パス                                                                         |
| ------------------- | ---------------------------------------------------------------------------- |
| Phase 11 手動テスト | phase-11-manual-testing.md                                                   |
| 仕様更新フロー      | .claude/skills/task-specification-creator/references/spec-update-workflow.md |
| Phase 11/12 ガイド  | .claude/skills/task-specification-creator/references/phase-11-12-guide.md    |
| 既知の落とし穴      | .claude/rules/06-known-pitfalls.md                                           |

## 苦戦しやすいポイント

| ポイント                                  | 対策                                                            |
| ----------------------------------------- | --------------------------------------------------------------- |
| LOGS.md 2ファイル更新漏れ (P1/P25)        | aiworkflow-requirements + task-specification-creator 両方を更新 |
| topic-map.md 再生成忘れ (P2/P27)          | 仕様書更新後は必ず generate-index.js 実行                       |
| documentation-changelog 早期完了記載 (P4) | 全Step完了後に「Phase 12完了」と記載                            |
| SKILL.md 変更履歴更新漏れ (P29)           | LOGS.mdだけでなくSKILL.mdも更新                                 |

## 成果物

| 成果物                       | パス                                          |
| ---------------------------- | --------------------------------------------- |
| 実装ガイド                   | outputs/phase-12/implementation-guide.md      |
| ドキュメント更新履歴         | outputs/phase-12/documentation-changelog.md   |
| 未タスク検出レポート         | outputs/phase-12/unassigned-task-detection.md |
| スキルフィードバックレポート | outputs/phase-12/skill-feedback-report.md     |

## 完了条件

- [ ] 実装ガイド Part 1（中学生レベル）を作成した
- [ ] 実装ガイド Part 2（技術者レベル）を作成した
- [ ] LOGS.md を 2ファイル更新した
- [ ] SKILL.md を 2ファイル更新した
- [ ] topic-map.md を再生成した
- [ ] ドキュメント更新履歴を作成した（全Step個別記録）
- [ ] 未タスク検出レポートを作成した（0件でも必須）
- [ ] スキルフィードバックレポートを作成した
- [ ] 苦戦した箇所をシステム仕様書に記録した

## 次Phase

→ Phase 13: PR作成・完了
