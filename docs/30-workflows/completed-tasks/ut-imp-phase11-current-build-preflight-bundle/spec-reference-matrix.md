# 必要仕様抽出マトリクス

## 目的

`UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001` で参照が必要な正本仕様を、関心ごと単位で固定する。  
`aiworkflow-requirements` の resource-map / quick-reference 起点の読み方を、そのままこの workflow へ移植する。

## 抽出手順

1. `.claude/skills/aiworkflow-requirements/indexes/resource-map.md` でタスク種別の初期導線を特定する。
2. `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` の light theme contrast guard 節で検索語と読む順番を固定する。
3. `workflow-light-theme-contrast-regression-guard.md`、`task-workflow.md`、`lessons-learned.md`、`ui-ux-feature-components.md` を最初の必須集合にする。
4. `workflow-light-theme-global-remediation.md`、`quality-e2e-testing.md`、`technology-desktop.md` を追加し、remediation 分離、Playwright/capture、electron-vite build 観点を補う。
5. quick-reference が指す実装アンカーを設計の裏取りとして固定する。
6. 各 Phase の `参照資料` セクションへ、実際に使う仕様だけを配る。

## 採用アーキテクチャ

採用案は「shared preflight core + thin CLI wrapper + capture consumer」である。  
理由は、`apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs` に既にある readiness / probe 断片を shared core へ吸い上げ、CLI と capture の両方が同じ判定結果を使えるようにするためである。  
これにより、shell-out 依存、判定ロジックの二重化、`phase11-static-server.mjs` の責務肥大化を避ける。

## 関心ごと別 必須仕様

| 関心ごと             | 必須仕様                                                                                                                                                            | 理由                                                                                      | 主に使う Phase  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------- |
| 検索起点             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                                                                    | Progressive Disclosure の入口を固定するため                                               | 1, 2            |
| 検索順序             | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                                                                                 | 検索語の分割と読む順番を固定するため                                                      | 1, 2, 11, 12    |
| 親 workflow 契約     | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md`                                                               | preflight bundle の親文脈、current build static serve、代表 screenshot 方針を継承するため | 1, 2, 5, 11, 12 |
| remediation 分離     | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-global-remediation.md`                                                                      | remediation task と guard task を混線させないため                                         | 1, 2, 11, 12    |
| backlog 台帳         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                | 未タスク導線、完了台帳、Phase 12 同期先を固定するため                                     | 1, 12           |
| 教訓再利用           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                                                              | build 先行、harness 出力確認、current と baseline 分離を継承するため                      | 1, 2, 5, 11, 12 |
| feature catalog      | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                                                     | representative screen と routing 先を保持するため                                         | 1, 11, 12       |
| design token context | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                                                                          | screenshot audit の対象が contrast guard であることを明確にするため                       | 1, 11, 12       |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                                                         | script 責務分離と file placement の標準を守るため                                         | 2, 5, 8         |
| 品質基準             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                                                         | targeted test、build、manual verification の合格条件を揃えるため                          | 1, 3, 7, 9, 10  |
| E2E / capture 品質   | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`                                                                                          | Playwright capture と current build 検証の品質基準を補うため                              | 2, 5, 9, 11     |
| desktop build 観点   | `.claude/skills/aiworkflow-requirements/references/technology-desktop.md`                                                                                           | Electron、IPC、ビルドの観点で current build artifact を説明するため                       | 2, 5, 11        |
| エラー分類           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                               | guidance と exit code を再現可能にするため                                                | 2, 5, 9, 10     |
| 開発運用             | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`                                                                                       | CLI script の配置、命名、検証順序を揃えるため                                             | 2, 5, 12        |
| 重複排除の根拠       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | shared core へ判定ロジックを集約し、capture 側の重複を避けるため                          | 2, 3, 8, 10     |
| Phase 12 実務        | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                                                                      | system spec 同期手順を実作業へ落とし込むため                                              | 12              |
| Phase 11/12 手順     | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                                                                         | screenshot evidence と documentation の定型を守るため                                     | 11, 12          |
| 未タスク監査         | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`                                                                                | current と baseline 分離記録を守るため                                                    | 12              |

## 抽出再現コマンド

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "light theme contrast guard" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "phase11-static-server" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "selector-based capture" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "currentViolations" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "baselineViolations" -C 3
```

## 実装アンカー

| アンカー                   | パス                                                                             | 用途                                                |
| -------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------- |
| guard config               | `apps/desktop/scripts/light-theme-contrast-guard.config.mjs`                     | representative scenario と workflow root の確認     |
| guard script               | `apps/desktop/scripts/light-theme-contrast-guard.mjs`                            | audit summary と current/baseline bucket の確認     |
| static server              | `apps/desktop/scripts/phase11-static-server.mjs`                                 | localhost fallback と readiness probe の確認        |
| current preflight fragment | `apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs` | readiness probe と auto static serve の既存断片確認 |
| harness route              | `apps/desktop/src/renderer/phase11-light-theme-contrast-guard.tsx`               | harness HTML の責務確認                             |
| renderer build input       | `apps/desktop/electron.vite.config.ts`                                           | harness route の build input 確認                   |
| capture script             | `apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs` | preflight 接続点の確認                              |

## 関心ごと分離レーン

| レーン                      | 責務                                                  | 主な成果物                                                                  |
| --------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| Lane A: script contract     | preflight CLI、JSON schema、exit code、guidance 文面  | `outputs/phase-2/preflight-contract.md`                                     |
| Lane B: capture integration | capture script 接続、package script、manual test 導線 | `outputs/phase-2/integration-design.md`                                     |
| Lane C: quality and docs    | test matrix、Phase 12 同期、unassigned 監査           | `outputs/phase-2/test-architecture.md`, `outputs/phase-2/spec-sync-plan.md` |

## 監査チェック

- [x] resource-map と quick-reference を起点にした
- [x] 親 workflow の正本仕様を起点にした
- [x] system spec の更新先を Phase 12 前提で固定した
- [x] current build capture と remediation task を別 concern とした
- [x] quick-reference が示す実装アンカーを洗い出した
- [x] closed Issue #1167 は参照用メタ情報として扱い、仕様書作成段階で状態変更しない
