# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 10                                           |
| タスクID   | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001   |
| 機能名     | runCreateWorkflow-to-generateSkillMd-connect |
| 前提Phase  | Phase 9                                      |
| 後続Phase  | Phase 11（PASS または MINOR）                |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

PR 提出前の最終品質ゲートを通過する。
Phase 1〜9 の全成果物を統合的にレビューし、受け入れ基準（AC-1〜AC-5）の充足を最終確認する。
PASS / MINOR / MAJOR / CRITICAL の判定を行い、Phase 11 への進行可否を決定する。

**このPhaseはレビューゲートである。**

## 実行タスク

### タスク1: 設計レビュー

Phase 1 の AC-1〜AC-5 が全て達成されているか確認する。

| AC ID | 受け入れ基準                                                      | 確認方法                                                                                          | 判定 |
| ----- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---- |
| AC-1  | `runCreateWorkflow` の戻り値が呼び出し側で受け取られている        | `SkillCreatorService.ts` で `structurePlan = await runCreateWorkflow(...)` 等の代入文が存在する   | -    |
| AC-2  | `structurePlan` が null でない場合に `generateSkillMd` が呼ばれる | `if (structurePlan)` ブロック内に `generateSkillMd(skillDir, structurePlan)` の呼び出しが存在する | -    |
| AC-3  | `structurePlan` が null の場合はエラーログを出力してスキップする  | else 節または null の場合に `logger.error` 等のエラーログ出力が存在する                           | -    |
| AC-4  | `void structurePlan;` が削除されている                            | `grep -n "void structurePlan" SkillCreatorService.ts` が 0 件                                     | -    |
| AC-5  | 接続後の統合テストが追加されており、既存テストが全て PASS する    | `pnpm --filter @repo/desktop test` が全件 PASS                                                    | -    |

```bash
# AC-4 確認
grep -n "void structurePlan" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts
# 期待: 出力なし（削除済み）

# AC-2 / AC-3 確認
grep -n "generateSkillMd\|structurePlan\|if.*structurePlan\|logger.error" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

### タスク2: コードレビュー

- `SkillCreatorService.ts` の変更箇所のレビュー
  - `if (structurePlan)` ブロックの実装が設計通りか確認
  - エラーログの出力が適切か確認
  - `generateSkillMd(skillDir, structurePlan)` の引数渡しが正しいか確認
- テストコードの品質確認
  - 統合テストが「接続後の動作」を実際に検証しているか
  - モック・スタブの使用が適切か

### タスク3: 統合テスト最終確認

- create モードの end-to-end フロー確認
- TASK-SC-FIX-GENERATE-SKILL-MD-001 との統合動作確認

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 型チェック最終確認
pnpm --filter @repo/desktop typecheck
```

## レビュー結果判定

| 判定     | 条件                                       | 次のアクション             |
| -------- | ------------------------------------------ | -------------------------- |
| PASS     | 全レビュー観点で問題なし                   | Phase 11 へ進行            |
| MINOR    | 軽微な指摘あり（機能に影響なし）           | 指摘対応後、Phase 11 へ    |
| MAJOR    | 重大な問題あり（AC 未充足・型エラー等）    | 影響範囲に応じて戻る       |
| CRITICAL | 致命的な問題あり（要件レベルの設計ミス等） | Phase 1 へ戻りユーザー確認 |

## 戻り先決定基準

| 問題の種類       | 戻り先                      |
| ---------------- | --------------------------- |
| 要件の問題       | Phase 1（要件定義）         |
| 設計の問題       | Phase 2（設計）             |
| テスト設計の問題 | Phase 4（テスト）           |
| 実装の問題       | Phase 5（実装）             |
| 品質の問題       | Phase 8（リファクタリング） |

**Phase 13 blocked 条件（必須）**: Phase 10 が PASS または MINOR であっても、Phase 13（PR作成）はユーザーの明示的な承認がない限り blocked 状態を維持する。commit / push / PR 作成を Phase 12 完了後に自動実行してはならない。

## 参照資料

| 資料名                       | パス                                                          | 用途               |
| ---------------------------- | ------------------------------------------------------------- | ------------------ |
| Phase 1 要件定義             | `outputs/phase-1/spec-extraction-map.md`                      | AC 確認            |
| Phase 2 設計書               | `outputs/phase-2/design-doc.md`                               | 設計レビュー       |
| Phase 9 品質保証             | `outputs/phase-9/quality-check-result.md`                     | 品質ゲート結果確認 |
| 対象実装ファイル             | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 最終コード確認     |
| 変更内容・判断理由の記録     | `outputs/phase-5/implementation-notes.md`                     | Phase 5 成果物     |
| Phase7カバレッジ確認結果     | `outputs/phase-7/coverage-check-result.md`                    | Phase 7 成果物     |
| Phase8リファクタリングノート | `outputs/phase-8/refactoring-notes.md`                        | Phase 8 成果物     |

## 統合テスト連携【必須】

| 判定項目                                | 基準   | 結果 |
| --------------------------------------- | ------ | ---- |
| AC-1〜AC-5 全充足                       | PASS   | -    |
| Phase 横断一貫性                        | 全PASS | -    |
| 既存テスト後退なし                      | PASS   | -    |
| `pnpm --filter @repo/desktop typecheck` | PASS   | -    |

## 多角的チェック観点

| 観点           | 確認内容                                                             |
| -------------- | -------------------------------------------------------------------- |
| 後退テスト     | collaborative / orchestrate モードの既存テストが全 PASS していること |
| 型安全性       | `StructurePlanJson` 型の受け渡しが型エラーなしで成立していること     |
| 依存タスク影響 | TASK-SC-FIX-GENERATE-SKILL-MD-001 の成果物を正しく活用しているか     |
| Issue#2180     | 実装内容が Issue#2180 のクローズ理由と整合しているか                 |

## 成果物

| 成果物           | パス                                      | 説明                                         |
| ---------------- | ----------------------------------------- | -------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PASS/MINOR/MAJOR 判定・AC 充足確認・指摘事項 |

## 完了条件

- [ ] AC-1〜AC-5 が全て達成されていること
- [ ] Phase 横断成果物の一貫性チェック完了
- [ ] 総合判定（PASS / MINOR / MAJOR / CRITICAL）が記録されている
- [ ] MAJOR / CRITICAL の場合は戻り先 Phase が明記されている
- [ ] MINOR 指摘があれば未タスク化 3 ステップを実施済み
- [ ] Phase 13 blocked 条件が記録されている
- [ ] レビュー判定が PASS または MINOR 対応済み
- [ ] `outputs/phase-10/final-review-result.md` 作成済み
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. AC-1〜AC-5 最終チェック
2. コードレビュー（実装・テスト）
3. 統合テスト最終確認
4. レビュー判定記録
5. MINOR 指摘未タスク化（該当する場合）
6. 最終レビュー結果作成

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

- PASS / MINOR → Phase 11: 手動テスト
- MAJOR → 問題のあるPhaseに戻る
- CRITICAL → Phase 1: 要件定義に戻る
- Phase 13 は PASS/MINOR 後も blocked（ユーザー承認待ち）
