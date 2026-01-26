# シーケンス図 - rememberChoice機能永続化

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | TASK-3-1-E                             |
| Phase    | 2                                      |
| 作成日   | 2026-01-25                             |
| 機能名   | task-3-1-e-remember-choice-persistence |

---

## ユースケース一覧

| No  | ユースケース                   | 説明                                |
| --- | ------------------------------ | ----------------------------------- |
| 1   | ツール許可→永続化              | rememberChoice=trueで許可し、永続化 |
| 2   | 自動許可（ダイアログスキップ） | 許可済みツールの自動承認            |
| 3   | 設定画面からの削除             | 許可済みツールの個別削除            |
| 4   | 全許可設定クリア               | 設定画面から全クリア                |

---

## 1. ツール許可→永続化フロー

```mermaid
sequenceDiagram
    participant User
    participant Renderer
    participant SkillExecutor
    participant PermissionResolver
    participant PermissionStore
    participant ElectronStore

    Note over SkillExecutor: スキル実行中、ツール使用発生

    SkillExecutor->>PermissionStore: isToolAllowed("Read")
    PermissionStore-->>SkillExecutor: false (未許可)

    SkillExecutor->>Renderer: IPC: skill:permission-request
    Note right of Renderer: ダイアログ表示<br/>rememberChoiceチェックボックス

    User->>Renderer: 「許可」+ rememberChoice=true

    Renderer->>SkillExecutor: IPC: skill:permission-response<br/>{approved: true, rememberChoice: true, toolName: "Read"}

    SkillExecutor->>PermissionStore: allowTool("Read")
    PermissionStore->>PermissionStore: toolCache.set("Read", entry)
    PermissionStore->>ElectronStore: store.set(schema)
    Note right of ElectronStore: permission-store.json 更新

    SkillExecutor->>PermissionResolver: resolveRequest(response)
    PermissionResolver-->>SkillExecutor: Promise解決

    Note over SkillExecutor: ツール実行続行
```

---

## 2. 自動許可（ダイアログスキップ）フロー

```mermaid
sequenceDiagram
    participant SkillExecutor
    participant PermissionStore
    participant Renderer

    Note over SkillExecutor: スキル実行中、ツール使用発生

    SkillExecutor->>PermissionStore: isToolAllowed("Read")
    PermissionStore-->>SkillExecutor: true (許可済み)

    Note over SkillExecutor: ダイアログをスキップ<br/>自動承認レスポンス生成

    SkillExecutor-->>SkillExecutor: return {<br/>  requestId: "",<br/>  approved: true,<br/>  rememberChoice: true<br/>}

    Note over SkillExecutor: ツール実行続行<br/>(Rendererへのリクエストなし)
```

---

## 3. 設定画面からの個別削除フロー

```mermaid
sequenceDiagram
    participant User
    participant SettingsUI
    participant MainProcess
    participant PermissionStore
    participant ElectronStore

    User->>SettingsUI: 設定画面を開く
    SettingsUI->>MainProcess: IPC: permission:getAllowedTools
    MainProcess->>PermissionStore: getAllowedToolEntries()
    PermissionStore-->>MainProcess: [{ toolName: "Read", allowedAt: "..." }, ...]
    MainProcess-->>SettingsUI: { tools: [...] }

    Note over SettingsUI: 許可済みツール一覧表示

    User->>SettingsUI: "Read"の削除ボタンをクリック
    SettingsUI->>MainProcess: IPC: permission:revokeTool<br/>{ toolName: "Read" }
    MainProcess->>PermissionStore: revokeTool("Read")
    PermissionStore->>PermissionStore: toolCache.delete("Read")
    PermissionStore->>ElectronStore: store.set(schema)
    PermissionStore-->>MainProcess: (完了)
    MainProcess-->>SettingsUI: { success: true }

    Note over SettingsUI: UI更新<br/>"Read"を一覧から削除
```

---

## 4. 全許可設定クリアフロー

```mermaid
sequenceDiagram
    participant User
    participant SettingsUI
    participant MainProcess
    participant PermissionStore
    participant ElectronStore

    User->>SettingsUI: "全ての許可をクリア"をクリック

    Note over SettingsUI: 確認ダイアログ表示

    User->>SettingsUI: 確認

    SettingsUI->>MainProcess: IPC: permission:clearAll
    MainProcess->>PermissionStore: clearAll()
    PermissionStore->>PermissionStore: toolCache.clear()
    PermissionStore->>ElectronStore: store.set(defaultSchema)
    PermissionStore-->>MainProcess: (完了)
    MainProcess-->>SettingsUI: { success: true, clearedCount: 3 }

    Note over SettingsUI: UI更新<br/>空の状態を表示
```

---

## 5. アプリ起動時のキャッシュ読み込みフロー

```mermaid
sequenceDiagram
    participant App
    participant PermissionStore
    participant ElectronStore

    Note over App: アプリ起動

    App->>PermissionStore: new PermissionStore()
    PermissionStore->>ElectronStore: new ElectronStore({ name: "permission-store" })
    ElectronStore-->>PermissionStore: (インスタンス)

    PermissionStore->>PermissionStore: initializeCache()
    PermissionStore->>ElectronStore: store.store (データ読み込み)

    alt スキーマ有効
        ElectronStore-->>PermissionStore: { version: 1, allowedTools: [...] }
        PermissionStore->>PermissionStore: キャッシュ構築<br/>toolCache.set(...)
        Note over PermissionStore: [INFO] Loaded 3 allowed tools
    else スキーマ無効
        ElectronStore-->>PermissionStore: 不正なデータ
        Note over PermissionStore: [WARN] Invalid schema, resetting
        PermissionStore->>ElectronStore: store.clear()
        PermissionStore->>ElectronStore: store.set(defaultSchema)
    else 読み込みエラー
        ElectronStore-->>PermissionStore: エラー
        Note over PermissionStore: [WARN] Failed to load, using defaults
        PermissionStore->>PermissionStore: 空のキャッシュで動作
    end

    PermissionStore-->>App: (インスタンス準備完了)
```

---

## コンポーネント間の関係

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Renderer Process                          │
│  ┌──────────────────┐   ┌──────────────────┐                       │
│  │ PermissionDialog │   │  SettingsUI      │                       │
│  │ (権限確認)       │   │  (設定画面)      │                       │
│  └────────┬─────────┘   └────────┬─────────┘                       │
│           │                      │                                  │
│           │ IPC                  │ IPC                              │
└───────────┼──────────────────────┼──────────────────────────────────┘
            │                      │
            │  skill:permission-   │  permission:getAllowedTools
            │  response            │  permission:revokeTool
            │                      │  permission:clearAll
            │                      │
┌───────────┼──────────────────────┼──────────────────────────────────┐
│           ▼                      ▼                                  │
│  ┌──────────────────┐   ┌──────────────────┐                       │
│  │  SkillExecutor   │──>│ PermissionStore  │                       │
│  │                  │   │                  │                       │
│  │ sendPermission   │   │ isToolAllowed()  │                       │
│  │ Request()        │   │ allowTool()      │                       │
│  │                  │   │ revokeTool()     │                       │
│  │ handlePermission │   │ getAllowed...()  │                       │
│  │ Response()       │   │ clearAll()       │                       │
│  └──────────────────┘   └────────┬─────────┘                       │
│                                  │                                  │
│                                  ▼                                  │
│                         ┌──────────────────┐                       │
│                         │  ElectronStore   │                       │
│                         │  (永続化)        │                       │
│                         └────────┬─────────┘                       │
│                                  │                                  │
│                           Main Process                              │
└──────────────────────────────────┼──────────────────────────────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │ permission-      │
                          │ store.json       │
                          └──────────────────┘
```

---

## 関連ドキュメント

- [PermissionStore設計](./permission-store-design.md)
- [SkillExecutor連携設計](./skillexecutor-integration-design.md)
- [IPCチャネル設計](./ipc-channel-design.md)
- [設定UI設計](./permission-settings-ui-design.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
