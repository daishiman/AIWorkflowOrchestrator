# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 7                                 |
| Phase名    | カバレッジ確認                    |
| タスクID   | UT-UIUX-VISUAL-BASELINE-DRIFT-001 |
| 前提Phase  | Phase 6: テスト拡充               |
| 後続Phase  | Phase 8: リファクタリング         |
| ステータス | 未実施                            |
| 作成日     | 2026-04-03                        |
| 機能名     | ut-uiux-visual-baseline-drift-001 |

---

## 目的

Visual Regression テスト全体のカバレッジを確認し、既存のカバレッジを維持する。

Phase 6 で TC-11-05/06/07 の個別 PASS を確認した後、`ui-ux-layer2` プロジェクト全件を通して実行し、今回の変更（baseline 更新 or UI 修正）が他の TC に悪影響を与えていないことを確認する。

## 背景

Visual Regression テストでは、特定 surface の修正が他 surface のスナップショットに意図せず影響を与える場合がある。Phase 6 ではスナップショットファイルの変更を確認したが、Phase 7 では実際にテストを全件実行してカバレッジの退行がないことを確認する。

また、`test-targets.config.ts` の surface 定義に抜け漏れがないことも確認し、テストカバレッジの網羅性を担保する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ui-ux-layer2 プロジェクト全件を実行する

**目的**: 今回の変更が他の TC に悪影響を与えていないことを確認する

**実行手順**:

1. list レポーターで全件実行し、各 TC の結果を一覧表示する

   ```bash
   pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2 --reporter=list
   ```

2. 全件 PASS であることを確認する

3. FAIL があった場合は、今回の変更との関連性を調査する
   - Phase 5 の変更内容（`outputs/phase-5/implementation-log.md`）と照合する
   - 関連がある場合は Phase 5 に戻り対処する
   - 関連がない場合は別タスクとして切り出す

**期待される成果物**:

- ui-ux-layer2 プロジェクトの全 TC が PASS していること

---

### タスク2: TC-11-05 / TC-11-06 / TC-11-07 が全て PASS であることを確認する

**目的**: 受け入れ条件の達成を最終確認する

**実行手順**:

1. タスク1 の実行結果から TC-11-05/06/07 の結果を抽出して確認する

   ```bash
   pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2 --reporter=list 2>&1 | grep -E "TC-11-0[567]"
   ```

2. 3 件全て PASS であることを確認し、`outputs/phase-7/coverage-report.md` に記録する

**期待される成果物**:

- TC-11-05 / TC-11-06 / TC-11-07 の PASS が最終確認済みであること

---

### タスク3: baseline 画像のファイル数を確認する

**目的**: baseline 画像が意図せず削除・追加されていないことを確認する

**実行手順**:

1. 現在の baseline 画像ファイル数を確認する

   ```bash
   ls apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/ | wc -l
   ```

2. ファイル数が Phase 4 実施前と比較して想定の範囲内であることを確認する
   - 許容される増減: baseline 更新による上書き（ファイル数変化なし）
   - 許容されない増減: 意図しないファイルの削除・追加

3. ファイル一覧を `outputs/phase-7/coverage-report.md` に記録する
   ```bash
   ls apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/ >> outputs/phase-7/coverage-report.md
   ```

**期待される成果物**:

- baseline 画像のファイル数が記録されていること
- 意図しない増減がないことが確認済みであること

---

### タスク4: test-targets.config.ts のカバー対象 surface を確認する

**目的**: Visual Regression テストの対象 surface に抜け漏れがないことを確認する

**実行手順**:

1. `test-targets.config.ts` に定義されている全 surface エントリを確認する

   ```bash
   cat apps/desktop/e2e/ui-ux/test-targets.config.ts
   ```

2. 各 surface の `maxDiffPixels` 設定が 200px 以下であることを確認する（上限超過があれば Phase 8 で対処）

3. TC-11-05 / TC-11-06 / TC-11-07 に対応する surface エントリが存在することを確認する

4. 確認結果を `outputs/phase-7/coverage-report.md` に記録する

**期待される成果物**:

- `test-targets.config.ts` の全 surface エントリが確認済みであること
- カバー対象に抜け漏れがないことが確認済みであること

---

## 参照資料

| 参照資料             | パス                                            | 内容                                     |
| -------------------- | ----------------------------------------------- | ---------------------------------------- |
| Phase 6 テスト結果   | `outputs/phase-6/test-result.md`                | 3 surface の PASS 確認結果               |
| Phase 5 実施内容記録 | `outputs/phase-5/implementation-log.md`         | 実施した変更内容（他 TC との関連確認用） |
| テスト対象設定       | `apps/desktop/e2e/ui-ux/test-targets.config.ts` | surface ごとの maxDiffPixels 設定        |
| テスト実装           | `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts`  | 全 TC の実装                             |

---

## 成果物

| 成果物             | パス                                 | 内容                                                                                         |
| ------------------ | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 全件実行結果・TC-11-05/06/07 の PASS 確認・baseline 画像ファイル数・surface 抜け漏れ確認結果 |

### `outputs/phase-7/coverage-report.md` の記述形式

```markdown
# Phase 7 カバレッジレポート

## ui-ux-layer2 全件実行結果

- 総テスト数: [N] 件
- PASS: [N] 件
- FAIL: [N] 件

## TC-11-05/06/07 最終確認

| TC番号   | surface       | 結果 |
| -------- | ------------- | ---- |
| TC-11-05 | error-display | PASS |
| TC-11-06 | loading-state | PASS |
| TC-11-07 | dark-mode     | PASS |

## baseline 画像ファイル数

- 変更前: [N] 件
- 変更後: [N] 件
- 差分: [増減なし / +N / -N]

## test-targets.config.ts カバレッジ確認

- 全 surface エントリ数: [N] 件
- maxDiffPixels 上限超過: なし / あり（Phase 8 で対処）
- 抜け漏れ: なし / あり（[surface名]）
```

---

## 完了条件

- [ ] `ui-ux-layer2` プロジェクトの全 TC が PASS した
- [ ] TC-11-05 / TC-11-06 / TC-11-07 の PASS を最終確認した
- [ ] baseline 画像のファイル数に意図しない増減がないことを確認した
- [ ] `test-targets.config.ts` の全 surface エントリに抜け漏れがないことを確認した
- [ ] カバレッジに退行がないことが確認済みである
- [ ] `outputs/phase-7/coverage-report.md` にカバレッジ確認結果を記録した
