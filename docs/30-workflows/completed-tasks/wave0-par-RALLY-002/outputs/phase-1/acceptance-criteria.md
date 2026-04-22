# 受け入れ基準

## AC-1〜AC-5 詳細

### AC-1: pendingRequest合成式へのコメント追加

**判定**: 未達（コメントなし）  
**内容**: `pendingRequest` 合成式の直上に、`restoredPendingRequest` を優先する理由と適用条件を説明するコメントが追加されていること  
**確認方法**: `ConversationalInterview.tsx` の L44 付近にコメントが存在することを確認

### AC-2: restoredPendingRequestクリアロジックの存在

**判定**: 達成済み（L55-59 に useEffect 実装済み）  
**内容**: `workflowSnapshot?.awaitingUserInput` が非 null になったとき、`restoredPendingRequest` がクリア（null 化）されるロジックが存在すること  
**確認方法**: L55-59 の useEffect が存在し、条件 `workflowSnapshot?.awaitingUserInput` が非 null のとき `setRestoredPendingRequest(null)` を呼ぶことを確認

### AC-3: コードの可読性

**判定**: 未達（コメントなし）  
**内容**: コードを読んだ開発者が「どの状態のとき restoredPendingRequest が使われ、いつ workflowSnapshot 側に切り替わるか」を理解できること  
**確認方法**: コメント追加後、第三者がコードを読んで理解できるかレビューで確認

### AC-4: typecheckエラーなし

**判定**: 達成済み（変更前から通過）  
**内容**: `pnpm typecheck` がエラーなしで通過すること  
**確認方法**: `pnpm --filter @repo/desktop typecheck` を実行してエラーがないことを確認

### AC-5: lintエラーなし

**判定**: 達成済み（変更前から通過）  
**内容**: `pnpm lint` がエラーなしで通過すること（exhaustive-deps 警告含む）  
**確認方法**: `pnpm --filter @repo/desktop lint` を実行してエラー・警告がないことを確認

## 変更で達成すべきAC

| AC   | 状態          | 変更種別     |
| ---- | ------------- | ------------ |
| AC-1 | 未達 → 要対応 | コメント追加 |
| AC-2 | 達成済み      | 変更不要     |
| AC-3 | 未達 → 要対応 | コメント追加 |
| AC-4 | 達成済み      | 変更不要     |
| AC-5 | 達成済み      | 変更不要     |
