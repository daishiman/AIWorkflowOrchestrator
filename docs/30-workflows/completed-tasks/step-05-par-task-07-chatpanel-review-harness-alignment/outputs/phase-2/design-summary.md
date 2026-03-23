# Phase 2: 設計サマリー

> タスクID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
> 作成日: 2026-03-23
> 前提: Phase 1 成果物（requirements-definition.md, scope-definition.md, current-state-inventory.md）

## 1. Concern 分解（3 つ以下）

### Concern 1: Review Harness Role Enforcement

ChatPanel が review harness であることを型レベル・コメントレベル・仕様レベルで担保する。

| 層     | 現状                                             | 目標                                                          |
| ------ | ------------------------------------------------ | ------------------------------------------------------------- |
| JSDoc  | `@task TASK-IMP-CHATPANEL-REAL-AI-CHAT-001` のみ | `@role review-harness` を追加                                 |
| 仕様書 | ui-ux-panels.md に統合パターン記載あり           | review harness role を明示セクション化                        |
| 型制約 | ChatPanelProps に role 区別なし                  | Props に `role?: "review-harness"` を追加（将来の型ガード用） |

**所有境界**: ChatPanel.tsx の JSDoc と Props 型定義

### Concern 2: No-op Callback Elimination

Phase 1 で検出した 4 箇所の no-op コールバックを actionable な実装に置換する。

| GAP-ID | コールバック                  | 推奨実装パターン                                                  | 理由                             |
| ------ | ----------------------------- | ----------------------------------------------------------------- | -------------------------------- |
| GAP-01 | `onTerminalSwitch={() => {}}` | Store action: `useAppStore.getState().setCurrentView("terminal")` | navigation は Store 経由が標準   |
| GAP-02 | `onSelectProvider={() => {}}` | Store action: `useAppStore.getState().setSelectedProviderId(id)`  | provider 選択は既存 Store action |
| GAP-03 | `onSelectModel={() => {}}`    | Store action: `useAppStore.getState().setSelectedModelId(id)`     | model 選択は既存 Store action    |
| GAP-04 | `onOpenTerminal={() => {}}`   | IPC call: `window.electronAPI.system.openTerminal()`              | terminal 起動は IPC 経由が原則   |

**所有境界**: ChatPanel.tsx のコールバック引数

### Concern 3: Mainline-Harness Parity Validation

mainline と harness の差分を定量的に固定し、drift を検出可能にする。

| 検証観点    | mainline 基準           | harness 条件          | 検出方法                                      |
| ----------- | ----------------------- | --------------------- | --------------------------------------------- |
| 状態数      | 8 state                 | 8 state（同一）       | `grep -c "chatPanelStatus ===" ChatPanel.tsx` |
| CTA 数      | primary 1 + secondary 1 | 同一                  | `grep -c "CTA\|onClick" ChatPanel.tsx`        |
| no-op 数    | 0                       | 0                     | `grep -c "() => {}" ChatPanel.tsx`            |
| fallback 先 | settings 画面           | settings 画面（同一） | `handleNavigateToSettings` の呼び出し確認     |

**所有境界**: validation-matrix.md と Phase 4 テストマトリクス

## 2. Simpler Alternative 比較

### Alternative A: ChatPanel を削除して mainline に統合

| 観点   | 評価                                                |
| ------ | --------------------------------------------------- |
| 単純性 | 最も単純                                            |
| リスク | mainline 側に review harness 固有ロジックが混入する |
| 採用   | **不採用** — lane 分離方針に反する                  |

### Alternative B: ChatPanel を read-only view にダウングレード

| 観点   | 評価                                                    |
| ------ | ------------------------------------------------------- |
| 単純性 | 中程度                                                  |
| リスク | CTA が read-only になり、actionability 要件を満たさない |
| 採用   | **不採用** — AC-2（no-op CTA 禁止）違反                 |

### Alternative C（採用案）: No-op 排除 + Role 明文化

| 観点   | 評価                                                    |
| ------ | ------------------------------------------------------- |
| 単純性 | 最小変更で目的達成                                      |
| リスク | 低（既存実装の 4 箇所修正 + JSDoc 追加のみ）            |
| 採用   | **採用** — AC 全項目を満たし、mainline 侵食リスクが最低 |

## 3. Lane 制御（3 以下）

| Lane           | 責務                             | 主担当             | ChatPanel との関係                             |
| -------------- | -------------------------------- | ------------------ | ---------------------------------------------- |
| Mainline       | user-facing primary AI execution | Task03-06          | ChatPanel は mainline を参照するが、代替しない |
| Review Harness | mainline 契約の再現・検証        | Task07（本タスク） | ChatPanel がこの lane に属する                 |
| Legacy         | 旧 lane の cleanup               | Task08             | ChatPanel は legacy lane に属さない            |

**結論**: lane 数 = 3。ChatPanel は Review Harness lane に固定。

## 4. Phase 3 Review へのハンドオフ

### 4.1 Review 重点

| 観点             | drift しやすい箇所                          | blocked 条件                                                   |
| ---------------- | ------------------------------------------- | -------------------------------------------------------------- |
| mainline 侵食    | ChatPanel が primary lane の CTA を奪う     | mainline 側の ChatView 実装が確定していない場合                |
| no-op 再発       | 新規コールバック追加時に no-op がデフォルト | 子コンポーネントの Props 型が optional callback を許容する場合 |
| panel-only drift | harness 固有ロジックが mainline と乖離      | 依存タスク（Task03-06）の Phase 2 成果物が変更された場合       |

### 4.2 Phase 3 で判定すべき項目

1. Concern 1-3 が AC-1〜AC-4 を網羅しているか
2. no-op 排除の実装パターンが既存 Store/IPC 契約と整合しているか
3. simpler alternative の棄却理由が妥当か
