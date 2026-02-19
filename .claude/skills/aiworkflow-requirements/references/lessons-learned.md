# Lessons Learned（教訓集）

> **相対パス**: `references/lessons-learned.md`
> **読み込み条件**: 実装タスク開始時、または類似課題に遭遇した場合

---

## メタ情報

| 項目 | 値 |
|------|---|
| 正本 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的 | タスク実行時の苦戦箇所と解決策を記録し、将来の開発効率を向上 |
| スコープ | 実装過程で遭遇した課題、解決策、コード例 |
| 対象読者 | AIWorkflowOrchestrator 開発者 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-02-19 | 1.16.0 | TASK-9A-B 技術的苦戦箇所4件追加（handlerMap ESMモック、v8カバレッジ関数カウント、.trim()境界値、isKnownSkillFileError型ガード） |
| 2026-02-19 | 1.15.0 | TASK-9A-B 実装苦戦箇所3件を追加（仕様書の実装事実ドリフト、Preload公開先パス取り違え、未タスクraw検出の誤読防止） |
| 2026-02-14 | 1.14.0 | UT-FIX-IPC-RESPONSE-UNWRAP-001 実装苦戦箇所4件追加（TypeScript type erasure、ハンドラ応答形式不統一、テストモック波及修正、safeInvokeUnwrap設計判断） |
| 2026-02-14 | 1.13.0 | UT-FIX-IPC-RESPONSE-UNWRAP-001 教訓3件追加（仕様書参照正本の不一致、MINOR未タスク化漏れ、完了移管時のリンク不整合） |
| 2026-02-14 | 1.12.0 | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 の苦戦箇所を2件追記（IPC_CHANNELS全走査の前提確認、IPC外リスナー解除漏れの防止） |
| 2026-02-14 | 1.12.0 | TASK-FIX-14-1 実装面の技術教訓4件追加（大量テストモック更新、debug後方互換判断、カバレッジ計測注意点、条件ガード削除による簡素化） |
| 2026-02-14 | 1.11.0 | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 教訓追加（ipcMain.handle()二重登録例外、macOS activateライフサイクル） |
| 2026-02-14 | 1.11.0 | TASK-FIX-14-1 教訓追加（Phase 12成果物の実変更ファイル名照合、Step 1-A/1-C/1-D先送り誤判定防止、未タスク登録3ステップ同時完了） |
| 2026-02-13 | 1.10.0 | TASK-FIX-13-1 追加教訓2件（ドキュメント偏重による実装検証省略、並列エージェント成果物品質保証） |
| 2026-02-13 | 1.9.0 | TASK-FIX-13-1 苦戦箇所3件追加（deprecated削除範囲境界、`name`参照誤検出、Phase 12仕様同期漏れ防止） |
| 2026-02-13 | 1.8.0 | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 テスト環境教訓3件追加（happy-dom/userEvent非互換、テスト実行ディレクトリ依存、jsdom切替副作用） |
| 2026-02-13 | 1.7.0 | TASK-FIX-11-1-SDK-TEST-ENABLEMENT 教訓追加（Phase 12 Step 1-A/1-D誤判定、未タスクraw検出の誤検知、Vitestモック再初期化の注意点） |
| 2026-02-13 | 1.6.1 | UT-9B-H-003: SkillCreator IPCセキュリティ強化の教訓追加（TDDセキュリティ開発、正規表現パターン検証、YAGNI判断、Phase 12並列エージェント管理） |
| 2026-02-13 | 1.6.0 | UT-9B-H-003 追補教訓を追加（返却仕様の文言不整合、完了済み未タスク残置、Phase 12成果物レジストリ更新漏れ） |
| 2026-02-12 | 1.5.1 | UT-STORE-HOOKS-TEST-REFACTOR-001 苦戦箇所5・6追加（Phase 12 Step 2誤判定、実装ガイドテストカテゴリテーブル不整合） |
| 2026-02-12 | 1.5.0 | UT-STORE-HOOKS-TEST-REFACTOR-001 教訓追加（renderHookパターン移行、テストヘルパー共通化、electronAPIモック統一） |
| 2026-02-12 | 1.4.0 | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 教訓追加（個別セレクタ移行、Phase 12チェックリスト管理） |
| 2026-02-12 | 1.3.1 | TASK-9B-H: 苦戦箇所の教訓5-8を追加（Phase 12暗黙的要件、artifacts.json全Phase更新、設計書-実装乖離管理、複数エージェント並列時の仕様書更新漏れ） |
| 2026-02-12 | 1.3.0 | 苦戦箇所1・3のコード例を実際の実装と整合するよう修正（架空のversion/authorフィールド削除、executeSkillシグネチャ修正） |
| 2026-02-12 | 1.2.1 | TASK-9B-H: SkillCreatorService IPCハンドラー登録の教訓追加（Preload統合漏れ、並列Phase実行、IPC型定義配置、artifacts.jsonステータス管理） |
| 2026-02-12 | 1.2.0 | TASK-FIX-7-1 追加苦戦箇所2件記録（Phase間テスト数整合性問題、未タスク指示書作成漏れ） |
| 2026-02-11 | 1.1.0 | テンプレート準拠、目次・コード例追加 |
| 2026-02-11 | 1.0.0 | 初版作成（TASK-FIX-7-1 苦戦箇所記録） |

---

## 目次

0. [TASK-9A-B: スキルファイル操作IPCハンドラー実装](#task-9a-b-スキルファイル操作ipcハンドラー実装)
   - [苦戦箇所1: 仕様書の実装事実ドリフト（テスト件数・エラーメッセージ）](#1-仕様書の実装事実ドリフトテスト件数エラーメッセージ)
   - [苦戦箇所2: Preload公開先パスの取り違え](#2-preload公開先パスの取り違え)
   - [苦戦箇所3: 未タスク検出raw件数の誤読防止](#3-未タスク検出raw件数の誤読防止)
   - [苦戦箇所4: handlerMap ESMモックパターン](#4-handlermap-esmモックパターン)
   - [苦戦箇所5: v8カバレッジの関数定義行カウント問題](#5-v8カバレッジの関数定義行カウント問題)
   - [苦戦箇所6: .trim()境界値バリデーション漏れ](#6-trim境界値バリデーション漏れ)
   - [苦戦箇所7: isKnownSkillFileError型ガードによるエラーサニタイズ設計](#7-isknownskillfileerror型ガードによるエラーサニタイズ設計)
0. [UT-FIX-IPC-RESPONSE-UNWRAP-001: IPCレスポンスラッパー未展開修正](#ut-fix-ipc-response-unwrap-001-ipcレスポンスラッパー未展開修正)
   - [苦戦箇所1: 仕様書の正本参照が不一致](#1-仕様書の正本参照が不一致)
   - [苦戦箇所2: Phase 10 MINORの未タスク化漏れ](#2-phase-10-minorの未タスク化漏れ)
   - [苦戦箇所3: 完了移管後のリンク不整合](#3-完了移管後のリンク不整合)
   - [苦戦箇所4: TypeScript ジェネリクスの type erasure によるバグ根本原因](#4-typescript-ジェネリクスの-type-erasure-によるバグ根本原因)
   - [苦戦箇所5: ハンドラ応答形式の不統一](#5-ハンドラ応答形式の不統一safeinvoke-vs-safeinvokeunwrap-選択)
   - [苦戦箇所6: テストモック値の波及修正（19箇所）](#6-テストモック値の波及修正19箇所)
   - [苦戦箇所7: Phase 10 仕様書テーブルと実装の乖離](#7-phase-10-仕様書テーブルと実装の乖離)
0. [TASK-FIX-14-1: console → electron-log 移行](#task-fix-14-1-console--electron-log-移行)
   - [苦戦箇所1: 実変更ファイル名との乖離](#1-実変更ファイル名との乖離)
   - [苦戦箇所2: Phase 12 Step 1-A/1-C/1-D の先送り誤判定](#2-phase-12-step-1-a1-c1-d-の先送り誤判定)
   - [苦戦箇所3: 未タスク検出後の登録漏れ](#3-未タスク検出後の登録漏れ)
   - [苦戦箇所4: 大量テストファイルへのモック一括追加](#4-大量テストファイルへのモック一括追加)
   - [苦戦箇所5: debug プロパティの後方互換性判断](#5-debug-プロパティの後方互換性判断)
   - [苦戦箇所6: カバレッジ計測コマンドの引数誤り](#6-カバレッジ計測コマンドの引数誤り)
   - [苦戦箇所7: 条件ガード削除による予想外の簡素化効果](#7-条件ガード削除による予想外の簡素化効果)
0. [TASK-FIX-13-1: deprecatedプロパティ正式移行](#task-fix-13-1-deprecatedプロパティ正式移行)
   - [苦戦箇所1: 削除対象の境界判定](#1-削除対象の境界判定)
   - [苦戦箇所2: 汎用プロパティ参照の誤検出回避](#2-汎用プロパティ参照の誤検出回避)
   - [苦戦箇所3: Phase-12仕様同期漏れの防止](#3-phase-12仕様同期漏れの防止)
   - [苦戦箇所4: ドキュメント偏重による実装検証の省略](#4-ドキュメント偏重による実装検証の省略)
   - [苦戦箇所5: 並列エージェント実行時の成果物品質保証](#5-並列エージェント実行時の成果物品質保証)
0. [TASK-FIX-11-1: SDK統合テスト有効化](#task-fix-11-1-sdk統合テスト有効化)
   - [苦戦箇所1: Phase 12 Step 1-A/1-D の誤判定](#1-phase-12-step-1-a1-d-の該当なし誤判定)
   - [苦戦箇所2: 未タスク検出 raw 結果の誤読](#2-未タスク検出の-raw-結果をそのまま採用)
   - [苦戦箇所3: Vitest モック初期化の挙動差異](#3-vitest-モック初期化の挙動差異)
1. [TASK-FIX-7-1: SkillService executeSkill 委譲実装](#task-fix-7-1-skillservice-executeskill-委譲実装)
   - [苦戦箇所1: Setter Injection vs Constructor Injection](#1-setter-injection-vs-constructor-injection-の選択)
   - [苦戦箇所2: テストモックの大規模修正](#2-テストモックの大規模修正)
   - [苦戦箇所3: 型変換](#3-skill-から-skillmetadata-への型変換)
   - [苦戦箇所4: Phase間テスト数整合性問題](#4-phase間テスト数整合性問題)
   - [苦戦箇所5: 未タスク指示書の作成漏れ](#5-未タスク指示書の作成漏れ)
2. [UT-STORE-HOOKS-COMPONENT-MIGRATION-001: 個別セレクタHook移行](#ut-store-hooks-component-migration-001-個別セレクタhook移行)
   - [苦戦箇所1: useStoreの参照安定性](#1-usestoreの参照安定性)
   - [苦戦箇所2: Phase 12チェックリスト管理](#2-phase-12チェックリスト管理)
3. [TASK-9B-H: SkillCreatorService IPCハンドラー登録](#task-9b-h-skillcreatorservice-ipcハンドラー登録)
   - [教訓1: Preload統合の漏れ防止](#1-preload統合の漏れ防止)
   - [教訓2: 並列Phase実行時のレビュータイミング](#2-並列phase実行時のレビュータイミング)
   - [教訓3: IPC型定義の配置戦略](#3-ipc型定義の配置戦略)
   - [教訓4: artifacts.jsonのPhaseステータス管理](#4-artifactsjsonのphaseステータス管理)
   - [教訓5: Phase 12の暗黙的要件の見落とし](#5-phase-12の暗黙的要件の見落とし)
   - [教訓6: artifacts.jsonのPhase別ステータス更新忘れ](#6-artifactsjsonのphase別ステータス更新忘れ)
   - [教訓7: 設計書と実装の乖離管理](#7-設計書と実装の乖離管理)
   - [教訓8: 複数エージェント並列実行時のシステム仕様書更新漏れ](#8-複数エージェント並列実行時のシステム仕様書更新漏れ)
   - [教訓9: 返却仕様文言・完了済み未タスク配置・artifacts最終整合](#9-返却仕様文言完了済み未タスク配置artifacts最終整合)
4. [UT-STORE-HOOKS-TEST-REFACTOR-001: renderHookパターン移行](#ut-store-hooks-test-refactor-001-renderhookパターン移行)
   - [苦戦箇所1: renderHookへの移行効果](#1-renderhookへの移行効果)
   - [苦戦箇所2: テストヘルパー関数の共通化](#2-テストヘルパー関数の共通化)
   - [苦戦箇所3: electronAPIモックの統一](#3-electronapiモックの統一)
   - [苦戦箇所4: 移行中のテスト数増加](#4-移行中のテスト数増加)
   - [苦戦箇所5: Phase 12 Step 2 の「該当なし」誤判定](#5-phase-12-step-2-の該当なし誤判定)
   - [苦戦箇所6: 実装ガイドのテストカテゴリテーブル不整合](#6-実装ガイドのテストカテゴリテーブル不整合)
5. [UT-9B-H-003: SkillCreator IPCセキュリティ強化](#ut-9b-h-003-skillcreator-ipcセキュリティ強化)
   - [苦戦箇所1: TDDでのセキュリティテスト先行設計の難しさ](#1-tddでのセキュリティテスト先行設計の難しさ)
   - [苦戦箇所2: 正規表現パターンのPrettier干渉](#2-正規表現パターンのprettier干渉)
   - [苦戦箇所3: YAGNI判断での共通化見送りの根拠付け](#3-yagni判断での共通化見送りの根拠付け)
   - [苦戦箇所4: Phase 11のCLI環境での手動テスト不可](#4-phase-11のcli環境での手動テスト不可)
   - [苦戦箇所5: 複数セッション間でのPhase 12成果物整合性](#5-複数セッション間でのphase-12成果物整合性)
6. [UT-FIX-AGENTVIEW-INFINITE-LOOP-001: AgentView無限ループ修正テスト](#ut-fix-agentview-infinite-loop-001-agentview無限ループ修正テスト)
   - [苦戦箇所1: happy-dom環境でのuserEvent非互換](#1-happy-dom環境でのuserevent非互換)
   - [苦戦箇所2: テスト実行ディレクトリ依存問題](#2-テスト実行ディレクトリ依存問題)
   - [苦戦箇所3: jsdom切り替え時の副作用](#3-jsdom切り替え時の副作用)
7. [UT-FIX-IPC-HANDLER-DOUBLE-REG-001: IPC ハンドラ二重登録防止](#ut-fix-ipc-handler-double-reg-001-ipcハンドラ二重登録防止)
   - [教訓1: ipcMain.handle()の二重登録は例外送出](#1-ipcmainhandleの二重登録は例外送出)
   - [教訓2: IPC_CHANNELS 全走査の前提を先に検証する](#2-ipc_channels-全走査の前提を先に検証する)
   - [教訓3: IPC外リスナーの解除漏れを同時に防ぐ](#3-ipc外リスナーの解除漏れを同時に防ぐ)
8. [関連ドキュメント](#関連ドキュメント)
9. [テンプレート（新規教訓追加用）](#テンプレート新規教訓追加用)

---

## 関連ドキュメント

| ドキュメント | 目的 | パス |
|--------------|------|------|
| architecture-implementation-patterns.md | 実装パターン集（DIパターン等） | [./architecture-implementation-patterns.md](./architecture-implementation-patterns.md) |
| interfaces-agent-sdk-executor.md | SkillExecutor インターフェース仕様 | [./interfaces-agent-sdk-executor.md](./interfaces-agent-sdk-executor.md) |
| 06-known-pitfalls.md | 既知の落とし穴と防止策 | [../../../rules/06-known-pitfalls.md](../../../rules/06-known-pitfalls.md) |

---

## TASK-9A-B: スキルファイル操作IPCハンドラー実装

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-9A-B |
| 目的 | SkillFileManager の6操作を IPC 経由で安全に実行できる状態にする |
| 完了日 | 2026-02-19 |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| IPCハンドラー追加 | `apps/desktop/src/main/ipc/skillFileHandlers.ts` | `skill:readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup` の6チャンネルを実装 |
| Preload API公開 | `apps/desktop/src/preload/skill-api.ts` | `electronAPI.skill` から file 操作 API を公開 |
| チャンネル定義拡張 | `packages/shared/src/ipc/channels.ts` | 6チャンネルを型安全に追加 |
| セキュリティ検証 | `apps/desktop/src/main/ipc/skillFileHandlers.ts` | `validateIpcSender` + 引数バリデーション + `isKnownSkillFileError` でサニタイズ |

### 苦戦箇所と解決策

#### 1. 仕様書の実装事実ドリフト（テスト件数・エラーメッセージ）

| 項目 | 内容 |
|------|------|
| **課題** | 仕様書の一部にテスト件数（47）やエラーメッセージ表記の旧値が残り、実装（65テスト、実コード文言）と不一致になった |
| **原因** | Phase 12の更新時に「前回レビューのメモ」を再利用し、再実行結果との差分確認を省略した |
| **解決策** | IPCテストを再実行して実測値を基準化し、`api-ipc-agent.md` / `security-electron-ipc.md` / `LOGS.md` を一括修正した |
| **教訓** | 仕様更新は必ず「実行ログと実装コード」を一次情報にし、数値・文言の転記は最後にクロスチェックする |

#### 2. Preload公開先パスの取り違え

| 項目 | 内容 |
|------|------|
| **課題** | 仕様書内に `skill-file-api.ts` という非実在パスが残り、実際の公開先（`skill-api.ts`）と乖離した |
| **原因** | ファイル名変更後の旧参照が複数仕様書に残存し、横断検索をせずに局所更新で完了扱いにした |
| **解決策** | `rg` で誤パスを全件検出し、`interfaces-agent-sdk-skill.md` / `api-ipc-agent.md` / `security-electron-ipc.md` を同ターンで修正した |
| **教訓** | IPC系の仕様更新は単一ファイルで閉じず、Preload/Shared/Main を束ねた横断検索を必須工程にする |

#### 3. 未タスク検出raw件数の誤読防止

| 項目 | 内容 |
|------|------|
| **課題** | TODO/FIXME の raw 検出4件を新規未タスクと誤認しやすく、不要な指示書作成リスクがあった |
| **原因** | 検出スクリプト出力の「候補」と「確定課題」の区別が不明確になりやすい |
| **解決策** | raw 4件を既存未タスクとの対応で精査し、`task-imp-community-dashboard-handlers-001.md` で管理済みと確認して新規起票0件を明記した |
| **教訓** | 未タスク検出は raw 件数だけで判断せず、既存台帳との突合結果まで記録して完了判定する |

**コード例**:

```bash
# 実装事実ドリフトを防ぐ最小検証セット
pnpm --filter @repo/desktop test:run src/main/ipc/__tests__/skillFileHandlers*.test.ts
rg -n "skill-file-api\\.ts|TASK-9A-B|65テスト|47" .claude/skills/aiworkflow-requirements/references/
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

#### 4. handlerMap ESMモックパターン

| 項目 | 内容 |
|------|------|
| **課題** | Vitest + ESM環境で `require("electron")` が使用不可。ipcMain.handle() で登録されたハンドラー関数をテスト側から直接呼び出す方法が必要だった |
| **原因** | Electron の ESM サポートが不完全で、CommonJS スタイルの `require` を使ったモジュール取得ができない |
| **解決策** | `vi.mock("electron")` で ipcMain.handle をモック化し、`Map<string, Function>` (handlerMap) にハンドラーを格納。テスト側から `handlerMap.get(channelName)!(event, args)` で直接呼び出す方式を採用 |
| **教訓** | Electron IPC テストでは、ランタイム依存を排除した handlerMap キャプチャ方式が最も安定する。TASK-8C-A で確立されたパターンを TASK-9A-B でも踏襲できた |

**コード例**:

```typescript
const handlerMap = new Map<string, Function>();

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlerMap.set(channel, handler);
    }),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: { fromWebContents: vi.fn() },
}));

// テスト内でハンドラー直接呼び出し
const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
const result = await handler!(mockEvent, { skillName: "test", relativePath: "SKILL.md" });
```

#### 5. v8カバレッジの関数定義行カウント問題

| 項目 | 内容 |
|------|------|
| **課題** | Function Coverage が 44.44% に急落。コールバック内のインライン arrow function `() => [mainWindow]` が v8 カバレッジプロバイダにより独立した関数としてカウントされた |
| **原因** | Vitest の v8 カバレッジプロバイダは V8 エンジンのネイティブカバレッジを使用するため、ソースコード上のアロー関数（`getAllowedWindows: () => [mainWindow]`）を個別関数としてカウントする |
| **解決策** | セキュリティテスト S-03 で `getAllowedWindows()` コールバックの戻り値を明示的に検証するテストを追加し、各ハンドラー内のインライン arrow function が実行されるようにした |
| **教訓** | v8 カバレッジでは、validateIpcSender のオプション内 arrow function も関数カウント対象。Function Coverage 低下時は、未実行のインライン関数を grep で特定し、テストで明示的に呼び出す |

**コード例**:

```typescript
// S-03: getAllowedWindows コールバックの実行を確認
for (let i = 0; i < 6; i++) {
  const options = mockValidateIpcSender.mock.calls[i][2];
  expect(options.getAllowedWindows()).toEqual([mainWindow]);
}
```

#### 6. .trim()境界値バリデーション漏れ

| 項目 | 内容 |
|------|------|
| **課題** | Phase 4（テスト作成）で `typeof args?.skillName !== "string"` の型チェックのみ設計したが、Phase 6（テスト拡充）でスペースのみ入力 `"   "` がバリデーションを通過する問題を発見 |
| **原因** | 初期設計で空文字列チェック `=== ""` を入れたが、空白のみの文字列（`"   "`）は空文字列ではないため通過。SkillFileManager側でパスエラーとなる前に IPC 層で拒否すべきだった |
| **解決策** | `args.skillName.trim() === ""` を全6ハンドラーの引数バリデーションに追加。backupPath にも同様の `.trim()` チェックを適用 |
| **教訓** | 文字列バリデーションでは `typeof` + `=== ""` だけでなく `.trim() === ""` の3段チェックを標準化すべき。境界値テスト（B-01, B-02）の追加により発見できた |

**コード例**:

```typescript
// ❌ 不十分 — スペースのみの入力を見逃す
if (typeof args?.skillName !== "string" || args.skillName === "") { ... }

// ✅ 完全 — .trim() でホワイトスペースのみも検出
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") { ... }
```

#### 7. isKnownSkillFileError型ガードによるエラーサニタイズ設計

| 項目 | 内容 |
|------|------|
| **課題** | 5種類のカスタムエラー（SkillNotFoundError, ReadonlySkillError, PathTraversalError, FileExistsError, FileNotFoundError）の判別を各ハンドラーで個別に行うと、DRY 違反とエラー種別追加時の変更漏れリスクがあった |
| **原因** | 初期設計で catch ブロック内に直接 instanceof チェーンを記述するプランだったが、6ハンドラー × 5エラー種別 = 30箇所の重複が発生 |
| **解決策** | `isKnownSkillFileError(error): error is A | B | C | D | E` 型ガード関数を共通化。既知エラーは `error.message` をそのまま返し、未知エラーは `"Internal error"` で内部情報を遮断する2分岐に集約 |
| **教訓** | TypeScript の type guard + union type は、エラーサニタイズの DRY 化に最適。新しいエラークラス追加時も型ガード関数1箇所の修正で済む |

**コード例**:

```typescript
function isKnownSkillFileError(
  error: unknown,
): error is SkillNotFoundError | ReadonlySkillError | PathTraversalError | FileExistsError | FileNotFoundError {
  return (
    error instanceof SkillNotFoundError ||
    error instanceof ReadonlySkillError ||
    error instanceof PathTraversalError ||
    error instanceof FileExistsError ||
    error instanceof FileNotFoundError
  );
}

// 各ハンドラーの catch ブロック（DRY）
catch (error) {
  if (isKnownSkillFileError(error)) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Internal error" };
}
```

### 参照

- `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/unassigned-task-report.md`
- `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-11/auto-test-result.md`

### 成果物

| 成果物 | パス |
|--------|------|
| ワークフロー一式 | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/` |
| 完了タスク記録 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` |
| IPC仕様更新 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` |
| セキュリティ仕様更新 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |

---

## TASK-FIX-14-1: console → electron-log 移行

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| 目的 | Skill系Main Processのログ出力を `console.*` から `electron-log` に統一 |
| 完了日 | 2026-02-14 |
| ステータス | **完了** |

### 苦戦箇所と解決策

#### 1. 実変更ファイル名との乖離

| 項目 | 内容 |
|------|------|
| **課題** | Phase 12成果物（implementation-guide/final-review）に、実装対象と異なるファイル名が混入 |
| **原因** | 文書更新時に `git diff` ではなく過去メモを基準に記述したため |
| **解決策** | `git diff --name-only` と実ファイル参照を正として、成果物内の対象ファイル名を全件修正 |
| **教訓** | Phase 12の技術文書は「実装事実（差分）」を一次情報として記述し、推測ベース記述を禁止する |

#### 2. Phase 12 Step 1-A/1-C/1-D の先送り誤判定

| 項目 | 内容 |
|------|------|
| **課題** | `documentation-changelog.md` に Step 1-A/1-C/1-D が「PR時対応」相当で記録され、完了条件と不整合 |
| **原因** | Step 1（必須）とPhase 13（PR作成）の責務境界が曖昧だった |
| **解決策** | Step 1-A/1-C/1-Dを同ターン内で完了させ、`LOGS.md x2`・`SKILL.md x2`・`generate-index.js` 実行結果を反映 |
| **教訓** | Phase 12では「後続Phaseで対応予定」という記述を許容せず、必須ステップは即時完了で記録する |

#### 3. 未タスク検出後の登録漏れ

| 項目 | 内容 |
|------|------|
| **課題** | `SkillExecutor.ts` 残存 `console` を検出後、検出レポートのみで完了扱いになりやすかった |
| **原因** | 「検出」と「未タスク登録（指示書 + 仕様書テーブル更新）」の工程が分離されていた |
| **解決策** | 3ステップを同一ターンで実施（指示書作成 → `task-workflow.md` 登録 → 関連仕様書残課題更新） |
| **教訓** | 未タスク検出はレポート作成で終わらせず、追跡可能な台帳登録まで完了して初めてPhase 12完了とする |

#### 4. 大量テストファイルへのモック一括追加

| 項目 | 内容 |
|------|------|
| **課題** | 本番コード4ファイルの electron-log 移行に伴い、関連テスト9ファイルに `vi.mock("electron-log")` を追加する必要があった |
| **原因** | electron-log はデフォルトで stdout に出力するため、モック未定義のテストではログがテスト出力に混入する（P20パターン） |
| **解決策** | `grep -rn "from.*SkillImportManager\|PermissionStore\|SkillScanner\|SkillAnalyzer" __tests__/` で影響テストを特定し、バックグラウンドエージェントで9ファイルに一括追加 |
| **教訓** | ログライブラリ移行では、本番コード修正量よりテストモック追加の影響範囲の方が大きい。事前に影響テストファイル数を見積もり、並列エージェントで効率化すべき |

```typescript
// 標準モックパターン（全9ファイルに統一適用）
vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));
```

#### 5. debug プロパティの後方互換性判断

| 項目 | 内容 |
|------|------|
| **課題** | `SkillImportManager.ts` の `this.debug` プロパティは移行後に読み取られなくなったが、5テストファイル25箇所で参照されていた |
| **原因** | `if (this.debug) console.log(...)` が `log.debug(...)` に置換されたことで、`this.debug` の読み取り箇所が消滅 |
| **解決策** | 後方互換性を優先し、`this.debug` プロパティは設定のみ残して維持。テスト側の `{ debug: true }` オプション渡しは既存のまま |
| **教訓** | 「未使用プロパティの即時削除」vs「テスト影響の最小化」のトレードオフでは、テスト変更量が25箇所を超える場合は後方互換維持が合理的。後続タスク（TASK-FIX-14-2完了後）で段階的に削除を検討 |

#### 6. カバレッジ計測コマンドの引数誤り

| 項目 | 内容 |
|------|------|
| **課題** | `vitest run --coverage src/main/services/skill/SkillScanner.ts` でカバレッジが 0% と表示された |
| **原因** | vitest の引数にはテストファイルパスを指定すべきだが、ソースファイルパスを指定していた |
| **解決策** | `vitest run --coverage src/main/services/skill/` のようにテストファイルが含まれるディレクトリを指定し、出力から対象ソースファイルを grep で抽出 |
| **教訓** | vitest のカバレッジ計測では引数がテストファイルのフィルタとして機能する。ソースファイル単位のカバレッジが必要な場合は、テストディレクトリを指定して出力をフィルタリングする |

```bash
# ❌ カバレッジ0%になる（ソースファイルパスを引数に指定）
vitest run --coverage src/main/services/skill/SkillScanner.ts

# ✅ 正しい方法（テストディレクトリを指定してgrepで抽出）
vitest run --coverage src/main/services/skill/ 2>&1 | grep "SkillScanner"
```

#### 7. 条件ガード削除による予想外の簡素化効果

| 項目 | 内容 |
|------|------|
| **課題** | 当初は `console.log` → `log.debug` の単純置換のみと想定していた |
| **発見** | `if (this.debug)` ガード（3箇所）と `process.env.NODE_ENV !== "test"` ガード（2箇所）が同時に削除可能だった |
| **効果** | 条件分岐の削除によりコードの循環的複雑度が低下し、SkillImportManager.ts のコード行数が約10%削減 |
| **教訓** | ログライブラリ移行は単なるAPI置換ではなく、環境判定ロジックの簡素化という副次効果がある。移行計画時にこの効果を見積もることで、リファクタリングの価値を正当化できる |

### 関連未タスク

| タスクID | タスク名 | 優先度 | 仕様書 |
|---------|---------|--------|--------|
| TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION | SkillExecutor の console ログを electron-log に移行 | 低 | [`docs/30-workflows/unassigned-task/task-fix-14-2-skillexecutor-console-log-migration.md`](../../../docs/30-workflows/unassigned-task/task-fix-14-2-skillexecutor-console-log-migration.md) |

---

## TASK-FIX-11-1: SDK統合テスト有効化

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-FIX-11-1-SDK-TEST-ENABLEMENT |
| 目的 | TODOプレースホルダ17件を実テスト化し、SDK統合後の検証を有効化 |
| 完了日 | 2026-02-13 |
| ステータス | **完了** |

### 苦戦箇所と解決策

#### 1. Phase 12 Step 1-A/1-D の「該当なし」誤判定

| 項目 | 内容 |
|------|------|
| **課題** | 「テストコードのみ変更」を理由に LOGS/SKILL 更新と index 再生成を初回で省略 |
| **原因** | Step 1-A（必須）と Step 2（条件付き）の区別を混同 |
| **解決策** | Step 1-A〜1-Dを必須チェックとして再実行し、`LOGS.md x2`・`SKILL.md x2`・`generate-index.js` 実行を固定化 |
| **教訓** | 検証系・テスト系タスクでも Step 1-A/1-D は常に必須 |

#### 2. 未タスク検出の raw 結果をそのまま採用

| 項目 | 内容 |
|------|------|
| **課題** | `detect-unassigned-tasks.js` で 51件検出されたが、多くが仕様書本文中の説明用 TODO だった |
| **原因** | 実装ディレクトリとドキュメントディレクトリを同一ルールで評価 |
| **解決策** | 2段階判定を採用（1: 実装ディレクトリ優先スキャン、2: raw検出の手動精査） |
| **教訓** | raw件数は候補であり、未タスク確定件数とは分離して記録する |

#### 3. Vitest モック初期化の挙動差異

| 項目 | 内容 |
|------|------|
| **課題** | 一部テストで `vi.clearAllMocks()` 後も前テストのモック実装が残存 |
| **原因** | `clearAllMocks` は call history を消すのみで実装は保持される |
| **解決策** | `beforeEach` で `mockResolvedValue` を毎回再設定し、失敗系は `mockRejectedValueOnce` を使用 |
| **教訓** | 「履歴クリア」と「実装リセット」は別操作として扱う |

**Vitest モックリセット API 比較**:

| API | 呼び出し履歴 | mockImplementation | mockReturnValue | mockResolvedValue |
|-----|:---:|:---:|:---:|:---:|
| `vi.clearAllMocks()` | クリア | 保持 | 保持 | 保持 |
| `vi.resetAllMocks()` | クリア | リセット | リセット | リセット |
| `vi.restoreAllMocks()` | クリア | 元に戻す | 元に戻す | 元に戻す |

**SDK テスト有効化で発生した具体例**:

```typescript
// ❌ 問題パターン: mockRejectedValue が後続テストに漏洩
describe("エラーハンドリング", () => {
  it("SDK障害をハンドリングする", async () => {
    mockAgentAPI.query.mockRejectedValue(new Error("SDK call failed"));
    // テスト実行...
  });
  // ↑ mockRejectedValue は "永続的" なため、次のテストにも影響する

  it("正常系テスト", async () => {
    // ← mockRejectedValue が残存し、このテストも失敗する
  });
});

// ✅ 解決パターン: "Once" サフィックスで1回限りのモック
describe("エラーハンドリング", () => {
  it("SDK障害をハンドリングする", async () => {
    mockAgentAPI.query.mockRejectedValueOnce(new Error("SDK call failed"));
    // テスト実行...
  });
  // ↑ "Once" なので消費後に元の実装に戻る

  it("正常系テスト", async () => {
    // ← 前テストの影響を受けない
  });
});
```

#### 3b. モジュールレベルモックによるタイムアウトテスト不可問題

| 項目 | 内容 |
|------|------|
| **課題** | `vi.mock("../agent-client")` でモジュール全体をモック化すると、内部の `setTimeout` + `AbortController` によるタイムアウトロジックが消失し、`vi.advanceTimersByTimeAsync(30000)` でタイムアウトを再現できない |
| **原因** | `vi.mock()` はモジュール内の全エクスポートをモック関数に置換するため、元の実装内部のタイマーロジックは実行されない |
| **解決策** | タイムアウトを内部ロジックで再現するのではなく、`mockRejectedValueOnce(new Error("Request timeout"))` で直接エラーを注入する |
| **教訓** | モジュールレベルモックでは「内部実装の再現」ではなく「外部インターフェースでのシミュレーション」が正しいアプローチ |

**コード例**:

```typescript
// ❌ 失敗パターン: モジュールモック下でタイマーを進めてもタイムアウトしない
vi.useFakeTimers();
const queryPromise = skillExecutor.execute(request, metadata);
await vi.advanceTimersByTimeAsync(30000);
// → モジュール内のsetTimeoutが存在しないため、何も起きない

// ✅ 成功パターン: エラーを直接注入
mockAgentAPI.query.mockImplementation(
  () => new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), 30000);
  })
);
vi.useFakeTimers();
const queryPromise = skillExecutor.execute(request, metadata);
await vi.advanceTimersByTimeAsync(30000);
// → モック内のsetTimeoutがfake timerで制御され、タイムアウトエラーが発生
```

#### 3c. beforeEach での明示的モック再設定パターン

| 項目 | 内容 |
|------|------|
| **課題** | `vi.clearAllMocks()` だけでは `mockImplementation()` で設定した「応答しない Promise」が残り続け、後続の正常系テストが全て失敗する |
| **原因** | `clearAllMocks` は呼び出し回数（`.mock.calls`）をリセットするのみで、`mockImplementation()` の関数置換はリセットしない |
| **解決策** | `beforeEach` で `mockAgentAPI.query.mockResolvedValue(...)` を毎回呼び出し、「デフォルト正常応答」を明示的に再設定する |
| **教訓** | テスト基盤の `beforeEach` は「呼び出し履歴クリア」と「デフォルト応答再設定」の2段構えで設計する |

**推奨パターン**:

```typescript
beforeEach(() => {
  // 段階1: 呼び出し履歴をクリア
  vi.clearAllMocks();

  // 段階2: デフォルト応答を明示的に再設定
  mockAgentAPI.query.mockResolvedValue({
    response: "default mock response",
    tokenUsage: { input: 100, output: 50 },
  });

  // 段階3: 他のモックのデフォルトも設定
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text: "response" }],
  });
});
```

### 関連未タスク

| タスクID | タスク名 | 優先度 | 仕様書 |
|---------|---------|--------|--------|
| task-imp-vitest-mock-reset-utility-001 | Vitest モック2段階リセットユーティリティ共通化 | 中 | [`docs/30-workflows/unassigned-task/task-imp-vitest-mock-reset-utility-001.md`](../../../docs/30-workflows/unassigned-task/task-imp-vitest-mock-reset-utility-001.md) |
| task-ref-vitest-module-mock-audit-001 | Vitest モジュールレベルモック監査・使い分けガイドライン策定 | 低 | [`docs/30-workflows/unassigned-task/task-ref-vitest-module-mock-audit-001.md`](../../../docs/30-workflows/unassigned-task/task-ref-vitest-module-mock-audit-001.md) |

---

## TASK-FIX-13-1: deprecatedプロパティ正式移行

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-FIX-13-1-DEPRECATED-PROPERTY-MIGRATION |
| 目的 | `Anchor.name` / `Skill.lastUpdated` のdeprecated定義を正式撤去し、参照を移行 |
| 完了日 | 2026-02-13 |
| ステータス | **完了** |

### 苦戦箇所と解決策

#### 1. 削除対象の境界判定

| 項目 | 内容 |
|------|------|
| **課題** | `lastUpdated` が複数型に存在し、全削除すると永続化互換を壊す可能性があった |
| **解決策** | `Skill.lastUpdated` のみ削除し、`SkillImportConfig.lastUpdated` は据え置き |
| **教訓** | deprecated除去時は「公開型」「永続化型」を先に分離して判定する |

#### 2. 汎用プロパティ参照の誤検出回避

| 項目 | 内容 |
|------|------|
| **課題** | `name` は汎用キーのため単純置換で誤修正リスクが高かった |
| **解決策** | `Anchor` 型スコープで参照箇所を限定し、`anchor.source` へ段階移行 |
| **教訓** | 文字列置換ではなく「型スコープ + 参照ファイル限定」で移行する |

#### 3. Phase-12仕様同期漏れの防止

| 項目 | 内容 |
|------|------|
| **課題** | コード修正完了時点で仕様書更新・教訓記録が漏れやすい |
| **解決策** | `interfaces-agent-sdk-skill.md` / `task-workflow.md` / 本書を同一ターンで更新 |
| **教訓** | Phase 12では「コード + 仕様 + 教訓」を1セットで完了判定する |

#### 4. ドキュメント偏重による実装検証の省略

| 項目 | 内容 |
|------|------|
| **課題** | Phase 1-12の成果物ドキュメントを並列エージェントで大量生成したが、実際のコード変更が完了しているかの検証（grep調査・テスト実行・型チェック）が不十分だった。ドキュメント作成が「実装完了」と誤認されるリスクがあった |
| **解決策** | 再検証セッションで3つの調査エージェントを並列起動し、Anchor型・Skill型の全参照箇所を網羅的にgrepした結果、実装自体は完了済みであることを確認。テスト（8/8 PASS）、TypeScript型チェック（エラー0件）、ESLint（エラー0件）で証明 |
| **教訓** | **ドキュメント生成とコード検証は分離すべき**。並列エージェントでドキュメントを生成する場合でも、必ず先に「コードの実装完了」を品質ゲート（テスト・型チェック・grep）で確認してからドキュメント作成に移行する |

#### 5. 並列エージェント実行時の成果物品質保証

| 項目 | 内容 |
|------|------|
| **課題** | 5つのバックグラウンドエージェントで Phase 1-11 のドキュメントを同時生成したが、各エージェントの出力品質を個別に検証する手段が不足していた |
| **解決策** | 全エージェント完了後に outputs/ 配下の12ファイル存在確認、ファイルサイズ確認、内容の一貫性チェックを実施 |
| **教訓** | 並列エージェント実行後は「全成果物の一覧確認」と「内容の整合性チェック」を必ず実施する。特にPhase間の依存関係がある場合、先行Phaseの結果を後続Phaseが正しく参照しているか確認が必要 |

---

## TASK-FIX-7-1: SkillService executeSkill 委譲実装

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 目的 | SkillService.executeSkill() が SkillExecutor に委譲するよう変更 |
| 完了日 | 2026-02-11 |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| executeSkill() 委譲実装 | `SkillService.ts` | 内部で skillExecutor.execute() を呼び出し |
| setSkillExecutor() 追加 | `SkillService.ts` | Setter Injection パターンで SkillExecutor を注入 |
| DI 設定 | `skillHandlers.ts` | SkillExecutor を生成して SkillService に注入 |

### 苦戦箇所と解決策

#### 1. Setter Injection vs Constructor Injection の選択

| 項目 | 内容 |
|------|------|
| **課題** | SkillService のコンストラクタ時点では SkillExecutor を生成できない |
| **原因** | SkillExecutor は BrowserWindow を必要とし、アプリ起動後でないと生成不可 |
| **検討した選択肢** | Constructor Injection / Setter Injection / Factory Pattern |
| **採用した解決策** | Setter Injection パターン |
| **選択理由** | 遅延初期化が必要な依存オブジェクトに適切、テスタビリティも確保可能 |

**DIパターン使い分け基準**:

| パターン | 適用場面 | 例 |
|----------|----------|-----|
| Constructor Injection | 依存オブジェクトが生成時点で利用可能 | DB接続、設定オブジェクト |
| Setter Injection | 依存オブジェクトの生成に外部リソースが必要 | BrowserWindow、IPC ハンドラー |
| Factory Pattern | 依存オブジェクトを動的に生成する必要がある | プラグインシステム |

**コード例（Setter Injection パターン）**:

```typescript
// SkillService.ts
class SkillService {
  private skillExecutor: SkillExecutor | null = null;

  // Setter Injection: 遅延初期化用
  setSkillExecutor(executor: SkillExecutor): void {
    this.skillExecutor = executor;
  }

  async executeSkill(
    skillId: string,
    params?: {
      prompt?: string;
      timeout?: number;
      sessionId?: string;
      retryConfig?: SkillExecutionRequest['retryConfig'];
    },
  ): Promise<SkillExecutionResponse> {
    if (!this.skillExecutor) {
      throw new Error('SkillExecutor が初期化されていません');
    }
    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error('スキルが見つかりません');
    }
    // SkillExecutionRequest を構築
    const request: SkillExecutionRequest = {
      prompt: params?.prompt ?? '',
      skillId,
      timeout: params?.timeout,
      sessionId: params?.sessionId,
      retryConfig: params?.retryConfig,
    };
    // Skill → SkillMetadata のインライン変換
    const metadata: SkillMetadata = {
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      description: skill.description,
      path: skill.path,
      triggers: skill.triggers,
      anchors: skill.anchors,
      allowedTools: skill.allowedTools,
      category: skill.category,
    };
    return this.skillExecutor.execute(request, metadata);
  }
}

// skillHandlers.ts（DI設定）
function registerSkillHandlers(mainWindow: BrowserWindow, skillService: SkillService): void {
  const skillExecutor = new SkillExecutor(mainWindow);
  skillService.setSkillExecutor(skillExecutor);
  // ハンドラー登録...
}
```

**参照**: [architecture-implementation-patterns.md - Setter Injection](./architecture-implementation-patterns.md)

---

#### 2. テストモックの大規模修正

| 項目 | 内容 |
|------|------|
| **課題** | 既存の5つのテストファイルに mockSkillExecutor を追加する必要があった |
| **影響範囲** | skillHandlers.test.ts, skillHandlers.execute.test.ts, skillHandlers.delegate.test.ts, skillIpc.integration.test.ts, SkillService.delegate.test.ts |
| **解決策** | 各テストファイルに mockSkillExecutor を定義し、beforeEach でリセット |
| **教訓** | DI 追加時は影響範囲を事前に調査すべき |

**mockSkillExecutor の標準構成**:

| メソッド | モック定義 | 説明 |
|----------|-----------|------|
| execute | `vi.fn()` | スキル実行 |
| abort | `vi.fn()` | 実行中断 |
| getActiveExecutions | `vi.fn().mockReturnValue([])` | アクティブ実行一覧 |
| getExecutionStatus | `vi.fn()` | 実行状態取得 |

**コード例（mockSkillExecutor）**:

```typescript
// テストファイルでの mockSkillExecutor 定義
const mockSkillExecutor = {
  execute: vi.fn(),
  abort: vi.fn(),
  getActiveExecutions: vi.fn().mockReturnValue([]),
  getExecutionStatus: vi.fn(),
};

describe('SkillService executeSkill委譲', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // mockSkillExecutor をリセット
    mockSkillExecutor.execute.mockResolvedValue({
      success: true,
      output: 'test output',
    });
  });

  it('executeSkill が SkillExecutor に委譲する', async () => {
    skillService.setSkillExecutor(mockSkillExecutor);

    await skillService.executeSkill(testSkill, 'test args');

    expect(mockSkillExecutor.execute).toHaveBeenCalledWith(
      expect.objectContaining({ name: testSkill.name }),
      'test args'
    );
  });
});
```

**参照**: [06-known-pitfalls.md - P21](../../../rules/06-known-pitfalls.md)

---

#### 3. Skill から SkillMetadata への型変換

| 項目 | 内容 |
|------|------|
| **課題** | Skill 型から SkillMetadata 型への変換が必要 |
| **原因** | SkillService は Skill 型（`lastModified` を含む）を保持するが、SkillExecutor.execute() は SkillMetadata 型（`Omit<Skill, "lastModified">`）を期待する |
| **解決策** | executeSkill() 内でインライン変換を実装（専用メソッドは不要） |
| **教訓** | 使用箇所が1箇所のみの型変換は、専用メソッドに抽出せずインラインで記述する方が可読性が高い。過剰な抽象化を避けるべき |

**型変換の対応関係（9フィールド）**:

`SkillMetadata` は `Omit<Skill, "lastModified">` として定義されており、`lastModified` を除くすべての Skill プロパティを含む。実際の変換では、以下の9フィールドを明示的にマッピングしている。

| Skill プロパティ | SkillMetadata プロパティ | 変換内容 |
|-----------------|-------------------------|----------|
| id | id | スキル一意識別子（パスのハッシュ） |
| name | name | スキル名 |
| slug | slug | ディレクトリ名 |
| description | description | 概要説明 |
| path | path | SKILL.md のファイルパス |
| triggers | triggers | Trigger キーワード配列 |
| anchors | anchors | Anchor 一覧 |
| allowedTools | allowedTools | 許可されたツール配列（任意） |
| category | category | カテゴリ（任意） |

**コード例（インライン変換）**:

```typescript
// SkillService.ts - executeSkill() 内でインライン変換
// 使用箇所が1箇所のため、専用メソッドへの抽出は過剰な抽象化と判断
const metadata: SkillMetadata = {
  id: skill.id,
  name: skill.name,
  slug: skill.slug,
  description: skill.description,
  path: skill.path,
  triggers: skill.triggers,
  anchors: skill.anchors,
  allowedTools: skill.allowedTools,
  category: skill.category,
};
return this.skillExecutor.execute(request, metadata);
```

**参照**: [interfaces-agent-sdk-executor.md - 型変換パターン](./interfaces-agent-sdk-executor.md)

---

#### 4. Phase間テスト数整合性問題

| 項目 | 内容 |
|------|------|
| **課題** | Phase 7/8/9/10 でテスト数が不整合（Phase 7: 38, Phase 8: 33, Phase 9: 39, Phase 10: 53） |
| **原因** | 各Phaseの成果物を独立に作成した際に、実際のテスト実行結果ではなく推定値を記載した |
| **解決策** | テスト数は必ず `pnpm vitest run -- --grep "対象" --reporter=verbose` の実行結果から取得する |
| **教訓** | テスト数等の定量データは推定ではなく実測値を使用すべき。Phase間で数値が不整合な場合は、最新のテスト実行結果を正として更新する |

**不整合が発生するパターン**:

| パターン | 原因 | 防止策 |
|----------|------|--------|
| Phase間の推定値ズレ | 各Phaseを異なるセッションで作成 | Phase完了時に毎回 `pnpm test` を実行して実測値を記録 |
| テスト追加/削除の未反映 | Phase 6でテスト追加後にPhase 7の数値を更新し忘れ | Phase 7（カバレッジ確認）で必ずテスト総数を再計測 |
| リファクタリングによるテスト統合 | Phase 8でテスト統合後に数値が減少 | リファクタリング後のテスト数を明示的に記録 |

**推奨ワークフロー**:

| ステップ | 処理 | 成果物 |
|----------|------|--------|
| 1 | `pnpm vitest run --reporter=verbose 2>&1 \| tail -5` | テスト総数の実測値 |
| 2 | 実測値を Phase 成果物に記録 | 正確なテスト数 |
| 3 | 前Phase の数値と比較し差異を説明 | テスト数増減の根拠 |

---

#### 5. 未タスク指示書の作成漏れ

| 項目 | 内容 |
|------|------|
| **課題** | `unassigned-task-report.md` に「指示書作成済み」と記載しながら、実際の指示書ファイルを未作成 |
| **原因** | レポート作成と指示書作成を別々のエージェントが担当し、指示書作成が実行されなかった |
| **解決策** | 未タスク管理の3ステップ（(1)指示書作成 (2)残課題テーブル登録 (3)関連仕様書リンク追加）は単一エージェントで一括実行する |
| **教訓** | P3（未タスク管理の3ステップ不完全）の再発。チェックリストを使った物理的ファイル存在確認が必要 |

**未タスク管理の3ステップ検証方法**:

| ステップ | 検証コマンド | 期待結果 |
|----------|-------------|----------|
| 1. 指示書ファイル存在確認 | `ls docs/30-workflows/unassigned-task/task-*.md` | 対象ファイルが存在すること |
| 2. 残課題テーブル登録確認 | `grep "タスクID" task-workflow.md` | 残課題テーブルにエントリが存在すること |
| 3. 関連仕様書リンク確認 | `grep "タスクID" references/*.md` | 関連仕様書に参照リンクが存在すること |

**再発防止策**:

| 対策 | 説明 |
|------|------|
| 単一エージェント実行 | 3ステップを分割せず、1つのエージェントが一括で実行 |
| ファイル存在確認 | 各ステップ完了後に `ls` でファイル存在を物理的に検証 |
| Phase 12チェックリスト | [05-task-execution.md#Task 4](../../../rules/05-task-execution.md) のチェックリストを逐次確認 |

**参照**: [06-known-pitfalls.md - P3](../../../rules/06-known-pitfalls.md)

---

### 成果物

| 成果物 | パス |
|--------|------|
| SkillService 実装 | `apps/desktop/src/main/services/skill/SkillService.ts` |
| skillHandlers DI 設定 | `apps/desktop/src/main/ipc/skillHandlers.ts` |
| 委譲テスト | `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts` |
| SkillService 委譲テスト | `apps/desktop/src/main/services/skill/__tests__/SkillService.delegate.test.ts` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | Setter Injection パターン追加 |
| [interfaces-agent-sdk-executor.md](./interfaces-agent-sdk-executor.md) | SkillService 統合セクション追加、型変換パターン追加 |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md) | P32 追加（遅延初期化パターン選択の教訓） |

---

## UT-STORE-HOOKS-COMPONENT-MIGRATION-001: 個別セレクタHook移行

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| 目的 | Zustand合成Store Hookを個別セレクタHookに移行し、P31無限ループを根本解決 |
| 完了日 | 2026-02-12 |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| 個別セレクタHook 30個追加 | `apps/desktop/src/renderer/store/index.ts` | LLM系12個 + Skill系15個 + AuthMode系3個 |
| LLMSelectorPanel移行 | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | useLLMStore() → useLLMProviders(), useLLMFetchProviders() 等 |
| SkillSelector移行 | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx` | useSkillStore() → useAvailableSkillsMetadata(), useRescanSkills() 等 |
| SettingsView移行 | `apps/desktop/src/renderer/views/SettingsView/index.tsx` | useAuthModeStore() → useSetAuthMode(), useInitializeAuthMode() 等。useRefガード削除 |

### 苦戦箇所と解決策

#### 1. useStoreの参照安定性

| 項目 | 内容 |
|------|------|
| **課題** | ZustandのuseStore(selector)で返されるオブジェクトや関数の参照安定性を保証する必要があった |
| **原因** | `useAppStore(state => ({ a: state.a, b: state.b }))` は毎回新しいオブジェクトを返すため、依存配列に入れると無限ループ発生 |
| **解決策** | 各フィールドを個別のセレクタで取得し、プリミティブ値やZustandが内部的に安定させる関数参照を返すようにした |
| **教訓** | Zustand Storeからの取得は「1セレクタ=1フィールド」が最も安全。オブジェクトをまとめて返すパターンは避ける |

**コード例（個別セレクタパターン）**:

```typescript
// store/index.ts - 個別セレクタHook（参照安定）
export const useLLMProviders = () => useAppStore((state) => state.providers);
export const useLLMFetchProviders = () => useAppStore((state) => state.fetchProviders);

// コンポーネントでの使用（useRefガード不要）
const providers = useLLMProviders();
const fetchProviders = useLLMFetchProviders();

useEffect(() => {
  // fetchProvidersはZustandが内部的に安定させた参照のため、依存配列に含めても安全
  fetchProviders();
}, [fetchProviders]);
```

**参照**: [arch-state-management.md - P31対策](./arch-state-management.md), [06-known-pitfalls.md - P31](../../../rules/06-known-pitfalls.md)

---

#### 2. Phase 12チェックリスト管理

| 項目 | 内容 |
|------|------|
| **課題** | Phase 12で12項目もの更新が必要で、複数の更新漏れが発生した |
| **原因** | Step 1-A〜1-D + Step 2の各サブステップを並列に管理しようとして、一部をスキップした |
| **解決策** | documentation-changelog.mdに各Step欄を事前に空欄状態で作成し、逐次消化する方式に変更 |
| **教訓** | Phase 12は「全Step確認前に完了と記載しない」ルールを厳守。チェックリスト駆動が必須 |

**参照**: [spec-update-workflow.md](../../task-specification-creator/references/spec-update-workflow.md), [06-known-pitfalls.md - P1, P4](../../../rules/06-known-pitfalls.md)

---

### 成果物

| 成果物 | パス |
|--------|------|
| 個別セレクタHook（30個） | `apps/desktop/src/renderer/store/index.ts` |
| 参照安定性テスト（31件） | `apps/desktop/src/renderer/store/__tests__/selectors.test.ts` |
| 無限ループ防止テスト（40件） | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx` |
| LLMSelectorPanel | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` |
| SkillSelector | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx` |
| SettingsView | `apps/desktop/src/renderer/views/SettingsView/index.tsx` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| [arch-state-management.md](./arch-state-management.md) | P31対策セクションに個別セレクタ実装完了記録 |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md) | P31解決策に個別セレクタ実装完了を反映 |
| [task-workflow.md](../../task-specification-creator/references/task-workflow.md) | 完了タスクセクション追加 |
| [patterns.md](./patterns.md) | P31対策パターンに個別セレクタ移行パターン追加 |
| [03-state-management.md](../../../rules/03-state-management.md) | 個別セレクタDOルール追加 |

---

## TASK-9B-H: SkillCreatorService IPCハンドラー登録

> **このセクションの役割**: プロセス面の教訓（何が問題だったか、どう防止するか）を記録する。実装パターン（どう実装するか）については [architecture-implementation-patterns.md - IPC ハンドラー登録パターン](./architecture-implementation-patterns.md) を参照。

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-9B-H-SKILL-CREATOR-IPC |
| 目的 | SkillCreatorService の IPC ハンドラー登録・Preload API 公開・セキュリティ層を実装 |
| 完了日 | 2026-02-12 |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| IPCハンドラー登録 | `skillCreatorHandlers.ts` | ipcMain.handle で5チャンネル + 進捗通知1チャンネルを登録 |
| Preload API実装 | `skill-creator-api.ts` | safeInvoke/safeOn でホワイトリスト検証付きAPI公開 |
| contextBridge統合 | `preload/index.ts` | electronAPI.skillCreator として統合公開 |
| ホワイトリスト更新 | `channels.ts` | ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS に追加 |

### 苦戦箇所と解決策

#### 1. Preload統合の漏れ防止

| 項目 | 内容 |
|------|------|
| **課題** | skill-creator-api.ts で skillCreatorAPI を実装したが、preload/index.ts への contextBridge 統合を忘れた |
| **原因** | Preload API の新規追加時に必要な更新箇所が4箇所に分散しており、チェックリスト化されていなかった |
| **解決策** | Phase 8-9 で発見・修正。新規Preload API追加時の4箇所更新チェックリストを策定 |
| **教訓** | 新規 Preload API 追加時は以下の4箇所を必ず更新する |

**新規Preload API追加時の必須更新箇所**:

| 更新箇所 | ファイル | 内容 |
|----------|----------|------|
| 1. import追加 | `preload/index.ts` | API実装モジュールのimport |
| 2. electronAPIオブジェクト追加 | `preload/index.ts` | electronAPIオブジェクトに新APIを追加 |
| 3. contextBridge.exposeInMainWorld | `preload/index.ts` | contextBridge経由でRendererに公開 |
| 4. non-isolatedフォールバック | `preload/index.ts` | contextIsolation無効時のwindow直下フォールバック |

**参照**: [architecture-implementation-patterns.md - IPC ハンドラー登録パターン](./architecture-implementation-patterns.md)

**相互参照**: [06-known-pitfalls.md#P23 API二重定義の型管理](../../rules/06-known-pitfalls.md)（Preload API追加時の更新箇所分散に関する教訓）

---

#### 2. 並列Phase実行時のレビュータイミング

| 項目 | 内容 |
|------|------|
| **課題** | Phase 10（読み取り専用レビュー）が Phase 8-9（コード修正）と並列実行され、修正前のコードをレビューして MAJOR 判定を出した |
| **原因** | コード修正を伴う Phase とコード読み取りの Phase を並列実行した |
| **解決策** | コード修正を伴う Phase と読み取りレビュー Phase の並列実行を避ける |
| **教訓** | 並列実行する場合は修正前コードの可能性をレビュー結果に明記する |

**Phase並列実行の安全な組み合わせ**:

| 組み合わせ | 安全性 | 理由 |
|-----------|--------|------|
| Phase 1-3（要件・設計・レビュー） | 安全 | 読み取り専用の仕様書作業 |
| Phase 4-7（テスト・実装・カバレッジ） | 注意 | コード変更あり、依存関係確認必須 |
| Phase 8-9 + Phase 10 | 危険 | リファクタリング中にレビューすると修正前コードを評価してしまう |
| Phase 11 + Phase 12 | 安全 | 手動テストとドキュメントは独立 |

---

#### 3. IPC型定義の配置戦略

| 項目 | 内容 |
|------|------|
| **課題** | IpcResult<T> 型が Main 側（skillCreatorHandlers.ts）と Preload 側（skill-creator-api.ts）で重複定義された |
| **原因** | IPC 通信の両端で同じ型を使用するが、共有パッケージに配置する判断が後回しになった |
| **解決策** | 未タスク UT-9B-H-001 として登録し、@repo/shared/types に型を配置する後日対応を計画 |
| **教訓** | IPC通信で両側から参照される型は最初から @repo/shared に配置すべき |

**IPC型の配置判断基準**:

| 型の参照元 | 配置先 | 例 |
|-----------|--------|-----|
| Main側のみ | `apps/desktop/src/main/` 内 | 内部サービス型 |
| Preload側のみ | `apps/desktop/src/preload/` 内 | UI固有型 |
| Main + Preload両方 | `packages/shared/src/` | IpcResult<T>、共有レスポンス型 |
| Main + Preload + Renderer | `packages/shared/src/` | ドメイン型（Skill、Agent等） |

---

#### 4. artifacts.jsonのPhaseステータス管理

| 項目 | 内容 |
|------|------|
| **課題** | Phase完了時に artifacts.json のステータスが自動更新されず、Phase 12 のみ completed で残りが pending だった |
| **原因** | 各 Phase 完了時に artifacts.json のステータス更新が完了条件に含まれていなかった |
| **解決策** | 各 Phase 完了時に artifacts.json のステータス更新を完了条件チェックリストに追加 |
| **教訓** | Phase 完了時は成果物の作成だけでなく、artifacts.json のステータス更新も必須アクションとする |

**相互参照**: [06-known-pitfalls.md#P4 documentation-changelogへの早期完了記載](../../rules/06-known-pitfalls.md)（ステータス管理の早期完了判定に関する教訓）

---

#### 5. Phase 12の暗黙的要件の見落とし

| 項目 | 内容 |
|------|------|
| **課題** | Phase 12の成果物として仕様書に明示されていないが、P28対策としてスキルフィードバックレポートが必要だった。仕様書のチェックリストを完了しても、`.claude/rules/06-known-pitfalls.md` に記載されたP28への対処が漏れた |
| **原因** | Phase 12仕様書のチェックリストが `06-known-pitfalls.md` のPhase 12関連項目（P1-P4, P25-P28）を参照していなかった |
| **解決策** | Phase 12実行前に `06-known-pitfalls.md` のPhase 12関連項目（P1-P4, P25-P28）を全て確認するチェックステップを追加する。P28は仕様書テンプレートにTask 5として明示化すべき |
| **教訓** | Phase 12のチェックリストだけでなく、`06-known-pitfalls.md` のPhase 12関連Pitfallも完了条件に含める必要がある |

**参照**: [06-known-pitfalls.md - P28](../../../rules/06-known-pitfalls.md)

**相互参照**: [06-known-pitfalls.md#P28 スキルフィードバックレポート未作成](../../rules/06-known-pitfalls.md)（Phase 12の暗黙的成果物に関する教訓）

---

#### 6. artifacts.jsonのPhase別ステータス更新忘れ

| 項目 | 内容 |
|------|------|
| **課題** | Phase 12エージェントがPhase 12のステータスのみをcompletedに更新し、Phase 1-11はpendingのまま放置された |
| **原因** | 各Phaseの完了時にartifacts.jsonを更新する運用が確立されておらず、Phase 12エージェントが自Phase以外のステータスを確認しなかった |
| **解決策** | Phase 12仕様書の完了条件に「artifacts.jsonの全Phase（1-12）のステータスがcompletedであること」を明示する |
| **教訓** | Phase 12はプロジェクト全体のステータス整合性を確認する最終チェックポイントとして機能させる |

---

#### 7. 設計書と実装の乖離管理

| 項目 | 内容 |
|------|------|
| **課題** | Phase 2設計書で詳細に定義されたZodスキーマ、sanitizeError関数、handleWithErrorBoundaryラッパーが実装されなかった。Phase 5で実装をシンプル化したが、設計書を更新しなかったため、最終レビューで「設計-実装乖離」として検出された |
| **原因** | Phase 5（実装）で設計書の仕様を変更する判断をしたが、設計書（Phase 2成果物）を同時に更新しなかった |
| **解決策** | Phase 5（実装）で設計書の仕様を変更する場合は、同Phase内で設計書（Phase 2成果物）も更新する。「意図的なシンプル化」と「実装漏れ」を区別するため、変更理由をPhase 5成果物に記録する |
| **教訓** | 設計と実装の乖離は「意図的」であっても、設計書を更新しなければ後続レビューで「実装漏れ」と区別できない |

**設計変更時の記録フォーマット**:

| 項目 | 記載内容 |
|------|----------|
| 変更対象 | 設計書のどの仕様を変更したか |
| 変更理由 | シンプル化、パフォーマンス最適化、スコープ縮小 等 |
| 変更種別 | 「意図的なシンプル化」「スコープ外として後日対応」「不要と判断して削除」 |
| 未タスク化要否 | 後日対応が必要な場合は未タスクとして登録 |

**相互参照**: 将来 06-known-pitfalls.md に P33（設計-実装乖離管理）として追加予定。現時点では本教訓が正本。

---

#### 8. 複数エージェント並列実行時のシステム仕様書更新漏れ

| 項目 | 内容 |
|------|------|
| **課題** | Phase 12エージェントが一部のシステム仕様書（api-ipc-agent.md, security-electron-ipc.md, architecture-overview.md）への更新を漏らした。後続の品質レビューで発見・追加修正が必要になった |
| **原因** | IPC機能開発時に更新すべきシステム仕様書の一覧が明示されておらず、エージェントが一部ファイルの存在を認識していなかった |
| **解決策** | Phase 12仕様書に「IPC機能開発時の更新対象ファイル一覧」を追加する。最低限の更新対象として以下を明記する |
| **教訓** | IPC機能開発では影響範囲が広く、更新対象ファイルが多い。チェックリストによる漏れ防止が必須 |

**IPC機能開発時の最低限の更新対象ファイル一覧**:

| ファイル | 更新内容 |
|----------|----------|
| `api-ipc-agent.md` | IPCチャンネル定義、ハンドラー仕様の追加・更新 |
| `security-electron-ipc.md` | セキュリティ層（ホワイトリスト、バリデーション）の記録 |
| `architecture-overview.md` | アーキテクチャ図、コンポーネント構成の更新 |
| `interfaces-agent-sdk-skill.md` | 型定義、インターフェース変更の記録 |
| `task-workflow.md` | 完了タスク記録、残課題テーブル更新 |
| `lessons-learned.md` | 苦戦箇所と教訓の記録 |
| `architecture-implementation-patterns.md` | 新規実装パターンの追加 |

---

#### 9. 返却仕様文言・完了済み未タスク配置・artifacts最終整合

| 項目 | 内容 |
|------|------|
| **課題** | UT-9B-H-003完了後、(1) 仕様書のエラーメッセージ文言が実装と不一致、(2) 完了済み未タスク指示書が `unassigned-task/` に残置、(3) `artifacts.json` のPhase完了状態の更新漏れが発生した |
| **原因** | Phase 12で「仕様記述」「未タスク管理」「成果物レジストリ管理」を別管理していたため、最終突合が弱かった |
| **解決策** | 1) `security-electron-ipc.md` / `api-ipc-agent.md` を実装準拠に更新、2) 完了済み指示書を `completed-tasks/unassigned-task/` へ移管、3) `artifacts.json` の phase-1〜12 を completed に統一 |
| **教訓** | Phase 12の完了判定は「ドキュメント更新」「未タスク配置整合」「artifacts整合」の3点を必須同時チェックにする |

**最終整合チェック（再発防止）**:

| チェック項目 | 確認内容 |
|-------------|----------|
| 返却仕様文言整合 | 仕様書のエラー文言が実装値と一致しているか |
| 未タスク配置整合 | 完了済み未タスクが `unassigned-task/` に残っていないか |
| artifacts整合 | phase-1〜12 の status が `completed` か |

**関連更新**:

| ファイル | 更新内容 |
|----------|----------|
| `security-electron-ipc.md` | v1.3.1: 返却仕様を実装準拠へ更新 |
| `api-ipc-agent.md` | v1.7.0: セキュリティ強化仕様追記 |
| `task-workflow.md` | v1.30.2: 完了済み未タスク指示書の移管反映 |

---

### 成果物

| 成果物 | パス |
|--------|------|
| IPCハンドラー | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` |
| Preload API | `apps/desktop/src/preload/skill-creator-api.ts` |
| ホワイトリスト更新 | `apps/desktop/src/preload/channels.ts` |
| Preload統合 | `apps/desktop/src/preload/index.ts` |
| ハンドラーテスト | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.test.ts` |
| Preload APIテスト | `apps/desktop/src/preload/__tests__/skill-creator-api.test.ts` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | IPC ハンドラー登録パターン（Pattern 3）追加 |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md) | Preload統合漏れ、並列Phase実行の教訓 |

---

## UT-STORE-HOOKS-TEST-REFACTOR-001: renderHookパターン移行

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-STORE-HOOKS-TEST-REFACTOR-001 |
| 目的 | Store Hooksテストを getState() パターンから renderHook パターンに移行し、Reactサブスクリプション経由のテストを実現 |
| 完了日 | 2026-02-12 |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| AuthModeテストのrenderHook移行 | `apps/desktop/src/renderer/store/__tests__/authModeSelectors.test.ts` | getState()パターンをrenderHook + act()に全面移行 |
| LLMテストのrenderHook移行 | `apps/desktop/src/renderer/store/__tests__/llmSelectors.test.ts` | getState()パターンをrenderHook + act()に全面移行 |
| AgentテストのrenderHook移行 | `apps/desktop/src/renderer/store/__tests__/agentSelectors.test.ts` | getState()パターンをrenderHook + act()に全面移行 |

### 苦戦箇所と解決策

#### 1. renderHookへの移行効果

| 項目 | 内容 |
|------|------|
| **課題** | getState()パターンはZustandの内部APIを直接テストするため、Reactサブスクリプション経由の実際の動作と乖離する |
| **原因** | getState()はReactの再レンダリングサイクルを経由しないため、コンポーネントでの使用時と異なる結果を返す可能性がある |
| **解決策** | renderHookパターンにより、コンポーネントが実際に使用する経路（Reactサブスクリプション）でテスト |
| **教訓** | Zustand Hookのテストでは、getState()直接呼び出しではなく、renderHookを通じてReactサブスクリプション経路を検証すべき |

---

#### 2. テストヘルパー関数の共通化

| 項目 | 内容 |
|------|------|
| **課題** | 3つのテストファイルで同一のヘルパー関数（`assertNoInfiniteLoop()`, `assertStableReference()`, `assertNoUnrelatedRerender()`）が重複定義されている |
| **原因** | 各テストファイルを独立に作成した際に、共通ヘルパーの抽出を後回しにした |
| **解決策** | 3つのヘルパー関数を各ファイル内に定義。将来の共通化候補としてタスク化 |
| **教訓** | テストヘルパーが3ファイル以上で重複する場合は、共通テストユーティリティファイルへの抽出を検討すべき |

**テストヘルパー関数一覧**:

| ヘルパー関数 | 目的 | 検証内容 |
|-------------|------|----------|
| `assertNoInfiniteLoop()` | 無限ループ防止検証 | renderCountが閾値（通常5回）以下であることを確認 |
| `assertStableReference()` | 参照安定性検証 | 状態変更後もアクション関数の参照が同一であることを確認 |
| `assertNoUnrelatedRerender()` | 不要な再レンダリング防止検証 | 無関係な状態変更で再レンダリングが発生しないことを確認 |

---

#### 3. electronAPIモックの統一

| 項目 | 内容 |
|------|------|
| **課題** | authMode、LLM、skillの3セクションでelectronAPIモックの構造が異なり、テスト間で不整合が発生 |
| **原因** | 各テストファイルで個別にwindow.electronAPIモックを定義していたため、必要なプロパティの漏れが発生 |
| **解決策** | `createMockElectronAPI()` パターンで、authMode + llm + skill の3セクション全体を統一的にモック |
| **教訓** | electronAPIモックはテストファイルごとに部分的に定義するのではなく、全セクションを含む統一モックファクトリを使用すべき |

---

#### 4. 移行中のテスト数増加

| 項目 | 内容 |
|------|------|
| **課題** | テスト数が大幅に増加（getState()パターン48件 → renderHookパターン114件 + export検証23件） |
| **原因** | renderHookパターンでは参照安定性・無限ループ防止・不要再レンダリング防止のテストカテゴリ（CAT-01〜CAT-09）を体系的に追加した |
| **解決策** | テストカテゴリの体系的分類により、網羅性を確保しつつテスト構造を可読に維持 |
| **教訓** | テスト数の増加自体は問題ではなく、カテゴリ分類（CAT-01: 初期値, CAT-02: アクション実行, CAT-03: 参照安定性, CAT-04: 無限ループ防止, CAT-05: 不要再レンダリング防止等）で構造化されていることが重要 |

---

#### 5. Phase 12 Step 2 の「該当なし」誤判定

| 項目 | 内容 |
|------|------|
| **課題** | テストリファクタリングのため Step 2（システム仕様更新）を「該当なし」と判定したが、後から6ファイルの仕様書更新が必要になった |
| **原因** | 「テストのみの変更 = システム仕様に影響なし」と短絡的に判断した。しかし renderHook パターンへの移行はテスト戦略・テスト方法論の変更であり、開発ガイドラインや実装パターン仕様書に記録すべき内容だった |
| **解決策** | Phase 12 Step 2 の判定基準を拡張し、以下の変更は「該当あり」として仕様書更新を行う: (1) テスト方法論・戦略の変更（テストパターン移行等） (2) テストヘルパー・ユーティリティの新規追加 (3) テストカテゴリ体系の変更 |
| **教訓** | テストのみの変更でも、テスト方法論・戦略の変更はシステム仕様書の更新対象となる。「プロダクションコード変更なし = 仕様書更新不要」という判断は誤り |

**更新が必要だった仕様書一覧**:

| 仕様書 | 更新内容 |
|--------|----------|
| `development-guidelines.md` | Zustand Hookテスト戦略（renderHookパターン）セクション追加 |
| `patterns.md` | Store Hookテスト実装パターン（renderHook方式）追加 |
| `arch-state-management.md` | テスト戦略セクション更新 |
| `task-workflow.md` | 完了タスクセクション追加、残課題テーブル更新 |
| `LOGS.md`（2ファイル） | タスク完了記録追加 |

**Phase 12 Step 2 判定フローチャート**:

| 変更種別 | Step 2 判定 | 理由 |
|----------|------------|------|
| プロダクションコード変更 | 該当あり | アーキテクチャ・インターフェースへの影響 |
| テスト方法論・戦略変更 | **該当あり** | 開発ガイドライン・パターン仕様書への影響 |
| テストケース追加（既存パターン） | 該当なし | 既存のテスト方法論内の変更 |
| テストコードのリファクタリング（パターン不変） | 該当なし | 構造変更のみ、方法論は不変 |

---

#### 6. 実装ガイドのテストカテゴリテーブル不整合

| 項目 | 内容 |
|------|------|
| **課題** | Phase 5 で作成した実装ガイドのテストカテゴリテーブルが、Phase 6 のテスト拡充後に更新されなかった |
| **原因** | Phase 6 でテストを大幅に拡充（CAT-07 が 3 テストから 19 テストに増加、CAT-10〜CAT-16 が新規追加）したが、実装ガイドのテーブルを再確認しなかった |
| **解決策** | Phase 6 完了後に実装ガイドのテストカテゴリテーブルを再確認し、テスト数とカテゴリを最新の実測値に更新する |
| **教訓** | Phase 6（テスト拡充）完了後は、必ず実装ガイドのテストカテゴリテーブルを再確認する。テーブルは Phase 5 時点のスナップショットであり、Phase 6 以降の変更が自動反映されないため |

**不整合の具体例**:

| カテゴリ | Phase 5 時点の記載 | Phase 6 後の実測値 | 差異 |
|----------|-------------------|-------------------|------|
| CAT-07（export検証） | 3テスト | 19テスト | +16テスト（大幅増） |
| CAT-10〜CAT-16 | 未記載 | 新規追加 | Phase 6 で新設されたカテゴリ |

**再発防止策**:

| Phase | テストカテゴリテーブル確認 | 理由 |
|-------|-------------------------|------|
| Phase 5（実装） | 初版作成 | 実装時点のテスト構造を記録 |
| Phase 6（テスト拡充） | **必須更新** | テスト数・カテゴリが変化するため |
| Phase 7（カバレッジ確認） | 確認推奨 | カバレッジ不足でテスト追加した場合 |
| Phase 8（リファクタリング） | 確認推奨 | テスト統合・分割した場合 |

---

### 成果物

| 成果物 | パス |
|--------|------|
| AuthModeセレクタテスト | `apps/desktop/src/renderer/store/__tests__/authModeSelectors.test.ts` |
| LLMセレクタテスト | `apps/desktop/src/renderer/store/__tests__/llmSelectors.test.ts` |
| Agentセレクタテスト | `apps/desktop/src/renderer/store/__tests__/agentSelectors.test.ts` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| [development-guidelines.md](./development-guidelines.md) | Zustand Hookテスト戦略（renderHookパターン）セクション追加 |
| [patterns.md](../../skill-creator/references/patterns.md) | Store Hookテスト実装パターン（renderHook方式）追加 |

---

## UT-FIX-AGENTVIEW-INFINITE-LOOP-001: AgentView無限ループ修正テスト

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| 目的 | AgentViewコンポーネントの個別セレクタHook移行とテスト作成 |
| 完了日 | 2026-02-12 |
| ステータス | **完了** |

### 1. happy-dom環境でのuserEvent非互換

| 項目 | 内容 |
|------|------|
| 難易度 | 高 |
| 影響範囲 | テストファイル全体（53テスト中49テスト失敗） |
| 解決時間 | 中程度（原因特定に時間を要した） |

**問題**: Phase 6で追加されたテストが`@testing-library/user-event`の`userEvent.setup()`を使用しており、happy-dom環境でSymbol操作エラーが発生。

```
TypeError: Symbol(Node prepared with document state workarounds)
```

**原因分析**:
- プロジェクトのデフォルトテスト環境は`happy-dom`（`vitest.config.ts`で設定）
- `userEvent.setup()`はjsdomのDOM APIに依存するSymbol操作を内部的に実行
- happy-domはこのSymbol操作を完全にはサポートしていない

**解決策**: `userEvent`を全て`fireEvent`に置換

```typescript
// ❌ happy-domで失敗するパターン
const { userEvent } = await import("@testing-library/user-event");
const user = userEvent.setup();
await user.click(element);

// ✅ happy-domで安定するパターン
import { fireEvent } from "@testing-library/react";
fireEvent.click(element);

// ✅ 非同期ハンドラの場合（Promise microtask flush）
import { act } from "@testing-library/react";
await act(async () => {
  fireEvent.click(element);
});
```

**再発防止**:
- happy-dom環境では`fireEvent`を使用する（プロジェクト標準）
- `userEvent`が必要な場合は`// @vitest-environment jsdom`ディレクティブを追加
- テスト追加時は必ずCI/ローカルで実行確認

### 2. テスト実行ディレクトリ依存問題

| 項目 | 内容 |
|------|------|
| 難易度 | 中 |
| 影響範囲 | テスト実行全体 |
| 解決時間 | 短い（パターン認識後は即解決） |

**問題**: プロジェクトルートから`pnpm vitest run apps/desktop/src/...`を実行すると、`document is not defined`エラーが発生。

**原因分析**:
- プロジェクトルートの`vitest.config.ts`と`apps/desktop/vitest.config.ts`は別ファイル
- ルートから実行すると`apps/desktop/vitest.config.ts`の`environment: "happy-dom"`と`setupFiles: ["./src/test/setup.ts"]`が読み込まれない
- 結果、テスト環境がデフォルト（node）となり、DOM APIが利用不可

**解決策**:
```bash
# ❌ プロジェクトルートから実行（失敗）
pnpm vitest run apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx

# ✅ apps/desktop/から実行（成功）
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/__tests__/AgentView.test.tsx

# ✅ pnpm --filter を使用（成功）
pnpm --filter @repo/desktop exec vitest run src/renderer/views/AgentView/__tests__/AgentView.test.tsx
```

**再発防止**: `apps/desktop/`配下のテストは必ず同ディレクトリから実行

### 3. jsdom切り替え時の副作用

| 項目 | 内容 |
|------|------|
| 難易度 | 中 |
| 影響範囲 | テストファイル全体 |
| 解決時間 | 短い（切り戻しで対応） |

**問題**: happy-domでの`userEvent`エラーを回避するため`// @vitest-environment jsdom`ディレクティブを追加したところ、別の問題が発生。

**症状**:
1. `toBeInTheDocument()`マッチャーが動作しない
2. DOM要素が重複して表示される（`getAllByRole`で期待以上の要素が返る）

**原因分析**:
- jsdom環境では`setup.ts`のロード順序が異なり、`@testing-library/jest-dom`の拡張が正しく適用されない場合がある
- jsdom独自のDOM実装による要素重複

**解決策**: jsdomへの切り替えを断念し、happy-dom + fireEventの組み合わせに統一

**教訓**: テスト環境の切り替えは、単一テストの問題解決を目的としない。環境を変更する場合は、テストファイル全体への影響を事前に検証する。

---

## UT-9B-H-003: SkillCreator IPCセキュリティ強化

### タスク概要

| 項目 | 値 |
|------|---|
| タスクID | UT-9B-H-003 |
| 目的 | skillCreatorHandlers.ts のIPC L3ドメイン検証（パストラバーサル防止、エラーサニタイズ、スキーマ名ホワイトリスト）を追加 |
| 完了日 | 2026-02-12 |
| ステータス | ✅ 完了 |
| テスト結果 | 116テスト全PASS（セキュリティ45 + 統合71） |

### 苦戦箇所

| # | 課題 | 原因 | 解決策 | 教訓 |
|---|------|------|--------|------|
| 1 | TDDでのセキュリティテスト先行設計の難しさ | セキュリティテストは攻撃ベクトルの網羅が必要で、実装前に全パターンを想定するのが困難 | 攻撃カテゴリ別にテストを分類（SEC-01〜SEC-07g）し、受入基準（AC-01〜AC-10）にマッピング。カテゴリ:パストラバーサル・エラーサニタイズ・ホワイトリスト・境界値・検証優先順序 | セキュリティテストは攻撃パターンの分類体系（SEC-XX）を先に設計し、受入基準にマップすることでTDDが機能する |
| 2 | 正規表現パターンのPrettier干渉 | Markdownコードブロック内の正規表現表記をPrettierが自動フォーマットし、`readonly["task-spec", ...]` のように壊れた表記になった | バックグラウンドエージェントで修正を実施。ドキュメント内の型表記はPrettierの影響を受けることを前提に、修正ステップを組み込む | Phase 12の実装ガイド作成時、コードブロック内のTypeScript表記がPrettierで変形される可能性を考慮し、PostToolUseフック後に検証を行う |
| 3 | YAGNI判断での共通化見送りの根拠付け | `validatePath`と`sanitizeErrorMessage`を共通パッケージに移動するか、現在のファイル内に留めるかの判断 | Phase 8で3つの共通化候補（validatePath共通化、sanitizeErrorMessage全ハンドラー横展開、IpcResult型統一）を検討し、全てYAGNI原則により「現状維持」と判断。理由を未タスク候補として記録 | リファクタリングPhaseでの共通化判断は、（1）現在の使用箇所数、（2）変更頻度、（3）独立性を評価し、YAGNI原則を適用。共通化しない判断も未タスクとして記録することで、将来の判断材料を残す |
| 4 | Phase 11のCLI環境での手動テスト不可 | CLI環境（Claude Code）ではElectronアプリを起動してDevToolsで手動テストができない | 自動テスト（Vitest 116テスト）で代替検証を実施。DevToolsコマンドを開発者向けリファレンスとして手動テストレポートに記載 | CLI環境でのPhase 11は、自動テストでの代替検証 + DevToolsコマンドのドキュメント化で対応する。手動テストが必要な場合は明示的にその旨を記録 |
| 5 | 複数セッション間でのPhase 12成果物整合性 | コンテキスト制限によりセッションが分割され、前セッションの成果物状態の追跡が困難になった | セッション開始時にoutputs/配下のファイル一覧を確認し、前セッションの進捗を復元。バックグラウンドエージェントの完了通知を待ってから最終整合性チェックを実施 | コンテキスト継続時は、成果物ディレクトリの `Glob` で前セッションの状態を即座に把握する。バックグラウンドエージェントは `TaskOutput` で完了確認してから次ステップに進む |

### コード例

#### セキュリティテスト分類体系（TDD先行設計）

```typescript
// テストID体系: SEC-[カテゴリ番号][テスト文字]
// SEC-01a〜SEC-03c: パストラバーサル攻撃テスト
// SEC-04a〜SEC-05b: ホワイトリスト検証テスト
// SEC-06a〜SEC-06c: 正常系回帰テスト
// SEC-07a〜SEC-07g: 境界値テスト

// 受入基準マッピング: AC-01 → SEC-01*, AC-02 → SEC-02* ...
describe("パストラバーサル攻撃テスト", () => {
  it.each([
    ["../etc/passwd", "Unixパストラバーサル"],
    ["..\\Windows\\System32", "Windowsパストラバーサル"],
    ["path\x00.txt", "NULLバイトインジェクション"],
    ["\\\\server\\share", "UNCパス"],
  ])("SEC-01: %s を検出してエラーを返す", async (maliciousPath) => {
    // 検証失敗 → サービス層に到達しないことを確認
  });
});
```

#### YAGNI判断の記録パターン

```markdown
| 検討項目 | 判定 | 理由 | 未タスク |
|---------|------|------|---------|
| validatePath を shared に移動 | 現状維持 | 使用箇所1ファイルのみ | UT-9B-H-002 |
| sanitizeErrorMessage 横展開 | 現状維持 | 他ハンドラーとの統一は別スコープ | UT-9B-H-001 |
```

### 成果物

| 成果物 | パス |
|--------|------|
| セキュリティ関数実装 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` |
| セキュリティテスト | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts` |
| 実装ガイド | `docs/30-workflows/ut-9b-h-003-security-hardening/outputs/phase-12/implementation-guide.md` |
| IPCドキュメント | `docs/30-workflows/ut-9b-h-003-security-hardening/outputs/phase-12/ipc-documentation.md` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| security-electron-ipc.md | v1.3.0: L3ドメイン検証パターン完了記録 |
| architecture-implementation-patterns.md | IPC L3セキュリティハードニングパターン追加 |
| 06-known-pitfalls.md | P11関連: PostToolUseフックによるMarkdownコードブロック変形 |

---

## UT-FIX-IPC-RESPONSE-UNWRAP-001: IPCレスポンスラッパー未展開修正

### タスク概要

| 項目 | 値 |
|------|---|
| タスクID | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| 目的 | Preload層でIPC `{ success, data }` ラッパーを展開し、Rendererへ直接型を返す |
| 完了日 | 2026-02-14 |
| ステータス | ✅ 完了 |
| テスト結果 | 25件追加、既存回帰テストPASS |

### 苦戦箇所

| # | 課題 | 原因 | 解決策 | 教訓 |
|---|------|------|--------|------|
| 1 | 仕様書の正本参照が不一致 | `api-ipc-skill.md` という非実在ファイル参照が複数ドキュメントに残存 | 参照先を `interfaces-agent-sdk-skill.md` に統一し、index再生成で追従 | 仕様更新前に参照パスの物理存在確認を必須化する |
| 2 | Phase 10 MINORの未タスク化漏れ | 「軽微なので不要」という判断が先行し、未タスク管理が不完全化 | M-1/M-2を `UT-FIX-IPC-RESPONSE-UNWRAP-002/003` として正式起票 | MINOR判定は影響度に関わらず追跡タスク化し、判断理由を残す |
| 3 | 完了移管後のリンク不整合 | 元タスク指示書を移動後、`unassigned-task` 参照が残る | `completed-tasks` 側へ参照更新し、リンク整合を機械検証 | 完了移管時は「移動・参照更新・検証」を1セットで実施する |
| 4 | TypeScript ジェネリクスの type erasure によるバグ根本原因 | `safeInvoke<T>` の型注釈はコンパイル時に消去され、実行時は IPC レスポンスがそのまま透過 | `safeInvokeUnwrap<T>()` で実行時にラッパーを展開 | TypeScript の型注釈は実行時の値を変換しない。IPC 境界では必ず実行時バリデーション／変換を行う（P19 の拡張） |
| 5 | ハンドラ応答形式の不統一（safeInvoke vs safeInvokeUnwrap 選択） | Main Process のハンドラが全て同じレスポンス形式を使うわけではない | 各ハンドラの return 文を確認し、応答形式に応じて使い分け | IPC チャンネル修正時は必ずハンドラファイルの return 文を確認する |
| 6 | テストモック値の波及修正（19箇所） | `safeInvokeUnwrap` は `{ success, data }` 形式を期待するため既存モックが全て失敗 | grep で全モック箇所を特定し一括修正 | P21/P35 と同パターン。事前に影響範囲調査（grep）を実施してから一括修正すべき |
| 7 | Phase 10 仕様書テーブルと実装の乖離 | Phase 2 設計時のテーブルが Phase 5 実装結果を反映していなかった | Phase 10 レビューで MINOR 判定として記録 | Phase 10 レビュー時にテーブルの記載と実装を突合すべき |

### コード例

```typescript
// PreloadでIPCラッパーを展開する共通関数
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function safeInvokeUnwrap<T>(channel: string, ...args: unknown[]): Promise<T> {
  const result = await safeInvoke<IpcResult<T>>(channel, ...args);
  if (!result.success) {
    throw new Error(result.error || `IPC call failed: ${channel}`);
  }
  return result.data as T;
}
```

### 苦戦箇所詳細（実装固有）

#### 4. TypeScript ジェネリクスの type erasure によるバグ根本原因

- **問題**: `safeInvoke<ImportedSkill[]>(channel)` と型注釈しても、TypeScript のジェネリクスはコンパイル時に消去（type erasure）される。実行時には `ipcRenderer.invoke()` が返す値がそのまま透過するため、Main Process が `{ success: true, data: skills }` ラッパーを返すと、Renderer 層が `{ success, data }` オブジェクトを `ImportedSkill[]` として受け取ってしまう
- **症状**: AgentView で `importedSkills.forEach is not a function` ランタイムエラー
- **解決策**: `safeInvokeUnwrap<T>()` 関数を追加し、実行時にラッパーを展開。`result.success` を検証し、`result.data` のみを返却する
- **教訓**: TypeScript の型注釈は実行時の値を変換しない。IPC 境界では必ず実行時バリデーション／変換を行うこと（P19 の拡張）
- **コード例**:

```typescript
// ❌ 型注釈だけでは実行時の値は変わらない
function safeInvoke<T>(channel: string): Promise<T> {
  return ipcRenderer.invoke(channel); // Main が { success, data } を返しても T として透過
}

// ✅ 実行時にラッパーを展開する
async function safeInvokeUnwrap<T>(channel: string, ...args: unknown[]): Promise<T> {
  const result = await safeInvoke<IpcResult<T>>(channel, ...args);
  if (!result.success) {
    throw new Error(result.error || `IPC call failed: ${channel}`);
  }
  return result.data as T;
}
```

#### 5. ハンドラ応答形式の不統一（safeInvoke vs safeInvokeUnwrap 選択）

- **問題**: Main Process の IPC ハンドラが全て同じレスポンス形式を使うわけではない。`SKILL_LIST`, `SKILL_SCAN`, `SKILL_GET_IMPORTED` は `{ success, data }` ラッパーで返すが、`SKILL_IMPORT` は `skillService.importSkills()` の戻り値を直接返す（ラッパーなし）
- **影響**: `import()` に `safeInvokeUnwrap` を適用すると、ラッパーなし応答に対して `result.success` が `undefined`（falsy）となり、正常なレスポンスでもエラーがスローされる
- **解決策**: 各ハンドラの実装（`skillHandlers.ts`）を確認し、応答形式に応じて `safeInvoke`（ラッパーなし）/ `safeInvokeUnwrap`（ラッパーあり）を選択する
- **判断基準**:

| ハンドラの return 文 | Preload メソッド |
|---|---|
| `return { success: true, data: ... }` | `safeInvokeUnwrap` |
| `return service.method()` (直接返却) | `safeInvoke` |

- **教訓**: IPC チャンネルの修正時は、必ず `skillHandlers.ts` (または対応するハンドラファイル) の return 文を確認すること。ハンドラ応答形式のドキュメント化（テーブル形式）が将来的に必要

#### 6. テストモック値の波及修正（19箇所）

- **問題**: `safeInvoke` → `safeInvokeUnwrap` に変更すると、`mockInvoke.mockResolvedValue([...])` で直接値を返していた既存テストが全て失敗する。`safeInvokeUnwrap` は `{ success, data }` 形式のレスポンスを期待するため
- **影響範囲**: 3ファイル・計19箇所のモック値更新が必要
  - `skill-api.test.ts`: 11箇所
  - `skill-api.unification.test.ts`: 8箇所
  - `skill-api.permission.test.ts`: 0箇所（Permission API は未変更のため影響なし）
- **解決策**: `grep -n "mockResolvedValue\|mockResolvedValueOnce" *.test.ts` で全モック箇所を特定し、`list()`, `getImported()`, `rescan()` を呼ぶテストのモック値を `{ success: true, data: [...] }` 形式に更新
- **教訓**: P21/P35（DI追加時のテストモック大規模修正）と同パターン。内部実装の変更がテスト層に波及する場合は、事前に影響範囲調査（`grep`）を実施し、修正箇所リストを作成してから一括修正すべき

#### 7. Phase 10 仕様書テーブルと実装の乖離

- **問題**: Phase 10 仕様書の Task 1 テーブル（行83）に `import()` が `safeInvokeUnwrap` を使用すると記載されていたが、実装では正しく `safeInvoke` を使用している。仕様書のテーブルが Phase 2 設計時の初期想定のまま更新されていなかった
- **解決策**: Phase 10 レビューで MINOR 判定として記録。仕様書は Phase 5 実装結果を反映すべきだが、Phase 10 仕様書自体の修正はスコープ外
- **教訓**: タスク仕様書のテーブル・チェックリストは Phase 2 設計時に作成されるため、Phase 5 実装で判明した特殊ケース（SKILL_IMPORT の直接返却）が反映されない可能性がある。Phase 10 レビュー時にテーブルの記載と実装を突合すべき

### 成果物

| 成果物 | パス |
|--------|------|
| 実装ガイド | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/implementation-guide.md` |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/unassigned-task-report.md` |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| interfaces-agent-sdk-skill.md | 完了タスク記録・苦戦箇所追記 |
| task-workflow.md | 完了反映 + MINOR由来未タスク2件登録 |
| phase-12-documentation.md | 参照パス修正・Step結果確定化 |

---

## UT-FIX-IPC-HANDLER-DOUBLE-REG-001: IPC ハンドラ二重登録防止

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| 目的 | macOS ドックアイコンクリック時の IPC ハンドラ二重登録例外を防止 |
| 完了日 | 2026-02-14 |
| ステータス | **完了** |

### 苦戦箇所と解決策

#### 1. ipcMain.handle()の二重登録は例外送出

| 項目 | 内容 |
|------|------|
| 問題 | `ipcMain.handle()` は同一チャンネルに2回登録すると `Error: Attempted to register a second handler for ...` 例外を送出する。`ipcMain.on()` は暗黙的にリスナーを追加する動作とは根本的に異なる |
| 発生条件 | macOS で全ウィンドウを閉じた後、ドックアイコンをクリック → `activate` イベント発火 → `registerAllIpcHandlers()` が再実行される |
| 原因 | `ipcMain.handle()` はプロセスレベルで登録されるため、BrowserWindow の破棄では解除されない。macOS ではアプリプロセスは終了しないため、ハンドラが残存する |
| 解決策 | `unregisterAllIpcHandlers()` 関数を新設し、activate ハンドラ内で unregister → createWindow → register の順序で実行する |
| 教訓 | Electron の IPC API は `handle`/`on` で二重登録時の動作が異なることを理解し、ライフサイクルに応じたハンドラ管理が必要 |
| 関連パターン | [architecture-implementation-patterns.md - IPC ハンドラ二重登録防止パターン](./architecture-implementation-patterns.md) |
| 関連 Pitfall | [06-known-pitfalls.md - P5: リスナー二重登録](../../../rules/06-known-pitfalls.md) |

#### 2. IPC_CHANNELS 全走査の前提を先に検証する

| 項目 | 内容 |
|------|------|
| 問題 | `Object.values(IPC_CHANNELS)` で全解除する方針は有効だが、`IPC_CHANNELS` がネスト構造の場合はチャンネル漏れが発生する可能性がある |
| 発生条件 | ライフサイクル修正を急いで実装する際に、チャンネル定数の構造確認を省略する |
| 原因 | ハンドラ解除ロジックを先に実装し、チャンネル定義のデータ構造検証を後回しにした |
| 解決策 | `channels.ts` の構造を先に確認し、フラット配列化される前提を明文化してから `unregisterAllIpcHandlers()` を実装する |
| 教訓 | 「全走査で安全」は前提条件つき。定数構造の確認を先行することで解除漏れと誤検知を防げる |
| 関連パターン | [security-electron-ipc.md - IPC ハンドラライフサイクル管理](./security-electron-ipc.md#ipc-ハンドラライフサイクル管理) |

#### 3. IPC外リスナーの解除漏れを同時に防ぐ

| 項目 | 内容 |
|------|------|
| 問題 | `IPC_CHANNELS` の全解除だけでは `setupThemeWatcher()` の `nativeTheme` リスナーは解除されず、再登録で監視が重複する |
| 発生条件 | IPC ハンドラ二重登録の修正に集中し、IPCチャネル以外のイベントリスナーを同一ライフサイクルで見落とす |
| 原因 | 解除対象を「ipcMain のみ」と誤って限定し、モジュールスコープの unsubscribe 管理を設計に含めなかった |
| 解決策 | `themeWatcherUnsubscribe` を保持し、`unregisterAllIpcHandlers()` で IPC 解除と同時に `setupThemeWatcher` の解除処理を実行する |
| 教訓 | Main Process のライフサイクル修正は「IPC + 非IPCリスナー」を1セットで扱うと再発を防ぎやすい |
| 関連パターン | [architecture-implementation-patterns.md - IPC ハンドラ二重登録防止パターン](./architecture-implementation-patterns.md#ipc-ハンドラ二重登録防止パターンut-fix-ipc-handler-double-reg-001-2026-02-14実装) |

---
## テンプレート（新規教訓追加用）

以下は将来のタスク記録用テンプレートです。

### 記入ガイドライン

| 項目 | 説明 | 必須 |
|------|------|:----:|
| タスクID | 一意のタスク識別子（例: TASK-FIX-XX-X） | Yes |
| 目的 | タスクの目的を1文で記述 | Yes |
| 完了日 | YYYY-MM-DD 形式 | Yes |
| 苦戦箇所 | 課題・原因・解決策・教訓をテーブルで記述 | Yes |
| コード例 | 解決策を示す具体的なコード（TypeScript） | 推奨 |
| 参照 | 関連ドキュメントへのリンク | 推奨 |
| 成果物 | 変更/追加されたファイルのパス | Yes |

### テンプレート本文

```markdown
## TASK-XXX: タスク名（YYYY-MM-DD）

### タスク概要

| 項目 | 内容 |
|------|------|
| タスクID | TASK-XXX |
| 目的 | タスクの目的 |
| 完了日 | YYYY-MM-DD |
| ステータス | **完了** |

### 実装内容

| 変更内容 | ファイル | 説明 |
|----------|----------|------|
| 変更1 | ファイルパス | 説明 |

### 苦戦箇所と解決策

#### 1. [苦戦箇所のタイトル]

| 項目 | 内容 |
|------|------|
| **課題** | 課題の説明 |
| **原因** | 原因の説明 |
| **解決策** | 解決策の説明 |
| **教訓** | 今後の教訓 |

**コード例**:

```typescript
// 解決策を示すコード例
```

**参照**: [関連ドキュメント](./path/to/doc.md)

---

### 成果物

| 成果物 | パス |
|--------|------|
| 成果物名 | ファイルパス |

### 関連ドキュメント更新

| ドキュメント | 更新内容 |
|--------------|----------|
| ドキュメント名 | 更新内容 |
```

---

## 品質チェックリスト

新規教訓を追加する際は、以下を確認してください。

| チェック項目 | 基準 |
|-------------|------|
| [ ] タスク概要が完全 | タスクID、目的、完了日、ステータスがすべて記載 |
| [ ] 苦戦箇所が構造化 | 課題・原因・解決策・教訓の4項目がテーブルで記載 |
| [ ] コード例が具体的 | 解決策を再現可能なコード例が含まれる |
| [ ] 参照リンクが有効 | 関連ドキュメントへのリンクが正しい |
| [ ] 06-known-pitfalls.md と整合 | 汎用的な教訓は pitfalls にも追加 |
| [ ] 変更履歴を更新 | 本ドキュメント上部の変更履歴テーブルを更新 |
| [ ] 目次を更新 | 新規タスクを目次に追加 |
