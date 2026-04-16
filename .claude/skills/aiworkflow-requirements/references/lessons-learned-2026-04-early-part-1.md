# Lessons Learned 2026-04 前半（2026-03-25～2026-04-08） — Part 1

> 分割元: lessons-learned-2026-04-early.md
> 範囲: UT-SKILL-WIZARD-FB-03 フィールド独立推論性 教訓（2026-04-11） 〜 TASK-P0-04 教訓（2026-03-30）

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
