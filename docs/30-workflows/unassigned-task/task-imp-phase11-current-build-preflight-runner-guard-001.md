# UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-RUNNER-GUARD-001: Phase 11 current build preflight runner ガード

## メタ情報

```yaml
issue_number: 1200
task_id: UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-RUNNER-GUARD-001
task_name: Phase 11 current build preflight runner ガード
category: 改善
target_feature: Phase 11 current build screenshot preflight / Playwright browser preflight / destructive failure simulation
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 Phase 12 follow-up
created_date: 2026-03-13
dependencies:
  - UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001
```

| 項目         | 内容                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-RUNNER-GUARD-001                                                     |
| タスク名     | Phase 11 current build preflight runner ガード                                                              |
| 分類         | 改善                                                                                                        |
| 対象機能     | Phase 11 current build screenshot preflight / Playwright browser preflight / destructive failure simulation |
| 優先度       | 中                                                                                                          |
| 見積もり規模 | 中規模                                                                                                      |
| ステータス   | 未実施                                                                                                      |
| 発見元       | UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 Phase 12 follow-up                                        |
| 発見日       | 2026-03-13                                                                                                  |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 で、current build capture の preflight は `native / build / harness / baseUrl` まで bundle 化できた。一方で、実行時に残った 2 つの難所である「Playwright browser cache 欠落」と「shared artifact を壊す failure simulation の serial 実行」は、まだドキュメント運用に依存している。

### 1.2 問題点・課題

- `chromium.launch()` 前に browser 実行ファイルの存在を確認していないため、preflight が PASS でも capture 本体で `browserType.launch: Executable doesn't exist` が発生しうる
- `build missing / harness missing / baseUrl unreachable` の failure simulation は serial 実行が前提だが、runner 側で順序や復旧を強制していない
- 苦戦箇所は system spec に記録済みでも、次回実行者は script 実体からその制約を読み取れない
- completed workflow の Phase 12 出力を 0 件で閉じた後に follow-up を formalize すると、workflow 出力、task-workflow、system spec の同期が別ターンになりやすい

### 1.3 放置した場合の影響

- 同種の screenshot 再監査で、環境不備を UI regress と誤分類する空転が続く
- destructive failure simulation を並列で流して bucket が混線し、どの前提が壊れていたのか再現できなくなる
- 「実装済み preflight bundle」と「実行運用で残る手順」の境界が曖昧になり、次回の current build task で同じ切り分けをやり直す

## 2. 何を達成するか（What）

### 2.1 目的

Phase 11 current build screenshot 再監査に必要な残運用を runner へ寄せ、browser preflight と destructive failure simulation を決定論的に扱えるようにする。

### 2.2 最終ゴール

1. capture 実行前に Playwright browser 実行ファイルの有無が判定され、欠落時は deterministic な復旧導線または fail-fast メッセージが出る
2. `build / harness / baseUrl` の destructive failure simulation が serial 実行・前提復旧込みで記録される
3. completed workflow / `task-workflow.md` / `lessons-learned.md` / `workflow-light-theme-contrast-regression-guard.md` が同じ未タスク ID で追跡できる

### 2.3 スコープ

#### 含むもの

- `apps/desktop/scripts/phase11-current-build-preflight*.mjs` の browser preflight hardening
- `capture-light-theme-contrast-regression-guard-phase11.mjs` など current build capture script の browser launch 前ガード
- destructive failure simulation を serial 実行する helper または test harness の追加
- completed workflow `outputs/phase-12/` と system spec 正本の follow-up 同期
- 親タスクの苦戦箇所を `3.5` と system spec に固定する

#### 含まないもの

- light theme remediation 自体の UI 修正
- Playwright dependency の repo-wide 再設計
- 新しい screenshot surface や TC の追加
- `UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001` が扱う native dependency 全般の検出ロジック拡張

### 2.4 成果物

- 本未タスク指示書
- browser preflight hardening を含む runner 差分
- serial failure simulation の実行 helper / test 差分
- 更新済み completed workflow Phase 12 成果物
- 更新済み system spec 正本と検証ログ

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001` の completed workflow と script 実装を参照できること
- `apps/desktop/scripts/phase11-current-build-preflight-core.test.ts` と関連 script test を実行できること
- `.claude/skills/aiworkflow-requirements/` を canonical root として更新できること

### 3.2 依存タスク

- `UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001`

### 3.3 必要な知識

- `phase11-current-build-preflight-core.mjs` の bucket 構造
- Playwright `chromium.launch()` の失敗パターン
- `out/renderer` と harness HTML の build artifact 依存
- Phase 12 の未タスク監査（`verify-unassigned-links` / `audit-unassigned-tasks`）

### 3.4 推奨アプローチ

1. browser 実行ファイル確認と destructive failure simulation を別 concern として扱う
2. preflight の pass/fail bucket と capture 本体の launch 失敗を分離せず、runner レイヤで同一契約へ寄せる
3. shared artifact を壊すケースは helper 側で serial 実行順と cleanup を固定し、人手運用を減らす
4. 未タスク化したら completed workflow outputs と system spec を同一ターンで同期する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                  | 発見経緯                                                                                                                               | 解決策                                                                                                          | 教訓                                                                                       |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Playwright browser cache 欠落を UI regress と誤分類しやすい           | screenshot 再取得の初回が `browserType.launch: Executable doesn't exist` で止まり、見た目の regress と無関係なのに UI 側の問題に見えた | `pnpm --filter @repo/desktop exec playwright install chromium` で復旧し、same-day evidence を再同期した         | Playwright 実行ファイル欠落は UI issue ではなく environment preflight として先に切り分ける |
| destructive failure simulation を parallel に流すと bucket が混線する | `build missing / harness missing / baseUrl unreachable` が shared `out/renderer` を壊し、前ケースの副作用が次ケースへ漏れた            | `build -> harness -> baseUrl` を serial で 1 件ずつ実行し、各ケース後に build output と metadata 前提を復旧した | shared artifact を触る failure simulation は runner 側で serial 固定にする                 |
| 復旧後の evidence と文書時刻がズレやすい                              | browser install 後に screenshot だけ再取得し、`manual-test-result.md` や metadata の `capturedAt` を更新し忘れやすい                   | screenshot / metadata / manual test spec を同一ターンで再同期した                                               | environment recovery を挟んだ場合は証跡 3 点を同時更新する                                 |

### 3.6 SubAgent 分担

| SubAgent   | 関心ごと                         | 主担当成果物                                                              |
| ---------- | -------------------------------- | ------------------------------------------------------------------------- |
| SubAgent-A | browser preflight / launch guard | browser availability check、launch 前 fail-fast 契約、script test         |
| SubAgent-B | destructive failure simulation   | serial runner、cleanup、bucket 切り分け test                              |
| SubAgent-C | system spec / workflow sync      | unassigned-task、task-workflow、lessons、workflow guard、Phase 12 outputs |
| SubAgent-D | validation / mirror sync         | links / audit / generate-index / mirror diff                              |

## 4. 実行手順

### Phase構成

- Phase A: runner gap の再現と責務分離
- Phase B: browser preflight hardening
- Phase C: destructive failure simulation の serial 化
- Phase D: Phase 12 / system spec の再同期

### Phase A: runner gap の再現と責務分離

#### 目的

どこまでが既存 preflight bundle、どこからが未自動化の実行運用かを切り分ける。

#### 手順

1. `phase11-current-build-preflight-core.mjs`、CLI wrapper、capture script を読み、bucket 境界を確認する。
2. `chromium.launch()` 前後の失敗パターンと destructive failure simulation の実行順を列挙する。
3. browser preflight と serial runner の差分を別 concern として整理する。

#### 成果物

- gap 分析メモ
- 更新対象 script / test / doc 一覧

#### 完了条件

- browser preflight と serial runner が別責務として説明できる

### Phase B: browser preflight hardening

#### 目的

Playwright browser 実行ファイル欠落を capture 本体ではなく preflight 契約で扱う。

#### 手順

1. browser 実行ファイルの存在確認または dry launch check を preflight に追加する。
2. 欠落時のエラーメッセージを `pnpm --filter @repo/desktop exec playwright install chromium` へ収束させる。
3. capture script が preflight 結果を見て `chromium.launch()` 前に停止できるようにする。

#### 成果物

- 更新済み preflight core / capture script
- browser preflight test

#### 完了条件

- `browserType.launch: Executable doesn't exist` を preflight 層で検出または明示 fail-fast できる

### Phase C: destructive failure simulation の serial 化

#### 目的

shared artifact を壊す検証を 1 ケースずつ再現可能にする。

#### 手順

1. `build missing / harness missing / baseUrl unreachable` を serial 実行する helper または test harness を追加する。
2. 各ケース後に `out/renderer`、harness file、metadata 前提を復旧する。
3. 結果を bucket ごとに独立記録し、前ケースの副作用が残らないことを確認する。

#### 成果物

- serial simulation helper / test
- cleanup 手順

#### 完了条件

- destructive failure simulation の順序と復旧が script / test で固定される

### Phase D: Phase 12 / system spec の再同期

#### 目的

未タスク化した follow-up を completed workflow と system spec 正本へ同じ ID で反映する。

#### 手順

1. `docs/30-workflows/unassigned-task/` に本指示書を配置する。
2. completed workflow `outputs/phase-12/unassigned-task-detection.md` / `documentation-changelog.md` / `spec-update-summary.md` を follow-up 1 件として追記する。
3. `task-workflow.md` / `lessons-learned.md` / `workflow-light-theme-contrast-regression-guard.md` / `LOGS.md` / `SKILL.md` を同一ターンで更新する。
4. `verify-unassigned-links`、`audit --diff-from HEAD --target-file ...`、`generate-index.js`、mirror sync を実行する。

#### 成果物

- 更新済み workflow outputs
- 更新済み system spec 正本
- 検証ログ

#### 完了条件

- 未タスク ID と参照先が workflow outputs / system spec / unassigned-task で一致する

## 5. 完了条件チェックリスト

### 機能要件

- [ ] browser 実行ファイル欠落が preflight 層で検出または deterministic に案内される
- [ ] destructive failure simulation が serial 実行と cleanup を持つ
- [ ] capture script が preflight 結果を踏まえて launch 前に停止できる

### 品質要件

- [ ] relevant script tests が PASS する
- [ ] `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-imp-phase11-current-build-preflight-runner-guard-001.md` で `currentViolations.total = 0`
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` が PASS する
- [ ] `.claude` と `.agents` の skill mirror に drift がない

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow.md` と `workflow-light-theme-contrast-regression-guard.md` に関連未タスクとして登録されている
- [ ] `lessons-learned.md` に親タスクの苦戦箇所と follow-up 導線がある
- [ ] completed workflow `outputs/phase-12/` に follow-up 記録が残っている

## 6. 検証方法

### テストケース

- Case 1: browser 実行ファイルが存在する環境で preflight / capture が PASS する
- Case 2: browser 実行ファイル欠落時に UI regress 扱いせず、preflight で復旧導線または fail-fast が出る
- Case 3: `build missing -> harness missing -> baseUrl unreachable` の順で実行しても各 bucket が独立記録される
- Case 4: unassigned-task / workflow outputs / system spec の ID と参照先が一致する

### 検証手順

```bash
pnpm --filter @repo/desktop test:run scripts/phase11-current-build-preflight-core.test.ts scripts/phase11-current-build-preflight.test.ts
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-imp-phase11-current-build-preflight-runner-guard-001.md
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
```

## 7. リスクと対策

| リスク                                                 | 影響度 | 発生確率 | 対策                                                                               |
| ------------------------------------------------------ | ------ | -------- | ---------------------------------------------------------------------------------- |
| browser install を自動化しすぎて環境依存差分を隠す     | 中     | 中       | まずは fail-fast と復旧導線を固定し、自動 install は opt-in に留める               |
| destructive case の cleanup 漏れで次ケースが汚染される | 高     | 中       | serial helper に前提復旧を組み込み、各ケース後に build artifact の存在を再確認する |
| workflow outputs と system spec の件数がずれる         | 中     | 高       | 未タスク作成ターンで `verify-unassigned-links` と relevant docs 更新を同時実施する |

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/completed-tasks/ut-imp-phase11-current-build-preflight-bundle/outputs/phase-12/unassigned-task-detection.md`
- `apps/desktop/scripts/phase11-current-build-preflight-core.mjs`
- `apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs`

## 9. 備考

- 本タスクは light theme remediation ではなく、Phase 11 current build runner の運用 hardening を扱う
- `UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001` が native dependency 全般、こちらが Phase 11 screenshot 実行レイヤの残運用を扱う
