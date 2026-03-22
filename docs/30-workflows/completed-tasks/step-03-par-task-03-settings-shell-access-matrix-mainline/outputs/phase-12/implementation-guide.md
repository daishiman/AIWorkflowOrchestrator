# Phase 12: 実装ガイド

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

---

## Part 1: 概念説明（中学生レベル）

### Settings Access Matrix って何？

学校の「連絡掲示板」を想像してください。教室に入ると、掲示板には今日の連絡事項が貼ってあります。Settings Access Matrix は、アプリの「連絡掲示板」です。

- **何ができるか**（CapabilityCard）: 今日の授業で使える教室はどこか
- **回線は繋がっているか**（HealthStatusRow）: 教室のWi-Fiは使えるか
- **どの先生の授業か**（ProviderSummaryCard）: 今選んでいる AI の名前

### 4つの capability 状態 = 信号機

| 信号                        | 意味             | アプリでは                  |
| --------------------------- | ---------------- | --------------------------- |
| 青信号（integratedRuntime） | 渡れる           | AI を直接使える             |
| 黄信号（terminalSurface）   | 注意して渡れる   | ターミナル経由でなら使える  |
| 青+黄（both）               | どちらでも渡れる | AI でもターミナルでも使える |
| 赤信号（none）              | 渡れない         | まず設定が必要              |

### Persistent Launcher = 校内放送スピーカー

どの教室にいても聞こえる校内放送スピーカーのように、TerminalLauncher はどの画面にいても見える場所にあります。「ターミナルを開きたい」と思ったとき、いちいち Settings 画面に戻る必要がありません。

### 未認証時の guidance-only = 校門の案内板

校門の外にも案内板はあります。「何時から何時まで開いてるか」「何を持ってくればいいか」は読めます。でも、中に入って授業を受けるには学生証（ログイン）が必要です。

---

## Part 2: 開発者向け実装詳細

### 1. 3 Concern の実装順序

```
Concern 1: Settings Access Matrix Section
  -> CapabilityCard / HealthStatusRow / ProviderSummaryCard / AccessMatrixSection
  -> 依存: execution-capability.ts (消費のみ)

Concern 2: AppLayout Persistent Launcher
  -> TerminalLauncher
  -> 依存: AccessCapability (Props 経由)

Concern 3: Public Shell Access Contract
  -> isAuthenticated props による guidance-only 制御
  -> 依存: Concern 1 の AccessMatrixSection に追加
```

実装順序: **Concern 1 → Concern 2 → Concern 3**（Concern 3 は Concern 1 に依存）

### 2. 回帰観点の対応付け

| Concern | 回帰観点                                           | 注意点                                           |
| ------- | -------------------------------------------------- | ------------------------------------------------ |
| C-1     | RG-01 (P31), RG-02 (P48), RG-04 (P62), RG-06 (CTA) | 個別セレクタ使用、useShallow 適用、fallback 禁止 |
| C-2     | RG-03 (P5)                                         | health subscription の cleanup 必須              |
| C-3     | RG-05 (bypass)                                     | PUBLIC_UNAUTHENTICATED_VIEWS 不変                |

### 3. 既存契約との整合ポイント

| 契約              | 遵守事項                                                        |
| ----------------- | --------------------------------------------------------------- |
| Settings bypass   | PUBLIC_UNAUTHENTICATED_VIEWS = ["settings"] を変更しない        |
| Reset exclusion   | shouldResetUnauthenticatedView.ts を変更しない                  |
| Public shell      | guidance-only は表示制御のみ。アクセス制御は変更しない          |
| CTA 契約 (Task01) | primary 1 + secondary 1 の上限を守る                            |
| P62               | provider 未選択時に DEFAULT_CONFIG への暗黙 fallback を行わない |

### 4. コンポーネント Props Interface

#### CapabilityCard

```typescript
interface CapabilityCardProps {
  capability: AccessCapability; // "integratedRuntime" | "terminalSurface" | "both" | "none"
  uiState: UiState; // "ready" | "blocked" | "unavailable"
  blockedInfo?: BlockedInfo; // uiState=blocked 時のみ
  ctaContract: CtaContract; // resolveCtaContract() から導出
  isAuthenticated: boolean; // guidance-only 制御
  isLoading?: boolean; // loading skeleton 表示
}
```

#### HealthStatusRow

```typescript
type HealthStatus = "connected" | "disconnected" | "error";

interface HealthStatusRowProps {
  health: HealthStatus | null; // null = provider 未選択
  providerName?: string; // 選択中の provider 名
  onReconnect?: () => void; // disconnected 時の再接続 CTA
}
```

#### ProviderSummaryCard

```typescript
interface ProviderSummaryCardProps {
  selectedProvider?: string; // 選択中の provider 名
  selectedModel?: string; // 選択中の model 名
  isAuthenticated: boolean; // guidance-only 制御
}
```

#### TerminalLauncher

```typescript
interface TerminalLauncherProps {
  capability: AccessCapability;
  isDisabled: boolean;
  disabledReason?: string; // 非活性時のツールチップ
  onLaunch?: () => void; // terminal 起動 IPC 呼び出し
}
```

#### AccessMatrixSection

```typescript
interface AccessMatrixSectionProps {
  capability: AccessCapability;
  uiState: UiState;
  blockedInfo?: BlockedInfo;
  health: HealthStatus | null;
  selectedProvider?: string;
  selectedModel?: string;
  isAuthenticated: boolean;
  isLoading?: boolean;
}
```
