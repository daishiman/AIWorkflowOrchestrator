# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 13                                         |
| 機能名     | phase12-subagent-artifact-guard            |
| タスク名   | Phase 12 SubAgent成果物固定ガード          |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 |
| 前提Phase  | Phase 12                                   |
| 後続Phase  | なし（最終Phase）                          |
| 作成日     | 2026-03-03                                 |
| ステータス | pending                                    |

## 目的

成果物の最終確認とPR準備を実施し、Phase 12 SubAgent成果物固定ガードの全成果物をレビュー可能な状態にする。

## 背景

Phase 1-12 で作成された全成果物（テンプレート・運用手順・検証スクリプト・ドキュメント）を最終確認し、PRとして提出可能な状態に整える。

## SubAgent分担

| SubAgent | 担当                               |
| -------- | ---------------------------------- |
| A        | 成果物最終確認・artifacts.json同期 |
| B        | PR本文作成・検証コマンド実行       |

## 実行タスク

### Task 1: 成果物最終確認

全 Phase 成果物の存在確認と artifacts.json の同期を行う。

- [ ] Phase 1-12 の全成果物ファイルが所定のパスに存在することを確認
- [ ] `artifacts.json` の全Phaseステータスが正確であることを確認
- [ ] 成果物間の相互参照リンクが有効であることを確認

### Task 2: ブランチ確認

- [ ] 現在のブランチが `feature/task-imp-phase12-subagent-artifact-guard-001` であることを確認
- [ ] mainブランチとの差分を確認
- [ ] コンフリクトがないことを確認

### Task 3: 検証コマンド実行

```bash
# ワークフロー全体検証（スクリプトが存在する場合）
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard

# Phase出力検証（スクリプトが存在する場合）
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard
```

- [ ] 検証スクリプトがエラーなく完了すること
- [ ] 検証結果に未解決の問題がないこと

### Task 4: PR本文作成

- [ ] PR タイトル: `fix(docs): Phase 12 SubAgent成果物固定ガード (#955)`（70文字以内）
- [ ] Summary: 1-3箇条書きで変更内容を要約
- [ ] Test Plan: 手動テスト結果と監査スクリプト結果を記載
- [ ] 関連Issue: `Closes #955`

> **注意**: PR作成は自動実行しない。ユーザーの明示的な許可を得てから実行する。

## 参照資料

| 資料名                | パス                                                                               | 用途               |
| --------------------- | ---------------------------------------------------------------------------------- | ------------------ |
| Phase 1 要件定義書    | `outputs/phase-1/requirements-definition.md`                                       | 要件トレース       |
| Phase 2 設計書        | `outputs/phase-2/architecture-design.md`                                           | 設計トレース       |
| Phase 5 実装          | `outputs/phase-5/implementation-summary.md`                                        | 実装内容確認       |
| Phase 6 テスト拡充    | `outputs/phase-6/coverage-report.md`                                               | テスト結果確認     |
| Phase 7 カバレッジ    | `outputs/phase-7/coverage-report.md`                                               | カバレッジ確認     |
| Phase 8 リファクタ    | `outputs/phase-8/refactoring-log.md`                                               | リファクタ結果確認 |
| Phase 9 品質保証      | `outputs/phase-9/quality-report.md`                                                | 品質検証結果確認   |
| Phase 10 最終レビュー | `outputs/phase-10/final-review-result.md`                                          | ゲート判定確認     |
| Phase 11 手動テスト   | `outputs/phase-11/manual-test-result.md`                                           | 手動検証結果       |
| Phase 12 ドキュメント | `outputs/phase-12/implementation-guide.md`                                         | ドキュメント確認   |
| artifacts.json        | `docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard/artifacts.json` | 成果物レジストリ   |
| PR作成ルール          | `.claude/rules/07-git-and-tooling.md`                                              | PR形式の正本       |

## 実行手順

1. Task 1: 全Phase成果物の存在確認と artifacts.json 同期
2. Task 2: ブランチ状態の確認
3. Task 3: 検証コマンドの実行
4. Task 4: PR本文の下書き作成（自動実行しない）
5. ユーザーの許可を得てからPRを作成

## 統合テスト連携

- Phase 11 の手動テスト結果を PR の Test Plan セクションに反映する
- Phase 12 の documentation-changelog.md を PR の Summary に反映する

## 多角的チェック観点（AIが判断）

| 観点           | 確認内容                                          | 参照仕様              |
| -------------- | ------------------------------------------------- | --------------------- |
| 成果物完全性   | 全Phase成果物が存在し、artifacts.jsonと一致するか | artifacts.json        |
| PR品質         | タイトル70文字以内、Summary+Test Plan形式         | 07-git-and-tooling.md |
| ブランチ整合性 | 正しいブランチからPRが作成されるか                | Git操作ルール         |
| レビュー容易性 | 変更内容が明確に説明されているか                  | PR本文                |

## 成果物

| 成果物 | パス                          | 内容                   |
| ------ | ----------------------------- | ---------------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR本文下書きとメタ情報 |

## 完了条件

- [ ] 全Phase成果物の存在が確認されている
- [ ] artifacts.json が最新状態に同期されている
- [ ] 検証コマンドがエラーなく完了している
- [ ] PR本文が作成されている（PRの実行はユーザー許可後）
- [ ] ブランチにコンフリクトがない

## サブタスク管理

| サブタスク         | 担当       | ステータス | 備考                 |
| ------------------ | ---------- | ---------- | -------------------- |
| 成果物最終確認     | SubAgent A | pending    |                      |
| artifacts.json同期 | SubAgent A | pending    |                      |
| ブランチ確認       | SubAgent B | pending    |                      |
| 検証コマンド実行   | SubAgent B | pending    |                      |
| PR本文作成         | SubAgent B | pending    | ユーザー許可後に実行 |

## タスク100%実行確認

- [ ] 全タスクの実行が完了している
- [ ] 全成果物が所定のパスに配置されている
- [ ] 完了条件が全て満たされている

## 次のPhase

なし（本Phaseが最終Phase）。PRマージ後にタスク完了。
