# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| Phase    | 4                                        |
| タスクID | task-ut-p0-02-001-repeat-feedback-memory |
| 前Phase  | Phase 3: 設計レビューゲート              |
| 次Phase  | Phase 5: 実装                            |

---

## 目的

`ImproveFeedbackHistory` を使った全履歴参照テストを Red 状態で作成する。テストは `ImproveFeedbackHistory` 型が未定義のためコンパイルエラー、またはアサーション失敗となる Red 状態を確認する。

---

## Step 0: P50 チェック

### 既存テストの確認

- `RuntimeSkillCreatorFacade.test.ts` の `verifyAndImproveLoop` テスト（L838-973）を確認する
- 2 回ループテストのパターン（mock 設定、アサーション構造）を把握する
- 既存テストが `previousImproveSummary` をどのように検証しているかを確認する

### 既存ユーティリティ重複検出

```bash
grep -rn "ImproveFeedbackHistory\|improveFeedbackHistory\|feedbackHistory" packages/ apps/ --include="*.ts"
```

既存に同名の型・変数がないことを確認し、新規テストが既存コードと衝突しないことを保証する。

---

## 実行タスク

### タスク1: 既存テスト確認

`apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` の verifyAndImproveLoop テスト（L838-973）を確認し、以下を把握する:

- テストの describe/it 構造
- mock の設定パターン（`verifySkill`, `improveSkill` のモック方法）
- `buildImproveFeedback` の呼び出しアサーションパターン
- 2 回ループテストで `previousImproveSummary` がどのように検証されているか

---

### タスク2: テストケース設計

以下のテストケースを設計する:

#### verifyAndImproveLoop 統合テスト

| TC ID | テストケース名                                                                                   | 前提条件                                          | 期待結果                                                                 |
| ----- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------ |
| TC-01 | 初回 improve で feedbackHistory が空のとき、buildImproveFeedback が履歴なしの feedback を返す    | 1 回目の verify が fail                           | `buildImproveFeedback` に空配列 `[]` が渡される                          |
| TC-02 | 2回目の improve で feedbackHistory に1件の履歴があり、その情報が feedback に含まれる             | 1 回目 verify fail → improve → 2 回目 verify fail | `buildImproveFeedback` に 1 件の `ImproveFeedbackHistory` が渡される     |
| TC-03 | 3回目の improve で feedbackHistory に2件の履歴があり、試行1・2の両方の情報が feedback に含まれる | 3 回ループ                                        | `buildImproveFeedback` に 2 件の履歴配列が渡され、試行 1・2 の情報を含む |
| TC-04 | maxImproveRetry 到達時に feedbackHistory が正しい件数蓄積されている                              | maxImproveRetry 回ループ                          | feedbackHistory の長さが maxImproveRetry - 1 と一致                      |

#### buildImproveFeedback 単体テスト

| TC ID | テストケース名                                                                    | 前提条件                                   | 期待結果                                   |
| ----- | --------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| TC-05 | buildImproveFeedback に空配列を渡すとチェック結果のみ返す（後方互換性）           | `history = []`                             | チェック結果文字列のみ、履歴セクションなし |
| TC-06 | buildImproveFeedback に複数履歴を渡すと「過去の改善試行履歴」セクションが含まれる | `history` に 2 件の ImproveFeedbackHistory | 「過去の改善試行履歴」セクションが含まれる |

---

### タスク3: テストファイル作成

`apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` にテストケースを追加する。

**Red 状態の確認**:

- `ImproveFeedbackHistory` が未定義のためコンパイルエラーとなる、または
- `buildImproveFeedback` のシグネチャが変更前のため引数型エラーとなる、または
- アサーションが失敗する（feedbackHistory 配列の代わりに string が渡されている）

**テスト追加方針**:

- 既存の `describe('verifyAndImproveLoop')` ブロック内に新しい `describe('feedback history accumulation')` を追加
- `buildImproveFeedback` のテストは同一ファイル内または `buildImproveFeedback.test.ts` に追加
- 既存テスト（L838-973）は変更しない（Phase 6 の回帰テスト対象）

---

## IPC レスポンス形式の事前合意

該当なし（IPC 変更なし）。本タスクは Main process 内の internal ロジック変更のみ。

---

## テスト対象ファイルの import 副作用チェック

`RuntimeSkillCreatorFacade.ts` のモジュールスコープ副作用を確認する:

- トップレベルの関数呼び出し（ファイル読み込み、DB 接続等）がないか
- テストで安全に import できるか
- 既存テストの mock パターンが新テストでも流用可能か

---

## 参照資料

| 参照資料                       | パス                                                                                        | 内容                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 1 要件定義               | `phase-1-requirements.md`                                                                   | AC 定義、スコープ                      |
| Phase 2 設計                   | `phase-2-design.md`                                                                         | 型設計、ループ変更設計、プロンプト設計 |
| Phase 3 設計レビュー           | `phase-3-design-review.md`                                                                  | レビュー結果、MINOR 追跡テーブル       |
| RuntimeSkillCreatorFacade 仕様 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | Facade の責務・統合仕様                |

---

## 成果物

| 成果物             | パス                                     | 状態    |
| ------------------ | ---------------------------------------- | ------- |
| テストケース設計書 | `phase-4-test-creation.md`（本ファイル） | pending |

---

## 完了条件

- [ ] Step 0: 既存テスト（L838-973）の構造を確認した
- [ ] Step 0: 既存ユーティリティとの重複がないことを確認した
- [ ] タスク1: 既存テストの mock パターンを把握した
- [ ] タスク2: TC-01〜TC-06 のテストケースを設計した
- [ ] タスク3: テストファイルにテストケースを追加した
- [ ] タスク3: Red 状態（コンパイルエラーまたはアサーション失敗）を確認した
- [ ] 既存テスト（L838-973）を変更していないことを確認した

---

## タスク100%実行確認【必須】

Phase 4 の全タスク（既存テスト確認、テストケース設計 TC-01〜TC-06、テストファイル作成、Red 状態確認）を100%実行し完遂すること。

---

## 次Phase

Phase 5: 実装 — `ImproveFeedbackHistory` 型定義と `verifyAndImproveLoop` 改修を実装し、Phase 4 のテストを Green にする。

**Phase 4 完了前に Phase 5 へ進まないこと。**
