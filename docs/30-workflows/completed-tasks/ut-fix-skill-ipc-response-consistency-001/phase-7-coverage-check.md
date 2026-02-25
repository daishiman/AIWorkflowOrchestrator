# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 7                                         |
| Phase名    | テストカバレッジ確認                      |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 |
| タスク名   | skill:ハンドラIPCレスポンス形式統一       |
| 機能名     | ut-fix-skill-ipc-response-consistency-001 |
| 前提Phase  | Phase 6                                   |
| 後続Phase  | Phase 8                                   |
| ステータス | 完了                                      |
| 作成日     | 2026-02-25                                |

## 目的

skill:ハンドラIPCレスポンス形式統一 を Phase 7 の観点で実行可能な粒度に定義し、契約ドリフトを防止する。

## 実行タスク

- タスク1: 影響モジュールのカバレッジ値を計測し閾値達成を確認する
- タスク2: 契約テストの未検証チャネルを抽出して補完する
- タスク3: 不足がある場合は Phase 6 に戻す判定を実施する

## 参照資料

| 参照資料                 | パス                                                                                        | 説明                                   |
| ------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| 依存Phase 5              | `phase-5-implementation.md`                                                                 | 前提となるPhase成果物                  |
| 依存Phase 6              | `phase-6-test-expansion.md`                                                                 | 前提となるPhase成果物                  |
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
| Agent IPC API            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPCチャネル契約と戻り値整合            |
| Electron Service仕様     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main/Preload責務と型契約               |
| 教訓集                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 過去失敗パターンと再発防止策           |

## 実行手順

### ステップ1: 参照資料を確認する

- 参照資料テーブルの必須仕様を読み、前提条件と制約を固定する。

### ステップ2: 実行タスクを順番に実施する

- 実行タスク1から順に実施し、判断根拠と出力内容を記録する。

### ステップ3: 成果物と完了条件を検証する

- outputs配下の成果物を作成し、完了条件チェックリストを更新する。

## 成果物

| 成果物                 | パス                                       | 説明                   |
| ---------------------- | ------------------------------------------ | ---------------------- |
| カバレッジ検証レポート | `outputs/phase-7/coverage-verification.md` | 閾値達成状況と不足分析 |

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

- [ ] カバレッジ計測方針が明記されている
- [ ] 不足時に Phase 6 へ戻る条件が定義されている
- [ ] 品質ゲート入力が作成されている
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

Phase 8: [phase-8-refactoring.md](phase-8-refactoring.md)
