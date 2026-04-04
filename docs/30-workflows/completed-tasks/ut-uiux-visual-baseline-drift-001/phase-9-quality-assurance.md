# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 9                                   |
| Phase名    | 品質保証                            |
| タスクID   | UT-UIUX-VISUAL-BASELINE-DRIFT-001   |
| 前Phase    | Phase 8: リファクタリング           |
| 次Phase    | Phase 10: 最終レビューゲート        |
| ステータス | 未実施                              |
| 作成日     | 2026-04-03                          |
| 機能名     | ut-uiux-visual-baseline-drift-001   |
| 成果物     | `outputs/phase-9/quality-report.md` |

---

## 目的

Phase 5〜8 で実施した全変更（baseline更新またはUI修正）の品質を確認し、コード品質基準（TypeScript型チェック・ESLint・Layer 2テスト全PASS）を満たしていることを検証する。

---

## 背景

Phase 8 のリファクタリングと baseline 視認確認を経て、目視確認が完了した状態でこのPhaseに入る。  
Phase 9 では自動品質チェックを機械的に実行し、PRへ進む前の品質ゲートを通過させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: TypeScript型チェックを実行する

**目的**: 型エラーが存在しないことを確認し、型安全性を担保する。

**実行手順**:

1. 以下のコマンドを実行する:

```bash
pnpm --filter @repo/desktop typecheck
```

2. エラーが0件であることを確認する。
3. エラーがある場合は修正し、再度実行する。

**期待される成果物**:

- TypeScript型チェックのエラーが0件であること

---

### タスク2: ESLintを実行する

**目的**: コーディング規約違反がないことを確認する。

**実行手順**:

1. 以下のコマンドを実行する:

```bash
pnpm --filter @repo/desktop lint
```

2. エラーが0件であることを確認する（警告は許容されるが記録する）。
3. エラーがある場合は修正し、再度実行する。

**期待される成果物**:

- ESLintエラーが0件であること

---

### タスク3: Layer 2テストを最終実行する

**目的**: TC-11-05 / TC-11-06 / TC-11-07 を含む Layer 2 テスト全件がPASSであることを最終確認する。

**実行手順**:

1. 以下のコマンドを実行する:

```bash
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2
```

2. 全件PASSであることを確認する。
3. 失敗がある場合はPhase 5〜8に差し戻して原因を調査・修正する。

**期待される成果物**:

- `ui-ux-layer2` プロジェクトのテストが全件PASS

---

### タスク4: 変更されたファイルを確認する

**目的**: 意図しないファイル変更が含まれていないことを確認する。

**実行手順**:

1. 変更ファイル一覧を確認する:

```bash
git diff --name-only
git diff --stat
```

2. 変更されているファイルが以下のいずれかであることを確認する:
   - `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/` 配下（baseline更新の場合）
   - `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts`（テスト修正の場合）
   - `apps/desktop/e2e/ui-ux/test-targets.config.ts`（設定変更の場合）
   - `apps/desktop/playwright.config.ts`（colorScheme設定変更の場合）
   - UIコンポーネントファイル（UI修正の場合）
3. 対象外ファイルが変更されている場合は原因を調査する。

**期待される成果物**:

- 変更ファイルが意図した範囲内であることの確認

---

### タスク5: baseline画像変更の意図性を再確認する

**目的**: 対象3 surface（error-display / loading-state / dark-mode）以外のbaseline画像が変更されていないことを確認する。

**実行手順**:

1. baseline画像の変更状況を確認する:

```bash
git diff --name-only -- "apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/"
```

2. 変更されているbaseline画像が `error-display` / `loading-state` / `dark-mode` に対応するファイルのみであることを確認する。
3. 対象外のbaseline画像が変更されている場合は、その理由を調査する。

**期待される成果物**:

- baseline画像の変更が対象3 surfaceのみであることの確認

---

### タスク6: 品質レポートを作成する

**目的**: 品質チェック結果を記録し、Phase 10 のレビューゲートで参照できるようにする。

**実行手順**:

1. `outputs/phase-9/quality-report.md` を以下の形式で作成する:

```markdown
# Phase 9 品質レポート

## 実施日

YYYY-MM-DD

## チェック結果サマリー

| チェック項目                 | 結果 | 備考 |
| ---------------------------- | ---- | ---- |
| TypeScript型チェック         |      |      |
| ESLint                       |      |      |
| Layer 2テスト全件PASS        |      |      |
| 変更ファイル範囲の妥当性確認 |      |      |
| baseline画像変更の意図性確認 |      |      |

## 変更ファイル一覧

[git diff --name-only の結果]

## Layer 2テスト結果

[テスト実行結果サマリー]

## 品質ゲート判定

[PASS / FAIL]
```

**期待される成果物**:

- `outputs/phase-9/quality-report.md`

---

## 参照資料

| 参照資料                     | パス                                            | 内容                  |
| ---------------------------- | ----------------------------------------------- | --------------------- |
| Phase 8 リファクタリングログ | `outputs/phase-8/refactoring-log.md`            | 前Phaseの視認確認結果 |
| Layer 2テスト実装            | `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts`  | テスト対象の実装      |
| Playwright設定               | `apps/desktop/playwright.config.ts`             | テスト設定            |
| テスト対象設定               | `apps/desktop/e2e/ui-ux/test-targets.config.ts` | maxDiffPixels等の設定 |

---

## 成果物

| 成果物       | パス                                | 内容                                          |
| ------------ | ----------------------------------- | --------------------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | typecheck・lint・テスト結果の記録とゲート判定 |

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラー0件でPASS
- [ ] `pnpm --filter @repo/desktop lint` がエラー0件でPASS
- [ ] `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2` が全件PASS
- [ ] 変更ファイルが意図した範囲内であることを確認した
- [ ] 対象3 surface以外のbaseline画像が変更されていないことを確認した
- [ ] `outputs/phase-9/quality-report.md` を作成した
- [ ] `artifacts.json` の phase-9 ステータスを「完了」に更新した
