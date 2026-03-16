# Lessons Learned（教訓集） / auth / ipc lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: auth / ipc lessons

## TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 再監査（2026-03-08）

### 苦戦箇所: Phase 1 正本と outputs の FR がずれていると、未タスク判定まで連鎖して壊れる

| 項目 | 内容 |
| --- | --- |
| 課題 | `phase-1-requirements.md` では FR-04 が unregister 安全性なのに、`outputs/phase-1/requirements-definition.md` では成功ログ要件へ変質していた |
| 影響 | Phase 10 の MINOR 判定、未タスク起票、Phase 12 レポート、security spec の残課題リンクまで誤誘導された |
| 解決策 | Phase 1 正本を基準に outputs/Phase 10/Phase 12/system spec を再同期し、success log 候補は close、ログサニタイズだけを親タスク内で解消した |
| 標準ルール | 仕様ずれを見つけたら、要件正本 → レビュー結果 → 未タスク → system spec の順で連鎖確認する |

### 苦戦箇所: ユーザーが画面検証を要求したのに Phase 11 が CLI代替検証のまま残る

| 項目 | 内容 |
| --- | --- |
| 課題 | `phase-11-manual-test.md` に `## テストケース` と `## 画面カバレッジマトリクス` がなく、`manual-test-result.md` も `TC-ID + 証跡` 形式でなかった |
| 影響 | `validate-phase11-screenshot-coverage` が失敗し、画面検証要求に対して実証跡を返せなかった |
| 解決策 | current workflow 配下へ専用 screenshot script を追加し、Dashboard / Settings / Skill Center の代表 surface 3件を再取得した |
| 標準ルール | 画面検証要求がある場合、UI差分の有無に関わらず `TC-ID + SCREENSHOT + S-1〜S-4` を current workflow 配下へ残す |

### 苦戦箇所: `skipAuth=true` が persist bug の再現経路を殺して false negative になる

| 項目 | 内容 |
| --- | --- |
| 課題 | `skipAuth=true` は screenshot 取得を安定化できる一方、auth / App shell 初期化順序由来の bug path を bypass し、`localStorage.clear()` や forced reload の再発確認には使えない場合がある |
| 影響 | screenshot が PASS でも、通常ルートでは debug side effect が残っている可能性を見落とす |
| 解決策 | bug path の確認は通常ルートで `navigation.type` / debug log absence / persist snapshot を metadata 記録し、画面証跡だけ dedicated harness へ分離した |
| 標準ルール | 「bug path 検証」と「screenshot path」は分離して設計する。`skipAuth=true` は screenshot 安定化の補助手段であり、唯一の検証経路にしない |

### 苦戦箇所: `validate-phase-output` の呼び方がテンプレートと正本でずれていた

| 項目 | 内容 |
| --- | --- |
| 課題 | `references/commands.md` は位置引数指定なのに、テンプレートと一部 task doc は `--phase 12` を付けた誤った例を残していた |
| 影響 | branch横断監査表や task doc に誤検証の前提が残り、実態と違う FAIL 記録が残った |
| 解決策 | task-specification-creator の template / agent / phase-template を canonical call に統一し、current task と task-workflow の現行表記も修正した |
| 標準ルール | 検証コマンドは `references/commands.md` を唯一の正本とし、テンプレート側の例も同一ターンで更新する |

### 同種課題の簡潔解決手順（4ステップ）

1. 要件正本と outputs の FR/AC/NFR を最初に突合し、ドリフトを先に潰す。
2. Phase 11 は `TC-ID` / `画面カバレッジマトリクス` / `manual-test-result` / `screenshots/` の4点を current workflow 配下へ揃える。
3. `artifacts.json` / `index.md` / Phase 12 changelog を同一ターンで同期する。
4. `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` を連続実行し、結果を system spec へ反映する。

### 関連未タスク（TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 から派生）

| タスクID | 概要 | 指示書パス |
|---|---|---|
| UT-IMP-PHASE11-HARNESS-LIFECYCLE-001 | Phase 11 harness ファイルのライフサイクル管理（作成・削除・本番混入防止） | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/unassigned-task/task-imp-phase11-harness-lifecycle-001.md` |
| UT-IMP-APP-TEST-MOCK-CENTRALIZATION-001 | App.tsx テスト共有モックファクトリ集約（テスト間の重複モック排除） | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/unassigned-task/task-imp-app-test-mock-centralization-001.md` |

---

## 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001: SettingsView 統合回帰強化（2026-03-08）

### 実装内容

- `SettingsView.integration.test.tsx` を 18 テストへ拡張し、auth-mode 切替・provider fallback・status 表示条件・保存導線を回帰対象へ統合
- `settings-test-harness.ts` で store mock と `window.electronAPI` mock を一本化し、ケース差分を options で注入
- Phase 11 実画面検証として `TC-11-03-settings-shell.png` / `TC-11-04-authmode-apikey.png` を取得し、manual test 証跡へ同期

### 苦戦箇所

#### 1. screenshot 検証の初回失敗（ポート競合 + 操作タイムアウト）

- **再発条件**: 既存 dev サーバーが残った状態で Playwright を直接実行する場合
- **症状**: 画面遷移前に timeout し、証跡が欠落する
- **解決策**: 専用 E2E spec を用意し、スクリーンショット取得責務を分離して再実行

#### 2. `act()` warning の残存

- **再発条件**: `apiKey.list()` の非同期更新完了を待たずに assertion を終える場合
- **症状**: テストは PASS でも warning が混在し、ノイズになる
- **解決策**: warning 0件化を未タスク（UT-08-001）へ切り出し、待機パターン標準化を継続

#### 3. Phase 12 changelog に「予定」表現が残る

- **再発条件**: 作業前に changelog を先行記述する場合
- **症状**: 実績と文書が乖離し、完了判定が曖昧化
- **解決策**: 完了済み変更のみ記載し、予定は排除する運用へ統一

### 同種課題の簡潔解決手順（4ステップ）

1. UI証跡が必要なタスクは専用 screenshot spec を先に用意する。
2. 統合テストは harness で state/API 境界を集約し、子コンポーネントの過剰モックを避ける。
3. `act()` warning は「既知」として放置せず未タスク化し、解消期限を管理する。
4. Phase 12 changelog は実績ベースで更新し、`verify-all-specs` で最終突合する。

---

## TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001: Profile / Avatar fallback ハンドラ追加（2026-03-08）

### 苦戦箇所: Profile / Avatar fallback の追加漏れで `No handler registered` が再発する

| 項目 | 内容 |
| --- | --- |
| 課題 | Auth fallback があっても `profile:*` / `avatar:*` が未登録だと Renderer 側で runtime 例外が続く |
| 再発条件 | Supabase 依存チャネル追加時に Auth だけを fallback 化し、Profile / Avatar の群登録を後回しにする |
| 対処 | `channels.ts` の件数を正本にし、Profile 11 / Avatar 3 を `ReadonlyArray` + `for...of` で宣言的登録して integration test で固定する |
| 標準ルール | Supabase 依存 handler の追加は Auth / Profile / Avatar の fallback 群を同一ターンで点検する |

### 苦戦箇所: transport message と UI localized message の責務が混ざる

| 項目 | 内容 |
| --- | --- |
| 課題 | fallback 実装は正しくても、Renderer が `error.message` をそのまま表示すると日本語 UI の中で英語 message が露出する |
| 再発条件 | state や component props で `error.code` を捨て、文字列 message だけを保持する |
| 対処 | Main は `code + message` を返す transport に徹し、Renderer は `error.code` を正本として localized message を決定する。未実装分は未タスク化する |
| 標準ルール | error envelope の `message` は transport default、最終 UI 文言は Renderer の責務と明記する |

### 苦戦箇所: App shell 起点の screenshot が不安定

| 項目 | 内容 |
| --- | --- |
| 課題 | 画面検証時に App shell の初期化ノイズで対象 view に安定到達できず、契約差分の確認が難しい |
| 再発条件 | ナビゲーション経路全体を毎回通し、対象 view の直描画 harness を持たない |
| 対処 | 本番コンポーネント / Store / 公開 contract を保った `phase11-auth-mode` harness で対象状態を注入し、証跡を取得する |
| 標準ルール | 画面契約の確認は「contract を壊さない最短導線」の harness route を優先する |

### 同種課題の簡潔解決手順（4ステップ）

1. `channels.ts` から対象チャネル件数を確定し、fallback 登録配列と突合する。
2. `registerAllIpcHandlers()` を通常経路 / fallback 経路の if/else 排他へ揃える。
3. `error.code` を正本にする UI 責務線を仕様へ書き、足りない分は未タスク化する。
4. 専用 harness で screenshot を取り、validator / tests / 未タスク監査を同一ターンで回す。

### 同種課題の5分解決カード

| 課題パターン | 解決コマンド/手順 |
| --- | --- |
| fallback 件数ずれ | `rg -n \"PROFILE_|AVATAR_\" apps/desktop/src/preload/channels.ts` で定義数を確認し、fallback 配列件数と揃える |
| runtime 登録漏れ | `pnpm vitest run apps/desktop/src/main/ipc/__tests__/fallback-handlers.test.ts apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` |
| UI 文言責務混同 | `error.code` を保持し、localized message は Renderer で決定する。未対応は未タスクへ切り出す |
| 画面証跡の不安定化 | App shell ではなく harness route で再現し、`validate-phase11-screenshot-coverage` まで実行する |

---

## TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001: auth-key IPCハンドラ登録漏れ修正（2026-03-05）

### タスク概要

| 項目       | 内容                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001                                                              |
| 目的       | `auth-key:exists` の `No handler registered` を解消し、auth-key 4チャネルのライフサイクル整合を回復する |
| 完了日     | 2026-03-05                                                                                              |
| ステータス | **完了**                                                                                                |

### 苦戦箇所: 既存チャネルと誤認して runtime 配線確認を後回しにしやすい

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| 課題       | `auth-key:set/exists/validate/delete` の型・契約は存在していたため、`ipc/index.ts` 配線漏れの検出が遅れた |
| 再発条件   | 「チャネル定義がある=実行可能」と解釈し、`registerAllIpcHandlers` を確認しない場合                        |
| 対処       | `registerAuthKeyHandlers(mainWindow, authKeyService)` を `registerAllIpcHandlers` に追加                  |
| 標準ルール | IPC修正は `channels/handlers` だけでなく `register` までを完了条件に含める                                |

### 苦戦箇所: register 側のみ修正して unregister 側が取り残されやすい

| 項目       | 内容                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------- |
| 課題       | 起動直後は動作しても、再初期化サイクルで古いハンドラ状態が残るリスクがあった                       |
| 再発条件   | register のみ更新し、終了・再登録シナリオの検証を省略する場合                                      |
| 対処       | `unregisterAuthKeyHandlers()` を `unregisterAllIpcHandlers` に追加し、複数サイクル回帰テストを実施 |
| 標準ルール | lifecycle 系変更は register/unregister を対称更新し、同一ターンで回帰テストを追加する              |

### 苦戦箇所: 完了台帳は更新したのに教訓化が漏れやすい

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| 課題       | 実装内容だけを `task-workflow.md` へ反映し、再利用可能な苦戦箇所が残りにくい         |
| 再発条件   | Phase 12 Step 2 を「仕様同期のみ」と解釈して `lessons-learned.md` を後回しにする場合 |
| 対処       | 本セクションを追加し、課題/再発条件/対処/標準ルールを固定                            |
| 標準ルール | Phase 12 完了判定は「実装同期 + 教訓同期 + 検証証跡」の三点同時成立に限定する        |

### 苦戦箇所: 成果物が揃っていても `phase-12-documentation.md` が `pending` のまま残りやすい

| 項目       | 内容                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `outputs/phase-12` の成果物が全件存在していても、Phase仕様書本体のステータス/チェックリスト更新が後回しになりやすい                  |
| 再発条件   | 成果物生成を完了条件と誤認し、`phase-12-documentation.md` のメタ情報と完了チェックリストを最終突合しない場合                         |
| 対処       | Task 12-1〜12-5 の成果物実在を確認後、`verify-all-specs`/`validate-phase-output` を再実行し、仕様書本体を `completed` + `[x]` へ同期 |
| 標準ルール | Phase 12完了判定は「成果物実在 + 機械検証PASS + phase-12-documentation同期」の3点が揃うまで確定しない                                |

### 苦戦箇所: `apps/desktop test:run` が `SIGTERM` で中断し、回帰証跡が不安定になる

| 項目       | 内容                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| 課題       | `skill-creator.fixture.test.ts` を含む全量実行でプロセスが `SIGTERM` 終了し、成功/失敗判定が確定しない  |
| 再発条件   | 長時間 fixture テストを常に1コマンド全量実行し、失敗時の分割実行ルールを持たない場合                    |
| 対処       | 失敗ログを証跡化し、`pnpm --filter @repo/desktop exec vitest run <対象>` で分割回帰を実施して合否を確定 |
| 標準ルール | 回帰運用は「全量1本 + 失敗時の分割実行」をセットで定義し、どちらの結果も台帳に残す                      |

### 同種課題の簡潔解決手順（5ステップ）

1. 変更対象IPCの `register/unregister` 呼び出し有無を `ipc/index.ts` で最初に棚卸しする。
2. runtime 配線修正と lifecycle 回帰テスト追加を同一ターンで実施する。
3. `pnpm --filter @repo/desktop test:run` が `SIGTERM` の場合は失敗ログを保存し、`vitest run <対象>` 分割実行で回帰範囲を確定する。
4. Phase 11 の TC証跡を確認し、`validate-phase11-screenshot-coverage` を PASS させる。
5. `task-workflow.md` と `lessons-learned.md` と `api-ipc-system.md` に同じ苦戦箇所を同期して完了判定する。

### 関連未タスク

| 未タスクID                                        | 概要                                                                                                         | 参照                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001 | `apps/desktop test:run` の `SIGTERM` 中断時フォールバック運用（失敗ログ固定 + 分割実行 + 3仕様同期）を標準化 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-desktop-testrun-sigterm-fallback-guard-001.md` |

---

## TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001: SkillExecutor AuthKeyService DI経路統一（2026-03-05）

### 実装内容

| 項目     | 内容                                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 目的     | `AuthKeyService` の生成責務と注入責務を1経路へ統一し、preflight判定と実行時判定の差分を排除する                                                                                                        |
| 実装範囲 | `apps/desktop/src/main/ipc/index.ts` / `apps/desktop/src/main/ipc/skillHandlers.ts` / `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`                                            |
| 実装要点 | `registerAllIpcHandlers` で `AuthKeyService` を単一生成し、`registerSkillHandlers(mainWindow, skillService, authKeyService)` で注入。`new SkillExecutor(mainWindow, undefined, authKeyService)` へ統一 |
| 完了根拠 | `verify-all-specs` 13/13 PASS、`validate-phase-output` 28項目 PASS、Task 12-1〜12-5成果物実在確認、`phase-12-documentation.md` completed 同期                                                          |

### 苦戦箇所と解決策

#### 苦戦箇所: DIシグネチャの更新漏れで仕様と実装が乖離しやすい

| 項目       | 内容                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| 課題       | `SkillExecutor` 生成シグネチャが旧記法のまま文書へ残り、実装と転記内容がずれやすかった                                  |
| 再発条件   | Main配線変更時に `interfaces` と `task-workflow` のコード例を同一ターンで更新しない場合                                 |
| 対処       | `registerSkillHandlers(..., authKeyService)` と `new SkillExecutor(mainWindow, undefined, authKeyService)` を正本へ同期 |
| 標準ルール | DI変更は「Main配線 + 実装コード例 + 型契約」の3点同時更新を必須化する                                                   |

#### 苦戦箇所: 成果物完了後も `phase-12-documentation.md` が `pending` 残置しやすい

| 項目       | 内容                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `outputs/phase-12` が揃っていても、仕様書本体のステータス/チェック更新が後回しになりやすい                                          |
| 再発条件   | 成果物実体確認のみで完了判定し、Task 12-1〜12-5 と `phase-12-documentation.md` の相互突合を省略する場合                             |
| 対処       | Task 12-1〜12-5 実在チェック → `verify-all-specs`/`validate-phase-output` 再実行 → `phase-12-documentation.md` completed 同期を固定 |
| 標準ルール | Phase 12完了は「成果物実体 + 機械検証PASS + 仕様書ステータス同期」の3点セットで判定する                                             |

#### 苦戦箇所: 実装内容だけ先に反映され、教訓化が遅延しやすい

| 項目       | 内容                                                                               |
| ---------- | ---------------------------------------------------------------------------------- |
| 課題       | 完了台帳には反映済みでも、再発条件付きの教訓が不足し再利用性が下がった             |
| 再発条件   | `task-workflow` 更新を完了扱いにし、`lessons-learned` 反映を別ターンへ持ち越す場合 |
| 対処       | 本セクションを追加し、課題/再発条件/対処/標準ルールを固定した                      |
| 標準ルール | 仕様同期タスクは `task-workflow` と `lessons-learned` を同一ターンで更新する       |

#### 苦戦箇所: `skillHandlers.ts` の責務肥大化でDI境界調整コストが上がる

| 項目       | 内容                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | DI統一後も `skillHandlers.ts` 内に実行器生成責務が残り、handler登録責務との境界が曖昧で差分追跡が重くなる                             |
| 再発条件   | DI改善を「注入引数追加」で止め、composition root への責務集約を後回しにする場合                                                       |
| 対処       | `UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001` として未タスク化し、責務分離 + 回帰テスト固定 + 仕様同期を同時実施する導線を作成 |
| 標準ルール | DI修正は「注入経路統一」と「責務境界整理」をセットで計画し、未対応分は即時未タスク登録する                                            |

### 同種課題の簡潔解決手順（4ステップ）

1. Main composition root で依存生成責務を固定し、注入先シグネチャを先に確定する。
2. `ipc/index.ts` / `skillHandlers.ts` / `interfaces` の3点を同一ターンで同期する。
3. `verify-all-specs` と `validate-phase-output` を再実行し、Task 12-1〜12-5 実体を突合する。
4. `phase-12-documentation.md` を `completed` へ同期し、台帳と教訓を同時更新して完了判定する。

### 関連未タスク

| 未タスクID                                                     | 概要                                                                                                                          | 参照                                                                                                                |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| ~~UT-IMP-PHASE11-AUTHKEY-SCREENSHOT-SELECTOR-DRIFT-GUARD-001~~ | ~~auth-key Phase 11 スクリーンショット取得スクリプトのセレクタドリフト防止~~ **完了: 2026-03-06（Phase 12完了移管）**         | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase11-authkey-screenshot-selector-drift-guard-001.md` |
| ~~UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001~~         | ~~`skillHandlers.ts` の DI境界整理ガード（composition root 集約 + 回帰テスト固定）~~ **完了: 2026-03-06（Phase 12完了移管）** | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skillhandlers-authkey-di-boundary-guard-001.md`         |

---

## TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001: OAuth後 sandbox iterable エラー原因分離（2026-03-06追補）

### タスク概要

| 項目       | 内容                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001                                                  |
| 目的       | `AUTH_STATE_CHANGED` payload と `linkedProviders` 契約崩れによる `is not iterable` 障害を再発防止する |
| 完了日     | 2026-03-05（再監査追補: 2026-03-06）                                                                  |
| ステータス | **完了**                                                                                              |

### 苦戦箇所: Main通知 shape と Renderer state shape の境界が揺れやすい

| 項目       | 内容                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| 課題       | unlink 後通知で `AUTH_STATE_CHANGED.user` が profile shape のまま流れ、Renderer 側の前提とずれた |
| 再発条件   | Main 側の通知 payload を既存オブジェクトのまま通過させる場合                                     |
| 対処       | Main 通知直前に `toAuthUser(updatedUser)` を適用し、AuthUser 形状へ正規化                        |
| 標準ルール | 認証イベント payload は送信境界で正規化してから IPC 通知する                                     |

### 苦戦箇所: `linkedProviders` の契約崩れが UI 層まで伝播しやすい

| 項目       | 内容                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| 課題       | `response.data` が配列以外の場合に `is not iterable` を誘発し、画面が停止する            |
| 再発条件   | Renderer 側で API 応答を信頼し、配列・要素検証を省略する場合                             |
| 対処       | `isLinkedProvider` / `normalizeLinkedProviders` を導入し、非配列は `[]` へフォールバック |
| 標準ルール | 外部境界入力は `type guard + normalize` を必須化する                                     |

### 苦戦箇所: 非視覚タスクでもユーザー要求があると画面証跡不足になる

| 項目       | 内容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| 課題       | 初回 Phase 11 が `NON_VISUAL` 記録中心で、UI検証要求に対して証跡不足となった                |
| 再発条件   | 「契約修正中心タスクだから画面証跡は不要」と固定運用する場合                                |
| 対処       | `TC-11-UI-01..03` の実画面証跡を再取得し、`validate-phase11-screenshot-coverage` 3/3 を固定 |
| 標準ルール | ユーザーが UI 検証を要求した時点で `NON_VISUAL` から `SCREENSHOT` へ昇格する                |

### 同種課題の簡潔解決手順（4ステップ）

1. Main 通知 payload と Renderer state の契約境界を先に切り分け、どちらが不整形でも崩れない設計にする。
2. 送信側正規化（Main）と受信側正規化（Renderer）を同時実装し、片側だけで完了扱いにしない。
3. 回帰は対象テストを明示実行し、`3 files / 169 tests` のように件数を証跡化する。
4. Phase 11/12 は `TC-ID ↔ png` の機械検証を通し、`task-workflow` / `api-ipc-system` / `lessons-learned` を同時同期する。

### 同種課題の5分解決カード（契約境界 + 画面証跡）

| 項目       | 内容                                                                                                                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | OAuth後に `is not iterable` が発生し、同時に画面証跡不足で再監査が必要になる                                                                                                                                                                    |
| 根本原因   | Main/Renderer の契約境界が片側のみ修正され、`NON_VISUAL` 固定で証跡昇格が遅れる                                                                                                                                                                 |
| 最短5手順  | 1) Main送信 shape を正規化 2) Renderer受信 shape を `type guard + normalize` で防御 3) 対象テストを件数付きで固定実行 4) UI要求時は `SCREENSHOT` 昇格で TC証跡を再取得 5) `task-workflow`/`api-ipc-system`/`lessons-learned` を同一ターンで同期 |
| 検証ゲート | `verify-all-specs` PASS（13/13）、`validate-phase-output` PASS（28項目）、`validate-phase11-screenshot-coverage` PASS（3/3）、対象テスト PASS（3 files / 169 tests）                                                                            |
| 同期先3点  | `references/task-workflow.md` / `references/api-ipc-system.md` / `references/lessons-learned.md`                                                                                                                                                |

### 関連未タスク

| 未タスクID                                                          | 概要                                                                                     | 参照                                                                                                         | ステータス |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- |
| UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001 | 5分解決カードの3仕様書同期（存在/手順順序/検証ゲート）を機械検証する運用ガードを追加する | `docs/30-workflows/completed-tasks/task-imp-phase12-task-investigate-five-minute-card-sync-validator-001.md` | 未実施     |

---

## TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001: authCallbackServer timeout/stop 責務分離

### 苦戦箇所: timeout時に待機APIが停止責務まで持っていた

| 項目             | 内容                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 課題             | `waitForCallback()` timeout 内で `instance.stop()` を呼ぶと、待機失敗と停止処理が結合しワーカー終了時の不安定要因になる |
| 再発条件         | timeout ハンドラ内で stop/close を直接呼ぶ実装を採用する場合                                                            |
| 原因             | 待機APIとライフサイクルAPIの責務境界が曖昧だった                                                                        |
| 対処             | timeout はエラー返却のみへ変更し、停止は呼び出し側の `stop()` 明示実行へ分離した                                        |
| 今後の標準ルール | timeout系APIは副作用を持たせず、停止責務を分離する                                                                      |

### 苦戦箇所: `stop()` の多重実行で終了経路が揺れる

| 項目             | 内容                                                                             |
| ---------------- | -------------------------------------------------------------------------------- | --- | ------------------------------------------------------------------------------------------------------------- |
| 課題             | 停止済みサーバーへの `stop()` で例外経路が混入するとクリーンアップが不安定になる |
| 再発条件         | `!server` 判定のみで `server.listening` 状態を見ない場合                         |
| 原因             | `!server` のみ判定で `server.listening` 状態を見ていなかった                     |
| 対処             | `!server                                                                         |     | !server.listening` で早期returnし、`server.close`エラーは握りつぶして`Promise<void>` を解決する設計へ統一した |
| 今後の標準ルール | 停止APIは idempotent を第一要件にし、終了時の best-effort 方針を明文化する       |

### 同種課題の簡潔解決手順（4ステップ）

1. timeout 系APIから停止/破棄などの副作用を分離する。
2. 停止APIに「未起動」「停止済み」の両ガードを実装する。
3. timeout テストに `finally` 相当の明示 `stop()` を必ず追加する。
4. `security-implementation.md` と `task-workflow.md` を同一ターンで同期し、仕様ドリフトを残さない。

---

## TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION: Conversation IPC ハンドラ登録修正（2026-03-16）

### 苦戦箇所1: registerConversationHandlers() が registerAllIpcHandlers() から呼ばれていなかった

| 項目 | 内容 |
| --- | --- |
| 課題 | `registerConversationHandlers()` は定義済みだったが、`registerAllIpcHandlers()` の Section 13 に登録呼び出しがなく、conversation:* チャンネル7本が Main Process で未登録だった。Preload 側は safeInvoke で silent fail するため、Renderer では timeout まで Promise が pending し、会話履歴機能が完全に無効化されていた |
| 再発条件 | 新規 IPC ハンドラグループを作成したが、`ipc/index.ts` の `registerAllIpcHandlers()` への接続を忘れた時 |
| 解決策 | `registerAllIpcHandlers()` の Section 13 に `track("registerConversationHandlers", registerConversationHandlers)` を追加。safeRegister + track パターンで Graceful Degradation（S30）に準拠 |
| 標準ルール | 新規ハンドラグループ作成時は「定義 → index.ts Section 追加 → unregister 対象確認 → テスト追加」を1セットで実施。`grep -c "track(" ipc/index.ts` で登録数と定義数の一致を検証 |
| 関連パターン | P5（リスナー二重登録）、S30（Graceful Degradation）、P54（safeRegister 適合判定） |
| 関連タスク | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |

### 苦戦箇所2: conversation:search ハンドラの P42 バリデーション漏れ（他6ハンドラは実装済み）

| 項目 | 内容 |
| --- | --- |
| 課題 | `registerConversationHandlers()` 内の7ハンドラのうち、conversation:search だけ P42 準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が欠落していた。他の6ハンドラ（create/get/list/add-message/update-title/delete）は正しく実装されていた |
| 再発条件 | 同一ファイル内で多数のハンドラを実装する際、1つだけバリデーションパターンが異なるハンドラを見落とした時 |
| 解決策 | conversation:search の userId と query に3段バリデーションを追加。テスト EC-VAL-07〜10 を4件追加（空文字列 + トリム空文字列 × userId/query） |
| 標準ルール | ハンドラグループ内の全ハンドラに対して `grep -n "trim()" conversationHandlers.ts` でバリデーション適用を一括検証。引数を持つ全ハンドラで P42 準拠を確認 |
| 関連パターン | P42（.trim() バリデーション漏れ）|
| 関連タスク | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |

### 苦戦箇所3: better-sqlite3 WAL モード初期化と DB 障害時のフォールバック設計

| 項目 | 内容 |
| --- | --- |
| 課題 | conversation DB は better-sqlite3 の WAL モードで初期化されるが、DB 初期化失敗時（ファイル破損、ディスク容量不足等）に conversation:* 全7チャンネルが使用不能になる。従来は DB 初期化失敗が silent fail で、Renderer 側は原因不明の timeout を経験した |
| 解決策 | Graceful Degradation パターンを適用: DB 初期化失敗時は `isConversationDbAvailable = false` フラグを設定し、全ハンドラが `{ success: false, error: { code: "DB_NOT_AVAILABLE" } }` を即座に返す。ERR_4006 としてエラーコード体系に登録 |
| 標準ルール | ネイティブモジュール（better-sqlite3 等）を使用するハンドラグループには、初期化失敗時のフォールバックハンドラを必ず用意する |
| 関連パターン | S30（Graceful Degradation パターン）、ERR_4006（DB_NOT_AVAILABLE） |
| 関連タスク | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |

### 同種課題の簡潔解決手順（3ステップ）

1. `grep -c "track(" ipc/index.ts` で registered handler group 数と実際の handler group 定義ファイル数を突合する。
2. 各ハンドラグループ内で `grep -n "trim()" <handler-file>` を実行し、引数を持つ全ハンドラに P42 バリデーションが適用されていることを検証する。
3. ネイティブリソース（DB/ファイル）を使用するハンドラグループは、リソース初期化失敗時の Graceful Degradation フォールバックの存在を確認する。

---

