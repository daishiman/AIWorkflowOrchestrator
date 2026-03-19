# Phase 12: ドキュメント

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスク ID  | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 |
| 機能名     | skilldetail-action-buttons              |
| Phase      | 12                                      |
| 作成日     | 2026-03-17                              |
| 依存 Phase | Phase 11 成果物（`outputs/phase-11/`）  |

## 目的

実装ガイド・システム仕様書更新・documentation-changelog・未タスク検出の5つの必須タスクを全て完了する。Phase 12 は漏れが最も発生しやすい Phase であるため、チェックリストを逐次確認しながら実施する。

> **重要**: 全 Task の完了前に documentation-changelog に「完了」と記載しない（P4 防止）。

## 参照資料

- タスク実行ルール: `.claude/rules/05-task-execution.md`
- 既知の落とし穴: `.claude/rules/06-known-pitfalls.md`（P1, P2, P3, P4, P43, P51, P59 を特に参照）
- Phase 11 成果物: `outputs/phase-11/`

## 実行タスク

- タスク 1: 実装ガイド（Part1/Part2）を作成する
- タスク 2: システム仕様書・LOGS/SKILL/topic-map を同期更新する
- タスク 3: documentation-changelog を Step 単位で記録する
- タスク 4: 未タスク検出と台帳反映を実施する
- タスク 5: スキルフィードバックレポートを作成する

---

## Task 1: 実装ガイド作成

### 成果物

| ファイル                                      | 内容                                                        |
| --------------------------------------------- | ----------------------------------------------------------- |
| `outputs/phase-12/implementation-guide.md`    | Part 1（中学生向け概念説明）＋ Part 2（開発者向け実装詳細） |
| `outputs/phase-12/component-documentation.md` | ActionButtons コンポーネント API ドキュメント               |

### Part 1 執筆要件（中学生レベル概念説明）

- 日常的なアナロジーを使った説明（例:「スキルがインポートされている = 本棚に本が並んでいる」）
- `isImported` フラグがボタン表示を制御する仕組みを平易に説明する
- 「エディタで開く」「分析する」の役割を一言で説明する

### Part 2 執筆要件（開発者向け）

- `ActionButtons` コンポーネントの Props 定義と使用例
- `useSkillCenter` の `handleEditSkill` / `handleAnalyzeSkill` のシグネチャ
- `isImported` 条件分岐のレンダリングロジック説明
- テストの実行方法

### 完了チェック

- [ ] `implementation-guide.md` Part 1 に日常例えが含まれている
- [ ] `implementation-guide.md` Part 2 に Props 定義と使用例が含まれている
- [ ] `component-documentation.md` に `ActionButtons` の API が記載されている

---

## Task 2: システム仕様書更新

> **注意**: P1 防止のため LOGS.md を2ファイル更新する。P2 防止のため topic-map.md を再生成する。

### Step 1-A: タスク完了記録

- [ ] 該当仕様書（`ui-ux-skill-detail.md` 等）にタスク完了記録を追加する
- [ ] `aiworkflow-requirements/LOGS.md` を更新する
- [ ] `task-specification-creator/LOGS.md` を更新する（**2ファイル必須**）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴を更新する
- [ ] `task-specification-creator/SKILL.md` 変更履歴を更新する

### Step 1-B: 実装状況テーブル（該当する場合）

- [ ] `ui-ux-skill-detail.md` 等の実装ステータスを `DONE` に更新する

### Step 1-C: 関連タスクテーブル

```bash
grep -rn "TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001" .claude/skills/aiworkflow-requirements/references/
```

- [ ] 上記コマンドで見つかった全ての仕様書に完了記録を追加する

### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] 実行ログで topic-map.md が更新されたことを確認する（P2 防止）

### Step 2: システム仕様更新（該当する場合）

- [ ] 新規コンポーネント・Hook が追加された場合、対応するインターフェース仕様書を更新する
- [ ] `handleEditSkill` / `handleAnalyzeSkill` のシグネチャが仕様書と一致していることを確認する

### Step 3: IPC 契約検証（今回は不要）

- 本タスクは IPC 修正を含まないためスキップする

### 完了チェック

- [ ] LOGS.md 2ファイルの更新が完了している
- [ ] SKILL.md 2ファイルの変更履歴が更新されている
- [ ] topic-map.md が再生成されている

---

## Task 3: documentation-changelog.md

> **注意**: 全 Step の完了前に「完了」と記載しない（P4 / P51 防止）。

### 成果物

| ファイル                                      | 内容                                           |
| --------------------------------------------- | ---------------------------------------------- |
| `outputs/phase-12/documentation-changelog.md` | 更新した全仕様書の変更内容と各 Step の完了結果 |

### 記載要件

- 更新した全仕様書のパスと変更内容を一覧化する
- 各 Step（1-A, 1-B, 1-C, 1-D, 2）の実行結果を事後記録する
- Step 未実施がある場合は「未実施」と明記する（隠蔽しない）

### 完了チェック

- [ ] Task 1〜5 の全完了後に changelog を記載している（早期記載禁止）
- [ ] 更新した仕様書の絶対パスが全て列挙されている

---

## Task 4: 未タスク検出

> **注意**: 0件でも `unassigned-task-report.md` は必ず作成する。3ステップを全て実施する（P3 防止）。

### 検出コマンド

```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" \
  apps/desktop/src/renderer/components/SkillDetailPanel/ \
  apps/desktop/src/renderer/hooks/useSkillCenter.ts
```

Phase 10 の MINOR 指摘も未タスク候補として確認する。

### 3ステップ（検出件数に関わらず全実施）

1. `docs/30-workflows/unassigned-task/` に指示書ファイルを作成する
2. `docs/30-workflows/task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

### 追加チェック（P56 防止）

- [ ] 再評価クローズした未タスクの GitHub Issue を `gh issue close` でクローズしている

### 成果物

| ファイル                                     | 内容                                  |
| -------------------------------------------- | ------------------------------------- |
| `outputs/phase-12/unassigned-task-report.md` | 検出した未タスクの一覧（0件でも作成） |

### 完了チェック

- [ ] `unassigned-task-report.md` が作成されている（0件でも必須）
- [ ] 検出した未タスクの3ステップが全完了している
- [ ] `unassigned-task-detection.md` の件数・ステータスが更新されている
- [ ] `artifacts.json` の Phase 12 ステータスが更新されている

---

## Task 5: スキルフィードバックレポート（P28 防止）

本タスクの実施を通じて改善が必要なワークフロー・ルール・テンプレートがあれば記録する。改善点がない場合も「改善点なし」としてレポートを作成する。

### 成果物

| ファイル                                    | 内容                                   |
| ------------------------------------------- | -------------------------------------- |
| `outputs/phase-12/skill-feedback-report.md` | ワークフロー改善点または「改善点なし」 |

### 完了チェック

- [ ] `skill-feedback-report.md` が作成されている

---

## 成果物

| ファイル                                      | 内容                            |
| --------------------------------------------- | ------------------------------- |
| `outputs/phase-12/implementation-guide.md`    | 実装ガイド（Part 1 / Part 2）   |
| `outputs/phase-12/component-documentation.md` | ActionButtons API ドキュメント  |
| `outputs/phase-12/documentation-changelog.md` | 仕様更新履歴                    |
| `outputs/phase-12/unassigned-task-report.md`  | 未タスク検出結果（0件でも必須） |
| `outputs/phase-12/skill-feedback-report.md`   | 改善提案または改善点なし記録    |

## 完了条件

- [ ] Task 1: 実装ガイドが作成されている
- [ ] Task 2: LOGS.md 2ファイル・SKILL.md 2ファイルが更新され、topic-map.md が再生成されている
- [ ] Task 3: documentation-changelog.md が全 Step 完了後に記載されている
- [ ] Task 4: unassigned-task-report.md が作成され、検出未タスクの3ステップが完了している
- [ ] Task 5: skill-feedback-report.md が作成されている

**本Phase内の全タスクを100%実行完了** してから次フェーズへ進むこと。

## 次 Phase

Phase 13（PR 作成）へ進む。
