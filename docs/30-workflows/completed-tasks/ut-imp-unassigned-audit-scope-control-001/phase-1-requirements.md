# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 1                                                                      |
| タスクID   | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001                              |
| 機能名     | ut-imp-unassigned-audit-scope-control-001                              |
| 前提Phase  | なし                                                                   |
| 後続Phase  | Phase 2                                                                |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#898](https://github.com/daishiman/AIWorkflowOrchestrator/issues/898) |

## 目的

未タスク監査を「対象監査（current）」と「全体監査（baseline）」に分離するための機能要件・非機能要件・受入基準を確定する。

## 背景

`audit-unassigned-tasks.js` で全体監査を実行すると過去資産の違反が大量検出され、今回変更分の合否判定が困難になる問題がある。本Phaseでは、この問題を解決するための機能要件・非機能要件を明確化し、対象監査と全体監査の分離に向けた受入基準を確定する。

## 実行タスク

- SubAgent-A（要件整理）: `audit-unassigned-tasks.js` の現行仕様を分析し、追加オプション要件を整理する。
- SubAgent-B（判定基準定義）: current/baseline の分類条件と exit code 方針を定義する。
- Lead（統合）: スコープ内/外、成果物、完了判定を確定し Phase 2 へ引き継ぐ。

## 参照資料

| 参照資料                | パス                                                                                        | 内容                                |
| ----------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| 元未タスク指示書        | `docs/30-workflows/unassigned-task/task-imp-unassigned-audit-scope-control-001.md`          | Why/What/How と制約                 |
| スキル作成フロー        | `.claude/skills/task-specification-creator/references/create-workflow.md`                   | create モードの標準手順             |
| 未タスク品質基準        | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`        | 9セクション品質基準                 |
| aiworkflow resource-map | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 参照対象仕様の選定                  |
| 残課題台帳              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 未タスク登録ルール                  |
| 残課題運用規則          | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | 更新時の禁止事項と必須項目          |
| 品質要件                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 検証・品質ゲート基準                |
| 教訓集                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 親タスク由来の再発防止              |
| 実装パターン集          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | baseline/current 分離パターンの根拠 |
| モノレポ運用教訓        | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`                | baseline監査分離の運用補足          |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料                             | パス                                                                                        | 内容                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 未タスク登録ルールと台帳整合の正本             |
| task-workflow-rules                  | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | Phase品質ゲートと更新手順の根拠                |
| quality-requirements                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 受入基準の検証可能性を担保する品質要件         |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 監査スクリプト異常系の設計方針                 |
| lessons-learned                      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 親タスク由来の再発防止知見                     |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 監査対象分離（baseline/current）の実装パターン |
| architecture-monorepo                | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`                | baseline監査と差分監査の分離運用の補足知見     |

## 実行手順

1. `audit-unassigned-tasks.js` の入出力仕様を確認し、変更点候補を抽出する。
2. current 判定に入る条件（対象ファイル一致・差分一致）を定義する。
3. baseline 判定に入る条件（対象外既存違反）を定義する。
4. 新規オプション（`--target-file` / `--diff-from`）の要件を文章化する。
5. 完了判定は current 違反 0 件であることを受入基準として固定する。

## 統合テスト連携

| 観点      | 連携内容                                          |
| --------- | ------------------------------------------------- |
| CLI互換性 | 既存引数実行時の出力互換を維持する                |
| 判定分離  | 同一入力で current/baseline が再現可能であること  |
| 台帳連携  | 検証ログと task-workflow 更新手順が矛盾しないこと |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                                 | 仕様参照先                                                                                                                        |
| ------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 監査スクリプトの入力パスが外部から操作される可能性を評価 | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | CLI引数追加が既存スクリプト構造に与える影響を評価        | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用外（CLIスクリプト内部改修のため）                    | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 無効引数・不存在パス入力時の挙動要件を定義               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | current/baseline分離の検証可能性を受入基準で確保         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物           | パス                                            | 説明                             |
| ---------------- | ----------------------------------------------- | -------------------------------- |
| 要件定義         | `outputs/phase-1/requirements-definition.md`    | 機能要件と非機能要件             |
| 受入基準         | `outputs/phase-1/acceptance-criteria.md`        | 検証可能な判定基準               |
| SubAgent責務分担 | `outputs/phase-1/subagent-responsibilities.md`  | チーム分担と責任境界             |
| 仕様参照抽出     | `outputs/phase-1/aiworkflow-spec-extraction.md` | aiworkflow-requirements 反映結果 |

## 完了条件

- [ ] current/baseline 分離要件が文書化されている
- [ ] 追加オプションの入力制約が明文化されている
- [ ] 受入基準がコマンドで検証可能な形式になっている
- [ ] aiworkflow-requirements 参照根拠が成果物に記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が所定パスに生成済み
- [ ] 実行結果と完了条件の一致を確認済み

## 依存関係

- **前提**: なし
- **後続**: Phase 2

## サブタスク管理

- [ ] 参照資料の確認を完了
- [ ] 実行タスク（SubAgent担当）を完了
- [ ] 成果物作成と配置を完了
- [ ] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001 --phase 1` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

Phase 2: 設計（phase-2-design.md）
