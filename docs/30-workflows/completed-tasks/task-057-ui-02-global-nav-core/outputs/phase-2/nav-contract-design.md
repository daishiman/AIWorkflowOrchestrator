# Phase 2 ナビ契約設計

## 3 セクション契約

| Section  | Label    | Item Count | 用途     |
| -------- | -------- | ---------- | -------- |
| `main`   | `Main`   | 6          | 主要導線 |
| `sub`    | `Tools`  | 2          | 補助導線 |
| `footer` | `System` | 1          | 設定     |

## アイテム契約

| Order | ViewType        | Label          | Icon             | Shortcut | Mobile    |
| ----- | --------------- | -------------- | ---------------- | -------- | --------- |
| 1     | `dashboard`     | Dashboard      | `layout-grid`    | `Cmd+1`  | primary   |
| 2     | `workspace`     | Workspace      | `folder-tree`    | `Cmd+2`  | primary   |
| 3     | `chat`          | Chat           | `message-circle` | `Cmd+3`  | primary   |
| 4     | `agent`         | Agent          | `bot`            | `Cmd+4`  | primary   |
| 5     | `skillCenter`   | Skill Center   | `puzzle`         | `Cmd+5`  | primary   |
| 6     | `historySearch` | History Search | `search`         | `Cmd+6`  | secondary |
| 7     | `graph`         | Graph          | `network`        | `Cmd+7`  | secondary |
| 8     | `editor`        | Editor         | `file-code`      | `Cmd+8`  | secondary |
| 9     | `settings`      | Settings       | `settings`       | `Cmd+,`  | secondary |

## 契約ルール

- `APP_DOCK_NAV_ITEMS`:
  - 既存 AppDock の描画順も同一配列を使い続ける
- `mobilePrimary`:
  - true の 5 項目のみ常時表示
- shortcut 解決:
  - `metaKey || ctrlKey`
  - `altKey` / `shiftKey` 付きは無効
  - 編集要素上では無効
  - `Cmd/Ctrl+[` は `goBack`
