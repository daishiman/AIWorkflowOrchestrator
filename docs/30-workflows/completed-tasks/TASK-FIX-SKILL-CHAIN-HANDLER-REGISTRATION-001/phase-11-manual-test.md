# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 11                                            |
| 機能名     | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 |
| タスク名   | skill:chain:list ハンドラ未登録の再発防止     |
| 前提Phase  | Phase 10                                      |
| 後続Phase  | Phase 12                                      |
| 作成日     | 2026-03-03                                    |
| ステータス | completed                                     |

## 目的

skill:chain:list ハンドラ未登録の再発防止 を実装可能な単位へ分解し、Phase 11 の成果物を確定する。

## 背景

skill:chain:list ハンドラ未登録の再発防止 を実行する前提として、Phase 11 で必要な判断材料と成果物の境界を固定する。

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

## 実行手順

1. 手動シナリオを表で整理する。
2. 実機検証結果を記録する。
3. 証跡を保管する。

## テストケース

| テストケース | 種別           | 検証観点                              | 期待結果                           |
| ------------ | -------------- | ------------------------------------- | ---------------------------------- |
| TC-01        | 画面表示       | Chain Builder 画面の表示確認          | 画面が描画され、崩れなく表示される |
| TC-02        | 自動テスト連携 | `registerSkillChainHandlers` 登録配線 | 回帰テストが PASS する             |
| TC-03        | ライフサイクル | `register -> unregister -> register`  | 再登録で例外が発生しない           |
| TC-04        | スコープ分離   | 認証キー未設定導線（別タスク）        | 本タスク条件外として明示される     |

## 統合テスト連携

- 手動テストで Main/Preload/Renderer の導線を実機確認する。

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001
```

## Phase実行記録

| 項目         | 記録                                    |
| ------------ | --------------------------------------- |
| 実行タスク   | 完了（詳細は outputs/phase-11/ を参照） |
| 発見事項     | outputs/phase-11/ に記録                |
| 引き継ぎ事項 | 次Phaseへ反映済み                       |

## 次のPhase

Phase 12: ドキュメント更新
