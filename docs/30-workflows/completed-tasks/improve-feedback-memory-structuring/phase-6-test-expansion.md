# Phase 6: テスト拡充

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| Phase    | 6                                        |
| タスクID | task-ut-p0-02-001-repeat-feedback-memory |
| 前Phase  | Phase 5: 実装                            |
| 次Phase  | Phase 7: カバレッジ確認                  |

---

## 目的

エッジケース・回帰テスト・fail path のテストを追加し、`ImproveFeedbackHistory` 導入による変更の品質を網羅的に検証する。

---

## 実行タスク

### タスク1: エッジケーステスト追加

`apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` に以下のエッジケーステストを追加する:

| EC ID | テストケース名                                                 | 前提条件                                      | 期待結果                                                                   |
| ----- | -------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| EC-01 | maxImproveRetry=1 の場合（履歴蓄積なしで loopExhausted）       | `maxImproveRetry = 1`, verify が fail         | `buildImproveFeedback` に空配列が渡され、1 回の improve 後に loopExhausted |
| EC-02 | improve が suggestions 空を返した場合の feedbackHistory の状態 | `improveSkill` が空の suggestions を返す      | feedbackHistory に `improveSummary: ""` のエントリが追加される             |
| EC-03 | applyImprovement の applied が 0 の場合                        | `applyImprovement` が `{ applied: 0 }` を返す | feedbackHistory は蓄積されるが、次の verify でも同じチェックが失敗する     |
| EC-04 | verifySkill が例外を投げた場合                                 | `verifySkill` が `throw new Error(...)` する  | 例外が適切にハンドリングされ、feedbackHistory の状態が破壊されない         |

---

### タスク2: 回帰テスト

既存テストが Phase 5 の実装変更後も引き続き PASS であることを確認する:

| RT ID | テストケース名                                        | 確認内容                                                        |
| ----- | ----------------------------------------------------- | --------------------------------------------------------------- |
| RT-01 | 既存の 2 回ループテスト（L838-973）が引き続き PASS    | `previousImproveSummary` → `feedbackHistory` 変更後の互換性     |
| RT-02 | 初回 verify で全チェック PASS のテストが引き続き PASS | improve ループに入らないケースが影響を受けていないこと          |
| RT-03 | warning のみで improve のテストが引き続き PASS        | warning レベルのチェック結果が feedbackHistory に影響しないこと |

```bash
pnpm --filter @repo/desktop exec vitest run RuntimeSkillCreatorFacade.test.ts
```

全既存テストが PASS であることを確認する。

---

### タスク3: buildImproveFeedback 単体テスト拡充

`buildImproveFeedback` 関数の単体テストを拡充する:

| BF ID | テストケース名                                 | 入力                                                                              | 期待結果                                                            |
| ----- | ---------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| BF-01 | 空配列 → チェック結果のみ                      | `checks = [failedCheck]`, `history = []`                                          | チェック結果文字列のみ、「過去の改善試行履歴」セクションなし        |
| BF-02 | 1件履歴 → 「過去の改善試行履歴」セクション含む | `history = [{ attempt: 1, failedChecks: ["L2-SECTION"], improveSummary: "..." }]` | 「過去の改善試行履歴」セクションが含まれ、試行 1 の情報が出力される |
| BF-03 | 3件履歴 → 全試行が番号付きで出力               | `history = [{ attempt: 1, ... }, { attempt: 2, ... }, { attempt: 3, ... }]`       | 「試行 1」「試行 2」「試行 3」が全て番号付きで出力される            |
| BF-04 | failedChecks が空文字列の場合                  | `history = [{ attempt: 1, failedChecks: [], improveSummary: "..." }]`             | failedChecks が空でも構造が壊れずに出力される                       |

---

## 参照資料

| 参照資料                       | パス                                                                                        | 内容                          |
| ------------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 1 要件定義               | `phase-1-requirements.md`                                                                   | AC 定義、スコープ             |
| Phase 2 設計                   | `phase-2-design.md`                                                                         | 型設計、プロンプト設計        |
| Phase 3 設計レビュー           | `phase-3-design-review.md`                                                                  | MINOR 追跡テーブル            |
| Phase 4 テスト作成             | `phase-4-test-creation.md`                                                                  | TC-01〜TC-06 テストケース設計 |
| Phase 5 実装                   | `phase-5-implementation.md`                                                                 | 実装詳細                      |
| RuntimeSkillCreatorFacade 仕様 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | Facade の責務・統合仕様       |

---

## 成果物

| 成果物             | パス                                      | 状態    |
| ------------------ | ----------------------------------------- | ------- |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md`（本ファイル） | pending |

---

## 完了条件

- [ ] タスク1: EC-01（maxImproveRetry=1）テストを追加し PASS
- [ ] タスク1: EC-02（suggestions 空）テストを追加し PASS
- [ ] タスク1: EC-03（applied=0）テストを追加し PASS
- [ ] タスク1: EC-04（verifySkill 例外）テストを追加し PASS
- [ ] タスク2: RT-01 既存 2 回ループテスト（L838-973）が PASS
- [ ] タスク2: RT-02 初回 verify 全チェック PASS テストが PASS
- [ ] タスク2: RT-03 warning のみテストが PASS
- [ ] タスク3: BF-01（空配列）テストを追加し PASS
- [ ] タスク3: BF-02（1件履歴）テストを追加し PASS
- [ ] タスク3: BF-03（3件履歴）テストを追加し PASS
- [ ] タスク3: BF-04（failedChecks 空）テストを追加し PASS
- [ ] 全テスト実行で既存テスト含め全 PASS を確認

---

## タスク100%実行確認【必須】

Phase 6 の全タスク（エッジケーステスト EC-01〜EC-04、回帰テスト RT-01〜RT-03、buildImproveFeedback 単体テスト BF-01〜BF-04）を100%実行し完遂すること。

---

## 次Phase

Phase 7: カバレッジ確認 — テストカバレッジを測定し、未カバー行を特定する。

**Phase 6 完了前に Phase 7 へ進まないこと。**
