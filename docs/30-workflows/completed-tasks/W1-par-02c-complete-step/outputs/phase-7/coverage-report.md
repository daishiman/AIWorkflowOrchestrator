# Phase 7 成果物: カバレッジレポート仕様

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 7                                         |
| タスクID   | UT-SKILL-WIZARD-W1-par-02c                |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 作成日     | 2026-04-08                                |
| ステータス | pending（Phase 6 完了後に計測実行）       |

---

## カバレッジ計測コマンド

```bash
pnpm --filter @repo/desktop vitest run -- CompleteStep --coverage
```

---

## カバレッジ目標値

| 指標       | 目標値   | 理由                                    |
| ---------- | -------- | --------------------------------------- |
| Statements | 90% 以上 | 全ステートメントの網羅率                |
| Branches   | 85% 以上 | 条件分岐（三項演算子・if 含む）の網羅率 |
| Functions  | 100%     | 全関数の呼び出し確認                    |
| Lines      | 90% 以上 | 全行の実行確認                          |

---

## カバレッジ対象分岐チェックリスト

| 分岐条件                                        | 対応テスト         | Phase |
| ----------------------------------------------- | ------------------ | ----- |
| `hasExternalIntegration === true`               | T-17, T-27         | 4, 6  |
| `hasExternalIntegration === false`              | T-18               | 4     |
| `feedbackSubmitted === true` での二重クリック   | T-16               | 4     |
| `onExecuteNow === undefined` での `disabled`    | T-09, T-31         | 4, 6  |
| `onOpenInEditor === undefined` での `disabled`  | Phase 7 補完テスト | 7     |
| `onCreateAnother === undefined` での `disabled` | Phase 7 補完テスト | 7     |
| `onRetry === undefined` での 👎 クリック        | T-25               | 6     |
| `generatedSkill === null`                       | T-21               | 6     |
| `externalToolName === undefined`                | T-22               | 6     |

---

## Phase 7 補完テストケース（3 件）

Phase 6 までで未カバーが想定される分岐への補完テスト:

| TC#  | テスト名                                           | 検証内容                                                           |
| ---- | -------------------------------------------------- | ------------------------------------------------------------------ |
| T-35 | `onRetry` 未指定でも 👎 クリックがエラーにならない | `onRetry=undefined` で 👎 クリック → エラーなし（T-25 と同等確認） |
| T-36 | `onCreateAnother` 未指定でカードが `disabled`      | `data-testid="complete-step-action-create-another"` が `disabled`  |
| T-37 | `onOpenInEditor` 未指定でカードが `disabled`       | `data-testid="complete-step-action-open-editor"` が `disabled`     |

---

## 計測結果記入欄（Phase 5/6 完了後に記入）

| 指標       | 計測値 | 目標値   | 判定 |
| ---------- | ------ | -------- | ---- |
| Statements | -      | 90% 以上 | -    |
| Branches   | -      | 85% 以上 | -    |
| Functions  | -      | 100%     | -    |
| Lines      | -      | 90% 以上 | -    |

---

## 完了確認（Phase 5/6 完了後に更新）

- [ ] カバレッジが計測されている
- [ ] Statements 90% 以上を達成している
- [ ] Branches 85% 以上を達成している
- [ ] Functions 100% を達成している
- [ ] 未カバー箇所が特定・補完されている
- [ ] 補完後のテストが全て pass している
- [ ] 本 Phase 内の全タスクを 100% 実行完了
