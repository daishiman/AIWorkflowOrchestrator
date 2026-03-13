# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 |
| Phase      | 5                                                 |
| Phase名    | 実装                                              |
| カテゴリ   | 改善                                              |
| 優先度     | 中                                                |
| ステータス | completed                                         |
| 前提Phase  | Phase 4                                           |
| 後続Phase  | Phase 6                                           |

## 目的

Phase 4 の test contract に従って shared preflight core、capture integration、thin CLI wrapper、package script を実装し、4 観点の失敗分類を機械化する。

## 実行タスク

- タスク1: shared preflight core を実装する
- タスク2: capture script と metadata を更新する
- タスク3: thin CLI wrapper、package script、実装サマリーを整備する

### タスク1: shared preflight core 実装

**目的**: 4 観点判定を 1 箇所の正本へまとめる

**実装内容**:

| 対象                                                            | 実装内容                                                |
| --------------------------------------------------------------- | ------------------------------------------------------- |
| `apps/desktop/scripts/phase11-current-build-preflight-core.mjs` | bucket 判定、report 生成、guidance 集約、shared API     |
| native bucket                                                   | worktree native mismatch を検知し、修復 guidance を返す |
| build bucket                                                    | `out/renderer` と asset 出力を検証する                  |
| harness bucket                                                  | harness HTML の build output と route 名を検証する      |
| baseUrl bucket                                                  | `phase11-static-server.mjs` を使って probe する         |

### タスク2: capture integration 実装

**目的**: screenshot 実行前に preflight を必ず通す

**実装内容**:

| 対象                                                                             | 実装内容                                                                          |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs` | capture 前に shared preflight core を import して呼び、結果を metadata へ保存する |
| metadata                                                                         | preflight summary、bundleName、timestamp、guidance を保存する                     |
| fail path                                                                        | failure bucket ごとに次アクションを表示して capture を停止する                    |

### タスク3: thin CLI wrapper、package script と実装サマリー

**目的**: コマンド名と完了記録を固定する

**実装内容**:

| 対象                                                       | 実装内容                                                             |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| `apps/desktop/scripts/phase11-current-build-preflight.mjs` | shared core を呼ぶ thin CLI wrapper、argv 解析、JSON 出力、exit code |
| `apps/desktop/package.json`                                | `preflight:light-theme-contrast-guard` を追加する                    |
| `outputs/phase-5/implementation-summary.md`                | 実装対象、除外対象、検証結果を記録する                               |

## 参照資料

| 参照資料                 | パス                                                                                                 | 説明                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 4 テスト作成       | `phase-4-test-creation.md`                                                                           | test case と failure 行列        |
| 親 workflow 実装サマリー | `../completed-tasks/light-theme-contrast-regression-guard/outputs/phase-5/implementation-summary.md` | current build capture の既存構成 |
| capture script           | `../../../apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs`            | integration 先                   |
| static server helper     | `../../../apps/desktop/scripts/phase11-static-server.mjs`                                            | localhost fallback helper        |
| package scripts          | `../../../apps/desktop/package.json`                                                                 | script 登録先                    |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                                  | 内容                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`           | script 分離の標準                              |
| エラー処理       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                 | guidance の一貫性                              |
| 開発運用         | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`                         | script 命名と検証順                            |
| 親 workflow 正本 | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md` | parent workflow への反映範囲                   |
| desktop build    | `.claude/skills/aiworkflow-requirements/references/technology-desktop.md`                             | current build artifact と electron-vite の観点 |
| E2E品質          | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`                            | Playwright capture と metadata の品質観点      |

## 実行手順

### ステップ1: shared preflight core を実装する

bucket 判定、report、guidance、localhost fallback 呼び出しを shared core へ集約する。

### ステップ2: capture script を consumer に戻す

現行 capture script の readiness / probe 断片を shared core 呼び出しへ置き換え、capture 本来の責務だけを残す。

### ステップ3: thin CLI wrapper と package script を整える

manual 実行用の wrapper を追加し、package script と implementation summary へ bundle 名を固定する。

## 統合テスト連携

- Phase 4 の test case に対応する実装のみを追加し、Phase 6 で CLI と metadata の追加検証へ渡す。
- Phase 7 で targeted vitest、build、preflight 実行コマンドの結果を確認する。
- Phase 11 では capture 前の preflight 実行と metadata 記録を手動で確認する。

## 多角的チェック観点

| 観点               | この Phase での確認内容                                                                      | 主要仕様                                            |
| ------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| アーキテクチャ     | shared core を正本にし、capture の orchestration 重複を除去する                              | `architecture-implementation-patterns.md`           |
| エラーハンドリング | CLI wrapper が exit code と stdout へ変換し、core は report のみ返す                         | `error-handling.md`                                 |
| 品質               | core 実装が Phase 4 の test contract に対応し、Phase 7 の command へ接続できる               | `quality-requirements.md`, `quality-e2e-testing.md` |
| デスクトップ       | `phase11-static-server.mjs` の primitive helper を再利用し、`electron-vite build` 前提を守る | `technology-desktop.md`                             |

## 成果物

| 成果物                | パス                                                                             | 内容                           |
| --------------------- | -------------------------------------------------------------------------------- | ------------------------------ |
| shared preflight core | `apps/desktop/scripts/phase11-current-build-preflight-core.mjs`                  | 4 観点判定の正本               |
| preflight CLI wrapper | `apps/desktop/scripts/phase11-current-build-preflight.mjs`                       | shared core の manual 実行入口 |
| capture integration   | `apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs` | preflight 呼び出しの追加       |
| package script 登録   | `apps/desktop/package.json`                                                      | preflight 起動コマンド         |
| 実装サマリー          | `outputs/phase-5/implementation-summary.md`                                      | 変更対象と検証結果             |

## 完了条件

- [ ] shared preflight core が 4 bucket を判定する
- [ ] thin CLI wrapper が shared core の結果を JSON と exit code へ変換する
- [ ] capture script が preflight 結果を metadata へ保存する
- [ ] package script が追加されている
- [ ] remediation task の UI 修正が実装対象へ入っていない
- [ ] 実装サマリーに除外対象が明記されている

## 次Phase

Phase 6: テスト拡充へ進む。
