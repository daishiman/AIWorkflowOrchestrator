# Phase 12 成功パターン集

> 親ファイル: [patterns.md](patterns.md)

## 目的

Phase 12 の完了品質を高めるための成功パターン。監査・準拠確認・未タスク管理・ドキュメント更新の実証済み手法。

---

## 監査・検証パターン

### 仕様書修正タスクの「差分監査」と「全体監査」分離

- **状況**: Phase 12で未タスク監査を行う際、リポジトリ全体には既存違反が多く、今回変更分の判定が埋もれる
- **解決パターン**:
  1. **全体監査**を実行してベースライン件数を記録する（運用健全性確認）
  2. **差分監査**として今回ワークフロー成果物・Open Itemを個別再判定する
  3. 差分で未解決があれば未タスク指示書を新規作成し、`task-workflow.md` 残課題へ登録する
  4. `verify-unassigned-links.js` で参照整合を最終確認する
- **効果**: 全体ノイズに影響されず、今回タスク分の漏れを確実に是正できる
- **発見日**: 2026-02-25
- **関連タスク**: UT-SKILL-IPC-PRELOAD-EXTENSION-001

### scoped監査の判定軸固定

- **状況**: `audit-unassigned-tasks.js --json --target-file <path>` 実行時、baseline違反が大量に出力される
- **解決パターン**:
  1. `scope.currentFiles` が対象ファイルを指していることを確認
  2. `currentViolations.total` を今回判定の正本にする
  3. `baselineViolations.total` は別枠で記録し、今回タスクの fail 判定に直結させない
- **効果**: 対象ファイルが準拠済み（current=0）かを安定して判定できる
- **発見日**: 2026-02-25
- **関連タスク**: UT-FIX-SKILL-EXECUTE-INTERFACE-001

### `validate-phase-output` の引数仕様固定（位置引数）

- **状況**: Phase検証時に `verify-all-specs` と同形式のオプション（`--phase` など）を想定しやすい
- **解決パターン**:
  1. `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/<workflow>` を固定テンプレート化
  2. `verify-all-specs --workflow` とコマンドペアで使い、役割を分離（仕様整合 / 出力構造）
  3. Phase 12記録には両コマンドの結果を併記する
- **発見日**: 2026-02-25
- **関連タスク**: UT-FIX-SKILL-EXECUTE-INTERFACE-001

---

## Phase 12 準拠確認パターン

### Phase 12 UI再確認の証跡固定（TASK-UI-00-ORGANISMS）

- **解決パターン**:
  1. `verify-all-specs` + `validate-phase-output` + `validate-phase11-screenshot-coverage` を同一ターンで実行する
  2. `pnpm run screenshot:<feature>` 実行後、`stat` でスクリーンショット実時刻を取得して `manual-test-result.md` と同期する
  3. `verify-unassigned-links` + `audit --diff-from HEAD` を連続実行し、`currentViolations=0` を合否基準に固定する
  4. `phase12-task-spec-compliance-check.md` を作成し、Task 1〜5 + Step 1-A〜1-E + Step 2 の判定を1ファイルに集約する
- **発見日**: 2026-03-04
- **関連タスク**: TASK-UI-00-ORGANISMS

### Phase 12準拠確認と親仕様参照ガード（TASK-043B）

- **解決パターン**:
  1. `outputs/phase-12/phase12-task-spec-compliance-check.md` を追加し、Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 の判定を 1 ファイルへ集約する
  2. `verify-all-specs.js` で `task-*.md` と `../task-*.md` の参照実在も検証し、親仕様ブリッジ欠落を早期検出する
  3. 未タスクが 0 件でも `verify-unassigned-links` / `audit --diff-from HEAD` の結果を compliance check に明記する
- **発見日**: 2026-03-06
- **関連タスク**: TASK-043B

### Phase 12 タスク仕様準拠の4点突合（TASK-UI-01-E）

- **解決パターン**:
  1. `phase-12-documentation.md` の `ステータス=completed`、Task 12-1〜12-5、Task 100% 実行確認を `outputs/phase-12` の7成果物と1対1で突合する
  2. `implementation-guide.md` は `## Part 1` / `## Part 2`、理由先行、日常例え、TypeScript 型/API/エッジケース/設定語を `rg` で確認する
  3. 未タスクは `docs/30-workflows/unassigned-task/` の物理配置、`## メタ情報 + ## 1..9` の10見出し、`audit --json --diff-from HEAD --target-file`、`verify-unassigned-links` を同一ターンで確認する
  4. `spec-update-summary.md` / `phase12-compliance-recheck.md` / `unassigned-task-detection.md` / `task-workflow.md` に同一の実測値を転記する
- **発見日**: 2026-03-06
- **関連タスク**: TASK-UI-01-E-INTEGRATION-GATE-SPEC-SYNC

### `phase-12-documentation.md` 完了同期パターン（TASK-9H）

- **解決パターン**:
  1. `implementation-guide/spec-update-summary/documentation-changelog/unassigned-task-detection/skill-feedback-report` の存在を先に確認する
  2. `phase-12-documentation.md` のステータスを `完了` に更新する
  3. Step 1-A〜Step 3 と完了条件チェックリストを同一ターンで同期更新する
  4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` の結果を `spec-update-summary.md` に記録する
- **発見日**: 2026-02-27
- **関連タスク**: TASK-9H

### completed workflow の planned wording ゼロ化（TASK-UI-04C）

- **解決パターン**:
  1. `phase-12-documentation.md` に対して `rg -n "仕様策定のみ|実行予定|保留として記録"` を実行し、残置文言を 0 件にする
  2. completed workflow では「実装・テスト・Phase 11/12 は完了、保留は Phase 13 のみ」のように実績ベースで書き換える
  3. 完了条件チェックリストと `Task 100% 実行確認` の `[ ]` を `[x]` へ同期する
  4. 是正結果を `spec-update-summary.md` と `phase12-task-spec-compliance-check.md` にも反映する
- **発見日**: 2026-03-11
- **関連タスク**: TASK-UI-04C-WORKSPACE-PREVIEW

---

## ドキュメント更新パターン

### Phase 12 Task 2完全チェックリスト（task-imp-search-ui-001）

- **チェックリスト**:
  | Step | チェック項目 | 更新対象 |
  | ---- | ------------ | -------- |
  | 1-A | タスク完了記録 | 該当仕様書（ui-ux-\*.md等） |
  | 1-A | LOGS.md更新 | **aiworkflow-requirements/LOGS.md** |
  | 1-A | LOGS.md更新 | **task-specification-creator/LOGS.md** |
  | 1-A | SKILL.md変更履歴 | **aiworkflow-requirements/SKILL.md** |
  | 1-A | SKILL.md変更履歴 | **task-specification-creator/SKILL.md** |
  | 1-B | 実装状況テーブル | api-endpoints.md等（該当する場合） |
  | 1-C | 関連タスクテーブル | Grepで検索して確認 |
  | 1-D | topic-map.md再生成 | `node generate-index.js` 実行 |
  | 2 | システム仕様更新 | 新規インターフェース追加時のみ |
- **発見日**: 2026-02-04
- **関連タスク**: task-imp-search-ui-001

### Phase 12出力成果物チェックリスト

- **確認項目**:
  1. ✅ `implementation-guide.md` - Part 1（中学生レベル）+ Part 2（開発者向け）
  2. ✅ `api-documentation.md` / `ipc-documentation.md` / `component-documentation.md`
  3. ✅ `documentation-changelog.md` - システム仕様書更新判断と履歴
  4. ✅ `unassigned-task-detection.md` - 未タスク検出報告（0件でも必須）
- **根拠**: phase-11-12-guide.md Task 1-4の完全準拠
- **発見日**: 2026-01-26

### Phase 12 3ステップ完全性確認パターン

- **3ステップチェックリスト**:
  | Step | 作業内容 | 確認方法 | チェック |
  | ---- | -------- | -------- | -------- |
  | 1 | `unassigned-task/`に指示書作成 | ファイル存在確認 | ☐ |
  | 2 | `task-workflow.md`残課題テーブルに登録 | grep "TASK-ID" で確認 | ☐ |
  | 3 | 関連仕様書に参照リンク追加 | 関連箇所を開いて確認 | ☐ |
- **実行手順**:
  1. 未タスクを検出したら、まず3ステップの全てを書き出す
  2. Step 1完了後、すぐにStep 2に着手（記憶が新しいうちに）
  3. Step 2完了後、すぐにStep 3に着手
  4. 全Step完了後、documentation-changelog.mdに記録
- **発見日**: 2026-02-09
- **関連タスク**: TASK-FIX-15-1

### Phase 12 テスト件数ドリフト再同期パターン（TASK-9E）

- **解決パターン**:
  1. 正本件数を `task-workflow.md` に固定し、内訳（Service/IPC）を併記する
  2. `rg -n "57|32 \\+ 25|SkillForker 32"` で TASK文脈の旧値を抽出する
  3. Phase時点値が必要な文書は「Phase時点値 + 最終値併記」で更新する
  4. 更新後に `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を実行する
- **発見日**: 2026-02-28
- **関連タスク**: TASK-9E

### Phase 12 root evidence + workflow 正本集約

- **解決パターン**:
  1. `outputs/phase-12/phase12-task-spec-compliance-check.md` を root evidence として追加し、Task 12-1〜12-5 / Step 1-A〜1-G / Step 2 を 1 ファイルへ集約する
  2. 実装内容と苦戦箇所が 6 仕様書以上へ広がる follow-up task では、`aiworkflow-requirements/references/workflow-<feature>.md` を新規作成し、SubAgent 分担、5分解決カード、検証コマンドもまとめて残す
  3. `resource-map.md` / `quick-reference.md` / `SKILL.md` に workflow 正本の入口を追加し、仕様更新後の再利用経路を固定する
- **発見日**: 2026-03-13
- **関連タスク**: UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001

---

## 未タスク管理パターン

### 06-known-pitfalls.mdへの新規Pitfall登録フロー

- **登録フロー**:
  | Step | アクション | 成果物 |
  | ---- | ---------- | ------ |
  | 1 | Pitfall IDの採番 | P31, P32, ... （既存の最大ID + 1） |
  | 2 | 06-known-pitfalls.mdに追記 | 教訓・チェックリスト参照・関連タスクを含む |
  | 3 | patterns.mdに成功パターンを追加 | 解決策・コード例・発見日を含む |
  | 4 | phase-templates.mdにチェック項目を追加（該当Phaseがある場合） | Phase 5等のテンプレートに追記 |

- **Pitfall ID採番ルール**:
  ```
  grep -n "^### P[0-9]" .claude/rules/06-known-pitfalls.md | tail -1
  ```
- **発見日**: 2026-02-10
- **関連タスク**: UT-FIX-STORE-HOOKS-INFINITE-LOOP-001

### 未タスク仕様書への実装課題継承パターン

- **パターン**: 親タスクで苦戦した箇所を「実装課題と解決策」セクションとして未タスク仕様書に追記
- **構成**:
  ```markdown
  ## 実装課題と解決策（{{PARENT_TASK_ID}}からの学び）

  ### {{PITFALL_ID}}: {{タイトル}}

  **問題**: {{問題の説明}}
  **教訓**: {{得られた教訓}}
  **解決策**: {{解決策}}
  **本タスクへの適用**: {{このタスクでどう活かすか}}
  ```
- **発見日**: 2026-02-08
- **関連タスク**: TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE

### 未タスク仕様書Level A化パターン

- **9セクション構成**:
  | セクション | 内容 | 必須 |
  | ---------- | ---- | ---- |
  | 1. タイトル（h1） | タスクID + 日本語名 | ✅ |
  | 2. メタ情報 | 作成日、ステータス、優先度、関連タスク | ✅ |
  | 3. 目的 | なぜこのタスクが必要か（1-2文） | ✅ |
  | 4. 実行タスク | 具体的な作業項目リスト | ✅ |
  | 5. 参照資料 | 関連ファイルパス、仕様書リンク | ✅ |
  | 6. 実行手順 | ステップバイステップの作業手順 | ✅ |
  | 7. 成果物 | 作成/更新するファイル一覧 | ✅ |
  | 8. 完了条件 | チェックリスト形式の完了判断基準 | ✅ |
  | 9. 次Phase | 完了後の次のアクション（PR作成等） | △ |
- **発見日**: 2026-02-09
- **関連タスク**: TASK-FIX-15-1

### 未タスク「既存タスクに包含」判断の追跡性確保

- **パターン**: 包含判断時に以下の2ステップを必ず実行する
  1. **包含先の仕様書更新**: 包含先タスクの仕様書の「含むもの」セクションに、包含される内容を明示的に追記
  2. **task-workflow.md登録**: 残課題テーブルに「包含先: TASK-XXX」の形式で記録し、追跡可能にする
- **発見日**: 2026-02-06
- **関連タスク**: DEBT-SEC-001, UT-SEC-001, DEBT-SEC-002

### 将来改善候補の未タスク仕様書変換

- **手順**:
  1. Phase 12で「将来改善候補（任意）」として記録
  2. 正式な未タスク仕様書を`unassigned-task/`に作成
  3. unassigned-task-detection.mdに参照リンクを追加
- **発見日**: 2026-01-27
- **関連タスク**: TASK-3-2-A

### 親タスク苦戦箇所の事後未タスク化（TASK-UI-04C follow-up）

- **手順**:
  1. 親タスクの `苦戦箇所` と `5分解決カード` から、feature 内修正で閉じたものと共通ガードへ昇格すべきものを分離する
  2. `docs/30-workflows/unassigned-task/` に 9セクション形式の未タスク指示書を作成し、`3.5 実装課題と解決策` に親タスク教訓を転記する
  3. `task-workflow.md` と関連仕様書へ同一 ID を登録し、`verify-unassigned-links` を実行する
  4. 親 workflow の `unassigned-task-detection.md` / `spec-update-summary.md` / `documentation-changelog.md` を同じ件数へ更新する
- **発見日**: 2026-03-11
- **関連タスク**: TASK-UI-04C-WORKSPACE-PREVIEW

### Phase 10 MINOR指摘の確実な未タスク変換

- **手順**:
  1. Phase 10レビュー結果からMINOR判定を抽出
  2. unassigned-task-guidelines.md のルール確認
  3. 各MINOR指摘を正式な未タスク仕様書に変換（9セクション形式）
  4. `docs/30-workflows/unassigned-task/` に配置
  5. unassigned-task-detection.md の件数とステータスを更新
- **判定基準**: 「機能に影響なし」「tree-shakingで除去される」等はタスク化**不要**の理由にならない
- **発見日**: 2026-02-02
- **関連タスク**: TASK-8B

### Phase 12 ドキュメント更新の完全性保証パターン

- **パターン**: 以下の3段階で機械的に完全性を保証する
  1. **開始前**: `06-known-pitfalls.md` を読み直し、P1〜P4パターンを意識に上げる
  2. **対象列挙**: `grep -rn "TASK_ID" references/` で更新対象を事前に全列挙する
  3. **消化**: `05-task-execution.md` のPhase 12チェックリストを1ステップずつ機械的に消化する（全Step確認前に「完了」と記載しない）
- **発見日**: 2026-02-06
- **関連タスク**: DEBT-SEC-001
