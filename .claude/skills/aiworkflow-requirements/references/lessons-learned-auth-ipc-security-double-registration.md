# Lessons Learned（教訓集） / auth / ipc lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: auth / ipc lessons

## UT-9B-H-003: SkillCreator IPCセキュリティ強化

### タスク概要

| 項目       | 値                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-9B-H-003                                                                                                            |
| 目的       | skillCreatorHandlers.ts のIPC L3ドメイン検証（パストラバーサル防止、エラーサニタイズ、スキーマ名ホワイトリスト）を追加 |
| 完了日     | 2026-02-12                                                                                                             |
| ステータス | ✅ 完了                                                                                                                |
| テスト結果 | 116テスト全PASS（セキュリティ45 + 統合71）                                                                             |

### 苦戦箇所

| #   | 課題                                      | 原因                                                                                                                          | 解決策                                                                                                                                                                               | 教訓                                                                                                                                                                                    |
| --- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | TDDでのセキュリティテスト先行設計の難しさ | セキュリティテストは攻撃ベクトルの網羅が必要で、実装前に全パターンを想定するのが困難                                          | 攻撃カテゴリ別にテストを分類（SEC-01〜SEC-07g）し、受入基準（AC-01〜AC-10）にマッピング。カテゴリ:パストラバーサル・エラーサニタイズ・ホワイトリスト・境界値・検証優先順序           | セキュリティテストは攻撃パターンの分類体系（SEC-XX）を先に設計し、受入基準にマップすることでTDDが機能する                                                                               |
| 2   | 正規表現パターンのPrettier干渉            | Markdownコードブロック内の正規表現表記をPrettierが自動フォーマットし、`readonly["task-spec", ...]` のように壊れた表記になった | バックグラウンドエージェントで修正を実施。ドキュメント内の型表記はPrettierの影響を受けることを前提に、修正ステップを組み込む                                                         | Phase 12の実装ガイド作成時、コードブロック内のTypeScript表記がPrettierで変形される可能性を考慮し、PostToolUseフック後に検証を行う                                                       |
| 3   | YAGNI判断での共通化見送りの根拠付け       | `validatePath`と`sanitizeErrorMessage`を共通パッケージに移動するか、現在のファイル内に留めるかの判断                          | Phase 8で3つの共通化候補（validatePath共通化、sanitizeErrorMessage全ハンドラー横展開、IpcResult型統一）を検討し、全てYAGNI原則により「現状維持」と判断。理由を未タスク候補として記録 | リファクタリングPhaseでの共通化判断は、（1）現在の使用箇所数、（2）変更頻度、（3）独立性を評価し、YAGNI原則を適用。共通化しない判断も未タスクとして記録することで、将来の判断材料を残す |
| 4   | Phase 11のCLI環境での手動テスト不可       | CLI環境（Claude Code）ではElectronアプリを起動してDevToolsで手動テストができない                                              | 自動テスト（Vitest 116テスト）で代替検証を実施。DevToolsコマンドを開発者向けリファレンスとして手動テストレポートに記載                                                               | CLI環境でのPhase 11は、自動テストでの代替検証 + DevToolsコマンドのドキュメント化で対応する。手動テストが必要な場合は明示的にその旨を記録                                                |
| 5   | 複数セッション間でのPhase 12成果物整合性  | コンテキスト制限によりセッションが分割され、前セッションの成果物状態の追跡が困難になった                                      | セッション開始時にoutputs/配下のファイル一覧を確認し、前セッションの進捗を復元。バックグラウンドエージェントの完了通知を待ってから最終整合性チェックを実施                           | コンテキスト継続時は、成果物ディレクトリの `Glob` で前セッションの状態を即座に把握する。バックグラウンドエージェントは `TaskOutput` で完了確認してから次ステップに進む                  |

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
| 検討項目                      | 判定     | 理由                             | 未タスク    |
| ----------------------------- | -------- | -------------------------------- | ----------- |
| validatePath を shared に移動 | 現状維持 | 使用箇所1ファイルのみ            | UT-9B-H-002 |
| sanitizeErrorMessage 横展開   | 現状維持 | 他ハンドラーとの統一は別スコープ | UT-9B-H-001 |
```

### 成果物

| 成果物               | パス                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| セキュリティ関数実装 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                         |
| セキュリティテスト   | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts`                 |
| 実装ガイド           | `docs/30-workflows/ut-9b-h-003-security-hardening/outputs/phase-12/implementation-guide.md` |
| IPCドキュメント      | `docs/30-workflows/ut-9b-h-003-security-hardening/outputs/phase-12/ipc-documentation.md`    |

### 関連ドキュメント更新

| ドキュメント                            | 更新内容                                                   |
| --------------------------------------- | ---------------------------------------------------------- |
| security-electron-ipc.md                | v1.3.0: L3ドメイン検証パターン完了記録                     |
| architecture-implementation-patterns.md | IPC L3セキュリティハードニングパターン追加                 |
| 06-known-pitfalls.md                    | P11関連: PostToolUseフックによるMarkdownコードブロック変形 |

---

## UT-FIX-IPC-RESPONSE-UNWRAP-001: IPCレスポンスラッパー未展開修正

### タスク概要

| 項目       | 値                                                                          |
| ---------- | --------------------------------------------------------------------------- |
| タスクID   | UT-FIX-IPC-RESPONSE-UNWRAP-001                                              |
| 目的       | Preload層でIPC `{ success, data }` ラッパーを展開し、Rendererへ直接型を返す |
| 完了日     | 2026-02-14                                                                  |
| ステータス | ✅ 完了                                                                     |
| テスト結果 | 25件追加、既存回帰テストPASS                                                |

### 苦戦箇所

| #   | 課題                                                            | 原因                                                                                    | 解決策                                                               | 教訓                                                                                                        |
| --- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1   | 仕様書の正本参照が不一致                                        | `api-ipc-skill.md` という非実在ファイル参照が複数ドキュメントに残存                     | 参照先を `interfaces-agent-sdk-skill.md` に統一し、index再生成で追従 | 仕様更新前に参照パスの物理存在確認を必須化する                                                              |
| 2   | Phase 10 MINORの未タスク化漏れ                                  | 「軽微なので不要」という判断が先行し、未タスク管理が不完全化                            | M-1/M-2を `UT-FIX-IPC-RESPONSE-UNWRAP-002/003` として正式起票        | MINOR判定は影響度に関わらず追跡タスク化し、判断理由を残す                                                   |
| 3   | 完了移管後のリンク不整合                                        | 元タスク指示書を移動後、`unassigned-task` 参照が残る                                    | `completed-tasks` 側へ参照更新し、リンク整合を機械検証               | 完了移管時は「移動・参照更新・検証」を1セットで実施する                                                     |
| 4   | TypeScript ジェネリクスの type erasure によるバグ根本原因       | `safeInvoke<T>` の型注釈はコンパイル時に消去され、実行時は IPC レスポンスがそのまま透過 | `safeInvokeUnwrap<T>()` で実行時にラッパーを展開                     | TypeScript の型注釈は実行時の値を変換しない。IPC 境界では必ず実行時バリデーション／変換を行う（P19 の拡張） |
| 5   | ハンドラ応答形式の不統一（safeInvoke vs safeInvokeUnwrap 選択） | Main Process のハンドラが全て同じレスポンス形式を使うわけではない                       | 各ハンドラの return 文を確認し、応答形式に応じて使い分け             | IPC チャンネル修正時は必ずハンドラファイルの return 文を確認する                                            |
| 6   | テストモック値の波及修正（19箇所）                              | `safeInvokeUnwrap` は `{ success, data }` 形式を期待するため既存モックが全て失敗        | grep で全モック箇所を特定し一括修正                                  | P21/P35 と同パターン。事前に影響範囲調査（grep）を実施してから一括修正すべき                                |
| 7   | Phase 10 仕様書テーブルと実装の乖離                             | Phase 2 設計時のテーブルが Phase 5 実装結果を反映していなかった                         | Phase 10 レビューで MINOR 判定として記録                             | Phase 10 レビュー時にテーブルの記載と実装を突合すべき                                                       |

### コード例

```typescript
// PreloadでIPCラッパーを展開する共通関数
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function safeInvokeUnwrap<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
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
async function safeInvokeUnwrap<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
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

| ハンドラの return 文                  | Preload メソッド   |
| ------------------------------------- | ------------------ |
| `return { success: true, data: ... }` | `safeInvokeUnwrap` |
| `return service.method()` (直接返却)  | `safeInvoke`       |

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

| 成果物               | パス                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| 実装ガイド           | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/unassigned-task-report.md`  |

### 関連ドキュメント更新

| ドキュメント                  | 更新内容                            |
| ----------------------------- | ----------------------------------- |
| interfaces-agent-sdk-skill.md | 完了タスク記録・苦戦箇所追記        |
| task-workflow.md              | 完了反映 + MINOR由来未タスク2件登録 |
| phase-12-documentation.md     | 参照パス修正・Step結果確定化        |

---

## UT-FIX-IPC-HANDLER-DOUBLE-REG-001: IPC ハンドラ二重登録防止

### タスク概要

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| タスクID   | UT-FIX-IPC-HANDLER-DOUBLE-REG-001                               |
| 目的       | macOS ドックアイコンクリック時の IPC ハンドラ二重登録例外を防止 |
| 完了日     | 2026-02-14                                                      |
| ステータス | **完了**                                                        |

### 苦戦箇所と解決策

#### 1. ipcMain.handle()の二重登録は例外送出

| 項目         | 内容                                                                                                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題         | `ipcMain.handle()` は同一チャンネルに2回登録すると `Error: Attempted to register a second handler for ...` 例外を送出する。`ipcMain.on()` は暗黙的にリスナーを追加する動作とは根本的に異なる |
| 発生条件     | macOS で全ウィンドウを閉じた後、ドックアイコンをクリック → `activate` イベント発火 → `registerAllIpcHandlers()` が再実行される                                                               |
| 原因         | `ipcMain.handle()` はプロセスレベルで登録されるため、BrowserWindow の破棄では解除されない。macOS ではアプリプロセスは終了しないため、ハンドラが残存する                                      |
| 解決策       | `unregisterAllIpcHandlers()` 関数を新設し、activate ハンドラ内で unregister → createWindow → register の順序で実行する                                                                       |
| 教訓         | Electron の IPC API は `handle`/`on` で二重登録時の動作が異なることを理解し、ライフサイクルに応じたハンドラ管理が必要                                                                        |
| 関連パターン | [architecture-implementation-patterns.md - IPC ハンドラ二重登録防止パターン](./architecture-implementation-patterns.md)                                                                      |
| 関連 Pitfall | [06-known-pitfalls.md - P5: リスナー二重登録](../../../rules/06-known-pitfalls.md)                                                                                                           |

#### 2. IPC_CHANNELS 全走査の前提を先に検証する

| 項目         | 内容                                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 問題         | `Object.values(IPC_CHANNELS)` で全解除する方針は有効だが、`IPC_CHANNELS` がネスト構造の場合はチャンネル漏れが発生する可能性がある |
| 発生条件     | ライフサイクル修正を急いで実装する際に、チャンネル定数の構造確認を省略する                                                        |
| 原因         | ハンドラ解除ロジックを先に実装し、チャンネル定義のデータ構造検証を後回しにした                                                    |
| 解決策       | `channels.ts` の構造を先に確認し、フラット配列化される前提を明文化してから `unregisterAllIpcHandlers()` を実装する                |
| 教訓         | 「全走査で安全」は前提条件つき。定数構造の確認を先行することで解除漏れと誤検知を防げる                                            |
| 関連パターン | [security-electron-ipc.md - IPC ハンドラライフサイクル管理](./security-electron-ipc.md#ipc-ハンドラライフサイクル管理)            |

#### 3. IPC外リスナーの解除漏れを同時に防ぐ

| 項目         | 内容                                                                                                                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題         | `IPC_CHANNELS` の全解除だけでは `setupThemeWatcher()` の `nativeTheme` リスナーは解除されず、再登録で監視が重複する                                                                                      |
| 発生条件     | IPC ハンドラ二重登録の修正に集中し、IPCチャネル以外のイベントリスナーを同一ライフサイクルで見落とす                                                                                                      |
| 原因         | 解除対象を「ipcMain のみ」と誤って限定し、モジュールスコープの unsubscribe 管理を設計に含めなかった                                                                                                      |
| 解決策       | `themeWatcherUnsubscribe` を保持し、`unregisterAllIpcHandlers()` で IPC 解除と同時に `setupThemeWatcher` の解除処理を実行する                                                                            |
| 教訓         | Main Process のライフサイクル修正は「IPC + 非IPCリスナー」を1セットで扱うと再発を防ぎやすい                                                                                                              |
| 関連パターン | [architecture-implementation-patterns.md - IPC ハンドラ二重登録防止パターン](./architecture-implementation-patterns.md#ipc-ハンドラ二重登録防止パターンut-fix-ipc-handler-double-reg-001-2026-02-14実装) |

---

## UT-SKILL-IMPORT-CHANNEL-CONFLICT-001: skill:import IPCチャネル名競合の予防的解消

### タスク概要

| 項目       | 内容                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001                                                                            |
| 目的       | 仕様書段階で `skill:import`（ローカル用）と外部インポート用チャネルの命名競合を解消し、実装時のP5/P44再発を予防 |
| 完了日     | 2026-02-24                                                                                                      |
| ステータス | **完了（仕様書修正のみ）**                                                                                      |
| 変更対象   | `task-022-task-9f-skill-share.md`, `task-030-ui-05-skill-center-view.md`                                        |

### 苦戦箇所と解決策

#### 1. 仕様書修正のみタスクの完了反映が台帳から漏れた

| 項目       | 内容                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `SKILL.md` / `LOGS.md` は更新されていたが、`task-workflow.md` の完了タスクセクションに本タスクの記録がなく、実装内容の追跡性が不足した                          |
| **原因**   | 「コード変更なし」のため、完了反映をログ系ファイルだけで完結した誤判断                                                                                          |
| **解決策** | `task-workflow.md` の完了タスクへ `spec_created` として登録し、成果物リンク（implementation-guide / documentation-changelog / unassigned-task-detection）を明示 |
| **教訓**   | 仕様書修正のみでも「完了台帳（task-workflow）」への反映は必須。ログだけでは再利用できる知識にならない                                                           |

#### 2. workflow移管後の旧参照パス残存

| 項目       | 内容                                                                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `task-ui-00-atoms` 配下に旧パス `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-2-atoms-components.md` が残存し、参照切れ状態だった                                                     |
| **原因**   | ワークフローを `completed-tasks/` へ移管した際に、Phase 1-13 / index / Phase 12仕様書内の固定パスを一括更新しきれていなかった                                                                             |
| **解決策** | 参照を `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` に統一し、関連する `00-1-design-tokens.md` / `task-050-ui-00-ui-design-foundation.md` も実在パスへ補正 |
| **教訓**   | ワークフロー移管時は「単一ファイル修正」ではなく、同一ワークフロー配下の全Phase・indexを横断置換して参照実在チェックを行う                                                                                |

#### 3. 生成ミスによる `{outputs` ゴーストディレクトリ

| 項目       | 内容                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/{outputs` という空ディレクトリが生成され、成果物ディレクトリ構造のノイズとなった |
| **原因**   | ディレクトリ名テンプレートの展開時に `{` が残存したまま作成された                                                                                        |
| **解決策** | 空ディレクトリを削除し、`outputs/` 配下のみを正規成果物ディレクトリとして維持                                                                            |
| **教訓**   | 仕様書生成タスク後は `find <workflow> -maxdepth 2 -type d` でディレクトリ名を監査し、テンプレート展開漏れを早期に除去する                                |

#### 4. IPC チャネル命名規則の体系化

- **課題**: 既存の `skill:import` と TASK-9F の外部ソースインポートが同名チャネルを使用する設計だった。P5（`ipcMain.handle()` 二重登録例外）により実装段階で100%失敗する
- **原因**: 仕様書設計段階でチャネル名の一意性検証が行われていなかった。複数タスク（TASK-9F, UT-FIX-SKILL-IMPORT-INTERFACE-001）が独立して進行し、名前空間の衝突を事前検出する仕組みがなかった
- **解決策**: チャネル命名規則を3パターンに体系化
  | パターン | 用途 | 例 |
  |---------|------|-----|
  | `skill:{動詞}` | 既存ローカル操作 | `skill:import` |
  | `skill:{動詞}FromSource` | 外部ソース操作 | `skill:importFromSource` |
  | `skill:{動詞}Source` | ソース自体への操作 | `skill:validateSource` |
- **教訓**: 新規 IPC チャネル追加時は `grep -rn "チャネル名" apps/desktop/src/` で既存チャネルとの名前衝突を事前検証する。仕様書レベルでの横断検索（`grep -rn "skill:import" docs/30-workflows/`）も必須

#### 5. grep ベース仕様書 TDD の有効性

- **課題**: コード変更がないため、Vitest 等の標準テストツールが使えない
- **原因**: 仕様書修正のみタスクに対するテスト手法が確立されていなかった
- **解決策**: Phase 4 で grep 検証コマンドを「テストケース」として10項目設計し、Phase 5 実装後に全実行。Phase 9 品質ゲートでも同じ grep コマンドを再利用
  - 旧チャネル名残存検出: `grep -rn "skill:import" | grep -v "importFromSource"` = 0件
  - 新チャネル名件数検証: `grep -c "importFromSource"` >= 5件
  - 既存互換性検証: ローカル用 `skill:import` が残存していること
- **教訓**: 仕様書修正タスクでは grep ベースのTDDが効果的。Red（設計）→ Green（修正）→ Refactor（品質ゲート）の3フェーズで品質担保できる

#### 6. Phase 4 の修正箇所数見積もり精度

- **課題**: Phase 4 仕様書で task-022 の修正箇所を「3箇所」と記載したが、実際は1箇所のみ
- **原因**: Phase 4 テスト設計時にファイル内容を `grep` で事前検証しなかった（P37パターン: ドキュメント数値の早期固定）
- **解決策**: grep 検証の期待値を「1件以上」と柔軟に設計し直した。実行結果は2件で PASS
- **教訓**: Phase 4 の期待値設計は、対象ファイルの `grep -c` 実行結果に基づくべき。概算ではなく実測値ベースで設計する

### 同種課題の簡潔解決手順（4ステップ）

1. **対象を固定**: `git diff --name-status` で今回対象ワークフローと仕様書更新対象（workflow / aiworkflow-requirements）を先に確定する。
2. **参照を一括監査**: `rg -n "ui-overhaul|completed-task|../00-" <workflow-dir>` で旧パスを抽出し、実在パスへまとめて置換する。
3. **台帳を同期**: 仕様書修正のみでも `task-workflow.md` 完了タスクと `lessons-learned.md` 苦戦箇所を同時更新する。
4. **機械検証で締める**: `verify-unassigned-links.js`・`audit-unassigned-tasks.js`・`generate-index.js` を実行し、リンク・フォーマット・索引を同期する。

#### IPC チャネル名競合の検出・解消手順（5ステップ）

1. `grep -rn "新チャネル名" apps/desktop/src/main/ipc/` で既存チャネルとの名前衝突を検出
2. 衝突がある場合: `skill:{動詞}FromSource` パターンで新チャネル名を決定
3. `grep -rn "旧チャネル名" docs/30-workflows/` で仕様書内の全使用箇所を特定
4. 仕様書修正（チャネル名変更 + artifacts.modifies 追加 + 注記追加）
5. `grep -rn "旧チャネル名" | grep -v "新チャネル名"` で残存検証（0件 = 完了）

### 成果物

| 成果物           | パス                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| ワークフロー一式 | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/`                                              |
| 実装ガイド       | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/implementation-guide.md`      |
| 更新履歴         | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出     | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/unassigned-task-detection.md` |

### 関連ドキュメント更新

| ドキュメント                                           | 更新内容                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `task-workflow.md`                                     | 完了タスク2件（UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 / TASK-UI-00-ATOMS）を追記 |
| `lessons-learned.md`                                   | 本教訓セクション追加（苦戦箇所3件 + 4ステップ手順）                            |
| `docs/30-workflows/completed-tasks/task-ui-00-atoms/*` | 旧参照パスを `tasks/completed-task` 正本へ統一                                 |

---

## UT-IPC-CHANNEL-NAMING-AUDIT-001: IPCチャネル命名監査の台帳同期（2026-02-25）

### タスク概要

| 項目       | 内容                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| タスクID   | UT-IPC-CHANNEL-NAMING-AUDIT-001                                                       |
| 目的       | IPCチャネル命名規則の横断監査結果を台帳・仕様へ同期し、対象外ノイズを未タスク分離する |
| 完了日     | 2026-02-25                                                                            |
| ステータス | **spec_created（Phase 1-12完了）**                                                    |

### 苦戦箇所と解決策

#### 1. 対象内完了と対象外ノイズの混同

| 項目   | 内容                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------- |
| 課題   | Skill命名監査は完了しているのに、`AUTH_*` 重複式が残っているため完了判定が曖昧になった          |
| 原因   | 監査結果を「対象内/対象外」で分離せず、単一件数で扱っていた                                     |
| 解決策 | `UT-IPC-AUTH-HANDLE-DUPLICATE-001` を未タスクとして切り出し、主タスクは `spec_created` で完了化 |
| 教訓   | 監査タスクは「対象内を完了」「対象外は未タスク化」で同時に閉じる                                |

#### 2. 参照パス移管時のリンク切れ

| 項目   | 内容                                                                          |
| ------ | ----------------------------------------------------------------------------- |
| 課題   | `unassigned-task` から `completed-tasks` へ移管したタスクの旧パスが残りやすい |
| 原因   | 台帳更新と成果物更新が分離され、先送りが発生                                  |
| 解決策 | `task-workflow.md` 更新と `verify-unassigned-links.js` 実行を同一ターンで実施 |
| 教訓   | 未タスク/完了タスクの移管は必ず「更新 + 機械検証」をワンセットで行う          |

#### 3. Phase 12 成果物台帳の二重管理

| 項目   | 内容                                                                  |
| ------ | --------------------------------------------------------------------- |
| 課題   | `artifacts.json` と `outputs/artifacts.json` の同期漏れが発生しやすい |
| 原因   | 出力作成後に片方だけ更新して完了扱いにしてしまう                      |
| 解決策 | Phase 12 で両ファイルを同時更新し、差分確認を必須化                   |
| 教訓   | 仕様書修正のみタスクでも成果物台帳は二重同期を前提にする              |

### 同種課題向け簡潔解決手順（5ステップ）

1. 監査結果を「対象内/対象外」に分離して記録する。
2. 対象外の未解決事項がある場合は未タスク指示書を作成する。
3. `task-workflow.md` に完了化と未タスク追加を同時反映する。
4. `verify-unassigned-links.js` を実行し、参照切れ0件を確認する。
5. `artifacts.json` と `outputs/artifacts.json` を同期してから完了判定する。

### 成果物

| 成果物                           | パス                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| 監査ワークフロー                 | `docs/30-workflows/ut-ipc-channel-naming-audit-001/`                                              |
| 元タスク指示書（移管先）         | `docs/30-workflows/completed-tasks/task-ipc-channel-naming-audit-001.md`                          |
| 新規未タスク指示書（完了移管先） | `docs/30-workflows/completed-tasks/task-ipc-auth-handle-duplicate-001.md`                         |
| Phase 12 未タスク検出レポート    | `docs/30-workflows/ut-ipc-channel-naming-audit-001/outputs/phase-12/unassigned-task-detection.md` |

---

