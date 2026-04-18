# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 10                                                           |
| タスクID   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001                    |
| 機能名     | SkillCreateWizard LLM生成テスト describe.skip クリーンアップ |
| 前提Phase  | Phase 9                                                      |
| 後続Phase  | Phase 11（PASS または MINOR）                                |
| 作成日     | 2026-04-16                                                   |
| ステータス | pending                                                      |

## 目的

Phase 1〜9 の全成果物を統合的にレビューし、受け入れ基準（AC-1〜AC-5）の充足を最終確認する。
PASS/MINOR/MAJOR の判定を行い、Phase 11 への進行可否を決定する。
MINOR 指摘は未タスク化し、MAJOR は戻りフェーズを確定する。
Phase 13 blocked 条件（ユーザー承認待ち）を明示する。

## 実行タスク

- 受け入れ基準最終チェック: AC-1〜AC-5 の全充足確認
- Phase 横断レビュー: Phase 1〜9 の成果物一貫性確認
- MINOR/MAJOR 判定記録: 指摘事項の未タスク化判断
- Phase 11 進行判定: PASS/MINOR/MAJOR の最終決定

## 参照資料

| 資料名               | パス                                                                                             | 用途                       |
| -------------------- | ------------------------------------------------------------------------------------------------ | -------------------------- |
| Phase 1 要件定義     | `outputs/phase-1/requirements-definition.md`                                                     | AC確認                     |
| Phase 3 設計レビュー | `outputs/phase-3/gate-decision.md`                                                               | MINOR追跡確認              |
| Phase 9 品質保証     | `outputs/phase-9/qa-results.md`                                                                  | 品質ゲート結果確認         |
| 対象テストファイル   | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | 削除済み確認・残存参照確認 |

## 実行手順

### 1. 受け入れ基準最終チェック

| AC ID | 受け入れ基準                                                                             | 確認方法                                                                                                                                                                                                                                                                            | 判定    |
| ----- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| AC-1  | `describe.skip` 状態のテストが 0 件になっている（削除または書き直し済み）                | `if test -e apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx; then grep -r "describe\.skip" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx; else echo "N/A: target file deleted"; fi` | pending |
| AC-2  | 選択肢B を採用した場合、新フロー用エッジケーステストが追加されている（選択肢A 時は N/A） | 追加済みテストの件数・内容確認                                                                                                                                                                                                                                                      | pending |
| AC-3  | `pnpm --filter @repo/desktop test:run` が PASS する                                      | テスト全件 PASS 確認                                                                                                                                                                                                                                                                | pending |
| AC-4  | `pnpm --filter @repo/desktop typecheck` が PASS する                                     | 型チェック結果確認                                                                                                                                                                                                                                                                  | pending |
| AC-5  | `TODO(W2-seq-03a)` コメントが削除されている                                              | `grep -r "TODO(W2-seq-03a)" apps/desktop/src/` が 0 件（対象ファイル削除済みなら N/A を許容）                                                                                                                                                                                       | pending |

### 2. Phase 横断成果物一貫性チェック

| Phase | 主な成果物                         | 一貫性確認項目                                                                   | 判定    |
| ----- | ---------------------------------- | -------------------------------------------------------------------------------- | ------- |
| 1     | requirements-definition.md         | AC-1〜AC-5 が仕様に反映されているか                                              | pending |
| 2     | design.md                          | 選択肢A（削除）または選択肢B（書き直し）の設計方針と実装が一致しているか         | pending |
| 3     | gate-decision.md                   | MINOR 指摘が追跡・解消されているか                                               | pending |
| 4     | テストコード（クリーンアップ分）   | `describe.skip` が存在しないことが確認できるか、または対象ファイル削除済みか     | pending |
| 5     | 実装ファイル（テストファイル）     | 選択肢B採用時の新フロー用エッジケーステストが追加されているか（選択肢A時は N/A） | pending |
| 6     | テストコード（エッジケース追加分） | エッジケースと後退確認が追加されているか                                         | pending |
| 7     | coverage-report.md                 | カバレッジ目標達成（選択肢B採用時）                                              | pending |
| 8     | refactoring-log.md                 | 変更なし or Before/After 記録済み                                                | pending |
| 9     | qa-results.md                      | 品質ゲート全項目 PASS                                                            | pending |

### 3. 最終判定基準

| 判定     | 条件                                                               | 戻り先・備考                                   |
| -------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| PASS     | AC-1〜AC-5 全充足 + Phase 横断チェック全 PASS                      | Phase 11 へ進む                                |
| MINOR    | 軽微な改善点あり（機能に影響なし・Phase 12 で解消可能）            | Phase 11 へ進む（MINOR 未タスク化を同時実施）  |
| MAJOR    | AC 充足不足 or `describe.skip` 残存 or テスト失敗 or 型エラーあり  | 問題のある Phase に戻る（通常は Phase 4 〜 8） |
| CRITICAL | 要件定義レベルの根本的な設計ミス or タスク全体の方向性が誤っている | Phase 1 に戻る                                 |

**Phase 13 blocked 条件（必須）**: Phase 10 が PASS または MINOR であっても、Phase 13（PR 作成）はユーザーの明示的な承認がない限り blocked 状態を維持する。commit / push / PR 作成を Phase 12 完了後に自動実行してはならない。

### 4. MAJOR 判定時の戻り先判断マトリクス

| 問題の種類                                    | 戻り先  |
| --------------------------------------------- | ------- |
| `describe.skip` の削除漏れ（コード残存）      | Phase 4 |
| `TODO(W2-seq-03a)` コメントの削除漏れ         | Phase 4 |
| 新フロー用エッジケーステスト未追加（選択肢B） | Phase 5 |
| テスト失敗（AC-3 不充足）                     | Phase 4 |
| 型チェックエラー（AC-4 不充足）               | Phase 4 |
| カバレッジ目標未達（選択肢B採用時）           | Phase 6 |
| リファクタリングで機能退行が発生              | Phase 8 |

### 5. MINOR 指摘の未タスク化ルール

MINOR 判定の指摘事項は以下の 3 ステップで未タスク化する:

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に未タスク参照リンクを追加

## 多角的チェック観点

| 観点          | 確認内容                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 後退テスト    | `SkillCreateWizard.llm-generation.test.tsx` の既存テストが全 PASS であること、または対象ファイル削除済みで後退なしであること |
| 型安全性      | クリーンアップ後も既存コードが型エラーを出さないこと                                                                         |
| スコープ遵守  | テストファイル削除済み前提でも、プロダクションコードに影響がないこと                                                         |
| AC-2 条件確認 | 選択肢A（削除）採用時は AC-2 が N/A であることを明示していること                                                             |
| describe.skip | プロジェクト内の他テストファイルへの副作用がないこと                                                                         |

## 統合テスト連携【必須】

| 判定項目           | 基準   | 結果    |
| ------------------ | ------ | ------- |
| AC-1〜AC-5 全充足  | PASS   | pending |
| Phase 横断一貫性   | 全PASS | pending |
| 既存テスト後退なし | PASS   | pending |
| `pnpm typecheck`   | PASS   | pending |

## 成果物

| 成果物           | パス                               | 説明                                         |
| ---------------- | ---------------------------------- | -------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review.md` | PASS/MINOR/MAJOR 判定・AC 充足確認・指摘事項 |

## 完了条件

- [ ] AC-1〜AC-5 が全て充足されていること
- [ ] Phase 横断成果物の一貫性チェック完了
- [ ] 総合判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MAJOR/CRITICAL の場合は戻り先 Phase が明記されている
- [ ] MINOR 指摘があれば未タスク化 3 ステップを実施済み
- [ ] Phase 13 blocked 条件が記録されている
- [ ] 最終レビュー結果（`outputs/phase-10/final-review.md`）が作成済み
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

- PASS / MINOR → Phase 11: 手動テスト
- MAJOR → 問題のある Phase に戻る（Phase 4〜8 のいずれか）
- CRITICAL → Phase 1: 要件定義に戻る
- Phase 13 は PASS/MINOR 後も blocked（ユーザー承認待ち）
