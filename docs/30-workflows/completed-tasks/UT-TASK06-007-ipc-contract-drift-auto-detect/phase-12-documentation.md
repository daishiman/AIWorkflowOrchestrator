# Phase 12: ドキュメント - IPC契約ドリフト自動検出スクリプト

## メタ情報

| 項目   | 値                                           |
| ------ | -------------------------------------------- |
| Phase  | 12                                           |
| 機能名 | UT-TASK06-007-ipc-contract-drift-auto-detect |
| 作成日 | 2026-03-18                                   |

## 目的

IPC契約ドリフト自動検出スクリプトの実装ガイド・システム仕様書更新・未タスク検出・スキルフィードバックを完了し、後続タスクの実装者が正確な仕様を参照できる状態にする。Phase 11（手動テスト）で全 TC が PASS し、スクリプトの動作と設計文書の整合性が確認されている。

## 実行タスク

### Task 1: 実装ガイド作成

**目的**: 実装内容を中学生レベル（Part 1）と開発者向け技術詳細（Part 2）の2部構成で記録する。

### Task 2: システム仕様書更新

**目的**: 実装事実をシステム仕様書（aiworkflow-requirements）に反映する。Step 1-A〜1-G および Step 2 を順次実施する。

### Task 3: documentation-changelog.md 作成

**目的**: 本 Phase で更新した全仕様書の変更内容を記録する（P4対策: 全 Step 完了後に記録）。

### Task 4: 未タスク検出

**目的**: 本実装で発見した残課題を formalize する（0件でも出力必須）。

### Task 5: スキルフィードバックレポート作成

**目的**: 本タスクで発見したスキル・ワークフロー改善観点を記録する（0件でも出力必須、P28対策）。

### Task 6: タスク仕様準拠チェック

**目的**: Phase 12 の全タスク（Task 1〜5）がタスク仕様書テンプレートに準拠しているかを検証し、記録する。

## 参照資料

| 参照資料                 | パス                                                         | 内容                                   |
| ------------------------ | ------------------------------------------------------------ | -------------------------------------- |
| Phase 1（要件定義）      | `phase-1-requirements.md`                                    | 依存する前提成果物を確認する           |
| Phase 2（設計）          | `phase-2-design.md`                                          | 処理フロー・検出ルール設計を確認する   |
| Phase 5（実装）          | `phase-5-implementation.md`                                  | 実装内容と変更点を確認する             |
| Phase 9（品質検証）      | `phase-9-quality.md`                                         | Lint・型チェック・テスト結果を確認する |
| Phase 10（最終レビュー） | `phase-10-final-review.md`                                   | 最終判定と指摘事項を確認する           |
| Phase 11（手動テスト）   | `phase-11-manual-test.md`                                    | 手動確認結果を確認する                 |
| スクリプト本体           | `apps/desktop/scripts/check-ipc-contracts.ts`                | 実装済みのスクリプトを確認する         |
| テストファイル           | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` | テスト内容を確認する                   |

### システム仕様（aiworkflow-requirements）

> 以下の正本仕様との整合を確認してからシステム仕様書を更新する。

| 参照資料                | パス                                                                                    | 内容                                   |
| ----------------------- | --------------------------------------------------------------------------------------- | -------------------------------------- |
| ipc-contract-checklist  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`           | IPC契約検証の正本（主要更新対象）      |
| quality-requirements    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`             | Phase 9 品質ゲート基準（主要更新対象） |
| security-electron-ipc   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`            | IPC セキュリティ設計の正本             |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | タスク台帳（残課題・完了記録）         |
| Phase 11/12 ガイド      | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | Phase 11/12 実行ガイダンス             |
| Phase 12 ガイド         | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | Phase 12 実行ガイド                    |
| 仕様更新ワークフロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | 仕様更新手順の正本                     |
| 検証マトリクス          | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md` | validator と pass 基準                 |
| Phase 12 チェックリスト | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`  | Task 1/3/4/5 実体確認チェックリスト    |
| 未タスク管理ガイド      | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`    | 未タスク検出・登録手順の正本           |

## 実行手順

### ステップ0: docs-onlyモード判定

本タスクは docs-only タスク（バックエンドスクリプト追加のみ、UI変更なし）に該当する。

| 項目                        | 通常タスク         | docs-only タスク（本タスク）                            |
| --------------------------- | ------------------ | ------------------------------------------------------- |
| Step 1-D 検証コマンド       | 実行して結果記録   | **実行して結果記録**（スクリプトは実装済み）            |
| implementation-guide Part 2 | 実装詳細・コード例 | スクリプト設計・検出ルール・CLIオプション・Phase 9 統合 |
| Step 1-B 実装状況           | `completed`        | `completed`（スクリプトは実装済み）                     |

### ステップ1: 参照資料を確認する

Phase 1〜11 の成果物と system spec（ipc-contract-checklist.md、quality-requirements.md）を読み、実装の全体像を把握する。

### ステップ2: Task 1 実装ガイド作成

`outputs/phase-12/implementation-guide.md` を新規作成する。

**Part 1（中学生レベル概念説明）**:

- 日常例え: 「お店の注文票と厨房の調理指示書が一致しているかを自動チェックする仕組み」として説明する
- IPC契約ドリフトとは: お客さん（Renderer）が「ラーメン1杯」と注文票に書いたのに、厨房（Main Process）の調理指示書には「うどん2杯」と書いてある状態
- なぜ自動検出が必要か: お店が大きくなると注文票も調理指示書も増える。人間が全部を目で確認するのは大変
- 4つの検出ルール: R-01〜R-04 を日常例えで説明

**Part 2（開発者向け技術詳細）**:

- スクリプトファイル: `apps/desktop/scripts/check-ipc-contracts.ts`
- テストファイル: `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`
- 検出ルール詳細: R-01（チャンネル名不一致）、R-02（引数形式不一致）、R-03（戻り値型不一致）、R-04（未登録ハンドラ）
- CLIオプション: `--report-only` / `--strict` / `--format json`
- Phase 9 品質ゲート統合手順

**成果物**: `outputs/phase-12/implementation-guide.md`

### ステップ3: Task 2 システム仕様書更新

> **警告**: P1/P25/P43 対策として、全ステップ完了前に「完了」と記載しない。実際の更新後に changelog を記録する。

#### Step 1-A: タスク完了記録（2ファイル必須）

**更新対象ファイル1**: `.claude/skills/aiworkflow-requirements/LOGS.md`

- 日付: 2026-03-18、タスクID: UT-TASK06-007、内容: IPC契約ドリフト自動検出スクリプト実装完了

**更新対象ファイル2**: `.claude/skills/task-specification-creator/LOGS.md`

- 日付: 2026-03-18、タスクID: UT-TASK06-007、内容: 仕様書一式（Phase 1-13）作成完了

**SKILL.md 変更履歴更新**:

- `.claude/skills/aiworkflow-requirements/SKILL.md` 変更履歴に UT-TASK06-007 完了記録を追加
- `.claude/skills/task-specification-creator/SKILL.md` 変更履歴に UT-TASK06-007 完了記録を追加

**完了確認**: `grep -n "UT-TASK06-007"` で2ファイル両方に追記されていることを確認する

#### Step 1-B: 実装状況更新

`.claude/skills/aiworkflow-requirements/references/quality-requirements.md` に IPC Contract Drift Auto-Detection セクションを追記する。

#### Step 1-C: 関連タスク更新

```bash
grep -rn "UT-TASK06-007" .claude/skills/aiworkflow-requirements/references/
```

検索で発見した仕様書に、本タスク完了記録を追記する。

#### Step 1-D: topic-map.md 再生成

```bash
cd .claude/skills/aiworkflow-requirements && node scripts/generate-index.js
```

実行後、`indexes/topic-map.md` の更新日時が変わっていることを確認する（P2対策）。

#### Step 1-E: 未タスク指示書作成・登録（Task 4 で検出した場合）

Task 4 で未タスクを1件以上検出した場合、以下の手順を実施する（P3/P38対策）:

1. `docs/30-workflows/unassigned-task/` に独立した指示書ファイルを作成する
2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する
4. `verify-unassigned-links.js` で `ALL_LINKS_EXIST` を確認する
5. `audit-unassigned-tasks.js` で current/baseline を分離記録する

**配置先判定テーブル（P38再発防止）**:

| 状態             | 配置先                                               |
| ---------------- | ---------------------------------------------------- |
| 未完了（未着手） | `docs/30-workflows/unassigned-task/`                 |
| 完了移管済み     | `docs/30-workflows/completed-tasks/unassigned-task/` |

**未タスク台帳登録先**:

| 項目         | パス                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| 指示書配置先 | `docs/30-workflows/unassigned-task/`                                                |
| 台帳登録先   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` 残課題テーブル |
| リンク追加先 | 関連仕様書（`ipc-contract-checklist.md` / `quality-requirements.md` 等）            |

**未タスクリンク検証**:

```bash
# verify-unassigned-links.js で ALL_LINKS_EXIST を確認
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source .claude/skills/aiworkflow-requirements/references/task-workflow.md
```

**未タスク監査（current/baseline 分離）**:

```bash
# 1) 対象未タスクの今回差分監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD

# 2) 全体監査（baseline 資産健全性監視）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
```

判定ルール: `currentViolations.total > 0` で fail。baseline は参考値として記録する。

#### Step 1-F: DevOps関連確認（該当する場合）

本タスクは Phase 9 品質ゲートへの CI 統合を含むため、以下の仕様書を確認し、必要に応じて更新する:

| 確認対象仕様書          | パス                                                                        | 更新条件                                                                              |
| ----------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| deployment-gha.md       | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`       | CI パイプラインにスクリプト実行ステップの言及がない場合                               |
| technology-devops.md    | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`    | DevOps ツールチェーンにスクリプトの言及がない場合                                     |
| quality-requirements.md | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | Phase 9 チェック項目にスクリプト実行がない場合（Step 1-B で対応済みの場合はスキップ） |

#### Step 1-G: 検証コマンド順次実行

以下のコマンドを順次実行し、全て PASS することを確認する:

```bash
# 1. 未タスクリンク検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source .claude/skills/aiworkflow-requirements/references/task-workflow.md

# 2. topic-map 再生成（aiworkflow-requirements）
cd .claude/skills/aiworkflow-requirements && node scripts/generate-index.js

# 3. topic-map 再生成（task-specification-creator、該当する場合）
cd .claude/skills/task-specification-creator && node scripts/generate-index.js 2>/dev/null || echo "task-specification-creator generate-index.js: skip"

# 4. quick_validate.js（3スキル）
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator

# 5. Phase仕様書参照整合確認
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-TASK06-007-ipc-contract-drift-auto-detect

# 6. 構造検証
node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js 2>/dev/null || echo "validate-structure.js: skip"
```

**Warning 3段階分類判定フロー**:

| 分類   | 基準                                               | 対応                                  |
| ------ | -------------------------------------------------- | ------------------------------------- |
| 許容   | legacy baseline の既知 warning                     | note として changelog に記録          |
| 要監視 | current に関わるが機能影響なし                     | changelog に記録し、次回タスクで対応  |
| 要対応 | root drift / dependency orphan / current violation | Phase 12 内で解消する（blocker 扱い） |

#### Step 2: システム仕様更新（条件付き）

| 確認対象仕様書            | パス                                                                          | 更新条件                                             |
| ------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------- |
| ipc-contract-checklist.md | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | 自動検出スクリプトへの参照がない場合は追加           |
| quality-requirements.md   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | Phase 9 チェック項目にスクリプト実行がない場合は追加 |
| security-electron-ipc.md  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | IPC契約ドリフト防止ツールの言及がない場合は追記      |

### ステップ4: Task 3 documentation-changelog.md 作成

> Task 2 の全 Step 完了後に記録する（P4対策）。

`outputs/phase-12/documentation-changelog.md` を作成し、各 Step の更新結果を記録する:

```markdown
## UT-TASK06-007 documentation-changelog

### Step 1-A

- aiworkflow-requirements/LOGS.md: UT-TASK06-007 完了記録を追記（実施済み / 未実施）
- task-specification-creator/LOGS.md: UT-TASK06-007 完了記録を追記（実施済み / 未実施）
- aiworkflow-requirements/SKILL.md: 変更履歴更新（実施済み / 未実施）
- task-specification-creator/SKILL.md: 変更履歴更新（実施済み / 未実施）

### Step 1-B

- quality-requirements.md: IPC Contract Drift Auto-Detection セクション追記（実施済み / 対象外）

### Step 1-C

- 検索結果: [発見したファイルと更新内容を記録]

### Step 1-D

- topic-map.md 再生成: （実施済み / 対象外）

### Step 1-E

- 未タスク指示書作成: （実施済み / 対象外（0件））
- verify-unassigned-links.js ALL_LINKS_EXIST: （PASS / FAIL / 対象外）
- audit-unassigned-tasks.js currentViolations: （0 / N件 / 対象外）

### Step 1-F

- deployment-gha.md: （更新済み / 対象外）
- technology-devops.md: （更新済み / 対象外）
- quality-requirements.md: （Step 1-B で対応済み / 更新済み / 対象外）

### Step 1-G

- verify-unassigned-links.js: （PASS / FAIL）
- generate-index.js (aiworkflow-requirements): （実施済み / FAIL）
- generate-index.js (task-specification-creator): （実施済み / スキップ）
- quick_validate.js (aiworkflow-requirements): （PASS / FAIL）
- quick_validate.js (task-specification-creator): （PASS / FAIL）
- quick_validate.js (skill-creator): （PASS / FAIL）
- validate-phase-output.js: （PASS / FAIL）
- Warning 分類: [許容N件 / 要監視N件 / 要対応N件]

### Step 2

- [更新した仕様書の名前と更新内容]
```

**planned wording 残存確認**:

```bash
grep -rn "予定\|計画" outputs/phase-12/documentation-changelog.md
```

**成果物**: `outputs/phase-12/documentation-changelog.md`

### ステップ5: Task 4 未タスク検出

Phase 1〜11 の成果物を確認し、未解決の問題・改善余地を列挙する。

検出パターン:

- Phase 3/10 MINOR 指摘の未対応分
- TODO/FIXME コメント: `grep -rn "TODO\|FIXME" apps/desktop/scripts/check-ipc-contracts.ts`
- スコープ外項目（Phase 2 設計で明示的に除外した機能）
- `ipcMain.on` パターンの検証（第2フェーズ候補として記録）
- P45 セマンティクス乖離の自動検出（将来拡張候補として記録）

検出した未タスクが1件以上ある場合は、Step 1-E の手順（P3/P38 準拠の5ステップ）を実施する。

再評価クローズした未タスクがある場合は `gh issue close <number>` で GitHub Issue を同時に Close する（P56対策）。

**Phase 10 MINOR 追跡テーブル**:

| MINOR ID | 指摘内容 | 解決予定Phase | 解決確認Phase | 解決方法 | ステータス |
| -------- | -------- | ------------- | ------------- | -------- | ---------- |
| -        | -        | -             | -             | -        | -          |

- Phase 10 MINOR は全て未タスク仕様書に変換するか、Phase 12 内で解決する（省略不可）
- `documentation-changelog.md` に追跡結果を記録する

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

### ステップ6: Task 5 スキルフィードバックレポート作成

Phase 1〜11 を通じて発見したスキル改善観点を列挙する。改善観点がない場合は「改善点なし」として理由を明記する（P28対策）。

**成果物**: `outputs/phase-12/skill-feedback-report.md`

### ステップ7: Task 6 タスク仕様準拠チェック

Task 1〜5 の成果物が全て生成されていることを確認し、各成果物の内容がテンプレートの必須セクションを満たしているか検証する。

**成果物ファイル名照合テーブル**:

| Task | 成果物ファイル名                                         | 存在確認 |
| ---- | -------------------------------------------------------- | -------- |
| 1    | `outputs/phase-12/implementation-guide.md`               | -        |
| 2    | `outputs/phase-12/system-spec-update-summary.md`         | -        |
| 3    | `outputs/phase-12/documentation-changelog.md`            | -        |
| 4    | `outputs/phase-12/unassigned-task-detection.md`          | -        |
| 5    | `outputs/phase-12/skill-feedback-report.md`              | -        |
| 6    | `outputs/phase-12/phase12-task-spec-compliance-check.md` | -        |

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

### ステップ8: システム仕様との整合確認

更新した仕様書が aiworkflow-requirements の既存設計と矛盾していないことを確認する。

### ステップ9: 完了条件の最終チェック

全 Task の成果物が生成されていることを確認し、完了条件チェックリストをチェックする。

`git diff --stat -- .claude/skills/` で実際の変更ファイルを確認し、changelog の記録と一致していることを検証する（P51対策）。

`grep -rn "予定\|計画" outputs/phase-12/documentation-changelog.md` で planned wording が残存していないことを確認する。

## 統合テスト連携

Phase 12 完了時に以下の統合観点を確認する:

1. `ipc-contract-checklist.md` に自動検出スクリプトへの参照が追加されていること
2. `quality-requirements.md` の Phase 9 チェック項目にスクリプト実行が含まれていること
3. 未タスクとして検出された将来拡張候補（`ipcMain.on` パターン、P45 セマンティクス検出）が `task-workflow.md` に登録されていること

## 多角的チェック観点（AIが判断）

| 観点           | 確認内容                                                                 | 判定 |
| -------------- | ------------------------------------------------------------------------ | ---- |
| 文書完全性     | Task 1〜6 の全成果物が生成されているか                                   | -    |
| 仕様整合性     | 更新した仕様書が aiworkflow-requirements の既存設計と矛盾していないか    | -    |
| 追跡可能性     | LOGS.md x 2、SKILL.md x 2 の完了記録が追記されているか                   | -    |
| 未タスク管理   | 検出した未タスクが P3/P38 準拠の3ステップで管理されているか              | -    |
| changelog 品質 | documentation-changelog に「予定」「計画」等の未実施表現が残っていないか | -    |

## 成果物

| 成果物                   | パス                                                     | 内容                                         |
| ------------------------ | -------------------------------------------------------- | -------------------------------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Part 1（概念説明）と Part 2（技術詳細）      |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の更新結果を記録する         |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | 全 Step の更新結果を記録する                 |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | 残件と検出件数（0件含む）を記録する          |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | スキル改善観点（0件でも出力）を記録する      |
| タスク仕様準拠チェック   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 の準拠チェック結果を記録する |

## 完了条件

- [ ] Task 1: `outputs/phase-12/implementation-guide.md` が生成され、Part 1（日常例えあり）・Part 2（技術詳細）の2部構成で記述されている
- [ ] Task 2 Step 1-A: `aiworkflow-requirements/LOGS.md` に UT-TASK06-007 完了記録が追記されている
- [ ] Task 2 Step 1-A: `task-specification-creator/LOGS.md` に UT-TASK06-007 完了記録が追記されている（2ファイル必須）
- [ ] Task 2 Step 1-A: `aiworkflow-requirements/SKILL.md` の変更履歴が更新されている
- [ ] Task 2 Step 1-A: `task-specification-creator/SKILL.md` の変更履歴が更新されている
- [ ] Task 2 Step 1-B: `quality-requirements.md` に IPC Contract Drift Auto-Detection 実装状況が記録されている
- [ ] Task 2 Step 1-C: `grep -rn "UT-TASK06-007"` で検索した結果が記録されている
- [ ] Task 2 Step 1-D: `topic-map.md` が再生成されている（更新があった場合）
- [ ] Task 2 Step 1-E: 未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている（検出した場合）
- [ ] Task 2 Step 1-E: `verify-unassigned-links.js` で `ALL_LINKS_EXIST` が確認されている（検出した場合）
- [ ] Task 2 Step 1-E: `audit-unassigned-tasks.js` で `currentViolations.total = 0` が確認されている（検出した場合）
- [ ] Task 2 Step 1-F: DevOps関連仕様書（deployment-gha.md / technology-devops.md）の確認が記録されている
- [ ] Task 2 Step 1-G: 検証コマンド（verify-unassigned-links / generate-index x2 / quick_validate x3 / validate-phase-output）が全て PASS している
- [ ] Task 2 Step 1-G: Warning 3段階分類（許容/要監視/要対応）の判定結果が記録されている
- [ ] Task 3: `outputs/phase-12/documentation-changelog.md` が生成され、全 Step（1-A〜1-G, Step 2）の実施結果が記録されている
- [ ] Task 4: `outputs/phase-12/unassigned-task-detection.md` が生成されている（0件でも必須）
- [ ] Task 5: `outputs/phase-12/skill-feedback-report.md` が生成されている（0件でも必須）
- [ ] Task 2: `outputs/phase-12/system-spec-update-summary.md` が生成されている
- [ ] Task 6: `outputs/phase-12/phase12-task-spec-compliance-check.md` が生成されている
- [ ] LOGS.md の更新が2ファイル両方に行われていることを確認する（P1/P25対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク | 担当   | ステータス | 備考                    |
| ---------- | ------ | ---------- | ----------------------- |
| Task 1     | メイン | 未実施     | 実装ガイド作成          |
| Task 2     | メイン | 未実施     | システム仕様書更新      |
| Task 3     | メイン | 未実施     | documentation-changelog |
| Task 4     | メイン | 未実施     | 未タスク検出            |
| Task 5     | メイン | 未実施     | スキルフィードバック    |
| Task 6     | メイン | 未実施     | タスク仕様準拠チェック  |

## タスク100%実行確認【必須】

```bash
node docs/30-workflows/UT-TASK06-007-ipc-contract-drift-auto-detect/scripts/validate-phase-output.js --phase 12
```

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-TASK06-007-ipc-contract-drift-auto-detect/phase-13-pr.md`
