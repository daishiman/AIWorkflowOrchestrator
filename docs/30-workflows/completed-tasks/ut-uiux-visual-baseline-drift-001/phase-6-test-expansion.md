# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 6                                 |
| Phase名    | テスト拡充                        |
| タスクID   | UT-UIUX-VISUAL-BASELINE-DRIFT-001 |
| 前提Phase  | Phase 5: 実装                     |
| 後続Phase  | Phase 7: カバレッジ確認           |
| ステータス | 未実施                            |
| 作成日     | 2026-04-03                        |
| 機能名     | ut-uiux-visual-baseline-drift-001 |

---

## 目的

Layer 2 テストを再実行し、3 surface 全件 PASS を確認する。

Phase 5 で実施した baseline 更新または UI 修正が正しく機能していることを検証する。全件 PASS が確認できない場合は Phase 5 に戻り、原因を再調査する。

## 背景

Phase 5 での変更（baseline 更新 or UI 修正）が完了した後、実際にテストが通ることを確認するフェーズである。

Visual Regression テストにおいては、変更後の baseline が正しい状態を表していることを目視でも確認することが重要であり、HTML レポートによる視認確認を必須とする。また、対象 3 surface の変更が他 surface に波及していないことも確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Layer 2 テストを再実行する

**目的**: Phase 5 の変更後に TC-11-05 / TC-11-06 / TC-11-07 が PASS することを確認する

**実行手順**:

1. Layer 2 テストを実行する

   ```bash
   pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2
   ```

2. 結果を確認する
   - TC-11-05（error-display）: PASS であること
   - TC-11-06（loading-state）: PASS であること
   - TC-11-07（dark-mode）: PASS であること

3. 失敗があった場合は「タスク2（失敗時の対処）」へ進む。全 PASS であれば「タスク3」へ進む。

**期待される成果物**:

- TC-11-05 / TC-11-06 / TC-11-07 が全て PASS していること

---

### タスク2: 失敗があった場合の原因分析（条件付き）

**目的**: 残存する失敗の原因を特定し、Phase 5 に戻る判断を行う

> このタスクは タスク1 で失敗が残った場合のみ実施する。

**実行手順**:

1. 失敗した surface と diff ピクセル数を確認する

   ```bash
   pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2 2>&1 | grep -E "failed|diff|TC-11"
   ```

2. Phase 5 の判定結果（UI 変更起因 / Regression 起因）が正しかったかを再検討する

3. 原因を `outputs/phase-6/test-result.md` に記録し、Phase 5 の再実施へ戻る

**期待される成果物**:

- 残存失敗の原因が特定されていること
- Phase 5 への差し戻し事項が明記されていること

---

### タスク3: HTML レポートで視認確認する

**目的**: PASS した snapshot が正しい UI 状態を表していることを目視で確認する

**実行手順**:

1. HTML レポート付きでテストを実行する

   ```bash
   pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2 --reporter=html
   ```

2. レポートをブラウザで開く

   ```bash
   open apps/desktop/playwright-report/index.html
   ```

3. TC-11-05 / TC-11-06 / TC-11-07 のスクリーンショットを目視確認する
   - error-display: エラー表示が正しいレイアウトであること
   - loading-state: ローディング表示が正しいレイアウトであること
   - dark-mode: ダークモードのカラーが正しく適用されていること

**期待される成果物**:

- 3 surface の baseline 画像が正しい UI 状態を表していることが目視確認済みであること

---

### タスク4: 対象 surface 以外の baseline 画像が変更されていないことを確認する

**目的**: baseline 更新による意図しない surface への波及がないことを確認する

**実行手順**:

1. 変更されたスナップショットファイルの一覧を確認する

   ```bash
   git diff --name-only apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/
   ```

2. 変更されたファイルが TC-11-05 / TC-11-06 / TC-11-07 に対応するものだけであることを確認する
   - 許容される変更: `TC-11-05-*`, `TC-11-06-*`, `TC-11-07-*` に該当するファイル
   - 許容されない変更: それ以外の TC 番号に対応するファイル

3. 意図しない変更が含まれていた場合は、該当ファイルを元に戻す
   ```bash
   git restore --source=HEAD -- "apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/<対象外ファイル>"
   ```

**期待される成果物**:

- 変更されたスナップショットが TC-11-05/06/07 のみであることが確認済みであること

---

## 参照資料

| 参照資料                 | パス                                           | 内容                                    |
| ------------------------ | ---------------------------------------------- | --------------------------------------- |
| Phase 5 実施内容記録     | `outputs/phase-5/implementation-log.md`        | 実施した変更内容                        |
| Phase 5 判断根拠         | `outputs/phase-5/decision-basis.md`            | UI 変更起因 / Regression 起因の判定根拠 |
| Phase 4 差分分析レポート | `outputs/phase-4/diff-analysis.md`             | 実施前の失敗状態（比較用）              |
| テスト実装               | `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts` | TC-11-05/06/07 のテストコード           |

---

## 成果物

| 成果物           | パス                             | 内容                                                             |
| ---------------- | -------------------------------- | ---------------------------------------------------------------- |
| テスト結果の記録 | `outputs/phase-6/test-result.md` | 再実行後のテスト結果・目視確認結果・スナップショット変更確認結果 |

### `outputs/phase-6/test-result.md` の記述形式

```markdown
# Phase 6 テスト結果

## Layer 2 テスト再実行結果

| TC番号   | surface       | 結果        | 備考 |
| -------- | ------------- | ----------- | ---- |
| TC-11-05 | error-display | PASS / FAIL |      |
| TC-11-06 | loading-state | PASS / FAIL |      |
| TC-11-07 | dark-mode     | PASS / FAIL |      |

## 目視確認結果

| surface       | 確認結果 | 備考 |
| ------------- | -------- | ---- |
| error-display | OK / NG  |      |
| loading-state | OK / NG  |      |
| dark-mode     | OK / NG  |      |

## スナップショット変更確認

変更されたファイル: [ファイル一覧]
対象外 surface への波及: なし / あり（対処済み）
```

---

## 完了条件

- [ ] TC-11-05（error-display）が PASS した
- [ ] TC-11-06（loading-state）が PASS した
- [ ] TC-11-07（dark-mode）が PASS した
- [ ] HTML レポートで 3 surface の baseline 画像を目視確認した
- [ ] 変更されたスナップショットが TC-11-05/06/07 のみであることを確認した
- [ ] `outputs/phase-6/test-result.md` にテスト結果を記録した
