# Phase 10: 最終レビュー - スキルウィザード複数選択対応

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| Phase      | 10                                |
| 機能名     | skill-wizard-multi-select-options |
| 前提 Phase | Phase 9                           |
| 後続 Phase | Phase 11                          |
| 作成日     | 2026-04-08                        |
| ステータス | pending                           |

## 目的

Phase 1〜9 の全成果物を統合レビューし、受け入れ基準 AC-01〜AC-13 との完全な照合を行う。
MAJOR 指摘が残存している場合は該当 Phase に差し戻す。PASS の場合は Phase 11（手動テスト）へ進む。

---

## 実行タスク

- **タスク1**: 受け入れ基準 AC-01〜AC-13 の最終照合
- **タスク2**: Phase 3 MINOR 指摘事項（M-01〜M-03）の解消確認
- **タスク3**: コードレビュー観点のチェック
- **タスク4**: PASS/FAIL 判定と戻り先の決定
- **タスク5**: 最終レビュー結果の記録

---

## 参照資料

| 資料名               | パス                                                                           | 説明                      |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------- |
| Phase 1 受け入れ基準 | `docs/30-workflows/skill-wizard-multi-select-options/phase-1-requirements.md`  | AC-01〜AC-13 の定義       |
| Phase 2 設計書       | `docs/30-workflows/skill-wizard-multi-select-options/phase-2-design.md`        | 設計方針・変更仕様        |
| Phase 3 設計レビュー | `docs/30-workflows/skill-wizard-multi-select-options/phase-3-design-review.md` | MINOR 指摘事項 M-01〜M-03 |
| Phase 9 品質保証結果 | `outputs/phase-9/quality-report.md`                                            | 品質ゲート最終結果        |

---

## 実行手順

### ステップ 1: 受け入れ基準 AC-01〜AC-13 の最終照合

```bash
# AC-01: selectedOptions に複数値を保持できるか（型定義確認）
grep -n "selectedOptions" \
  packages/shared/src/types/skillCreator.ts

# AC-02: トグル（選択解除）ロジックの実装確認
grep -n "filter.*option\|current\.includes" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# AC-03: 初期値が空配列であること
grep -n "selectedOptions: \[\]" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# AC-04 / AC-05 / AC-06: Q3 定期実行の includes 判定
grep -n 'selectedOptions\.includes.*定期実行' \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# AC-07 / AC-08: createQuestionAnswer の SmartDefaults 変換
grep -n "createQuestionAnswer\|selectedOptions: \[default" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# AC-09: aria-pressed の実装確認
grep -n "aria-pressed" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# AC-10: ApplySummaryCard の未回答判定と SmartDefault 表示
grep -n "getUnansweredDefaults\|smartDefaults" \
  apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx

# AC-11: TypeScript コンパイルエラーが 0 件
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck

# AC-12: ESLint エラーが 0 件
pnpm --filter @repo/desktop lint
pnpm --filter @repo/shared lint

# AC-13: resolveExternalIntegration の selectedOptions[0] 参照
grep -n "selectedOptions\[0\]" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

**受け入れ基準照合テーブル**:

| AC番号 | 基準                                                                                    | 判定 | 証拠               |
| ------ | --------------------------------------------------------------------------------------- | ---- | ------------------ |
| AC-01  | Q1〜Q6 で複数のボタンを同時に選択できる                                                 | [ ]  | ユニットテスト結果 |
| AC-02  | 選択済みボタンを再クリックすると選択が解除される                                        | [ ]  | ユニットテスト結果 |
| AC-03  | `selectedOptions` が空の状態から開始する                                                | [ ]  | 初期値 grep 結果   |
| AC-04  | Q3で「定期実行」を選択すると ScheduleConfigInput が展開される                           | [ ]  | ユニットテスト結果 |
| AC-05  | Q3から「定期実行」の選択を解除すると ScheduleConfigInput が閉じる                       | [ ]  | ユニットテスト結果 |
| AC-06  | Q3で「定期実行」と他の選択肢を同時選択した場合も ScheduleConfigInput が展開される       | [ ]  | ユニットテスト結果 |
| AC-07  | SmartDefaults 適用時、推論値が選択肢に含まれれば `selectedOptions: [value]` になる      | [ ]  | ユニットテスト結果 |
| AC-08  | SmartDefaults 適用時、推論値が選択肢に含まれなければ `freeText` に入る                  | [ ]  | ユニットテスト結果 |
| AC-09  | `aria-pressed` が選択状態に応じて `true`/`false` を返す                                 | [ ]  | DOM アサーション   |
| AC-10  | ApplySummaryCard で未回答設問に SmartDefault 値が表示され、回答済み設問では表示されない | [ ]  | ユニットテスト結果 |
| AC-11  | TypeScript コンパイルエラーが 0 件                                                      | [ ]  | typecheck 結果     |
| AC-12  | ESLint エラーが 0 件                                                                    | [ ]  | lint 結果          |
| AC-13  | `resolveExternalIntegration` が `selectedOptions[0]` を正しく参照する                   | [ ]  | ユニットテスト結果 |

---

### ステップ 2: Phase 3 MINOR 指摘事項（M-01〜M-03）の解消確認

| MINOR ID | 指摘内容                                                               | 対処方針                                                         | 解消状況 |
| -------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------- | -------- |
| M-01     | `resolveExternalIntegration` に先頭値参照の注釈を追加                  | コード内に「先頭値優先（複数選択対応は別タスク）」コメントを記述 | [ ]      |
| M-02     | 既存テストの `selectedOption` 参照を Phase 4 で洗い出し                | Phase 4 で全件確認・`selectedOptions` に更新済み                 | [ ]      |
| M-03     | `handleCronChange` / `handleTimezoneChange` のフォールバック設計を明記 | 自動追加ロジックにコメントを付与済み                             | [ ]      |

**確認方法**:

```bash
# M-01: 先頭値参照コメントの有無
grep -n "先頭値\|複数選択対応は別タスク" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# M-02: selectedOption（単数形）参照が残っていないこと
grep -rn "selectedOption[^s]" \
  apps/desktop/src/renderer/components/skill/wizard/ \
  packages/shared/src/

# M-03: handleCronChange / handleTimezoneChange のフォールバックコメント
grep -n "フォールバック\|定期実行.*includes" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
```

---

### ステップ 3: コードレビュー観点チェック

| 観点                               | チェック内容                                                                  | 判定 |
| ---------------------------------- | ----------------------------------------------------------------------------- | ---- |
| 型変更の完全移行                   | `selectedOption: string \| null` が残存していないこと                         | [ ]  |
| null チェックの除去                | `selectedOption !== null` 等の旧判定式が残っていないこと                      | [ ]  |
| トグルロジックのイミュータビリティ | `filter` + spread でイミュータブルに state を更新していること                 | [ ]  |
| Q3 特殊処理の一貫性                | `scheduleConfig` の展開・クリアが `includes("定期実行")` で統一されていること | [ ]  |
| `aria-pressed` の正確性            | 各ボタンが独立して `true`/`false` を保持していること（WCAG 2.1 SC 4.1.2）     | [ ]  |
| SmartDefaultResult 不変            | `SmartDefaultResult` の型（`string \| null`）が変更されていないこと           | [ ]  |
| `createQuestionAnswer` の変換      | `string → [string]` 変換が `createQuestionAnswer` 1箇所に集約されていること   | [ ]  |
| テスト網羅性                       | AC-01〜AC-13 に対応するテストケースが存在すること                             | [ ]  |
| 不要コードの除去                   | Phase 8 リファクタで旧 `selectedOption` 参照の残滓が除去されていること        | [ ]  |
| コメント品質                       | M-01・M-03 で求めたコメントが意図を明確に伝えていること                       | [ ]  |

---

### ステップ 4: PASS/FAIL 判定

| 判定          | 条件                                           | 戻り先                         |
| ------------- | ---------------------------------------------- | ------------------------------ |
| PASS          | AC-01〜AC-13 が全て ✅、コードレビュー問題なし | Phase 11 へ進む                |
| MINOR         | 軽微な指摘（コメント修正など）                 | Phase 11 継続・Phase 12 で解決 |
| MAJOR: 実装   | AC-01〜AC-10, AC-13 のいずれかが ❌            | Phase 5 へ戻る                 |
| MAJOR: テスト | AC-01〜AC-10 のテストが ❌                     | Phase 4/6 へ戻る               |
| MAJOR: 型     | AC-11 が ❌（TypeScript コンパイルエラーあり） | Phase 5 へ戻る                 |
| MAJOR: 品質   | AC-12 が ❌（ESLint エラーあり）               | Phase 8 へ戻る                 |
| CRITICAL      | 要件の根本的問題（型設計の再考が必要など）     | Phase 1/2 へ戻る               |

---

## サブタスク管理

| ID     | タスク名                           | ステータス |
| ------ | ---------------------------------- | ---------- |
| T-10-1 | 受け入れ基準 AC-01〜AC-13 照合     | 未実施     |
| T-10-2 | MINOR 指摘事項 M-01〜M-03 解消確認 | 未実施     |
| T-10-3 | コードレビュー観点チェック         | 未実施     |
| T-10-4 | PASS/FAIL 判定                     | 未実施     |
| T-10-5 | 最終レビュー結果記録               | 未実施     |

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Markdown |
| AC 検証記録      | `outputs/phase-10/ac-verification.md`     | Markdown |
| MINOR 解消確認   | `outputs/phase-10/minor-resolution.md`    | Markdown |

---

## 完了条件

- [ ] AC-01〜AC-13 が全て ✅ であること
- [ ] MINOR 指摘事項 M-01〜M-03 が全て解消済みであること
- [ ] コードレビュー観点の全チェック項目が ✅ であること
- [ ] PASS/FAIL 判定が「PASS」であること
- [ ] `outputs/phase-10/final-review-result.md` に判定結果が記録されていること
- [ ] `outputs/phase-10/ac-verification.md` に AC-01〜AC-13 の証拠が記録されていること

---

## タスク 100%実行確認【必須】

- [ ] T-10-1: AC-01〜AC-13 の照合を実行し `outputs/phase-10/ac-verification.md` に記録済み
- [ ] T-10-2: MINOR 指摘事項 M-01〜M-03 の解消確認を実行し結果を記録済み
- [ ] T-10-3: コードレビュー観点チェックを実行し結果を記録済み
- [ ] T-10-4: PASS/FAIL 判定を確定し `outputs/phase-10/final-review-result.md` に記録済み
- [ ] T-10-5: 最終レビュー結果サマリを記録済み

---

## 次 Phase

**Phase 11: 手動テスト** — デスクトップアプリで複数選択 UI の動作を手動確認する。

**Phase 11 開始条件**: Phase 10 の判定が「PASS」または「MINOR」であること。
**Phase 13 blocked 条件**: MAJOR 判定が残存している場合は PR 作成不可。
