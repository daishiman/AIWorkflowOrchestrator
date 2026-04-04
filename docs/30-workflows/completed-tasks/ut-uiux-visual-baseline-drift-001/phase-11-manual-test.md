# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 11                                       |
| Phase名    | 手動テスト                               |
| タスクID   | UT-UIUX-VISUAL-BASELINE-DRIFT-001        |
| 前Phase    | Phase 10: 最終レビューゲート             |
| 次Phase    | Phase 12: ドキュメント更新               |
| ステータス | 未実施                                   |
| 作成日     | 2026-04-03                               |
| 機能名     | ut-uiux-visual-baseline-drift-001        |
| 成果物     | `outputs/phase-11/manual-test-result.md` |

---

## 目的

Playwright HTMLレポートとbaseline画像を視認確認し、Visual Regressionテストが正常に動作していることを手動で確認する。自動テストでは検出できない視覚的な問題（意図しないレイアウト崩れ・色調変化など）を人間の目で最終確認する。

---

## 背景

Phase 10 の最終レビューゲートをPASSした状態でこのPhaseに入る。  
自動テストは全件PASSだが、baseline画像が「正しい表示」を反映しているかどうかは人間が確認する必要がある。特にbaseline更新を行った場合は、更新後の画像が期待通りの見た目であることを視認することが重要である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Layer 2テストをHTMLレポート付きで実行する

**目的**: HTMLレポートを生成し、各surfaceのスクリーンショットをブラウザで確認できる状態にする。

**実行手順**:

1. HTMLレポート付きでテストを実行する:

```bash
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2 --reporter=html
```

2. HTMLレポートをブラウザで開く:

```bash
open apps/desktop/playwright-report/index.html
```

3. レポートが正常に表示されることを確認する。

**期待される成果物**:

- Playwright HTMLレポートの生成

---

### タスク2: HTMLレポートで各surfaceを視認確認する

**目的**: TC-11-05 / TC-11-06 / TC-11-07 の各テストのスクリーンショットが期待通りの表示であることを確認する。

**実行手順**:

1. HTMLレポートで TC-11-05 error-display を確認する:
   - テストがPASSであることを確認する
   - スクリーンショットを開き、エラー表示UIが正しく描画されていることを視認する
   - エラーメッセージ・アイコン・レイアウトが意図通りであることを確認する

2. HTMLレポートで TC-11-06 loading-state を確認する:
   - テストがPASSであることを確認する
   - スクリーンショットを開き、ローディング状態UIが正しく描画されていることを視認する
   - スピナー・プログレスバー等のローディング表現が意図通りであることを確認する

3. HTMLレポートで TC-11-07 dark-mode を確認する:
   - テストがPASSであることを確認する
   - スクリーンショットを開き、ダークモードが正しく適用されていることを視認する
   - 背景色・文字色・コントラストがダークモードとして適切であることを確認する

**期待される成果物**:

- 3 surfaceのスクリーンショット視認確認の記録

---

### タスク3: baseline画像を視認する

**目的**: 保存されているbaseline画像（比較の基準）が正しい表示を反映していることを確認する。

**実行手順**:

1. baseline画像のディレクトリを開く:

```bash
open apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/
```

2. 対象3 surfaceのbaseline画像を目視確認する:
   - `error-display` に対応するbaseline画像が正しいエラー表示であること
   - `loading-state` に対応するbaseline画像が正しいローディング表示であること
   - `dark-mode` に対応するbaseline画像がダークモードで正しく表示されていること

3. baseline更新を行った場合は、更新前と更新後の画像を比較して意図通りの変更であることを確認する（HTMLレポートのdiff表示を活用する）。

**期待される成果物**:

- baseline画像の視認確認記録

---

### タスク4: OnboardingWizardのinert属性による変化を確認する

**目的**: inert属性付与がbaseline diffの原因であった場合、その変化が適切に反映されていることを確認する。

**実行手順**:

1. Phase 4 の差分原因判定結果（`outputs/phase-4/diff-analysis.md`）でinert属性の影響が言及されているか確認する。
2. inert属性の影響がある場合:
   - OnboardingWizardが表示される画面（dark-mode等）のスクリーンショットで、inert属性によるUIの変化が適切であることを確認する
   - 意図しないUI変化（例: 要素が消える・レイアウトが崩れる）がないことを確認する
3. inert属性の影響がない場合はこのタスクをスキップする。

**期待される成果物**:

- inert属性の影響有無と視認確認結果

---

### タスク5: 手動テスト結果を記録する

**目的**: 視認確認結果を記録し、Phase 12 以降で参照できるようにする。

**実行手順**:

1. `outputs/phase-11/manual-test-result.md` を以下の形式で作成する:

```markdown
# Phase 11 手動テスト結果

## 実施日

YYYY-MM-DD

## テスト環境

- OS: macOS XX.X
- Playwright: vX.X.X
- プロジェクト: ui-ux-layer2

## 視認確認チェックリスト

- [ ] error-displayのスクリーンショットが意図通りのエラー表示になっている
- [ ] loading-stateのスクリーンショットがローディング状態を正しく表現している
- [ ] dark-modeのスクリーンショットがダークモードで正しく表示されている
- [ ] OnboardingWizardのinert属性による変化が適切に反映されている（該当する場合）

## 各surfaceの確認詳細

### TC-11-05 error-display

[視認確認の詳細]

### TC-11-06 loading-state

[視認確認の詳細]

### TC-11-07 dark-mode

[視認確認の詳細]

## baseline画像の確認

[baseline画像の視認確認結果]

## 総合判定

[PASS / 要再確認]

## 特記事項

[気づいた点・懸念事項があれば記録]
```

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

## 手動確認チェックリスト

- [ ] error-displayのスクリーンショットが意図通りのエラー表示になっている
- [ ] loading-stateのスクリーンショットがローディング状態を正しく表現している
- [ ] dark-modeのスクリーンショットがダークモードで正しく表示されている
- [ ] OnboardingWizardのinert属性による変化が適切に反映されている

---

## 参照資料

| 参照資料                 | パス                                                      | 内容                           |
| ------------------------ | --------------------------------------------------------- | ------------------------------ |
| Phase 4 差分原因判定結果 | `outputs/phase-4/diff-analysis.md`                        | inert属性の影響有無の確認      |
| Phase 10 レビュー結果    | `outputs/phase-10/review-result.md`                       | 最終レビューゲートの結果       |
| Playwrightレポート       | `apps/desktop/playwright-report/index.html`               | テスト結果とスクリーンショット |
| baseline画像ディレクトリ | `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/` | 比較基準となるbaseline画像     |

---

## 成果物

| 成果物         | パス                                     | 内容                                        |
| -------------- | ---------------------------------------- | ------------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 視認確認チェックリストと各surfaceの確認詳細 |

---

## 完了条件

- [ ] HTMLレポート付きでLayer 2テストを実行し、レポートをブラウザで開いた
- [ ] TC-11-05 error-displayのスクリーンショットを視認確認した
- [ ] TC-11-06 loading-stateのスクリーンショットを視認確認した
- [ ] TC-11-07 dark-modeのスクリーンショットを視認確認した
- [ ] baseline画像のディレクトリを開き、対象3 surfaceの画像を目視確認した
- [ ] 手動確認チェックリストの全項目をチェックした
- [ ] `outputs/phase-11/manual-test-result.md` に視認確認結果を記録した
- [ ] `artifacts.json` の phase-11 ステータスを「完了」に更新した
