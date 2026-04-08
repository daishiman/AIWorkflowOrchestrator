# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 10                                             |
| Phase名    | 最終レビューゲート                             |
| 前提Phase  | Phase 9                                        |
| 後続Phase  | Phase 11                                       |
| ステータス | completed                                      |
| 作成日     | 2026-04-08                                     |
| 機能名     | ut-skill-wizard-w1-conversation-round-step-001 |

---

## 目的

受入条件（AC-1〜AC-13）の充足確認を行う。
Phase 11 手動テストへの進行可否は NON_VISUAL 前提で別途判定する。
MINOR 問題は未タスク化して記録する。

---

## レビュー判定基準

| 判定     | 条件                   | 次のアクション             |
| -------- | ---------------------- | -------------------------- |
| PASS     | 全 AC が充足されている | Phase 11 へ進行            |
| MINOR    | 軽微な指摘あり         | 未タスク化後、Phase 11 へ  |
| MAJOR    | 重大な問題あり         | 影響範囲に応じて戻る       |
| CRITICAL | 致命的な問題あり       | Phase 1 へ戻りユーザー確認 |

---

## 実行タスク

### タスク1: 受入条件チェック（AC-1〜AC-13）

| AC    | 内容                                                                                                      | 判定   |
| ----- | --------------------------------------------------------------------------------------------------------- | ------ |
| AC-1  | `ConversationRoundStep` コンポーネントが `apps/desktop/src/renderer/components/skill/wizard/` に存在する  | 未確認 |
| AC-2  | Props として `smartDefaults` と `onComplete` を受け取る                                                   | 未確認 |
| AC-3  | 6問が「質問N/6」形式の進捗とともに表示される                                                              | 未確認 |
| AC-4  | ページ 1 に Q1〜Q3、ページ 2 に Q4〜Q6 が表示される                                                       | 未確認 |
| AC-5  | `smartDefaults` の各フィールドが初期値としてプリフィルされる                                              | 未確認 |
| AC-6  | `smartDefaults` フィールドが `null` の場合、空欄で表示される                                              | 未確認 |
| AC-7  | 「次へ」押下でページ 2 に遷移する                                                                         | 未確認 |
| AC-8  | 「完了」押下で `onComplete(answers)` が呼ばれる                                                           | 未確認 |
| AC-9  | `onComplete` に `ConversationAnswers` 型の回答データが渡される                                            | 未確認 |
| AC-10 | `pnpm --filter @repo/desktop typecheck` が PASS する                                                      | 未確認 |
| AC-11 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` が PASS する | 未確認 |
| AC-12 | ページ 1 の「戻る」ボタン押下で `onBack` が呼ばれる                                                       | 未確認 |
| AC-13 | `ConfigureStep.tsx` が削除され、`WizardOptions` 参照が `rg` で 0 件である                                 | 未確認 |

---

### タスク2: MINOR 指摘の未タスク化

**目的**: Phase 10 で発見した MINOR 問題を未タスクとして記録する

**未タスク候補（確認後に記入）**:

- Q3 スケジュール設定 UI の詳細実装（`scheduleConfig` フィールド）
- ページ 2 → ページ 1 の「前へ」ボタン（Phase 5 で最小実装の場合）
- アニメーション・トランジション効果
- `ConfigureStep.tsx` / `WizardOptions` の参照残り検出と修正

**実行手順**:

1. AC-1〜AC-13 を一つずつ確認し、PASS / FAIL を記録する
2. AC-13 は `rg` 実行結果（0 件）を記録する
3. CRITICAL 問題（AC FAIL）があれば対応 Phase へ差し戻す
4. MINOR 問題は `outputs/phase-10/ac-verification.md` に記録し、未タスク候補として保存する

---

## 参照資料

| 資料名               | パス                                                                          | 説明                                 |
| -------------------- | ----------------------------------------------------------------------------- | ------------------------------------ |
| Phase 9 品質検証結果 | `outputs/phase-9/quality-check-result.md`                                     | AC-10/11 の根拠                      |
| Phase 1 受入条件     | `outputs/phase-1/acceptance-criteria.md`                                      | AC 定義元                            |
| コンポーネント       | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | AC-1〜AC-9 / AC-12〜AC-13 の確認対象 |

**AC-13 確認コマンド**:

```bash
rg -n "ConfigureStep\\.tsx|WizardOptions" apps/desktop/src/renderer/components/skill/wizard apps/desktop/src/renderer/components/skill
```

`0 件` であることを確認し、ヒットした場合は Phase 5 へ差し戻す。

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Markdown |
| AC 充足確認      | `outputs/phase-10/ac-verification.md`     | Markdown |

---

## 完了条件

- [ ] AC-1〜AC-13 が全て PASS していること（または差し戻しが完了していること）
- [ ] AC-13 の機械検証結果（`rg` 0 件）が記録されていること
- [ ] MINOR 問題が未タスク候補として記録されていること
- [ ] Phase 11 への進行が承認されていること
- [ ] `outputs/phase-10/` に全成果物が生成されていること

---

## 戻り先決定基準

| 問題の種類       | 戻り先                |
| ---------------- | --------------------- |
| 要件の問題       | Phase 1（要件定義）   |
| 設計の問題       | Phase 2（設計）       |
| テスト設計の問題 | Phase 4（テスト）     |
| 実装の問題       | Phase 5（実装）       |
| 品質の問題       | Phase 8（リファクタ） |

---

## 次Phase

**Phase 11: 手動テスト（NON_VISUAL）** — automation evidence による証跡取得を行う。
