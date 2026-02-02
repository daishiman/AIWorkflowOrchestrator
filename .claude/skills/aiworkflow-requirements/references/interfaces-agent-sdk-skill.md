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
| `apps/desktop/src/preload/skillApi.ts`                  | Preload API                |

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

| チャンネル             | 方向            | 説明                     | 戻り値                            |
| ---------------------- | --------------- | ------------------------ | --------------------------------- |
| `skill:list-imported`  | Renderer → Main | インポート済みスキル取得 | `OperationResult<Skill[]>`        |
| `skill:list-available` | Renderer → Main | 利用可能スキル取得       | `OperationResult<Skill[]>`        |
| `skill:import`         | Renderer → Main | スキルインポート         | `OperationResult<void>`           |
| `skill:remove`         | Renderer → Main | スキル削除               | `OperationResult<void>`           |
| `skill:get-detail`     | Renderer → Main | スキル詳細取得           | `OperationResult<Skill>`          |
| `skill:execute`        | Renderer → Main | スキル実行               | `OperationResult<SkillRunResult>` |
| `skill:abort`          | Renderer → Main | スキル実行中断           | `boolean`                         |
| `skill:get-status`     | Renderer → Main | 実行ステータス取得       | `ExecutionStatus \| null`         |

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

### Preload API（window.skillAPI）

#### listImported

インポート済みのスキル一覧を取得する。

**戻り値**: `Promise<OperationResult<Skill[]>>`

#### listAvailable

利用可能なスキル一覧を取得する。

**戻り値**: `Promise<OperationResult<Skill[]>>`

#### import

スキルをインポートする。

| パラメータ | 型         | 必須 | 説明           |
| ---------- | ---------- | ---- | -------------- |
| `skillIds` | `string[]` | ✓    | スキルIDの配列 |

**戻り値**: `Promise<OperationResult<void>>`

#### remove

スキルを削除する。

| パラメータ | 型       | 必須 | 説明     |
| ---------- | -------- | ---- | -------- |
| `skillId`  | `string` | ✓    | スキルID |

**戻り値**: `Promise<OperationResult<void>>`

#### getDetail

スキルの詳細情報を取得する。

| パラメータ | 型       | 必須 | 説明     |
| ---------- | -------- | ---- | -------- |
| `skillId`  | `string` | ✓    | スキルID |

**戻り値**: `Promise<OperationResult<Skill>>`

#### execute

スキルを実行する。

| パラメータ | 型                        | 必須 | 説明                               |
| ---------- | ------------------------- | ---- | ---------------------------------- |
| `skillId`  | `string`                  | ✓    | 実行するスキルのID                 |
| `params`   | `Record<string, unknown>` | -    | オプションパラメータ（将来拡張用） |

**戻り値**: `Promise<OperationResult<SkillRunResult>>`

#### onPermission（TASK-3-1-D）

Main ProcessからのPermission要求をリッスンするリスナーを登録する。

**シグネチャ**: `onPermission: (callback: (request: SkillPermissionRequest) => void) => () => void`

#### respondPermission（TASK-3-1-D）

Permission要求に対してユーザーの応答を送信する。

**シグネチャ**: `respondPermission: (response: SkillPermissionResponse) => Promise<boolean>`

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

| コンポーネント        | ファイル                             | 責務                   |
| --------------------- | ------------------------------------ | ---------------------- |
| `AgentView`           | `views/AgentView/index.tsx`          | メインビュー、状態管理 |
| `SkillList`           | `components/SkillList.tsx`           | スキル一覧表示         |
| `SkillCard`           | `components/SkillCard.tsx`           | スキルカード表示       |
| `SkillDetailPanel`    | `components/SkillDetailPanel.tsx`    | スキル詳細パネル       |
| `SkillImportDialog`   | `components/skill/SkillImportDialog.tsx` | インポートダイアログ   |
| `SkillSearchBar`      | `components/SkillSearchBar.tsx`      | 検索バー               |
| `SkillCategoryFilter` | `components/SkillCategoryFilter.tsx` | カテゴリフィルター     |

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

| コンポーネント       | ファイルパス                                          | 統合方式             |
| -------------------- | ----------------------------------------------------- | -------------------- |
| SkillSelector        | `components/skill/SkillSelector.tsx`                  | 直接レンダー         |
| SkillStreamingView   | `components/skill/SkillStreamingView.tsx`             | 条件付きレンダー     |
| SkillImportDialog    | `components/skill/SkillImportDialog.tsx`              | ローカルstate制御    |
| PermissionDialog     | `components/skill/PermissionDialog.tsx`               | Store-directパターン |

### ChatPanel公開インターフェース

| 名前                | 種別   | 説明                             |
| ------------------- | ------ | -------------------------------- |
| `ChatPanelProps`    | type   | `{ onImportRequest?: (skill: SkillMetadata) => void }` |
| `ChatPanelHandle`   | type   | `{ handleImportRequest: (skill: SkillMetadata) => void }` |
| `ChatPanel`         | component | `forwardRef<ChatPanelHandle, ChatPanelProps>` |

### Store依存（useAppStore）

| セレクタ                  | 用途                     |
| ------------------------- | ------------------------ |
| `selectedSkillName`       | 選択中スキル名           |
| `streamingMessages`       | ストリーミングメッセージ |
| `isExecuting`             | 実行中フラグ             |
| `skillExecutionStatus`    | 実行ステータス           |
| `fetchSkills`             | スキル一覧取得アクション |

---

## テストアーキテクチャ（TASK-8C-A）

### 概要

skillHandlers.ts の IPC統合テストは、Handler Map方式を採用し、Electron プロセスを起動せずにハンドラーロジックをテストする。テストファイルは `apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts` に配置される。

### テスト構成

| カテゴリ | テスト数 | 検証対象 |
|----------|----------|----------|
| ハンドラー登録/解除 | 1 | registerSkillHandlers / unregisterSkillHandlers |
| 基本チャネルテスト | 12 | list-available, list-imported, import, remove, get-detail, execute |
| 拡張チャネルテスト | 2 | abort, get-status |
| エラーハンドリング | 10 | 各チャネルの異常系 |
| セキュリティ検証 | 2 | validateIpcSender失敗パス（abort, get-status） |
| エッジケース | 4 | undefined引数、空配列、不正イベント等 |
| IMP-002チャネル | 10 | settings/permissions/cache（未実装パス） |

### 適用テストパターン

| パターン | 参照先 | 用途 |
|----------|--------|------|
| Handler Map方式 | [architecture-implementation-patterns.md](./architecture-implementation-patterns.md) IPC通信テストパターン | ハンドラー関数の直接テスト |
| SkillService Partial Mock | 同上 | 依存サービスの部分モック |
| invokeOptionalHandler | 同上 | IMP-002未実装チャネルの条件付きテスト |
| validateIpcSender失敗検証 | 同上 | セキュリティレイヤーの検証 |

### ヘルパー関数

テストファイル内に定義された再利用可能ヘルパー。

| 関数 | 用途 |
|------|------|
| `createMockIpcEvent(senderId?)` | モックIPCイベントオブジェクト生成 |
| `expectOperationSuccess(result, expectedData?)` | OperationResult成功検証 |
| `expectOperationError(result, errorPattern?)` | OperationResultエラー検証 |
| `invokeOptionalHandler(handlerMap, channel, ...args)` | 未実装チャネルの条件付き呼び出し |

### テストデータ定数

| 定数 | 型 | 用途 |
|------|-----|------|
| `EXPECTED_CHANNELS` | `string[]` | 登録されるべき全8チャネル名 |
| `MOCK_SKILL_A` / `MOCK_SKILL_B` | `Skill` | スキルデータのFixture |
| `MOCK_SCAN_RESULT` | `ScanResult` | スキャン結果Fixture |
| `MOCK_EXECUTION_RESULT` | `SkillRunResult` | 実行結果Fixture |
| `MOCK_SETTINGS` | `object` | IMP-002設定データFixture |
| `MOCK_PERMISSIONS` | `object` | IMP-002権限データFixture |
| `MOCK_CACHE_DATA` | `object` | IMP-002キャッシュデータFixture |

---

## 完了タスク

### TASK-8C-A: IPC統合テスト（2026-02-02完了）

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | TASK-8C-A                                                                  |
| 完了日       | 2026-02-02                                                                 |
| ステータス   | **完了**                                                                   |
| テスト数     | 41（自動テスト）+ 5（手動テスト項目）                                      |
| 発見課題     | 2件（IMP-002チャネル未実装、permission:response未実装）                    |
| ドキュメント | `docs/30-workflows/TASK-8C-A/`                                             |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS | FAIL |
| ------------------ | -------- | ---- | ---- |
| 機能テスト         | 23       | 23   | 0    |
| エラーハンドリング | 10       | 10   | 0    |
| セキュリティ       | 2        | 2    | 0    |
| エッジケース       | 5        | 5    | 0    |
| 登録/解除          | 1        | 1    | 0    |

#### 成果物

| 成果物             | パス                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/TASK-8C-A/outputs/phase-11/manual-test-result.md`  |
| 実装ガイド         | `docs/30-workflows/TASK-8C-A/outputs/phase-12/implementation-guide.md`|

---

## 関連ドキュメント

| ドキュメント            | 説明                       |
| ----------------------- | -------------------------- |
| interfaces-agent-sdk.md | 親ファイル（インデックス） |
| ui-ux-components.md     | UIコンポーネント仕様       |
| [TASK-7B 実装ガイド](../../../../docs/30-workflows/TASK-7B-skill-import-dialog/outputs/phase-12/implementation-guide.md) | SkillImportDialog実装詳細 |
| [TASK-7D 実装ガイド](../../../../docs/30-workflows/TASK-7D-chat-panel-integration/outputs/phase-12/implementation-guide-part2.md) | ChatPanel統合実装詳細 |
| [TASK-8C-A 実装ガイド](../../../../docs/30-workflows/TASK-8C-A/outputs/phase-12/implementation-guide.md) | IPC統合テスト実装詳細 |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                               |
| ---------- | ---------- | ------------------------------------------------------ |
| 2026-02-02 | 1.7.0      | TASK-8C-A: テストアーキテクチャセクション追加（テスト構成、適用パターン、ヘルパー関数、テストデータ定数） |
| 2026-02-02 | 1.6.0      | TASK-8A完了: スキル管理モジュール単体テスト231テスト全PASS、skillSlice 59テスト含む |
| 2026-02-02 | 1.5.0      | TASK-8C-A完了: skill:abort/get-statusチャネル仕様追加、IPC統合テスト完了記録 |
| 2026-01-30 | 1.4.0      | TASK-7D完了: ChatPanel統合セクション追加               |
| 2026-01-30 | 1.3.0      | TASK-7B完了: SkillImportDialogファイルパス修正（components/skill/）|
| 2026-01-28 | 1.2.0      | TASK-6-1完了: SkillSlice型定義セクション追加           |
| 2026-01-26 | 1.1.0      | コードブロックを表形式・文章に変換（ガイドライン準拠） |
| 2026-01-26 | 1.0.0      | interfaces-agent-sdk.mdから分割                        |
