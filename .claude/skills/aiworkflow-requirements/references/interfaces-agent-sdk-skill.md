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

| チャンネル                | 方向            | 説明                        | 戻り値                                |
| ------------------------- | --------------- | --------------------------- | ------------------------------------- |
| `skill:list-imported`     | Renderer → Main | インポート済みスキル取得    | `OperationResult<Skill[]>`            |
| `skill:list-available`    | Renderer → Main | 利用可能スキル取得          | `OperationResult<Skill[]>`            |
| `skill:import`            | Renderer → Main | スキルインポート            | `OperationResult<void>`               |
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

## 変更履歴

| 日付       | バージョン | 変更内容                                               |
| ---------- | ---------- | ------------------------------------------------------ |
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
