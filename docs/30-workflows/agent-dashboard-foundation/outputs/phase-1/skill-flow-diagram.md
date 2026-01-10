# スキル連携フロー図 - スライド依存関係管理システム

## 1. ドキュメント情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | task-feat-slide-dependency-management-003 |
| バージョン | 1.0.0                                     |
| 作成日     | 2026-01-09                                |
| 作成者     | Claude (event-driven-file-watching skill) |

---

## 2. スキルフェーズ概要

### 2.1 4つのスキルフェーズ

| フェーズ | スキル名            | 役割                 | 入力           | 出力             |
| -------- | ------------------- | -------------------- | -------------- | ---------------- |
| 1        | hearing-facilitator | ヒアリング・要件整理 | ユーザー要求   | ヒアリング結果   |
| 2        | structure-designer  | スライド構成設計     | ヒアリング結果 | structure.md     |
| 3        | html-generator      | HTML生成             | structure.md   | index.html       |
| 4        | slide-modifier      | スライド修正・微調整 | 修正指示       | 更新済みファイル |

---

## 3. メインフロー図

### 3.1 新規作成フロー

```mermaid
flowchart TD
    subgraph UserInteraction["ユーザー操作"]
        A[プロジェクト作成要求]
    end

    subgraph Phase1["フェーズ1: ヒアリング"]
        B[hearing-facilitator]
        B1[プレゼン目的の確認]
        B2[ターゲット聴衆の特定]
        B3[必要スライド数の決定]
    end

    subgraph Phase2["フェーズ2: 構成設計"]
        C[structure-designer]
        C1[スライド構成の設計]
        C2[各スライドの概要定義]
        C3[structure.md生成]
    end

    subgraph UserReview["ユーザーレビュー"]
        D[構成確認・承認]
    end

    subgraph Phase3["フェーズ3: HTML生成"]
        E[html-generator]
        E1[Reveal.js形式でHTML生成]
        E2[スタイル適用]
        E3[index.html出力]
    end

    subgraph SyncUpdate["同期更新"]
        F[同期状態を synced に更新]
    end

    A --> B
    B --> B1 --> B2 --> B3
    B3 --> C
    C --> C1 --> C2 --> C3
    C3 --> D
    D -->|承認| E
    D -->|修正要求| C
    E --> E1 --> E2 --> E3
    E3 --> F

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#e8f5e9
    style D fill:#fce4ec
    style E fill:#f3e5f5
    style F fill:#e0f2f1
```

### 3.2 修正・改善フロー

```mermaid
flowchart TD
    subgraph Trigger["トリガー"]
        T1[ユーザーによるstructure.md編集]
        T2[slide-modifier実行要求]
    end

    subgraph AutoSync["自動同期フロー"]
        A1[ファイルウォッチャーが変更検知]
        A2[デバウンス処理 500ms]
        A3[変更コンテキスト確認]
        A4{source = user?}
        A5[html-generator自動実行]
        A6[同期状態を syncing に更新]
        A7[index.html更新]
        A8[同期状態を synced に更新]
        A9[スキップ 変更なし]
    end

    subgraph ManualModify["手動修正フロー"]
        M1[slide-modifier実行]
        M2[修正内容の分析]
        M3[structure.md更新]
        M4[変更コンテキストを skill に設定]
        M5[html-generator実行]
        M6[index.html更新]
    end

    T1 --> A1
    A1 --> A2 --> A3 --> A4
    A4 -->|Yes| A6
    A6 --> A5 --> A7 --> A8
    A4 -->|No| A9

    T2 --> M1
    M1 --> M2 --> M3 --> M4 --> M5 --> M6

    style T1 fill:#e3f2fd
    style T2 fill:#e3f2fd
    style A5 fill:#f3e5f5
    style M1 fill:#fff8e1
```

---

## 4. IPC通信フロー

### 4.1 スキル実行シーケンス

```mermaid
sequenceDiagram
    participant R as Renderer
    participant P as Preload
    participant M as Main
    participant E as SkillExecutor
    participant S as Claude Agent SDK

    R->>P: executePhase(phase, projectPath)
    P->>M: IPC: slide:executePhase
    M->>M: バリデーション
    M->>E: execute(phase, projectPath)

    E->>S: スキル呼び出し

    loop 進捗更新
        S-->>E: 進捗イベント
        E-->>M: onProgress(progress)
        M-->>R: IPC: slide:executionProgress
        R->>R: UI更新
    end

    S-->>E: 完了
    E-->>M: SkillExecutionResult
    M-->>R: IPC: slide:executionComplete
    R->>R: 完了通知表示
```

### 4.2 ファイル監視シーケンス

```mermaid
sequenceDiagram
    participant FS as File System
    participant W as FileWatcher
    participant M as Main Process
    participant R as Renderer
    participant E as SkillExecutor

    Note over W: 監視開始済み

    FS->>W: ファイル変更イベント
    W->>W: デバウンス処理 (500ms)
    W->>M: onStructureChange(path)
    M->>M: shouldTriggerRegeneration(path)

    alt source = user
        M->>R: IPC: slide:syncStatusChanged(out-of-sync)
        R->>R: インジケーター更新
        M->>E: execute('html', projectPath)
        E->>E: markAsSkillChange(path)
        M->>R: IPC: slide:syncStatusChanged(syncing)
        Note over E: HTML生成処理
        E-->>M: 完了
        M->>R: IPC: slide:syncStatusChanged(synced)
    else source = skill
        Note over M: 無視（無限ループ防止）
    end
```

---

## 5. 状態遷移図

### 5.1 同期状態の遷移

```mermaid
stateDiagram-v2
    [*] --> Unknown: プロジェクト未選択

    Unknown --> Synced: プロジェクトを開く（整合性OK）
    Unknown --> OutOfSync: プロジェクトを開く（整合性NG）

    Synced --> OutOfSync: structure.md変更検知
    Synced --> Syncing: 手動同期実行

    OutOfSync --> Syncing: 自動同期開始
    OutOfSync --> Syncing: 手動同期実行

    Syncing --> Synced: 同期完了
    Syncing --> Error: 同期失敗

    Error --> Syncing: リトライ
    Error --> OutOfSync: リトライ上限到達

    state Synced {
        [*] --> Idle
    }

    state Syncing {
        [*] --> Executing
        Executing --> ProgressUpdate: 進捗更新
        ProgressUpdate --> Executing
        Executing --> [*]: 完了
    }
```

### 5.2 スキル実行状態の遷移

```mermaid
stateDiagram-v2
    [*] --> Idle: 初期状態

    Idle --> Executing: スキル実行開始

    Executing --> Idle: 実行完了
    Executing --> Cancelled: キャンセル
    Executing --> Error: エラー発生

    Error --> Idle: 手動リトライ
    Error --> Executing: 自動リトライ（3回まで）

    Cancelled --> Idle: リセット

    state Executing {
        [*] --> Initializing
        Initializing --> Running: SDK呼び出し
        Running --> ProgressUpdate: 進捗通知
        ProgressUpdate --> Running
        Running --> Finishing: 処理完了
        Finishing --> [*]
    }
```

---

## 6. データフロー図

### 6.1 レベル0: コンテキストダイアグラム

```
                    ┌─────────────────────────────────────┐
                    │    スライド依存関係管理システム        │
                    │                                     │
    ユーザー操作    │                                     │    ファイル出力
    ─────────────▶  │  ┌─────────┐    ┌─────────────┐    │  ─────────────▶
                    │  │   UI    │    │   Engine    │    │    structure.md
    状態表示        │  │  Layer  │◀──▶│   Layer     │    │    index.html
    ◀─────────────  │  └─────────┘    └─────────────┘    │
                    │                                     │
                    └─────────────────────────────────────┘
                                      │
                                      │ スキル呼び出し
                                      ▼
                              ┌───────────────┐
                              │ Claude Agent  │
                              │     SDK       │
                              └───────────────┘
```

### 6.2 レベル1: プロセス分解

```
┌────────────────────────────────────────────────────────────────┐
│                     Renderer Process                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1.0 UI Layer                                              │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │ 1.1 Skill   │  │ 1.2 Sync    │  │ 1.3 Project     │   │  │
│  │  │ PhasePanel  │  │ Status      │  │ Selector        │   │  │
│  │  │             │  │ Indicator   │  │                 │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │ IPC                              │
└──────────────────────────────┼──────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                     Main Process                                │
│                              │                                  │
│  ┌───────────────────────────▼───────────────────────────────┐ │
│  │ 2.0 Engine Layer                                           │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │ │
│  │  │ 2.1 File    │  │ 2.2 Skill   │  │ 2.3 Sync        │    │ │
│  │  │ Watcher     │  │ Executor    │  │ Manager         │    │ │
│  │  │             │  │             │  │                 │    │ │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘    │ │
│  │         │                │                   │             │ │
│  │         ▼                ▼                   ▼             │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ 2.4 State Store (Shared)                             │  │ │
│  │  │  - projectPath, syncStatus, currentPhase, isWatching │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │ External Systems    │
                    │  - File System      │
                    │  - Claude Agent SDK │
                    └─────────────────────┘
```

---

## 7. エラーハンドリングフロー

```mermaid
flowchart TD
    subgraph ErrorHandling["エラーハンドリングフロー"]
        E1[エラー発生]
        E2{エラータイプ判定}

        E3[一時的エラー]
        E4[永続的エラー]
        E5[ユーザーキャンセル]

        R1{リトライ回数 < 3?}
        R2[リトライ実行]
        R3[待機 exponential backoff]

        U1[ユーザー通知]
        U2[対処方法表示]
        U3[手動リトライボタン有効化]

        C1[処理中断]
        C2[状態リセット]
    end

    E1 --> E2
    E2 -->|一時的| E3
    E2 -->|永続的| E4
    E2 -->|キャンセル| E5

    E3 --> R1
    R1 -->|Yes| R3 --> R2
    R2 -->|成功| C2
    R2 -->|失敗| R1
    R1 -->|No| U1

    E4 --> U1 --> U2 --> U3

    E5 --> C1 --> C2

    style E1 fill:#ffcdd2
    style U1 fill:#fff9c4
    style C2 fill:#c8e6c9
```

---

## 8. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-09 | 初版作成 |
