# Phase 12: ドキュメント更新 — Phase 11 Worktree環境テストプロトコル標準化

## メタ情報

| 項目      | 値                                                                       |
| --------- | ------------------------------------------------------------------------ |
| タスクID  | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001                                     |
| Phase     | 12                                                                       |
| タスク名  | Phase 11 Worktree環境テストプロトコル標準化                              |
| Issue     | #853                                                                     |
| 作成日    | 2026-03-01                                                               |
| 前提Phase | Phase 11（手動テスト検証）完了                                           |
| 目的      | 実装内容をシステム要件ドキュメントに反映し、未完了タスクを検出・記録する |

## 目的

Worktree環境Phase 11テストプロトコル（3層テスト分類、Playwright E2Eテスト、CI/CD統合、deferred-tests追跡ワークフロー）の実装内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 事前チェック【必須】

Phase 12実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P3: 未タスク管理の3ステップ不完全
   - P4: documentation-changelog への早期「完了」記載
   - P25: LOGS.md 2ファイル更新漏れ（再発）
   - P26: システム仕様書更新遅延
   - P27: topic-map.md 再生成トリガーの判断ミス
   - P28: スキルフィードバックレポート未作成
   - P29: SKILL.md 変更履歴の更新漏れ
   - P43: Phase 12 サブエージェントの rate limit 中断

## 実行タスク

- Task 1: 実装ガイド作成（2パート構成） — Part 1: 初学者向け概念説明、Part 2: 開発者向け技術詳細
- Task 2: システムドキュメント更新（Step 1-A〜1-G + Step 2） — タスク完了記録・仕様書更新
- Task 3: ドキュメント更新履歴 & artifacts.json更新 — documentation-changelog.mdとartifacts.jsonの作成
- Task 4: 未タスク検出レポート作成 — Phase 3/10/11レビュー結果からの未タスク検出
- Task 5: スキルフィードバックレポート作成 — 改善点の記録（0件でも出力必須）

## 参照資料

| 資料名                 | パス                                                                                        | 説明                         |
| ---------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`                                                    | Phase 11成果物               |
| 未実施テスト記録       | `outputs/phase-11/deferred-tests.md`                                                        | Phase 11成果物（条件付き）   |
| Phase 1要件定義        | `phase-1-requirements.md`                                                                   | 機能要件・受入基準           |
| Phase 2設計成果物      | `outputs/phase-2/architecture-design.md`                                                    | 設計判断と仕様根拠           |
| Phase 4テスト成果物    | `outputs/phase-4/`                                                                          | テスト設計・テストコード     |
| Phase 5実装成果物      | `outputs/phase-5/`                                                                          | プロトコル文書・E2Eテスト    |
| Phase 6テスト拡充成果  | `outputs/phase-6/integration-test.md`                                                       | 統合テスト拡充記録           |
| Phase 7カバレッジ成果  | `outputs/phase-7/coverage-report.md`                                                        | カバレッジ達成証跡           |
| Phase 8リファクタ成果  | `outputs/phase-8/`                                                                          | リファクタリング結果         |
| Phase 9品質成果物      | `outputs/phase-9/`                                                                          | 品質ゲート判定結果           |
| Phase 10レビュー結果   | `outputs/phase-10/final-review-result.md`                                                   | 最終レビュー判定             |
| タスクワークフロー     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 完了記録・残課題更新規約     |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 検証・証跡記録の品質基準     |
| ディレクトリ構成       | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`                  | 参照パスと配置規約           |
| IPC契約チェック        | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約更新時の確認手順      |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 同種課題への再利用基準       |
| CI/CD仕様              | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`                       | GitHub Actions設計規約       |
| Playwright仕様         | `.claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md`               | Electron E2E実装パターン     |
| E2E品質仕様            | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`                  | E2E検証の品質基準            |
| API防御仕様            | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Preload API防御境界          |
| 仕様更新ワークフロー   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Phase 12更新手順             |
| Phase 11/12ガイド      | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | ドキュメント更新詳細         |
| 技術ドキュメントガイド | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md`     | 実装ガイド記述ルール         |
| 必要仕様抽出マトリクス | `spec-reference-matrix.md`                                                                  | 必要仕様セットの参照漏れ防止 |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                        | 過去インシデントの教訓       |

---

## Task 1: 実装ガイド作成【必須・2パート構成】

### 概要

| パート | 対象読者             | 内容                                                                |
| ------ | -------------------- | ------------------------------------------------------------------- |
| Part 1 | 初学者・中学生レベル | 概念説明（日常の例え話必須、専門用語なし）                          |
| Part 2 | 開発者・技術者       | 技術的詳細（Playwright E2E設定、CI/CD設定、deferred-tests追跡手順） |

### Part 1: 概念的説明（中学生レベル）

**記述ルール**:

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 図表より文章での説明を優先
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**テンプレート**:

```markdown
### Worktree環境の制約とは何か

#### 日常生活での例え

[本棚の本を別の部屋に持っていっても、CDプレーヤーは元の部屋にしかない。
Worktree環境は「別の部屋」で作業しているようなもの。
テキストファイル（コード）は読み書きできるが、
CDプレーヤー（Electronアプリ）は元の部屋（メインリポジトリ）でしか動かせない。
だから、CDプレーヤーを使うテスト（Layer 3: E2Eテスト）は
元の部屋に戻ってから実行する必要がある。
その代わり、本の中身をチェックするテスト（Layer 1: 自動テスト）や
本の目次と中身が合っているか確認するテスト（Layer 2: 静的解析）は
別の部屋でも問題なく実行できる]

#### 3層テスト分類の概念的説明

| テストの種類        | 日常の例え                         | どこでできるか         |
| ------------------- | ---------------------------------- | ---------------------- |
| Layer 1: 自動テスト | 本の中身を読んで間違いを探す       | 別の部屋でもできる     |
| Layer 2: 静的解析   | 本の目次と中身が一致するか確認する | 別の部屋でもできる     |
| Layer 3: E2Eテスト  | CDプレーヤーで音楽を再生して確認   | 元の部屋でしかできない |
```

### Part 2: 技術的詳細（開発者向け）

以下を含めること:

- Playwright E2Eテスト設定・実行方法
  - `playwright.config.ts` の設定内容とElectron起動オプション
  - `apps/desktop/e2e/` 配下のテストファイル構成
  - `pnpm --filter @repo/desktop test:e2e` の実行手順
- CI/CDパイプライン設定
  - `.github/workflows/ci.yml` のE2Eテストジョブ設定
  - Xvfb（仮想ディスプレイ）の設定方法
  - アーティファクト保存設定
- deferred-tests追跡ワークフロー
  - `deferred-tests.md` テンプレートの使い方
  - Phase 13でのdeferred-tests解消チェック手順
  - テスト延期→解消のライフサイクル
- 3層テスト分類の技術的根拠
  - Layer 1: Vitest（Node.js環境で完結、Worktree制約なし）
  - Layer 2: TypeScript Compiler + ESLint（ファイルシステムアクセスのみ、Worktree制約なし）
  - Layer 3: Playwright + Electron（ネイティブモジュール・GPU依存、Worktree不可）
- 関連Pitfall: P40（テスト実行ディレクトリ依存）、P11（PostToolUseフック）、P44/P45（IPC契約ドリフト）

### 成果物

| 成果物     | パス                                       |
| ---------- | ------------------------------------------ |
| 実装ガイド | `outputs/phase-12/implementation-guide.md` |

---

## Task 2: システムドキュメント更新【必須・Step 1-A〜1-G + Step 2】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

### Step 1: タスク完了記録【必須・全タスク】

#### Step 1-A: 仕様書完了記録

- [x] `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` に「完了タスク」セクションを追加（Worktree代替手順セクション追加の記録）
- [x] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [x] `task-specification-creator/LOGS.md` にタスク完了記録を追加（**2ファイル両方必須** -- P1, P25）
- [x] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [x] `task-specification-creator/SKILL.md` 変更履歴更新

**完了タスクセクションのテンプレート**:

```markdown
## 完了タスク

### タスク: UT-IMP-PHASE11-WORKTREE-PROTOCOL-001（2026-XX-XX完了）

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001                                    |
| ステータス | **完了**                                                                |
| 概要       | Phase 11 Worktree環境テストプロトコル標準化                             |
| 成果物     | プロトコル文書、E2Eテスト2件、CI/CD更新、テンプレート更新、deferred追跡 |
| テスト数   | {{N}}（自動）+ 7（手動Phase 11テストケース）                            |

> **注意**: テスト数は `pnpm test` 実行結果の実測値のみを記載すること。推定値・概算値は使用不可。
```

#### Step 1-B: 実装状況テーブル更新（該当する場合）

- [x] `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` にWorktree代替手順セクションが追加されたことを実装状況テーブルに反映
- [x] 更新対象パスを `test -f <path>` で実在確認してから更新（参照切れ誤更新の防止）

#### Step 1-C: 関連タスクテーブル更新

- [x] `grep -rn "UT-IMP-PHASE11-WORKTREE-PROTOCOL" references/` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成（**仕様書に変更があれば必ず実行** -- P2, P27）

- [x] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成
- [x] `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/ut-imp-phase11-worktree-protocol --regenerate` を実行して index/リンク情報を再同期
- [x] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されていることを確認

#### Step 1-E: 未タスク指示書作成・登録（1件以上検出時は必須）

- [x] 検出時は `docs/30-workflows/unassigned-task/` に指示書を作成し、`task-workflow.md` と関連仕様書へリンクを追加（検出0件のため該当なし）
- [x] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、参照切れ0件を確認
- [x] `audit-unassigned-tasks.js --json --target-file <path>` または `--diff-from <ref>` を実行し、`currentViolations.total` を記録
- [x] scope未指定の `audit-unassigned-tasks.js --json` を実行し、baseline監視結果を別枠で記録

#### Step 1-F: DevOps関連ファイル更新（該当する場合）

- [x] CI/CDワークフロー（`.github/workflows/ci.yml`）を変更したため、`technology-devops.md` または `deployment-gha.md` の更新要否を確認
- [x] 更新した場合はファイル名と変更内容を `spec-update-summary.md` に記録
- [x] 対象外の場合は `spec-update-summary.md` に「Step 1-F: 該当なし（理由: {{具体的理由}}）」を明記（更新実施のため該当なし）

#### Step 1-G: 検証コマンド順次実行（Phase 12同期ガード）

前提: すべてのコマンドはリポジトリルート（`AIWorkflowOrchestrator/`）をカレントディレクトリとして実行する。

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/ut-imp-phase11-worktree-protocol --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-imp-phase11-worktree-protocol
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

**Step 1-G.1: baseline / current 分離監査（全体FAIL誤判定防止）**

- [x] `audit-unassigned-tasks` の全体FAIL時は `currentViolations.total` を合否判定に使用し、`baselineViolations.total` は別記録する
- [x] 判定結果を `spec-update-summary.md` に `baseline: N件 / current: M件` 形式で記録する

**Step 1-G.2: SKILL検証の判定基準（`spec-update-workflow.md` Step 1-G.3.1 準拠）**

| 分類   | 判定基準                                                                                 | 対応                                                  |
| ------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 合格   | `quick_validate.js` 3スキル全てで Error 0件                                              | Phase 12継続                                          |
| 要監視 | Warning が新規発生、または前回より増加                                                   | `spec-update-summary.md` に記録し、次回対応方針を明記 |
| 要対応 | Warning がスキル構造の正確性に直接影響（必須セクション欠落、name不一致、agents形式崩れ） | 本Phaseで修正、修正不可なら未タスク化                 |

### Step 2: システム仕様更新【条件付き】

**更新判断基準**:

| 更新必要                                                                                              | 更新不要                   |
| ----------------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 11テンプレート更新（.claude/skills/task-specification-creator/references/phase-11-12-guide.md） | 内部実装の詳細変更のみ     |
| CI/CDワークフロー変更（ci.yml）                                                                       | リファクタリング（IF不変） |
| E2Eテスト基盤追加（playwright.config.ts）                                                             | バグ修正（仕様変更なし）   |
| deferred-tests追跡ワークフロー追加                                                                    | テスト追加のみ             |

**本タスクはPhase 11テンプレート・CI/CD・E2E基盤の変更を含むため、以下の更新対象を確認すること**:

| #   | 更新対象ファイル                                                            | 更新内容                                                                      | 必須/任意 |
| --- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------- |
| 1   | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | Worktree代替手順セクション追加、3層テスト分類の記載、deferred-tests手順の追加 | 必須      |
| 2   | `task-workflow.md`                                                          | 残課題テーブル更新、完了タスクセクション追加                                  | 必須      |
| 3   | `quality-requirements.md`                                                   | E2Eテスト品質基準の追加（該当する場合）                                       | 任意      |

> **P43対策**: 仕様書更新は3ファイル以下/エージェントに分割する。LOGS.mdへの「完了」記録は全ファイル更新後の最終ステップとする。

### 成果物

| 成果物           | パス                                      |
| ---------------- | ----------------------------------------- |
| 仕様更新サマリー | `outputs/phase-12/spec-update-summary.md` |

---

## Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

### 実行手順

```bash
# Step 1: ドキュメント更新履歴生成（スクリプトが存在する場合）
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/ut-imp-phase11-worktree-protocol

# Step 2: Phase 12完了登録（artifacts.json更新）
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/ut-imp-phase11-worktree-protocol \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/spec-update-summary.md:仕様更新サマリー,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート,outputs/phase-12/skill-feedback-report.md:スキルフィードバックレポート"
```

**スクリプト未存在時の代替手順**:

| スクリプト                            | 代替手順                                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動で `outputs/phase-12/documentation-changelog.md` を作成                                         |
| `complete-phase.js`                   | 手動で `artifacts.json` を作成（参照: `docs/30-workflows/completed-tasks/` 内の既存artifacts.json） |

**artifacts.json必須項目**:

- Phase 12のステータスが `completed` に更新されていること
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics` セクションに品質指標が記録されていること

### 記録上の注意

- DON'T: 全 Step 確認前に documentation-changelog.md に「完了」と記載しない（P4対策）
- DO: 各 Step の完了結果を詳細に記録すること（漏れの可視化）

### 成果物

| 成果物               | パス                                                 |
| -------------------- | ---------------------------------------------------- |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`        |
| artifacts.json       | `outputs/artifacts.json` + ルートの `artifacts.json` |

---

## Task 4: 未タスク検出レポート作成【0件でも出力必須】

### 確認ソース

| #   | ソース                 | 確認項目                                                                  |
| --- | ---------------------- | ------------------------------------------------------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項                                                       |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項                                                       |
| 3   | Phase 11手動テスト結果 | プロトコルの改善点・テンプレート手順の不足・Layer分類の妥当性に関する発見 |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」                                             |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント                                               |
| 6   | 苦戦箇所               | 本タスク実行中の教訓                                                      |

### 検出方法

```bash
# コードベース内のTODO/FIXMEスキャン（E2Eテストファイル対象）
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/e2e \
  --output docs/30-workflows/ut-imp-phase11-worktree-protocol/outputs/phase-12/.tmp-unassigned-candidates.json

# CI/CDワークフロー内のTODO/FIXMEスキャン
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan .github/workflows \
  --output docs/30-workflows/ut-imp-phase11-worktree-protocol/outputs/phase-12/.tmp-unassigned-ci-candidates.json
```

### 未タスク発見時の3ステップ（P3準拠 -- 全ステップ完了必須）

1. `docs/30-workflows/unassigned-task/` に指示書を作成する（`tasks/` 直下は不可 -- P38対策）
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に未タスク参照リンクを追加する

### 0件の場合の出力形式

```markdown
## 検出結果サマリー

| ソース                     | 検出数  |
| -------------------------- | ------- |
| Phase 3レビュー結果        | 0件     |
| Phase 10レビュー結果       | 0件     |
| Phase 11手動テスト結果     | 0件     |
| コードベース（TODO/FIXME） | 0件     |
| 苦戦箇所                   | 0件     |
| **合計**                   | **0件** |

## 検出タスク一覧

**検出タスクなし**

全確認ソースを精査した結果、未タスクとして記録すべき項目は検出されなかった。
```

### 監査コマンド

```bash
# 対象監査（今回変更分の合否）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/<今回対象ファイル>.md

# 全体監査（baseline監視）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json

# 未タスクリンク参照切れチェック
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

### 成果物

| 成果物               | パス                                                   |
| -------------------- | ------------------------------------------------------ |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`        |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/*.md`（検出時のみ） |

---

## Task 5: スキルフィードバックレポート作成【改善点なしでも出力必須】

### 確認観点

| 観点                  | 確認内容                                                                   |
| --------------------- | -------------------------------------------------------------------------- |
| テンプレート改善      | Phase 11テンプレートのWorktree代替手順に不足・曖昧さがないか               |
| ワークフロー改善      | deferred-tests追跡ワークフローの自動検証化が可能なチェックポイントはないか |
| ドキュメント改善      | 3層テスト分類の知見を他タスクのPhase 11にも横展開すべきか                  |
| 新規Pitfall候補       | 06-known-pitfalls.mdに追加すべき新規パターン（Worktree固有の問題）         |
| E2Eテスト基盤改善     | PlaywrightのElectron E2Eテスト設定で改善すべき設定項目はないか             |
| CI/CDパイプライン改善 | E2Eテストジョブの実行時間・安定性に改善点はないか                          |

### 成果物

| 成果物                       | パス                                        |
| ---------------------------- | ------------------------------------------- |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md` |

---

## 苦戦箇所の記録【推奨】

タスク実行中に苦戦した箇所があれば、以下のテンプレートで記録する。

### 記録テンプレート

```markdown
## 苦戦箇所

### 1. {{問題の概要}}

- **症状**: {{発生した問題の具体的な症状}}
- **原因**: {{問題の根本原因}}
- **解決策**: {{採用した解決策}}
- **学び**: {{将来のタスクへの教訓}}
- **関連Pitfall**: {{該当する場合はPitfall ID（例: P40）}}
```

### 記録が有用なケース

| ケース                                 | 記録すべき内容                             |
| -------------------------------------- | ------------------------------------------ |
| Worktree環境でのE2Eテスト実行失敗      | 失敗メッセージ、原因、Layer分類の妥当性    |
| Playwright設定のElectron起動エラー     | エラーメッセージ、設定修正内容             |
| CI/CDパイプラインのE2Eジョブ失敗       | 失敗ステップ、Xvfb設定、タイムアウト値     |
| deferred-testsの追跡ワークフローの不備 | テンプレートの不足項目、追跡漏れのパターン |
| 06-known-pitfalls.mdに追加すべき教訓   | Pitfall ID候補、パターン、対策             |

苦戦箇所を記録した場合は、P3準拠の3ステップで未タスク化する。苦戦箇所が0件の場合でも「苦戦箇所なし（0件）」を明記する。

---

## 漏れやすいポイント（06-known-pitfalls.md参照）

| ID  | ポイント                                | 対策                                                                |
| --- | --------------------------------------- | ------------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ               | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2  | topic-map.md 再生成忘れ                 | セクション変更時は必ず `generate-index.js` を実行                   |
| P3  | 未タスク管理の3ステップ不完全           | 指示書 → task-workflow.md登録 → 関連仕様書リンク                    |
| P4  | documentation-changelogへの早期「完了」 | 全Step確認前に「完了」と記載しない                                  |
| P25 | LOGS.md 2ファイル更新漏れ（再発）       | P1と同じ対策を明示的にチェック                                      |
| P27 | topic-map.md 再生成トリガー判断ミス     | 追加だけでなく削除・更新も再生成トリガー                            |
| P29 | SKILL.md 変更履歴の更新漏れ             | LOGS.mdとは別にSKILL.mdの変更履歴テーブルも必ず更新                 |
| P38 | 未タスク配置ディレクトリ間違い          | `unassigned-task/` に配置。親タスクの `tasks/` ではない             |
| P43 | サブエージェントのrate limit中断        | 仕様書更新は3ファイル以下/エージェントに分割                        |

---

## サブタスク管理テーブル

| #   | サブタスク                                        | 推奨エージェント分割 |
| --- | ------------------------------------------------- | -------------------- |
| 1   | 事前チェック（06-known-pitfalls.md確認）          | メインエージェント   |
| 2   | Task 1: 実装ガイド作成（Part 1 + Part 2）         | エージェント A       |
| 3   | Task 2: Step 1-A〜1-D（仕様書完了記録）           | エージェント B       |
| 4   | Task 2: Step 1-E〜1-G + Step 2（検証・更新）      | エージェント C       |
| 5   | Task 3: ドキュメント更新履歴 & artifacts.json更新 | メインエージェント   |
| 6   | Task 4: 未タスク検出レポート作成                  | エージェント D       |
| 7   | Task 5: スキルフィードバックレポート作成          | エージェント D       |
| 8   | 苦戦箇所の記録                                    | メインエージェント   |
| 9   | 完了条件の検証                                    | メインエージェント   |

> **P43対策**: 仕様書更新は3ファイル以下/エージェントに分割する。

---

## Phase 12 自動化コマンド一覧

```bash
# topic-map.md再生成（Step 1-D）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/ut-imp-phase11-worktree-protocol \
  --regenerate

# Step 1-G: 仕様書整合検証
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/ut-imp-phase11-worktree-protocol \
  --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-imp-phase11-worktree-protocol

# SKILL frontmatter検証（Error 0件が合格。WarningはStep 1-G.2で判定）
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done

# 未タスク監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD

# 未タスクリンク検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# TODO/FIXMEスキャン
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/e2e \
  --output docs/30-workflows/ut-imp-phase11-worktree-protocol/outputs/phase-12/.tmp-unassigned-candidates.json

# ESLintキャッシュクリア
rm -rf node_modules/.cache/eslint-*
pnpm lint --cache=false

# 未使用importの自動修正
pnpm lint --fix

# 未実施タスク誤配置チェック
rg -n "^\\| ステータス\\s*\\|.*未着手|^\\| ステータス\\s*\\|.*未実施|^\\| ステータス\\s*\\|.*進行中" \
  docs/30-workflows/completed-tasks/unassigned-task -g "*.md"
```

---

## 成果物一覧

| 成果物                       | パス                                            | 必須 | 説明                        |
| ---------------------------- | ----------------------------------------------- | ---- | --------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント   |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`       | ✅   | Step 1-A〜Step 2の実施結果  |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                    |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（0件でも出力必須） |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | ✅   | 改善点（なしでも出力必須）  |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成              |

---

## 完了条件

### Task 1: 実装ガイド

- [x] 実装ガイド Part 1（中学生レベル概念説明 -- 日常例え必須）が作成されている
- [x] 実装ガイド Part 1 に Worktree環境の制約を日常の例え話（本棚・CDプレーヤー）で説明した段落が含まれている
- [x] 実装ガイド Part 1 に 3層テスト分類の概念的説明が含まれている
- [x] 実装ガイド Part 2（開発者向け技術的詳細）が作成されている
- [x] Part 2 に Playwright E2Eテスト設定・実行方法が記載されている
- [x] Part 2 に CI/CDパイプライン設定（ci.yml のE2Eジョブ）が記載されている
- [x] Part 2 に deferred-tests追跡ワークフローの手順が記載されている
- [x] Part 2 に 3層テスト分類の技術的根拠が記載されている

### Task 2: システムドキュメント更新

- [x] 【Step 1-A】`.claude/skills/task-specification-creator/references/phase-11-12-guide.md` に「完了タスク」セクションを追加した
- [x] 【Step 1-A】`aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加した
- [x] 【Step 1-A】`task-specification-creator/LOGS.md` にタスク完了記録を追加した（**2ファイル両方** -- P1, P25）
- [x] 【Step 1-A】`aiworkflow-requirements/SKILL.md` 変更履歴テーブルを更新した（P29）
- [x] 【Step 1-A】`task-specification-creator/SKILL.md` 変更履歴テーブルを更新した（P29）
- [x] `node .claude/skills/skill-creator/scripts/quick_validate.js` で3スキル（`skill-creator` / `task-specification-creator` / `aiworkflow-requirements`）を検証し、Error 0件を確認した
- [x] Warning が出た場合、Step 1-G.2 の3段階分類（要監視/要対応）で判定し、`spec-update-summary.md` に記録した
- [x] 【Step 1-B】`.claude/skills/task-specification-creator/references/phase-11-12-guide.md` の実装状況テーブルを更新した
- [x] 【Step 1-B】更新対象パスを `test -f` で実在確認してから更新した
- [x] 【Step 1-C】`grep -rn "UT-IMP-PHASE11-WORKTREE-PROTOCOL" references/` で関連タスクテーブルを全件確認した
- [x] 【Step 1-D】topic-map.mdを再生成した（P2, P27）
- [x] 【Step 1-D】`task-specification-creator/scripts/generate-index.js --regenerate` で workflow index を再同期した
- [x] 【Step 1-E】未タスク検出時に `unassigned-task/` 作成→`task-workflow.md` 登録→関連仕様リンク更新を完了した（検出0件のため該当なしを記録）
- [x] 【Step 1-E】`verify-unassigned-links.js` 実行結果を記録した
- [x] 【Step 1-E】`audit-unassigned-tasks` の `currentViolations.total` を記録し、baselineと分離した
- [x] 【Step 1-F】DevOps関連更新の要否を判断し、`spec-update-summary.md` に結果（更新/該当なし）を記録した
- [x] 【Step 1-G】`verify-all-specs.js` と `validate-phase-output.js` を順次実行し、PASSを確認した
- [x] 【Step 1-G】`quick_validate.js` 3スキル実行結果（Error 0件）を記録した
- [x] 【Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した
- [x] 【Step 2】更新対象3ファイルの更新要否を全件確認した
- [x] 【Step 2】苦戦箇所をシステム仕様書（`lessons-learned.md` または関連仕様書）に記録した（0件の場合は「苦戦箇所なし（0件）」と明記した）
- [x] `outputs/phase-12/spec-update-summary.md` を作成し、Step 1-A〜Step 2の実施結果を記録した

### Task 3: ドキュメント更新履歴

- [x] `outputs/phase-12/documentation-changelog.md` が作成されている
- [x] 各Stepの完了結果が詳細に記録されている（漏れの可視化）
- [x] artifacts.jsonが更新されている
- [x] artifacts.jsonの全完了Phase（1-12）のステータスがcompletedであること
- [x] `artifacts.json` と `outputs/artifacts.json` の両方を同期し、参照切れが0件であること
- [x] Phase 11成果物（`manual-test-result.md`）がPhase 12更新判定の入力として参照されていること

### Task 4: 未タスク検出

- [x] 未タスク検出レポートが出力されている【0件でも必須】
- [x] 検出時、未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている（P38対策）（検出0件のため該当なし）
- [x] 検出時、**3ステップ全完了**（指示書作成 → task-workflow.md登録 → 関連仕様書リンク）（検出0件のため該当なし）
- [x] 検出時、**関連ファイル調査**（同様パターンの他ファイル）を実施した（検出0件のため該当なし）
- [x] 未タスク指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/` で検証）
- [x] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、参照切れが0件
- [x] `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file <今回対象ファイル>` を実行し、`currentViolations.total = 0` を確認した（検出0件のため `--diff-from HEAD` で代替）
- [x] `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json` を実行し、baseline監視結果を記録した
- [x] 完了済み未タスク指示書が `unassigned-task/` に残置されていない（完了時は `completed-tasks/unassigned-task/` へ移管）
- [x] **未実施**タスク指示書が `completed-tasks/unassigned-task/` に混在していない（今回差分では混在追加なし）

### Task 5: スキルフィードバック

- [x] スキルフィードバックレポートが出力されている【改善点なしでも必須】（P28対策）

### 品質確認

- [x] テスト数が実際の `it()` ブロック数と一致すること（実測値を使用）（P37対策）
- [x] 【品質】ESLintキャッシュをクリアしてlintを再実行した（`pnpm exec eslint . --no-cache` で再実行）
- [x] `.claude/rules/` の技術的負債テーブルが最新
- [x] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 事前チェック（06-known-pitfalls.md確認）
2. Task 1: 実装ガイド作成（Part 1 + Part 2）
3. Task 2: システムドキュメント更新（Step 1-A〜1-G + Step 2）
4. Task 3: ドキュメント更新履歴 & artifacts.json更新
5. Task 4: 未タスク検出レポート作成
6. Task 5: スキルフィードバックレポート作成
7. 苦戦箇所の記録
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [x] 本Phase内の全タスク（Task 1〜5）を100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-imp-phase11-worktree-protocol --phase 12
```

## 次のPhase

Phase 13: PR作成
