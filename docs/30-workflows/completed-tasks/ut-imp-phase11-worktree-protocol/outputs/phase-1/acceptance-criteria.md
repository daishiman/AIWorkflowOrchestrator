# Phase 1: 受入基準一覧（AC）

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| タスクID | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001 |
| Phase    | 1                                    |
| 作成日   | 2026-03-01                           |

## 受入基準テーブル

| ID    | 受入基準                                                                                                                          | 対応要件    | テスト方法                       | 判定基準                    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------- | --------------------------- |
| AC-01 | Worktree Phase 11プロトコル文書がLayer 1（自動テスト）、Layer 2（静的コード検証）、Layer 3（UI/E2E）の3層テスト戦略を定義している | FR-1        | ドキュメントレビュー             | 3層が全て定義されていること |
| AC-02 | apps/desktop/e2e/ipc-skill-remove.spec.tsが正常系1件・異常系3件の計4テストケースを含む                                            | FR-2        | playwright test実行              | 4テストケースが存在し全PASS |
| AC-03 | apps/desktop/e2e/ipc-skill-import.spec.tsが正常系1件・異常系3件の計4テストケースを含む                                            | FR-3        | playwright test実行              | 4テストケースが存在し全PASS |
| AC-04 | E2Eテストが\_electron.launch()でElectronアプリを起動し、page.evaluate()でIPC通信を検証している                                    | FR-2, FR-3  | テストコードレビュー             | パターン使用を確認          |
| AC-05 | E2EテストがP42準拠3段バリデーション（型チェック→空文字列→トリム空文字列）を検証している                                           | FR-2, FR-3  | テストコードレビュー             | 3段バリデーションテスト存在 |
| AC-06 | apps/desktop/playwright.config.tsにelectron-e2eプロジェクトが追加され、既存chromiumプロジェクトが破壊されていない                 | FR-4        | 設定ファイルレビュー             | 両プロジェクト共存          |
| AC-07 | .github/workflows/ci.ymlにe2e-desktopジョブが追加されている                                                                       | FR-5        | CI設定レビュー                   | ジョブ定義存在              |
| AC-08 | e2e-desktopジョブがapps/desktop/またはpackages/shared/の変更時のみ実行される（pathsフィルタ設定）                                 | FR-5        | CI設定レビュー                   | pathsフィルタ設定確認       |
| AC-09 | e2e-desktopジョブがxvfb-run --auto-servernumでElectronを起動する設定になっている                                                  | FR-5, NFR-5 | CI設定レビュー                   | xvfb-run設定確認            |
| AC-10 | Phase 11テンプレートに「Worktree環境テスト手順」セクションが存在し、Layer 1-3テスト手順と判定基準を含む                           | FR-6        | テンプレートレビュー             | セクション存在・内容確認    |
| AC-11 | deferred-tests-template.mdがテストケースID、スキップ理由、実行予定環境、期限、完了ステータスの記録欄を含む                        | FR-7        | テンプレートレビュー             | 全記録欄存在                |
| AC-12 | deferred-tests.mdの未完了項目0件がPhase 13完了条件に組み込まれている                                                              | FR-7        | テンプレートレビュー             | Phase 13連携記載確認        |
| AC-13 | E2Eテスト全体の実行時間がCI環境で60秒以内である                                                                                   | NFR-2       | CI実行時間計測                   | 60秒以内                    |
| AC-14 | CI環境で3回連続実行して全て同一結果である（フレイキーテスト0件）                                                                  | NFR-1       | 連続テスト実行                   | 3回とも同一結果             |
| AC-15 | テストヘルパー関数がapps/desktop/e2e/helpers/electron-app.tsに抽出されている                                                      | NFR-3       | ファイル存在確認・コードレビュー | ヘルパー関数3つ以上         |
| AC-16 | メインリポジトリでcd apps/desktop && pnpm exec playwright test --project=electron-e2eが全テストPASSする                           | NFR-4       | テスト実行                       | 全テストPASS                |

## AC分類サマリー

### 機能要件AC（AC-01〜AC-12）

- ドキュメント系: AC-01, AC-10, AC-11, AC-12
- テストコード系: AC-02, AC-03, AC-04, AC-05
- 設定ファイル系: AC-06, AC-07, AC-08, AC-09

### 非機能要件AC（AC-13〜AC-16）

- パフォーマンス: AC-13
- 信頼性: AC-14
- 保守性: AC-15
- 互換性: AC-16

## 検証フロー

Phase 10（最終レビュー）で全ACを検証:

1. コードレビューでAC-01〜AC-12を検証
2. テスト実行でAC-02, AC-03, AC-13, AC-14, AC-16を検証
3. ファイル存在確認でAC-06, AC-07, AC-15を検証

## 完了条件

- [ ] AC-01〜AC-16の16件が全て定義されている
- [ ] 各ACに対応するFR/NFRが明示されている
- [ ] 各ACに対するテスト方法と判定基準が具体的である
- [ ] 曖昧表現（「適切に」「必要に応じて」）が含まれていない
