# アーキテクチャ設計書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| タスクID   | CONV-05-03                    |
| 機能名     | 履歴/ログ表示UIコンポーネント |
| バージョン | 1.0                           |
| 作成日     | 2026-01-10                    |
| Phase      | 2                             |

---

## コンポーネント階層（Atomic Design）

### 階層構造

```
┌─────────────────────────────────────────────────────────────┐
│                    Pages                                     │
│  (各アプリの app/ または pages/ で使用)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Templates                               ││
│  │  (レイアウト構造)                                         ││
│  └─────────────────────────────────────────────────────────┘│
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Organisms                               ││
│  │  ┌────────────────┐  ┌────────────────┐                 ││
│  │  │ VersionHistory │  │ VersionDetail  │                 ││
│  │  │ (履歴一覧)     │  │ (詳細パネル)   │                 ││
│  │  └────────────────┘  └────────────────┘                 ││
│  │  ┌────────────────┐  ┌────────────────┐                 ││
│  │  │ ConversionLogs │  │ RestoreDialog  │                 ││
│  │  │ (ログ一覧)     │  │ (確認ダイアログ)│                ││
│  │  └────────────────┘  └────────────────┘                 ││
│  └─────────────────────────────────────────────────────────┘│
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Molecules                               ││
│  │  ┌─────────────────────┐  ┌─────────────────────┐       ││
│  │  │ VersionHistoryItem  │  │ LogEntry            │       ││
│  │  │ (履歴アイテム行)    │  │ (ログエントリ行)    │       ││
│  │  └─────────────────────┘  └─────────────────────┘       ││
│  │  ┌─────────────────────┐                                 ││
│  │  │ LoadMoreButton      │                                 ││
│  │  │ (さらに読み込む)    │                                 ││
│  │  └─────────────────────┘                                 ││
│  └─────────────────────────────────────────────────────────┘│
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Atoms (既存を再利用)                     ││
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            ││
│  │  │ Button │ │ Badge  │ │ Spinner│ │ Select │            ││
│  │  └────────┘ └────────┘ └────────┘ └────────┘            ││
│  │  ┌────────┐ ┌────────┐                                   ││
│  │  │IconBtn │ │  Icon  │                                   ││
│  │  └────────┘ └────────┘                                   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## コンポーネント詳細

### Organisms（セクション単位）

| コンポーネント | 責務                           | 使用Molecules/Atoms                 |
| -------------- | ------------------------------ | ----------------------------------- |
| VersionHistory | 履歴一覧の表示・操作           | VersionHistoryItem, Spinner, Button |
| VersionDetail  | バージョン詳細の表示           | Button, Icon                        |
| ConversionLogs | ログ一覧の表示・フィルタリング | LogEntry, Select, Spinner, Button   |
| RestoreDialog  | 復元確認ダイアログの表示       | Button                              |

### Molecules（機能単位）

| コンポーネント     | 責務                   | 使用Atoms       |
| ------------------ | ---------------------- | --------------- |
| VersionHistoryItem | 履歴アイテム1行の表示  | Badge, Button   |
| LogEntry           | ログエントリ1行の表示  | Badge           |
| LoadMoreButton     | ページネーションボタン | Button, Spinner |

### Atoms（最小単位 - 既存を再利用）

| コンポーネント | 用途                 | 既存パス                  |
| -------------- | -------------------- | ------------------------- |
| Button         | 汎用ボタン           | packages/shared/ui/atoms/ |
| Badge          | ステータスバッジ     | packages/shared/ui/atoms/ |
| Spinner        | ローディングスピナー | packages/shared/ui/atoms/ |
| Select         | ドロップダウン選択   | packages/shared/ui/atoms/ |
| IconButton     | アイコンボタン       | packages/shared/ui/atoms/ |
| Icon           | アイコン             | packages/shared/ui/atoms/ |

---

## ディレクトリ構成

```
apps/desktop/src/renderer/
├── components/
│   └── history/
│       ├── VersionHistory.tsx        # 履歴一覧 Organism
│       ├── VersionDetail.tsx         # 詳細パネル Organism
│       ├── ConversionLogs.tsx        # ログ一覧 Organism
│       ├── RestoreDialog.tsx         # 復元ダイアログ Organism
│       ├── VersionHistoryItem.tsx    # 履歴アイテム Molecule
│       ├── LogEntry.tsx              # ログエントリ Molecule
│       ├── index.ts                  # エクスポート
│       └── __tests__/
│           ├── VersionHistory.test.tsx
│           ├── VersionDetail.test.tsx
│           ├── ConversionLogs.test.tsx
│           └── RestoreDialog.test.tsx
└── hooks/
    ├── useVersionHistory.ts          # 履歴取得フック
    ├── useVersionDetail.ts           # 詳細取得フック
    ├── useConversionLogs.ts          # ログ取得フック
    ├── useRestore.ts                 # 復元操作フック
    └── __tests__/
        ├── useVersionHistory.test.ts
        ├── useVersionDetail.test.ts
        ├── useConversionLogs.test.ts
        └── useRestore.test.ts
```

---

## コンポーネント間の関係

```
┌─────────────────────────────────────────────────────────────┐
│                   親コンポーネント（Page）                    │
│                                                              │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │ VersionHistory      │    │ VersionDetail       │        │
│  │ ┌─────────────────┐ │    │ ┌─────────────────┐ │        │
│  │ │VersionHistory   │ │    │ │ 詳細情報表示    │ │        │
│  │ │ Item (×N)       │◀├────┼─│ 復元ボタン      │ │        │
│  │ └─────────────────┘ │    │ └─────────────────┘ │        │
│  │ ┌─────────────────┐ │    └─────────────────────┘        │
│  │ │LoadMoreButton   │ │                                    │
│  │ └─────────────────┘ │    ┌─────────────────────┐        │
│  └─────────────────────┘    │ RestoreDialog       │        │
│                              │ ┌─────────────────┐ │        │
│                              │ │ 確認メッセージ  │ │        │
│  ┌─────────────────────┐    │ │ 復元/キャンセル │ │        │
│  │ ConversionLogs      │    │ └─────────────────┘ │        │
│  │ ┌─────────────────┐ │    └─────────────────────┘        │
│  │ │ Filter (Select) │ │                                    │
│  │ └─────────────────┘ │                                    │
│  │ ┌─────────────────┐ │                                    │
│  │ │ LogEntry (×N)   │ │                                    │
│  │ └─────────────────┘ │                                    │
│  │ ┌─────────────────┐ │                                    │
│  │ │ LoadMoreButton  │ │                                    │
│  │ └─────────────────┘ │                                    │
│  └─────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘

イベントフロー:
─────────────
① VersionHistoryItem クリック → onVersionSelect(item) → 親が selectedVersion 更新
② VersionDetail 復元ボタン → onRestore() → 親が RestoreDialog を開く
③ RestoreDialog 確認 → onConfirm() → useRestore.restore() 実行
④ 復元完了 → 親が VersionHistory.refresh() を呼び出し
```

---

## 状態管理設計

### ローカル状態（各コンポーネント内）

| コンポーネント   | 状態                                 | 管理方法 |
| ---------------- | ------------------------------------ | -------- |
| VersionHistory   | (なし - フックに委譲)                | -        |
| VersionDetail    | (なし - フックに委譲)                | -        |
| ConversionLogs   | selectedLevel                        | useState |
| RestoreDialog    | (なし - props受け取り)               | -        |
| 親コンポーネント | selectedVersion, isRestoreDialogOpen | useState |

### カスタムフック状態

| フック            | 管理する状態                                 |
| ----------------- | -------------------------------------------- |
| useVersionHistory | history[], isLoading, error, hasMore, offset |
| useVersionDetail  | detail, isLoading, error                     |
| useConversionLogs | logs[], isLoading, error, hasMore, offset    |
| useRestore        | isRestoring, error                           |

### 状態フロー

```
親コンポーネント
    │
    ├── selectedVersion: VersionHistoryItem | null
    │       └── VersionHistoryItem クリックで更新
    │
    ├── isRestoreDialogOpen: boolean
    │       └── 復元ボタンクリックで true、完了/キャンセルで false
    │
    └── 子コンポーネントのフック状態
            │
            ├── useVersionHistory
            │       ├── history: VersionHistoryItem[]
            │       ├── isLoading: boolean
            │       ├── error: Error | null
            │       └── hasMore: boolean
            │
            ├── useVersionDetail
            │       ├── detail: VersionHistoryItem | null
            │       ├── isLoading: boolean
            │       └── error: Error | null
            │
            ├── useConversionLogs
            │       ├── logs: ConversionLog[]
            │       ├── isLoading: boolean
            │       ├── error: Error | null
            │       └── hasMore: boolean
            │
            └── useRestore
                    ├── isRestoring: boolean
                    └── error: Error | null
```

---

## Electronネイティブ対応（Apple HIG準拠）

### macOSネイティブ要素

| 要素               | 実装方針                                  |
| ------------------ | ----------------------------------------- |
| ウィンドウ外観     | 角丸（10px相当）、シャドウ                |
| アニメーション     | 滑らかな300ms前後のイージング（ease-out） |
| 視覚フィードバック | ホバー、プレス状態の明確な変化            |
| スクロール         | overflow-auto, scroll-smooth              |
| ダイアログ         | backdrop-blur, 角丸、シャドウ             |

### キーボードショートカット対応

| 操作             | キー        | 実装箇所           |
| ---------------- | ----------- | ------------------ |
| アイテム選択     | Enter/Space | VersionHistoryItem |
| ダイアログ閉じる | Escape      | RestoreDialog      |
| リスト内移動     | 矢印キー    | VersionHistory     |

---

## アクセシビリティ設計（WCAG 2.1 AA）

### キーボードナビゲーション

| コンポーネント     | 対応キー      | 動作                   |
| ------------------ | ------------- | ---------------------- |
| VersionHistory     | Tab, 矢印キー | フォーカス移動         |
| VersionHistoryItem | Enter, Space  | アイテム選択           |
| RestoreDialog      | Tab, Escape   | フォーカス移動、閉じる |
| ConversionLogs     | Tab           | フォーカス移動         |

### ARIA属性設計

| コンポーネント     | ARIA属性                                   |
| ------------------ | ------------------------------------------ |
| VersionHistory     | role="list"                                |
| VersionHistoryItem | role="listitem", aria-selected             |
| RestoreDialog      | role="dialog", aria-modal, aria-labelledby |
| ConversionLogs     | role="list"                                |
| LogEntry           | role="listitem"                            |
| Button (復元)      | aria-label="このバージョンに復元"          |
| Button (閉じる)    | aria-label="閉じる"                        |

### フォーカス管理

| シナリオ           | フォーカス移動先               |
| ------------------ | ------------------------------ |
| ダイアログを開く   | ダイアログ内の最初のボタン     |
| ダイアログを閉じる | ダイアログを開いたトリガー要素 |
| エラー発生         | エラーメッセージ領域           |

---

## 統合ポイント

### IPC通信設計

| チャンネル名             | 方向            | パラメータ           |
| ------------------------ | --------------- | -------------------- |
| history:getFileHistory   | Renderer → Main | fileId, options      |
| history:getVersionDetail | Renderer → Main | conversionId         |
| history:restoreVersion   | Renderer → Main | fileId, conversionId |

### Preload API設計

```typescript
// window.historyAPI (Preload Script で定義)
interface HistoryAPI {
  getFileHistory(
    fileId: string,
    options?: HistoryOptions,
  ): Promise<Result<PaginatedResult<VersionHistoryItem>, Error>>;

  getVersionDetail(
    conversionId: string,
  ): Promise<Result<VersionHistoryItem, Error>>;

  restoreVersion(
    fileId: string,
    conversionId: string,
  ): Promise<Result<VersionHistoryItem, Error>>;
}
```
