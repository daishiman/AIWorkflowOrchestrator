# Phase 2: コンポーネント構成図

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| 作成日     | 2026-01-22           |
| フェーズ   | Phase 2              |
| 成果物種別 | コンポーネント構成図 |
| ステータス | 完了                 |
| 関連Issue  | #361                 |

---

## 1. 全体アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              EditorView                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    Keyboard Shortcuts Layer                     │   │
│   │  ┌─────────────────────────────────────────────────────────┐    │   │
│   │  │           useSearchKeyboardShortcuts                    │    │   │
│   │  │  • Cmd+F / Ctrl+F → File Search                         │    │   │
│   │  │  • Cmd+Shift+F    → Workspace Search                    │    │   │
│   │  │  • Cmd+P          → Filename Search                     │    │   │
│   │  │  • Escape         → Close Panel                         │    │   │
│   │  └─────────────────────────────────────────────────────────┘    │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      State Management                           │   │
│   │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │   │
│   │  │ isSearchPanelOpen│ │   searchMode    │ │   showReplace   │   │   │
│   │  │   (boolean)      │ │ file/workspace  │ │   (boolean)     │   │   │
│   │  │                  │ │ /filename       │ │                 │   │   │
│   │  └─────────────────┘ └─────────────────┘ └─────────────────┘   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│            ┌─────────────────┼─────────────────┐                        │
│            ▼                 ▼                 ▼                        │
│   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐           │
│   │  SearchPanel    │ │WorkspaceSearch  │ │UnifiedSearch    │           │
│   │  (File Search)  │ │Panel            │ │Panel            │           │
│   │                 │ │(Workspace)      │ │(Filename)       │           │
│   └────────┬────────┘ └────────┬────────┘ └─────────────────┘           │
│            │                   │                                        │
│            ▼                   ▼                                        │
│   ┌─────────────────┐ ┌─────────────────┐                               │
│   │ EditorInstance  │ │SearchProvider   │                               │
│   │  (Interface)    │ │(AsyncGenerator) │                               │
│   └────────┬────────┘ └────────┬────────┘                               │
│            │                   │                                        │
│            ▼                   ▼                                        │
│   ┌─────────────────┐ ┌─────────────────┐                               │
│   │useEditorInstance│ │useWorkspace     │                               │
│   │  (Adapter Hook) │ │Search           │                               │
│   └────────┬────────┘ └────────┬────────┘                               │
│            │                   │                                        │
│            ▼                   ▼                                        │
│   ┌─────────────────┐ ┌─────────────────┐                               │
│   │   TextArea      │ │  Electron IPC   │                               │
│   │   (DOM)         │ │  (Main Process) │                               │
│   └─────────────────┘ └─────────────────┘                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. コンポーネント階層

```
EditorView/
├── index.tsx                 # メインコンポーネント
│   ├── <SearchPanel />       # ファイル内検索
│   ├── <WorkspaceSearchPanel /> # ワークスペース検索
│   ├── <UnifiedSearchPanel />   # ファイル名検索
│   └── <textarea />          # エディタ本体
│
└── hooks/
    ├── index.ts              # バレルエクスポート
    ├── useEditorInstance.ts  # EditorInstance アダプター
    ├── useWorkspaceSearch.ts # 検索プロバイダ
    └── useSearchKeyboardShortcuts.ts # ショートカット管理
```

---

## 3. 検索機能コンポーネント階層

```
features/search/
├── components/
│   ├── SearchPanel.tsx           # ファイル内検索 UI
│   │   ├── <input />             # 検索入力
│   │   ├── <SearchOptionButtons /> # オプションボタン群
│   │   ├── <input />             # 置換入力（条件付き）
│   │   └── <button />            # ナビゲーション・置換ボタン
│   │
│   ├── WorkspaceSearchPanel.tsx  # ワークスペース検索 UI
│   │   ├── <input />             # 検索入力
│   │   ├── <SearchOptionButtons /> # オプションボタン群
│   │   ├── <div />               # 検索結果ツリー
│   │   └── <ConfirmDialog />     # 全置換確認ダイアログ
│   │
│   └── SearchOptionButtons.tsx   # 検索オプションボタン
│       ├── <button /> (Aa)       # 大文字小文字
│       ├── <button /> ([ab])     # 単語単位
│       └── <button /> (.*)       # 正規表現
│
├── stores/
│   └── useSearchStore.ts         # Zustand ストア
│
├── adapters/
│   └── TextAreaEditorAdapter.ts  # EditorInstance アダプター
│
├── hooks/
│   └── useSearchKeyboardShortcuts.ts
│
├── utils/
│   └── highlightUtils.tsx        # ハイライトユーティリティ
│
├── types.ts                      # 型定義
├── constants.ts                  # 定数
└── index.ts                      # バレルエクスポート
```

---

## 4. データフロー図

### 4.1 ファイル内検索フロー

```
User Input              SearchPanel              EditorInstance           TextArea
    │                       │                         │                      │
    │  type query           │                         │                      │
    ├──────────────────────▶│                         │                      │
    │                       │  getContent()           │                      │
    │                       ├────────────────────────▶│                      │
    │                       │                         │  read value          │
    │                       │                         ├─────────────────────▶│
    │                       │  ◀────────────────────  │  ◀───────────────────│
    │                       │     content             │     content          │
    │                       │                         │                      │
    │                       │  execute regex          │                      │
    │                       │  find matches           │                      │
    │                       │                         │                      │
    │                       │  setHighlights()        │                      │
    │                       ├────────────────────────▶│                      │
    │                       │                         │  setSelectionRange   │
    │                       │                         ├─────────────────────▶│
    │                       │                         │                      │
    │  see highlights       │◀────────────────────────│◀─────────────────────│
    │◀──────────────────────│                         │                      │
```

### 4.2 ワークスペース検索フロー

```
User Input      WorkspaceSearchPanel     SearchProvider     Electron IPC     Main Process
    │                   │                      │                 │                │
    │  type query       │                      │                 │                │
    ├──────────────────▶│                      │                 │                │
    │                   │  searchProvider()    │                 │                │
    │                   ├─────────────────────▶│                 │                │
    │                   │                      │  executeWorkspace                │
    │                   │                      ├────────────────▶│                │
    │                   │                      │                 │  search files  │
    │                   │                      │                 ├───────────────▶│
    │                   │                      │                 │                │
    │                   │                      │  ◀──────────────│◀───────────────│
    │                   │                      │     matches                      │
    │                   │  yield FileResult    │                 │                │
    │                   │◀─────────────────────│                 │                │
    │                   │                      │                 │                │
    │  see results      │                      │                 │                │
    │◀──────────────────│                      │                 │                │
```

---

## 5. 状態遷移図

### 5.1 検索パネル状態

```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
    ┌─────────────────────────────┐                       │
    │      Panel Closed           │                       │
    │   isSearchPanelOpen: false  │                       │
    └─────────────────────────────┘                       │
         │           │           │                        │
         │ Cmd+F     │ Cmd+Shift+F   Cmd+P               │
         ▼           ▼           ▼                        │
    ┌──────────┐ ┌──────────┐ ┌──────────┐               │
    │  File    │ │Workspace │ │ Filename │               │
    │  Search  │ │  Search  │ │  Search  │               │
    │ Mode     │ │  Mode    │ │  Mode    │               │
    └──────────┘ └──────────┘ └──────────┘               │
         │           │           │                        │
         └───────────┴───────────┘                        │
                    │                                     │
                    │ Escape                              │
                    └─────────────────────────────────────┘
```

### 5.2 置換モード状態

```
    ┌─────────────────────┐
    │   Search Only       │
    │   showReplace: false│
    └─────────────────────┘
              │
              │ Cmd+T / Toggle Button
              ▼
    ┌─────────────────────┐
    │   Search + Replace  │
    │   showReplace: true │
    └─────────────────────┘
              │
              │ Escape / Close
              ▼
    ┌─────────────────────┐
    │   Panel Closed      │
    │   (reset)           │
    └─────────────────────┘
```

---

## 6. インターフェース依存関係

```
┌───────────────────────────────────────────────────────────────────┐
│                          Type Definitions                         │
│                    (features/search/types.ts)                     │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐     ┌─────────────────┐     ┌────────────┐  │
│  │  EditorInstance │     │  SearchMatch    │     │SearchOptions│ │
│  ├─────────────────┤     ├─────────────────┤     ├────────────┤  │
│  │ getContent()    │     │ line: number    │     │caseSensitive│ │
│  │ setHighlights() │     │ column: number  │     │regex        │ │
│  │ scrollToLine()  │     │ length: number  │     │wholeWord    │ │
│  │ replaceText()   │     │ text: string    │     └────────────┘  │
│  │ replaceAllText()│     │ lineText: string│                     │
│  │ focus()         │     └─────────────────┘                     │
│  └─────────────────┘                                             │
│          ▲                         ▲                              │
│          │ implements              │ uses                         │
│          │                         │                              │
│  ┌───────┴─────────┐      ┌───────┴───────────┐                  │
│  │TextAreaEditor   │      │   SearchPanel     │                  │
│  │Adapter          │◀─────│WorkspaceSearch    │                  │
│  │                 │      │Panel              │                  │
│  └─────────────────┘      └───────────────────┘                  │
│                                                                   │
│  ┌─────────────────┐     ┌─────────────────┐                     │
│  │FileSearchResult │     │ SearchProvider  │                     │
│  ├─────────────────┤     ├─────────────────┤                     │
│  │ filePath: string│     │ AsyncGenerator  │                     │
│  │ matches: Match[]│◀────│<FileSearchResult>│                    │
│  └─────────────────┘     └─────────────────┘                     │
│                                  ▲                                │
│                                  │ returns                        │
│                                  │                                │
│                          ┌───────┴───────┐                        │
│                          │useWorkspace   │                        │
│                          │Search         │                        │
│                          └───────────────┘                        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 7. ファイル配置マップ

```
apps/desktop/src/
├── renderer/
│   └── views/
│       └── EditorView/
│           ├── index.tsx              # 統合ポイント
│           ├── EditorView.test.tsx    # テスト
│           └── hooks/
│               ├── index.ts
│               ├── useEditorInstance.ts
│               ├── useWorkspaceSearch.ts
│               └── useSearchKeyboardShortcuts.ts
│
└── features/
    └── search/
        ├── components/
        │   ├── SearchPanel.tsx
        │   ├── WorkspaceSearchPanel.tsx
        │   └── SearchOptionButtons.tsx
        ├── stores/
        │   └── useSearchStore.ts
        ├── adapters/
        │   └── TextAreaEditorAdapter.ts
        ├── hooks/
        │   └── useSearchKeyboardShortcuts.ts
        ├── utils/
        │   ├── highlightUtils.tsx
        │   └── index.ts
        ├── __tests__/
        │   ├── SearchPanel.test.tsx
        │   └── WorkspaceSearchPanel.test.tsx
        ├── types.ts
        ├── constants.ts
        └── index.ts
```

---

## 完了条件チェック

- [x] 全体アーキテクチャ図が作成されている
- [x] コンポーネント階層が明確化されている
- [x] データフロー図が作成されている
- [x] 状態遷移図が作成されている
- [x] インターフェース依存関係が図示されている
- [x] ファイル配置マップが作成されている
