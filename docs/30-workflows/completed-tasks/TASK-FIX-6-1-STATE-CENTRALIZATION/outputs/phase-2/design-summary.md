# Phase 2: 設計サマリー

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-6-1-STATE-CENTRALIZATION         |
| タスク名   | スキル状態管理のZustand集約（仕様書準拠） |
| Phase      | 2 - 設計                                  |
| 作成日     | 2026-02-09                                |
| 最終更新日 | 2026-02-09                                |
| 依存       | Phase 1: phase-1-requirements.md          |

---

## 1. 設計方針サマリー

### 1.1 基本原則

| 方針                   | 詳細                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| Single Source of Truth | 全てのスキル状態をagentSliceに集約                                |
| 段階的移行             | skillSliceからagentSliceへ10ステップで段階的に移行                |
| 後方互換性維持         | useSkillExecution, useSkillStoreのAPIは変更せず、内部実装のみ変更 |
| Race Condition対策     | executionIdの事前生成パターンでストリームメッセージ損失を防止     |

### 1.2 変更対象ファイル

| ファイル                        | 変更種別 | 概要                                      |
| ------------------------------- | -------- | ----------------------------------------- |
| `store/slices/agentSlice.ts`    | 拡張     | skillSliceの全機能を統合                  |
| `store/slices/skillSlice.ts`    | 削除     | agentSliceへ移行後に削除                  |
| `store/index.ts`                | 変更     | SkillSlice参照削除、useSkillStore実装変更 |
| `store/setupSkillListeners.ts`  | 変更     | agentSlice参照へ変更                      |
| `hooks/useSkillExecution.ts`    | 変更     | agentSliceをデータソースに変更            |
| `views/AgentView/index.tsx`     | 変更     | 直接IPC呼び出しをアクション経由に変更     |
| `components/chat/ChatPanel.tsx` | 微修正   | セレクターパスの調整                      |

---

## 2. 統一状態インターフェース設計

### 2.1 AgentState構造

統合後のAgentStateは以下の5つの論理グループで構成される。

```
AgentState
├── スキル管理（Skill Management）
│   ├── skills: Skill[]
│   ├── availableSkills: Skill[]
│   ├── importedSkillIds: string[]
│   ├── selectedSkill: Skill | null
│   ├── skillFilter: string
│   ├── skillCategory: SkillCategory | null
│   ├── isImportDialogOpen: boolean
│   └── toastMessage: { type, message } | null
│
├── スキル実行状態（Skill Execution）
│   ├── isExecuting: boolean
│   ├── currentExecutionId: string | null
│   ├── executionStatus: SkillExecutionStatus | null
│   ├── streamingMessages: SkillStreamMessage[]
│   ├── executionOutput: string[]
│   └── executionError: string | null
│
├── 権限管理（Permission Management）
│   ├── pendingPermission: SkillPermissionRequest | null
│   └── rememberedPermissionChoices: Record<string, boolean>
│
├── ローディング状態（Loading States）
│   ├── isLoadingSkills: boolean
│   ├── isScanning: boolean
│   ├── isImporting: boolean
│   ├── importingSkillName: string | null
│   └── isLoading: boolean
│
└── エラー・プレビュー（Error & Preview）
    ├── error: string | null
    ├── previewContent: PreviewContent | null
    ├── selectedEnvironment: EnvironmentType
    └── splitRatio: number
```

### 2.2 状態プロパティ数

| グループ           | プロパティ数 |
| ------------------ | ------------ |
| スキル管理         | 8            |
| スキル実行         | 6            |
| 権限管理           | 2            |
| ローディング状態   | 5            |
| エラー・プレビュー | 4            |
| **合計**           | **25**       |

### 2.3 skillSliceからの移行マッピング

| skillSlice              | agentSlice              | 変更点           |
| ----------------------- | ----------------------- | ---------------- |
| availableSkillsMetadata | availableSkills         | 型統一・命名変更 |
| importedSkills          | skills                  | 既存に統合       |
| selectedSkillName       | selectSkillByNameで対応 | アクション化     |
| isExecuting             | isExecuting             | そのまま移行     |
| executionId             | currentExecutionId      | 既存名維持       |
| skillExecutionStatus    | executionStatus         | 命名統一         |
| streamingMessages       | streamingMessages       | そのまま移行     |
| pendingPermission       | pendingPermission       | そのまま移行     |
| skillError              | executionError          | 命名明確化       |
| isLoadingSkills         | isLoadingSkills         | そのまま移行     |
| isScanning              | isScanning              | そのまま移行     |
| isImporting             | isImporting             | そのまま移行     |
| importingSkillName      | importingSkillName      | そのまま移行     |

---

## 3. Race Condition対策設計

### 3.1 問題の本質

```
[現在の問題フロー]
1. executeSkill(prompt) 呼び出し
2. IPC経由でMain Processに送信
3. Main Processからストリームメッセージ送信開始  <-- メッセージ到着
4. IPC応答を受信
5. executionIdをStateに設定  <-- この時点でID未設定

=> (3)で到着したメッセージは(5)より前のため、フィルタリングで破棄される
```

### 3.2 解決策: executionId事前生成パターン

```
[修正後のフロー]
1. executeSkill(prompt) 呼び出し
2. const executionId = generateExecutionId()  <-- ID事前生成
3. set({ currentExecutionId: executionId })   <-- 先にState設定
4. await window.electronAPI.skill.execute({ executionId })
5. Main Processで実行開始
6. ストリームメッセージ到着  <-- この時点でIDがStateに存在
7. _handleStreamMessageでフィルタリング成功

=> メッセージ損失が発生しない
```

### 3.3 実装ポイント

1. **executionId生成関数**
   - `crypto.randomUUID()`を使用（UUID v4形式）
   - フォールバック実装も用意

2. **IPCリクエスト拡張**
   - `SkillExecutionRequest.executionId`をoptionalで追加
   - Main Processはクライアント提供のIDを優先使用

3. **内部ハンドラのフィルタリング**
   - `_handleStreamMessage`: executionIdで照合
   - `_handleComplete`: executionIdで照合
   - `_handleError`: executionIdで照合
   - `_handlePermissionRequest`: executionIdで照合

---

## 4. アクション設計

### 4.1 スキル管理アクション

| アクション         | 説明                         | IPC呼び出し |
| ------------------ | ---------------------------- | ----------- |
| setSkills          | スキル一覧を設定             | -           |
| setAvailableSkills | 利用可能スキル一覧を設定     | -           |
| selectSkill        | スキルを選択                 | -           |
| selectSkillByName  | スキル名でスキルを選択       | -           |
| setSkillFilter     | フィルター文字列を設定       | -           |
| setSkillCategory   | カテゴリフィルターを設定     | -           |
| openImportDialog   | インポートダイアログを開く   | -           |
| closeImportDialog  | インポートダイアログを閉じる | -           |
| showToast          | トーストを表示               | -           |
| clearToast         | トーストをクリア             | -           |

### 4.2 スキルAPIアクション（IPC経由）

| アクション   | 説明               | IPC呼び出し                   |
| ------------ | ------------------ | ----------------------------- |
| fetchSkills  | スキル一覧を取得   | skill:list, skill:getImported |
| rescanSkills | スキルを再スキャン | skill:rescan                  |
| importSkill  | スキルをインポート | skill:import                  |
| removeSkill  | スキルを削除       | skill:remove                  |

### 4.3 スキル実行アクション

| アクション             | 説明                   | 備考                   |
| ---------------------- | ---------------------- | ---------------------- |
| executeSkill           | スキルを実行           | Race Condition対策付き |
| abortExecution         | 実行を中断             | -                      |
| setExecutionStatus     | 実行ステータスを設定   | -                      |
| appendOutput           | 出力を追加             | レガシー互換           |
| clearExecution         | 実行をクリア           | -                      |
| clearStreamingMessages | ストリーミングをクリア | -                      |
| clearExecutionError    | 実行エラーをクリア     | -                      |

### 4.4 内部ハンドラ

| ハンドラ                  | 説明                     | トリガー         |
| ------------------------- | ------------------------ | ---------------- |
| \_handleStreamMessage     | ストリームメッセージ処理 | skill:stream     |
| \_handleComplete          | 実行完了処理             | skill:complete   |
| \_handleError             | 実行エラー処理           | skill:error      |
| \_handlePermissionRequest | 権限リクエスト処理       | skill:permission |

---

## 5. セレクター設計

### 5.1 useSkillStore（複合セレクター）

```typescript
useSkillStore = () =>
  useAppStore((state) => ({
    // 状態
    availableSkills: state.availableSkills,
    importedSkills: state.skills,
    selectedSkillName: state.selectedSkill?.name ?? null,
    isExecuting: state.isExecuting,
    executionId: state.currentExecutionId,
    executionStatus: state.executionStatus,
    streamingMessages: state.streamingMessages,
    pendingPermission: state.pendingPermission,
    skillError: state.executionError,
    isLoadingSkills: state.isLoadingSkills,
    isScanning: state.isScanning,
    isImporting: state.isImporting,
    importingSkillName: state.importingSkillName,
    // アクション
    fetchSkills,
    rescanSkills,
    importSkill,
    removeSkill,
    selectSkill,
    selectSkillByName,
    executeSkill,
    abortExecution,
    respondToPermission,
    clearError,
    clearStreamingMessages,
  }));
```

### 5.2 個別セレクター（最適化用）

| セレクター              | 取得プロパティ    | 用途               |
| ----------------------- | ----------------- | ------------------ |
| useSkillExecutionStatus | executionStatus   | 実行ステータス監視 |
| useStreamingMessages    | streamingMessages | ストリーム表示     |
| usePendingPermission    | pendingPermission | 権限ダイアログ表示 |
| useIsExecuting          | isExecuting       | ローディング表示   |

---

## 6. 移行計画（10ステップ）

| Step | 作業内容                                     | 検証                         |
| ---- | -------------------------------------------- | ---------------------------- |
| 1    | agentSliceに状態プロパティを追加             | TypeCheck PASS               |
| 2    | agentSliceにアクションを追加                 | TypeCheck PASS               |
| 3    | agentSliceに内部ハンドラを追加               | TypeCheck PASS               |
| 4    | setupSkillListenersをagentSlice参照に変更    | IPCリスナーテスト PASS       |
| 5    | useSkillStoreをagentSliceベースに変更        | useSkillStoreテスト PASS     |
| 6    | useSkillExecutionをagentSliceベースに変更    | useSkillExecutionテスト PASS |
| 7    | AgentViewをagentSliceアクション経由に変更    | AgentViewテスト PASS         |
| 8    | ChatPanelのセレクターを確認・調整            | ChatPanelテスト PASS         |
| 9    | skillSlice.ts削除、store/index.ts参照削除    | 全テスト PASS                |
| 10   | skillSliceテストをagentSliceテストとして移行 | 全テスト PASS                |

---

## 7. テスト移行計画

| 既存テストファイル                  | 移行先                                    | テスト件数 |
| ----------------------------------- | ----------------------------------------- | ---------- |
| skillSlice.test.ts                  | agentSlice.skill.test.ts                  | 59件       |
| skillSlice.edge-cases.test.ts       | agentSlice.skill.edge-cases.test.ts       | 16件       |
| skillSlice.state-transition.test.ts | agentSlice.skill.state-transition.test.ts | 17件       |
| skillSlice.ipc.test.ts              | agentSlice.skill.ipc.test.ts              | 14件       |
| skillSlice.integration.test.ts      | agentSlice.skill.integration.test.ts      | 7件        |
| **合計**                            |                                           | **113件**  |

---

## 8. エラーハンドリング設計

### 8.1 エラーメッセージ定数

```typescript
const AGENT_ERRORS = {
  SKILL_NOT_SELECTED: "スキルが選択されていません",
  SKILL_API_NOT_AVAILABLE: "Skill API not available",
  FETCH_FAILED: "スキル一覧の取得に失敗",
  SCAN_FAILED: "スキル再スキャンに失敗",
  IMPORT_FAILED: "スキルのインポートに失敗",
  REMOVE_FAILED: "スキルの削除に失敗",
  EXECUTE_FAILED: "実行開始に失敗",
} as const;
```

### 8.2 エラーフォーマット

- エラーはユーザー向けメッセージとして整形
- 内部エラー詳細はコンソールにのみ出力
- executionErrorとerrorを適切に使い分け

---

## 9. 完了条件

- [x] 統一状態設計（AgentState）が定義されている
- [x] skillSliceからの移行対象が特定されている
- [x] race condition対策が設計されている
- [x] IPCイベントハンドラが設計されている
- [x] 移行計画（10ステップ）が定義されている
- [x] 仕様書との整合性が確認されている

---

## 10. 次Phaseへの引き継ぎ事項

### Phase 3（設計レビュー）への引き継ぎ

1. **レビュー観点**
   - 仕様書準拠（arch-state-management.md）
   - 型安全性（型アサーション排除）
   - IPC連携（Race Condition対策の妥当性）
   - 後方互換性（公開API維持）
   - パフォーマンス（セレクター最適化）

2. **確認すべきポイント**
   - cross-sliceアクセスパターン（permissionHistorySlice）
   - useSkillStoreのshallow比較適用
   - streamingMessagesの上限設定（1000件）

3. **仕様書更新が必要な箇所**
   - arch-state-management.md: skillSlice削除の記録
   - interfaces-agent-sdk-skill.md: SkillSlice統合完了の記載
