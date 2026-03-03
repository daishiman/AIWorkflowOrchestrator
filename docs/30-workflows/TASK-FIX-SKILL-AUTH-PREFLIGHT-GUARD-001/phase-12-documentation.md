# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 12                                        |
| 機能名     | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001   |
| タスク名   | AUTHENTICATION_ERROR の事前検知と設定誘導 |
| 前提Phase  | Phase 11                                  |
| 後続Phase  | Phase 13                                  |
| 作成日     | 2026-03-03                                |
| ステータス | pending                                   |

## 目的

Phase 12 必須5タスクを仕様化し、認証事前検知機能の実装結果を実装ガイド・仕様同期・履歴・未タスク・フィードバックへ一貫して反映できる状態にする。

## 背景

`AUTHENTICATION_ERROR` はユーザー体験と運用性に直結する。`task-specification-creator` の Phase 12 要件に従って、`aiworkflow-requirements` 正本との同期を漏れなく設計する必要がある。

## SubAgent分担

| SubAgent | 担当                                          | 並列可否   |
| -------- | --------------------------------------------- | ---------- |
| A        | Task 1 実装ガイド（Part 1/Part 2）            | B と並列可 |
| B        | Task 2 Step 1-A/1-B/1-C（仕様同期）           | A と並列可 |
| C        | Task 2 Step 2 + Task 3（更新履歴）            | B 完了後   |
| D        | Task 4/Task 5（未タスク検出・フィードバック） | C と並列可 |

## 実行タスク

- Task 1: 実装ガイド作成（Part 1/Part 2）
- Task 2: システム仕様更新（Step 1-A/1-B/1-C + Step 2）
- Task 3: ドキュメント更新履歴作成（artifacts同期を含む）
- Task 4: 未タスク検出レポート作成（0件でも出力）
- Task 5: スキルフィードバックレポート作成（改善点なしでも出力）

### Task 1: 実装ガイド作成【必須・2パート構成】

- Part 1（中学生レベル）: 日常の例えを使い、先に「なぜ必要か」を説明する。
- Part 2（技術者レベル）: 型定義、APIシグネチャ、エラーハンドリング、設定値を記述する。

### Task 2: システム仕様更新【必須・Step 1-A/1-B/1-C + Step 2】

- Step 1-A: 完了タスク記録、関連ドキュメントリンク、LOGS.md（2ファイル）、topic-map 再生成。
- Step 1-B: 実装状況テーブルを `completed` または `spec_created` に更新。
- Step 1-C: 関連タスク/未タスク候補テーブルのステータス更新。
- Step 2: 新規IF/型/API変更がある場合のみ仕様本文を更新し、無い場合は「更新不要」の根拠を記録。

### Task 3: ドキュメント更新履歴作成【必須】

- `generate-documentation-changelog.js` 実行結果を基礎に更新履歴を確定する。
- Task 2 の各 Step 結果を changelog に明記する。
- `artifacts.json` と `outputs/artifacts.json` を同期更新する。

### Task 4: 未タスク検出レポート作成【必須】

- ソース: Phase 3/10 の MINOR 指摘、Phase 11 の発見課題、TODO/FIXME。
- 検出件数が 0 件でも「0件」を明記して出力する。

### Task 5: スキルフィードバックレポート作成【必須】

- スキル運用上の改善提案を記録する。
- 改善提案が 0 件でも「改善点なし」を明記して出力する。

## 参照資料

| 資料名                    | パス                                                                                    | 用途                             |
| ------------------------- | --------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 12 ガイド           | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | Task 1〜5 要件確認               |
| 仕様更新ワークフロー      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Task 2 Step定義                  |
| 技術文書ガイド            | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | Part 1/Part 2 品質               |
| Executor仕様正本          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`    | AUTHENTICATION_ERROR 契約確認    |
| エラーハンドリング正本    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                   | エラー分類確認                   |
| セキュリティ原則          | `.claude/skills/aiworkflow-requirements/references/security-principles.md`              | AuthKeyService 運用方針確認      |
| Electron API セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`            | Preload境界確認                  |
| 認証IPC仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                   | auth-key チャネル契約確認        |
| 環境変数仕様              | `.claude/skills/aiworkflow-requirements/references/environment-variables.md`            | ANTHROPIC_API_KEY 取り扱い       |
| 認証I/F正本               | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                  | 設定導線と状態定義確認           |
| タスク正本台帳            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | 完了記録と未タスク導線           |
| Phase 1 仕様              | `phase-1-requirements.md`                                                               | 依存入力（要件定義）             |
| Phase 2 仕様              | `phase-2-design.md`                                                                     | 依存入力（設計）                 |
| Phase 5 仕様              | `phase-5-implementation.md`                                                             | 依存入力（実装）                 |
| Phase 6 仕様              | `phase-6-test-expansion.md`                                                             | 依存入力（テスト拡充）           |
| Phase 7 仕様              | `phase-7-coverage-check.md`                                                             | 依存入力（テストカバレッジ確認） |
| Phase 8 仕様              | `phase-8-refactoring.md`                                                                | 依存入力（リファクタリング）     |
| Phase 9 仕様              | `phase-9-quality-assurance.md`                                                          | 依存入力（品質保証）             |
| Phase 10 仕様             | `phase-10-final-review.md`                                                              | 依存入力（最終レビューゲート）   |
| Phase 11 仕様             | `phase-11-manual-test.md`                                                               | 依存入力（手動テスト検証）       |

## 実行手順

1. SubAgent A/B を並列起動し、Task 1 と Task 2 Step 1-A/1-B/1-C を同時に進める。
2. SubAgent C が Task 2 Step 2 判定と Task 3 の更新履歴を作成する。
3. SubAgent D が Task 4 と Task 5 を作成する。
4. Task 1〜5 の成果物を相互参照で突合する。
5. 完了条件チェックリストを全件確認する。

## 多角的チェック観点（AIが判断）

| 観点           | 確認内容                           | 参照仕様                              |
| -------------- | ---------------------------------- | ------------------------------------- |
| セキュリティ   | sender検証、入力検証、権限境界     | `security-*.md`                       |
| IPC契約        | チャンネル名、引数、戻り値、エラー | `api-ipc-agent.md`, `interfaces-*.md` |
| アーキテクチャ | Main/Preload/Renderer の責務境界   | `architecture-*.md`                   |
| 品質           | テスト観点、回帰防止、可観測性     | `quality-*.md`, `error-handling.md`   |

## 成果物

| 成果物               | パス                                            | 内容                    |
| -------------------- | ----------------------------------------------- | ----------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Task 1（Part 1/Part 2） |
| 仕様同期サマリー     | `outputs/phase-12/spec-update-summary.md`       | Task 2 実施結果         |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | Task 3 実施結果         |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | Task 4 実施結果         |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | Task 5 実施結果         |

## 完了条件

- [ ] Task 1: Part 1（例え話）と Part 2（技術詳細）が作成されている
- [ ] Task 2: Step 1-A/1-B/1-C と Step 2 の判定結果が記録されている
- [ ] Task 3: documentation-changelog と artifacts 同期結果が記録されている
- [ ] Task 4: 未タスク検出レポートが出力されている（0件時を含む）
- [ ] Task 5: スキルフィードバックレポートが出力されている（0件時を含む）
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. SubAgent A/B/C/D の担当を固定する。
2. Task 1〜5 の成果物パスを先に確定する。
3. Task 2 の Step 判定を changelog と summary の両方へ転記する。
4. Task 4/5 の 0件時メッセージを明示する。

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] Phase内で定義した成果物を全件記録
- [ ] 引き継ぎ情報を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001
```

## Phase実行記録

| 項目         | 記録    |
| ------------ | ------- |
| 実行タスク   | pending |
| 発見事項     | pending |
| 引き継ぎ事項 | pending |

## 次のPhase

Phase 13: PR作成
