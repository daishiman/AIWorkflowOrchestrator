# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目      | 内容                                |
| --------- | ----------------------------------- |
| Phase     | 2                                   |
| Phase名   | 設計                                |
| カテゴリ  | 設計                                |
| 機能名    | TASK-7D-chatpanel-agent-integration |
| 作成日    | 2026-01-31                          |
| 前提Phase | Phase 1                             |
| 後続Phase | Phase 3                             |

## 目的

Phase 1で定義した要件を実現可能な構造に落とし込む。ChatPanelとAgent Execution UIの統合設計を行い、コンポーネント構造、状態管理パターン、データフローを設計する。

## 実行タスク

### タスク1: コンポーネント設計

**目的**: ChatPanel統合後のコンポーネント構造とデータフローを設計する。

**手順**:

1. ChatPanelの統合後コンポーネント階層を設計する:

   ```
   ChatPanel (forwardRef)
   ├── Header
   │   ├── ModelSelector (既存)
   │   └── SkillSelector (TASK-7A)
   ├── MessageArea
   │   ├── MessageList (既存チャット)
   │   └── SkillStreamingView (条件付き表示)
   │       ├── StatusBadge
   │       ├── StreamMessageItem (assistant/tool_use/tool_result/error)
   │       └── ToolExecutionHistory (折りたたみ)
   ├── InputArea
   │   └── ChatInput (既存)
   └── Dialogs
       ├── SkillImportDialog (TASK-7B)
       └── PermissionDialog (TASK-7C, Store-direct)
   ```

2. 各コンポーネントのPropsとデータフローを定義する:
   - ChatPanel → SkillSelector: `className`（配置のみ）
   - ChatPanel → SkillStreamingView: `skillName`, `messages`, `status`
   - ChatPanel → SkillImportDialog: `skill`, `isOpen`, `onClose`
   - PermissionDialog: Store-directパターン（ChatPanelからのProps不要）

3. 表示条件ロジックを設計する:
   - SkillStreamingView表示: `isExecuting && selectedSkillName !== null`
   - SkillImportDialog表示: `importDialogSkill !== null`
   - PermissionDialog: 常時マウント（Store内のpendingPermissionで制御）

**期待される成果物**:

- コンポーネント設計書（`outputs/phase-2/component-design.md`）

### タスク2: 状態管理設計

**目的**: ChatPanel統合におけるZustand状態管理パターンを設計する。

**手順**:

1. ChatPanelが購読するskillSlice状態を定義する:

   ```typescript
   // useAppStoreからの取得
   const {
     selectedSkillName, // string | null
     streamingMessages, // SkillStreamMessage[]
     isExecuting, // boolean
     skillExecutionStatus, // SkillExecutionStatus | null
     fetchSkills, // () => Promise<void>
   } = useAppStore();
   ```

2. ChatPanel固有のローカルstateを定義する:

   ```typescript
   const [importDialogSkill, setImportDialogSkill] =
     useState<SkillMetadata | null>(null);
   ```

3. 初期化フローを設計する:
   - useEffectでfetchSkills()を初回実行

4. イベントハンドラを設計する:
   - `handleImportRequest(skill: SkillMetadata)`: SkillSelectorからのインポート要求 → `setImportDialogSkill(skill)`
   - `handleImportDialogClose()`: インポートダイアログ閉じ → `setImportDialogSkill(null)`
   - forwardRef経由の`ChatPanelHandle.handleImportRequest`メソッド

**期待される成果物**:

- 状態管理設計書（`outputs/phase-2/state-management-design.md`）

### タスク3: アーキテクチャ設計

**目的**: 統合全体のアーキテクチャとデータフロー図を作成する。

**手順**:

1. データフロー図を作成する:

   ```
   [skillSlice] → selectedSkillName → [ChatPanel] → skillName → [SkillStreamingView]
   [skillSlice] → streamingMessages → [ChatPanel] → messages → [SkillStreamingView]
   [skillSlice] → skillExecutionStatus → [ChatPanel] → status → [SkillStreamingView]
   [skillSlice] → isExecuting → [ChatPanel] → 条件付きレンダリング
   [skillSlice] → pendingPermission → [PermissionDialog] (Store-direct)
   [SkillSelector] → onImportRequest → [ChatPanel] → importDialogSkill → [SkillImportDialog]
   ```

2. 既存パターンとの整合性を確認する:
   - Store-directパターン: PermissionDialogはTASK-7Cと同じパターンで動作
   - useSkillStoreフック: SkillSelectorは既存のuseSkillStoreを使用（変更不要）
   - shallow比較: 必要な状態のみ購読してリレンダリングを最小化

**期待される成果物**:

- アーキテクチャ設計書（`outputs/phase-2/architecture-design.md`）

## 参照資料

| 参照資料                | パス                                         | 内容                  |
| ----------------------- | -------------------------------------------- | --------------------- |
| Phase 1要件定義書       | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件      |
| Phase 1コンポーネントIF | `outputs/phase-1/component-interfaces.md`    | 統合対象IF一覧        |
| Phase 1ストア依存関係   | `outputs/phase-1/store-dependencies.md`      | skillSlice/agentSlice |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                           | 内容                  |
| ---------------------- | ------------------------------------------------------------------------------ | --------------------- |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | Zustand Sliceパターン |
| Agent SDK UI仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md` | 型定義・IPCチャンネル |
| Agent Execution UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`   | コンポーネント階層    |

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント                   | 契約定義                                                   |
| ------------------------------ | ---------------------------------------------------------- |
| skillSlice → ChatPanel         | useAppStore()でselectedSkillName/streamingMessages等を取得 |
| SkillSelector → ChatPanel      | onImportRequest(skill: SkillMetadata)コールバック          |
| ChatPanel → SkillStreamingView | Props: skillName, messages, status                         |
| skillSlice → PermissionDialog  | Store-direct: pendingPermissionをuseAppStore()で監視       |

## アーキテクチャ層別設計

| 層                         | 設計観点                                 | 仕様参照先                                          |
| -------------------------- | ---------------------------------------- | --------------------------------------------------- |
| フロントエンド（Renderer） | コンポーネント階層、条件付きレンダリング | `aiworkflow-requirements: ui-ux-agent-execution.md` |
| 状態管理                   | skillSliceセレクター、shallow比較        | `aiworkflow-requirements: arch-state-management.md` |

## 成果物

| 成果物             | パス                                         | 種別     |
| ------------------ | -------------------------------------------- | -------- |
| コンポーネント設計 | `outputs/phase-2/component-design.md`        | document |
| 状態管理設計       | `outputs/phase-2/state-management-design.md` | document |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | document |

## 完了条件

- [ ] コンポーネント階層が設計されている
- [ ] 各コンポーネントのProps/データフローが定義されている
- [ ] 表示条件ロジックが設計されている
- [ ] 状態管理パターン（Store取得、ローカルstate）が設計されている
- [ ] イベントハンドラ設計が完了している
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] 既存パターン（Store-direct, useSkillStore）との整合性が確認されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: コンポーネント設計
3. タスク2: 状態管理設計
4. タスク3: アーキテクチャ設計
5. 統合テスト連携の実施
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7D-chatpanel-agent-integration --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート → [phase-3-review-gate.md](phase-3-review-gate.md)
