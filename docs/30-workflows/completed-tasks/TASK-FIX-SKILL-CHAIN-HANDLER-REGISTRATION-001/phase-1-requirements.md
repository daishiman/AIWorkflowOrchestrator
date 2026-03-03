# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 1                                             |
| 機能名     | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 |
| タスク名   | skill:chain:list ハンドラ未登録の再発防止     |
| 前提Phase  | -                                             |
| 後続Phase  | Phase 2                                       |
| 作成日     | 2026-03-03                                    |
| ステータス | completed                                     |

## 目的

skill:chain:list ハンドラ未登録の再発防止 を実装可能な単位へ分解し、Phase 1 の成果物を確定する。

## 背景

skill:chain:list ハンドラ未登録の再発防止 を実行する前提として、Phase 1 で必要な判断材料と成果物の境界を固定する。

## SubAgent分担

| SubAgent | 担当                      |
| -------- | ------------------------- |
| A        | Main/IPC 観点             |
| B        | Preload/Renderer 観点     |
| C        | テスト/品質/仕様同期 観点 |

## 実行タスク

- 要件分解: エラー事象と期待動作を固定する
- 受け入れ基準化: 判定条件を数値で定義する
- SubAgent分担設計: A/B/C の責務境界を明文化する

## 参照資料

| 資料名             | パス                                                                                        | 用途                                |
| ------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| IPC契約正本        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | skill:chain:list 契約確認           |
| スキルI/F正本      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Preload API 契約確認                |
| IPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender検証確認                      |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | registerAllIpcHandlers の責務確認   |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | registerAllIpcHandlers 配線パターン |
| IPC永続化パターン  | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`                 | validateIpcSender 位置確認          |
| IPC契約チェック    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P42/P44/P45 チェック                |
| エラー契約         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | IpcResult エラー整形確認            |
| タスク台帳         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 配線漏れ再発防止パターン確認        |

## 実行手順

1. ログと再現条件を整理する。
2. FR/NFR を分離して記述する。
3. Given/When/Then 形式へ変換する。

## 統合テスト連携

- Main/Preload/Renderer の接続要件を明文化する。
- 再現シナリオを統合テストケースへ引き継ぐ。

## 多角的チェック観点（AIが判断）

| 観点           | 確認内容                           | 参照仕様                              |
| -------------- | ---------------------------------- | ------------------------------------- |
| セキュリティ   | sender検証、入力検証、権限境界     | `security-*.md`                       |
| IPC契約        | チャンネル名、引数、戻り値、エラー | `api-ipc-agent.md`, `interfaces-*.md` |
| アーキテクチャ | Main/Preload/Renderer の責務境界   | `architecture-*.md`                   |
| 品質           | テスト観点、回帰防止、可観測性     | `quality-*.md`, `error-handling.md`   |

## 成果物

| 成果物       | パス                                         | 内容                 |
| ------------ | -------------------------------------------- | -------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | FR/NFR定義           |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 判定条件             |
| 差分監査     | `outputs/phase-1/branch-diff-coverage.md`    | ブランチ差分反映確認 |

## 完了条件

- [x] 実行タスクの成果物が全件定義されている
- [x] 依存Phaseとの整合が確認できる
- [x] 次Phaseへ引き継ぐ情報が記録されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料を確認する。
2. 実行タスクを実施する。
3. 成果物を outputs/phase-1/ に定義する。
4. 完了条件を確認する。

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] Phase内で定義した成果物を全件記録
- [x] 引き継ぎ情報を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001
```

## Phase実行記録

| 項目         | 記録                                   |
| ------------ | -------------------------------------- |
| 実行タスク   | 完了（詳細は outputs/phase-1/ を参照） |
| 発見事項     | outputs/phase-1/ に記録                |
| 引き継ぎ事項 | 次Phaseへ反映済み                      |

## 次のPhase

Phase 2: 設計
