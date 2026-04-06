# Phase 2: 設計

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 2                                          |
| 名称       | 設計                                       |
| タスクID   | TASK-P0-09                                 |
| ステータス | 未実施                                     |
| 依存       | Phase 1 完了                               |
| 完了条件   | 全タスクを100%実行し成果物が揃っていること |

---

## 目的

Phase 1 の現状調査を踏まえ、4 コンポーネント（policy / hooks / audit sink / Facade 統合）の
詳細設計を確定する。Phase 3 の設計レビューゲートを通過できる品質の設計書を作成する。

---

## 実行タスク

### T-02-1: phase 別 policy テーブル設計の詳細化

Phase 1 の調査結果を踏まえ、policy テーブルの設計を確定する。

**設計方針**:

- `plan` phase: Read 系 + Bash / Agent を許可（情報収集・設計書読み込み）
- `execute` phase: Write/Edit 系を許可（スキルコード生成・編集）
- `verify` phase: Bash（テスト実行）+ Read 系のみ許可
- `improve` phase: Edit 系のみ（既存ファイルの改善）
- `DESTRUCTIVE_TOOLS`: 全 phase で拒否するツールリスト

**確認事項**:

- 既存の `POLICY_TABLE` に `plan` / `execute` / `verify` / `improve` 以外の phase が混入していないか確認する
- Phase 1 調査で特定した不足・誤りを修正する
- `Object.freeze()` による実行時改変防止が施されているか確認する

**設計ドキュメント記録形式**:

```
| Phase              | permissionMode  | allowedTools               | disallowedTools            |
|--------------------|-----------------|----------------------------|----------------------------|
| plan               | default         | Read, Glob, Grep, Bash, Agent | Write, Edit, NotebookEdit  |
| execute            | acceptEdits     | 上記 + Write, Edit         | NotebookEdit               |
| verify             | default         | Read, Glob, Grep, Bash, Agent | Write, Edit, NotebookEdit  |
| improve            | acceptEdits     | Read, Glob, Grep, Bash, Agent, Edit | Write, NotebookEdit |
```

**完了条件**:

- [ ] 全 phase の policy が設計書として記録されている
- [ ] `DESTRUCTIVE_TOOLS` の最終リストが決定されている
- [ ] 既存実装との差分が明示されている

---

## サブタスク管理

| SubAgent   | 責務                                      |
| ---------- | ----------------------------------------- |
| SubAgent-A | policy テーブルと tool 境界の確定         |
| SubAgent-B | hooks インターフェースと audit 接続の確定 |
| SubAgent-C | Facade 統合と shared type 整合の確認      |

---

### T-02-2: hooks インターフェース設計の確認・詳細化

`SkillCreatorHooks` インターフェースと `createHooks()` の設計を確定する。

**確認・設計観点**:

```typescript
// 設計確認観点（既存実装との整合チェック）
interface SkillCreatorHooks {
  // セッション開始時の記録
  onSessionStart(params: {
    sessionId: string;
    provenance?: SkillCreatorWorkflowSourceProvenance;
  }): void;

  // ツール使用前の判定と記録（allowed: boolean を返す）
  onPreToolUse(params: {
    sessionId: string;
    toolName: string;
  }): SkillCreatorToolDecision;

  // ツール使用後の結果記録（副作用のみ、戻り値なし）
  onPostToolUse(params: {
    sessionId: string;
    toolName: string;
    success: boolean;
    error?: string;
  }): void;

  // セッション終了時のサマリー記録
  onSessionEnd(params: { sessionId: string; summary?: string }): void;
}
```

**設計決定事項の記録**:

- hooks はコード側固定（manifest 側に持たない理由を記録）
- `onPreToolUse` の戻り値が `SkillCreatorToolDecision` 型であることの整合確認
- `SkillCreatorAuditSink` への接続方法

**完了条件**:

- [ ] hooks インターフェースの最終設計が決定されている
- [ ] hooks をコード側に固定する理由が記録されている
- [ ] audit sink との接続設計が確定している

---

### T-02-3: SkillCreatorAuditSink 設計の確認・詳細化

audit イベント記録の設計を確定する。

**設計確認観点**:

```typescript
// AuditEvent 型設計
interface SkillCreatorGovernanceAuditEvent {
  eventType: SkillCreatorHookEventType; // 'session_start' | 'pre_tool_use' | 'post_tool_use' | 'session_end'
  sessionId: string;
  phase: SkillCreatorGovernancePhase;
  toolName?: string;
  decision?: SkillCreatorToolDecision;
  provenance?: SkillCreatorWorkflowSourceProvenance;
  metadata?: Record<string, unknown>;
  timestamp: string; // ISO 8601
}
```

**設計決定事項**:

- maxEvents: デフォルト値（500 件 or 変更するか）
- ring buffer の実装方式（`slice(-maxEvents)` vs 専用リングバッファ）
- `clear()` を session 終了時に自動呼び出しするか否か
- 型定義は `@repo/shared/types` に配置（既存の配置を確認）

**完了条件**:

- [ ] `SkillCreatorGovernanceAuditEvent` の型定義が確定している
- [ ] maxEvents の最終値が設定されている
- [ ] ring buffer の実装方式が決定されている

---

### T-02-4: Facade 統合設計の確認・詳細化

`RuntimeSkillCreatorFacade.ts` における governance 統合の設計を確定する。

**設計確認観点**:

```typescript
// 各 phase での governance 統合パターン（設計確認）
// plan phase
const governanceHooks = this.createGovernanceHooks("plan");
governanceHooks.onSessionStart({ sessionId: planId });
// ... LLM 処理 ...
governanceHooks.onSessionEnd({ sessionId: planId, summary: "..." });

// execute phase
const governanceHooks = this.createGovernanceHooks("execute");
governanceHooks.onSessionStart({ sessionId: planResult.planId, provenance });
// ... SDK execute 処理（hookObservers で onPreToolUse / onPostToolUse を使用）
governanceHooks.onSessionEnd({ sessionId: planResult.planId, summary: "..." });
```

**設計決定事項**:

- `createSdkGovernanceOptions(phase)` プライベートメソッドの抽出が必要か（現状は各 phase で個別に呼んでいる）
- `_input` 未使用問題の対応方針（P0-09 本体では型を `Record<string, unknown>` のまま残し、U1 で解決）
- `getGovernanceState()` の IPC 向けレスポンス構造

**完了条件**:

- [ ] Facade 統合の変更範囲（修正すべきメソッド一覧）が確定している
- [ ] `createSdkGovernanceOptions()` の抽出判断が記録されている
- [ ] `getGovernanceState()` のレスポンス構造が設計されている

---

### T-02-5: @repo/shared/types の型定義整合確認

governance 関連の型定義が `@repo/shared/types` に正しく配置されているか確認する。

```bash
# governance 関連の型定義を確認
grep -rn "SkillCreatorGovernancePhase\|SkillCreatorSdkPolicy\|SkillCreatorToolDecision\|SkillCreatorGovernanceAuditEvent\|SkillCreatorHookEventType\|SkillCreatorGovernanceState" \
  packages/shared/src/types/ | head -30
```

**確認対象の型**:

- `SkillCreatorGovernancePhase`: 'plan' | 'execute' | 'verify' | 'improve'
- `SkillCreatorSdkPolicy`: phase 別 policy 型
- `SkillCreatorToolDecision`: { allowed: boolean; reason: string; phase; toolName }
- `SkillCreatorGovernanceAuditEvent`: audit event 型
- `SkillCreatorHookEventType`: 'session_start' | 'pre_tool_use' | 'post_tool_use' | 'session_end'
- `SkillCreatorGovernanceState`: IPC 向けレスポンス型

**完了条件**:

- [ ] 必要な型定義が `@repo/shared/types` に全て存在することが確認されている
- [ ] 不足している型定義が特定されている（実装時に追加が必要な場合）

---

### T-02-6: 設計書まとめ・変更差分一覧の作成

Phase 5 の実装に向けて、変更が必要なファイルと変更内容を一覧化する。

**必須記載形式**（Feedback RT-03 準拠）:

| ファイル                          | 変更種別  | 変更内容                                                   |
| --------------------------------- | --------- | ---------------------------------------------------------- |
| `SkillCreatorPermissionPolicy.ts` | 修正      | policy テーブルの差分修正（Phase 1 調査結果を反映）        |
| `SkillCreatorHooksFactory.ts`     | 修正      | 設計整合の確認・不足 hooks の追加                          |
| `SkillCreatorAuditSink.ts`        | 新規/修正 | in-memory ring buffer 実装の確認・修正                     |
| `governance/index.ts`             | 修正      | エクスポート一覧の整合確認                                 |
| `RuntimeSkillCreatorFacade.ts`    | 修正      | governance 統合の整合確認・不足箇所の修正                  |
| テスト（新規）                    | 新規      | `__tests__/governance/` にユニットテスト・統合テストを作成 |

**完了条件**:

- [ ] 新規作成ファイルと修正ファイルの一覧が完成している
- [ ] 各ファイルの変更内容が具体的に記載されている

---

## 成果物

| 成果物名                     | パス                                           | 必須 |
| ---------------------------- | ---------------------------------------------- | ---- |
| policy テーブル設計書        | `outputs/phase-2/policy-table-design.md`       | ✅   |
| hooks インターフェース設計書 | `outputs/phase-2/hooks-interface-design.md`    | ✅   |
| audit sink 設計書            | `outputs/phase-2/audit-sink-design.md`         | ✅   |
| Facade 統合設計書            | `outputs/phase-2/facade-integration-design.md` | ✅   |
| 変更ファイル一覧             | `outputs/phase-2/change-file-list.md`          | ✅   |

---

## 完了条件チェックリスト

- [ ] policy テーブルの全 phase 設計が確定している
- [ ] hooks インターフェースの最終設計が決定されている
- [ ] audit sink の設計（maxEvents・ring buffer 方式）が確定している
- [ ] Facade 統合の変更範囲が一覧化されている
- [ ] `@repo/shared/types` の型定義整合が確認されている
- [ ] 新規作成/修正ファイル一覧が完成している
- [ ] `outputs/phase-2/` に全成果物が配置されている

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                  | 内容                             |
| -------------------- | --------------------------------------------------------------------- | -------------------------------- |
| セキュリティ設計     | `.claude/skills/aiworkflow-requirements/references/security-*.md`     | SDK ガバナンスのセキュリティ要件 |
| インターフェース定義 | `.claude/skills/aiworkflow-requirements/references/interfaces-*.md`   | governance 関連の型定義          |
| アーキテクチャ設計   | `.claude/skills/aiworkflow-requirements/references/architecture-*.md` | Facade/Engine/Service 責務境界   |

### 設計参照

| 参照先                                               | 内容                                     |
| ---------------------------------------------------- | ---------------------------------------- |
| `packages/shared/src/types/`                         | `SkillCreatorGovernancePhase` 等の型定義 |
| `apps/desktop/src/main/services/runtime/governance/` | 既存の governance 実装                   |
| `docs/30-workflows/unassigned-task/TASK-P0-09-*`     | 元のタスク仕様・設計指針                 |
