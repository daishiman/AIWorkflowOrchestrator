# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 12                                   |
| Phase名    | ドキュメント更新                     |
| 前提Phase  | Phase 11（手動テスト検証）           |
| 後続Phase  | Phase 13（PR作成）                   |
| ステータス | 未実施                               |
| 作成日     | 2026-01-31                           |
| 機能名     | TASK-8C-E: E2Eテストフィクスチャ作成 |

---

## 目的

TASK-8C-E の実装結果をドキュメント化し、実装ガイド作成、システム仕様更新、未タスク検出を行う。

---

## 実行タスク（4タスク - 全て完了必須）

> 以下のタスクを順番に実行してください。

### Task 1: 実装ガイド作成（2パート構成）

**目的**: フィクスチャの使い方を初学者と開発者の両方に向けて説明する

**実行手順**:

#### Part 1: 初学者・中学生レベル

1. 以下の構成で実装ガイドの Part 1 を作成する：
   - **日常の例え話**: 「テスト用フィクスチャは、料理のレシピを試す前に用意する材料のサンプルセットのようなもの。本物の材料（本番スキル）の代わりに、テスト用の材料（フィクスチャ）を使って料理（テスト）がうまくいくか確認する」
   - **なぜ必要か**: E2E テストで本物のスキルディレクトリの代わりに使う「お試し用スキル」が必要な理由
   - **何をするか**: 3種類のフィクスチャ（完全なスキル、最小スキル、壊れたスキル）を用意すること
   - 専門用語は使わない（使う場合は即座に説明する）

#### Part 2: 開発者・技術者レベル

2. 以下の構成で Part 2 を作成する：
   - **フィクスチャ構造**: ディレクトリツリーとファイル一覧
   - **型定義**: `ScannedSkillMetadata` のフィクスチャ該当フィールド
   - **使用例**: テストコードでのフィクスチャパスの参照方法
   - **各フィクスチャの SkillScanner パース期待値**: name, description, allowedTools, agents, references の値
   - **注意事項**: 既存ユニットテストフィクスチャとの違い

3. `outputs/phase-12/implementation-guide.md` に出力する

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### Task 2: システム仕様書更新（2ステップ）

**目的**: タスク完了記録とシステム仕様の更新を行う

**実行手順**:

#### Step 1-A: タスク完了記録

1. 元タスク仕様書（`docs/30-workflows/skill-import-agent-system/tasks/task-8c-e-fixtures.md`）の完了条件チェックリストを更新する
2. 関連ドキュメントリンクと変更履歴を追記する
3. 以下の LOGS.md を**両方**更新する：
   - `.claude/skills/aiworkflow-requirements/LOGS.md`
   - `.claude/skills/task-specification-creator/LOGS.md`
4. `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` を更新する（新規セクションがある場合）

#### Step 1-B: 実装状況テーブル更新

1. 以下の仕様書を確認し、TASK-8C-E に関連する行の「ステータス」を更新する：
   - `arch-electron-services.md`（SkillScanner セクション内のテスト関連）

#### Step 1-C: 関連タスクテーブル更新

1. 以下の仕様書内の「関連タスク」テーブルで TASK-8C-E のステータスを更新する：
   - 元タスク仕様書内のブロッキング関係（TASK-8C-B/C/D のブロック解除）

#### Step 2: システム仕様更新（条件付き）

2. 本タスクはフィクスチャ（静的ファイル）の作成であり、新規インターフェースや API の追加はないため、**Step 2 は該当なし（スキップ）**

**期待される成果物**:

- LOGS.md 更新（2ファイル）
- 関連仕様書のステータス更新

---

### Task 3: ドキュメント更新履歴作成

**目的**: 本 Phase で行ったドキュメント更新を記録する

**実行手順**:

1. `outputs/phase-12/documentation-changelog.md` を作成する
2. 以下の内容を記載する：
   - Task 1（実装ガイド）の作成結果
   - Task 2（仕様更新）の各 Step の実施結果（「該当なし」も記録）
   - 更新したファイル一覧
3. artifacts.json を更新する（Phase 12 完了ステータス）：
   ```bash
   node .claude/skills/task-specification-creator/scripts/complete-phase.js \
     --workflow "docs/30-workflows/skill-import-agent-system/tasks/TASK-8C-E" \
     --phase 12 \
     --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:更新記録,outputs/phase-12/unassigned-task-report.md:未タスクレポート"
   ```

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### Task 4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: TASK-8C-E の実装で発見された未解決の課題や改善点を検出する

**実行手順**:

1. 以下のソースから未タスク候補を検出する：

| ソース                    | 確認項目                                       |
| ------------------------- | ---------------------------------------------- |
| 元タスク仕様書            | 「スコープ外」として明示された項目             |
| Phase 3 設計レビュー結果  | MINOR 判定の指摘事項                           |
| Phase 10 最終レビュー結果 | MINOR 判定の指摘事項                           |
| Phase 11 手動テスト結果   | スコープ外の発見事項・改善提案                 |
| Phase 11 発見事項レポート | `outputs/phase-11/discovered-issues.md` の内容 |
| コードコメント            | TODO/FIXME/HACK/XXX（テストコード内）          |

2. 未タスク候補が検出された場合：
   - 各候補の概要、優先度、対応方針を記載する
   - 未タスク仕様書テンプレートに従い `unassigned-task/` に仕様書を作成する

3. 未タスク候補が0件の場合：
   - 「検出された未タスク: 0件」と明記する
   - 確認したソース一覧を記載する

4. `outputs/phase-12/unassigned-task-report.md` に出力する

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`（**0件でも必須**）

---

## 参照資料

| 参照資料                | パス                                                                                   | 内容         |
| ----------------------- | -------------------------------------------------------------------------------------- | ------------ |
| Phase 11 手動テスト結果 | `outputs/phase-11/manual-test-result.md`                                               | テスト結果   |
| 仕様更新ワークフロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | 更新手順     |
| 未タスクガイドライン    | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`   | 未タスク基準 |
| 実装ガイドテンプレート  | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`    | テンプレート |
| 更新記録テンプレート    | `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md` | テンプレート |

---

## 成果物

| 成果物               | パス                                          | 内容                |
| -------------------- | --------------------------------------------- | ------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Part 1 + Part 2     |
| ドキュメント更新記録 | `outputs/phase-12/documentation-changelog.md` | 変更履歴            |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  | 検出結果（0件含む） |

---

## 完了条件

- [ ] Task 1: 実装ガイドが Part 1（中学生レベル）+ Part 2（技術者レベル）で作成されている
- [ ] Task 1: Part 1 に日常の例え話が含まれている
- [ ] Task 2 Step 1-A: LOGS.md が2ファイルとも更新されている
- [ ] Task 2 Step 1-B: 実装状況テーブルが更新されている
- [ ] Task 2 Step 1-C: 関連タスクテーブルが更新されている
- [ ] Task 2 Step 2: 該当なし（スキップ）が記録されている
- [ ] Task 3: documentation-changelog.md が全 Step の結果を個別に記載している
- [ ] Task 4: 未タスク検出レポートが作成されている（0件でも出力済み）
- [ ] artifacts.json が更新されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-13-pr-creation.md`
