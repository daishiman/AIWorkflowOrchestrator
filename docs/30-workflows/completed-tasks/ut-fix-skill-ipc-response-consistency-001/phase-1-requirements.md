# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 1                                         |
| Phase名    | 要件定義                                  |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 |
| タスク名   | skill:ハンドラIPCレスポンス形式統一       |
| 機能名     | ut-fix-skill-ipc-response-consistency-001 |
| 前提Phase  | -                                         |
| 後続Phase  | Phase 2                                   |
| ステータス | 完了                                      |
| 作成日     | 2026-02-25                                |

## 目的

skill:ハンドラIPCレスポンス形式統一 を Phase 1 の観点で実行可能な粒度に定義し、契約ドリフトを防止する。

## 実行タスク

- タスク1: Main/Preload/Renderer の `skill:` チャネルを棚卸しし、現状レスポンス形を一覧化する
- タスク2: レスポンス契約を `直接返却` / `ラッパー返却` / `例外返却` の3プロファイルで定義する
- タスク3: 受け入れ基準と非機能要件（型安全・セキュリティ・再発防止）を確定する

## 参照資料

| 参照資料                 | パス                                                                                        | 説明                                   |
| ------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| 元タスク仕様書           | `docs/30-workflows/completed-tasks/task-skill-ipc-response-consistency.md`                  | 本仕様書の入力元                       |
| Agent IPC API            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | skillチャネル一覧と契約                |
| Electron Service仕様     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main/Preload責務                       |
| IPC契約チェックリスト    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約の確認手順                      |
| Skill型仕様              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | skillドメインの型定義                  |
| Skill IPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | 入力検証と送信元検証                   |
| Electron IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC防御ルール                          |
| Electron APIセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridgeとIPC公開面の保護         |
| エラーハンドリング       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー分類・再試行・利用者通知の基準   |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | テスト品質・カバレッジ・品質ゲート基準 |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P32/P42/P44/P45 の防止策           |
| タスクワークフロー       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 完了タスク・残課題の管理               |
| 仕様更新フロー           | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Phase 12 の更新順序                    |
| 教訓集                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 過去失敗パターンと再発防止策           |

## 実行手順

### ステップ1: 参照資料を確認する

- 参照資料テーブルの必須仕様を読み、前提条件と制約を固定する。

### ステップ2: 実行タスクを順番に実施する

- 実行タスク1から順に実施し、判断根拠と出力内容を記録する。

### ステップ3: 成果物と完了条件を検証する

- outputs配下の成果物を作成し、完了条件チェックリストを更新する。

## 成果物

| 成果物                   | パス                                                             | 説明                                    |
| ------------------------ | ---------------------------------------------------------------- | --------------------------------------- |
| 要件定義サマリー         | `outputs/phase-1/requirements-definition.md`                     | 契約棚卸し結果、FR/NFR、受け入れ基準    |
| 契約差分表               | `outputs/phase-1/as-is-contract-matrix.md`                       | 現状契約と不整合の一覧                  |
| SubAgent監査レポート     | `outputs/phase-1/subagent-team-audit.md`                         | SubAgent分担と並列実行の監査結果        |
| スキル準拠監査           | `outputs/phase-1/task-specification-creator-compliance-audit.md` | task-specification-creator 準拠確認結果 |
| 仕様抽出監査             | `outputs/phase-1/aiworkflow-requirements-extraction-audit.md`    | aiworkflow-requirements 抽出確認結果    |
| 要件トレーサビリティ     | `outputs/phase-1/requirement-traceability-matrix.md`             | 元要件と13仕様書の対応表                |
| 必須仕様カタログ         | `outputs/phase-1/aiworkflow-required-spec-catalog.md`            | 必須仕様セットと抽出根拠                |
| エレガント解決策レビュー | `outputs/phase-1/elegant-solution-review.md`                     | 破棄案比較と最適化方針の検証結果        |

## 統合テスト連携

- Main → Preload → Renderer の契約をテスト対象として追跡する
- フローごとに入力・出力・エラーを1セットで確認する
- 統合観点をPhase成果物へ明記する

## 多角的チェック観点（AIが判断）

| 観点               | 本タスクでの確認内容                                   |
| ------------------ | ------------------------------------------------------ |
| セキュリティ       | `validateIpcSender`、入力検証、IPC公開面の最小化を確認 |
| エラーハンドリング | Main/Preload/Rendererでエラー伝播と表示契約を確認      |
| テスタビリティ     | 契約ドリフトを検出できるテスト観点を確認               |
| IPC/Preload整合    | `safeInvoke` / `safeInvokeUnwrap` 選択根拠を確認       |

## 完了条件

- [ ] `skill:` 全チャネルのレスポンス形が表で定義されている
- [ ] 受け入れ基準が検証可能なチェック項目で定義されている
- [ ] Phase 2 に必要な制約条件が確定している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- [ ] 参照資料確認
- [ ] 実行タスクの実施（タスク1〜タスク3）
- [ ] 統合テスト連携観点の確認
- [ ] 成果物作成と配置
- [ ] 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクに対応する成果物が作成済み
- [ ] `artifacts.json` の成果物パスと整合
- [ ] Phase末端アクションが更新済み

## Phase末端アクション

- [ ] 実行タスクの完了状態を記録する
- [ ] 成果物パスを `artifacts.json` に登録する
- [ ] 後続Phaseへ引き継ぐ事項を記録する

## 次のPhase

Phase 2: [phase-2-design.md](phase-2-design.md)
