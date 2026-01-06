# Phase 2: アーキテクチャ設計

## 概要

検索・置換機能UIのアーキテクチャを設計した。

## コンポーネント構成

```
apps/desktop/src/features/search/
├── components/
│   ├── SearchPanel.tsx          # ファイル内検索パネル
│   └── WorkspaceSearchPanel.tsx # ワークスペース検索パネル
├── stores/
│   └── useSearchStore.ts        # Zustand状態管理
├── hooks/
│   └── useSearchKeyboardShortcuts.ts # キーボードショートカット
├── types.ts                     # 型定義
└── index.ts                     # バレルエクスポート
```

## データフロー

```
ユーザー入力
    ↓
useSearchKeyboardShortcuts (Cmd+F/Ctrl+F)
    ↓
useSearchStore (状態管理)
    ↓
SearchPanel / WorkspaceSearchPanel (UI描画)
    ↓
IPC通信 (Electron)
    ↓
packages/shared/src/search/SearchService (バックエンド)
    ↓
検索結果
    ↓
useSearchStore (状態更新)
    ↓
UI更新
```

## 状態管理設計

Zustand Storeを使用して以下の状態を管理:

- ファイル内検索パネルの開閉状態
- ワークスペース検索パネルの開閉状態
- 検索クエリ
- 検索オプション（大文字小文字、正規表現、単語単位）
- 検索結果
- 置換テキスト

## 使用スキル

| スキル                 | 結果    | 備考                         |
| ---------------------- | ------- | ---------------------------- |
| architectural-patterns | success | コンポーネント分割設計に使用 |
| state-lifting          | success | Zustand Store設計に使用      |

## 完了日時

2026-01-05T14:35:00Z
