# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 8                                 |
| Phase名    | リファクタリング                  |
| タスクID   | UT-UIUX-VISUAL-BASELINE-DRIFT-001 |
| 前提Phase  | Phase 7: カバレッジ確認           |
| 後続Phase  | Phase 9: CI 確認                  |
| ステータス | 未実施                            |
| 作成日     | 2026-04-03                        |
| 機能名     | ut-uiux-visual-baseline-drift-001 |

---

## 目的

baseline 更新 / UI 修正後に設定最適化とコードの品質を確認する。

Phase 5〜7 の実装・検証を経た後、設定値の過大設定や不要な一時ファイルが残存していないことを確認し、コードの状態を整理する。これにより、次の Visual Regression サイクルでの保守性を高める。

## 背景

Visual Regression テストの修正作業では、暫定的に `maxDiffPixels` を大きく設定したり、調査用の一時ファイルを作成したりする場合がある。Phase 8 ではこれらを棚卸しし、本来あるべき状態に整理する。

特に `maxDiffPixels` の過大設定は、将来の regression を見逃すリスクに直結するため、上限（200px）を超えていないことの確認を必須とする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: playwright.config.ts の colorScheme 設定が明示的であることを確認する

**目的**: dark-mode テストが OS テーマに依存せず、CI 環境でも安定して動作することを保証する

**実行手順**:

1. `playwright.config.ts` の `ui-ux-layer2` プロジェクト設定を確認する

   ```bash
   grep -A 20 "ui-ux-layer2" apps/desktop/playwright.config.ts
   ```

2. `colorScheme: 'dark'` が明示設定されているかを確認する

3. 未設定の場合（Phase 5 で設定しなかった場合）は、Phase 5 の判断根拠（`outputs/phase-5/decision-basis.md`）を参照し、設定不要と判断した理由が記録されていることを確認する

4. 設定状況を `outputs/phase-8/refactoring-log.md` に記録する

**期待される成果物**:

- `colorScheme` が明示設定されているか、設定不要と判断した根拠が記録されていること

---

### タスク2: test-targets.config.ts の maxDiffPixels が過大設定されていないことを確認する

**目的**: Visual Regression テストが将来の regression を適切に検知できることを確認する

**実行手順**:

1. `test-targets.config.ts` の全エントリの `maxDiffPixels` を確認する

   ```bash
   grep -n "maxDiffPixels" apps/desktop/e2e/ui-ux/test-targets.config.ts
   ```

2. 各エントリの `maxDiffPixels` が 200px 以下であることを確認する
   - 200px 超の設定が存在する場合は修正対象とする

3. 200px 超の設定が存在する場合は、適切な値（200px 以下）に修正する

4. 修正前後の値を `outputs/phase-8/refactoring-log.md` に記録する

**期待される成果物**:

- 全エントリの `maxDiffPixels` が 200px 以下であること
- 修正があった場合は修正前後の値が記録されていること

---

### タスク3: 不要な一時ファイルが残っていないことを確認する

**目的**: 調査・作業用の一時ファイルがリポジトリに残存していないことを確認する

**実行手順**:

1. `apps/desktop/e2e/` 配下の git 管理外ファイルを確認する

   ```bash
   git status apps/desktop/e2e/
   ```

2. 意図しない未追跡ファイルや変更済みファイルが存在しないことを確認する
   - 許容される変更: TC-11-05/06/07 のスナップショット更新（baseline 更新の場合）
   - 許容される変更: `playwright.config.ts` の `colorScheme` 追加（Phase 5 で設定した場合）
   - 許容される変更: `test-targets.config.ts` の `maxDiffPixels` 修正（タスク2 で実施した場合）
   - 許容されない変更: それ以外の未追跡ファイル・変更

3. 不要なファイルが存在した場合は削除または `git restore` で元に戻す

4. 確認結果を `outputs/phase-8/refactoring-log.md` に記録する

**期待される成果物**:

- 意図しない一時ファイルが存在しないことが確認済みであること

---

### タスク4: baseline 更新の場合は更新された全 PNG 画像を目視確認する（条件付き）

**目的**: 更新された baseline 画像が正しい UI 状態を表していることを最終確認する

> このタスクは Phase 5 で baseline 更新を実施した場合のみ実施する。UI 修正を実施した場合はスキップする。

**実行手順**:

1. 更新された PNG 画像の一覧を取得する

   ```bash
   git diff --name-only apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/
   ```

2. 各 PNG 画像をビューアで開いて目視確認する

   ```bash
   open apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/
   ```

3. 確認観点:
   - error-display: エラーメッセージ・アイコン・レイアウトが正しいこと
   - loading-state: スピナー・スケルトン等のローディング表示が正しいこと
   - dark-mode: 背景色・テキスト色・ボーダー色がダークテーマとして正しいこと

4. 目視確認結果を `outputs/phase-8/refactoring-log.md` に記録する

**期待される成果物**:

- 更新された全 baseline 画像の目視確認が完了していること
- 各画像が正しい UI 状態を表していることが確認済みであること

---

## 参照資料

| 参照資料                   | パス                                            | 内容                                                      |
| -------------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| Phase 5 判断根拠           | `outputs/phase-5/decision-basis.md`             | UI 変更起因 / Regression 起因の判定・colorScheme 設定判断 |
| Phase 5 実施内容記録       | `outputs/phase-5/implementation-log.md`         | 実施した変更内容（baseline 更新 or UI 修正）              |
| Phase 7 カバレッジレポート | `outputs/phase-7/coverage-report.md`            | maxDiffPixels 上限超過の有無                              |
| Playwright 設定            | `apps/desktop/playwright.config.ts`             | colorScheme 設定の確認対象                                |
| テスト対象設定             | `apps/desktop/e2e/ui-ux/test-targets.config.ts` | maxDiffPixels の確認・修正対象                            |

---

## 成果物

| 成果物               | パス                                 | 内容                                                                                              |
| -------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | colorScheme 設定確認結果・maxDiffPixels 確認結果・一時ファイル確認結果・baseline 画像目視確認結果 |

### `outputs/phase-8/refactoring-log.md` の記述形式

```markdown
# Phase 8 リファクタリングログ

## colorScheme 設定確認

- 設定状況: 明示設定済み / 未設定（設定不要と判断）
- 設定箇所: [ファイル名:行番号 or "設定不要と判断した理由"]

## maxDiffPixels 確認

| surface       | 修正前 | 修正後 | 備考                |
| ------------- | ------ | ------ | ------------------- |
| error-display | [N]px  | [N]px  | 修正あり / 変更なし |
| loading-state | [N]px  | [N]px  | 修正あり / 変更なし |
| dark-mode     | [N]px  | [N]px  | 修正あり / 変更なし |

200px 超の設定: なし / あり（修正済み）

## 一時ファイル確認

- 不要ファイル: なし / あり（削除済み）
- git status 結果: [クリーン / 意図した変更のみ残存]

## baseline 画像目視確認（baseline 更新の場合のみ）

| surface       | 確認結果 | 備考 |
| ------------- | -------- | ---- |
| error-display | OK / NG  |      |
| loading-state | OK / NG  |      |
| dark-mode     | OK / NG  |      |
```

---

## 完了条件

- [ ] `playwright.config.ts` の `colorScheme` 設定が明示的であるか、設定不要の根拠が記録されている
- [ ] `test-targets.config.ts` の全エントリの `maxDiffPixels` が 200px 以下であることを確認した
- [ ] 200px 超の設定が存在した場合は修正済みである
- [ ] `git status apps/desktop/e2e/` で不要な一時ファイルが残っていないことを確認した
- [ ] baseline 更新を実施した場合: 更新された全 PNG 画像を目視確認した
- [ ] 設定の過大値がなく、コードが整理されていることが確認済みである
- [ ] `outputs/phase-8/refactoring-log.md` にリファクタリング内容を記録した
