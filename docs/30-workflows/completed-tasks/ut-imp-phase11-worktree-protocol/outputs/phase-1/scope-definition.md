# Phase 1: スコープ定義

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| タスクID | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001 |
| Phase    | 1                                    |
| 作成日   | 2026-03-01                           |

## タスク概要

Git Worktree環境でPhase 11（手動テスト）を実行する際に、Electronアプリを直接起動できない制約を克服するための標準化テストプロトコルを策定する。

## スコープ内（含むもの: 7件）

| #   | 対象                                   | 詳細                                                                              | 対応FR     |
| --- | -------------------------------------- | --------------------------------------------------------------------------------- | ---------- |
| 1   | Worktree Phase 11プロトコル文書（1件） | Layer 1-3テスト戦略を定義する手順書                                               | FR-1       |
| 2   | Playwright Electron E2Eテスト（2件）   | ipc-skill-remove.spec.ts、ipc-skill-import.spec.ts                                | FR-2, FR-3 |
| 3   | E2Eテストヘルパー（1件）               | apps/desktop/e2e/helpers/electron-app.ts（Electron起動・終了・IPC呼び出し共通化） | FR-2, FR-3 |
| 4   | Playwright設定更新（1件）              | apps/desktop/playwright.config.tsにelectron-e2eプロジェクト追加                   | FR-4       |
| 5   | CI/CDワークフロー更新（1件）           | .github/workflows/ci.ymlにe2e-desktopジョブ追加                                   | FR-5       |
| 6   | Phase 11テンプレート更新（1件）        | phase-11-12-guide.mdに「Worktree環境テスト手順」セクション追加                    | FR-6       |
| 7   | 未実施テスト追跡テンプレート（1件）    | deferred-tests-template.mdの新規作成                                              | FR-7       |

## スコープ外（含まないもの: 6件）

| #   | 除外対象                                              | 理由                                       |
| --- | ----------------------------------------------------- | ------------------------------------------ |
| 1   | 既存Phase 11仕様書の遡及修正                          | 適用は新規タスクのPhase 11仕様書作成時から |
| 2   | Worktree環境以外のテスト手順変更                      | 本タスクはWorktree固有の制約への対応に限定 |
| 3   | Electronアプリ本体のビルドパイプライン構築            | 別タスクのスコープ                         |
| 4   | パフォーマンステスト・負荷テストの自動化              | 機能テストの代替手段に限定                 |
| 5   | skill:remove/import以外のIPCハンドラE2Eテスト         | P44/P45回帰防止対象の2ハンドラに限定       |
| 6   | Playwright \_electron.launch()のmacOS/Windows固有設定 | CI環境(ubuntu-latest)での動作を優先        |

## 成果物一覧

| 成果物                     | ファイルパス                                 | 種別                 |
| -------------------------- | -------------------------------------------- | -------------------- |
| プロトコル文書             | outputs/phase-5/worktree-phase11-protocol.md | ドキュメント         |
| skill:remove E2Eテスト     | apps/desktop/e2e/ipc-skill-remove.spec.ts    | コード               |
| skill:import E2Eテスト     | apps/desktop/e2e/ipc-skill-import.spec.ts    | コード               |
| E2Eヘルパー                | apps/desktop/e2e/helpers/electron-app.ts     | コード               |
| Playwright設定             | apps/desktop/playwright.config.ts            | コード（更新）       |
| CIワークフロー             | .github/workflows/ci.yml                     | 設定（更新）         |
| Phase 11テンプレート       | phase-11-12-guide.md                         | ドキュメント（更新） |
| deferred-testsテンプレート | outputs/phase-5/deferred-tests-template.md   | ドキュメント         |

## ユーティリティモジュール（Phase 5で実装）

| モジュール            | ファイルパス                                         | 用途                      |
| --------------------- | ---------------------------------------------------- | ------------------------- |
| worktree-detector     | apps/desktop/src/main/utils/worktree-detector.ts     | Worktree環境判定          |
| deferred-tests-parser | apps/desktop/src/main/utils/deferred-tests-parser.ts | deferred-tests.mdパーサー |
| test-layer-classifier | apps/desktop/src/main/utils/test-layer-classifier.ts | Layer分類判定ロジック     |

## 依存関係

| 依存タスク                        | 種別     | 状態     |
| --------------------------------- | -------- | -------- |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | 前提完了 | 完了済み |
| UT-FIX-SKILL-IMPORT-INTERFACE-001 | 前提完了 | 完了済み |

## リスク分析

| リスク                                 | 影響度 | 発生確率 | 対策                                                |
| -------------------------------------- | ------ | -------- | --------------------------------------------------- |
| Worktree環境でのPlaywright依存関係不足 | 高     | 中       | Layer 3はCI/メインリポジトリに委譲                  |
| xvfb-runのCI環境での不安定性           | 中     | 低       | フォールバック（ジョブスキップ+deferred-tests記録） |
| 既存Playwright設定の破壊               | 高     | 低       | electron-e2eプロジェクトを独立追加                  |
| IPCハンドラ変更による回帰              | 高     | 低       | P42/P44/P45準拠のE2Eテストで回帰防止                |

## 完了条件

- [x] 含むもの7件が全て明文化されている
- [x] 含まないもの6件が全て明文化されている
- [x] 各除外項目に理由が記載されている
- [x] 成果物一覧が全て列挙されている
- [x] 依存関係が整理されている
- [x] リスク分析が完了している
