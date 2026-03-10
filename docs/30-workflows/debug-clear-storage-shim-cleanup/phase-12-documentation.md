# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001 |
| Phase      | 12                                          |
| Phase名    | ドキュメント                                |
| カテゴリ   | 改善                                        |
| ステータス | not_started                                 |
| 前提Phase  | Phase 11（手動テスト完了）                  |
| 後続Phase  | Phase 13                                    |

## 目的

実装ガイドの作成、システム仕様書の更新、documentation-changelog の記録、未タスクの検出を行い、コードと仕様書の整合性を確保する。

**注意**: Phase 12 は漏れが最も発生しやすい Phase である。必ず全項目を逐次確認し、全 Step 完了前に「完了」と記載しない（P4/P51 対策）。

## 実行タスク

- Task 1: 実装ガイド作成
- Task 2: システム仕様書更新（spec-update-workflow.md 準拠）
- Task 3: documentation-changelog.md 作成
- Task 4: 未タスク検出

### Task 1: 実装ガイド作成

**目的**: 本タスクの実装内容を概念レベルと技術レベルの両面で文書化する

#### Part 1: 中学生レベル概念説明

**成果物**: `outputs/phase-12/implementation-guide.md` の Part 1

**必須要素**:

- 日常的な例え話: 「引っ越し後に前の住所宛の郵便物転送を止めるのと同じ。前の住所（debug-clear-storage）はもう使っていないのに、転送設定（workaround コード）や住所録（仕様書内の参照）がそのまま残っていると、配達員（開発者）が混乱する。不要な転送設定を解除し、住所録を更新するのがこのタスク」
- 何を: repo 全体に残っていた debug-clear-storage の残骸を棚卸しして整理した
- なぜ: 残骸があると「まだ本番で storage clear している」と誤読される危険がある
- どう: 不要なコードは削除、仕様書内の記述は historical note に降格

#### Part 2: 開発者向け実装詳細

**成果物**: `outputs/phase-12/implementation-guide.md` の Part 2

**必須要素**:

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
   - `development-guidelines.md` に debug コード管理ルールの更新記録
   - `lessons-learned.md` に debug-clear-storage 残骸クリーンアップの教訓
2. **LOGS.md を2ファイルとも更新する**（P1/P25 対策）:
   - `aiworkflow-requirements/LOGS.md` に完了記録を追加
   - `task-specification-creator/LOGS.md` に完了記録を追加
3. **SKILL.md を2ファイルとも更新する**（P29 対策）:
   - `aiworkflow-requirements/SKILL.md` の変更履歴テーブルを更新
   - `task-specification-creator/SKILL.md` の変更履歴テーブルを更新

**チェックリスト**:

- [ ] `aiworkflow-requirements/LOGS.md` 更新済み
- [ ] `task-specification-creator/LOGS.md` 更新済み
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新済み
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新済み

#### Step 1-B: 実装状況テーブル更新

**手順**:

1. 該当する実装状況テーブルがある場合、ステータスを更新する
2. `debug-clear-storage` 関連の記述が含まれるテーブルを `grep -rn "debug-clear-storage" .claude/skills/aiworkflow-requirements/references/` で検索し、更新する

#### Step 1-C: 関連仕様書の検索と更新

**手順**:

1. 関連仕様書を検索する:
   ```bash
   grep -rn "UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001" .claude/skills/
   grep -rn "debug-clear-storage" .claude/skills/aiworkflow-requirements/references/
   ```
2. 検出された全仕様書のタスク参照・ステータスを更新する
3. `task-workflow.md` の残課題テーブルと完了タスクセクションを更新する

#### Step 1-D: topic-map.md 再生成

**手順**:

1. `node generate-index.js` を実行して topic-map.md を再生成する（P2/P27 対策）
2. 実行ログで正常完了を確認する
3. `git diff --stat -- .claude/skills/` で indexes/ ディレクトリに変更が反映されていることを確認する

**チェックリスト**:

- [ ] `node generate-index.js` 実行済み
- [ ] topic-map.md が更新されていることを確認済み

#### Step 2: システム仕様更新

**手順**:

1. `development-guidelines.md` の debug コード管理ルールを更新する:
   - `debug-clear-storage` パターンが廃止されたことを記録
   - 今後同様の debug コードが残存しないための防止ルールを追記
2. `lessons-learned.md` に以下の教訓を追加する:
   - 教訓タイトル: 「debug-clear-storage 残骸の repo-wide クリーンアップ」
   - 背景: 親タスクでデバッグコード本体は削除したが、repo 全体に前提コードが残存していた
   - 教訓: デバッグコード削除時は本体だけでなく、e2e preflight / screenshot script / 仕様書内参照など repo-wide の依存関係を棚卸しする必要がある
   - 再発防止策: デバッグコード追加時は影響範囲を `rg` で記録し、削除時に全箇所を確認する

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

**成果物**: `outputs/phase-12/unassigned-task-report.md`（0件でも必須）

**手順**:

1. 実装過程で発見した未解決課題をリストアップする
2. Phase 10 の MINOR 指摘を全て未タスク仕様書に変換する（省略不可）
3. 検出した未タスクは**3ステップ全て完了する**（P3/P38 対策）:
   - [ ] `docs/30-workflows/unassigned-task/` に指示書を作成
   - [ ] `task-workflow.md` の残課題テーブルに登録
   - [ ] 関連仕様書に参照リンクを追加
4. `unassigned-task-detection.md` の件数・ステータスを更新する
5. `artifacts.json` の Phase 12 ステータスを更新する
6. 再評価クローズした未タスクがある場合、対応する GitHub Issue を `gh issue close` で同時に Close する（P56 対策）

**チェックリスト**:

- [ ] `unassigned-task-report.md` が作成されていること（0件でも必須）
- [ ] 検出した未タスクの3ステップが全て完了していること
- [ ] 再評価クローズ時の GitHub Issue Close が実施されていること（該当する場合）

## 参照資料

| 参照資料         | パス                                                                                        | 説明                        |
| ---------------- | ------------------------------------------------------------------------------------------- | --------------------------- |
| Phase 11 成果物  | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-11/`                      | 手動テスト結果              |
| Phase 10 成果物  | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-10/`                      | 最終レビュー結果・MINOR指摘 |
| Phase 1 受入基準 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-1/acceptance-criteria.md` | AC-1〜AC-7 定義             |

### システム仕様（aiworkflow-requirements）

> 仕様書更新前に以下のシステム仕様を確認し、更新対象と更新内容を把握してください。

| 参照資料                | パス                                                                                   | 内容                           |
| ----------------------- | -------------------------------------------------------------------------------------- | ------------------------------ |
| 状態管理設計            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`           | persist 設計の記述確認         |
| 開発ガイドライン        | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`          | debug コード管理ルール更新対象 |
| 教訓集                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                 | 教訓追加対象                   |
| 仕様更新ワークフロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1-A〜Step 2 の手順        |
| Phase 12 チェックリスト | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` | 全チェック項目の定義           |
| Phase 11-12 ガイド      | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`            | Phase 12 実行ガイドライン      |

## 統合テスト連携

- Task 2 で仕様書の不整合を発見した場合、Phase 11 の手動テスト結果と照合する
- Task 4 で検出した未タスクが Phase 11 の手動テストで未検証の場合、テスト計画を記録する

## 成果物

| 成果物                  | パス                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| 実装ガイド              | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/implementation-guide.md`    |
| documentation-changelog | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート    | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/unassigned-task-report.md`  |

## 完了条件

### Task 1: 実装ガイド

- [ ] `implementation-guide.md` Part 1 が作成されていること（中学生レベル概念説明、日常例え必須）
- [ ] `implementation-guide.md` Part 2 が作成されていること（開発者向け実装詳細）

### Task 2: システム仕様書更新

- [ ] Step 1-A: `aiworkflow-requirements/LOGS.md` 更新済み
- [ ] Step 1-A: `task-specification-creator/LOGS.md` 更新済み（P1/P25 対策）
- [ ] Step 1-A: `aiworkflow-requirements/SKILL.md` 変更履歴更新済み
- [ ] Step 1-A: `task-specification-creator/SKILL.md` 変更履歴更新済み（P29 対策）
- [ ] Step 1-B: 実装状況テーブルが更新されていること（該当する場合）
- [ ] Step 1-C: `grep -rn` で関連仕様書を検索し、全て更新されていること
- [ ] Step 1-D: `node generate-index.js` で topic-map.md が再生成されていること（P2/P27 対策）
- [ ] Step 1-D: `git diff --stat -- .claude/skills/` で indexes/ の変更を確認済み
- [ ] Step 2: `development-guidelines.md` の debug コード管理ルールが更新されていること
- [ ] Step 2: `lessons-learned.md` に教訓が追加されていること

### Task 3: documentation-changelog

- [ ] 更新した全仕様書の変更内容が記録されていること
- [ ] 各 Step の完了結果が詳細に記録されていること
- [ ] 全 Step 完了を確認した上で最終ステータスが記載されていること（P4/P51 対策）

### Task 4: 未タスク検出

- [ ] `unassigned-task-report.md` が作成されていること（0件でも必須）
- [ ] 検出した未タスクの3ステップが全て完了していること（P3/P38 対策）
- [ ] `artifacts.json` の Phase 12 ステータスが更新されていること
- [ ] 再評価クローズ時の GitHub Issue Close が実施されていること（P56 対策、該当する場合）
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 13: PR作成へ進む。
