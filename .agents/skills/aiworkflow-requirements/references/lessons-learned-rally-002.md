# Lessons Learned — TASK-RALLY-002（2026-04-21）

> 親ファイル: [lessons-learned.md](lessons-learned.md)
> 関連タスク: TASK-RALLY-002（restoredPendingRequest合成ルール明確化 verify_existing close-out）

## TASK-RALLY-002: restoredPendingRequest合成ルール明確化 (2026-04-21)

### 学んだこと

- NON_VISUAL + verify_existing の固定フレーズとcanonical outputルールがclose-out整流に有効
- verify-all-specsがfalse negativeを返す場合の切り分けが必要（wider governance論点）
- `??` 演算子の優先規則を平易なコメントで明文化することで後続タスクの前提知識を固定できる

### 状態合成パターン（再利用可能知識）

```typescript
const pendingRequest = restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null;
```

`restoredPendingRequest`（undo復元）`??` `workflowSnapshot?.awaitingUserInput`（通常フロー）`??` `null`

- **復元セッション優先原則**: undoで復元された状態は通常フローより優先される
- **自動クリア条件**: requestId変化時（新しいリクエストが来ると自動的に通常フローへ）

### verify_existingタスクのclose-outガイド

| 項目 | 内容 |
| --- | --- |
| 種別 | NON_VISUAL + verify_existing |
| 主成果物 | コメント追加 + targeted regression test |
| Phase 11 | N/A 宣言でよい（コード変更なし・UIなし） |
| Phase 12 | `system-spec-update-summary.md` で Step 1-A（実施）と Step 1-B（未実施・理由）を明記 |

### verify-all-specs false negative の切り分けパターン

| シナリオ | 原因候補 | 対処 |
| --- | --- | --- |
| exit=1 だが全 spec ファイルが存在する | parity 不一致（S1〜S4 ずれ） | `validate-closeout-parity.js --json` を実行 |
| exit=0 でも CI が落ちる | artifacts.json の status フィールド漏れ | root と outputs の status を照合 |
| false negative の疑い | スクリプト側の正規表現ミス | スクリプトログを直接確認し governance issue として記録 |

### 後続タスクへの引き継ぎ事項

- RALLY-010〜RALLY-013 は本ルールを前提知識として扱う
- `restoredPendingRequest` の所有権は `ConversationalInterview.tsx` の `useEffect` 内 `requestId` 変化ハンドラ
- TC-RPR-01〜05 のテストが回帰防止として機能する

## 関連ドキュメント

- `references/task-workflow.md`（§TASK-RALLY-002 verify_existingパターン）
- `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx`
- `docs/30-workflows/wave0-par-RALLY-002/`
