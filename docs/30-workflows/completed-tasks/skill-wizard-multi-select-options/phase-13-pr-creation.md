# Phase 13: PR 作成 - スキルウィザード複数選択対応

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 13                                                    |
| タスクID   | skill-wizard-multi-select-options                     |
| 機能名     | ConversationRoundStep 複数選択（selectedOptions）対応 |
| 前提Phase  | Phase 12（ドキュメント更新）                          |
| 後続Phase  | -                                                     |
| 作成日     | 2026-04-08                                            |
| ステータス | blocked（ユーザー承認待ち）                           |

## 目的

提出準備を完了し、**ユーザーの明示承認があった場合のみ** PR 作成へ進む（CONST_002）。
承認がない場合は `outputs/phase-13/pr-preparation.md` / `approval-checklist.md` / `pr-body.md` の作成で終了する。

---

## PR 提出差分サマリー

### ブランチ名

```
feat/skill-wizard-multi-select-options
```

### 変更ファイル

| ファイル                                                                      | 変更種別 | 概要                                                                                                          |
| ----------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                   | 変更     | `QuestionAnswer.selectedOption` → `selectedOptions: string[]`                                                 |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 変更     | トグル選択ロジック・`handleOptionSelect`・`isQuestionAnswered`・`createQuestionAnswer`・`renderQuestion` 更新 |
| `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`      | 変更     | 未回答判定を `selectedOptions.length === 0` に更新・`isQ5Unanswered` 更新                                     |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | 変更     | `DEFAULT_ANSWERS` 初期値・`resolveExternalIntegration` 先頭値参照に更新                                       |
| テストファイル群                                                              | 変更     | `selectedOption` 参照を `selectedOptions` に更新                                                              |

### 変更概要

1. `QuestionAnswer.selectedOption: string | null` を廃止し `selectedOptions: string[]` に置換
2. `ConversationRoundStep` の選択ロジックをトグル方式（`filter` + spread）に変更
3. Q3 定期実行展開条件を `selectedOptions.includes("定期実行")` に変更
4. `applySmartDefaults` 内 `createQuestionAnswer` で `string → [string]` 変換を実装
5. `ApplySummaryCard` の未回答判定を `selectedOptions.length === 0` に更新
6. `DEFAULT_ANSWERS` 初期値を `selectedOption: null` → `selectedOptions: []` に変更
7. `resolveExternalIntegration` を `selectedOptions[0] ?? ""` 先頭値参照に変更（注釈付き）
8. 関連テストの `selectedOption` 参照を `selectedOptions` に更新

**変更しないもの（OUT スコープ）:**

- `SmartDefaultResult` 型（`string | null` × 6 を維持）
- LLMプロンプト・バックエンド推論ロジック
- Step 0 / Step 2 / Step 3 コンポーネント
- IPC 型・永続化スキーマ

---

## PR タイトル

```
feat(skill-wizard): ConversationRoundStep 複数選択対応（selectedOptions）
```

---

## PR 本文テンプレート

```markdown
## 概要

スキル作成ウィザードの ConversationRoundStep（Q1〜Q6）の選択ボタンを、
単一選択（`selectedOption: string | null`）から複数選択（`selectedOptions: string[]`）に変更する。

ユーザーが「複数の利用者」「複数の入力形式」などを同時に指定できるようになり、
生成されるスキル骨格の精度が向上する。

## 変更内容

### 型変更

| 変更前                                          | 変更後                                     |
| ----------------------------------------------- | ------------------------------------------ |
| `QuestionAnswer.selectedOption: string \| null` | `QuestionAnswer.selectedOptions: string[]` |

`SmartDefaultResult` は `string \| null` × 6 を維持（LLMプロンプト変更の連鎖を防ぐため）。
`applySmartDefaults()` 内の `createQuestionAnswer()` で `string → [string]` 変換を吸収。

### UI 変更

- 各ボタンをクリックするたびに選択状態がトグル（追加/解除）される
- `aria-pressed` を各ボタンに個別付与（WCAG 2.1 AA 準拠）
- Q3「定期実行」の ScheduleConfigInput 展開条件を `selectedOptions.includes("定期実行")` に変更

### 設計決定

- `resolveExternalIntegration` は先頭値参照（`selectedOptions[0]`）を採用
  - 複数ツール並列統合は本タスクのスコープ外（コメント明記済み）

## テスト

- `pnpm --filter @repo/shared typecheck` エラー 0 件
- `pnpm --filter @repo/desktop typecheck` エラー 0 件
- `pnpm --filter @repo/desktop test` 全テスト Green
- `pnpm lint` エラー 0 件

## 受け入れ基準（Phase 1 AC-01〜AC-13 対応）

- [ ] AC-01: Q1〜Q6 で複数のボタンを同時に選択できる
- [ ] AC-02: 選択済みボタンを再クリックすると選択が解除される
- [ ] AC-03: `selectedOptions` が空配列の状態から開始する
- [ ] AC-04: Q3「定期実行」選択で ScheduleConfigInput が展開される
- [ ] AC-05: Q3「定期実行」解除で ScheduleConfigInput が閉じる
- [ ] AC-06: Q3「定期実行」と他の選択肢を同時選択しても展開維持
- [ ] AC-07: SmartDefaults 適用時、推論値が選択肢内なら `selectedOptions: [value]`
- [ ] AC-08: SmartDefaults 適用時、推論値が選択肢外なら `freeText` に入る
- [ ] AC-09: `aria-pressed` が選択状態に応じて `true`/`false` を返す
- [ ] AC-10: ApplySummaryCard で未回答問の SmartDefault 値が表示される
- [ ] AC-11: TypeScript コンパイルエラーが 0 件
- [ ] AC-12: ESLint エラーが 0 件
- [ ] AC-13: `resolveExternalIntegration` が `selectedOptions[0]` を正しく参照する

## 関連ドキュメント

- 要件定義: `docs/30-workflows/skill-wizard-multi-select-options/phase-1-requirements.md`
- 設計: `docs/30-workflows/skill-wizard-multi-select-options/phase-2-design.md`
- 設計レビュー: `docs/30-workflows/skill-wizard-multi-select-options/phase-3-design-review.md`
```

---

## レビュー観点

| 観点              | 確認内容                                                                  |
| ----------------- | ------------------------------------------------------------------------- |
| 型安全性          | `selectedOption` の残存参照がゼロであること（`pnpm typecheck` で確認）    |
| トグルロジック    | `filter` + spread でイミュータブルに state を更新していること             |
| Q3 特殊処理       | `selectedOptions.includes("定期実行")` による展開判定が正しく動作すること |
| SmartDefault 変換 | `createQuestionAnswer()` で `string → [string]` 変換が完結していること    |
| アクセシビリティ  | `aria-pressed` が各ボタンに個別付与されていること                         |
| 後方互換性        | `SmartDefaultResult` / IPC 型 / 永続化型が変更されていないこと            |
| テスト網羅性      | AC-01〜AC-13 がすべてテストでカバーされていること                         |
| ビルド            | `pnpm --filter @repo/desktop build` が成功すること                        |

---

## CI/CD チェック確認項目

PR 作成後に以下の CI チェックが Green になることを確認する。

| チェック                  | コマンド                                | 合格基準       |
| ------------------------- | --------------------------------------- | -------------- |
| 型チェック（shared）      | `pnpm --filter @repo/shared typecheck`  | エラー 0 件    |
| 型チェック（desktop）     | `pnpm --filter @repo/desktop typecheck` | エラー 0 件    |
| Lint                      | `pnpm lint`                             | エラー 0 件    |
| ユニットテスト（shared）  | `pnpm --filter @repo/shared test`       | 全テスト Green |
| ユニットテスト（desktop） | `pnpm --filter @repo/desktop test`      | 全テスト Green |
| ビルド                    | `pnpm --filter @repo/desktop build`     | ビルド成功     |

---

## 承認条件（CONST_002）

**ユーザーの明示承認がある場合のみ PR 作成（`gh pr create`）へ進む。**

承認がない場合は以下の成果物のみを作成して終了する。

- `outputs/phase-13/pr-preparation.md`
- `outputs/phase-13/approval-checklist.md`

---

## PR 作成コマンド（承認後のみ実行）

```bash
# ブランチ作成・切り替え
git checkout -b feat/skill-wizard-multi-select-options

# 変更ファイルをステージング（個別指定）
git add packages/shared/src/types/skillCreator.ts
git add apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
git add apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx
git add apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
# テストファイル群も追加

# コミット
git commit -m "feat(skill-wizard): ConversationRoundStep 複数選択対応（selectedOptions）"

# リモートへプッシュ
git push -u origin feat/skill-wizard-multi-select-options

# PR 作成
gh pr create \
  --title "feat(skill-wizard): ConversationRoundStep 複数選択対応（selectedOptions）" \
  --body "$(cat docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-13/pr-body.md)" \
  --base main
```

---

## 参照資料

| 資料名               | パス                                                                                                         | 用途               |
| -------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------ |
| 要件定義             | `docs/30-workflows/skill-wizard-multi-select-options/phase-1-requirements.md`                                | AC 確認            |
| 設計書               | `docs/30-workflows/skill-wizard-multi-select-options/phase-2-design.md`                                      | 変更差分確認       |
| 設計レビュー         | `docs/30-workflows/skill-wizard-multi-select-options/phase-3-design-review.md`                               | MINOR 指摘対処確認 |
| 実装ガイド           | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-12/implementation-guide.md`               | Phase 12 成果物    |
| システム仕様更新     | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-12/system-spec-update-summary.md`         | Phase 12 成果物    |
| 更新履歴             | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-12/documentation-changelog.md`            | Phase 12 成果物    |
| 未タスク検出         | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-12/unassigned-task-detection.md`          | Phase 12 成果物    |
| スキルフィードバック | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-12/skill-feedback-report.md`              | Phase 12 成果物    |
| 仕様準拠チェック     | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 成果物    |

---

## 実行手順

1. Phase 12 の全成果物（6件）が揃っていることを確認する
2. 差分要約とレビュー観点を整理する（本ドキュメントの「PR 提出差分サマリー」「レビュー観点」を参照）
3. `outputs/phase-13/pr-preparation.md` を作成する
4. `outputs/phase-13/approval-checklist.md` を作成する（ユーザー承認確認チェックリスト）
5. **ユーザーの明示承認を待つ**（CONST_002: 承認なしで PR 作成禁止）
6. 承認がある場合のみ `gh pr create` を実行する
7. PR 作成後、CI チェックが Green になることを確認する
8. `outputs/phase-13/handoff-summary.md` を作成する

---

## 成果物

| 成果物             | 出力先                                                                                       | 説明                                 |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------ |
| PR 準備メモ        | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-13/pr-preparation.md`     | 提出準備情報（常に作成）             |
| 承認チェックリスト | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-13/approval-checklist.md` | ユーザー承認確認（常に作成）         |
| PR 本文            | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-13/pr-body.md`            | gh pr create 用本文（常に作成）      |
| 引き継ぎサマリー   | `docs/30-workflows/skill-wizard-multi-select-options/outputs/phase-13/handoff-summary.md`    | 後続への引き継ぎ情報（承認後に作成） |

---

## 完了条件

- [ ] Phase 12 全成果物（6件）の存在を確認済み
- [ ] `outputs/phase-13/pr-preparation.md` が作成されていること
- [ ] `outputs/phase-13/approval-checklist.md` が作成されていること
- [ ] `outputs/phase-13/pr-body.md` が作成されていること
- [ ] ユーザーの明示承認確認を実施済み（CONST_002）
- [ ] 承認がある場合のみ `gh pr create` を実行済み
- [ ] 承認がある場合のみ CI チェック Green を確認済み
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

---

## サブタスク管理

1. Phase 12 成果物の確認
2. 差分要約・レビュー観点の整理
3. `pr-preparation.md` / `approval-checklist.md` / `pr-body.md` の作成
4. ユーザー承認確認（CONST_002 ゲート）
5. PR 作成（承認時のみ）と CI 確認
6. `handoff-summary.md` の作成（承認時のみ）

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（承認有無に応じた件数）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

---

## PR 作成制約

- **ユーザーの明示承認がある場合だけ PR 作成へ進む（CONST_002）**
- 明示承認がない場合は `outputs/phase-13/pr-preparation.md` / `approval-checklist.md` / `pr-body.md` の3件作成で終了する
- `--no-verify` オプションは絶対に使用しない（プロジェクト規約）

---

## 次のPhase

Phase -: -（本タスクは Phase 13 で完結）
