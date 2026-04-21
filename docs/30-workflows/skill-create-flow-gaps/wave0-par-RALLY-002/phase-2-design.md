# Phase 2: 設計

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 1                                |
| 後続Phase  | Phase 3                                |
| 作成日     | 2026-04-21                             |
| ステータス | pending                                |

## 目的

`pendingRequest` 合成式の優先ルールをコメントで明示し、`restoredPendingRequest` の自動クリアロジックを `useEffect` で追加する設計を確定する。

## 変更箇所

**対象ファイル**: `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`

### 変更1: 合成式へのコメント追加

```typescript
// [優先ルール] restoredPendingRequest はセッション復元時のみ非 null になる。
// セッション復元（リロードや再起動後のセッション継続）では、
// workflowSnapshot がまだ最新状態に到達する前に UI を表示する必要があるため、
// restoredPendingRequest を優先して表示する。
//
// 通常フロー（セッション復元なし）では restoredPendingRequest は null のため、
// workflowSnapshot?.awaitingUserInput が使用される。
//
// 送信完了後は workflowSnapshot?.awaitingUserInput が次の質問に更新されるため、
// その時点で restoredPendingRequest をクリアして通常フローに戻る。
const pendingRequest =
  restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null;
```

### 変更2: workflowSnapshot 更新時の restoredPendingRequest クリアロジック

`workflowSnapshot?.awaitingUserInput` が更新されたとき（次の質問がサーバーから返ってきたとき）に `restoredPendingRequest` をクリアする `useEffect` を追加する。

```typescript
// workflowSnapshot が更新されて awaitingUserInput が非 null になった場合、
// セッション復元フェーズが終了したと判断し restoredPendingRequest をクリアする。
useEffect(() => {
  if (workflowSnapshot?.awaitingUserInput && restoredPendingRequest) {
    setRestoredPendingRequest(null);
  }
}, [workflowSnapshot?.awaitingUserInput?.requestId]);
```

**注意**: `restoredPendingRequest` を依存配列に含めると無限ループになるため、`workflowSnapshot?.awaitingUserInput?.requestId` のみを依存配列に含める。

## 設計の根拠

`restoredPendingRequest` は、セッション復元時に「最後に出ていた質問」を UI に即時表示するために使われる。セッション復元後、サーバーから `workflowSnapshot` が届き `awaitingUserInput` が確定した時点で、`restoredPendingRequest` は役目を終える。この切り替えタイミングをコードで明示することが本タスクの核心である。

## 検証方法

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# lint チェック（exhaustive-deps 警告を含む）
pnpm --filter @repo/desktop lint

# テスト実行
pnpm --filter @repo/desktop test
```

## 参照資料

| 資料名          | パス                                         | 用途               |
| --------------- | -------------------------------------------- | ------------------ |
| 要件定義書      | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物     |
| 受け入れ基準    | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物     |
| P50チェック結果 | `outputs/phase-1/p50-check-result.md`        | 現状コード確認結果 |

## 成果物

| 成果物             | パス                                               | 説明                              |
| ------------------ | -------------------------------------------------- | --------------------------------- |
| 変更設計書         | `outputs/phase-2/change-design.md`                 | コメント内容・useEffect設計の詳細 |
| 依存整合マトリクス | `outputs/phase-2/dependency-consistency-matrix.md` | 変更による影響範囲の確認表        |
| テスト戦略         | `outputs/phase-2/test-strategy.md`                 | シナリオテストの方針              |

## 完了条件

- [ ] コメント内容を確定した
- [ ] useEffect の依存配列設計を確定した（循環なし）
- [ ] 検証方法を文書化した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認

## 次のPhase

Phase 3: 設計レビューゲート
