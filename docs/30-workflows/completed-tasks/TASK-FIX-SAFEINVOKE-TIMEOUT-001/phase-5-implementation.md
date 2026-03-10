# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase      | 5                               |
| Phase名    | 実装                            |
| カテゴリ   | fix                             |
| ステータス | completed                       |
| 前提Phase  | Phase 4                         |
| 後続Phase  | Phase 6                         |

## 目的

Phase 2 の設計に基づき、Preload 共通 helper に timeout-aware invoke を実装し、`index.ts` / `skill-api.ts` / `skill-creator-api.ts` の `safeInvoke` から再利用する。Phase 4 のテストを全て PASS（Green）にする。

## 実行タスク

- タスク1: 重複している `safeInvoke` 実装を洗い出し、helper 抽出対象を確定する
- タスク2: `ipc-utils.ts` に timeout-aware helper を実装する
- タスク3: 3つの wrapper を helper 利用へ置き換える
- タスク4: helper 単体テストと wrapper 回帰テストを Green にする
- タスク5: 型チェック / lint / 差分確認を行う

### タスク1: 現在の実装の確認

**目的**: 変更対象ファイルの現在の状態を確認する

**手順**:

1. `apps/desktop/src/preload/index.ts` を読み込み
2. `apps/desktop/src/preload/skill-api.ts` の `safeInvoke` / `safeInvokeUnwrap` を確認
3. `apps/desktop/src/preload/skill-creator-api.ts` の `safeInvoke` を確認
4. 周辺コード（`ALLOWED_INVOKE_CHANNELS`、`safeOn` 等）の構造を確認

### タスク2: 共通 helper の追加

**目的**: `IPC_TIMEOUT_MS` と timeout-aware helper を 1 箇所に集約する

**実装箇所**: `apps/desktop/src/preload/ipc-utils.ts`

**実装内容**:

```typescript
/** IPC呼び出しのデフォルトタイムアウト（ミリ秒） */
const IPC_TIMEOUT_MS = 5000;
```

**配置位置**: invoke helper と同じファイルで定義し、3 wrapper から import する

### タスク3: `safeInvoke` wrapper の修正

**目的**: `Promise.race` パターンでタイムアウトを実装する

**実装内容**:

```typescript
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return invokeWithTimeout<T>(ALLOWED_INVOKE_CHANNELS, channel, ...args);
}
```

**変更点の要約**:

- `safeInvoke` 内の timeout 実装を helper へ移動
- 3 wrapper の公開シグネチャは変更しない
- `safeInvokeUnwrap` は timeout-aware `safeInvoke` を前提に継続利用する

### タスク4: テスト実行（Green 確認）

**目的**: Phase 4 のテストが全て PASS することを確認する

**手順**:

1. 新規 helper テスト実行: `cd apps/desktop && pnpm vitest run <テストファイルパス>`
2. 全テスト PASS を確認
3. `skill-api` / `skill-creator-api` 契約テストも PASS を確認
4. 既存テスト実行: `cd apps/desktop && pnpm vitest run` で全テスト PASS を確認

### タスク5: 動作確認

**目的**: 実装が正しく動作することを確認する

**確認手順**:

1. TypeScript 型チェック: `cd apps/desktop && pnpm typecheck`
2. ESLint: `cd apps/desktop && pnpm lint`
3. 変更差分の確認: `git diff apps/desktop/src/preload/`

## 参照資料

| 参照資料       | パス                                                                                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計書 | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-2-design.md`                                                                                  |
| Phase 4 テスト | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-4-test-creation.md`                                                                           |
| 対象ファイル   | `apps/desktop/src/preload/index.ts`, `apps/desktop/src/preload/skill-api.ts`, `apps/desktop/src/preload/skill-creator-api.ts`, `apps/desktop/src/preload/ipc-utils.ts` |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Electron IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Preload実装のセキュリティ制約（contextIsolation, sandbox）            |
| 実装パターン集            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | safeInvokeパターン実装詳細                                            |
| エラーハンドリング        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | タイムアウトエラーのカテゴリ分類（External Service Error: 3000-3999） |
| 認証 IPC 契約             | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                         | `auth:get-session` / `check-online` の契約を維持する確認              |

## 統合テスト連携

- Phase 4 のテストが全て PASS（Green）になることが完了条件
- Phase 6 でカバレッジ確認を行い、不足箇所にテストを追加

## 成果物

| 成果物           | パス                                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 修正済みファイル | `apps/desktop/src/preload/ipc-utils.ts`, `apps/desktop/src/preload/index.ts`, `apps/desktop/src/preload/skill-api.ts`, `apps/desktop/src/preload/skill-creator-api.ts` |

## 完了条件

- [ ] `IPC_TIMEOUT_MS` 定数を追加
- [ ] `safeInvoke` に `Promise.race` パターンを実装
- [ ] Phase 4 のテストが全て PASS（Green）
- [ ] 既存テストが全て PASS
- [ ] TypeScript 型チェック PASS
- [ ] ESLint PASS
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 6: テスト拡充へ進む。カバレッジ不足箇所のテストを追加する。
