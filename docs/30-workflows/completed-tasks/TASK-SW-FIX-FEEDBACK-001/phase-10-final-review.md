# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 10                       |
| Phase名    | 最終レビューゲート       |
| タスクID   | TASK-SW-FIX-FEEDBACK-001 |
| 機能名     | TASK-SW-FIX-FEEDBACK-001 |
| 前提Phase  | Phase 9                  |
| 後続Phase  | Phase 11                 |
| 作成日     | 2026-04-14               |
| ステータス | pending                  |

## 目的

AC-1〜AC-5 が current facts によって満たされていることを最終確認し、workflow 文書と artifacts の整合を確認する。
Phase 1〜9 の成果物を統合レビューし、Phase 11（手動テスト）へ進めるかを判定する。

## 実行タスク

- Task 1: 受入条件チェック（AC-1〜AC-5）
- Task 2: 変更ファイル一覧との整合確認
- Task 3: テストケース対応表の最終確認
- Task 4: ブロッカー判定

## 参照資料

| 資料名               | パス                                                                 | 用途               |
| -------------------- | -------------------------------------------------------------------- | ------------------ |
| 要件定義             | `outputs/phase-1/requirements-definition.md`                         | AC-1〜AC-5定義確認 |
| 設計書               | `outputs/phase-2/design-document.md`                                 | 設計との整合確認   |
| 設計レビュー結果     | `outputs/phase-3/review-result.md`                                   | 方針確認           |
| テスト仕様           | `outputs/phase-4/test-specifications.md`                             | evidence 対応確認  |
| 実装記録             | `outputs/phase-5/implementation-record.md`                           | no-op / follow-up  |
| テスト拡充記録       | `outputs/phase-6/extended-test-record.md`                            | 境界ケース確認     |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                                 | カバレッジ達成確認 |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`                              | terminology 整流化 |
| 品質保証レポート     | `outputs/phase-9/quality-report.md`                                  | 品質ゲート結果確認 |
| current facts        | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 現行挙動確認       |
| current facts        | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | 現行 UI 確認       |

## 実行手順

### Task 1: 受入条件チェック（AC-1〜AC-5）

| AC ID | 受入条件                                                                                | 確認方法             | 判定    |
| ----- | --------------------------------------------------------------------------------------- | -------------------- | ------- |
| AC-1  | LLMモード成功パスで `fetchSkills()` が呼ばれ、その後 `selectSkillByName()` が続く       | TC-FEEDBACK-001 PASS | pending |
| AC-2  | `terminal_handoff` 時は `fetchSkills()` / `selectSkillByName()` が呼ばれない            | TC-FEEDBACK-002 PASS | pending |
| AC-3  | `skillPath = null` の場合、`CompleteStep` にエラーメッセージと retry UI が表示される    | TC-FEEDBACK-004 PASS | pending |
| AC-4  | `skillPath = null` の場合、成功ヘッダー（「スキルの骨格を生成しました」）が表示されない | TC-FEEDBACK-005 PASS | pending |
| AC-5  | `skillPath` が正常値の場合、従来通り成功ヘッダーと完了画面が表示される                  | TC-FEEDBACK-006 PASS | pending |

### Task 2: 変更ファイル一覧との整合確認

workflow 文書としての変更ファイルと、実際の差分が一致しているか確認する。

```bash
# 変更ファイルの確認（working tree）
git status --short

# workflow docs の差分確認
git diff --name-only
git diff -- docs/30-workflows/TASK-SW-FIX-FEEDBACK-001
```

**変更ファイル整合テーブル:**

| 仕様上の対象ファイル                                        | 修正内容                          | 実際に変更されたか | 判定    |
| ----------------------------------------------------------- | --------------------------------- | ------------------ | ------- |
| `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/index.md`       | current facts 同期 / scope 再定義 | pending            | pending |
| `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/phase-*.md`     | current contract / follow-up 分離 | pending            | pending |
| `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/artifacts.json` | Phase 状態と metadata の同期      | pending            | pending |

**スコープ外変更の確認:**

| 確認項目                            | 期待値   | 結果    |
| ----------------------------------- | -------- | ------- |
| app code の変更が混入していないか   | 変更なし | pending |
| 不要な依存関係の追加がないか        | 追加なし | pending |
| package.json への不要な変更がないか | 変更なし | pending |

### Task 3: テストケース対応表の最終確認

| テストID        | 対象ファイル            | 入力条件             | 期待結果                                     | 対応AC | Phase 9結果 | 最終判定 |
| --------------- | ----------------------- | -------------------- | -------------------------------------------- | ------ | ----------- | -------- |
| TC-FEEDBACK-001 | SkillLifecyclePanel.tsx | LLMモード成功        | fetchSkills / selectSkillByName が呼ばれる   | AC-1   | pending     | pending  |
| TC-FEEDBACK-002 | SkillLifecyclePanel.tsx | terminal_handoff     | fetchSkills / selectSkillByName が呼ばれない | AC-2   | pending     | pending  |
| TC-FEEDBACK-004 | CompleteStep.tsx        | `skillPath = null`   | エラーメッセージが表示される                 | AC-3   | pending     | pending  |
| TC-FEEDBACK-005 | CompleteStep.tsx        | `skillPath = null`   | 成功ヘッダーが表示されない                   | AC-4   | pending     | pending  |
| TC-FEEDBACK-006 | CompleteStep.tsx        | `skillPath` が正常値 | 成功ヘッダーが表示される                     | AC-5   | pending     | pending  |

**AC網羅性確認:**

| AC ID | 対応テストケース | テスト数 | 網羅判定 |
| ----- | ---------------- | -------- | -------- |
| AC-1  | TC-FEEDBACK-001  | 1件      | pending  |
| AC-2  | TC-FEEDBACK-002  | 1件      | pending  |
| AC-3  | TC-FEEDBACK-004  | 1件      | pending  |
| AC-4  | TC-FEEDBACK-005  | 1件      | pending  |
| AC-5  | TC-FEEDBACK-006  | 1件      | pending  |

### Task 4: ブロッカー判定

Phase 11 への進行を阻害する問題がないか最終確認する。

| ブロッカー候補              | 状況    | 重大度   |
| --------------------------- | ------- | -------- |
| AC未充足項目あり            | pending | CRITICAL |
| テストケース未PASS          | pending | MAJOR    |
| 変更ファイル整合不一致      | pending | MAJOR    |
| 品質ゲート未通過（Phase 9） | pending | MAJOR    |
| スコープ外変更あり          | pending | MINOR    |
| follow-up 候補の混入        | pending | MINOR    |

## レビュー結果判定テーブル

| 判定     | 条件                     | 次のアクション                                  |
| -------- | ------------------------ | ----------------------------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 11 へ進行                                 |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 11 へ（未タスク化を同時実施） |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る                            |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認                      |

## 戻り先決定基準テーブル

| 問題の種類                     | 重大度   | 戻り先   | 理由                                 |
| ------------------------------ | -------- | -------- | ------------------------------------ |
| 要件定義の不備・AC定義の曖昧さ | CRITICAL | Phase 1  | 要件から再定義が必要                 |
| 設計上の重大な問題             | MAJOR    | Phase 2  | 設計修正後、レビュー以降を再実行     |
| テスト設計の不備               | MAJOR    | Phase 4  | テストケース修正後、実装確認を再実行 |
| docs-only 方針の不整合         | MAJOR    | Phase 1  | current facts の再整理が必要         |
| リファクタリング起因の問題     | MAJOR    | Phase 8  | リファクタ修正後、品質保証を再実行   |
| 品質ゲート未通過               | MAJOR    | Phase 9  | 品質問題修正後、再判定               |
| 軽微なコメント・命名改善       | MINOR    | Phase 11 | 未タスク化して次Phaseへ進行          |
| ドキュメントの不備             | MINOR    | Phase 12 | ドキュメント更新Phaseで対応          |

## 統合テスト連携【必須】

最終レビューで current facts と evidence の対応を確認する。

| 判定項目                      | 基準    | 結果    |
| ----------------------------- | ------- | ------- |
| AC-1〜AC-5 全充足             | PASS    | pending |
| TC-FEEDBACK-001〜005 全件PASS | 5件PASS | pending |
| 変更ファイル整合一致          | PASS    | pending |
| Phase横断一貫性               | 全PASS  | pending |

## 成果物

| 成果物           | パス                                      | 説明                                                      |
| ---------------- | ----------------------------------------- | --------------------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PASS/MINOR/MAJOR/CRITICAL判定・AC充足確認・ブロッカー判定 |

## 完了条件

- [ ] AC-1〜AC-5 が全て充足されていること
- [ ] 変更ファイル一覧と workflow docs の整合が確認済み
- [ ] TC-FEEDBACK-001〜005 と AC-1〜AC-5 の対応が正確であること
- [ ] ブロッカー判定完了（ブロッカーなし or 対応方針決定済み）
- [ ] 総合判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MINOR指摘があれば未タスク化3ステップを実施済み
- [ ] 最終レビュー結果（`outputs/phase-10/final-review-result.md`）が作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 受入条件チェック（AC-1〜AC-5 各項目の検証結果記録）
2. 変更ファイル一覧との整合確認
3. テストケース対応表の最終確認（TC-FEEDBACK-001〜005 と AC-1〜AC-5）
4. ブロッカー判定
5. 総合判定（PASS/MINOR/MAJOR/CRITICAL）の記録
6. MINOR指摘の未タスク化（該当する場合）
7. 最終レビュー結果の作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 11: 手動テスト（PASS または MINOR の場合）
対象Phaseへ戻る（MAJOR/CRITICAL の場合 — 戻り先決定基準テーブルに従う）
