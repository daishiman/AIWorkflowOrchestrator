# Lessons Learned（教訓集） / skill domain lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: skill domain lessons

## TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 教訓（2026-03-12）

### 苦戦箇所: `vitest` が通っても build 用 `esbuild` だけアーキ不整合で落ちる

| 項目 | 内容 |
| --- | --- |
| 課題 | x64 Node で `electron-vite build` だけ `@esbuild/darwin-arm64` を掴み、Phase 11 preflight が成立しない |
| 再発条件 | test pass を見て build preflight を後回しにする |
| 対処 | `pnpm install --force` で native dependency を再解決し、`pnpm --filter @repo/desktop build` を Phase 11 の先頭に固定した |
| 標準ルール | UI screenshot task は `typecheck → targeted tests → build` の順で確認する |

### 苦戦箇所: harness HTML を build input に入れないと current build static serve が成立しない

| 項目 | 内容 |
| --- | --- |
| 課題 | harness route を source には置いても、renderer build input に登録しないと `out/renderer/*.html` へ出ない |
| 再発条件 | dev server 前提の capture script をそのまま current build task に流用する |
| 対処 | `electron.vite.config.ts` の `renderer.build.rollupOptions.input` に harness HTML を明示追加した |
| 標準ルール | Phase 11 が current build static serve 条件なら、harness HTML の build 出力有無を先に確認する |

### 苦戦箇所: light capture の所見を current failure と baseline backlog で混同しやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | WorkspaceSearch の dark carryover のような既存問題を、今回差分の失敗として誤判定しやすい |
| 再発条件 | audit summary を 1 つの総件数だけで記録する |
| 対処 | `currentViolations=0 / baselineViolations=64` を別欄に分離し、`discovered-issues.md` でも baseline backlog として routing した |
| 標準ルール | light theme guard は current 判定と baseline routing を必ず二層で残す |

### 苦戦箇所: Apple UI/UX 観点では helper text の沈みがコードレビューより先に見える

| 項目 | 内容 |
| --- | --- |
| 課題 | `text-white/60` のような utility はコード上では許容に見えても、light panel screenshot では情報階層を崩しやすい |
| 再発条件 | color token だけを見て、視線誘導や余白を別軸で見ない |
| 対処 | Phase 11 の所見を hierarchy / contrast / spacing / materiality の4軸で記録した |
| 標準ルール | Apple UI/UX review では light theme の helper text と panel border を別項目で見る |

### 苦戦箇所: screenshot script 単体実行だと static serve 未起動で `ERR_CONNECTION_REFUSED` になる

| 項目 | 内容 |
| --- | --- |
| 課題 | `pnpm --filter @repo/desktop screenshot:light-theme-contrast-guard` を 1 コマンドとして実行しても、4173 の static server がなければ capture が落ちる |
| 再発条件 | preflight 手順を人手運用のまま残し、script 側に localhost fallback を持たせない |
| 対処 | `phase11-static-server.mjs` を追加し、loopback baseUrl が不達な場合は `out/renderer` を auto static serve してから capture するようにした |
| 標準ルール | Phase 11 screenshot script は「外部 server があれば再利用、無ければ current build を自走配信」の順で復旧できるようにする |

### 苦戦箇所: workflow backlog `64` と global unassigned legacy `134` を同じ失敗と誤読しやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | contrast audit の baseline 件数と、`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` 全体の legacy 監査値が別の意味なのに、Phase 12 で 1 つの `baseline` として潰れて見える |
| 再発条件 | `unassigned-task-detection.md` に workflow backlog だけを書き、指定ディレクトリ監査の `current/baseline` を別欄で残さない |
| 対処 | `workflow baseline backlog=64` と `directory baselineViolations=134` を別表へ分離し、既存 normalization task 3件への導線を追加した |
| 標準ルール | Phase 12 で未タスク配置を確認するときは「今回差分の配置」「今回差分の品質」「全体 legacy 状況」の3行を必ず残す |

### 苦戦箇所: Task 5 で `skill-creator` を更新しても root evidence 側へ漏れやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | `skill-feedback-report.md` にだけ `skill-creator` 改善が残り、`documentation-changelog.md` / `spec-update-summary.md` には 2 skill のまま残りやすい |
| 再発条件 | Task 5 を「提案を書くだけ」の工程として扱い、実際に更新した skill 集合を outputs 間で突合しない |
| 対処 | `skill-feedback-report.md` / `documentation-changelog.md` / `spec-update-summary.md` の更新対象 skill 集合を同値化し、`skill-creator` を更新した場合は 3 skill 表記へ揃えた |
| 標準ルール | Phase 12 Task 5 で更新した skill 名は root evidence 3ファイルに同値転記する |

### 同種課題の簡潔解決手順（5ステップ）

1. `typecheck` と targeted test の後に必ず build を通す。
2. harness route が build output に出ているかを `out/renderer` で確認する。
3. current build を static serve し、到達不能なら screenshot script 側の localhost fallback で復旧してから selector-based capture を取る。
4. audit は `current` と `baseline` を別 bucket で集計する。
5. visual review では helper text、panel border、card hierarchy を別々に評価して routing する。

### 関連未タスク

| 未タスクID | 目的 | タスク仕様書 |
| --- | --- | --- |
| UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 | current build capture の preflight を build / harness / baseUrl / native dependency まで含めて 1 コマンドへ束ねる | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-phase11-current-build-preflight-bundle-001.md` |
| UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001 | worktree の native dependency 不整合を事前検知する | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-fix-worktree-native-binary-guard-001.md` |

### 2026-03-11 TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001

#### 苦戦箇所1: `ai.chat` の provider/model 解決元が Main と Renderer でずれて実行経路が不安定

| 項目 | 内容 |
| --- | --- |
| 課題 | Renderer の選択状態と Main 側 `ai.chat` の参照状態が別管理で、意図しない provider/model に送信される |
| 再発条件 | `llmSlice` の状態変更を Main 側へ同期しない |
| 解決策 | `llm:set-selected-config` を追加し、Renderer 選択変更時に Main の選択状態を即時同期 |
| 標準ルール | 実行経路が Main で決まる機能は、UI 選択状態を専用IPCで同期してから送信する |

#### 苦戦箇所2: APIキー更新後に LLM adapter cache が残留し、古い鍵で呼び出す

| 項目 | 内容 |
| --- | --- |
| 課題 | `apiKey:save/delete` 成功後も既存 adapter instance が残り、更新鍵が反映されない |
| 再発条件 | storage 更新だけで cache invalidation を実行しない |
| 解決策 | `apiKey:save/delete` 後に `LLMAdapterFactory.clearInstance(provider)` を実行 |
| 標準ルール | 認証情報更新は「永続化 + 実行キャッシュ無効化」を1セットで実装する |

#### 苦戦箇所3: `auth-key:exists` が boolean のみで、UI が saved/env-fallback を誤判定しやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | `exists` だけでは判定根拠が不足し、Settings の状態表示が曖昧になる |
| 再発条件 | 状態表示に必要な由来情報（保存済み/環境変数）を IPC 契約へ昇格しない |
| 解決策 | `AuthKeyExistsResponse` に `source`（saved/env-fallback/not-set）を追加し、UI は `source` 優先で表示 |
| 標準ルール | UI が複数状態を表示する場合、判定根拠フィールドを IPC レスポンスへ含める |

#### 同種課題の簡潔解決手順（4ステップ）

1. 実行経路（Main）と選択経路（Renderer）を分け、同期チャネルを最初に定義する。
2. 認証情報更新時は storage 更新と runtime cache clear を同時に実施する。
3. UI 状態表示に必要な判定根拠を boolean 以外（`source` 等）で契約化する。
4. Phase 11 で代表状態を screenshot 取得し、`validate-phase11-screenshot-coverage` で証跡整合を固定する。

#### 再確認時の苦戦箇所（2026-03-11）

| 項目 | 内容 |
| --- | --- |
| 苦戦箇所1 | `audit-unassigned-tasks --json` の全体結果（baseline）を、そのまま今回差分のFAILと誤読しやすい |
| 再発条件 | `current` と `baseline` の判定軸を分離せずに報告する |
| 解決策 | `audit --diff-from HEAD` を合否判定に固定し、`current=0` と `baseline=133` を別行で記録 |
| 標準ルール | 未タスク監査は「今回差分合否」と「legacy負債監視」を二層で書く |

| 項目 | 内容 |
| --- | --- |
| 苦戦箇所2 | 既存 screenshot が存在していても、再監査時点の鮮度保証がない |
| 再発条件 | 画像ファイル実在のみで Phase 11 検証を完了扱いにする |
| 解決策 | capture スクリプトを再実行し、`validate-phase11-screenshot-coverage` で TC 紐付けを再確認 |
| 標準ルール | 明示 screenshot 要求時は「再撮影 + coverage validator」を必須セットにする |

| 項目 | 内容 |
| --- | --- |
| 苦戦箇所3 | 仕様同期は完了していても、スキル側改善が履歴化されず再利用導線が弱くなる |
| 再発条件 | workflow 成果物更新で終了し、`skill-creator` / `task-specification-creator` の更新を後回しにする |
| 解決策 | system spec と同ターンで各スキルの `LOGS.md` / `SKILL.md` / ガイドを更新 |
| 標準ルール | Phase 12 再確認は「workflow + system spec + skill docs」の三層を同時同期する |

#### 関連改善タスク

| 未タスクID | 概要 | 参照 | ステータス |
| --- | --- | --- | --- |
| ~~UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001~~ | ~~`cache clear` / Main 同期 / `source` 表示の 3 契約を単一回帰マトリクスで guard し、APIキー連動系の初動を短縮する~~ | `docs/30-workflows/completed-tasks/task-imp-apikey-chat-triple-sync-guard-001.md` | 完了: 2026-03-11 |

### 2026-03-11 TASK-SKILL-LIFECYCLE-01

#### 苦戦箇所1: 一次導線の要件が navigation / feature / state に分散すると入口判断が揺れる

| 項目 | 内容 |
| --- | --- |
| 課題 | `Skill Center` `Agent` `Workspace` `Skill Creator` の責務を別仕様書だけで読むと、「どこから始めるか」が毎回推測になる |
| 再発条件 | job guide を UI 表示だけに置き、コード上の契約正本を持たない |
| 解決策 | `skillLifecycleJourney.ts` に create / use / improve、surface responsibility、advanced route、downstream contract をまとめ、UI と仕様書の共通アンカーにした |
| 標準ルール | 導線再編タスクでは「入口・責務・例外・後続契約」を 1 ファイルへ集約し、仕様書はそのアンカーを参照する |

#### 苦戦箇所2: legacy alias を放置すると shell 分岐と仕様書が二重化する

| 項目 | 内容 |
| --- | --- |
| 課題 | `skill-center` と `skillCenter` が混在すると、render 分岐、テストケース、仕様書の表記がずれてドリフトが起きる |
| 再発条件 | legacy 値を UI 各所で個別吸収し、shell で canonical 化しない |
| 解決策 | `App.tsx` で `normalizeSkillLifecycleView()` を必ず通し、以降の描画・証跡・仕様書は canonical `skillCenter` だけを正本にした |
| 標準ルール | view alias は shell 入口で 1 回だけ正規化し、下流コードと仕様書は正本値に統一する |

#### 苦戦箇所3: Phase 12 は outputs だけ揃っても workflow 本文が stale になりやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | `outputs/phase-12` を先に作ると、`artifacts.json`、`outputs/artifacts.json`、`phase-1..12` 本文、`.claude` 正本の更新漏れが残りやすい |
| 再発条件 | 証跡生成後に台帳同期を別作業に分ける |
| 解決策 | 先に実装・テスト・スクリーンショットを確定し、その後に artifacts / phase files / `.claude` 正本を同ターンで閉じた |
| 標準ルール | Phase 12 完了条件は「outputs + workflow 台帳 + 本文 + system spec」の 4 層同期で判定する |

#### 苦戦箇所4: representative screenshot が shell 全景だけだと責務境界の証跡として弱い

| 項目 | 内容 |
| --- | --- |
| 課題 | Global nav と main content を含む full screenshot だけでは、「どの画面が何を持つか」が 1 枚で読み取りにくい |
| 再発条件 | representative surface を route screenshot の延長で扱い、要素単位の責務ボードを用意しない |
| 解決策 | `SkillCenterView` に surface ownership board を置き、Phase 11 は `data-testid` 待機 + 要素 capture に切り替えた |
| 標準ルール | representative screenshot は shell 全景を既定にせず、責務や state を表す selector / 実文言を待って要素単位で撮る |

#### 苦戦箇所5: 0件報告だけでは unassigned-task ディレクトリ全体の状態を誤認しやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | current task 由来の未タスクが 0 件でも、`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` 全体の legacy baseline が見えず、「指定ディレクトリも健全」と誤読されやすい |
| 再発条件 | `unassigned-task-detection.md` に `件数: 0` だけを書き、`currentViolations` / `baselineViolations` と既存 remediation task を残さない |
| 解決策 | `verify-unassigned-links=213/213`、`audit --diff-from HEAD current=0 / baseline=133`、`format=91 / naming=5 / misplaced=37` を明記し、既存 backlog 3件の参照を固定した |
| 標準ルール | 0件報告では「今回タスク由来 0 件」と「ディレクトリ全体の legacy backlog 継続」を必ず分離し、既存改善未タスクの参照先を併記する |

#### 同種課題の簡潔解決手順（5ステップ）

1. UI 導線再編は job guide をコード契約へ切り出し、view 本体は表示責務だけに寄せる。
2. legacy alias は shell で canonical 化し、下流コードと仕様書は正本値に統一する。
3. Skill Center のような入口画面には主要ジョブだけを明示し、destination surface へ handoff する。
4. Phase 11 は route screenshot だけでなく、責務境界と例外画面を selector-based element capture で証跡化する。
5. Phase 12 は `artifacts.json` / `outputs/artifacts.json` / phase 本文 / `.claude` 正本 / changelog を同一ターンで更新し、0件報告でも `current/baseline` と既存 backlog 参照を残す。

### 2026-03-10 TASK-UI-06-HISTORY-SEARCH-VIEW

#### 苦戦箇所1: worktree では test failure の前に native optional dependency 不整合が起こりうる

| 項目 | 内容 |
| --- | --- |
| 課題 | `vitest` 実行前に `@rollup/rollup-darwin-x64` が見つからず startup error になった |
| 再発条件 | worktree 作成後に install preflight を省略し、そのまま UI screenshot / テストへ進む |
| 解決策 | `pnpm install --frozen-lockfile` を Phase 11 前の preflight に含めた |
| 標準ルール | worktree で renderer 系テストや screenshot を行う前に依存整合を先に通す |

#### 苦戦箇所2: screenshot script の待機条件が broad だと strict mode violation で止まる

| 項目 | 内容 |
| --- | --- |
| 課題 | accordion summary/detail が同じ文字列を持ち、Playwright の text locator が複数一致した |
| 再発条件 | 人間には読めるが DOM 上は一意でない文言を ready condition に使う |
| 解決策 | detail 側でしか現れない text へ待機条件を絞った |
| 標準ルール | screenshot script の ready condition は一意 text または `data-testid` を正本にする |

#### 苦戦箇所3: `.claude` 正本と `.agents` mirror の更新先が混線しやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | workflow / spec-update-summary / phase doc が `.agents/skills/...` を参照し、ユーザー指定の `.claude` 正本とずれた |
| 再発条件 | skill root が二重化された repo で mirror 側だけを更新して完了扱いにする |
| 解決策 | `.claude/skills/...` を canonical root に固定し、mirror drift は未タスクへ分離した |
| 標準ルール | Phase 12 の system spec 更新先は `.claude/skills/...` を唯一の正本として扱う |

#### 同種課題の簡潔解決手順（5ステップ）

1. UIタスクの preflight で install / port / screenshot script を先に確認する。  
2. timeline UI は initial loading / load more / empty を別 state で設計する。  
3. cross-view 導線は `pending payload + view 遷移` の二段構成に分離する。  
4. screenshot script は一意 selector を ready condition にする。  
5. Phase 12 では `.claude` 正本、domain spec、workflow outputs、未タスク、skill docs を同一ターンで同期する。  

