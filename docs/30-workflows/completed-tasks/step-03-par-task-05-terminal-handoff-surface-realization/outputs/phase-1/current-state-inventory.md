# Phase 1: 現状棚卸しインベントリ

## メタ情報

| 項目     | 内容                                              |
| -------- | ------------------------------------------------- |
| タスクID | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase    | 1                                                 |
| 作成日   | 2026-03-22                                        |

## 1. Codepath インベントリ

### 1.1 Renderer 層

| ファイル                         | 行数 | 現状                                       | Terminal Handoff 関連                                  |
| -------------------------------- | ---- | ------------------------------------------ | ------------------------------------------------------ |
| `ExecutionEnvironment/index.tsx` | 168  | terminal case は "Coming soon" placeholder | `environmentType: "terminal"` で分岐するが未実装       |
| `phase11-terminal-surface.tsx`   | 73   | Phase 11 再監査用テストハーネス            | `?scenario=terminal` で harness 駆動、実コンテンツなし |

### 1.2 Main Process 層

| ファイル                         | 行数 | 現状     | Terminal Handoff 関連                                                     |
| -------------------------------- | ---- | -------- | ------------------------------------------------------------------------- |
| `TerminalHandoffBuilder.ts`      | 53   | 実装済み | `build()` → `HandoffGuidance { terminalCommand, contextSummary, reason }` |
| `SkillDocsCapabilityResolver.ts` | 32   | 実装済み | 3 値 capability: `integrated-api` / `guidance-only` / `terminal-handoff`  |

### 1.3 Preload 層

| ファイル       | 行数 | 現状          | Terminal Handoff 関連                                          |
| -------------- | ---- | ------------- | -------------------------------------------------------------- |
| `skill-api.ts` | 835  | Skill IPC API | terminal handoff は chat-edit サービスの責務であり直接関係なし |

## 2. 既存 DTO・型定義

### 2.1 HandoffGuidance DTO

```typescript
interface HandoffGuidance {
  terminalCommand: string; // CLI コマンド（API key 除外）
  contextSummary: string; // コンテキスト要約
  reason: string; // handoff 理由
}
```

**セキュリティ制約**: `terminalCommand` に API key を含めない（TerminalHandoffBuilder L8）

### 2.2 SkillDocsCapability

```typescript
type SkillDocsCapability =
  | "integrated-api"
  | "guidance-only"
  | "terminal-handoff";

interface SkillDocsCapabilityResult {
  capability: SkillDocsCapability;
  provider?: string;
  guidance?: string;
  reason?: string;
}
```

### 2.3 AccessCapability

```typescript
type AccessCapability =
  | "integratedRuntime"
  | "terminalSurface"
  | "both"
  | "none";
```

## 3. Terminal Surface 状態語彙（親パック定義）

| 状態            | 意味                              | UI 表示                     | 禁止事項             |
| --------------- | --------------------------------- | --------------------------- | -------------------- |
| `collapsed`     | dock 最小化                       | header に launcher button   | 状態表示なし         |
| `idle`          | 起動済み・input 待機              | `shell ready` メッセージ    | auto-send 禁止       |
| `input-waiting` | コマンド入力待ち                  | cursor + ready badge        | silent timeout 禁止  |
| `running`       | `claude` command 実行中           | progress indicator          | interrupt なしで進行 |
| `unavailable`   | CLI missing / health check failed | install guidance + launcher | blank state 禁止     |

## 4. 既存関連タスクの完了状態

| タスク                                      | ステータス         | Task05 との関係                  |
| ------------------------------------------- | ------------------ | -------------------------------- |
| TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 | 完了（2026-03-14） | TerminalHandoffBuilder の元実装  |
| TASK-IMP-SKILL-DOCS-AI-RUNTIME-001          | 完了（2026-03-16） | SkillDocsCapabilityResolver 実装 |
| TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001  | 完了               | Task05 の依存先                  |

## 5. Gap 分析

| Gap ID | 説明                                                                          | 影響                                 |
| ------ | ----------------------------------------------------------------------------- | ------------------------------------ |
| GAP-01 | ExecutionEnvironment の terminal case が placeholder                          | persistent launcher が未実装         |
| GAP-02 | TerminalHandoffCard は定義済みだが shared handoff card として統一されていない | consumer ごとに UI drift リスク      |
| GAP-03 | guidance-only と terminal-only の意味差が codepath に反映されていない         | capability 分岐の曖昧性              |
| GAP-04 | Docs consumer → terminal handoff の接続が未実装                               | Skill Docs が guidance-only で止まる |
| GAP-05 | manual boundary（auto-send 禁止）が docstring レベルで固定されていない        | 後続実装での boundary 破りリスク     |
