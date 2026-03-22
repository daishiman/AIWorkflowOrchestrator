# Phase 2 成果物: 設計サマリー

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 2（設計）                                         |
| 成果物種別 | 設計サマリー                                      |
| 作成日     | 2026-03-22                                        |

---

## 1. Concern 分解表

3つの Concern を ownership / state / action / validation の4軸で整理する。

| Concern | 名称             | Ownership 層                   | 主な State                                        | 主な Action                                    | Validation 責任                                 |
| ------- | ---------------- | ------------------------------ | ------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- |
| **C-A** | Launcher         | Renderer                       | collapsed / idle / unavailable                    | openTerminal / closeTerminal                   | CLI 存在確認（Main）                            |
| **C-B** | Handoff Card     | Renderer（表示）+ Main（構築） | 非表示 / 表示中 / dismissed                       | copyCommand / copyContext / dismissHandoffCard | API key 非含有（Main）、P55 sanitize            |
| **C-C** | Consumer Adapter | Main Process                   | guidance-only / terminal-handoff / integrated-api | resolveCapability / buildHandoffGuidance       | SkillDocsCapabilityResult 型チェック（P42 3段） |

### 1.1 Concern-A: Launcher

**責務**: アプリ全体に常駐する terminal 起動ボタンの配置・挙動・再入可能性を定義する。

| 項目        | 設計決定                                                               |
| ----------- | ---------------------------------------------------------------------- |
| 配置        | App Shell Header 右上に icon button を固定配置（常時表示）             |
| 起動方式    | bottom sheet（macOS: slide-up panel）で terminal dock を展開する       |
| アイコン    | `terminal` アイコン（SF Symbols 互換、16px）                           |
| ラベル      | 「terminal を開く」（i18n key: `cta.openTerminal`）。全 surface で統一 |
| 再入        | 閉じても session 保持。再度開けば transcript が継続して表示される      |
| 所有層      | Renderer（App Shell Header component）                                 |
| 依存        | Task06 Transcript Provenance が terminal session UI を提供する         |
| unavailable | CLI が存在しない場合は `unavailable` 状態でボタンを disabled 表示する  |

**決定理由**: bottom sheet は macOS HIG の sheet パターンに準拠し、mainline surface のコンテンツを遮らずに terminal を表示できる。side panel は workspace の横幅を圧迫する。dock は OS レベルの用語と衝突するため採用しない。

### 1.2 Concern-B: Handoff Card

**責務**: integrated 実行が不可能なときに表示する統一 handoff UI。HandoffGuidance DTO を直接消費する。

| 項目           | 設計決定                                                      |
| -------------- | ------------------------------------------------------------- |
| 共通 DTO       | `HandoffGuidance`（`packages/shared/src/types/handoff.ts`）   |
| コンポーネント | `TerminalHandoffCard`（organisms 層）を全 consumer で共有する |
| 必須3要素      | terminalCommand 表示、contextSummary 表示、copy CTA           |
| 表示条件       | `handoffGuidance != null` の場合のみ表示する                  |
| 位置           | 各 surface のメインコンテンツ領域直下（inline）               |
| Primary CTA    | 「コマンドをコピー」（i18n key: `cta.copyCommand`）           |
| Secondary CTA  | 「閉じる」（i18n key: `cta.dismiss`）                         |
| 所有層         | 表示: Renderer（organisms/TerminalHandoffCard）/ 構築: Main   |

**DTO フロー**:

```
Main: IRuntimePolicyResolver.resolve()
  → type === "terminal_handoff"
  → TerminalHandoffBuilder.buildForSurface(request, surfaceType, reason)
  → HandoffGuidance { terminalCommand, contextSummary, reason }
  → IPC response
  → Renderer: TerminalHandoffCard に HandoffGuidance を props として渡す
```

### 1.3 Concern-C: Consumer Adapter

**責務**: guidance-only / terminal-handoff の分岐ロジックを各 consumer に分散させず、共通 adapter に集約する。

| 項目          | 設計決定                                                                            |
| ------------- | ----------------------------------------------------------------------------------- |
| 統一パターン  | 全 consumer が `HandoffGuidance` を消費する adapter 関数 `toHandoffGuidance` を持つ |
| Chat Edit     | 既存: `SendWithContextResponse.guidance` に HandoffGuidance を設定済み              |
| Runtime       | migration 要: `TerminalHandoffBundle` → `HandoffGuidance` に変換層を追加する        |
| Skill Docs    | migration 要: `SkillDocsCapabilityResult.guidance` を HandoffGuidance に変換する    |
| GuidanceBlock | migration 要: 独自 variant props → HandoffGuidance に props を統一する              |
| 所有層        | Main Process（各 service 内の adapter 関数）                                        |

---

## 2. Launcher 統一仕様

| 仕様項目       | 値                                                                       |
| -------------- | ------------------------------------------------------------------------ |
| 配置箇所       | App Shell Header の右端（通知アイコン群の直前）                          |
| アイコン種別   | `TerminalIcon`（16px、`stroke-current`）                                 |
| ラベルテキスト | 「terminal を開く」                                                      |
| i18n key       | `cta.openTerminal`                                                       |
| 押下動作       | terminal dock bottom sheet を open（auto-send なし）                     |
| 二度押し動作   | すでに open の場合は close（transcript は保持）                          |
| disabled 条件  | CLI ツールが存在しない（`AccessCapability === "none"` かつ unavailable） |
| tooltip        | disabled 時: 「Claude Code CLI が見つかりません」                        |

---

## 3. Handoff Card 共通コンポーネント仕様

### 必須3要素

| 要素 No. | 要素名          | 内容                                                |
| -------- | --------------- | --------------------------------------------------- |
| 1        | terminalCommand | コード表示ブロック（monospace）+ 右端コピーアイコン |
| 2        | contextSummary  | 本文テキスト（surface 固有フォーマット可）          |
| 3        | copy / dismiss  | Primary CTA（コピー）+ Secondary CTA（閉じる）      |

### 表示条件

- `handoffGuidance` props が `null` でも `undefined` でもない場合のみ表示する。
- `capability === "integrated-api"` の場合は表示しない（adapter が `null` を返す）。

### 位置

- 各 surface のメインコンテンツ領域の直下に inline で配置する。
- modal / overlay は使用しない（コンテンツを遮断しない Apple HIG 準拠）。

### CTA 仕様

| CTA       | ラベル           | i18n key          | 動作                                         |
| --------- | ---------------- | ----------------- | -------------------------------------------- |
| Primary   | コマンドをコピー | `cta.copyCommand` | `terminalCommand` を clipboard に書き込む    |
| Secondary | 閉じる           | `cta.dismiss`     | `agentSlice.clearHandoffGuidance()` 呼び出し |

---

## 4. Consumer Adapter 統一設計

全 consumer が `SkillDocsCapabilityResult` を同一の契約で `HandoffGuidance | null` に変換する。

```typescript
// packages/shared/src/adapters/handoff-adapter.ts
function toHandoffGuidance(
  result: SkillDocsCapabilityResult,
): HandoffGuidance | null {
  if (result.capability === "guidance-only") {
    return {
      terminalCommand: "claude docs generate",
      contextSummary: result.guidance ?? "API key を設定してください",
      reason: "guidance-only: LLM provider 未設定",
    };
  }
  if (result.capability === "terminal-handoff") {
    return {
      terminalCommand: "claude docs generate",
      contextSummary: `terminal-handoff: ${result.reason ?? "LLM 到達不可"}`,
      reason: result.reason ?? "LLM 到達不可",
    };
  }
  return null; // integrated-api の場合は handoff 不要
}
```

**Consumer → DTO マッピング**:

| Consumer      | 現在の DTO                  | 統一後の DTO      | Migration 要否 |
| ------------- | --------------------------- | ----------------- | -------------- |
| Chat Edit     | `HandoffGuidance`           | `HandoffGuidance` | 不要           |
| Runtime Agent | `TerminalHandoffBundle`     | `HandoffGuidance` | 要: 変換層追加 |
| Runtime Skill | `TerminalHandoffBundle`     | `HandoffGuidance` | 要: 変換層追加 |
| Skill Docs    | `SkillDocsCapabilityResult` | `HandoffGuidance` | 要: adapter    |
| GuidanceBlock | 独自 variant props          | `HandoffGuidance` | 要: props 統一 |

---

## 5. guidance-only vs terminal-only の意味差表（C-1 解決）

C-1 は「guidance-only と terminal-only（terminal-handoff）の意味差が不明瞭」という懸念。下記で定義を確定する。

| 項目                     | guidance-only                                | terminal-handoff                                          |
| ------------------------ | -------------------------------------------- | --------------------------------------------------------- |
| 発生条件                 | API key / LLM provider が未設定              | API key は設定済みだが LLM への到達が失敗した場合         |
| ユーザーへの意味         | 「設定が必要です」（操作: 設定画面を開く）   | 「CLIを使って実行してください」（操作: コマンドをコピー） |
| HandoffGuidance          | 生成される（reason: "guidance-only"）        | 生成される（reason: "terminal-handoff"）                  |
| Primary CTA              | 設定を開く                                   | コマンドをコピー                                          |
| Secondary CTA            | terminal を開く                              | 閉じる                                                    |
| TerminalHandoffCard 表示 | 表示しない（GuidanceBlock で設定導線を提示） | 表示する                                                  |
| 解決方法                 | ユーザーが LLM provider を設定する           | ユーザーが CLI コマンドを手動実行する                     |
| AccessCapability         | `none`（resolvable=true）                    | `terminalSurface`                                         |

**規則**: "guidance-only" は「integrated 実行の前提条件が欠けている」状態を指し、TerminalHandoffCard ではなく設定導線を提示する。"terminal-handoff" は「integrated 実行を試みたが失敗した」状態を指し、TerminalHandoffCard でコマンドを提示する。

---

## 6. Simpler Alternative（より単純な代替案と採用しない理由）

### Alternative-1: TerminalHandoffCard を廃止し GuidanceBlock に統一

**案**: GuidanceBlock の `handoff` variant で全てのハンドオフ表示を行い、専用コンポーネントを削除する。

**不採用理由**:

- GuidanceBlock は汎用ブロックであり、`terminalCommand` のコード表示 + コピー UX に最適化されていない。
- TerminalHandoffCard は既にテスト済みで、Props が `HandoffGuidance` と一致している。
- AC-2 の「copy command」を first-class にするには専用コンポーネントが適切。

### Alternative-2: TerminalHandoffBundle を IPC 通過型に昇格

**案**: `TerminalHandoffBundle` を `packages/shared/` に移動し、全フィールドを Renderer に公開する。

**不採用理由**:

- `promptBundle` / `manualRetryRule` は Main 内部の制御情報であり、Renderer に漏洩すべきでない（NFR-1f）。
- `HandoffGuidance` の3フィールドで Renderer に必要な情報は十分に提供できる。
- 型の IPC 通過はセキュリティ表面を広げるため、最小限にする原則に反する。

### Alternative-3: Launcher なし（Handoff Card のみ）

**案**: persistent launcher を配置せず、handoff 発生時のみ TerminalHandoffCard を表示する。

**不採用理由**:

- AC-1 で persistent launcher の UI 責務定義が明示的に要求されている。
- terminal-only capability の場合、handoff card なしで terminal にアクセスする手段がなくなる。
- mainline surface からの常時アクセスは ui-ux-realization.md の必須要件。

### Alternative-4: Consumer Adapter を Renderer に配置

**案**: `toHandoffGuidance` adapter 関数を Renderer 内に置き、Renderer が `SkillDocsCapabilityResult` を直接消費する。

**不採用理由**:

- capability 判定ロジックが Renderer に入り込み、Ownership 境界（P62 対策）が崩れる。
- Main Process が唯一の capability 判定権者であるべき（Task02 契約）。
- 将来の capability 追加時に Renderer の修正が必要になり、変更箇所が増大する。

---

## 7. Phase 3 Review 論点

### 7.1 Drift しやすい箇所

| 箇所                                | Drift リスク                                    | 確認方法                                                      |
| ----------------------------------- | ----------------------------------------------- | ------------------------------------------------------------- |
| terminal-only vs guidance-only 語彙 | 実装時に混同して使用される                      | 意味差表との照合                                              |
| Consumer Adapter の DTO 変換        | Runtime / Skill Docs で独自 DTO が残存する      | `grep -rn "TerminalHandoffBundle" apps/desktop/src/renderer/` |
| CTA ラベルの surface 間統一         | surface ごとに異なるラベルが追加される          | i18n key の一意性確認                                         |
| Ownership 境界                      | Renderer で local 判定が入り込む                | `grep -rn "authMode\|apiKey" apps/desktop/src/renderer/`      |
| Launcher の auto-send 禁止          | bottom sheet open 時に command が自動実行される | NFR-1b 禁止操作の実装確認                                     |

### 7.2 Phase 3 で確認すべき論点

1. **C-2 解決確認**: Handoff Card を共通コンポーネントとして使うことで UI drift リスクは本当に排除できるか。各 consumer が独自スタイルを適用できる拡張点を残すべきか。
2. **C-3 判断**: Open Working Directory の実装は scope に含めるか除外するか（現設計では action として定義済み）。
3. **TerminalHandoffBundle 変換タイミング**: IPC handler 内で変換するか、service 内で変換するかの粒度決定。
4. **GuidanceBlock との共存**: guidance-only 時に TerminalHandoffCard を表示しない設計は、surface ごとに一貫して守られるか。

### 7.3 ゲート条件

| 条件                                             | Phase 4 着手可否   |
| ------------------------------------------------ | ------------------ |
| Concern-A/B/C の設計が確定している               | 可                 |
| Consumer Adapter の migration 戦略が確定している | 可                 |
| Phase 3 review で MAJOR 判定（設計問題）         | Phase 2 に戻る     |
| Phase 3 review で MAJOR 判定（要件問題）         | Phase 1 に戻る     |
| Phase 3 review で MINOR 判定                     | 指摘対応後 Phase 4 |
