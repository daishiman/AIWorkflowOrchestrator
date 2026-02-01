# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目      | 内容                                |
| --------- | ----------------------------------- |
| Phase     | 1                                   |
| Phase名   | 要件定義                            |
| カテゴリ  | 要件                                |
| 機能名    | TASK-7D-chatpanel-agent-integration |
| 作成日    | 2026-01-31                          |
| 前提Phase | なし（TASK-7A/7B/7C/6-1/5-1 完了）  |
| 後続Phase | Phase 2                             |

## 目的

ChatPanel統合に必要な要件を明確化し、既存コンポーネントの現状分析を行う。TASK-7A（SkillSelector）、TASK-7B（SkillImportDialog）、TASK-7C（PermissionDialog）の実装成果物を確認し、ChatPanelへの統合要件を定義する。

## 実行タスク

### タスク1: 既存ChatPanelコンポーネントの現状分析

**目的**: 統合対象となるChatPanelの現在の構造・Props・依存関係を把握する。

**手順**:

1. `apps/desktop/src/renderer/components/chat/` ディレクトリ内の全ファイルを確認する
2. ChatPanel.tsx の構造を分析する（forwardRef、ChatPanelHandle、ChatPanelProps）
3. StreamingMessage.tsx のProps（content, isStreaming, showCursor, onCancel, className）とインターフェースを確認する
4. ChatPanelが依存しているストア（useAppStore）の状態・アクションを一覧化する
   - selectedSkillName, streamingMessages, isExecuting, skillExecutionStatus, fetchSkills
5. 既存の**tests**ディレクトリ内のテストファイル（ChatPanel.test.tsx: 311行、StreamingMessage.test.tsx: 513行）を確認する

**期待される成果物**:

- 既存ChatPanel構造分析レポート（`outputs/phase-1/chatpanel-analysis.md`）

### タスク2: TASK-7A/7B/7C成果物の確認

**目的**: 統合対象コンポーネントのインターフェースと依存関係を正確に把握する。

**手順**:

1. `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`（446行）を読み込み、Propsを確認する
   - `className?: string`（Propsインターフェース）
   - 内部で`useSkillStore()`フックを使用
   - `onImportRequest`はimportedSkillsとavailableSkillsの差分からunimportedSkillsを計算
2. `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`（276行）を読み込み、Propsを確認する
   - `skill: SkillMetadata`、`isOpen: boolean`、`onClose: () => void`
3. `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`（272行）を読み込み、Propsを確認する
   - Store-directパターン（Props なし、内部でuseAppStoreからpendingPermissionを監視）
   - TOOL_ICONSマッピング、getDescription()による人間可読説明
4. `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`（252行）を読み込み、Propsを確認する
   - `skillName: string`、`messages: SkillStreamMessage[]`、`status: SkillExecutionStatus | null`
   - サブコンポーネント: StatusBadge、StreamMessageItem、ToolExecutionHistory
5. `apps/desktop/src/renderer/components/skill/index.ts`のエクスポート内容を確認する
6. 各コンポーネントのテストファイルを確認し、テスト済みインターフェースを記録する

**期待される成果物**:

- コンポーネントインターフェース一覧（`outputs/phase-1/component-interfaces.md`）

### タスク3: SkillSlice/AgentSliceの状態・アクション確認

**目的**: ChatPanelが使用するZustandストアの状態とアクションを明確化する。

**手順**:

1. `apps/desktop/src/renderer/store/slices/skillSlice.ts`（348行）を読み込む
2. ChatPanel統合に必要な状態を特定する:
   - `selectedSkillName: string | null` — 選択中のスキル名表示
   - `streamingMessages: SkillStreamMessage[]` — ストリーミング表示
   - `isExecuting: boolean` — 実行中判定
   - `skillExecutionStatus: SkillExecutionStatus | null` — ステータスバッジ
   - `pendingPermission: SkillPermissionRequest | null` — 権限ダイアログ表示判定
   - `importedSkills: ImportedSkill[]` — インポート済みスキル
   - `availableSkillsMetadata: SkillMetadata[]` — 利用可能スキル
3. ChatPanel統合に必要なアクションを特定する:
   - `fetchSkills()` — スキル一覧取得（useEffectで初回呼び出し）
   - `abortExecution()` — 実行中止
   - `executeSkill(prompt)` — スキル実行
   - `respondToSkillPermission(approved, remember?)` — 権限応答
4. `apps/desktop/src/renderer/store/slices/agentSlice.ts`（440行）を読み込む
5. agentSliceのexecutionState構造を確認する:
   - status: "idle" | "executing" | "streaming" | "error" | "awaiting_permission" | "cancelled"
   - currentSkill, messages, currentStreamingContent, error, pendingPermission
6. `packages/shared/src/types/skill.ts`の型定義を確認する:
   - SkillStreamMessage（discriminated union: assistant/tool_use/tool_result/status/error）
   - SkillExecutionStatus（idle/running/permission_pending/completed/cancelled/error）
   - SkillMetadata、ImportedSkill、SkillPermissionRequest
7. `apps/desktop/src/renderer/store/index.ts`のAppStore型合成を確認する

**期待される成果物**:

- ストア依存関係マップ（`outputs/phase-1/store-dependencies.md`）

### タスク4: UI/UX仕様の要件抽出

**目的**: aiworkflow-requirementsからChatPanel統合のUI/UX要件を抽出する。

**手順**:

1. `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`を読み込む
   - コンポーネント階層（AgentExecutionView → AgentChatInterface → AgentMessageInput → AgentExecutionControls）
   - PermissionDialog仕様（モーダル、フォーカストラップ、3ボタンパターン）
   - permissionDescriptions（12ツールテンプレート）
2. `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`を読み込む
   - AgentExecutionStatus型定義
   - IPCチャンネル（agent:start, agent:stop, agent:stream, agent:complete, agent:error, agent:permission）
   - Preload API（startExecution, stopExecution, respondToPermission, onStream, onPermissionRequest）
3. 以下の要件を抽出・文書化する:
   - SkillSelectorの配置位置（ChatPanelヘッダー）
   - ストリーミング表示のレイアウト（メッセージタイプ別: assistant, tool_use, tool_result, error）
   - ステータスバッジの色・ラベル定義（running→青, permission_pending→黄, completed→緑, cancelled→灰, error→赤）
   - ツール実行履歴の折りたたみUI（details/summary）
   - 実行中止ボタンの表示条件（status === "running"）
   - アクセシビリティ要件（role="log", aria-live="polite", aria-label, role="status"）

**期待される成果物**:

- UI/UX要件定義書（`outputs/phase-1/ui-ux-requirements.md`）

### タスク5: 要件定義書の統合

**目的**: タスク1〜4の分析結果を統合し、Phase 2（設計）への入力となる要件定義書を作成する。

**手順**:

1. タスク1〜4の成果物を統合する
2. 機能要件（FR）を列挙する:
   - FR-1: SkillSelectorをChatPanelヘッダーに配置する
   - FR-2: SkillStreamingViewで実行結果をリアルタイム表示する
   - FR-3: StatusBadgeでステータスを表示する（6種類の色分け）
   - FR-4: ToolExecutionHistoryでツール実行履歴を折りたたみ表示する
   - FR-5: SkillImportDialogをインポート要求時に表示する
   - FR-6: PermissionDialogを権限確認時にオーバーレイ表示する
   - FR-7: 実行中止ボタンでabortExecutionを呼び出す
   - FR-8: 実行完了後に通常チャットモードに復帰する
3. 非機能要件（NFR）を列挙する:
   - NFR-1: 既存チャット機能（通常チャット、ストリーミング）に影響を与えない
   - NFR-2: アクセシビリティ（WCAG 2.1 AA）準拠
   - NFR-3: TypeScript strict型安全性の維持
   - NFR-4: Line Coverage 95%以上、Branch Coverage 85%以上
   - NFR-5: 既存テスト57件が全てPASS

**期待される成果物**:

- 統合要件定義書（`outputs/phase-1/requirements-definition.md`）

## 参照資料

| 参照資料               | パス                                                                           | 内容                       |
| ---------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | Zustand Sliceパターン設計  |
| Agent SDK UI仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md` | IPC/Preload/型定義         |
| Agent Execution UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`   | コンポーネント階層・UI仕様 |
| UI/UXデザイン原則      | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | Apple HIG準拠デザイン原則  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                                | 内容                       |
| ---------------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`        | skillSlice/agentSlice設計  |
| Agent SDK UI仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`      | 型定義・IPCチャンネル      |
| Agent Execution UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`        | コンポーネント階層・a11y   |
| Agent SDK実装履歴      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md` | 完了タスク・品質メトリクス |

## 統合テスト連携

### このフェーズで特定すべき統合テスト観点

| カテゴリ           | テスト観点                                                    |
| ------------------ | ------------------------------------------------------------- |
| データフロー       | SkillSlice → ChatPanel → SkillStreamingViewのデータフロー     |
| 状態同期           | skillExecutionStatus/isExecutingの状態変更がUIに反映されるか  |
| コンポーネント連携 | SkillSelectorのonImportRequestがSkillImportDialogを表示するか |
| 権限フロー         | pendingPermission発生時にPermissionDialogが表示されるか       |
| エラーハンドリング | skillError発生時にエラーメッセージが表示されるか              |

## 多角的観点チェック

### Renderer（フロントエンド）層

| 観点             | 確認項目                                                |
| ---------------- | ------------------------------------------------------- |
| UI/UX            | ステップベース表示が要件に含まれるか                    |
| アクセシビリティ | WCAG 2.1 AA準拠（aria-live、aria-busy、フォーカス管理） |
| 状態管理         | useAppStoreからの状態取得パターンが既存と一貫しているか |

## 成果物

| 成果物               | パス                                         | 種別     |
| -------------------- | -------------------------------------------- | -------- |
| ChatPanel構造分析    | `outputs/phase-1/chatpanel-analysis.md`      | document |
| コンポーネントIF一覧 | `outputs/phase-1/component-interfaces.md`    | document |
| ストア依存関係マップ | `outputs/phase-1/store-dependencies.md`      | document |
| UI/UX要件定義書      | `outputs/phase-1/ui-ux-requirements.md`      | document |
| 統合要件定義書       | `outputs/phase-1/requirements-definition.md` | document |

## 完了条件

- [ ] 既存ChatPanelの構造が分析され文書化されている
- [ ] TASK-7A/7B/7Cの全コンポーネントのProps/インターフェースが確認されている
- [ ] SkillSlice/AgentSliceの必要な状態・アクションが特定されている
- [ ] UI/UX仕様からChatPanel統合要件が抽出されている
- [ ] 統合要件定義書が作成され、機能要件（FR-1〜8）・非機能要件（NFR-1〜5）が列挙されている
- [ ] 統合テスト観点が特定されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: 既存ChatPanelコンポーネントの現状分析
3. タスク2: TASK-7A/7B/7C成果物の確認
4. タスク3: SkillSlice/AgentSliceの状態・アクション確認
5. タスク4: UI/UX仕様の要件抽出
6. タスク5: 要件定義書の統合
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7D-chatpanel-agent-integration --phase 1
```

## 次のPhase

Phase 2: 設計 → [phase-2-design.md](phase-2-design.md)
