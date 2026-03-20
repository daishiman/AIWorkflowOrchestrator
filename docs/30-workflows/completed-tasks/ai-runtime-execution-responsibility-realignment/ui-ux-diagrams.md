# AI Runtime Execution Responsibility UI/UX 図解

## 前提の明確化

今回の terminal lane は、`裏で claude を自動実行して結果だけ見せる仕組み` ではない。
本パックは、manual terminal lane を first-class にしつつ mainline UI を回復するための spec-only workflow である。

| 項目             | 今回の採用                                             | 採用しない構造                                 |
| ---------------- | ------------------------------------------------------ | ---------------------------------------------- |
| 実行主体         | ユーザーが terminal 上で `claude` を実行する           | アプリが裏で `claude` を自動起動・自動送信する |
| アプリの役割     | terminal UI、transcript 表示、copy、launcher、open cwd | hidden prompt injection、headless automation   |
| mainline UI      | capability と next action を説明する                   | local 判定で黙って fallback する               |
| transcript share | 明示手動で chat へ共有する                             | 自動 message 化する                            |

## 図解フォーマット

各 surface について、次の 5 種の図解をそろえる。

1. 核となる責務図
2. 画面構成図
3. 状態遷移図
4. 必要マイコンポーネント図
5. CTA / handoff flow 図

## Core Execution Model

### 1. 核となる責務図

```text
User Intent
   |
   v
Surface UI
   |
   v
Central Policy / Capability Resolver
   |---------------- integrated-runtime -----------------> Main Runtime -> Provider
   |---------------- terminal-handoff -------------------> Handoff Card -> User-operated Terminal
   |---------------- terminal-only ----------------------> Terminal Surface
   |---------------- guidance-only ----------------------> Guidance Block / Settings
```

### 2. 画面構成図

```text
+------------------------------------------------------------------+
| App Shell Header                                   [Terminal]    |
+------------------------------------------------------------------+
| Access Card / Runtime Banner / Health / Guidance                 |
+------------------------------------------------------------------+
| Primary Work Area                                                |
| - Settings / Chat / Workspace / Docs / Slide                     |
+------------------------------------------------------------------+
| Handoff Card / Transcript Dock / Share Actions                   |
+------------------------------------------------------------------+
```

### 3. 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> ResolveCapability
    ResolveCapability --> Ready: integrated-runtime
    ResolveCapability --> Handoff: terminal-handoff
    ResolveCapability --> TerminalOnly: terminal-only
    ResolveCapability --> GuidanceOnly: guidance-only
    Ready --> Running: execute
    Running --> Streaming: stream
    Running --> Failed: error
    Streaming --> Completed: done
    Handoff --> TerminalDockOpen: open terminal
    TerminalOnly --> TerminalDockOpen
    GuidanceOnly --> SettingsOpen: open settings
```

### 4. 必要マイコンポーネント図

```text
AccessCapabilityCard
RuntimeBanner
HealthRow
GuidanceBlock
HandoffCard
PersistentTerminalLauncher
TerminalDock
TranscriptPanel
TranscriptSelectionToolbar
ProvenanceChip
```

### 5. CTA / handoff flow 図

```mermaid
flowchart LR
    A[User Action] --> B[Resolve Capability]
    B -->|integrated-runtime| C[Primary CTA: 実行]
    B -->|terminal-handoff| D[Primary CTA: terminal を開く]
    B -->|guidance-only| E[Primary CTA: 設定を見る]
    D --> F[Copy Command / Copy Context / Open CWD]
    G[Header Terminal Button] --> D
```

## Settings / Shell Access Matrix Mainline

### 1. 核となる責務図

```text
Settings / Shell
  -> AccessCapabilityCard group
  -> Provider / Selected Config Summary
  -> Health Row
  -> Public Shell Fallback
  -> Persistent Terminal Launcher
```

### 2. 画面構成図

```text
+------------------------------------------------------------------+
| Settings Header                                   [Terminal]     |
+------------------------------------------------------------------+
| Access Matrix Cards                                              |
| [Integrated Runtime] [Terminal Surface] [Unavailable / Blocked]  |
+------------------------------------------------------------------+
| Provider / Model / Selected Config Summary                       |
+------------------------------------------------------------------+
| Health Row / Connection Status                                   |
+------------------------------------------------------------------+
| Public Shell / Settings Bypass Guidance                          |
+------------------------------------------------------------------+
| Terminal Dock (collapsed / expanded)                             |
+------------------------------------------------------------------+
```

### 3. 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> MissingKey: api key absent
    Idle --> Ready: key valid
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
ProviderSummary
SelectedConfigSummary
HealthRow
GuidanceBlock
PersistentTerminalLauncher
TerminalDock
PublicShellPanel
```

### 5. CTA / handoff flow 図

```mermaid
flowchart TD
    A[Open Settings] --> B{Capability State}
    B -->|Missing Key| C[API key を設定]
    B -->|Ready| D[この設定で使う]
    B -->|Terminal Needed| E[terminal を開く]
    E --> F[Terminal Dock Open]
```

## Main Chat / Workspace Guidance Wiring

### 1. 核となる責務図

```text
Main Chat / Workspace
  -> Composer / Context Chips
  -> Runtime Banner
  -> Guidance Block
  -> Terminal Handoff Action
  -> No local resolve
```

### 2. 画面構成図

```text
+------------------------------------------------------------------+
| Header / Capability                                 [Terminal]   |
+------------------------------------------------------------------+
| Context Chips / Runtime Banner / Guidance                        |
+------------------------------------------------------------------+
| Message Log                                                      |
+------------------------------------------------------------------+
| Composer: input | add file | mention | send                      |
+------------------------------------------------------------------+
| Guidance Block / Handoff Card / Terminal Dock                    |
+------------------------------------------------------------------+
```

### 3. 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> Zero
    Zero --> Ready: context ok
    Zero --> Blocked: policy says blocked
    Ready --> Streaming: send
    Ready --> Handoff: terminal-handoff
    Ready --> TerminalDockOpen: terminal button
    Streaming --> Cancelled: cancel
    Streaming --> Completed: done
    Blocked --> SettingsOpen: open settings
```

### 4. 必要マイコンポーネント図

```text
RuntimeBanner
GuidanceBlock
ChatComposer
WorkspaceContextChips
WorkspaceMentionDropdown
SendButton
TerminalLaunchButton
HandoffCard
TerminalDock
```

### 5. CTA / handoff flow 図

```mermaid
flowchart TD
    A[Type Message / Select Context] --> B{Blocked Reason}
    B -->|integrated-runtime| C[送信する]
    B -->|missing-key| D[設定を見る]
    B -->|terminal-handoff| E[terminal を開く]
    B -->|copy-only| F[context をコピー]
```

## Terminal Handoff Surface / Docs Consumer

### 1. 核となる責務図

```text
Terminal Handoff Surface
  -> user-operated shell
  -> transcript viewer
  -> copy command / copy context / open cwd
  -> docs consumer handoff
  -> no auto-send boundary
```

### 2. 画面構成図

```text
+----------------------+--------------------------------------------+
| Session List         | Transcript Panel                           |
| - current            | > stdout / stderr                          |
| - history            | > status badge                             |
| - reconnect          | > selection toolbar                        |
+----------------------+--------------------------------------------+
| Action Rail: Copy Cmd | Copy Context | Open CWD | Abort | Retry   |
+------------------------------------------------------------------+
| Docs Consumer Guidance / Shared Handoff Card                     |
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
    Unavailable --> GuidanceOnly: install / setup guidance
```

### 4. 必要マイコンポーネント図

```text
PersistentTerminalLauncher
TerminalDock
SessionList
TranscriptPanel
StatusBadge
ActionRail
CopyCommandButton
CopyContextButton
OpenCwdButton
AbortButton
RetryButton
DocsHandoffCard
```

### 5. CTA / handoff flow 図

```mermaid
flowchart LR
    A[Header / Surface Terminal Button] --> B[Terminal Dock]
    B --> C{CLI available?}
    C -->|Yes| D[User types claude]
    D --> E[Transcript visible]
    C -->|No| F[Install Guidance]
    G[Docs Consumer] --> H[Shared Handoff Card]
    H --> B
```

## Transcript -> Chat Manual Bridge

### 1. 核となる責務図

```text
Terminal Transcript
  -> user selects output
  -> explicit share action
  -> chat composer receives text / attachment
  -> provenance chip records the source
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
    ChatAttached --> ProvenanceVisible
    ChatPasted --> ProvenanceVisible
    ProvenanceVisible --> [*]
```

### 4. 必要マイコンポーネント図

```text
TranscriptSelectionToolbar
ShareToChatButton
AttachRecentOutputButton
PasteSessionButton
ComposerAttachmentChip
TranscriptProvenanceChip
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
    G --> H[Provenance Chip]
```

## ChatPanel Review Harness

### 1. 核となる責務図

```text
ChatPanel Review Harness
  -> mainline contract replay
  -> message list
  -> composer
  -> runtime banner
  -> launcher
  -> never placeholder / no-op
```

### 2. 画面構成図

```text
+------------------------------------------------------------------+
| Review Harness Header                               [Terminal]   |
+------------------------------------------------------------------+
| Runtime Banner / Guidance                                       |
+------------------------------------------------------------------+
| Message List                                                     |
+------------------------------------------------------------------+
| Composer: input | send | terminal                                |
+------------------------------------------------------------------+
| Terminal Dock / Transcript Share / Provenance                    |
+------------------------------------------------------------------+
```

### 3. 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> ReviewEmpty
    ReviewEmpty --> ReviewReady: capability ok
    ReviewEmpty --> Blocked: policy says blocked
    ReviewReady --> ReviewStreaming: send
    ReviewReady --> Handoff: terminal-handoff
    ReviewReady --> TerminalDockOpen: terminal button
    ReviewStreaming --> Completed: done
    ReviewStreaming --> Cancelled: cancel
```

### 4. 必要マイコンポーネント図

```text
ReviewHarnessHeader
RuntimeBanner
ChatMessageList
ComposerInput
SendButton
GuidanceBlock
PersistentTerminalLauncher
TerminalDock
ProvenanceChip
```

### 5. CTA / handoff flow 図

```mermaid
flowchart TD
    A[Harness Input] --> B{Mainline Contract}
    B -->|ready| C[送信する]
    B -->|blocked| D[設定を見る]
    B -->|handoff| E[terminal を開く]
    E --> F[Terminal Dock]
```

## Slide / Modifier Manual Fallback

### 1. 核となる責務図

```text
Slide / Modifier
  -> reverse-sync request
  -> integrated lane or degraded legacy lane
  -> manual fallback guidance
  -> no silent direct SDK path
```

### 2. 画面構成図

```text
+------------------------------------------------------------------+
| Slide Header                                        [Terminal]   |
+------------------------------------------------------------------+
| Progress Row / Runtime Banner / Degraded Notice                  |
+------------------------------------------------------------------+
| Workspace / Preview / Result Summary                             |
+------------------------------------------------------------------+
| Primary CTA | Manual Fallback | Guidance                         |
+------------------------------------------------------------------+
| Terminal Dock / Legacy Cleanup Note                              |
+------------------------------------------------------------------+
```

### 3. 状態遷移図

```mermaid
stateDiagram-v2
    [*] --> Synced
    Synced --> Running: reverse-sync execute
    Synced --> Degraded: manual fallback needed
    Running --> Completed: done
    Running --> Failed: error
    Degraded --> TerminalDockOpen: open terminal
    Failed --> Guidance: show manual steps
```

### 4. 必要マイコンポーネント図

```text
SlideRuntimeBanner
ProgressRow
DegradedNotice
ManualFallbackCard
PrimaryActionButton
PersistentTerminalLauncher
TerminalDock
LegacyCleanupNote
```

### 5. CTA / handoff flow 図

```mermaid
flowchart TD
    A[Reverse-sync Request] --> B{Lane}
    B -->|integrated| C[reverse-sync を実行]
    B -->|degraded| D[manual fallback を開く]
    D --> E[terminal を開く]
    E --> F[Terminal Dock]
```
