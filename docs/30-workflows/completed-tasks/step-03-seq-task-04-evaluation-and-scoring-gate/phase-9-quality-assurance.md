# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 9                       |
| Phase名    | 品質保証                |
| タスクID   | TASK-SKILL-LIFECYCLE-04 |
| ステータス | completed               |
| 前提Phase  | Phase 5, 6, 7, 8        |
| 後続Phase  | Phase 10                |

## 目的

評価ゲート統合の品質を、テスト・型・静的検証・契約整合の観点で確定する。

## 実行タスク

- タスク1: テスト、型チェック、lint を実行する。
- タスク2: IPC契約とセキュリティ契約の整合を検証する。
- タスク3: aiworkflow 正本仕様との乖離を検証する。
- タスク4: 品質ゲート合否を判定する。

## 参照資料

| 参照資料         | パス                                                                           | 目的                   |
| ---------------- | ------------------------------------------------------------------------------ | ---------------------- |
| 品質基準         | `.claude/skills/task-specification-creator/references/quality-standards.md`    | 判定基準確認           |
| IPCチェック      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | 契約監査               |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc-core.md` | セキュリティ監査       |
| 仕様抽出マップ   | `./aiworkflow-requirements-extraction.md`                                      | 仕様整合監査           |
| 依存Phase成果物  | phase-5-implementation.md（Phase 5）                                           | Phase 5 の成果物を参照 |

## 実行手順

1. テスト・型・lint を実行し結果を収集する。
2. IPC契約と実装の対応を確認する。
3. 仕様抽出マップに基づく整合監査を実施する。
4. 品質ゲートを PASS/MINOR/MAJOR で判定する。

## 統合テスト連携

- 想定コマンド: `pnpm --filter @repo/desktop exec vitest run`
- 想定コマンド: `pnpm --filter @repo/desktop exec tsc --noEmit`
- 想定コマンド: `pnpm --filter @repo/desktop exec eslint src --ext .ts,.tsx`
- 出力: quality gate 判定表。

## 多角的チェック観点（AIが判断）

- テスト・型・lint の全条件を満たしているか。
- 契約ドリフトが残っていないか。
- 仕様同期に必要な情報が不足していないか。

## サブタスク管理

| SubAgent   | 責務                 | 実行方式 | 出力                 |
| ---------- | -------------------- | -------- | -------------------- |
| SubAgent-A | テスト/型/lint 実行  | 並列     | qa-command-log.md    |
| SubAgent-B | IPC/セキュリティ監査 | 並列     | qa-contract-audit.md |
| SubAgent-C | 仕様整合監査         | 並列     | qa-spec-audit.md     |

## 成果物

| 成果物         | パス                                     | 内容           |
| -------------- | ---------------------------------------- | -------------- |
| 品質保証仕様   | `./phase-9-quality-assurance.md`         | 品質監査手順   |
| 品質ゲート結果 | `outputs/phase-9/quality-gate-result.md` | 実行結果と判定 |

## 完了条件

- [x] テスト・型・lint の結果が記録されている
- [x] IPC/セキュリティ監査結果が記録されている
- [x] 仕様整合監査結果が記録されている
- [x] 品質ゲート判定が確定している

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

## 次Phase

Phase 10（最終レビュー）で受入可否を最終判定する。
