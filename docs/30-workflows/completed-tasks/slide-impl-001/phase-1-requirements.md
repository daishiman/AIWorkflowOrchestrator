# Phase 1: 要件定義

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 1              |
| 機能名 | slide-impl-001 |
| 作成日 | 2026-03-24     |

## 目的

UT-SLIDE-IMPL-001 のスコープ、受け入れ基準、機能要件・非機能要件を明文化する。

### ビジネスコンテキスト

Agent SDK adapter への移行は以下のビジネス要件に基づく:

- **保守性向上**: 直接 SDK 呼び出しの散在を DI パターンで集約し、SDK バージョンアップ時の影響範囲を限定
- **テスタビリティ**: adapter 経由にすることでモック差し替えが容易になり、テスト品質が向上
- **セキュリティ強化**: P62 対策として API key 未設定時の暗黙 fallback を排除し、明示的なエラーハンドリングを実現
- **監視性**: Capability DTO による状態可視化で、運用時のトラブルシュートが迅速化

## P50 チェック: 既実装状態の調査

### 実装済み（変更不要）

| 要素                              | ファイル                                 | 状態                                     |
| --------------------------------- | ---------------------------------------- | ---------------------------------------- |
| IPC channels (12個)               | `preload/channels.ts`                    | slide:executePhase 等 12ch 登録済み      |
| Preload API (slideApi)            | `preload/index.ts` L407-430              | 全メソッド実装済み                       |
| Preload allowlist                 | `preload/channels.ts` L467-472, L667-672 | invoke/on 両方登録済み                   |
| P42 バリデーション (既存 handler) | `main/slide/ipc-handlers.ts` L94-98      | 3段バリデーション実装済み                |
| パストラバーサル検出              | `main/slide/ipc-handlers.ts` L44-50      | null byte / `..` / URL encoding 検出済み |
| ModifierResponse (基本型)         | `main/slide/modifier-skill.ts` L40-44    | success / changes / error 定義済み       |
| Skill Executor                    | `main/slide/skill-executor.ts`           | integrated / handoff モード分岐完成      |

### 未実装（本タスクのスコープ）

| 要素                       | ファイル                                             | 必要な変更                                           |
| -------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| ModifierResponse 拡張      | `packages/shared/src/slide/types.ts`                 | `fallback_reason` / `suggested_action` optional 追加 |
| SlideCapabilityDTO         | `packages/shared/src/slide/types.ts`                 | 新規型定義                                           |
| Agent SDK adapter 化       | `main/slide/agent-client.ts`                         | 直接 Anthropic SDK → Agent SDK adapter 経由          |
| `slide:capability:get` IPC | `preload/channels.ts` + `main/slide/ipc-handlers.ts` | channel 定数 + handler + allowlist                   |
| Preload API 追加           | `preload/index.ts` + `preload/types.ts`              | `slideApi.getCapability()`                           |

## 実行タスク

### Task 1: 機能要件（FR）抽出

#### FR-1: ModifierResponse 型拡張

ModifierResponse に以下の optional フィールドを追加する:

| フィールド         | 型       | 必須 | 用途                                                             |
| ------------------ | -------- | ---- | ---------------------------------------------------------------- |
| `fallback_reason`  | `string` | no   | manual fallback が発生した理由をユーザーに表示                   |
| `suggested_action` | `string` | no   | ユーザーへの推奨アクション（「ターミナルで実行してください」等） |

後方互換性: 既存の `success` / `changes` / `error` フィールドは変更しない。

#### FR-2: agent-client.ts Agent SDK adapter 化

現在の直接 Anthropic SDK 使用（`client.messages.create`）を Agent SDK adapter 経由に移行する:

- 旧: `agent-client.ts` → `@anthropic-ai/sdk` 直接
- 新: `agent-client.ts` → Agent SDK adapter → `modifier-skill.ts`
- RuntimeResolver + IAuthKeyService パターンを適用（SkillExecutor と同一パターン）
- env fallback は RuntimePolicyResolver へ集約（P62 silent fallback 排除）

#### FR-3: SlideCapabilityDTO 定義 + IPC channel

`packages/shared/src/slide/types.ts` に以下を新規定義:

```typescript
interface SlideCapabilityDTO {
  lane: "integrated" | "manual";
  apiKeySource: "safeStorage" | "env" | "none";
  uiStatus: "synced" | "running" | "degraded" | "guidance";
  blockedReason?: string;
}
```

IPC channel:

- channel 名: `slide:capability:get`（既存 `slide:*` namespace に統一）
- 引数: `{ sessionId: string }`
- 応答: `{ success: true, data: SlideCapabilityDTO }` | `{ success: false, error: { code: string, message: string } }`
- P42 準拠 3 段バリデーション必須

#### FR-4: Preload API 追加

`slideApi` に `getCapability` メソッドを追加:

```typescript
getCapability: (sessionId: string) => Promise<SlideCapabilityResponse>;
```

### Task 2: 非機能要件（NFR）抽出

| ID    | 要件           | 基準                                                               |
| ----- | -------------- | ------------------------------------------------------------------ |
| NFR-1 | 後方互換性     | ModifierResponse 既存フィールドの型・セマンティクスを変更しない    |
| NFR-2 | セキュリティ   | P42 準拠 3 段バリデーション。IPC sender 検証。パストラバーサル防御 |
| NFR-3 | 型安全         | `pnpm typecheck` PASS。`any` 型禁止。Agent SDK 型との整合          |
| NFR-4 | テスタビリティ | DI パターンで外部依存を注入可能。モック差し替え可能                |
| NFR-5 | P62 対策       | API key 未設定時に DEFAULT_CONFIG への暗黙 fallback を行わない     |

### Task 3: 受入基準（AC）定義

| ID   | 受入基準                                                                                        | 検証方法                                                                         |
| ---- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| AC-1 | ModifierResponse に `fallback_reason` / `suggested_action` が optional として定義されている     | `grep -n "fallback_reason\|suggested_action" packages/shared/src/slide/types.ts` |
| AC-2 | `agent-client.ts` が Agent SDK adapter 経由で動作する                                           | テストで adapter mock を注入し、直接 SDK 呼び出しが存在しないことを確認          |
| AC-3 | SlideCapabilityDTO の IPC channel 名 `slide:capability:get` が確定し allowlist に登録されている | `grep "SLIDE_CAPABILITY_GET" apps/desktop/src/preload/channels.ts`               |
| AC-4 | 新規 IPC handler に P42 準拠 3 段バリデーションが実装されている                                 | テストで空文字列・スペースのみ入力が拒否されることを確認                         |
| AC-5 | `pnpm typecheck` PASS                                                                           | CI / ローカルで実行                                                              |
| AC-6 | 関連テストが全て PASS                                                                           | `pnpm --filter @repo/desktop test`                                               |

## 参照資料

| 資料名                | パス                                                                                                                                      | 内容                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Task08 設計サマリー   | `docs/30-workflows/completed-tasks/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-2/design-summary.md`        | ModifierResponse / SlideCapabilityDTO の設計仕様 |
| Task08 契約マトリクス | `docs/30-workflows/completed-tasks/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-2/contract-matrix.md`       | 状態遷移契約、UI 4 領域表示ルール                |
| Task08 実装ガイド     | `docs/30-workflows/completed-tasks/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-12/implementation-guide.md` | Cleanup 順序、adapter パターン                   |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                    | パス                                       | 内容                           |
| --------------------------- | ------------------------------------------ | ------------------------------ |
| IPC セキュリティ            | `.claude/rules/04-electron-security.md`    | IPC handler バリデーション原則 |
| P42 バリデーション          | `.claude/rules/06-known-pitfalls.md#P42`   | 3 段バリデーション標準         |
| P62 DEFAULT_CONFIG fallback | `.claude/rules/06-known-pitfalls.md#P62`   | 暗黙 fallback 禁止             |
| Agent SDK skill             | `.claude/skills/claude-agent-sdk/SKILL.md` | Agent SDK 統合パターン         |

## spec-extraction-map

| System Spec                     | Current Code Anchor                   | 対応関係           |
| ------------------------------- | ------------------------------------- | ------------------ |
| ModifierResponse (Task08設計)   | `main/slide/modifier-skill.ts` L40-44 | 型拡張対象         |
| SlideCapabilityDTO (Task08設計) | 未実装                                | 新規定義           |
| Agent SDK adapter パターン      | `main/slide/agent-client.ts` L105     | 移行対象           |
| IPC handler バリデーション      | `main/slide/ipc-handlers.ts` L94-98   | 既存パターンを踏襲 |

## 統合テスト連携

- Phase 1 では統合テスト観点の定義のみ。実行は Phase 4 以降。
- 統合テスト対象: `slide:capability:get` IPC の end-to-end フロー（Renderer → Preload → Main → 応答）

## 成果物

| 成果物     | パス                              | 説明       |
| ---------- | --------------------------------- | ---------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | 本ファイル |

## 完了条件

- [x] P50 チェック（既実装状態の調査）を実施した
- [x] FR-1〜FR-4 の機能要件が検証可能な文章で定義されている
- [x] NFR-1〜NFR-5 の非機能要件が定義されている
- [x] AC-1〜AC-6 の受入基準が検証コマンド付きで定義されている
- [x] spec-extraction-map で system spec と current code anchor の 1:1 対応を記録した
- [x] 本 Phase 内の全タスクを 100% 実行完了

## 次の Phase

Phase 2: 設計
