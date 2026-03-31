# UT-UIUX-VISUAL-BASELINE-DRIFT-001

```yaml
issue_number: 1811
task_id: UT-UIUX-VISUAL-BASELINE-DRIFT-001
task_name: Visual Baseline Drift 是正（error-display / loading-state / dark-mode）
category: 改善
target_feature: apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/
priority: 中
scale: 小規模
status: 未実施
source_phase: UT-UIUX-PLAYWRIGHT-E2E-001 Phase 11
created_date: 2026-03-31
dependencies: []
```

## メタ情報

| 項目       | 値                                                                   |
| ---------- | -------------------------------------------------------------------- |
| ステータス | 未着手                                                               |
| 優先度     | Medium                                                               |
| 起票日     | 2026-03-31                                                           |
| 起票元     | UT-UIUX-PLAYWRIGHT-E2E-001 Phase 11 / discovered-issues.md ISSUE-002 |
| 関連タスク | UT-UIUX-PLAYWRIGHT-E2E-001, TASK-A11Y-FOCUS-TRAP-001                 |
| Issue番号  | #1811                                                                |

## 1. なぜこのタスクが必要か（Why）

`UT-UIUX-PLAYWRIGHT-E2E-001` の Phase 11 実行中に、Playwright Layer 2（Visual Regression）テストで `error-display` / `loading-state` / `dark-mode` の 3 surface において 113px の snapshot diff が検出された。

現在の baseline snapshot は過去の UI 実装を基準にしており、OnboardingWizard の `inert` 付与などの変更が baseline に反映されていない。このまま放置すると Visual Regression テストが常に失敗し、CI での visual check が機能しない状態が継続する。

diff が UI 変更による正当な差分なのか、意図しない regression なのかを判定した上で、baseline を更新するか UI を修正するかを決定する必要がある。

## 2. 何を達成するか（What）

以下を実施する：

1. **差分原因の特定**: `TC-11-05 error-display` / `TC-11-06 loading-state` / `TC-11-07 dark-mode` の diff 画像を確認し、差分が UI 変更起因か regression 起因かを判定する
2. **対処選択**:
   - UI 変更起因の場合: baseline snapshot を更新し、CI を GREEN にする
   - Regression 起因の場合: UI を修正して baseline に合わせ、CI を GREEN にする
3. **CI GREEN 確認**: `ui-ux-layer2` project が全 PASS になることを確認する

## 3. どのように実行するか（How）

1. Phase 11 の diff 画像を確認する
   ```bash
   open docs/30-workflows/ut-uiux-playwright-e2e-001/outputs/phase-11/screenshots/TC-11-05-error-display-diff.png
   open docs/30-workflows/ut-uiux-playwright-e2e-001/outputs/phase-11/screenshots/TC-11-06-loading-state-diff.png
   open docs/30-workflows/ut-uiux-playwright-e2e-001/outputs/phase-11/screenshots/TC-11-07-dark-mode-diff.png
   ```
2. diff の内容が意図した UI 変更（OnboardingWizard inert 付与など）であることを確認する
3. 意図した変更であれば baseline snapshot を更新する
   ```bash
   pnpm --filter @repo/desktop exec playwright test --update-snapshots --project=ui-ux-layer2
   ```
4. Regression であれば UI を修正して current と baseline を一致させる
5. `ui-ux-layer2` project を再実行して全 PASS を確認する
   ```bash
   pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2
   ```
6. CI が GREEN になることを確認する

## 3.5 苦戦箇所と解決策

| 苦戦箇所                                         | 原因                                                                                                                 | 解決策                                                                                                                                        |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 113px diff の原因特定が困難                      | diff 画像だけでは変更箇所の文脈（意図した変更 vs regression）が判断しにくい                                          | OnboardingWizard の変更履歴（git log / git blame）と diff 画像を照合し、変更日時が一致するかで判断する                                        |
| baseline 更新後に他 surface で新たな diff が出る | `--update-snapshots` は全 baseline を一括更新するため、意図しない surface まで更新される                             | `--update-snapshots` 後に `ui-ux-layer2` を再実行し、更新された各 baseline が期待通りであることをスクリーンショットで確認してからコミットする |
| dark-mode の diff が OS テーマ依存で不安定       | Playwright の dark-mode エミュレーションは `colorScheme: 'dark'` で制御しているが、OS テーマの影響を受ける場合がある | `playwright.config.ts` の `colorScheme` 設定が明示的に `'dark'` を指定しているか確認し、OS テーマに依存しない設定になっているかを検証する     |

## 4. 実行手順

1. diff 画像と git log を照合して差分原因を判定する
   ```bash
   git log --oneline --follow -- apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx
   ```
2. diff が意図した変更起因と判定した場合、baseline を更新する
   ```bash
   pnpm --filter @repo/desktop exec playwright test --update-snapshots --project=ui-ux-layer2
   ```
3. 更新された baseline 画像を視認して意図通りであることを確認する
4. `ui-ux-layer2` を再実行して全 PASS を確認する
5. dark-mode の `colorScheme` 設定を確認する
   ```bash
   grep -n "colorScheme" apps/desktop/playwright.config.ts apps/desktop/e2e/ui-ux/layer2-visual.spec.ts
   ```
6. 必要に応じて `maxDiffPixels` を `test-targets.config.ts` のターゲットエントリに追加して許容差を調整する

## 5. 完了条件チェックリスト

- [ ] `TC-11-05 error-display` の diff 画像を確認し、差分原因を判定済みである
- [ ] `TC-11-06 loading-state` の diff 画像を確認し、差分原因を判定済みである
- [ ] `TC-11-07 dark-mode` の diff 画像を確認し、差分原因を判定済みである
- [ ] `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2` が全 PASS する
- [ ] CI が GREEN になっている
- [ ] baseline 更新または UI 修正の選択根拠がコメント or PR 本文に記述されている

## 6. 検証方法

```bash
# Layer 2 全件実行
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2

# diff 画像確認（更新後）
ls apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/

# baseline 画像と current の目視比較
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2 --reporter=html
open apps/desktop/playwright-report/index.html
```

## 7. リスクと対策

- **リスク**: baseline 更新によって regression が隠蔽される
  - 対策: 更新した baseline の各画像を visual review した上でコミットし、PR レビューで確認する
- **リスク**: `--update-snapshots` が意図しない surface の baseline まで更新する
  - 対策: `--update-snapshots` 後に diff で変更された画像ファイルを確認し、対象 3 surface 以外の画像が変更されていないことを確認する
- **リスク**: dark-mode が CI 環境で再現しない
  - 対策: `playwright.config.ts` に `colorScheme: 'dark'` を明示的に設定し、OS 依存を排除する

## 8. 参照情報

- `docs/30-workflows/ut-uiux-playwright-e2e-001/outputs/phase-11/screenshots/` — Phase 11 diff 画像
- `docs/30-workflows/ut-uiux-playwright-e2e-001/outputs/phase-11/discovered-issues.md` — ISSUE-002 記録
- `apps/desktop/e2e/ui-ux/test-targets.config.ts` — テスト対象設定
- `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts` — Visual Regression テスト実装
- `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/` — baseline snapshot 配置先

## 9. 備考

本タスクは Medium 優先度。`TASK-A11Y-FOCUS-TRAP-001`（HIGH）完了後に着手することを推奨する。

`maxDiffPixels` の調整は一時回避策であり、根本的には baseline 更新または UI 修正で解決すること。`maxDiffPixels` を大きく設定しすぎると Visual Regression テストの意味が失われるため、最大 200px を上限として設定する方針とする。
