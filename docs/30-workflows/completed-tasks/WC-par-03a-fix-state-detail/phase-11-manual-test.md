# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 11                           |
| Phase名    | 手動テスト                   |
| 対象機能   | TASK-SW-FIX-STATE-DETAIL-001 |
| 前提Phase  | Phase 10: 最終レビュー       |
| 次Phase    | Phase 12: ドキュメント更新   |
| ステータス | completed                    |
| タスク種別 | VISUAL                       |
| 作成日     | 2026-04-12                   |

## 目的

template モードのキャンセル導線を含む視覚変更を目視で確認しつつ、
internalAnswers リセット、q5 再計算、generationLockRef 解除の回帰を
自動検証と画面証跡の両方で固定する。

## 実行方針

1. Phase 11 着手前に `outputs/phase-11/phase11-capture-metadata.json` の `taskId` が
   `TASK-SW-FIX-STATE-DETAIL-001` と一致しているかを確認する。
2. `TC-03` から `TC-05` を UI 証跡対象として扱い、`screenshots/*.png` と
   `screenshot-coverage.md` を必ず残し、`validate-phase11-screenshot-coverage.js`
   で `TC-ID ↔ PNG` の対応を検証する。
3. 状態のみの回帰は `AUTO` として扱い、`manual-test-result.md` と
   `manual-test-report.md` で根拠を分けて記録する。
4. `discovered-issues.md` は 0 件でも作成し、`ui-sanity-visual-review.md` で
   UI 観点の所見を残す。

## テストケース

| TC-ID | 観点                            | 種別   | 前提条件                                   | 操作手順                | 期待結果                       |
| ----- | ------------------------------- | ------ | ------------------------------------------ | ----------------------- | ------------------------------ |
| TC-03 | template エラーのキャンセル表示 | VISUAL | template モードで error が発生している     | GenerateStep を表示する | キャンセルボタンが表示される   |
| TC-04 | template エラーの Step 0 遷移   | VISUAL | template モードで error が発生している     | キャンセルボタンを押す  | Step 0 に戻る                  |
| TC-05 | 通常モードの回帰                | VISUAL | non-template モードで error が発生している | GenerateStep を表示する | キャンセルボタンが表示されない |

## 自動検証

| TC-ID | 観点                     | 種別 | 前提条件                            | 操作手順          | 期待結果                                      |
| ----- | ------------------------ | ---- | ----------------------------------- | ----------------- | --------------------------------------------- |
| TC-01 | internalAnswers リセット | AUTO | Step 1 で回答入力済み               | retry を実行する  | `internalAnswers` が空値に戻る                |
| TC-02 | 不要リセット回避         | AUTO | 通常フローで `answers` が変化しない | Step 1 を継続する | `internalAnswers` が変化しない                |
| TC-06 | q5 再計算                | AUTO | q5 の回答を変更する                 | q5 を更新する     | `resolveExternalIntegration` が再計算される   |
| TC-07 | q1〜q4 での再計算抑止    | AUTO | q1〜q4 の回答を変更する             | q1〜q4 を更新する | `resolveExternalIntegration` が再計算されない |
| TC-08 | キャンセル時のロック解除 | AUTO | 生成処理中である                    | cancel する       | `generationLockRef.current` が `false` になる |
| TC-09 | キャンセル後の再実行     | AUTO | TC-08 実施後                        | 再度生成する      | 生成が開始できる                              |
| TC-10 | 正常完了時のロック解除   | AUTO | 生成を正常完了させる                | 生成を完了する    | `generationLockRef.current` が `false` になる |

## 画面カバレッジマトリクス

| TC-ID | 証跡                                                                                   | 判定       | 備考                                              |
| ----- | -------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------- |
| TC-03 | `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-03-template-error-cancel.png`  | SCREENSHOT | template エラーでキャンセルボタンが表示される状態 |
| TC-04 | `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-04-template-error-step0.png`   | SCREENSHOT | キャンセル後に Step 0 に戻った状態                |
| TC-05 | `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-05-normal-error-no-cancel.png` | SCREENSHOT | 非 template モードでキャンセルが非表示の状態      |

## 発見課題管理

| 重要度 | 発見課題         | 対応方針                                     | 関連TC |
| ------ | ---------------- | -------------------------------------------- | ------ |
| なし   | 現時点では未記録 | 0 件でも `discovered-issues.md` に結論を残す | -      |

## 参照資料

| 資料名                | パス                                                                          | 説明             |
| --------------------- | ----------------------------------------------------------------------------- | ---------------- |
| 要件定義              | `outputs/phase-1/requirements-definition.md`                                  | AC-1〜AC-5       |
| 設計書                | `outputs/phase-2/design-document.md`                                          | 修正方針         |
| 設計レビュー結果      | `outputs/phase-3/review-result.md`                                            | gate 判定        |
| テスト仕様書          | `outputs/phase-4/test-specifications.md`                                      | fail-first 対象  |
| 実装記録              | `outputs/phase-5/implementation-record.md`                                    | 変更箇所         |
| テスト拡充記録        | `outputs/phase-6/extended-test-record.md`                                     | 境界ケース       |
| カバレッジレポート    | `outputs/phase-7/coverage-report.md`                                          | 回帰観点         |
| リファクタリング記録  | `outputs/phase-8/refactoring-record.md`                                       | 最小変更の根拠   |
| 品質保証レポート      | `outputs/phase-9/quality-report.md`                                           | 4条件確認        |
| 最終レビュー結果      | `outputs/phase-10/final-review-result.md`                                     | 実施前の総合判定 |
| 生成ステップ          | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`          | 視覚変更対象     |
| Step 1 コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 状態回帰対象     |
| ウィザード実装        | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | 状態回帰対象     |

## 統合テスト連携

- `TC-01` / `TC-02` / `TC-06` / `TC-07` / `TC-08` / `TC-09` / `TC-10` は自動テストまたはログ検証で固定する。
- `TC-03` / `TC-04` / `TC-05` はスクリーンショットと UI レビューを必須とする。
- `screenshot-plan.json` と `phase11-capture-metadata.json` は TC-ID に対する証跡台帳として扱う。
- `validate-phase11-screenshot-coverage.js` で UI 証跡のカバレッジを検証する。

## 成果物

| 成果物                 | パス                                             | 説明                     |
| ---------------------- | ------------------------------------------------ | ------------------------ |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`         | TC 実施結果の正本        |
| 手動テストレポート     | `outputs/phase-11/manual-test-report.md`         | 実施概要と所見           |
| 発見課題一覧           | `outputs/phase-11/discovered-issues.md`          | 0 件でも出力必須         |
| 視覚レビュー           | `outputs/phase-11/ui-sanity-visual-review.md`    | Apple UI/UX 所見         |
| 撮影計画               | `outputs/phase-11/screenshot-plan.json`          | TC-ID と撮影対象の対応表 |
| 画面カバレッジレポート | `outputs/phase-11/screenshot-coverage.md`        | 100% 達成確認            |
| capture メタデータ     | `outputs/phase-11/phase11-capture-metadata.json` | evidence inventory       |

## 完了条件

- [ ] `phase11-capture-metadata.json` の `taskId` が現行タスク ID と一致している
- [ ] `TC-03` から `TC-05` の画面証跡が `screenshot-plan.json` と一致している
- [ ] `manual-test-result.md` / `manual-test-report.md` / `discovered-issues.md` / `ui-sanity-visual-review.md` が揃っている
- [ ] `screenshot-coverage.md` で UI 証跡の必須項目が 100% を満たしている
- [ ] `discovered-issues.md` が 0 件でも作成されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
