# Phase 6 — テスト拡張

## メタ情報

| 項目           | 値                                   |
| -------------- | ------------------------------------ |
| ドキュメントID | UT-FIX-IPC-MAIN-HANDLER-IMPL-001-PH6 |
| フェーズ       | Phase 6（テスト拡張）                |
| ステータス     | completed                            |
| 前フェーズ     | Phase 5（実装）                      |
| 次フェーズ     | Phase 7（カバレッジ確認）            |

---

## 1. 型チェック確認

Phase 5 の実装完了後、まず TypeScript 型チェックを実行する。

```bash
pnpm --filter @repo/desktop typecheck
```

### 想定される型エラーと対処

| エラーパターン                            | 原因                                                      | 対処                                                                           |
| ----------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `AUTH_ERROR_CODES.FORBIDDEN` が存在しない | `AUTH_ERROR_CODES` にキーが未定義                         | `'FORBIDDEN'` リテラルを使用するか、`AUTH_ERROR_CODES` に追加                  |
| `SkillService` の import パスが不正       | `agentHandlers.ts` が `SkillService` を import していない | `import { SkillService } from '../services/skill'` を追加                      |
| `AgentExecutionRequest` 型の不一致        | 既存型定義との齟齬                                        | `@repo/shared` からの import を確認                                            |
| `IApprovalGate` の参照エラー              | `registerAgentExecutionHandlers` の引数型                 | `import type { IApprovalGate } from '../services/runtime/ApprovalGate'` を確認 |

---

## 2. 既存テストの回帰確認

実装追加後、既存テストが影響を受けていないことを確認する。

```bash
# authHandlers のテスト（既存 + 新規）
pnpm --filter @repo/desktop test -- authHandlers

# storeHandlers のテスト（既存 + 新規）
pnpm --filter @repo/desktop test -- storeHandlers

# agentHandlers のテスト（既存 + 新規）
pnpm --filter @repo/desktop test -- agentHandlers

# 全テスト実行
pnpm --filter @repo/desktop test
```

### 回帰リスクのある既存テスト

| テストファイル          | リスク内容                                                                             | 確認ポイント                                              |
| ----------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `authHandlers.test.ts`  | `registerAuthHandlers` に新ハンドラを追加したことで既存モックが不整合になる可能性      | `ipcMain.handle` のモックが新チャネルを受け入れること     |
| `storeHandlers.test.ts` | `registerStoreHandlers` に新ハンドラを追加した場合、テストのセットアップが変わる可能性 | 既存の `STORE_GET` / `STORE_SET` テストが引き続き通ること |

---

## 3. IPC_CHANNELS の型整合性確認

追加したハンドラで参照する `IPC_CHANNELS` 定数が正しく解決されることを確認する。

```bash
# preload/channels.ts の AUTH_START_OAUTH_FLOW, AUTH_TEST_CALLBACK が実在するか
grep -n "AUTH_START_OAUTH_FLOW\|AUTH_TEST_CALLBACK\|USER_SETTINGS_GET\|USER_SETTINGS_UPDATE\|AGENT_GET_SKILLS\|AGENT_GET_SKILL_DETAIL\|AGENT_EXECUTE\|AGENT_PERMISSION_RESPOND" apps/desktop/src/preload/channels.ts
```

期待する出力（8行すべて存在すること）:

```
72:  AUTH_START_OAUTH_FLOW: "auth:start-oauth-flow",
73:  AUTH_TEST_CALLBACK: "auth:test-callback",
96:  USER_SETTINGS_GET: "settings:get",
97:  USER_SETTINGS_UPDATE: "settings:update",
161:  AGENT_GET_SKILLS: "agent:get-skills",
162:  AGENT_GET_SKILL_DETAIL: "agent:get-skill-detail",
163:  AGENT_EXECUTE: "agent:execute",
171:  AGENT_PERMISSION_RESPOND: "agent:permission-respond",
```

---

## 4. ESLint 確認

```bash
pnpm --filter @repo/desktop lint
```

### 想定される lint エラーと対処

| ルール                                    | 内容                                    | 対処                                                       |
| ----------------------------------------- | --------------------------------------- | ---------------------------------------------------------- |
| `@typescript-eslint/no-explicit-any`      | `any` 型の使用禁止                      | 明示的な型または `unknown` + 型ガードに置き換え            |
| `@typescript-eslint/no-floating-promises` | `void` で明示しない Promise             | `void` キーワードを付ける                                  |
| `no-console`                              | `console.error` / `console.warn` の使用 | プロジェクトルールに従う（既存コードと同じパターンを踏襲） |

---

## 5. テスト拡張の優先順位

Phase 4 で定義したテストケースのうち、以下の順序で実装・確認する:

1. **`auth:test-callback` の本番環境ガードテスト**（セキュリティ観点で最優先）
2. **`agent:execute` の基本動作テスト**（既存 `agent:start` との競合がないか確認）
3. **`settings:get` / `settings:update` のバリデーションテスト**
4. **`agent:get-skills` / `agent:get-skill-detail` のテスト**
5. **`auth:start-oauth-flow` のテスト**
6. **`agent:permission-respond` のテスト**
