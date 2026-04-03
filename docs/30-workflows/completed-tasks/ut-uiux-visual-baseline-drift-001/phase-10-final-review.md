# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 10                                  |
| Phase名    | 最終レビューゲート                  |
| タスクID   | UT-UIUX-VISUAL-BASELINE-DRIFT-001   |
| 前Phase    | Phase 9: 品質保証                   |
| 次Phase    | Phase 11: 手動テスト                |
| ステータス | 未実施                              |
| 作成日     | 2026-04-03                          |
| 機能名     | ut-uiux-visual-baseline-drift-001   |
| 成果物     | `outputs/phase-10/review-result.md` |

---

## 目的

全フェーズ（Phase 1〜9）の成果物を最終レビューし、受け入れ条件の充足状況を確認して、PR作成可否を判定する。

PASS の場合のみ Phase 11 以降に進む。MAJOR / CRITICAL の場合は該当Phaseに差し戻す。

---

## 背景

Phase 9 の品質保証チェックを通過した状態でこのPhaseに入る。  
Phase 10 では各受け入れ条件に対して実施済み内容を照合し、PR作成へ進める品質水準に達しているかを最終判定する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 受け入れ条件の全項目を確認する

**目的**: タスク全体の受け入れ条件が全て充足されていることを確認する。

**実行手順**:

1. 以下の受け入れ条件を1項目ずつ確認する:

| No    | 受け入れ条件                                                                       | 状態 | 根拠 |
| ----- | ---------------------------------------------------------------------------------- | ---- | ---- |
| AC-01 | TC-11-05 error-display の差分原因を判定済みである                                  |      |      |
| AC-02 | TC-11-06 loading-state の差分原因を判定済みである                                  |      |      |
| AC-03 | TC-11-07 dark-mode の差分原因を判定済みである                                      |      |      |
| AC-04 | `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2` が全PASS |      |      |
| AC-05 | CI GREEN（PRマージ後を想定した事前確認）                                           |      |      |
| AC-06 | maxDiffPixels が 200px 以下に設定されている                                        |      |      |
| AC-07 | 判断根拠がPRに記述できる状態になっている                                           |      |      |

**期待される成果物**:

- 全受け入れ条件の充足状況確認

---

### タスク2: 実装内容の妥当性を確認する

**目的**: 判断根拠が明文化されており、実施内容が設計（Phase 2）に沿っていることを確認する。

**実行手順**:

1. Phase 4 の差分原因判定結果（`outputs/phase-4/diff-analysis.md`）を確認する。
2. 判定根拠（UI変更起因 or Regression起因）が明記されていることを確認する。
3. Phase 5/6 の実施内容が判定結果と整合していることを確認する。
4. colorScheme 設定の変更有無とその理由が記録されていることを確認する。

**期待される成果物**:

- 実装妥当性の確認記録

---

### タスク3: 対象外surfaceへの影響がないことを確認する

**目的**: error-display / loading-state / dark-mode 以外のsurfaceに意図しない変更が加わっていないことを確認する。

**実行手順**:

1. baseline画像の変更一覧を確認する:

```bash
git diff --name-only -- "apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/"
```

2. 変更されているファイルが対象3 surfaceのみであることを確認する。
3. 対象外のbaseline画像が変更されている場合は原因を調査し、CRITICAL判定とする。

**期待される成果物**:

- 対象外surface影響なしの確認

---

### タスク4: maxDiffPixels設定が200px以下であることを確認する

**目的**: NFR要件（maxDiffPixels 200px以下）が守られていることを確認する。

**実行手順**:

1. 設定ファイルを確認する:

```bash
grep -n "maxDiffPixels" apps/desktop/e2e/ui-ux/test-targets.config.ts
grep -n "maxDiffPixels" apps/desktop/playwright.config.ts
grep -n "maxDiffPixels" apps/desktop/e2e/ui-ux/layer2-visual.spec.ts
```

2. 全ての `maxDiffPixels` 設定値が 200 以下であることを確認する。
3. 200を超える設定が存在する場合はCRITICAL判定とし、Phase 5〜6に差し戻す。

**期待される成果物**:

- maxDiffPixels設定値の確認記録

---

### タスク5: CI GREEN確認のための事前チェックを実行する

**目的**: ローカルでの最終テスト実行によりCI環境でのGREENを事前保証する。

**実行手順**:

1. Layer 2テストを再度実行して全件PASSを確認する:

```bash
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2
```

2. 全件PASSであることを確認する。

**期待される成果物**:

- 最終テスト全件PASSの確認

---

### タスク6: レビュー結果を記録する

**目的**: 判定結果と根拠を `outputs/phase-10/review-result.md` に記録する。

**実行手順**:

1. `outputs/phase-10/review-result.md` を以下の形式で作成する:

```markdown
# Phase 10 最終レビュー結果

## 総合判定: [PASS / MAJOR / CRITICAL]

## 受け入れ条件充足状況

| No    | 受け入れ条件                   | 充足 | 根拠 |
| ----- | ------------------------------ | ---- | ---- |
| AC-01 | error-display 差分原因判定済み |      |      |
| AC-02 | loading-state 差分原因判定済み |      |      |
| AC-03 | dark-mode 差分原因判定済み     |      |      |
| AC-04 | Layer 2テスト全PASS            |      |      |
| AC-05 | CI GREEN（事前確認）           |      |      |
| AC-06 | maxDiffPixels 200px以下        |      |      |
| AC-07 | 判断根拠のPR記述準備完了       |      |      |

## 差し戻し事項（MAJOR/CRITICALの場合）

[差し戻し内容を記述]

## 次Phaseへの引き継ぎ事項

[Phase 11 実施時の注意点を記述]
```

**期待される成果物**:

- `outputs/phase-10/review-result.md`

---

## レビュー判定基準

### PASS

以下の条件を全て満たす場合:

- AC-01〜AC-07 の全項目が充足されている
- 対象外surfaceへの意図しない変更がない
- maxDiffPixels が全設定箇所で 200px 以下である

**→ Phase 11: 手動テスト へ進む**

### MAJOR（差し戻し）

以下のいずれかに該当する場合:

- AC-01〜AC-07 の1項目以上が未充足
- 判断根拠が明文化されていない
- Layer 2テストに未PASSの項目がある

**→ 該当するPhaseに差し戻す（Phase 4〜9）**

### CRITICAL（即時停止）

以下のいずれかに該当する場合:

- 対象外surfaceのbaseline画像に意図しない変更がある
- maxDiffPixels が 200px を超える設定が存在する
- AC-04（Layer 2全PASS）が達成できない根本的な問題がある

**→ Phase 5 に戻って対処する**

---

## 参照資料

| 参照資料                     | パス                                            | 内容                 |
| ---------------------------- | ----------------------------------------------- | -------------------- |
| Phase 9 品質レポート         | `outputs/phase-9/quality-report.md`             | 品質チェック結果     |
| Phase 4 差分原因判定結果     | `outputs/phase-4/diff-analysis.md`              | 差分原因の判定根拠   |
| Phase 8 リファクタリングログ | `outputs/phase-8/refactoring-log.md`            | baseline視認確認結果 |
| テスト対象設定               | `apps/desktop/e2e/ui-ux/test-targets.config.ts` | maxDiffPixels設定値  |

---

## 成果物

| 成果物       | パス                                | 内容                                                |
| ------------ | ----------------------------------- | --------------------------------------------------- |
| レビュー結果 | `outputs/phase-10/review-result.md` | PASS/MAJOR/CRITICAL判定と受け入れ条件充足状況・根拠 |

---

## 完了条件

- [ ] AC-01〜AC-07 の全受け入れ条件を確認した
- [ ] 実装内容の妥当性（判断根拠の明文化）を確認した
- [ ] 対象外surfaceへの影響がないことを確認した
- [ ] maxDiffPixels が全設定箇所で 200px 以下であることを確認した
- [ ] `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2` が全件PASSであることを最終確認した
- [ ] `outputs/phase-10/review-result.md` に総合判定と根拠を記録した
- [ ] PASS の場合: Phase 11 への引き継ぎ事項を明記した
- [ ] MAJOR/CRITICAL の場合: 差し戻し事項を具体的に記述し該当Phaseに戻した
- [ ] `artifacts.json` の phase-10 ステータスを「完了」に更新した
