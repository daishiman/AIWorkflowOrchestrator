# Phase 5: 実装

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 5                   |
| Phase名    | 実装                |
| 対象機能   | TASK-SW-CANCEL-001  |
| 前提Phase  | Phase 4: テスト作成 |
| 次Phase    | Phase 6: テスト拡充 |
| ステータス | 未実施              |
| 作成日     | 2026-04-16          |

## 目的

Phase 4 で設計したテストが Red になることを確認した後、
`SKILL_CREATOR_RUNTIME_CHANNELS` に `SKILL_CREATOR_CANCEL` チャンネル定数を追加する。
テストを Green にし、AC-1〜AC-4 を満たす。

## 実行タスク

### Task 1: TDD Red フェーズ確認

実装前に TC-01〜TC-02 が失敗することを確認する。

```bash
pnpm --filter @repo/shared test -- --testPathPattern="channels"
```

全テストが失敗（Red）であることを確認してから実装に進む。

### Task 2: SKILL_CREATOR_CANCEL チャンネル定数追加

**修正対象ファイル**: `packages/shared/src/ipc/channels.ts`

**修正内容**:

`SKILL_CREATOR_RUNTIME_CHANNELS` に以下の1行を追加する。

```typescript
export const SKILL_CREATOR_RUNTIME_CHANNELS = {
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
  SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
  SKILL_CREATOR_CANCEL: "skill-creator:cancel", // AC-1: キャンセル処理IPC連携用チャンネル
} as const;
```

追加位置: `SKILL_CREATOR_ADAPTER_STATUS_CHANGED` の直後、`} as const;` の前。

### Task 3: TDD Green フェーズ確認

実装後に TC-01〜TC-02 が成功することを確認する。

```bash
# 新規テスト Green 確認
pnpm --filter @repo/shared test -- --testPathPattern="channels"

# 全テスト実行（回帰確認）
pnpm --filter @repo/shared test
```

### Task 4: 型チェック確認

```bash
pnpm --filter @repo/shared typecheck
```

### Task 5: lint 確認

```bash
pnpm --filter @repo/shared lint
```

### Task 6: Preload 自動有効化確認

`apps/desktop/src/preload/channels.ts` が `SKILL_CREATOR_RUNTIME_CHANNELS` をスプレッドしており、
追加した `SKILL_CREATOR_CANCEL` が `IPC_CHANNELS` に含まれることを確認する。

```bash
# Preload 側の型チェック（SKILL_CREATOR_CANCEL が IPC_CHANNELS に含まれることを確認）
pnpm --filter @repo/desktop typecheck
```

## 実装上の注意事項

- 追加するのは1行のみ。他の既存チャンネル定数は変更しない
- `as const` アサーションは既存の記述を維持し変更しない
- コメントに「キャンセル処理IPC連携用チャンネル」と明記する
- Preload 側（`apps/desktop/src/preload/channels.ts`）への変更は不要

## 参照資料

- `outputs/phase-4/TASK-SW-CANCEL-001-test-design.md` — テストケース（TC-01〜TC-02）
- `outputs/phase-2/TASK-SW-CANCEL-001-design.md` — 設計書

## 統合テスト連携

- `packages/shared` の型定義変更のため、`@repo/desktop` の型チェックも実行して
  Preload 側の自動有効化を確認する
- 実装後に TASK-SW-CANCEL-002 の着手可否を確認する

## 成果物

| 成果物                                    | パス                                                        |
| ----------------------------------------- | ----------------------------------------------------------- |
| TASK-SW-CANCEL-001-implementation-plan.md | `outputs/phase-5/TASK-SW-CANCEL-001-implementation-plan.md` |

## 完了条件

- [ ] TC-01〜TC-02 が Red であることを確認した（実装前）
- [ ] `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` の追加が完了している
- [ ] TC-01〜TC-02 が Green になっている（実装後）
- [ ] TC-R01〜TC-R02（回帰テスト）が Green を維持している
- [ ] `pnpm --filter @repo/shared typecheck` が 0 エラー
- [ ] `pnpm --filter @repo/desktop typecheck` が 0 エラー（Preload 自動有効化確認）
- [ ] `pnpm --filter @repo/shared lint` が 0 エラー

## タスク100%実行確認【必須】

- [ ] Task 1（TDD Red フェーズ確認）を100%実行した
- [ ] Task 2（SKILL_CREATOR_CANCEL チャンネル定数追加）を100%実行した
- [ ] Task 3（TDD Green フェーズ確認）を100%実行した
- [ ] Task 4（型チェック確認）を100%実行した
- [ ] Task 5（lint 確認）を100%実行した
- [ ] Task 6（Preload 自動有効化確認）を100%実行した
- [ ] 成果物（TASK-SW-CANCEL-001-implementation-plan.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
