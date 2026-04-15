# Phase 5: 実装

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 5                                |
| タスクID   | TASK-SW-CANCEL-002               |
| 機能名     | skill-creator-cancel-preload-api |
| 前提Phase  | Phase 4                          |
| 後続Phase  | Phase 6                          |
| 作成日     | 2026-04-15                       |
| ステータス | pending                          |

## 目的

TDD GREEN 段階として、`skill-creator-api.ts` に `cancelGeneration` を追加し、`channels.ts` の `ALLOWED_INVOKE_CHANNELS` を更新して Phase 4 の全テストを PASS させる。

## 実装手順

### 1. skill-creator-api.ts の修正

#### 1-1. インターフェースへの追加

`SkillCreatorAPI` インターフェース内に以下を追加する:

```typescript
cancelGeneration: () => Promise<IpcResult<void>>;
```

#### 1-2. 実装オブジェクトへの追加

インターフェース直下の実装部分に以下を追加する:

```typescript
cancelGeneration: (): Promise<IpcResult<void>> =>
  safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL),
```

### 2. channels.ts の修正

`ALLOWED_INVOKE_CHANNELS` 配列に以下を追加する:

```typescript
IPC_CHANNELS.SKILL_CREATOR_CANCEL,
```

### 3. テスト実行（GREEN 確認）

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="preload"
```

TC-01〜TC-06 が全て PASS することを確認する。

### 4. 型チェック確認

```bash
pnpm --filter @repo/desktop typecheck
```

## 実装の注意事項

- `IpcResult<void>` は Main ハンドラーが `{ success: true }` を返すことを想定（CANCEL-003 で実装）
- 現時点では Main ハンドラーが未実装のため、E2E での動作確認は CANCEL-003 完了後
- `contextBridge.exposeInMainWorld` への追加は不要（`skillCreatorAPI` オブジェクトが既に expose されており、プロパティ追加は自動で反映される）

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果    |
| ---------------------- | ---- | ------- |
| TC-01〜TC-06 全て PASS | PASS | pending |
| 型チェック PASS        | PASS | pending |

## 多角的チェック観点（AIが判断）

- [ ] `safeInvoke` のインポートが既存コードで行われているか（追加インポート不要か）
- [ ] `IPC_CHANNELS` のインポートが既存コードで行われているか

## サブタスク管理

1. `skill-creator-api.ts` インターフェース追加
2. `skill-creator-api.ts` 実装追加
3. `channels.ts` ホワイトリスト更新
4. テスト実行（GREEN 確認）
5. 型チェック確認

## 成果物

| 成果物                          | パス                                            | 説明       |
| ------------------------------- | ----------------------------------------------- | ---------- |
| skill-creator-api.ts 修正       | `apps/desktop/src/preload/skill-creator-api.ts` | 実装コード |
| channels.ts ALLOWED_INVOKE 更新 | `apps/desktop/src/preload/channels.ts`          | 実装コード |

## 完了条件

- [ ] `cancelGeneration` インターフェース・実装が追加されている
- [ ] `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` が追加されている
- [ ] TC-01〜TC-06 が全て PASS している
- [ ] 型チェックが PASS している
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
