# 設計書 - スキル管理UI（AGENT-002）

## メタ情報

| 項目      | 内容                                         |
| --------- | -------------------------------------------- |
| タスクID  | AGENT-002                                    |
| 機能名    | skill-management-ui                          |
| Phase     | 2（設計）                                    |
| 作成日    | 2026-01-11                                   |
| 前提Phase | Phase 1（要件定義）                          |
| 設計方針  | Atomic Design、Zustand Slice、Glass Panel UI |

---

## 1. 設計概要

本設計書は、スキル管理UIの技術設計を統合したドキュメントである。Phase 1で定義した要件を基に、コンポーネント構造、型定義、状態管理、IPC通信、レイアウトを設計した。

### 1.1 設計原則

| 原則                 | 説明                                            |
| -------------------- | ----------------------------------------------- |
| Atomic Design        | atoms/molecules/organisms の階層構造            |
| 型安全性             | TypeScript + Zod によるランタイムバリデーション |
| 関心の分離           | UI/状態/通信の明確な分離                        |
| アクセシビリティ     | WCAG 2.1 AA 準拠                                |
| レスポンシブデザイン | 800px〜2560px対応                               |

### 1.2 技術スタック

| 領域           | 技術                          |
| -------------- | ----------------------------- |
| UI             | React 18, Tailwind CSS        |
| 状態管理       | Zustand (Slice パターン)      |
| 通信           | Electron IPC                  |
| 永続化         | electron-store                |
| バリデーション | Zod                           |
| テスト         | Vitest, React Testing Library |

---

## 2. アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Renderer Process                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                           Views                                │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │                      AgentView                           │  │  │
│  │  │  ┌─────────────────────────────────────────────────────┐│  │  │
│  │  │  │            SkillManagementSection                   ││  │  │
│  │  │  │  ┌───────────┐ ┌───────────┐ ┌───────────────────┐ ││  │  │
│  │  │  │  │SkillToolbar│ │ SkillList │ │SkillDetailPanel  │ ││  │  │
│  │  │  │  └───────────┘ └───────────┘ └───────────────────┘ ││  │  │
│  │  │  └─────────────────────────────────────────────────────┘│  │  │
│  │  │  ┌─────────────────────────────────────────────────────┐│  │  │
│  │  │  │            SkillImportDialog                        ││  │  │
│  │  │  └─────────────────────────────────────────────────────┘│  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                   ↕                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                         Zustand Store                          │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │                   skillSlice                              │ │  │
│  │  │  • availableSkills    • isLoadingSkills                   │ │  │
│  │  │  • importedSkills     • isImportDialogOpen                │ │  │
│  │  │  • selectedSkill      • skillLoadError                    │ │  │
│  │  │  • skillFilter        • skillOperationError               │ │  │
│  │  │  • skillCategory                                          │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                   ↕                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                         Preload API                            │  │
│  │  window.skillAPI.listAvailable()                               │  │
│  │  window.skillAPI.listImported()                                │  │
│  │  window.skillAPI.import({ skillIds })                          │  │
│  │  window.skillAPI.remove({ skillId })                           │  │
│  │  window.skillAPI.getDetail({ skillId })                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                   ↕ IPC
┌─────────────────────────────────────────────────────────────────────┐
│                           Main Process                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                        IPC Handlers                            │  │
│  │  skill:list-available → skillService.listAvailableSkills()     │  │
│  │  skill:list-imported  → skillService.listImportedSkills()      │  │
│  │  skill:import         → skillService.importSkills()            │  │
│  │  skill:remove         → skillService.removeSkill()             │  │
│  │  skill:get-detail     → skillService.getSkillDetail()          │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                   ↕                                 │
│  ┌──────────────────────────┐ ┌────────────────────────────────────┐│
│  │      SkillService        │ │          electron-store            ││
│  │  • parseSkillFiles()     │ │  • skillImportConfig               ││
│  │  • validatePath()        │ │    - importedSkillIds[]            ││
│  │  • loadSkillDetail()     │ │    - lastUpdated                   ││
│  └──────────────────────────┘ └────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. 成果物サマリー

### 3.1 型定義（type-definitions.md）

| 型                       | 用途                        |
| ------------------------ | --------------------------- |
| `Skill`                  | スキル基本情報              |
| `SkillDetail`            | スキル詳細情報（Skill拡張） |
| `Anchor`                 | アンカー（参照文献）情報    |
| `SkillCategory`          | スキルカテゴリ列挙型        |
| `SkillImportConfig`      | 永続化用インポート設定      |
| `SkillManagementState`   | Zustand状態型               |
| `SkillManagementActions` | Zustandアクション型         |
| `SkillAPI`               | Preload API型               |

### 3.2 コンポーネント（component-design.md）

**Organisms**:

| コンポーネント         | 責務                         |
| ---------------------- | ---------------------------- |
| SkillManagementSection | スキル管理機能統括           |
| SkillToolbar           | 検索・フィルター・インポート |
| SkillList              | スキル一覧グリッド表示       |
| SkillDetailPanel       | 選択スキル詳細表示           |
| SkillImportDialog      | インポートダイアログ         |

**Molecules**:

| コンポーネント      | 責務               |
| ------------------- | ------------------ |
| SkillCard           | スキルカード表示   |
| SkillSearchBar      | 検索バー           |
| SkillCategoryFilter | カテゴリフィルター |
| SkillCheckboxItem   | ダイアログ内選択行 |
| SkillListSkeleton   | ローディング表示   |
| SkillListEmptyState | 空状態表示         |
| SkillListError      | エラー表示         |

### 3.3 レイアウト（layout-design.md）

| 要素              | 仕様                                |
| ----------------- | ----------------------------------- |
| メインレイアウト  | Toolbar + List/DetailPanel (60:40)  |
| SkillCard         | min-w-280px, GlassPanel, hover効果  |
| SkillDetailPanel  | w-360px固定、小画面ではオーバーレイ |
| SkillImportDialog | max-w-600px, モーダル表示           |
| レスポンシブ      | 4/3/2/1列グリッド切り替え           |

### 3.4 状態管理（state-management-design.md）

| 状態               | 型                    | 用途               |
| ------------------ | --------------------- | ------------------ |
| availableSkills    | Skill[]               | 利用可能スキル     |
| importedSkills     | Skill[]               | インポート済み     |
| selectedSkill      | Skill \| null         | 選択中             |
| skillFilter        | string                | 検索文字列         |
| skillCategory      | SkillCategory \| null | カテゴリフィルター |
| isLoadingSkills    | boolean               | ローディング       |
| isImportDialogOpen | boolean               | ダイアログ表示     |
| skillLoadError     | string \| null        | エラー             |

### 3.5 IPC API（ipc-api-design.md）

| チャンネル           | 方向            | 用途               |
| -------------------- | --------------- | ------------------ |
| skill:list-available | Renderer → Main | 利用可能スキル取得 |
| skill:list-imported  | Renderer → Main | インポート済み取得 |
| skill:import         | Renderer → Main | スキルインポート   |
| skill:remove         | Renderer → Main | スキル削除         |
| skill:get-detail     | Renderer → Main | 詳細取得           |

---

## 4. コンポーネント階層図

```
AgentView
└── SkillManagementSection
    ├── SkillToolbar
    │   ├── SkillSearchBar
    │   ├── SkillCategoryFilter
    │   └── ImportButton
    ├── SkillList
    │   ├── SkillCard[]
    │   ├── SkillListSkeleton
    │   ├── SkillListEmptyState
    │   └── SkillListError
    ├── SkillDetailPanel
    │   ├── PanelHeader
    │   ├── SkillDescription
    │   ├── SkillTriggerList
    │   ├── SkillAnchorList
    │   └── SkillActions
    └── SkillImportDialog
        ├── DialogHeader
        ├── SkillSearchBar
        ├── AvailableSkillList
        │   └── SkillCheckboxItem[]
        └── DialogActions
```

---

## 5. データフロー

### 5.1 初期ロード

```
useEffect → fetchImportedSkills() → IPC → Main Process
                                          ↓
                                    skillService.listImportedSkills()
                                          ↓
                                    electron-store.get() + parseSkillFiles()
                                          ↓
                                    Skill[] → Zustand state
                                          ↓
                                    SkillList 再レンダリング
```

### 5.2 スキル選択

```
SkillCard.onClick → selectSkill(skill)
                          ↓
                    Zustand state 更新
                          ↓
                    fetchSkillDetail(skill.id)
                          ↓
                    IPC → Main Process
                          ↓
                    SkillDetail → Zustand state
                          ↓
                    SkillDetailPanel 表示
```

### 5.3 スキルインポート

```
ImportButton.onClick → openImportDialog()
                              ↓
                        fetchAvailableSkills()
                              ↓
                        SkillImportDialog 表示
                              ↓
                        ユーザーがスキル選択
                              ↓
                        importSkills(skillIds)
                              ↓
                        IPC → Main Process
                              ↓
                        electron-store 更新
                              ↓
                        fetchImportedSkills()
                              ↓
                        SkillList 更新
```

---

## 6. フォルダ構成

```
apps/desktop/src/
├── main/
│   ├── ipc/
│   │   └── skill-handlers.ts       # IPCハンドラ
│   ├── services/
│   │   └── skill-service.ts        # スキルサービス
│   └── stores/
│       └── skill-store.ts          # electron-store
├── preload/
│   ├── index.ts                    # Preloadエントリ
│   └── skill-api.ts                # SkillAPI
├── renderer/
│   ├── components/
│   │   ├── molecules/
│   │   │   ├── SkillCard/
│   │   │   ├── SkillSearchBar/
│   │   │   ├── SkillCategoryFilter/
│   │   │   ├── SkillCheckboxItem/
│   │   │   ├── SkillListSkeleton/
│   │   │   ├── SkillListEmptyState/
│   │   │   └── SkillListError/
│   │   └── organisms/
│   │       ├── SkillManagementSection/
│   │       ├── SkillToolbar/
│   │       ├── SkillList/
│   │       ├── SkillDetailPanel/
│   │       └── SkillImportDialog/
│   ├── hooks/
│   │   └── useSkillStore.ts        # カスタムフック
│   ├── store/
│   │   └── slices/
│   │       └── skillSlice.ts       # Zustand Slice
│   └── views/
│       └── AgentView/
│           └── index.tsx           # ビュー
└── shared/
    └── ipc/
        ├── channels.ts             # IPCチャンネル定義
        └── skill-types.ts          # IPC型定義

packages/shared/src/
└── types/
    └── skill.ts                    # 共有型定義
```

---

## 7. 統合テスト連携ポイント

### 7.1 IPC統合

| 接続ポイント         | テスト方法               |
| -------------------- | ------------------------ |
| skill:list-available | モックIPC + 実データ検証 |
| skill:list-imported  | electron-storeモック検証 |
| skill:import         | 永続化データ整合性検証   |
| skill:remove         | 削除後の状態検証         |

### 7.2 状態統合

| 接続ポイント        | テスト方法                  |
| ------------------- | --------------------------- |
| Zustand ↔ Component | useSkillStoreフック検証     |
| フィルタリング      | useFilteredSkillsフック検証 |
| ダイアログ制御      | 開閉状態遷移検証            |

### 7.3 UI統合

| 接続ポイント          | テスト方法               |
| --------------------- | ------------------------ |
| SkillList ↔ SkillCard | クリックイベント伝播検証 |
| SkillDetailPanel      | 選択スキル表示検証       |
| SkillImportDialog     | インポートフロー検証     |

---

## 8. Phase 2 成果物一覧

| 成果物               | ファイル                     | ステータス |
| -------------------- | ---------------------------- | ---------- |
| 型定義設計書         | `type-definitions.md`        | 完了       |
| コンポーネント設計書 | `component-design.md`        | 完了       |
| レイアウト設計書     | `layout-design.md`           | 完了       |
| 状態管理設計書       | `state-management-design.md` | 完了       |
| IPC API設計書        | `ipc-api-design.md`          | 完了       |
| 設計書（本書）       | `design.md`                  | 完了       |

---

## 9. Phase 2 完了チェックリスト

- [x] Skill型定義が完成している
- [x] コンポーネント構造がAtomic Designに従って設計されている
- [x] 各コンポーネントのPropsが定義されている
- [x] レイアウト（3カラム構成）が設計されている
- [x] Zustand agentSlice拡張（skillSlice）が設計されている
- [x] IPC APIが設計されている
- [x] 設計書が完成している
- [x] 統合テスト連携ポイントが明記されている

---

## 10. 次のPhase

Phase 3: 設計レビューゲート

`docs/30-workflows/skill-management-ui/phase-3-design-review.md` を実行してください。
