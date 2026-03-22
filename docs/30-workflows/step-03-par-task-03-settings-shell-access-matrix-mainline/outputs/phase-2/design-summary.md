# Phase 2: 設計サマリー

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. Concern 分解（3 Concern）

### Concern 1: Settings Access Matrix Section

**責務**: Settings 画面に capability / health / provider の統合情報を表示する

**情報階層**:

```
AccessMatrixSection
  +-- CapabilityCard         capability 4状態の視覚表示
  |     +-- status icon      integratedRuntime / terminalSurface / both / none
  |     +-- label            状態ラベル
  |     +-- CTA              resolveCtaContract() から導出
  +-- HealthStatusRow        provider 接続状態
  |     +-- indicator        connected(緑) / disconnected(灰) / error(赤) / null(未選択)
  |     +-- provider name    選択中 provider 名 or 未選択メッセージ
  |     +-- reconnect CTA    disconnected 時のみ
  +-- ProviderSummaryCard    選択 provider/model の要約
        +-- provider name    選択中 provider 名
        +-- model name       選択中 model 名
        +-- guidance         未選択時のガイダンス（P62: fallback 禁止）
```

**所有境界**: SettingsView が AccessMatrixSection を所有。AccessMatrixSection は3子コンポーネントを所有。

### Concern 2: AppLayout Persistent Launcher

**責務**: 全画面で terminal handoff への導線を提供する

**情報階層**:

```
AppLayout (既存)
  +-- header (既存)
  |     +-- back button (既存)
  |     +-- DynamicIsland (既存)
  |     +-- NotificationCenter (既存)
  |     +-- TerminalLauncher       <-- 新規追加
  |           +-- launcher button  活性/非活性
  |           +-- tooltip          非活性時の disabledReason
  +-- main (既存)
  +-- footer (既存 mobile のみ)
```

**配置決定**: header 右側（NotificationCenter の左隣）に配置する。

**理由**:

- footer は mobile のみ表示のため不適
- sidebar は desktop のみ表示のため不適
- header 右側は全画面共通で表示され、発見性が高い

### Concern 3: Public Shell Access Contract

**責務**: 未認証時に guidance-only モードを提供し、操作 CTA を非表示にする

**実装方式**: 条件分岐方式（専用コンポーネント分離ではない）

**理由**:

- guidance-only ロジックは AccessMatrixSection 内の isAuthenticated props で制御できる
- 専用コンポーネントに分離すると、同一 props interface のコンポーネントが2つ存在し、メンテナンスコストが増加する
- 条件分岐は CapabilityCard / ProviderSummaryCard 内で CTA の表示/非表示を切り替えるだけで実現可能

**不変条件**: PUBLIC_UNAUTHENTICATED_VIEWS = ["settings"] は変更しない

## 2. review harness 依存の確認

本設計は review harness を一切前提としない。全コンポーネントは Props ベースで設計され、Store / IPC からの state 供給は個別セレクタまたは Props 直接注入で行う。

review harness 依存箇所: **0 箇所** (AC-4 充足)

## 3. Simpler Alternative の比較

### Alternative A: Access Matrix を独立画面にする

| 観点         | 本設計（セクション統合）          | Alternative A（独立画面）                 |
| ------------ | --------------------------------- | ----------------------------------------- |
| 発見性       | Settings 画面内で即座に確認可能   | ナビゲーション追加が必要                  |
| 実装コスト   | 中（セクション追加のみ）          | 高（新規ビュー + ルーティング追加）       |
| 既存契約     | PUBLIC_UNAUTHENTICATED_VIEWS 不変 | 新規ビューの公開/非公開を決定する必要あり |
| **採用判断** | **採用**                          | 不採用: 既存 IA への影響が大きい          |

### Alternative B: TerminalLauncher を Settings 限定にする

| 観点         | 本設計（全画面 persistent） | Alternative B（Settings 限定）            |
| ------------ | --------------------------- | ----------------------------------------- |
| 発見性       | 全画面でアクセス可能        | Settings を開かないと見えない             |
| 実装コスト   | 中（AppLayout 変更）        | 低（SettingsView のみ変更）               |
| **採用判断** | **採用**                    | 不採用: terminal handoff の発見性が落ちる |

### Alternative C: guidance-only を専用コンポーネントにする

| 観点         | 本設計（条件分岐）  | Alternative C（専用コンポーネント） |
| ------------ | ------------------- | ----------------------------------- |
| メンテナンス | Props 1セットで管理 | 同一 Props の2コンポーネント管理    |
| 実装コスト   | 低                  | 中（重複コード発生）                |
| **採用判断** | **採用**            | 不採用: DRY 原則違反                |
