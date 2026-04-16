# Phase 5: 実装

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 5                                     |
| タスクID   | TASK-SW-CANCEL-001                    |
| 機能名     | skill-creator-cancel-channel-constant |
| 前提Phase  | Phase 4                               |
| 後続Phase  | Phase 6                               |
| 作成日     | 2026-04-15                            |
| ステータス | completed                             |

## 目的

TDD GREEN 段階として、`packages/shared/src/ipc/channels.ts` に `SKILL_CREATOR_CANCEL` チャンネル定数を追加し、Phase 4 の全テストを PASS させる。

## 実装手順

### 1. 対象ファイルの確認

```bash
# SKILL_CREATOR_RUNTIME_CHANNELS の現在の内容を確認
grep -n "SKILL_CREATOR" packages/shared/src/ipc/channels.ts
```

### 2. 定数の追加

`SKILL_CREATOR_RUNTIME_CHANNELS` オブジェクト内の `SKILL_CREATOR_PROGRESS` の直後に以下を追加する:

```typescript
SKILL_CREATOR_CANCEL: "skill-creator:cancel",
```

### 3. テスト実行（GREEN 確認）

```bash
pnpm --filter @repo/shared test
```

全テスト（TC-01〜TC-04）が PASS することを確認する。

### 4. 型チェック確認

```bash
pnpm --filter @repo/shared typecheck
```

## 実装の注意事項

- 既存コードへの影響は最小限（1行追加のみ）
- `ALLOWED_INVOKE_CHANNELS` への追加は行わない（TASK-SW-CANCEL-002 のスコープ）
- コメントは不要（命名が自明）

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果    |
| ---------------------- | ---- | ------- |
| TC-01〜TC-04 全て PASS | PASS | pending |
| 型チェック PASS        | PASS | pending |

## 多角的チェック観点（AIが判断）

- [ ] 1行追加のみで AC-1〜AC-3 が全て満たされるか
- [ ] 既存テストが壊れていないか

## サブタスク管理

1. `channels.ts` への定数追加
2. テスト実行（GREEN 確認）
3. 型チェック確認

## 成果物

| 成果物               | パス                                  | 説明       |
| -------------------- | ------------------------------------- | ---------- |
| channels.ts 定数追加 | `packages/shared/src/ipc/channels.ts` | 実装コード |

## 完了条件

- [ ] `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` が追加されている
- [ ] TC-01〜TC-04 が全て PASS している
- [ ] 型チェックが PASS している
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
