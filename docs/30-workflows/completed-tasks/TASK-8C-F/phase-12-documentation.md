# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 12                                                         |
| Phase名    | ドキュメント更新                                           |
| 前提Phase  | Phase 11（手動テスト検証）                                 |
| 後続Phase  | Phase 13（PR作成）                                         |
| ステータス | 未実施                                                     |
| 作成日     | 2026-02-01                                                 |
| 機能名     | TASK-8C-F: Skill-Creator テスト用フィクスチャ & 実行スキル |

---

## 目的

TASK-8C-F の実装結果をドキュメント化し、実装ガイド作成、システム仕様更新、未タスク検出を行う。

---

## 実行タスク（4タスク - 全て完了必須）

> 以下のタスクを順番に実行してください。

### Task 1: 実装ガイド作成（2パート構成）

**目的**: skill-creator テスト用フィクスチャと検証スクリプトの使い方を初学者と開発者の両方に向けて説明する

**実行手順**:

#### Part 1: 初学者・中学生レベル

1. 以下の構成で実装ガイドの Part 1 を作成する：
   - **日常の例え話**: 「テスト用フィクスチャは、新しいクッキー型（skill-creator）がちゃんと動くかチェックするための"お試し生地セット"のようなもの。完璧な生地、最小限の生地、わざと失敗する生地を用意して、クッキー型がそれぞれに対して正しく動くか確かめる」
   - **なぜ必要か**: skill-creator が新しいスキルを作るとき、正しい構造で作れているか自動的にチェックする仕組みが必要な理由
   - **何をするか**: 5種類のフィクスチャ（完全・最小・部分・不正・オーケストレーション）と検証スクリプト、テスト実行スキルを用意すること
   - **検証スクリプトとは**: 「自動採点機のようなもの。スキルの構造を自動でチェックして、合格・不合格を教えてくれる」
   - 専門用語は使わない（使う場合は即座に説明する）

#### Part 2: 開発者・技術者レベル

2. 以下の構成で Part 2 を作成する：
   - **フィクスチャ構造**: ディレクトリツリーと各ファイルの役割
   - **skill-creator との対応マッピング**: 各フィクスチャが skill-creator のどのコンポーネントに対応するか
   - **検証スクリプト API**: 各スクリプトの入力/出力仕様、JSON 出力フォーマット
   - **テスト実行**: `pnpm vitest run` でのテスト実行方法
   - **skill-fixture-runner スキルの使い方**: コマンド例、出力例
   - **拡張方法**: 新しいフィクスチャ種別の追加手順
   - **注意事項**: TASK-8C-E フィクスチャとの違い（E2E用 vs skill-creator検証用）

3. `outputs/phase-12/implementation-guide.md` に出力する

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### Task 2: システム仕様書更新（2ステップ）

**目的**: タスク完了記録とシステム仕様の更新を行う

**実行手順**:

#### Step 1-A: タスク完了記録

1. 関連ドキュメントリンクと変更履歴を追記する
2. 以下の LOGS.md を**両方**更新する：
   - `.claude/skills/aiworkflow-requirements/LOGS.md`
   - `.claude/skills/task-specification-creator/LOGS.md`
3. `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` を更新する（テストフィクスチャに関するセクション追加）

#### Step 1-B: 実装状況テーブル更新

1. 以下の仕様書を確認し、TASK-8C-F に関連する行の「ステータス」を更新する：
   - `claude-code-skills-structure.md`（テストフィクスチャセクション）

#### Step 1-C: 関連タスクテーブル更新

1. 関連する仕様書内の「関連タスク」テーブルで TASK-8C-F のステータスを更新する

#### Step 2: システム仕様更新（条件付き）

2. skill-fixture-runner は新規スキルであるため、以下の仕様書を更新する：
   - `claude-code-skills-overview.md` にスキル一覧追加
   - `quality-e2e-testing.md` にフィクスチャ情報追加

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
   - Task 2（仕様更新）の各 Step の実施結果
   - 更新したファイル一覧
3. artifacts.json を更新する（Phase 12 完了ステータス）

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### Task 4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: TASK-8C-F の実装で発見された未解決の課題や改善点を検出する

**実行手順**:

1. 以下のソースから未タスク候補を検出する：

| ソース                    | 確認項目                                          |
| ------------------------- | ------------------------------------------------- |
| Phase 3 設計レビュー結果  | MINOR 判定の指摘事項                              |
| Phase 10 最終レビュー結果 | MINOR 判定の指摘事項                              |
| Phase 11 手動テスト結果   | スコープ外の発見事項・改善提案                    |
| Phase 11 発見事項レポート | `outputs/phase-11/discovered-issues.md` の内容    |
| コードコメント            | TODO/FIXME/HACK/XXX（テストコード・スクリプト内） |
| skill-creator 更新予定    | v8.1.0 以降の変更で追従が必要な箇所               |

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
| スキル概要仕様          | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`     | スキル一覧   |
| E2Eテスト仕様           | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`             | テスト仕様   |

---

## 成果物

| 成果物               | パス                                          | 内容                |
| -------------------- | --------------------------------------------- | ------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Part 1 + Part 2     |
| ドキュメント更新記録 | `outputs/phase-12/documentation-changelog.md` | 変更履歴            |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  | 検出結果（0件含む） |

---

## 多角的チェック観点

| 観点             | 確認内容                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| 網羅性           | 実装ガイドがフィクスチャ・スクリプト・スキルを網羅しているか             |
| アクセシビリティ | Part 1 が非技術者にも理解可能な平易さで書かれているか                    |
| 仕様整合         | システム仕様書の更新が実装結果と正確に一致しているか                     |
| 未タスク検出     | 全ソース（レビュー結果・手動テスト・コードコメント）を漏れなく確認したか |

---

## 完了条件

- [ ] Task 1: 実装ガイドが Part 1（中学生レベル）+ Part 2（技術者レベル）で作成されている
- [ ] Task 1: Part 1 に日常の例え話が含まれている
- [ ] Task 2 Step 1-A: LOGS.md が2ファイルとも更新されている
- [ ] Task 2 Step 1-B: 実装状況テーブルが更新されている
- [ ] Task 2 Step 1-C: 関連タスクテーブルが更新されている
- [ ] Task 2 Step 2: スキル概要仕様・E2Eテスト仕様が更新されている
- [ ] Task 3: documentation-changelog.md が全 Step の結果を個別に記載している
- [ ] Task 4: 未タスク検出レポートが作成されている（0件でも出力済み）
- [ ] artifacts.json が更新されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-13-pr-creation.md`
