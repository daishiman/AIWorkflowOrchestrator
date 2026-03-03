# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 13                                            |
| 機能名     | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 |
| タスク名   | skill:chain:list ハンドラ未登録の再発防止     |
| 前提Phase  | Phase 12                                      |
| 後続Phase  | なし                                          |
| 作成日     | 2026-03-03                                    |
| ステータス | pending                                       |

## 目的

skill:chain:list ハンドラ未登録の再発防止 を実装可能な単位へ分解し、Phase 13 の成果物を確定する。

## 背景

skill:chain:list ハンドラ未登録の再発防止 を実行する前提として、Phase 13 で必要な判断材料と成果物の境界を固定する。

## SubAgent分担

| SubAgent | 担当                      |
| -------- | ------------------------- |
| A        | Main/IPC 観点             |
| B        | Preload/Renderer 観点     |
| C        | テスト/品質/仕様同期 観点 |

## 実行タスク

- PR準備計画: PR本文テンプレートを作成する
- レビュー観点計画: レビュー項目を固定する
- 実行境界明記: 本タスクで実装・コミット・PRを行わないことを明記する

## 参照資料

| 資料名            | パス                                                                                        | 用途                                |
| ----------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| IPC契約正本       | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | skill:chain:list 契約確認           |
| スキルI/F正本     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Preload API 契約確認                |
| IPCセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender検証確認                      |
| 実装パターン      | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | registerAllIpcHandlers 配線パターン |
| IPC永続化パターン | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`                 | validateIpcSender 位置確認          |
| IPC契約チェック   | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P42/P44/P45 チェック                |
| Phase 1 仕様      | `phase-1-requirements.md`                                                                   | 依存入力（要件定義）                |
| Phase 2 仕様      | `phase-2-design.md`                                                                         | 依存入力（設計）                    |
| Phase 5 仕様      | `phase-5-implementation.md`                                                                 | 依存入力（実装）                    |
| Phase 6 仕様      | `phase-6-test-expansion.md`                                                                 | 依存入力（テスト拡充）              |
| Phase 7 仕様      | `phase-7-coverage-check.md`                                                                 | 依存入力（テストカバレッジ確認）    |
| Phase 8 仕様      | `phase-8-refactoring.md`                                                                    | 依存入力（リファクタリング）        |
| Phase 9 仕様      | `phase-9-quality-assurance.md`                                                              | 依存入力（品質保証）                |
| Phase 10 仕様     | `phase-10-final-review.md`                                                                  | 依存入力（最終レビューゲート）      |
| Phase 11 仕様     | `phase-11-manual-test.md`                                                                   | 依存入力（手動テスト検証）          |
| Phase 12 仕様     | `phase-12-documentation.md`                                                                 | 依存入力（ドキュメント更新）        |

## 実行手順

1. PR情報ドラフトを作成する。
2. レビュー観点チェックリストを作成する。
3. 実施範囲外事項を明記する。

## 多角的チェック観点（AIが判断）

| 観点           | 確認内容                           | 参照仕様                              |
| -------------- | ---------------------------------- | ------------------------------------- |
| セキュリティ   | sender検証、入力検証、権限境界     | `security-*.md`                       |
| IPC契約        | チャンネル名、引数、戻り値、エラー | `api-ipc-agent.md`, `interfaces-*.md` |
| アーキテクチャ | Main/Preload/Renderer の責務境界   | `architecture-*.md`                   |
| 品質           | テスト観点、回帰防止、可観測性     | `quality-*.md`, `error-handling.md`   |

## 成果物

| 成果物         | パス                                   | 内容         |
| -------------- | -------------------------------------- | ------------ |
| PR情報ドラフト | `outputs/phase-13/pr-info.md`          | PR雛形       |
| レビュー観点   | `outputs/phase-13/review-checklist.md` | レビュー項目 |

## 完了条件

- [ ] PR情報ドラフトが作成されている
- [ ] レビュー観点チェックリストが作成されている
- [ ] 実施範囲外（実装・コミット・PR未実施）が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料を確認する。
2. 実行タスクを実施する。
3. 成果物を outputs/phase-13/ に定義する。
4. 完了条件を確認する。

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] Phase内で定義した成果物を全件記録
- [ ] 引き継ぎ情報を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001
```

## Phase実行記録

| 項目         | 記録    |
| ------------ | ------- |
| 実行タスク   | pending |
| 発見事項     | pending |
| 引き継ぎ事項 | pending |

## 次のPhase

ワークフロー完了
