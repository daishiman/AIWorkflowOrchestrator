# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 10                                                |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 機能名     | notion-freetext-special-case-eliminate            |
| 前提Phase  | Phase 9                                           |
| 後続Phase  | Phase 11（PASS または MINOR）                     |
| 作成日     | 2026-04-15                                        |
| ステータス | completed                                         |

## 目的

Phase 1〜9 の全成果物を統合的にレビューし、受け入れ基準（AC-1〜AC-4）の充足を最終確認する。
PASS/MINOR/MAJOR の判定を行い、Phase 11 への進行可否を決定する。
MINOR 指摘は未タスク化し、MAJOR は戻りフェーズを確定する。
Phase 13 blocked 条件（ユーザー承認待ち）を明示する。

## 実行タスク

- 受け入れ基準最終チェック: AC-1〜AC-4 の全充足確認
- Phase横断レビュー: Phase 1〜9 の成果物一貫性確認
- MINOR/MAJOR 判定記録: 指摘事項の未タスク化判断
- Phase 11 進行判定: PASS/MINOR/MAJOR の最終決定

## 参照資料

| 資料名                    | パス                                                                          | 用途               |
| ------------------------- | ----------------------------------------------------------------------------- | ------------------ |
| Phase 1 要件定義          | `outputs/phase-1/requirements-definition.md`                                  | AC確認             |
| Phase 3 設計レビュー      | `outputs/phase-3/gate-decision.md`                                            | MINOR追跡確認      |
| Phase 9 品質保証          | `outputs/phase-9/quality-report.md`                                           | 品質ゲート結果確認 |
| ConversationRoundStep.tsx | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 最終コード確認     |
| skill-wizard-label-map.ts | `packages/shared/src/types/skill-wizard-label-map.ts`                         | 型拡張の確認       |

## 実行手順

### 1. 受け入れ基準最終チェック

| AC ID | 受け入れ基準                                                                                                   | 確認方法                                                                             | 判定      |
| ----- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------- |
| AC-1  | `createQuestionAnswer()` 内の `notion` ハードコード分岐が削除されている                                        | `grep -n "notion.*その他\|normalizedKey.*notion" ConversationRoundStep.tsx` が0件    | completed |
| AC-2  | `SEMANTIC_LABEL_MAP` の `q5` エントリに `notion` → `"その他"` かつ `freeText: "Notion"` の情報が統合されている | `QuestionSemanticLabelMap` 型拡張 + `SEMANTIC_LABEL_MAP.q5` の `notion` エントリ確認 | completed |
| AC-3  | `resolveLabelEntry()` が `freeText` を返し、`resolveSemanticLabel()` が既存文字列契約を維持する                | 既存テスト + 新規テスト（TC-01〜TC-18）が全PASS                                      | completed |
| AC-4  | `pnpm typecheck` が PASS する（型安全性が保たれている）                                                        | `pnpm typecheck` の結果確認                                                          | completed |

### 2. Phase横断成果物一貫性チェック

| Phase | 主な成果物                          | 一貫性確認項目                                                                | 判定      |
| ----- | ----------------------------------- | ----------------------------------------------------------------------------- | --------- |
| 1     | requirements-definition.md          | AC-1〜AC-4が仕様に反映されているか                                            | completed |
| 2     | design.md                           | `QuestionSemanticLabelMap` 型拡張 + `freeText` フィールド追加設計と一致するか | completed |
| 3     | gate-decision.md                    | MINOR指摘が追跡・解消されているか                                             | completed |
| 4     | テストコード（TC-01〜TC-12）        | shared の helper テストと desktop 回帰テストが対応しているか                  | completed |
| 5     | ConversationRoundStep.tsx（実装）   | notion ハードコード分岐削除 + resolveLabelEntry 参照が完了しているか          | completed |
| 5     | skill-wizard-label-map.ts（型拡張） | `QuestionSemanticLabelMap` の `freeText` 対応が実装されているか               | completed |
| 6     | テストコード（エッジケース追加分）  | エッジケースと backward compatibility が追加されているか                      | completed |
| 7     | coverage-report.md                  | カバレッジ目標達成（Line 80%+, Branch 60%+, Function 80%+）                   | completed |
| 8     | refactoring-log.md                  | 変更なし or Before/After記録済み                                              | completed |
| 9     | quality-report.md                   | 品質ゲート全項目PASS                                                          | completed |

### 3. 最終判定基準

| 判定     | 条件                                                                      | 戻り先・備考                                 |
| -------- | ------------------------------------------------------------------------- | -------------------------------------------- |
| PASS     | AC-1〜AC-4全充足 + Phase横断チェック全PASS                                | Phase 11 へ進む                              |
| MINOR    | 軽微な改善点あり（機能に影響なし・Phase 12 で解消可能）                   | Phase 11 へ進む（MINOR未タスク化を同時実施） |
| MAJOR    | AC充足不足 or 設計上の重大問題 or notion 分岐が残存 or 型安全性に問題あり | 問題のあるPhaseに戻る（通常は Phase 5 〜 8） |
| CRITICAL | 要件定義レベルの根本的な設計ミス or タスク全体の方向性が誤っている        | Phase 1 に戻る                               |

**Phase 13 blocked 条件（必須）**: Phase 10 が PASS または MINOR であっても、Phase 13（PR作成）はユーザーの明示的な承認がない限り blocked 状態を維持する。commit / push / PR 作成を Phase 12 完了後に自動実行してはならない。

### 4. MAJOR 判定時の戻り先判断マトリクス

| 問題の種類                                  | 戻り先  |
| ------------------------------------------- | ------- |
| notion 分岐の削除漏れ（コード残存）         | Phase 5 |
| `QuestionSemanticLabelMap` 型拡張の設計ミス | Phase 2 |
| テストカバレッジ不足（AC-3 不充足）         | Phase 6 |
| 型チェックエラー（AC-4 不充足）             | Phase 5 |
| カバレッジ目標未達                          | Phase 7 |
| リファクタリングで機能退行が発生            | Phase 8 |

### 5. MINOR指摘の未タスク化ルール

MINOR判定の指摘事項は以下の3ステップで未タスク化する:

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に未タスク参照リンクを追加

## 多角的チェック観点

| 観点              | 確認内容                                                                          |
| ----------------- | --------------------------------------------------------------------------------- |
| 後退テスト        | `resolveSemanticLabel()` と `ConversationRoundStep.test.tsx` の既存テストが全PASS |
| 型安全性          | `QuestionSemanticLabelMap` 拡張後も既存コードが型エラーを出さないこと             |
| 依存タスク影響    | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001 の成果物を正しく活用しているか |
| freeText 一貫性   | `notion` 以外の `freeText` 設定ケースへの影響がないか（スコープ内のみ変更）       |
| Issue#2089 CLOSED | 実装内容が Issue#2089 のクローズ理由と整合しているか                              |

## 統合テスト連携【必須】

| 判定項目           | 基準   | 結果      |
| ------------------ | ------ | --------- |
| AC-1〜AC-4 全充足  | PASS   | completed |
| Phase横断一貫性    | 全PASS | completed |
| 既存テスト後退なし | PASS   | completed |
| `pnpm typecheck`   | PASS   | completed |

## 成果物

| 成果物           | パス                                      | 説明                                       |
| ---------------- | ----------------------------------------- | ------------------------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PASS/MINOR/MAJOR判定・AC充足確認・指摘事項 |

## 完了条件

- [ ] AC-1〜AC-4が全て充足されていること
- [ ] Phase横断成果物の一貫性チェック完了
- [ ] 総合判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MAJOR/CRITICAL の場合は戻り先Phaseが明記されている
- [ ] MINOR指摘があれば未タスク化3ステップを実施済み
- [ ] Phase 13 blocked 条件が記録されている
- [ ] 最終レビュー結果（`outputs/phase-10/final-review-result.md`）が作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

- PASS / MINOR → Phase 11: 手動テスト
- MAJOR → 問題のあるPhaseに戻る（Phase 5〜8 のいずれか）
- CRITICAL → Phase 1: 要件定義に戻る
- Phase 13 は PASS/MINOR 後も blocked（ユーザー承認待ち）
