# シーケンス図: TASK-3-2-C タイムスタンプ自動更新

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| タスク | TASK-3-2-C-timestamp-autoupdate |
| Phase  | 2                               |
| 作成日 | 2026-01-28                      |

---

## 1. 初期化シーケンス

```mermaid
sequenceDiagram
    participant App as SkillStreamDisplay
    participant TP as TimestampProvider
    participant UI as useInterval
    participant PV as usePageVisibility
    participant MT as MessageTimestamp

    App->>TP: render
    TP->>PV: usePageVisibility()
    PV-->>TP: isVisible = true
    TP->>TP: useState(Date.now())
    TP->>TP: calculateMinUpdateInterval(timestamps, currentTime)
    TP->>UI: useInterval(callback, interval)
    UI->>UI: setInterval(tick, interval)
    TP->>MT: render via Context
    MT->>MT: useTimestampContext()
    MT->>MT: formatRelativeTime(timestamp, currentTime)
    MT-->>App: "30秒前"
```

---

## 2. 自動更新シーケンス

```mermaid
sequenceDiagram
    participant Timer as setInterval
    participant UI as useInterval
    participant TP as TimestampProvider
    participant Ctx as TimestampContext
    participant MT as MessageTimestamp

    Timer->>UI: tick()
    UI->>TP: callback()
    TP->>TP: setCurrentTime(Date.now())
    TP->>Ctx: value={{ currentTime: newTime }}
    Ctx->>MT: Context変更通知
    MT->>MT: useTimestampContext()
    MT->>MT: formatRelativeTime(timestamp, newTime)
    MT-->>MT: "31秒前" (再レンダー)
```

---

## 3. タブ非表示シーケンス

```mermaid
sequenceDiagram
    participant Doc as document
    participant PV as usePageVisibility
    participant TP as TimestampProvider
    participant UI as useInterval

    Doc->>PV: visibilitychange (hidden)
    PV->>PV: setIsVisible(false)
    PV-->>TP: isVisible = false
    TP->>TP: calculateMinUpdateInterval → null
    TP->>UI: useInterval(callback, null)
    UI->>UI: clearInterval(id)
    Note over UI: タイマー停止
```

---

## 4. タブ再表示シーケンス

```mermaid
sequenceDiagram
    participant Doc as document
    participant PV as usePageVisibility
    participant TP as TimestampProvider
    participant UI as useInterval
    participant MT as MessageTimestamp

    Doc->>PV: visibilitychange (visible)
    PV->>PV: setIsVisible(true)
    PV-->>TP: isVisible = true
    TP->>TP: setCurrentTime(Date.now())
    Note over TP: 即座に現在時刻を更新
    TP->>TP: calculateMinUpdateInterval → interval
    TP->>UI: useInterval(callback, interval)
    UI->>UI: setInterval(tick, interval)
    Note over UI: タイマー再開
    TP->>MT: Context変更通知
    MT->>MT: formatRelativeTime(timestamp, currentTime)
    MT-->>MT: "2分前" (正確な経過時間)
```

---

## 5. 更新間隔動的変更シーケンス

```mermaid
sequenceDiagram
    participant TP as TimestampProvider
    participant UI as useInterval
    participant Timer as setInterval

    Note over TP: メッセージが1分経過
    TP->>TP: calculateMinUpdateInterval()
    Note over TP: 1秒 → 1分に変更
    TP->>UI: useInterval(callback, 60000)
    UI->>Timer: clearInterval(oldId)
    UI->>Timer: setInterval(tick, 60000)
    Note over Timer: 1分間隔で更新
```

---

## 6. アンマウントシーケンス

```mermaid
sequenceDiagram
    participant App as SkillStreamDisplay
    participant TP as TimestampProvider
    participant UI as useInterval
    participant PV as usePageVisibility
    participant Timer as setInterval
    participant Doc as document

    App->>TP: unmount
    TP->>UI: cleanup
    UI->>Timer: clearInterval(id)
    TP->>PV: cleanup
    PV->>Doc: removeEventListener('visibilitychange')
    Note over Timer,Doc: リソース解放完了
```

---

## 7. 状態遷移図

### 7.1 TimestampProviderの状態

```
                    ┌─────────────────┐
                    │    初期化       │
                    │ currentTime設定 │
                    └────────┬────────┘
                             │
                             ▼
           ┌─────────────────────────────────┐
           │                                 │
           ▼                                 │
    ┌──────────────┐                  ┌──────────────┐
    │   更新中     │◄────────────────►│    停止中    │
    │ (タブ表示)   │ visibilitychange │  (タブ非表示) │
    │ interval >0  │                  │ interval=null│
    └──────────────┘                  └──────────────┘
           │                                 │
           │                                 │
           └─────────────┬───────────────────┘
                         │ unmount
                         ▼
                  ┌──────────────┐
                  │   破棄       │
                  │ リソース解放 │
                  └──────────────┘
```

### 7.2 更新間隔の状態遷移

```
    ┌─────────────┐
    │ 1秒間隔     │
    │ (1分未満)   │
    └──────┬──────┘
           │ 1分経過
           ▼
    ┌─────────────┐
    │ 1分間隔     │
    │ (1分〜1時間)│
    └──────┬──────┘
           │ 1時間経過
           ▼
    ┌─────────────┐
    │ 1時間間隔   │
    │ (1時間以上) │
    └─────────────┘
```

---

## 8. データフロー図

```
┌───────────────────────────────────────────────────────────────┐
│                    SkillStreamDisplay                         │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  TimestampProvider                       │  │
│  │                                                          │  │
│  │  [State]                    [Hooks]                      │  │
│  │  currentTime ◄──────────── useInterval                   │  │
│  │       │                        ▲                         │  │
│  │       │                        │                         │  │
│  │       │                   isVisible                      │  │
│  │       │                        ▲                         │  │
│  │       │                        │                         │  │
│  │       │                   usePageVisibility              │  │
│  │       │                        ▲                         │  │
│  │       │                        │                         │  │
│  │       │                   document.hidden                │  │
│  │       │                                                  │  │
│  │       ▼                                                  │  │
│  │  TimestampContext.Provider                               │  │
│  │       │                                                  │  │
│  └───────┼──────────────────────────────────────────────────┘  │
│          │                                                     │
│          ▼                                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                     MessageList                          │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │                  MessageItem                      │   │  │
│  │  │  ┌────────────────────────────────────────────┐  │   │  │
│  │  │  │            MessageTimestamp                 │  │   │  │
│  │  │  │                                             │  │   │  │
│  │  │  │  currentTime ◄── useTimestampContext()     │  │   │  │
│  │  │  │       │                                     │  │   │  │
│  │  │  │       ▼                                     │  │   │  │
│  │  │  │  formatRelativeTime(timestamp, currentTime)│  │   │  │
│  │  │  │       │                                     │  │   │  │
│  │  │  │       ▼                                     │  │   │  │
│  │  │  │  "30秒前"                                   │  │   │  │
│  │  │  └────────────────────────────────────────────┘  │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

---

## 変更履歴

| 日付       | 変更内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-28 | 初版作成 | AI   |
