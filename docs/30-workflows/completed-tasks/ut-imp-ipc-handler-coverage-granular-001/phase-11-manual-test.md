# Phase 11: 手動テスト検証 — IPCハンドラ単位カバレッジ測定基盤構築

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 11（手動テスト検証）                                                   |
| タスクID   | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001                               |
| 機能名     | ut-imp-ipc-handler-coverage-granular-001                               |
| 前提Phase  | Phase 10                                                               |
| 後続Phase  | Phase 12                                                               |
| ステータス | 完了（2026-02-28）                                                     |
| Issue      | [#854](https://github.com/daishiman/AIWorkflowOrchestrator/issues/854) |
| 作成日     | 2026-02-28                                                             |

## 目的

自動テストでは検証できないスクリプトの実動作・出力品質・ドキュメント品質を手動で確認する。`coverage-by-handler.ts`を実際の`skillHandlers.ts`に対して実行し、出力結果の正確性・可読性・エラーハンドリングを目視で検証する。Phase 7判定ルール文書が実務で適用可能であることも検証する。

## 背景

Phase 10でPASS/MINOR判定された実装を、手動テストで実際の運用シナリオに沿って検証する。対象は以下の3カテゴリ:

1. **機能テスト**: `coverage-by-handler.ts`スクリプトの実行結果が正確であること
2. **出力品質テスト**: Markdownテーブルの可読性とフォーマットが運用に耐えること
3. **ドキュメント品質テスト**: Phase 7判定ルール文書が曖昧さなく適用可能であること

## 実行タスク

- SubAgent-A（機能テスト）: `skillHandlers.ts`に対するスクリプト実行と出力確認、エラーケースの手動確認を行う。
- SubAgent-B（出力・ドキュメント品質テスト）: Markdownレポートの可読性確認とPhase 7判定ルールの適用シミュレーションを行う。
- Lead（統合判定）: 全テスト結果を統合し、Phase 12への進行可否を判定する。

## 参照資料

| 参照資料             | パス                                                                                        | 内容                       |
| -------------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 1              | `phase-1-requirements.md`                                                                   | 要件と受入基準             |
| Phase 2              | `phase-2-design.md`                                                                         | 設計仕様                   |
| Phase 5              | `phase-5-implementation.md`                                                                 | 実装内容                   |
| Phase 6              | `phase-6-test-expansion.md`                                                                 | 追加テスト観点             |
| Phase 7              | `phase-7-coverage-check.md`                                                                 | カバレッジ検証仕様         |
| Phase 8              | `phase-8-refactoring.md`                                                                    | リファクタリング結果       |
| Phase 9              | `phase-9-quality-assurance.md`                                                              | 品質保証結果               |
| Phase 10             | `phase-10-final-review.md`                                                                  | 最終レビュー結果           |
| Phase 10 結果        | `outputs/phase-10/final-review-result.md`                                                   | 判定条件                   |
| Phase 11/12ガイド    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | 手動検証の進め方           |
| 未タスクガイド       | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`        | 検出記録ルール             |
| プロダクションコード | `apps/desktop/scripts/coverage-by-handler.ts`                                               | 検証対象スクリプト         |
| テストコード         | `apps/desktop/scripts/coverage-by-handler.test.ts`                                          | 自動テスト                 |
| 対象ファイル         | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                | 集計対象IPCハンドラ        |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 運用パターンと落とし穴対策 |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料             | パス                                                                        | 内容                           |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------ |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 手動テストシナリオの網羅性基準 |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                        | P40/P41の教訓                  |
| テスト実行ルール     | `.claude/rules/02-code-quality.md`                                          | テスト設計の注意点             |

## 実行手順

### Task 11-1: カバレッジJSON生成と集計スクリプト実行

実際のテスト環境でカバレッジJSONを生成し、集計スクリプトを実行する。

```bash
# 1. カバレッジJSON生成
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts --coverage

# 2. 集計スクリプト実行
npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts
```

**検証項目:**

- [ ] カバレッジJSONが`coverage/`ディレクトリに正常生成される
- [ ] 集計スクリプトがエラーなく実行完了する
- [ ] 23ハンドラ分のレポートが出力される

### Task 11-2: 出力レポートの正確性検証

出力されたMarkdownテーブルの内容が実態と一致することを確認する。

**検証項目:**

- [ ] `skill:remove`ハンドラのカバレッジが高値（90%以上）である
- [ ] テスト未作成ハンドラのカバレッジが低値（0%〜低い値）である
- [ ] 各ハンドラの行番号範囲が`skillHandlers.ts`の実際の行番号と一致する
- [ ] Markdownテーブル形式が正しくレンダリングされる（VS Code Preview等で確認）

### Task 11-3: P41注記の確認

v8カバレッジプロバイダのインライン関数カウント（P41）に関する注記が出力に含まれることを確認する。

**検証項目:**

- [ ] P41インラインアロー関数の注記がレポートに含まれている
- [ ] 注記内容が正確で、ユーザーが理解できる表現になっている

### Task 11-4: エラーケースの動作検証

異常入力に対するエラーハンドリングを手動で確認する。

```bash
# 存在しないファイルを指定
npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/nonexistent.ts

# カバレッジJSONなし（coverageディレクトリ削除後に実行）
npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts

# 引数なし実行
npx tsx scripts/coverage-by-handler.ts
```

**検証項目:**

- [ ] 存在しないファイル指定時に明確なエラーメッセージが表示される
- [ ] カバレッジJSONが存在しない場合に明確なエラーメッセージが表示される
- [ ] 引数なし実行時にusageヘルプが表示される
- [ ] エラー時にプロセスが非ゼロ終了コードで終了する

### Task 11-5: Phase 7判定ルールの適用シミュレーション

Phase 7判定ルール文書が実務で適用可能かを確認する。

**検証項目:**

- [ ] Phase 7判定ルール文書を読み、`skill:remove`ハンドラ（事実上100%カバレッジ）の事例でPASS判定が導出できる
- [ ] ファイル全体45.14%だが修正対象ハンドラは100%の場合に「ハンドラ単位で基準充足→PASS」の判定が導出できる
- [ ] 実装ガイドPart 1に必要な概念が明確に定義されている
- [ ] LOGS.md 2ファイルの更新対象が特定されている

## 手動テストケーステーブル

| No     | カテゴリ     | テスト項目                   | 前提条件                                | 操作手順                                                                            | 期待結果                                                       |
| ------ | ------------ | ---------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| MT-001 | 機能         | 23ハンドラ検出               | `skillHandlers.ts`が存在                | `npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts`を実行 | 23行のテーブル出力                                             |
| MT-002 | 機能         | カバレッジ値の妥当性         | カバレッジJSON生成済み                  | 出力値とVitestレポートを突合                                                        | 値が一致                                                       |
| MT-003 | 機能         | ハンドラ単位vsファイル全体差 | MT-001, MT-002完了                      | ファイル全体カバレッジ（45.14%）と各ハンドラカバレッジを比較                        | カバー済みハンドラは高値、未テストハンドラは低値               |
| MT-004 | 出力品質     | Markdownテーブルの可読性     | MT-001の出力取得済み                    | 出力をMarkdownビューアで表示                                                        | 正しくレンダリングされ列幅が適切                               |
| MT-005 | 出力品質     | テーブル列の情報量           | MT-001の出力取得済み                    | 各列（ハンドラ名、行範囲、Line%、Branch%、Function%、判定）を確認                   | 全列にデータが入り欠落がない                                   |
| MT-006 | ドキュメント | Phase 7判定ルールの適用      | `quality-requirements.md`更新済み       | 判定ルールを読み、`skill:remove`の事例で判定を手動実行                              | PASS判定が曖昧さなく導出可能                                   |
| MT-007 | ドキュメント | ファイル全体45%のPASS判定    | MT-006完了                              | ファイル全体45.14%だが修正対象ハンドラは100%の場合に判定ルールを適用                | 「ハンドラ単位で基準充足→PASS」が導出可能                      |
| MT-008 | エラー       | 存在しないファイル           | スクリプトが実行可能                    | `npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/nonexistent.ts`を実行   | 明確なエラーメッセージが表示される                             |
| MT-009 | エラー       | カバレッジJSONなし           | `coverage/`ディレクトリが空または未生成 | カバレッジJSONを生成せずにスクリプトを実行                                          | 「カバレッジデータが見つかりません」等のメッセージが表示される |
| MT-010 | エラー       | 引数なし実行                 | スクリプトが実行可能                    | `npx tsx scripts/coverage-by-handler.ts`を実行                                      | usageヘルプが表示される                                        |

## 統合テスト連携

| 観点        | 連携内容                                                               |
| ----------- | ---------------------------------------------------------------------- |
| 実操作性    | 手動テスト手順書のみでスクリプトが実行可能であること                   |
| 判定明瞭性  | ハンドラ単位カバレッジとファイル全体カバレッジの意味が混同されないこと |
| Phase 7連携 | 出力結果をPhase 7判定ルールに直接入力して判定が完了できること          |
| 記録性      | Phase 12の記録に直接接続できること                                     |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                                       | 仕様参照先                                                                                                                        |
| ------------------ | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | パストラバーサル入力テスト（`--file ../../etc/passwd`等）      | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | 適用外（手動テストのため）                                     | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用外（CLIスクリプトのため）                                  | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 不正入力時のエラーメッセージ可読性を手動確認（MT-008〜MT-010） | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | 運用シナリオに沿ったスクリプト実行→判定の手順確認              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物           | パス                                       | 説明                                   |
| ---------------- | ------------------------------------------ | -------------------------------------- |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`   | MT-001〜MT-010の実行結果と判定         |
| 発見事項         | `outputs/phase-11/manual-findings.md`      | スコープ外の発見事項と改善提案         |
| 実行証跡         | `outputs/phase-11/command-transcript.md`   | 実行コマンドと出力のスクリーンショット |
| スクリプト出力例 | `outputs/phase-11/script-output-sample.md` | 実際のスクリプト出力のスナップショット |

## 完了条件

- [ ] MT-001〜MT-010の全手動テストケースを実行している
- [ ] 機能テスト（MT-001〜MT-003）で出力値の正確性を確認している
- [ ] 出力品質テスト（MT-004〜MT-005）でMarkdownレンダリングの可読性を確認している
- [ ] ドキュメントテスト（MT-006〜MT-007）でPhase 7判定ルールの適用可能性を確認している
- [ ] エラーテスト（MT-008〜MT-010）で全エラーケースのメッセージを確認している
- [ ] P41インラインアロー関数の注記が含まれていることを確認している
- [ ] 発見事項がPhase 12に引き継ぎ可能な形式で記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が所定パスに生成済み
- [ ] 実行結果と完了条件の一致を確認済み

## 依存関係

- **前提**: Phase 10
- **後続**: Phase 12

## サブタスク管理

- [ ] 参照資料の確認を完了
- [ ] 実行タスク（SubAgent担当）を完了
- [ ] 成果物作成と配置を完了
- [ ] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001 --phase 11` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

Phase 12: ドキュメント更新（phase-12-documentation.md）
