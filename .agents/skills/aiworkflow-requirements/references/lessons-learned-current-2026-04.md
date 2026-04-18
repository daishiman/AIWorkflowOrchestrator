# Lessons Learned（current）2026-04

> 親ファイル: [lessons-learned-current.md](lessons-learned-current.md)
> 前半記録（2026-03-25～2026-04-08）: [lessons-learned-2026-04-early.md](lessons-learned-2026-04-early.md)
> CI計測テンプレート教訓（2026-04-15）: [lessons-learned-ci-measurement-template-2026-04.md](lessons-learned-ci-measurement-template-2026-04.md)

## TASK-SC-FIX-GENERATE-SKILL-MD-001 generate_skill_md.js 引数修正 教訓（2026-04-15）

### L-SC-FIX-001: generate_skill_md.js は `--path <dir>` ではなく `--plan <json> --output <path>` を要求する

| 項目       | 内容                                                                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `SkillCreatorService.ts` が `["--path", skillDir]` でスクリプトを呼び出していたため、`generateResult.success` が常に `false` となり `ensureSkillMdExists` フォールバックのみで動作し続けていた |
| 解決策     | `os.tmpdir()` 配下に UUID 付き一時 JSON ファイルを生成し、`["--plan", tmpPlanPath, "--output", skillMdPath]` で呼び出す。`finally` でクリーンアップ                                            |
| 標準ルール | `generate_skill_md.js` を呼ぶときは `--plan <planJsonPath> --output <outputPath>` を必ず指定すること                                                                                           |
| 関連タスク | TASK-SC-FIX-GENERATE-SKILL-MD-001                                                                                                                                                              |

### L-SC-FIX-002: 外部スクリプトへの JSON データ渡しは temp ファイル経由とし、finally で確実にクリーンアップする

| 項目       | 内容                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | スクリプト引数として大きなオブジェクトを渡す場合、コマンドライン引数の文字数制限に引っかかる可能性がある                                                                 |
| 解決策     | `os.tmpdir()` + `randomUUID()` でユニークな一時ファイルを生成し、JSON を書き込んでパスのみを引数に渡す。`finally` ブロックで `.catch(() => {})` つきクリーンアップを実施 |
| 標準ルール | 一時ファイルのクリーンアップは `finally` ブロックで行い、クリーンアップ失敗は non-fatal として `.catch(() => {})` で許容する                                             |
| 関連タスク | TASK-SC-FIX-GENERATE-SKILL-MD-001                                                                                                                                        |

---

## UT-SKILL-WIZARD-FB-05 テスト証跡一本化テンプレート 教訓（2026-04-13）

### L-FB05-001: docs-only でも Phase 11 証跡テンプレートは「件数・edge case・判断根拠」の3点を1ファイルで完結させる

| 項目       | 内容                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | テスト件数・edge case・仕様判断根拠が別ファイルに分散すると、Phase 12 レビューで全体像確認に時間がかかる                        |
| 解決策     | `manual-test-result` テンプレートの冒頭に「テスト件数と内訳」、中段に「edge case 一覧表」、末尾に「仕様判断根拠」を固定配置した |
| 標準ルール | docs-only / NON_VISUAL でも、証跡テンプレートは 1 ファイル完結を優先する                                                        |
| 関連タスク | UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001                                                                           |

### L-FB05-002: edge case テーブルは SD-ID 参照で仕様判断を再利用し、重複記述を避ける

| 項目       | 内容                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------- |
| 課題       | 各 edge case 行に判断理由を全文で書くと、同じ仕様判断を実装・テスト・ドキュメントで重複記載しやすい |
| 解決策     | edge case 一覧表は `仕様判断根拠ID` を参照し、判断の正文は「仕様判断根拠」テーブルに集約する        |
| 標準ルール | case 行は検証結果、判断テーブルは意思決定根拠という責務分離を維持する                               |
| 関連タスク | UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001                                               |

### L-FB05-003: `spec_created` close-out でも system spec 同期（workflow / lesson / logs / topic-map）を同 wave で閉じる

| 項目       | 内容                                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | docs-only だからと system spec 側の反映を後回しにすると、`spec_created` 状態と current facts の同期が崩れる                             |
| 解決策     | `task-workflow`・`lessons-learned`・`LOGS`・`topic-map` を同 wave で更新し、Phase 12 Step 1 の同期条件を先に満たしてから close-out した |
| 標準ルール | `spec_created` タスクは実装有無に関係なく、台帳系4点（workflow/lesson/logs/topic-map）を同一波で更新する                                |
| 関連タスク | UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001                                                                                   |

### L-FB05-004: `.agents` / `.claude` ミラーディレクトリの同期コストを最小化するため、差分は同一 wave で一括反映する

| 項目       | 内容                                                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `.claude/skills/` と `.agents/skills/` の二重ミラー構成では、変更箇所が増えるほど同期漏れリスクが高くなり、diff 確認コストが実装コストを上回ることがある             |
| 解決策     | 変更対象ファイルをリストアップしてから `cp` または Edit ツールで `.agents/` 側へ一括コピーし、最後に `diff -qr .claude/skills/ .agents/skills/` で差分ゼロを確認する |
| 標準ルール | ミラー同期は「変更→即コピー」の都度反映ではなく、wave 末尾に「一括コピー→diff 確認」をセットで行う                                                                   |
| 関連タスク | UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001                                                                                                                |

---

## UT-SKILL-WIZARD-FB-03 フィールド独立推論性 教訓（2026-04-11）

### L-FB03-001: `format` は `category` からのみ推論する

| 項目       | 内容                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------- |
| 課題       | `format` を `purpose` からも推論するように読める文言が残ると、仕様の責務境界が崩れる                |
| 解決策     | `purpose -> tool/timing`、`category -> format` を矢印で固定し、`format` を category-only と明記する |
| 標準ルール | `format` の説明には必ず category-only を書く                                                        |
| 関連タスク | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001                                               |

### L-FB03-002: `purpose` と `category` の責務は分離して書く

| 項目       | 内容                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| 課題       | ひとつの説明文で `purpose` と `category` をまとめると、どちらが何を決めるか曖昧になる |
| 解決策     | 役割を 1 行ずつ分け、`purpose` は tool/timing、`category` は format と固定した        |
| 標準ルール | field independence は表でなくてもよいが、責務は必ず 2 行以上に分けて書く              |
| 関連タスク | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001                                 |

### L-FB03-003: docs-only close-out でも same-wave sync を省略しない

| 項目       | 内容                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| 課題       | 実装変更がなくても、`task-workflow` / `LOGS` / `SKILL` / `artifacts.json` がずれると後続レビューで再誤解が起きる |
| 解決策     | docs-only でも Phase 12 成果物 6 件と skill / log / lesson を同 wave で更新した                                  |
| 標準ルール | docs-only close-out でも artifacts・台帳・lesson・log は同時更新する                                             |
| 関連タスク | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001                                                            |

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

| 項目       | 内容                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 標準ルール | IPC fire-and-forget パターンでは Renderer state のエラー保持を壊さないようスナップショット受信コールバックにフェーズ別ガードを設ける |
| 関連タスク | TASK-FIX-LIFECYCLE-PANEL-ERROR-001（Issue #1844）                                                                                    |

### L-LIFECYCLE-EP-003: NON_VISUAL 判定 — React state 変更のみは自動テストで代替可能（2026-04-03）

| 項目       | 内容                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 標準ルール | `setXxx(null)` 等の呼び出し制御のみの修正は NON_VISUAL と判定。UI 描画変更を伴う場合のみ Phase 11 でスクリーンショットが必要 |
| 関連タスク | TASK-FIX-LIFECYCLE-PANEL-ERROR-001                                                                                           |

---

## TASK-SDK-SC-03 External API Support 教訓（2026-04-03）

### L-SC03-001: 並行フロー管理の複雑性（pendingAnswerPromise / pendingExternalApiPromise 相互排他）

| 項目       | 内容                                                                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `SkillCreatorSdkSession` が質問待機（`pendingAnswerPromise`）とAPI設定要求（`pendingExternalApiPromise`）の2つの非同期待機を管理する必要があり、一方が存在する間に他方を開始すると状態が壊れる |
| 再発条件   | SDK custom tool 内で複数の非同期待機フロー（質問 / 外部リソース要求 / 承認要求等）を並行管理する場合                                                                                           |
| 解決策     | 両 Promise の存在を相互にチェックし、一方が pending の場合は他方を拒否する排他パターンを適用。cleanup 時に両方を同時にリセットする                                                             |
| 標準ルール | SDK Session に新しい非同期待機フローを追加する際は、既存の pending フローとの相互排他チェックを必ず設計段階で定義する                                                                          |
| 関連タスク | TASK-SDK-SC-03                                                                                                                                                                                 |

### L-SC03-002: タイムアウト管理の二重化（単一 timeoutHandle を両フローで共有）

| 項目       | 内容                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 質問待機とAPI設定要求の両方が30秒タイムアウトを必要とするが、各フローに個別の timeout を持つと cleanup 時に clearTimeout 漏れが発生しやすい |
| 再発条件   | 複数の非同期フローが同一セッション内でタイムアウト管理を個別に行う場合                                                                      |
| 解決策     | 単一の `timeoutHandle` を両フローで共有し、新しいフロー開始時に前回のタイムアウトをクリアしてから新しいタイムアウトを設定する設計を採用     |
| 標準ルール | 同一コンテキスト内の非同期タイムアウトは共有 handle で管理し、フロー切替時に必ず `clearTimeout` を先行実行する                              |
| 関連タスク | TASK-SDK-SC-03                                                                                                                              |

### L-SC03-003: データ秘匿化の二重管理（sanitizeExternalApiConfigForPrompt）

| 項目       | 内容                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 外部API設定の credential はLLMプロンプトに `[REDACTED]` で注入するが、実際のHTTPリクエストには元の credential を使用する必要があり、同じ config オブジェクトを2つのコンテキストで使い分ける複雑性が発生 |
| 再発条件   | 秘匿情報を含むデータを「表示用」と「実行用」で使い分ける場合                                                                                                                                            |
| 解決策     | `sanitizeExternalApiConfigForPrompt()` は元の config を変更せず、新しいオブジェクトを返す pure function として実装。元の config は SDK Session 内部でのみ保持し、外部への漏洩を防止                     |
| 標準ルール | 秘匿情報の二重管理では、sanitize 関数は必ず immutable（元オブジェクトを変更しない）とし、元データの保持範囲を明示的に限定する                                                                           |
| 関連タスク | TASK-SDK-SC-03                                                                                                                                                                                          |

### L-SC03-004: IPC バリデーションの複雑さ（isValidExternalApiConfig 8条件チェック）

| 項目       | 内容                                                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `ExternalApiConnectionConfig` は8つのバリデーション条件を持ち、条件間に依存関係がある（authType が none 以外の場合のみ credential 必須）ため、テストマトリクスが膨大になる |
| 再発条件   | 条件付きフィールド（authType に応じて credential 必須/不要が変わる）を持つ IPC payload のバリデーション                                                                    |
| 解決策     | バリデーション関数を private メソッドとして分離し、条件分岐を明確に分離。テストは happy path + 各条件の boundary を個別にカバー                                            |
| 標準ルール | 条件付きバリデーションは early return パターンで各条件を独立させ、条件間の依存を明示的にコメントで記録する                                                                 |
| 関連タスク | TASK-SDK-SC-03                                                                                                                                                             |

### L-SC03-005: Preload API 契約拡張の3層一貫性維持（Preload / Main / Renderer）

| 項目       | 内容                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | External API チャネル4本の追加で、`packages/shared/src/ipc/channels.ts`（定数定義）、`apps/desktop/src/preload/channels.ts`（allowlist import）、`apps/desktop/src/preload/skill-creator-api.ts`（invoke 公開）、`apps/desktop/src/preload/skill-creator-session-api.ts`（push listener 公開）の4ファイルを同時更新する必要があり、1ファイルの更新漏れで silent fail が発生 |
| 再発条件   | 新規 IPC チャネル追加時に shared 定数 / preload allowlist / preload API 公開 / Main handler 登録のいずれかが欠落する場合                                                                                                                                                                                                                                                    |
| 解決策     | チャネル追加チェックリストを定義し、4層（shared 定数 → preload import → preload API → Main handler）を同一 PR 内で完結させる                                                                                                                                                                                                                                                |
| 標準ルール | 新規 IPC チャネル追加時は「shared 定数 → preload channels import → preload API 関数 → Main handler 登録 → ALLOWED\_\*\_CHANNELS 追加」の5点を同一コミットで完了する                                                                                                                                                                                                         |
| 関連タスク | TASK-SDK-SC-03                                                                                                                                                                                                                                                                                                                                                              |

---

### 2026-04-04 TASK-RT-03-VERIFY-IMPROVE-PANEL-001（Verify / Improve 結果パネル実装）

#### L-VRIP-001: Layer 別 useMemo グループ化 — LAYER_ORDER で表示順を固定する

| 項目       | 内容                                                                                                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | verify の `checks[]` を Layer 別にグループ化する際、オブジェクトキー列挙順に依存すると Layer 順序が不定になる。0 件 Layer を非表示にする条件と表示順序を両立するロジックが複雑になりがち                                                    |
| 解決策     | `const LAYER_ORDER: VerifyLayerKey[] = ["layer1", "layer2", "layer3", "layer4"]` を定数化し、`useMemo` 内で `LAYER_ORDER.filter(k => groups[k].length > 0)` と順序固定グループ化を分離する。0 件 Layer の非表示も filter で自然に処理できる |
| 標準ルール | 表示順序が仕様に明示されているリストは定数 LAYER_ORDER / STEP_ORDER 等で固定し、オブジェクトキー列挙順には依存しない。useMemo の依存配列は `verifyDetail?.checks` の参照だけにする                                                          |
| 関連タスク | TASK-RT-03-VERIFY-IMPROVE-PANEL-001                                                                                                                                                                                                         |

#### L-VRIP-002: seqRef パターン — 複数の非同期リクエスト中に古いレスポンスを破棄する

| 項目       | 内容                                                                                                                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | reverify ボタンを連打すると複数のリクエストが並走し、古いレスポンスが後着することで表示が巻き戻る。`isReverifying` フラグだけでは二重送信は防げても stale response は防げない                                                   |
| 解決策     | `const verifyDetailRequestSeqRef = useRef(0)` をコンポーネントに置き、リクエスト送信時にインクリメント。レスポンス受信コールバック内で `if (seq !== verifyDetailRequestSeqRef.current) return` と照合し古いレスポンスを破棄する |
| 標準ルール | 同一ソースへの複数非同期呼び出しが発生しうる UI には seqRef パターンを適用する。`isXxxing` フラグとの併用で「送信防止（UI）」と「stale 破棄（データ）」を分離できる                                                             |
| 関連タスク | TASK-RT-03-VERIFY-IMPROVE-PANEL-001                                                                                                                                                                                             |

#### L-VRIP-003: StatusBadge optional label — 後方互換を維持したまま verify 固有語彙を注入する

| 項目       | 内容                                                                                                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Plan/Execute 向けの StatusBadge は「成功/失敗/実行中」ラベルを内部決定する設計だったが、Verify パネルでは「合格/不合格/検証中」という別語彙が必要。コンポーネントを複製せず語彙差異を吸収したい                        |
| 解決策     | `StatusBadge` に `label?: string` を追加し、`const displayLabel = label ?? defaultLabel` とする。既存の呼び出し元は label 省略のまま動作し、VerifyResultDetailPanel だけが `label="合格"` 等を渡す設計。破壊的変更なし |
| 標準ルール | 共通 UI パーツに domain 固有語彙を持ち込む場合は optional props でオーバーライドし、デフォルトを既存仕様に保つ。label 注入は呼び出し側の責務とし、コンポーネント内部に domain 知識を埋め込まない                       |
| 関連タスク | TASK-RT-03-VERIFY-IMPROVE-PANEL-001                                                                                                                                                                                    |

#### L-VRIP-004: aria-expanded / aria-controls テスト — 折りたたみ UI の accessibility 検証パターン

| 項目       | 内容                                                                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | 折りたたみ UI（Governance Notes / Revised Spec など）のテストで `queryByText` だけ確認すると、DOM に存在するが視覚的に折りたたまれている要素を「表示されている」と誤判定する。スクリーンリーダー互換性の保証にもならない             |
| 解決策     | `expect(button).toHaveAttribute("aria-expanded", "false")` と `expect(button).toHaveAttribute("aria-controls", "governance-notes-content")` を組み合わせてトグル前後の状態を検証する。クリック後は `"true"` に変化することを確認する |
| 標準ルール | 折りたたみ UI には `aria-expanded`（状態）+ `aria-controls`（対象 id）+ `role="region"`（内容領域）を実装し、テストではこの三点セットを検証する。`queryByText` による存在確認だけでは不十分                                          |
| 関連タスク | TASK-RT-03-VERIFY-IMPROVE-PANEL-001                                                                                                                                                                                                  |

---

## TASK-SDK-SC-04 Skill Output Integration 教訓（2026-04-04）

### L-SC04-001: マーカー検出フォールバック戦略（出力全体をSKILL.mdとして扱う）

| 項目       | 内容                                                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | LLM が `<!-- SKILL_START -->` / `<!-- SKILL_END -->` マーカーを出力しない場合、OutputHandler がマーカー未検出として処理を中断するとスキルが生成されないままになる                  |
| 再発条件   | LLM 出力フォーマットが未確定のまま OutputHandler がマーカー必須前提で実装される場合                                                                                                |
| 解決策     | マーカーが検出されない場合は出力全体を SKILL.md コンテンツとして扱うフォールバックを実装する。フォールバック発動時はログで明示し、IPC 通知には `fallbackUsed: true` フラグを含める |
| 標準ルール | LLM 出力パーサーはフォールバック戦略をマーカー検出と同等の優先度で設計し、`happy path` と `no-marker fallback` の両パスにテストを用意する                                          |
| 関連タスク | TASK-SDK-SC-04                                                                                                                                                                     |

### L-SC04-002: DI注入の二重化（sessionFactory + outputHandler）管理パターン

| 項目       | 内容                                                                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `SkillCreatorIpcBridge` が既に `sessionFactory` をDIで受け取る構造になっていたが、`outputHandler` を追加DIする際に既存コンストラクタ引数の順序・省略可能性・型定義を同時に変更する必要があり、影響範囲が広かった |
| 再発条件   | 既存の DI コンストラクタに省略可能な新パラメータを追加する場合                                                                                                                                                   |
| 解決策     | 新しい DI パラメータはオブジェクト形式（options bag）でまとめて受け取り、省略時のデフォルトを明示する。既存の位置引数への追加は破壊的変更になるため options bag に移行する                                       |
| 標準ルール | DI パラメータが3つ以上になる場合は `options` オブジェクトにまとめ、各フィールドにデフォルト値と JSDoc を必ず付与する                                                                                             |
| 関連タスク | TASK-SDK-SC-04                                                                                                                                                                                                   |

### L-SC04-003: SkillRegistry上書き確認フロー（フラグ立て→UI確認→再実行）

| 項目       | 内容                                                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 同名スキルが既にレジストリに存在する場合、黙って上書きするとユーザーが既存スキルを失う。かといってエラーで停止すると再実行コストが高い                                                       |
| 再発条件   | レジストリへの登録処理が同名エントリの存在チェックなしに実行される場合                                                                                                                       |
| 解決策     | 同名検出時は `SKILL_CREATOR_OUTPUT_READY` で `overwriteRequired: true` を通知し、UI 側の確認（`SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED`）を受け取ってから登録を完了する2段階フローを採用する |
| 標準ルール | レジストリ登録系 IPC は「登録完了通知」と「上書き確認要求」の2種類のレスポンスを設計段階で定義し、UI 側が両方のケースを処理できるよう契約に明記する                                          |
| 関連タスク | TASK-SDK-SC-04                                                                                                                                                                               |

### L-SC04-004: ファイルI/Oとレジストリ登録の責務分離（失敗時にIPC通知は継続）

| 項目       | 内容                                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | ファイル保存とレジストリ登録を一体のトランザクションとして扱うと、ファイル書き込み成功後にレジストリ登録が失敗した場合にユーザーへの通知が途絶え、スキルが生成されたことさえ分からなくなる                      |
| 再発条件   | 複数のサイドエフェクト（I/O + 状態更新 + 通知）を try-catch で一括ラップする場合                                                                                                                                |
| 解決策     | ファイルI/O（SKILL.md 保存）とレジストリ登録を独立したステップとして実装し、各ステップの失敗を個別にハンドリングする。いずれかのステップが失敗しても IPC 通知（`SKILL_CREATOR_OUTPUT_READY`）は必ず送信する     |
| 標準ルール | 「永続化 → 登録 → 通知」のパイプラインでは、通知ステップを最後に配置し `finally` ブロックで保護する。途中ステップの失敗は通知ペイロードの `error` フィールドで伝達し、呼び出し元での例外 propagation は行わない |
| 関連タスク | TASK-SDK-SC-04                                                                                                                                                                                                  |
| 関連タスク | TASK-P0-04                                                                                                                                                                                                      |

### L-RT-ADAPTER-GUARD-001: LLMAdapter 状態確認は execute/improve の先頭に集約する

| 項目       | 内容                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| 背景       | `execute()` と `improve()` で LLMAdapter の failed 状態チェックが共通パターンになった                                |
| 教訓       | adapter statusチェック→structured error returnのパターンをmethod先頭に配置することで、後続処理の前提条件を明示できる |
| 適用       | 新しいpublicメソッドでLLMAdapterに依存する処理を追加する場合、同パターンを適用する                                   |
| 関連タスク | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001                                                                      |

---

## UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION 教訓（2026-04-04）

### L-RT06-001: 共通基底型（SdkOutputMessageBase）によるlane統一パターン

| 項目       | 内容                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 実行lane（`SkillStreamMessage`）とcreator lane（`SkillCreatorSdkEvent`）が独立した型定義を持ち、共通フィールドが重複していた |
| 解決策     | `SdkOutputMessageBase`（`type: string; timestamp?: number`）を共通基底型として定義し、両laneの型が継承する形に統一した       |
| 標準ルール | lane間に共通フィールドが存在する場合は基底型を `packages/shared` に定義し、各lane型が継承するパターンを採用する              |
| 関連タスク | UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001                                                                              |

### L-RT06-002: @deprecated型エイリアスによる後方互換維持戦略

| 項目       | 内容                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `SkillExecutor.ts` 内でローカル定義していた型を shared に移管する際、既存コードへの影響を最小化する必要があった                 |
| 解決策     | ローカル型を `/** @deprecated Use SkillExecutorStreamMessage from @repo/shared */` エイリアスとして残し、段階的移行を可能にした |
| 標準ルール | shared 移管時は移管元ファイルに `@deprecated` エイリアスを一定期間残し、import の移行猶予期間を設ける                           |
| 関連タスク | UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001                                                                                 |

### L-RT06-003: lane別timestamp必須性の差異（実行lane:必須、creator lane:省略可）

| 項目       | 内容                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 基底型に `timestamp?: number` を定義すると実行laneの必須制約が失われ、型安全性が低下する問題が生じた                             |
| 解決策     | 基底型では `timestamp?: number`（省略可）とし、`SkillExecutorStreamMessage` では `timestamp: number`（必須）にオーバーライドした |
| 標準ルール | 基底型で省略可にしたプロパティを子型で必須にする場合は、子型定義で明示的に `required` に変更することで型安全を確保する           |
| 関連タスク | UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001                                                                                  |

### L-RT06-004: contextual sessionId伝播（init→後続イベント）

| 項目       | 内容                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | creator laneのストリームでは init イベントにのみ `sessionId` が含まれ、後続イベントでは `sessionId` が欠落するため、文脈追跡が困難だった |
| 解決策     | ストリーム正規化ループ内で `sessionId` を contextual 変数として管理し、init 観測時に保存した値を後続イベントに自動的に伝播させた         |
| 標準ルール | session や correlation ID が一部のイベントにしか含まれないストリームでは、最初の観測値を contextual 変数で保持し後続イベントへ注入する   |
| 関連タスク | UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001                                                                                          |

---

## TASK-P0-05 execute→SkillFileWriter persist 統合 教訓（2026-04-05）

### L-P005-001: LLMAdapter Setter Injection パターン（非同期DI）

| 項目       | 内容                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `RuntimeSkillCreatorFacade` の constructor 時点では LLMAdapter が未初期化であり、constructor injection では DI できなかった      |
| 解決策     | Setter Injection（P34 準拠）パターンを採用し、`setLlmAdapter()` で非同期初期化完了後に遅延注入する設計とした                     |
| 標準ルール | 非同期初期化が必要な依存は Setter Injection で注入し、public メソッドの先頭で adapter 有無を検査して structured error を返却する |
| 関連タスク | TASK-P0-05                                                                                                                       |

### L-P005-002: 二重パイプライン（A経路/B経路）の併存管理

| 項目       | 内容                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | A経路（Facade.execute() → parseLlmResponseToContent → SkillFileWriter.persist）と B経路（OutputHandler.handleSessionComplete → SkillRegistry）が同一スキル生成を異なるタイミングで処理し、競合リスクがあった |
| 解決策     | A経路は executeResult に `persistResult`/`persistError` を返し、B経路は SkillRegistry へのインメモリ登録に責務を限定することで、ファイル書き込みとレジストリ登録を分離した                                   |
| 標準ルール | 同一成果物に対して複数パイプラインが存在する場合、各経路の責務（persist vs registry）を明確に分離し、executeResult 型に経路別の結果フィールドを持たせる                                                      |
| 関連タスク | TASK-P0-05                                                                                                                                                                                                   |

### L-P005-003: verify→improve→re-verify ループの再試行戦略

| 項目       | 内容                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| 課題       | verify 結果が不合格の場合に improve→re-verify を繰り返すループで、再試行回数と終了条件の設計が必要だった                  |
| 解決策     | ループ内で verify→improve→re-verify の各ステップを逐次実行し、成功または最大再試行回数到達で終了する戦略を採用した        |
| 標準ルール | 再試行ループは最大回数を設定し、各イテレーションの結果を executeResult に累積記録することで、失敗時の原因追跡を可能にする |
| 関連タスク | TASK-P0-05                                                                                                                |

### L-P005-004: パストラバーサル対策の多層防御

| 項目       | 内容                                                                                                                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | skillName に `../malicious` や `dir/subdir` 等のパストラバーサル攻撃パターンが渡される可能性があった                                                                                                                                      |
| 解決策     | `SkillCreatorOutputHandler.toSlug()` でスキル名を安全な slug に変換し、`SkillFileWriter.persist()` で `PATH_TRAVERSAL` エラーコードによるバリデーションを実施、さらにロールバック機能で部分書き込み時の一貫性を保証する多層防御を実装した |
| 標準ルール | ファイルパス生成時は (1) slug 変換、(2) パスバリデーション（PATH_TRAVERSAL 検出）、(3) 部分書き込みロールバックの 3 層で防御する                                                                                                          |
| 関連タスク | TASK-P0-05                                                                                                                                                                                                                                |

---

## TASK-P0-07 ハードコード AGENT_NAMES の動的解決 教訓（2026-04-06）

### L-P007-001: manifest 不在 vs 破損の validation boundary

| 項目       | 内容                                                                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | manifest ファイルが存在しない場合と、manifest が破損している・phase が不在・resourceIds が空の場合を同じ fallback で処理すると、silent regression が発生した                                  |
| 解決策     | manifest **不在**のみ static fallback（`PLAN_RESOURCE_REQUESTS`/`IMPROVE_RESOURCE_REQUESTS`）を使用し、**破損・phase 不在・resourceIds 空**は `VALIDATION_ERROR` を返す boundary を明確化した |
| 標準ルール | fallback と error の境界は「ファイルが存在しない＝正常な初期状態」vs「ファイルが不正＝設定ミス」で引く。silent fallback は設定ミスを隠蔽するため error に変える                               |
| 関連タスク | TASK-P0-07                                                                                                                                                                                    |

### L-P007-002: resolver/planner/facade の責務分離

| 項目       | 内容                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `RuntimeSkillCreatorFacade.resolveOperationResources()` が root 収集・dedupe・resource 計画の全責務を持っていた                                           |
| 解決策     | root 収集と dedupe は `SkillCreatorSourceResolver` に、resource 計画は `PhaseResourcePlanner` に分離し、Facade は消費者として両者を組み合わせる設計とした |
| 標準ルール | 動的解決パイプラインは「収集・整理・計画・実行」の各ステップを独立クラスに分離する。Facade は組み合わせのみを担い、アルゴリズムは各クラスに閉じ込める     |
| 関連タスク | TASK-P0-07                                                                                                                                                |

### L-P007-003: plan/improve 両方に同じルールを適用する一貫性

| 項目       | 内容                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | plan の manifest 優先解決を実装した際、improve 側への同等の対応を後回しにしたため、2 ルートの動作が非対称になるリスクがあった                                     |
| 解決策     | plan と improve で同じ `PhaseResourceRequest` モデルと `resolveOperationResources()` シグネチャを使用し、phase ごとの差異は `fallbackRequests` 引数でのみ表現した |
| 標準ルール | 複数の operation（plan/improve/verify など）に同じルールを適用する場合は、共通ロジックを単一メソッドに集約し、operation 固有の差異のみを引数で表現する            |
| 関連タスク | TASK-P0-07                                                                                                                                                        |

---

## TASK-SDK-04-U1-F1 先行完了パターン教訓（2026-04-06）

### L-PRE-001: 親タスク実装波での先行完了を Phase 1 P50チェックで検出する

- **状況**: TASK-SDK-04-U1-F1 は `createVerificationReviewRequest()` の `kind: "free_text"` → `"single_select"` 変更タスクだったが、Phase 1 調査時に TASK-SDK-04-U1 の実装波で既に `kind: "single_select"` に変更済みであることが判明した。
- **影響**: Phase 4 の Red テストが no-op になり、「Red を作ってから Green にする」の TDD サイクルが成立しなかった。
- **解決策**: 先行実装を検出したら「テスト整合モード」に切り替える。既存テストは TC-MOD で整合し、新規検証は TC-NEW / TC-ADD で追加する（赤→青を強要しない）。
- **再発防止**: Phase 1 の P50チェックで `grep -rn "single_select\|kind:" <target-file>` を実行し、実装状況を先に確認する。コードと仕様書のステータスが乖離していることを前提に調査を始める。
- **関連**: `task-specification-creator` SKILL.md の `[Feedback SDK-04-U1-F1]` ピットフォールも参照。

---

## TASK-FIX-IPC-SKILL-NAME-001 教訓（2026-04-06）

### L-IPC-DUP-001: `ipcMain.handle()` 重複登録による後続ハンドラ全停止

- **状況**: `registerRuntimeSkillCreatorHandlers()` で同一チャネル `SKILL_CREATOR_GET_ADAPTER_STATUS` が 2 回 `ipcMain.handle()` 登録されていた。
- **影響**: 2 回目の登録時に Electron が例外を投げ、後続 14 個のハンドラが全て未登録になった。
- **解決策**: 重複ブロック（約 35 行）を削除し、登録数を 16 に正規化。
- **再発防止**: `unregisterRuntimeSkillCreatorHandlers()` で同数の `removeHandler()` を対称実装。CI スナップショットテスト追加を follow-up（UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001）として登録。

### L-IPC-DUP-002: `toWizardSkillName()` 正規化5ステップとフォールバック設計

- **状況**: スキル名の自動生成時に日本語・記号・空文字が渡されると、無効な名前（空文字・連続ハイフン等）が生成されていた。
- **解決策**: 以下の順序で正規化: (1)先頭50文字+trim、(2)小文字化、(3)非許容文字→ハイフン、(4)連続ハイフン圧縮、(5)先頭末尾ハイフン除去、(6)空文字→"new-skill"フォールバック。
- **ポイント**: `resolveUniqueSkillName()` と組み合わせることで `new-skill-2` / `new-skill-3` と衝突回避も実現。

### L-IPC-DUP-003: スキル名バリデーション定数の分散リスク

- **状況**: `SkillService.ts` と `init_skill.js` が同型の正規表現 `/^[a-z0-9]+(-[a-z0-9]+)*$/` を個別に保持。
- **判断**: 今回の Bug Fix はスコープ最小化のため定数一元化を行わなかった。
- **follow-up**: `UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001` として未タスク登録済み。

---

## UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 教訓（2026-04-06）

### L-APPROVAL-SURFACE-001: onApprovalRequest cleanup の useEffect 登録パターン

- **苦戦箇所**: cleanup 関数を返すリスナー登録は useEffect の return 値として必ず設定しないと、アンマウント後に approval event が届き続ける
- **解決**: `useEffect(() => { const cleanup = api.onApprovalRequest(...); return cleanup; }, [api])` パターンで登録
- **適用**: Renderer 側の onEvent listener を持つコンポーネント全般

## UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 shared policy 移管 教訓（2026-04-08）

### L-HP-001: async hook テストは renderHook 後に 1 ティック待つ

| 項目       | 内容                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `renderHook(() => useMainlineExecutionAccess())` 直後にアサートすると `act(...)` 警告が出る                                     |
| 原因       | async state update が即座に反映されず、テストが非同期更新を待たない                                                             |
| 解決策     | `await act(async () => { await new Promise(r => setTimeout(r, 0)); })` を renderHook 後に挟む、または flush helper を共通化する |
| 再発防止   | async な hook テストは `renderAccessHook` のような flush 済み wrapper を用意し、個別テストで都度 act を書かない                 |
| 関連タスク | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001                                                                                         |

### L-HP-002: shared 側正本への純粋関数集約でフック責務が薄くなる

| 項目       | 内容                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | hook 内に独自の `apiKeyDegraded` 計算ロジックが重複し、同じ条件が別ファイルで異なる計算式になるリスクがあった                          |
| 原因       | HealthPolicy の集約場所が shared になかったため、各 hook が独自に計算していた                                                          |
| 解決策     | `resolveHealthPolicy()` を `packages/shared/src/types/health-policy.ts` に純粋関数として実装し、hook は呼び出すだけにする              |
| 再発防止   | ドメインルールは shared 側に集約し、hook 側は UI 状態のマッピングだけを持つ。重複計算は将来的な不整合の温床になるため early に集約する |
| 関連タスク | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001                                                                                                |

### L-HP-003: Phase 12 成果物の canonical ファイル名は task 開始時に確定する

| 項目       | 内容                                                                                                                                                                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `outputs/phase-12/` に前タスクの draft と今回の canonical が混在し、どちらが正本か判断に迷った                                                                                                                                                                                                      |
| 原因       | Phase 12 着手前にファイル名の canonical set を確定していなかった                                                                                                                                                                                                                                    |
| 解決策     | Phase 12 着手時に `outputs/phase-12/` の既存ファイルを棚卸しし、今回出力する canonical 名（`implementation-guide.md` / `system-spec-update.md` / `documentation-changelog.md` / `untasked-detection-report.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md`）を先に決める |
| 再発防止   | Phase 12 着手時の初手チェックとして「`outputs/phase-12/` の canonical ファイル名の確定」を明示する。`index.md` と `artifacts.json` の status 同期も同一 wave で行う                                                                                                                                 |
| 関連タスク | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001                                                                                                                                                                                                                                                             |

---

## TASK-FIX-WORKTREE-CONFLICT-001: 並列 worktree コンフリクト解消

### L-WC-001: merge 戦略はファイルの「情報の性質」で決める

| 項目       | 内容                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | 50〜60本の並列 worktree ブランチが `.claude/skills/` 配下を更新するとマージコンフリクトが頻発                                                  |
| 原因       | 追記型テキスト（LOGS.md）・JSON 構造体（EVALS.json）・自動生成ファイル（indexes/\*.json）・静的仕様（SKILL.md）が同じ merge 戦略で扱われていた |
| 解決策     | 追記型 → `merge=union`、JSON 構造・自動生成 → `merge=ours` + post-merge 再生成、静的仕様 → 変更履歴を別ファイルに分離して `merge=union`        |
| 再発防止   | 新しいファイルを `.gitattributes` に追加する際は「追記型か・構造化データか・自動生成か・静的仕様か」を最初に判断する                           |
| 関連タスク | TASK-FIX-WORKTREE-CONFLICT-001                                                                                                                 |

### L-WC-002: シェルスクリプトの外部コマンドは `command -v` で存在確認する

| 項目       | 内容                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| 症状       | `set -euo pipefail` 環境で `node: command not found` → 終了コード 127 でフックが失敗         |
| 原因       | `[ -f "$SCRIPT" ]` でスクリプト存在確認はしていたが、`node` コマンド自体の存在確認がなかった |
| 解決策     | `command -v node > /dev/null 2>&1 &&` を条件に追加し、node 不在時は正常終了                  |
| 再発防止   | `set -euo pipefail` 環境では外部コマンドの呼び出し前に必ず `command -v <cmd>` で存在確認する |
| 関連タスク | TASK-FIX-WORKTREE-CONFLICT-001                                                               |

### L-WC-003: husky を使うプロジェクトでは git フックパスが `.husky/_/` になる

| 項目       | 内容                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| 症状       | `git rev-parse --git-path hooks/post-merge` が `.git/hooks/post-merge` ではなく `.husky/_/post-merge` を返す   |
| 原因       | プロジェクトが husky を使用しており、`core.hooksPath=.husky/_` が設定されている                                |
| 解決策     | `git rev-parse --git-path hooks/post-merge` の返り値をそのままインストール先として使う（パスを決め打ちしない） |
| 再発防止   | フックのインストール先は常に `git rev-parse --git-path hooks/<hook-name>` で動的に解決する                     |
| 関連タスク | TASK-FIX-WORKTREE-CONFLICT-001                                                                                 |

---

## UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001 教訓（2026-04-08）

### L-RV-001: テスト文字列の実文字数を必ず数えて確認する

| 項目       | 内容                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | EC-09 で `"十文字以上の目的"` を「10文字以上の目的文字列」として使い、minLength バリデーションが通過してしまうはずが実際にはテスト失敗した         |
| 原因       | `"十文字以上の目的"` は日本語7文字であり、minLength: 10 の条件を満たさなかった。目視で「十文字以上と書いてあるから10文字以上だろう」と誤認したため |
| 解決策     | テスト文字列を書く前に `"...".length` で実文字数を確認する。日本語の場合、漢数字表記の意味と実際の文字数は別物                                     |
| 再発防止   | minLength / maxLength を境界にするテストケースは、文字列の実 `.length` 値を先にコメントとして記載してからテストを書く                              |
| 関連タスク | UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001                                                                                                          |

### L-RV-002: pure function バリデーションは Zod なしでも型安全を達成できる

| 項目       | 内容                                                                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 設計判断   | `validateSkillName` / `validatePurpose` / `validateSkillInfoForm` を Zod スキーマではなく TypeScript 純粋関数として実装した                                                                                                         |
| 利点       | ① `packages/shared` への Zod 依存追加なし ② 戻り値型（`SkillInfoFieldValidationResult` / `SkillInfoFormValidationResult`）が明示的で、呼び出し元の型推論が効く ③ テストが純粋な入出力検証で完結し、スキーマ定義とのズレが発生しない |
| 適用条件   | バリデーションルールが「文字数制限」「空白チェック」程度のシンプルなケースに有効。複雑な依存検証が必要な場合は Zod の方が保守性が高い                                                                                               |
| 関連タスク | UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001                                                                                                                                                                                           |

---

## UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 教訓（2026-04-08）

### L-CRS-001: ConversationRoundStep semantic デフォルト正規化の設計的分散

| 項目         | 内容                                                                                                                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | `normalizeSelectedOption()` の switch 文が q1/q3/q5/q6 の 4 ケースに分散しており、新しい `SmartDefaultResult` フィールドを追加する際に「型定義（`ConversationAnswers`）」「マッピング（`QUESTION_OPTION_VALUES`）」「switch 文」の 3 箇所を同時更新する必要がある    |
| 再発条件     | SmartDefaultResult のフィールドが増えるたびに normalizeSelectedOption の switch 文に新ケースを追加し忘れると、新フィールドのデフォルト値が正規化されずに raw 値のままUIラベルとして表示される                                                                        |
| 解決策       | 将来的には `SEMANTIC_LABEL_MAP: Record<QuestionKey, Record<string, string>>` のような宣言的マッピングテーブルに集約することで更新箇所を 1 箇所に削減できる。現在の switch 文は各 QuestionKey に対応するマッピングを 1 オブジェクトに統一する形にリファクタリング可能 |
| 標準ルール   | semantic デフォルト正規化ロジックは宣言的テーブルで管理し、新フィールド追加時はテーブル 1 箇所の更新で完結するよう設計する                                                                                                                                           |
| 関連タスク   | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001                                                                                                                                                                                                                       |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                                                                                                                                                                                        |

### L-CRS-002: worktree と main ブランチの仕様書ステータス同期不整合

| 項目       | 内容                                                                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | main ブランチで完了済みのタスク（`ut-health-policy-runtime-injection`）の spec files が worktree 内に `spec_created` ステータスのまま残留した。worktree が別タスク専用に切られた際に main 側の完了状態が worktree に反映されないことが原因 |
| 再発条件   | worktree 作成後に main 側でタスクが完了し `docs/30-workflows/` から spec が削除・移動された場合、worktree では依然として旧 spec が存在し続ける                                                                                             |
| 解決策     | worktree 作成時（または作業開始時）に `docs/30-workflows/` の仕様書ステータスを `git diff main -- docs/30-workflows/` で main と照合する。main 側で削除済みの spec は worktree からも削除またはアーカイブへ移動する                        |
| 標準ルール | worktree 独立性を保ちつつ、Phase 1 のタスク開始時チェックとして「main ブランチでの完了済み spec の残留がないか」を確認する手順を追加する                                                                                                   |
| 関連タスク | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001                                                                                                                                                                                             |
| 関連削除   | `docs/30-workflows/ut-health-policy-runtime-injection/` 削除（worktree 内残留解消）                                                                                                                                                        |

---

## W0-seq-02 SmartDefault推論サービス実装 教訓（2026-04-08）

### L-SMART-DEFAULT-001: inferSmartDefaults の三軸推論設計

- **苦戦箇所**: Slack / GitHub / Notion を判定するツール推論・タイミング推論・フォーマット推論の3軸が混在すると、テストケースの責務が不明確になる。
- **解決策**: `inferSmartDefaults()` を「ツール推論 → タイミング推論 → フォーマット推論」の順で直列パイプラインとし、各軸の推論を独立した private 関数に分離した。ユニットテスト33件はすべて軸単位のアサーション。
- **標準ルール**: 複数軸の推論を持つサービスは、軸ごとに private 関数を切り出し、統合関数はパイプライン呼び出しのみにする。テストは軸ごとに分割して責務を明確化する。
- **関連タスク**: W0-seq-02, UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

### L-SMART-DEFAULT-002: SmartDefaultResult / SkillInfoFormData の root export 追加

- **状況**: `packages/shared/src/index.ts` への export 追加を後回しにしたため、renderer 側 import がコンパイルエラーになった。
- **解決策**: 共有型は実装と同ターンで `src/index.ts` に export する。
- **再発防止**: shared パッケージに新型を追加する際は Phase 2 設計成果物に root export 追加を必須 checklist として入れる。

---

## UT-HEALTH-POLICY-RUNTIME-INJECTION-001 healthPolicy DI注入 教訓（2026-04-08）

### L-HEALTH-DI-001: RuntimeSkillCreatorFacade への optional DI 追加パターン

- **苦戦箇所**: `RuntimeSkillCreatorFacade` のコンストラクタに `healthPolicy?: HealthPolicy` を追加する際、既存のテストが引数順序の変更で全壊するリスクがあった。
- **解決策**: 末尾 optional 引数として追加し、`RuntimePolicyResolver` の第3引数へ接続。既存テストは無変更で PASS。
- **標準ルール**: Facade への DI 追加は末尾 optional パラメータ優先。引数順序が固定された既存テストを壊さずに拡張できる。
- **関連タスク**: UT-HEALTH-POLICY-RUNTIME-INJECTION-001

### L-HEALTH-DI-002: improve/plan 両テストへの対称適用

- **状況**: `RuntimeSkillCreatorFacade.improve.test.ts` にのみ healthPolicy テストを追加し、`plan.test.ts` への対称追加を後回しにした。
- **教訓**: DI 対象が複数の operation（plan/improve）を持つ場合、同一ターンで両方のテストを更新しないと非対称状態が残る。

---

## W1-par-02a SkillInfoStep実装（DescribeStep再設計）教訓（2026-04-08）

### L-SKILL-INFO-STEP-001: DescribeStep → SkillInfoStep の破壊的改名理由

- **背景**: `DescribeStep` はウィザード Step 0 の役割を「説明入力」に限定した命名だったが、実際には skill名・カテゴリ・タグ等の複合情報入力フォームへと要件が拡張された。
- **解決策**: `SkillInfoStep` に改名し、フォームフィールドを `SkillInfoFormData` 型で一元管理。スクリーンショット証跡 TC-01〜TC-08 で UI 検証を実施。
- **標準ルール**: ウィザード Step コンポーネントの命名は「操作動詞（Describe）」ではなく「対象ドメイン（SkillInfo）」ベースにする。拡張時の改名コストを下げるため。
- **関連タスク**: W1-par-02a, UT-SKILL-WIZARD-W1-par-02a

### L-SKILL-INFO-STEP-002: arch-state-management-skill-creator.md の current facts 是正

- **状況**: `arch-state-management-skill-creator.md` に `generationMode` の古い記述と DescribeStep への参照が残り、仕様書と実装が乖離していた。
- **解決策**: 同ターンで `SkillInfoStep` への参照に更新し、current facts として是正。
- **再発防止**: コンポーネント改名時は arch-state-management 系ドキュメントを必ず同ターンで更新する。

---

## UT-SKILL-WIZARD-W2-seq-03b wizard exports 教訓（2026-04-08）

### L-WIZARD-EXPORT-001: barrel export の「今回の差分」と「既に廃止済み」を分けて記録する

- **苦戦箇所**: `wizard/index.ts` の export 整理で、`DescribeStep` の削除と `ConfigureStep` 系の既廃止を同じ粒度で書くと、実差分と履歴が混ざって見える。
- **解決策**: current diff では実際に変更した `DescribeStep` / `DescribeStepProps` と `SkillInfoStepProps` だけを明示し、`ConfigureStep` 系は「既に削除済み」と注記する。
- **標準ルール**: barrel export の記録は「今回の差分」「既存の廃止済み」「維持エクスポート」を分けて書き、実コードとの差分を 1 対 1 にする。

### L-WIZARD-EXPORT-002: NON_VISUAL の証跡は actual test case と no-op 記録を一致させる

- **苦戦箇所**: Phase 11 の証跡で、実際の 13 テスト内容と `@deprecated` JSDoc などの未検証項目が混ざると、再現時に証跡の信頼性が落ちる。
- **解決策**: 手動テスト結果・証跡インデックス・スクリーンショット計画を同じ語彙に揃え、UI 変更がない場合は `no-op` と明示する。
- **標準ルール**: NON_VISUAL タスクでは、screenshot を「不要」と書くだけでなく、代替証跡とテスト名を完全一致させる。

---

## Google Calendar スキル新規追加 教訓（2026-04-08）

### L-GOOGLE-CAL-001: サービスアカウント + Slack Webhook の複合認証設計

- **苦戦箇所**: Google Calendar API（サービスアカウント認証）と Slack API（Webhook URL）の2種類の認証方式を1スキルで管理する際、環境変数の命名規則と設定ガイドを分離しないと混乱が生じた。
- **解決策**: `references/google-calendar-setup.md` と `references/slack-setup.md` を別ファイルに分離し、各認証の設定手順を独立管理。`scripts/setup_check.js` で Phase 1 の環境確認を自動化した。
- **標準ルール**: 複数外部サービスを扱うスキルは、サービスごとに setup ガイドを別ファイルに分離する。単一 README に混在させない。

### L-GOOGLE-CAL-002: googleapis パッケージの pnpm workspace 配置

- **状況**: `googleapis ^144.0.0` を `.claude/skills/google/package.json` に配置したが、workspace の pnpm に認識されるか確認が必要だった。
- **解決策**: スキルディレクトリを独立 package として扱い、`node_modules` は `scripts/` 実行時に `pnpm install` で解決する設計とした。
- **適用**: Claude Code スキルでのみ使う外部 npm パッケージは、スキルディレクトリ直下の `package.json` に閉じ込める。

---

## UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001: SkillLifecyclePanel ウィザード遷移ボタン化

### L-WIZARD-001: 固定値プロンプトによる実行フロー安定化

| 項目       | 内容                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | UIのtextarea入力に依存した実行フローで、入力値の存在確認ロジックが複雑化していた                                                             |
| 原因       | `executionPrompt` stateを通じた自由入力を許可していたため、`canExecuteSkill`判定が3条件以上に肥大化                                          |
| 解決策     | `defaultExecutionPrompt`定数を導入し、UIからの入力を排除。`canExecuteSkill`を「アダプター正常・スキル選択済み・実行中でない」の3条件に簡約化 |
| 再発防止   | スキル実行フローの「入力値」は定数化を検討する。UIに入力欄を設けると条件分岐が増えるため、UIとロジックを早期に分離する                       |
| 関連タスク | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001                                                                                            |

### L-WIZARD-002: 責務別props分離パターン（ウィザード・スキル・設定の導線分離）

| 項目       | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | 画面遷移の導線が1つのcallbackに混在しそうになっていた                                                                                                            |
| 原因       | `onOpenWizard` / `onOpenSkillWizard` / `onOpenSettings` を同一propsにまとめようとしていた                                                                        |
| 解決策     | 導線の責務ごとにpropsを分離。`onOpenWizard`（新規スキル作成）、`onOpenSkillWizard`（既存スキルウィザード）、`onOpenSettings`（設定画面）を独立したpropとして定義 |
| 再発防止   | 複数の画面遷移が必要なコンポーネントは、遷移先の「責務」ごとにpropsを分割する。1つのcallbackで分岐するとテスタビリティが下がる                                   |
| 関連タスク | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001                                                                                                                |

### L-WIZARD-003: 部分完了タスクの引き継ぎ管理

| 項目       | 内容                                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | 前タスク(PR#2036)で実装済みの要素（`skill-lifecycle-request-input`削除、ウィザードボタン追加）と、今タスクの新規作業（`skill-lifecycle-execution-input`削除）が混在し、Phase 1の現状分析が複雑化 |
| 原因       | タスク分割時に「前タスクのcarry-over要素」を明示するセクションがPhase 1にない                                                                                                                    |
| 解決策     | Phase 1の要件定義着手前に「前タスクのcurrent facts」を棚卸しし、今タスクで新規実施する作業との差異を明確化する                                                                                   |
| 再発防止   | Phase 1 requirement definitionに「前タスクcarry-over確認」セクションを追加する。`git log --oneline -5`と`current code`の照合を初手で行う                                                         |
| 関連タスク | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001                                                                                                                                                |

### L-WIZARD-004: describe.skip内の旧testid参照残存リスク

| 項目       | 内容                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `llm-generation.test.tsx` と `auth-regression.test.tsx` の `describe.skip` ブロック内に、削除済みtestid `skill-lifecycle-request-input` が残存 |
| 原因       | UIコンポーネントのtestidを変更・削除した際、`skip`されているテストファイルへの影響確認を省略していた                                           |
| 解決策     | testid削除時は`grep -r "testid名" --include="*.test.*"`で全テストファイルを検索し、skipブロック内の参照も確認する                              |
| 再発防止   | Phase 12準拠チェックに「削除したtestidがskipブロック内に残っていないか確認」を追加する。残存している場合はcleanupタスクをbacklogに登録する     |
| 関連タスク | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001                                                                                              |

> 注記（2026-04-08 分離）:
>
> - UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 教訓（L-HP-001/002/003）と TASK-FIX-WORKTREE-CONFLICT-001 教訓（L-WC-001/002/003）は [lessons-learned-health-policy-worktree-2026-04.md](lessons-learned-health-policy-worktree-2026-04.md) へ移動しました。
> - スキルウィザード関連教訓（L-CRS-001/002, L-SMART-DEFAULT-001/002, L-HEALTH-DI-001/002, L-SKILL-INFO-STEP-001/002, L-WIZARD-EXPORT-001/002, L-GOOGLE-CAL-001/002）は [lessons-learned-skill-wizard-redesign.md](lessons-learned-skill-wizard-redesign.md) へ移動しました。
> - W3-seq-04 使用率計装教訓（L-W3-TRACK-001/002, L-WIZARD-LANE-CLEANUP-001）は [lessons-learned-w3-usage-tracking-2026-04.md](lessons-learned-w3-usage-tracking-2026-04.md) へ移動しました。

---

## TASK-UI-SCHEDULE-VISUAL-PICKER-001 教訓（2026-04-09）

### L-VSCPKR-001: JSDoc コメント内 `*/` は esbuild パースエラーの原因になる

| 項目       | 内容                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `cronParser.ts` の JSDoc コメント内に `*/` を含む説明（例: `ステップ値 */n`）があると esbuild がコメント終端と誤認識しパースエラーになる                |
| 原因       | esbuild は `/*` 〜 `*/` をコメントとして解析するため、JSDoc 内に `*/` が含まれると誤って終端と判定される                                                |
| 解決策     | `*/` を `* /` とスペースで分割するか、コードブロック（\`\`\`）形式でサンプルを記述する。cron 式（例: `*/5`）は JSDoc の `@example` 内でも `* /5` と書く |
| 再発防止   | cron 式や数式を JSDoc コメントで説明する際は `*/` を避けるルールを周知する。Phase 5 実装後に `npx tsc --noEmit` を早期実行してパースエラーを検出する    |
| 関連タスク | TASK-UI-SCHEDULE-VISUAL-PICKER-001 / SK-01                                                                                                              |

### L-VSCPKR-002: happy-dom 環境での `vi.stubGlobal("window", ...)` は React を破壊する

| 項目       | 内容                                                                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | 統合テストで `vi.stubGlobal("window", { api: mockApi })` を使うと React 内部の `instanceof HTMLElement` チェックが常に `false` になり、コンポーネントのレンダリングが壊れる |
| 原因       | `vi.stubGlobal` でウィンドウ全体を差し替えると、happy-dom の `HTMLElement` プロトタイプチェーンが切断され、React の DOM 検証ロジックが正常に動作しなくなる                  |
| 解決策     | `window.api` などの Electron Preload API のモックには `Object.defineProperty(window, "api", { value: mockApi, writable: true, configurable: true })` を使用する             |
| 再発防止   | テスト設定ガイドに「window.api のモックは Object.defineProperty を使うこと / vi.stubGlobal("window", ...) は禁止」を明記する                                                |
| 関連タスク | TASK-UI-SCHEDULE-VISUAL-PICKER-001 / SK-02                                                                                                                                  |

### L-VSCPKR-003: 変換ユーティリティを純粋関数として設計すると Vitest テストが単純化される

| 項目       | 内容                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 知見       | `visualConfigToCron()` / `cronToVisualConfig()` をすべて副作用のない純粋関数として実装したことで、Vitest でモックが不要になりテストが単純化された |
| 効果       | React コンポーネント外でも利用可能なユーティリティになり、CLI / API での再利用が容易になる                                                        |
| 適用範囲   | UI とデータ変換を分離する際、変換ユーティリティは必ず純粋関数として実装し、`useXxx` hook 内には変換ロジックを書かない                             |
| 関連タスク | TASK-UI-SCHEDULE-VISUAL-PICKER-001 / DP-02                                                                                                        |

### L-VSCPKR-004: カバレッジ確認は Phase 7 先送りせず Phase 5-6 でインクリメンタルに行う

| 項目       | 内容                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | Phase 7 でまとめてカバレッジを確認した結果、`cronHumanizer` の英語 locale ブランチが未カバーと判明し Phase 6 へ手戻りが発生した |
| 原因       | 実装・テスト追加を Phase 5-6 で行い、カバレッジ確認を Phase 7 に先送りしていた                                                  |
| 解決策     | 各ファイルを実装するたびに `npx vitest run --coverage` を実行し、branch coverage を都度確認する                                 |
| 再発防止   | Phase 5-6 の完了条件チェックリストに「変更ファイルのブランチカバレッジ確認」を追加する                                          |
| 関連タスク | TASK-UI-SCHEDULE-VISUAL-PICKER-001 / WF-01                                                                                      |

## UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001: SkillCategory ラベルマッピング集約

### L-CLM-001: `satisfies` パターンでコンパイル時ラベルドリフト防止

| 項目       | 内容                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `SkillCategory` の union 型に新値を追加した際、各コンポーネントの日本語ラベル文字列が漏れなく更新されているかを実行時まで確認できなかった                     |
| 原因       | 各コンポーネントが独自に `CATEGORY_VALUES` 定数を保持し、shared contract に依存していなかった                                                                 |
| 解決策     | `SKILL_CATEGORY_LABELS satisfies Record<SkillCategory, string>` を shared 型として定義し、新規 `SkillCategory` 追加時にラベル漏れをコンパイルエラーで検出する |
| 再発防止   | enum/union に表示ラベルが必要な場合は `satisfies Record<union, string>` を標準パターンとして採用する。`as const` だけでは型検査が働かない点に注意             |
| 関連タスク | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001                                                                                                                 |

### L-CLM-002: deprecated コンポーネントも canonical contract に依存させる

| 項目       | 内容                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `DescribeStep`（deprecated）が旧ラベル文字列（例: `コード支援`）をハードコードしており、canonical の `SKILL_CATEGORY_LABELS` から乖離していた             |
| 原因       | deprecated 扱いのため「どうせ削除するから修正不要」と判断し、shared contract 切り替えを後回しにした                                                       |
| 解決策     | deprecated コンポーネントであっても canonical contract のラベル定数を参照させ、drift を防ぐ。`DescribeStep.test.tsx` に canonical option 表示テストを追加 |
| 再発防止   | deprecated マークが付いていても、型/定数依存の修正は同波で実施する。「削除前提」は drift 放置の理由にならない                                             |
| 関連タスク | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001                                                                                                             |

### L-CLM-003: Phase 12 台帳3点同期チェックリスト化

| 項目       | 内容                                                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 症状       | Phase 12 compliance check が台帳 parity チェックで FAIL し、全体が BLOCKED になるまで artifacts.json の不一致が検出されなかった                                        |
| 原因       | Phase 12 標準フローに「repo root `artifacts.json` ↔ `outputs/artifacts.json` ↔ phase spec artifact 名」の3点同期チェックが含まれていなかった                           |
| 解決策     | Phase 12 着手時の **初手チェック** として台帳3点（workflow spec / `artifacts.json` / `outputs/artifacts.json`）の parity 確認を必須化した（SKILL.md v10.09.41 に反映） |
| 再発防止   | `complete-phase.js` 実行前に `jq '.artifacts                                                                                                                           | keys' artifacts.json`と`outputs/artifacts.json` を diff して0件を確認する |
| 関連タスク | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001                                                                                                                          |

## TASK-UI-SCHEDULE-CRON-SEMANTIC-001 意味論的 cron バリデーション（2026-04-12）

### L-CRON-SEM-001: cron-parser@5.5.0 の DOM strict 判定（DOW 救済なし）

| 項目       | 内容                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | `"0 0 31 2 *"` に対して `cron-parser` が例外を投げるか `interval.next()` が無限ループするかを事前確認していなかった。Phase 2 の仕様ではまだ挙動が未確定だった                              |
| 原因       | `cron-parser@5.5.0` は DOM（day-of-month）と DOW（day-of-week）を独立して評価し、DOW が wildcard でも DOM の不達は救済しない。この strict 判定を Phase 2 の P50 チェックに含めていなかった |
| 解決策     | `options.semantic: true` 時は「到達不能なスケジュールは全て拒否する安全側判定」として使う方針に確定。DOM strict を前提として `safe-side` として採用した                                    |
| 再発防止   | Phase 2 library P50 チェックに「DOM × DOW 組み合わせの実測確認（`"0 0 31 2 *"` 等）」を追加する                                                                                            |
| 関連タスク | TASK-UI-SCHEDULE-CRON-SEMANTIC-001                                                                                                                                                         |
| 解決策     | `options.semantic: true` 時は「到達不能なスケジュールは全て拒否する安全側判定」として使う方針に確定。DOM strict を前提として `safe-side` として採用した                                    |
| 再発防止   | Phase 2 library P50 チェックに「DOM × DOW 組み合わせの実測確認（`"0 0 31 2 *"` 等）」を追加する                                                                                            |
| 関連タスク | TASK-UI-SCHEDULE-CRON-SEMANTIC-001                                                                                                                                                         |
| 項目       | 内容                                                                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------                              |
| 症状       | `SkillCategory` の union 型に新値を追加した際、各コンポーネントの日本語ラベル文字列が漏れなく更新されているかを実行時まで確認できなかった                                                  |
| 原因       | 各コンポーネントが独自に `CATEGORY_VALUES` 定数を保持し、shared contract に依存していなかった                                                                                              |
| 解決策     | `SKILL_CATEGORY_LABELS satisfies Record<SkillCategory, string>` を shared 型として定義し、新規 `SkillCategory` 追加時にラベル漏れをコンパイルエラーで検出する                              |
| 再発防止   | enum/union に表示ラベルが必要な場合は `satisfies Record<union, string>` を標準パターンとして採用する。`as const` だけでは型検査が働かない点に注意                                          |
| 関連タスク | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001                                                                                                                                              |

### L-CRON-SEM-002: `semantic: true` は opt-in safe-side として設計する

| 項目       | 内容                                                                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `semantic: true` で DOW wildcard（例: `* * 29 2 *` は4年に1度有効）まで拒否されるかという懸念が生じた                                                                                    |
| 原因       | `semantic` フラグの意味論が「厳密な到達可能性チェック」か「緩やかなヒント」かが設計当初に明文化されていなかった                                                                          |
| 解決策     | `semantic: true` = 「次回実行時刻が計算できない場合は全て拒否する安全側判定」と明文化。呼び出し側が意図的に `options` を渡す opt-in 設計を維持し、既存 UI 呼び出しは non-semantic のまま |
| 再発防止   | `ValidateCronOptions` の JSDoc に safe-side 判定である旨を明示する。新しい呼び出し経路を追加する場合は別タスクで semantic 有効化の意図を明示する                                         |
| 関連タスク | TASK-UI-SCHEDULE-CRON-SEMANTIC-001                                                                                                                                                       |
| 再発防止   | `ValidateCronOptions` の JSDoc に safe-side 判定である旨を明示する。新しい呼び出し経路を追加する場合は別タスクで semantic 有効化の意図を明示する                                         |
| 関連タスク | TASK-UI-SCHEDULE-CRON-SEMANTIC-001                                                                                                                                                       |
| 項目       | 内容                                                                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------                                |
| 症状       | `DescribeStep`（deprecated）が旧ラベル文字列（例: `コード支援`）をハードコードしており、canonical の `SKILL_CATEGORY_LABELS` から乖離していた                                            |
| 原因       | deprecated 扱いのため「どうせ削除するから修正不要」と判断し、shared contract 切り替えを後回しにした                                                                                      |
| 解決策     | deprecated コンポーネントであっても canonical contract のラベル定数を参照させ、drift を防ぐ。`DescribeStep.test.tsx` に canonical option 表示テストを追加                                |
| 再発防止   | deprecated マークが付いていても、型/定数依存の修正は同波で実施する。「削除前提」は drift 放置の理由にならない                                                                            |
| 関連タスク | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001                                                                                                                                            |

### L-CRON-SEM-003: Phase 12 サマリーに外部同期一覧を必ず含める

| 項目       | 内容                                                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 症状       | Phase 12 compliance check が台帳 parity チェックで FAIL し、全体が BLOCKED になるまで artifacts.json の不一致が検出されなかった                                        |
| 原因       | Phase 12 標準フローに「repo root `artifacts.json` ↔ `outputs/artifacts.json` ↔ phase spec artifact 名」の3点同期チェックが含まれていなかった                           |
| 解決策     | Phase 12 着手時の **初手チェック** として台帳3点（workflow spec / `artifacts.json` / `outputs/artifacts.json`）の parity 確認を必須化した（SKILL.md v10.09.41 に反映） |
| 再発防止   | `complete-phase.js` 実行前に `jq '.artifacts                                                                                                                           | keys' artifacts.json`と`outputs/artifacts.json` を diff して0件を確認する |
| 関連タスク | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001                                                                                                                          |

## TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 VisualCronPicker UI validation（2026-04-13）

### L-CRON-UI-001: visual validation の証跡は初期値注入で固定する

| 項目       | 内容                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | monthly invalid の screenshot を live input の操作だけで再現しようとすると、visual mode の状態がぶれやすく、証跡が安定しなかった |
| 原因       | screenshot harness の state 固定がなく、direct input / custom cron と visual validation の境界が曖昧だった                       |
| 解決策     | `value=` 初期値注入で visual mode を固定し、monthly invalid / valid を同じハーネスで再現する                                     |
| 再発防止   | 画面証跡は入力経路と初期 state を capture metadata へ固定する                                                                    |
| 関連タスク | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001                                                                                          |

### L-CRON-UI-002: 設計文言・実装文言・証跡文言を一致させる

| 項目       | 内容                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `1〜31` の月間エラー文言が design / implementation / evidence で微妙に揺れると、レビュー時に「どれが正か」が分かりにくくなる |
| 原因       | UI ガイド、コンポーネント契約、手動テスト記録を別々に更新していた                                                            |
| 解決策     | 月間エラー文言を 1 つの正本として扱い、UI ガイド・コンポーネント契約・Phase 11/12 証跡を完全一致させる                       |
| 再発防止   | validation copy は paraphrase せず、同一文言を正本から転記する                                                               |
| 関連タスク | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001                                                                                      |

### L-CRON-UI-003: 見た目差分だけの改善は別タスクに分離する

| 項目       | 内容                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | weekly / monthly の alert で `text-xs` / `text-sm` のような細かな差分が、機能完了の主題と混ざりやすい                                 |
| 原因       | 行動差分とスタイル差分を同じ完了記録に閉じ込めたため、レビューの論点が広がった                                                        |
| 解決策     | style-only の統一は `TASK-CRON-ERROR-STYLE-UNIFICATION-001`、direct input 側は `TASK-CRON-CUSTOM-VALIDATION-001` として別タスク化する |
| 再発防止   | micro-style の調整は main task から切り出し、優先度と影響を分けて管理する                                                             |
| 関連タスク | TASK-CRON-ERROR-STYLE-UNIFICATION-001 / TASK-CRON-CUSTOM-VALIDATION-001                                                               |

## L-WEEKGRD-001: weekly空weekdaysガードは例外でなく空文字返却で設計する

- タスク: TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 / AC-1
- 症状: weekdays: []時に例外を投げると、呼び出し元のバリデーション制御が複雑化する
- 解決策: ガード処理で空文字""を返し、呼び出し元の既存バリデーションに委ねる
- 再発防止: 純粋関数ガードのデフォルト戦略は「例外なし・無効値返却」を採用する

## L-WEEKGRD-002: NON_VISUAL純粋関数タスクのPhase 11は source-level PASSと環境ブロッカーを分離して記録する

- タスク: TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001
- 症状: vitestがesbuild host/binary mismatch（0.21.5 vs 0.25.12）で停止した場合、製品FAILと環境FAILが混在しがち
- 解決策: discovered-issues.md でproduct_blockerとenvironment_issueを別カテゴリで記録し、product blocker 0件を明記
- 再発防止: 環境要因は製品バックログに入れない

## L-WEEKGRD-003: Phase 11 NON_VISUALタスクではui-sanity-visual-review.mdにNON_VISUAL宣言を明示する

- タスク: TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001
- 症状: visual reviewファイルが空だとreviewerが証跡漏れと誤解する
- 解決策: ui-sanity-visual-review.mdの冒頭に「本タスクはpure function変更のため画面変更なし（NON_VISUAL）」と明記

## UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001 レガシーコード整理 教訓（2026-04-12）

### L-DESCRIBE-STEP-001: 2ファイル同時削除 + barrel contract guard 標準フロー

| 項目       | 内容                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `DescribeStep.tsx` / `DescribeStep.test.tsx` の2ファイル同時削除時、barrel export の回帰を防ぐ guard がないと type-only export の再導入を見逃す                                            |
| 解決策     | Phase 4 で guard test 2種類（runtime: `wizard-exports.test.ts` / compile-time: `wizard-exports.typecheck.ts`）を削除前に作成し、`pnpm typecheck` + `pnpm test` PASS を削除の前提条件とする |
| 標準フロー | (1) barrel contract guard 作成 → (2) 残留参照全量 `grep` → (3) 物理削除実行 → (4) typecheck + test 全通過確認                                                                              |
| 再発防止   | ファイル削除タスクの Phase 4 では barrel contract guard の新規作成を標準タスクとして含める                                                                                                 |
| 関連タスク | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001                                                                                                                                                 |

### L-DESCRIBE-STEP-002: runtime guard と compile-time guard を別 surface で持つ理由

| 項目       | 内容                                                                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 背景       | `DescribeStepProps` は型定義のみの export（type-only export）であり、`value export` と異なり runtime では検出できない                                                                                    |
| 解決策     | `wizard-exports.test.ts`（runtime: `expect(wizardExports).not.toHaveProperty('DescribeStep')`）に加えて `wizard-exports.typecheck.ts`（compile-time: `@ts-expect-error` ガード）を別ファイルで管理する   |
| 設計理由   | value export は runtime test で検出可能。type-only export は JavaScript に出力されないため runtime test では検出不可。compile-time guard（`@ts-expect-error`）により TypeScript 型レベルで再導入を封じる |
| 適用条件   | barrel export から削除した型が型定義のみ（`type` キーワード付き export）である場合                                                                                                                       |
| 関連タスク | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001                                                                                                                                                               |
| 症状       | `system-spec-update-summary.md` に LOGS.md × 2 / topic-map.md / resource-map.md の更新記録を含めていなかったため、外部同期が完了しているかの判断が Phase 12 証跡だけでは不明瞭になった                   |
| 原因       | Phase 12 の `system-spec-update-summary.md` テンプレートに「外部同期先一覧」の項目がなかった                                                                                                             |
| 解決策     | Phase 12 closing 時に `system-spec-update-summary.md` の Step 1-A に「LOGS.md × 2 + topic-map.md + resource-map.md」の更新記録を必ず含めるよう明文化した                                                 |
| 再発防止   | Phase 12 spec（`docs/30-workflows/*/phase-12-documentation.md`）の Task 12-2 Step 1-A に「外部同期先一覧」列を追加する                                                                                   |
| 関連タスク | TASK-UI-SCHEDULE-CRON-SEMANTIC-001                                                                                                                                                                       |
| 適用条件   | barrel export から削除した型が型定義のみ（`type` キーワード付き export）である場合                                                                                                                       |
| 関連タスク | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001                                                                                                                                                               |

## UT-W3-ANALYTICS-STORE-INTEGRATION-001 analyticsSlice + agentSlice wiring 教訓（2026-04-13）

### L-ANALYTICS-001: 共有型追加は definition → types/index → package index → consumer wiring を 1 wave で閉じる

| 項目       | 内容                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | `packages/shared/src/types/skill-analytics.ts` を追加しても、`types/index.ts` と `packages/shared/index.ts` の barrel 再公開を忘れると consumer（agentSlice 等）でインポートできない |
| 原因       | barrel export チェーンの各層が独立しており、どこか 1 段を抜かすと型が解決されない                                                                                                    |
| 解決策     | 型ファイル作成と同時に `types/index.ts` / `packages/shared/index.ts` / consumer wiring を同じ wave（同一コミット前）で完結させる                                                     |
| 標準ルール | shared 型追加タスクの Phase 2 チェックリストに「barrel 再公開 3 点確認」を必須項目として含める                                                                                       |
| 関連タスク | UT-W3-ANALYTICS-STORE-INTEGRATION-001                                                                                                                                                |

### L-ANALYTICS-002: helper-based payload conversion は `as unknown as` 依存より追跡しやすい

| 項目       | 内容                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| 症状       | `analyticsSlice.ts` で直接 `as unknown as AnalyticsPayload` とキャストすると、型が変わった際に追跡箇所が散在する |
| 原因       | 型変換ロジックが呼び出しサイトに埋め込まれている                                                                 |
| 解決策     | `toAnalyticsPayload(event: SkillAnalyticsEvent)` のような helper を 1 箇所に集約し、型変換の責務を分離する       |
| 標準ルール | analytics transport 用 payload 変換は必ず named helper に集約し、呼び出しサイトでの inline キャストを禁止する    |
| 関連タスク | UT-W3-ANALYTICS-STORE-INTEGRATION-001                                                                            |

### L-ANALYTICS-003: analytics adapter の silent error 設計は意図的 — ただしログ戦略を先に決める

| 項目       | 内容                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `analyticsSlice.ts` の try-catch が空だと adapter 送信失敗を検出できず、テレメトリ喪失が無音で起きる                                                                                   |
| 原因       | UI を壊さないため adapter エラーをサイレントにするが、デバッグ可視性を犠牲にしている                                                                                                   |
| 解決策     | silent catch は維持しつつ、開発環境（`process.env.NODE_ENV === "development"`）では `console.warn` を出す方針を仕様で明記する                                                          |
| 標準ルール | analytics adapter の catch 節には「本番: silent / 開発: console.warn」ポリシーをコメントで記載し、意図的な設計であることを明示する                                                     |
| 関連タスク | UT-W3-ANALYTICS-STORE-INTEGRATION-001                                                                                                                                                  |
| 症状       | `system-spec-update-summary.md` に LOGS.md × 2 / topic-map.md / resource-map.md の更新記録を含めていなかったため、外部同期が完了しているかの判断が Phase 12 証跡だけでは不明瞭になった |
| 原因       | Phase 12 の `system-spec-update-summary.md` テンプレートに「外部同期先一覧」の項目がなかった                                                                                           |
| 解決策     | Phase 12 closing 時に `system-spec-update-summary.md` の Step 1-A に「LOGS.md × 2 + topic-map.md + resource-map.md」の更新記録を必ず含めるよう明文化した                               |
| 再発防止   | Phase 12 spec（`docs/30-workflows/*/phase-12-documentation.md`）の Task 12-2 Step 1-A に「外部同期先一覧」列を追加する                                                                 |

## TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 VisualCronPicker UIバリデーション 教訓（2026-04-13）

### L-VALCROP-001: UI層とバリデーション責務分離

| 項目       | 内容                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `cronConverter` 純粋関数と UI層のバリデーション責務が混在すると、UI固有のエラーフィードバックを純粋関数側に持ち込んでしまい、関数の副作用が増える                                                            |
| 解決策     | `cronConverter` は純粋関数ガード（例: weekdays=[]時にInvalidConfigErrorをスロー）に専念し、UI層でのエラーメッセージ表示・`onValidationChange` コールバック通知は `VisualCronPicker` コンポーネントが担当する |
| 標準ルール | 純粋関数は入力→出力の変換のみ。ユーザーへの UX フィードバックは UI コンポーネント側で完結させる                                                                                                              |
| 関連タスク | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001                                                                                                                                                                      |

### L-VALCROP-002: weekly/monthly モード別バリデーション

| 項目       | 内容                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `weekly` モードと `monthly` モードでバリデーションルールが異なるため、汎用バリデーションでは誤検知・見落としが起きる          |
| 解決策     | `weekly` モードは weekdays=[] を無効とし、`monthly` モードは dayOfMonth が 1〜31 範囲外を無効とするモード別チェックを実装した |
| 標準ルール | スケジュールモードごとに独立したバリデーションロジックを定義し、それぞれ独立したテストケースで検証する                        |
| 関連タスク | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001                                                                                       |

### L-VALCROP-003: onValidationChange コールバック設計（省略可能プロップ・useEffect 安定化）

| 項目       | 内容                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `onValidationChange` が必須プロップだと呼び出し側の変更コストが大きく、`useEffect` 依存配列に含めると親がインライン関数を渡した際に無限ループが発生する                   |
| 解決策     | `onValidationChange?: (isValid: boolean) => void` として省略可能にし、`useEffect` の依存配列から除外するか `useCallback` で安定参照を保証することで無限レンダリングを防ぐ |
| 標準ルール | コールバック系プロップは省略可能にし、Effect 安定性を設計時に考慮する                                                                                                     |
| 関連タスク | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001                                                                                                                                   |

### L-VALCROP-004: monthly dayOfMonth のUI責務

| 項目       | 内容                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `dayOfMonth` の範囲バリデーション（1〜31）をどちらが担うか曖昧だと、純粋関数側に UI 依存ロジックが混入する                               |
| 解決策     | 現状は UI 側（`VisualCronPicker`）のみで 1〜31 範囲チェックを行い、純粋関数ガードとしての `cronConverter` 側ガードは別タスクに切り出した |
| 標準ルール | UI 即時フィードバック用バリデーションは UI コンポーネント、純粋関数の防御的ガードは別タスクで段階的に追加する                            |
| 関連タスク | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 / TASK-CRON-ERROR-STYLE-UNIFICATION-001                                                          |

### L-VALCROP-005: Phase 11 smoke test 必須（UI表示確認→スクリーンショット順序）

| 項目       | 内容                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | Phase 11 でスクリーンショットを先に撮ろうとすると、コンポーネントが初期値なしでレンダリングされエラー表示が再現できないケースがある                                                                    |
| 解決策     | `value=` 初期値注入で各シナリオ（weekly empty weekdays / valid weekdays / monthly invalid date / valid date）を固定してから、smoke test でUI表示を確認し、その後スクリーンショットを撮る順序を徹底する |
| 標準ルール | Phase 11 は「UI表示確認 → スクリーンショット」の順序を必須とし、初期値注入によるシナリオ再現を前提とする                                                                                               |
| 関連タスク | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001                                                                                                                                                                |
| 関連タスク | TASK-UI-SCHEDULE-CRON-SEMANTIC-001                                                                                                                                                                     |

## TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 月次ガード処理 教訓（2026-04-13）

### L-MTHGRD-001: `Number.isInteger` で NaN/小数/Infinity を一度に排除する

- タスク: TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 / AC-3
- 症状: `dayOfMonth < 1 || dayOfMonth > 31` の範囲比較だけでは NaN が素通りする（`NaN < 1` は `false`、`NaN > 31` も `false`）
- 解決策: 範囲比較の前に `Number.isInteger(dayOfMonth)` を置く。これにより NaN・小数・Infinity を単一条件で排除できる
- 再発防止: cron フィールドの境界バリデーションは `Number.isInteger` チェックを先頭に置くパターンを標準化する

### L-MTHGRD-002: 生成側と解析側の双方向ガードをセットで実装する

- タスク: TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001
- 症状: `cronConverter.ts`（生成側）にガードを追加しても、`cronParser.ts`（解析側）が不正 monthly を custom にフォールバックしないと、UI 初期化時に不正な monthly 値が表示される
- 解決策: 生成側のガード追加と同時に、`cronParser.ts` でも monthly の `dayOfMonth` が 1〜31 外なら `custom` にフォールバックさせた
- 再発防止: converter/parser の双方向性を持つ関数を変更するときは、反対方向の関数も同時に回帰テストに含める

### L-MTHGRD-003: switch-case ガードはブロック構文 + 早期リターンの対称パターンで統一する

- タスク: TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001
- 症状: `weekly` ガードと `monthly` ガードで構文スタイルが異なると、コードレビュー時に意図の差があるように見える
- 解決策: `case "weekly": { if (...) return ""; }` の対称パターンで `monthly` ブロックも実装した
- 再発防止: switch-case 内の各周期タイプには `{}` ブロック + 早期リターンパターンを一貫して適用する

## TASK-SW-FIX-DATAFLOW-001: SkillCreateWizard コンテキストブリッジ実装 教訓（2026-04-13）

### L-DATAFLOW-001: NON_VISUAL タスクの Phase 11 代替証跡パターン

| 項目       | 内容                                                                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | Phase 11 を VISUAL（スクリーンショット必須）のまま設計すると、UIを介さないデータフロー修正でも screenshot 前提が残り、証跡が作れずブロックされる                                                                 |
| 原因       | Phase 1 の `taskType: implementation` 分類時に `NON_VISUAL` 判定を行っていなかったため、Phase 11 テンプレートがデフォルトの VISUAL フローになった                                                                |
| 解決策     | `NON_VISUAL` 再分類で `manual-test-result.md` / `manual-test-checklist.md` / `discovered-issues.md` の代替証跡へ切り替え、スクリーンショット要求を削除した                                                       |
| 再発防止   | Phase 1 の要件定義で「UI画面キャプチャが不要なタスク（ユーティリティ・型定義・データフロー修正）」は `visualType: NON_VISUAL` を明示する。Phase 11 spec 先頭に `NON_VISUAL` フラグを記載しておくことで混乱を防ぐ |
| 関連タスク | TASK-SW-FIX-DATAFLOW-001                                                                                                                                                                                         |

### L-DATAFLOW-002: artifacts.json / outputs/artifacts.json の 2点 parity 確保

| 項目       | 内容                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | `docs/30-workflows/*/artifacts.json`（root）と `docs/30-workflows/*/outputs/artifacts.json`（outputs）が異なる phase status を持っていたため、Phase 12 compliance check の parity 条件を満たせなかった |
| 原因       | Phase 11 完了時に root `artifacts.json` のみ更新し、`outputs/artifacts.json` を同波更新していなかった                                                                                                  |
| 解決策     | Phase 12 着手前チェックとして「root `artifacts.json` と `outputs/artifacts.json` の2点 diff が0件か確認する」ステップを追加し、同一内容で再生成した                                                    |
| 再発防止   | Phase 12 spec の事前チェックリストに「root ↔ outputs `artifacts.json` 同一性確認」を必須項目として明記する（L-CLM-003 の台帳3点同期パターンと組み合わせる）                                            |
| 関連タスク | TASK-SW-FIX-DATAFLOW-001                                                                                                                                                                               |

### L-DATAFLOW-003: IPC 経路を通じた context bridge の後方互換設計

| 項目       | 内容                                                                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 背景       | `SkillCreateWizard.tsx` → `agentSlice.ts` → `skill-api.ts` → `skillHandlers.ts` の 4 層を通じて `SkillCreationContext` を伝播させる際、既存呼び出し（context なし）を壊さない必要があった |
| 解決策     | 全引数を `context?: SkillCreationContext`（optional）にし、`buildSkillGenerationPrompt(context)` 側で `undefined` をハンドリングする。既存呼び出しは無変更で動作継続                      |
| 設計原則   | 新規コンテキスト引数は必ず optional。IPC ハンドラ側でデフォルト値 / undefined guard を持ち、クライアント側に変更を強制しない                                                              |
| 適用条件   | 既存 IPC チャンネルへの引数追加時（`skill:create` のような多層を跨ぐチャンネル）                                                                                                          |
| 関連タスク | TASK-SW-FIX-DATAFLOW-001                                                                                                                                                                  |
| 再発防止   | `complete-phase.js` 実行前に `jq '.artifacts                                                                                                                                              | keys' artifacts.json`と`outputs/artifacts.json` を diff して0件を確認する |
| 関連タスク | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001                                                                                                                                             |

## TASK-SW-FIX-FEEDBACK-001: SkillWizard フィードバックループ修正 教訓（2026-04-13）

### L-FEEDBACK-001: LLM モードと template モードで fetchSkills 責務が異なる

| 項目       | 内容                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | LLM モード（`handleExecutePlan`）の成功後にスキル一覧が更新されず、新規作成スキルが一覧に表示されない                                           |
| 原因       | template モードは `createSkill`（agentSlice）内部で `fetchSkills` を呼ぶが、LLM モードは独立した実行パスのため `fetchSkills` 明示呼び出しが必要 |
| 解決策     | `handleExecutePlan` の成功パス末尾に `await fetchSkills()` を追加。失敗時は遷移阻害を防ぐため独立した try/catch でswallow する                  |
| 再発防止   | LLM モード専用の regression test case（TC-FEEDBACK-001）を設けて `fetchSkills` が1回呼ばれることを固定する                                      |
| 関連タスク | TASK-SW-FIX-FEEDBACK-001                                                                                                                        |

### L-FEEDBACK-002: skillPath null ガードと成功ヘッダーはセットで設計する

| 項目       | 内容                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `skillPath === null` のままでも `CompleteStep` が成功ヘッダーを表示し、ユーザーが作成失敗を認識できなかった                        |
| 原因       | `skillPath !== null` の条件チェックが成功ヘッダーと early return（エラーUI）で分離されておらず、null 時の表示制御が不完全だった    |
| 解決策     | early return でエラーUI を返し（`skillPath === null` 時）、成功ヘッダーは `skillPath !== null` の場合のみ表示する2層ガードを設ける |
| 設計原則   | 成功表示と失敗ガードは同一コンポーネント内で同時に設計する。片方だけ修正すると UI 矛盾が生じる                                     |
| 関連タスク | TASK-SW-FIX-FEEDBACK-001                                                                                                           |

### L-FEEDBACK-003: Electron では runtime より Vite build キャプチャが安定

| 項目       | 内容                                                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | Electron 実行環境での画面キャプチャが不安定で Phase 11 証跡取得が困難だった                                                                                            |
| 解決策     | Vite build 後に Playwright で `current_build` を固定した capture script（`capture-task-skill-fix-feedback-phase11.mjs`）を追加することで安定した証跡取得が可能になった |
| 適用条件   | VISUAL タスクの Phase 11 証跡取得時（Electron renderer コンポーネントのスクリーンショット）                                                                            |
| 再発防止   | Phase 11 capture script には `try { ... } finally { browser.close(); server.close(); }` パターンでポート解放を確実にする（既存フィードバック FB-MSO-003 と同方針）     |
| 関連タスク | TASK-SW-FIX-FEEDBACK-001                                                                                                                                               |

## TASK-CRON-SEMANTIC-VALIDATION-001 教訓（2026-04-12）

### L-CRON-SV-001: 段階的バリデーションパターン（2026-04-12）

**タスク**: TASK-CRON-SEMANTIC-VALIDATION-001

cronExpression のバリデーションは3段階（syntax → range → semantics）に分離すると保守性が高い。
各ステージを独立した関数として実装し、Stage 3（意味論）は内部ユーティリティ関数として隠蔽する。

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| 知見       | 3段階（syntax→range→semantics）分離パターンはcron式検証の標準化に有効                          |
| 注意点     | 2月29日は有効（閏年非依存）/ 複合フィールドはStage 2委譲 / `validateCronSemantics`はexport不可 |
| 適用場面   | 他のバリデーター実装時にこの3段階パターンを参考にすること                                      |
| 関連タスク | TASK-CRON-SEMANTIC-VALIDATION-001                                                              |

### L-CRON-SV-002: 2月29日許容の設計意図（2026-04-12）

**タスク**: TASK-CRON-SEMANTIC-VALIDATION-001

| 項目       | 内容                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 課題       | cron式の「29 _ 2 _ \*」（2月29日）が閏年にしか存在しないため、バリデーション時の有効/無効判断が曖昧になりやすい |
| 解決策     | cron式は年を指定しないため、2月29日は「いずれ閏年で実行される可能性がある」として有効扱いとする設計判断を明文化 |
| 標準ルール | `MAX_DAYS_PER_MONTH[2] = 29` と明示し、2月29日を検出しない（有効とする）設計意図をコード内コメントに記す        |
| 関連タスク | TASK-CRON-SEMANTIC-VALIDATION-001                                                                               |

### L-CRON-SV-003: 内部ユーティリティ関数の隠蔽原則（2026-04-12）

**タスク**: TASK-CRON-SEMANTIC-VALIDATION-001

| 項目       | 内容                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | Stage 3（意味論チェック）の実装関数 `validateCronSemantics` を export すると、外部から直接呼び出されて将来のリファクタリング自由度が下がる |
| 解決策     | `validateCronSemantics` は同ファイル内の内部関数として定義し、export しない。`validateCronExpression` のみを公開 API とする                |
| 標準ルール | バリデーター内部の段階ごとの実装関数は原則 export 不可。公開 API は最上位の `validateXxx` 関数に一本化する                                 |
| 関連タスク | TASK-CRON-SEMANTIC-VALIDATION-001                                                                                                          |

## TASK-SW-FIX-MODE-MGMT-001: SkillCreateWizard LLM専用化・状態管理修正 教訓（2026-04-13）

### L-MODEMGMT-001: 二重状態管理フラグの危険性（generationMode + hasActivatedLlmMode）

| 項目       | 内容                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | `generationMode: "template" \| "llm"` と `hasActivatedLlmMode: boolean` の2フラグが同期必要な状態だったため、「LLMモードを選択したのに Step 1 がスキップされる」バグの根本原因になっていた |
| 原因       | 複数のフラグが独立したstateとして存在し、片方だけ更新するコードパスが許容されていた                                                                                                        |
| 解決策     | `generationMode` を削除してLLM専用に一本化し、`hasActivatedLlmMode` も同時に廃止。フロー分岐フラグは単一 state で管理し、派生値が必要な場合は `useMemo` で同期的に派生させる               |
| 設計原則   | ウィザード全体に影響する分岐フラグはオーケストレーターコンポーネント（SkillCreateWizard）に1本だけ置く。追加的なフラグ（`has*`）は state 増加ではなく `useMemo` 派生で表現する             |
| 関連タスク | TASK-SW-FIX-MODE-MGMT-001                                                                                                                                                                  |

### L-MODEMGMT-002: TDD Red→Green サイクルによるバグ箇所の特定

| 項目         | 内容                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | ウィザードの step 遷移ロジックはブラックボックスになりがちで、どの条件で Step 1 がスキップされるかを静的解析だけで特定するのが難しかった                      |
| 解決策       | Phase 4 でテストを先に書き、「Step 0→Step 2 への直接遷移」というバグを Red テストとして再現した後、Phase 5 で Green にする実装経路を特定した                  |
| 将来への知見 | 複雑な step 遷移ロジックを持つウィザードコンポーネントの修正は、まず「壊れた振る舞い」をテストで再現（Red）してから実装修正（Green）する TDD 戦略が最も効率的 |
| 関連タスク   | TASK-SW-FIX-MODE-MGMT-001                                                                                                                                     |

### L-MODEMGMT-003: happy-dom 環境では `userEvent` が動作しない（`fireEvent` を使う）

| 項目       | 内容                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | Vitest + happy-dom 環境で `@testing-library/user-event` の `await userEvent.click()` を使うとテストが非同期タイムアウトになる            |
| 原因       | `userEvent` は `jsdom` を前提としており、`happy-dom` 環境ではイベントディスパッチが正常に動作しない                                      |
| 解決策     | ボタンクリック等のインタラクションはすべて `fireEvent.click(element)` を使う。`userEvent` はこのプロジェクトの Vitest テストでは使用禁止 |
| 適用条件   | `apps/desktop` 配下の全 Vitest テスト（`testEnvironment: "happy-dom"` が設定済み）                                                       |
| 関連タスク | TASK-SW-FIX-MODE-MGMT-001                                                                                                                |

### L-MODEMGMT-004: SkillInfoStep props の単純化パターン

| 項目       | 内容                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 背景       | `SkillInfoStep` は `generationMode` / `onGenerationModeChange` を props として受け取っていたが、LLM専用化でこれらが不要になった                                   |
| 解決策     | 不要な props を削除し、`SkillInfoStep` の props インターフェースを最小化した（`formData` / `onFormDataChange` / `onNext` の3点のみ）                              |
| 設計原則   | 子コンポーネントには「今何をすべきか」の props のみ渡す。モード判定ロジック・分岐フラグはオーケストレーターコンポーネントに封じ込め、子コンポーネントに持たせない |
| 関連タスク | TASK-SW-FIX-MODE-MGMT-001                                                                                                                                         |

## TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001: Renderer エラー UI 表示 E2E 確認 教訓（2026-04-13）

### L-RT01-RENDERER-FINAL-001: Renderer error 表示 E2E は DOM assertion で完結させる

| 項目       | 内容                                                                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `executeAsync` → `onWorkflowStateSnapshot(snapshot, errorMessage)` → `setWorkflowError()` → renderer component の表示経路が長いため、IPC mock 単体テストだけでは renderer 側の DOM 表示まで確認できず漏れが発生した                                   |
| 原因       | IPC 層の unit test で `errorMessage` が正しく伝搬することは確認済みだったが、`SkillLifecyclePanel` が実際に `data-testid="skill-lifecycle-error"` 要素を描画するかは別の検証スコープだった                                                            |
| 解決策     | `SkillLifecyclePanel.test.tsx` に `mockStoreState.workflowError = "..."` → `renderPanel()` → `screen.getByTestId("skill-lifecycle-error")` → `toHaveAttribute("role", "alert")` → `toHaveTextContent(...)` の positive DOM assertion テストを追加した |
| 標準ルール | Runtime error propagation タスク完了時は、renderer component 側の表示チェック（DOM visibility + aria accessibility）を E2E 対象に含める。IPC 単体テスト通過 ≠ UI 表示到達                                                                             |
| 関連タスク | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001                                                                                                                                                                                                             |

## TASK-SW-FIX-MODE-MGMT-001 スキルウィザード mode 管理廃止 教訓（2026-04-14）

> 詳細: [lessons-learned-skill-wizard-mode-mgmt.md](lessons-learned-skill-wizard-mode-mgmt.md)

- **L-MODE-001**: state 廃止は 6ステップ（state → UI → props → 呼び出し側 → grep → DOM確認）で完結させる
- **L-MODE-002**: TC-06 型の動的廃止検証（DOM query で旧要素が 0件）を廃止系タスクの標準テストに組み込む
- **L-MODE-003**: Wave 分割実施では TDD Red フェーズを Wave A・B 同時設計する（Wave A 完了後では Red 状態を作れない）
- **L-MODE-004**: Electron 実機なし時は「36 UT + grep ゼロ + TC-06 DOM query + typecheck」の 4 点 NON_VISUAL 証跡で代替する
- **L-MODE-005**: SkillCreateWizard 確定フロー Step 0→1→2→3（LLM 専用・分岐なし）を基準とし、逸脱を禁止する
  | 項目 | 内容 |
  | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | 背景 | `SkillCreateWizard.tsx` → `agentSlice.ts` → `skill-api.ts` → `skillHandlers.ts` の 4 層を通じて `SkillCreationContext` を伝播させる際、既存呼び出し（context なし）を壊さない必要があった |
  | 解決策 | 全引数を `context?: SkillCreationContext`（optional）にし、`buildSkillGenerationPrompt(context)` 側で `undefined` をハンドリングする。既存呼び出しは無変更で動作継続 |
  | 設計原則 | 新規コンテキスト引数は必ず optional。IPC ハンドラ側でデフォルト値 / undefined guard を持ち、クライアント側に変更を強制しない |
  | 適用条件 | 既存 IPC チャンネルへの引数追加時（`skill:create` のような多層を跨ぐチャンネル） |
  | 関連タスク | TASK-SW-FIX-DATAFLOW-001 |

---

## TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001: Renderer エラー UI 表示 E2E 確認 教訓（2026-04-13）

### L-RT01-RENDERER-FINAL-001: Renderer error 表示 E2E は DOM assertion で完結させる

| 項目       | 内容                                                                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `executeAsync` → `onWorkflowStateSnapshot(snapshot, errorMessage)` → `setWorkflowError()` → renderer component の表示経路が長いため、IPC mock 単体テストだけでは renderer 側の DOM 表示まで確認できず漏れが発生した                                   |
| 原因       | IPC 層の unit test で `errorMessage` が正しく伝搬することは確認済みだったが、`SkillLifecyclePanel` が実際に `data-testid="skill-lifecycle-error"` 要素を描画するかは別の検証スコープだった                                                            |
| 解決策     | `SkillLifecyclePanel.test.tsx` に `mockStoreState.workflowError = "..."` → `renderPanel()` → `screen.getByTestId("skill-lifecycle-error")` → `toHaveAttribute("role", "alert")` → `toHaveTextContent(...)` の positive DOM assertion テストを追加した |
| 標準ルール | Runtime error propagation タスク完了時は、renderer component 側の表示チェック（DOM visibility + aria accessibility）を E2E 対象に含める。IPC 単体テスト通過 ≠ UI 表示到達                                                                             |
| 関連タスク | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001                                                                                                                                                                                                             |

---

## TASK-SW-FIX-UI-001 UI整合性修正 教訓（2026-04-14）

> 詳細: [skill-feedback-report.md](../docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03b-fix-ui/outputs/phase-12/skill-feedback-report.md)

### L-UI-001: null → 空配列への型設計変更はnullチェック除去の機会

| 項目       | 内容                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `category: SkillCategory \| null` では選択前の状態を `=== null` で判定し、後続ロジックで null チェックが分散していた       |
| 原因       | 単一選択の設計を複数選択に拡張する際、「未選択 = null」の慣習をそのまま引き継いでいた                                      |
| 解決策     | 未選択を空配列 `[]` で表現し、型を `SkillCategory[]` に変更。全箇所の null チェックを `.length > 0` / `.includes()` に統一 |
| 設計原則   | 複数選択フィールドの未選択状態は空配列を使う。null は「値が存在しないこと」を示す用途に限定する                            |
| 関連タスク | TASK-SW-FIX-UI-001（問題2・15）                                                                                            |

---

### L-UI-002: トグルロジックは includes/filter の1パターンで完結させる

| 項目       | 内容                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 背景       | カテゴリの追加・解除・再選択の3状態を実装する際に、複数の条件分岐が必要に見えた                                 |
| 解決策     | `includes(value)` で選択済みを判定し、true なら `filter(c => c !== value)`、false なら `[...arr, value]` に統一 |
| 利点       | エッジケース（空配列・最後の1件の解除）を追加ガードなしで処理できる。コードが1関数4行に収まる                   |
| 関連タスク | TASK-SW-FIX-UI-001（問題15）                                                                                    |

---

### L-UI-003: ProgressBar動的計算には Math.max(1, count) で最小値を保証する

| 項目       | 内容                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------- |
| 症状       | `answeredCount` が 0 の初期状態で `currentQuestion = 0` となり「0/6」が表示されるバグリスクがあった |
| 解決策     | `Math.max(1, answeredCount)` により初期値・全未回答時でも最低「1/6」を表示する                      |
| 注意点     | Page 2 開始直後（Q4 未回答）に「3/6」が表示される場合があるが、これは「回答済み数の反映」として仕様 |
| 関連タスク | TASK-SW-FIX-UI-001（問題11・16）                                                                    |

---

### L-UI-004: CSS変数統一はルートbarrelに波及させず subpath export に閉じる

| 項目       | 内容                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 背景       | `bg-blue-600` を CSS変数 `var(--status-primary)` に置換する際、型変更も伴うため影響範囲の管理が重要だった       |
| 解決策     | 変更を `@repo/shared/skill-creator` の subpath export スコープに限定し、ルート barrel (`@repo/shared`) は無変更 |
| 利点       | 外部パッケージからの import 互換性を維持しながら、内部型定義と UI スタイルを刷新できた                          |
| 関連タスク | TASK-SW-FIX-UI-001（問題2・3）                                                                                  |

---

## TASK-SW-FIX-MODE-MGMT-001 スキルウィザード mode 管理廃止 教訓（2026-04-14）

> 詳細: [lessons-learned-skill-wizard-mode-mgmt.md](lessons-learned-skill-wizard-mode-mgmt.md)

- **L-MODE-001**: state 廃止は 6ステップ（state → UI → props → 呼び出し側 → grep → DOM確認）で完結させる
- **L-MODE-002**: TC-06 型の動的廃止検証（DOM query で旧要素が 0件）を廃止系タスクの標準テストに組み込む
- **L-MODE-003**: Wave 分割実施では TDD Red フェーズを Wave A・B 同時設計する（Wave A 完了後では Red 状態を作れない）
- **L-MODE-004**: Electron 実機なし時は「36 UT + grep ゼロ + TC-06 DOM query + typecheck」の 4 点 NON_VISUAL 証跡で代替する
- **L-MODE-005**: SkillCreateWizard 確定フロー Step 0→1→2→3（LLM 専用・分岐なし）を基準とし、逸脱を禁止する
  | 解決策 | 全引数を `context?: SkillCreationContext`（optional）にし、`buildSkillGenerationPrompt(context)` 側で `undefined` をハンドリングする。既存呼び出しは無変更で動作継続 |
  | 設計原則 | 新規コンテキスト引数は必ず optional。IPC ハンドラ側でデフォルト値 / undefined guard を持ち、クライアント側に変更を強制しない |
  | 適用条件 | 既存 IPC チャンネルへの引数追加時（`skill:create` のような多層を跨ぐチャンネル） |
  | 関連タスク | TASK-SW-FIX-DATAFLOW-001 |

---

## TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001: Renderer エラー UI 表示 E2E 確認 教訓（2026-04-13）

### L-RT01-RENDERER-FINAL-001: Renderer error 表示 E2E は DOM assertion で完結させる

| 項目       | 内容                                                                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `executeAsync` → `onWorkflowStateSnapshot(snapshot, errorMessage)` → `setWorkflowError()` → renderer component の表示経路が長いため、IPC mock 単体テストだけでは renderer 側の DOM 表示まで確認できず漏れが発生した                                   |
| 原因       | IPC 層の unit test で `errorMessage` が正しく伝搬することは確認済みだったが、`SkillLifecyclePanel` が実際に `data-testid="skill-lifecycle-error"` 要素を描画するかは別の検証スコープだった                                                            |
| 解決策     | `SkillLifecyclePanel.test.tsx` に `mockStoreState.workflowError = "..."` → `renderPanel()` → `screen.getByTestId("skill-lifecycle-error")` → `toHaveAttribute("role", "alert")` → `toHaveTextContent(...)` の positive DOM assertion テストを追加した |
| 標準ルール | Runtime error propagation タスク完了時は、renderer component 側の表示チェック（DOM visibility + aria accessibility）を E2E 対象に含める。IPC 単体テスト通過 ≠ UI 表示到達                                                                             |
| 関連タスク | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001                                                                                                                                                                                                             |

---

## TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001: Renderer エラー UI 表示 E2E 確認 教訓（2026-04-13）

### L-RT01-RENDERER-FINAL-001: Renderer error 表示 E2E は DOM assertion で完結させる

| 項目       | 内容                                                                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `executeAsync` → `onWorkflowStateSnapshot(snapshot, errorMessage)` → `setWorkflowError()` → renderer component の表示経路が長いため、IPC mock 単体テストだけでは renderer 側の DOM 表示まで確認できず漏れが発生した                                   |
| 原因       | IPC 層の unit test で `errorMessage` が正しく伝搬することは確認済みだったが、`SkillLifecyclePanel` が実際に `data-testid="skill-lifecycle-error"` 要素を描画するかは別の検証スコープだった                                                            |
| 解決策     | `SkillLifecyclePanel.test.tsx` に `mockStoreState.workflowError = "..."` → `renderPanel()` → `screen.getByTestId("skill-lifecycle-error")` → `toHaveAttribute("role", "alert")` → `toHaveTextContent(...)` の positive DOM assertion テストを追加した |
| 標準ルール | Runtime error propagation タスク完了時は、renderer component 側の表示チェック（DOM visibility + aria accessibility）を E2E 対象に含める。IPC 単体テスト通過 ≠ UI 表示到達                                                                             |
| 関連タスク | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001                                                                                                                                                                                                             |
| 解決策     | 全引数を `context?: SkillCreationContext`（optional）にし、`buildSkillGenerationPrompt(context)` 側で `undefined` をハンドリングする。既存呼び出しは無変更で動作継続                                                                                  |
| 設計原則   | 新規コンテキスト引数は必ず optional。IPC ハンドラ側でデフォルト値 / undefined guard を持ち、クライアント側に変更を強制しない                                                                                                                          |
| 適用条件   | 既存 IPC チャンネルへの引数追加時（`skill:create` のような多層を跨ぐチャンネル）                                                                                                                                                                      |
| 関連タスク | TASK-SW-FIX-DATAFLOW-001                                                                                                                                                                                                                              |

---

## TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001: Renderer エラー UI 表示 E2E 確認 教訓（2026-04-13）

### L-RT01-RENDERER-FINAL-001: Renderer error 表示 E2E は DOM assertion で完結させる

| 項目       | 内容                                                                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `executeAsync` → `onWorkflowStateSnapshot(snapshot, errorMessage)` → `setWorkflowError()` → renderer component の表示経路が長いため、IPC mock 単体テストだけでは renderer 側の DOM 表示まで確認できず漏れが発生した                                   |
| 原因       | IPC 層の unit test で `errorMessage` が正しく伝搬することは確認済みだったが、`SkillLifecyclePanel` が実際に `data-testid="skill-lifecycle-error"` 要素を描画するかは別の検証スコープだった                                                            |
| 解決策     | `SkillLifecyclePanel.test.tsx` に `mockStoreState.workflowError = "..."` → `renderPanel()` → `screen.getByTestId("skill-lifecycle-error")` → `toHaveAttribute("role", "alert")` → `toHaveTextContent(...)` の positive DOM assertion テストを追加した |
| 標準ルール | Runtime error propagation タスク完了時は、renderer component 側の表示チェック（DOM visibility + aria accessibility）を E2E 対象に含める。IPC 単体テスト通過 ≠ UI 表示到達                                                                             |
| 関連タスク | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001                                                                                                                                                                                                             |

---

## TASK-SW-FIX-MODE-MGMT-001 スキルウィザード mode 管理廃止 教訓（2026-04-14）

> 詳細: [lessons-learned-skill-wizard-mode-mgmt.md](lessons-learned-skill-wizard-mode-mgmt.md)

- **L-MODE-001**: state 廃止は 6ステップ（state → UI → props → 呼び出し側 → grep → DOM確認）で完結させる
- **L-MODE-002**: TC-06 型の動的廃止検証（DOM query で旧要素が 0件）を廃止系タスクの標準テストに組み込む
- **L-MODE-003**: Wave 分割実施では TDD Red フェーズを Wave A・B 同時設計する（Wave A 完了後では Red 状態を作れない）
- **L-MODE-004**: Electron 実機なし時は「36 UT + grep ゼロ + TC-06 DOM query + typecheck」の 4 点 NON_VISUAL 証跡で代替する
- **L-MODE-005**: SkillCreateWizard 確定フロー Step 0→1→2→3（LLM 専用・分岐なし）を基準とし、逸脱を禁止する

---

## TASK-SW-FIX-FEEDBACK-008: fetchSkills 非ブロッキング化 教訓（2026-04-15）

### L-FEEDBACK-008-001: 補助的な非同期処理は fire-and-forget + console.warn で主処理と切り離す

| 項目       | 内容                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `processWorkflowOutcome` / `handleExecutePlan` 内で `fetchSkills()` を `await` していたため、失敗時に `early return` が発生し `selectSkillByName` が実行されなかった                   |
| 原因       | `fetchSkills()` はスキル一覧を UI にリフレッシュする補助処理だが、`try-catch` で囲んで `setGenerationError` + `return true` を置いていたため主処理を止める構造になっていた             |
| 解決策     | `refreshSkillsInBackground()` helper（`void fetchSkills().catch(warn)`）を抽出し、`selectSkillByName` の後で呼び出すパターンに切り替えた                                               |
| 設計原則   | 「UI リフレッシュ系の補助処理が失敗しても、ユーザーが要求した主操作（選択・遷移）は止めない」を原則とする。補助処理の失敗は `console.warn` に閉じ込め `generationError` に昇格させない |
| 適用条件   | `fetchSkills` のようにスキル生成の成否と独立した後続リフレッシュ処理全般                                                                                                               |
| 関連タスク | TASK-SW-FIX-FEEDBACK-008                                                                                                                                                               |

### L-FEEDBACK-008-002: 遅延 snapshot 再処理は useEffect + ref ガードで冪等に実現する

| 項目       | 内容                                                                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `executePlan` の ack が先に返り `workflowSnapshot` が遅れて到着するケースで、snapshot を store に反映後に `processWorkflowOutcome` が再実行されず `loadVerifyDetail` に到達しなかった              |
| 原因       | snapshot の到着タイミングを考慮した再処理 effect が存在しなかった                                                                                                                                  |
| 解決策     | `useEffect([workflowSnapshot])` で snapshot を監視し、`processedWorkflowOutcomePlanIdRef.current === workflowSnapshot.planId` ガードで二重処理を防止しながら `processWorkflowOutcome` を再適用した |
| 設計原則   | IPC の ack と実データ（snapshot）が別タイミングで到着する経路では、データ到着を `useEffect` で拾い、`ref` による冪等ガードで副作用を一度だけ実行する                                               |
| 適用条件   | `executePlan` のような非同期処理で ack と snapshot が分離している IPC チャンネル全般                                                                                                               |
| 関連タスク | TASK-SW-FIX-FEEDBACK-008                                                                                                                                                                           |

### L-FEEDBACK-008-003: NON_VISUAL タスクの証跡は manual-test-result.md + phase11-capture-metadata.json を正本とする

| 項目       | 内容                                                                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | Phase 11 でスクリーンショットが要求されるかどうか曖昧で、証跡の期待値がぶれる                                                                                                                 |
| 原因       | NON_VISUAL か否かの判断基準がタスク開始前に確立されていなかった                                                                                                                               |
| 解決策     | Phase 1 の受入条件定義時に `NON_VISUAL` フラグを明示し、証跡は `manual-test-result.md` + `phase11-capture-metadata.json` とする方針を確定。スクリーンショットは UI 変更がある場合のみ要求する |
| 設計原則   | 「NON_VISUAL = コード変更のみ / DOM 変化なし」の場合は画像証跡不要。テキスト証跡（manual-test-result.md）と metadata（phase11-capture-metadata.json）で Phase 11 を閉じる                     |
| 適用条件   | SkillLifecyclePanel のような内部ロジック修正タスクで UI レイアウトに変化がない場合全般                                                                                                        |
| 関連タスク | TASK-SW-FIX-FEEDBACK-008                                                                                                                                                                      |

---

## TASK-SW-FIX-FEEDBACK-008: fetchSkills 非ブロッキング化 教訓（2026-04-15）

### L-FEEDBACK-008-001: 補助的な非同期処理は fire-and-forget + console.warn で主処理と切り離す

| 項目       | 内容                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `processWorkflowOutcome` / `handleExecutePlan` 内で `fetchSkills()` を `await` していたため、失敗時に `early return` が発生し `selectSkillByName` が実行されなかった                   |
| 原因       | `fetchSkills()` はスキル一覧を UI にリフレッシュする補助処理だが、`try-catch` で囲んで `setGenerationError` + `return true` を置いていたため主処理を止める構造になっていた             |
| 解決策     | `refreshSkillsInBackground()` helper（`void fetchSkills().catch(warn)`）を抽出し、`selectSkillByName` の後で呼び出すパターンに切り替えた                                               |
| 設計原則   | 「UI リフレッシュ系の補助処理が失敗しても、ユーザーが要求した主操作（選択・遷移）は止めない」を原則とする。補助処理の失敗は `console.warn` に閉じ込め `generationError` に昇格させない |
| 適用条件   | `fetchSkills` のようにスキル生成の成否と独立した後続リフレッシュ処理全般                                                                                                               |
| 関連タスク | TASK-SW-FIX-FEEDBACK-008                                                                                                                                                               |

### L-FEEDBACK-008-002: 遅延 snapshot 再処理は useEffect + ref ガードで冪等に実現する

| 項目       | 内容                                                                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `executePlan` の ack が先に返り `workflowSnapshot` が遅れて到着するケースで、snapshot を store に反映後に `processWorkflowOutcome` が再実行されず `loadVerifyDetail` に到達しなかった              |
| 原因       | snapshot の到着タイミングを考慮した再処理 effect が存在しなかった                                                                                                                                  |
| 解決策     | `useEffect([workflowSnapshot])` で snapshot を監視し、`processedWorkflowOutcomePlanIdRef.current === workflowSnapshot.planId` ガードで二重処理を防止しながら `processWorkflowOutcome` を再適用した |
| 設計原則   | IPC の ack と実データ（snapshot）が別タイミングで到着する経路では、データ到着を `useEffect` で拾い、`ref` による冪等ガードで副作用を一度だけ実行する                                               |
| 適用条件   | `executePlan` のような非同期処理で ack と snapshot が分離している IPC チャンネル全般                                                                                                               |
| 関連タスク | TASK-SW-FIX-FEEDBACK-008                                                                                                                                                                           |

### L-FEEDBACK-008-003: NON_VISUAL タスクの証跡は manual-test-result.md + phase11-capture-metadata.json を正本とする

| 項目       | 内容                                                                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | Phase 11 でスクリーンショットが要求されるかどうか曖昧で、証跡の期待値がぶれる                                                                                                                 |
| 原因       | NON_VISUAL か否かの判断基準がタスク開始前に確立されていなかった                                                                                                                               |
| 解決策     | Phase 1 の受入条件定義時に `NON_VISUAL` フラグを明示し、証跡は `manual-test-result.md` + `phase11-capture-metadata.json` とする方針を確定。スクリーンショットは UI 変更がある場合のみ要求する |
| 設計原則   | 「NON_VISUAL = コード変更のみ / DOM 変化なし」の場合は画像証跡不要。テキスト証跡（manual-test-result.md）と metadata（phase11-capture-metadata.json）で Phase 11 を閉じる                     |
| 適用条件   | SkillLifecyclePanel のような内部ロジック修正タスクで UI レイアウトに変化がない場合全般                                                                                                        |
| 関連タスク | TASK-SW-FIX-FEEDBACK-008                                                                                                                                                                      |

---

## TASK-SC-IMP-CREATE-WORKFLOW-001 create モード構造計画生成 教訓（2026-04-15）

### L-SC-IMP-001: `description` edge case は型上必須の `string` として切り分け、undefined を入力破損として扱う

| 項目       | 内容                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | `StructurePlanJson.description` を `string \| undefined` にすると型契約と衝突し、後続の `generate_skill_md.js` 引数生成で undefined 混入リスクが生まれた                |
| 原因       | interviewResult の optional フィールドをそのまま構造計画 JSON に引き渡す設計のため、型の穴が生じた                                                                      |
| 解決策     | `description` を型上必須の `string` として宣言し、`undefined` は `createSkill()` バリデーション段階で「入力破損」として弾く設計に整理した                                |
| 標準ルール | 構造計画 JSON（`StructurePlanJson`）の各フィールドは必須 `string` を基本とし、optional は `triggers?` / `anchors?` のような補助フィールドのみに限定する                  |
| 関連タスク | TASK-SC-IMP-CREATE-WORKFLOW-001                                                                                                                                           |
| 項目       | 内容                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `StructurePlanJson.description` を `string \| undefined` にすると型契約と衝突し、後続の `generate_skill_md.js` 引数生成で undefined 混入リスクが生まれた |
| 原因       | interviewResult の optional フィールドをそのまま構造計画 JSON に引き渡す設計のため、型の穴が生じた                                                       |
| 解決策     | `description` を型上必須の `string` として宣言し、`undefined` は `createSkill()` バリデーション段階で「入力破損」として弾く設計に整理した                |
| 標準ルール | 構造計画 JSON（`StructurePlanJson`）の各フィールドは必須 `string` を基本とし、optional は `triggers?` / `anchors?` のような補助フィールドのみに限定する  |
| 関連タスク | TASK-SC-IMP-CREATE-WORKFLOW-001                                                                                                                          |

### L-SC-IMP-002: create モードの「構造計画生成」と「`generate_skill_md.js` 接続」は別タスクとして仕様書を分離する

| 項目       | 内容                                                                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `runCreateWorkflow` の実装スコープに `generate_skill_md.js` 接続を含めようとしたため、「完了」と「接続待ち」が同じ文脈に混在し、Phase 12 の成果物判断が難しくなった                       |
| 原因       | create モードの2段階（構造計画生成 → SKILL.md 生成スクリプト呼び出し）を1つのタスクで完結しようとした設計判断                                                                           |
| 解決策     | `runCreateWorkflow` の責務を「`StructurePlanJson` の組み立てと返却」に限定し、スクリプト接続は別タスク（`void structurePlan` コメントで依存先を明示）とした                              |
| 標準ルール | Phase 12 で「できたこと」と「依存待ち」を同じファイルに書かず、タスク分離が可能な場合は別タスクとして仕様書を分ける                                                                     |
| 関連タスク | TASK-SC-IMP-CREATE-WORKFLOW-001                                                                                                                                                           |
| 項目       | 内容                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `runCreateWorkflow` の実装スコープに `generate_skill_md.js` 接続を含めようとしたため、「完了」と「接続待ち」が同じ文脈に混在し、Phase 12 の成果物判断が難しくなった |
| 原因       | create モードの2段階（構造計画生成 → SKILL.md 生成スクリプト呼び出し）を1つのタスクで完結しようとした設計判断                                                       |
| 解決策     | `runCreateWorkflow` の責務を「`StructurePlanJson` の組み立てと返却」に限定し、スクリプト接続は別タスク（`void structurePlan` コメントで依存先を明示）とした         |
| 標準ルール | Phase 12 で「できたこと」と「依存待ち」を同じファイルに書かず、タスク分離が可能な場合は別タスクとして仕様書を分ける                                                 |
| 関連タスク | TASK-SC-IMP-CREATE-WORKFLOW-001                                                                                                                                     |

### L-SC-IMP-003: private method の観測可能性は TC に mock spy 引数 assertion で組み込む

| 項目       | 内容                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `runCreateWorkflow` が private だと統合テストでは戻り値の `description` 等が検証できず、実装の意図が TC に反映されない                                                    |
| 解決策     | `TC-04` を `createSkill()` 経由で実行し、`mockResourceLoader.loadAgent` への呼び出しと引数を `expect` で直接検証することで private method の動作を間接観測した           |
| 標準ルール | private method の観測可能性は、public API 経由 + mock spy 引数 assertion の組み合わせで担保する。中間値 handoff は mock spy で検証可能                                   |
| 関連タスク | TASK-SC-IMP-CREATE-WORKFLOW-001                                                                                                                                           |
| 項目       | 内容                                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `runCreateWorkflow` が private だと統合テストでは戻り値の `description` 等が検証できず、実装の意図が TC に反映されない                                         |
| 解決策     | `TC-04` を `createSkill()` 経由で実行し、`mockResourceLoader.loadAgent` への呼び出しと引数を `expect` で直接検証することで private method の動作を間接観測した |
| 標準ルール | private method の観測可能性は、public API 経由 + mock spy 引数 assertion の組み合わせで担保する。中間値 handoff は mock spy で検証可能                         |
| 関連タスク | TASK-SC-IMP-CREATE-WORKFLOW-001                                                                                                                                |

---

## TASK-SW-FIX-FEEDBACK-008: fetchSkills 非ブロッキング化 教訓（2026-04-15）

### L-FEEDBACK-008-001: 補助的な非同期処理は fire-and-forget + console.warn で主処理と切り離す

| 項目       | 内容                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `processWorkflowOutcome` / `handleExecutePlan` 内で `fetchSkills()` を `await` していたため、失敗時に `early return` が発生し `selectSkillByName` が実行されなかった                   |
| 原因       | `fetchSkills()` はスキル一覧を UI にリフレッシュする補助処理だが、`try-catch` で囲んで `setGenerationError` + `return true` を置いていたため主処理を止める構造になっていた             |
| 解決策     | `refreshSkillsInBackground()` helper（`void fetchSkills().catch(warn)`）を抽出し、`selectSkillByName` の後で呼び出すパターンに切り替えた                                               |
| 設計原則   | 「UI リフレッシュ系の補助処理が失敗しても、ユーザーが要求した主操作（選択・遷移）は止めない」を原則とする。補助処理の失敗は `console.warn` に閉じ込め `generationError` に昇格させない |
| 適用条件   | `fetchSkills` のようにスキル生成の成否と独立した後続リフレッシュ処理全般                                                                                                               |
| 関連タスク | TASK-SW-FIX-FEEDBACK-008                                                                                                                                                               |

### L-FEEDBACK-008-002: 遅延 snapshot 再処理は useEffect + ref ガードで冪等に実現する

| 項目       | 内容                                                                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `executePlan` の ack が先に返り `workflowSnapshot` が遅れて到着するケースで、snapshot を store に反映後に `processWorkflowOutcome` が再実行されず `loadVerifyDetail` に到達しなかった              |
| 原因       | snapshot の到着タイミングを考慮した再処理 effect が存在しなかった                                                                                                                                  |
| 解決策     | `useEffect([workflowSnapshot])` で snapshot を監視し、`processedWorkflowOutcomePlanIdRef.current === workflowSnapshot.planId` ガードで二重処理を防止しながら `processWorkflowOutcome` を再適用した |
| 設計原則   | IPC の ack と実データ（snapshot）が別タイミングで到着する経路では、データ到着を `useEffect` で拾い、`ref` による冪等ガードで副作用を一度だけ実行する                                               |
| 適用条件   | `executePlan` のような非同期処理で ack と snapshot が分離している IPC チャンネル全般                                                                                                               |
| 関連タスク | TASK-SW-FIX-FEEDBACK-008                                                                                                                                                                           |

### L-FEEDBACK-008-003: NON_VISUAL タスクの証跡は manual-test-result.md + phase11-capture-metadata.json を正本とする

| 項目       | 内容                                                                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | Phase 11 でスクリーンショットが要求されるかどうか曖昧で、証跡の期待値がぶれる                                                                                                                 |
| 原因       | NON_VISUAL か否かの判断基準がタスク開始前に確立されていなかった                                                                                                                               |
| 解決策     | Phase 1 の受入条件定義時に `NON_VISUAL` フラグを明示し、証跡は `manual-test-result.md` + `phase11-capture-metadata.json` とする方針を確定。スクリーンショットは UI 変更がある場合のみ要求する |
| 設計原則   | 「NON_VISUAL = コード変更のみ / DOM 変化なし」の場合は画像証跡不要。テキスト証跡（manual-test-result.md）と metadata（phase11-capture-metadata.json）で Phase 11 を閉じる                     |
| 適用条件   | SkillLifecyclePanel のような内部ロジック修正タスクで UI レイアウトに変化がない場合全般                                                                                                        |
| 関連タスク | TASK-SW-FIX-FEEDBACK-008                                                                                                                                                                      |

---

## TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001: structurePlan → generate_skill_md.js 接続 教訓（2026-04-16）

### L-SC-CONNECT-001: private method の多層フォールバックはシナリオ別に段階を明示して設計する

| 項目       | 内容                                                                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | スクリプト実行成功でもファイルが生成されない edge case があり、`generateResult.success === true` だけでは完了を保証できなかった                                             |
| 原因       | スクリプトの終了コード（exitCode=0）とファイル生成の有無は独立した事象。成功判定をプロセスの終了コードのみに依存していた                                                    |
| 解決策     | フォールバック判定を2段階化: ① `!generateResult.success` → フォールバック、② `fs.access` 失敗 → フォールバック。この2段階で「プロセス失敗」と「ファイル未生成」の両方に対応 |
| 設計原則   | スクリプト実行結果の検証は「プロセス終了コード」と「出力物の存在確認」の2段階で行う。特に生成系スクリプトは `fs.access` による出力ファイル確認が必須                        |
| 適用条件   | `generate_skill_md.js` のような外部スクリプト呼び出しで出力ファイルを生成するパターン全般                                                                                   |
| 関連タスク | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001                                                                                                                                  |

### L-SC-CONNECT-002: StructurePlanJson → workflow 変換は purpose を trigger.description に埋め込む設計にする

| 項目       | 内容                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `generate_skill_md.js` が期待する `workflow.trigger.description` と `StructurePlanJson.purpose` がそのまま対応しないため、変換ロジックが必要だった                      |
| 原因       | 2つのスキーマが独立して設計され、フィールド名と構造が異なる（`purpose` vs `trigger.description`）                                                                       |
| 解決策     | purpose を `Use when {name} is requested. Purpose: {purpose}` 形式に正規化して `trigger.description` に埋め込む。`triggers` は空配列なら `[skillName]` にフォールバック |
| 設計原則   | 異なるスキーマを橋渡しする変換層では「空値・undefined のフォールバック」と「文字列正規化（trim/collapse）」を必ずペアで実装する                                         |
| 適用条件   | `StructurePlanJson` を引数に受け取り `workflow` 形式の JSON を組み立てる変換処理全般                                                                                    |
| 関連タスク | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001                                                                                                                              |

### L-SC-CONNECT-003: create モードの structurePlan null 時は warn ログで理由を記録し silent fallback を避ける

| 項目       | 内容                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `structurePlan` が null の場合、暗黙に `ensureSkillMdExists` が呼ばれ、なぜ create モードで構造計画が使われなかったのかが追跡できなかった                   |
| 原因       | null チェックのみで fallback を呼び出し、ログ出力がなかった                                                                                                 |
| 解決策     | `this.logger.warn("structurePlan is null, falling back to ensureSkillMdExists", ...)` を追加し、create モードで null になった事実を必ずログに残す           |
| 設計原則   | create モードで期待される出力（structurePlan）が null になることは「正常系ではない」ため、warn ログで記録する。silent fallback はデバッグを著しく困難にする |
| 適用条件   | create モードの structurePlan null 判定全般。他モードは silent fallback を維持してよい                                                                      |
| 関連タスク | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001                                                                                                                  |

---

## TASK-SW-STRUCT-002 structurePlan 接続配線 教訓（2026-04-17）

### L-STRUCT-002-001: `??` 演算子で `null`/`undefined` のみをフォールバック対象にする

| 項目       | 内容                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- | --- | ---------------------------------------------------------------------------------------------- |
| 課題       | `                                                                                       |     | ` 演算子は falsy（空文字 / 0 / false）もフォールバックするため、意図しない置き換えが起きやすい |
| 解決策     | `anchors ?? []` のように `??` を使い、`null`/`undefined` のみをフォールバック対象にする |
| 標準ルール | 配列・オブジェクトの null ガードは `??` を優先し、`                                     |     | ` は boolean フラグのみに使用する                                                              |
| 関連タスク | TASK-SW-STRUCT-002                                                                      |

### L-STRUCT-002-002: 3段階フォールバックで createSkill() から例外を伝播させない設計

| 項目       | 内容                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `generateSkillMd` が失敗した場合に例外をそのまま伝播すると、UI 層でエラー表示になりスキル作成が中断する                                        |
| 解決策     | ①`generateSkillMd` 失敗 → `ensureSkillMdExists` フォールバック、②SKILL.md 未生成 → stub 生成、③例外発生 → catch して成功を返す 3段階構造を採用 |
| 標準ルール | ユーザーに見せたくない内部処理失敗は catch して degraded モードで継続する。ログは出してもスタックを露出しない                                  |
| 関連タスク | TASK-SW-STRUCT-002                                                                                                                             |

### L-STRUCT-002-003: `structurePlan !== null` の明示的 null 型ガードパターン

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 課題       | TypeScript で `T                                                                                          | null` の値を分岐するとき、`if (value)`では`""`や`0` も除外されるため型安全でない |
| 解決策     | `if (structurePlan !== null)` と厳密に null だけを除外することで、TypeScript の型絞り込みが正確に機能する |
| 標準ルール | `T                                                                                                        | null`型には`!== null`、`T                                                        | undefined`型には`!== undefined` を使い、`truthy` チェックは避ける |
| 関連タスク | TASK-SW-STRUCT-002                                                                                        |
