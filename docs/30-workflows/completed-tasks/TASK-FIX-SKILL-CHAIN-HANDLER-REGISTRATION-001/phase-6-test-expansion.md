# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 6                                             |
| 機能名     | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 |
| タスク名   | skill:chain:list ハンドラ未登録の再発防止     |
| 前提Phase  | Phase 5                                       |
| 後続Phase  | Phase 7                                       |
| 作成日     | 2026-03-03                                    |
| ステータス | completed                                     |

## 目的

skill:chain:list ハンドラ未登録の再発防止 を実装可能な単位へ分解し、Phase 6 の成果物を確定する。

## 背景

skill:chain:list ハンドラ未登録の再発防止 を実行する前提として、Phase 6 で必要な判断材料と成果物の境界を固定する。

## SubAgent分担

| SubAgent | 担当                      |
| -------- | ------------------------- |
| A        | Main/IPC 観点             |
| B        | Preload/Renderer 観点     |
| C        | テスト/品質/仕様同期 観点 |

## 実行タスク

- テスト拡張設計: 境界値と回帰ケースを追加する
- セキュリティテスト拡張: sender/validation ケースを追加する
- 異常系拡張: 例外経路の戻り値を固定する

## 参照資料

| 資料名            | パス                                                                                        | 用途                                |
| ----------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| IPC契約正本       | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | skill:chain:list 契約確認           |
| スキルI/F正本     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Preload API 契約確認                |
| IPCセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender検証確認                      |
| 実装パターン      | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | registerAllIpcHandlers 配線パターン |
| IPC永続化パターン | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`                 | validateIpcSender 位置確認          |
| IPC契約チェック   | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P42/P44/P45 チェック                |
| Phase 5 仕様      | `phase-5-implementation.md`                                                                 | 依存入力（実装）                    |

## 実行手順

1. 回帰ケース候補を抽出する。
2. セキュリティ観点ケースを追加する。
3. 再発防止ケースを記録する。

## 統合テスト連携

- 回帰ケースを統合テストへ追加し、再発防止を固定する。

## 多角的チェック観点（AIが判断）

| 観点           | 確認内容                           | 参照仕様                              |
| -------------- | ---------------------------------- | ------------------------------------- |
| セキュリティ   | sender検証、入力検証、権限境界     | `security-*.md`                       |
| IPC契約        | チャンネル名、引数、戻り値、エラー | `api-ipc-agent.md`, `interfaces-*.md` |
| アーキテクチャ | Main/Preload/Renderer の責務境界   | `architecture-*.md`                   |
| 品質           | テスト観点、回帰防止、可観測性     | `quality-*.md`, `error-handling.md`   |

## 成果物

| 成果物         | パス                                        | 内容         |
| -------------- | ------------------------------------------- | ------------ |
| 拡張テスト一覧 | `outputs/phase-6/expanded-test-cases.md`    | 追加ケース   |
| 回帰結果       | `outputs/phase-6/regression-test-result.md` | 再発防止確認 |

## 完了条件

- [x] 実行タスクの成果物が全件定義されている
- [x] 依存Phaseとの整合が確認できる
- [x] 次Phaseへ引き継ぐ情報が記録されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料を確認する。
2. 実行タスクを実施する。
3. 成果物を outputs/phase-6/ に定義する。
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
| 実行タスク   | 完了（詳細は outputs/phase-6/ を参照） |
| 発見事項     | outputs/phase-6/ に記録                |
| 引き継ぎ事項 | 次Phaseへ反映済み                      |

## 次のPhase

Phase 7: テストカバレッジ確認
