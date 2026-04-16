# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 11                                                |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 機能名     | notion-freetext-special-case-eliminate            |
| 前提Phase  | Phase 10（PASS または MINOR）                     |
| 後続Phase  | Phase 12                                          |
| 作成日     | 2026-04-15                                        |
| ステータス | completed                                         |

## 目的

`createQuestionAnswer()` の notion ハードコード分岐削除と `SEMANTIC_LABEL_MAP` 統合が
実際の Electron アプリ上で正しく動作することを手動確認する。
型チェック・ビルド確認・Electron 実地確認を行い、スクリーンショットは作成しない。

## タスク分類

**分類: NON_VISUAL（非UIタスク）**

`QuestionSemanticLabelMap` / `resolveLabelEntry()` / `resolveSemanticLabel()` / `createQuestionAnswer()` の内部ロジックを確認するタスクであり、
見た目や画面差分は変更しない。証跡の主ソースは自動テスト、型チェック、ビルドログとする。

## 実行タスク

- shared / desktop の targeted vitest 実行
- shared / desktop の typecheck 実行
- shared / desktop の build 実行
- notion 特別ケース削除の grep 確認
- 手動テスト結果の記録

## 参照資料

| 資料名                         | パス                                                                                         | 用途                   |
| ------------------------------ | -------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 10 成果物                | `outputs/phase-10/final-review-result.md`                                                    | 最終レビュー結果確認   |
| ConversationRoundStep.test.tsx | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 既存回帰テスト確認     |
| skill-wizard-label-map.ts      | `packages/shared/src/types/skill-wizard-label-map.ts`                                        | resolveLabelEntry 確認 |

- 依存Phase参照: Phase 2 / Phase 6 / Phase 7 / Phase 8 / Phase 9 の成果物を前提にする（`outputs/phase-2/design.md`, `outputs/phase-6/test-expansion` 系, `outputs/phase-7/coverage-report.md`, `outputs/phase-8/refactoring-log.md`, `outputs/phase-9/quality-report.md`）

## 実行手順

### 1. targeted vitest 実行

```bash
# shared の helper テスト
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-wizard-label-map.test.ts

# desktop の回帰テスト
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

### 2. 型チェック・ビルド確認

```bash
# 型チェック
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck

# build
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop build
```

### 3. notion 特別ケース削除確認

```bash
grep -n "normalizedKey.*notion\|notion.*その他\|特別ケース" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
```

期待: 出力なし。

### 4. 手動テスト結果記録

`outputs/phase-11/manual-test-result.md` に以下を記録する:

- targeted vitest の実行結果
- typecheck の実行結果
- build の実行結果
- notion 特別ケース削除確認結果
- スクリーンショットを作らない理由（NON_VISUAL）
- 発見した問題点（あれば）

## 統合テスト連携【必須】

| 判定項目                                | 基準 | 結果      |
| --------------------------------------- | ---- | --------- |
| targeted vitest（shared）               | PASS | completed |
| targeted vitest（desktop）              | PASS | completed |
| `pnpm --filter @repo/shared typecheck`  | PASS | completed |
| `pnpm --filter @repo/desktop typecheck` | PASS | completed |
| `pnpm --filter @repo/shared build`      | PASS | completed |
| `pnpm --filter @repo/desktop build`     | PASS | completed |
| notion 特別ケース削除確認               | PASS | completed |

## 多角的チェック観点

| 観点       | 確認内容                                                       |
| ---------- | -------------------------------------------------------------- |
| 機能正常性 | `resolveLabelEntry()` と `resolveSemanticLabel()` が仕様通りか |
| 後退なし   | `ConversationRoundStep.test.tsx` の既存期待値が崩れていないか  |
| 型安全性   | 型拡張後もコンパイルエラーが発生しないか                       |
| ビルド成功 | shared / desktop の build が正常に完了するか                   |
| 証跡最小化 | UI 変更がないため screenshot を作らずに証跡を閉じられるか      |

## 成果物

| 成果物         | パス                                     | 説明                                  |
| -------------- | ---------------------------------------- | ------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 確認結果・証跡ソース・NON_VISUAL 理由 |

## 完了条件

- [x] targeted vitest が PASS すること
- [x] typecheck が PASS すること
- [x] build が PASS すること
- [x] notion 特別ケースが削除されていることを確認済み
- [x] 手動テスト結果（`outputs/phase-11/manual-test-result.md`）が作成済み
- [x] スクリーンショットを作らない理由が明記されている
- [x] 発見した問題点があれば記録し、Phase 5〜8 に戻す判断基準を明確にしている
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次Phase

Phase 12: ドキュメント更新
