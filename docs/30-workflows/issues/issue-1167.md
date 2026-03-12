# [#1167] "[UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001] Phase 11 current build capture preflight バンドル化"

## メタ情報

```yaml
task_id: UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001
task_name: Phase 11 current build capture preflight バンドル化
category: 改善
target_feature: Phase 11 screenshot capture / current build harness / guard workflow
priority: 中
scale: 小規模（2-4時間）
status: 未実施
source_phase: TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 Phase 12
created_date: 2026-03-12
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-phase11-current-build-preflight-bundle-001.md
```

| 項目       | 内容              |
| ---------- | ----------------- |
| 優先度     | 中                |
| 規模       | 小規模（2-4時間） |
| ステータス | 未実施            |

---

task_id: UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001
task_name: Phase 11 current build capture preflight バンドル化
category: 改善
target_feature: Phase 11 screenshot capture / current build harness / guard workflow
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 Phase 12
created_date: 2026-03-12
dependencies:

- TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001
- UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001

---

# Phase 11 current build capture preflight バンドル化 - タスク指示書

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` では、Phase 11 の current build screenshot を安定取得するために `phase11-static-server.mjs`、専用 harness HTML、selector-based capture を実装した。一方で、capture 開始前の build readiness、native dependency 状態、harness HTML 出力有無、loopback baseUrl 疎通確認はまだ複数ステップの人手確認に分かれている。

### 1.2 問題点・課題

1. `vitest` が通っても `electron-vite build` だけ native dependency 不整合で落ちるケースを、capture 実行前に 1 コマンドで検知できない
2. harness route を source に追加しても build input 登録漏れがあると `out/renderer/*.html` に出ず、失敗理由が screenshot script 実行時まで遅延する
3. current build static serve fallback は実装済みだが、build 未実行・asset 未生成・route 不在をまとめて報告する preflight bundle がない
4. 同種タスクで毎回 `build -> output確認 -> 疎通確認 -> capture` を手作業で踏むため、再監査コストが高い

### 1.3 放置した場合の影響

- Phase 11 screenshot 系タスクで同じ preflight 漏れを繰り返す
- `ERR_CONNECTION_REFUSED` や harness 未出力を UI不具合と誤読しやすい
- current build capture の再現性が人依存のまま残る

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 11 current build capture に必要な前提確認を 1 つの preflight bundle へ集約し、失敗理由を「依存」「build」「harness」「疎通」に分けて即時判断できるようにする。

### 2.2 最終ゴール

1. `pnpm --filter @repo/desktop screenshot:<feature>` の前に共通 preflight を実行すると、native dependency / build / harness / baseUrl の状態が機械的に分かる
2. capture script 側が preflight 結果を消費でき、失敗時に次のアクションが明示される
3. Phase 11/12 文書と system spec が同じ preflight bundle 名で参照できる

### 2.3 スコープ

#### 含むもの

- Phase 11 current build capture 用 preflight script または wrapper の追加
- native dependency / build output / harness HTML / baseUrl 疎通の 4 観点チェック
- capture script との接続、および Phase 11/12 ドキュメント・system spec への反映

#### 含まないもの

- light theme remediation 自体の UI 修正
- `ThemeSelector` / `AuthView` / `WorkspaceSearchPanel` の配色変更
- `UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001` が扱う汎用 worktree native binary 修正そのもの

### 2.4 成果物

- `apps/desktop/scripts/phase11-current-build-preflight.mjs` もしくは同等の wrapper
- preflight の unit test
- 更新済み capture script / Phase 11 checklist / Phase 12 summary
- 更新済み system spec（`task-workflow.md`, `lessons-learned.md`, `workflow-light-theme-contrast-regression-guard.md`）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` の workflow と screenshot 資産が存在する
- `apps/desktop/scripts/phase11-static-server.mjs` が利用可能である
- `verify-unassigned-links.js` と `audit-unassigned-tasks.js` が利用可能である

### 3.2 依存タスク

- `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001`
- `UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001`

### 3.3 必要な知識

- `electron-vite` の renderer build input と `out/renderer` 出力構造
- current build static serve と loopback fallback の仕組み
- `aiworkflow-requirements` の light theme guard 正本と `task-specification-creator` の未タスク運用

### 3.4 推奨アプローチ

1. preflight bundle を `checkNativeDependencies -> ensureBuildOutput -> assertHarnessRoute -> probeOrServeBaseUrl` の4段階で分割する
2. capture script は preflight JSON を読み、失敗理由別に exit code と guidance を返す
3. Phase 11/12 文書では preflight bundle 名と出力 JSON パスを固定し、同じ名称を system spec にも転記する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                      | 発見経緯                                                                                               | 解決策                                                                           | 教訓                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `vitest` は通るのに build だけ `esbuild` 不整合で落ちる   | `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` で screenshot 実行直前に build failure が判明した | native dependency と build を preflight bundle の先頭に固定する                  | screenshot task は test pass だけで進めず、build readiness を独立判定する |
| harness HTML を source に置いても build output に出ない   | `phase11-light-theme-contrast-guard.html` を追加しただけでは route が配信されなかった                  | `rollupOptions.input` と `out/renderer/*.html` 実在確認を同じ preflight に入れる | harness route は source 配置と build 出力確認を 1 セットで扱う            |
| localhost server 未起動で `ERR_CONNECTION_REFUSED` になる | capture script 単体実行時に 4173 疎通がなく、失敗理由の切り分けに時間がかかった                        | `probeStaticServer` と auto static serve を preflight と capture で共通化する    | baseUrl 疎通失敗は UI不具合ではなく環境失敗として先に分離する             |
| current と baseline の論点が混ざる                        | preflight failure、visual backlog、global unassigned legacy が別物なのに 1 つの失敗に見えた            | preflight failure / current diff / baseline backlog を別 bucket へ分離する       | 失敗種別の混線を防ぐには、preflight 結果も visual audit と別台帳にする    |

---

## 4. 実行手順

### Phase構成

- Phase A: preflight contract 設計
- Phase B: preflight script / test 実装
- Phase C: capture integration と文書同期

### Phase A: preflight contract 設計

#### 目的

current build capture で必須な前提確認項目を固定する。

#### 手順

1. `light-theme-contrast-guard.mjs` / `phase11-static-server.mjs` / existing unassigned tasks を読み、既存 preflight 断片を棚卸しする
2. native dependency / build output / harness route / baseUrl の4観点を JSON schema 化する
3. 失敗時の guidance 文言と exit code 方針を決める

#### 成果物

- preflight contract メモ
- JSON 出力項目一覧

#### 完了条件

- 4観点の判定基準が 1 枚の設計メモに固定されている

### Phase B: preflight script / test 実装

#### 目的

current build capture 用の preflight bundle をスクリプトとして実装する。

#### 手順

1. `phase11-current-build-preflight.mjs` を追加し、4観点の判定を順番に実装する
2. build output と harness HTML 実在確認、baseUrl 疎通確認、fallback 可否判定を実装する
3. script test を追加し、成功 / native dependency 不整合 / harness 欠落 / baseUrl 不達の各ケースを固定する

#### 成果物

- preflight script
- unit test

#### 完了条件

- 失敗理由が 4観点で判別でき、各ケースの test が PASS する

### Phase C: capture integration と文書同期

#### 目的

capture 実行手順と system spec を preflight bundle 名で統一する。

#### 手順

1. `capture-light-theme-contrast-regression-guard-phase11.mjs` など current build capture script から preflight bundle を呼ぶ
2. workflow `manual-test-plan.md` / `implementation-guide.md` / `unassigned-task-detection.md` に preflight 名と分岐を記載する
3. `task-workflow.md` / `lessons-learned.md` / `workflow-light-theme-contrast-regression-guard.md` に関連未タスク導線を追加する

#### 成果物

- 更新済み capture script
- 更新済み workflow outputs
- 更新済み system spec

#### 完了条件

- capture script と文書が同じ preflight bundle 名を参照し、未タスク導線も一致している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] current build capture 用 preflight bundle が 1 コマンドで実行できる
- [ ] native dependency / build output / harness route / baseUrl の4観点を判定できる
- [ ] capture script が preflight 結果を利用して失敗理由を分岐できる

### 品質要件

- [ ] preflight unit test が PASS する
- [ ] `verify-unassigned-links` が PASS する
- [ ] `audit-unassigned-tasks --json --diff-from HEAD` が `currentViolations=0` になる

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] 親 workflow の `outputs/phase-12/unassigned-task-detection.md` に本タスクが登録されている
- [ ] `aiworkflow-requirements` 側に本タスクの導線と苦戦箇所が同期されている

---

## 6. 検証方法

### テストケース

- Case 1: native dependency が正常な状態で preflight が success を返す
- Case 2: harness HTML が build output にない場合に `harness-missing` 系の guidance を返す
- Case 3: baseUrl が不達でも loopback fallback 可なら recoverable と判定する
- Case 4: `verify-unassigned-links` と `audit-unassigned-tasks` が PASS する

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run scripts/phase11-current-build-preflight.test.ts
pnpm --filter @repo/desktop build
node apps/desktop/scripts/phase11-current-build-preflight.mjs --base-url http://127.0.0.1:4173
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/task-imp-phase11-current-build-preflight-bundle-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                                                | 影響度 | 発生確率 | 対策                                                                                                  |
| --------------------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------- |
| 既存 capture script ごとに preflight 実装が分岐し再重複する           | 中     | 中       | preflight bundle を独立 script として先に作り、capture script から呼ぶだけにする                      |
| native dependency 修復まで bundle に抱え込み責務が肥大化する          | 中     | 低       | 修復は `UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001` へ委譲し、本タスクは検知と guidance に限定する       |
| preview 系 / current build 系 / completed workflow 系の導線が混線する | 中     | 中       | スコープを current build capture に限定し、completed workflow や preview 専用運用は参照だけにとどめる |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-5/implementation-summary.md`
- `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/unassigned-task/task-fix-worktree-native-binary-guard-001.md`
- `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/unassigned-task/task-imp-workspace-phase11-current-build-capture-guard-001.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `apps/desktop/scripts/light-theme-contrast-guard.mjs`
- `apps/desktop/scripts/phase11-static-server.mjs`
- `apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
今回の実装では current build static serve と fallback を入れたが、build / harness /疎通の preflight はまだ人手確認が残る。
```

### 補足事項

- 本タスクはユーザー指定に合わせて `docs/30-workflows/unassigned-task/` 配下へ配置する。
- completed workflow 由来の教訓を global unassigned task へ formalize し、同種の current build capture task から再利用できる状態を優先する。
