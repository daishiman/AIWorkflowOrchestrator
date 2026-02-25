# Phase 2: 設計

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 2                                                                      |
| タスクID   | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001                              |
| 機能名     | ut-imp-unassigned-audit-scope-control-001                              |
| 前提Phase  | Phase 1                                                                |
| 後続Phase  | Phase 3                                                                |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#898](https://github.com/daishiman/AIWorkflowOrchestrator/issues/898) |

## 目的

対象スコープ制御・違反分類・終了コード判定を実現する設計を確定し、実装方針とテスト方針を接続する。

## 背景

Phase 1で確定した「対象監査」と「全体監査」の分離要件を、CLIオプション設計・分類ロジック・出力フォーマット・exit code方針の具体的な技術設計に落とし込む。後続のテスト作成と実装が迷いなく開始できる粒度で設計を確定する。

## 実行タスク

- SubAgent-A（CLI設計）: オプション解析、対象ファイル抽出、差分抽出の設計を作る。
- SubAgent-B（分類ロジック設計）: `currentViolations` / `baselineViolations` の分類ロジックを設計する。
- Lead（統合設計）: 出力JSON、exit code、後方互換の設計を統合する。

## 参照資料

| 参照資料             | パス                                                                                        | 内容                       |
| -------------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 1成果物        | `outputs/phase-1/requirements-definition.md`                                                | 設計入力となる要件         |
| Phase 1受入基準      | `outputs/phase-1/acceptance-criteria.md`                                                    | 検証条件                   |
| 監査スクリプト本体   | `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`               | 現行ロジック               |
| リンク検証スクリプト | `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`              | 周辺整合検証               |
| 品質基準             | `.claude/skills/task-specification-creator/references/quality-standards.md`                 | 仕様書品質要件             |
| AIWorkflow品質要件   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質観点の追補             |
| 教訓集               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 既知の落とし穴             |
| 実装パターン集       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 監査対象分離パターン       |
| モノレポ運用教訓     | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`                | baseline監査分離の運用補足 |
| SubAgent責務分担     | `outputs/phase-1/subagent-responsibilities.md`                                              | Phase 1 成果物             |
| 仕様参照抽出         | `outputs/phase-1/aiworkflow-spec-extraction.md`                                             | Phase 1 成果物             |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料                             | パス                                                                                        | 内容                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| quality-requirements                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | CLI設計と分類ロジックの品質基準            |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 不正入力・ファイル未検出時の異常系設計方針 |
| lessons-learned                      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 同種設計不具合の回避知見                   |
| architecture-overview                | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | スクリプト設計のアーキテクチャ指針         |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | baseline/current 分離監査の運用パターン    |
| architecture-monorepo                | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`                | baseline監査と差分監査の分離運用の補足知見 |

## 実行手順

1. CLI入力の設計（既存互換 + 新規オプション）を表形式で定義する。
2. 対象抽出フロー（`allFiles -> filteredFiles -> violations`）を定義する。
3. 分類ルール（current/baseline）を truth table で定義する。
4. JSON出力設計（新フィールド追加と既存フィールド維持）を定義する。
5. exit code 方針（current基準失敗・baseline警告）を設計する。

## 統合テスト連携

| 観点     | 連携内容                                                |
| -------- | ------------------------------------------------------- |
| 回帰互換 | 既存利用コマンドで結果差分がないこと                    |
| 分類精度 | 対象/対象外が分類ミスなく分離されること                 |
| CI適用   | current fail / baseline warn の判定をジョブ化できること |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                      | 仕様参照先                                                                                                                        |
| ------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 対象ファイルパスの入力検証設計を含む          | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | CLIオプション追加と分類ロジックの関数分離設計 | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用外（CLIスクリプト内部改修のため）         | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 不正入力・ファイル未検出時の設計を含む        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | 設計とテストケースの対応表を定義              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物           | パス                                      | 説明                   |
| ---------------- | ----------------------------------------- | ---------------------- |
| 設計書           | `outputs/phase-2/scope-control-design.md` | 対象制御と分類ロジック |
| 入出力仕様       | `outputs/phase-2/cli-contract.md`         | オプションとJSON出力   |
| テストマッピング | `outputs/phase-2/design-test-mapping.md`  | 設計と検証ケース対応   |
| リスク分析       | `outputs/phase-2/risk-analysis.md`        | 誤判定と互換性リスク   |

## 完了条件

- [ ] 新規オプションの契約が固定されている
- [ ] classification truth table が記録されている
- [ ] exit code 方針が current/baseline で分離されている
- [ ] Phase 4 テスト設計へ渡せる粒度で設計が完了している
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が所定パスに生成済み
- [ ] 実行結果と完了条件の一致を確認済み

## 依存関係

- **前提**: Phase 1
- **後続**: Phase 3

## サブタスク管理

- [ ] 参照資料の確認を完了
- [ ] 実行タスク（SubAgent担当）を完了
- [ ] 成果物作成と配置を完了
- [ ] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001 --phase 2` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

Phase 3: 設計レビューゲート（phase-3-design-review.md）
