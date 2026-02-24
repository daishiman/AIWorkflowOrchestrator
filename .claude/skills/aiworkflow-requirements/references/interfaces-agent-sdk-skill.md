# Agent SDK Skill 仕様

> 本ドキュメントは interfaces-agent-sdk.md の分割ファイルです。
> 親ファイル: interfaces-agent-sdk.md
> 管理: .claude/skills/aiworkflow-requirements/

---

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
| 検出未タスク | [UT-TYPE-DATETIME-DOC-001](../../../docs/30-workflows/unassigned-task/task-ut-type-datetime-doc-001-datetime-representation-guide.md) 型日時表現ガイドライン策定 |

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
| 検出未タスク | [UT-FIX-IPC-RESPONSE-UNWRAP-002](../../../docs/30-workflows/unassigned-task/task-ut-fix-ipc-response-unwrap-002-phase10-spec-alignment.md), [UT-FIX-IPC-RESPONSE-UNWRAP-003](../../../docs/30-workflows/unassigned-task/task-ut-fix-ipc-response-unwrap-003-safeinvokeunwrap-type-guard.md) |

#### TASK-9A-B-IPC-FILE-HANDLERS（2026-02-19完了）

| 項目       | 内容 |
| ---------- | ---- |
| タスクID   | TASK-9A-B |
| ステータス | **完了** |
| テスト数   | 65（全PASS） |
| カバレッジ | Line 91.14% / Branch 93.93% / Function 100% |
| 主要変更   | スキルファイル操作IPCハンドラー6チャンネル追加（skill:readFile, skill:writeFile, skill:createFile, skill:deleteFile, skill:listBackups, skill:restoreBackup） |
| 変更対象   | `apps/desktop/src/main/ipc/skillFileHandlers.ts`, `apps/desktop/src/preload/skill-api.ts`, `packages/shared/src/ipc/channels.ts` |
| 実装ガイド | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/implementation-guide.md` |
| 備考       | validateIpcSender + 引数バリデーション + isKnownSkillFileErrorエラーサニタイズによる多層防御。SkillFileManagerのファイル操作をIPC経由でRendererから呼び出し可能にした |

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
| 2 | `new SkillExecutor(mainWindow, authKeyService)` | 実行エンジン生成（mainWindow 依存） |
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
| | `rescan` | R→M | スキルディレクトリ再スキャン |
| | `import` | R→M | スキルインポート |
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

### IPC チャンネル（スキル管理）

| チャンネル                | 方向            | 説明                        | 戻り値                                |
| ------------------------- | --------------- | --------------------------- | ------------------------------------- |
| `skill:list-imported`     | Renderer → Main | インポート済みスキル取得    | `OperationResult<Skill[]>`            |
| `skill:list-available`    | Renderer → Main | 利用可能スキル取得          | `OperationResult<Skill[]>`            |
| `skill:import`            | Renderer → Main | スキルインポート            | `ImportedSkill`（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001で修正済み） |
| `skill:remove`            | Renderer → Main | スキル削除                  | `OperationResult<void>`               |
| `skill:get-detail`        | Renderer → Main | スキル詳細取得              | `OperationResult<Skill>`              |
| `skill:execute`           | Renderer → Main | スキル実行                  | `OperationResult<SkillRunResult>`     |
| `skill:abort`             | Renderer → Main | スキル実行中断              | `boolean`                             |
| `skill:get-status`        | Renderer → Main | 実行ステータス取得          | `ExecutionStatus \| null`             |
| `skill:analyze`           | Renderer → Main | スキル分析（TASK-9C）       | `OperationResult<SkillAnalysis>`      |
| `skill:improve`           | Renderer → Main | スキル改善（TASK-9C）       | `OperationResult<ImprovementResult>`  |
| `skill:optimize`          | Renderer → Main | プロンプト最適化（TASK-9C） | `OperationResult<OptimizationResult>` |
| `skill:optimize:variants` | Renderer → Main | バリアント生成（TASK-9C）   | `OperationResult<string[]>`           |
| `skill:optimize:evaluate` | Renderer → Main | プロンプト評価（TASK-9C）   | `OperationResult<PromptEvaluation>`   |

#### `skill:import` リクエスト契約（UT-FIX-SKILL-IMPORT-INTERFACE-001）

| 項目 | 契約 |
| ---- | ---- |
| 引数形式 | `skillName: string`（オブジェクトラップなし） |
| 変換処理 | Mainハンドラー内部で `skillService.importSkills([skillName])` に配列化 |
| バリデーション | `typeof skillName === "string"` かつ `skillName.trim() !== ""` |
| エラー | `VALIDATION_ERROR` / `"skillName must be a non-empty string"` |

#### `skill:remove` リクエスト契約（UT-FIX-SKILL-REMOVE-INTERFACE-001）

| 項目 | 契約 |
| ---- | ---- |
| 引数形式 | `skillName: string`（オブジェクトラップなし） |
| バリデーション | `typeof skillName === "string"` かつ `skillName.trim() !== ""` |
| エラー | `VALIDATION_ERROR` / `"skillName must be a non-empty string"` |

#### `skill:import` リクエスト契約（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001）

| 項目 | 契約 |
| ---- | ---- |
| 引数形式 | `skillName: string`（オブジェクトラップなし） |
| バリデーション | `typeof skillName === "string"` かつ `skillName.trim() !== ""` |
| 戻り値 | `ImportedSkill`（2ステップ変換: importSkills → getSkillByName） |
| エラー | `VALIDATION_ERROR` / `IMPORT_ERROR` |

#### `skill:import` 関連タスク（完了）

| タスクID | 概要 | ステータス | 完了日 |
| -------- | ---- | ---------- | ------ |
| UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 | skill:import 戻り値型不整合修正（ImportResult→ImportedSkill変換） | **完了** | 2026-02-21 |

#### skillHandlers 関連未タスク（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 Phase 12 検出）

| タスクID | 内容 | 優先度 | 指示書パス |
| -------- | ---- | ------ | ---------- |
| UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 | skill:ハンドラIPCレスポンス形式統一（{ success, data }ラッパー vs 直接型T混在解消） | 中 | `docs/30-workflows/unassigned-task/task-skill-ipc-response-consistency.md` |
| UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001 | skill:get-detail引数名ドリフト修正（P45: skillId→skillName統一） | 低 | `docs/30-workflows/unassigned-task/task-skill-getdetail-naming-drift.md` |
| ~~UT-FIX-SKILL-VALIDATION-CONSISTENCY-001~~ | ~~skill:ハンドラP42準拠バリデーション形式統一（UT-FIX-SKILL-VALIDATION-P42-001の補完）~~ | ~~中~~ | **完了: 2026-02-24** |
| ~~UT-FIX-SKILL-IMPORT-ID-MISMATCH-001~~ | ~~SkillImportDialog（organisms版）がskill.id（ハッシュ）を渡すためgetSkillByName失敗~~ | ~~高~~ | **完了: 2026-02-22** |

#### OperationResult型

スキル管理APIの統一戻り値型。成功/失敗を明確に区別する。

| プロパティ | 型        | 説明             |
| ---------- | --------- | ---------------- |
| `success`  | `boolean` | 成功/失敗フラグ  |
| `data`     | `T?`      | データ（成功時） |
| `error`    | `string?` | エラー（失敗時） |

#### SkillRunResult型

スキル実行の結果を表す型。

| プロパティ    | 型                      | 必須 | 説明                       |
| ------------- | ----------------------- | ---- | -------------------------- |
| `executionId` | `string`                | ✓    | 実行ID（UUID）             |
| `status`      | `'success' \| 'failed'` | ✓    | 実行ステータス             |
| `output`      | `string`                | -    | 実行出力（成功時）         |
| `error`       | `string`                | -    | エラーメッセージ（失敗時） |
| `startedAt`   | `Date`                  | ✓    | 実行開始時刻               |
| `completedAt` | `Date`                  | ✓    | 実行完了時刻               |

---

### Preload API（window.electronAPI.skill）

> **TASK-FIX-5-1実装ノート**: 旧 `window.skillAPI` から `window.electronAPI.skill` に統一。OperationResult ラッパーを廃止し、safeInvoke/safeOn パターンで直接型を返却。未タスク UT-FIX-5-1-001（AgentView型アサーション解消）が残存。

#### Skill実行API

##### execute

スキルを実行する。

| パラメータ | 型                      | 必須 | 説明             |
| ---------- | ----------------------- | ---- | ---------------- |
| `request`  | `SkillExecutionRequest` | ✓    | 実行リクエスト   |

**戻り値**: `Promise<SkillExecutionResponse>`

##### onStream

ストリーミングメッセージを購読する。

**シグネチャ**: `onStream: (callback: (message: SkillStreamMessage) => void) => () => void`

##### abort

実行中のスキルを中断する。

| パラメータ    | 型       | 必須 | 説明   |
| ------------- | -------- | ---- | ------ |
| `executionId` | `string` | ✓    | 実行ID |

**戻り値**: `Promise<void>`

##### getExecutionStatus

実行ステータスを取得する。

| パラメータ    | 型       | 必須 | 説明   |
| ------------- | -------- | ---- | ------ |
| `executionId` | `string` | ✓    | 実行ID |

**戻り値**: `Promise<ExecutionInfo | null>`

##### onComplete

スキル実行完了イベントを購読する。

**シグネチャ**: `onComplete: (callback: (data: { executionId: string }) => void) => () => void`

##### onError

スキル実行エラーイベントを購読する。

**シグネチャ**: `onError: (callback: (data: { executionId: string; error: string }) => void) => () => void`

#### Permission API（TASK-3-1-D + TASK-4-2）

##### onPermissionRequest

Main ProcessからのPermission要求をリッスンするリスナーを登録する。

**シグネチャ**: `onPermissionRequest: (callback: (request: SkillPermissionRequest) => void) => () => void`

##### sendPermissionResponse

Permission要求に対してユーザーの応答を送信する。

**シグネチャ**: `sendPermissionResponse: (response: SkillPermissionResponse) => Promise<{ success: boolean }>`

#### Skill管理API

##### list

利用可能なスキル一覧を取得する。

**戻り値**: `Promise<SkillMetadata[]>`

##### getImported

インポート済みのスキル一覧を取得する。

**戻り値**: `Promise<ImportedSkill[]>`

##### rescan

スキルディレクトリを再スキャンする。

**戻り値**: `Promise<SkillMetadata[]>`

##### import

スキルをインポートする。

| パラメータ  | 型       | 必須 | 説明     |
| ----------- | -------- | ---- | -------- |
| `skillName` | `string` | ✓    | スキル名 |

**戻り値**: `Promise<ImportedSkill>`

##### remove

スキルを削除する。

| パラメータ  | 型       | 必須 | 説明     |
| ----------- | -------- | ---- | -------- |
| `skillName` | `string` | ✓    | スキル名 |

**戻り値**: `Promise<void>`

---

### Permission型定義（TASK-3-1-D）

#### SkillPermissionRequest

| プロパティ    | 型                        | 必須 | 説明                       |
| ------------- | ------------------------- | ---- | -------------------------- |
| `executionId` | `string`                  | ✓    | 実行ID                     |
| `requestId`   | `string`                  | ✓    | リクエストID（応答時使用） |
| `toolName`    | `string`                  | ✓    | ツール名                   |
| `args`        | `Record<string, unknown>` | ✓    | サニタイズされた引数       |
| `reason`      | `string`                  | -    | ユーザー向け理由説明       |

#### SkillPermissionResponse

| プロパティ       | 型        | 必須 | 説明             |
| ---------------- | --------- | ---- | ---------------- |
| `requestId`      | `string`  | ✓    | リクエストID     |
| `approved`       | `boolean` | ✓    | 許可/拒否        |
| `rememberChoice` | `boolean` | -    | 選択を記憶するか |

---

### React Hooks（TASK-3-1-D）

#### useSkillPermission

Permission要求の状態管理とハンドラーを提供するカスタムフック。

**戻り値**:

| プロパティ          | 型                                  | 説明                   |
| ------------------- | ----------------------------------- | ---------------------- |
| `pendingPermission` | `SkillPermissionRequest \| null`    | 保留中の権限リクエスト |
| `handleApprove`     | `(rememberChoice: boolean) => void` | 許可ハンドラ           |
| `handleDeny`        | `(rememberChoice: boolean) => void` | 拒否ハンドラ           |

---

### UIコンポーネント

#### コンポーネント階層

AgentViewを親コンポーネントとして、各UIコンポーネントが階層構造で配置される。

| 親コンポーネント | 子コンポーネント    | 表示条件         | 説明                 |
| ---------------- | ------------------- | ---------------- | -------------------- |
| AgentView        | Header              | 常時             | タイトルと説明文     |
| AgentView        | SkillSearchBar      | 常時             | 検索入力フィールド   |
| AgentView        | SkillCategoryFilter | 常時             | カテゴリ選択ボタン群 |
| AgentView        | SkillList           | 常時             | スキル一覧コンテナ   |
| SkillList        | SkillCard           | 複数表示         | 個別スキルカード     |
| AgentView        | SkillDetailPanel    | スキル選択時     | 選択スキルの詳細情報 |
| AgentView        | SkillImportDialog   | ダイアログ表示時 | インポートモーダル   |
| AgentView        | Toast               | 通知時           | 操作結果の通知表示   |

#### コンポーネント仕様

| コンポーネント        | ファイル                                 | 責務                   |
| --------------------- | ---------------------------------------- | ---------------------- |
| `AgentView`           | `views/AgentView/index.tsx`              | メインビュー、状態管理 |
| `SkillList`           | `components/SkillList.tsx`               | スキル一覧表示         |
| `SkillCard`           | `components/SkillCard.tsx`               | スキルカード表示       |
| `SkillDetailPanel`    | `components/SkillDetailPanel.tsx`        | スキル詳細パネル       |
| `SkillImportDialog`   | `components/skill/SkillImportDialog.tsx` | インポートダイアログ   |
| `SkillSearchBar`      | `components/SkillSearchBar.tsx`          | 検索バー               |
| `SkillCategoryFilter` | `components/SkillCategoryFilter.tsx`     | カテゴリフィルター     |

---

### SkillImportManager 仕様

インポートされたスキルIDを管理し、`electron-store`経由で永続化するサービスクラス。

**実装ファイル**:

- Service: `apps/desktop/src/main/services/skill/SkillImportManager.ts`
- Test: `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.integration.test.ts`

#### API

| メソッド           | 引数              | 戻り値     | 説明                               |
| ------------------ | ----------------- | ---------- | ---------------------------------- |
| `addImportedId`    | `skillId: string` | `void`     | スキルIDを追加（重複チェック付き） |
| `removeImportedId` | `skillId: string` | `void`     | スキルIDを削除                     |
| `getImportedIds`   | -                 | `string[]` | 全スキルIDを取得                   |
| `hasImportedId`    | `skillId: string` | `boolean`  | 存在チェック                       |

---

## SkillImportStore（TASK-2B）

### 概要

インポートしたスキルの情報を永続化するストアサービス。electron-storeを使用してアプリケーション再起動後もデータを保持する。

**実装ファイル**:

- Store: `apps/desktop/src/main/settings/skillImportStore.ts`
- Test: `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts`

### スキーマ定義

| 型                  | 説明                 |
| ------------------- | -------------------- |
| `SkillStoreSchema`  | ストア全体のスキーマ |
| `ImportedSkillData` | インポート済みスキル |
| `SkillSettings`     | スキル個別設定       |
| `SkillCacheEntry`   | メタデータキャッシュ |

### API リファレンス

#### インポート管理

| メソッド       | シグネチャ                     | 説明                   |
| -------------- | ------------------------------ | ---------------------- |
| getImported    | `(): ImportedSkillData[]`      | 全インポート済みスキル |
| addImport      | `(skillName: string): void`    | スキルをインポート     |
| removeImport   | `(skillName: string): void`    | スキルを削除（冪等）   |
| exists         | `(skillName: string): boolean` | 存在確認               |
| updateLastUsed | `(skillName: string): void`    | 最終使用日時を更新     |

#### 権限管理

| メソッド                | シグネチャ                                              | 説明       |
| ----------------------- | ------------------------------------------------------- | ---------- |
| rememberPermission      | `(skillName, toolName, decision): void`                 | 権限を記憶 |
| getRememberedPermission | `(skillName, toolName): "allow" \| "deny" \| undefined` | 権限を取得 |

### SkillImportManager との違い

| 観点       | SkillImportManager   | SkillImportStore                             |
| ---------- | -------------------- | -------------------------------------------- |
| 責務       | スキルID一覧のみ管理 | メタデータ・設定・権限・キャッシュを包括管理 |
| 実装パス   | `services/skill/`    | `settings/`                                  |
| データ構造 | `string[]`（ID配列） | `Record<string, ImportedSkillData>`          |
| 設定管理   | なし                 | あり（SkillSettings）                        |
| 権限記憶   | なし                 | あり（rememberedPermissions）                |
| キャッシュ | なし                 | あり（SkillCacheEntry）                      |

---

## SkillSlice型定義（TASK-6-1）

Renderer Process側のスキル機能状態管理。Zustand StateCreatorパターンで実装。

### 実装ファイル

| ファイル                 | パス                                                     | 説明            |
| ------------------------ | -------------------------------------------------------- | --------------- |
| `skillSlice.ts`          | `apps/desktop/src/renderer/store/slices/skillSlice.ts`   | Slice定義       |
| `setupSkillListeners.ts` | `apps/desktop/src/renderer/store/setupSkillListeners.ts` | IPCリスナー設定 |

### SkillSliceインターフェース

SkillSliceは状態（14項目）、アクション（10項目）、内部ハンドラー（4項目）で構成される。

#### 状態プロパティ

| プロパティ           | 型                               | 説明                     |
| -------------------- | -------------------------------- | ------------------------ |
| `availableSkills`    | `SkillMetadata[]`                | 利用可能なスキル一覧     |
| `importedSkills`     | `ImportedSkill[]`                | インポート済みスキル一覧 |
| `selectedSkillName`  | `string \| null`                 | 選択中のスキル名         |
| `isExecuting`        | `boolean`                        | 実行中フラグ             |
| `executionId`        | `string \| null`                 | 現在の実行ID             |
| `executionStatus`    | `SkillExecutionStatus \| null`   | 実行ステータス           |
| `streamingMessages`  | `SkillStreamMessage[]`           | ストリーミングメッセージ |
| `pendingPermission`  | `SkillPermissionRequest \| null` | 保留中の権限リクエスト   |
| `skillError`         | `string \| null`                 | エラー情報               |
| `isLoadingSkills`    | `boolean`                        | スキル一覧読み込み中     |
| `isScanning`         | `boolean`                        | スキルスキャン中         |
| `isImporting`        | `boolean`                        | スキルインポート中       |
| `importingSkillName` | `string \| null`                 | インポート中のスキル名   |

#### アクション

| アクション               | シグネチャ                                        | 説明                           |
| ------------------------ | ------------------------------------------------- | ------------------------------ |
| `fetchSkills`            | `() => Promise<void>`                             | スキル一覧取得                 |
| `rescanSkills`           | `() => Promise<void>`                             | スキル再スキャン               |
| `importSkill`            | `(skillName: string) => Promise<void>`            | スキルインポート               |
| `removeSkill`            | `(skillName: string) => Promise<void>`            | スキル削除                     |
| `selectSkill`            | `(skillName: string \| null) => void`             | スキル選択                     |
| `executeSkill`           | `(prompt: string) => Promise<void>`               | スキル実行                     |
| `abortExecution`         | `() => void`                                      | 実行中断                       |
| `respondToPermission`    | `(approved: boolean, remember?: boolean) => void` | 権限リクエスト応答             |
| `clearError`             | `() => void`                                      | エラークリア                   |
| `clearStreamingMessages` | `() => void`                                      | ストリーミングメッセージクリア |

#### 内部ハンドラー

IPCイベントを受信して状態を更新する。`_`プレフィックスは内部用を示す。

| ハンドラー                 | シグネチャ                                     | 用途               |
| -------------------------- | ---------------------------------------------- | ------------------ |
| `_handleStreamMessage`     | `(msg: SkillStreamMessage) => void`            | ストリーム受信処理 |
| `_handleComplete`          | `(executionId: string) => void`                | 実行完了処理       |
| `_handleError`             | `(executionId: string, error: string) => void` | エラー処理         |
| `_handlePermissionRequest` | `(req: SkillPermissionRequest) => void`        | 権限リクエスト受信 |

### 関連型定義

SkillSliceで使用する型は`packages/shared/src/types/skill.ts`で定義。

| 型                       | 説明                     |
| ------------------------ | ------------------------ |
| `SkillMetadata`          | スキルメタデータ         |
| `ImportedSkill`          | インポート済みスキル情報 |
| `SkillExecutionStatus`   | 実行ステータス列挙型     |
| `SkillStreamMessage`     | ストリーミングメッセージ |
| `SkillPermissionRequest` | 権限リクエスト           |

### セレクター

useAppStoreから専用セレクターを提供。

| セレクター      | 説明                                |
| --------------- | ----------------------------------- |
| `useSkillStore` | SkillSlice全体を取得（shallow比較） |

### テストカバレッジ

| カテゴリ     | テスト数 | ファイル                              |
| ------------ | -------- | ------------------------------------- |
| 基本機能     | 59       | `skillSlice.test.ts`                  |
| エッジケース | 16       | `skillSlice.edge-cases.test.ts`       |
| 状態遷移     | 17       | `skillSlice.state-transition.test.ts` |
| IPC連携      | 14       | `skillSlice.ipc.test.ts`              |
| 統合テスト   | 7        | `skillSlice.integration.test.ts`      |
| **合計**     | **113**  |                                       |

---

## ModifierSkill（スライド逆同期機能）

### 概要

スライドプレゼンテーション機能において、Reveal.js HTML（index.html）の変更をstructure.md（構造定義ファイル）に逆同期する機能。

**実装ファイル**:

- `apps/desktop/src/main/slide/modifier-skill.ts` - ModifierSkill実行ロジック
- `apps/desktop/src/main/slide/agent-client.ts` - Agent SDK通信クライアント
- `apps/desktop/src/main/slide/skill-executor.ts` - スキル実行オーケストレーション
- `apps/desktop/src/main/slide/sync-manager.ts` - 同期管理

### 型定義

| 型                    | 説明       |
| --------------------- | ---------- |
| `ModifierSkillInput`  | スキル入力 |
| `ModifierSkillOutput` | スキル出力 |
| `StructureChange`     | 変更情報   |
| `SyncStatus`          | 同期状態   |
| `SyncDirection`       | 同期方向   |

### IPC チャンネル（スライド同期）

| チャンネル            | 方向            | 説明               |
| --------------------- | --------------- | ------------------ |
| `slide:sync-status`   | Main → Renderer | 同期状態通知       |
| `slide:sync-progress` | Main → Renderer | 同期進捗通知       |
| `slide:reverse-sync`  | Renderer → Main | 逆同期手動トリガー |
| `slide:sync-error`    | Main → Renderer | 同期エラー通知     |

---

## ChatPanel統合（TASK-7D）

### 概要

ChatPanelは、既存チャット機能にスキル関連コンポーネントを統合する統括コンポーネントである。

### 統合コンポーネント一覧

| コンポーネント     | ファイルパス                              | 統合方式             |
| ------------------ | ----------------------------------------- | -------------------- |
| SkillSelector      | `components/skill/SkillSelector.tsx`      | 直接レンダー         |
| SkillStreamingView | `components/skill/SkillStreamingView.tsx` | 条件付きレンダー     |
| SkillImportDialog  | `components/skill/SkillImportDialog.tsx`  | ローカルstate制御    |
| PermissionDialog   | `components/skill/PermissionDialog.tsx`   | Store-directパターン |

### ChatPanel公開インターフェース

| 名前              | 種別      | 説明                                                      |
| ----------------- | --------- | --------------------------------------------------------- |
| `ChatPanelProps`  | type      | `{ onImportRequest?: (skill: SkillMetadata) => void }`    |
| `ChatPanelHandle` | type      | `{ handleImportRequest: (skill: SkillMetadata) => void }` |
| `ChatPanel`       | component | `forwardRef<ChatPanelHandle, ChatPanelProps>`             |

### Store依存（useAppStore）

| セレクタ               | 用途                     |
| ---------------------- | ------------------------ |
| `selectedSkillName`    | 選択中スキル名           |
| `streamingMessages`    | ストリーミングメッセージ |
| `isExecuting`          | 実行中フラグ             |
| `skillExecutionStatus` | 実行ステータス           |
| `fetchSkills`          | スキル一覧取得アクション |

---

## SkillFileManager（TASK-9A-A）

### 概要

スキルファイルのCRUD操作を提供するサービスクラス。スキルディレクトリ内のファイル読み書き、バックアップ、復元機能を実装する。

**実装ファイル**:

- Service: `apps/desktop/src/main/services/skill/SkillFileManager.ts`
- Errors: `apps/desktop/src/main/services/skill/errors.ts`
- Tests: `apps/desktop/src/main/services/skill/__tests__/SkillFileManager.*.test.ts`

### 対応ディレクトリ

| ディレクトリ            | 権限         | 説明               |
| ----------------------- | ------------ | ------------------ |
| `~/.aiworkflow/skills/` | 読み書き可   | ユーザー作成スキル |
| `~/.claude/skills/`     | 読み取り専用 | Claude公式スキル   |

### 型定義

#### SkillFileManagerOptions

| プロパティ            | 型       | 必須 | 説明                                                      |
| --------------------- | -------- | ---- | --------------------------------------------------------- |
| `aiworkflowSkillsDir` | `string` | -    | カスタムディレクトリ（デフォルト: ~/.aiworkflow/skills/） |
| `claudeSkillsDir`     | `string` | -    | カスタムディレクトリ（デフォルト: ~/.claude/skills/）     |

#### BackupInfo

| プロパティ     | 型                      | 説明                             |
| -------------- | ----------------------- | -------------------------------- |
| `filename`     | `string`                | バックアップファイル名           |
| `relativePath` | `string`                | スキルディレクトリからの相対パス |
| `originalPath` | `string`                | 元ファイルのパス                 |
| `type`         | `'backup' \| 'deleted'` | バックアップ種別                 |
| `timestamp`    | `number`                | タイムスタンプ（ミリ秒）         |
| `createdAt`    | `Date`                  | 作成日時                         |

### API

| メソッド        | シグネチャ                                                                    | 説明             |
| --------------- | ----------------------------------------------------------------------------- | ---------------- |
| `readFile`      | `(skillName: string, relativePath: string) => Promise<string>`                | ファイル読み込み |
| `writeFile`     | `(skillName: string, relativePath: string, content: string) => Promise<void>` | ファイル書き込み |
| `createFile`    | `(skillName: string, relativePath: string, content: string) => Promise<void>` | ファイル作成     |
| `deleteFile`    | `(skillName: string, relativePath: string) => Promise<void>`                  | ファイル削除     |
| `listBackups`   | `(skillName: string) => Promise<BackupInfo[]>`                                | バックアップ一覧 |
| `restoreBackup` | `(skillName: string, backupPath: string) => Promise<void>`                    | バックアップ復元 |
| `isReadonly`    | `(skillName: string) => Promise<boolean>`                                     | 読み取り専用判定 |

### エラークラス

| エラークラス         | エラーコード              | 発生条件                       |
| -------------------- | ------------------------- | ------------------------------ |
| `SkillNotFoundError` | `SKILL_NOT_FOUND`         | スキルディレクトリが存在しない |
| `ReadonlySkillError` | `READONLY_SKILL`          | 読み取り専用スキルへの書き込み |
| `PathTraversalError` | `PATH_TRAVERSAL_DETECTED` | パストラバーサル検出           |
| `FileExistsError`    | `FILE_ALREADY_EXISTS`     | createFile で既存ファイルあり  |
| `FileNotFoundError`  | `FILE_NOT_FOUND`          | 操作対象ファイルが存在しない   |

### バックアップ形式

| 操作     | ファイル名形式                   | 例                               |
| -------- | -------------------------------- | -------------------------------- |
| 書き込み | `{filename}.backup.{timestamp}`  | `guide.md.backup.1738500000000`  |
| 削除     | `{filename}.deleted.{timestamp}` | `guide.md.deleted.1738500000000` |

### セキュリティ

| 対策                 | 実装                                           |
| -------------------- | ---------------------------------------------- |
| パストラバーサル防止 | `validatePath()` で `../` パターンを検出・拒否 |
| 読み取り専用保護     | `~/.claude/skills/` への書き込みを全て拒否     |
| Nullバイト検証       | Nullバイトを含むパスは安全に処理               |

### テストカバレッジ

| カテゴリ           | テスト数 | ファイル                               |
| ------------------ | -------- | -------------------------------------- |
| ユニットテスト     | 50       | `SkillFileManager.test.ts`             |
| 統合テスト         | 21       | `SkillFileManager.integration.test.ts` |
| セキュリティテスト | 25       | `SkillFileManager.security.test.ts`    |
| エッジケーステスト | 41       | `SkillFileManager.edge.test.ts`        |
| **合計**           | **137**  |                                        |

---

## テストアーキテクチャ（TASK-8C-A）

### 概要

skillHandlers.ts の IPC統合テストは、Handler Map方式を採用し、Electron プロセスを起動せずにハンドラーロジックをテストする。テストファイルは `apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts` に配置される。

### テスト構成

| カテゴリ            | テスト数 | 検証対象                                                           |
| ------------------- | -------- | ------------------------------------------------------------------ |
| ハンドラー登録/解除 | 1        | registerSkillHandlers / unregisterSkillHandlers                    |
| 基本チャネルテスト  | 12       | list-available, list-imported, import, remove, get-detail, execute |
| 拡張チャネルテスト  | 2        | abort, get-status                                                  |
| エラーハンドリング  | 10       | 各チャネルの異常系                                                 |
| セキュリティ検証    | 2        | validateIpcSender失敗パス（abort, get-status）                     |
| エッジケース        | 4        | undefined引数、空配列、不正イベント等                              |
| IMP-002チャネル     | 10       | settings/permissions/cache（未実装パス）                           |

### 適用テストパターン

| パターン                  | 参照先                                                                                                     | 用途                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Handler Map方式           | [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) IPC通信テストパターン | ハンドラー関数の直接テスト            |
| SkillService Partial Mock | 同上                                                                                                       | 依存サービスの部分モック              |
| invokeOptionalHandler     | 同上                                                                                                       | IMP-002未実装チャネルの条件付きテスト |
| validateIpcSender失敗検証 | 同上                                                                                                       | セキュリティレイヤーの検証            |

### ヘルパー関数

テストファイル内に定義された再利用可能ヘルパー。

| 関数                                                  | 用途                              |
| ----------------------------------------------------- | --------------------------------- |
| `createMockIpcEvent(senderId?)`                       | モックIPCイベントオブジェクト生成 |
| `expectOperationSuccess(result, expectedData?)`       | OperationResult成功検証           |
| `expectOperationError(result, errorPattern?)`         | OperationResultエラー検証         |
| `invokeOptionalHandler(handlerMap, channel, ...args)` | 未実装チャネルの条件付き呼び出し  |

### テストデータ定数

| 定数                            | 型               | 用途                           |
| ------------------------------- | ---------------- | ------------------------------ |
| `EXPECTED_CHANNELS`             | `string[]`       | 登録されるべき全8チャネル名    |
| `MOCK_SKILL_A` / `MOCK_SKILL_B` | `Skill`          | スキルデータのFixture          |
| `MOCK_SCAN_RESULT`              | `ScanResult`     | スキャン結果Fixture            |
| `MOCK_EXECUTION_RESULT`         | `SkillRunResult` | 実行結果Fixture                |
| `MOCK_SETTINGS`                 | `object`         | IMP-002設定データFixture       |
| `MOCK_PERMISSIONS`              | `object`         | IMP-002権限データFixture       |
| `MOCK_CACHE_DATA`               | `object`         | IMP-002キャッシュデータFixture |

---

## 完了タスク

### TASK-FIX-1-1-TYPE-ALIGNMENT: スキル型定義の統一（2026-02-04完了）

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | TASK-FIX-1-1-TYPE-ALIGNMENT                      |
| 完了日       | 2026-02-04                                       |
| ステータス   | **完了**                                         |
| テスト数     | 49（自動テスト）                                 |
| 発見課題     | 0件                                              |
| ドキュメント | `docs/30-workflows/TASK-FIX-1-1-TYPE-ALIGNMENT/` |

#### テスト結果サマリー

| カテゴリ            | テスト数 | PASS | FAIL |
| ------------------- | -------- | ---- | ---- |
| Skill Metadata Types| 8        | 8    | 0    |
| Skill Execution Types| 5       | 5    | 0    |
| Skill Stream Message | 11      | 11   | 0    |
| Discriminated Union | 6        | 6    | 0    |
| Permission Types    | 5        | 5    | 0    |
| 移行型テスト        | 14       | 14   | 0    |

#### 主要成果

| 成果                    | 内容                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| 型統合                  | skill-execution.tsの6型+1定数をskill.tsに統合                        |
| BaseStreamMessage抽出   | Discriminated Unionの共通プロパティをDRY原則に基づき共通化           |
| import文更新            | 9ファイルのimport文を`skill-execution`→`skill`に統一                 |
| パッケージエクスポート削除 | package.json, tsup.config.tsからskill-executionエントリ削除        |

#### 成果物

| 成果物             | パス                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| 実装ガイド         | `docs/30-workflows/TASK-FIX-1-1-TYPE-ALIGNMENT/outputs/phase-12/implementation-guide.md` |
| テスト結果レポート | `docs/30-workflows/TASK-FIX-1-1-TYPE-ALIGNMENT/outputs/phase-11/manual-test-result.md`   |
| 未タスク検出       | `docs/30-workflows/TASK-FIX-1-1-TYPE-ALIGNMENT/outputs/phase-12/unassigned-task-detection.md` |

#### 関連ドキュメント

| ドキュメント                          | 説明                        |
| ------------------------------------- | --------------------------- |
| [実装ガイド](../../../../docs/30-workflows/TASK-FIX-1-1-TYPE-ALIGNMENT/outputs/phase-12/implementation-guide.md) | 概念的説明（中学生レベル）+ 技術詳細 |

#### 実装上の苦戦箇所・教訓

TASK-FIX-1-1-TYPE-ALIGNMENT実装で得られた知見。同様の課題に直面した際の参考として記録する。

##### 1. パッケージエクスポート更新漏れ

| 項目 | 内容 |
|------|------|
| 問題 | 型ファイル削除時、package.json/tsup.config.tsのエクスポート定義を更新し忘れる |
| 原因 | 型定義ファイルの削除に集中し、パッケージ設定への影響を見落とす |
| 解決策 | **削除前チェックリスト**: ①ファイル削除 → ②package.json exports確認 → ③tsup.config.ts entry確認 → ④index.ts再エクスポート確認 |
| 検証方法 | `grep -rn "削除対象ファイル名" packages/shared/` で参照残存確認 |

##### 2. 型定義ファイルのカバレッジ寄与

| 項目 | 内容 |
|------|------|
| 課題 | 型のみ定義するファイル（interface, type）はJavaScriptにトランスパイルされないためカバレッジに寄与しない |
| 認識 | Vitestのc8/istanbulは実行時コードのみカバレッジ計測 |
| 対策 | 型テストは**コンパイル成功＝テスト成功**として扱い、カバレッジ目標から除外 |
| テスト戦略 | `tsc --noEmit`による型チェック + ランタイムテストでの型ガード検証 |

##### 3. Discriminated UnionのDRY原則適用

| 項目 | 内容 |
|------|------|
| 課題 | Discriminated Unionの各バリアントに共通プロパティ（executionId, timestamp）が重複 |
| 解決策 | BaseStreamMessageインターフェースを抽出し、Intersection Type (`&`) で結合 |
| 利点 | 共通プロパティの一元管理、将来の共通プロパティ追加が容易 |
| 注意点 | TypeScript 4.1以降のIntersection Type最適化を活用 |

##### 4. import文一括置換の安全性

| 項目 | 内容 |
|------|------|
| 課題 | 複数ファイルのimport文を一括で変更する際の漏れ・誤変換リスク |
| 解決策 | ①Grep で対象ファイル特定 → ②1ファイルずつ手動確認 → ③typecheck実行で検証 |
| 禁止事項 | sed/awkによる一括置換は避ける（コンテキスト無視の誤変換リスク） |
| 推奨 | IDE のリファクタリング機能またはEdit tool での個別置換 |

---

### TASK-9C: スキル改善・自動修正機能（2026-02-03完了）

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | TASK-9C                                                 |
| 完了日       | 2026-02-03                                              |
| ステータス   | **完了**                                                |
| テスト数     | 83（自動テスト）+ 17（手動テスト項目）                  |
| 発見課題     | 3件（UI表示、改善履歴永続化、A/Bテスト）→将来タスク候補 |
| ドキュメント | `docs/30-workflows/TASK-9C-skill-improver/`             |

#### テスト結果サマリー

| カテゴリ                         | テスト数 | PASS | FAIL |
| -------------------------------- | -------- | ---- | ---- |
| SkillAnalyzer.test.ts            | 8        | 8    | 0    |
| SkillAnalyzer.additional.test.ts | 13       | 13   | 0    |
| SkillImprover.test.ts            | 10       | 10   | 0    |
| SkillImprover.additional.test.ts | 18       | 18   | 0    |
| PromptOptimizer.test.ts          | 11       | 11   | 0    |
| skillHandlers.improve.test.ts    | 18       | 18   | 0    |
| performance.test.ts              | 5        | 5    | 0    |

#### 主要成果

| 成果              | 内容                                                             |
| ----------------- | ---------------------------------------------------------------- |
| SkillAnalyzer     | 静的分析 + AI分析、スコアリング（0-100）、改善提案生成           |
| SkillImprover     | 改善適用、バックアップ/復元、エラーハンドリング                  |
| PromptOptimizer   | プロンプト最適化、バリアント生成、評価                           |
| IPCチャネル5種    | skill:analyze, skill:improve, skill:optimize, variants, evaluate |
| Graceful Fallback | SDK接続エラー時のサービス継続性                                  |

#### 成果物

| 成果物             | パス                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| 実装ガイド         | `docs/30-workflows/TASK-9C-skill-improver/outputs/phase-12/implementation-guide.md`      |
| テスト結果レポート | `docs/30-workflows/TASK-9C-skill-improver/outputs/phase-11/manual-test-result.md`        |
| 未タスク検出       | `docs/30-workflows/TASK-9C-skill-improver/outputs/phase-12/unassigned-task-detection.md` |

#### 実装課題と解決策

| 課題                     | 解決策                                                          | 参照                                     |
| ------------------------ | --------------------------------------------------------------- | ---------------------------------------- |
| SDK接続エラー時の処理    | `tryAgentSdkWithFallback<T>(fn, fallback)` で graceful fallback | `sdkUtils.ts`                            |
| テストでのSDKモック      | `queryFn` パラメータで DI（依存注入）可能に                     | `SkillAnalyzer.ts`, `PromptOptimizer.ts` |
| スキル名バリデーション   | 禁止文字リスト `<>:"\|?*` でサニタイズ                          | `SkillAnalyzer.ts`                       |
| ESModule モッキング制約  | SDK本体をモックせず `queryFn` を注入してテスト                  | `SkillAnalyzer.test.ts`                  |
| バックアップファイル管理 | 改善前に自動バックアップ、エラー時は自動復元                    | `SkillImprover.ts`                       |

#### 関連仕様書

| 仕様書                                    | 内容                                                  |
| ----------------------------------------- | ----------------------------------------------------- |
| `architecture-implementation-patterns.md` | SDK連携パターン（Fallback, DI, バリデーション）の詳細 |
| `arch-electron-services.md`               | サービス層コンポーネント構成                          |

---

### TASK-8C-B: スキル選択フローE2Eテスト（2026-02-02完了）

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-8C-B                      |
| 完了日       | 2026-02-02                     |
| ステータス   | **完了**                       |
| テスト数     | 8（自動テスト）                |
| 発見課題     | 0件                            |
| ドキュメント | `docs/30-workflows/TASK-8C-B/` |

#### テスト結果サマリー

| カテゴリ         | テスト数 | PASS | FAIL |
| ---------------- | -------- | ---- | ---- |
| 基本表示         | 2        | 2    | 0    |
| スキル選択       | 2        | 2    | 0    |
| キーボード操作   | 2        | 2    | 0    |
| アクセシビリティ | 2        | 2    | 0    |

#### 主要成果

| 成果                         | 内容                                                 |
| ---------------------------- | ---------------------------------------------------- |
| ARIA属性ベースセレクタ       | `role="combobox"`, `role="listbox"`, `role="option"` |
| キーボードナビゲーション検証 | ArrowDown, ArrowUp, Enter, Escape                    |
| E2Eヘルパー関数              | 操作シーケンスのDRY化                                |
| 安定性対策3層                | 明示的待機 + UI安定化 + DOMロード待機                |

#### 成果物

| 成果物             | パス                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| E2Eテストファイル  | `apps/desktop/src/__tests__/skillSelection.e2e.ts`                     |
| テスト結果レポート | `docs/30-workflows/TASK-8C-B/outputs/phase-11/manual-test-result.md`   |
| 実装ガイド         | `docs/30-workflows/TASK-8C-B/outputs/phase-12/implementation-guide.md` |

---

### TASK-8C-A: IPC統合テスト（2026-02-02完了）

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | TASK-8C-A                                               |
| 完了日       | 2026-02-02                                              |
| ステータス   | **完了**                                                |
| テスト数     | 41（自動テスト）+ 5（手動テスト項目）                   |
| 発見課題     | 2件（IMP-002チャネル未実装、permission:response未実装） |
| ドキュメント | `docs/30-workflows/TASK-8C-A/`                          |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS | FAIL |
| ------------------ | -------- | ---- | ---- |
| 機能テスト         | 23       | 23   | 0    |
| エラーハンドリング | 10       | 10   | 0    |
| セキュリティ       | 2        | 2    | 0    |
| エッジケース       | 5        | 5    | 0    |
| 登録/解除          | 1        | 1    | 0    |

#### 成果物

| 成果物             | パス                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/TASK-8C-A/outputs/phase-11/manual-test-result.md`   |
| 実装ガイド         | `docs/30-workflows/TASK-8C-A/outputs/phase-12/implementation-guide.md` |

---

## 関連ドキュメント

| ドキュメント                                                                                                                      | 説明                        |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| interfaces-agent-sdk.md                                                                                                           | 親ファイル（インデックス）  |
| ui-ux-components.md                                                                                                               | UIコンポーネント仕様        |
| [TASK-7B 実装ガイド](../../../../docs/30-workflows/TASK-7B-skill-import-dialog/outputs/phase-12/implementation-guide.md)          | SkillImportDialog実装詳細   |
| [TASK-7D 実装ガイド](../../../../docs/30-workflows/TASK-7D-chat-panel-integration/outputs/phase-12/implementation-guide-part2.md) | ChatPanel統合実装詳細       |
| [TASK-8C-A 実装ガイド](../../../../docs/30-workflows/TASK-8C-A/outputs/phase-12/implementation-guide.md)                          | IPC統合テスト実装詳細       |
| [TASK-8C-B 実装ガイド](../../../../docs/30-workflows/TASK-8C-B/outputs/phase-12/implementation-guide.md)                          | スキル選択E2Eテスト実装詳細 |

---

## SkillCreatorService（TASK-9B-G）

### 概要

スキル作成の統合サービス。Facadeパターンで複雑なスキル作成処理を統合し、Script First原則・Progressive Disclosure原則に基づいた設計を採用する。

**実装ファイル**:

| ファイル                 | パス                                                     | 説明                   |
| ------------------------ | -------------------------------------------------------- | ---------------------- |
| SkillCreatorService.ts   | `apps/desktop/src/main/services/skill/`                  | スキル作成統合サービス |
| ScriptExecutor.ts        | `apps/desktop/src/main/services/skill/`                  | スクリプト実行基盤     |
| ResourceLoader.ts        | `apps/desktop/src/main/services/skill/`                  | リソース遅延読み込み   |
| constants.ts             | `apps/desktop/src/main/services/skill/`                  | 定数定義               |
| skillCreator.ts          | `packages/shared/src/types/`                             | 型定義                 |

---

### 型定義

#### SkillCreatorMode

スキル作成モードを表す列挙型。

| 値               | 説明                               |
| ---------------- | ---------------------------------- |
| `collaborative`  | ユーザー対話型スキル共創（推奨）   |
| `orchestrate`    | 実行エンジン選択モード             |
| `create`         | 新規スキル作成                     |
| `update`         | 既存スキル更新                     |
| `improve-prompt` | プロンプト改善                     |

#### ExecutionEngine

実行エンジンを表す列挙型（orchestrateモード用）。

| 値               | 説明                           |
| ---------------- | ------------------------------ |
| `claude`         | Claude Codeで実行              |
| `codex`          | OpenAI Codexで実行             |
| `claude-to-codex`| Claudeで設計→Codexで実行       |

#### CreateSkillOptions

スキル作成オプション。

| プロパティ        | 型                  | 必須 | 説明                           |
| ----------------- | ------------------- | ---- | ------------------------------ |
| `name`            | `string`            | ✓    | スキル名（ディレクトリ名）     |
| `description`     | `string`            | ✓    | スキルの説明                   |
| `mode`            | `SkillCreatorMode`  | ✓    | 作成モード                     |
| `executionEngine` | `ExecutionEngine`   | -    | 実行エンジン（orchestrate時）  |
| `generateTasks`   | `boolean`           | -    | タスク仕様書を生成するか       |
| `interviewResult` | `InterviewResult`   | -    | インタビュー結果（collaborative時） |
| `domainModel`     | `DomainModel`       | -    | ドメインモデル（collaborative時） |

#### ScriptResult

スクリプト実行結果。

| プロパティ  | 型        | 説明                           |
| ----------- | --------- | ------------------------------ |
| `success`   | `boolean` | 実行成功フラグ（exitCode===0） |
| `stdout`    | `string`  | 標準出力                       |
| `stderr`    | `string`  | 標準エラー出力                 |
| `exitCode`  | `number`  | 終了コード                     |

#### ExecutionReport

タスク実行レポート。

| プロパティ      | 型                | 説明                     |
| --------------- | ----------------- | ------------------------ |
| `mode`          | `string`          | 実行モード（dry-run/execution） |
| `tasks`         | `string[][]`      | 実行順序（dry-run時）    |
| `results`       | `TaskResult[]`    | 実行結果（execution時）  |
| `summary`       | `ExecutionSummary`| サマリー                 |
| `estimatedTime` | `number`          | 見積もり時間（分）       |

---

### SkillCreatorService API

#### detectMode

ユーザーリクエストから適切なモードを判定する。

| パラメータ | 型       | 必須 | 説明               |
| ---------- | -------- | ---- | ------------------ |
| `request`  | `string` | ✓    | ユーザーリクエスト |

**戻り値**: `Promise<SkillCreatorMode>`

#### createSkill

スキルを作成する。

| パラメータ | 型                   | 必須 | 説明               |
| ---------- | -------------------- | ---- | ------------------ |
| `options`  | `CreateSkillOptions` | ✓    | スキル作成オプション |

**戻り値**: `Promise<string>` - 作成されたスキルディレクトリパス

#### executeTasks

タスクを依存関係順に実行する。

| パラメータ | 型                    | 必須 | 説明               |
| ---------- | --------------------- | ---- | ------------------ |
| `options`  | `ExecuteTasksOptions` | ✓    | タスク実行オプション |

**戻り値**: `Promise<ExecutionReport>`

#### validateSkill

スキルを検証する。

| パラメータ  | 型       | 必須 | 説明                   |
| ----------- | -------- | ---- | ---------------------- |
| `skillDir`  | `string` | ✓    | スキルディレクトリパス |

**戻り値**: `Promise<boolean>`

---

### ScriptExecutor API

Script First原則に基づき、決定論的処理をスクリプトに委譲する。

#### execute

スクリプトを実行し、結果を返す。

| パラメータ   | 型         | 必須 | 説明                             |
| ------------ | ---------- | ---- | -------------------------------- |
| `scriptName` | `string`   | ✓    | スクリプト名（例: detect_mode.js） |
| `args`       | `string[]` | ✓    | スクリプトに渡す引数             |

**戻り値**: `Promise<ScriptResult>`

**セキュリティ**: パストラバーサル防止（`..`, `/`, `\`を含むスクリプト名を拒否）

#### executeJson

JSON出力スクリプトを実行し、パースした結果を返す。

**戻り値**: `Promise<T>` - パースされたJSONオブジェクト

---

### ResourceLoader API

Progressive Disclosure原則に基づき、リソースを遅延読み込みする。

#### load

リソースを読み込む（キャッシュ優先）。

| パラメータ | 型                | 必須 | 説明                             |
| ---------- | ----------------- | ---- | -------------------------------- |
| `category` | `ResourceCategory`| ✓    | カテゴリ（agents/references/assets/schemas） |
| `name`     | `string`          | ✓    | リソース名（ファイル名）         |

**戻り値**: `Promise<string>`

#### loadAgent / loadSchema

ショートカットメソッド。

| メソッド     | 戻り値            | 説明                   |
| ------------ | ----------------- | ---------------------- |
| `loadAgent`  | `Promise<string>` | エージェントプロンプト |
| `loadSchema` | `Promise<object>` | JSONスキーマ           |

#### clearCache

キャッシュをクリアする。

---

### テストカバレッジ

| ファイル               | Statements | Branches | Functions | Lines  |
| ---------------------- | ---------- | -------- | --------- | ------ |
| ResourceLoader.ts      | 100%       | 100%     | 100%      | 100%   |
| ScriptExecutor.ts      | 100%       | 91.66%   | 100%      | 100%   |
| SkillCreatorService.ts | 94.59%     | 88.63%   | 100%      | 94.59% |

| テストファイル                          | テスト数 | 状態    |
| --------------------------------------- | -------- | ------- |
| ScriptExecutor.test.ts                  | 9        | ✅ PASS |
| ResourceLoader.test.ts                  | 9        | ✅ PASS |
| SkillCreatorService.test.ts             | 22       | ✅ PASS |
| SkillCreatorService.integration.test.ts | 10       | ✅ PASS |
| **合計**                                | **50**   | ✅ PASS |

---

### 実装上の苦戦箇所・教訓

TASK-9B-G実装で得られた知見。同様の課題に直面した際の参考として記録する。

#### 1. 未タスク登録漏れ（Phase 12）

| 項目 | 内容 |
|------|------|
| 問題 | 未タスク指示書を作成しても、task-workflow.mdの残課題テーブルへの登録を忘れやすい |
| 原因 | Phase 12の未タスク検出が「指示書作成」で完了と誤認しやすい |
| 解決策 | **3ステップ必須**: ①指示書作成 → ②task-workflow.md残課題テーブル登録 → ③関連仕様書への記載 |
| 検証方法 | Phase 12完了前にtask-workflow.mdの残課題テーブルを目視確認 |

#### 2. Script First + Progressive Disclosure統合設計

| 項目 | 内容 |
|------|------|
| 課題 | 決定論的処理（Script First）とリソース遅延読み込み（Progressive Disclosure）を同一サービスで統合する設計判断 |
| 解決策 | ScriptExecutorとResourceLoaderを独立クラスとして実装し、SkillCreatorService（Facade）で統合 |
| 利点 | 単一責任原則を維持しつつ、利用者には統一APIを提供 |
| テスト戦略 | 各コンポーネントを独立テスト後、統合テストでFacadeを検証 |

#### 3. 定数外部化のタイミング

| 項目 | 内容 |
|------|------|
| 課題 | タイムアウト値などのマジックナンバーがコード内に散在 |
| 原因 | Phase 5（実装）でハードコードし、Phase 8（リファクタリング）で外部化する2段階工程 |
| 教訓 | 12-Factor App準拠を意識し、Phase 5時点で定数ファイル（constants.ts）を作成すべき |
| 対策 | 新規サービス実装時は、定数定義ファイルを最初に作成するルールを適用 |

#### 4. パストラバーサル防止の実装箇所

| 項目 | 内容 |
|------|------|
| 課題 | セキュリティ対策（BC-003）をどのレイヤーで実装すべきか |
| 判断 | スクリプト名を受け取るScriptExecutor.execute()メソッド内で検証 |
| 理由 | 入力に最も近い場所で検証することで、バイパスリスクを低減 |
| 実装 | `..`, `/`, `\`を含むスクリプト名を拒否し、早期リターン |

---

### 関連ドキュメント

| ドキュメント | 説明 |
| ------------ | ---- |
| [TASK-9B-G 実装ガイド](../../../../docs/30-workflows/TASK-9B-G-skill-creator-service/outputs/phase-12/implementation-guide.md) | 概念的説明（中学生レベル）+ 技術詳細 |

---

## 完了タスク

### UT-FIX-SKILL-IMPORT-ID-MISMATCH-001: SkillImportDialog skill.id→skill.name修正（2026-02-22完了）

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001                                |
| 完了日       | 2026-02-22                                                           |
| ステータス   | **完了**                                                             |
| テスト数     | 49（SkillImportDialog）+ 3（AgentView統合）                         |
| ドキュメント | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/`   |

#### 変更ポイント

| 変更箇所 | 内容 |
| -------- | ---- |
| SkillImportDialog | `onImport(skill.id)` を `onImport(skill.name)` に変更。SHA-256ハッシュプレフィックスではなく人間可読名を渡すように修正 |
| AgentView | `handleImportSkill` の引数名を `skillId` → `skillName` に変更（P45準拠） |
| テスト | SkillImportDialogテスト49件（skill.name渡し検証追加）、AgentView統合テスト3件、全PASS |

#### 変更理由

- SkillImportDialogがskill.id（SHA-256ハッシュプレフィックス）をonImportに渡していたが、IPCハンドラ（skill:import）はskill.name（人間可読名）を期待
- Renderer層のみの変更（IPC/Preload/Main/Store変更なし）
- P44パターン（IPCインターフェース不整合）のRenderer側バリエーションとして解決

#### 実装上の苦戦箇所と解決策

| 苦戦箇所 | 原因 | 解決策 | 再発防止 |
| --- | --- | --- | --- |
| 同名コンポーネントの誤調査 | `SkillImportDialog` が複数箇所に存在し、実際に使用されるファイル特定に時間を要した | `AgentView` の import 元から逆引きし、`apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx` を修正対象として固定 | 変更前に `rg "from .*SkillImportDialog"` で参照元を機械確認してから実装する |
| `skill.id`/`skill.name` の文字列型混同 | どちらも `string` 型のため、型システムだけでは意味差を検出できなかった | `onImport` の引数名を `skillNames` に統一し、`selectedIds` から `availableSkills.map(skill.name)` への明示変換を追加 | テストに否定条件（`skill.id` を渡さないこと）を必須化する |
| インポート処理の偽成功ログ | `importSkills` 側ログだけを見ると成功に見えるが、後段の `getSkillByName` で失敗していた | Renderer → IPC → Handler の値をトレースし、失敗点を `getSkillByName` 不一致に特定 | ログ確認時は単一関数ではなく IPCハンドラ最終戻り値まで追跡する |

#### 同種課題の簡潔解決手順（4ステップ）

1. `AgentView` など呼び出し元から対象コンポーネントの import 先を確定する。
2. `skill.id`（内部識別）と `skill.name`（IPC契約）の境界を表にして固定する。
3. 変換ポイントを1箇所に集約し、引数名を `skillNames` のように意味付き名称へ統一する。
4. テストに「期待値」と「否定条件（idが渡らない）」を同時追加して回帰を防止する。

#### 検出未タスク（実装苦戦箇所由来）

| タスクID | 内容 | 優先度 | 指示書パス |
| -------- | ---- | ------ | ---------- |
| UT-TYPE-SKILL-IDENTIFIER-BRANDED-001 | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別） | 中 | `docs/30-workflows/unassigned-task/task-type-skill-identifier-branded.md` |
| UT-REFACTOR-SKILL-IMPORT-DIALOG-DEDUP-001 | SkillImportDialog同名コンポーネント解消 | 低 | `docs/30-workflows/unassigned-task/task-refactor-skill-import-dialog-dedup.md` |

---

### UT-FIX-SKILL-IMPORT-INTERFACE-001: skill:import IPCインターフェース不整合修正（2026-02-21完了）

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-FIX-SKILL-IMPORT-INTERFACE-001                                   |
| 完了日       | 2026-02-21                                                           |
| ステータス   | **完了**                                                             |
| テスト数     | 52（`skillHandlers.test.ts`）                                       |
| ドキュメント | `docs/30-workflows/ut-fix-skill-import-interface-001/`              |

#### 変更ポイント

| 変更箇所 | 内容 |
| -------- | ---- |
| Main IPCハンドラー | `skill:import` が `{ skillIds: string[] }` 受け取りから `skillName: string` 直接受け取りに変更 |
| 入力検証 | `trim()` を含む非空文字列検証を追加（P42準拠） |
| Service呼び出し | `skillService.importSkills([skillName])` で既存Service API互換を維持 |
| テスト | SH-IMP-01〜13へ更新（旧形式オブジェクト拒否・境界値・sender検証を含む） |

#### 関連ドキュメント

| ドキュメント | 説明 |
| ------------ | ---- |
| [UT-FIX-SKILL-IMPORT-INTERFACE-001 実装ガイド](../../../../docs/30-workflows/ut-fix-skill-import-interface-001/outputs/phase-12/implementation-guide.md) | 概念説明（Part 1）と技術詳細（Part 2） |
| [完了タスク指示書](../../../../docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-ut-fix-skill-import-interface-001.md) | 元タスクの完了記録 |

#### 実装上の課題と教訓

| 課題 | 解決策 | 教訓 |
| --- | --- | --- |
| `phase-12` 成果物は生成済みでも、仕様書本体が未実施のまま残る | `phase-12-documentation.md` のステータス/完了条件を成果物と同時同期 | 成果物作成だけで完了判定せず、仕様書本体の状態も同一ターンで更新する |
| タスク移動後に旧参照パスが残る | `rg` で旧パスを横断検出し、`completed-task` 側に統一 | ワークフロー移動時はリンク整合チェックを必須工程にする |
| Vitest をルートで実行すると alias 解決が崩れる | `apps/desktop` ディレクトリで `vitest run` を実行して証跡化 | テスト実行ディレクトリは再現性要件として明示する |

---

### UT-FIX-SKILL-REMOVE-INTERFACE-001: skill:remove IPCインターフェース不整合修正（2026-02-20完了）

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-FIX-SKILL-REMOVE-INTERFACE-001                                   |
| 完了日       | 2026-02-20                                                           |
| ステータス   | **完了**                                                             |
| テスト数     | 45（`skillHandlers.test.ts`）                                       |
| ドキュメント | `docs/30-workflows/completed-tasks/ut-fix-skill-remove-interface/`                  |

#### 変更ポイント

| 変更箇所 | 内容 |
| -------- | ---- |
| Main IPCハンドラー | `skill:remove` が `{ skillId: string }` 受け取りから `skillName: string` 直接受け取りに変更 |
| 入力検証 | `trim()` を含む非空文字列検証を追加 |
| テスト | SH-RM-01〜11を `skillName` 契約に更新（sender検証・空白文字列検証を含む） |

#### Phase実行時の追加教訓（2026-02-21）

| 苦戦箇所 | 原因 | 対策 |
|----------|------|------|
| Phase依存順序違反 | 5エージェント並列ディスパッチでPhase 1-3完了前にPhase 4-7が先行 | ゲートPhase（3, 10）前後で並列化区間を分離 |
| worktree環境でのPhase 11 | Electron起動不可 | 自動テスト（vitest）で代替し、制約を明記 |
| カバレッジ閾値解釈 | skillHandlers.ts全体のLine 45%は低いが修正対象は全分岐カバー | ハンドラ固有の分岐カバー率を別途記録 |

#### 関連ドキュメント

| ドキュメント | 説明 |
| ------------ | ---- |
| [UT-FIX-SKILL-REMOVE-INTERFACE-001 実装ガイド](../../../../docs/30-workflows/completed-tasks/ut-fix-skill-remove-interface/outputs/phase-12/implementation-guide.md) | 概念説明（Part 1）と技術詳細（Part 2） |
| [完了タスク指示書](../../../../docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-ut-fix-skill-remove-interface-001.md) | 元タスクの完了記録 |

---

### TASK-9B-H-SKILL-CREATOR-IPC: SkillCreatorService IPC登録（2026-02-12完了）

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | TASK-9B-H-SKILL-CREATOR-IPC                                               |
| 完了日       | 2026-02-12                                                                 |
| ステータス   | **完了**                                                                   |
| テスト数     | 85（自動テスト）                                                           |
| 発見課題     | MINOR 2件（IpcResult型重複、Zodスキーマ未使用）                            |
| ドキュメント | `docs/30-workflows/skill-creator-ipc/`                                     |

#### テスト結果サマリー

| カテゴリ                     | テスト数 | PASS | FAIL |
| ---------------------------- | -------- | ---- | ---- |
| ハンドラー登録/解除          | 2        | 2    | 0    |
| 正常フロー（5チャンネル）    | 22       | 22   | 0    |
| sender検証                   | 5        | 5    | 0    |
| エッジケース                 | 12       | 12   | 0    |
| セキュリティ                 | 8        | 8    | 0    |
| 進捗通知                     | 11       | 11   | 0    |
| 統合テスト                   | 11       | 11   | 0    |
| Preload API                  | 14       | 14   | 0    |

#### 成果物

| 成果物             | パス                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| 実装ガイド         | `docs/30-workflows/skill-creator-ipc/outputs/phase-12/implementation-guide.md`    |

#### 追加チャンネル一覧（6チャンネル）

| 定数名                           | チャンネル値                      | 方向          |
| -------------------------------- | --------------------------------- | ------------- |
| `SKILL_CREATOR_DETECT_MODE`      | `skill-creator:detect-mode`       | invoke (R->M) |
| `SKILL_CREATOR_CREATE`           | `skill-creator:create`            | invoke (R->M) |
| `SKILL_CREATOR_EXECUTE_TASKS`    | `skill-creator:execute-tasks`     | invoke (R->M) |
| `SKILL_CREATOR_VALIDATE`         | `skill-creator:validate`          | invoke (R->M) |
| `SKILL_CREATOR_VALIDATE_SCHEMA`  | `skill-creator:validate-schema`   | invoke (R->M) |
| `SKILL_CREATOR_PROGRESS`         | `skill-creator:progress`          | on (M->R)     |

#### 関連未タスク

| タスクID    | 内容                                        | 優先度 | 指示書パス                                                                      |
| ----------- | ------------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| UT-9B-H-001 | IpcResult型の重複定義を@repo/sharedに統一   | 低     | `docs/30-workflows/unassigned-task/task-9b-h-ipcresult-type-unification.md`     |
| UT-9B-H-002 | IPCハンドラー引数検証のZodスキーマ移行      | 低     | `docs/30-workflows/unassigned-task/task-9b-h-zod-schema-migration.md`           |
| ~~UT-9B-H-003~~ | ~~SkillCreator IPCセキュリティ強化（パストラバーサル対策、sanitizeError、schemaNameホワイトリスト）~~ | ~~高~~ | ~~`docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/index.md`~~ **2026-02-12完了（UT-9B-H-003-security-hardeningで実施）** |
| UT-9B-H-004 | SkillCreator設計書-実装整合性修正（Zod/型/メソッド名の乖離対応） | 中 | `docs/30-workflows/unassigned-task/task-9b-h-design-implementation-alignment.md` |

---

### TASK-9B-G: SkillCreatorService実装（2026-02-03完了）

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | TASK-9B-G                                                                  |
| 完了日       | 2026-02-03                                                                 |
| ステータス   | **完了**                                                                   |
| テスト数     | 50（自動テスト）                                                           |
| 発見課題     | 0件                                                                        |
| ドキュメント | `docs/30-workflows/TASK-9B-G-skill-creator-service/`                       |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS | FAIL |
| ------------------ | -------- | ---- | ---- |
| ScriptExecutor     | 9        | 9    | 0    |
| ResourceLoader     | 9        | 9    | 0    |
| SkillCreatorService| 22       | 22   | 0    |
| 統合テスト         | 10       | 10   | 0    |

#### 成果物

| 成果物             | パス                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/TASK-9B-G-skill-creator-service/outputs/phase-11/manual-test-result.md` |
| 実装ガイド         | `docs/30-workflows/TASK-9B-G-skill-creator-service/outputs/phase-12/implementation-guide.md` |

---

## SkillEditor UI 型定義（TASK-9A-C / spec_created）

> **ステータス**: 仕様書作成済み（実装未着手）
> 本セクションは TASK-9A-C のUI実装で使用する型定義を定義する。

### SkillEditorProps

| プロパティ | 型              | 必須 | 説明                       |
| ---------- | --------------- | ---- | -------------------------- |
| `skill`    | `ImportedSkill` | ✓    | 編集対象のスキル情報       |
| `onClose`  | `() => void`    | ✓    | エディター閉じるコールバック |

### SkillCodeEditorProps

| プロパティ   | 型                           | 必須 | デフォルト | 説明                       |
| ------------ | ---------------------------- | ---- | ---------- | -------------------------- |
| `value`      | `string`                     | ✓    | -          | エディター内テキスト       |
| `onChange`   | `(value: string) => void`    | ✓    | -          | テキスト変更コールバック   |
| `language`   | `string`                     | ✓    | -          | ファイルの言語識別子       |
| `isReadOnly` | `boolean`                    | -    | `false`    | 読み取り専用モード         |

### FileTreeCategory

| プロパティ | 型                 | 説明                                       |
| ---------- | ------------------ | ------------------------------------------ |
| `key`      | `string`           | カテゴリキー（`"agents"`, `"references"` 等） |
| `label`    | `string`           | カテゴリ表示ラベル                         |
| `files`    | `SkillSubResource[]` | カテゴリに属するファイル一覧             |

### 関連型定義

| 型                | 定義元                                   | 用途                   |
| ----------------- | ---------------------------------------- | ---------------------- |
| `ImportedSkill`   | `packages/shared/src/types/skill.ts`     | スキル情報             |
| `SkillSubResource`| `packages/shared/src/types/skill.ts`     | サブリソースファイル情報 |

### 関連ドキュメント

- [SkillEditor UIコンポーネント仕様](./ui-ux-feature-components.md#skilleditor-uitask-9a-c--仕様書作成済み)
- [TASK-9A-C ワークフロー](../../../../docs/30-workflows/completed-tasks/TASK-9A-C-skill-editor-ui/index.md)

### 関連未タスク

| タスクID | 概要 | 仕様書 |
| --- | --- | --- |
| TASK-9A-C-001 | シンタックスハイライト機能 | `docs/30-workflows/unassigned-task/task-9a-c-syntax-highlighting.md` |
| TASK-9A-C-002 | ファイル作成・削除機能 | `docs/30-workflows/unassigned-task/task-9a-c-file-crud-operations.md` |
| TASK-9A-C-003 | Monaco/CodeMirrorエディタ移行 | `docs/30-workflows/unassigned-task/task-9a-c-code-editor-migration.md` |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                               |
| ---------- | ---------- | ------------------------------------------------------ |
| 2026-02-22 | 1.29.0     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001苦戦箇所から未タスク2件登録: UT-TYPE-SKILL-IDENTIFIER-BRANDED-001（Branded Type導入）、UT-REFACTOR-SKILL-IMPORT-DIALOG-DEDUP-001（同名コンポーネント解消）を完了タスクセクションに参照追加 |
| 2026-02-22 | 1.28.0     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001完了反映: 関連未タスクテーブルを完了化（取り消し線）、完了タスクセクションに詳細記録追加。Renderer層のみ変更（skill.id→skill.name） |
| 2026-02-22 | 1.27.0     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001: skillHandlers 関連未タスクテーブルに追加（skill.idハッシュ→getSkillByName失敗バグ） |
| 2026-02-21 | 1.26.0     | UT-FIX-SKILL-IMPORT-INTERFACE-001 追補: 「実装上の課題と教訓」を追加（Phase 12ステータス同期、旧参照パス残存、Vitest実行ディレクトリ差異） |
| 2026-02-21 | 1.25.0     | UT-FIX-SKILL-REMOVE-INTERFACE-001: Phase実行時の追加教訓テーブル追加（Phase依存順序違反・worktree Phase 11制約・カバレッジスコープ解釈） |
| 2026-02-21 | 1.25.0     | UT-FIX-SKILL-IMPORT-INTERFACE-001完了反映。`skill:import` の引数契約を `skillName: string` に統一し、バリデーション仕様・完了タスク記録を追加 |
| 2026-02-20 | 1.24.0     | 完了済み UT-9B-H-003 の参照先を `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/index.md` に更新（削除済み旧パスの整合修正） |
| 2026-02-20 | 1.23.0     | UT-FIX-SKILL-REMOVE-INTERFACE-001完了反映。`skill:remove` の引数契約を `skillName: string` に更新し、バリデーション仕様・完了タスク記録を追加 |
| 2026-02-19 | 1.22.0     | TASK-9A-C: 関連未タスク3件の参照テーブル追加（TASK-9A-C-001/002/003）。ワークフローリンクをcompleted-tasks/に更新 |
| 2026-02-19 | 1.21.0     | TASK-9A-C: SkillEditor UI 型定義追加（SkillEditorProps, SkillCodeEditorProps, FileTreeCategory）。仕様書作成済み・実装未着手を明記 |
| 2026-02-19 | 1.21.0     | TASK-9A-B完了記録追加。スキルファイル操作IPCハンドラー6チャンネル（skill:readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup）、65テスト全PASS、カバレッジ Line 91.14% / Branch 93.93% / Function 100% |
| 2026-02-14 | 1.20.0     | UT-FIX-IPC-RESPONSE-UNWRAP-001完了記録追加。Preload IPCラッパー展開統一と苦戦箇所（参照正本・MINOR未タスク化・リンク整合）を追記 |
| 2026-02-13 | 1.19.0     | TASK-FIX-13-1 苦戦箇所・教訓を追記（削除範囲境界、参照誤検出対策、Phase 12同期手順） |
| 2026-02-13 | 1.18.0     | TASK-FIX-13-1完了記録追加。deprecated型プロパティ（`Anchor.name`, `Skill.lastUpdated`）削除と型定義テーブル（`lastModified`）を反映 |
| 2026-02-12 | 1.17.0     | UT-FIX-AGENTVIEW-INFINITE-LOOP-001完了記録追加。AgentViewのP31適用拡張（個別セレクタ移行）を反映 |
| 2026-02-12 | 1.16.2     | UT-9B-H-003完了後処理: 関連未タスクテーブルの参照パスを `completed-tasks/unassigned-task/` へ更新 |
| 2026-02-12 | 1.16.1     | UT-9B-H-003完了反映: 関連未タスクテーブルを更新（取り消し線 + 完了日追記） |
| 2026-02-12 | 1.16.0     | 未タスク2件追加: UT-9B-H-003（IPCセキュリティ強化）、UT-9B-H-004（設計書-実装整合性修正）。関連未タスクテーブルに優先度列追加 |
| 2026-02-12 | 1.15.0     | TASK-9B-H-SKILL-CREATOR-IPC完了: SkillCreatorService IPCチャンネルセクション追加（6チャンネル、SkillCreatorAPI型定義、85テスト） |
| 2026-02-12 | 1.14.1     | TASK-FIX-7-1セクション修正: テスト数を実際の値（61件）に訂正、型変換フローテーブルを実装コード（9フィールド明示コピー、lastModified除外）に準拠して修正 |
| 2026-02-12 | 1.14.0     | TASK-FIX-7-1完了: SkillService.executeSkill() SkillExecutor 委譲実装。Setter Injection パターン、型変換フロー、未タスク3件（UT-FIX-7-1-001/002/003） |
| 2026-02-10 | 1.13.0     | UT-FIX-5-4完了: AgentSDKAPI abort()型定義修正（`void` → `Promise<void>`）。P23パターン準拠で2箇所同時更新、24テスト追加 |
| 2026-02-04 | 1.12.0     | TASK-FIX-1-1-TYPE-ALIGNMENT: スキル型定義統一完了記録追加（skill-execution.ts削除、6型+1定数をskill.tsに統合、BaseStreamMessage抽出） |
| 2026-02-03 | 1.11.0     | マージ統合: TASK-9B-G + TASK-9C |
| 2026-02-03 | 1.10.0     | TASK-9B-G: 実装上の苦戦箇所・教訓セクション追加（未タスク登録漏れ、Script First統合設計、定数外部化、パストラバーサル防止） |
| 2026-02-03 | 1.9.0      | TASK-9B-G: SkillCreatorService仕様追加（SkillCreatorMode, ScriptExecutor, ResourceLoader型定義、API仕様、50テスト完了記録） |
| 2026-02-02 | 1.8.0      | TASK-8C-B: スキル選択E2Eテスト完了記録追加（8テスト、ARIA属性ベースセレクタ、安定性対策3層） |
| 2026-02-02 | 1.7.0      | TASK-8C-A: テストアーキテクチャセクション追加（テスト構成、適用パターン、ヘルパー関数、テストデータ定数） |
| 2026-02-02 | 1.6.0      | TASK-8A完了: スキル管理モジュール単体テスト231テスト全PASS、skillSlice 59テスト含む                       |
| 2026-02-02 | 1.5.0      | TASK-8C-A完了: skill:abort/get-statusチャネル仕様追加、IPC統合テスト完了記録                              |
| 2026-01-30 | 1.4.0      | TASK-7D完了: ChatPanel統合セクション追加                                                                  |
| 2026-01-30 | 1.3.0      | TASK-7B完了: SkillImportDialogファイルパス修正（components/skill/）                                       |
| 2026-01-28 | 1.2.0      | TASK-6-1完了: SkillSlice型定義セクション追加                                                              |
| 2026-01-26 | 1.1.0      | コードブロックを表形式・文章に変換（ガイドライン準拠）                                                    |
| 2026-01-26 | 1.0.0      | interfaces-agent-sdk.mdから分割                                                                           |
