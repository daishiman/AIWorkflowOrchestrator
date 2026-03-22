# Phase 12 成果物: 実装ガイド

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 12                                                |
| 成果物種別 | 実装ガイド                                        |
| 作成日     | 2026-03-22                                        |

---

## Part 1: 中学生レベル概念説明

### Terminal Handoff とは？ — 「ターミナルへのバトンタッチ」

駅伝のリレーを思い出してほしい。1走者が走りきって次の走者にバトンを渡す瞬間がある。

AI アシスタントが「自分ではできない作業」に出会ったとき、同じことが起きる。AI は「このコマンドをターミナルで実行してね」とバトンを渡す。これが **Terminal Handoff**（ターミナルへのバトンタッチ）。

バトンには 3 つのメモが貼ってある:

1. **terminalCommand** — 何をするか（実行するコマンド）
2. **reason** — なぜバトンを渡すのか（理由）
3. **contextSummary** — どんな状況か（背景説明）

このバトン（メモ）のことを **HandoffGuidance**（ハンドオフの案内票）と呼ぶ。

---

### Persistent Launcher とは？ — 「いつでも開けるターミナルのドア」

学校の建物を想像してほしい。教室・図書館・体育館などどこにいても、玄関から外に出られる。

アプリも同じ。チャット画面・設定画面・スキル一覧画面、どの画面にいても「ターミナルを開く」ボタンが右上にある。これが **Persistent Launcher**（常設の起動ボタン）。

「persistent」= 「ずっとそこにいる」という意味。どこに移動しても消えない。

---

### Manual Boundary とは？ — 「自動操縦禁止ルール」

飛行機は自動操縦できるが、着陸だけはパイロットが手動で行うことがある。なぜなら、一番大事な瞬間は人間が判断すべきだから。

ターミナル操作も同じ。AI が「このコマンドを実行して」と案内しても、**実際に Enter キーを押すのはユーザー自身**。AI が勝手に実行してはいけない。これが **Manual Boundary**（手動操作の境界）。

具体的には 3 つの禁止ルールがある:

- **auto-send 禁止**: コマンドを自動送信してはいけない
- **hidden injection 禁止**: 見えないコマンドをこっそり入れてはいけない
- **headless execution 禁止**: 画面の裏でこっそり実行してはいけない

---

### HandoffGuidance DTO とは？ — 「バトンに貼り付けるメモ」

バトンリレーのバトンに付箋を貼って情報を渡すイメージ。

```
HandoffGuidance（バトンのメモ）
├─ terminalCommand: "claude --dangerously-skip-permissions run skill.md"
├─ contextSummary: "スキル実行のためターミナルアクセスが必要です"
└─ reason: "terminal_required"
```

このメモは AI の内部情報（API キーや設定）を含まず、ユーザーが必要な情報だけが書かれている。

---

## Part 2: 開発者向け実装詳細

### 2.1 実装概要

本タスクは**設計タスク**であり、プロダクションコードの実装は後続実装タスクで行う。本ガイドは後続実装タスクの担当者が設計意図を正確に実装するための参照資料として機能する。

### 2.2 実装順序

後続実装タスクでは以下の順序で実装することを推奨する:

```
Step 1: HandoffGuidance 型定義（packages/shared/src/types/handoff.ts）
  ↓
Step 2: Consumer Adapter 追加（各 service に toHandoffGuidance() を追加）
  ↓
Step 3: TerminalHandoffBuilder.buildForSurface() 統一メソッド実装
  ↓
Step 4: IPC チャンネル定義（terminal-handoff 実パス）
  ↓
Step 5: Renderer コンポーネント更新（TerminalHandoffCard + App Shell Header）
  ↓
Step 6: Zustand Store 更新（handoffGuidance slice）
  ↓
Step 7: Persistent Launcher 配置（App Shell Header）
```

### 2.3 型定義

```typescript
// packages/shared/src/types/handoff.ts
export interface HandoffGuidance {
  /** ユーザーがターミナルで実行するコマンド。API key を含んではいけない（NFR-1a）。*/
  terminalCommand: string;
  /** handoff が発生した文脈の要約（1〜3 文） */
  contextSummary: string;
  /** handoff の理由 */
  reason:
    | "terminal_required"
    | "permission_required"
    | "execution_failed"
    | string;
}
```

### 2.4 Consumer Adapter パターン

各 consumer に `toHandoffGuidance()` adapter 関数を追加する。

```typescript
// apps/desktop/src/main/services/runtime/adapters/toHandoffGuidance.ts
// MN-1 解決: packages/shared に配置するか、各 service の adapter として実装

import type { HandoffGuidance } from "@repo/shared/types/handoff";
import type { TerminalHandoffBundle } from "../types"; // Main Process 内部型

export function terminalHandoffBundleToGuidance(
  bundle: TerminalHandoffBundle,
): HandoffGuidance {
  return {
    terminalCommand: bundle.command,
    contextSummary: bundle.contextSummary ?? "",
    reason: bundle.reason ?? "terminal_required",
  };
}
```

### 2.5 Consumer DTO マッピング

| Consumer      | 現在の DTO                  | 統一後の DTO      | Adapter 関数                      |
| ------------- | --------------------------- | ----------------- | --------------------------------- |
| Chat Edit     | `HandoffGuidance`           | `HandoffGuidance` | 不要（既に統一済み）              |
| Runtime Agent | `TerminalHandoffBundle`     | `HandoffGuidance` | `terminalHandoffBundleToGuidance` |
| Runtime Skill | `TerminalHandoffBundle`     | `HandoffGuidance` | `terminalHandoffBundleToGuidance` |
| Skill Docs    | `SkillDocsCapabilityResult` | `HandoffGuidance` | `skillDocsCapabilityToGuidance`   |
| GuidanceBlock | 独自 variant props          | `HandoffGuidance` | Props 統一（MN-3 解決）           |

### 2.6 IPC 通過型ルール

Renderer に渡して良い型は `HandoffGuidance` のみ。

```typescript
// 禁止: TerminalHandoffBundle を IPC 経由で渡してはいけない
// 理由: promptBundle / manualRetryRule は Main 内部制御情報（NFR-1f）

// 正しい実装
ipcMain.handle("terminal:getHandoffGuidance", async (event) => {
  const bundle = runtimeService.getLastHandoffBundle();
  return bundle ? terminalHandoffBundleToGuidance(bundle) : null;
});
```

### 2.7 Persistent Launcher 実装仕様

```tsx
// apps/desktop/src/renderer/components/organisms/AppShellHeader.tsx
// App Shell Header 右上に固定配置

<IconButton
  aria-label={t("cta.openTerminal")}
  onClick={handleOpenTerminal}
  data-testid="terminal-launcher-button"
>
  <TerminalIcon />
</IconButton>
```

i18n キー: `cta.openTerminal` で全 surface 統一。ラベルは「terminal を開く」。

### 2.8 Manual Boundary 実装ガイド

以下の 3 つの禁止実装パターンを絶対に行ってはいけない:

```typescript
// 禁止 1: auto-send（input に自動入力 + 自動送信）
terminalInput.value = handoffGuidance.terminalCommand; // 禁止
terminalInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" })); // 禁止

// 禁止 2: hidden injection（非表示要素への値注入）
const hiddenInput = document.createElement("input");
hiddenInput.type = "hidden";
hiddenInput.value = handoffGuidance.terminalCommand; // 禁止

// 禁止 3: headless execution（バックグラウンドプロセス起動）
const { exec } = require("child_process");
exec(handoffGuidance.terminalCommand); // 禁止
```

### 2.9 セキュリティ実装チェックリスト

後続実装タスクで以下を確認すること:

| チェック項目                                              | 確認方法                                                      | 参照 Pitfall |
| --------------------------------------------------------- | ------------------------------------------------------------- | ------------ |
| IPC 文字列引数に P42 準拠 3 段バリデーション適用          | ハンドラ実装コードを確認                                      | P42          |
| `os.homedir()` を正規表現に使う際は escapeRegExp()        | `grep -rn "new RegExp" apps/desktop/src/main/`                | P55          |
| Provider/Model 未選択時に DEFAULT_CONFIG fallback なし    | `grep -rn "DEFAULT_CONFIG" apps/desktop/src/main/`            | P62          |
| terminalCommand に API key が含まれないことを確認         | unit test で `/sk-[A-Za-z0-9]+/` パターンが 0 件              | NFR-1a       |
| TerminalHandoffBundle が renderer/ に import されていない | `grep -rn "TerminalHandoffBundle" apps/desktop/src/renderer/` | NFR-1f       |

### 2.10 テスト戦略

後続実装タスクでは以下のテスト戦略を採用すること:

| テスト種別       | 対象                              | 参照資料             |
| ---------------- | --------------------------------- | -------------------- |
| Unit Test        | `toHandoffGuidance()` adapter     | test-matrix.md       |
| Unit Test        | `buildForSurface()` 統一メソッド  | test-matrix.md       |
| Unit Test        | IPC バリデーション（P42 準拠）    | contract-matrix.md   |
| Component Test   | TerminalHandoffCard の Props 表示 | screenshot-plan.json |
| Integration Test | handoff 発生 → card 表示 フロー   | manual-test-plan.md  |
| E2E Test         | TC-MAN-1〜8 のシナリオ            | manual-test-plan.md  |
| Screenshot Test  | P53 対策スクリーンショット取得    | screenshot-plan.json |

### 2.11 known pitfalls 対応一覧

| Pitfall | 本タスクでの設計対応                                          |
| ------- | ------------------------------------------------------------- |
| P31     | Zustand で `handoffGuidance` は個別セレクタで取得             |
| P48     | `useShallow` を filter/map 派生セレクタに適用                 |
| P50     | 既存 HandoffGuidance 実装の有無を Phase 4 開始前に確認        |
| P64     | `HandoffGuidance` を `packages/shared/` に 1 箇所に集約       |
| P65     | IPC namespace は `skill-creator:*` に統合し dead-end を避ける |
