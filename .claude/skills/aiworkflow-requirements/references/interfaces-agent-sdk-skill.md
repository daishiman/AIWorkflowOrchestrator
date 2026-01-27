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

| レイヤー          | 責務                               | 主要コンポーネント                           |
| ----------------- | ---------------------------------- | -------------------------------------------- |
| Renderer Process  | UI表示・ユーザー操作の受付         | AgentView、SkillList、SkillCard等            |
| Main Process      | ビジネスロジック・ファイルシステム | skill-handler.ts、skill-service.ts           |
| File System       | スキルファイルの永続化             | `.claude/skills/**/*.md`                     |

#### 通信フロー

| 段階 | 送信元           | 送信先           | 通信手段                   | 説明                     |
| ---- | ---------------- | ---------------- | -------------------------- | ------------------------ |
| 1    | UIコンポーネント | Preload API      | 関数呼び出し               | ユーザー操作をトリガー   |
| 2    | Preload API      | Main Process     | IPC（contextBridge経由）   | `skill:*` チャンネル使用 |
| 3    | skill-handler    | skill-service    | 直接呼び出し               | ビジネスロジック実行     |
| 4    | skill-service    | File System      | Node.js fs API             | スキルファイル読み書き   |

#### Renderer Process コンポーネント

| コンポーネント      | 役割                     | 配置              |
| ------------------- | ------------------------ | ----------------- |
| AgentView           | メインビュー・状態管理   | 常時表示          |
| SkillSearchBar      | 検索フィルター           | ヘッダー領域      |
| SkillCategoryFilter | カテゴリ選択             | ヘッダー領域      |
| SkillList           | スキル一覧表示           | メイン領域        |
| SkillCard           | 個別スキル表示           | SkillList内       |
| SkillDetailPanel    | 選択スキルの詳細表示     | サイドパネル      |
| SkillImportDialog   | インポートモーダル       | オーバーレイ表示  |

#### Main Process コンポーネント

| コンポーネント    | ファイル            | 責務                             |
| ----------------- | ------------------- | -------------------------------- |
| skill-handler.ts  | `main/skill/`       | `skill:*` IPCチャンネルの処理    |
| skill-service.ts  | `main/skill/`       | スキルスキャン・解析ロジック     |

#### スキルファイル構成

スキル定義ファイルは `.claude/skills/` ディレクトリ配下に配置される。

| パターン                     | 説明               |
| ---------------------------- | ------------------ |
| `.claude/skills/*/SKILL.md`  | スキル定義ファイル |
| `.claude/skills/*/agents/*.md` | エージェント定義 |

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

| 親コンポーネント | 子コンポーネント      | 表示条件       | 説明                   |
| ---------------- | --------------------- | -------------- | ---------------------- |
| AgentView        | Header                | 常時           | タイトルと説明文       |
| AgentView        | SkillSearchBar        | 常時           | 検索入力フィールド     |
| AgentView        | SkillCategoryFilter   | 常時           | カテゴリ選択ボタン群   |
| AgentView        | SkillList             | 常時           | スキル一覧コンテナ     |
| SkillList        | SkillCard             | 複数表示       | 個別スキルカード       |
| AgentView        | SkillDetailPanel      | スキル選択時   | 選択スキルの詳細情報   |
| AgentView        | SkillImportDialog     | ダイアログ表示時 | インポートモーダル   |
| AgentView        | Toast                 | 通知時         | 操作結果の通知表示     |

#### コンポーネント仕様

| コンポーネント        | ファイル                             | 責務                   |
| --------------------- | ------------------------------------ | ---------------------- |
| `AgentView`           | `views/AgentView/index.tsx`          | メインビュー、状態管理 |
| `SkillList`           | `components/SkillList.tsx`           | スキル一覧表示         |
| `SkillCard`           | `components/SkillCard.tsx`           | スキルカード表示       |
| `SkillDetailPanel`    | `components/SkillDetailPanel.tsx`    | スキル詳細パネル       |
| `SkillImportDialog`   | `components/SkillImportDialog.tsx`   | インポートダイアログ   |
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

## 関連ドキュメント

| ドキュメント            | 説明                       |
| ----------------------- | -------------------------- |
| interfaces-agent-sdk.md | 親ファイル（インデックス） |
| ui-ux-components.md     | UIコンポーネント仕様       |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                           |
| ---------- | ---------- | -------------------------------------------------- |
| 2026-01-26 | 1.1.0      | コードブロックを表形式・文章に変換（ガイドライン準拠） |
| 2026-01-26 | 1.0.0      | interfaces-agent-sdk.mdから分割                    |
