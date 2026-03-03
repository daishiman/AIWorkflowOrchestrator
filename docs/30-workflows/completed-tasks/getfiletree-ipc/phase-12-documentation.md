# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 12                        |
| Phase名    | ドキュメント              |
| タスクID   | UT-UI-05A-GETFILETREE-001 |
| 前提Phase  | Phase 11（手動テスト）    |
| 後続Phase  | Phase 13（完了）          |
| ステータス | 未実施                    |
| 作成日     | 2026-03-03                |
| 機能名     | getfiletree-ipc           |
| Issue      | #948                      |

---

## 目的

実装内容を文書化し、システム仕様書を更新する。
未タスクがあれば検出・記録する。
スキルフィードバックレポートを作成する。

## 背景

ドキュメントは将来のメンテナンスに不可欠である。
Phase 12 は漏れが最も発生しやすい Phase であるため、以下の既知の落とし穴を事前に確認すること。

### ⚠️ 事前確認必須: 既知の落とし穴（06-known-pitfalls.md）

| Pitfall ID | タイトル                                 | 対策                                                                            |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| P1/P25     | LOGS.md 2ファイル更新漏れ                | aiworkflow-requirements と task-specification-creator の**2ファイル両方**を更新 |
| P2/P27     | topic-map.md 再生成忘れ                  | 仕様書に変更があれば**必ず**再生成を実行                                        |
| P3/P38     | 未タスク管理の3ステップ不完全            | ①指示書 → ②残課題テーブル → ③関連仕様書リンク の全ステップ                      |
| P4/P37     | documentation-changelog 早期「完了」記載 | 全 Step 確認前に「完了」と記載しない                                            |
| P29        | SKILL.md 変更履歴の更新漏れ              | LOGS.md だけでなく SKILL.md も更新                                              |
| P28        | スキルフィードバックレポート未作成       | 改善点がなくても「改善点なし」として作成                                        |
| P31        | システム仕様書更新漏れ（複数ファイル）   | IPC関連では5ファイル以上を確認                                                  |
| P43        | サブエージェントの rate limit 中断       | 仕様書更新は3ファイル以下/エージェントに分割                                    |

---

## 実行タスク

> 以下の5タスクを**全て**実行してください（全タスク必須）。

- タスク1: 実装ガイド作成 — Part 1（中学生レベル）/ Part 2（開発者向け）を作成する
- タスク2: システム仕様書更新 — Step 1-A〜1-D と Step 2 を実施する
- タスク3: documentation-changelog 作成 — 変更履歴と Step 実行結果を記録する
- タスク4: 未タスク検出レポート — 0件でも検出結果を出力する
- タスク5: スキルフィードバック — 改善点なしでもレポートを出力する

### タスク1: 実装ガイド作成

**目的**: `skill:getFileTree` IPCハンドラーの使用方法を文書化する

**実行手順**:

1. Part 1: 概念的説明（初学者・非技術者向け、中学生レベル）を作成する
2. Part 2: 技術的詳細（開発者向け）を作成する
3. IPC ドキュメント（チャンネル仕様）を作成する

#### Part 1: 概念的説明（中学生レベル — 日常例え必須）

以下の構成で作成すること:

```markdown
# skill:getFileTree 実装ガイド

## Part 1: 概念的説明（中学生レベル）

### ファイルツリーとは？

ファイルツリーは、**本棚の目次**のようなものです。

想像してみてください。大きな本棚に並んだ本を探す場面を。
目次があれば、どの棚にどの本があるか一目でわかります。

- **本棚（スキルフォルダ）**: スキルのファイルが保存されている場所
- **目次（ファイルツリー）**: フォルダとファイルの一覧表
- **棚（ディレクトリ）**: ファイルをまとめるフォルダ
- **本（ファイル）**: 実際のコードやデータ

### なぜ直接見に行かないの？（IPC通信の説明）

[セキュリティの観点から、Renderer → Preload → Main の経路を説明]

### パストラバーサル防止とは？

[不正なパス指定から守る仕組みの説明]
```

#### Part 2: 技術的詳細（開発者向け）

以下の内容を含めること:

- IPC通信フロー図（Renderer → Preload → Main → SkillFileManager）
- 変更ファイル一覧と各ファイルの変更内容
- `SkillFileTreeNode` 型の定義とフィールド説明
- セキュリティ考慮事項（3段バリデーション、パストラバーサル対策）
- 使用例コード

#### IPC ドキュメント

以下の内容を含めること:

- チャンネル名: `skill:getFileTree`
- 方向: Renderer → Main
- 引数: `skillName: string`
- 戻り値: `SkillFileTreeNode[]`
- エラーレスポンス形式
- バリデーションルール

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/ipc-documentation.md`

---

### タスク2: システム仕様書更新（spec-update-workflow.md 準拠）

**目的**: システム仕様書を現在の実装状態に同期する

**⚠️ 重要: LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする（P43対策）**

#### Step 1-A: タスク完了記録

以下の全ファイルを更新する:

| #   | 更新対象ファイル                                                                  | 更新内容                                              | 完了 |
| --- | --------------------------------------------------------------------------------- | ----------------------------------------------------- | ---- |
| 1   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | `skill:getFileTree` チャンネルの仕様を追加            | -    |
| 2   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `SkillFileTreeNode` 型と `getFileTree` メソッドを追加 | -    |
| 3   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | UT-UI-05A-GETFILETREE-001 の完了記録を追加            | -    |
| 4   | `.claude/skills/aiworkflow-requirements/LOGS.md`                                  | タスク完了記録を追加                                  | -    |
| 5   | `.claude/skills/task-specification-creator/LOGS.md`                               | タスク完了記録を追加（**P1/P25: 2ファイル両方**）     | -    |
| 6   | `.claude/skills/aiworkflow-requirements/SKILL.md`                                 | 変更履歴テーブルを更新（**P29対策**）                 | -    |
| 7   | `.claude/skills/task-specification-creator/SKILL.md`                              | 変更履歴テーブルを更新                                | -    |

#### Step 1-B: 実装状況テーブル更新

- api-ipc-agent.md の IPC チャンネル実装状況テーブルに `skill:getFileTree` を追加する

#### Step 1-C: 関連タスクテーブル更新

```bash
# 関連仕様書を検索
grep -rn "UT-UI-05A-GETFILETREE-001" .claude/skills/aiworkflow-requirements/references/
grep -rn "UT-UI-05A-GETFILETREE-001" .claude/skills/task-specification-creator/references/
```

検出された全ファイルの関連タスクテーブルを更新する。

#### Step 1-D: topic-map.md 再生成（P2/P27対策）

```bash
# topic-map.md を再生成
cd .claude/skills/aiworkflow-requirements && node generate-index.js
cd .claude/skills/task-specification-creator && node generate-index.js
```

#### Step 2: システム仕様更新（新規IPCチャンネル追加のため該当）

| #   | 更新対象                                                                     | 更新内容                                     | 完了 |
| --- | ---------------------------------------------------------------------------- | -------------------------------------------- | ---- |
| 1   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | `skill:getFileTree` のセキュリティ仕様を追加 | -    |

#### SubAgent分担テーブル（P43対策: 3ファイル以下/エージェント）

| エージェント | 担当ファイル                                                                                      | ファイル数 |
| ------------ | ------------------------------------------------------------------------------------------------- | ---------- |
| Agent A      | api-ipc-agent.md, interfaces-agent-sdk-skill.md, task-workflow.md                                 | 3          |
| Agent B      | security-electron-ipc.md, aiworkflow-requirements/LOGS.md, task-specification-creator/LOGS.md     | 3          |
| Agent C      | aiworkflow-requirements/SKILL.md, task-specification-creator/SKILL.md, documentation-changelog.md | 3          |
| Agent D      | aiworkflow topic-map再生成, task-specification topic-map再生成, spec-update-summary.md            | 3          |

**期待される成果物**:

- `outputs/phase-12/spec-update-summary.md`

---

### タスク3: documentation-changelog.md 作成

**目的**: 更新した全仕様書の変更内容を記録する

**⚠️ 重要: 全 Step 確認前に「完了」と記載しない（P4/P37対策）**

**記録項目**:

| #   | 記録内容                   | 記載基準                         |
| --- | -------------------------- | -------------------------------- |
| 1   | 更新した仕様書のファイル名 | 更新した全ファイルをリストアップ |
| 2   | 各ファイルの変更内容       | 追加/更新/削除を明示             |
| 3   | Step 1-A の完了結果        | 7ファイル全ての更新結果を記録    |
| 4   | Step 1-B の完了結果        | 実装状況テーブル更新結果を記録   |
| 5   | Step 1-C の完了結果        | grep 検索結果と更新結果を記録    |
| 6   | Step 1-D の完了結果        | topic-map.md 再生成結果を記録    |
| 7   | Step 2 の完了結果          | セキュリティ仕様更新結果を記録   |

**完了条件**: 上記全項目の結果を記録した後に初めて「Phase 12 Task 3 完了」と記載可能

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出レポート

**目的**: 未タスクを検出し記録する（0件でも必須）

**実行手順**:

1. 実装中に発見した改善点・TODO・FIXME を収集する
2. Phase 10 の MINOR 指摘（ある場合）を未タスクに変換する
3. 検出した未タスクは以下の3ステップを全て完了する（P3/P38対策）:

| ステップ | 内容                                                                      | 完了 |
| -------- | ------------------------------------------------------------------------- | ---- |
| 1        | `docs/30-workflows/unassigned-task/` に指示書を作成（正しいディレクトリ） | -    |
| 2        | `task-workflow.md` の残課題テーブルに登録                                 | -    |
| 3        | 関連仕様書に参照リンクを追加                                              | -    |

4. `unassigned-task-detection.md` の件数・ステータスを更新する
5. `artifacts.json` の Phase 12 ステータスを更新する

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

---

### タスク5: スキルフィードバック作成

**目的**: 開発プロセスの改善点をフィードバックとして記録する（P28対策: 改善点なしでも必須）

**記録項目**:

| #   | フィードバック観点                   | 記録内容                            |
| --- | ------------------------------------ | ----------------------------------- |
| 1   | IPC ハンドラー追加のワークフロー効率 | ファイル追加パターンの定型化の可否  |
| 2   | テストパターンの再利用性             | 既存テストとの共通化の余地          |
| 3   | 仕様書テンプレートの改善点           | Phase 12 の効率化に向けた提案       |
| 4   | 落とし穴回避の実効性                 | P42, P45 等の対策が実際に機能したか |

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

## 実行手順（順序重要）

```
1. タスク1（実装ガイド作成）
   ↓
2. タスク2（システム仕様書更新）
   ├─ Step 1-A: タスク完了記録（7ファイル）
   ├─ Step 1-B: 実装状況テーブル更新
   ├─ Step 1-C: 関連タスクテーブル更新
   ├─ Step 1-D: topic-map.md 再生成
   └─ Step 2: システム仕様更新（セキュリティ）
   ↓
3. タスク3（documentation-changelog 作成）
   ※全Step完了後に記録（P4/P37対策）
   ↓
4. タスク4（未タスク検出レポート）
   ↓
5. タスク5（スキルフィードバック作成）
   ↓
6. LOGS.md 更新（最終ステップ — P43対策）
```

---

## 参照資料

| 資料名                       | パス                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| Phase 11 成果物              | `outputs/phase-11/manual-test-report.md`                                                         |
| spec-update-workflow（正本） | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`                      |
| phase-templates              | `.claude/skills/task-specification-creator/references/phase-templates.md`                        |
| api-ipc-agent                | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                             |
| interfaces-agent-sdk-skill   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                |
| task-workflow                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                             |
| security-electron-ipc        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                     |
| 抽出マトリクス               | `docs/30-workflows/completed-tasks/getfiletree-ipc/aiworkflow-requirements-extraction-matrix.md` |
| 差分反映マトリクス           | `docs/30-workflows/completed-tasks/getfiletree-ipc/branch-diff-reflection-matrix.md`             |
| 仕様整合レビュー             | `docs/30-workflows/completed-tasks/getfiletree-ipc/spec-alignment-review.md`                     |
| 多角思考改善マトリクス       | `docs/30-workflows/completed-tasks/getfiletree-ipc/multi-thinking-improvement-matrix.md`         |
| エレガント整合レポート       | `docs/30-workflows/completed-tasks/getfiletree-ipc/elegant-consistency-check-report.md`          |
| 既知の落とし穴               | `.claude/rules/06-known-pitfalls.md`                                                             |

依存Phase参照: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11

---

## 成果物

| 成果物               | パス                                            |
| -------------------- | ----------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      |
| IPC ドキュメント     | `outputs/phase-12/ipc-documentation.md`         |
| 仕様書更新サマリー   | `outputs/phase-12/spec-update-summary.md`       |
| ドキュメント変更ログ | `outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     |

---

## 完了条件

### タスク1: 実装ガイド

- [ ] Part 1（中学生レベル概念説明）を作成した（日常例え含む）
- [ ] Part 2（開発者向け実装詳細）を作成した
- [ ] IPC ドキュメントを作成した

### タスク2: システム仕様書更新

- [ ] Step 1-A: api-ipc-agent.md に skill:getFileTree チャンネル仕様を追加した
- [ ] Step 1-A: interfaces-agent-sdk-skill.md に SkillFileTreeNode 型と getFileTree メソッドを追加した
- [ ] Step 1-A: task-workflow.md に完了記録を追加した
- [ ] Step 1-A: aiworkflow-requirements/LOGS.md を更新した
- [ ] Step 1-A: task-specification-creator/LOGS.md を更新した（**P1/P25: 2ファイル両方**）
- [ ] Step 1-A: aiworkflow-requirements/SKILL.md の変更履歴を更新した（**P29対策**）
- [ ] Step 1-A: task-specification-creator/SKILL.md の変更履歴を更新した
- [ ] Step 1-B: 実装状況テーブルを更新した
- [ ] Step 1-C: 関連タスクテーブルを更新した
- [ ] Step 1-D: topic-map.md を再生成した（**P2/P27対策**）
- [ ] Step 2: security-electron-ipc.md にセキュリティ仕様を追加した

### タスク3: documentation-changelog

- [ ] 更新した全仕様書の変更内容を記録した
- [ ] 各 Step の完了結果を詳細に記録した
- [ ] 全 Step 完了確認後に「完了」と記載した（**P4/P37対策**）

### タスク4: 未タスク検出

- [ ] unassigned-task-detection.md を作成した（0件でも作成）
- [ ] 検出した未タスクは3ステップ全完了した（P3/P38対策）
- [ ] artifacts.json の Phase 12 ステータスを更新した

### タスク5: スキルフィードバック

- [ ] skill-feedback-report.md を作成した（改善点なしでも作成 — P28対策）

---

## Phase 12 完了チェックリスト

> **全5タスクを確認してから完了とすること**

- [ ] タスク1（実装ガイド）完了
- [ ] タスク2（システム仕様書更新）完了
- [ ] タスク3（documentation-changelog）完了
- [ ] タスク4（未タスク検出レポート）完了
- [ ] タスク5（スキルフィードバック）完了
- [ ] LOGS.md が2ファイル両方更新されている（最終確認）
- [ ] 多角思考改善マトリクスを更新し、矛盾・漏れ・依存崩れがないことを確認した
- [ ] エレガント整合レポートを更新し、台帳・依存・リンク整合がPASSであることを確認した

---

## 次Phase

Phase 13（完了）へ進む
