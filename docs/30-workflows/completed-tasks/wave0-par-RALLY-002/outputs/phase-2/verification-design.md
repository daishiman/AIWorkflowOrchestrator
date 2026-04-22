# Phase 2 検証設計書

## 設計方針

| 項目                | 方針                                        |
| ------------------- | ------------------------------------------- |
| implementation_mode | verify_existing                             |
| 変更の主眼          | コメント追加（ロジック変更なし）            |
| テスト方針          | 既存挙動を固定する targeted regression test |
| Phase 5 の主作業    | diff check                                  |

## pendingRequest 合成の意味定義

```
pendingRequest = restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null
                 ───────────────────────    ──────────────────────────────────────────
                 復元フロー（セッション復元時のみ非null）  通常フロー（サーバーから届く質問）
```

### 状態遷移

```
[初期状態]
  restoredPendingRequest = null
  workflowSnapshot?.awaitingUserInput = <質問A>
  → pendingRequest = 質問A（通常フロー）

[handleUndo 実行後]
  restoredPendingRequest = <前の質問>
  workflowSnapshot?.awaitingUserInput = <質問A>（変化なし）
  → pendingRequest = 前の質問（復元フロー優先）

[新しい workflowSnapshot が届いた後（requestId 変化）]
  clear useEffect 発火: setRestoredPendingRequest(null)
  restoredPendingRequest = null
  workflowSnapshot?.awaitingUserInput = <質問B>
  → pendingRequest = 質問B（通常フローへ復帰）

[submit 完了後]
  submitAnswer 内: setRestoredPendingRequest(null)
  → pendingRequest は workflowSnapshot?.awaitingUserInput に戻る
```

## コメント設計

### L44 上（pendingRequest 合成式の上）

```typescript
// セッション復元時は restoredPendingRequest が優先される。
// 通常フローでは workflowSnapshot?.awaitingUserInput を使用する。
// 復元セッション中は restoredPendingRequest を優先し、
// snapshot が更新されたタイミング（requestId 変化）で自動クリアされる。
```

### L55 上（clear useEffect の上）

```typescript
// workflowSnapshot に新しい質問が届いたら復元状態をクリアし通常フローへ戻す。
```

## downstream handoff 仕様

RALLY-010〜013 が参照すべき contract:

- `pendingRequest` は復元中・通常中を問わず「現在表示すべき質問」を返す単一インターフェース
- `restoredPendingRequest` の存在は `ConversationalInterview.tsx` 内部に閉じており、外部から参照不要
- `pendingRequest === null` は「質問待機中」を意味し、RALLY-010 でのラリー完了判定とは独立
