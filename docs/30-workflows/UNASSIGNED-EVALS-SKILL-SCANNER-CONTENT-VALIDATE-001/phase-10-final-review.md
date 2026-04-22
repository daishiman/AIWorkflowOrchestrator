# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 10                                                  |
| タスクID   | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 |
| 機能名     | evals-skill-scanner-content-validate                |
| 前提Phase  | Phase 9                                             |
| 後続Phase  | Phase 11                                            |
| 作成日     | 2026-04-21                                          |
| ステータス | pending                                             |

## 目的

全 Phase の成果物を総合的にレビューし、acceptance criteria と blocker を判定する最終ゲート。PR 作成に進める状態かを最終確認する。

## 受け入れ基準チェックリスト

### Issue #2329 要求事項の全網羅確認

- [ ] AC-1: `SkillScanner.ts` が EVALS.json の**内容**をバリデーションするフックを持つ
- [ ] AC-2: 空 `{}` の EVALS.json をスキャンした場合、invalid 扱いとなりリストに載らない（または警告付き）
- [ ] AC-3: 破損 JSON（パースエラー）の EVALS.json をスキャンした場合、適切なエラーを返す
- [ ] AC-4: 必須キー欠落の EVALS.json をスキャンした場合、バリデーション失敗として扱う
- [ ] AC-5: camelCase / snake_case 両言語を許容するポリシーがコード内コメントとして明記されている
- [ ] AC-6: 既存3テスト（with-evals / with-all-others / with-sized-evals）が更新された契約に合わせて修正済み
- [ ] AC-7: 破損 EVALS を扱う新規テストケースが追加されている
- [ ] AC-8: バリデーション結果が既存の戻り値構造に正しく反映されている（型変更を含む）
- [ ] AC-9: `pnpm typecheck` がエラーなしで通過する
- [ ] AC-10: `pnpm lint` がエラーなしで通過する

### 品質ゲート

- [ ] 全テスト（既存 + 新規）が通過している
- [ ] カバレッジが維持または向上している
- [ ] コードレビューで設計上の問題がない
- [ ] パフォーマンスへの影響が許容範囲内である（バリデーション処理のオーバーヘッド）

## ゲート判定基準

| 判定                    | 条件                                                               |
| ----------------------- | ------------------------------------------------------------------ |
| PASS（Phase 11 に進む） | AC-1〜AC-10 全 PASS、全テスト通過、品質ゲート全通過                |
| MINOR（Phase 8 に戻る） | 軽微な問題（コメント不足・テスト補完など）あり、修正後に再レビュー |
| MAJOR（Phase 2 に戻る） | 設計上の問題（型設計の誤り・バリデーション方針の根本的な見直し）   |

## ブロッカー判定テーブル

| カテゴリ   | 確認項目                                  | 判定  |
| ---------- | ----------------------------------------- | ----- |
| 機能要件   | 空 JSON のバリデーション動作              | MAJOR |
| 機能要件   | 破損 JSON のパースエラーハンドリング      | MAJOR |
| 機能要件   | 必須キー欠落の検出                        | MAJOR |
| 設計方針   | camelCase/snake_case ポリシーのコメント化 | MINOR |
| テスト契約 | 既存3テストの更新状態                     | MAJOR |
| テスト追加 | 破損 EVALS 新規テストケースの存在確認     | MINOR |
| 型安全性   | バリデーション結果の型定義正確性          | MAJOR |
| 品質       | typecheck / lint 通過状態                 | MAJOR |

## 是正計画テーブル

| 問題                              | 優先度 | 対応方針                           | 担当 Phase |
| --------------------------------- | ------ | ---------------------------------- | ---------- |
| 空 JSON バリデーション未実装      | HIGH   | Phase 5 の実装を確認・修正         | Phase 5    |
| 破損 JSON パースエラー未処理      | HIGH   | try/catch と適切な型ガードの追加   | Phase 5    |
| camelCase/snake_case コメント不足 | MEDIUM | コード内コメントとして方針を明文化 | Phase 8    |
| 既存テストの契約更新漏れ          | HIGH   | Phase 6 のテスト拡充で対処         | Phase 6    |
| 破損 EVALS テストケース未追加     | MEDIUM | Phase 6 にて新規シナリオを追加     | Phase 6    |
| 型定義が any になっている場合     | HIGH   | 厳密な型定義に修正                 | Phase 8    |

## 出荷準備チェック（コミット可能状態の確認）

- [ ] `git status` がクリーンである（または commit 対象ファイルのみ変更されている）
- [ ] `pnpm --filter @repo/desktop typecheck` が通過している
- [ ] `pnpm --filter @repo/desktop lint` が通過している
- [ ] `pnpm --filter @repo/desktop test` が全通過している
- [ ] 変更対象外ファイルへの誤った変更がない
  - `fixture EVALS.json`（snake_case → camelCase 移行は対象外）
  - UI 表示側のエラー文言ファイル（対象外）
  - runner/reporter 側の実装ファイル（対象外）

## 参照資料

| 資料名       | パス                                        | 用途           |
| ------------ | ------------------------------------------- | -------------- |
| 品質レポート | `outputs/phase-9/quality-report.md`         | Phase 9 成果物 |
| リスク台帳   | `outputs/phase-9/risk-register.md`          | Phase 9 成果物 |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| テスト結果   | `outputs/phase-6/test-expansion-result.md`  | Phase 6 成果物 |

## 成果物

| 成果物           | パス                                              | 説明                                                    |
| ---------------- | ------------------------------------------------- | ------------------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | AC 確認・品質ゲート結果のサマリー                       |
| 是正計画         | `outputs/phase-10/remediation-plan.md`            | 発見された問題と対応方針の一覧                          |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | PR 作成前の最終チェックリスト（コミット可能状態の確認） |

## 完了条件

- [ ] AC-1〜AC-10 を全て確認した
- [ ] ゲート判定（PASS）を決定した
- [ ] ブロッカー判定テーブルを全項目確認した
- [ ] 出荷準備チェックを全項目確認した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] ゲート判定が PASS であることを確認
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 11: 手動テスト検証（ゲート PASS の場合）
