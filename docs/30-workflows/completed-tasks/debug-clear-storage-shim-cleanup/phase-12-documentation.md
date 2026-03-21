# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001 |
| Phase      | 12                                          |
| Phase名    | ドキュメント                                |
| カテゴリ   | 改善                                        |
| ステータス | completed                                   |
| 前提Phase  | Phase 11（手動テスト完了）                  |
| 後続Phase  | Phase 13                                    |

## 目的

実装ガイドの作成、システム仕様書の更新、documentation-changelog の記録、未タスクの検出を行い、コードと仕様書の整合性を確保する。

**注意**: Phase 12 は漏れが最も発生しやすい Phase である。必ず全項目を逐次確認し、全 Step 完了前に「完了」と記載しない（P4/P51 対策）。

## 実行タスク

- Task 1: 実装ガイド作成
- Task 2: システム仕様書更新（spec-update-workflow.md 準拠）
- Task 3: documentation-changelog.md 作成
- Task 4: 未タスク検出（0件でも出力必須）
- Task 5: スキルフィードバックレポート作成（改善点なしでも出力必須）
- Task 6: phase12-task-spec-compliance-check 作成

### Task 1: 実装ガイド作成

**目的**: 本タスクの実装内容を概念レベルと技術レベルの両面で文書化する

#### Part 1: 中学生レベル概念説明

**成果物**: `outputs/phase-12/implementation-guide.md` の Part 1

**必須要素**:

- 「なぜ必要か」を先に説明してから「何をするか」を説明する
- 日常的な例え話: 「引っ越し後に前の住所宛の郵便物転送を止めるのと同じ。前の住所（debug-clear-storage）はもう使っていないのに、転送設定（workaround コード）や住所録（仕様書内の参照）がそのまま残っていると、配達員（開発者）が混乱する。不要な転送設定を解除し、住所録を更新するのがこのタスク」
- 何を: repo 全体に残っていた debug-clear-storage の残骸を棚卸しして整理した
- なぜ: 残骸があると「まだ本番で storage clear している」と誤読される危険がある
- どう: 不要なコードは削除、仕様書内の記述は historical note に降格

#### Part 2: 開発者向け実装詳細

**成果物**: `outputs/phase-12/implementation-guide.md` の Part 2

**必須要素**:

- TypeScript の型定義または interface
- API または CLI のシグネチャ
- 使用例
- エラーハンドリングとエッジケース
- 設定項目または定数一覧
- 変更ファイル一覧と変更理由
- 各ファイルの Before/After（削除 or 降格の内容）
- e2e global-setup / screenshot script の変更詳細
- 認証バイパス機構（`VITE_E2E_MODE` / `skipAuth`）との関係
- Zustand persist への影響がないことの根拠

### Task 2: システム仕様書更新

**目的**: spec-update-workflow.md に準拠し、全関連仕様書を更新する

**注意事項**:

- 仕様書更新は3ファイル以下/サブエージェントに分割する（P43 対策）
- LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする（P43 対策）

#### Step 1-A: タスク完了記録

**手順**:

1. 該当仕様書にタスク完了記録を追加する:
   - `system-spec-update-summary.md` に workflow-local の同期結果を記録する
   - `documentation-changelog.md` に workflow-local の変更ファイル一覧と結果を記録する
   - `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/unassigned-task-detection.md` に 0件検出の結果を記録する
   - `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/phase12-task-spec-compliance-check.md` に最終準拠結果を記録する
2. `manual-test-checklist.md` と `manual-test-result.md` の参照を Phase 11 から引き継ぐ
3. workflow 内の status / artifact / index を completed / blocked の実態に合わせる

**チェックリスト**:

- [ ] `system-spec-update-summary.md` 作成済み
- [ ] `documentation-changelog.md` 作成済み
- [ ] `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/unassigned-task-detection.md` 作成済み
- [ ] `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/phase12-task-spec-compliance-check.md` 作成済み

#### Step 1-B: 実装状況テーブル更新

**手順**:

1. 該当する実装状況テーブルがある場合、ステータスを更新する
2. Phase 1 から Phase 13 のステータスと `artifacts.json` / `outputs/artifacts.json` の配列を同期する
3. `debug-clear-storage` 関連の記述が含まれる箇所を workflow 内で検索し、canonical file name に揃える

#### Step 1-C: 関連仕様書の検索と更新

**手順**:

1. 関連仕様書を検索する:
   ```bash
   rg -n "UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001|debug-clear-storage" \
     docs/30-workflows/debug-clear-storage-shim-cleanup/ \
     .claude/skills/aiworkflow-requirements/references/ \
     apps/desktop/docs/
   ```
2. 検出された workflow local / aiworkflow requirements / product doc の各更新対象で、タスク参照・ステータス・historical note を更新する
3. `index.md` の phase 状態を completed / blocked へ揃える

#### Step 1-D: topic-map.md 再生成

**手順**:

1. workflow 内の `index.md` メタ情報と phase 本文の状態を再同期する
2. 変更ファイルの差分を確認する
3. `outputs/artifacts.json` と root `artifacts.json` を同期する

**チェックリスト**:

- [ ] `index.md` が更新済み
- [ ] `artifacts.json` が更新済み

#### Step 2: システム仕様更新

**手順**:

1. `system-spec-update-summary.md` に workflow-local の同期結果を記録する
2. `documentation-changelog.md` に Step 1-A〜Step 2 の結果を事後記録する
3. `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/phase12-task-spec-compliance-check.md` で Task 1〜5 と Step 1〜2 の整合を最終確認する

### Task 3: documentation-changelog.md 作成

**目的**: 更新した全仕様書の変更内容を記録し、各 Step の完了結果を詳細に記録する

**成果物**: `outputs/phase-12/documentation-changelog.md`

**必須要素**:

1. 更新した全仕様書のリスト（ファイルパス + 変更概要）
2. Step 1-A〜Step 2 の各完了結果:
   - 実施内容
   - 更新したファイル
   - 確認結果
3. **全 Step 確認前に「完了」と記載しない**（P4/P51 対策）
4. 記載順序: 各 Step を実施した順に「事後記録」する

**チェックリスト**:

- [ ] Step 1-A の完了結果が記録されていること
- [ ] Step 1-B の完了結果が記録されていること
- [ ] Step 1-C の完了結果が記録されていること
- [ ] Step 1-D の完了結果が記録されていること
- [ ] Step 2 の完了結果が記録されていること
- [ ] 全 Step の完了を確認した上で最終ステータスを記載していること

### Task 4: 未タスク検出

**目的**: 本タスクの実装過程で発見された未解決の課題を検出・記録する

**成果物**: `outputs/phase-12/unassigned-task-detection.md`（0件でも必須）

**手順**:

1. 実装過程で発見した未解決課題をリストアップする
2. Phase 10 の MINOR 指摘を全て未タスク仕様書に変換する（省略不可）
3. 検出した未タスクは**3ステップ全て完了する**（P3/P38 対策）:
   - [ ] `docs/30-workflows/unassigned-task/` に指示書を作成
   - [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` に登録
   - [ ] 関連仕様書に参照リンクを追加
4. `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/unassigned-task-detection.md` の件数・ステータスを更新する
5. `artifacts.json` の Phase 12 ステータスを更新する
6. 再評価クローズした未タスクがある場合、対応する GitHub Issue を `gh issue close` で同時に Close する（P56 対策）

**チェックリスト**:

- [ ] `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/unassigned-task-detection.md` が作成されていること（0件でも必須）
- [ ] 検出した未タスクの3ステップが全て完了していること
- [ ] 再評価クローズ時の GitHub Issue Close が実施されていること（該当する場合）

### Task 5: スキルフィードバックレポート作成

**目的**: 本タスクの実行過程で発見された task-specification-creator スキルの改善点を記録する（改善点なしでも出力必須）

**成果物**: `outputs/phase-12/skill-feedback-report.md`

**記録観点**:

| 観点             | 記録内容                                                                               |
| ---------------- | -------------------------------------------------------------------------------------- |
| テンプレート改善 | Phase テンプレートの漏れや曖昧さ（骨格セクション欠落の検出経験等）                     |
| ワークフロー改善 | 機械検証や手順分岐の改善余地（P50チェックの自動化、残骸棚卸しの横断検索自動化等）      |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補（debug コード棚卸しパターンのテンプレート化等） |

**手順**:

1. Phase 1〜11 の実行過程で気付いた改善点をリストアップする
2. 改善点がない場合も「改善点なし」としてレポートを作成する（P28 対策）
3. 特に以下の観点で振り返る:
   - テンプレート共通骨格のセクション構造は十分だったか
   - Phase 間の依存関係定義は実行時に迷いなかったか
   - 自動検証スクリプトのカバー範囲は適切だったか

**チェックリスト**:

- [ ] `skill-feedback-report.md` が作成されていること（0件でも必須）
- [ ] テンプレート改善・ワークフロー改善・ドキュメント改善の3観点が記載されていること

### Task 6: phase12-task-spec-compliance-check 作成

**目的**: Task 1〜5 と Step 1〜2 の整合を単一ファイルで最終確認する

**成果物**: `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/phase12-task-spec-compliance-check.md`

**必須要素**:

- Task 12-1〜12-5 の実施結果
- Step 1-A〜Step 2 の結果
- `validate-phase-output` と `validate-phase12-implementation-guide` の結果
- `phase-11-manual-test.md` / `phase-12-documentation.md` / `artifacts.json` の同値確認

**チェックリスト**:

- [ ] `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/phase12-task-spec-compliance-check.md` が作成されていること
- [ ] Task 1〜5 の完了結果が記録されていること
- [ ] Step 1〜2 の整合が記録されていること

## 参照資料

| 参照資料         | パス                                                                                             | 説明                        |
| ---------------- | ------------------------------------------------------------------------------------------------ | --------------------------- |
| Phase 11 成果物  | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-11/`                           | 手動テスト結果              |
| Phase 10 成果物  | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-10/`                           | 最終レビュー結果・MINOR指摘 |
| Phase 9 成果物   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-9/quality-assurance-result.md` | 品質検証結果                |
| Phase 8 成果物   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-8/refactoring-report.md`       | リファクタリング結果        |
| Phase 7 成果物   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-7/gate-decision.md`            | カバレッジ判定              |
| Phase 6 実装仕様 | `phase-6-test-expansion.md`                                                                      | 拡充テスト仕様              |
| Phase 5 実装仕様 | `phase-5-implementation.md`                                                                      | 実装対象・修正方針          |
| Phase 2 成果物   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-2/`                            | 変更計画・副作用分析        |
| Phase 1 受入基準 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-1/acceptance-criteria.md`      | AC-1〜AC-7 定義             |

### システム仕様（aiworkflow-requirements）

> 仕様書更新前に以下のシステム仕様を確認し、更新対象と更新内容を把握してください。

| 参照資料                | パス                                                                                                          | 内容                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 状態管理設計            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                  | persist 設計の記述確認       |
| task-workflow backlog   | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                                  | backlog 完了化・重複是正対象 |
| task-workflow history   | `.claude/skills/aiworkflow-requirements/references/task-workflow-history.md`                                  | 完了履歴の同期対象           |
| lessons learned         | `.claude/skills/aiworkflow-requirements/references/lessons-learned-ui-agent-view-nav-notification-history.md` | 廃止済み preflight 教訓      |
| product doc             | `apps/desktop/docs/development/clear-storage.md`                                                              | historical note の整合確認   |
| 仕様更新ワークフロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                | Step 1-A〜Step 2 の手順      |
| Phase 12 チェックリスト | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`                        | 全チェック項目の定義         |
| Phase 11-12 ガイド      | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                   | Phase 12 実行ガイドライン    |

## 統合テスト連携

- Task 2 で仕様書の不整合を発見した場合、Phase 11 の手動テスト結果と照合する
- Task 4 で検出した未タスクが Phase 11 の手動テストで未検証の場合、テスト計画を記録する

## 成果物

| 成果物                       | パス                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 実装ガイド                   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/implementation-guide.md`               |
| 仕様更新サマリー             | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/system-spec-update-summary.md`         |
| documentation-changelog      | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/documentation-changelog.md`            |
| 未タスク検出レポート         | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/unassigned-task-detection.md`          |
| スキルフィードバックレポート | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/skill-feedback-report.md`              |
| 仕様準拠チェック             | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。具体的なチェック項目はAIがタスク内容に応じて判断・適用する。

| 観点               | 適用判断                                                                       |
| ------------------ | ------------------------------------------------------------------------------ |
| ローカルストレージ | localStorage / sessionStorage / Zustand persist が関係する場合（本タスク該当） |
| E2Eテスト          | e2e テストの前提条件が変更される場合（本タスク該当）                           |
| セキュリティ       | 認証バイパス機構が関係する場合（本タスク該当: skipAuth / VITE_E2E_MODE）       |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 完了条件

### Task 1: 実装ガイド

- [ ] `implementation-guide.md` Part 1 が作成されていること（中学生レベル概念説明、日常例え必須）
- [ ] `implementation-guide.md` Part 2 が作成されていること（開発者向け実装詳細）

### Task 2: システム仕様書更新

- [ ] Step 1-A: `.claude/skills/aiworkflow-requirements/LOGS.md` 更新済み
- [ ] Step 1-A: `.claude/skills/aiworkflow-requirements/SKILL.md` 変更履歴更新済み
- [ ] Step 1-B: 実装状況テーブルが更新されていること（該当する場合）
- [ ] Step 1-B: `index.md` メタ status / Phase 一覧 / `artifacts.json` / `outputs/artifacts.json` が同値であること
- [ ] Step 1-C: `rg -n` で workflow local / `.claude/skills/aiworkflow-requirements/references` / `apps/desktop/docs` を検索し、必要箇所だけ更新していること
- [ ] Step 1-D: root `artifacts.json` と `outputs/artifacts.json` が同期していること
- [ ] Step 2: `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` / `.claude/skills/aiworkflow-requirements/references/task-workflow-history.md` / `.claude/skills/aiworkflow-requirements/references/lessons-learned-ui-agent-view-nav-notification-history.md` / `apps/desktop/docs/development/clear-storage.md` が同期されていること
- [ ] Step 2: `.claude/skills/task-specification-creator/LOGS.md` / `SKILL.md` や `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` を更新しない場合は、その理由が記録されていること

### Task 3: documentation-changelog

- [ ] 更新した全仕様書の変更内容が記録されていること
- [ ] 各 Step の完了結果が詳細に記録されていること
- [ ] 全 Step 完了を確認した上で最終ステータスが記載されていること（P4/P51 対策）

### Task 4: 未タスク検出

- [ ] `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/unassigned-task-report.md` が作成されていること（0件でも必須）
- [ ] 検出した未タスクの3ステップが全て完了していること（P3/P38 対策）
- [ ] `artifacts.json` の Phase 12 ステータスが更新されていること
- [ ] 再評価クローズ時の GitHub Issue Close が実施されていること（P56 対策、該当する場合）

### Task 5: スキルフィードバックレポート

- [ ] `skill-feedback-report.md` が作成されていること（改善点なしでも出力必須、P28 対策）
- [ ] テンプレート改善・ワークフロー改善・ドキュメント改善の3観点が記載されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 13: PR作成へ進む。
