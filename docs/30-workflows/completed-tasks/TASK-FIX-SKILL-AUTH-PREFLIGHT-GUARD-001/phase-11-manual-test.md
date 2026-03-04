# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 11                                        |
| 機能名     | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001   |
| タスク名   | AUTHENTICATION_ERROR の事前検知と設定誘導 |
| 前提Phase  | Phase 10                                  |
| 後続Phase  | Phase 12                                  |
| 作成日     | 2026-03-03                                |
| ステータス | completed                                 |

## 目的

AUTHENTICATION_ERROR の事前検知と設定誘導 を実装可能な単位へ分解し、Phase 11 の成果物を確定する。

## 背景

AUTHENTICATION_ERROR の事前検知と設定誘導 を実行する前提として、Phase 11 で必要な判断材料と成果物の境界を固定する。

## SubAgent分担

| SubAgent | 担当                      |
| -------- | ------------------------- |
| A        | Main/IPC 観点             |
| B        | Preload/Renderer 観点     |
| C        | テスト/品質/仕様同期 観点 |

## 実行タスク

- 手動検証計画: シナリオ別の操作手順を定義する
- 実機検証計画: UI 表示とログ導線を確認する
- 証跡管理計画: 画面証跡とログ証跡の保管方式を定義する

## 参照資料

| 資料名                    | パス                                                                                 | 用途                             |
| ------------------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| Executor仕様正本          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | AUTHENTICATION_ERROR 契約確認    |
| エラーハンドリング正本    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | エラー分類確認                   |
| セキュリティ原則          | `.claude/skills/aiworkflow-requirements/references/security-principles.md`           | AuthKeyService 運用方針確認      |
| IPCセキュリティ正本       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`         | sender検証/P42順序確認           |
| Electron API セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`         | Preload境界確認                  |
| IPC契約正本               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                 | 戻り値契約確認                   |
| Skill I/F正本             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`    | `skill:execute` 契約境界確認     |
| 認証I/F正本               | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`               | 設定導線と状態定義確認           |
| UI/UX機能仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`      | 設定誘導UIの手動検証観点確認     |
| 品質要件正本              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`          | 手動テスト完了基準確認           |
| 抽出網羅行列              | `outputs/phase-1/implementation-spec-traceability-matrix.md`                         | 実装仕様抽出の単一正本           |
| Phase 1 仕様              | `phase-1-requirements.md`                                                            | 依存入力（要件定義）             |
| Phase 2 仕様              | `phase-2-design.md`                                                                  | 依存入力（設計）                 |
| Phase 5 仕様              | `phase-5-implementation.md`                                                          | 依存入力（実装）                 |
| Phase 6 仕様              | `phase-6-test-expansion.md`                                                          | 依存入力（テスト拡充）           |
| Phase 7 仕様              | `phase-7-coverage-check.md`                                                          | 依存入力（テストカバレッジ確認） |
| Phase 8 仕様              | `phase-8-refactoring.md`                                                             | 依存入力（リファクタリング）     |
| Phase 9 仕様              | `phase-9-quality-assurance.md`                                                       | 依存入力（品質保証）             |
| Phase 10 仕様             | `phase-10-final-review.md`                                                           | 依存入力（最終レビューゲート）   |
| corrective-action-plan.md | `outputs/phase-10/corrective-action-plan.md`                                         | Phase 10 成果物                  |
| final-review-result.md    | `outputs/phase-10/final-review-result.md`                                            | Phase 10 成果物                  |

## 実行手順

1. 手動シナリオを表で整理する。
2. 実機検証結果を記録する。
3. 証跡を保管する。

## 統合テスト連携

- 手動テストで Main/Preload/Renderer の導線を実機確認する。

## テストケース

| テストケース | 観点       | 検証内容                                                 |
| ------------ | ---------- | -------------------------------------------------------- |
| TC-01        | 正常表示   | AgentView 実行前画面が崩れず表示されること               |
| TC-02        | 異常系導線 | preflight NG 時に設定誘導を表示し execute を中断すること |
| TC-03        | 視覚品質   | エラー文言の可読性と情報階層が維持されること             |

## 画面カバレッジマトリクス

| テストケース | 表示状態       | インタラクション                  | テーマ | 証跡                                                                                  |
| ------------ | -------------- | --------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| TC-01        | 実行前通常状態 | なし                              | light  | `outputs/phase-11/screenshots/TC-01-agent-view-before-execute-2026-03-04.png`         |
| TC-02        | 認証エラー表示 | 実行ボタン押下後の preflight 分岐 | light  | `outputs/phase-11/screenshots/TC-02-agent-view-auth-preflight-error-2026-03-04.png`   |
| TC-03        | 可読性確認     | 文言視認（`/agent` 再撮影で検証） | light  | `outputs/phase-11/screenshots/TC-03-agent-view-before-execute-recheck-2026-03-04.png` |

## 多角的チェック観点（AIが判断）

| 観点           | 確認内容                           | 参照仕様                              |
| -------------- | ---------------------------------- | ------------------------------------- |
| セキュリティ   | sender検証、入力検証、権限境界     | `security-*.md`                       |
| IPC契約        | チャンネル名、引数、戻り値、エラー | `api-ipc-agent.md`, `interfaces-*.md` |
| アーキテクチャ | Main/Preload/Renderer の責務境界   | `architecture-*.md`                   |
| 品質           | テスト観点、回帰防止、可観測性     | `quality-*.md`, `error-handling.md`   |

## 成果物

| 成果物         | パス                                     | 内容     |
| -------------- | ---------------------------------------- | -------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 実機検証 |
| 証跡索引       | `outputs/phase-11/evidence-index.md`     | 証跡管理 |

## 完了条件

- [x] 実行タスクの成果物が全件定義されている
- [x] 依存Phaseとの整合が確認できる
- [x] 次Phaseへ引き継ぐ情報が記録されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料を確認する。
2. 実行タスクを実施する。
3. 成果物を outputs/phase-11/ に定義する。
4. 完了条件を確認する。

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] Phase内で定義した成果物を全件記録
- [x] 引き継ぎ情報を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001
```

## Phase実行記録

| 項目         | 記録                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| 実行タスク   | completed                                                                     |
| 発見事項     | APIキー未設定時の導線を可視検証し、2026-03-04再撮影で視認性・情報階層を再確認 |
| 引き継ぎ事項 | Phase 12 で仕様書（interfaces/api/security/task/lessons）へ同期する           |

## 次のPhase

Phase 12: ドキュメント更新
