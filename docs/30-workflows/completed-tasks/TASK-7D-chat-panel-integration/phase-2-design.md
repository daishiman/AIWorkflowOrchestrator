# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 2                              |
| Phase名   | 設計                           |
| カテゴリ  | 設計                           |
| 機能名    | TASK-7D-chat-panel-integration |
| 作成日    | 2026-01-30                     |
| 前提Phase | Phase 1                        |
| 後続Phase | Phase 3                        |

## 目的

Phase 1 の要件定義に基づき、ChatPanel 統合のコンポーネント設計と SkillStreamingView の詳細設計を行う。既存の ChatPanel レイアウトへの統合方針と、新規 SkillStreamingView コンポーネントのサブコンポーネント構成を確定する。

## 実行タスク

### タスク1: ChatPanel 統合レイアウト設計

**目的**: ChatPanel への SkillSelector/SkillImportDialog/PermissionDialog の配置とレイアウト構成を設計する。

**手順**:

1. ChatPanel の全体構成を 3 領域に分割して設計する:
   - **ヘッダー領域**: ModelSelector + SkillSelector を横並び配置（`flex items-center gap-4`）
   - **メッセージ領域**: MessageList + SkillStreamingView（実行中のみ表示）
   - **入力領域**: ChatInput（既存のまま）
2. ダイアログの配置を設計する:
   - SkillImportDialog: ChatPanel 内部で `useState` で制御（`importDialogSkill` state）
   - PermissionDialog: Store-direct パターン（pendingPermission の有無で自動表示）
3. ChatPanel の JSX 構造を設計する:

```
ChatPanel（flex flex-col h-full）
├── ヘッダー（flex items-center gap-4 px-4 py-2 border-b）
│   ├── ModelSelector（既存）
│   └── SkillSelector（onImportRequest コールバック）
├── メッセージ領域（flex-1 overflow-y-auto）
│   ├── MessageList（既存）
│   └── SkillStreamingView（条件付き表示: isExecuting && selectedSkillName）
├── 入力領域
│   └── ChatInput（既存）
└── ダイアログ群
    ├── SkillImportDialog（importDialogSkill state で制御）
    └── PermissionDialog（Store-direct、常時マウント）
```

4. 状態管理の設計:
   - ChatPanel ローカル state: `importDialogSkill: SkillMetadata | null`（useState）
   - Store からの取得: `selectedSkillName`, `streamingMessages`, `isExecuting`, `skillExecutionStatus`, `fetchSkills`

**期待される成果物**:

- ChatPanel 統合レイアウト設計書（`outputs/phase-2/chatpanel-layout-design.md`）

### タスク2: SkillStreamingView コンポーネント設計

**目的**: スキル実行結果をストリーミング表示する SkillStreamingView コンポーネントの詳細設計を行う。

**手順**:

1. SkillStreamingView の Props インターフェースを設計する:

```typescript
interface SkillStreamingViewProps {
  skillName: string;
  messages: SkillStreamMessage[];
  status: SkillExecutionStatus | null;
}
```

2. サブコンポーネント構成を設計する:

```
SkillStreamingView（border-t p-4 bg-gray-50）
├── ヘッダー（flex items-center justify-between mb-4）
│   ├── スキル名表示（font-medium）
│   ├── StatusBadge（ステータス別色・ラベル）
│   └── 中止ボタン（status === "running" 時のみ表示）
├── メッセージ表示（space-y-3）
│   └── StreamMessageItem（message.type で分岐）
│       ├── type "assistant": テキスト表示 + パーシャルカーソル
│       ├── type "tool_use": ツール名表示（bg-blue-50）
│       ├── type "tool_result": 成功/失敗表示（bg-green-50/bg-red-50）
│       └── type "error": エラー表示（bg-red-50 text-red-600）
└── ToolExecutionHistory（折りたたみ表示）
    └── details/summary でツール履歴を表示
```

3. StatusBadge のステータス定義:

| ステータス         | 色            | ラベル     |
| ------------------ | ------------- | ---------- |
| running            | bg-blue-500   | 実行中...  |
| permission_pending | bg-yellow-500 | 権限確認   |
| completed          | bg-green-500  | 完了       |
| cancelled          | bg-gray-500   | キャンセル |
| error              | bg-red-500    | エラー     |

4. StreamMessageItem の表示ロジック:

| type        | 表示内容                                                         |
| ----------- | ---------------------------------------------------------------- |
| assistant   | `message.content.text` + パーシャルカーソル（`▌` animate-pulse） |
| tool_use    | `🔧 ツール使用: {toolName}`（bg-blue-50）                        |
| tool_result | `✅ 完了` or `❌ エラー: {error}`（bg-green-50/bg-red-50）       |
| error       | エラーメッセージ表示（bg-red-50）                                |

**期待される成果物**:

- SkillStreamingView 設計書（`outputs/phase-2/skill-streaming-view-design.md`）

### タスク3: コンポーネント間データフロー設計

**目的**: ChatPanel と各サブコンポーネント間のデータフローを設計する。

**手順**:

1. Zustand Store → ChatPanel のデータフローを設計する:

```
useAppStore() → {
  selectedSkillName,      // → SkillStreamingView.skillName
  streamingMessages,      // → SkillStreamingView.messages
  isExecuting,            // → SkillStreamingView 表示条件
  skillExecutionStatus,   // → SkillStreamingView.status
  fetchSkills,            // → useEffect で初回呼び出し
}
```

2. SkillSelector → ChatPanel のイベントフロー:

```
SkillSelector.onImportRequest(skill: SkillMetadata)
  → ChatPanel.setImportDialogSkill(skill)
  → SkillImportDialog 表示
```

3. SkillStreamingView → Store のイベントフロー:

```
中止ボタン onClick
  → useAppStore().abortExecution()
  → Store が executionStatus を "cancelled" に更新
```

4. useEffect での初期化フロー:

```
ChatPanel マウント時
  → fetchSkills() 呼び出し
  → availableSkillsMetadata/importedSkills が更新される
```

**期待される成果物**:

- データフロー設計書（`outputs/phase-2/data-flow-design.md`）

### タスク4: アクセシビリティ設計

**目的**: WCAG 2.1 AA 準拠のアクセシビリティ設計を行う。

**手順**:

1. SkillStreamingView のアクセシビリティ属性を設計する:
   - ストリーミング表示エリア: `role="log"` + `aria-live="polite"` + `aria-label="スキル実行結果"`
   - StatusBadge: `role="status"` + `aria-label="{ステータスラベル}"`
   - 中止ボタン: `aria-label="スキル実行を中止する"`
2. ChatPanel ヘッダーのアクセシビリティを設計する:
   - ヘッダー: `role="toolbar"` + `aria-label="チャット設定"`
3. フォーカス管理:
   - PermissionDialog 表示時にフォーカスをダイアログに移動（既存実装で対応済み）
   - SkillImportDialog 表示時にフォーカスをダイアログに移動（既存実装で対応済み）

**期待される成果物**:

- アクセシビリティ設計書（`outputs/phase-2/accessibility-design.md`）

## 参照資料

| 参照資料              | パス                                                                              |
| --------------------- | --------------------------------------------------------------------------------- |
| Phase 1 成果物        | `outputs/phase-1/requirements-definition.md`                                      |
| 機能仕様書 4.1        | `docs/30-workflows/skill-import-agent-system/specification.md`                    |
| 機能仕様書 4.4.1      | `docs/30-workflows/skill-import-agent-system/specification.md`                    |
| 機能仕様書 4.7        | `docs/30-workflows/skill-import-agent-system/specification.md`                    |
| UI/UX デザイン原則    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    |
| UI/UX SkillStream仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md` |

## 統合テスト連携

### このフェーズで設計すべき統合テストシナリオ

| カテゴリ           | テストシナリオ                                               |
| ------------------ | ------------------------------------------------------------ |
| データフロー       | Store の状態変更 → ChatPanel → SkillStreamingView の表示更新 |
| コンポーネント連携 | SkillSelector の onImportRequest → SkillImportDialog 表示    |
| 権限フロー         | pendingPermission 変更 → PermissionDialog の表示/非表示      |
| 実行フロー         | isExecuting 変更 → SkillStreamingView の表示/非表示          |

## 多角的観点チェック

### Renderer（フロントエンド）層

| 観点               | 確認項目                                                                  |
| ------------------ | ------------------------------------------------------------------------- |
| コンポーネント設計 | Atomic Design に準拠し、再利用可能なサブコンポーネントに分割されているか  |
| 状態管理           | Store-direct パターンと Props パターンの使い分けが適切か                  |
| レイアウト         | Tailwind CSS のユーティリティクラスで一貫したレイアウトが定義されているか |
| アクセシビリティ   | WCAG 2.1 AA の要件が設計に反映されているか                                |

## 成果物

| 成果物                   | パス                                             | 種別     |
| ------------------------ | ------------------------------------------------ | -------- |
| ChatPanel レイアウト設計 | `outputs/phase-2/chatpanel-layout-design.md`     | document |
| SkillStreamingView 設計  | `outputs/phase-2/skill-streaming-view-design.md` | document |
| データフロー設計         | `outputs/phase-2/data-flow-design.md`            | document |
| アクセシビリティ設計     | `outputs/phase-2/accessibility-design.md`        | document |

## 完了条件

- [ ] ChatPanel の 3 領域レイアウト（ヘッダー/メッセージ/入力）が設計されている
- [ ] SkillSelector の配置位置（ModelSelector の隣）が確定している
- [ ] SkillStreamingView の Props・サブコンポーネント構成が設計されている
- [ ] StatusBadge の全ステータス（running/permission_pending/completed/cancelled/error）の色・ラベルが定義されている
- [ ] StreamMessageItem の全メッセージタイプ（assistant/tool_use/tool_result/error）の表示ロジックが設計されている
- [ ] ToolExecutionHistory の折りたたみ UI が設計されている
- [ ] コンポーネント間のデータフローが設計されている
- [ ] アクセシビリティ属性が設計されている
- [ ] 統合テストシナリオが特定されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: ChatPanel 統合レイアウト設計
3. タスク2: SkillStreamingView コンポーネント設計
4. タスク3: コンポーネント間データフロー設計
5. タスク4: アクセシビリティ設計
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7D-chat-panel-integration --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート → [phase-3-review-gate.md](phase-3-review-gate.md)
