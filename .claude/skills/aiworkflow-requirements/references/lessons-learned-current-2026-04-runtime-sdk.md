# Lessons Learned（current）2026-04 — Runtime / SDK / IPC

> 分割元: lessons-learned-current-2026-04.md
> 範囲: UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001 preloadホワイトリスト同期 current facts（2026-04-15） 〜 TASK-SDK-SC-04 Skill Output Integration 教訓（2026-04-04）

## UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001 preloadホワイトリスト同期 current facts（2026-04-15）

### L-IPCWH-001: 6+6 の内訳と CONFIGURE_API 既登録を先に固定する

| 項目       | 内容                                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `skill-creator:configure-api` を既登録として先に除外しないと、Rule-1 / Rule-2 の件数がずれて current facts が読みにくくなる                                                                     |
| 解決策     | `CHAT_EXPORT_CHANNELS` 2件 + `FILE_SYSTEM_CHANNELS` 2件 + `SKILL_CREATOR_SESSION_CHANNELS` 2件 + `SKILL_CREATOR_EXTERNAL_API_CHANNELS` 2件で 6+6 に固定し、既登録チャネルは missing 集計から外した |
| 標準ルール | 既登録チャネルの棚卸しを Phase 1 で固定し、`verify-ipc-4layer.cjs` の Rule-1 / Rule-2 / Rule-3 を current facts として扱う                                                                    |
| 関連タスク | UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001 / UT-FIX-IPC-4LAYER-CI-PASS-001                                                                                                                             |

### current facts

- `verify-ipc-4layer.cjs` は Rule-1 / Rule-2 / Rule-3 の全 PASS
- `skill-creator:configure-api` は既登録のため missing に含めない
- `docs/30-workflows/completed-tasks/unassigned-task/UT-FIX-IPC-4LAYER-CI-PASS-001.md` へ blocker record を移管済み

---

## TASK-SC-FIX-GENERATE-SKILL-MD-001 generate_skill_md.js 引数修正 教訓（2026-04-15）

### L-SC-FIX-001: generate_skill_md.js は `--path <dir>` ではなく `--plan <json> --output <path>` を要求する

| 項目       | 内容                                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `SkillCreatorService.ts` が `["--path", skillDir]` でスクリプトを呼び出していたため、`generateResult.success` が常に `false` となり `ensureSkillMdExists` フォールバックのみで動作し続けていた |
| 解決策     | `os.tmpdir()` 配下に UUID 付き一時 JSON ファイルを生成し、`["--plan", tmpPlanPath, "--output", skillMdPath]` で呼び出す。`finally` でクリーンアップ              |
| 標準ルール | `generate_skill_md.js` を呼ぶときは `--plan <planJsonPath> --output <outputPath>` を必ず指定すること                                                           |
| 関連タスク | TASK-SC-FIX-GENERATE-SKILL-MD-001                                                                                                                              |

### L-SC-FIX-002: 外部スクリプトへの JSON データ渡しは temp ファイル経由とし、finally で確実にクリーンアップする

| 項目       | 内容                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | スクリプト引数として大きなオブジェクトを渡す場合、コマンドライン引数の文字数制限に引っかかる可能性がある                                                  |
| 解決策     | `os.tmpdir()` + `randomUUID()` でユニークな一時ファイルを生成し、JSON を書き込んでパスのみを引数に渡す。`finally` ブロックで `.catch(() => {})` つきクリーンアップを実施 |
| 標準ルール | 一時ファイルのクリーンアップは `finally` ブロックで行い、クリーンアップ失敗は non-fatal として `.catch(() => {})` で許容する                              |
| 関連タスク | TASK-SC-FIX-GENERATE-SKILL-MD-001                                                                                                                        |

---

## UT-SKILL-WIZARD-FB-05 テスト証跡一本化テンプレート 教訓（2026-04-13）

### L-FB05-001: docs-only でも Phase 11 証跡テンプレートは「件数・edge case・判断根拠」の3点を1ファイルで完結させる

| 項目       | 内容                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | テスト件数・edge case・仕様判断根拠が別ファイルに分散すると、Phase 12 レビューで全体像確認に時間がかかる                                |
| 解決策     | `manual-test-result` テンプレートの冒頭に「テスト件数と内訳」、中段に「edge case 一覧表」、末尾に「仕様判断根拠」を固定配置した            |
| 標準ルール | docs-only / NON_VISUAL でも、証跡テンプレートは 1 ファイル完結を優先する                                                                  |
| 関連タスク | UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001                                                                                      |

### L-FB05-002: edge case テーブルは SD-ID 参照で仕様判断を再利用し、重複記述を避ける

| 項目       | 内容                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 各 edge case 行に判断理由を全文で書くと、同じ仕様判断を実装・テスト・ドキュメントで重複記載しやすい                                      |
| 解決策     | edge case 一覧表は `仕様判断根拠ID` を参照し、判断の正文は「仕様判断根拠」テーブルに集約する                                               |
| 標準ルール | case 行は検証結果、判断テーブルは意思決定根拠という責務分離を維持する                                                                     |
| 関連タスク | UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001                                                                                      |

### L-FB05-003: `spec_created` close-out でも system spec 同期（workflow / lesson / logs / topic-map）を同 wave で閉じる

| 項目       | 内容                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | docs-only だからと system spec 側の反映を後回しにすると、`spec_created` 状態と current facts の同期が崩れる                             |
| 解決策     | `task-workflow`・`lessons-learned`・`LOGS`・`topic-map` を同 wave で更新し、Phase 12 Step 1 の同期条件を先に満たしてから close-out した |
| 標準ルール | `spec_created` タスクは実装有無に関係なく、台帳系4点（workflow/lesson/logs/topic-map）を同一波で更新する                                  |
| 関連タスク | UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001                                                                                      |

### L-FB05-004: `.agents` / `.claude` ミラーディレクトリの同期コストを最小化するため、差分は同一 wave で一括反映する

| 項目       | 内容                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `.claude/skills/` と `.agents/skills/` の二重ミラー構成では、変更箇所が増えるほど同期漏れリスクが高くなり、diff 確認コストが実装コストを上回ることがある              |
| 解決策     | 変更対象ファイルをリストアップしてから `cp` または Edit ツールで `.agents/` 側へ一括コピーし、最後に `diff -qr .claude/skills/ .agents/skills/` で差分ゼロを確認する    |
| 標準ルール | ミラー同期は「変更→即コピー」の都度反映ではなく、wave 末尾に「一括コピー→diff 確認」をセットで行う                                                                    |
| 関連タスク | UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001                                                                                                                   |

---

## UT-SKILL-WIZARD-FB-03 フィールド独立推論性 教訓（2026-04-11）

### L-FB03-001: `format` は `category` からのみ推論する

| 項目 | 内容 |
| --- | --- |
| 課題 | `format` を `purpose` からも推論するように読める文言が残ると、仕様の責務境界が崩れる |
| 解決策 | `purpose -> tool/timing`、`category -> format` を矢印で固定し、`format` を category-only と明記する |
| 標準ルール | `format` の説明には必ず category-only を書く |
| 関連タスク | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001 |

### L-FB03-002: `purpose` と `category` の責務は分離して書く

| 項目 | 内容 |
| --- | --- |
| 課題 | ひとつの説明文で `purpose` と `category` をまとめると、どちらが何を決めるか曖昧になる |
| 解決策 | 役割を 1 行ずつ分け、`purpose` は tool/timing、`category` は format と固定した |
| 標準ルール | field independence は表でなくてもよいが、責務は必ず 2 行以上に分けて書く |
| 関連タスク | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001 |

### L-FB03-003: docs-only close-out でも same-wave sync を省略しない

| 項目 | 内容 |
| --- | --- |
| 課題 | 実装変更がなくても、`task-workflow` / `LOGS` / `SKILL` / `artifacts.json` がずれると後続レビューで再誤解が起きる |
| 解決策 | docs-only でも Phase 12 成果物 6 件と skill / log / lesson を同 wave で更新した |
| 標準ルール | docs-only close-out でも artifacts・台帳・lesson・log は同時更新する |
| 関連タスク | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001 |

---

## UT-W3-ANALYTICS-ADAPTER-001 trackEvent analytics adapter差し替え 教訓（2026-04-12）

### L-W3-TRACK-003: opt-out final gate は renderer と main の二重防衛にする

- **症状**: renderer 側だけで送信停止しても、Main 側の最終 gate が弱いと store 読み取り失敗時に telemetry が漏れる
- **原因**: 送信前判定と最終判定が 1 層しかなかった
- **解決策**: renderer で予備判定、Main で `electron-store` の `analyticsOptOut` を final gate にする。store が無い / 読めない場合は safe-side で skip する
- **標準ルール**: analytics transport は dual gate を必須とし、片側だけの opt-out 判定で完了扱いにしない

### L-W3-TRACK-004: trackEvent の API を変えず sink だけ差し替える

- **症状**: sink 差し替えと同時に `trackEvent` の公開 API を変えると、呼び出し側の回帰が広がる
- **原因**: 計装ポイントの責務と transport の責務が混ざっていた
- **解決策**: `trackEvent<K>(eventName, payload): void` のシグネチャは維持し、transport のみ `analyticsAdapter` / `analytics:send` に差し替える
- **標準ルール**: 呼び出し側のイベント契約は固定し、transport は adapter で吸収する

### L-W3-TRACK-005: queue / flush / validation は serial に扱う

- **症状**: offline queue と online flush と opt-out 更新が並列に走ると、古い state で二重送信や取りこぼしが起こりやすい
- **原因**: send / flush / gate check の順序が非同期競合しうる
- **解決策**: `analyticsAdapter` 内で send / flush の操作を直列化し、queue TTL と max size を固定したうえで safe-side skip を優先する
- **標準ルール**: analytics adapter は state mutation を直列化し、検証失敗時は送信より停止を優先する

## TASK-SC-08-E2E-VALIDATION 教訓（2026-03-25）

### L-SC-E2E-001: IPC handlerMap モックパターン

- **症状**: Electron の `ipcMain.handle` を直接モックすると、ハンドラ登録のタイミング依存でテストが不安定になる
- **原因**: `vi.mock('electron')` だけではハンドラの呼び出しチェーンをテストできない
- **解決策**: `handlerMap: Record<string, Function>` をキャプチャし、`ipcMain.handle` のモック内で格納。テスト時は `handlerMap[channelName](event, args)` で直接呼び出す
- **関連Pitfall**: P60（IPC テスト応答形式不一致）

### L-SC-E2E-002: TerminalHandoff セキュリティ検証

- **症状**: `suggestedCommand` の形式検証が不十分だと、シェルインジェクションの脆弱性が残る
- **原因**: CLI コマンド文字列の妥当性を正規表現のみで検証していた
- **解決策**: (1) `/^[a-zA-Z]/` でアルファベット開始を検証 (2) `;`, `|`, `$()`, `` ` `` のシェルメタ文字を禁止 (3) NFR-1 準拠で API Key 等の機密情報が含まれないことをアサート
- **関連Pitfall**: NFR-1（機密情報漏洩防止）

### L-SC-E2E-003: Phase仕様書パス移動時の参照ドリフト

- **症状**: Phase仕様書ディレクトリを移動した後、「次のPhase」リンクが旧パスのまま残り、ナビゲーションが壊れる
- **原因**: ディレクトリ名変更時に、Phase仕様書内の相対パス参照が自動更新されない
- **解決策**: 移動後に `grep -r "旧パス" 新ディレクトリ/` で残存参照を検出し、一括置換する
- **新規Pitfall候補**: P-NEW: Phase仕様書ディレクトリ移動時の「次のPhase」リンク残存

---

## TASK-SDK-08 session-persistence-and-resume-contract (2026-03-28)

### L-1: esbuild host/binary version mismatch でVitest起動停止

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| 症状     | `pnpm vitest run` が esbuild version mismatch エラーで即座に停止   |
| 原因     | worktreeのnode_modulesとesbuildバイナリのバージョン不一致          |
| 解決     | worktreeルートで `pnpm install` を再実行                           |
| 再発防止 | worktree作成後は必ず `pnpm install` を確認してから `vitest` を実行 |

### L-2: artifact命名規約とvalidator期待値の不一致

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| 症状     | structure validator PASSでもphase-output validationで失敗                |
| 原因     | task spec本文のartifact名と実際のファイル名が微妙にずれている            |
| 解決     | task root生成時にartifact命名のcanonical一覧を先に確定させる             |
| 再発防止 | Phase-12着手前に artifacts.json と phase spec のartifact名を照合すること |

### L-3: Phase 11 UI task / docs-only task 判定の不一致

| 項目     | 内容                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| 症状     | Phase 11 でスクリーンショット要求とdocs-only判定が食い違う                    |
| 原因     | spec本文とartifact名でtask分類が異なっていた                                  |
| 解決     | Phase 1 要件定義時に UI task か docs-only task かを明示し、全フェーズで統一   |
| 再発防止 | Phase 12 compliance check で artifact命名とPhase 11判定の一致を確認項目に追加 |

---

## UT-SDK-07 shared IPC channel 契約整合（2026-03-29）

### L-UT-SDK07-001: shared チャネル移管後の仕様書参照パス更新

| 項目       | 内容                                                                                                                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | APPROVAL_CHANNELS / EXECUTION_CHANNELS が `apps/desktop/src/preload/channels.ts` から `packages/shared/src/ipc/channels.ts` に移管されたが、仕様書（ipc-preload-spec-sync-guardian の SKILL.md 等）が旧パスを正本として記載したままになりやすい |
| 解決策     | チャネル定数を shared に移管した場合は、当該チャネルを参照するすべての仕様書・スキルの「リソース参照」テーブルと「Phase 3 アクション」を同ターンで shared パスに更新する                                                                        |
| 標準ルール | `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` 等の正本が `packages/shared/src/ipc/channels.ts` であることを仕様書に記載する。`preload/channels.ts` は shared からの import 先として副次的な参照に留める                                            |
| 関連タスク | UT-SDK-07                                                                                                                                                                                                                                       |

### L-UT-SDK07-002: packages/shared/src/ipc/ サブパス追加時は 3 箇所同時更新が必須

| 項目       | 内容                                                                                                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `packages/shared/src/ipc/channels.ts` を新設した際、`package.json exports` / `package.json typesVersions` / `tsup.config.ts entry` の 3 箇所に登録しないと desktop/renderer 側で import 解決が失敗する（L-CB-01 のパターンの再現） |
| 解決策     | shared に新しいサブパスを追加するたびに 3 箇所同時更新チェックリストを適用し、追加後に `pnpm --filter @repo/shared build` でリビルドして typecheck を確認する                                                                      |
| 標準ルール | shared 型・定数追加の 3 箇所同時更新チェックリスト（L-CB-01）を IPC channel 定数追加にも適用する                                                                                                                                   |
| 関連タスク | UT-SDK-07                                                                                                                                                                                                                          |

### L-UT-SDK07-003: preload が shared を import する構造への仕様書更新パターン

| 項目       | 内容                                                                                                                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `preload/channels.ts` が共通チャネルを直接定義するのではなく `@repo/shared/src/ipc/channels` から import する構造に変わると、仕様書の「channels.ts の定義箇所」記述が陳腐化し、ipc-preload-spec-sync-guardian の監査チェック対象が正しく設定されなくなる |
| 解決策     | shared チャネルの移管完了時に、関連スキル（ipc-preload-spec-sync-guardian 等）の Trigger キーワード・Phase 3 アクション・リソース参照を同ターンで更新する。移管後の正本は shared 側のファイルパスを明記する                                              |
| 標準ルール | IPC channel 定数を shared に移管する場合は「移管完了 → スキル更新」を同一 wave に含める（P57 準拠）                                                                                                                                                      |
| 関連タスク | UT-SDK-07                                                                                                                                                                                                                                                |

---

## TASK-RT-06 教訓（2026-03-29）

### 1. shared 型追加時は barrel export を同ターンで更新しないと desktop が即壊れる

| 項目       | 内容                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `RuntimeSkillCreatorPlanErrorResponse` を shared 型へ追加したが `@repo/shared/types` から再公開漏れがあり desktop typecheck が失敗 |
| 解決策     | `packages/shared/src/types/index.ts` の export type を同一ターンで更新し、desktop 側 import を再検証                               |
| 標準ルール | shared 型の追加・改名時は「定義ファイル」と「barrel export」を必ずセットで更新（P32）                                              |
| 関連タスク | TASK-RT-06                                                                                                                         |

### 2. UI 非変更タスクでも Phase 11 は N/A 宣言だけで完了にしない

| 項目       | 内容                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| 課題       | スクリーンショット N/A のみで手動検証証跡が不足し、Phase 11 妥当性が監査で否認  |
| 解決策     | `manual-test-checklist.md` と `discovered-issues.md` を必須補助成果物として追加 |
| 標準ルール | UI 非変更タスクは「N/A 根拠 + 代替証跡（checklist/issues）」をセットで残す      |
| 関連タスク | TASK-RT-06                                                                      |

---

## UT-IMP-SDK-06 教訓（2026-04-01）

### L-SDK06-001: Markdown セクション抽出の正規表現 2 ステップパターン

| 項目       | 内容                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `m` フラグ下で `[\s\S]\*?(?=^##\s                                                                                        | $)` を使うと `$` が各行末にマッチし、セクション本文が最初の改行直後で切り取られる。複数行 Trigger セクションを読んで「10文字未満」と誤判定するバグが発生した |
| 解決策     | 2ステップ方式（① `^## heading$` でセクション開始位置を特定 → ② slice 後に `^##\s` で次見出しを探して切り出す）に変更する |
| 標準ルール | Markdown のセクション内容を正規表現で抽出する場合は 1 パターンの `m` フラグ頼りではなく 2 ステップ方式を使う             |
| 関連タスク | UT-IMP-SDK-06                                                                                                            |

### L-SDK06-002: worktree 環境の esbuild バイナリミスマッチは cp で修復する

| 項目       | 内容                                                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | worktree 内の `node_modules/.pnpm/esbuild@0.21.5/` のバイナリが `0.25.12` のホストバージョンと不一致。`npx vitest run` が即座に失敗する                                            |
| 解決策     | `cp <main-repo>/node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/bin/esbuild <worktree>/node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/bin/esbuild` でバイナリを補完 |
| 標準ルール | worktree 作成後に `npx vitest run` が esbuild version mismatch で落ちる場合は `pnpm install` 再実行か上記 cp を試みる                                                              |
| 関連タスク | UT-IMP-SDK-06（L-1 再現）                                                                                                                                                          |

### L-SDK06-003: vitest は `apps/desktop` ディレクトリで `npx vitest run src/...` を使う

| 項目       | 内容                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `pnpm --filter @repo/desktop test run apps/desktop/src/...` でプロジェクトルートから相対パスを指定すると「No test files found」になる                   |
| 解決策     | `cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` のように対象ディレクトリに入って実行する |
| 標準ルール | vitest の path 引数は vitest config の root からの相対パスなので、pnpm --filter での cross-package 実行時は `--testPathPattern` か `cd` で回避する      |
| 関連タスク | UT-IMP-SDK-06                                                                                                                                           |

---

## TASK-P0-04 教訓（2026-03-30）

### L-P0-04-001: vitest 実行時の process.cwd() はプロジェクトルートではない

| 項目       | 内容                                                                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `REPO_SKILL_CREATOR_PATH` は `path.resolve(process.cwd(), ".claude", ...)` でモジュールロード時に評価される。vitest では cwd が `apps/desktop/` になるため、プロジェクトルートの `.claude/` を参照できずテストが失敗する |
| 解決策     | テスト環境では `AIWORKFLOW_SKILL_CREATOR_PATH` 環境変数を `beforeAll`/`afterAll` でセットして `getSkillCreatorRootCandidates()` を正しいパスに誘導する。本番コードの変更は不要                                           |
| 標準ルール | `process.cwd()` ベースの定数はモジュールロード時に固定される点に注意。テスト内でパス依存のコードをテストする際は環境変数 DI パターンを使用する                                                                           |
| 関連タスク | TASK-P0-04                                                                                                                                                                                                               |

### L-P0-04-002: TDD Red は「import エラー」ではなく「実行エラー」で確認する

| 項目       | 内容                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | 未実装関数を import すると、同ファイル内の既存テストも巻き込んで全失敗になる。Red の確認目的が「新テストの失敗」なのに既存テストが壊れる副作用が生じる |
| 解決策     | スケルトン関数（`throw new Error("not implemented")`）を先に定義し、import はコンパイルできる状態にする。実行時にのみ新テストが Red になるよう設計する |
| 標準ルール | テストファースト実装では「スケルトン定義 → テスト記述 → Red 確認 → 実装 → Green 確認」の順序を守る                                                     |
| 関連タスク | TASK-P0-04                                                                                                                                             |

### L-LIFECYCLE-EP-001: fire-and-forget IPC では後続スナップショットによるエラークリア防止が必要（2026-04-03）

| 項目       | 内容                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 標準ルール | IPC fire-and-forget パターンでは Renderer state のエラー保持を壊さないようスナップショット受信コールバックにフェーズ別ガードを設ける |
| 関連タスク | TASK-FIX-LIFECYCLE-PANEL-ERROR-001（Issue #1844）                                                                              |

### L-LIFECYCLE-EP-003: NON_VISUAL 判定 — React state 変更のみは自動テストで代替可能（2026-04-03）

| 項目       | 内容                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| 標準ルール | `setXxx(null)` 等の呼び出し制御のみの修正は NON_VISUAL と判定。UI 描画変更を伴う場合のみ Phase 11 でスクリーンショットが必要 |
| 関連タスク | TASK-FIX-LIFECYCLE-PANEL-ERROR-001                                                                                          |

---

## TASK-SDK-SC-03 External API Support 教訓（2026-04-03）

### L-SC03-001: 並行フロー管理の複雑性（pendingAnswerPromise / pendingExternalApiPromise 相互排他）

| 項目       | 内容                                                                                                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `SkillCreatorSdkSession` が質問待機（`pendingAnswerPromise`）とAPI設定要求（`pendingExternalApiPromise`）の2つの非同期待機を管理する必要があり、一方が存在する間に他方を開始すると状態が壊れる                           |
| 再発条件   | SDK custom tool 内で複数の非同期待機フロー（質問 / 外部リソース要求 / 承認要求等）を並行管理する場合                                                                                                                   |
| 解決策     | 両 Promise の存在を相互にチェックし、一方が pending の場合は他方を拒否する排他パターンを適用。cleanup 時に両方を同時にリセットする                                                                                      |
| 標準ルール | SDK Session に新しい非同期待機フローを追加する際は、既存の pending フローとの相互排他チェックを必ず設計段階で定義する                                                                                                   |
| 関連タスク | TASK-SDK-SC-03                                                                                                                                                                                                         |

### L-SC03-002: タイムアウト管理の二重化（単一 timeoutHandle を両フローで共有）

| 項目       | 内容                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 質問待機とAPI設定要求の両方が30秒タイムアウトを必要とするが、各フローに個別の timeout を持つと cleanup 時に clearTimeout 漏れが発生しやすい                                            |
| 再発条件   | 複数の非同期フローが同一セッション内でタイムアウト管理を個別に行う場合                                                                                                               |
| 解決策     | 単一の `timeoutHandle` を両フローで共有し、新しいフロー開始時に前回のタイムアウトをクリアしてから新しいタイムアウトを設定する設計を採用                                                |
| 標準ルール | 同一コンテキスト内の非同期タイムアウトは共有 handle で管理し、フロー切替時に必ず `clearTimeout` を先行実行する                                                                        |
| 関連タスク | TASK-SDK-SC-03                                                                                                                                                                        |

### L-SC03-003: データ秘匿化の二重管理（sanitizeExternalApiConfigForPrompt）

| 項目       | 内容                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | 外部API設定の credential はLLMプロンプトに `[REDACTED]` で注入するが、実際のHTTPリクエストには元の credential を使用する必要があり、同じ config オブジェクトを2つのコンテキストで使い分ける複雑性が発生 |
| 再発条件   | 秘匿情報を含むデータを「表示用」と「実行用」で使い分ける場合                                                                                                                        |
| 解決策     | `sanitizeExternalApiConfigForPrompt()` は元の config を変更せず、新しいオブジェクトを返す pure function として実装。元の config は SDK Session 内部でのみ保持し、外部への漏洩を防止    |
| 標準ルール | 秘匿情報の二重管理では、sanitize 関数は必ず immutable（元オブジェクトを変更しない）とし、元データの保持範囲を明示的に限定する                                                          |
| 関連タスク | TASK-SDK-SC-03                                                                                                                                                                        |

### L-SC03-004: IPC バリデーションの複雑さ（isValidExternalApiConfig 8条件チェック）

| 項目       | 内容                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `ExternalApiConnectionConfig` は8つのバリデーション条件を持ち、条件間に依存関係がある（authType が none 以外の場合のみ credential 必須）ため、テストマトリクスが膨大になる                  |
| 再発条件   | 条件付きフィールド（authType に応じて credential 必須/不要が変わる）を持つ IPC payload のバリデーション                                                                                    |
| 解決策     | バリデーション関数を private メソッドとして分離し、条件分岐を明確に分離。テストは happy path + 各条件の boundary を個別にカバー                                                            |
| 標準ルール | 条件付きバリデーションは early return パターンで各条件を独立させ、条件間の依存を明示的にコメントで記録する                                                                                  |
| 関連タスク | TASK-SDK-SC-03                                                                                                                                                                              |

### L-SC03-005: Preload API 契約拡張の3層一貫性維持（Preload / Main / Renderer）

| 項目       | 内容                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | External API チャネル4本の追加で、`packages/shared/src/ipc/channels.ts`（定数定義）、`apps/desktop/src/preload/channels.ts`（allowlist import）、`apps/desktop/src/preload/skill-creator-api.ts`（invoke 公開）、`apps/desktop/src/preload/skill-creator-session-api.ts`（push listener 公開）の4ファイルを同時更新する必要があり、1ファイルの更新漏れで silent fail が発生 |
| 再発条件   | 新規 IPC チャネル追加時に shared 定数 / preload allowlist / preload API 公開 / Main handler 登録のいずれかが欠落する場合                                                              |
| 解決策     | チャネル追加チェックリストを定義し、4層（shared 定数 → preload import → preload API → Main handler）を同一 PR 内で完結させる                                                          |
| 標準ルール | 新規 IPC チャネル追加時は「shared 定数 → preload channels import → preload API 関数 → Main handler 登録 → ALLOWED_*_CHANNELS 追加」の5点を同一コミットで完了する                      |
| 関連タスク | TASK-SDK-SC-03                                                                                                                                                                        |

---

### 2026-04-04 TASK-RT-03-VERIFY-IMPROVE-PANEL-001（Verify / Improve 結果パネル実装）

#### L-VRIP-001: Layer 別 useMemo グループ化 — LAYER_ORDER で表示順を固定する

| 項目         | 内容                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | verify の `checks[]` を Layer 別にグループ化する際、オブジェクトキー列挙順に依存すると Layer 順序が不定になる。0 件 Layer を非表示にする条件と表示順序を両立するロジックが複雑になりがち                                                          |
| 解決策       | `const LAYER_ORDER: VerifyLayerKey[] = ["layer1", "layer2", "layer3", "layer4"]` を定数化し、`useMemo` 内で `LAYER_ORDER.filter(k => groups[k].length > 0)` と順序固定グループ化を分離する。0 件 Layer の非表示も filter で自然に処理できる       |
| 標準ルール   | 表示順序が仕様に明示されているリストは定数 LAYER_ORDER / STEP_ORDER 等で固定し、オブジェクトキー列挙順には依存しない。useMemo の依存配列は `verifyDetail?.checks` の参照だけにする                                                               |
| 関連タスク   | TASK-RT-03-VERIFY-IMPROVE-PANEL-001                                                                                                                                                                                                               |

#### L-VRIP-002: seqRef パターン — 複数の非同期リクエスト中に古いレスポンスを破棄する

| 項目         | 内容                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | reverify ボタンを連打すると複数のリクエストが並走し、古いレスポンスが後着することで表示が巻き戻る。`isReverifying` フラグだけでは二重送信は防げても stale response は防げない                                                                     |
| 解決策       | `const verifyDetailRequestSeqRef = useRef(0)` をコンポーネントに置き、リクエスト送信時にインクリメント。レスポンス受信コールバック内で `if (seq !== verifyDetailRequestSeqRef.current) return` と照合し古いレスポンスを破棄する                  |
| 標準ルール   | 同一ソースへの複数非同期呼び出しが発生しうる UI には seqRef パターンを適用する。`isXxxing` フラグとの併用で「送信防止（UI）」と「stale 破棄（データ）」を分離できる                                                                              |
| 関連タスク   | TASK-RT-03-VERIFY-IMPROVE-PANEL-001                                                                                                                                                                                                               |

#### L-VRIP-003: StatusBadge optional label — 後方互換を維持したまま verify 固有語彙を注入する

| 項目         | 内容                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | Plan/Execute 向けの StatusBadge は「成功/失敗/実行中」ラベルを内部決定する設計だったが、Verify パネルでは「合格/不合格/検証中」という別語彙が必要。コンポーネントを複製せず語彙差異を吸収したい                                                  |
| 解決策       | `StatusBadge` に `label?: string` を追加し、`const displayLabel = label ?? defaultLabel` とする。既存の呼び出し元は label 省略のまま動作し、VerifyResultDetailPanel だけが `label="合格"` 等を渡す設計。破壊的変更なし                           |
| 標準ルール   | 共通 UI パーツに domain 固有語彙を持ち込む場合は optional props でオーバーライドし、デフォルトを既存仕様に保つ。label 注入は呼び出し側の責務とし、コンポーネント内部に domain 知識を埋め込まない                                                 |
| 関連タスク   | TASK-RT-03-VERIFY-IMPROVE-PANEL-001                                                                                                                                                                                                               |

#### L-VRIP-004: aria-expanded / aria-controls テスト — 折りたたみ UI の accessibility 検証パターン

| 項目         | 内容                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | 折りたたみ UI（Governance Notes / Revised Spec など）のテストで `queryByText` だけ確認すると、DOM に存在するが視覚的に折りたたまれている要素を「表示されている」と誤判定する。スクリーンリーダー互換性の保証にもならない                          |
| 解決策       | `expect(button).toHaveAttribute("aria-expanded", "false")` と `expect(button).toHaveAttribute("aria-controls", "governance-notes-content")` を組み合わせてトグル前後の状態を検証する。クリック後は `"true"` に変化することを確認する             |
| 標準ルール   | 折りたたみ UI には `aria-expanded`（状態）+ `aria-controls`（対象 id）+ `role="region"`（内容領域）を実装し、テストではこの三点セットを検証する。`queryByText` による存在確認だけでは不十分                                                      |
| 関連タスク   | TASK-RT-03-VERIFY-IMPROVE-PANEL-001                                                                                                                                                                                                               |


---

## TASK-SDK-SC-04 Skill Output Integration 教訓（2026-04-04）

### L-SC04-001: マーカー検出フォールバック戦略（出力全体をSKILL.mdとして扱う）

| 項目       | 内容                                                                                                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | LLM が `<!-- SKILL_START -->` / `<!-- SKILL_END -->` マーカーを出力しない場合、OutputHandler がマーカー未検出として処理を中断するとスキルが生成されないままになる                                                     |
| 再発条件   | LLM 出力フォーマットが未確定のまま OutputHandler がマーカー必須前提で実装される場合                                                                                                                                  |
| 解決策     | マーカーが検出されない場合は出力全体を SKILL.md コンテンツとして扱うフォールバックを実装する。フォールバック発動時はログで明示し、IPC 通知には `fallbackUsed: true` フラグを含める                                     |
| 標準ルール | LLM 出力パーサーはフォールバック戦略をマーカー検出と同等の優先度で設計し、`happy path` と `no-marker fallback` の両パスにテストを用意する                                                                             |
| 関連タスク | TASK-SDK-SC-04                                                                                                                                                                                                       |

### L-SC04-002: DI注入の二重化（sessionFactory + outputHandler）管理パターン

| 項目       | 内容                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `SkillCreatorIpcBridge` が既に `sessionFactory` をDIで受け取る構造になっていたが、`outputHandler` を追加DIする際に既存コンストラクタ引数の順序・省略可能性・型定義を同時に変更する必要があり、影響範囲が広かった |
| 再発条件   | 既存の DI コンストラクタに省略可能な新パラメータを追加する場合                                                                                                                                                |
| 解決策     | 新しい DI パラメータはオブジェクト形式（options bag）でまとめて受け取り、省略時のデフォルトを明示する。既存の位置引数への追加は破壊的変更になるため options bag に移行する                                     |
| 標準ルール | DI パラメータが3つ以上になる場合は `options` オブジェクトにまとめ、各フィールドにデフォルト値と JSDoc を必ず付与する                                                                                           |
| 関連タスク | TASK-SDK-SC-04                                                                                                                                                                                                |

### L-SC04-003: SkillRegistry上書き確認フロー（フラグ立て→UI確認→再実行）

| 項目       | 内容                                                                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 同名スキルが既にレジストリに存在する場合、黙って上書きするとユーザーが既存スキルを失う。かといってエラーで停止すると再実行コストが高い                                                        |
| 再発条件   | レジストリへの登録処理が同名エントリの存在チェックなしに実行される場合                                                                                                                      |
| 解決策     | 同名検出時は `SKILL_CREATOR_OUTPUT_READY` で `overwriteRequired: true` を通知し、UI 側の確認（`SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED`）を受け取ってから登録を完了する2段階フローを採用する |
| 標準ルール | レジストリ登録系 IPC は「登録完了通知」と「上書き確認要求」の2種類のレスポンスを設計段階で定義し、UI 側が両方のケースを処理できるよう契約に明記する                                           |
| 関連タスク | TASK-SDK-SC-04                                                                                                                                                                                |

### L-SC04-004: ファイルI/Oとレジストリ登録の責務分離（失敗時にIPC通知は継続）

| 項目       | 内容                                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | ファイル保存とレジストリ登録を一体のトランザクションとして扱うと、ファイル書き込み成功後にレジストリ登録が失敗した場合にユーザーへの通知が途絶え、スキルが生成されたことさえ分からなくなる                        |
| 再発条件   | 複数のサイドエフェクト（I/O + 状態更新 + 通知）を try-catch で一括ラップする場合                                                                                                                                |
| 解決策     | ファイルI/O（SKILL.md 保存）とレジストリ登録を独立したステップとして実装し、各ステップの失敗を個別にハンドリングする。いずれかのステップが失敗しても IPC 通知（`SKILL_CREATOR_OUTPUT_READY`）は必ず送信する      |
| 標準ルール | 「永続化 → 登録 → 通知」のパイプラインでは、通知ステップを最後に配置し `finally` ブロックで保護する。途中ステップの失敗は通知ペイロードの `error` フィールドで伝達し、呼び出し元での例外 propagation は行わない |
| 関連タスク | TASK-SDK-SC-04                                                                                                                                                                                                  |
| 関連タスク | TASK-P0-04                                                                                                                                             |

### L-RT-ADAPTER-GUARD-001: LLMAdapter 状態確認は execute/improve の先頭に集約する

| 項目       | 内容                                                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 背景       | `execute()` と `improve()` で LLMAdapter の failed 状態チェックが共通パターンになった                                                                                                        |
| 教訓       | adapter statusチェック→structured error returnのパターンをmethod先頭に配置することで、後続処理の前提条件を明示できる                                                                          |
| 適用       | 新しいpublicメソッドでLLMAdapterに依存する処理を追加する場合、同パターンを適用する                                                                                                           |
| 関連タスク | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001                                                                                                                                              |

---
