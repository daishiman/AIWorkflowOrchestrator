# Phase 2 成果物: 契約マトリクス

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 2（設計）                                         |
| 成果物種別 | 契約マトリクス                                    |
| 作成日     | 2026-03-22                                        |

---

## 1. State 契約

### 1.1 Terminal Surface 5状態 × 遷移条件 × 表示ルール × 禁止事項

| 状態          | 遷移条件                                  | 表示ルール                                               | 禁止事項                                             |
| ------------- | ----------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| collapsed     | 初期状態 / ユーザーが close した直後      | terminal dock は非表示。launcher button は表示（有効）   | transcript を消去してはならない                      |
| idle          | launcher button 押下（dock open）         | terminal dock を表示。transcript を継続表示する          | auto-send してはならない（NFR-1b）                   |
| input-waiting | shell ready signal 受信後                 | プロンプト行を表示し、ユーザー入力を待つ                 | AI が自動入力してはならない（NFR-1d）                |
| running       | ユーザーが Enter を押した後               | stdout をリアルタイムで transcript に追記する            | 実行中に別コマンドを inject してはならない（NFR-1c） |
| unavailable   | CLI ツールが存在しない、または CLI エラー | launcher button を disabled 表示する。tooltip を表示する | 状態を hidden にしてはならない（ユーザーに通知必須） |

### 1.2 Capability → UiState マッピング

| AccessCapability           | UiState     | Primary CTA            | Secondary CTA   |
| -------------------------- | ----------- | ---------------------- | --------------- |
| `integratedRuntime`        | ready       | surface 固有の実行 CTA | なし            |
| `terminalSurface`          | ready       | terminal を開く        | なし            |
| `both`                     | ready       | surface 固有の実行 CTA | terminal を開く |
| `none`（resolvable=true）  | blocked     | 設定を開く             | なし            |
| `none`（resolvable=false） | unavailable | なし                   | なし            |

**P62 対策**: `capability === "none"` を `integratedRuntime` へ暗黙 fallback してはならない。`assertNoSilentFallback()` を capability resolver の出口に配置する。

### 1.3 Handoff 状態別の表示ルール

| Handoff 条件                             | 表示コンポーネント     | Primary CTA          |
| ---------------------------------------- | ---------------------- | -------------------- |
| `resolution.type === "terminal_handoff"` | `TerminalHandoffCard`  | コマンドをコピー     |
| `capability === "guidance-only"`         | `GuidanceBlock(setup)` | 設定を開く           |
| `capability === "none"` かつ resolvable  | `GuidanceBlock(setup)` | 設定を開く           |
| `capability === "none"` かつ !resolvable | `GuidanceBlock(info)`  | なし（情報表示のみ） |

---

## 2. Action 契約

### 2.1 許容操作

| 操作                   | 動作種別        | 動作制約                                                     | セキュリティ制約                            |
| ---------------------- | --------------- | ------------------------------------------------------------ | ------------------------------------------- |
| copy command           | clipboard write | `HandoffGuidance.terminalCommand` のみをコピーする           | API key / secret を含めない（P55 sanitize） |
| copy context           | clipboard write | `HandoffGuidance.contextSummary` のみをコピーする            | PII を含めない                              |
| dismiss handoff card   | state clear     | `agentSlice.clearHandoffGuidance()` を呼び出す               | local state の変更のみ。IPC 不要            |
| open terminal          | bottom sheet    | terminal dock を展開する（auto-send なし）                   | manual boundary 維持（NFR-1b）              |
| open working directory | shell open      | `workspacePath` の存在を Main で検証済みのパスのみ open する | path traversal 対策（P42 3段検証）          |

### 2.2 禁止操作

| 操作               | 禁止理由                                                               | 根拠                 |
| ------------------ | ---------------------------------------------------------------------- | -------------------- |
| auto-send          | terminal surface でコマンドを自動送信する行為                          | NFR-1b               |
| hidden injection   | masked / invisible な文字列を terminal に inject する行為              | NFR-1c               |
| headless execution | ユーザー不在、または入力確認なしでコマンドを実行する行為               | NFR-1d               |
| auto-summarize     | transcript を自動要約して message feed に挿入する行為                  | ui-ux-realization.md |
| embed API key      | `terminalCommand` 文字列に API key を埋め込む行為                      | NFR-1a               |
| silent fallback    | `capability === "none"` を暗黙的に `integratedRuntime` と扱う行為      | P62                  |
| renderer local判定 | Renderer が `authMode` / `apiKey` を参照して capability を判定する行為 | Task02 contract      |

---

## 3. Ownership 契約

### 3.1 各ファイルの Concern 所有者

| ファイルパス（想定）                                                       | 所有 Concern | 所有プロセス | 変更制限                                  |
| -------------------------------------------------------------------------- | ------------ | ------------ | ----------------------------------------- |
| `packages/shared/src/types/handoff.ts`                                     | C-B, C-C     | 共有         | フィールド追加は全 consumer に波及        |
| `packages/shared/src/types/skill-docs.ts`                                  | C-C          | 共有         | capability 値追加は adapter に波及        |
| `packages/shared/src/adapters/handoff-adapter.ts`                          | C-C          | 共有         | 分岐ロジックの唯一の正本                  |
| `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard.tsx`   | C-B          | Renderer     | HandoffGuidance 以外の props 禁止         |
| `apps/desktop/src/renderer/components/App/AppShellHeader.tsx`（想定）      | C-A          | Renderer     | Launcher ボタン以外の capability 判定禁止 |
| `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`         | C-B, C-C     | Main         | HandoffGuidance 構築の唯一の正本          |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts`（想定）               | C-C          | Main         | toHandoffGuidance adapter を使用          |
| `apps/desktop/src/main/services/skill-docs/SkillDocsCapabilityResolver.ts` | C-C          | Main         | toHandoffGuidance adapter を使用          |

### 3.2 プロセス境界 Ownership

| 責務                           | Main Process | Preload | Renderer | 根拠                 |
| ------------------------------ | ------------ | ------- | -------- | -------------------- |
| capability 判定                | owner        | bridge  | consumer | Task02 contract      |
| HandoffGuidance 構築           | owner        | bridge  | consumer | NFR-1f               |
| TerminalHandoffBundle 参照     | owner        | 禁止    | 禁止     | IPC 非通過型         |
| TerminalHandoffCard 表示       | 禁止         | 禁止    | owner    | UI 層責務            |
| launcher button 配置           | 禁止         | 禁止    | owner    | App Shell 責務       |
| terminal dock session 状態管理 | 禁止         | 禁止    | owner    | Renderer local state |
| Skill Docs capability resolve  | owner        | bridge  | consumer | Main authority       |
| GuidanceBlock 表示             | 禁止         | 禁止    | owner    | UI 層責務            |
| assertNoSilentFallback 実行    | owner        | 禁止    | 禁止     | P62 対策             |

---

## 4. DTO 契約

### 4.1 HandoffGuidance（IPC 通過型 - 統一 DTO）

```typescript
// packages/shared/src/types/handoff.ts
interface HandoffGuidance {
  terminalCommand: string; // CLI コマンド（API key 非含有、P55 sanitize 済み）
  contextSummary: string; // コンテキスト要約（ローカライズ対象、PII 非含有）
  reason: string; // handoff 理由（ログ・デバッグ用）
}
```

**フィールドごとの所有・消費**:

| フィールド      | 所有（書き込み）               | 消費（読み取り）                      | 不変条件                                   |
| --------------- | ------------------------------ | ------------------------------------- | ------------------------------------------ |
| terminalCommand | TerminalHandoffBuilder（Main） | TerminalHandoffCard（Renderer）       | API key を含まない。メタ文字エスケープ済み |
| contextSummary  | TerminalHandoffBuilder（Main） | TerminalHandoffCard（Renderer）       | PII を含まない                             |
| reason          | TerminalHandoffBuilder（Main） | TerminalHandoffCard（Renderer）/ ログ | 自由テキスト。UI 表示は任意                |

### 4.2 SkillDocsCapabilityResult（guidance-only consumer 用）

```typescript
// packages/shared/src/types/skill-docs.ts
interface SkillDocsCapabilityResult {
  capability: "integrated-api" | "guidance-only" | "terminal-handoff";
  provider?: string; // integrated-api の場合（例: "anthropic"）
  guidance?: string; // guidance-only の場合（設定指示テキスト）
  reason?: string; // terminal-handoff の場合（降格理由）
}
```

**フィールドごとの所有・消費**:

| フィールド | 所有                        | 消費                        | 不変条件                                           |
| ---------- | --------------------------- | --------------------------- | -------------------------------------------------- |
| capability | SkillDocsCapabilityResolver | toHandoffGuidance adapter   | 3値のいずれかのみ                                  |
| provider   | SkillDocsCapabilityResolver | integrated-api 表示ロジック | capability が "integrated-api" の場合のみ非 null   |
| guidance   | SkillDocsCapabilityResolver | toHandoffGuidance adapter   | capability が "guidance-only" の場合のみ非 null    |
| reason     | SkillDocsCapabilityResolver | toHandoffGuidance adapter   | capability が "terminal-handoff" の場合のみ非 null |

### 4.3 TerminalHandoffBundle（Main 内部型 - IPC 非通過）

```typescript
// apps/desktop/src/main/services/runtime/（内部型、export 禁止）
interface TerminalHandoffBundle {
  launcher: LauncherConfig;
  promptBundle: PromptBundle;
  cwd: string;
  suggestedCommand: string;
  manualRetryRule: ManualRetryRule;
}
```

**不変条件**:

- Renderer から直接参照してはならない（IPC を通過させない）。
- `TerminalHandoffBuilder.buildForSurface()` のみが `TerminalHandoffBundle → HandoffGuidance` に変換する。
- `promptBundle` / `manualRetryRule` は Renderer に公開しない（NFR-1f）。

---

## 5. セキュリティ契約

### 5.1 API key 非露出

| 確認ポイント                      | 実装制約                                                          | 検証コマンド                                             |
| --------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| terminalCommand に API key 非含有 | TerminalHandoffBuilder が key を含まないコマンドのみ生成する      | `grep -rn "apiKey\|api_key" TerminalHandoffBuilder.ts`   |
| clipboard に API key 書き込み禁止 | copyCommand action は `terminalCommand` のみを対象にする          | copyCommand handler のレビュー                           |
| IPC response に key 非含有        | HandoffGuidance の全フィールドに key pattern がないことを確認する | `grep -rn "Bearer\|sk-" apps/desktop/src/main/handlers/` |

### 5.2 auto-send 禁止

| 禁止対象                         | 実装制約                                                        |
| -------------------------------- | --------------------------------------------------------------- |
| terminal dock open 時の自動実行  | dock open は UI 表示のみ。コマンド送信は user action のみが起点 |
| HandoffGuidance 受信後の自動実行 | `terminalCommand` を terminal に自動送信してはならない          |
| hidden injection                 | terminal session に invisible な文字列を inject してはならない  |

### 5.3 path traversal 対策（open working directory）

| 確認ポイント           | 実装制約                                                             |
| ---------------------- | -------------------------------------------------------------------- |
| パス検証               | Main が `workspacePath` の存在と許可された範囲内であることを検証する |
| P42 3段バリデーション  | `typeof === "string"` → `=== ""` → `.trim() === ""` の順で検証する   |
| traversal パターン検出 | `..` を含むパスを拒否する                                            |

### 5.4 P55 メタ文字エスケープ

| 対象                 | 実装制約                                                              |
| -------------------- | --------------------------------------------------------------------- | ---------------------- |
| terminalCommand 生成 | shell injection を防ぐためメタ文字（`$`, `` ` ``, `&`, `              | ` 等）をエスケープする |
| escapeRegExp 適用    | `os.homedir()` 等の動的値を RegExp に使用する場合は必ずエスケープする |
