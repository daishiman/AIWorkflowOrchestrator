# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 1                                 |
| Phase名    | 要件定義                          |
| タスクID   | UT-UIUX-VISUAL-BASELINE-DRIFT-001 |
| 前提Phase  | なし                              |
| 後続Phase  | Phase 2: 設計                     |
| ステータス | 完了                              |
| 作成日     | 2026-04-03                        |
| 機能名     | ut-uiux-visual-baseline-drift-001 |

---

## 目的

Playwright Layer 2 Visual Regression テストで検出された 113px diff の原因を特定し、是正方針を確定するための要件を定義する。

## 背景

UT-UIUX-PLAYWRIGHT-E2E-001 Phase 11 実行中に、error-display / loading-state / dark-mode の 3 surface で snapshot diff が検出された。OnboardingWizard の `inert` 付与による UI 変更が baseline に未反映であることが疑われた。

調査の結果、`git log --follow` で `OnboardingWizard` と baseline snapshots が `51b3fc0c2` で同時更新されており、差分の起点は意図した UI 変更だったと判断できた。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存状態の確認（P50チェック）

**目的**: diff 画像・baseline snapshot・変更履歴を確認して原因を特定する。

**実行手順**:

1. diff 画像の確認

   ```bash
   ls docs/30-workflows/ut-uiux-playwright-e2e-001/outputs/phase-11/screenshots/
   ```

2. baseline snapshot 確認

   ```bash
   ls apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/
   ```

3. OnboardingWizard 変更履歴確認

   ```bash
   git log --oneline --follow -- apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx
   ```

4. colorScheme 設定確認

   ```bash
   grep -n "colorScheme" apps/desktop/playwright.config.ts apps/desktop/e2e/ui-ux/layer2-visual.spec.ts
   ```

**期待される成果物**:

- 差分原因の仮説（UI変更起因 or Regression起因）

---

### タスク2: 機能要件・受け入れ条件の定義

**目的**: 是正方針と受け入れ条件を明文化する。

**機能要件**:

| ID    | 要件                                                                                                             |
| ----- | ---------------------------------------------------------------------------------------------------------------- |
| FR-01 | `diff` 画像と `git log` を照合して、UI 変更起因か regression 起因かを判定できること                              |
| FR-02 | UI 変更起因の場合、baseline snapshots を安全に更新できること                                                     |
| FR-03 | Regression 起因の場合、UI 実装を baseline に合わせて修正できること                                               |
| FR-04 | `playwright.config.ts` と `layer2-visual.spec.ts` で `colorScheme: "dark"` を明示し、OS テーマ差を排除できること |

**非機能要件**:

| ID     | 要件                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------- |
| NFR-01 | `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2` が全件 PASS すること |
| NFR-02 | `ui-ux-layer2` の結果が CI でも再現可能であること                                              |
| NFR-03 | `maxDiffPixels` は 200px 以下に抑えること                                                      |

**受け入れ条件**:

| ID    | 条件                                               |
| ----- | -------------------------------------------------- |
| AC-01 | error-display の差分原因判定根拠が文書化されている |
| AC-02 | loading-state の差分原因判定根拠が文書化されている |
| AC-03 | dark-mode の差分原因判定根拠が文書化されている     |
| AC-04 | `ui-ux-layer2` が全 PASS している                  |
| AC-05 | colorScheme が明示されている                       |
| AC-06 | baseline 更新対象が 3 surface に限定される         |

---

## 参照資料

| 参照資料           | パス                                                                         | 内容                         |
| ------------------ | ---------------------------------------------------------------------------- | ---------------------------- |
| Phase 11 diff 画像 | `docs/30-workflows/ut-uiux-playwright-e2e-001/outputs/phase-11/screenshots/` | 差分画像                     |
| テスト対象設定     | `apps/desktop/e2e/ui-ux/test-targets.config.ts`                              | Visual Regression テスト設定 |
| baseline snapshot  | `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/`                    | 現行 baseline                |

---

## 成果物

| 成果物     | パス                              | 内容             |
| ---------- | --------------------------------- | ---------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | FR・AC・方針決定 |

---

## 完了条件

- [x] diff 原因の仮説が立てられている
- [x] 受け入れ条件 AC-01〜AC-06 が定義されている
- [x] 是正方針（baseline 更新 or UI 修正）が決定されている
- [x] `outputs/phase-1/requirements.md` に要件定義を記録した
