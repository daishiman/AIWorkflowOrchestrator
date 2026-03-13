# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 |
| Phase      | 1                                                 |
| Phase名    | 要件定義                                          |
| カテゴリ   | 改善                                              |
| 優先度     | 中                                                |
| ステータス | completed                                         |
| 前提Phase  | なし                                              |
| 後続Phase  | Phase 2                                           |

## 目的

Phase 11 current build capture で人手確認に分散している前提条件を、1 本の preflight bundle にまとめるための機能要件、非機能要件、受入基準、関心ごと分離レーンを定義する。

## 背景

`TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` では current build static serve、harness HTML、selector-based capture が導入済みである。  
一方で、capture 実行前に確認する `native dependency`、`build output`、`harness route`、`baseUrl` は別々のコマンドで確認している。  
Issue #1167 は closed だが、未タスク指示書と system spec では backlog として残っているため、実装前に正式な task workflow を作る価値がある。

## 実行タスク

- タスク1: 機能要件を定義する
- タスク2: 非機能要件と失敗分類を定義する
- タスク3: 受入基準と検証コマンドを確定する
- タスク4: 関心ごと分離レーンを定義する

### タスク1: 機能要件定義

**目的**: preflight bundle が必ず果たす責務を固定する

**要件一覧**:

| ID   | 要件                                                                                                                             |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- |
| FR-1 | `apps/desktop/scripts/phase11-current-build-preflight-core.mjs` が 4 観点チェックを順番に実行する                                |
| FR-2 | `apps/desktop/scripts/phase11-current-build-preflight.mjs` は thin CLI wrapper として同じ判定結果を JSON と exit code へ変換する |
| FR-3 | `capture-light-theme-contrast-regression-guard-phase11.mjs` は child process ではなく shared core の結果を直接利用する           |
| FR-4 | `apps/desktop/package.json` に preflight 起動用 script を登録する                                                                |
| FR-5 | Phase 11 と Phase 12 の文書が同じ bundle 名と shared contract を参照する                                                         |

### タスク2: 非機能要件と失敗分類

**目的**: 実装の境界条件と failure bucket を固定する

**非機能要件**:

| ID    | 要件                                                                          |
| ----- | ----------------------------------------------------------------------------- |
| NFR-1 | build 未実行と harness 欠落を別 bucket で返す                                 |
| NFR-2 | CLI wrapper と capture consumer の間で preflight 判定ロジックを二重実装しない |
| NFR-3 | localhost baseUrl と remote baseUrl を別ルールで扱う                          |
| NFR-4 | guidance 文面は次の 1 手をコマンド付きで示す                                  |
| NFR-5 | current と baseline の監査結果を Phase 12 で分離記録する                      |

**失敗分類**:

| Bucket  | 判定対象                                               | 失敗時の次アクション                                    |
| ------- | ------------------------------------------------------ | ------------------------------------------------------- |
| native  | esbuild 等の native dependency                         | `pnpm install --force` または親ガード task の手順へ誘導 |
| build   | `pnpm --filter @repo/desktop build` の出力             | build 実行または build error の解消へ誘導               |
| harness | `out/renderer/phase11-light-theme-contrast-guard.html` | renderer input 登録と出力確認へ誘導                     |
| baseUrl | `PHASE11_CAPTURE_BASE_URL` への疎通                    | localhost fallback または URL 修正へ誘導                |

### タスク3: 受入基準と検証コマンド

**目的**: 完了判定をコマンド単位で固定する

**検証コマンド候補**:

| コマンド                                                                                                                                                                         | 目的                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `pnpm --filter @repo/desktop exec vitest run scripts/phase11-current-build-preflight.test.ts`                                                                                    | preflight unit test             |
| `pnpm --filter @repo/desktop build`                                                                                                                                              | current build artifact 生成確認 |
| `node apps/desktop/scripts/phase11-current-build-preflight.mjs --json`                                                                                                           | preflight bundle 実行確認       |
| `pnpm --filter @repo/desktop screenshot:light-theme-contrast-guard`                                                                                                              | capture integration 確認        |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/ut-imp-phase11-current-build-preflight-bundle --strict` | workflow 仕様書検証             |

### タスク4: 関心ごと分離レーン定義

**目的**: Atent Team 相当の責務境界を仕様書上で先に固定する

**レーン定義**:

| レーン | 作業範囲                                              | 非対象                         |
| ------ | ----------------------------------------------------- | ------------------------------ |
| Lane A | script contract、CLI 引数、JSON schema、exit code     | Phase 12 の文書更新            |
| Lane B | capture script 接続、package script、manual test 導線 | native dependency 修復そのもの |
| Lane C | task-workflow、lessons-learned、workflow spec 更新    | screenshot UI remediation      |

## 参照資料

| 参照資料                 | パス                                                                                                   | 説明                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | -------------------------------- |
| 元未タスク指示書         | `../unassigned-task/task-imp-phase11-current-build-preflight-bundle-001.md`                            | backlog の原文                   |
| 親 workflow 実装サマリー | `../completed-tasks/light-theme-contrast-regression-guard/outputs/phase-5/implementation-summary.md`   | current build capture の既存構成 |
| 親 workflow 文書更新履歴 | `../completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/documentation-changelog.md` | 未タスク化の背景                 |
| 参照 Issue               | `../issues/issue-1167.md`                                                                              | closed issue の記録              |

### システム仕様（aiworkflow-requirements）

> 正本仕様は `spec-reference-matrix.md` で抽出済み。Phase 1 では以下を必須集合として扱う。

| 参照資料         | パス                                                                                                  | 内容                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 抽出入口         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                      | Progressive Disclosure で必要仕様を切り出す入口                                              |
| 検索順序         | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                   | `light theme contrast guard` / `phase11-static-server` / `selector-based capture` の検索導線 |
| 親 workflow 正本 | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md` | current build static serve と representative screenshot の契約                               |
| task 台帳        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                  | backlog と completed routing の正本                                                          |
| 教訓集           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                | build 先行、harness 出力確認、current と baseline 分離                                       |
| feature catalog  | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                       | representative screen と backlog routing                                                     |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                           | test、build、manual review の基準                                                            |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`           | shared core と consumer の責務分離                                                           |
| エラー処理       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                 | failure bucket と guidance 表現                                                              |
| desktop build    | `.claude/skills/aiworkflow-requirements/references/technology-desktop.md`                             | current build artifact と localhost fallback の前提                                          |

## 実行手順

### ステップ1: 元タスクと既存導線を分解する

未タスク指示書、親 workflow、現行 capture script の責務を分離し、どこに preflight 断片があるかを洗い出す。

### ステップ2: FR/NFR/AC と失敗 bucket を固定する

shared core、thin CLI、capture consumer の 3 層で責務を分け、4 bucket と next action を表へ落とす。

### ステップ3: 正本仕様の入口を固定する

`resource-map.md` と `quick-reference.md` を起点に、Phase 2 で読むべき aiworkflow 正本を最小集合で確定する。

## 統合テスト連携

- Phase 4 で success と 4 failure bucket の test case を固定する。
- Phase 5 で preflight bundle と capture integration を実装し、Phase 7 でコマンド検証ログへ反映する。
- Phase 11 で current build capture 前に preflight を実行し、Phase 12 で current と baseline の監査結果を分離記録する。

## 多角的チェック観点

| 観点               | この Phase での確認内容                                       | 主要仕様                                                                                                                                     |
| ------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| アーキテクチャ     | shared core、CLI、capture の責務境界を先に分ける              | `architecture-implementation-patterns.md`                                                                                                    |
| エラーハンドリング | failure bucket ごとに次アクションを要件へ落とす               | `error-handling.md`                                                                                                                          |
| 品質               | test・build・manual review の受入条件を AC へ落とす           | `quality-requirements.md`                                                                                                                    |
| デスクトップ       | current build artifact と localhost fallback の前提を固定する | `technology-desktop.md`                                                                                                                      |
| 文書同期           | current/baseline 分離を Phase 12 要件へ入れる                 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |

## 成果物

| 成果物            | パス                                         | 内容                                       |
| ----------------- | -------------------------------------------- | ------------------------------------------ |
| 要件定義サマリー  | `outputs/phase-1/requirements-definition.md` | FR、NFR、制約、依存                        |
| 受入基準一覧      | `outputs/phase-1/acceptance-criteria.md`     | AC-1 から AC-6                             |
| 4観点チェック行列 | `outputs/phase-1/preflight-check-matrix.md`  | native、build、harness、baseUrl の判定基準 |
| スコープ定義      | `outputs/phase-1/scope-definition.md`        | 含むもの、含まないもの                     |
| レーン定義        | `outputs/phase-1/team-lane-definition.md`    | Lane A-C の責務境界                        |

## 完了条件

- [ ] FR-1 から FR-5 が表形式で定義されている
- [ ] NFR-1 から NFR-5 が表形式で定義されている
- [ ] 4 つの failure bucket と次アクションが定義されている
- [ ] 検証コマンドが 5 本そろっている
- [ ] shared core、thin CLI、capture consumer の責務境界が定義されている
- [ ] Lane A-C の責務境界が定義されている

## 次Phase

Phase 2: 設計へ進む。
