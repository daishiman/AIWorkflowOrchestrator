# 状態管理パターン（Desktop Renderer） / detail specification

> 親仕様書: [arch-state-management.md](arch-state-management.md)
> 役割: detail specification

## Zustand Sliceパターン

### 概要

デスクトップアプリ（Electron）では、Zustandを使用した状態管理を採用。
機能単位でSliceを分離し、型安全性と保守性を確保する。

**実装場所**: `apps/desktop/src/renderer/store/slices/`

### Sliceの基本構造

各SliceはStateCreator型を使用して定義し、状態とアクションを分離する。

**必須ファイル構成**:

| ファイル                        | 役割                         |
| ------------------------------- | ---------------------------- |
| `{name}Slice.ts`                | Slice定義（状態+アクション） |
| `__tests__/{name}Slice.test.ts` | ユニットテスト               |

**Slice定義パターン**:

| 要素                 | 説明                         |
| -------------------- | ---------------------------- |
| `{Name}State`        | 状態のインターフェース       |
| `{Name}Actions`      | アクションのインターフェース |
| `{Name}Slice`        | State + Actions の統合型     |
| `initial{Name}State` | 初期状態オブジェクト         |
| `create{Name}Slice`  | StateCreator関数             |

### 既存Slice一覧

| Slice名                  | 責務                     | 実装ファイル                             | タスク                          |
| ------------------------ | ------------------------ | ---------------------------------------- | ------------------------------- |
| `uiSlice`                | UI状態（currentView等）  | `store/slices/uiSlice.ts`                | -                               |
| `authSlice`              | 認証状態                 | `store/slices/authSlice.ts`              | -                               |
| `chatSlice`              | チャット状態             | `store/slices/chatSlice.ts`              | -                               |
| `agentSlice`             | エージェント・スキル管理 | `store/slices/agentSlice.ts`             | AGENT-002                       |
| `skillSlice`             | **統合済み→agentSlice** | ~~`store/slices/skillSlice.ts`~~（削除済み）  | TASK-FIX-6-1（統合完了） |
| `permissionHistorySlice` | 権限要求履歴管理         | `store/slices/permissionHistorySlice.ts` | task-imp-permission-history-001 |
| `notificationSlice`      | 通知履歴/未読管理        | `store/slices/notificationSlice.ts`      | TASK-UI-01-C（完了）            |
| `historySearchSlice`     | 履歴検索状態管理         | `store/slices/historySearchSlice.ts`     | TASK-UI-01-C（完了）            |

### authSlice詳細（TASK-AUTH-SESSION-REFRESH-001更新）

**実装ファイル**: `apps/desktop/src/renderer/store/slices/authSlice.ts`

**状態定義**:

| プロパティ         | 型                  | 初期値  | 説明                                         |
| ------------------ | ------------------- | ------- | -------------------------------------------- |
| `isAuthenticated`  | `boolean`           | `false` | 認証状態                                     |
| `isLoading`        | `boolean`           | `false` | ローディング中                               |
| `authUser`         | `AuthUser \| null`  | `null`  | 認証済みユーザー情報                         |
| `sessionExpiresAt` | `number \| null`    | `null`  | セッション有効期限（UNIXタイムスタンプ秒）   |
| `isRefreshing`     | `boolean`           | `false` | トークンリフレッシュ中フラグ                 |
| `linkedProviders`  | `LinkedProvider[]`  | `[]`    | 連携済みプロバイダー一覧                     |
| `error`            | `string \| null`    | `null`  | エラーメッセージ                             |

**セキュリティ考慮事項**:
- トークン情報はRenderer側の状態に保存しない（Main Processのみで管理）
- Rendererには `sessionExpiresAt`（有効期限のみ）と `isRefreshing`（更新状態のみ）を公開
- リスナー二重登録防止: モジュールスコープ `authListenerRegistered` フラグでガード

**関連タスク**:

| タスクID                         | 内容                         | ステータス |
| -------------------------------- | ---------------------------- | ---------- |
| TASK-FIX-GOOGLE-LOGIN-001       | Googleログイン修正           | **完了**   |
| AUTH-UI-001                      | 認証UI改善                   | **完了**   |
| TASK-AUTH-SESSION-REFRESH-001    | セッション自動リフレッシュ   | **完了**   |
| TASK-UT-AUTH-MODE-UI-INTEGRATION | AuthMode UI統合              | **完了**   |
| UT-STORE-HOOKS-REFACTOR-001      | Store Hooks個別セレクタ再設計 | **完了**（UT-STORE-HOOKS-COMPONENT-MIGRATION-001で実施） |
| UT-STORE-HOOKS-REFACTOR-002      | 状態セレクタのJSDoc追加       | 未実施     |
| UT-STORE-HOOKS-REFACTOR-003      | 合成Hook移行                  | 未実施     |
| UT-FIX-APP-INITAUTH-CHECK-001    | App.tsx initializeAuth確認    | 未実施     |

### AuthGuard timeout / public unauthenticated view 契約

| 項目 | 契約 |
| --- | --- |
| timeout state | `useAuthState` と `getAuthState` が `"timed-out"` を返し、UI は `AuthTimeoutFallback` を表示する |
| public unauthenticated views | `settings` は未認証でも表示維持してよい公開ビューとして扱う |
| reset rule | 未認証かつ初期化完了後に `currentView` を reset する場合、公開ビューは reset 対象から除外する |
| helper | `shouldResetUnauthenticatedView({ isAuthenticated, isLoading, currentView })` 相当の純粋関数で判定する |

### lifecycle entry canonicalization 契約

| 項目 | 契約 |
| --- | --- |
| canonical helper | `normalizeSkillLifecycleView(view)` が legacy alias を canonical `ViewType` へ寄せる |
| 呼び出し責務 | `App.tsx` は `useCurrentView()` の生値を直接分岐せず、正規化後の `currentView` で shell/view を決定する |
| 対象 | 現時点では `skill-center -> skillCenter` のみを吸収し、他 view の正式名は変更しない |
| 理由 | lifecycle task の一次導線契約・画面責務・テスト証跡を `skillCenter` へ一本化し、legacy 値の残存で UI 仕様が二重化しないようにする |

**標準ルール**:

- `PUBLIC_UNAUTHENTICATED_VIEWS` のような単一配列で公開ビューを管理する
- `settings` のような bypass view を追加した場合は、AuthGuard 条件と reset 条件を同時更新する
- 公開ビュー追加時は `AuthGuard` テストだけでなく、view reset テストも追加する

### agentSlice詳細

**状態定義**:

| プロパティ           | 型                     | 説明               |
| -------------------- | ---------------------- | ------------------ |
| `skills`             | `Skill[]`              | スキル一覧         |
| `selectedSkill`      | `Skill \| null`        | 選択中のスキル     |
| `skillFilter`        | `string`               | フィルター文字列   |
| `skillCategory`      | `string \| null`       | カテゴリフィルター |
| `executionStatus`    | `AgentExecutionStatus` | 実行状態           |
| `currentExecutionId` | `string \| null`       | 実行ID             |
| `executionOutput`    | `string[]`             | 実行出力           |
| `isLoading`          | `boolean`              | ローディング状態   |
| `error`              | `string \| null`       | エラーメッセージ   |
| `currentAnalysis`    | `SkillAnalysis \| null` | 分析結果（TASK-10A-D追加） |
| `previousAnalysis`   | `SkillAnalysis \| null` | 改善前スナップショット（TASK-SKILL-LIFECYCLE-04追加） |
| `isAnalyzing`        | `boolean`               | 分析中フラグ（TASK-10A-D追加） |
| `isImproving`        | `boolean`               | 改善中フラグ（TASK-10A-D追加） |
| `recentExecutions`       | `ExecutionSummary[]`    | 実行履歴（最大10件、`MAX_EXECUTION_HISTORY`定数）（TASK-UI-03追加） |
| `isAdvancedSettingsOpen`  | `boolean`               | 詳細設定パネル開閉状態（TASK-UI-03追加） |

> 関連 workflow 正本: `workflow-skill-lifecycle-evaluation-scoring-gate.md`（`previousAnalysis` 追加背景、Phase 11証跡、未タスク canonical path 是正を統合）

**アクション定義**:

| アクション           | 引数                           | 説明           |
| -------------------- | ------------------------------ | -------------- |
| `setSkills`          | `skills: Skill[]`              | スキル一覧設定 |
| `selectSkill`        | `skill: Skill \| null`         | スキル選択     |
| `setSkillFilter`     | `filter: string`               | フィルター設定 |
| `setSkillCategory`   | `category: string \| null`     | カテゴリ設定   |
| `setExecutionStatus` | `status: AgentExecutionStatus` | 実行状態設定   |
| `appendOutput`       | `output: string`               | 出力追加       |
| `clearExecution`     | -                              | 実行クリア     |
| `resetAgentState`    | -                              | 状態リセット   |
| `analyzeSkill`           | `skillName: string`                                  | 分析実行（TASK-10A-D追加）     |
| `applySkillImprovements` | `skillName: string, suggestions: Suggestion[]`       | 改善提案適用（実行前に `previousAnalysis` を保持） |
| `autoImproveSkill`       | `skillName: string`                                  | 全自動改善（TASK-10A-D追加）   |
| `createSkill`            | `description: string, options: CreateOptions`         | スキル作成（TASK-10A-D追加）   |
| `clearAnalysis`          | -                                                     | 分析結果クリア（TASK-10A-D追加） |
| `addExecutionToHistory`      | `summary: ExecutionSummary`                           | 実行履歴に先頭追加、10件超で末尾削除（TASK-UI-03追加） |
| `clearExecutionHistory`      | -                                                     | 実行履歴全クリア（TASK-UI-03追加） |
| `setAdvancedSettingsOpen`    | `isOpen: boolean`                                     | 詳細設定パネル開閉制御（TASK-UI-03追加） |

**ExecutionSummary型（TASK-UI-03追加）**:

| プロパティ         | 型                                                      | 説明                   |
| ------------------ | ------------------------------------------------------- | ---------------------- |
| `executionId`      | `string`                                                | 実行ID                 |
| `skillName`        | `string`                                                | スキル名               |
| `skillDisplayName` | `string`                                                | スキル表示名           |
| `status`           | `"completed" \| "failed" \| "executing" \| "cancelled"` | 実行ステータス         |
| `startedAt`        | `Date`                                                  | 開始日時               |
| `completedAt`      | `Date \| null`                                          | 完了日時（未完了はnull） |
| `duration`         | `number \| null`                                        | 実行時間（ミリ秒、未完了はnull） |

**個別セレクタ一覧（TASK-UI-03追加）**:

| セレクタ                        | 種別     | 返却型                                          |
| ------------------------------- | -------- | ----------------------------------------------- |
| `useRecentExecutions()`         | 状態     | `ExecutionSummary[]`                             |
| `useAddExecutionToHistory()`    | アクション | `(summary: ExecutionSummary) => void`           |
| `useIsAdvancedSettingsOpen()`   | 状態     | `boolean`                                        |
| `useSetAdvancedSettingsOpen()`  | アクション | `(isOpen: boolean) => void`                     |
| `useClearExecutionHistory()`    | アクション | `() => void`                                    |

### 新規Slice追加手順

**ステップ1: Slice定義**

- `store/slices/{name}Slice.ts` を作成
- State、Actions、Slice インターフェースを定義
- initialStateとcreateSlice関数を実装

**ステップ2: Store統合**

- `store/index.ts` でSliceをimport
- createStoreのcombine関数にSliceを追加

**ステップ3: View追加（必要な場合）**

- `views/{Name}View/index.tsx` を作成
- `App.tsx` のrenderView関数にcaseを追加
- `navigation/navContract.ts` の契約へ追加し、`components/organisms/AppDock/index.tsx` から参照

**ステップ4: テスト作成**

- `store/slices/__tests__/{name}Slice.test.ts` を作成
- 全アクションのテストを実装

---
