# AI Runtime / Access Surface UI/UX 図解

## 前提の明確化

今回の `Claude Code Terminal Surface` は、`裏で Claude Code を自動実行して出力だけ見せる構造` ではない。

| 項目         | 今回の採用                                           | 採用しない構造                                 |
| ------------ | ---------------------------------------------------- | ---------------------------------------------- |
| 実行主体     | ユーザーが terminal 上で `claude` を実行する         | アプリが裏で `claude` を自動起動・自動送信する |
| アプリの役割 | terminal UI / transcript 表示 / copy / open cwd      | hidden prompt injection / headless automation  |
| 出力表示     | ユーザー操作で始まった session transcript を表示する | アプリ内部ジョブの代理実行結果を表示する       |

## 図解フォーマット

各 surface について、次の 5 種の図解をそろえる。

1. 核となる責務図
2. 画面構成図
3. 状態遷移図
4. 必要マイコンポーネント図
5. CTA / handoff flow 図

## Core Access Model

### 1. 核となる責務図

```text
User Intent
   |
   v
Surface UI
   |
   v
Access Capability Resolver
   |------------------------ integrated-api ----------------------> Main Runtime -> Provider
   |------------------------ terminal-handoff --------------------> Handoff Card -> User-operated Terminal
   |------------------------ terminal-only -----------------------> Terminal Surface
   |------------------------ guidance-only -----------------------> Guidance Block
```

### 2. 画面構成図

```text
+------------------------------------------------------------------+
| App Shell Header                                   [Terminal]    |
+------------------------------------------------------------------+
| Access Capability Card | Runtime Banner | Guidance / Health      |
+------------------------------------------------------------------+
| Primary Work Area                                               |
| - Chat / Edit / Skill / Docs / Slide / Status Row               |
+------------------------------------------------------------------+
| Handoff Card / Permission / Control Rail / Terminal Dock        |
+------------------------------------------------------------------+
```

### 3. 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> ResolveCapability
    ResolveCapability --> Ready: integrated-api
    ResolveCapability --> Handoff: terminal-handoff
    ResolveCapability --> TerminalOnly: terminal-only
    ResolveCapability --> Blocked: guidance-only
    Ready --> Running: execute
    Running --> Streaming: stream
    Running --> Failed: error
    Streaming --> Completed: done
    Handoff --> TerminalDockOpen: open terminal
    TerminalOnly --> TerminalDockOpen
    TerminalDockOpen --> Completed: user continues manually
```

### 4. 必要マイコンポーネント図

```text
AccessCapabilityCard
RuntimeBanner
GuidanceBlock
HandoffCard
StatusRow
Composer / Input
TranscriptPanel
PermissionDialog
ContextSummary
HealthIndicator
PersistentTerminalLauncher
TerminalDockToggle
```

### 5. CTA / handoff flow 図

```mermaid
flowchart LR
    A[User Action] --> B[Capability Resolve]
    B -->|integrated-api| C[Primary CTA: 実行]
    B -->|terminal-handoff| D[Secondary CTA: terminal で続ける]
    B -->|guidance-only| E[CTA: 設定を見る]
    D --> F[Open Terminal Dock / Copy Command / Copy Context]
    G[Header Terminal Button] --> F
```

## Terminal Transcript -> Chat Manual Bridge

### 1. 核となる責務図

```text
Terminal Transcript
  -> user selects output
  -> explicit share action
  -> chat composer receives attachment / pasted text
```

### 2. 画面構成図

```text
+----------------------------------+----------------------------------+
| Terminal Dock                    | Chat Composer                    |
| - transcript                     | - input                          |
| - selected range                 | - attachment chips               |
| - share actions                  | - provenance label               |
+----------------------------------+----------------------------------+
```

### 3. 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> TranscriptVisible
    TranscriptVisible --> RangeSelected: user select
    RangeSelected --> ShareReady: explicit action
    ShareReady --> ChatAttached: attach to chat
    ShareReady --> ChatPasted: paste into composer
    ChatAttached --> [*]
    ChatPasted --> [*]
```

### 4. 必要マイコンポーネント図

```text
TranscriptSelectionToolbar
ShareToChatButton
AttachRecentOutputButton
PasteSessionButton
ComposerAttachmentChip
TranscriptProvenanceLabel
```

### 5. CTA / handoff flow 図

```mermaid
flowchart LR
    A[Terminal Transcript] --> B[Select Output]
    B --> C{Manual Share Action}
    C -->|selection| D[選択範囲をチャットへ送る]
    C -->|recent| E[直近出力を添付]
    C -->|session| F[セッションを貼り付ける]
    D --> G[Chat Composer]
    E --> G
    F --> G
```

## Settings / Access Matrix

### 1. 核となる責務図

```text
SettingsView
  -> AccessCapabilityCard group
  -> Provider / Model Selector
  -> System Prompt Section
  -> Health / RAG Row
  -> Persistent Terminal Launcher
```

### 2. 画面構成図

```text
+------------------------------------------------------------------+
| Settings Header                                   [Terminal]     |
+------------------------------------------------------------------+
| Access Matrix Cards                                              |
| [Integrated API] [Claude Code Terminal] [Guidance Only]          |
+------------------------------------------------------------------+
| Provider / Model Selector                                        |
+------------------------------------------------------------------+
| System Prompt Section                                            |
+------------------------------------------------------------------+
| Health / RAG / Connection Status                                 |
+------------------------------------------------------------------+
| Terminal Dock (collapsed / expanded)                             |
+------------------------------------------------------------------+
```

### 3. 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> MissingKey: api key absent
    Idle --> Ready: api key valid
    Ready --> HealthWarning: health degraded
    Ready --> ModelDrift: selected config invalid
    MissingKey --> Ready: key saved
    HealthWarning --> Ready: recheck ok
    Ready --> TerminalDockOpen: terminal button
```

### 4. 必要マイコンポーネント図

```text
SettingsHeader
AccessCapabilityCard
TerminalAvailabilityCard
LLMSelectorPanel
SystemPromptPanel
HealthIndicator
RagStatusRow
GuidanceBlock
PersistentTerminalLauncher
TerminalDock
```

### 5. CTA / handoff flow 図

```mermaid
flowchart TD
    A[Open Settings] --> B{Capability State}
    B -->|Missing Key| C[API key を設定]
    B -->|Ready| D[この設定でチャットを使う]
    B -->|Terminal Needed| E[Terminal Button]
    E --> F[Terminal Dock Open]
```

## Claude Code Terminal Surface

### 1. 核となる責務図

```text
Terminal Surface
  -> user-operated shell
  -> transcript viewer
  -> abort / retry / reconnect controls
  -> no auto-send boundary
  -> always-open entry from app shell
```

### 2. 画面構成図

```text
+----------------------+--------------------------------------------+
| Session List         | Transcript Panel                           |
| - current            | > stdout / stderr                          |
| - history            | > status badge                             |
| - reconnect          | > scroll / virtualization                  |
+----------------------+--------------------------------------------+
| Action Rail: Copy Cmd | Copy Context | Open CWD | Abort | Retry   |
+------------------------------------------------------------------+
```

### 3. 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> Collapsed
    Collapsed --> Idle: open terminal dock
    Idle --> InputWaiting: shell ready
    InputWaiting --> Running: user types claude
    Running --> LongOutput: long transcript
    Running --> Aborted: abort
    Running --> Completed: command ended
    Idle --> Unavailable: cli missing
```

### 4. 必要マイコンポーネント図

```text
PersistentTerminalLauncher
TerminalDock
SessionList
TranscriptPanel
StatusBadge
ActionRail
AbortButton
RetryButton
CopyCommandButton
CopyContextButton
UnavailableGuidance
```

### 5. CTA / handoff flow 図

```mermaid
flowchart LR
    A[Header / Surface Terminal Button] --> B[Terminal Dock]
    B --> C{CLI available?}
    C -->|Yes| D[User types claude]
    D --> E[Transcript visible]
    C -->|No| F[Install Guidance]
```

## ChatPanel

### 1. 核となる責務図

```text
ChatPanel
  -> message list
  -> composer
  -> runtime banner
  -> handoff block
  -> persistent terminal entry
```

### 2. 画面構成図

```text
+------------------------------------------------------------------+
| Runtime Banner                                      [Terminal]   |
+------------------------------------------------------------------+
| Message List                                                     |
| - empty state                                                    |
| - streaming message                                              |
| - error guidance                                                 |
+------------------------------------------------------------------+
| Composer: input | send | terminal handoff                        |
+------------------------------------------------------------------+
| Terminal Dock (bottom sheet / side dock)                         |
| Share Actions: 選択範囲を送る / 直近出力を添付                   |
+------------------------------------------------------------------+
```

### 3. 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> Empty
    Empty --> Ready: capability ok
    Empty --> Blocked: no capability
    Ready --> Streaming: send
    Ready --> TerminalDockOpen: terminal button
    Streaming --> Cancelled: cancel
    Streaming --> Completed: done
    Ready --> Handoff: terminal-handoff
```

### 4. 必要マイコンポーネント図

```text
RuntimeBanner
ChatMessageList
StreamingMessage
ComposerInput
SendButton
HandoffBlock
ErrorGuidance
PersistentTerminalLauncher
TerminalDock
ComposerAttachmentChip
TranscriptProvenanceLabel
```

### 5. CTA / handoff flow 図

```mermaid
flowchart TD
    A[Type Message] --> B{Capability}
    B -->|integrated-api| C[送信する]
    B -->|terminal-handoff| D[terminal で続ける]
    A --> E[Terminal Button]
    E --> F[Terminal Dock Open]
```

## Workspace Chat Panel

### 1. 核となる責務図

```text
WorkspaceChatPanel
  -> file context chips
  -> mention / selected files
  -> streaming chat
  -> compact guidance
  -> persistent terminal entry
```

### 2. 画面構成図

```text
+------------------------------------------------------------------+
| Panel Header / Capability                           [Terminal]   |
+------------------------------------------------------------------+
| Context Chips / Mention Summary                                  |
+------------------------------------------------------------------+
| Message Log                                                      |
+------------------------------------------------------------------+
| Composer: input | add file | mention | send | handoff            |
+------------------------------------------------------------------+
| Guidance Block / Compact fallback / Terminal Dock                |
| Share Actions: 選択範囲を送る / 直近出力を添付                   |
+------------------------------------------------------------------+
```

### 3. 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> Zero
    Zero --> Ready: context prepared
    Ready --> Streaming: send
    Ready --> TerminalDockOpen: terminal button
    Streaming --> Cancelled: cancel
    Streaming --> Completed: done
    Ready --> Handoff: terminal-handoff
    Ready --> Compact: narrow width
```

### 4. 必要マイコンポーネント図

```text
WorkspaceChatHeader
WorkspaceFileContextChips
WorkspaceMentionDropdown
WorkspaceChatMessageList
WorkspaceChatInput
CapabilityBanner
CompactGuidanceBlock
PersistentTerminalLauncher
TerminalDock
ComposerAttachmentChip
TranscriptProvenanceLabel
```

### 5. CTA / handoff flow 図

```mermaid
flowchart TD
    A[Select File / Mention] --> B[Context Chips]
    B --> C{Capability}
    C -->|integrated-api| D[送信する]
    C -->|terminal-handoff| E[terminal で続ける]
    A --> F[Terminal Button]
    F --> G[Terminal Dock]
```

## Skill / Agent / Creator Execution Surface

### 1. 核となる責務図

```text
Lifecycle Job Surface
  -> create / execute / improve as user jobs
  -> permission dialog
  -> runtime banner
  -> result summary
  -> persistent terminal entry
```

### 2. 画面構成図

```text
+------------------------------------------------------------------+
| Lifecycle Header / Current Job                      [Terminal]   |
+------------------------------------------------------------------+
| Runtime Banner / Permission Summary                              |
+------------------------------------------------------------------+
| Execution Stream / Result Summary                                |
+------------------------------------------------------------------+
| Primary CTA | Secondary CTA | terminal handoff                   |
+------------------------------------------------------------------+
| Terminal Dock / Transcript Preview                               |
+------------------------------------------------------------------+
```

### 3. 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> Preflight
    Preflight --> Permission
    Permission --> Running: allow
    Permission --> Blocked: deny
    Running --> Streaming
    Streaming --> Review
    Preflight --> Handoff: terminal-handoff
    Preflight --> TerminalDockOpen: terminal button
```

### 4. 必要マイコンポーネント図

```text
LifecycleHeader
RuntimeBanner
PermissionDialog
ExecutionStreamPanel
ResultSummary
HandoffCard
PrimaryActionButton
PersistentTerminalLauncher
TerminalDock
```

### 5. CTA / handoff flow 図

```mermaid
flowchart TD
    A[Choose Job] --> B[Preflight]
    B -->|ok| C[実行する]
    B -->|needs permission| D[Permission Dialog]
    B -->|terminal-handoff| E[terminal で続ける]
    A --> F[Terminal Button]
    F --> G[Terminal Dock]
```
