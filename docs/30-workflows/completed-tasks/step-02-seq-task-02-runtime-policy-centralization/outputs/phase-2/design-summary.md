# Phase 2: 設計サマリー - Runtime Policy Centralization

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| タスク種別   | design（設計タスク）                       |
| 作成日       | 2026-03-21                                 |
| ステータス   | Phase 2 完了                               |
| 依存成果物   | outputs/phase-1/requirements-definition.md |
|              | outputs/phase-1/current-state-inventory.md |
|              | outputs/phase-1/scope-definition.md        |
| 後続フェーズ | Phase 3（設計レビュー）                    |

---

## 1. Concern 分解

Phase 1 棚卸し結果に基づき、以下の 3 つの concern に整理する。各 concern は独立した所有境界を持ち、他の concern に依存しない。

### Concern A: Runtime Policy Authority（判定の中央集約）

**問題**: `RuntimePolicyResolver`（引数型）と `RuntimeResolver`（DI型）が並存し、`aiHandlers.ts` は両方を呼ばずに LLM を直接実行している。

**設計ゴール**: `RuntimePolicyResolver` を runtime 判定の唯一の権威として確立し、`RuntimeResolver` を非推奨化する。

**スコープ**:

- `IRuntimePolicyResolver.resolve()` を正規エントリーポイントとして確定
- `RuntimeDecision`（`integrated_api` / `terminal_handoff`）を正規出力型として確定
- `RuntimeResolution`（`integrated` / `handoff`）を deprecated とし移行パスを定義
- surface-local 判定（Renderer での authMode 参照による runtime 分岐）を禁止ルールとして定義

**所有層**: Main Process のみ（`apps/desktop/src/main/services/runtime/`）

---

### Concern B: Health Contract Unification（health route 一本化）

**問題**: `llm:check-health`（実際の接続テスト）と `AI_CHECK_CONNECTION`（固定 `disconnected` 返却）の 2 系統が並存し、廃止条件が未定義。

**設計ゴール**: `llm:check-health` を primary route として ownership table に明記し、`AI_CHECK_CONNECTION` の廃止条件を定義する。

**スコープ**:

- `llm:check-health` の primary 地位を ownership table に記録
- `AI_CHECK_CONNECTION` の legacy 残置条件（新規コード禁止・廃止トリガー）を定義
- `HealthCheckResult` 型の正規フィールドを確定（status / providerId / errorMessage / checkedAt）
- Renderer での health 結果の保持は「表示目的のみ」に制限

**所有層**: Main Process（実行）/ packages/shared（型定義）/ Renderer Store（表示キャッシュのみ）

---

### Concern C: Handoff Contract Standardization（handoff 構築の標準化）

**問題**: `TerminalHandoffBuilder` が `buildForAgentExecution` / `buildForSkillExecution` に surface 名をハードコードしており、新規 surface 追加時に変更が必要。

**設計ゴール**: surface 識別子を引数として受け取る共通インターフェースを定義し、`HandoffGuidance` の必須フィールドを確定する。

**スコープ**:

- `HandoffGuidance`（`terminalCommand` / `contextSummary` / `reason`）の必須フィールド確定
- surface 識別子（`SurfaceType`: `agent` / `skill` / `chat` / `skill-creator`）の型定義
- `TerminalHandoffBuilder.build()` が surface 識別子を受け取る統一インターフェースの設計
- `TerminalHandoffBundle` と `HandoffGuidance` の使い分けルールを所有層テーブルに記載

**所有層**: Main Process（`TerminalHandoffBuilder`）/ packages/shared（`HandoffGuidance` 型）

---

## 2. Responsibility Diagram（ASCII 図）

### 2-1. Main Process 内の責務フロー

```
┌─────────────────────────────────────────────────────────────────┐
│  Main Process                                                   │
│                                                                 │
│  [IPC ハンドラー層]                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  aiHandlers.ts   │  │  llmHandlers.ts  │  │agentHandlers │  │
│  │  (AI_CHAT 等)    │  │ (llm:check-health│  │skillHandlers │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                    │                    │           │
│           │ resolve()          │ checkHealth()      │ resolve() │
│           v                    v                    v           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         IRuntimePolicyResolver（正規リゾルバー）           │  │
│  │  入力: authMode（内部取得）, apiKey（内部取得）             │  │
│  │  出力: RuntimeDecision                                    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────┐              │  │
│  │  │  integrated_api         terminal_handoff│              │  │
│  │  │  { type, apiKey }       { type, bundle }│              │  │
│  │  └─────────────────────────────────────────┘              │  │
│  └──────────────────────────────┬────────────────────────────┘  │
│                                 │ terminal_handoff の場合        │
│                                 v                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  TerminalHandoffBuilder                                    │ │
│  │  入力: prompt, cwd, surfaceType（SurfaceType enum）         │ │
│  │  出力: HandoffGuidance                                     │ │
│  │       { terminalCommand, contextSummary, reason }         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ※ RuntimeResolver は deprecated（移行完了後に削除）            │
│  ※ AuthMode / ApiKey は Main Process の外に出ない              │
│                                                                 │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                        IPC 境界（contextBridge）
                        通過可能: RuntimeDecision（apiKey 除外）
                        通過可能: HandoffGuidance
                        通過可能: HealthCheckResult
                        通過禁止: authMode（raw）, apiKey（raw）
                                   │
┌──────────────────────────────────v──────────────────────────────┐
│  Renderer（React / Zustand Store）                              │
│                                                                 │
│  authModeSlice: mode を「表示目的」でのみ保持                    │
│  llmSlice:      healthStatus を「表示目的」でのみ保持            │
│                                                                 │
│  ※ runtime 判定（integrated / handoff 分岐）を Renderer で     │
│    行うことは禁止                                               │
│  ※ authMode を参照して実行可否を自ら決定することは禁止          │
└─────────────────────────────────────────────────────────────────┘
```

### 2-2. 型の所有層マッピング

```
packages/shared（IPC 境界を越える型）
├── RuntimeDecision          ← Renderer へ渡す IPC レスポンスの共通型
│     ※ integrated_api.apiKey は IPC 送信前に除外する
├── HandoffGuidance          ← Renderer が handoff 情報を表示するための型
└── HealthCheckResult        ← Renderer が health 状態を表示するための型

apps/desktop/src/main/（Main Process 内部型）
├── TerminalHandoffBundle    ← RuntimePolicyResolver 内部のみで使用
├── RuntimeResolution        ← deprecated（RuntimeDecision へ移行）
└── IRuntimePolicyResolver   ← DI インターフェース（Main 内部のみ）
```

---

## 3. Simpler Alternative の比較

### 案A（採用）: RuntimePolicyResolver を唯一のリゾルバーとして統合

**概要**: 既存の `RuntimePolicyResolver` を正規リゾルバーとして確定し、`RuntimeResolver` を deprecated 化する。`RuntimeResolver` のサービス DI パターン（引数なし `resolve()`）を `RuntimePolicyResolver` に取り込む。

| 観点       | 評価                                                                               |
| ---------- | ---------------------------------------------------------------------------------- |
| 変更量     | 中（`RuntimeResolver` の呼び出し元を `RuntimePolicyResolver` に置換）              |
| 型の安定性 | 高（`RuntimeDecision` 型は現行コードに既存）                                       |
| テスト影響 | 中（`RuntimeResolver` のテストを `RuntimePolicyResolver` のテストに移行）          |
| リスク     | 低（`RuntimePolicyResolver` は既に `IRuntimePolicyResolver` インターフェースあり） |
| 採用理由   | 変更コストが最小で、既存の型定義と DI 基盤を最大限に活用できる                     |

---

### 案B（不採用）: RuntimeResolver を残しつつファサードパターンで統合

**概要**: `RuntimePolicyResolver` と `RuntimeResolver` の両方を残し、新規の `RuntimePolicyFacade` が内部で振り分けを行う。

| 観点       | 評価                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| 変更量     | 少（既存コードをほぼ変更しない）                                        |
| 型の安定性 | 低（`RuntimeDecision` と `RuntimeResolution` の 2 型が混在し続ける）    |
| テスト影響 | 低（既存テストをほぼ維持）                                              |
| リスク     | 高（Facade を経由しない呼び出しが残存し、二重管理の解消にならない）     |
| 不採用理由 | 問題の根本（二重管理）を解決しない。FR-2 の「責務統合」要件を満たさない |

---

### 案C（不採用）: 新規 UnifiedResolver を作成し両方を非推奨化

**概要**: `RuntimePolicyResolver` と `RuntimeResolver` の両方を非推奨化し、新規の `UnifiedRuntimeResolver` を作成する。

| 観点       | 評価                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| 変更量     | 大（新規クラス作成 + 全呼び出し元の変更が必要）                                              |
| 型の安定性 | 高（新規型で設計できる）                                                                     |
| テスト影響 | 大（既存テストを全て書き直す必要がある）                                                     |
| リスク     | 高（影響範囲が広く、本タスクが design タスクであるため実装変更との混在が起きる）             |
| 不採用理由 | 設計タスク（プロダクションコード変更なし）の原則に反する。案A と効果は同じで変更コストが高い |

---

## 4. 設計判断一覧

### DD-1: RuntimePolicyResolver を正規リゾルバーとして確定

**判断**: `IRuntimePolicyResolver.resolve(authMode, apiKey)` を runtime 判定の単一エントリーポイントとして採用する。

**根拠**: 現行コードで `IRuntimePolicyResolver` インターフェースが既に定義されており、DI による差し替えが可能な設計になっている。`RuntimeResolver` との差異（引数型 vs DI型）は `resolve()` のデフォルト引数として吸収する。

**影響**: `RuntimeResolver` の呼び出し元（Task03-07 の対象ファイル）は `IRuntimePolicyResolver` に切り替える。

---

### DD-2: RuntimeDecision.integrated_api.apiKey の IPC 送信禁止

**判断**: `RuntimeDecision` の `integrated_api` 型が保持する `apiKey` フィールドは、IPC レスポンスとして Renderer に送信する際に除外する。Renderer には実行可否（`type: "integrated_api"`）のみを通知する。

**根拠**: NFR-2（セキュリティ）および 04-electron-security.md に基づく。apiKey を Renderer に渡すと XSS 等の攻撃で漏洩するリスクがある。

**実装方針**: IPC ハンドラー内で `RuntimeDecision` を Renderer 向けに変換する `sanitizeForRenderer()` 相当の処理を定義する。

---

### DD-3: AI_CHECK_CONNECTION の廃止トリガーを Step 03-09 完了時に設定

**判断**: `AI_CHECK_CONNECTION` ハンドラーは Step 03-09 の全 surface が `llm:check-health` に移行した時点で削除可能とする。それまでは legacy コードとして残置し、新規コードでの参照を禁止する。

**根拠**: AC-2 の要件に基づく。廃止条件を「全 surface の移行完了」という検証可能な条件に紐付けることで、曖昧な残置を防ぐ。

---

### DD-4: HandoffGuidance を packages/shared で管理する

**判断**: `HandoffGuidance`（`terminalCommand` / `contextSummary` / `reason`）は IPC 境界を越えて Renderer に送信される型であるため、`packages/shared/src/types/` で管理する。

**根拠**: FR-5 および AC-4 の要件に基づく。`TerminalHandoffBundle`（Main 内部型）と `HandoffGuidance`（IPC 通過型）の役割分担を明確にする。

---

### DD-5: SurfaceType enum を packages/shared で定義し TerminalHandoffBuilder に渡す

**判断**: `buildForAgentExecution` / `buildForSkillExecution` のような surface 別メソッドを廃止し、`SurfaceType`（`"agent"` / `"skill"` / `"chat"` / `"skill-creator"`）を引数として受け取る統一 `buildForSurface(request, surfaceType, reason)` メソッドに移行する。

**根拠**: FR-6 の要件に基づく。新規 surface 追加時のコード変更箇所を `SurfaceType` 定義の 1 箇所に集約する。

---

### DD-6: Renderer での health 判定は「表示目的のみ」に制限し禁止事項を ownership table に明記

**判断**: `llmSlice.healthStatus` の保持は「プロバイダーの接続状態を UI に表示する」目的に限定し、この値を参照して「runtime を integrated で実行するか否か」を判断することを禁止する。

**根拠**: FR-4 および NFR-2 に基づく。health 状態を Renderer が保持すること自体は表示目的では許容されるが、実行可否の判定への流用は Main Process の権威を侵害する。

---

## 5. Phase 3 レビューへの handoff

### 重点確認事項

1. **DD-2（apiKey の IPC 除外）の実装可能性**: `sanitizeForRenderer()` を IPC ハンドラー内で行う設計が、全 surface（Task03-09）で実装可能かを確認する。
2. **DD-5（SurfaceType 統一）の後方互換性**: `buildForAgentExecution` / `buildForSkillExecution` を廃止した場合、既存の呼び出し元（agentHandlers / skillHandlers）の変更量が適切かを確認する。
3. **AC-4（policy consumption contract）の完成度**: contract-matrix.md に記載した 4 原則が Task03-09 の実装者にとって十分に明確かを確認する。

### drift しやすいポイント

- `RuntimePolicyResolver` を呼ばずに LLM を直接実行するパターン（現行 `aiHandlers.ts` と同様の問題）が新規 surface で再発するリスク
- `HandoffGuidance` ではなく `TerminalHandoffBundle` を Renderer に送信してしまうリスク
- `AI_CHECK_CONNECTION` を新規コードで参照するパターンの見落とし（lint ルールが未実装のため）
