# UT-UIUX-VISUAL-BASELINE-DRIFT-001: Visual Baseline Drift 是正（error-display / loading-state / dark-mode）

## メタ情報

```yaml
issue_number: 1811
task_id: UT-UIUX-VISUAL-BASELINE-DRIFT-001
task_name: Visual Baseline Drift 是正
category: 改善
target_feature: Playwright Layer 2 visual regression / dark-mode baseline stability
priority: 中
scale: 小規模
status: 完了（Phase 1-12 完了 / Phase 13 未実施）
source_phase: UT-UIUX-PLAYWRIGHT-E2E-001 Phase 11 / 12 close-out
created_date: 2026-04-03
completed_date: 2026-04-03
execution_workflow: docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001
```

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| タスクID     | UT-UIUX-VISUAL-BASELINE-DRIFT-001                                     |
| タスク名     | Visual Baseline Drift 是正                                            |
| 分類         | 改善                                                                  |
| 対象機能     | Playwright Layer 2 visual regression / dark-mode baseline stability   |
| 優先度       | 中                                                                    |
| 見積もり規模 | 小規模                                                                |
| ステータス   | 完了（Phase 1-12 完了 / Phase 13 未実施）                             |
| 発見元       | UT-UIUX-PLAYWRIGHT-E2E-001 Phase 11 / 12 close-out                    |
| 発見日       | 2026-04-03                                                            |
| 完了日       | 2026-04-03                                                            |
| 実行workflow | `docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001` |

---

## 実行結果

- 2026-04-03 に Phase 1-12 を完了し、正本成果物は `docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001/` へ同期済み。
- 本指示書は完了アーカイブとして `docs/30-workflows/completed-tasks/unassigned-task/` に保持する。
- 追加の follow-up は発生せず、`currentViolations=0` で閉じた。

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`ui-ux-layer2` の visual regression で `error-display` / `loading-state` / `dark-mode` の 3 surface に baseline drift が検出された。  
CI で visual check が継続的に失敗する状態を放置すると、Playwright Layer 2 の回帰検知としての価値が失われる。

### 1.2 問題点

- dark-mode の見た目が OS / browser の既定テーマに依存しやすい
- `playwright.config.ts` だけ更新しても、spec 側の実行条件がずれると baseline が揺れる
- Phase 11 の screenshot evidence と Phase 12 の台帳同期が分かれると、実施済みの根拠が追えなくなる

### 1.3 放置した場合の影響

- snapshot diff が常時発生し、visual regression が機能しなくなる
- screenshot evidence の再利用性が落ち、同種 task の再監査が長引く
- unassigned-task の status / placement が drift し、completion 判定が曖昧になる

---

## 2. 何を達成するか（What）

### 2.1 目的

dark-mode baseline drift を、browser color scheme の固定と Phase 11/12 証跡同期で再発しにくい状態へ閉じる。

### 2.2 最終ゴール

1. `ui-ux-layer2` project が PASS する。
2. `dark-mode` screenshot が browser theme 依存なく安定する。
3. Phase 11 screenshot evidence と Phase 12 completion ledger が同じ値を指す。
4. 未タスク配置の実体と参照先が一致する。

### 2.3 スコープ

#### 含むもの

- `apps/desktop/playwright.config.ts` の `colorScheme: "dark"` 固定
- `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts` の `test.use({ colorScheme: "dark" })`
- Phase 11 screenshot evidence の保存と確認
- Phase 12 の `task-workflow` / `lessons` / unassigned-task 同期

#### 含まないもの

- renderer の UI レイアウト再設計
- 新規 surface の追加
- commit / PR / push

### 2.4 成果物

- completed unassigned task 指示書
- Phase 11 screenshot evidence
- Phase 12 docs / logs / skill feedback

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Playwright Layer 2 の baseline diff が再現できる
- screenshot evidence を `outputs/phase-11/screenshots/` に保存できる
- `validate-phase-output` と `verify-unassigned-links` を実行できる

### 3.2 依存知識

- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
- `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`

### 3.3 推奨アプローチ

1. dark-mode 再現条件を `playwright.config.ts` と spec の両方で固定する。
2. Phase 11 screenshot evidence を `TC-ID` ごとに保存する。
3. Phase 12 で `task-workflow` / `lessons` / unassigned-task の 3 点を同一ターンで同期する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                   | 発見経緯                                        | 解決策                                                                                      | 教訓                                                                   |
| ------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| dark-mode baseline drift が browser 既定値に左右される | project 設定だけでは theme が安定しなかった     | `playwright.config.ts` と `layer2-visual.spec.ts` の両方に `colorScheme: "dark"` を固定した | browser レベルと spec レベルの両方で条件を揃えないと baseline は揺れる |
| screenshot evidence の置き場が分散しやすい             | Phase 11 と Phase 12 の根拠が別ファイルに散った | `outputs/phase-11/screenshots/` と `manual-test-result.md` を 1 対 1 で同期した             | 画像だけでなくテキスト証跡も同時に残す                                 |
| completed unassigned task の参照先がずれやすい         | 実体がないまま phase-12 文言だけ先行していた    | `docs/30-workflows/completed-tasks/UT-UIUX-VISUAL-BASELINE-DRIFT-001.md` を実体化した       | 完了アーカイブは「参照だけ」で終わらせず、実体を置く                   |

---

## 4. 実行手順

1. `apps/desktop/playwright.config.ts` の `ui-ux-layer2` project を確認する。
2. `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts` の `test.use({ colorScheme: "dark" })` を確認する。
3. `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2` を実行する。
4. Phase 11 screenshot evidence を `outputs/phase-11/screenshots/` へ保存する。
5. Phase 12 の `task-workflow` / `lessons` / unassigned-task を同じ値で同期する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [x] dark-mode の baseline drift が解消されている
- [x] `ui-ux-layer2` project が PASS している

### 品質要件

- [x] `pnpm --filter @repo/desktop typecheck` が PASS
- [x] `pnpm --filter @repo/desktop exec eslint .` が PASS（warning のみ）
- [x] `verify-unassigned-links` と `audit-unassigned-tasks --diff-from HEAD` の合否が揃っている

### ドキュメント要件

- [x] `task-workflow.md` と `lessons-learned.md` へ同一の解決カードが同期されている
- [x] `completed-tasks/unassigned-task/` に完成済み指示書が存在する

---

## 6. 検証方法

```bash
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2 --reporter=list
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop exec eslint .
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001 --phase 12
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/UT-UIUX-VISUAL-BASELINE-DRIFT-001.md
```

---

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                                                             |
| ----------------------------------------- | ------ | -------- | ---------------------------------------------------------------- |
| theme 固定が片側だけになる                | 中     | 中       | project config と spec の両方で colorScheme を固定する           |
| screenshot evidence が未同期になる        | 中     | 低       | `manual-test-result.md` と screenshot を同時に更新する           |
| completed archive の status が drift する | 中     | 低       | completed-tasks/unassigned-task の実体を作成し、参照先を固定する |

---

## 8. 参照情報

- `docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001/index.md`
- `docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001/outputs/phase-12/phase12-task-spec-compliance-check.md`
- `docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001/outputs/phase-12/system-spec-update-summary.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

---

## 9. 備考

- 本タスクは UI の見た目品質を baseline drift から守るための運用ガード。
- 画面差分の解消だけでなく、証跡配置と台帳同期まで含めて完了条件とする。
