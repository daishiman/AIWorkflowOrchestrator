# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 13                                |
| Phase名    | PR作成                            |
| タスクID   | UT-UIUX-VISUAL-BASELINE-DRIFT-001 |
| 前Phase    | Phase 12: ドキュメント更新        |
| 次Phase    | なし（最終Phase）                 |
| ステータス | 未実施                            |
| 作成日     | 2026-04-03                        |
| 機能名     | ut-uiux-visual-baseline-drift-001 |
| 成果物     | GitHub Pull Request               |

---

## 目的

全フェーズの成果物をコミットしてPRを作成し、CI GREENを確認することでタスクを完了させる。PR本文には判断根拠を明記し、レビュアーが経緯を理解できる状態にする。

---

## 背景

Phase 12 のドキュメント更新が完了し、全ての成果物が揃った状態でこのPhaseに入る。  
Phase 13 ではGitのコミット作成・PRの作成・CI結果の確認を行う。CI GREENが確認できた時点でタスク完了となる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 変更ファイルを確認する

**目的**: コミット対象のファイルを把握し、意図しないファイルが含まれていないことを確認する。

**実行手順**:

1. 変更ファイルの一覧を確認する:

```bash
git status
git diff --stat
```

2. コミット対象として想定されるファイルカテゴリを確認する:
   - `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/` 配下（baseline更新の場合）
   - `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts`（テスト修正の場合）
   - `apps/desktop/e2e/ui-ux/test-targets.config.ts`（maxDiffPixels設定変更の場合）
   - `apps/desktop/playwright.config.ts`（colorScheme設定変更の場合）
   - UIコンポーネントファイル（UI修正の場合）
   - `docs/30-workflows/completed-tasks/UT-UIUX-VISUAL-BASELINE-DRIFT-001.md`（ステータス更新）
   - `docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001/outputs/` 配下（各Phase成果物）

3. 意図しないファイルが含まれている場合は除外する。

**期待される成果物**:

- コミット対象ファイルの確認完了

---

### タスク2: コミットを作成する

**目的**: 変更内容を適切なコミットメッセージでコミットする。

**実行手順**:

1. baseline更新の場合のコミット例:

```bash
git add apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/
git add docs/30-workflows/
git commit -m "fix(e2e): UT-UIUX-VISUAL-BASELINE-DRIFT-001 — Visual Baseline Drift是正（error-display/loading-state/dark-mode）"
```

2. UI修正の場合のコミット例:

```bash
git add apps/desktop/src/
git add apps/desktop/e2e/ui-ux/
git add docs/30-workflows/
git commit -m "fix(desktop): UT-UIUX-VISUAL-BASELINE-DRIFT-001 — Visual Baseline Drift是正（error-display/loading-state/dark-mode）"
```

3. colorScheme設定変更を含む場合はファイルを追加してコミットする:

```bash
git add apps/desktop/playwright.config.ts
```

4. コミット後に `git log --oneline -3` でコミットが正しく作成されたことを確認する。

**注意事項**:

- `--no-verify` オプションは絶対に使用しないこと
- コミットメッセージは `fix(e2e):` または `fix(desktop):` で始め、タスクIDを含めること

**期待される成果物**:

- 適切なコミットメッセージでのコミット作成

---

### タスク3: PRを作成する

**目的**: `outputs/phase-12/system-spec-update-summary.md` の判断根拠を元にPRを作成する。

**実行手順**:

1. 以下のコマンドでPRを作成する（`system-spec-update-summary.md` の内容を元に `[...]` 部分を埋める）:

```bash
gh pr create \
  --title "fix(e2e): UT-UIUX-VISUAL-BASELINE-DRIFT-001 — Visual Baseline Drift是正" \
  --body "$(cat <<'EOF'
## 概要

Playwright Layer 2 Visual Regressionテストで検出された113px diffを解消します。

対象surface: error-display / loading-state / dark-mode（TC-11-05〜TC-11-07）

## 変更内容

- [baseline更新またはUI修正の内容を記述]

## 差分原因の判定根拠

### TC-11-05 error-display
- **判定**: [UI変更起因 / Regression起因]
- **根拠**: [判定根拠を記述]

### TC-11-06 loading-state
- **判定**: [UI変更起因 / Regression起因]
- **根拠**: [判定根拠を記述]

### TC-11-07 dark-mode
- **判定**: [UI変更起因 / Regression起因]
- **根拠**: [判定根拠を記述]

## colorScheme設定の変更

[変更あり/なし。変更がある場合はその内容と理由を記述]

## テスト確認

- [x] `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2` 全PASS
- [x] 対象3 surface（error-display/loading-state/dark-mode）のbaseline視認確認済み
- [x] 対象外surfaceへの影響なし（baseline画像の変更が対象3 surfaceのみであることを確認）
- [x] maxDiffPixels が全設定箇所で 200px 以下であることを確認
- [x] TypeScript型チェック PASS
- [x] ESLint PASS

## 関連Issue

Closes #1811
EOF
  )"
```

2. PRが正常に作成されたことを確認し、PR URLを記録する。

**期待される成果物**:

- GitHub Pull Request（判断根拠が記述されたもの）

---

### タスク4: CI結果を確認する

**目的**: CI（GitHub Actions）がGREENになることを確認する。

**実行手順**:

1. CIの実行状況を確認する:

```bash
gh pr checks
```

2. 全てのチェックがPASSになるまで待機する（定期的に実行して確認する）。
3. 失敗したチェックがある場合は原因を調査する:

```bash
gh run view --log-failed
```

4. 失敗の原因に応じて対処する:
   - テスト失敗: 該当するPhaseに差し戻して修正
   - 型エラー: Phase 9 に差し戻して修正
   - Lintエラー: Phase 9 に差し戻して修正

**期待される成果物**:

- CI全チェックGREEN

---

### タスク5: タスク完了記録を更新する

**目的**: `artifacts.json` のphase-13ステータスを完了に更新し、タスク全体の完了を記録する。

**実行手順**:

1. `artifacts.json` の phase-13 status を「完了」に更新する。
2. 必要に応じて `outputs/artifacts.json` も更新し、PR URLを `artifacts.json` またはタスク仕様書に記録する。
3. タスク全体が完了したことをチームに通知する（必要な場合）。

**期待される成果物**:

- 更新済み `artifacts.json`（phase-13 status: 完了）
- タスク完了記録

---

## 参照資料

| 参照資料              | パス                                                                                 | 内容                           |
| --------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| Phase 12 更新サマリー | `outputs/phase-12/system-spec-update-summary.md`                                     | PR本文の判断根拠として転記する |
| Phase 10 レビュー結果 | `outputs/phase-10/review-result.md`                                                  | 受け入れ条件充足状況の確認     |
| artifacts.json        | `docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001/artifacts.json` | Phase完了記録の更新対象        |

---

## 成果物

| 成果物       | パス / URL                    | 内容                              |
| ------------ | ----------------------------- | --------------------------------- |
| Pull Request | GitHub PR URL（作成後に記録） | 判断根拠を含む PR（Closes #1811） |

---

## 完了条件

- [ ] `git status` で変更ファイルを確認し、意図しないファイルが含まれていないことを確認した
- [ ] `--no-verify` を使用せずにコミットを作成した
- [ ] `gh pr create` でPRを作成し、PR URLを取得した
- [ ] PRの本文に差分原因の判定根拠が記述されている
- [ ] PRの本文に `Closes #1811` が記述されている
- [ ] `gh pr checks` でCI全チェックがGREENになったことを確認した
- [ ] `artifacts.json` の phase-13 ステータスを「完了」に更新した
- [ ] 必要に応じて `outputs/artifacts.json` も更新した
