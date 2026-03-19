# Agent SDK Skill 仕様 / core specification

> 親仕様書: [interfaces-agent-sdk-skill.md](interfaces-agent-sdk-skill.md)
> 役割: core specification

## 概要

Skill Dashboard、SkillImportStore、ModifierSkillに関する型定義とAPI仕様。
スキル管理UI実装時に参照する。

---

## Skill Dashboard 型定義（AGENT-002）

Agent Dashboard機能で使用する型定義。Claude Agent SDKとは独立した、スキル管理用の型。
AGENT-002タスクで実装されたスキル管理UI機能の完全な仕様を定義する。

### 実装ファイル

| ファイル                                                | 説明                       |
| ------------------------------------------------------- | -------------------------- |
| `packages/shared/src/types/skill.ts`                    | Skill型定義（共有）        |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`  | Zustand状態管理            |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`   | メインビュー               |
| `apps/desktop/src/renderer/views/AgentView/components/` | UIコンポーネント群         |
| `apps/desktop/src/main/skill/skill-handler.ts`          | Main Process IPCハンドラー |
| `apps/desktop/src/preload/skill-api.ts`                 | Preload API（統一SkillAPI） |

---

### 完了タスク

#### TASK-FIX-5-1-SKILL-API-UNIFICATION（2026-02-06完了）

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| タスクID   | TASK-FIX-5-1                                                          |
| ステータス | **完了**                                                              |
| テスト数   | 210（自動）+ 15（手動チェック項目）                                   |
| 主要変更   | SkillAPI二重定義の統一（`window.skillAPI`廃止→`window.electronAPI.skill`一本化） |
| 実装ガイド | `docs/30-workflows/completed-tasks/TASK-FIX-5-1-SKILL-API-UNIFICATION/outputs/phase-12/implementation-guide.md` |
| 備考       | AgentViewの型アサーション（`as unknown as Skill[]`）はUT-FIX-5-1-001で継続管理 |

#### UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH（2026-02-10完了）

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| タスクID   | UT-FIX-5-4                                                            |
| ステータス | **完了**                                                              |
| テスト数   | 24（自動）+ 22（手動チェック項目）                                    |
| 主要変更   | AgentSDKAPI abort()型定義修正（`void` → `Promise<void>`）             |
| 変更対象   | `packages/shared/src/agent/types.ts`, `apps/desktop/src/preload/types.ts` |
| 実装ガイド | `docs/30-workflows/UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH/outputs/phase-12/implementation-guide.md` |
| 備考       | P23パターン（API二重定義の型管理）準拠で2箇所同時更新                 |

#### TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION（2026-02-11完了）

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| タスクID   | TASK-FIX-7-1                                                          |
| ステータス | **完了**                                                              |
| テスト数   | 61（自動: ユニット51件 + 統合10件）                                   |
| 主要変更   | SkillService.executeSkill() の SkillExecutor 委譲実装                 |
| 変更対象   | `apps/desktop/src/main/services/skill/SkillService.ts`, `apps/desktop/src/main/ipc/skillHandlers.ts` |
| 実装ガイド | `docs/30-workflows/TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION/outputs/phase-12/implementation-guide.md` |
| 備考       | Setter Injection パターン採用（BrowserWindow 依存による遅延初期化）。未タスク3件（UT-FIX-7-1-001/002/003）検出 |

#### UT-FIX-AGENTVIEW-INFINITE-LOOP-001（2026-02-12完了）

| 項目       | 内容 |
| ---------- | ---- |
| タスクID   | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| ステータス | **完了** |
| テスト数   | 53（全PASS） |
| 主要変更   | AgentViewのインラインセレクタ廃止、個別セレクタHook移行、ローカルfetchSkills削除 |
| 変更対象   | `apps/desktop/src/renderer/views/AgentView/index.tsx`, `apps/desktop/src/renderer/store/index.ts` |
| 実装ガイド | `docs/30-workflows/completed-tasks/UT-FIX-AGENTVIEW-INFINITE-LOOP-001/outputs/phase-12/implementation-guide.md` |
| 備考       | P31対策の適用範囲をSettings/LLM/SkillSelectorからAgentViewへ拡張 |

#### TASK-FIX-13-1-DEPRECATED-PROPERTY-MIGRATION（2026-02-13完了）

| 項目       | 内容 |
| ---------- | ---- |
| タスクID   | TASK-FIX-13-1 |
| ステータス | **完了** |
| テスト数   | 1（型定義回帰テスト新規） |
| 主要変更   | `Anchor.name` と `Skill.lastUpdated` のdeprecatedプロパティを削除 |
| 変更対象   | `packages/shared/src/types/skill.ts`, `docs/30-workflows/completed-tasks/skill-management-ui/outputs/phase-11/detail-panel-check.md` |
| 実装ガイド | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/06b-task-fix-13-1-deprecated-property-migration.md` |
| 備考       | `SkillImportConfig.lastUpdated` は永続化互換のため維持 |
| 検出未タスク | [UT-TYPE-DATETIME-DOC-001](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-type-datetime-doc-001-datetime-representation-guide.md) 型日時表現ガイドライン策定 |

#### UT-FIX-IPC-RESPONSE-UNWRAP-001（2026-02-14完了）

| 項目       | 内容 |
| ---------- | ---- |
| タスクID   | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| ステータス | **完了** |
| テスト数   | 25（新規）+ 既存回帰テストPASS |
| 主要変更   | `safeInvokeUnwrap<T>` 追加、`list/getImported/rescan` の IPC ラッパー展開を Preload 側へ統一 |
| 変更対象   | `apps/desktop/src/preload/skill-api.ts`, `apps/desktop/src/preload/__tests__/skill-api.unwrap.test.ts` |
| 実装ガイド | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/implementation-guide.md` |
| 備考       | `import()` は SKILL_IMPORT が直接返却のため `safeInvoke` 維持 |
| 検出未タスク | [UT-FIX-IPC-RESPONSE-UNWRAP-002](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-fix-ipc-response-unwrap-002-phase10-spec-alignment.md), [UT-FIX-IPC-RESPONSE-UNWRAP-003](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-fix-ipc-response-unwrap-003-safeinvokeunwrap-type-guard.md) |

#### TASK-9A-B-IPC-FILE-HANDLERS（2026-02-19完了）

| 項目       | 内容 |
| ---------- | ---- |
| タスクID   | TASK-9A-B |
| ステータス | **完了** |
| テスト数   | 65（全PASS） |
| カバレッジ | Line 91.14% / Branch 93.93% / Function 100% |
| 主要変更   | スキルファイル操作IPCハンドラー基盤6チャンネル追加（skill:readFile, skill:writeFile, skill:createFile, skill:deleteFile, skill:listBackups, skill:restoreBackup） |
| 変更対象   | `apps/desktop/src/main/ipc/skillFileHandlers.ts`, `apps/desktop/src/preload/skill-api.ts`, `packages/shared/src/ipc/channels.ts` |
| 実装ガイド | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/implementation-guide.md` |
| 備考       | validateIpcSender + 引数バリデーション + isKnownSkillFileErrorエラーサニタイズによる多層防御。SkillFileManagerのファイル操作をIPC経由でRendererから呼び出し可能にした |

#### UT-UI-05A-GETFILETREE-001（2026-03-03完了）

| 項目       | 内容 |
| ---------- | ---- |
| タスクID   | UT-UI-05A-GETFILETREE-001 |
| ステータス | **完了** |
| テスト数   | 155（関連テスト一式） |
| 主要変更   | `skill:getFileTree` 追加（Main/Preload/Renderer連携）、`SkillFileTreeNode[]` 契約へ統一 |
| 変更対象   | `skillFileHandlers.ts`, `SkillFileManager.ts`, `skill-api.ts`, `preload/types.ts`, `useFileTree.ts` |
| 実装ガイド | `docs/30-workflows/completed-tasks/getfiletree-ipc/outputs/phase-12/implementation-guide.md` |
| 備考       | `safeInvokeUnwrap` で `IpcResult<SkillFileTreeNode[]>` を展開し、Renderer は配列直接受け取りへ移行 |

##### UT-FIX-IPC-RESPONSE-UNWRAP-001 実装上の苦戦箇所・教訓

| 苦戦ポイント | 発生要因 | 解決策 | 再発防止 |
|--------------|----------|--------|----------|
| 仕様書の正本参照ミス | `api-ipc-skill.md` という非実在ファイル参照が混在 | `interfaces-agent-sdk-skill.md` を正本として参照統一し、topic-map再生成で索引同期 | 仕様書更新前に参照ファイル実在チェックを実施 |
| MINOR の未タスク化判断ブレ | M-1/M-2 を「軽微だから不要」と誤解しやすい | 2件を独立未タスク（002/003）として正式起票 | Phase 10 MINOR は必ず task-workflow 残課題へ登録する |
| 完了移管後のリンク不整合 | 元タスク移管後に unassigned 側リンクが残る | 完了タスク参照を completed-tasks 側へ更新 | 未タスクリンク検証を自動実行して参照切れを防止 |

##### TASK-FIX-13-1 実装上の苦戦箇所・教訓

| 苦戦ポイント | 発生要因 | 解決策 | 再発防止 |
|--------------|----------|--------|----------|
| `lastUpdated` の削除範囲の切り分け | `Skill.lastUpdated` 削除と `SkillImportConfig.lastUpdated`（永続化用）を同時に扱う必要があった | `Skill` のみを削除対象とし、`SkillImportConfig` は互換維持として明示的に残置した | 型定義削除時は「公開/永続化互換」境界を先に表で確認する |
| `name` 参照の誤検出リスク | `name` は汎用プロパティで、単純置換では他型へ誤適用する可能性があった | `Anchor` スコープの参照に限定し、`detail-panel-check.md` の該当箇所のみ `source` へ移行した | `grep` 後に型スコープを確認し、無差別置換を禁止する |
| 仕様とコードの同期漏れ | 型定義修正だけでは Phase 12 要件を満たせず、仕様側の追記が必要だった | 完了タスク記録・変更履歴・未タスク登録を `task-workflow.md` と同時更新した | Phase 12 で LOGS/SKILL/関連仕様を同時更新するチェックリストを適用する |

##### TASK-FIX-7-1 実装詳細

**Setter Injection による委譲アーキテクチャ**:

| ステップ | 処理 | 説明 |
|----------|------|------|
| 1 | `new SkillService()` | Facade サービス生成（skillExecutor は未設定） |
| 2 | `new SkillExecutor(mainWindow, undefined, authKeyService)` | 実行エンジン生成（mainWindow 依存 + AuthKeyService注入） |
| 3 | `skillService.setSkillExecutor(executor)` | Setter Injection で注入 |
| 4 | `skillService.executeSkill(skill, args)` | 内部で型変換後に `skillExecutor.execute()` に委譲 |

**型変換フロー**:

`SkillMetadata` は `Omit<Skill, "lastModified">` として定義されている。`executeSkill()` では以下の9フィールドを明示的にコピーする（`lastModified` は実行時メタデータとして不要なため除外）。

| Skill プロパティ | SkillMetadata プロパティ | 変換内容 |
|-----------------|-------------------------|----------|
| id | id | 一意識別子（同一） |
| name | name | スキル名（同一） |
| slug | slug | ディレクトリ名（同一） |
| description | description | 説明文（同一） |
| path | path | ファイルパス（同一） |
| triggers | triggers | トリガーキーワード（同一） |
| anchors | anchors | アンカー情報（同一） |
| allowedTools | allowedTools | 許可ツール（同一） |
| category | category | カテゴリ（同一） |
| lastModified | _(除外)_ | 実行時不要のため変換対象外 |

**関連ドキュメント**:

| ドキュメント | 説明 |
|--------------|------|
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | Setter Injection パターン詳細 |
| [interfaces-agent-sdk-executor.md](./interfaces-agent-sdk-executor.md) | SkillExecutor インターフェース仕様 |
| [lessons-learned.md](./lessons-learned.md) | 苦戦箇所3件記録 |

---

### TASK-FIX-5-1 実装詳細

#### 統一されたAPI構造

TASK-FIX-5-1により、SkillAPI は `window.electronAPI.skill` に一本化された。旧 `window.skillAPI` は完全に廃止され、全てのスキル関連IPC通信は `window.electronAPI.skill` 経由で行う。

| 項目 | 旧構成 | 新構成（統一後） |
|------|--------|------------------|
| Preload公開 | `window.skillAPI` + `window.electronAPI.skill` の二重定義 | `window.electronAPI.skill` のみ |
| contextBridge | 一部直接割り当て | 全て `exposeInMainWorld` 経由 |
| 戻り値型 | `OperationResult<T>` ラッパー | 直接型（`T` または `Promise<T>`） |

#### safeInvoke/safeOnセキュリティパターン

全てのIPC通信は `safeInvoke` / `safeOn` ヘルパー関数を経由し、ホワイトリスト検証を行う。

> **正本**: [architecture-implementation-patterns.md - SkillAPI統一パターン](./architecture-implementation-patterns.md#skillapi統一パターンtask-fix-5-1-2026-02-06実装)（チャンネル一覧、セキュリティ効果の詳細）

| パターン | 用途 | 検証内容 |
|----------|------|----------|
| `safeInvoke(channel, ...args)` | Renderer→Main リクエスト | `ALLOWED_INVOKE_CHANNELS` に含まれるか検証 |
| `safeOn(channel, callback)` | Main→Renderer イベント購読 | `ALLOWED_ON_CHANNELS` に含まれるか検証 |

**検証フロー**:

| ステップ | safeInvoke | safeOn |
|----------|------------|--------|
| 1 | チャンネルがホワイトリストに存在するか確認 | チャンネルがホワイトリストに存在するか確認 |
| 2 | 存在しない場合 `Promise.reject()` | 存在しない場合、空のクリーンアップ関数を返却 |
| 3 | 存在する場合 `ipcRenderer.invoke()` 実行 | 存在する場合 `ipcRenderer.on()` でリスナー登録 |
| 4 | - | クリーンアップ関数（`removeListener`）を返却 |

#### 統一API 13メソッド一覧

> **現行 canonical**: `skill:getDetail` / `skill:update` を含む 15 メソッド。見出し名は既存リンク互換のため維持。
> TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001（2026-03-19）で `getDetail` / `update` を追加。

| カテゴリ | メソッド | IPC方向 | 説明 |
|----------|----------|---------|------|
| **Skill実行** | `execute` | R→M | スキル実行開始（SkillExecutionRequest → SkillExecutionResponse） |
| | `onStream` | M→R | ストリーミングメッセージ購読 |
| | `abort` | R→M | 実行中断（executionId指定） |
| | `getExecutionStatus` | R→M | 実行ステータス取得 |
| | `onComplete` | M→R | 実行完了イベント購読 |
| | `onError` | M→R | 実行エラーイベント購読 |
| **Permission** | `onPermissionRequest` | M→R | 権限リクエスト購読（Main起点） |
| | `sendPermissionResponse` | R→M | 権限レスポンス送信 |
| **Skill管理** | `list` | R→M | 利用可能スキル一覧取得 |
| | `getImported` | R→M | インポート済みスキル取得 |
| | `getDetail` | R→M | スキル詳細取得 |
| | `rescan` | R→M | スキルディレクトリ再スキャン |
| | `import` | R→M | スキルインポート |
| | `update` | R→M | スキル更新 |
| | `remove` | R→M | スキル削除 |

#### 廃止されたもの

| 廃止対象 | 理由 | 代替 |
|----------|------|------|
| `window.skillAPI` | 二重定義による保守性低下 | `window.electronAPI.skill` |
| `OperationResult<T>` ラッパー（Preload層） | 冗長なラッパー、型情報の劣化 | 直接型 `T` を返却 |

**OperationResult残置について**: `packages/shared/src/types/skill.ts` の `OperationResult<T>` 定義自体は後方互換のため残置。Preload層では使用しないが、他モジュールでの参照に対応。

#### テスト結果

| カテゴリ | テスト数 | 結果 |
|----------|----------|------|
| skill-api.test.ts | 37 | PASS |
| skill-api.permission.test.ts | 30 | PASS |
| skillSlice.test.ts | 59 | PASS |
| SkillExecutor統合テスト | 12 | PASS |
| **合計** | **138** | **PASS** |

**カバレッジ**:

| ファイル | Statements | Branches | Functions | Lines |
|----------|------------|----------|-----------|-------|
| skill-api.ts | 91.23% | 85.71% | 100% | 91.23% |
| 平均 | **91%** | 86% | 100% | 91% |

#### 関連ドキュメント

| ドキュメント | 説明 |
|--------------|------|
| [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) | SkillAPI統一パターン詳細 |
| [security-skill-ipc.md](./security-skill-ipc.md) | safeInvoke/safeOnセキュリティ詳細 |
| [実装ガイド](../../../../docs/30-workflows/TASK-FIX-5-1-SKILL-API-UNIFICATION/outputs/phase-12/implementation-guide.md) | 概念説明 + 技術詳細 |

---

### アーキテクチャ

Skill Dashboard機能は、Electron標準の3レイヤー構成で実装される。

#### レイヤー構成

| レイヤー         | 責務                               | 主要コンポーネント                 |
| ---------------- | ---------------------------------- | ---------------------------------- |
| Renderer Process | UI表示・ユーザー操作の受付         | AgentView、SkillList、SkillCard等  |
| Main Process     | ビジネスロジック・ファイルシステム | skill-handler.ts、skill-service.ts |
| File System      | スキルファイルの永続化             | `.claude/skills/**/*.md`           |

#### 通信フロー

| 段階 | 送信元           | 送信先        | 通信手段                 | 説明                     |
| ---- | ---------------- | ------------- | ------------------------ | ------------------------ |
| 1    | UIコンポーネント | Preload API   | 関数呼び出し             | ユーザー操作をトリガー   |
| 2    | Preload API      | Main Process  | IPC（contextBridge経由） | `skill:*` チャンネル使用 |
| 3    | skill-handler    | skill-service | 直接呼び出し             | ビジネスロジック実行     |
| 4    | skill-service    | File System   | Node.js fs API           | スキルファイル読み書き   |

#### Renderer Process コンポーネント

| コンポーネント      | 役割                   | 配置             |
| ------------------- | ---------------------- | ---------------- |
| AgentView           | メインビュー・状態管理 | 常時表示         |
| SkillSearchBar      | 検索フィルター         | ヘッダー領域     |
| SkillCategoryFilter | カテゴリ選択           | ヘッダー領域     |
| SkillList           | スキル一覧表示         | メイン領域       |
| SkillCard           | 個別スキル表示         | SkillList内      |
| SkillDetailPanel    | 選択スキルの詳細表示   | サイドパネル     |
| SkillImportDialog   | インポートモーダル     | オーバーレイ表示 |

#### Main Process コンポーネント

| コンポーネント   | ファイル      | 責務                          |
| ---------------- | ------------- | ----------------------------- |
| skill-handler.ts | `main/skill/` | `skill:*` IPCチャンネルの処理 |
| skill-service.ts | `main/skill/` | スキルスキャン・解析ロジック  |

#### スキルファイル構成

スキル定義ファイルは `.claude/skills/` ディレクトリ配下に配置される。

| パターン                       | 説明               |
| ------------------------------ | ------------------ |
| `.claude/skills/*/SKILL.md`    | スキル定義ファイル |
| `.claude/skills/*/agents/*.md` | エージェント定義   |

---

### 型定義

#### Skill型

スキルの基本情報を表す。

| プロパティ    | 型              | 必須 | 説明               |
| ------------- | --------------- | ---- | ------------------ |
| `id`          | `string`        | ✓    | 一意識別子         |
| `name`        | `string`        | ✓    | スキル名           |
| `slug`        | `string`        | ✓    | URLスラッグ        |
| `description` | `string`        | ✓    | 説明文             |
| `path`        | `string`        | ✓    | スキルファイルパス |
| `triggers`    | `string[]`      | ✓    | トリガーキーワード |
| `anchors`     | `Anchor[]`      | ✓    | アンカー情報       |
| `category`    | `SkillCategory` | -    | カテゴリ（任意）   |
| `lastModified` | `Date`          | ✓    | 最終更新日時       |

#### Anchor型

スキルのアンカー情報（参照文献と適用方法）。

| プロパティ    | 型       | 必須 | 説明             |
| ------------- | -------- | ---- | ---------------- |
| `source`      | `string` | ✓    | 参照元（書籍等） |
| `application` | `string` | ✓    | 適用方法         |
| `purpose`     | `string` | ✓    | 目的             |

#### SkillCategory型

スキルのカテゴリを表す列挙型。

| 値              | 説明             |
| --------------- | ---------------- |
| `development`   | 開発関連         |
| `testing`       | テスト関連       |
| `documentation` | ドキュメント関連 |
| `workflow`      | ワークフロー関連 |
| `other`         | その他           |

#### AgentExecutionStatus型

エージェント実行状態を表す列挙型。

| 値          | 説明   |
| ----------- | ------ |
| `idle`      | 待機中 |
| `executing` | 実行中 |
| `completed` | 完了   |
| `error`     | エラー |
| `aborted`   | 中断   |

---

### Zustand状態管理（agentSlice）

Zustand Sliceパターンで実装された状態管理。

#### AgentState型

| プロパティ           | 型                      | 説明                         |
| -------------------- | ----------------------- | ---------------------------- |
| `skills`             | `Skill[]`               | インポート済みスキル一覧     |
| `availableSkills`    | `Skill[]`               | 利用可能なスキル一覧         |
| `importedSkillIds`   | `string[]`              | インポート済みスキルID       |
| `selectedSkill`      | `Skill \| null`         | 選択中のスキル               |
| `skillFilter`        | `string`                | 検索フィルター文字列         |
| `skillCategory`      | `SkillCategory \| null` | カテゴリフィルター           |
| `isImportDialogOpen` | `boolean`               | インポートダイアログ表示状態 |
| `toastMessage`       | `ToastMessage \| null`  | トースト通知                 |
| `executionStatus`    | `AgentExecutionStatus`  | 実行状態                     |
| `currentExecutionId` | `string \| null`        | 実行ID                       |
| `executionOutput`    | `string[]`              | 実行出力                     |
| `isLoading`          | `boolean`               | ローディング状態             |
| `error`              | `string \| null`        | エラーメッセージ             |

#### AgentActions型

| アクション              | 引数                              | 説明                   |
| ----------------------- | --------------------------------- | ---------------------- |
| `setSkills`             | `skills: Skill[]`                 | スキル一覧設定         |
| `setAvailableSkills`    | `skills: Skill[]`                 | 利用可能スキル設定     |
| `setImportedSkillIds`   | `ids: string[]`                   | インポート済みID設定   |
| `selectSkill`           | `skill: Skill \| null`            | スキル選択             |
| `setSkillFilter`        | `filter: string`                  | フィルター設定         |
| `setSkillCategory`      | `category: SkillCategory \| null` | カテゴリ設定           |
| `openImportDialog`      | -                                 | インポートダイアログ開 |
| `closeImportDialog`     | -                                 | インポートダイアログ閉 |
| `showToast`             | `message: ToastMessage`           | トースト表示           |
| `clearToast`            | -                                 | トーストクリア         |
| `setExecutionStatus`    | `status: AgentExecutionStatus`    | 実行状態設定           |
| `setCurrentExecutionId` | `id: string \| null`              | 実行ID設定             |
| `appendOutput`          | `output: string`                  | 出力追加               |
| `clearExecution`        | -                                 | 実行クリア             |
| `setLoading`            | `isLoading: boolean`              | ローディング設定       |
| `setError`              | `error: string \| null`           | エラー設定             |
| `resetAgentState`       | -                                 | 状態リセット           |

---
