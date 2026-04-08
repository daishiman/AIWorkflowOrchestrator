# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 6                                              |
| Phase名    | テスト拡充                                     |
| 前提Phase  | Phase 5                                        |
| 後続Phase  | Phase 7                                        |
| ステータス | completed                                      |
| 作成日     | 2026-04-08                                     |
| 機能名     | ut-skill-wizard-w1-conversation-round-step-001 |

---

## 目的

エッジケース・回帰ガードを追加し、テストの網羅性を高める。
TC-15〜TC-19 を追加し、現在のテストファイルではページ戻り・inferenceLog 無視・snapshot を含む回帰ガードが入っている。

---

## 実行タスク

### タスク1: 追加テストケース（TC-15〜TC-19）の実装

**追加テストケース**:

| TC    | 対象                       | 入力・条件                                                                                     | 期待出力 / 動作                                                      |
| ----- | -------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| TC-15 | ページ 2 → ページ 1 に戻る | ページ 2 表示中に「前へ」ボタン押下でページ 1 に戻れるか（実装した場合）                       | ページ 1 の Q1〜Q3 が再表示される                                    |
| TC-16 | `inferenceLog` の無視      | `SmartDefaultResult.inferenceLog` が存在しても `buildInitialAnswers` がエラーにならないか      | `ConversationAnswers` が正常に返される（`inferenceLog` は無視）      |
| TC-17 | 全問未回答で完了           | 全質問未選択のまま「完了」を押した場合、`onComplete` が空回答で呼ばれるか                      | `onComplete` が全 `selectedOption: null` / `freeText: ""` で呼ばれる |
| TC-18 | 回答変更後の完了           | ページ 1 で Q1 を「チームメンバー」に変更 → ページ 2 へ遷移 → 「完了」で変更が反映されているか | `onComplete` の引数 `q1.selectedOption === "チームメンバー"`         |
| TC-19 | スナップショット           | ページ 1 のレンダリング結果のスナップショットテスト（回帰ガード）                              | スナップショットファイルと一致する                                   |

**実行手順**:

1. `ConversationRoundStep.test.tsx` に TC-15〜TC-19 を追加する
2. `pnpm vitest run` で TC-01〜TC-19 が全て PASS することを確認する

```bash
pnpm --filter @repo/desktop vitest run \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

---

### タスク2: 回帰ガードの確認

**目的**: Phase 5 の既存テスト（TC-01〜TC-14）が Phase 6 追加後も PASS することを確認する

**実行手順**:

1. TC-01〜TC-19 の全テストを実行して全 PASS を確認する
2. スナップショット（TC-19）が生成されていることを確認する

---

## 参照資料

| 資料名                              | パス                                                                                         | 説明                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 5 テストファイル（既存）      | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 追加対象のファイル           |
| Phase 2 設計（buildInitialAnswers） | `outputs/phase-2/design-decisions.md`                                                        | TC-16 の根拠（inferenceLog） |

---

## 成果物

| 成果物                 | 配置先                                                                                       | 形式           |
| ---------------------- | -------------------------------------------------------------------------------------------- | -------------- |
| 拡充済みテストファイル | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | TypeScript/TSX |
| テスト拡充結果サマリー | `outputs/phase-6/test-expansion-result.md`                                                   | Markdown       |

---

## 完了条件

- [ ] TC-15〜TC-19 がテストファイルに追加されている
- [ ] TC-01〜TC-19 が全て PASS している
- [ ] スナップショットファイル（TC-19）が生成されている
- [ ] `outputs/phase-6/` に全成果物が生成されていること

---

## 次Phase

**Phase 7: カバレッジ確認** — `ConversationRoundStep.tsx` の line/branch カバレッジを実測する。
