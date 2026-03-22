# Phase 8 成果物: リファクタ境界定義

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 8                                                 |
| 成果物種別 | リファクタリング境界定義                          |
| 作成日     | 2026-03-22                                        |

---

## 1. 安全にリファクタ可能な箇所

### 1.1 TerminalHandoffBuilder: buildForSurface() メソッド統一

**現状の問題**:
`buildForAgentExecution()` と `buildForSkillExecution()` が別メソッドとして存在し、ほぼ同一の contextSummary 構築ロジックを重複している。
surface が増えるたびにメソッドを追加しなければならず、保守コストが線形に増大する。

**リファクタ方針**:

```typescript
// リファクタ前（重複パターン）
class TerminalHandoffBuilder {
  buildForAgentExecution(
    request: AgentRequest,
    reason: string,
  ): HandoffGuidance {
    return {
      terminalCommand: this.buildCommand(request),
      contextSummary: `surface=agent skill=${request.skillName}`,
      reason,
    };
  }

  buildForSkillExecution(
    request: SkillRequest,
    reason: string,
  ): HandoffGuidance {
    return {
      terminalCommand: this.buildCommand(request),
      contextSummary: `surface=skill skill=${request.skillName}`,
      reason,
    };
  }
}

// リファクタ後（surfaceType パラメータで分岐を統一）
class TerminalHandoffBuilder {
  buildForSurface(
    request: AgentRequest | SkillRequest,
    surfaceType: "agent" | "skill",
    reason: string,
  ): HandoffGuidance {
    const contextSummary = this.buildContextSummary(request, surfaceType);
    return {
      terminalCommand: this.buildCommand(request),
      contextSummary: this.localizeContextSummary(contextSummary),
      reason,
    };
  }

  // 後方互換用 deprecated シム（移行期間中のみ維持）
  /** @deprecated buildForSurface("agent") を使用してください */
  buildForAgentExecution(
    request: AgentRequest,
    reason: string,
  ): HandoffGuidance {
    return this.buildForSurface(request, "agent", reason);
  }

  /** @deprecated buildForSurface("skill") を使用してください */
  buildForSkillExecution(
    request: SkillRequest,
    reason: string,
  ): HandoffGuidance {
    return this.buildForSurface(request, "skill", reason);
  }

  private buildContextSummary(
    request: AgentRequest | SkillRequest,
    surfaceType: "agent" | "skill",
  ): string {
    return `surface=${surfaceType} skill=${request.skillName}`;
  }
}
```

**安全である理由**:

- `contextSummary` のフォーマット差異は `surfaceType` 引数で吸収できる
- 旧メソッドを deprecated シムとして残すため、既存の呼び出し元が壊れない（P54 対策）
- テストは旧メソッドと新メソッド両方に対して書く（Phase 4 成果物に従う）

**制約**:

- `surfaceType === "agent"` と `surfaceType === "skill"` の contextSummary は仕様上異なるため、switch 分岐を維持する
- `localizeContextSummary` の呼び出しは `buildForSurface()` 内で完結させる（FR-3d 対応）
- Chat Edit の `buildForChatEdit()` は引数型が大きく異なるため、別オーバーロードとして維持する

---

### 1.2 toHandoffGuidance() adapter: 純粋関数化と配置先確定（MN-1 解決）

**現状の問題**:
`SkillDocsCapabilityResult → HandoffGuidance` の変換ロジックが各 consumer のインラインに重複して実装されている可能性がある。
MN-1 指摘として「配置先が未定義」だったため、どの consumer が正本ロジックを持つかが不明瞭だった。

**リファクタ方針**:

```typescript
// packages/shared/src/types/handoff.ts に配置（MN-1 解決）
export function toHandoffGuidance(
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
  // capability === "integrated-api" の場合は handoff 不要
  return null;
}
```

**配置先決定の根拠**（MN-1 確定解決）:

| 配置候補                                            | 採否     | 理由                                                                    |
| --------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `packages/shared/src/types/handoff.ts`              | **採用** | HandoffGuidance 型と同ファイル配置。Renderer/Main 両側から import 可能  |
| `apps/desktop/src/main/services/skill-docs/`        | 不採用   | Main 限定になり、Renderer 側の guidance-only 表示ロジックから参照不可   |
| `apps/desktop/src/main/adapters/handoff-adapter.ts` | 不採用   | adapter ファイルが増殖すると import パスが混乱する（P8 幽霊依存リスク） |

**安全である理由**:

- 純粋関数（副作用なし）なので、どこに配置してもセマンティクスが変わらない
- `packages/shared` への配置で import パスが一意になり、幽霊依存（P8）が発生しない
- 既存のインライン変換コードをこの関数に置き換えるだけで移行完了

---

### 1.3 GuidanceBlock handoff variant: HandoffGuidance Props 統一（MN-3 解決）

**現状の問題**:
GuidanceBlock の `handoff` variant が独自の props 形式（バラバラのフィールド名）を持ち、`HandoffGuidance` と一致していない。
MN-3 指摘として「GuidanceBlock と TerminalHandoffCard の使い分けルールが曖昧」だった。

**リファクタ方針**:

```typescript
// リファクタ前（独自 props、HandoffGuidance と命名が乖離）
interface GuidanceBlockHandoffProps {
  variant: "handoff";
  command?: string; // terminalCommand と混同しやすい
  summary?: string; // contextSummary と別名
  description?: string; // reason と別名
}

// リファクタ後（HandoffGuidance を直接受け取り、DTO 統一）
interface GuidanceBlockHandoffProps {
  variant: "handoff";
  guidance: HandoffGuidance; // HandoffGuidance DTO を直接受け取る
}
```

**GuidanceBlock vs TerminalHandoffCard の使い分けルール**（MN-3 確定解決）:

| 状況                                                             | 使用コンポーネント  | Primary CTA      | 理由                                       |
| ---------------------------------------------------------------- | ------------------- | ---------------- | ------------------------------------------ |
| `resolution.type === "terminal_handoff"` の mainline handoff     | TerminalHandoffCard | コマンドをコピー | copy command が first-class の専用 UX 必要 |
| `capability === "guidance-only"` の LLM provider 未設定          | GuidanceBlock       | 設定を開く       | 設定導線が主目的の汎用ガイダンス表示       |
| `capability === "terminal-handoff"` の Skill Docs handoff path   | TerminalHandoffCard | コマンドをコピー | CLI handoff として copy UX が必要          |
| `capability === "none"` かつ resolvable=true の設定誘導          | GuidanceBlock       | 設定を開く       | 解決可能な blocked 状態の case             |
| `capability === "none"` かつ resolvable=false の完全 unavailable | GuidanceBlock(info) | なし             | 情報表示のみ。CTA で解決できない           |

**判定ロジック（実装者向け）**:

```typescript
// TerminalHandoffCard を使う条件（AND 条件）
const useTerminalHandoffCard =
  guidance !== null &&
  (resolution.type === "terminal_handoff" ||
    skillDocsResult?.capability === "terminal-handoff");

// GuidanceBlock を使う条件
const useGuidanceBlock =
  !useTerminalHandoffCard &&
  (capability === "guidance-only" ||
    (capability === "none" && (resolvable === true || resolvable === false)));
```

**安全である理由**:

- GuidanceBlock の他の variant（`error`、`blocked`、`unavailable`）は変更しない
- Props 変更は破壊的変更だが、Phase 5 で新設実装時に統一するため中間状態が存在しない
- snapshot test を variant ごとに追加することで regression を防止（risk-register.md 参照）

---

## 2. リファクタ禁止事項（壊してはならない契約）

### 2.1 TerminalHandoffBundle の IPC 非通過制約

`TerminalHandoffBundle` は Main 内部型であり、IPC を通過させてはならない。
`promptBundle` / `manualRetryRule` フィールドは Main の内部制御情報であり、Renderer への漏洩は NFR-1f 違反。

**禁止パターン**:

```typescript
// ❌ 禁止: TerminalHandoffBundle を IPC レスポンスに含める
ipcMain.handle("runtime:execute", async () => {
  const bundle = builder.buildBundle(request);
  return bundle; // promptBundle が Renderer に露出する
});

// ✅ 正しいパターン: HandoffGuidance のみを IPC で返す
ipcMain.handle("runtime:execute", async () => {
  const bundle = builder.buildBundle(request);
  const guidance = builder.buildForSurface(
    bundle.request,
    "agent",
    "LLM 到達不可",
  );
  return { success: true, data: guidance };
});
```

### 2.2 Renderer local 判定の禁止

Renderer が `authMode` / `apiKey` / `IRuntimePolicyResolver` を直接参照して capability を判定してはならない。
Main Process が唯一の capability 判定権者（Task02 契約、P62 対策）。

### 2.3 assertNoSilentFallback の維持

`capability === "none"` を `integratedRuntime` へ暗黙 fallback するパターンを排除するため、
`assertNoSilentFallback()` を capability resolver の出口に必ず配置する。
リファクタ時にこの呼び出しを削除してはならない。

### 2.4 Manual Boundary の維持

以下の禁止制約はリファクタ後も変更しない:

| 禁止操作           | 理由        | リファクタでの扱い |
| ------------------ | ----------- | ------------------ |
| auto-send          | NFR-1b      | 変更禁止           |
| hidden injection   | NFR-1c      | 変更禁止           |
| headless execution | NFR-1d      | 変更禁止           |
| API key 埋め込み   | NFR-1a, P55 | 変更禁止           |

---

## 3. Concern / Component / Service の責務再確認

### 3.1 Concern 責務（リファクタ後も変更なし）

| Concern | 名称             | 責務の要約                                              | リファクタによる変化 |
| ------- | ---------------- | ------------------------------------------------------- | -------------------- |
| C-A     | Launcher         | App Shell Header で terminal dock を開閉する UI         | 変化なし             |
| C-B     | Handoff Card     | HandoffGuidance DTO を受け取り copy UX を提供する       | Props 型が統一される |
| C-C     | Consumer Adapter | SkillDocsCapabilityResult を HandoffGuidance に変換する | 純粋関数に統一される |

### 3.2 Component 責務

| コンポーネント      | 責務                                        | Props 変化                                |
| ------------------- | ------------------------------------------- | ----------------------------------------- |
| TerminalHandoffCard | terminal コマンド copy UX を提供する        | `guidance: HandoffGuidance`（不変）       |
| GuidanceBlock       | guidance-only / blocked の状態を説明する UI | handoff variant が HandoffGuidance に統一 |
| AppShellHeader      | persistent launcher button を配置する       | 変化なし                                  |

### 3.3 Service 責務

| サービス                        | 責務                                                    | リファクタによる変化                            |
| ------------------------------- | ------------------------------------------------------- | ----------------------------------------------- |
| TerminalHandoffBuilder          | HandoffGuidance を構築する唯一の正本                    | `buildForSurface()` 追加、旧メソッド deprecated |
| SkillDocsCapabilityResolver     | SkillDocsCapabilityResult を決定する                    | 変化なし                                        |
| toHandoffGuidance()（純粋関数） | SkillDocsCapabilityResult を HandoffGuidance に変換する | packages/shared に配置確定（MN-1 解決）         |

---

## 4. リファクタ後の依存グラフ

```
packages/shared/src/types/handoff.ts
  ├─ HandoffGuidance (interface)
  ├─ toHandoffGuidance() (pure function)
  └─ SkillDocsCapabilityResult (interface)

apps/desktop/src/main/services/runtime/
  └─ TerminalHandoffBuilder
       ├─ buildForSurface(request, surfaceType, reason): HandoffGuidance  [NEW]
       ├─ buildForChatEdit(request, reason): HandoffGuidance             [既存、維持]
       ├─ buildForAgentExecution(...): HandoffGuidance                   [@deprecated シム]
       └─ buildForSkillExecution(...): HandoffGuidance                   [@deprecated シム]

apps/desktop/src/renderer/components/organisms/
  ├─ TerminalHandoffCard
  │    └─ props: { guidance: HandoffGuidance }
  └─ GuidanceBlock
       └─ props(handoff variant): { variant: "handoff", guidance: HandoffGuidance }  [統一]
```

---

## 5. リファクタ優先順位

| 優先度 | 対象                                     | 依存先                       | 理由                                               |
| ------ | ---------------------------------------- | ---------------------------- | -------------------------------------------------- |
| 1      | toHandoffGuidance() 純粋関数化（MN-1）   | なし（独立した純粋関数）     | 全 consumer に影響する基盤。Phase 5 で先行実装必須 |
| 2      | GuidanceBlock handoff Props 統一（MN-3） | toHandoffGuidance()          | consumer adapter の完成に直結                      |
| 3      | TerminalHandoffBuilder.buildForSurface() | AgentRequest/SkillRequest 型 | Runtime migration の中心。既存テストへの影響が最大 |
