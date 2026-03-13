# Lessons Learned（教訓集） / auth / ipc lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: auth / ipc lessons

## TASK-9A-B: スキルファイル操作IPCハンドラー実装

### タスク概要

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| タスクID   | TASK-9A-B                                                       |
| 目的       | SkillFileManager の6操作を IPC 経由で安全に実行できる状態にする |
| 完了日     | 2026-02-19                                                      |
| ステータス | **完了**                                                        |

### 実装内容

| 変更内容           | ファイル                                         | 説明                                                                                           |
| ------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| IPCハンドラー追加  | `apps/desktop/src/main/ipc/skillFileHandlers.ts` | `skill:readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup` の6チャンネルを実装 |
| Preload API公開    | `apps/desktop/src/preload/skill-api.ts`          | `electronAPI.skill` から file 操作 API を公開                                                  |
| チャンネル定義拡張 | `packages/shared/src/ipc/channels.ts`            | 6チャンネルを型安全に追加                                                                      |
| セキュリティ検証   | `apps/desktop/src/main/ipc/skillFileHandlers.ts` | `validateIpcSender` + 引数バリデーション + `isKnownSkillFileError` でサニタイズ                |

### 苦戦箇所と解決策

#### 1. 仕様書の実装事実ドリフト（テスト件数・エラーメッセージ）

| 項目       | 内容                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| **課題**   | 仕様書の一部にテスト件数（47）やエラーメッセージ表記の旧値が残り、実装（65テスト、実コード文言）と不一致になった  |
| **原因**   | Phase 12の更新時に「前回レビューのメモ」を再利用し、再実行結果との差分確認を省略した                              |
| **解決策** | IPCテストを再実行して実測値を基準化し、`api-ipc-agent.md` / `security-electron-ipc.md` / `LOGS.md` を一括修正した |
| **教訓**   | 仕様更新は必ず「実行ログと実装コード」を一次情報にし、数値・文言の転記は最後にクロスチェックする                  |

#### 2. Preload公開先パスの取り違え

| 項目       | 内容                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | 仕様書内に `skill-file-api.ts` という非実在パスが残り、実際の公開先（`skill-api.ts`）と乖離した                                   |
| **原因**   | ファイル名変更後の旧参照が複数仕様書に残存し、横断検索をせずに局所更新で完了扱いにした                                            |
| **解決策** | `rg` で誤パスを全件検出し、`interfaces-agent-sdk-skill.md` / `api-ipc-agent.md` / `security-electron-ipc.md` を同ターンで修正した |
| **教訓**   | IPC系の仕様更新は単一ファイルで閉じず、Preload/Shared/Main を束ねた横断検索を必須工程にする                                       |

#### 3. 未タスク検出raw件数の誤読防止

| 項目       | 内容                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | TODO/FIXME の raw 検出4件を新規未タスクと誤認しやすく、不要な指示書作成リスクがあった                                           |
| **原因**   | 検出スクリプト出力の「候補」と「確定課題」の区別が不明確になりやすい                                                            |
| **解決策** | raw 4件を既存未タスクとの対応で精査し、`task-imp-community-dashboard-handlers-001.md` で管理済みと確認して新規起票0件を明記した |
| **教訓**   | 未タスク検出は raw 件数だけで判断せず、既存台帳との突合結果まで記録して完了判定する                                             |

**コード例**:

```bash
# 実装事実ドリフトを防ぐ最小検証セット
pnpm --filter @repo/desktop test:run src/main/ipc/__tests__/skillFileHandlers*.test.ts
rg -n "skill-file-api\\.ts|TASK-9A-B|65テスト|47" .claude/skills/aiworkflow-requirements/references/
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

#### 4. handlerMap ESMモックパターン

| 項目       | 内容                                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | Vitest + ESM環境で `require("electron")` が使用不可。ipcMain.handle() で登録されたハンドラー関数をテスト側から直接呼び出す方法が必要だった                                                       |
| **原因**   | Electron の ESM サポートが不完全で、CommonJS スタイルの `require` を使ったモジュール取得ができない                                                                                               |
| **解決策** | `vi.mock("electron")` で ipcMain.handle をモック化し、`Map<string, Function>` (handlerMap) にハンドラーを格納。テスト側から `handlerMap.get(channelName)!(event, args)` で直接呼び出す方式を採用 |
| **教訓**   | Electron IPC テストでは、ランタイム依存を排除した handlerMap キャプチャ方式が最も安定する。TASK-8C-A で確立されたパターンを TASK-9A-B でも踏襲できた                                             |

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
const result = await handler!(mockEvent, {
  skillName: "test",
  relativePath: "SKILL.md",
});
```

#### 5. v8カバレッジの関数定義行カウント問題

| 項目       | 内容                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Function Coverage が 44.44% に急落。コールバック内のインライン arrow function `() => [mainWindow]` が v8 カバレッジプロバイダにより独立した関数としてカウントされた                    |
| **原因**   | Vitest の v8 カバレッジプロバイダは V8 エンジンのネイティブカバレッジを使用するため、ソースコード上のアロー関数（`getAllowedWindows: () => [mainWindow]`）を個別関数としてカウントする |
| **解決策** | セキュリティテスト S-03 で `getAllowedWindows()` コールバックの戻り値を明示的に検証するテストを追加し、各ハンドラー内のインライン arrow function が実行されるようにした                |
| **教訓**   | v8 カバレッジでは、validateIpcSender のオプション内 arrow function も関数カウント対象。Function Coverage 低下時は、未実行のインライン関数を grep で特定し、テストで明示的に呼び出す    |

**コード例**:

```typescript
// S-03: getAllowedWindows コールバックの実行を確認
for (let i = 0; i < 6; i++) {
  const options = mockValidateIpcSender.mock.calls[i][2];
  expect(options.getAllowedWindows()).toEqual([mainWindow]);
}
```

#### 6. .trim()境界値バリデーション漏れ

| 項目       | 内容                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | Phase 4（テスト作成）で `typeof args?.skillName !== "string"` の型チェックのみ設計したが、Phase 6（テスト拡充）でスペースのみ入力 `"   "` がバリデーションを通過する問題を発見 |
| **原因**   | 初期設計で空文字列チェック `=== ""` を入れたが、空白のみの文字列（`"   "`）は空文字列ではないため通過。SkillFileManager側でパスエラーとなる前に IPC 層で拒否すべきだった       |
| **解決策** | `args.skillName.trim() === ""` を全6ハンドラーの引数バリデーションに追加。backupPath にも同様の `.trim()` チェックを適用                                                       |
| **教訓**   | 文字列バリデーションでは `typeof` + `=== ""` だけでなく `.trim() === ""` の3段チェックを標準化すべき。境界値テスト（B-01, B-02）の追加により発見できた                         |

**コード例**:

```typescript
// ❌ 不十分 — スペースのみの入力を見逃す
if (typeof args?.skillName !== "string" || args.skillName === "") { ... }

// ✅ 完全 — .trim() でホワイトスペースのみも検出
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") { ... }
```

#### 7. isKnownSkillFileError型ガードによるエラーサニタイズ設計

| 項目       | 内容                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- | --- | --------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | 5種類のカスタムエラー（SkillNotFoundError, ReadonlySkillError, PathTraversalError, FileExistsError, FileNotFoundError）の判別を各ハンドラーで個別に行うと、DRY 違反とエラー種別追加時の変更漏れリスクがあった |
| **原因**   | 初期設計で catch ブロック内に直接 instanceof チェーンを記述するプランだったが、6ハンドラー × 5エラー種別 = 30箇所の重複が発生                                                                                 |
| **解決策** | `isKnownSkillFileError(error): error is A                                                                                                                                                                     | B   | C   | D   | E`型ガード関数を共通化。既知エラーは`error.message`をそのまま返し、未知エラーは`"Internal error"` で内部情報を遮断する2分岐に集約 |
| **教訓**   | TypeScript の type guard + union type は、エラーサニタイズの DRY 化に最適。新しいエラークラス追加時も型ガード関数1箇所の修正で済む                                                                            |

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

| 成果物               | パス                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/`                             |
| 完了タスク記録       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         |
| IPC仕様更新          | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`         |
| セキュリティ仕様更新 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |

---

## TASK-9B-H: SkillCreatorService IPCハンドラー登録

> **このセクションの役割**: プロセス面の教訓（何が問題だったか、どう防止するか）を記録する。実装パターン（どう実装するか）については [architecture-implementation-patterns.md - IPC ハンドラー登録パターン](./architecture-implementation-patterns.md) を参照。

### タスク概要

| 項目       | 内容                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| タスクID   | TASK-9B-H-SKILL-CREATOR-IPC                                                       |
| 目的       | SkillCreatorService の IPC ハンドラー登録・Preload API 公開・セキュリティ層を実装 |
| 完了日     | 2026-02-12                                                                        |
| ステータス | **完了**                                                                          |

### 実装内容

| 変更内容           | ファイル                  | 説明                                                     |
| ------------------ | ------------------------- | -------------------------------------------------------- |
| IPCハンドラー登録  | `skillCreatorHandlers.ts` | ipcMain.handle で5チャンネル + 進捗通知1チャンネルを登録 |
| Preload API実装    | `skill-creator-api.ts`    | safeInvoke/safeOn でホワイトリスト検証付きAPI公開        |
| contextBridge統合  | `preload/index.ts`        | electronAPI.skillCreator として統合公開                  |
| ホワイトリスト更新 | `channels.ts`             | ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS に追加     |

### 苦戦箇所と解決策

#### 1. Preload統合の漏れ防止

| 項目       | 内容                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| **課題**   | skill-creator-api.ts で skillCreatorAPI を実装したが、preload/index.ts への contextBridge 統合を忘れた |
| **原因**   | Preload API の新規追加時に必要な更新箇所が4箇所に分散しており、チェックリスト化されていなかった        |
| **解決策** | Phase 8-9 で発見・修正。新規Preload API追加時の4箇所更新チェックリストを策定                           |
| **教訓**   | 新規 Preload API 追加時は以下の4箇所を必ず更新する                                                     |

**新規Preload API追加時の必須更新箇所**:

| 更新箇所                           | ファイル           | 内容                                             |
| ---------------------------------- | ------------------ | ------------------------------------------------ |
| 1. import追加                      | `preload/index.ts` | API実装モジュールのimport                        |
| 2. electronAPIオブジェクト追加     | `preload/index.ts` | electronAPIオブジェクトに新APIを追加             |
| 3. contextBridge.exposeInMainWorld | `preload/index.ts` | contextBridge経由でRendererに公開                |
| 4. non-isolatedフォールバック      | `preload/index.ts` | contextIsolation無効時のwindow直下フォールバック |

**参照**: [architecture-implementation-patterns.md - IPC ハンドラー登録パターン](./architecture-implementation-patterns.md)

**相互参照**: [06-known-pitfalls.md#P23 API二重定義の型管理](../../rules/06-known-pitfalls.md)（Preload API追加時の更新箇所分散に関する教訓）

---

#### 2. 並列Phase実行時のレビュータイミング

| 項目       | 内容                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 10（読み取り専用レビュー）が Phase 8-9（コード修正）と並列実行され、修正前のコードをレビューして MAJOR 判定を出した |
| **原因**   | コード修正を伴う Phase とコード読み取りの Phase を並列実行した                                                            |
| **解決策** | コード修正を伴う Phase と読み取りレビュー Phase の並列実行を避ける                                                        |
| **教訓**   | 並列実行する場合は修正前コードの可能性をレビュー結果に明記する                                                            |

**Phase並列実行の安全な組み合わせ**:

| 組み合わせ                            | 安全性 | 理由                                                           |
| ------------------------------------- | ------ | -------------------------------------------------------------- |
| Phase 1-3（要件・設計・レビュー）     | 安全   | 読み取り専用の仕様書作業                                       |
| Phase 4-7（テスト・実装・カバレッジ） | 注意   | コード変更あり、依存関係確認必須                               |
| Phase 8-9 + Phase 10                  | 危険   | リファクタリング中にレビューすると修正前コードを評価してしまう |
| Phase 11 + Phase 12                   | 安全   | 手動テストとドキュメントは独立                                 |

---

#### 3. IPC型定義の配置戦略

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| **課題**   | IpcResult<T> 型が Main 側（skillCreatorHandlers.ts）と Preload 側（skill-creator-api.ts）で重複定義された |
| **原因**   | IPC 通信の両端で同じ型を使用するが、共有パッケージに配置する判断が後回しになった                          |
| **解決策** | 未タスク UT-9B-H-001 として登録し、@repo/shared/types に型を配置する後日対応を計画                        |
| **教訓**   | IPC通信で両側から参照される型は最初から @repo/shared に配置すべき                                         |

**IPC型の配置判断基準**:

| 型の参照元                | 配置先                         | 例                             |
| ------------------------- | ------------------------------ | ------------------------------ |
| Main側のみ                | `apps/desktop/src/main/` 内    | 内部サービス型                 |
| Preload側のみ             | `apps/desktop/src/preload/` 内 | UI固有型                       |
| Main + Preload両方        | `packages/shared/src/`         | IpcResult<T>、共有レスポンス型 |
| Main + Preload + Renderer | `packages/shared/src/`         | ドメイン型（Skill、Agent等）   |

---

#### 4. artifacts.jsonのPhaseステータス管理

| 項目       | 内容                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase完了時に artifacts.json のステータスが自動更新されず、Phase 12 のみ completed で残りが pending だった |
| **原因**   | 各 Phase 完了時に artifacts.json のステータス更新が完了条件に含まれていなかった                            |
| **解決策** | 各 Phase 完了時に artifacts.json のステータス更新を完了条件チェックリストに追加                            |
| **教訓**   | Phase 完了時は成果物の作成だけでなく、artifacts.json のステータス更新も必須アクションとする                |

**相互参照**: [06-known-pitfalls.md#P4 documentation-changelogへの早期完了記載](../../rules/06-known-pitfalls.md)（ステータス管理の早期完了判定に関する教訓）

---

#### 5. Phase 12の暗黙的要件の見落とし

| 項目       | 内容                                                                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 12の成果物として仕様書に明示されていないが、P28対策としてスキルフィードバックレポートが必要だった。仕様書のチェックリストを完了しても、`.claude/rules/06-known-pitfalls.md` に記載されたP28への対処が漏れた |
| **原因**   | Phase 12仕様書のチェックリストが `06-known-pitfalls.md` のPhase 12関連項目（P1-P4, P25-P28）を参照していなかった                                                                                                  |
| **解決策** | Phase 12実行前に `06-known-pitfalls.md` のPhase 12関連項目（P1-P4, P25-P28）を全て確認するチェックステップを追加する。P28は仕様書テンプレートにTask 5として明示化すべき                                           |
| **教訓**   | Phase 12のチェックリストだけでなく、`06-known-pitfalls.md` のPhase 12関連Pitfallも完了条件に含める必要がある                                                                                                      |

**参照**: [06-known-pitfalls.md - P28](../../../rules/06-known-pitfalls.md)

**相互参照**: [06-known-pitfalls.md#P28 スキルフィードバックレポート未作成](../../rules/06-known-pitfalls.md)（Phase 12の暗黙的成果物に関する教訓）

---

#### 6. artifacts.jsonのPhase別ステータス更新忘れ

| 項目       | 内容                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | Phase 12エージェントがPhase 12のステータスのみをcompletedに更新し、Phase 1-11はpendingのまま放置された                         |
| **原因**   | 各Phaseの完了時にartifacts.jsonを更新する運用が確立されておらず、Phase 12エージェントが自Phase以外のステータスを確認しなかった |
| **解決策** | Phase 12仕様書の完了条件に「artifacts.jsonの全Phase（1-12）のステータスがcompletedであること」を明示する                       |
| **教訓**   | Phase 12はプロジェクト全体のステータス整合性を確認する最終チェックポイントとして機能させる                                     |

---

#### 7. 設計書と実装の乖離管理

| 項目       | 内容                                                                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | Phase 2設計書で詳細に定義されたZodスキーマ、sanitizeError関数、handleWithErrorBoundaryラッパーが実装されなかった。Phase 5で実装をシンプル化したが、設計書を更新しなかったため、最終レビューで「設計-実装乖離」として検出された |
| **原因**   | Phase 5（実装）で設計書の仕様を変更する判断をしたが、設計書（Phase 2成果物）を同時に更新しなかった                                                                                                                             |
| **解決策** | Phase 5（実装）で設計書の仕様を変更する場合は、同Phase内で設計書（Phase 2成果物）も更新する。「意図的なシンプル化」と「実装漏れ」を区別するため、変更理由をPhase 5成果物に記録する                                             |
| **教訓**   | 設計と実装の乖離は「意図的」であっても、設計書を更新しなければ後続レビューで「実装漏れ」と区別できない                                                                                                                         |

**設計変更時の記録フォーマット**:

| 項目           | 記載内容                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| 変更対象       | 設計書のどの仕様を変更したか                                             |
| 変更理由       | シンプル化、パフォーマンス最適化、スコープ縮小 等                        |
| 変更種別       | 「意図的なシンプル化」「スコープ外として後日対応」「不要と判断して削除」 |
| 未タスク化要否 | 後日対応が必要な場合は未タスクとして登録                                 |

**相互参照**: 将来 06-known-pitfalls.md に P33（設計-実装乖離管理）として追加予定。現時点では本教訓が正本。

---

#### 8. 複数エージェント並列実行時のシステム仕様書更新漏れ

| 項目       | 内容                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 12エージェントが一部のシステム仕様書（api-ipc-agent.md, security-electron-ipc.md, architecture-overview.md）への更新を漏らした。後続の品質レビューで発見・追加修正が必要になった |
| **原因**   | IPC機能開発時に更新すべきシステム仕様書の一覧が明示されておらず、エージェントが一部ファイルの存在を認識していなかった                                                                  |
| **解決策** | Phase 12仕様書に「IPC機能開発時の更新対象ファイル一覧」を追加する。最低限の更新対象として以下を明記する                                                                                |
| **教訓**   | IPC機能開発では影響範囲が広く、更新対象ファイルが多い。チェックリストによる漏れ防止が必須                                                                                              |

**IPC機能開発時の最低限の更新対象ファイル一覧**:

| ファイル                                  | 更新内容                                               |
| ----------------------------------------- | ------------------------------------------------------ |
| `api-ipc-agent.md`                        | IPCチャンネル定義、ハンドラー仕様の追加・更新          |
| `security-electron-ipc.md`                | セキュリティ層（ホワイトリスト、バリデーション）の記録 |
| `architecture-overview.md`                | アーキテクチャ図、コンポーネント構成の更新             |
| `interfaces-agent-sdk-skill.md`           | 型定義、インターフェース変更の記録                     |
| `task-workflow.md`                        | 完了タスク記録、残課題テーブル更新                     |
| `lessons-learned.md`                      | 苦戦箇所と教訓の記録                                   |
| `architecture-implementation-patterns.md` | 新規実装パターンの追加                                 |

---

#### 9. 返却仕様文言・完了済み未タスク配置・artifacts最終整合

| 項目       | 内容                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | UT-9B-H-003完了後、(1) 仕様書のエラーメッセージ文言が実装と不一致、(2) 完了済み未タスク指示書が `unassigned-task/` に残置、(3) `artifacts.json` のPhase完了状態の更新漏れが発生した        |
| **原因**   | Phase 12で「仕様記述」「未タスク管理」「成果物レジストリ管理」を別管理していたため、最終突合が弱かった                                                                                     |
| **解決策** | 1) `security-electron-ipc.md` / `api-ipc-agent.md` を実装準拠に更新、2) 完了済み指示書を `completed-tasks/unassigned-task/` へ移管、3) `artifacts.json` の phase-1〜12 を completed に統一 |
| **教訓**   | Phase 12の完了判定は「ドキュメント更新」「未タスク配置整合」「artifacts整合」の3点を必須同時チェックにする                                                                                 |

**最終整合チェック（再発防止）**:

| チェック項目     | 確認内容                                               |
| ---------------- | ------------------------------------------------------ |
| 返却仕様文言整合 | 仕様書のエラー文言が実装値と一致しているか             |
| 未タスク配置整合 | 完了済み未タスクが `unassigned-task/` に残っていないか |
| artifacts整合    | phase-1〜12 の status が `completed` か                |

**関連更新**:

| ファイル                   | 更新内容                                  |
| -------------------------- | ----------------------------------------- |
| `security-electron-ipc.md` | v1.3.1: 返却仕様を実装準拠へ更新          |
| `api-ipc-agent.md`         | v1.7.0: セキュリティ強化仕様追記          |
| `task-workflow.md`         | v1.30.2: 完了済み未タスク指示書の移管反映 |

---

### 成果物

| 成果物             | パス                                                               |
| ------------------ | ------------------------------------------------------------------ |
| IPCハンドラー      | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                |
| Preload API        | `apps/desktop/src/preload/skill-creator-api.ts`                    |
| ホワイトリスト更新 | `apps/desktop/src/preload/channels.ts`                             |
| Preload統合        | `apps/desktop/src/preload/index.ts`                                |
| ハンドラーテスト   | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.test.ts` |
| Preload APIテスト  | `apps/desktop/src/preload/__tests__/skill-creator-api.test.ts`     |

### 関連ドキュメント更新

| ドキュメント                                                                         | 更新内容                                    |
| ------------------------------------------------------------------------------------ | ------------------------------------------- |
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | IPC ハンドラー登録パターン（Pattern 3）追加 |
| [06-known-pitfalls.md](../../../rules/06-known-pitfalls.md)                          | Preload統合漏れ、並列Phase実行の教訓        |

---

