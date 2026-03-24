# Phase 5: 実装

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 5              |
| 機能名 | slide-impl-001 |
| 作成日 | 2026-03-24     |

## 目的

Phase 4 で作成したテストを Green にするためのプロダクションコードを実装する。

## 実行タスク

### Task 1: ModifierResponse 型拡張

#### 1-1. shared 型定義の拡張

対象ファイル: `packages/shared/src/slide/types.ts`

> 型定義の詳細は Phase 2 Task 1-1 を参照。既存 `ModifierResponse` に `fallback_reason?: string` と `suggested_action?: string` を optional で追加する。

注意点:

- 既存フィールドは変更しない（NFR-1 後方互換性）
- `modifier-skill.ts` のローカル定義を shared からの import に変更（MINOR-2 対応）

#### 1-2. parseModifierResponse の拡張

対象ファイル: `apps/desktop/src/main/slide/modifier-skill.ts`

```typescript
// parseModifierResponse() の拡張
fallback_reason:
  typeof json.fallback_reason === "string"
    ? json.fallback_reason
    : undefined,
suggested_action:
  typeof json.suggested_action === "string"
    ? json.suggested_action
    : undefined,
```

- P49 準拠: `as` キャスト不使用
- P48 準拠: non-null assertion 不使用

### Task 2: SlideCapabilityDTO 型定義 + IPC

#### 2-1. 型定義

対象ファイル: `packages/shared/src/slide/types.ts`

> 型定義の詳細（`SlideLane`, `ApiKeySource`, `SlideUIStatus`, `SlideCapabilityDTO`）は Phase 2 Task 1-2 を参照。Phase 2 設計の状態遷移契約テーブルに従って実装する。

#### 2-2. IPC channel 定数追加

対象ファイル: `apps/desktop/src/preload/channels.ts`

- `SLIDE_CAPABILITY_GET: "slide:capability:get"` を IPC_CHANNELS に追加
- ALLOWED_INVOKE_CHANNELS に追加

#### 2-3. IPC handler 実装

対象ファイル: `apps/desktop/src/main/slide/ipc-handlers.ts`

- `ipc.handle(IPC_CHANNELS.SLIDE_CAPABILITY_GET, ...)` を追加
- P42 準拠 3 段バリデーション実装
- `resolveSlideCapability(sessionId)` を呼び出して結果を返す
- P60 準拠レスポンス形式: `{ success: true, data }` / `{ success: false, error }`

#### 2-4. Preload API 追加

対象ファイル: `apps/desktop/src/preload/index.ts`

```typescript
getCapability: (sessionId: string) =>
  safeInvoke(IPC_CHANNELS.SLIDE_CAPABILITY_GET, { sessionId }),
```

#### 2-5. Preload 型定義追加

対象ファイル: `apps/desktop/src/preload/types.ts`

```typescript
export interface SlideCapabilityResponse {
  success: boolean;
  data?: SlideCapabilityDTO;
  error?: { code: string; message: string };
}
```

### Task 3: Agent SDK adapter 化

#### 3-1. DI 設計の実装

対象ファイル: `apps/desktop/src/main/slide/agent-client.ts`

> インターフェース定義（`AgentClientDependencies`）の詳細は Phase 2 Task 3 を参照。以下の設計原則に従って実装:
>
> - P62 対策: `authKeyService.getKey()` が `none` で即エラー
> - P34: `agentSDKAdapter` は API key 取得後に遅延初期化
> - P61: 引数型はインターフェース（`IAuthKeyService`）

#### 3-2. 既存 API の後方互換維持

- `ModifierAgentAPI` インターフェース（`query()`, `abort()`, `getStatus()`, `onMessage()`）を維持
- 既存の `getAgentAPI()` は内部で `createModifierAgentAPI` を呼び出す形に移行

### Task 4: resolveSlideCapability 実装

対象ファイル: `apps/desktop/src/main/slide/ipc-handlers.ts`（または別ファイル）

> 擬似コードと状態遷移根拠テーブルは Phase 2 Task 5 を参照。

実装チェックリスト:

- [ ] `sessionId` から `RuntimePolicyResolver` 経由で lane を判定
- [ ] `IAuthKeyService` 経由で apiKeySource を取得
- [ ] uiStatus を現在の実行状態から算出（Phase 2 Task 5 の状態遷移根拠テーブルに従う）
- [ ] `apiKeySource === "none"` の場合 `uiStatus: "guidance"` を返す（P62 対策）
- [ ] エラー時に `blockedReason` を設定する

> **後続タスク**: 上記5項目は [UT-SLIDE-CAPABILITY-DYNAMIC-001](../unassigned-task/task-ut-slide-capability-dynamic-resolve-001.md) として未タスク化済み（2026-03-24）

## 参照資料

| 資料名         | パス                       | 内容                    |
| -------------- | -------------------------- | ----------------------- |
| Phase 2 設計   | `phase-2-design.md`        | 型設計・IPC契約・DI設計 |
| Phase 4 テスト | `phase-4-test-creation.md` | テストケース定義        |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                          | 内容                           |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------------------ |
| IPC 契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | IPC handler 登録手順           |
| セキュリティ原則       | `.claude/rules/04-electron-security.md`                                       | sender 検証、allowlist 管理    |
| Agent SDK パターン     | `.claude/skills/claude-agent-sdk/SKILL.md`                                    | query() API、Hooks、Permission |

## 統合テスト連携

- Phase 5 では実装完了後にテスト実行（Green 確認）。
- 全テスト PASS を確認してから Phase 6 へ進む。

```bash
# テスト実行コマンド
cd apps/desktop && pnpm vitest run src/main/slide/__tests__/modifier-skill.test.ts
cd apps/desktop && pnpm vitest run src/main/slide/__tests__/ipc-handlers.test.ts
cd apps/desktop && pnpm vitest run src/main/slide/__tests__/agent-client.test.ts
cd apps/desktop && pnpm vitest run src/main/slide/__tests__/channel-sync.test.ts
```

## 多角的チェック観点

| 観点               | 適用 | チェック内容                                                |
| ------------------ | ---- | ----------------------------------------------------------- |
| セキュリティ       | 適用 | P42 バリデーション、IPC sender 検証、パストラバーサル防御   |
| アーキテクチャ     | 適用 | DI パターン（P34/P61）、Agent SDK adapter 移行              |
| API設計            | 適用 | IPC channel 命名（namespace 一貫性）、レスポンス形式（P60） |
| エラーハンドリング | 適用 | P62 対策（暗黙 fallback 禁止）、validation error 形式       |

## 成果物

| 成果物         | パス                                            | 説明                                       |
| -------------- | ----------------------------------------------- | ------------------------------------------ |
| 型定義         | `packages/shared/src/slide/types.ts`            | ModifierResponse 拡張 + SlideCapabilityDTO |
| Agent Client   | `apps/desktop/src/main/slide/agent-client.ts`   | Agent SDK adapter 化                       |
| Modifier Skill | `apps/desktop/src/main/slide/modifier-skill.ts` | パース拡張                                 |
| IPC Handlers   | `apps/desktop/src/main/slide/ipc-handlers.ts`   | capability handler 追加                    |
| IPC Channels   | `apps/desktop/src/preload/channels.ts`          | 定数 + allowlist 追加                      |
| Preload Index  | `apps/desktop/src/preload/index.ts`             | getCapability 追加                         |
| Preload Types  | `apps/desktop/src/preload/types.ts`             | SlideCapabilityResponse 追加               |

## 完了条件

- [x] ModifierResponse に `fallback_reason` / `suggested_action` が追加されている
- [x] SlideCapabilityDTO が `packages/shared/src/slide/types.ts` に定義されている
- [x] `slide:capability:get` IPC handler が P42 準拠で実装されている
- [x] `SLIDE_CAPABILITY_GET` が channels.ts の定数と allowlist に登録されている
- [x] Preload API に `getCapability()` が追加されている
- [x] `agent-client.ts` が DI パターンで Agent SDK adapter 経由に移行されている
- [x] P62 対策: API key 未設定時に即エラー（fallback なし）
- [x] Phase 4 の全テストが PASS（Green）
- [x] 本 Phase 内の全タスクを 100% 実行完了

## 次の Phase

Phase 6: テスト拡充
