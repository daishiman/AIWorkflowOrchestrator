# UI/UX visual baseline drift ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: `.claude/skills/aiworkflow-requirements/references/`
> テンプレート: `skill-creator/assets/phase12-integrated-workflow-spec-template.md` / `phase12-system-spec-retrospective-template.md` / `phase12-spec-sync-subagent-template.md` を元に再編

---

## 概要

`UT-UIUX-VISUAL-BASELINE-DRIFT-001` で実装した UI/UX visual baseline drift 修正の統合正本。
今回の実装内容、苦戦箇所、SubAgent 分担、検証値、再利用手順、最適なファイル形成を 1 ファイルへ集約し、次回の同種課題で `task-workflow.md` / `lessons-learned.md` / `ui-ux-design-system.md` / `ui-ux-feature-components.md` を横断検索しなくて済むようにする。

**トリガー**: Playwright visual baseline mismatch, dark-mode screenshot drift, `ui-ux-layer2` baseline updates, manual evidence sync, `TC-11-05..07` alignment
**実行環境**: `apps/desktop` current build / Playwright `ui-ux-layer2` project / Phase 11 screenshot / Phase 12 spec sync
**検索キーワード**: `visual baseline drift`, `dark mode baseline`, `colorScheme`, `TC-11-05`, `TC-11-06`, `TC-11-07`, `manual-test-result`

---

## 仕様書別 SubAgent 編成

| SubAgent | 関心ごと | 主担当仕様書 / 実装 | 目的 |
| --- | --- | --- | --- |
| SubAgent-A | browser theme / design system | `ui-ux-design-system.md`, `apps/desktop/playwright.config.ts` | Playwright project の `colorScheme` と design token の基準を固定する |
| SubAgent-B | visual spec / evidence | `ui-ux-feature-components.md`, `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts` | `test.use({ colorScheme: "dark" })` と `TC-ID` の対応を固定する |
| SubAgent-C | workflow ledger | `task-workflow-completed-ui-ux-visual-baseline-drift.md`, `task-workflow.md` | 完了記録、検証値、artifact inventory を同期する |
| SubAgent-D | reuse knowledge | `lessons-learned-ui-ux-visual-baseline-drift.md` | 色味 / baseline / evidence の再利用手順を短文化する |
| Lead | integrated spec / lookup | `references/workflow-ui-ux-visual-baseline-drift.md`, `indexes/resource-map.md`, `indexes/quick-reference.md`, `LOGS.md` | 次回の初動を 1 入口へまとめる |

---

## 今回実装した内容

| 観点 | 実装内容 | 主要ファイル |
| --- | --- | --- |
| browser baseline fix | `ui-ux-layer2` の Playwright project に `use.colorScheme: "dark"` を追加し、ブラウザ既定テーマを固定した | `apps/desktop/playwright.config.ts` |
| spec-level alignment | Layer 2 visual spec に `test.use({ colorScheme: "dark" })` を追加し、spec 側でも暗黙 defaults を排除した | `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts` |
| visual evidence | Phase 11 screenshot を `TC-11-05..07` の命名で集約し、manual-test/plan/checklist と同一 wave で保存した | `docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001/outputs/phase-11/` |
| artifact sync | `artifacts.json` / `outputs/artifacts.json` / Phase 12 成果物を current facts へ同期した | `docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001/outputs/phase-12/` |
| completion sync | `docs/30-workflows/completed-tasks/UT-UIUX-VISUAL-BASELINE-DRIFT-001.md` を完了へ移し、Phase 12 未タスクは 0 件にした | `docs/30-workflows/completed-tasks/UT-UIUX-VISUAL-BASELINE-DRIFT-001.md` |

### 実装結果サマリー

| 項目 | 値 |
| --- | --- |
| targeted visual suite | `10 passed` |
| typecheck | `PASS` |
| ESLint | `0 errors / 6 warnings` |
| legacy register | 旧 filename なし（更新不要） |

---

## 苦戦箇所と再発防止

| 苦戦箇所 | 再発条件 | 今回の対処 | 標準ルール |
| --- | --- | --- | --- |
| browser default theme と spec-level theme のズレ | Playwright project だけ、または spec だけ theme を固定する | `playwright.config.ts` と `layer2-visual.spec.ts` の両方で `dark` を明示した | dark-mode visual tests は config と spec の両方で同じ `colorScheme` を pin する |
| screenshot evidence と TC-ID の不一致 | baseline PNG の filename をそのまま証跡として使う | `TC-11-05..07` の evidence 名を current workflow へ同期した | screenshot は `TC-ID ↔ png` で管理し、baseline snapshot 名と混同しない |
| workflow / ledger / lesson の同期漏れ | config 修正だけで完了扱いにする | workflow、completed ledger、lessons、resource lookup を同一 wave で更新した | visual regression fix は code / spec / evidence / lesson を同時に閉じる |

---

## 同種課題の 5 分解決カード

1. baseline PNG と current screenshot を比較し、差分が UI 実装か browser theme かを切り分ける。
2. `playwright.config.ts` と visual spec の両方で `colorScheme` を同じ値に固定する。
3. `TC-ID` ごとに screenshot と manual-test-result を揃え、証跡名を統一する。
4. `artifacts.json` / `outputs/artifacts.json` / Phase 12 成果物を同一 wave で更新する。
5. `task-workflow` / `lessons-learned` / `resource-map` / `quick-reference` を同時に閉じる。

---

## 最適なファイル形成

| 情報の種類 | 最適な反映先 | 反映理由 |
| --- | --- | --- |
| 実装全体像、SubAgent 分担、dark-mode baseline の再利用入口 | `workflow-ui-ux-visual-baseline-drift.md` | browser default theme / spec-level colorScheme / screenshot evidence / ledger を 1 入口へ集約できる |
| dark-mode baseline drift の修正対象、TC と screenshot の一致 | `ui-ux-feature-components.md` | visual evidence と TC-ID を同時に追える |
| browser default theme、semantic token、contrast 所見 | `ui-ux-design-system.md` | Playwright project の colorScheme と app-side theme contract を分離して管理できる |
| 完了記録、検証値、artifact inventory | `task-workflow-completed-ui-ux-visual-baseline-drift.md` | Phase 11/12 実測値と evidence path を台帳へ残せる |
| 苦戦箇所、再発条件、5分解決カード | `lessons-learned-ui-ux-visual-baseline-drift.md` | browser default drift の再発を短手順で防止できる |

> 同じ段落を複数仕様書へ重複転記せず、このマトリクスで責務を先に決めてから反映する。

---

## 検証コマンド

| コマンド | 目的 | 合格条件 |
| --- | --- | --- |
| `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2` | dark-mode visual baseline の回帰確認 | PASS |
| `pnpm --filter @repo/desktop typecheck` | TypeScript 整合確認 | PASS |
| `pnpm --filter @repo/desktop exec eslint .` | lint / warning 監査 | `0 errors` |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001 --phase 12` | Phase 12 成果物構造確認 | PASS |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` | canonical / mirror 差分確認 | 差分 0 |

---

## 関連改善タスク

| 未タスクID | 概要 | 参照 |
| --- | --- | --- |
| なし | 今回の drift は config/spec 同期で解消済み | `docs/30-workflows/completed-tasks/UT-UIUX-VISUAL-BASELINE-DRIFT-001.md` |

---

## 関連ドキュメント

| ドキュメント | 用途 |
| --- | --- |
| [task-workflow-completed-ui-ux-visual-baseline-drift.md](./task-workflow-completed-ui-ux-visual-baseline-drift.md) | 完了記録と検証値 |
| [ui-ux-feature-components.md](./ui-ux-feature-components.md) | representative feature と evidence path |
| [ui-ux-design-system.md](./ui-ux-design-system.md) | theme / contrast / token 観点 |
| [task-workflow.md](./task-workflow.md) | 完了台帳と検証証跡 |
| [lessons-learned-ui-ux-visual-baseline-drift.md](./lessons-learned-ui-ux-visual-baseline-drift.md) | 苦戦箇所と簡潔解決手順 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-04-03 | 1.0.0 | UT-UIUX-VISUAL-BASELINE-DRIFT-001 の統合正本を新規作成。dark-mode baseline drift、Phase 11 screenshot evidence、同 wave の task-workflow / lessons / lookup 更新を集約した |
