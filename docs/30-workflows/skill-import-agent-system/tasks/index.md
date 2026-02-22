# タスク一覧

スキルインポートエージェントシステムの全タスク仕様書。

---

## クイックサマリー

| ティア                | 内容                          | タスク数 | 目的                                                                 |
| --------------------- | ----------------------------- | -------- | -------------------------------------------------------------------- |
| 🔧 **Tier 0: 修正**   | 仕様書準拠修正（前提タスク）  | 7        | 既存実装の整合性確保                                                 |
| 🎯 **Tier 1: MVP**    | 基本機能（Phase 1-8）         | 24       | スキル実行・インポート・権限管理                                     |
| 🚀 **Tier 2: 拡張**   | スキル管理（Phase 9A-C, 10A） | 17       | 作成・編集・改善                                                     |
| 🔮 **Tier 3: 将来**   | 高度な機能（Phase 9D-J）      | 7        | チェーン・共有・統計                                                 |
| 🎨 **Tier 4: UI刷新** | Apple HIG準拠UI刷新           | 10       | 基盤・ナビ・ワークスペース・検索・スキル管理・通知・オンボーディング |

**推奨実行順序**: **Tier 0** → Tier 1 完了 → Tier 2 → Tier 3（オプション） / **Tier 4** は Tier 1 以降いつでも並行実行可能

---

## ロードマップ（仕様書準拠への道筋）

### 現状の問題

2026-02-03の調査で、以下の仕様書乖離が発見された：

| 問題カテゴリ  | 仕様書（正）                            | 現在の実装                                    | 対応タスク   |
| ------------- | --------------------------------------- | --------------------------------------------- | ------------ |
| 型定義        | SkillMetadata（単一）                   | Skill, ImportedSkill, SkillMetadata（3種類）  | TASK-FIX-1-1 |
| IPCチャンネル | skill:list, skill:import, skill:execute | 10+のチャンネル（重複・未実装混在）           | TASK-FIX-4-1 |
| Preload API   | 単一のSkillAPI                          | 2つの定義（異なるシグネチャ）                 | TASK-FIX-5-1 |
| 状態管理      | agentSlice（単一）                      | skillSlice + skillExecutionSlice + agentSlice | TASK-FIX-6-1 |

### 修正フロー（Tier 0）

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔧 Tier 0: 仕様書準拠修正（Tier 1の前提）                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [TASK-FIX-1-1 型定義統一]                                                  │
│         │                                                                   │
│         ▼                                                                   │
│  [TASK-FIX-4-1 IPCチャンネル整理]                                           │
│         │                                                                   │
│         ▼                                                                   │
│  [TASK-FIX-5-1 SkillAPI統一]                                                │
│         │                                                                   │
│         ▼                                                                   │
│  [TASK-FIX-6-1 状態管理集約]                                                │
│         │                                                                   │
│         ▼                                                                   │
│  ════════════════════════════════════════════════════════════════════════   │
│         │                                                                   │
│         ▼                                                                   │
│  [Tier 1: MVP タスク開始]                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 推奨実行順序（全体）

```
Step 0-1: TASK-FIX-1-1 型定義統一
Step 0-2: TASK-FIX-4-1 IPCチャンネル整理  ← 0-1と並列可
Step 0-3: TASK-FIX-5-1 SkillAPI統一       ← 0-1, 0-2完了後
Step 0-4: TASK-FIX-6-1 状態管理集約       ← 0-3完了後
━━━━━━━━━━━━━━━━ Tier 0 修正完了 ━━━━━━━━━━━━━━━━
Step 1: [1-1] 共通型定義（仕様書の新型を追加）
Step 2: [2A] [2B] [2C]                    ← 3タスク並列
...（Tier 1 以降は既存の順序に従う）
```

---

## 🔧 Tier 0: 仕様書準拠修正（7タスク）

> **重要**: これらのタスクはTier 1の前提として実行必須。既存実装の仕様書乖離を解消する。

| ID                                 | タイトル                                                                                            | 依存             | 複雑度 | ステータス |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------- | ------ | ---------- |
| TASK-FIX-1-1                       | [型定義統一](./task-fix-1-1-type-alignment.md)                                                      | -                | medium | pending    |
| TASK-FIX-4-1                       | [IPCチャンネル整理](./task-fix-4-1-ipc-consolidation.md)                                            | FIX-1-1（推奨）  | medium | pending    |
| TASK-FIX-5-1                       | [SkillAPI統一](./task-fix-5-1-skill-api-unification.md)                                             | FIX-1-1, FIX-4-1 | medium | pending    |
| TASK-FIX-6-1                       | [状態管理集約](./task-fix-6-1-state-centralization.md)                                              | FIX-5-1          | medium | pending    |
| UT-FIX-AGENTVIEW-INFINITE-LOOP-001 | [AgentView無限ループ修正](./completed-task/00-task-agentview-infinite-loop-fix.md)                  | FIX-6-1          | medium | completed  |
| TASK-FIX-13-1                      | [deprecatedプロパティ正式移行](./completed-task/06b-task-fix-13-1-deprecated-property-migration.md) | FIX-5-1, FIX-6-1 | small  | completed  |
| TASK-FIX-10-1                      | [Vitestエラー隠蔽設定解消](./completed-task/07-task-fix-10-1-vitest-error-handling.md)              | FIX-11-1         | medium | completed  |

### Tier 0 完了条件

- [ ] 型定義が`@repo/shared/src/types/skill.ts`に集約
- [ ] IPCチャンネルが仕様書の命名に準拠
- [ ] SkillAPIが単一のインターフェースに統一
- [ ] 状態管理がagentSlice単一に集約
- [ ] 全テストがPASS

---

---

## 進捗トラッキング

```bash
# 全タスク進捗
grep -h "^status:" tasks/task-*.md | sort | uniq -c

# ティア別進捗
grep -l "tier: 1" tasks/task-*.md | xargs grep "^status:" | sort | uniq -c
```

---

## 依存関係グラフ（簡略版）

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🎯 Tier 1: MVP（リリース必須）                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [1-1 型定義] ──┬── [2A Scanner] ──┐                                       │
│                ├── [2B Store]    ──┼── [3-1-A SDK] ─┬─ [3-1-B Hooks]       │
│                └── [2C Security] ──┘                └─ [3-1-C Permission]   │
│                                     [3-2 Permission Resolver]               │
│                                                  │                          │
│                         [4-1 IPC定義] ──── [4-2 IPCハンドラ]                │
│                                                  │                          │
│                                                  ▼                          │
│                                           [5-1 SkillAPI]                    │
│                                                  │                          │
│                                                  ▼                          │
│                                           [6-1 SkillSlice]                  │
│                                           ┌──────┼──────┐                   │
│                                           ▼      ▼      ▼                   │
│                                    [7A Selector][7B Import][7C Perm]        │
│                                           └──────┬──────┘                   │
│                                                  ▼                          │
│                                      [7D ChatPanel統合]                     │
│                                   ┌──────────┼──────────┐                   │
│                                   ▼          ▼          ▼                   │
│                             [8A Unit] [8B Component] [8C-A~E E2E]           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  🚀 Tier 2: 拡張（推奨）                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [9A-A FileManager] ─┬─ [9A-B IPC] ─── [9A-C Editor UI]                    │
│                      │                                                      │
│  [9B-A SKILL.md] ────┼─ [9B-B~F Agents/Refs] ─── [9B-G Service]            │
│                      │                                                      │
│  [9C Improver]  ─────┘                                                      │
│                                                                             │
│           └──────────────────────┬──────────────────────┘                   │
│                                  ▼                                          │
│         [10A-A ManagementPanel] [10A-B Analysis] [10A-C Wizard]             │
│                        └──────────────┬──────────────┘                      │
│                                       ▼                                     │
│                              [10A-D Integration]                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔮 Tier 3: 将来（オプション）                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [9D Chain] [9E Fork] [9F Share] [9G Schedule]                              │
│  [9H Debug] [9I Docs] [9J Analytics]                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Tier 1: MVP（24タスク）

> スキルのインポート・実行・権限管理の基本機能

### Phase 1: 基盤層

| ID       | タイトル                                     | 依存 | 複雑度 | ステータス |
| -------- | -------------------------------------------- | ---- | ------ | ---------- |
| TASK-1-1 | [共通型定義](./task-1-1-type-definitions.md) | -    | small  | pending    |

### Phase 2: サービス層（並列可）

| ID      | タイトル                                            | 依存 | 複雑度 | ステータス |
| ------- | --------------------------------------------------- | ---- | ------ | ---------- |
| TASK-2A | [SkillScanner](./task-2a-skill-scanner.md)          | 1-1  | medium | pending    |
| TASK-2B | [SkillImportStore](./task-2b-skill-import-store.md) | 1-1  | medium | pending    |
| TASK-2C | [SecurityPatterns](./task-2c-security-patterns.md)  | 1-1  | small  | pending    |

### Phase 3: 実行エンジン

| ID         | タイトル                                                     | 依存       | 複雑度 | ステータス |
| ---------- | ------------------------------------------------------------ | ---------- | ------ | ---------- |
| TASK-3-1-A | [SDK query()基本実装](./task-3-1-a-sdk-query.md)             | 2A, 2B, 2C | medium | pending    |
| TASK-3-1-B | [Hooks実装](./task-3-1-b-hooks.md)                           | 3-1-A      | medium | pending    |
| TASK-3-1-C | [PermissionRequest Hook](./task-3-1-c-permission-request.md) | 3-1-A      | medium | pending    |
| TASK-3-2   | [PermissionResolver](./task-3-2-permission-resolver.md)      | 2A, 2B, 2C | small  | pending    |

### Phase 4: IPC層

| ID       | タイトル                                      | 依存         | 複雑度 | ステータス |
| -------- | --------------------------------------------- | ------------ | ------ | ---------- |
| TASK-4-1 | [IPCチャネル定義](./task-4-1-ipc-channels.md) | 3-1-A~C, 3-2 | small  | pending    |
| TASK-4-2 | [IPCハンドラー](./task-4-2-ipc-handlers.md)   | 4-1          | medium | pending    |

### Phase 5: Preload API

| ID       | タイトル                            | 依存     | 複雑度 | ステータス |
| -------- | ----------------------------------- | -------- | ------ | ---------- |
| TASK-5-1 | [SkillAPI](./task-5-1-skill-api.md) | 4-1, 4-2 | medium | pending    |

### Phase 6: 状態管理

| ID       | タイトル                                | 依存 | 複雑度 | ステータス |
| -------- | --------------------------------------- | ---- | ------ | ---------- |
| TASK-6-1 | [SkillSlice](./task-6-1-skill-slice.md) | 5-1  | medium | pending    |

### Phase 7: UIコンポーネント（7A-C並列可）

| ID      | タイトル                                              | 依存       | 複雑度 | ステータス |
| ------- | ----------------------------------------------------- | ---------- | ------ | ---------- |
| TASK-7A | [SkillSelector](./task-7a-skill-selector.md)          | 6-1        | medium | pending    |
| TASK-7B | [SkillImportDialog](./task-7b-skill-import-dialog.md) | 6-1        | medium | pending    |
| TASK-7C | [PermissionDialog](./task-7c-permission-dialog.md)    | 6-1        | medium | pending    |
| TASK-7D | [ChatPanel統合](./task-7d-chat-panel-integration.md)  | 7A, 7B, 7C | medium | pending    |

### Phase 8: テスト

| ID        | タイトル                                                       | 依存                      | 複雑度 | ステータス |
| --------- | -------------------------------------------------------------- | ------------------------- | ------ | ---------- |
| TASK-8A   | [単体テスト](./task-8a-unit-tests.md)                          | 2A, 2B, 3-1-A~C, 3-2, 6-1 | medium | pending    |
| TASK-8B   | [コンポーネントテスト](./task-8b-component-tests.md)           | 7A, 7B, 7C, 7D            | medium | pending    |
| TASK-8C-A | [IPC統合テスト](./task-8c-a-ipc-integration.md)                | 4-1, 4-2                  | medium | pending    |
| TASK-8C-B | [E2Eスキル選択テスト](./task-8c-b-e2e-selection.md)            | 7D, 8C-A, 8C-E            | medium | pending    |
| TASK-8C-C | [E2Eインポート・実行テスト](./task-8c-c-e2e-import-execute.md) | 7D, 8C-A, 8C-E            | medium | pending    |
| TASK-8C-D | [E2E権限ダイアログテスト](./task-8c-d-e2e-permission.md)       | 7D, 8C-A, 8C-E            | medium | pending    |
| TASK-8C-E | [テストフィクスチャ](./task-8c-e-fixtures.md)                  | -                         | small  | completed  |

---

## 🚀 Tier 2: 拡張（17タスク）

> スキルの作成・編集・改善・ライフサイクル管理

### Phase 9A: SkillEditor

| ID        | タイトル                                                           | 依存       | 複雑度 | ステータス   |
| --------- | ------------------------------------------------------------------ | ---------- | ------ | ------------ |
| TASK-9A-A | [SkillFileManager](./task-9a-a-file-manager.md)                    | Tier 1完了 | medium | pending      |
| TASK-9A-B | [ファイル編集IPC](./completed-task/task-9a-b-ipc-file-handlers.md) | 9A-A       | small  | completed    |
| TASK-9A-C | [SkillEditor UI](./completed-task/task-9a-c-skill-editor-ui.md)    | 9A-B       | medium | spec_created |

### Phase 9B: skill-creator メタスキル

| ID        | タイトル                                                        | 依存       | 複雑度 | ステータス |
| --------- | --------------------------------------------------------------- | ---------- | ------ | ---------- |
| TASK-9B-A | [SKILL.md定義](./task-9b-a-skill-md.md)                         | Tier 1完了 | small  | pending    |
| TASK-9B-B | [hearing-facilitatorエージェント](./task-9b-b-hearing-agent.md) | 9B-A       | medium | pending    |
| TASK-9B-C | [task-generatorエージェント](./task-9b-c-task-generator.md)     | 9B-A       | medium | pending    |
| TASK-9B-D | [code-generatorエージェント](./task-9b-d-code-generator.md)     | 9B-A       | medium | pending    |
| TASK-9B-E | [validatorエージェント](./task-9b-e-validator.md)               | 9B-A       | medium | pending    |
| TASK-9B-F | [参照資料](./task-9b-f-references.md)                           | 9B-A       | small  | pending    |
| TASK-9B-G | [SkillCreatorService](./task-9b-g-service.md)                   | 9B-B~F     | medium | pending    |

### Phase 9C: SkillImprover

| ID      | タイトル                                     | 依存       | 複雑度 | ステータス |
| ------- | -------------------------------------------- | ---------- | ------ | ---------- |
| TASK-9C | [SkillImprover](./task-9c-skill-improver.md) | Tier 1完了 | medium | pending    |

### Phase 10A: ライフサイクル管理UI

| ID         | タイトル                                                   | 依存       | 複雑度 | ステータス |
| ---------- | ---------------------------------------------------------- | ---------- | ------ | ---------- |
| TASK-10A-A | [SkillManagementPanel](./task-10a-a-management-panel.md)   | 9A, 9B, 9C | medium | pending    |
| TASK-10A-B | [SkillAnalysisView](./task-10a-b-analysis-view.md)         | 9C         | medium | pending    |
| TASK-10A-C | [SkillCreateWizard](./task-10a-c-create-wizard.md)         | 9B         | medium | pending    |
| TASK-10A-D | [統合（Slice/IPC/ChatPanel）](./task-10a-d-integration.md) | 10A-A~C    | medium | pending    |

---

## 🔮 Tier 3: 将来（7タスク）

> 高度なスキル管理機能（優先度: 低、Tier 2完了後に独立実装可能）

| ID      | タイトル                                                  | 依存 | 複雑度 | ステータス |
| ------- | --------------------------------------------------------- | ---- | ------ | ---------- |
| TASK-9D | [スキルチェーン機能](./task-9d-skill-chain.md)            | 9B   | large  | pending    |
| TASK-9E | [スキルフォーク・派生機能](./task-9e-skill-fork.md)       | 9B   | medium | pending    |
| TASK-9F | [スキル共有・インポート機能](./task-9f-skill-share.md)    | 9B   | large  | pending    |
| TASK-9G | [スキルスケジュール実行機能](./task-9g-skill-schedule.md) | 9B   | large  | pending    |
| TASK-9H | [スキルデバッグモード](./task-9h-skill-debug.md)          | 9B   | large  | pending    |
| TASK-9I | [スキルドキュメント生成機能](./task-9i-skill-docs.md)     | 9B   | medium | pending    |
| TASK-9J | [スキル使用統計・分析機能](./task-9j-skill-analytics.md)  | 9B   | medium | pending    |

---

## 🎨 Tier 4: UI刷新（10タスク）

> Apple HIG準拠のUI刷新。レイヤー基盤分割: Layer 0（基盤）→ Layer 1（画面）→ Layer 2（補足）
> 既存画面は原則変更せず新規Viewを追加（AgentViewのみ既存改修）

### Layer 0: 基盤層（全画面の前提条件）

| ID                                | タイトル                                                                   | 依存         | 複雑度 | ステータス |
| --------------------------------- | -------------------------------------------------------------------------- | ------------ | ------ | ---------- |
| TASK-UI-00-DESIGN-FOUNDATION      | [UIデザイン基盤](./ui-overhaul/00-ui-design-foundation.md)                 | -            | medium | pending    |
| TASK-UI-01-STORE-IPC-ARCHITECTURE | [Store・IPCアーキテクチャ設計](./ui-overhaul/01-store-ipc-architecture.md) | UI-00        | high   | pending    |
| TASK-UI-02-GLOBAL-NAV-CORE        | [グローバルナビゲーションコア](./ui-overhaul/02-global-nav-core.md)        | UI-00, UI-01 | medium | pending    |

### Layer 1: 画面層（並列実行可能、Layer 0完了後）

> 詳細な実行順序ガイド: [ui-overhaul/index.md](./ui-overhaul/index.md)

| ID                                | タイトル                                                                                   | 依存                 | 複雑度 | ステータス |
| --------------------------------- | ------------------------------------------------------------------------------------------ | -------------------- | ------ | ---------- |
| TASK-UI-03-AGENT-VIEW-ENHANCEMENT | [エージェントビュー強化](./ui-overhaul/03-agent-view-enhancement.md)                       | UI-00, UI-01, UI-02  | medium | pending    |
| TASK-UI-04A-WORKSPACE-LAYOUT      | [ワークスペースレイアウト・FileBrowser](./ui-overhaul/04A-workspace-layout-filebrowser.md) | UI-00, UI-01, UI-02  | large  | pending    |
| TASK-UI-04B-WORKSPACE-CHAT        | [ワークスペースChatPanel](./ui-overhaul/04B-workspace-chat-panel.md)                       | UI-00, UI-01, UI-04A | medium | pending    |
| TASK-UI-04C-WORKSPACE-PREVIEW     | [ワークスペースPreview・QuickSearch](./ui-overhaul/04C-workspace-preview-quicksearch.md)   | UI-00, UI-01, UI-04A | medium | pending    |
| TASK-UI-05-SKILL-CENTER-VIEW      | [スキルセンター画面](./ui-overhaul/05-skill-center-view.md)                                | UI-00, UI-01, UI-02  | medium | pending    |
| TASK-UI-06-HISTORY-SEARCH-VIEW    | [履歴・統合検索画面](./ui-overhaul/06-history-search-view.md)                              | UI-00, UI-01, UI-02  | medium | pending    |

### Layer 2: 補足層（並列実行可能、Layer 0完了後）

| ID                               | タイトル                                                            | 依存                | 複雑度 | ステータス |
| -------------------------------- | ------------------------------------------------------------------- | ------------------- | ------ | ---------- |
| TASK-UI-07-DASHBOARD-ENHANCEMENT | [ダッシュボード強化](./ui-overhaul/07-dashboard-enhancement.md)     | UI-00, UI-01, UI-02 | small  | pending    |
| TASK-UI-08-NOTIFICATION-CENTER   | [通知センター](./ui-overhaul/08-notification-center.md)             | UI-00, UI-01, UI-02 | medium | pending    |
| TASK-UI-09-ONBOARDING-WIZARD     | [オンボーディングウィザード](./ui-overhaul/09-onboarding-wizard.md) | UI-00〜08全て       | small  | pending    |

### Tier 4 依存関係グラフ

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🎨 Tier 4: UI刷新（Wave実行モデル）                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ━━ Wave 1: 直列（基盤層）━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  [UI-00 デザイン基盤]                                                      │
│     デザイントークン・共通コンポーネント・テーマシステム                   │
│         │                                                                   │
│         ▼                                                                   │
│  [UI-01 Store・IPCアーキテクチャ]                                          │
│     Slice拡張・ViewType拡張・IPCチャネル契約・依存グラフ                   │
│         │                                                                   │
│         ▼                                                                   │
│  [UI-02 GlobalNavCore]                                                     │
│     NavStrip + AppDock段階移行 + ルーティング + レスポンシブ               │
│         │                                                                   │
│  ━━ Wave 2: 並列（画面層、02完了後に同時着手可能）━━━━━━━━━━━━━━━━━━━━━ │
│         ├── [UI-03 AgentView強化]                                          │
│         │     2カラムカード + Apple HIG + スキル選択/管理分離              │
│         │                                                                   │
│         ├── [UI-04A Layout・FileBrowser] ──┬──→ [UI-04B ChatPanel]         │
│         │     3ペインレイアウト + 仮想スクロール  │                         │
│         │                                  └──→ [UI-04C Preview・Search]   │
│         │                                  ※ 04B/04Cは04A完了後に並列      │
│         │                                                                   │
│         ├── [UI-05 SkillCenterView]                                        │
│         │     SkillLibrary + Inspector（スキルCRUD管理）                   │
│         │                                                                   │
│         ├── [UI-06 HistorySearchView]                                      │
│         │     UniversalSearch + Timeline + FTS5                            │
│         │                                                                   │
│         ├── [UI-07 Dashboard強化]                                          │
│         │     StatCards + ActivityFeed + QuickActions                      │
│         │                                                                   │
│         └── [UI-08 通知センター]                                           │
│               Popover + IPC通知 + Main Process NotificationService        │
│                                                                             │
│  ━━ Wave 3: 直列（最終、全タスク完了後）━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│         └── [UI-09 オンボーディング]                                       │
│               4ステップウィザード + 初回起動検出                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

> 詳細な実行順序・依存関係マトリクス・タイムライン図: [ui-overhaul/index.md](./ui-overhaul/index.md)

### Tier 4 完了条件

- [ ] デザイントークン（tokens.css）が3テーマ全て実装（kanagawa-dragon/light/dark）
- [ ] 共通コンポーネント（SearchBar, FilterChip, CardGrid, SkeletonCard, EmptyState, ConfirmDialog等）が実装・テスト済み
- [ ] GlobalNavStrip が AppDock を段階的に置換し、9 ViewType のナビゲーションが動作
- [ ] AgentView が Apple HIG準拠の2カラムカードレイアウトに改修済み
- [ ] WorkspaceView で FileBrowser + Chat + Preview の3ペイン統合が動作
- [ ] SkillCenterView でスキルライブラリのブラウズ・CRUD管理が動作
- [ ] HistorySearchView でFTS5統合検索・タイムライン表示が動作
- [ ] DashboardView が統計カード・アクティビティフィード・クイックアクション対応
- [ ] 通知センターがポップオーバー表示・IPC通知受信・バッジ表示動作
- [ ] オンボーディングウィザードが初回起動時4ステップガイド動作
- [ ] 全テーマ（kanagawa-dragon/light/dark）で表示が正常
- [ ] lucide-react アイコンのみ使用（絵文字不使用）
- [ ] P31（個別セレクタ）、P39（fireEvent）、P42（3段バリデーション）準拠
- [ ] 全テストがPASS

### Tier 4 実行順序

```
Wave 1（直列）:
  Step 4-1: UI-00 デザイン基盤（最初に実装）
  Step 4-2: UI-01 Store・IPCアーキテクチャ（UI-00完了後）
  Step 4-3: UI-02 GlobalNavCore（UI-01完了後）

Wave 2（並列、UI-02完了後に同時着手可能）:
  ├── UI-03 AgentView強化
  ├── UI-04A Layout・FileBrowser  ──→  UI-04B ChatPanel    ┐ Wave 2b
  │                                ──→  UI-04C Preview     ┘ (04A完了後並列)
  ├── UI-05 SkillCenterView
  ├── UI-06 HistorySearchView
  ├── UI-07 Dashboard強化
  └── UI-08 通知センター

Wave 3（直列、全完了後）:
  Step 4-4: UI-09 オンボーディング（UI-00〜08全て完了後）
```

---

## クリティカルパス

**最短実行パス（Tier 1）**:

```
1-1 → 2A → 3-1-A → 3-1-B → 4-1 → 4-2 → 5-1 → 6-1 → 7D → 8C-A → 8C-B
```

**並列実行グループ**:

1. Phase 2: 2A, 2B, 2C（同時実行可能）
2. Phase 3: 3-1-B, 3-1-C（3-1-A完了後、同時実行可能）/ 3-2は独立
3. Phase 7: 7A, 7B, 7C（同時実行可能）
4. Phase 8: 8A, 8B（同時実行可能）/ 8C-B~D（8C-A完了後、同時実行可能）

**最短実行パス（Tier 2）**:

```
9A-A → 9A-B → 9A-C → 10A-A
9B-A → 9B-B~F（並列）→ 9B-G → 10A-C
9C → 10A-B
10A-A~C → 10A-D
```

---

## タスクメタデータフォーマット

```yaml
---
id: TASK-X-X
title: タスクタイトル
tier: 1 | 2 | 3 # ティア（MVP/拡張/将来）
phase: X
depends_on: []
parallel_with: [] # 並列実行可能タスク
blocks: [] # このタスク完了待ちのタスク
status: pending | in_progress | completed
priority: low | medium | high | critical
estimated_complexity: small | medium | large | xlarge
tags: [] # 検索用タグ

execution:
  mode: sequential | parallel
  timeout_minutes: 60
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates: []
  modifies: []
---
```

---

## 自動化コマンド

```bash
# タスク実行
skill-creator execute TASK-1-1

# 並列タスク実行
skill-creator execute --parallel TASK-2A TASK-2B TASK-2C
skill-creator execute --parallel TASK-3-1-B TASK-3-1-C  # 3-1-A完了後
skill-creator execute --parallel TASK-9B-B TASK-9B-C TASK-9B-D TASK-9B-E TASK-9B-F

# Tier 1 全タスク実行
skill-creator execute-tier 1

# Tier 2 全タスク実行
skill-creator execute-tier 2

# 進捗サマリー
skill-creator status ./tasks/
```
