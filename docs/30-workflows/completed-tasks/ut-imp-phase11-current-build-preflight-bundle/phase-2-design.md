# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 |
| Phase      | 2                                                 |
| Phase名    | 設計                                              |
| カテゴリ   | 改善                                              |
| 優先度     | 中                                                |
| ステータス | completed                                         |
| 前提Phase  | Phase 1                                           |
| 後続Phase  | Phase 3                                           |

## 目的

Phase 1 の要件を、preflight script 契約、capture integration、テスト設計、system spec 同期手順へ落とし込み、Phase 4 以降が迷わず進める設計状態を作る。

## 背景

現行コードには `phase11-static-server.mjs` と `capture-light-theme-contrast-regression-guard-phase11.mjs` があり、current build capture を成立させる要素は存在する。  
欠けているのは、capture 実行前に 4 観点を bundle として評価し、失敗理由を機械的に返す contract である。  
この Phase では remediation task を別 concern のまま維持し、guard 専用の設計だけを作る。

## 設計判断

| 案  | 内容                                                                   | 評価                                                                        | 判定 |
| --- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---- |
| 案A | capture script から CLI wrapper を child process 実行する              | 実装は簡単だが、stdout/exit code 解析に依存し、判定ロジックが再利用しにくい | 破棄 |
| 案B | shared core を正本にし、CLI wrapper と capture script が同じ関数を使う | single source of truth、test しやすい、責務分離が明確                       | 採用 |
| 案C | `phase11-static-server.mjs` に preflight orchestration まで抱え込む    | localhost helper の責務が肥大化し、workflow 固有判定が混入する              | 破棄 |

採用案は案Bである。`phase11-static-server.mjs` は probe / serve の primitive helper に留め、preflight orchestration は shared core が持つ。

## 実行タスク

- タスク1: preflight bundle 契約を設計する
- タスク2: capture integration と package script を設計する
- タスク3: テストアーキテクチャを設計する
- タスク4: system spec 同期計画と concern 分離計画を設計する

### タスク1: preflight bundle 契約設計

**目的**: script が返す構造と exit code を固定する

**設計項目**:

| 項目        | 設計内容                                                        |
| ----------- | --------------------------------------------------------------- |
| shared core | `apps/desktop/scripts/phase11-current-build-preflight-core.mjs` |
| CLI wrapper | `apps/desktop/scripts/phase11-current-build-preflight.mjs`      |
| 入力        | `--base-url`, `--json`, `--write`, `--no-auto-serve`            |
| 出力        | `summary`, `checks`, `guidance`, `timestamp`, `bundleName`      |
| 判定順      | native -> build -> harness -> baseUrl                           |
| exit code   | 0=pass、10=native、20=build、30=harness、40=baseUrl             |

### タスク2: capture integration 設計

**目的**: capture script と package script の接続点を固定する

**接続計画**:

| 対象                                                                                                           | 変更内容                                                                            |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs`                               | capture 開始前に shared core を import して呼び、結果を metadata へ残す             |
| `apps/desktop/package.json`                                                                                    | `preflight:light-theme-contrast-guard` を追加し、screenshot script と命名をそろえる |
| `apps/desktop/scripts/phase11-static-server.mjs`                                                               | localhost fallback の primitive helper を shared core から再利用する                |
| `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-11/manual-test-plan.md` | 実行順序を preflight -> capture に更新する                                          |

### タスク3: テストアーキテクチャ設計

**目的**: Phase 4 と Phase 6 で作る test coverage を固定する

**テストケース群**:

| ケース              | 期待結果                                                    |
| ------------------- | ----------------------------------------------------------- |
| success             | 4 bucket が all pass で exit code 0                         |
| native mismatch     | native bucket fail、他 bucket は skip または blocked        |
| build missing       | build bucket fail、guidance に build command を含む         |
| harness missing     | harness bucket fail、`electron.vite.config.ts` の確認を促す |
| baseUrl unreachable | baseUrl bucket fail、localhost fallback 可否を表示する      |
| no-duplication      | capture script が preflight orchestration を複製しない      |

### タスク4: system spec 同期計画

**目的**: Phase 12 の更新先と Team/Lane 分割を固定する

**更新対象**:

| 種別            | 更新先                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| workflow 正本   | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md` |
| backlog 台帳    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                  |
| 教訓集          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                |
| feature catalog | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                       |
| Phase 12 監査   | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`                  |

## 参照資料

| 参照資料             | パス                                                                                      | 説明                         |
| -------------------- | ----------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義     | `phase-1-requirements.md`                                                                 | FR、NFR、AC の入力           |
| 元未タスク指示書     | `../unassigned-task/task-imp-phase11-current-build-preflight-bundle-001.md`               | backlog の原文               |
| capture script       | `../../../apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs` | 現行 integration point       |
| static server helper | `../../../apps/desktop/scripts/phase11-static-server.mjs`                                 | localhost fallback helper    |
| renderer input 設定  | `../../../apps/desktop/electron.vite.config.ts`                                           | harness HTML の build input  |
| package scripts      | `../../../apps/desktop/package.json`                                                      | screenshot script の命名規則 |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                                  | 内容                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 抽出入口         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                      | design に必要な仕様群を最小集合へ絞る入口                    |
| 検索順序         | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                   | guard workflow / static server / selector capture の検索順序 |
| 親 workflow 正本 | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md` | current build capture 契約                                   |
| 教訓集           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                | build 先行、bucket 分離                                      |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`           | script 責務分離                                              |
| エラー処理       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                 | failure guidance の標準                                      |
| 開発運用         | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`                         | script 命名と配置                                            |
| remediation 分離 | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-global-remediation.md`        | token remediation との責務分離                               |
| desktop build    | `.claude/skills/aiworkflow-requirements/references/technology-desktop.md`                             | Electron / build / artifact 観点                             |
| E2E品質          | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`                            | Playwright capture の品質観点                                |

## 実行手順

### ステップ1: 案を比較して採用構造を決める

shell-out、shared core、static-server monolith の 3 案を比較し、責務分離と再利用性が最も高い構造を選ぶ。

### ステップ2: shared contract と consumer 接続を設計する

shared core の返却値、CLI wrapper の責務、capture script の import 経路、metadata 反映点を固定する。

### ステップ3: テストと Phase 12 同期まで接続する

core unit test、CLI smoke、manual test、system spec sync の流れを一本化する。

## 統合テスト連携

- Phase 4 で CLI、JSON 出力、bucket guidance の test case を固定する。
- Phase 5 で capture script と package script への接続を実装し、Phase 6 で CLI オプションと metadata の検証へ展開する。
- Phase 11 と Phase 12 では同じ bundle 名を manual test と system spec 同期で使う。

## 多角的チェック観点

| 観点               | この Phase での確認内容                                                  | 主要仕様                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| アーキテクチャ     | shared core を唯一の判定正本にし、helper 責務を分離する                  | `architecture-implementation-patterns.md`                                                                                                    |
| エラーハンドリング | exit code と guidance の変換責務を CLI wrapper に閉じる                  | `error-handling.md`                                                                                                                          |
| 品質               | core unit test と CLI smoke を分離できる構造にする                       | `quality-requirements.md`, `quality-e2e-testing.md`                                                                                          |
| デスクトップ       | `electron-vite build`、harness HTML、localhost fallback の接点を整理する | `technology-desktop.md`                                                                                                                      |
| 文書同期           | Phase 12 で current/baseline と正本更新先を漏れなく持ち上げる            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |

## 成果物

| 成果物             | パス                                        | 内容                                          |
| ------------------ | ------------------------------------------- | --------------------------------------------- |
| preflight 契約設計 | `outputs/phase-2/preflight-contract.md`     | CLI、JSON、exit code                          |
| 設計判断記録       | `outputs/phase-2/design-decision-record.md` | 採用案と破棄案の比較                          |
| integration 設計   | `outputs/phase-2/integration-design.md`     | capture script、package script、metadata 導線 |
| テスト設計         | `outputs/phase-2/test-architecture.md`      | Phase 4/6/7 の test plan                      |
| spec 同期計画      | `outputs/phase-2/spec-sync-plan.md`         | Phase 12 の更新先                             |
| concern 分離計画   | `outputs/phase-2/subagent-plan.md`          | Lane A-C の担当境界                           |

## 完了条件

- [ ] shared core と CLI wrapper の入力、出力、exit code が定義されている
- [ ] capture script と package script の接続点が定義されている
- [ ] success と 4 failure case の test plan が定義されている
- [ ] system spec の更新先が 5 件定義されている
- [ ] 破棄案と採用案の判断理由が記録されている
- [ ] Lane A-C の作業境界が Phase 5 と Phase 12 に対応づいている

## 次Phase

Phase 3: 設計レビューへ進む。
