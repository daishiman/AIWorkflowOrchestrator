# シーケンス図 - スライド依存関係管理システム

## 1. ドキュメント情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | task-feat-slide-dependency-management-003 |
| バージョン | 1.0.0                                     |
| 作成日     | 2026-01-09                                |
| 作成者     | Claude (dependency-analysis skill)        |

---

## 2. 主要シーケンス図

### 2.1 プロジェクト起動シーケンス

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant R as Renderer
    participant S as Zustand Store
    participant P as Preload API
    participant M as Main Process
    participant W as FileWatcher
    participant FS as File System

    U->>R: プロジェクトを開く
    R->>S: setProject(loading)
    R->>P: startWatching(projectPath)
    P->>M: IPC: slide:startWatching

    M->>FS: existsSync(structure.md)
    alt structure.md存在
        M->>W: start(projectPath)
        W->>FS: chokidar.watch()
        W-->>M: ready
        M->>P: { success: true }
        P->>R: Promise resolved
        R->>S: setWatching(true)

        R->>P: getSyncStatus(projectPath)
        P->>M: IPC: slide:getSyncStatus
        M->>FS: readFile(structure.md)
        M->>FS: readFile(index.html)
        M->>M: compareHashes()
        M-->>R: { status, lastSyncAt }
        R->>S: setSyncStatus(status)
        R->>R: UI更新完了
    else structure.md不存在
        M-->>R: { success: false, error: SLIDE_E002 }
        R->>S: setError("structure.md not found")
        R->>R: エラー表示
    end
```

### 2.2 スキル実行シーケンス（html-generator）

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant R as Renderer
    participant S as Zustand Store
    participant P as Preload API
    participant M as Main Process
    participant E as SkillExecutor
    participant SDK as Claude Agent SDK
    participant FS as File System

    U->>R: HTML生成ボタンクリック
    R->>S: setPhase("html")
    R->>P: executePhase("html", projectPath)
    P->>M: IPC: slide:executePhase

    M->>M: validateParams()
    M->>E: execute("html", projectPath)
    E->>E: checkNotExecuting()

    alt 他スキル実行中
        E-->>M: throw SLIDE_E003
        M-->>R: { success: false, error }
        R->>S: setError(message)
        R->>S: setPhase("idle")
    else 実行可能
        E->>SDK: invoke("html-generator", args)

        loop 進捗更新
            SDK-->>E: progress event
            E-->>M: onProgress(progress)
            M->>R: IPC: slide:executionProgress
            R->>S: setProgress(progress)
        end

        SDK-->>E: completion
        E->>FS: writeFile(index.html)
        E-->>M: SkillExecutionResult
        M->>R: IPC: slide:executionComplete
        R->>S: addExecutionResult(result)
        R->>S: setSyncStatus("synced")
        R->>R: 完了通知表示
    end
```

### 2.3 ファイル変更検知・自動同期シーケンス

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FS as File System
    participant W as FileWatcher
    participant M as Main Process
    participant R as Renderer
    participant S as Zustand Store
    participant E as SkillExecutor

    U->>FS: structure.md編集・保存
    FS-->>W: change event
    W->>W: debounce(500ms)

    Note over W: デバウンス期間中の<br/>追加変更は統合される

    W->>M: onStructureChange(path, context)
    M->>M: isUserChange(context)

    alt source = "user"
        M->>R: IPC: slide:structureChanged
        R->>S: 変更検知をログ

        M->>R: IPC: slide:syncStatusChanged("out-of-sync")
        R->>S: setSyncStatus("out-of-sync")
        R->>R: インジケーター黄色に変更

        M->>R: IPC: slide:syncStatusChanged("syncing")
        R->>S: setSyncStatus("syncing")

        M->>E: markAsSkillChange(htmlPath)
        M->>E: execute("html", projectPath)

        E->>FS: writeFile(index.html)
        Note over W: skillChangeとして<br/>マークされているため<br/>変更イベントは無視

        E-->>M: result
        M->>R: IPC: slide:syncStatusChanged("synced")
        R->>S: setSyncStatus("synced")
        R->>R: インジケーター緑色に変更

    else source = "skill"
        Note over M: 無限ループ防止のため無視
    end
```

### 2.4 手動同期シーケンス

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant R as Renderer
    participant S as Zustand Store
    participant P as Preload API
    participant M as Main Process
    participant E as SkillExecutor
    participant W as FileWatcher
    participant FS as File System

    Note over R: syncStatus = "out-of-sync"

    U->>R: 手動同期ボタンクリック
    R->>R: canSync判定

    alt canSync = true
        R->>S: setSyncStatus("syncing")
        R->>P: manualSync(projectPath)
        P->>M: IPC: slide:manualSync

        M->>W: markAsSkillChange(htmlPath)
        M->>E: execute("html", projectPath)

        E->>FS: readFile(structure.md)
        E->>E: parseStructure()
        E->>E: generateHtml()
        E->>FS: writeFile(index.html)

        E-->>M: SkillExecutionResult
        M->>M: updateLastSyncAt()
        M-->>R: { success: true, result }

        R->>S: addExecutionResult(result)
        R->>S: setSyncStatus("synced")
        R->>S: updateLastSyncAt()
        R->>R: 同期完了トースト表示

    else canSync = false
        R->>R: ボタン無効のため何もしない
    end
```

### 2.5 スキルキャンセルシーケンス

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant R as Renderer
    participant S as Zustand Store
    participant P as Preload API
    participant M as Main Process
    participant E as SkillExecutor
    participant SDK as Claude Agent SDK

    Note over E: スキル実行中

    U->>R: キャンセルボタンクリック
    R->>P: cancelExecution()
    P->>M: IPC: slide:cancelExecution

    M->>E: cancel()
    E->>E: isCancelled = true
    E->>SDK: abort()

    alt キャンセル成功
        SDK-->>E: aborted
        E-->>M: { cancelled: true }
        M-->>R: { success: true }
        M->>R: IPC: slide:executionError
        R->>S: setPhase("idle")
        R->>S: setProgress(0)
        R->>R: キャンセル通知表示

    else キャンセル失敗（実行中でない）
        M-->>R: { success: false, error: SLIDE_E007 }
        R->>R: エラー表示（実行中でない）
    end
```

---

## 3. エラーハンドリングシーケンス

### 3.1 スキル実行エラー・リトライシーケンス

```mermaid
sequenceDiagram
    autonumber
    participant R as Renderer
    participant S as Zustand Store
    participant M as Main Process
    participant E as SkillExecutor
    participant SDK as Claude Agent SDK

    E->>SDK: invoke(skill, args)
    SDK-->>E: Error: API timeout

    E->>E: retryCount++

    loop リトライ (max 3回)
        alt retryCount <= 3
            E->>E: wait(1000 * 2^retryCount)
            E->>SDK: invoke(skill, args)

            alt 成功
                SDK-->>E: result
                E-->>M: SkillExecutionResult
                break
            else 再度失敗
                SDK-->>E: Error
                E->>E: retryCount++
            end
        end
    end

    alt リトライ上限到達
        E-->>M: { error: SLIDE_E004 }
        M->>R: IPC: slide:executionError
        R->>S: setError(message)
        R->>S: setSyncStatus("error")
        R->>S: setPhase("idle")
        R->>R: エラー通知表示<br/>("手動リトライボタン有効化")
    end
```

### 3.2 ファイルシステムエラーシーケンス

```mermaid
sequenceDiagram
    autonumber
    participant W as FileWatcher
    participant FS as File System
    participant M as Main Process
    participant R as Renderer
    participant S as Zustand Store

    W->>FS: watch(path)
    FS-->>W: Error: ENOENT

    W->>M: onWatchError(error)
    M->>M: classifyError(error)

    alt 一時的エラー (EBUSY, EAGAIN)
        M->>M: scheduleRetry(1000ms)
        M->>W: restart(path)
    else 永続的エラー (ENOENT, EACCES)
        M->>R: IPC: slide:executionError
        R->>S: setError("ファイル監視エラー")
        R->>S: setWatching(false)
        R->>R: エラー通知<br/>("プロジェクトを再度開いてください")
    end
```

---

## 4. 状態同期シーケンス

### 4.1 Zustand Store更新・UI反映シーケンス

```mermaid
sequenceDiagram
    autonumber
    participant IPC as IPC Event
    participant Hook as useIpcEventListeners
    participant S as Zustand Store
    participant Sel as Selectors
    participant C as Components

    IPC->>Hook: slide:syncStatusChanged("out-of-sync")
    Hook->>S: setSyncStatus("out-of-sync")
    S->>S: state.syncStatus = "out-of-sync"

    Note over S: subscribeWithSelector<br/>による変更検知

    S-->>Sel: state変更通知
    Sel->>Sel: useCanSync() 再計算
    Sel->>Sel: useSyncStatusColor() 再計算

    Sel-->>C: SyncIndicator再レンダリング
    C->>C: color = "yellow"

    Sel-->>C: SyncButton再レンダリング
    C->>C: disabled = false
```

### 4.2 複数コンポーネント間の状態共有

```mermaid
sequenceDiagram
    autonumber
    participant Panel as SkillPhasePanel
    participant Indicator as SyncIndicator
    participant S as Zustand Store

    Note over S: currentPhase = "idle"<br/>syncStatus = "synced"

    Panel->>S: setPhase("html")
    S->>S: currentPhase = "html"

    S-->>Panel: 再レンダリング<br/>(実行中表示)
    S-->>Indicator: 再レンダリング<br/>(プログレス表示)

    Note over S: 実行完了

    S->>S: currentPhase = "idle"
    S->>S: syncStatus = "synced"

    S-->>Panel: 再レンダリング<br/>(完了表示)
    S-->>Indicator: 再レンダリング<br/>(緑色インジケーター)
```

---

## 5. 初期化・クリーンアップシーケンス

### 5.1 アプリケーション起動シーケンス

```mermaid
sequenceDiagram
    autonumber
    participant App as App Component
    participant Hook as useIpcEventListeners
    participant S as Zustand Store
    participant P as Preload API
    participant M as Main Process

    App->>App: mount
    App->>Hook: useIpcEventListeners()

    Hook->>P: onSyncStatusChange(callback)
    P->>M: ipcRenderer.on("slide:syncStatusChanged")

    Hook->>P: onExecutionProgress(callback)
    P->>M: ipcRenderer.on("slide:executionProgress")

    Hook->>P: onExecutionComplete(callback)
    P->>M: ipcRenderer.on("slide:executionComplete")

    Hook->>P: onExecutionError(callback)
    P->>M: ipcRenderer.on("slide:executionError")

    Note over App: リスナー登録完了<br/>イベント受信可能状態
```

### 5.2 アプリケーション終了シーケンス

```mermaid
sequenceDiagram
    autonumber
    participant App as App Component
    participant Hook as useIpcEventListeners
    participant S as Zustand Store
    participant P as Preload API
    participant M as Main Process
    participant W as FileWatcher

    App->>App: unmount開始

    Hook->>Hook: useEffect cleanup
    Hook->>P: unsubscribeSyncStatus()
    P->>M: ipcRenderer.removeListener()

    Hook->>P: unsubscribeProgress()
    Hook->>P: unsubscribeComplete()
    Hook->>P: unsubscribeError()

    App->>P: stopWatching()
    P->>M: IPC: slide:stopWatching
    M->>W: stop()
    W->>W: watcher.close()
    W-->>M: closed
    M-->>App: { success: true }

    App->>S: reset()
    S->>S: state = initialState

    Note over App: クリーンアップ完了
```

---

## 6. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-09 | 初版作成 |
