# Phase 4: テスト検証準備 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 4                                 |
| Phase名    | テスト検証準備                    |
| タスクID   | UT-UIUX-VISUAL-BASELINE-DRIFT-001 |
| 前提Phase  | Phase 3: 設計レビューゲート       |
| 後続Phase  | Phase 5: 実装                     |
| ステータス | 完了                              |
| 作成日     | 2026-04-03                        |
| 機能名     | ut-uiux-visual-baseline-drift-001 |

---

## 目的

現行の `ui-ux-layer2` テストを再実行して現在の状態を記録し、Phase 5 の実装前ベースラインを確立する。

## 背景

Phase 3 の設計レビューで PASS を得た後、Phase 5 の実装（colorScheme 固定・baseline 更新等）の前に、現行テスト状態を記録する必要がある。
また、`git log --follow` による OnboardingWizard と snapshot 履歴の照合を行い、UI 変更起因 / regression 起因の実測判定を実施する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: OnboardingWizard と snapshot 履歴の照合

**目的**: 差分の起点が意図した UI 変更かを実測で確認する。

**実行手順**:

1. OnboardingWizard の変更履歴を確認する

   ```bash
   git log --oneline --follow -- apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx
   ```

2. baseline snapshot の変更履歴を確認する

   ```bash
   git log --oneline -- apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/
   ```

3. 同一コミットで UI と snapshot が更新されているかを確認する

**期待される成果物**:

- `51b3fc0c2` で OnboardingWizard と baseline snapshots が同時更新されていることが確認済み

---

### タスク2: 現行テストの再実行と状態記録

**目的**: 現行 worktree での `ui-ux-layer2` テスト状態を記録する。

**実行手順**:

1. Layer 2 テストを実行する

   ```bash
   pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2
   ```

2. テスト結果を記録する
   - PASS / FAIL 件数
   - TC-11-05 / TC-11-06 / TC-11-07 の個別結果

3. snapshot diff の有無を確認する

   ```bash
   git diff --name-only apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/
   ```

**期待される成果物**:

- `ui-ux-layer2` のテスト結果が記録されていること（10/10 PASS を確認）

---

### タスク3: colorScheme 設定の現状確認

**目的**: `colorScheme: "dark"` が現行設定に含まれているかを確認する。

**実行手順**:

1. playwright.config.ts の colorScheme 設定を確認する

   ```bash
   grep -n "colorScheme" apps/desktop/playwright.config.ts
   ```

2. layer2-visual.spec.ts の colorScheme 設定を確認する

   ```bash
   grep -n "colorScheme" apps/desktop/e2e/ui-ux/layer2-visual.spec.ts
   ```

3. 設定済みか未設定かを記録する

**期待される成果物**:

- colorScheme の現行設定状態が記録されていること

---

### タスク4: diff-analysis の記録

**目的**: Phase 4 の調査結果を `outputs/phase-4/diff-analysis.md` にまとめる。

**記録内容**:

| 項目                  | 確認結果                             |
| --------------------- | ------------------------------------ |
| OnboardingWizard 履歴 | `51b3fc0c2` に UI 更新あり           |
| snapshot 履歴         | `51b3fc0c2` に baseline 生成あり     |
| Layer 2 テスト        | 10 passed                            |
| snapshot diff         | 現在は 0 件                          |
| 判定                  | UI 変更起因（regression は再現せず） |

**期待される成果物**:

- `outputs/phase-4/diff-analysis.md` に記録されていること

---

## 参照資料

| 参照資料         | パス                                           | 内容                          |
| ---------------- | ---------------------------------------------- | ----------------------------- |
| 設計書           | `outputs/phase-2/design.md`                    | 判定フロー・設計内容          |
| 設計レビュー結果 | `outputs/phase-3/review-result.md`             | 設計レビューの PASS 確認      |
| テスト実装       | `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts` | TC-11-05/06/07 のテストコード |

---

## 成果物

| 成果物            | パス                               | 内容                                             |
| ----------------- | ---------------------------------- | ------------------------------------------------ |
| diff 分析レポート | `outputs/phase-4/diff-analysis.md` | 履歴照合・テスト結果・colorScheme 現状・判定結果 |

---

## 完了条件

- [x] OnboardingWizard と snapshot 履歴の照合が完了している
- [x] `ui-ux-layer2` テストを再実行し結果が記録されている（10/10 PASS）
- [x] snapshot diff が 0 件であることが確認されている
- [x] colorScheme の現行設定状態が確認されている
- [x] UI 変更起因 / regression 起因の実測判定が完了している
- [x] `outputs/phase-4/diff-analysis.md` に結果を記録した
